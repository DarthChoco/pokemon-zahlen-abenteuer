/* --------- Cloud-Synchronisation (Firebase Firestore) ---------
   Optionale, zusätzliche Speicherebene über den lokalen Speicher
   (src/storage.js) hinaus – macht den Fortschritt geräteübergreifend
   verfügbar und überlebt Browser, die localStorage nicht zuverlässig
   behalten (siehe FIREBASE_SETUP.md). Solange firebaseConfig.js nicht
   ausgefüllt ist, bleibt diese Ebene inaktiv und das Spiel läuft rein
   lokal weiter – kein Zwang, Firebase einzurichten.

   Die Firebase-Pakete werden per dynamic import() erst nachgeladen, wenn
   tatsächlich ein Cloud-Zugriff stattfindet (also nur bei eingerichteter
   Konfiguration) – so zahlen Nutzer:innen ohne Cloud-Sync keinen
   Bundle-Größen-Aufpreis dafür. "firestore/lite" statt des vollen SDKs,
   da nur einfaches Lesen/Schreiben nötig ist, kein Echtzeit-Listener. */
import { firebaseConfig, isFirebaseConfigured } from "./firebaseConfig";
import { POKEMON_NAMES } from "./data/pokemon";

let dbModulePromise = null;

function getDb() {
  if (!isFirebaseConfigured()) return null;
  if (!dbModulePromise) {
    dbModulePromise = (async () => {
      const [appMod, firestoreMod] = await Promise.all([import("firebase/app"), import("firebase/firestore/lite")]);
      const app = appMod.getApps().length ? appMod.getApps()[0] : appMod.initializeApp(firebaseConfig);
      const db = firestoreMod.getFirestore(app);
      return {
        db,
        doc: firestoreMod.doc,
        getDoc: firestoreMod.getDoc,
        setDoc: firestoreMod.setDoc,
        deleteDoc: firestoreMod.deleteDoc,
      };
    })();
  }
  return dbModulePromise;
}

export function isCloudAvailable() {
  return isFirebaseConfigured();
}

/* Lokal gemerkter Profil-Code dieses Geräts/Browsers, damit man den Code
   nicht bei jedem Start erneut eingeben muss. Getrennt von den übrigen
   Speicher-Helfern in storage.js, weil es sich um die Profil-IDENTITÄT
   handelt, nicht um Spielfortschritt. */
const PROFILE_CODE_KEY = "pokeZahlenAbenteuer_profileCode";

export function loadCachedProfileCode() {
  try {
    return localStorage.getItem(PROFILE_CODE_KEY);
  } catch {
    return null;
  }
}
export function cacheProfileCode(code) {
  try {
    localStorage.setItem(PROFILE_CODE_KEY, code);
  } catch {
    // Kein lokaler Speicher verfügbar – der Code muss dann bei jedem
    // Start erneut eingegeben werden, der Cloud-Fortschritt bleibt aber sicher.
  }
}
export function clearCachedProfileCode() {
  try {
    localStorage.removeItem(PROFILE_CODE_KEY);
  } catch {
    // ignorieren
  }
}

/* Profil-Code: ein Pokémon-Name (nur Buchstaben, damit er sich leicht
   abschreiben/eintippen lässt) + eine vierstellige Zahl, z. B. "GLURAK-4821".
   Dient direkt als Firestore-Dokument-ID unter der Collection "saves".
   Die Firestore-Regeln (siehe FIREBASE_SETUP.md) erlauben Lesen/Schreiben
   für jeden, der den exakten Code kennt – Schutz vor Erraten/Durchprobieren
   kommt daher direkt aus der Kombinationsanzahl: ~1.000 Wörter × 9.000
   Zahlen ≈ 9 Millionen mögliche Codes. Ein Skript, das alle durchprobiert,
   würde Firebases kostenloses Tageskontingent (50.000 Lesevorgänge) weit
   vor Erfolg aufbrauchen – ergänzend dazu App Check (siehe FIREBASE_SETUP.md,
   optionaler nächster Schritt) gegen automatisierte Skript-Zugriffe. */
const CODE_WORD_POOL = POKEMON_NAMES.filter((n) => /^[A-Za-zÄÖÜäöüß]+$/.test(n)).map((n) => n.toUpperCase());

