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
];

export function createDefaultGenerationProgress(generation) {
  return {
    activeRegionIdx: 0,
    unlockedCount: 1,
    regionStreaks: generation.regions.map(() => 0),
  };
}
