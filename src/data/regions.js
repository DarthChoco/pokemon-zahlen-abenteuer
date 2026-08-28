/* ======================================================================
   REGIONEN-KONFIGURATION
   10 Regionen, Pokédex-Nr. 1–151 aufsteigend verteilt.
   Die inhaltliche Schwierigkeit (welche Rechen-Skills in welcher Region
   drankommen) wird NICHT mehr hier festgelegt, sondern dynamisch aus der
   Skill-Auswahl der jeweiligen Klassenstufe berechnet
   (siehe src/logic/regionConfig.js). Hier stehen nur noch die festen
   Pokémon-Dex-Ranges und der Name jeder Region.
   ====================================================================== */

export const REGIONS = [
  { name: "Route 1", dexStart: 1, dexEnd: 15, needed: 10 },
  { name: "Viridian-Wald", dexStart: 16, dexEnd: 30, needed: 10 },
  { name: "Digda-Höhle", dexStart: 31, dexEnd: 45, needed: 10 },
  { name: "Route 3 & 4", dexStart: 46, dexEnd: 60, needed: 10 },
  { name: "Kraftwerk", dexStart: 61, dexEnd: 75, needed: 10 },
  { name: "Pokémon-Turm", dexStart: 76, dexEnd: 90, needed: 10 },
  { name: "Silph Co.", dexStart: 91, dexEnd: 105, needed: 10 },
  { name: "Safari-Zone", dexStart: 106, dexEnd: 120, needed: 10 },
  { name: "Cinnabar-Inseln", dexStart: 121, dexEnd: 135, needed: 10 },
  { name: "Siegesstraße", dexStart: 136, dexEnd: 151, needed: 10 },
];
