/* --------- Spielstand-Speicherung (localStorage) ---------
   Läuft nur in einer echten Browser-Umgebung (z. B. nach dem Deploy).
   In Claudes Artefakt-Vorschau ist localStorage blockiert – deshalb
   ist alles in try/catch gekapselt und bricht dort einfach lautlos ab,
   ohne das Spiel zu stören.

   Jede Klassenstufe (1–4) hat einen eigenen, unabhängigen Spielstand. */
import { REGIONS } from "./data/regions";
import { FANG_START_CHANCE, FAST_ANSWER_DEFAULT_SECONDS } from "./data/gameplay";
import { CLASS_DEFAULT_SKILLS } from "./data/skills";

const LEGACY_SAVE_KEY = "pokeZahlenAbenteuer_save_v1";
const META_KEY = "pokeZahlenAbenteuer_meta_v2";

export function saveKeyForClass(classLevel) {
  return `pokeZahlenAbenteuer_save_v2_klasse${classLevel}`;
}

export function loadClassSave(classLevel) {
  try {
    const raw = localStorage.getItem(saveKeyForClass(classLevel));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveClassSave(classLevel, state) {
  try {
    localStorage.setItem(saveKeyForClass(classLevel), JSON.stringify({ ...state, schemaVersion: 2 }));
  } catch {
    // z. B. localStorage nicht verfügbar (Artefakt-Vorschau) oder Speicher voll –
    // Spiel läuft trotzdem weiter, nur ohne Persistenz.
  }
}

export function clearClassSave(classLevel) {
  try {
    localStorage.removeItem(saveKeyForClass(classLevel));
  } catch {
    // ignorieren
  }
}

/* Legt einen frischen Spielstand für eine Klassenstufe an, z. B. direkt
   nach Abschluss des Einrichtungs-Assistenten. */
export function createInitialClassSave(classLevel, selectedSkillIds, fastAnswerSeconds = FAST_ANSWER_DEFAULT_SECONDS) {
  const initial = {
    activeRegionIdx: 0,
    unlockedCount: 1,
    regionStreaks: REGIONS.map(() => 0),
    caughtDex: [],
    score: 0,
    fangChance: FANG_START_CHANCE,
    totalAnswered: 0,
    totalCorrect: 0,
    selectedSkillIds,
    fastAnswerSeconds,
  };
  saveClassSave(classLevel, initial);
  return initial;
}

export function loadMeta() {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveMeta(meta) {
  try {
    const prev = loadMeta() ?? {};
    localStorage.setItem(META_KEY, JSON.stringify({ ...prev, ...meta }));
  } catch {
    // ignorieren
  }
}

/* Übernimmt einen alten (Vor-Klassenstufen-Feature) Spielstand einmalig als
   Klasse-1-Spielstand, damit bestehender Fortschritt (Punkte, Pokédex,
   Fangchance) nicht verloren geht. Läuft nur, solange noch kein
   klassen-spezifischer Klasse-1-Spielstand existiert, und ist ansonsten
   ein No-op (mehrfacher Aufruf ist sicher). */
export function migrateLegacySaveIfNeeded() {
  try {
    const legacyRaw = localStorage.getItem(LEGACY_SAVE_KEY);
    if (!legacyRaw) return;
    if (loadClassSave(1)) return;
    const legacy = JSON.parse(legacyRaw);
    if (!legacy || typeof legacy !== "object") return;
    saveClassSave(1, {
      activeRegionIdx: legacy.activeRegionIdx ?? 0,
      unlockedCount: legacy.unlockedCount ?? 1,
      regionStreaks: legacy.regionStreaks ?? REGIONS.map(() => 0),
      caughtDex: legacy.caughtDex ?? [],
      score: legacy.score ?? 0,
      fangChance: legacy.fangChance ?? FANG_START_CHANCE,
      totalAnswered: legacy.totalAnswered ?? 0,
      totalCorrect: legacy.totalCorrect ?? 0,
      selectedSkillIds: CLASS_DEFAULT_SKILLS[1],
      fastAnswerSeconds: FAST_ANSWER_DEFAULT_SECONDS,
    });
    saveMeta({ lastActiveClass: 1 });
    localStorage.removeItem(LEGACY_SAVE_KEY);
  } catch {
    // localStorage nicht verfügbar oder alter Stand kaputt – einfach überspringen
  }
}
