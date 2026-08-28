/* Verbleibender Pokémon-Pool einer Region (noch nicht gefangene Dex-Nr.) */
export function remainingPool(region, caughtDex) {
  const list = [];
  for (let n = region.dexStart; n <= region.dexEnd; n++) {
    if (!caughtDex.has(n)) list.push(n);
  }
  return list;
}

export function regionTotal(region) {
  return region.dexEnd - region.dexStart + 1;
}

export function regionCaughtCount(region, caughtDex) {
  let c = 0;
  for (let n = region.dexStart; n <= region.dexEnd; n++) if (caughtDex.has(n)) c++;
  return c;
}
