/* ======================================================================
   POKÉMON-DATEN (deutsche Namen, Array-Index = nationale Dex-Nr. − 1)
   Gen 1–9 (Kanto #1–151, Johto #152–251, Hoenn #252–386, Sinnoh #387–493,
   Einall/Unova #494–649, Kalos #650–721, Alola #722–809, Galar #810–905,
   Paldea #906–1025). Alle Namen ab Gen 2 über Bulbapedia „List of German
   Pokémon names" bzw. PokéWiki-Regionaldex-Listen recherchiert; einzelne
   Namen (v. a. Kalos, Galar, Paldea), bei denen Quellen widersprüchliche
   oder erkennbar fehlerhafte (z. B. doppelt vergebene) Angaben lieferten,
   zusätzlich einzeln über die jeweilige Bulbapedia-Artikelseite verifiziert.
   ====================================================================== */
import { logFailedSprite } from "../debug";

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
  // Gen 3 – Hoenn (#252–386)
  "Geckarbor", "Reptain", "Gewaldro", "Flemmli", "Jungglut", "Lohgock",
  "Hydropi", "Moorabbel", "Sumpex", "Fiffyen", "Magnayen", "Zigzachs",
  "Geradaks", "Waumpel", "Schaloko", "Papinella", "Panekon", "Pudox",
  "Loturzel", "Lombrero", "Kappalores", "Samurzel", "Blanas", "Tengulist",
  "Schwalbini", "Schwalboss", "Wingull", "Pelipper", "Trasla", "Kirlia",
  "Guardevoir", "Gehweiher", "Maskeregen", "Knilz", "Kapilz", "Bummelz",
  "Muntier", "Letarking", "Nincada", "Ninjask", "Ninjatom", "Flurmel",
  "Krakeelo", "Krawumms", "Makuhita", "Hariyama", "Azurill", "Nasgnet",
  "Eneco", "Enekoro", "Zobiris", "Flunkifer", "Stollunior", "Stollrak",
  "Stolloss", "Meditie", "Meditalis", "Frizelbliz", "Manectric", "Plusle",
  "Minun", "Volbeat", "Illumise", "Roselia", "Schluppuck", "Schlukwech",
  "Kanivanha", "Tohaido", "Wailmer", "Wailord", "Camaub", "Camerupt",
  "Qurtel", "Spoink", "Groink", "Pandir", "Knacklion", "Vibrava",
  "Libelldra", "Tuska", "Noktuska", "Wablu", "Altaria", "Sengo",
  "Vipitis", "Lunastein", "Sonnfel", "Schmerbe", "Welsar", "Krebscorps",
  "Krebutack", "Puppance", "Lepumentas", "Liliep", "Wielie", "Anorith",
  "Armaldo", "Barschwa", "Milotic", "Formeo", "Kecleon", "Shuppet",
  "Banette", "Zwirrlicht", "Zwirrklop", "Tropius", "Palimpalim", "Absol",
  "Isso", "Schneppke", "Firnontor", "Seemops", "Seejong", "Walraisa",
  "Perlu", "Aalabyss", "Saganabyss", "Relicanth", "Liebiskus", "Kindwurm",
  "Draschel", "Brutalanda", "Tanhel", "Metang", "Metagross", "Regirock",
  "Regice", "Registeel", "Latias", "Latios", "Kyogre", "Groudon",
  "Rayquaza", "Jirachi", "Deoxys",
  // Gen 4 – Sinnoh (#387–493)
  "Chelast", "Chelcarain", "Chelterrar", "Panflam", "Panpyro", "Panferno",
  "Plinfa", "Pliprin", "Impoleon", "Staralili", "Staravia", "Staraptor",
  "Bidiza", "Bidifas", "Zirpurze", "Zirpeise", "Sheinux", "Luxio",
  "Luxtra", "Knospi", "Roserade", "Koknodon", "Rameidon", "Schilterus",
  "Bollterus", "Burmy", "Burmadame", "Moterpel", "Wadribie", "Honweisel",
  "Pachirisu", "Bamelin", "Bojelin", "Kikugi", "Kinoso", "Schalellos",
  "Gastrodon", "Ambidiffel", "Driftlon", "Drifzepeli", "Haspiror", "Schlapor",
  "Traunmagil", "Kramshef", "Charmian", "Shnurgarst", "Klingplim", "Skunkapuh",
  "Skuntank", "Bronzel", "Bronzong", "Mobai", "Pantimimi", "Wonneira",
  "Plaudagei", "Kryppuk", "Kaumalat", "Knarksel", "Knakrack", "Mampfaxo",
  "Riolu", "Lucario", "Hippopotas", "Hippoterus", "Pionskora", "Piondragi",
  "Glibunkel", "Toxiquak", "Venuflibis", "Finneon", "Lumineon", "Mantirps",
  "Shnebedeck", "Rexblisar", "Snibunna", "Magnezone", "Schlurplek", "Rihornior",
  "Tangoloss", "Elevoltek", "Magbrant", "Togekiss", "Yanmega", "Folipurba",
  "Glaziola", "Skorgro", "Mamutel", "Porygon-Z", "Galagladi", "Voluminas",
  "Zwirrfinst", "Frosdedje", "Rotom", "Selfe", "Vesprit", "Tobutz",
  "Dialga", "Palkia", "Heatran", "Regigigas", "Giratina", "Cresselia",
  "Phione", "Manaphy", "Darkrai", "Shaymin", "Arceus",
  // Gen 5 – Einall/Unova (#494–649)
  "Victini", "Serpifeu", "Efoserp", "Serpiroyal", "Floink", "Ferkokel",
  "Flambirex", "Ottaro", "Zwottronin", "Admurai", "Nagelotz", "Kukmarda",
  "Yorkleff", "Terribark", "Bissbark", "Felilou", "Kleoparda", "Vegimak",
  "Vegichita", "Grillmak", "Grillchita", "Sodamak", "Sodachita", "Somniam",
  "Somnivora", "Dusselgurr", "Navitaub", "Fasasnob", "Elezeba", "Zebritz",
  "Kiesling", "Sedimantur", "Brockoloss", "Fleknoil", "Fletiamo", "Rotomurf",
  "Stalobor", "Ohrdoch", "Praktibalk", "Strepoli", "Meistagrif", "Schallquap",
  "Mebrana", "Branawarz", "Jiutesto", "Karadonis", "Strawickl", "Folikon",
  "Matrifol", "Toxiped", "Rollum", "Cerapendra", "Waumboll", "Elfun",
  "Lilminip", "Dressella", "Barschuft", "Ganovil", "Rokkaiman", "Rabigator",
  "Flampion", "Flampivian", "Maracamba", "Lithomith", "Castellith", "Zurrokex",
  "Irokex", "Symvolara", "Makabaja", "Echnatoll", "Galapaflos", "Karippas",
  "Flapteryx", "Aeropteryx", "Unratütox", "Deponitox", "Zorua", "Zoroark",
  "Picochilla", "Chillabell", "Mollimorba", "Hypnomorba", "Morbitesse", "Monozyto",
  "Mitodos", "Zytomega", "Piccolente", "Swaroness", "Gelatini", "Gelatroppo",
  "Gelatwino", "Sesokitz", "Kronjuwild", "Emolga", "Laukaps", "Cavalanzas",
  "Tarnpignon", "Hutsassa", "Quabbel", "Apoquallyp", "Mamolida", "Wattzapf",
  "Voltula", "Kastadur", "Tentantel", "Klikk", "Kliklak", "Klikdiklak",
  "Zapplardin", "Zapplalek", "Zapplarang", "Pygraulon", "Megalon", "Lichtel",
  "Laternecto", "Skelabra", "Milza", "Sharfax", "Maxax", "Petznief",
  "Siberio", "Frigometri", "Schnuthelm", "Hydragil", "Flunschlik", "Lin-Fu",
  "Wie-Shu", "Shardrago", "Golbit", "Golgantes", "Gladiantri", "Caesurio",
  "Bisofank", "Geronimatz", "Washakwil", "Skallyk", "Grypheldis", "Furnifraß",
  "Fermicula", "Kapuno", "Duodino", "Trikephalo", "Ignivor", "Ramoth",
  "Kobalium", "Terrakium", "Viridium", "Boreos", "Voltolos", "Reshiram",
  "Zekrom", "Demeteros", "Kyurem", "Keldeo", "Meloetta", "Genesect",
  // Gen 6 – Kalos (#650–721)
  "Igamaro", "Igastarnish", "Brigaron", "Fynx", "Rutena", "Fennexis",
  "Froxy", "Amphizel", "Quajutsu", "Scoppel", "Grebbit", "Dartiri",
  "Dartignis", "Fiaro", "Purmel", "Puponcho", "Vivillon", "Leufeo",
  "Pyroleo", "Flabébé", "Floette", "Florges", "Mähikel", "Chevrumm",
  "Pam-Pam", "Pandagro", "Coiffwaff", "Psiau", "Psiaugon", "Gramokles",
  "Duokles", "Durengard", "Parfi", "Parfinesse", "Flauschling", "Sabbaione",
  "Iscalar", "Calamanero", "Bithora", "Thanathora", "Algitt", "Tandrak",
  "Scampisto", "Wummer", "Eguana", "Elezard", "Balgoras", "Monargoras",
  "Amarino", "Amagarga", "Feelinara", "Resladero", "Dedenne", "Rocara",
  "Viscora", "Viscargot", "Viscogon", "Clavion", "Paragoni", "Trombork",
  "Irrbis", "Pumpdjinn", "Arktip", "Arktilas", "eF-eM", "UHaFnir",
  "Xerneas", "Yveltal", "Zygarde", "Diancie", "Hoopa", "Volcanion",
  // Gen 7 – Alola (#722–809)
  "Bauz", "Arboretoss", "Silvarro", "Flamiau", "Miezunder", "Fuegro",
  "Robball", "Marikeck", "Primarene", "Peppeck", "Trompeck", "Tukanon",
  "Mangunior", "Manguspektor", "Mabula", "Akkup", "Donarion", "Krabbox",
  "Krawell", "Choreogel", "Wommel", "Bandelby", "Wuffels", "Wolwerock",
  "Lusardin", "Garstella", "Aggrostella", "Pampuli", "Pampross", "Araqua",
  "Aranestro", "Imantis", "Mantidea", "Bubungus", "Lamellux", "Molunk",
  "Amfira", "Velursi", "Kosturso", "Frubberl", "Frubaila", "Fruyal",
  "Curelei", "Kommandutan", "Quartermak", "Reißlaus", "Tectass", "Sankabuh",
  "Colossand", "Gufa", "Typ:Null", "Amigento", "Meteno", "Koalelu",
  "Tortunator", "Togedemaru", "Mimigma", "Knirfish", "Sen-Long", "Moruda",
  "Miniras", "Mediras", "Grandiras", "Kapu-Riki", "Kapu-Fala", "Kapu-Toro",
  "Kapu-Kime", "Cosmog", "Cosmovum", "Solgaleo", "Lunala", "Anego",
  "Masskito", "Schabelle", "Voltriant", "Kaguron", "Katagami", "Schlingking",
  "Necrozma", "Magearna", "Marshadow", "Venicro", "Agoyon", "Muramura",
  "Kopplosio", "Zeraora", "Meltan", "Melmetal",
  // Gen 8 – Galar (#810–905)
  "Chimpep", "Chimstix", "Gortrom", "Hopplo", "Kickerlo", "Liberlo",
  "Memmeon", "Phlegleon", "Intelleon", "Raffel", "Schlaraffel", "Meikro",
  "Kranoviz", "Krarmor", "Sensect", "Keradar", "Maritellit", "Kleptifux",
  "Gaunux", "Cottini", "Cottomi", "Wolly", "Zwollock", "Kamehaps",
  "Kamalm", "Voldi", "Bellektro", "Klonkett", "Wagong", "Montecarbo",
  "Knapfel", "Drapfel", "Schlapfel", "Salanga", "Sanaconda", "Urgl",
  "Pikuda", "Barrakiefa", "Toxel", "Riffex", "Thermopod", "Infernopod",
  "Klopptopus", "Kaocto", "Fatalitee", "Mortipot", "Brimova", "Brimano",
  "Silembrim", "Bähmon", "Pelzebub", "Olangaar", "Barrikadax", "Mauzinger",
  "Gorgasonn", "Lauchzelot", "Pantifrost", "Oghnatoll", "Hokumil", "Pokusan",
  "Legios", "Britzigel", "Snomnom", "Mottineva", "Humanolith", "Kubuin",
  "Servol", "Morpeko", "Kupfanti", "Patinaraja", "Lectragon", "Lecryodon",
  "Pescragon", "Pescryodon", "Duraludon", "Grolldra", "Phandra", "Katapuldra",
  "Zacian", "Zamazenta", "Endynalos", "Dakuma", "Wulaosu", "Zarude",
  "Regieleki", "Regidrago", "Polaross", "Phantoross", "Coronospa", "Damythir",
  "Axantor", "Ursaluna", "Salmagnis", "Snieboss", "Myriador", "Cupidos",
  // Gen 9 – Paldea (#906–1025)
  "Felori", "Feliospa", "Maskagato", "Krokel", "Lokroko", "Skelokrok",
  "Kwaks", "Fuentente", "Bailonda", "Ferkuli", "Fragrunz", "Tarundel",
  "Spinsidias", "Micrick", "Lextremo", "Pamo", "Pamamo", "Pamomamo",
  "Zwieps", "Famieps", "Hefel", "Backel", "Olini", "Olivinio",
  "Olithena", "Krawalloro", "Geosali", "Sedisal", "Saltigant", "Knarbon",
  "Crimanzo", "Azugladis", "Blipp", "Wampitz", "Voltrel", "Voltrean",
  "Mobtiff", "Mastifioso", "Sproxi", "Affiti", "Weherba", "Horrerba",
  "Tentagra", "Tenterra", "Klibbe", "Chilingel", "Halupenjo", "Relluk",
  "Skarabaks", "Flattutu", "Psiopatra", "Forgita", "Tafforgita", "Granforgita",
  "Schligda", "Schligdri", "Adebom", "Normifin", "Delfinator", "Knattox",
  "Knattatox", "Mopex", "Schlurm", "Lumispross", "Lumiflora", "Gruff",
  "Friedwuff", "Flaminkno", "Flaniwal", "Kolowal", "Agiluza", "Heerashai",
  "Nigiragi", "Epitaff", "Suelord", "Farigiraf", "Dummimisel", "Gladimperio",
  "Riesenzahn", "Brüllschweif", "Wutpilz", "Flatterhaar", "Kriechflügel", "Sandfell",
  "Eisenrad", "Eisenbündel", "Eisenhand", "Eisenhals", "Eisenfalter", "Eisendorn",
  "Frospino", "Cryospino", "Espinodon", "Gierspenst", "Monetigo", "Chongjian",
  "Baojian", "Dinglu", "Yuyu", "Donnersichel", "Eisenkrieger", "Koraidon",
  "Miraidon", "Windewoge", "Eisenblatt", "Sirapfel", "Mortcha", "Fatalitcha",
  "Boninu", "Benesaru", "Beatori", "Ogerpon", "Briduradon", "Hydrapfel",
  "Keilflamme", "Furienblitz", "Eisenfels", "Eisenhaupt", "Terapagos", "Infamomo",
];

