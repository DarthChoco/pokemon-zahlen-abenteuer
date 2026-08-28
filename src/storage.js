/* --------- Spielstand-Speicherung (localStorage) ---------
   Läuft nur in einer echten Browser-Umgebung (z. B. nach dem Deploy).
   In Claudes Artefakt-Vorschau ist localStorage blockiert – deshalb
   ist alles in try/catch gekapselt und bricht dort einfach lautlos ab,
   ohne das Spiel zu stören.

   Es gibt genau EINEN Spielstand (keine Klassenstufen-Trennung mehr). */
import { FANG_START_CHANCE, FAST_ANSWER_DEFAULT_SECONDS } from "./data/gameplay";
import { GENERATIONS, createDefaultGenerationProgress } from "./data/generations";

const SAVE_KEY = "pokeZahlenAbenteuer_save_v3";

export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSave(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, schemaVersion: 3 }));
  } catch {
    // z. B. localStorage nicht verfügbar (Artefakt-Vorschau) oder Speicher voll –
    // Spiel läuft trotzdem weiter, nur ohne Persistenz.
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // ignorieren
  }
}

/* Legt einen frischen Spielstand an, direkt nach Abschluss des
   Einrichtungs-Assistenten. */
export function createInitialSave(selectedSkillIds, fastAnswerSeconds = FAST_ANSWER_DEFAULT_SECONDS) {
  const firstGen = GENERATIONS[0];
  const initial = {
    activeGenerationId: firstGen.id,
    generationProgress: { [firstGen.id]: createDefaultGenerationProgress(firstGen) },
    caughtDex: [],
    score: 0,
    fangChance: FANG_START_CHANCE,
    totalAnswered: 0,
    totalCorrect: 0,
    selectedSkillIds,
    fastAnswerSeconds,
  };
  saveSave(initial);
  return initial;
}
