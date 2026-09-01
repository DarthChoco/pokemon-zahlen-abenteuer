# Cloud-Speicherstand einrichten (einmalig, ca. 5–10 Minuten)

Das Spiel synchronisiert den Spielstand über einen kurzen **Profil-Code**
(z. B. `GLURAK-42`) mit Firebase Firestore – kostenlos, kein Kreditkarte
nötig, läuft dauerhaft im Gratis-Rahmen (siehe unten). Ohne diese
Einrichtung läuft das Spiel weiter wie bisher, nur ohne Cloud-Sync.

## 1. Firebase-Projekt anlegen

1. https://console.firebase.google.com öffnen, mit einem Google-Konto anmelden.
2. **„Projekt hinzufügen"** → Namen vergeben, z. B. `poke-zahlen-abenteuer`.
3. Google Analytics für dieses Projekt **ausschalten** (nicht benötigt) → **Projekt erstellen**.

## 2. Firestore-Datenbank aktivieren

1. Im Projekt links im Menü **Build → Firestore Database**.
2. **„Datenbank erstellen"** → Standort wählen (z. B. `eur3 (europe-west)`, möglichst nah) → **Testmodus** starten (die Regeln werden gleich in Schritt 4 ersetzt).

## 3. Web-App registrieren und Config-Werte holen

1. Zahnrad oben links → **Projekteinstellungen**.
2. Ganz unten bei „Meine Apps" auf das **`</>`**-Symbol (Web-App) klicken.
3. App-Namen vergeben (egal, z. B. „Web"), **Firebase Hosting NICHT** ankreuzen → **App registrieren**.
4. Der angezeigte `firebaseConfig`-Codeblock enthält die Werte für [`src/firebaseConfig.js`](src/firebaseConfig.js) in diesem Repo – dort eintragen und speichern.

## 4. Sicherheitsregeln setzen

Der Testmodus aus Schritt 2 ist nach 30 Tagen automatisch komplett gesperrt und vorher noch zu offen. Unter **Firestore Database → Regeln** den Testmodus-Text ersetzen durch:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /saves/{code} {
      allow read, write: if true;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Was das bedeutet:** Wer den exakten Profil-Code kennt, kann diesen einen Spielstand lesen/schreiben – ohne Anmeldung, wie bei einem WLAN-Passwort. Alles außerhalb von `saves/*` bleibt komplett gesperrt. Die Codes werden mit genug Zufall erzeugt, dass Erraten praktisch ausgeschlossen ist. Für reinen Spielfortschritt (kein Klarname zwingend, keine sensiblen Daten) ist das ein angemessener Kompromiss zwischen Einfachheit für Kinder und Sicherheit.

Danach **Veröffentlichen** klicken – fertig.

## Kosten

Der Firebase-**Spark-Plan** (Gratis-Stufe) ist dauerhaft kostenlos innerhalb des Kontingents: 50.000 Lesevorgänge/Tag, 20.000 Schreibvorgänge/Tag, 1 GiB Speicher. Es ist **kein Zahlungsmittel hinterlegt** – Anfragen über dem Kontingent schlagen einfach fehl, es kann strukturell keine Rechnung entstehen. Für eine Familie (und selbst eine ganze Schulklasse) ist dieses Kontingent praktisch nicht erreichbar.
