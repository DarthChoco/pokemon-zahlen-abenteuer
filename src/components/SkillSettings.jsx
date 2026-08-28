import React, { useState } from "react";
import { SKILL_CATALOG, SKILL_CATEGORIES } from "../data/skills";
import {
  FAST_ANSWER_BONUS,
  FAST_ANSWER_DEFAULT_SECONDS,
  FAST_ANSWER_MIN_SECONDS,
  FAST_ANSWER_MAX_SECONDS,
} from "../data/gameplay";
import { PixelPanel } from "./PixelUI";

/* Skill-Auswahl-Panel: legt fest, welche Rechenfertigkeiten in den Regionen
   dieser Klassenstufe vorkommen dürfen, sowie die Zeitschwelle für den
   Fangbonus bei schnellen richtigen Antworten.
   mode "onboarding": blockierendes Overlay beim ersten Öffnen einer
   Klassenstufe, vorausgefüllt mit dem Lehrplan-Vorschlag, kein Abbrechen.
   mode "settings": jederzeit über den ⚙️-Button aufrufbar, mit Abbrechen. */
export default function SkillSettings({
  classLevel,
  selectedSkillIds,
  fastAnswerSeconds,
  onConfirm,
  mode,
  onCancel,
}) {
  const [pending, setPending] = useState(() => new Set(selectedSkillIds));
  const [pendingSeconds, setPendingSeconds] = useState(() => fastAnswerSeconds ?? FAST_ANSWER_DEFAULT_SECONDS);
  const isOnboarding = mode === "onboarding";
  const canConfirm = pending.size > 0;

  function toggle(id) {
    setPending((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <PixelPanel className="p-4" style={{ background: "#ffffff" }}>
      <div className="text-lg font-extrabold mb-1" style={{ color: "#1a1a1a" }}>
        {isOnboarding
          ? `Willkommen! Was kann dein Kind in Klasse ${classLevel} schon?`
          : `Fertigkeiten anpassen – Klasse ${classLevel}`}
      </div>
      <div className="text-xs font-bold mb-3" style={{ color: "#555" }}>
        Hak an, was bereits bekannt ist. Die Regionen werden automatisch von leicht nach schwer aus
        deiner Auswahl zusammengestellt.
      </div>

      {SKILL_CATEGORIES.map((cat) => {
        const skills = SKILL_CATALOG.filter((s) => s.category === cat.key);
        return (
          <div key={cat.key} className="mb-4">
            <div className="text-sm font-extrabold mb-2" style={{ color: "#1a1a1a" }}>
              {cat.label}
            </div>
            {cat.layout === "list" ? (
              <div className="flex flex-col gap-1">
                {skills.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => toggle(s.id)}
                    className="border-4 border-black px-3 py-2 text-left font-bold text-sm flex items-center justify-between"
                    style={{ background: pending.has(s.id) ? "#fff6d8" : "#f4f4f4", color: "#1a1a1a" }}
                  >
                    <span>{s.label}</span>
                    <span>{pending.has(s.id) ? "✅" : "⬜"}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-1">
                {skills.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => toggle(s.id)}
                    className="border-4 border-black font-extrabold text-sm"
                    style={{
                      width: 44,
                      height: 44,
                      background: pending.has(s.id) ? "#e3350d" : "#ffffff",
                      color: pending.has(s.id) ? "#ffffff" : "#1a1a1a",
                    }}
                    title={s.label}
                  >
                    {s.row}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <div className="mb-4">
        <div className="text-sm font-extrabold mb-2" style={{ color: "#1a1a1a" }}>
          ⚡ Fangbonus für schnelle Antworten
        </div>
        <div className="text-xs font-bold mb-2" style={{ color: "#555" }}>
          Wer innerhalb von {pendingSeconds} Sekunden richtig antwortet, bekommt beim anschließenden
          Fangversuch +{FAST_ANSWER_BONUS} Prozentpunkte Fangchance.
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={FAST_ANSWER_MIN_SECONDS}
            max={FAST_ANSWER_MAX_SECONDS}
            value={pendingSeconds}
            onChange={(e) => setPendingSeconds(Number(e.target.value))}
            className="flex-1"
          />
          <span className="border-4 border-black px-2 py-1 font-extrabold text-sm" style={{ background: "#ffcb05", color: "#1a1a1a" }}>
            {pendingSeconds}s
          </span>
        </div>
      </div>

      <div className="flex gap-2 justify-end flex-wrap mt-2">
        {!isOnboarding && onCancel && (
          <button
            onClick={onCancel}
            className="border-4 border-black px-4 py-2 font-bold text-sm"
            style={{ background: "#ffffff", color: "#1a1a1a" }}
          >
            Abbrechen
          </button>
        )}
        <button
          onClick={() => canConfirm && onConfirm(Array.from(pending), pendingSeconds)}
          disabled={!canConfirm}
          className="border-4 border-black px-4 py-2 font-extrabold text-sm"
          style={{
            background: canConfirm ? "#e3350d" : "#c9c9c9",
            color: "#ffffff",
            cursor: canConfirm ? "pointer" : "not-allowed",
          }}
        >
          {isOnboarding ? "Los geht's ▶" : "Übernehmen"}
        </button>
      </div>
      {!canConfirm && (
        <div className="text-xs font-bold mt-2 text-right" style={{ color: "#e3350d" }}>
          Bitte mindestens eine Fertigkeit auswählen.
        </div>
      )}
    </PixelPanel>
  );
}
