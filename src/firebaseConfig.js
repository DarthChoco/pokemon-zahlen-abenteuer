/* ======================================================================
   FIREBASE-KONFIGURATION
   Diese Werte sind laut Firebase-Dokumentation NICHT geheim – sie
   identifizieren nur, welches Firebase-Projekt angesprochen wird. Der
   eigentliche Schutz kommt aus den Firestore-Sicherheitsregeln (siehe
   FIREBASE_SETUP.md), nicht aus dem Geheimhalten dieser Datei.

   So bekommst du deine eigenen Werte (einmalig, dauert ~5 Minuten):
   1. https://console.firebase.google.com öffnen, mit Google-Konto anmelden.
   2. "Projekt hinzufügen" -> Namen vergeben (z. B. "poke-zahlen-abenteuer")
      -> Google Analytics für dieses Projekt AUSSCHALTEN (nicht nötig) -> Projekt erstellen.
   3. Im Projekt links "Build" -> "Firestore Database" -> "Datenbank erstellen"
      -> Standort wählen (z. B. "eur3 (europe-west)") -> im Testmodus starten.
   4. Danach in FIREBASE_SETUP.md unter "Sicherheitsregeln" die dort
      angegebenen Regeln einfügen (ersetzt den 30-Tage-Testmodus).
   5. Zurück zur Projektübersicht (Zahnrad oben links -> Projekteinstellungen)
      -> ganz unten bei "Meine Apps" auf das "</>"-Symbol (Web-App) klicken
      -> App registrieren (Name egal, z. B. "Web") -> KEIN Firebase Hosting nötig.
   6. Der angezeigte "firebaseConfig"-Codeblock enthält genau die Werte
      unten – hier eintragen und speichern.
   ====================================================================== */

export const firebaseConfig = {
  apiKey: "AIzaSyAvb1ck_dG97c6Gbvb1lWsU-6RaovFBA9U",
  authDomain: "pokemon-47690.firebaseapp.com",
  projectId: "pokemon-47690",
  storageBucket: "pokemon-47690.firebasestorage.app",
  messagingSenderId: "1035738607696",
  appId: "1:1035738607696:web:b88e936ba7c699bb1ce155"
};

/* Ist die Konfiguration oben bereits ausgefüllt? Solange nicht, bleibt
   die Cloud-Synchronisation deaktiviert und das Spiel läuft rein lokal
   weiter (wie bisher) – kein Absturz, kein Zwang, Firebase sofort
   einzurichten. */
export function isFirebaseConfigured() {
  return firebaseConfig.apiKey !== "DEIN-API-KEY" && Boolean(firebaseConfig.projectId);
}
