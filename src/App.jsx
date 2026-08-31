import React, { useState, useEffect, useRef } from "react";
import { pokeSpriteUrl, pokeSpriteFallbackUrl } from "./data/pokemon";
import { DEFAULT_SKILLS } from "./data/skills";
import { getUnlockedGenerations, totalDexAcross } from "./logic/generations";
import { loadSave, createInitialSave } from "./storage";
import { logFailedSprite } from "./debug";
import { PixelPanel, PokeballIcon } from "./components/PixelUI";
import SkillSettings from "./components/SkillSettings";
import GameScreen from "./GameScreen";

/* Beim Erststart (kein Save) wird nur Gen 1 vorgeladen; bei einem
   bestehenden Save nur die darin bereits freigeschalteten Generationen –
   so bleibt der Erststart schnell, spätere Starts laden trotzdem alle
   bereits bekannten Sprites vor. */
function preloadRangeForSave(save) {
  const caughtDex = new Set(save?.caughtDex ?? []);
  const unlocked = getUnlockedGenerations(caughtDex);
  return { generations: unlocked, total: totalDexAcross(unlocked) };
}

export default function PokemonZahlenAbenteuer() {
  const initialSaveRef = useRef();
  if (initialSaveRef.current === undefined) initialSaveRef.current = loadSave();
  const preload = preloadRangeForSave(initialSaveRef.current);

  /* --------- Sprite-Vorladen: Sprites der freigeschalteten Generation(en)
     einmal laden, damit das Spiel auch bei Internet-Abbruch weiterläuft --------- */
  const [preloadedCount, setPreloadedCount] = useState(0);
  const [preloadFailedDex, setPreloadFailedDex] = useState([]);
  const [preloadReady, setPreloadReady] = useState(false);
  const processedRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    for (const gen of preload.generations) {
      for (let dex = gen.dexStart; dex <= gen.dexEnd; dex++) {
        const img = new Image();
        let usedFallback = false;
        img.onload = () => {
          if (cancelled) return;
          processedRef.current += 1;
          setPreloadedCount((n) => n + 1);
          if (processedRef.current >= preload.total) setPreloadReady(true);
        };
        img.onerror = () => {
          if (cancelled) return;
          if (!usedFallback) {
            usedFallback = true;
            img.src = pokeSpriteFallbackUrl(dex);
            return;
          }
          processedRef.current += 1;
          logFailedSprite(dex);
          setPreloadFailedDex((prev) => [...prev, dex]);
          if (processedRef.current >= preload.total) setPreloadReady(true);
        };
        img.src = pokeSpriteUrl(dex);
      }
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* --------- Ein einziger Spielstand --------- */
  const [needsOnboarding, setNeedsOnboarding] = useState(() => initialSaveRef.current == null);

  function completeOnboarding(selectedSkillIds, fastAnswerSeconds) {
    createInitialSave(selectedSkillIds, fastAnswerSeconds);
    setNeedsOnboarding(false);
  }

  /* --------- Ladebildschirm, solange Sprites vorgeladen werden --------- */
  if (!preloadReady) {
    const total = preload.total;
    const pct = total > 0 ? Math.round((preloadedCount / total) * 100) : 100;
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
          {preloadFailedDex.length > 0 && (
            <div className="text-xs font-bold mt-2" style={{ color: "#e3350d" }}>
              {preloadFailedDex.length} Sprite(s) konnten nicht geladen werden – Spiel startet trotzdem.
              <div className="mt-1 font-normal" style={{ color: "#888", wordBreak: "break-word" }}>
                #{preloadFailedDex.slice(0, 30).join(", #")}
                {preloadFailedDex.length > 30 && ` … (+${preloadFailedDex.length - 30} weitere)`}
              </div>
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
          <SkillSettings
            selectedSkillIds={DEFAULT_SKILLS}
            mode="onboarding"
            onConfirm={completeOnboarding}
          />
        ) : (
          <GameScreen />
        )}
      </div>
    </div>
  );
}