export function generateProfileCode() {
  const word = CODE_WORD_POOL[Math.floor(Math.random() * CODE_WORD_POOL.length)];
  const number = Math.floor(Math.random() * 9000) + 1000; // 1000–9999
  return `${word}-${number}`;
}

export function normalizeProfileCode(code) {
  return code.trim().toUpperCase();
}

export async function loadProfileFromCloud(code) {
  const dbP = getDb();
  if (!dbP || !code) return null;
  try {
    const { db, doc, getDoc } = await dbP;
    const snap = await getDoc(doc(db, "saves", code));
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    // Sichtbar loggen statt still zu verschlucken – ein Fehler (z. B.
    // blockierende Firestore-Regeln, kein Netzwerk) sieht sonst identisch
    // aus wie "Code existiert nicht" und führt zu irreführenden Meldungen.
    console.error("[cloud] Laden fehlgeschlagen:", err);
    return null;
  }
}

/* Wie loadProfileFromCloud, unterscheidet aber ausdrücklich "existiert
   nicht" von "Prüfung fehlgeschlagen" (z. B. Firestore-Regeln blockieren
   den Zugriff, kein Netzwerk) – wichtig für eine ehrliche Rückmeldung im
   ProfilePicker statt der irreführenden "Code existiert nicht"-Meldung
   bei einem eigentlich vorhandenen Code. */
export async function checkProfileCodeExists(code) {
  const dbP = getDb();
  if (!dbP || !code) return { exists: false, error: null };
  try {
    const { db, doc, getDoc } = await dbP;
    const snap = await getDoc(doc(db, "saves", code));
    return { exists: snap.exists(), error: null };
  } catch (err) {
    console.error("[cloud] Code-Prüfung fehlgeschlagen:", err);
    return { exists: false, error: err };
  }
}

/* Löscht den Spielstand eines Profils unwiderruflich aus der Cloud.
   Gibt true zurück, wenn es (soweit feststellbar) geklappt hat. */
export async function deleteProfileFromCloud(code) {
  // Verhindert, dass ein noch ausstehender entprellter Schreibvorgang das
  // gerade gelöschte Dokument kurz danach wieder anlegt.
  if (pendingWrite && pendingWrite.code === code) {
    pendingWrite = null;
    if (pendingTimer) {
      clearTimeout(pendingTimer);
      pendingTimer = null;
    }
  }
  const dbP = getDb();
  if (!dbP || !code) return false;
  try {
    const { db, doc, deleteDoc } = await dbP;
    await deleteDoc(doc(db, "saves", code));
    return true;
  } catch (err) {
    console.error("[cloud] Löschen fehlgeschlagen:", err);
    return false;
  }
}

/* Schreiben wird entprellt (Standard 20s) statt bei jeder einzelnen
   State-Änderung wie beim lokalen Speicher – hält den Firestore-
   Gratis-Kontingent auch bei vielen gleichzeitigen Spieler:innen sicher
   im grünen Bereich. Beim Verstecken/Schließen der Seite wird sofort
   geschrieben, damit kein Fortschritt der letzten Sekunden verloren geht. */
const DEBOUNCE_MS = 20000;
let pendingTimer = null;
let pendingWrite = null; // { code, state }

async function flushPendingWrite() {
  if (!pendingWrite) return;
  const { code, state } = pendingWrite;
  pendingWrite = null;
  const dbP = getDb();
  if (!dbP) return;
  try {
    const { db, doc, setDoc } = await dbP;
    await setDoc(doc(db, "saves", code), { ...state, updatedAt: Date.now() });
  } catch {
    // stiller Fehlschlag (z. B. offline) – der lokale Speicher bleibt für
    // diese Sitzung die Quelle der Wahrheit, der nächste erfolgreiche
    // Schreibvorgang holt den Stand nach.
  }
}

export function saveProfileToCloud(code, state) {
  if (!isFirebaseConfigured() || !code) return;
  pendingWrite = { code, state };
  if (pendingTimer) clearTimeout(pendingTimer);
  pendingTimer = setTimeout(() => {
    pendingTimer = null;
    flushPendingWrite();
  }, DEBOUNCE_MS);
}

export function flushCloudSaveNow() {
  if (pendingTimer) {
    clearTimeout(pendingTimer);
    pendingTimer = null;
  }
  return flushPendingWrite();
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushCloudSaveNow();
  });
  window.addEventListener("pagehide", flushCloudSaveNow);
}
