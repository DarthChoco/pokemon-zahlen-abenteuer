import { MASTER_SKILL_ORDER } from "../data/skills";
import { randInt } from "./questionGenerators";

/* Berechnet für eine Skill-Auswahl, welche Skills in welcher der 10
   Regionen "freigeschaltet" sind. Freischaltung ist kumulativ: Region i
   enthält alle Skills der Region i-1 plus (im Schnitt) einen weiteren,
   in der globalen Schwierigkeits-Reihenfolge (MASTER_SKILL_ORDER)
   nächsten ausgewählten Skill. Die letzte Region trainiert immer den
   vollen, gewählten Skill-Mix. So steigt die Schwierigkeit über die
   Regionen hinweg, während bereits gelernte Skills weiter wiederholt
   werden. */
export function buildRegionSkillPlan(selectedSkillIds, regionCount = 10) {
  const ordered = MASTER_SKILL_ORDER.filter((id) => selectedSkillIds.includes(id));
  const n = ordered.length;
  if (n === 0) return Array.from({ length: regionCount }, () => []);
  return Array.from({ length: regionCount }, (_, i) => {
    const k = Math.min(n, Math.max(1, Math.ceil(((i + 1) / regionCount) * n)));
    return ordered.slice(0, k);
  });
}

export function pickSkillForRegion(regionSkillIds) {
  if (!regionSkillIds || regionSkillIds.length === 0) return null;
  return regionSkillIds[randInt(0, regionSkillIds.length - 1)];
}
