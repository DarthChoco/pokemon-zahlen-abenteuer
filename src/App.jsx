import React, { useState, useEffect, useRef } from "react";

/* ======================================================================
   POKÉMON-DATEN (Gen 1, #1–151, deutsche Namen)
   ====================================================================== */

const POKEMON_NAMES = [
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

function pokemonName(dexNr) {
  return POKEMON_NAMES[dexNr - 1];
}

/* Öffentliche Sprite-URL von PokeAPI (nach Dex-Nummer).
   Bewusst nur EINE Auflösung pro Pokémon, damit beim Vorladen
   jedes Sprite nur einmal heruntergeladen werden muss. */
function pokeSpriteUrl(dexNr) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${dexNr}.png`;
}

/* ======================================================================
   REGIONEN-KONFIGURATION
   10 Regionen, Pokédex-Nr. 1–151 aufsteigend verteilt.
   ====================================================================== */

const REGIONS = [
  { name: "Route 1", mathType: "nocarry", dexStart: 1, dexEnd: 15, maxRange: 20, needed: 10 },
  { name: "Viridian-Wald", mathType: "carry", dexStart: 16, dexEnd: 30, maxRange: 20, needed: 10 },
  { name: "Digda-Höhle", mathType: "carry", dexStart: 31, dexEnd: 45, maxRange: 20, needed: 10 },
  { name: "Route 3 & 4", mathType: "carry", dexStart: 46, dexEnd: 60, maxRange: 20, needed: 10 },
  { name: "Kraftwerk", mathType: "carry", dexStart: 61, dexEnd: 75, maxRange: 20, needed: 10 },
  { name: "Pokémon-Turm", mathType: "carry", dexStart: 76, dexEnd: 90, maxRange: 20, needed: 10 },
  { name: "Silph Co.", mathType: "carry", dexStart: 91, dexEnd: 105, maxRange: 20, needed: 10 },
  { name: "Safari-Zone", mathType: "carry", dexStart: 106, dexEnd: 120, maxRange: 20, needed: 10 },
  { name: "Cinnabar-Inseln", mathType: "carry", dexStart: 121, dexEnd: 135, maxRange: 20, needed: 10 },
  { name: "Siegesstraße", mathType: "carry", dexStart: 136, dexEnd: 151, maxRange: 20, needed: 10 },
];

const FANG_START_CHANCE = 30; // %
const FANG_STEP = 15; // % pro Fehlversuch
const FANG_MAX_CHANCE = 95; // Deckel, damit nie 100% garantiert sind

/* ======================================================================
   HILFSFUNKTIONEN
   ====================================================================== */

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Aufgaben 1–20 OHNE Zehnerübergang */
function genQuestionNoCarry() {
  const isAdd = Math.random() < 0.5;
  if (isAdd) {
    let a, b;
    do {
      a = randInt(10, 18);
      b = randInt(1, 9);
    } while (a % 10 === 0 || (a % 10) + b > 9);
    return { a, b, op: "+", answer: a + b, key: `+${a}+${b}` };
  } else {
    let a, b;
    do {
      a = randInt(11, 19);
      b = randInt(1, 9);
    } while (b > a % 10);
    return { a, b, op: "−", answer: a - b, key: `-${a}-${b}` };
  }
}

/* Aufgaben MIT Zehnerübergang */
function genQuestionCarry() {
  const isAdd = Math.random() < 0.5;
  if (isAdd) {
    let u1, u2;
    do {
      u1 = randInt(1, 9);
      u2 = randInt(1, 9);
    } while (u1 + u2 < 10);
    const a = u1;
    const b = u2;
    return { a, b, op: "+", answer: a + b, key: `+${a}+${b}` };
  } else {
    let uA, uB;
    do {
      uA = randInt(0, 9);
      uB = randInt(1, 9);
    } while (uB <= uA);
    const tA = randInt(1, 1);
    const a = tA * 10 + uA;
    const b = uB;
    return { a, b, op: "−", answer: a - b, key: `-${a}-${b}` };
  }
}

function genQuestion(region) {
  return region.mathType === "nocarry" ? genQuestionNoCarry() : genQuestionCarry();
}

function genOptions(answer, maxRange) {
  const pool = new Set([answer]);
  const nearOffsets = shuffle([-1, 1, -2, 2, -3, 3, -4, 4, -5, 5]);
  for (const d of nearOffsets) {
    if (pool.size >= 8) break;
    const v = answer + d;
    if (v >= 0 && v <= maxRange && !pool.has(v)) pool.add(v);
  }
  let radius = 6;
  let guard = 0;
  while (pool.size < 8 && guard < 200) {
    for (const d of shuffle([radius, -radius])) {
      if (pool.size >= 8) break;
      const v = answer + d;
      if (v >= 0 && v <= maxRange && !pool.has(v)) pool.add(v);
    }
    radius++;
    guard++;
  }
  return shuffle(Array.from(pool));
}

/* Verbleibender Pokémon-Pool einer Region (noch nicht gefangene Dex-Nr.) */
function remainingPool(region, caughtDex) {
  const list = [];
  for (let n = region.dexStart; n <= region.dexEnd; n++) {
    if (!caughtDex.has(n)) list.push(n);
  }
  return list;
}
function regionTotal(region) {
  return region.dexEnd - region.dexStart + 1;
}
function regionCaughtCount(region, caughtDex) {
  let c = 0;
  for (let n = region.dexStart; n <= region.dexEnd; n++) if (caughtDex.has(n)) c++;
  return c;
}

/* ======================================================================
   PIXEL / POKÉBALL-BAUSTEINE
   ====================================================================== */

function PixelPanel({ children, style, className = "" }) {
  return (
    <div
      className={`border-4 border-black ${className}`}
      style={{
        boxShadow: "inset 0 0 0 3px rgba(255,255,255,0.35), inset 0 -6px 0 rgba(0,0,0,0.15)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function PokeballIcon({ size = 28 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: "3px solid #1a1a1a",
        background:
          "linear-gradient(#e3350d 0%, #e3350d 46%, #1a1a1a 46%, #1a1a1a 54%, #ffffff 54%, #ffffff 100%)",
        position: "relative",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: size * 0.32,
          height: size * 0.32,
          borderRadius: "50%",
          background: "#ffffff",
          border: "2px solid #1a1a1a",
        }}
      />
    </div>
  );
}

/* Pokémon-Sprite, optional als Silhouette (dunkel eingefärbt)
   solange das Pokémon noch nicht bekannt/gefangen ist */
function PokemonSprite({ dex, size = 96, silhouette = false, alt }) {
  return (
    <img
      src={pokeSpriteUrl(dex)}
      alt={alt || (silhouette ? "Unbekanntes Pokémon" : pokemonName(dex))}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        filter: silhouette ? "brightness(0)" : "none",
        opacity: silhouette ? 0.88 : 1,
      }}
    />
  );
}

/* Regions-Kachel für die Map */
function RegionTile({ region, index, status, caughtCount, total, active, onClick }) {
  const locked = status === "locked";
  let bg = "#ffffff";
  let border = "#1a1a1a";
  let label = "";
  if (locked) {
    bg = "#c9c9c9";
    label = "🔒";
  } else if (status === "complete") {
    bg = "#fff6d8";
    border = "#e3350d";
    label = "✅";
  } else {
    bg = "#ffffff";
    label = "🟡";
  }
  return (
    <button
      onClick={locked ? undefined : onClick}
      disabled={locked}
      className="border-4 p-2 text-left"
      style={{
        borderColor: active ? "#e3350d" : border,
        background: bg,
        cursor: locked ? "not-allowed" : "pointer",
        boxShadow: active ? "inset 0 0 0 3px #ffcb05" : "none",
        opacity: locked ? 0.75 : 1,
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-extrabold" style={{ color: "#1a1a1a" }}>
          {index + 1}. {region.name}
        </span>
        <span>{active ? "▶️" : label}</span>
      </div>
      {!locked && (
        <div className="text-[10px] font-bold" style={{ color: "#555" }}>
          {caughtCount}/{total} gefangen
        </div>
      )}
    </button>
  );
}

/* ======================================================================
   HAUPTKOMPONENTE
   ====================================================================== */

export default function PokemonZahlenAbenteuer() {
  /* --------- Sprite-Vorladen: alle 151 Bilder einmal laden,
     damit das Spiel auch bei Internet-Abbruch weiterläuft --------- */
  const [preloadedCount, setPreloadedCount] = useState(0);
  const [preloadFailed, setPreloadFailed] = useState(0);
  const [preloadReady, setPreloadReady] = useState(false);
  const processedRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    for (let dex = 1; dex <= POKEMON_NAMES.length; dex++) {
      const img = new Image();
      img.onload = () => {
        if (cancelled) return;
        processedRef.current += 1;
        setPreloadedCount((n) => n + 1);
        if (processedRef.current >= POKEMON_NAMES.length) setPreloadReady(true);
      };
      img.onerror = () => {
        if (cancelled) return;
        processedRef.current += 1;
        setPreloadFailed((n) => n + 1);
        if (processedRef.current >= POKEMON_NAMES.length) setPreloadReady(true);
      };
      img.src = pokeSpriteUrl(dex);
    }
    return () => {
      cancelled = true;
    };
  }, []);


  const [activeRegionIdx, setActiveRegionIdx] = useState(0);
  const [unlockedCount, setUnlockedCount] = useState(1);
  const [regionStreaks, setRegionStreaks] = useState(() => REGIONS.map(() => 0));
  const [caughtDex, setCaughtDex] = useState(() => new Set());

  const [score, setScore] = useState(0);
  const [fangChance, setFangChance] = useState(FANG_START_CHANCE);

  const region = REGIONS[activeRegionIdx];
  const [question, setQuestion] = useState(() => genQuestion(REGIONS[0]));
  const [options, setOptions] = useState(() => genOptions(question.answer, REGIONS[0].maxRange));

  const [phase, setPhase] = useState("question"); // question | feedback | encounter | result
  const [feedback, setFeedback] = useState(null);
  const [encounterDex, setEncounterDex] = useState(null);
  const [catchResult, setCatchResult] = useState(null); // "caught" | "fled"
  const [locked, setLocked] = useState(false);

  const [totalAnswered, setTotalAnswered] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [regionUpMsg, setRegionUpMsg] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [showDex, setShowDex] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

  const totalCaught = caughtDex.size;

  function startNextQuestion(regionIdx) {
    const r = REGIONS[regionIdx];
    const q = genQuestion(r);
    setQuestion(q);
    setOptions(genOptions(q.answer, r.maxRange));
    setPhase("question");
    setFeedback(null);
    setEncounterDex(null);
    setCatchResult(null);
    setLocked(false);
  }

  function switchRegion(idx) {
    if (idx >= unlockedCount) return;
    setActiveRegionIdx(idx);
    startNextQuestion(idx);
    setShowMap(false);
  }

  function handleAnswer(opt) {
    if (locked) return;
    setLocked(true);
    const correct = opt === question.answer;
    setFeedback({ correct, chosen: opt });
    setPhase("feedback");
    setTotalAnswered((n) => n + 1);

    let newScore = score;
    let newStreak = regionStreaks[activeRegionIdx];

    if (correct) {
      newScore = score + 10;
      newStreak = newStreak + 1;
      setTotalCorrect((n) => n + 1);
    } else {
      newScore = Math.max(0, score - 5);
      newStreak = 0;
    }
    setScore(newScore);
    setRegionStreaks((prev) => {
      const next = [...prev];
      next[activeRegionIdx] = newStreak;
      return next;
    });

    setTimeout(() => {
      if (correct) {
        // Regions-Freischaltung prüfen: nur wenn aktuell höchste Region
        const isHighest = activeRegionIdx === unlockedCount - 1;
        if (isHighest && newStreak >= region.needed && unlockedCount < REGIONS.length) {
          setUnlockedCount((c) => c + 1);
          setRegionStreaks((prev) => {
            const next = [...prev];
            next[activeRegionIdx] = 0;
            return next;
          });
          setRegionUpMsg(REGIONS[unlockedCount] ? REGIONS[unlockedCount].name : null);
          setTimeout(() => setRegionUpMsg(null), 2200);
        }
        // Encounter starten
        const pool = remainingPool(region, caughtDex);
        if (pool.length === 0) {
          // Region leer gefangen -> kein Encounter, direkt weiter
          setTimeout(() => startNextQuestion(activeRegionIdx), 700);
          return;
        }
        const dex = pool[randInt(0, pool.length - 1)];
        setEncounterDex(dex);
        setPhase("encounter");

        setTimeout(() => {
          const roll = Math.random() * 100;
          const success = roll < fangChance;
          if (success) {
            setCaughtDex((prev) => new Set(prev).add(dex));
            setFangChance(FANG_START_CHANCE);
            setCatchResult("caught");
          } else {
            setFangChance((c) => Math.min(FANG_MAX_CHANCE, c + FANG_STEP));
            setCatchResult("fled");
          }
          setPhase("result");
          // Kein Auto-Weiter mehr: Ergebnis bleibt stehen, bis "Weiter" geklickt wird.
        }, 1000);
      } else {
        setTimeout(() => startNextQuestion(activeRegionIdx), 800);
      }
    }, 900);
  }

  function requestRestart() {
    setShowRestartConfirm(true);
  }

  function confirmRestart() {
    setActiveRegionIdx(0);
    setUnlockedCount(1);
    setRegionStreaks(REGIONS.map(() => 0));
    setCaughtDex(new Set());
    setScore(0);
    setFangChance(FANG_START_CHANCE);
    setTotalAnswered(0);
    setTotalCorrect(0);
    setShowRestartConfirm(false);
    startNextQuestion(0);
  }

  function cancelRestart() {
    setShowRestartConfirm(false);
  }

  const streak = regionStreaks[activeRegionIdx];
  const progressPct = Math.min(100, (streak / (region.needed || 1)) * 100);
  const isHighestRegion = activeRegionIdx === unlockedCount - 1;

  /* --------- Ladebildschirm, solange Sprites vorgeladen werden --------- */
  if (!preloadReady) {
    const total = POKEMON_NAMES.length;
    const pct = Math.round((preloadedCount / total) * 100);
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center p-4"
        style={{ background: "#f4f4f4", fontFamily: "monospace" }}
      >
        <PixelPanel className="p-6 max-w-sm w-full text-center" style={{ background: "#ffffff" }}>
          <div className="flex justify-center mb-3">
            <PokeballIcon size={48} />
          </div>
          <div className="text-lg font-extrabold mb-2" style={{ color: "#1a1a1a" }}>
            Pokémon-Sprites werden geladen …
          </div>
          <div className="h-4 border-4 border-black mb-2" style={{ background: "#eee" }}>
            <div
              className="h-full"
              style={{ width: `${pct}%`, background: "#e3350d", transition: "width .2s" }}
            />
          </div>
          <div className="text-sm font-bold" style={{ color: "#555" }}>
            {preloadedCount}/{total} geladen
          </div>
          {preloadFailed > 0 && (
            <div className="text-xs font-bold mt-2" style={{ color: "#e3350d" }}>
              {preloadFailed} Sprite(s) konnten nicht geladen werden – Spiel startet trotzdem.
            </div>
          )}
        </PixelPanel>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{ background: "#f4f4f4", fontFamily: "monospace" }}
    >
      <div className="w-full max-w-2xl">
        {/* Kopfzeile */}
        <PixelPanel className="p-3 mb-3 flex flex-wrap items-center justify-between gap-3" style={{ background: "#e3350d" }}>
          <div className="flex items-center gap-3">
            <PokeballIcon size={34} />
            <div>
              <div className="text-xl font-extrabold tracking-widest text-white">POKÉ-ZAHLEN</div>
              <div className="text-sm font-bold text-white">
                {region.name}
                {!isHighestRegion && " (Nachfang-Modus)"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-white">
              <div className="text-lg font-extrabold">{score} Punkte</div>
              <div className="text-xs">Pokédex: {totalCaught}/151</div>
            </div>
            <button
              onClick={() => {
                setShowMap((s) => !s);
                setShowDex(false);
              }}
              className="border-4 border-black px-3 py-2 font-bold text-sm"
              style={{ background: "#ffcb05", color: "#1a1a1a" }}
            >
              🗺️ Karte
            </button>
            <button
              onClick={() => {
                setShowDex((s) => !s);
                setShowMap(false);
              }}
              className="border-4 border-black px-3 py-2 font-bold text-sm"
              style={{ background: "#ffffff", color: "#1a1a1a" }}
            >
              📖 Pokédex
            </button>
          </div>
        </PixelPanel>

        {/* Pokédex */}
        {showDex && (
          <PixelPanel className="p-3 mb-3" style={{ background: "#ffffff" }}>
            <div className="font-extrabold mb-2 text-sm" style={{ color: "#1a1a1a" }}>
              Pokédex – {totalCaught}/151 gefangen
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1 max-h-96 overflow-y-auto pr-1">
              {POKEMON_NAMES.map((name, i) => {
                const dex = i + 1;
                const caught = caughtDex.has(dex);
                return (
                  <div
                    key={dex}
                    className="border-2 border-black flex flex-col items-center justify-center py-1 px-1 text-center"
                    style={{
                      background: caught ? "#fff6d8" : "#e8e8e8",
                      minHeight: 78,
                    }}
                  >
                    <PokemonSprite dex={dex} size={40} silhouette={!caught} />
                    <div className="text-[10px] font-bold" style={{ color: "#888" }}>
                      #{dex}
                    </div>
                    <div
                      className="text-[11px] font-extrabold leading-tight"
                      style={{ color: caught ? "#1a1a1a" : "#aaa" }}
                    >
                      {caught ? name : "?"}
                    </div>
                  </div>
                );
              })}
            </div>
          </PixelPanel>
        )}

        {/* Karte */}
        {showMap && (
          <PixelPanel className="p-3 mb-3" style={{ background: "#ffffff" }}>
            <div className="font-extrabold mb-2 text-sm" style={{ color: "#1a1a1a" }}>
              Kanto-Karte – wähle eine freigeschaltete Region
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {REGIONS.map((r, i) => {
                const locked = i >= unlockedCount;
                const caught = regionCaughtCount(r, caughtDex);
                const total = regionTotal(r);
                const complete = !locked && caught === total;
                return (
                  <RegionTile
                    key={i}
                    region={r}
                    index={i}
                    status={locked ? "locked" : complete ? "complete" : "open"}
                    caughtCount={caught}
                    total={total}
                    active={i === activeRegionIdx}
                    onClick={() => switchRegion(i)}
                  />
                );
              })}
            </div>
          </PixelPanel>
        )}

        {/* Region-Fortschritt (nur relevant für höchste Region) */}
        <PixelPanel className="p-2 mb-3" style={{ background: "#ffffff" }}>
          <div className="flex justify-between text-xs font-bold mb-1" style={{ color: "#1a1a1a" }}>
            <span>{isHighestRegion ? "Fortschritt zur nächsten Region" : "Serie in dieser Region"}</span>
            <span>{streak}/{region.needed} richtig</span>
          </div>
          <div className="h-4 border-4 border-black" style={{ background: "#eee" }}>
            <div
              className="h-full"
              style={{ width: `${progressPct}%`, background: "#e3350d", transition: "width .3s" }}
            />
          </div>
        </PixelPanel>

        {regionUpMsg && (
          <div
            className="text-center font-extrabold text-lg mb-3 p-2 border-4 border-black"
            style={{ background: "#ffcb05", color: "#1a1a1a" }}
          >
            🎉 Neue Region freigeschaltet: „{regionUpMsg}"!
          </div>
        )}

        {/* Frage / Encounter / Ergebnis */}
        <PixelPanel className="p-6 mb-3 text-center" style={{ background: "#ffffff" }}>
          {(phase === "question" || phase === "feedback") && (
            <>
              <div className="text-4xl font-extrabold" style={{ color: "#1a1a1a" }}>
                {question.a} {question.op} {question.b} = ?
              </div>
              {feedback && (
                <div
                  className="mt-3 font-extrabold text-lg"
                  style={{ color: feedback.correct ? "#1a9c4a" : "#e3350d" }}
                >
                  {feedback.correct
                    ? "✅ Richtig! +10 Punkte"
                    : `❌ Falsch! Richtig wäre ${question.answer}. −5 Punkte`}
                </div>
              )}
            </>
          )}
          {phase === "encounter" && encounterDex && (
            <div>
              <div className="text-lg font-bold mb-2" style={{ color: "#1a1a1a" }}>
                Ein wildes Pokémon erscheint …
              </div>
              <div
                className="mx-auto mb-2 flex items-center justify-center border-4 border-black"
                style={{ width: 120, height: 120, background: "#f0f0f0" }}
              >
                <PokemonSprite dex={encounterDex} size={100} silhouette />
              </div>
              <div className="text-sm font-bold" style={{ color: "#555" }}>
                Fangversuch läuft … ({fangChance}% Chance)
              </div>
            </div>
          )}
          {phase === "result" && encounterDex && (
            <div>
              <div
                className="mx-auto mb-2 flex items-center justify-center border-4 border-black"
                style={{
                  width: 120,
                  height: 120,
                  background: catchResult === "caught" ? "#eafff0" : "#fff0ee",
                }}
              >
                <PokemonSprite dex={encounterDex} size={100} />
              </div>
              {catchResult === "caught" ? (
                <>
                  <div className="text-2xl font-extrabold mb-1" style={{ color: "#1a9c4a" }}>
                    🎉 Gefangen!
                  </div>
                  <div className="text-lg font-bold" style={{ color: "#1a1a1a" }}>
                    {pokemonName(encounterDex)} (#{encounterDex}) ist jetzt in deinem Pokédex!
                  </div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-extrabold mb-1" style={{ color: "#e3350d" }}>
                    💨 Entkommen!
                  </div>
                  <div className="text-lg font-bold" style={{ color: "#1a1a1a" }}>
                    {pokemonName(encounterDex)} ist geflohen. Nächster Versuch: {fangChance}% Chance.
                  </div>
                </>
              )}
              <button
                onClick={() => startNextQuestion(activeRegionIdx)}
                className="mt-4 border-4 border-black px-5 py-2 font-extrabold text-sm"
                style={{ background: "#ffcb05", color: "#1a1a1a" }}
              >
                Weiter ▶
              </button>
            </div>
          )}
        </PixelPanel>

        {/* Antwortoptionen */}
        {(phase === "question" || phase === "feedback") && (
          <div className="grid grid-cols-4 gap-2 mb-3">
            {options.map((opt, i) => {
              let bg = "#ffffff";
              let color = "#1a1a1a";
              if (feedback) {
                if (opt === question.answer) {
                  bg = "#1a9c4a";
                  color = "#fff";
                } else if (opt === feedback.chosen) {
                  bg = "#e3350d";
                  color = "#fff";
                }
              }
              return (
                <button
                  key={i}
                  disabled={locked}
                  onClick={() => handleAnswer(opt)}
                  className="border-4 border-black font-extrabold text-xl py-4"
                  style={{ background: bg, color, cursor: locked ? "default" : "pointer" }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {/* Fußzeile */}
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="text-xs font-bold" style={{ color: "#1a1a1a" }}>
            {totalCorrect}/{totalAnswered} richtig · Fangchance aktuell: {fangChance}%
          </div>
          <button
            onClick={requestRestart}
            className="border-4 border-black px-3 py-1 font-bold text-sm"
            style={{ background: "#1a1a1a", color: "#fff" }}
          >
            🔄 Neu starten
          </button>
        </div>
      </div>

      {/* Restart-Bestätigung */}
      {showRestartConfirm && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.55)" }}
        >
          <PixelPanel className="p-5 max-w-sm w-full text-center" style={{ background: "#ffffff" }}>
            <div className="text-lg font-extrabold mb-2" style={{ color: "#e3350d" }}>
              Wirklich neu starten?
            </div>
            <div className="text-sm font-bold mb-4" style={{ color: "#1a1a1a" }}>
              Dein gesamter Fortschritt – Punkte, freigeschaltete Regionen und alle gefangenen
              Pokémon – geht dabei verloren.
            </div>
            <div className="flex gap-2 justify-center">
              <button
                onClick={cancelRestart}
                className="border-4 border-black px-4 py-2 font-bold text-sm"
                style={{ background: "#ffffff", color: "#1a1a1a" }}
              >
                Abbrechen
              </button>
              <button
                onClick={confirmRestart}
                className="border-4 border-black px-4 py-2 font-extrabold text-sm"
                style={{ background: "#e3350d", color: "#fff" }}
              >
                Ja, neu starten
              </button>
            </div>
          </PixelPanel>
        </div>
      )}
    </div>
  );
}
