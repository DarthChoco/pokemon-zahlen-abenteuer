import { GENERATIONS } from "../data/generations";
import { regionTotal, regionCaughtCount } from "./pokemonPool";

/* regionTotal/regionCaughtCount arbeiten generisch auf jedem
   {dexStart,dexEnd}-Objekt – eine Generation hat exakt diese Form, daher
   lassen sich die bestehenden Pool-Helfer 1:1 wiederverwenden. */
export function isGenerationComplete(generation, caughtDex) {
  return regionCaughtCount(generation, caughtDex) === regionTotal(generation);
}

/* Generation 1 ist immer freigeschaltet. Jede weitere Generation wird
   erst freigeschaltet, sobald die unmittelbar vorherige zu 100% gefangen
   ist – eine reine Kette, kein gespeicherter "unlocked"-Zustand nötig. */
export function getUnlockedGenerations(caughtDex, generations = GENERATIONS) {
  const unlocked = [];
  for (const gen of generations) {
    if (unlocked.length === 0 || isGenerationComplete(generations[unlocked.length - 1], caughtDex)) {
      unlocked.push(gen);
    } else {
      break;
    }
  }
  return unlocked;
}

export function totalDexAcross(generations) {
  return generations.reduce((sum, gen) => sum + regionTotal(gen), 0);
}
