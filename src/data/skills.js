/* ======================================================================
   SKILL-KATALOG
   Jede einzeln an-/abwählbare Rechenfertigkeit ("Skill") beschreibt, WAS
   ein Kind schon beherrscht. Die Regionen einer Klassenstufe werden aus
   der Skill-Auswahl dynamisch berechnet (siehe src/logic/regionConfig.js),
   die konkreten Aufgaben aus einem Skill erzeugt src/logic/questionGenerators.js.

   category "numrange":  Addition/Subtraktion in einem Zahlenraum,
                          `carry` = ob mit (true) oder ohne (false) Übergang
                          gerechnet wird. `numrange_10` hat keinen Übergang-
                          Split (carry bleibt undefined = "beides möglich"),
                          da im Zahlenraum bis 10 kein sinnvoller
                          Stellenwertübergang existiert.
   category "times":      kleines Einmaleins, eine Reihe (`row` 1–10).
   category "division":   Division ohne Rest, eine Reihe (`row` 1–10),
                           unabhängig von der zugehörigen Einmaleins-Reihe
                           wählbar.
   ====================================================================== */

function numrangeSkill(id, label, shortLabel, maxRange, carry, add, sub) {
  return { id, category: "numrange", label, shortLabel, maxRange, carry, add, sub };
}

function timesSkill(row) {
  return {
    id: `times_${row}`,
    category: "times",
    label: `${row}er-Reihe (Einmaleins)`,
    shortLabel: `${row}er-Reihe ×`,
    maxRange: 100,
    row,
  };
}

function divisionSkill(row) {
  return {
    id: `div_${row}`,
    category: "division",
    label: `${row}er-Reihe (Division, ohne Rest)`,
    shortLabel: `${row}er-Reihe ÷`,
    maxRange: 10,
    row,
  };
}

/* Großes 1x1 (Klasse 3): zweistellige Zahl × einstelliger Faktor, z. B.
   23 × 4. Abgefragt wird nur das Endergebnis (Multiple-Choice) – das
   schriftliche Rechenverfahren selbst wird hier NICHT geprüft. */
const TIMES_BIG_SKILL = {
  id: "times_big",
  category: "times_big",
  label: "Großes 1x1 (zweistellig × einstellig, z. B. 23 × 4)",
  shortLabel: "Großes 1x1",
  maxRange: 900,
};

/* Passende Division groß: mehrstelliger Dividend ÷ einstelliger Divisor,
   immer ohne Rest (Umkehraufgabe zum großen 1x1). */
const DIVISION_BIG_SKILL = {
  id: "div_big",
  category: "division_big",
  label: "Division groß (mehrstellig ÷ einstellig, ohne Rest)",
  shortLabel: "Division groß",
  maxRange: 99,
};

export const SKILL_CATALOG = [
  numrangeSkill(
    "numrange_10", "Zahlenraum bis 10", "bis 10", 10, undefined,
    { aMin: 1, aMax: 8, bMin: 1, bMax: 8 },
    { aMin: 2, aMax: 10, bMin: 1, bMax: 9 }
  ),
  numrangeSkill(
    "numrange_20_nocarry", "Zahlenraum bis 20 (ohne Zehnerübergang)", "bis 20 · ohne Übergang", 20, false,
    { aMin: 11, aMax: 18, bMin: 1, bMax: 9 },
    { aMin: 11, aMax: 19, bMin: 1, bMax: 9 }
  ),
  numrangeSkill(
    "numrange_20_carry", "Zahlenraum bis 20 (mit Zehnerübergang)", "bis 20 · mit Übergang", 20, true,
    { aMin: 1, aMax: 9, bMin: 1, bMax: 9 },
    { aMin: 10, aMax: 19, bMin: 1, bMax: 9 }
  ),
  numrangeSkill(
    "numrange_100_nocarry", "Zahlenraum bis 100 (ohne Übergang)", "bis 100 · ohne Übergang", 100, false,
    { aMin: 10, aMax: 89, bMin: 10, bMax: 89 },
    { aMin: 10, aMax: 99, bMin: 10, bMax: 89 }
  ),
  numrangeSkill(
    "numrange_100_carry", "Zahlenraum bis 100 (mit Übergang)", "bis 100 · mit Übergang", 100, true,
    { aMin: 10, aMax: 89, bMin: 10, bMax: 89 },
    { aMin: 10, aMax: 99, bMin: 10, bMax: 89 }
  ),
  numrangeSkill(
    "numrange_1000_nocarry", "Zahlenraum bis 1000 (ohne Übergang)", "bis 1000 · ohne Übergang", 1000, false,
    { aMin: 100, aMax: 899, bMin: 100, bMax: 899 },
    { aMin: 100, aMax: 999, bMin: 100, bMax: 899 }
  ),
  numrangeSkill(
    "numrange_1000_carry", "Zahlenraum bis 1000 (mit Übergang)", "bis 1000 · mit Übergang", 1000, true,
    { aMin: 100, aMax: 899, bMin: 100, bMax: 899 },
    { aMin: 100, aMax: 999, bMin: 100, bMax: 899 }
  ),
  numrangeSkill(
    "numrange_1000000_nocarry", "Zahlenraum bis 1 Million (ohne Übergang)", "bis 1 Mio · ohne Übergang", 1000000, false,
    { aMin: 100000, aMax: 899999, bMin: 100000, bMax: 899999 },
    { aMin: 100000, aMax: 999999, bMin: 100000, bMax: 899999 }
  ),
  numrangeSkill(
    "numrange_1000000_carry", "Zahlenraum bis 1 Million (mit Übergang)", "bis 1 Mio · mit Übergang", 1000000, true,
    { aMin: 100000, aMax: 899999, bMin: 100000, bMax: 899999 },
    { aMin: 100000, aMax: 999999, bMin: 100000, bMax: 899999 }
  ),
  ...Array.from({ length: 10 }, (_, i) => timesSkill(i + 1)),
  ...Array.from({ length: 10 }, (_, i) => divisionSkill(i + 1)),
  TIMES_BIG_SKILL,
  DIVISION_BIG_SKILL,
];

