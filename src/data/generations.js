import { REGIONS as KANTO_REGIONS } from "./regions";

const MIN_DEX_PER_REGION = 10;
const MAX_REGIONS_PER_GENERATION = 10;

/* Erzeugt generische Regionen für eine Generation ohne kuratierte
   Ortsnamen (z. B. Johto): Regionsanzahl richtet sich nach der Dex-Größe
   der Generation, nie unter MIN_DEX_PER_REGION Pokémon pro Region. Der
   Rest wird gleichmäßig auf die ersten Regionen verteilt. */
export function buildGenericRegions(dexStart, dexEnd, namePrefix) {
  const total = dexEnd - dexStart + 1;
  const regionCount = Math.max(1, Math.min(MAX_REGIONS_PER_GENERATION, Math.floor(total / MIN_DEX_PER_REGION)));
  const base = Math.floor(total / regionCount);
  const remainder = total % regionCount;
  const regions = [];
  let cursor = dexStart;
  for (let i = 0; i < regionCount; i++) {
    const size = base + (i < remainder ? 1 : 0);
    regions.push({
      name: `${namePrefix} – Gebiet ${i + 1}`,
      dexStart: cursor,
      dexEnd: cursor + size - 1,
      needed: 10,
    });
    cursor += size;
  }
  return regions;
}

/* Alle Pokémon-Generationen. Neue Generationen werden einfach als
   weiterer Eintrag ergänzt (Gen 3+: dexStart/dexEnd + entweder
   buildGenericRegions(...) oder eine kuratierte Regionen-Liste analog
   zu KANTO_REGIONS) – der restliche Code kennt keine Sonderfälle pro
   Generation. */
export const GENERATIONS = [
  { id: 1, label: "Kanto", dexStart: 1, dexEnd: 151, regions: KANTO_REGIONS },
  { id: 2, label: "Johto", dexStart: 152, dexEnd: 251, regions: buildGenericRegions(152, 251, "Johto") },
  { id: 3, label: "Hoenn", dexStart: 252, dexEnd: 386, regions: buildGenericRegions(252, 386, "Hoenn") },
  { id: 4, label: "Sinnoh", dexStart: 387, dexEnd: 493, regions: buildGenericRegions(387, 493, "Sinnoh") },
  { id: 5, label: "Einall", dexStart: 494, dexEnd: 649, regions: buildGenericRegions(494, 649, "Einall") },
  { id: 6, label: "Kalos", dexStart: 650, dexEnd: 721, regions: buildGenericRegions(650, 721, "Kalos") },
  { id: 7, label: "Alola", dexStart: 722, dexEnd: 809, regions: buildGenericRegions(722, 809, "Alola") },
  { id: 8, label: "Galar", dexStart: 810, dexEnd: 905, regions: buildGenericRegions(810, 905, "Galar") },
  { id: 9, label: "Paldea", dexStart: 906, dexEnd: 1025, regions: buildGenericRegions(906, 1025, "Paldea") },
];

export function createDefaultGenerationProgress(generation) {
  return {
    activeRegionIdx: 0,
    unlockedCount: 1,
    regionStreaks: generation.regions.map(() => 0),
  };
}
