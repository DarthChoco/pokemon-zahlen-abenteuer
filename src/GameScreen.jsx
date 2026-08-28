import React, { useState, useEffect, useMemo, useRef } from "react";
import { POKEMON_NAMES, pokemonName, isLegendary } from "./data/pokemon";
import { REGIONS } from "./data/regions";
import {
  FANG_START_CHANCE,
  FANG_STEP,
  FANG_MAX_CHANCE,
  LEGENDARY_CATCH_MULTIPLIER,
  FAST_ANSWER_BONUS,
  FAST_ANSWER_DEFAULT_SECONDS,
} from "./data/gameplay";
import { SKILLS_BY_ID } from "./data/skills";
import { genQuestionForSkill, genOptions, randInt } from "./logic/questionGenerators";
import { buildRegionSkillPlan, pickSkillForRegion } from "./logic/regionConfig";
import { remainingPool, regionTotal, regionCaughtCount } from "./logic/pokemonPool";
import { loadClassSave, saveClassSave, clearClassSave } from "./storage";
import { PixelPanel, PokeballIcon, PokemonSprite, RegionTile } from "./components/PixelUI";
import SkillSettings from "./components/SkillSettings";
import ClassSwitcher from "./components/ClassSwitcher";

/* Zieht für eine Region (anhand des Skill-Plans) zufällig einen der dort
   freigeschalteten Skills und erzeugt daraus eine konkrete Aufgabe +
   passende Multiple-Choice-Optionen. Gibt null zurück, wenn in der Region
   (noch) kein Skill freigeschaltet ist (z. B. weil gar kein Skill
   ausgewählt wurde). */
function buildQuestion(regionIdx, regionPlan) {
  const skillId = pickSkillForRegion(regionPlan[regionIdx]);
  if (!skillId) return null;
  const skill = SKILLS_BY_ID[skillId];
  const q = genQuestionForSkill(skill);
  return { ...q, skillId, maxRange: skill.maxRange };
}

