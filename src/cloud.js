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
      return { db, doc: firestoreMod.doc, getDoc: firestoreMod.getDoc, setDoc: firestoreMod.setDoc };
    })();
  }
  return dbModulePromise;
}

export function isCloudAvailable() {
  return isFirebaseConfigured();
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
  } catch {
    return null;
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
