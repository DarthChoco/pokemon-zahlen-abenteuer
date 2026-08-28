/* ======================================================================
   AUFGABEN-GENERIERUNG
   Erzeugt aus einem Skill (siehe src/data/skills.js) eine konkrete
   Rechenaufgabe sowie passende Multiple-Choice-Antwortoptionen.
   ====================================================================== */

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Prüft spaltenweise (Einer, Zehner, ...), ob die Addition irgendwo einen
   Übertrag erzeugt. Da ein Übertrag nur entstehen kann, wenn die Spalte an
   sich schon >= 10 ergibt (die Ziffern selbst tragen keinen Übertrag aus
   einer noch nicht geprüften, weiter links liegenden Spalte in sich), genügt
   ein rein ziffernweiser Vergleich ohne Übertrags-Simulation. */
export function hasCarryAdd(a, b) {
  let x = a, y = b;
  while (x > 0 || y > 0) {
    if ((x % 10) + (y % 10) >= 10) return true;
    x = Math.floor(x / 10);
    y = Math.floor(y / 10);
  }
  return false;
}

/* Analog zu hasCarryAdd, aber für Subtraktion: prüft spaltenweise, ob
   irgendwo entliehen werden muss. */
export function hasBorrowSub(a, b) {
  let x = a, y = b;
  while (x > 0 || y > 0) {
    if ((x % 10) < (y % 10)) return true;
    x = Math.floor(x / 10);
    y = Math.floor(y / 10);
  }
  return false;
}

function genArithmeticQuestion(skill) {
  const isAdd = Math.random() < 0.5;
  const range = isAdd ? skill.add : skill.sub;
  let a, b, guard = 0;
  do {
    a = randInt(range.aMin, range.aMax);
    b = isAdd ? randInt(range.bMin, range.bMax) : randInt(range.bMin, Math.min(range.bMax, a));
    guard++;
  } while (
    guard < 500 &&
    (isAdd
      ? a + b > skill.maxRange || (skill.carry !== undefined && hasCarryAdd(a, b) !== skill.carry)
      : (skill.carry !== undefined && hasBorrowSub(a, b) !== skill.carry))
  );
  return isAdd
    ? { a, b, op: "+", answer: a + b, key: `+${a}+${b}` }
    : { a, b, op: "−", answer: a - b, key: `-${a}-${b}` };
}

function genTimesQuestion(skill) {
  const factor = randInt(1, 10);
  const swap = Math.random() < 0.5;
  const a = swap ? factor : skill.row;
  const b = swap ? skill.row : factor;
  return { a, b, op: "×", answer: a * b, key: `×${skill.row}×${factor}` };
}

function genDivisionQuestion(skill) {
  const quotient = randInt(1, 10);
  const dividend = skill.row * quotient;
  return { a: dividend, b: skill.row, op: "÷", answer: quotient, key: `÷${dividend}÷${skill.row}` };
}

export function genQuestionForSkill(skill) {
  switch (skill.category) {
    case "times":
      return genTimesQuestion(skill);
    case "division":
      return genDivisionQuestion(skill);
    default:
      return genArithmeticQuestion(skill);
  }
}

export function genOptions(answer, maxRange) {
  const pool = new Set([answer]);
  const nearOffsets = shuffle([-1, 1, -2, 2, -3, 3, -4, 4, -5, 5]);
  for (const d of nearOffsets) {
    if (pool.size >= 8) break;
    const v = answer + d;
    if (v >= 0 && v <= maxRange && !pool.has(v)) pool.add(v);
  }
  let radius = 6;
  let guard = 0;
  while (pool.size < 8 && guard < 200) {
    for (const d of shuffle([radius, -radius])) {
      if (pool.size >= 8) break;
      const v = answer + d;
      if (v >= 0 && v <= maxRange && !pool.has(v)) pool.add(v);
    }
    radius++;
    guard++;
  }
  return shuffle(Array.from(pool));
}
