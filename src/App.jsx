import React, { useState, useEffect, useRef } from "react";
import { POKEMON_NAMES, pokeSpriteUrl } from "./data/pokemon";
import { CLASS_DEFAULT_SKILLS } from "./data/skills";
import { loadClassSave, loadMeta, saveMeta, createInitialClassSave, migrateLegacySaveIfNeeded } from "./storage";
import { PixelPanel, PokeballIcon } from "./components/PixelUI";
import SkillSettings from "./components/SkillSettings";
import ClassSwitcher from "./components/ClassSwitcher";
import GameScreen from "./GameScreen";

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

  /* --------- Klassenstufe: laden & wechseln, jede Klasse hat einen
     eigenen Spielstand (siehe src/storage.js) --------- */
  const [classLevel, setClassLevel] = useState(() => {
    migrateLegacySaveIfNeeded();
    return loadMeta()?.lastActiveClass ?? 1;
  });
  const [needsOnboarding, setNeedsOnboarding] = useState(() => loadClassSave(classLevel) == null);

  useEffect(() => {
    setNeedsOnboarding(loadClassSave(classLevel) == null);
  }, [classLevel]);

  function switchClass(level) {
    setClassLevel(level);
    saveMeta({ lastActiveClass: level });
  }

  function completeOnboarding(selectedSkillIds, fastAnswerSeconds) {
    createInitialClassSave(classLevel, selectedSkillIds, fastAnswerSeconds);
    setNeedsOnboarding(false);
  }

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
      <div className="w-full max-w-2xl flex flex-col gap-3">
        {needsOnboarding ? (
          <>
            <ClassSwitcher activeClass={classLevel} onSwitch={switchClass} />
            <SkillSettings
              key={classLevel}
              classLevel={classLevel}
              selectedSkillIds={CLASS_DEFAULT_SKILLS[classLevel]}
              mode="onboarding"
              onConfirm={completeOnboarding}
            />
          </>
        ) : (
          <GameScreen key={classLevel} classLevel={classLevel} onSwitchClass={switchClass} />
        )}
      </div>
    </div>
  );
}
