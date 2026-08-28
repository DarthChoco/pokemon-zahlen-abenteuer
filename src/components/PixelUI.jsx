import React from "react";
import { pokeSpriteUrl, pokemonName } from "../data/pokemon";

/* ======================================================================
   PIXEL / POKÉBALL-BAUSTEINE
   ====================================================================== */

export function PixelPanel({ children, style, className = "" }) {
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

export function PokeballIcon({ size = 28 }) {
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
export function PokemonSprite({ dex, size = 96, silhouette = false, alt }) {
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
export function RegionTile({ region, index, status, caughtCount, total, active, onClick }) {
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