export const SKILLS_BY_ID = Object.fromEntries(SKILL_CATALOG.map((s) => [s.id, s]));

/* layout "list": volle Breite, ein Skill pro Zeile mit Label (numrange-Stil).
   layout "grid": kompaktes Raster nummerierter Kacheln (1x1-Reihen-Stil). */
export const SKILL_CATEGORIES = [
  { key: "numrange", label: "Zahlenraum & Grundrechenarten", layout: "list" },
  { key: "times", label: "Kleines Einmaleins", layout: "grid" },
  { key: "division", label: "Division (ohne Rest)", layout: "grid" },
  { key: "times_big", label: "Großes 1x1 (Klasse 3)", layout: "list" },
  { key: "division_big", label: "Division groß (Klasse 3)", layout: "list" },
];

/* Globale Schwierigkeits-Reihenfolge ALLER Skills (aufsteigend).
   Aus einer Nutzer-Auswahl wird nur die enthaltene Teilmenge behalten,
   in dieser Reihenfolge, und kumulativ auf die 10 Regionen verteilt
   (siehe buildRegionSkillPlan in src/logic/regionConfig.js). */
export const MASTER_SKILL_ORDER = [
  "numrange_10", "numrange_20_nocarry", "numrange_20_carry",
  "numrange_100_nocarry", "numrange_100_carry",
  "times_2", "times_5", "times_10", "div_2", "div_5", "div_10",
  "times_4", "div_4", "times_3", "div_3", "times_6", "div_6",
  "times_9", "div_9", "times_7", "div_7", "times_8", "div_8",
  "times_1", "div_1",
  "times_big", "div_big",
  "numrange_1000_nocarry", "numrange_1000_carry",
  "numrange_1000000_nocarry", "numrange_1000000_carry",
];

/* Lehrplan-orientierte Vorauswahl pro Klassenstufe (im Einstellungs-Assistenten
   vorausgefüllt, vom Nutzer aber vollständig änderbar). Klasse 2 enthält
   bewusst noch KEIN Einmaleins/Division, da Kinder zu Beginn der 2. Klasse
   das kleine 1x1 typischerweise noch nicht können. */
export const CLASS_DEFAULT_SKILLS = {
  1: ["numrange_10", "numrange_20_nocarry", "numrange_20_carry"],
  2: ["numrange_20_nocarry", "numrange_20_carry", "numrange_100_nocarry", "numrange_100_carry"],
  3: [
    "numrange_100_nocarry", "numrange_100_carry",
    ...Array.from({ length: 10 }, (_, i) => `times_${i + 1}`),
    "div_2", "div_5", "div_10",
    "numrange_1000_nocarry", "numrange_1000_carry",
  ],
  4: [
    "numrange_100_nocarry", "numrange_100_carry",
    "numrange_1000_nocarry", "numrange_1000_carry",
    "numrange_1000000_nocarry", "numrange_1000000_carry",
    ...Array.from({ length: 10 }, (_, i) => `times_${i + 1}`),
    ...Array.from({ length: 10 }, (_, i) => `div_${i + 1}`),
    "times_big", "div_big",
  ],
};

export const CLASS_LEVELS = [1, 2, 3, 4];
