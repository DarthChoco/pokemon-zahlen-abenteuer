# Cloud-Speicherstand einrichten (einmalig, ca. 5–10 Minuten)

Das Spiel synchronisiert den Spielstand über einen kurzen **Profil-Code**
(z. B. `GLURAK-4821`) mit Firebase Firestore – kostenlos, kein Kreditkarte
nötig, läuft dauerhaft im Gratis-Rahmen (siehe unten). Ohne diese
Einrichtung läuft das Spiel weiter wie bisher, nur ohne Cloud-Sync.

**Zum `apiKey` in `src/firebaseConfig.js`:** Diese Werte sind laut
Firebase-Doku bewusst NICHT geheim – sie identifizieren nur das Projekt,
wie eine Postleitzahl. Der eigentliche Zugriffsschutz kommt komplett aus
den Sicherheitsregeln in Schritt 4, nicht aus dem Verstecken dieser Datei.

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
      allow read: if true;
      allow delete: if true;
      allow create, update: if request.resource.data.keys().hasOnly([
          'activeGenerationId', 'generationProgress', 'caughtDex', 'score',
          'fangChance', 'totalAnswered', 'totalCorrect', 'selectedSkillIds',
          'fastAnswerSeconds', 'updatedAt'
        ])
        && request.resource.data.score is int
        && request.resource.data.score >= 0
        && request.resource.data.fangChance is int
        && request.resource.data.caughtDex is list
        && request.resource.data.caughtDex.size() <= 1100;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Was das bedeutet:** Wer den exakten Profil-Code kennt, kann diesen einen Spielstand lesen/schreiben/löschen – ohne Anmeldung, wie bei einem WLAN-Passwort. Alles außerhalb von `saves/*` bleibt komplett gesperrt, und Schreibvorgänge müssen zur erwarteten Form passen (nur bekannte Felder, plausible Werte, `caughtDex` höchstens 1100 Einträge) – das verhindert, dass jemand beliebige/übergroße Daten in fremde oder neue Speicherstände schreibt. `delete` ist bewusst eine eigene, unvalidierte Regel (bei einem Löschvorgang gibt es keine neuen Daten zu prüfen – `request.resource` wäre dann `null`, eine Validierungsregel wie bei `create/update` würde Löschen fälschlich blockieren).

⚠️ Falls du eine frühere Version dieser Regeln schon eingefügt hattest (mit `allow write` statt `allow create, update` + `allow delete`): bitte durch die obige Version ersetzen und erneut **Veröffentlichen** – sonst schlägt das Löschen eines Profils im Spiel fehl.

**Schutz vor Durchprobieren:** Die Codes bestehen aus ca. 1.000 möglichen Wörtern × 9.000 möglichen Zahlen ≈ 9 Millionen Kombinationen. Ein Skript, das alle durchprobiert, würde Firebases kostenloses Tageskontingent (50.000 Lesevorgänge) weit vor einem Treffer aufbrauchen – die Codes sind damit praktisch nicht erratbar, ohne dass eine Anmeldung nötig ist. Für zusätzlichen Schutz gegen genau solche automatisierten Skript-Zugriffe siehe den optionalen Abschnitt **App Check** unten.

Danach **Veröffentlichen** klicken – fertig.

## 5. API-Key gegen fremde Nutzung einschränken (empfohlen)

**Falls GitHub eine Warnung wegen des `apiKey` in `firebaseConfig.js` geschickt hat:** Das ist ein bekannter Fehlalarm von GitHubs automatischer Geheimnis-Erkennung – sie erkennt nur das Zeichen-Muster eines Google-API-Keys und kann nicht unterscheiden, ob es ein echtes Geheimnis oder ein bewusst öffentlicher Firebase-Web-Key ist (siehe [GitHub-Community-Diskussion](https://github.com/orgs/community/discussions/58734) und die [offizielle Firebase-Doku](https://firebase.google.com/docs/projects/api-keys)). Der Key selbst berechtigt zu nichts – das übernehmen die Firestore-Regeln aus Schritt 4.

**Der berechtigte Kern der Sorge** ("andere Services könnten den Key nutzen"): Firebase-Keys sind zwar automatisch auf Firebase-Dienste beschränkt, aber zusätzlich lässt sich der Key so einschränken, dass er *nur* von eurer eigenen Webseite aus funktioniert – dann kann ihn niemand (egal welcher Dienst) von woanders aus verwenden, selbst wenn er den Key kennt:

1. https://console.cloud.google.com/apis/credentials öffnen (gleiches Google-Konto, gleiches Projekt oben auswählen).
2. Den API-Key aus `firebaseConfig.js` in der Liste anklicken (meist "Browser key (auto created by Firebase)").
3. Unter **„Anwendungseinschränkungen"** → **„Websites"** wählen → eure Domain(s) eintragen, z. B. `https://euer-projekt.netlify.app/*` und für lokales Testen `http://localhost:5173/*`.
4. **Speichern.**

⚠️ Nach dem geplanten Domain-Umzug hier die neue Domain ergänzen (dauert nur eine Minute, kein neuer Key nötig) – nicht vergessen, sonst funktioniert die Cloud-Sync auf der neuen Domain nicht mehr.

Die GitHub-Warnung selbst kannst du in den Repo-Einstellungen unter **Security → Secret scanning alerts** als „Used in tests"/„Won't fix" schließen, sobald du diesen Schritt gemacht hast (oder auch direkt, da der Key wie beschrieben ohnehin nicht geheim sein muss).

## 6. (Optional, empfohlen) App Check gegen automatisierte Zugriffe

Schritt 4 schützt vor Erraten einzelner Codes. **App Check** blockiert zusätzlich Skripte/Bots, die *direkt* (ohne die echte Webseite zu öffnen) gegen Firestore feuern – z. B. jemand, der versucht, systematisch Codes durchzuprobieren, statt nur einen einzelnen zu erraten. Läuft im Hintergrund, keine Bedienung für Kinder nötig (kein sichtbares Captcha).

⚠️ **Wichtig:** App Check ist an die tatsächliche Domain gebunden, auf der das Spiel läuft. Da ihr von Netlify wegwechseln wollt – diesen Schritt am besten erst nach dem endgültigen Umzug einrichten, sonst muss er danach wiederholt werden.

1. In der Firebase-Konsole links **Build → App Check**.
2. Eure Web-App auswählen → Anbieter **reCAPTCHA v3** → einem Google-Konto folgend einen reCAPTCHA-v3-Seitenschlüssel für eure *finale* Domain erstellen (https://www.google.com/recaptcha/admin) → Schlüssel in Firebase eintragen, **Registrieren**.
3. Sag mir Bescheid, sobald der Schlüssel existiert – ich ergänze dann `initializeAppCheck(...)` in `src/cloud.js` und aktiviere die Durchsetzung in der Konsole (Firestore Database → App Check → Erzwingen).

## Kosten

Der Firebase-**Spark-Plan** (Gratis-Stufe) ist dauerhaft kostenlos innerhalb des Kontingents: 50.000 Lesevorgänge/Tag, 20.000 Schreibvorgänge/Tag, 1 GiB Speicher. Es ist **kein Zahlungsmittel hinterlegt** – Anfragen über dem Kontingent schlagen einfach fehl, es kann strukturell keine Rechnung entstehen. Für eine Familie (und selbst eine ganze Schulklasse) ist dieses Kontingent praktisch nicht erreichbar.
