import React from "react";
import { CLASS_LEVELS } from "../data/skills";
import { PixelPanel } from "./PixelUI";

/* Klassen-Umschalter (1.-4. Klasse). Jede Klasse hat einen eigenen,
   unabhängigen Spielstand (siehe src/storage.js). */
export default function ClassSwitcher({ activeClass, onSwitch }) {
  return (
    <PixelPanel className="p-2 flex items-center gap-2 flex-wrap" style={{ background: "#ffffff" }}>
      <span className="text-xs font-extrabold" style={{ color: "#1a1a1a" }}>
        Klassenstufe:
      </span>
      {CLASS_LEVELS.map((level) => {
        const active = level === activeClass;
        return (
          <button
            key={level}
            onClick={() => onSwitch(level)}
            className="border-4 border-black px-3 py-1 font-extrabold text-sm"
            style={{
              background: active ? "#e3350d" : "#ffffff",
              color: active ? "#ffffff" : "#1a1a1a",
            }}
          >
            Klasse {level}
          </button>
        );
      })}
    </PixelPanel>
  );
}
