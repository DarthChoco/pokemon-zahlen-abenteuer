/* ======================================================================
   POKÉMON-DATEN (Gen 1, #1–151, deutsche Namen)
   ====================================================================== */

export const POKEMON_NAMES = [
  "Bisasam", "Bisaknosp", "Bisaflor", "Glumanda", "Glutexo", "Glurak",
  "Schiggy", "Schillok", "Turtok", "Raupy", "Safcon", "Smettbo",
  "Hornliu", "Kokuna", "Bibor", "Taubsi", "Tauboga", "Tauboss",
  "Rattfratz", "Rattikarl", "Habitak", "Ibitak", "Rettan", "Arbok",
  "Pikachu", "Raichu", "Sandan", "Sandamer", "Nidoran♀", "Nidorina",
  "Nidoqueen", "Nidoran♂", "Nidorino", "Nidoking", "Piepi", "Pixi",
  "Vulpix", "Vulnona", "Pummeluff", "Knuddeluff", "Zubat", "Golbat",
  "Myrapla", "Duflor", "Giflor", "Paras", "Parasek", "Bluzuk",
  "Omot", "Digda", "Digdri", "Mauzi", "Snobilikat", "Enton",
  "Entoron", "Menki", "Rasaff", "Fukano", "Arkani", "Quapsel",
  "Quaputzi", "Quappo", "Abra", "Kadabra", "Simsala", "Machollo",
  "Maschock", "Machomei", "Knofensa", "Ultrigaria", "Sarzenia", "Tentacha",
  "Tentoxa", "Kleinstein", "Georok", "Geowaz", "Ponita", "Gallopa",
  "Flegmon", "Lahmus", "Magnetilo", "Magneton", "Porenta", "Dodu",
  "Dodri", "Jurob", "Jugong", "Sleima", "Sleimok", "Muschas",
  "Austos", "Nebulak", "Alpollo", "Gengar", "Onix", "Traumato",
  "Hypno", "Krabby", "Kingler", "Voltobal", "Lektrobal", "Owei",
  "Kokowei", "Tragosso", "Knogga", "Kicklee", "Nockchan", "Schlurp",
  "Smogon", "Smogmog", "Rihorn", "Rizeros", "Chaneira", "Tangela",
  "Kangama", "Seeper", "Seemon", "Goldini", "Golking", "Sterndu",
  "Starmie", "Pantimos", "Sichlor", "Rossana", "Elektek", "Magmar",
  "Pinsir", "Tauros", "Karpador", "Garados", "Lapras", "Ditto",
  "Evoli", "Aquana", "Blitza", "Flamara", "Porygon", "Amonitas",
  "Amoroso", "Kabuto", "Kabutops", "Aerodactyl", "Relaxo", "Arktos",
  "Zapdos", "Lavados", "Dratini", "Dragonir", "Dragoran", "Mewtu",
  "Mew",
];

export function pokemonName(dexNr) {
  return POKEMON_NAMES[dexNr - 1];
}

/* Öffentliche Sprite-URL von PokeAPI (nach Dex-Nummer).
   Bewusst nur EINE Auflösung pro Pokémon, damit beim Vorladen
   jedes Sprite nur einmal heruntergeladen werden muss. */
export function pokeSpriteUrl(dexNr) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${dexNr}.png`;
}

/* Legendäre/mythische Pokémon (Gen 1): die drei Vögel, Mewtu und Mew.
   Deutlich seltener zu fangen als der Rest des Pokédex. */
export const LEGENDARY_DEX = new Set([144, 145, 146, 150, 151]);

export function isLegendary(dexNr) {
  return LEGENDARY_DEX.has(dexNr);
}
