import { REGIONS as KANTO_REGIONS } from "./regions";

const MIN_DEX_PER_REGION = 10;
const MAX_REGIONS_PER_GENERATION = 10;

/* Erzeugt die Regionen einer Generation. Ohne `regionNames` generisch
   benannt ("Gebiet 1, 2, ..."), Regionsanzahl richtet sich dann nach der
   Dex-Größe der Generation (nie unter MIN_DEX_PER_REGION Pokémon pro
   Region). Mit `regionNames` (echte Orte aus dem jeweiligen Spiel, in
   Reihenfolge) wird stattdessen deren Länge als Regionsanzahl verwendet
   und jede Region entsprechend benannt – die Dex-Range wird in beiden
   Fällen gleich (gleichmäßig, Rest auf die ersten Regionen verteilt)
   aufgeteilt. */
export function buildGenericRegions(dexStart, dexEnd, namePrefix, regionNames) {
  const total = dexEnd - dexStart + 1;
  const regionCount = regionNames
    ? regionNames.length
    : Math.max(1, Math.min(MAX_REGIONS_PER_GENERATION, Math.floor(total / MIN_DEX_PER_REGION)));
  const base = Math.floor(total / regionCount);
  const remainder = total % regionCount;
  const regions = [];
  let cursor = dexStart;
  for (let i = 0; i < regionCount; i++) {
    const size = base + (i < remainder ? 1 : 0);
    regions.push({
      name: regionNames ? regionNames[i] : `${namePrefix} – Gebiet ${i + 1}`,
      dexStart: cursor,
      dexEnd: cursor + size - 1,
      needed: 10,
    });
    cursor += size;
  }
  return regions;
}

/* Echte Orte aus den jeweiligen Spielen (deutsche Namen), in etwa in
   Spiel-/Story-Reihenfolge. Recherchiert über PokéWiki; bei Generationen
   mit mehr bekannten Orten als benötigten Regionen wurde eine Auswahl der
   bekanntesten/eindeutigsten Orte getroffen. */
const JOHTO_REGION_NAMES = [
  "Neuborkia", "Rosalia City", "Viola City", "Azalea City", "Dukatia City",
  "Teak City", "Oliviana City", "Anemonia City", "Mahagonia City", "Ebenholz City",
];
const HOENN_REGION_NAMES = [
  "Metarost City", "Malvenfroh City", "Graphitport City", "Bad Lavastadt", "Baumhausen City",
  "Faustauhaven", "Floßbrunn", "Blütenburg City", "Moosbach City", "Prachtpolis City",
];
const SINNOH_REGION_NAMES = [
  "Zweiblattdorf", "Sandgemme", "Jubelstadt", "Erzelingen", "Flori",
  "Ewigenau", "Herzhofen", "Trostu", "Blizzach", "Sonnewik",
];
const EINALL_REGION_NAMES = [
  "Avenitia", "Stratos City", "Rayono City", "Marea City", "Panaero City",
  "Nevaio City", "Tessera", "Ondula", "Abidaya City", "Vapydro City",
];
const KALOS_REGION_NAMES = [
  "Escissia", "Aquarellia", "Nouvaria City", "Illumina City", "Petrophia", "Yantara City", "Fluxia City",
];
const ALOLA_REGION_NAMES = [
  "Hauholi City", "Ohana", "Lili'i", "Konikoni City", "Malihe City", "Po'u", "Kantai City", "Mahalo-Bergpfad",
];
const GALAR_REGION_NAMES = [
  "Furlongham", "Brassbury", "Engine City", "Turffield", "Keelton",
  "Fairballey", "Circhester", "Spikeford", "Score City",
];
const PALDEA_REGION_NAMES = [
  "Bolardin", "Asarilla", "Fermanca City", "Frigomonta", "Garrafosa City",
  "Mesalona City", "Moldrid", "Montanata", "Pratolido", "Puerto Marinedo",
];

/* Alle Pokémon-Generationen. Neue Generationen werden einfach als
   weiterer Eintrag ergänzt (Gen 10+: dexStart/dexEnd + eine kuratierte
   Namensliste oder, ohne recherchierte Orte, einfach `buildGenericRegions`
   ohne dritten Parameter) – der restliche Code kennt keine Sonderfälle
   pro Generation. */
export const GENERATIONS = [
  { id: 1, label: "Kanto", dexStart: 1, dexEnd: 151, regions: KANTO_REGIONS },
  { id: 2, label: "Johto", dexStart: 152, dexEnd: 251, regions: buildGenericRegions(152, 251, "Johto", JOHTO_REGION_NAMES) },
  { id: 3, label: "Hoenn", dexStart: 252, dexEnd: 386, regions: buildGenericRegions(252, 386, "Hoenn", HOENN_REGION_NAMES) },
  { id: 4, label: "Sinnoh", dexStart: 387, dexEnd: 493, regions: buildGenericRegions(387, 493, "Sinnoh", SINNOH_REGION_NAMES) },
  { id: 5, label: "Einall", dexStart: 494, dexEnd: 649, regions: buildGenericRegions(494, 649, "Einall", EINALL_REGION_NAMES) },
  { id: 6, label: "Kalos", dexStart: 650, dexEnd: 721, regions: buildGenericRegions(650, 721, "Kalos", KALOS_REGION_NAMES) },
  { id: 7, label: "Alola", dexStart: 722, dexEnd: 809, regions: buildGenericRegions(722, 809, "Alola", ALOLA_REGION_NAMES) },
  { id: 8, label: "Galar", dexStart: 810, dexEnd: 905, regions: buildGenericRegions(810, 905, "Galar", GALAR_REGION_NAMES) },
  { id: 9, label: "Paldea", dexStart: 906, dexEnd: 1025, regions: buildGenericRegions(906, 1025, "Paldea", PALDEA_REGION_NAMES) },
];

export function createDefaultGenerationProgress(generation) {
  return {
    activeRegionIdx: 0,
    unlockedCount: 1,
    regionStreaks: generation.regions.map(() => 0),
  };
}
