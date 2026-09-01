import React, { useState, useEffect, useRef } from "react";
import { pokeSpriteUrl, pokeSpriteFallbackUrl } from "./data/pokemon";
import { DEFAULT_SKILLS } from "./data/skills";
import { getUnlockedGenerations, totalDexAcross } from "./logic/generations";
import { loadSave, saveSave, createInitialSave } from "./storage";
import { logFailedSprite } from "./debug";
import { isCloudAvailable, loadProfileFromCloud } from "./cloud";
import { PixelPanel, PokeballIcon } from "./components/PixelUI";
import SkillSettings from "./components/SkillSettings";
import ProfilePicker from "./components/ProfilePicker";
import GameScreen from "./GameScreen";

const PROFILE_CODE_KEY = "pokeZahlenAbenteuer_profileCode";

function loadCachedProfileCode() {
  try {
    return localStorage.getItem(PROFILE_CODE_KEY);
  } catch {
    return null;
  }
}
function cacheProfileCode(code) {
  try {
    localStorage.setItem(PROFILE_CODE_KEY, code);
  } catch {
    // Kein lokaler Speicher verfügbar – der Code muss dann bei jedem
    // Start erneut eingegeben werden, der Cloud-Fortschritt bleibt aber sicher.
  }
}

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
  const cloudOn = isCloudAvailable();

  /* --------- Profil-Code (nur relevant, wenn Cloud-Sync eingerichtet ist):
     aus lokalem Cache übernehmen, sonst ProfilePicker zeigen. Ohne Cloud-
     Einrichtung läuft alles wie bisher rein lokal, ohne Profil-Konzept. --------- */
  const [profileCode, setProfileCode] = useState(() => (cloudOn ? loadCachedProfileCode() : null));
  const needsProfilePicker = cloudOn && !profileCode;

  /* --------- Ausgangs-Spielstand auflösen: bei bekanntem Profil-Code
     zuerst aus der Cloud versuchen, sonst lokal, sonst frisch. Ohne
     Cloud-Einrichtung steht der lokale Stand sofort synchron fest. --------- */
  const initialLocalSaveRef = useRef();
  if (initialLocalSaveRef.current === undefined) initialLocalSaveRef.current = loadSave();

  const [resolvedSave, setResolvedSave] = useState(() => (cloudOn ? null : initialLocalSaveRef.current));
  const [resolvingSave, setResolvingSave] = useState(() => cloudOn && !!profileCode);

  useEffect(() => {
    if (!cloudOn || !profileCode) return;
    let cancelled = false;
    setResolvingSave(true);
    (async () => {
      let save = await loadProfileFromCloud(profileCode);
      if (save) saveSave(save); // lokal cachen, spart künftige Cloud-Reads
      else save = loadSave();
      if (!cancelled) {
        setResolvedSave(save);
        setResolvingSave(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileCode]);

  function handleProfileSelected(code) {
    cacheProfileCode(code);
    setProfileCode(code);
  }

  /* --------- Sprite-Vorladen: Sprites der freigeschalteten Generation(en)
     einmal laden, damit das Spiel auch bei Internet-Abbruch weiterläuft --------- */
  const [preloadedCount, setPreloadedCount] = useState(0);
  const [preloadFailedDex, setPreloadFailedDex] = useState([]);
  const [preloadReady, setPreloadReady] = useState(false);
  const preloadStartedRef = useRef(false);
  const processedRef = useRef(0);

  useEffect(() => {
    if (needsProfilePicker || resolvingSave || preloadStartedRef.current) return;
    preloadStartedRef.current = true;
    const preload = preloadRangeForSave(resolvedSave);
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
    if (preload.total === 0) setPreloadReady(true);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsProfilePicker, resolvingSave]);

  /* --------- Ein einziger Spielstand pro Profil --------- */
  const [needsOnboarding, setNeedsOnboarding] = useState(true);
  useEffect(() => {
    if (!resolvingSave) setNeedsOnboarding(resolvedSave == null);
  }, [resolvingSave, resolvedSave]);

  function completeOnboarding(selectedSkillIds, fastAnswerSeconds) {
    createInitialSave(selectedSkillIds, fastAnswerSeconds);
    setNeedsOnboarding(false);
  }

  /* --------- Profil-Auswahl (nur bei eingerichtetem Cloud-Sync) --------- */
  if (needsProfilePicker) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center p-4"
        style={{ background: "#f4f4f4", fontFamily: "monospace" }}
      >
        <div className="w-full max-w-md">
          <ProfilePicker onSelect={handleProfileSelected} onCheckCode={loadProfileFromCloudExists} />
        </div>
      </div>
    );
  }

  /* --------- Kurzer Zwischenschritt: Spielstand wird aus der Cloud geholt --------- */
  if (resolvingSave) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center p-4"
        style={{ background: "#f4f4f4", fontFamily: "monospace" }}
      >
        <PixelPanel className="p-6 max-w-sm w-full text-center" style={{ background: "#ffffff" }}>
          <div className="flex justify-center mb-3">
            <PokeballIcon size={48} />
          </div>
          <div className="text-lg font-extrabold" style={{ color: "#1a1a1a" }}>
            Verbinde …
          </div>
        </PixelPanel>
      </div>
    );
  }

  /* --------- Ladebildschirm, solange Sprites vorgeladen werden --------- */
  if (!preloadReady) {
    const total = preloadRangeForSave(resolvedSave).total;
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
          <GameScreen profileCode={profileCode} />
        )}
      </div>
    </div>
  );
}

async function loadProfileFromCloudExists(code) {
  if (!isCloudAvailable()) return null;
  const save = await loadProfileFromCloud(code);
  return save != null;
}