export function pokemonName(dexNr) {
  return POKEMON_NAMES[dexNr - 1];
}

/* Sprite-URL: lokal im Repo vorgehalten (public/sprites/{dexNr}.png,
   heruntergeladen von PokeAPI/sprites – official-artwork, CC0-Repo,
   Bildinhalte © The Pokémon Company). Macht das Spiel unabhängig von
   PokeAPI/GitHub/jsDelivr-Erreichbarkeit; kein externer Request mehr
   nötig, kein CDN-Ausfall wie bei den zuvor gemeldeten 400-Fehlern. */
export function pokeSpriteUrl(dexNr) {
  return `/sprites/${dexNr}.png`;
}

/* Ausweich-URL über den PokeAPI-Mirror auf jsDelivr, nur als Sicherheitsnetz
   falls eine lokale Datei fehlt/beschädigt ist (z. B. bei manuellem Bearbeiten
   von public/sprites oder einem unvollständigen Checkout). */
export function pokeSpriteFallbackUrl(dexNr) {
  return `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/${dexNr}.png`;
}

/* Legendäre/mythische Pokémon je Generation. Deutlich seltener zu fangen
   als der Rest des Pokédex (siehe LEGENDARY_CATCH_MULTIPLIER). */
export const LEGENDARY_DEX = new Set([
  // Gen 1: die drei Vögel, Mewtu, Mew
  144, 145, 146, 150, 151,
  // Gen 2: Raikou, Entei, Suicune, Lugia, Ho-Oh, Celebi
  243, 244, 245, 249, 250, 251,
  // Gen 3: die Titanen, Latias/Latios, das Wetter-Trio, Jirachi, Deoxys
  377, 378, 379, 380, 381, 382, 383, 384, 385, 386,
  // Gen 4: das Seen-Trio, Dialga, Palkia, Heatran, Regigigas, Giratina,
  // Cresselia, Phione, Manaphy, Darkrai, Shaymin, Arceus
  480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493,
  // Gen 5: Victini, das Schwerter-Trio, das Genie-Trio, Reshiram, Zekrom,
  // Landorus, Kyurem, Keldeo, Meloetta, Genesect
  494, 638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649,
  // Gen 6: Xerneas, Yveltal, Zygarde, Diancie, Hoopa, Volcanion
  716, 717, 718, 719, 720, 721,
  // Gen 7: die vier Tapu, Cosmog-Linie, Necrozma, Magearna, Marshadow,
  // Zeraora, Meltan, Melmetal
  785, 786, 787, 788, 789, 790, 791, 792, 800, 801, 802, 807, 808, 809,
  // Gen 8: Zacian, Zamazenta, Eternatus, Kubfu, Urshifu, Zarude,
  // Regieleki, Regidrago, Glastrier, Spectrier, Calyrex, Enamorus
  888, 889, 890, 891, 892, 893, 894, 895, 896, 897, 898, 905,
  // Gen 9: die Schätze der Verwüstung, Koraidon, Miraidon, die Loyalen
  // Drei, Ogerpon, Terapagos, Pecharunt
  1001, 1002, 1003, 1004, 1007, 1008, 1014, 1015, 1016, 1017, 1024, 1025,
]);

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
    let usedFallback = false;
    img.onerror = () => {
      if (!usedFallback) {
        usedFallback = true;
        img.src = pokeSpriteFallbackUrl(dex);
        return;
      }
      logFailedSprite(dex);
    };
    img.src = pokeSpriteUrl(dex);
  }
}
