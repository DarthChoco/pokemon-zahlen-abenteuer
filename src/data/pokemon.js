/* ======================================================================
   POKÉMON-DATEN (deutsche Namen, Array-Index = nationale Dex-Nr. − 1)
   Gen 1 (Kanto, #1–151) + Gen 2 (Johto, #152–251).
   Gen-2-Namen verifiziert über Bulbapedia „List of German Pokémon names".
   ====================================================================== */

export const POKEMON_NAMES = [
  // Gen 1 – Kanto (#1–151)
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
  // Gen 2 – Johto (#152–251)
  "Endivie", "Lorblatt", "Meganie", "Feurigel", "Igelavar", "Tornupto",
  "Karnimani", "Tyracroc", "Impergator", "Wiesor", "Wiesenior", "Hoothoot",
  "Noctuh", "Ledyba", "Ledian", "Webarak", "Ariados", "Iksbat",
  "Lampi", "Lanturn", "Pichu", "Pii", "Fluffeluff", "Togepi",
  "Togetic", "Natu", "Xatu", "Voltilamm", "Waaty", "Ampharos",
  "Blubella", "Marill", "Azumarill", "Mogelbaum", "Quaxo", "Hoppspross",
  "Hubelupf", "Papungha", "Griffel", "Sonnkern", "Sonnflora", "Yanma",
  "Felino", "Morlord", "Psiana", "Nachtara", "Kramurx", "Laschoking",
  "Traunfugil", "Icognito", "Woingenau", "Girafarig", "Tannza", "Forstellka",
  "Dummisel", "Skorgla", "Stahlos", "Snubbull", "Granbull", "Baldorfish",
  "Scherox", "Pottrott", "Skaraborn", "Sniebel", "Teddiursa", "Ursaring",
  "Schneckmag", "Magcargo", "Quiekel", "Keifel", "Corasonn", "Remoraid",
  "Octillery", "Botogel", "Mantax", "Panzaeron", "Hunduster", "Hundemon",
  "Seedraking", "Phanpy", "Donphan", "Porygon2", "Damhirplex", "Farbeagle",
  "Rabauz", "Kapoera", "Kussilla", "Elekid", "Magby", "Miltank",
  "Heiteira", "Raikou", "Entei", "Suicune", "Larvitar", "Pupitar",
  "Despotar", "Lugia", "Ho-Oh", "Celebi",
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

/* Legendäre/mythische Pokémon: Gen 1 (die drei Vögel, Mewtu, Mew) und
   Gen 2 (Raikou, Entei, Suicune, Lugia, Ho-Oh, Celebi). Deutlich seltener
   zu fangen als der Rest des Pokédex. */
export const LEGENDARY_DEX = new Set([144, 145, 146, 150, 151, 243, 244, 245, 249, 250, 251]);

export function isLegendary(dexNr) {
  return LEGENDARY_DEX.has(dexNr);
}

/* Lädt die Sprites eines Dex-Bereichs unauffällig im Hintergrund (kein
   Progress-Tracking, kein Ladebildschirm) – genutzt beim Freischalten
   einer neuen Generation, damit deren Sprites schon im Cache liegen,
   sobald die Pokédex-Ansicht sie zeigt. */
export function preloadSprites(dexStart, dexEnd) {
  for (let dex = dexStart; dex <= dexEnd; dex++) {
    const img = new Image();
    img.src = pokeSpriteUrl(dex);
  }
}
