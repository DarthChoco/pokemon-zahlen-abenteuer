import React, { useState } from "react";
import { generateProfileCode, normalizeProfileCode } from "../cloud";
import { PixelPanel } from "./PixelUI";

/* Einstiegs-Bildschirm für den Cloud-Profil-Code: entweder ein neues
   Profil anlegen (Code wird generiert und muss notiert werden) oder
   einen vorhandenen Code eingeben (z. B. auf einem anderen Gerät oder
   nach Verlust des lokalen Speicherstands). Bewusst kein Passwort/E-Mail
   – der Code selbst ist wie ein WLAN-Passwort zu behandeln.
   onCheckCode(code) => Promise<boolean|null>: true = Code existiert
   bereits in der Cloud, false = existiert nicht, null = konnte nicht
   geprüft werden (z. B. offline oder Cloud nicht eingerichtet). */
export default function ProfilePicker({ onSelect, onCheckCode }) {
  const [mode, setMode] = useState(null); // null | "new" | "existing"
  const [newCode] = useState(() => generateProfileCode());
  const [codeInput, setCodeInput] = useState("");
  const [checking, setChecking] = useState(false);
  const [notFoundConfirm, setNotFoundConfirm] = useState(false);

  async function submitExistingCode() {
    const code = normalizeProfileCode(codeInput);
    if (!code) return;
    setChecking(true);
    const exists = await onCheckCode(code);
    setChecking(false);
    if (exists === false && !notFoundConfirm) {
      setNotFoundConfirm(true);
      return;
    }
    onSelect(code);
  }

  return (
    <PixelPanel className="p-5" style={{ background: "#ffffff" }}>
      {mode === null && (
        <div className="text-center">
          <div className="text-lg font-extrabold mb-3" style={{ color: "#1a1a1a" }}>
            Wer spielt gerade?
          </div>
          <div className="text-xs font-bold mb-4" style={{ color: "#555" }}>
            Mit einem Profil-Code bleibt dein Fortschritt erhalten – auch auf einem anderen Gerät.
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setMode("new")}
              className="border-4 border-black px-4 py-3 font-extrabold text-sm"
              style={{ background: "#e3350d", color: "#fff" }}
            >
              🆕 Neues Profil erstellen
            </button>
            <button
              onClick={() => setMode("existing")}
              className="border-4 border-black px-4 py-3 font-bold text-sm"
              style={{ background: "#ffffff", color: "#1a1a1a" }}
            >
              🔑 Ich habe schon einen Code
            </button>
          </div>
        </div>
      )}

      {mode === "new" && (
        <div className="text-center">
          <div className="text-lg font-extrabold mb-2" style={{ color: "#1a1a1a" }}>
            Dein Profil-Code
          </div>
          <div className="text-xs font-bold mb-3" style={{ color: "#555" }}>
            Schreib dir diesen Code auf (z. B. auf einen Zettel)! Damit kommst du auf jedem Gerät
            wieder zu deinem Fortschritt.
          </div>
          <div
            className="border-4 border-black py-4 mb-4 text-3xl font-extrabold tracking-widest"
            style={{ background: "#ffcb05", color: "#1a1a1a" }}
          >
            {newCode}
          </div>
          <div className="flex gap-2 justify-center flex-wrap">
            <button
              onClick={() => setMode(null)}
              className="border-4 border-black px-4 py-2 font-bold text-sm"
              style={{ background: "#ffffff", color: "#1a1a1a" }}
            >
              Zurück
            </button>
            <button
              onClick={() => onSelect(newCode)}
              className="border-4 border-black px-4 py-2 font-extrabold text-sm"
              style={{ background: "#e3350d", color: "#fff" }}
            >
              Code notiert, los geht's ▶
            </button>
          </div>
        </div>
      )}

      {mode === "existing" && (
        <div className="text-center">
          <div className="text-lg font-extrabold mb-2" style={{ color: "#1a1a1a" }}>
            Profil-Code eingeben
          </div>
          <div className="text-xs font-bold mb-3" style={{ color: "#555" }}>
            Zum Beispiel: GLURAK-42
          </div>
          <input
            value={codeInput}
            onChange={(e) => {
              setCodeInput(e.target.value);
              setNotFoundConfirm(false);
            }}
            placeholder="CODE-00"
            className="border-4 border-black w-full px-3 py-3 mb-3 text-xl font-extrabold text-center tracking-widest"
            style={{ background: "#f4f4f4", color: "#1a1a1a" }}
            autoCapitalize="characters"
          />
          {notFoundConfirm && (
            <div
              className="border-4 border-black p-2 mb-3 text-xs font-bold text-left"
              style={{ background: "#fff6d8", color: "#1a1a1a" }}
            >
              Diesen Code gibt es noch nicht. Nochmal auf „Los geht's" tippen, um trotzdem als
              neues Profil mit diesem Code zu starten – oder prüfe die Schreibweise.
            </div>
          )}
          <div className="flex gap-2 justify-center flex-wrap">
            <button
              onClick={() => {
                setMode(null);
                setNotFoundConfirm(false);
              }}
              className="border-4 border-black px-4 py-2 font-bold text-sm"
              style={{ background: "#ffffff", color: "#1a1a1a" }}
            >
              Zurück
            </button>
            <button
              onClick={submitExistingCode}
              disabled={!codeInput.trim() || checking}
              className="border-4 border-black px-4 py-2 font-extrabold text-sm"
              style={{
                background: codeInput.trim() ? "#e3350d" : "#c9c9c9",
                color: "#ffffff",
                cursor: codeInput.trim() ? "pointer" : "not-allowed",
              }}
            >
              {checking ? "Prüfe …" : "Los geht's ▶"}
            </button>
          </div>
        </div>
      )}
    </PixelPanel>
  );
}
