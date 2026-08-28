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

/* Großes 1x1: zweistellige Zahl × einstelliger Faktor (z. B. 23 × 4).
   Es wird nur das Endergebnis abgefragt, nicht der schriftliche Rechenweg. */
function genTimesBigQuestion() {
  const big = randInt(10, 99);
  const factor = randInt(2, 9);
  const swap = Math.random() < 0.5;
  const a = swap ? factor : big;
  const b = swap ? big : factor;
  return { a, b, op: "×", answer: big * factor, key: `×${big}×${factor}` };
}

/* Division groß: mehrstelliger Dividend ÷ einstelliger Divisor, immer ohne
   Rest (Umkehraufgabe zum großen 1x1). */
function genDivisionBigQuestion() {
  const divisor = randInt(2, 9);
  const quotient = randInt(11, 99);
  const dividend = divisor * quotient;
  return { a: dividend, b: divisor, op: "÷", answer: quotient, key: `÷${dividend}÷${divisor}` };
}

export function genQuestionForSkill(skill) {
  switch (skill.category) {
    case "times":
      return genTimesQuestion(skill);
    case "division":
      return genDivisionQuestion(skill);
    case "times_big":
      return genTimesBigQuestion();
    case "division_big":
      return genDivisionBigQuestion();
    default:
      return genArithmeticQuestion(skill);
  }
}

function fillWithNearbyValues(pool, answer, maxRange, targetSize = 8) {
  const nearOffsets = shuffle([-1, 1, -2, 2, -3, 3, -4, 4, -5, 5]);
  for (const d of nearOffsets) {
    if (pool.size >= targetSize) break;
    const v = answer + d;
    if (v >= 0 && v <= maxRange && !pool.has(v)) pool.add(v);
  }
  let radius = 6;
  let guard = 0;
  while (pool.size < targetSize && guard < 200) {
    for (const d of shuffle([radius, -radius])) {
      if (pool.size >= targetSize) break;
      const v = answer + d;
      if (v >= 0 && v <= maxRange && !pool.has(v)) pool.add(v);
    }
    radius++;
    guard++;
  }
}

export function genOptions(answer, maxRange) {
  const pool = new Set([answer]);
  fillWithNearbyValues(pool, answer, maxRange);
  return shuffle(Array.from(pool));
}

/* Distraktoren für Multiplikationsaufgaben (× ): statt beliebiger Zahlen
   nahe dem Ergebnis werden Produkte benachbarter Faktoren verwendet
   (klassische Rechenfehler wie "eine Reihe zu viel/wenig"). Das verhindert,
   dass die richtige Antwort allein an der Endziffer erkennbar ist – z. B.
   bei 95 × 4 = 380 würden Distraktoren wie 379/381/382 sofort als falsch
   auffallen, ohne dass gerechnet werden muss, weil sie nicht auf 0 enden.
   Produkte benachbarter Faktoren (z. B. 94 × 4, 96 × 4, 95 × 3, 95 × 5)
   ergeben dagegen plausible, gemischte Endziffern.

   Bei mehrstelligen Faktoren (>= 10, z. B. im großen 1x1) reicht das allein
   noch nicht: verschiebt man einen Faktor nur leicht (±1/±2), ändert sich
   fast immer auch die Endziffer, wodurch oft nur EIN Distraktor dieselbe
   Endziffer wie die echte Antwort hat – dann lässt sich zwischen nur zwei
   Kandidaten raten, ohne wirklich zu rechnen (z. B. 59 × 2 = 118 vs. 58).
   Deshalb werden zusätzlich gezielt "Zehner-Verrutscher" erzeugt (z. B.
   49 × 2, 69 × 2 statt 59 × 2): die Einerstelle des verschobenen Faktors
   bleibt gleich, also endet das Produkt garantiert auf dieselbe Ziffer wie
   das echte Ergebnis – nur die tatsächliche Rechnung verrät, welches davon
   stimmt. */
function genFactorBasedOptions(a, b, answer, maxRange) {
  const pool = new Set([answer]);

  const toValues = (pairs) =>
    shuffle(
      pairs
        .filter(([x, y]) => x >= 1 && y >= 1)
        .map(([x, y]) => x * y)
        .filter((v) => v <= maxRange && v !== answer && !pool.has(v))
    );

  const magnitudeShiftPairs = [];
  for (const shift of [-30, -20, -10, 10, 20, 30]) {
    if (a >= 10) magnitudeShiftPairs.push([a + shift, b]);
    if (b >= 10) magnitudeShiftPairs.push([a, b + shift]);
  }
  // Zuerst ein paar Größenordnungs-Distraktoren mit garantiert gleicher
  // Endziffer sichern, damit die Endziffer allein nie zur Lösung reicht.
  const magnitudeCandidates = toValues(magnitudeShiftPairs);
  for (const v of magnitudeCandidates.slice(0, 3)) pool.add(v);

  const unitShiftPairs = [];
  for (let d = -2; d <= 2; d++) {
    if (d === 0) continue;
    if (a + d >= 1) unitShiftPairs.push([a + d, b]);
    if (b + d >= 1) unitShiftPairs.push([a, b + d]);
  }
  unitShiftPairs.push([a + 1, b + 1], [a - 1, b - 1], [a + 1, b - 1], [a - 1, b + 1]);
  for (const v of toValues(unitShiftPairs)) {
    if (pool.size >= 8) break;
    pool.add(v);
  }

  // Falls noch Platz ist, mit weiteren Größenordnungs-Kandidaten auffüllen.
  for (const v of magnitudeCandidates) {
    if (pool.size >= 8) break;
    pool.add(v);
  }

  // Bei Randfaktoren (z. B. 1 oder 10) entstehen manchmal zu wenige plausible
  // Distraktoren – dann mit den generischen nahen Werten auffüllen.
  if (pool.size < 8) fillWithNearbyValues(pool, answer, maxRange);
  return shuffle(Array.from(pool));
}

/* Wählt automatisch die passende Distraktor-Strategie: Faktor-basiert bei
   Multiplikationsaufgaben, sonst die generische Umgebungs-Suche. */
export function genOptionsForQuestion(question, maxRange) {
  if (question.op === "×") return genFactorBasedOptions(question.a, question.b, question.answer, maxRange);
  return genOptions(question.answer, maxRange);
}