export default function GameScreen({ classLevel, onSwitchClass }) {
  const savedGame = useState(() => loadClassSave(classLevel))[0];

  const [activeRegionIdx, setActiveRegionIdx] = useState(() => savedGame?.activeRegionIdx ?? 0);
  const [unlockedCount, setUnlockedCount] = useState(() => savedGame?.unlockedCount ?? 1);
  const [regionStreaks, setRegionStreaks] = useState(
    () => savedGame?.regionStreaks ?? REGIONS.map(() => 0)
  );
  const [caughtDex, setCaughtDex] = useState(() => new Set(savedGame?.caughtDex ?? []));

  const [score, setScore] = useState(() => savedGame?.score ?? 0);
  const [fangChance, setFangChance] = useState(() => savedGame?.fangChance ?? FANG_START_CHANCE);
  const [selectedSkillIds, setSelectedSkillIds] = useState(() => savedGame?.selectedSkillIds ?? []);
  const [fastAnswerSeconds, setFastAnswerSeconds] = useState(
    () => savedGame?.fastAnswerSeconds ?? FAST_ANSWER_DEFAULT_SECONDS
  );

  const regionPlan = useMemo(() => buildRegionSkillPlan(selectedSkillIds), [selectedSkillIds]);
  const region = REGIONS[activeRegionIdx];

  const [question, setQuestion] = useState(() => buildQuestion(activeRegionIdx, regionPlan));
  const [options, setOptions] = useState(() => (question ? genOptions(question.answer, question.maxRange) : []));

  const [phase, setPhase] = useState("question"); // question | feedback | encounter | result
  const [feedback, setFeedback] = useState(null);
  const [encounterDex, setEncounterDex] = useState(null);
  const [catchResult, setCatchResult] = useState(null); // "caught" | "fled"
  const [fastBonusApplied, setFastBonusApplied] = useState(false);
  const [locked, setLocked] = useState(false);

  const [totalAnswered, setTotalAnswered] = useState(() => savedGame?.totalAnswered ?? 0);
  const [totalCorrect, setTotalCorrect] = useState(() => savedGame?.totalCorrect ?? 0);
  const [regionUpMsg, setRegionUpMsg] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [showDex, setShowDex] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

  // Bei jeder relevanten Änderung den Spielstand dieser Klassenstufe sichern.
  useEffect(() => {
    saveClassSave(classLevel, {
      activeRegionIdx,
      unlockedCount,
      regionStreaks,
      caughtDex: Array.from(caughtDex),
      score,
      fangChance,
      totalAnswered,
      totalCorrect,
      selectedSkillIds,
      fastAnswerSeconds,
    });
  }, [
    classLevel,
    activeRegionIdx,
    unlockedCount,
    regionStreaks,
    caughtDex,
    score,
    fangChance,
    totalAnswered,
    totalCorrect,
    selectedSkillIds,
    fastAnswerSeconds,
  ]);

  // Wenn sich die Skill-Auswahl ändert (über die Einstellungen), sofort eine
  // neue, zur neuen Auswahl passende Frage ziehen. Beim allerersten Rendern
  // nicht auslösen, da die Startfrage schon per useState-Initializer steht.
  const skillEffectRanOnce = useRef(false);
  useEffect(() => {
    if (!skillEffectRanOnce.current) {
      skillEffectRanOnce.current = true;
      return;
    }
    startNextQuestion(activeRegionIdx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSkillIds]);

  const totalCaught = caughtDex.size;

  // Erhöht sich bei jedem startNextQuestion(). Laufende handleAnswer-Timeouts
  // (Feedback -> Encounter -> Fangversuch) prüfen ihren mitgeführten Stand
  // dagegen und brechen ab, falls inzwischen z. B. per Karte/Fertigkeiten
  // eine neue Frage gestartet wurde – sonst würde eine verspätet
  // ausgelöste Encounter/Ergebnis-Anzeige die längst neue Frage überschreiben.
  const sequenceRef = useRef(0);

  // Zeitpunkt, seit dem die aktuelle Frage angezeigt wird – für den
  // Fangbonus bei schnellen richtigen Antworten (siehe handleAnswer).
  const questionShownAtRef = useRef(Date.now());

  function startNextQuestion(regionIdx) {
    sequenceRef.current += 1;
    questionShownAtRef.current = Date.now();
    const q = buildQuestion(regionIdx, regionPlan);
    setQuestion(q);
    setOptions(q ? genOptions(q.answer, q.maxRange) : []);
    setPhase("question");
    setFeedback(null);
    setEncounterDex(null);
    setCatchResult(null);
    setFastBonusApplied(false);
    setLocked(false);
  }

  function switchRegion(idx) {
    if (idx >= unlockedCount) return;
    setActiveRegionIdx(idx);
    startNextQuestion(idx);
    setShowMap(false);
  }

  function goToNewRegion(idx) {
    switchRegion(idx);
    setRegionUpMsg(null);
  }

  function changeSkillSelection(newIds, newFastAnswerSeconds) {
    setSelectedSkillIds(newIds);
    setFastAnswerSeconds(newFastAnswerSeconds);
    setRegionStreaks((prev) => {
      const next = [...prev];
      next[activeRegionIdx] = 0;
      return next;
    });
    setShowSettings(false);
  }

  function handleAnswer(opt) {
    if (locked || !question) return;
    setLocked(true);
    const correct = opt === question.answer;
    const answeredFast = correct && Date.now() - questionShownAtRef.current <= fastAnswerSeconds * 1000;
    setFeedback({ correct, chosen: opt });
    setPhase("feedback");
    setTotalAnswered((n) => n + 1);
    const mySeq = sequenceRef.current;

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
        // Regions-Freischaltung prüfen: nur wenn aktuell höchste Region –
        // gilt unabhängig davon, ob der Spieler inzwischen weitergeklickt hat.
        const isHighest = activeRegionIdx === unlockedCount - 1;
        if (isHighest && newStreak >= region.needed && unlockedCount < REGIONS.length) {
          setUnlockedCount((c) => c + 1);
          setRegionStreaks((prev) => {
            const next = [...prev];
            next[activeRegionIdx] = 0;
            return next;
          });
          setRegionUpMsg(REGIONS[unlockedCount] ? { idx: unlockedCount, name: REGIONS[unlockedCount].name } : null);
        }
        // Ab hier nur noch weitermachen, wenn zwischenzeitlich keine neue
        // Frage gestartet wurde (z. B. durch Regionswechsel).
        if (sequenceRef.current !== mySeq) return;
        // Encounter starten
        const pool = remainingPool(region, caughtDex);
        if (pool.length === 0) {
          // Region leer gefangen -> kein Encounter, direkt weiter
          setTimeout(() => {
            if (sequenceRef.current === mySeq) startNextQuestion(activeRegionIdx);
          }, 700);
          return;
        }
        const dex = pool[randInt(0, pool.length - 1)];
        setEncounterDex(dex);
        setFastBonusApplied(answeredFast);
        setPhase("encounter");

        setTimeout(() => {
          if (sequenceRef.current !== mySeq) return;
          const legendary = isLegendary(dex);
          let effectiveChance = legendary ? fangChance * LEGENDARY_CATCH_MULTIPLIER : fangChance;
          if (answeredFast) effectiveChance += FAST_ANSWER_BONUS;
          effectiveChance = Math.min(100, effectiveChance);
          const roll = Math.random() * 100;
          const success = roll < effectiveChance;
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
        setTimeout(() => {
          if (sequenceRef.current === mySeq) startNextQuestion(activeRegionIdx);
        }, 800);
      }
    }, 900);
  }

  function requestRestart() {
    setShowRestartConfirm(true);
  }

  function confirmRestart() {
    clearClassSave(classLevel);
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
  const encounterIsLegendary = encounterDex ? isLegendary(encounterDex) : false;

  return (
    <>
      <div className="w-full flex flex-col gap-3">
        {/* Kopfzeile */}
        <PixelPanel className="p-3 flex flex-wrap items-center justify-between gap-3" style={{ background: "#e3350d" }}>
          <div className="flex items-center gap-3">
            <PokeballIcon size={34} />
            <div>
              <div className="text-xl font-extrabold tracking-widest text-white">POKÉ-ZAHLEN</div>
              <div className="text-sm font-bold text-white">
                Klasse {classLevel} · {region.name}
                {!isHighestRegion && " (Nachfang-Modus)"}
              </div>
            </div>
          </div>
          <div className="flex items-center flex-wrap justify-end gap-2">
            <div className="text-right text-white mr-2">
              <div className="text-lg font-extrabold">{score} Punkte</div>
              <div className="text-xs">Pokédex: {totalCaught}/151</div>
            </div>
            <button
              onClick={() => {
                setShowMap((s) => !s);
                setShowDex(false);
                setShowSettings(false);
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
                setShowSettings(false);
              }}
              className="border-4 border-black px-3 py-2 font-bold text-sm"
              style={{ background: "#ffffff", color: "#1a1a1a" }}
            >
              📖 Pokédex
            </button>
            <button
              onClick={() => {
                setShowSettings((s) => !s);
                setShowMap(false);
                setShowDex(false);
              }}
              className="border-4 border-black px-3 py-2 font-bold text-sm"
              style={{ background: "#ffffff", color: "#1a1a1a" }}
            >
              ⚙️ Fertigkeiten
            </button>
          </div>
        </PixelPanel>

        {/* Fertigkeiten-Einstellungen */}
        {showSettings && (
          <div className="flex flex-col gap-3">
            <ClassSwitcher activeClass={classLevel} onSwitch={onSwitchClass} />
            <SkillSettings
              classLevel={classLevel}
              selectedSkillIds={selectedSkillIds}
              fastAnswerSeconds={fastAnswerSeconds}
              mode="settings"
              onConfirm={changeSkillSelection}
              onCancel={() => setShowSettings(false)}
            />
          </div>
        )}

        {/* Pokédex */}
        {showDex && (
          <PixelPanel className="p-3" style={{ background: "#ffffff" }}>
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
          <PixelPanel className="p-3" style={{ background: "#ffffff" }}>
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
        <PixelPanel className="p-2" style={{ background: "#ffffff" }}>
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
          <PixelPanel className="p-4 text-center" style={{ background: "#ffcb05" }}>
            <div className="font-extrabold text-lg mb-3" style={{ color: "#1a1a1a" }}>
              🎉 Neue Region freigeschaltet: „{regionUpMsg.name}"!
            </div>
            <div className="flex gap-2 justify-center flex-wrap">
              <button
                onClick={() => setRegionUpMsg(null)}
                className="border-4 border-black px-4 py-2 font-bold text-sm"
                style={{ background: "#ffffff", color: "#1a1a1a" }}
              >
                Hier bleiben
              </button>
              <button
                onClick={() => goToNewRegion(regionUpMsg.idx)}
                className="border-4 border-black px-4 py-2 font-extrabold text-sm"
                style={{ background: "#e3350d", color: "#fff" }}
              >
                Los geht's ▶
              </button>
            </div>
          </PixelPanel>
        )}

        {/* Frage / Encounter / Ergebnis */}
        <PixelPanel className="p-6 text-center" style={{ background: "#ffffff" }}>
          {!question && (
            <div className="font-bold text-sm" style={{ color: "#e3350d" }}>
              Bitte wähle über „⚙️ Fertigkeiten" mindestens eine Rechenfertigkeit aus.
            </div>
          )}
          {question && (phase === "question" || phase === "feedback") && (
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
              {encounterIsLegendary && (
                <div className="text-sm font-extrabold mb-2" style={{ color: "#e3350d" }}>
                  ⭐ Legendär! Deutlich schwerer zu fangen …
                </div>
              )}
              {fastBonusApplied && (
                <div className="text-sm font-extrabold mb-2" style={{ color: "#1a9c4a" }}>
                  ⚡ Blitzschnell! +{FAST_ANSWER_BONUS}% Fangchance
                </div>
              )}
              <div
                className="mx-auto mb-2 flex items-center justify-center border-4 border-black"
                style={{ width: 120, height: 120, background: "#f0f0f0" }}
              >
                <PokemonSprite dex={encounterDex} size={100} silhouette />
              </div>
              <div className="text-sm font-bold" style={{ color: "#555" }}>
                Fangversuch läuft …
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
              {fastBonusApplied && (
                <div className="text-xs font-extrabold mb-1" style={{ color: "#1a9c4a" }}>
                  ⚡ Blitzschnell-Bonus war aktiv
                </div>
              )}
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
                    {pokemonName(encounterDex)} ist geflohen.
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
        {question && (phase === "question" || phase === "feedback") && (
          <div className="grid grid-cols-4 gap-2">
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
              Pokémon – geht dabei verloren. Deine gewählten Fertigkeiten bleiben erhalten.
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
    </>
  );
}
