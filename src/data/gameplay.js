/* ======================================================================
   ALLGEMEINE SPIEL-KONSTANTEN (Fang-Mechanik)
   ====================================================================== */

export const FANG_START_CHANCE = 30; // %
export const FANG_STEP = 15; // % pro Fehlversuch
export const FANG_MAX_CHANCE = 95; // Deckel, damit nie 100% garantiert sind

/* Legendäre Pokémon sind schwerer zu fangen: ihre effektive Fangchance
   wird mit diesem Faktor multipliziert (die reguläre fangChance-Eskalation
   bei Fehlversuchen läuft davon unabhängig normal weiter). */
export const LEGENDARY_CATCH_MULTIPLIER = 0.4;

/* Fangbonus für schnelle richtige Antworten: wird nur auf den einzelnen
   Fangversuch angerechnet (additiv, nach dem Legendär-Malus), die
   fangChance-Eskalation selbst bleibt unangetastet. Die Zeitschwelle ist
   pro Klassenstufe einstellbar (siehe SkillSettings). */
export const FAST_ANSWER_BONUS = 20; // Prozentpunkte
export const FAST_ANSWER_DEFAULT_SECONDS = 5;
export const FAST_ANSWER_MIN_SECONDS = 2;
export const FAST_ANSWER_MAX_SECONDS = 15;
