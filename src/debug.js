/* --------- Fehlgeschlagene Sprites protokollieren ---------
   Wird sowohl beim initialen Vorladen (App.jsx) als auch beim
   Nachladen einer neu freigeschalteten Generation (data/pokemon.js
   preloadSprites) aufgerufen. Persistiert in localStorage, damit der
   Debug-Modus (GameScreen.jsx) auch nach einem Reload noch anzeigen
   kann, welche Dex-Nummern zuletzt Probleme hatten – hilfreich, wenn
   der Fehler nur auf einem bestimmten Gerät auftritt. */
const FAILED_SPRITES_KEY = "pokeZahlenAbenteuer_debug_failedSprites";

export function logFailedSprite(dexNr) {
  try {
    const existing = loadFailedSprites();
    if (!existing.includes(dexNr)) {
      existing.push(dexNr);
      existing.sort((a, b) => a - b);
      localStorage.setItem(FAILED_SPRITES_KEY, JSON.stringify(existing));
    }
  } catch {
    // ignorieren
  }
}

export function loadFailedSprites() {
  try {
    const raw = localStorage.getItem(FAILED_SPRITES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function clearFailedSprites() {
  try {
    localStorage.removeItem(FAILED_SPRITES_KEY);
  } catch {
    // ignorieren
  }
}
