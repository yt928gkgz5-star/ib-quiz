/* IB Chemistry - topic practice platform (SL & HL, MCQ / P2 / Paper 1B) */
const app = document.getElementById("app");
const PAGE_SIZE = 8;
const P2_PAGE_SIZE = 2;
const isStructPaper = p => p === "P2" || p === "P1B";   // self-marking with official mark scheme
let state = { view: "home", chapter: null, name: "", answers: {}, marks: {}, page: 0, submitted: false, marking: false,
  browse: { level: "SL", paper: "MCQ" } };
/* Level keys are internal and stable (access codes and saved attempts rely on them);
   LEVEL_LABELS is what students see. SLP / HLP = complete past papers shown as numbered sets. */
const LEVELS = ["Pre-IB", "SL", "HL", "SLP", "HLP", "TL"];
const LEVEL_LABELS = { "Pre-IB": "Pre-IB", "SL": "Topical SL", "HL": "Topical HL", "SLP": "SL Past Papers", "HLP": "HL Past Papers", "TL": "Topical Learning" };
const PAPERS = ["MCQ", "FRQ", "P1B"];
const PREIB_PAPERS = ["MCQ", "FRQ"];
const LEVEL_PAPERS = { "Pre-IB": ["MCQ", "FRQ"], "SL": ["MCQ", "P2"], "HL": ["MCQ", "P2"], "SLP": ["MCQ", "P2"], "HLP": ["MCQ", "P2"], "TL": ["MCQ"] };
const isPastPaperLevel = l => /P$/.test(l);
const paperLabel = (level, p) => isPastPaperLevel(level) ? ({ "MCQ": "Paper 1", "P2": "Paper 2" }[p] || p) : p;
/* Bootstrap from URL: #preib/#topic/#sets/#p1b/#p2 preselect a level+paper tab;
   ?code=IBQ... applies a class access code non-interactively (used when the quiz is
   embedded in the ibchemni platform, which unlocks chapters for purchased courses). */
(function bootFromUrl() {
  if (typeof location === "undefined") return;
  const h = location.hash;
  if (h === "#preib") state.browse.level = "Pre-IB";
  if (h === "#topic") { state.browse.level = "SL"; state.browse.paper = "MCQ"; }
  if (h === "#sets")  { state.browse.level = "SLP"; state.browse.paper = "MCQ"; }
  if (h === "#p1b")   { state.browse.level = "SL"; state.browse.paper = "P1B"; }
  if (h === "#p2")    { state.browse.level = "SL"; state.browse.paper = "P2"; }
  if (h === "#tl")    state.browse.level = "TL";
  const q = new URLSearchParams(location.search).get("code");
  if (q) {
    try {
      const obj = decodeAccess(q);
      if (obj && Array.isArray(obj.a) && (obj.a[0] !== "*" || obj.c === "TEACHER")) {
        localStorage.setItem("access", JSON.stringify({ cls: obj.c, allow: obj.a }));
        /* embedded entries: carry the student's name from the platform identity,
           so no second sign-in is ever asked inside the embed */
        const m = /^Student (.+)$/.exec(obj.c || "");
        if (m && localStorage.getItem("stuName") !== m[1]) localStorage.setItem("stuName", m[1]);
      }
    } catch (e) { /* invalid code: ignore, the normal code box still works */ }
  }
})();

/* Entry modes: ?entry=... restricts the app to a subset of levels/papers
   (used by the ibchemni personal-site embeds). Entries never include Pre-IB.
   No entry parameter = full app, behaviour unchanged. */
const ENTRY_CFG = {
  "topical-units":   { levels: ["SL", "HL"], papers: ["MCQ", "P2"] },   // HL topical bank reorganised to units 2026-11-27
  "past-paper-sets": { levels: ["SLP", "HLP"], papers: ["MCQ", "P2"] },
  "exam-sprint-p2":  { levels: ["SL", "HL"], papers: ["P2"] }
};
const ENTRY = (() => {
  if (typeof location === "undefined") return null;
  const e = new URLSearchParams(location.search).get("entry") || "";
  const cfg = ENTRY_CFG[e];
  return cfg ? { levels: cfg.levels.slice(), papers: cfg.papers.slice() } : null;
})();
if (ENTRY) {
  if (ENTRY.levels.indexOf(state.browse.level) === -1) state.browse.level = ENTRY.levels[0];
  if (ENTRY.papers.indexOf(state.browse.paper) === -1) state.browse.paper = ENTRY.papers[0];
}

/* ---------- Pre-IB topics (merged from the SL MCQ bank) ---------- */
/* Chemical Bonding (old CH4 / new Unit 2) is split by bonding type; `pick` keeps only the
   listed question srcs so every one of the 82 questions appears exactly once.
   preib-bonding (all 82) is retired: it stays resolvable for students' saved history. */
const BOND_IONIC = ["11_SL_Summer_2018_Q7", "10_SL_Winter_2019_Q9", "11_SL_Summer_2021_Q10", "11_SL_Summer_2021_Q11", "12_SL_Summer_2021_Q11", "10_SL_Winter_2021_Q10", "10_SL_Winter_2021_Q11", "11_SL_Summer_2022_Q9", "11_SL_Summer_2022_Q10", "12_SL_Summer_2022_Q11", "11_SL_Summer_2023_Q9", "11_SL_Summer_2023_Q10", "11_SL_Winter_2023_Q10", "11_SL_Summer_2024_Q9"];
const BOND_COVALENT = ["12_SL_Summer_2017_Q9", "11_SL_Summer_2017_Q11", "12_SL_Summer_2017_Q11", "10_SL_Winter_2017_Q10", "11_SL_Summer_2018_Q10", "12_SL_Summer_2018_Q10", "11_SL_Summer_2018_Q11", "12_SL_Summer_2018_Q11", "10_SL_Winter_2018_Q9", "10_SL_Winter_2018_Q10", "10_SL_Winter_2019_Q10", "10_SL_Winter_2019_Q12", "10_SL_Winter_2020_Q11", "11_SL_Summer_2021_Q9", "12_SL_Summer_2021_Q10", "11_SL_Summer_2021_Q12", "10_SL_Winter_2021_Q9", "12_SL_Summer_2022_Q9", "10_SL_Winter_2022_Q13", "12_SL_Summer_2023_Q10", "12_SL_Summer_2023_Q11", "11_SL_Summer_2023_Q12", "12_SL_Summer_2023_Q12", "11_SL_Summer_2023_Q13", "11_SL_Winter_2023_Q12", "12_SL_Summer_2024_Q9", "12_SL_Summer_2024_Q10", "11_SL_Summer_2024_Q12", "1_SL_Winter_2024_Q9", "1_SL_Winter_2024_Q11"];
const BOND_IMF = ["11_SL_Summer_2017_Q10", "12_SL_Summer_2017_Q10", "11_SL_Summer_2017_Q12", "10_SL_Winter_2017_Q9", "10_SL_Winter_2017_Q11", "11_SL_Summer_2018_Q12", "12_SL_Summer_2018_Q12", "10_SL_Winter_2018_Q11", "10_SL_Winter_2018_Q12", "10_SL_Winter_2020_Q10", "12_SL_Summer_2021_Q12", "10_SL_Winter_2021_Q12", "10_SL_Winter_2021_Q13", "11_SL_Summer_2022_Q11", "12_SL_Summer_2022_Q12", "10_SL_Winter_2022_Q10", "10_SL_Winter_2022_Q11", "12_SL_Summer_2023_Q9", "11_SL_Summer_2024_Q10", "12_SL_Summer_2024_Q12", "1_SL_Winter_2024_Q10"];
const BOND_METAL = ["12_SL_Summer_2017_Q12", "10_SL_Winter_2017_Q12", "10_SL_Winter_2020_Q12", "10_SL_Winter_2022_Q12", "12_SL_Summer_2024_Q11", "1_SL_Winter_2024_Q12"];
const BOND_MIXED = ["11_SL_Summer_2017_Q9", "10_SL_Winter_2017_Q8", "10_SL_Winter_2019_Q11", "12_SL_Summer_2021_Q9", "12_SL_Summer_2022_Q10", "11_SL_Summer_2022_Q12", "10_SL_Winter_2022_Q9", "11_SL_Summer_2023_Q8", "11_SL_Winter_2023_Q11", "11_SL_Winter_2023_Q13", "11_SL_Summer_2024_Q11"];
const PREIB_TOPICS = [
  { id: "preib-stoich",   title: "Stoichiometry",     src: ["u1b"] },
  { id: "preib-atoms",    title: "Atomic Structure",  src: ["u1a"] },
  { id: "preib-periodic", title: "Periodic Trends",   src: ["u3"] },
  { id: "preib-bond-ionic", title: "Bonding 1 · Ionic Bonding",            src: ["u2"], pick: BOND_IONIC },
  { id: "preib-bond-cov",   title: "Bonding 2 · Covalent Bonds, Lewis & Shapes", src: ["u2"], pick: BOND_COVALENT },
  { id: "preib-bond-imf",   title: "Bonding 3 · Polarity & Intermolecular Forces", src: ["u2"], pick: BOND_IMF },
  { id: "preib-bond-metal", title: "Bonding 4 · Metallic Bonding & Alloys", src: ["u2"], pick: BOND_METAL },
  { id: "preib-bond-mixed", title: "Bonding 5 · Mixed & Extension",         src: ["u2"], pick: BOND_MIXED },
  { id: "preib-bonding",  title: "Chemical Bonding · all 82 questions", src: ["u2"], retired: true }
];
const PREIB_CH = PREIB_TOPICS.map(t => ({
  id: t.id,
  title: t.title,
  level: "Pre-IB",
  level2: "SL",
  paper: "MCQ",
  _src: t.src,
  retired: !!t.retired,
  questions: t.src.flatMap(cid => {
    const c = QUIZ_DATA.chapters.find(x => x.id === cid);
    if (!c) return [];
    return t.pick ? c.questions.filter(q => t.pick.indexOf(q.src) > -1) : c.questions;
  })
}));

/* ---------- Pre-IB interactive lessons (Cambridge S2 course) ---------- */
const PREIB_LESSONS = [
  { part: "2.1",  title: "The Ionic Model", codes: "S2.1 · Cambridge Ch. 6" },
  { part: "2.2A", title: "Covalent Bonds & Lewis Formulas", codes: "S2.2 · Ch. 7 §7.1" },
  { part: "2.2B", title: "Molecular Shapes & Polarity (VSEPR)", codes: "S2.2 · Ch. 7 §7.2–7.6" },
  { part: "2.2C", title: "Intermolecular Forces & Physical Properties", codes: "S2.2 · Ch. 7 §7.7–7.10" },
  { part: "2.3",  title: "The Metallic Model", codes: "S2.3 · Ch. 8" },
  { part: "2.4",  title: "From Models to Materials", codes: "S2.4 · Ch. 9" }
];
function preibLessonsHTML() {
  return `<div class="sublabel" style="margin-top:14px">S2 Chemical Bonding — interactive lessons (Cambridge Ch. 6–9, inquiry-based)</div>
  <div class="chapter lessoncard" onclick="location.href='topical-learning/s2-bonding/index.html#home'">
    <div class="chapter-main"><div class="chapter-no small">LEARN</div>
      <div><h3>Chemical Bonding — interactive course</h3>
        <div class="meta">Explore models · worked examples · checkpoint quizzes · progress saved on your device</div></div>
    </div><div class="badge">Open</div></div>
  <details class="codesmall" style="margin-top:6px"><summary>Jump straight to a part</summary>
    <div class="lessonlist">${PREIB_LESSONS.map(l =>
      `<a class="lessonlink" href="topical-learning/s2-bonding/index.html#${l.part}">Part ${l.part} · ${l.title} <span class="meta">(${l.codes})</span></a>`).join("")}</div></details>`;
}

/* ---------- Pre-IB FRQ sets (auto-marked by keyword rubrics) ---------- */
const FRQ_INSTRUCTIONS = `<b>For each molecule, answer all seven parts:</b>
  <ol class="frqol">
    <li>Draw the Lewis structure.</li>
    <li>State the number of electron domains around the central atom.</li>
    <li>State the <b>electron domain geometry</b>.</li>
    <li>State the <b>molecular geometry</b>.</li>
    <li>Predict the <b>bond angle</b>.</li>
    <li>Determine the <b>bond polarity</b> (use electronegativities; show δ⁺/δ⁻). Values: H 2.20 · B 2.04 · C 2.55 · N 3.04 · O 3.44 · F 3.98 · P 2.19 · S 2.58 · Cl 3.16</li>
    <li>Judge the <b>molecular polarity</b> — polar or non-polar, and explain in terms of bond dipoles and symmetry.</li>
  </ol>`;

const PREIB_FRQ_SETS = [
  {
    id: "preib-frq-polarity",
    title: "Chemical Bonding · Molecular Polarity (VSEPR & Polarity)",
    level: "Pre-IB", level2: "SL", paper: "FRQ", _src: ["preib-frq"],
    intro: FRQ_INSTRUCTIONS,
    questions: [
      { marks: 7,
        prompt: "<strong>CO₂ (carbon dioxide)</strong><br>Explain why CO₂ contains polar bonds but is a non-polar molecule.",
        rubric: [
          { d: "Electron domains around C: 2 (two C=O double bonds, no lone pairs)", k: ["2 electron", "two electron", "2 domain", "two domain", "2 region", "two region", "two double bond", "2 double bond", "no lone pair"] },
          { d: "Electron domain geometry: linear", k: ["linear"] },
          { d: "Molecular geometry: linear", k: ["linear"] },
          { d: "Bond angle: 180°", k: ["180"] },
          { d: "C=O bonds polar; shown with δ⁺/δ⁻ (ΔEN = 0.89), Cδ⁺=Oδ⁻", k: ["polar", "δ", "delta"] },
          { d: "Molecule overall: non-polar", k: ["non-polar", "nonpolar", "non polar"] },
          { d: "Two identical bond dipoles point in opposite directions and cancel by symmetry", k: ["cancel", "opposite", "symmetry", "symmetrical", "balance"] } ],
        key: "<ul><li>Electron domains: <b>2</b> (two C=O double bonds, no lone pairs)</li><li>Domain & molecular geometry: <b>linear</b></li><li>Bond angle: <b>180°</b></li><li>Bond polarity: C=O polar (ΔEN = 3.44 − 2.55 = 0.89); Cδ⁺=Oδ⁻</li><li>Molecular polarity: <b>non-polar</b> — two identical dipoles point in opposite directions and cancel by symmetry.</li></ul>" },
      { marks: 7,
        prompt: "<strong>HCN (hydrogen cyanide)</strong><br>H–C≡N: predict the geometry and overall polarity.",
        rubric: [
          { d: "Electron domains around C: 2 (C–H single + C≡N triple, no lone pairs)", k: ["2 electron", "two electron", "2 domain", "two domain", "2 region", "two region", "no lone pair"] },
          { d: "Electron domain geometry: linear", k: ["linear"] },
          { d: "Molecular geometry: linear", k: ["linear"] },
          { d: "Bond angle: 180°", k: ["180"] },
          { d: "Bond polarity: C≡N strongly polar (Nδ⁻); C–H nearly non-polar", k: ["polar", "δ", "delta"] },
          { d: "Molecule overall: polar", k: ["re:(?<!non[- ]?)polar"] },
          { d: "No symmetry cancellation — ends different (H vs N), net dipole points toward N", k: ["toward n", "towards n", "toward the n", "no cancel", "not cancel", "cannot cancel", "don't cancel", "do not cancel", "different atom", "different element", "different end", "net dipole"] } ],
        key: "<ul><li>Electron domains: <b>2</b> (C–H single, C≡N triple, no lone pairs)</li><li>Domain & molecular geometry: <b>linear</b></li><li>Bond angle: <b>180°</b></li><li>Bond polarity: C–H nearly non-polar (ΔEN 0.35); C≡N strongly polar (ΔEN 0.49), Nδ⁻</li><li>Molecular polarity: <b>polar</b> — ends are different (H vs N), no cancellation; net dipole points toward N.</li></ul>" },
      { marks: 7,
        prompt: "<strong>SO₂ (sulfur dioxide)</strong><br>SO₂ and CO₂ both contain two double bonds, yet SO₂ is polar while CO₂ is not. Draw the Lewis structure of SO₂ and account for the difference.",
        rubric: [
          { d: "Electron domains around S: 3 (two S=O bonds + 1 lone pair)", k: ["3 electron", "three electron", "3 domain", "three domain", "3 region", "three region", "lone pair"] },
          { d: "Electron domain geometry: trigonal planar", k: ["trigonal planar", "triangular planar", "planar triangular"] },
          { d: "Molecular geometry: bent (V-shaped)", k: ["bent", "v-shaped", "v shaped", "angular"] },
          { d: "Bond angle ≈119° (slightly less than 120°)", k: ["119", "120", "less than 120"] },
          { d: "S=O bonds polar (ΔEN = 0.86); Sδ⁺=Oδ⁻", k: ["polar", "δ", "delta"] },
          { d: "Molecule overall: polar", k: ["re:(?<!non[- ]?)polar"] },
          { d: "Bent shape → dipoles do not cancel (unlike linear CO₂); lone pair forces the bend", k: ["not cancel", "don't cancel", "do not cancel", "cannot cancel", "no cancel", "bent", "asymmetr", "not symmetr", "co2", "lone pair"] } ],
        key: "<ul><li>Electron domains: <b>3</b> (two S=O + <b>1 lone pair</b>)</li><li>Domain geometry: <b>trigonal planar</b>; molecular geometry: <b>bent</b></li><li>Bond angle: <b>≈119°</b></li><li>Bond polarity: S=O polar (ΔEN 0.86); Sδ⁺=Oδ⁻</li><li>Molecular polarity: <b>polar</b> — bent shape means the two bond dipoles do not cancel; net dipole toward the O atoms. CO₂ is linear so its dipoles cancel; SO₂'s lone pair forces a bent shape.</li></ul>" },
      { marks: 7,
        prompt: "<strong>BF₃ (boron trifluoride)</strong><br>Predict the geometry of BF₃ and its polarity. Comment on the bond angles.",
        rubric: [
          { d: "Electron domains around B: 3 (three B–F bonds, no lone pairs)", k: ["3 electron", "three electron", "3 domain", "three domain", "3 region", "three region", "no lone pair"] },
          { d: "Electron domain geometry: trigonal planar", k: ["trigonal planar", "triangular planar"] },
          { d: "Molecular geometry: trigonal planar", k: ["trigonal planar", "triangular planar"] },
          { d: "Bond angle: 120°", k: ["120"] },
          { d: "B–F highly polar (ΔEN = 1.94); Bδ⁺–Fδ⁻", k: ["polar", "δ", "delta"] },
          { d: "Molecule overall: non-polar", k: ["non-polar", "nonpolar", "non polar"] },
          { d: "Three identical dipoles at 120° sum to zero by symmetry", k: ["cancel", "sum to zero", "add to zero", "vector", "symmetry", "symmetrical", "balance", "equal"] } ],
        key: "<ul><li>Electron domains: <b>3</b> (three B–F, no lone pairs; incomplete octet acceptable)</li><li>Domain & molecular geometry: <b>trigonal planar</b></li><li>Bond angle: <b>120°</b></li><li>Bond polarity: B–F highly polar (ΔEN 1.94); Bδ⁺–Fδ⁻</li><li>Molecular polarity: <b>non-polar</b> — three identical dipoles at 120° sum to zero. Bond polarity ≠ molecular polarity.</li></ul>" },
      { marks: 7,
        prompt: "<strong>CH₂O (methanal / formaldehyde)</strong><br>Predict the geometry around the central carbon atom and determine the direction of the net dipole.",
        rubric: [
          { d: "Electron domains around C: 3 (two C–H + one C=O, no lone pairs)", k: ["3 electron", "three electron", "3 domain", "three domain", "3 region", "three region", "three bond", "3 bond"] },
          { d: "Electron domain geometry: trigonal planar", k: ["trigonal planar", "triangular planar"] },
          { d: "Molecular geometry: trigonal planar", k: ["trigonal planar", "triangular planar"] },
          { d: "Bond angle ≈120° (H–C–H compressed to ~116°)", k: ["120", "116"] },
          { d: "C=O polar (ΔEN 0.89); C–H nearly non-polar", k: ["polar", "δ", "delta"] },
          { d: "Molecule overall: polar", k: ["re:(?<!non[- ]?)polar"] },
          { d: "C=O dipole not balanced by the two C–H dipoles; net dipole points from C toward O", k: ["toward o", "towards o", "toward the o", "toward oxygen", "towards oxygen", "net dipole", "not balance", "not cancel", "do not cancel", "cannot cancel", "no cancel", "oxygen end"] } ],
        key: "<ul><li>Electron domains: <b>3</b> (two C–H + one C=O, no lone pairs)</li><li>Domain & molecular geometry: <b>trigonal planar</b></li><li>Bond angle: <b>≈120°</b> (H–C–H ~116°)</li><li>Bond polarity: C=O polar; C–H nearly non-polar</li><li>Molecular polarity: <b>polar</b> — C=O dipole not balanced by C–H dipoles; net dipole points toward O.</li></ul>" },
      { marks: 7,
        prompt: "<strong>CH₄ (methane)</strong><br>Explain why CH₄ is non-polar.",
        rubric: [
          { d: "Electron domains around C: 4 (four C–H bonds, no lone pairs)", k: ["4 electron", "four electron", "4 domain", "four domain", "4 region", "four region", "four bond", "4 bond"] },
          { d: "Electron domain geometry: tetrahedral", k: ["tetrahedral"] },
          { d: "Molecular geometry: tetrahedral", k: ["tetrahedral"] },
          { d: "Bond angle: 109.5°", k: ["109.5", "109"] },
          { d: "C–H bonds essentially non-polar (ΔEN = 0.35)", k: ["re:c[–-]h", "0.35", "re:bond.{0,14}non", "re:non.{0,8}bond", "re:almost non", "re:nearly non", "re:essentially non", "re:weakly polar"] },
          { d: "Molecule overall: non-polar", k: ["non-polar molecule", "nonpolar molecule", "molecule is non", "non-polar overall", "overall non", "whole molecule", "ch4 is non", "methane is non", "re:(?<!c[–-]h )(?<!bond )non[- ]?polar"] },
          { d: "Two reasons: bonds ~non-polar AND tetrahedral shape fully symmetric", k: ["symmetry", "symmetrical", "tetrahedr", "cancel", "equal", "four bond", "4 bond"] } ],
        key: "<ul><li>Electron domains: <b>4</b> (four C–H, no lone pairs)</li><li>Domain & molecular geometry: <b>tetrahedral</b></li><li>Bond angle: <b>109.5°</b></li><li>Bond polarity: C–H essentially non-polar (ΔEN 0.35)</li><li>Molecular polarity: <b>non-polar</b> — bonds nearly non-polar AND perfectly symmetric tetrahedron (both layers needed).</li></ul>" },
      { marks: 7,
        prompt: "<strong>CH₃Cl (chloromethane)</strong><br>CH₃Cl has the same tetrahedral arrangement as CH₄, yet it is polar. Explain.",
        rubric: [
          { d: "Electron domains around C: 4 (three C–H + one C–Cl, no lone pairs)", k: ["4 electron", "four electron", "4 domain", "four domain", "4 region", "four region"] },
          { d: "Electron domain geometry: tetrahedral", k: ["tetrahedral"] },
          { d: "Molecular geometry: tetrahedral", k: ["tetrahedral"] },
          { d: "Bond angle ≈109.5° (slightly distorted)", k: ["109.5", "109"] },
          { d: "C–Cl strongly polar (ΔEN = 0.61); Cδ⁺–Clδ⁻; C–H nearly non-polar", k: ["polar", "δ", "delta", "0.61"] },
          { d: "Molecule overall: polar", k: ["re:(?<!non[- ]?)polar"] },
          { d: "Substituting one H by Cl breaks the symmetry; C–Cl dipole not cancelled, net dipole toward Cl", k: ["symmetry", "symmetrical", "asymmetr", "not cancel", "not balance", "do not cancel", "cannot cancel", "no cancel", "toward cl", "towards cl", "toward the cl", "chlorine end", "toward chlorine", "different substituent", "different atom", "unequal", "not equal"] } ],
        key: "<ul><li>Electron domains: <b>4</b> (three C–H + one C–Cl)</li><li>Domain & molecular geometry: <b>tetrahedral</b></li><li>Bond angle: <b>≈109.5°</b> (slightly distorted)</li><li>Bond polarity: C–Cl strongly polar (ΔEN 0.61); Cδ⁺–Clδ⁻</li><li>Molecular polarity: <b>polar</b> — replacing one H with Cl breaks the symmetry; C–Cl dipole not cancelled, net dipole toward Cl.</li></ul>" },
      { marks: 7,
        prompt: "<strong>NH₃ (ammonia)</strong><br>Predict the geometry and bond angle of NH₃, and explain why the bond angle is smaller than that of a perfect tetrahedron.",
        rubric: [
          { d: "Electron domains around N: 4 (three N–H bonds + 1 lone pair)", k: ["4 electron", "four electron", "4 domain", "four domain", "lone pair", "3 bond", "three bond"] },
          { d: "Electron domain geometry: tetrahedral", k: ["tetrahedral"] },
          { d: "Molecular geometry: trigonal pyramidal", k: ["pyramidal"] },
          { d: "Bond angle ≈107°", k: ["107"] },
          { d: "N–H bonds polar (ΔEN = 0.84); Nδ⁻–Hδ⁺", k: ["polar", "δ", "delta"] },
          { d: "Molecule overall: polar", k: ["re:(?<!non[- ]?)polar"] },
          { d: "Lone pair repels bonding pairs more strongly → angle compressed to 107° (< 109.5°)", k: ["lone pair", "repel", "repulsion", "compress", "less than 109", "<109", "smaller than"] } ],
        key: "<ul><li>Electron domains: <b>4</b> (three N–H + <b>1 lone pair</b>)</li><li>Domain geometry: <b>tetrahedral</b>; molecular geometry: <b>trigonal pyramidal</b></li><li>Bond angle: <b>≈107°</b></li><li>Bond polarity: N–H polar (ΔEN 0.84)</li><li>Molecular polarity: <b>polar</b> — pyramidal, three N–H dipoles don't cancel.</li><li>Angle smaller than 109.5° because the lone pair repels bonding pairs more strongly.</li></ul>" },
      { marks: 7,
        prompt: "<strong>H₂O (water)</strong><br>Predict the geometry and bond angle of H₂O, and explain why the bond angle is smaller than that of NH₃.",
        rubric: [
          { d: "Electron domains around O: 4 (two O–H bonds + 2 lone pairs)", k: ["lone pair", "4 electron", "four electron", "4 domain", "four domain", "2 bond", "two bond"] },
          { d: "Electron domain geometry: tetrahedral", k: ["tetrahedral"] },
          { d: "Molecular geometry: bent (V-shaped)", k: ["bent", "v-shaped", "v shaped", "angular"] },
          { d: "Bond angle ≈104.5°", k: ["104.5", "104", "105"] },
          { d: "O–H highly polar (ΔEN = 1.24); Oδ⁻–Hδ⁺", k: ["polar", "δ", "delta"] },
          { d: "Molecule overall: polar", k: ["re:(?<!non[- ]?)polar"] },
          { d: "Two lone pairs repel more than NH₃'s one → angle smaller than 107°", k: ["two lone", "2 lone", "lone pair", "repel", "repulsion", "smaller than", "less than 107", "<107", "more repul", "greater repul"] } ],
        key: "<ul><li>Electron domains: <b>4</b> (two O–H + <b>2 lone pairs</b>)</li><li>Domain geometry: <b>tetrahedral</b>; molecular geometry: <b>bent</b></li><li>Bond angle: <b>≈104.5°</b></li><li>Bond polarity: O–H highly polar (ΔEN 1.24)</li><li>Molecular polarity: <b>polar</b> — bent shape, dipoles don't cancel.</li><li>Angle < NH₃'s 107° because two lone pairs repel more than one. Order: CH₄ 109.5° → NH₃ 107° → H₂O 104.5°.</li></ul>" },
      { marks: 7,
        prompt: "<strong>CCl₄ (tetrachloromethane)</strong><br>Each C–Cl bond in CCl₄ is strongly polar. Explain why CCl₄ is nevertheless a non-polar molecule, contrasting it with CH₃Cl.",
        rubric: [
          { d: "Electron domains around C: 4 (four C–Cl bonds, no lone pairs)", k: ["4 electron", "four electron", "4 domain", "four domain", "4 region", "four region", "four bond", "4 bond"] },
          { d: "Electron domain geometry: tetrahedral", k: ["tetrahedral"] },
          { d: "Molecular geometry: tetrahedral", k: ["tetrahedral"] },
          { d: "Bond angle: 109.5°", k: ["109.5", "109"] },
          { d: "C–Cl bonds strongly polar (ΔEN = 0.61); Cδ⁺–Clδ⁻", k: ["polar", "δ", "delta"] },
          { d: "Molecule overall: non-polar", k: ["non-polar", "nonpolar", "non polar"] },
          { d: "Four identical dipoles cancel in 3-D tetrahedral symmetry; in CH₃Cl one dipole differs so cancellation fails", k: ["cancel", "symmetry", "symmetrical", "sum to zero", "add to zero", "vector", "balance", "equal", "ch3cl"] } ],
        key: "<ul><li>Electron domains: <b>4</b> (four C–Cl)</li><li>Domain & molecular geometry: <b>tetrahedral</b></li><li>Bond angle: <b>109.5°</b></li><li>Bond polarity: C–Cl strongly polar (ΔEN 0.61)</li><li>Molecular polarity: <b>non-polar</b> — four identical dipoles cancel in 3-D symmetry; in CH₃Cl one dipole differs so cancellation fails.</li></ul>" }
    ]
  }
];
let PREIB_FRQ_CH = PREIB_FRQ_SETS;

/* ---------- Pre-IB FRQ sets from the Cambridge coursebook (teacher-marked) ----------
   The questions are the Cambridge "Test your understanding" sets of Structure 2 (Ch. 6–9, SL).
   Students type answers and sketch structures; nothing is auto-marked here — each submission
   goes to the cloud (kind frqT) and the teacher marks it and records grades on ManageBac. */
const CAM_INTRO = `<b>Cambridge practice questions — marked by your teacher.</b>
  <ol class="frqol">
    <li>The questions themselves are shown as images from the coursebook (Structure 2, chapters 6–9).</li>
    <li>Type your answers in the boxes; for "draw" parts, use the sketch pad (finger / Apple Pencil / mouse both work).</li>
    <li>Marks for each question are shown in brackets. Submit when finished — you will get your mark from your teacher, not from the site.</li>
    <li>Your typed answers and sketches are saved automatically as you go.</li>
  </ol>`;
const PREIB_CAM_FRQ_SETS = [
  { id: "preib-frq-ionic", title: "Bonding Practice Qs · Ionic Model (Cambridge Ch. 6)", level: "Pre-IB", level2: "SL", paper: "FRQ",
    marking: "teacher", _src: ["preib-frq"], intro: CAM_INTRO,
    questions: [
      { marks: 6, img: "img/preib-frq/A1.jpg", sketch: false, prompt: "Q1 · For each compound, state whether the bonding is ionic or covalent (1 mark each)." },
      { marks: 16, img: "img/preib-frq/A2.jpg", sketch: true, prompt: "Q2 · Write the formula of each compound (1 mark each). Sketch any you prefer to draw." },
      { marks: 5, img: "img/preib-frq/A3.jpg", sketch: false, prompt: "Q3 · True or false for each statement (a–e), with the correction for any false statement." },
      { marks: 5, img: "img/preib-frq/A4.jpg", sketch: false, prompt: "Q4 · Arrange in order of increasing lattice enthalpy (smallest first) and justify in one sentence." }
    ] },
  { id: "preib-frq-lewis", title: "Bonding Practice Qs · Covalent Bonds & Lewis (Cambridge Ch. 7 §7.1)", level: "Pre-IB", level2: "SL", paper: "FRQ",
    marking: "teacher", _src: ["preib-frq"], intro: CAM_INTRO,
    questions: [
      { marks: 11, img: "img/preib-frq/B1.jpg", sketch: true, prompt: "Q1 · Work out the Lewis formula of each species (a–k). Use the sketch pad — dot-and-cross or lines both accepted." },
      { marks: 3, img: "img/preib-frq/B2.jpg", sketch: false, prompt: "Q2–4 · Shortest / longest bond length questions — name the species and justify with bond order." },
      { marks: 25, img: "img/preib-frq/B3.jpg", sketch: true, prompt: "Q5–8 · Coordination bonds, incomplete octets, lone-pair counts, and Lewis formulas of the nitrogen species (draw the formulas)." }
    ] },
  { id: "preib-frq-shapes", title: "Bonding Practice Qs · Shapes & Polarity (Cambridge Ch. 7 §7.2–7.6)", level: "Pre-IB", level2: "SL", paper: "FRQ",
    marking: "teacher", _src: ["preib-frq"], intro: CAM_INTRO,
    questions: [
      { marks: 24, img: "img/preib-frq/C1.jpg", sketch: true, prompt: "Q9 · Shape AND bond angle for each molecule/ion (a–l): 1 mark for the shape, 1 for the angle. Draw the 3-D shape (wedge–dash) for any two." },
      { marks: 15, img: "img/preib-frq/C2.jpg", sketch: true, prompt: "Q10–11 · Smaller H–X–H angles (a–g) and the trigonal-planar domain species." },
      { marks: 12, img: "img/preib-frq/C3.jpg", sketch: true, prompt: "Q12–13 · Electronegativity order, then polar molecules with their dipoles drawn (use the sketch pad)." }
    ] },
  { id: "preib-frq-imf", title: "Bonding Practice Qs · Intermolecular Forces & Properties (Cambridge Ch. 7 §7.7–7.10)", level: "Pre-IB", level2: "SL", paper: "FRQ",
    marking: "teacher", _src: ["preib-frq"], intro: CAM_INTRO,
    questions: [
      { marks: 13, img: "img/preib-frq/D1.jpg", sketch: true, prompt: "Q14–16 · Higher boiling point in each pair (justify), the hydrogen-bonding diagram (draw it), and which molecules hydrogen-bond." },
      { marks: 7, img: "img/preib-frq/D2.jpg", sketch: false, prompt: "Q17 · Arrange each set in order of increasing boiling point (a–g), lowest first." },
      { marks: 9, img: "img/preib-frq/D3.jpg", sketch: false, prompt: "Q18–20 · Solubility comparisons and the TLC/Rf calculations." },
      { marks: 6, img: "img/preib-frq/D4.jpg", sketch: false, prompt: "Q21–22 · Boiling point and solubility orders across structure types." }
    ] },
  { id: "preib-frq-metal", title: "Bonding Practice Qs · Metals, Alloys & Polymers (Cambridge Ch. 8–9)", level: "Pre-IB", level2: "SL", paper: "FRQ",
    marking: "teacher", _src: ["preib-frq"], intro: CAM_INTRO,
    questions: [
      { marks: 8, img: "img/preib-frq/E1.jpg", sketch: false, prompt: "Ch. 8 Q1–2 · True/false on metallic bonding and the melting-point orders." },
      { marks: 3, img: "img/preib-frq/E2.jpg", sketch: false, prompt: "Ch. 8 Q3 · True/false on transition metals." },
      { marks: 6, img: "img/preib-frq/E3.jpg", sketch: false, prompt: "Ch. 9 Q1 · Place each substance in the bonding triangle (state Δχ and the average χ you used)." },
      { marks: 3, img: "img/preib-frq/E4.jpg", sketch: false, prompt: "Ch. 9 Q2 · True/false on alloys." },
      { marks: 5, img: "img/preib-frq/E5.jpg", sketch: false, prompt: "Ch. 9 Q3–4 · Plastics: state and explain; then which of plastics A and B is denser / more flexible." },
      { marks: 8, img: "img/preib-frq/E6.jpg", sketch: true, prompt: "Ch. 9 Q5–6 · Draw the repeating units (a–e) and the monomers (a, b) — use the sketch pad." }
    ] }
];
PREIB_FRQ_CH = PREIB_FRQ_SETS.concat(PREIB_CAM_FRQ_SETS);

/* ---------- FRQ auto-marking ---------- */
function normAns(t) { return String(t || "").toLowerCase().replace(/[\u2018\u2019]/g, "'"); }
function hitKw(t, kw) {
  if (kw.slice(0, 3) === "re:") { try { return new RegExp(kw.slice(3)).test(t); } catch (e) { return false; } }
  return t.indexOf(kw) > -1;
}
function gradeFRQ(q, ans) {
  const t = normAns(ans);
  const points = q.rubric.map(r => ({ d: r.d, ok: r.k.some(k => hitKw(t, k)) }));
  return { points, s: points.filter(p => p.ok).length };
}

function activeChapters() {
  if (state.browse.level !== "Pre-IB") return QUIZ_DATA.chapters;
  const list = state.browse.paper === "FRQ" ? PREIB_FRQ_CH : PREIB_CH;
  return list.filter(c => !c.retired);
}

/* ---------- cloud reporting (Tencent CloudBase, optional) ---------- */
/* If cloud-config.js has an env id, every finished attempt is stored in the
   "attempts" table (CloudBase PostgreSQL) so the teacher can see results without score codes. */
let _tcbApp = null;
async function tcbReady() {
  if (typeof TCB_ENV === "undefined" || !TCB_ENV || typeof cloudbase === "undefined") return null;
  if (!_tcbApp) {
    _tcbApp = cloudbase.init({ env: TCB_ENV, region: (typeof TCB_REGION !== "undefined" && TCB_REGION) || "ap-shanghai" });
    const r = await _tcbApp.auth.signInAnonymously();
    if (r && r.error) throw r.error;
  }
  return _tcbApp;
}
function cloudReportAsync(data) {
  const send = d => tcbReady()
    .then(app => app && app.rdb().from("attempts").insert(d))
    .then(r => { if (r && r.error) throw r.error; });
  return send(data).catch(err => {
    if (data.data === undefined) throw err;
    return send(Object.assign({}, data, { data: undefined })).catch(() => { throw err; });   // table without the "data" column
  });
}
function cloudReport(data) {
  cloudReportAsync(data)
    .catch(err => console.warn("cloud report skipped:", err && err.message || err));
}
/* Attempts finished before cloud reporting existed live only in this browser's
   localStorage (latest one per chapter). Upload each of them once, on page load. */
function levelKeyOf(ch) { return ch.id.indexOf("preib-") === 0 ? "Pre-IB" : (ch.level2 || "SL"); }
function cloudMarkSynced(id, date) { localStorage.setItem("cloudsync:attempt:" + id, String(date)); }
async function backfillLocalAttempts() {
  try {
    if (typeof TCB_ENV === "undefined" || !TCB_ENV || typeof cloudbase === "undefined") return;
    const name = (localStorage.getItem("stuName") || "").trim();
    if (!name) return;
    const byId = {};
    [QUIZ_DATA.chapters, PREIB_CH, PREIB_FRQ_CH].forEach(list => (list || []).forEach(c => { byId[c.id] = c; }));
    const cls = currentClass();
    const pend = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || k.indexOf("attempt:") !== 0) continue;
      let saved = null;
      try { saved = JSON.parse(localStorage.getItem(k) || "null"); } catch (e) {}
      if (!saved || saved.score === undefined) continue;
      if (localStorage.getItem("cloudsync:" + k) === String(saved.date)) continue;
      pend.push({ id: k.slice(8), saved });
    }
    for (const p of pend) {
      const ch = byId[p.id] || { id: p.id, title: p.id };
      const s = p.saved;
      await cloudReportAsync({
        n: name, cls: cls, ch: p.id, title: ch.title || p.id,
        level: levelKeyOf(ch), paper: ch.paper || (s.kind === "frq" ? "FRQ" : s.kind === "p2" ? "P2" : "MCQ"),
        s: +s.score || 0, t: +s.total || 0,
        data: JSON.stringify(s),
        detail: s.kind === "frq" && s.results ? s.results.map(r => (r && r.s) || 0).join("-")
          : s.kind === "p2" && s.marks ? (ch.questions || []).map((q, qi) => { const m = s.marks[qi]; return m ? m.g + "/" + m.t : "0/0"; }).join("-")
          : "",
        date: s.date || ""
      });
      cloudMarkSynced(p.id, s.date);
    }
  } catch (err) {
    console.warn("cloud backfill stopped:", err && err.message || err);
  }
}

/* ---------- student accounts (name + PIN) and cross-device history ---------- */
/* An account is one row in the cloud table "students": name, class and a PIN hash. Signing in
   personalises this page (a static site cannot enforce anything server-side): it fixes the name used
   for submissions, refuses submissions under a name that already belongs to an account, and lists
   every attempt stored for that name, restoring the answers so they can be reviewed. */
function cloudOn() { return typeof TCB_ENV !== "undefined" && !!TCB_ENV && typeof cloudbase !== "undefined"; }
function session() {
  let v = null;
  try { v = JSON.parse(localStorage.getItem("session") || "null"); } catch (e) {}
  return v && v.n && v.name ? v : null;       // older sessions without a display name are signed out
}
function setSession(v) { v ? localStorage.setItem("session", JSON.stringify(v)) : localStorage.removeItem("session"); }
async function dbRows(table, filters) {
  const app = await tcbReady();
  if (!app) throw new Error("Cloud storage is not configured.");
  let q = app.rdb().from(table).select("*");
  Object.keys(filters || {}).forEach(k => { q = q.eq(k, filters[k]); });
  const r = await q;
  if (r.error) throw r.error;
  return r.data || [];
}
async function hasAccount(name) {
  if (!cloudOn() || !name) return false;
  try { return (await dbRows("students", { name: name })).length > 0; }
  catch (e) { return false; }                 // accounts not available: do not block anyone
}
function nowStamp() {
  const d = new Date(), p = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function fmtWhen(v) {
  if (!v) return "";
  const d = new Date(String(v).indexOf("T") > -1 ? v : String(v).replace(" ", "T"));
  if (isNaN(d)) return String(v);
  const p = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function findChapter(id) {
  for (const list of [PREIB_CH, PREIB_FRQ_CH]) {
    const c = list.find(x => x.id === id);
    if (c) return c;
  }
  return QUIZ_DATA.chapters.find(x => x.id === id) || null;
}
function openAccount() { state.view = "account"; render(); window.scrollTo(0, 0); }
function signOut() { setSession(null); state.name = ""; refreshOwned(); refreshAssigned(); goHome(); }
let pwJustChanged = false;
function renderAccount() {
  const s = session();
  if (s) {
    const askPassword = !s.changed && !s.pwSkip;
    app.innerHTML = `
  <header class="site small"><div class="inner">
    <div class="back" onclick="goHome()">← Back</div>
    <h1>My history</h1>
    <p>Signed in as <b>${escHTML(s.name)}</b> <span class="meta">(${escHTML(s.n)})</span> · <a class="tlink" onclick="signOut()">sign out</a></p>
  </div></header>
  <main class="wrap">
    ${pwJustChanged ? `<section class="card"><div class="meta"><b>Your password has been changed.</b> Use the new one next time you sign in.</div></section>` : ""}
    ${askPassword ? `<section class="card">
      <div class="listhead">Choose your own password</div>
      <p class="footnote" style="margin-top:4px">Your account still uses the class starting password, which everyone knows. Pick a password of your own to keep your results private — you can do this <b>once</b>.</p>
      <div class="namebar">
        <input type="password" id="np1" autocomplete="new-password" placeholder="New password (4–32 characters)">
        <input type="password" id="np2" autocomplete="new-password" placeholder="Repeat new password">
        <button onclick="changePassword()">Save new password</button>
        <a class="tlink" style="margin-left:8px" onclick="skipPasswordChange()">not now</a>
      </div>
      <div class="meta" id="pwErr" style="color:#9B2C2C; min-height:20px"></div>
    </section>` : ""}
    <section class="card"><div id="historyBox"><div class="meta">Loading your attempts…</div></div></section>
  </main>`;
    pwJustChanged = false;
    loadHistory();
    return;
  }
  app.innerHTML = `
  <header class="site small"><div class="inner">
    <div class="back" onclick="goHome()">← Back</div>
    <h1>Student sign-in</h1>
    <p>Use the email address your teacher has on the class roster.</p>
  </div></header>
  <main class="wrap">
    <section class="card">
      <div class="namebar"><label for="accEmail">Email</label>
        <input type="email" id="accEmail" autocomplete="username" placeholder="name@example.com" value="${escAttr(localStorage.getItem("accEmail") || "")}" onkeydown="if (event.key === 'Enter') accountSignIn()"></div>
      <div class="namebar"><label for="accPass">Password</label>
        <input type="password" id="accPass" autocomplete="current-password" placeholder="Password" onkeydown="if (event.key === 'Enter') accountSignIn()">
        <button onclick="accountSignIn()">Sign in</button></div>
      <div class="meta" id="accErr" style="color:#9B2C2C; min-height:20px"></div>
      <div class="footnote" style="border:0; padding:6px 0 0">Accounts are set up by your teacher. The starting password is <b>123456</b>; you will be asked to choose your own the first time you sign in. Keep your password private — anyone who knows it can sign in as you.</div>
    </section>
  </main>`;
}
async function accountSignIn() {
  const errEl = document.getElementById("accErr");
  const emailEl = document.getElementById("accEmail"), passEl = document.getElementById("accPass");
  const email = MB_email(emailEl.value), pass = passEl.value;
  errEl.textContent = "";
  if (email.indexOf("@") < 1) { errEl.textContent = "Please enter your school email address."; emailEl.focus(); return; }
  if (!pass) { errEl.textContent = "Please enter your password."; passEl.focus(); return; }
  if (!cloudOn()) { errEl.textContent = "Accounts are not available right now (cloud storage is off)."; return; }
  document.querySelectorAll("button").forEach(b => { b.disabled = true; });
  try {
    let rows = [];
    try { rows = await dbRows("students", { n: email }); }
    catch (e) {
      errEl.textContent = "Accounts are not available right now (" + (e.code || e.message || e) + ").";
      return;
    }
    if (!rows.length) {
      errEl.textContent = "No account exists for " + email + ". Accounts are created by your teacher — check the address you typed (it is the one on the class roster).";
      return;
    }
    if (rows[0].pin !== await MB_pinHash(email, pass)) {
      errEl.textContent = "That password does not match this account.";
      passEl.focus();
      return;
    }
    localStorage.setItem("accEmail", email);
    const name = rows[0].name || email;
    setSession({ n: email, name: name, changed: !!rows[0].changed, cls: rows[0].cls || "", t: Date.now() });
    localStorage.setItem("stuName", name);
    state.name = name;
    refreshOwned();
    refreshAssigned();
    renderAccount();
  } catch (e) {
    errEl.textContent = "Sign-in failed: " + (e.message || e);
  } finally {
    document.querySelectorAll("button").forEach(b => { b.disabled = false; });
  }
}
function skipPasswordChange() {
  setSession(Object.assign({}, session(), { pwSkip: true }));
  renderAccount();
}
async function changePassword() {
  const me = session(), errEl = document.getElementById("pwErr");
  const p1 = document.getElementById("np1").value, p2 = document.getElementById("np2").value;
  errEl.textContent = "";
  if (!MB_validPassword(p1)) { errEl.textContent = "Use 4 to 32 characters: letters, digits or !@#$%^&*_.-"; return; }
  if (p1 === MB_DEFAULT_PASSWORD) { errEl.textContent = "Choose a different password from the starting one."; return; }
  if (p1 !== p2) { errEl.textContent = "The two passwords do not match."; document.getElementById("np2").focus(); return; }
  if (!cloudOn()) { errEl.textContent = "Accounts are not available right now."; return; }
  document.querySelectorAll("button").forEach(b => { b.disabled = true; });
  try {
    const app = await tcbReady();
    const r = await app.rdb().from("students").update({ pin: await MB_pinHash(me.n, p1), changed: true }).eq("n", me.n);
    if (r.error) throw r.error;
    setSession({ n: me.n, name: me.name, changed: true, t: me.t });
    pwJustChanged = true;
    renderAccount();
  } catch (e) {
    errEl.textContent = "Could not save the new password: " + (e.message || e);
  } finally {
    document.querySelectorAll("button").forEach(b => { b.disabled = false; });
  }
}
async function loadHistory() {
  const box = document.getElementById("historyBox"), me = session();
  if (!box || !me) return;
  let rows = [];
  try {
    const app = await tcbReady();
    let skip = 0;
    while (true) {                                   // newest first, 1000 rows at a time
      const r = await app.rdb().from("attempts").select("*").eq("n", me.name).order("id", { ascending: false }).range(skip, skip + 999);
      if (r.error) throw r.error;
      const part = r.data || [];
      rows = rows.concat(part);
      if (part.length < 1000 || skip >= 9000) break;
      skip += 1000;
    }
  } catch (e) {
    box.innerHTML = `<div class="meta" style="color:#9B2C2C">Could not load your attempts: ${escHTML(e.message || String(e))}</div>`;
    return;
  }
  const seen = {};
  const items = rows.map(r => {
    const ch = findChapter(r.ch), latest = !seen[r.ch];
    seen[r.ch] = true;
    const lvl = ch ? (ch.id.indexOf("preib-") === 0 ? "Pre-IB" : LEVEL_LABELS[ch.level2 || "SL"]) : (LEVEL_LABELS[r.level] || r.level || "");
    const isMCQ = (ch ? ch.paper : r.paper) === "MCQ" || (ch ? ch.paper : r.paper) === undefined;
    const restorable = !!ch && (isMCQ || !!r.data);     // multiple choice can always be reopened (chosen letters, or just the key)
    const action = restorable
      ? `<button class="ghost" data-row="${escAttr(JSON.stringify(r))}" onclick="reviewFromHistory(this)">${latest ? "Review" : "View"}</button>`
      : `<span class="meta">score only</span>`;
    return `<div class="chapter${ch && !isAllowed(ch) ? " locked" : ""}">
      <div class="chapter-main"><div class="chapter-no small">${latest ? "latest" : "earlier"}</div>
        <div><h3>${escHTML(r.title || r.ch)}</h3>
          <div class="meta">${escHTML(lvl)} · ${fmtWhen(r.date || r.created_at)}</div></div>
      </div>${action}<div class="badge">${+r.s || 0}/${+r.t || 0}</div></div>`;
  });
  box.innerHTML = rows.length
    ? `<div class="meta" style="margin-bottom:10px">${rows.length} attempt${rows.length === 1 ? "" : "s"} on record · newest first</div>${items.join("")}`
    : `<div class="meta">Nothing is stored for your name yet. Finish a quiz and it will appear here.</div>`;
}
function reviewFromHistory(el) {
  let r;
  try { r = JSON.parse(el.dataset.row); } catch (e) { return; }
  const ch = findChapter(r.ch);
  if (!ch) { alert("This quiz is no longer available."); return; }
  if (!isAllowed(ch)) { alert("This quiz is not unlocked by the access code on this device."); return; }
  const kind = ch.paper === "FRQ" ? (ch.marking === "teacher" ? "frqT" : "frq") : isStructPaper(ch.paper) ? "p2" : "mcq";
  let saved = null;
  try { saved = r.data ? JSON.parse(r.data) : null; } catch (e) {}
  if (!saved && kind === "mcq") {                   // rows written before full answers were stored
    saved = { answers: {} };
    const answers = {};
    String(r.detail).split("").forEach((c, i) => { const k = "ABCD".indexOf(c); if (k > -1) answers[i] = k; });
    saved = { answers };
  }
  if (!saved || !saved.answers) { alert("This earlier attempt only kept the score, not your answers."); return; }
  state.browse = { level: ch.id.indexOf("preib-") === 0 ? "Pre-IB" : (ch.level2 || "SL"), paper: ch.paper || "MCQ" };
  const idx = activeChapters().indexOf(ch);
  if (idx < 0) { alert("This quiz could not be opened."); return; }
  state = Object.assign({}, state, { view: "quiz", chapter: idx, name: session().name, answers: saved.answers || {},
    marks: saved.marks || {}, sketches: saved.sketches || {}, frqResults: saved.results || null, page: 0, submitted: true, marking: false,
    reviewDate: r.date || "", reviewOnly: true, teacherMarking: kind === "frqT" });
  render(); window.scrollTo(0, 0);
}

/* ---------- quizzes the student has already finished ---------- */
/* The teacher hands out a new access code for each task, so earlier chapters drop out of the code.
   A quiz the student has finished (saved on this device, or on record for their account) stays
   open for them; chapters that were never assigned and never done remain locked. */
let ownedIds = new Set();
function refreshOwned() {
  ownedIds = new Set();
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.indexOf("attempt:") === 0) ownedIds.add(k.slice(8));
  }
  const me = session();
  if (me && cloudOn()) {
    dbRows("attempts", { n: me.name }).then(rows => {
      rows.forEach(r => { if (r.ch) ownedIds.add(r.ch); });
      if (state.view === "home") render();
    }).catch(() => {});
  }
}

/* ---------- tasks the teacher has assigned to the student's class ---------- */
/* Rows of the cloud table "assignments": one per (class, quiz). Read after sign-in; they open the
   quiz for every signed-in student of that class until the teacher removes the row. */
let assignedIds = new Set(), assignedList = [];
function refreshAssigned() {
  assignedIds = new Set(); assignedList = [];
  const me = session();
  if (!me || !cloudOn()) return Promise.resolve();
  return (async () => {
    if (!me.cls) {                                  // sessions saved before the class was stored with them
      const acc = await dbRows("students", { n: me.n });
      if (!acc.length || !acc[0].cls) return;
      me.cls = acc[0].cls;
      setSession(me);
    }
    const rows = await dbRows("assignments", { cls: me.cls }).catch(() => []);
    rows.slice().sort((x, y) => (+x.id || 0) - (+y.id || 0)).forEach(r => {
      if (r.ch && !assignedIds.has(r.ch)) { assignedIds.add(r.ch); assignedList.push(r); }
    });
  })().then(() => { if (state.view === "home") render(); }).catch(() => {});
}
function openById(id) {
  if (id.indexOf("course:") === 0) { openCourse(id.slice(7)); return; }
  const ch = findChapter(id);
  if (!ch || !isAllowed(ch)) { lockedClick(); return; }
  state.browse = { level: levelKeyOf(ch), paper: ch.paper || "MCQ" };
  const idx = activeChapters().indexOf(ch);
  if (idx < 0) return;
  openChapter(idx);
}
function tasksHTML() {
  const head = `<div class="listhead">My tasks — set by your teacher</div>`;
  if (!assignedList.length) return head + `<div class="card tasks"><div class="meta">No task has been set for your class yet. Check back after your lesson.</div></div>`;
  const items = assignedList.map(r => {
    const ch = findChapter(r.ch);
    const when = fmtWhen(r.created_at || r.date || "");
    const setOn = when ? " · set " + escHTML(when.slice(0, 10)) : "";
    if (!ch) {
      if (r.ch.indexOf("course:") === 0) {
        const c = COURSES.find(x => x.rule === r.ch);
        if (c) return `<div class="chapter task" onclick="openById('${escAttr(r.ch)}')">
          <div class="chapter-main"><div class="chapter-no small">Topical Learning</div>
            <div><h3>${escHTML(c.title)}</h3>
              <div class="meta">interactive self-study course${setOn}</div></div>
          </div><div class="badge">Open</div></div>`;
      }
      return "";
    }
    return `<div class="chapter task" onclick="openById('${escAttr(r.ch)}')">
      <div class="chapter-main"><div class="chapter-no small">${escHTML(LEVEL_LABELS[levelKeyOf(ch)] || "")}</div>
        <div><h3>${escHTML(ch.title)}</h3>
          <div class="meta">${escHTML(paperLabel(levelKeyOf(ch), ch.paper || "MCQ"))} · ${ch.questions.length} questions${setOn}</div></div>
      </div><div class="badge">Open</div></div>`;
  }).join("");
  return head + items;
}

/* ---------- access codes ---------- */
function hash6(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}
function b64urlEnc(s) {
  return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlDec(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  return decodeURIComponent(escape(atob(s + "===".slice((s.length + 3) % 4))));
}
function encodeAccess(cls, allow) {
  const payload = JSON.stringify({ c: cls, a: allow });
  return "IBQ." + b64urlEnc(payload) + "." + hash6(payload);
}
function decodeAccess(code) {
  const parts = String(code || "").trim().split(".");
  if (parts.length !== 3 || parts[0] !== "IBQ") throw new Error("format");
  const payload = b64urlDec(parts[1]);
  if (hash6(payload) !== parts[2]) throw new Error("checksum");
  return JSON.parse(payload);
}
function getAccess() {
  let a = null;
  try { a = JSON.parse(localStorage.getItem("access") || "null"); } catch (e) { return null; }
  // An all-chapters code only works for the teacher. Students used to get such codes; tasks are now
  // assigned per class instead (teacher.html section 1), so an old one stored on a student's device unlocks nothing.
  if (a && Array.isArray(a.allow) && a.allow[0] === "*" && a.cls !== "TEACHER") { localStorage.removeItem("access"); return null; }
  return a;
}
function currentClass() { return (session() && session().cls) || (getAccess() || {}).cls || ""; }
function isAllowed(ch) {
  if (ownedIds.has(ch.id) || assignedIds.has(ch.id)) return true;   // finished earlier, or assigned to the class
  if (ch._src && ch._src.some(id => assignedIds.has(id))) return true;
  const a = getAccess();
  if (!a) return false;
  if (a.allow[0] === "*") return true;
  if (ch._src) return ch._src.some(id => a.allow.indexOf(id) > -1);
  return a.allow.indexOf(ch.id) > -1;
}
function applyCode() {
  const input = document.getElementById("accessInput");
  try {
    const obj = decodeAccess(input.value);
    if (obj.a[0] === "*" && obj.c !== "TEACHER") {
      alert("This all-chapters code is for the teacher only. Sign in with your school email instead: the tasks your teacher has assigned to your class are open for you.");
      return;
    }
    localStorage.setItem("access", JSON.stringify({ cls: obj.c, allow: obj.a }));
    render();
  } catch (e) {
    alert("That code is not valid. Please check it and try again.");
    input.focus();
  }
}
function clearAccess() {
  localStorage.removeItem("access");
  render();
}
function lockedClick() {
  alert("This section is locked. Please enter the access code your teacher gave you.");
  const el = document.getElementById("accessInput");
  if (el) el.focus();
}

/* ---------- Topical Learning: interactive self-study courses ---------- */
/* Courses live in topical-learning/<slug>/ next to this app and open in a new tab. The teacher
   opens them for a whole class exactly like a quiz task: teacher.html section 1 writes an
   assignments row with ch = "course:<id>"; nothing is open for students until that row exists. */
const COURSES = [
  { id: "tl-s32", rule: "course:tl-s32", path: "topical-learning/s32-organic-structure/index.html",
    tag: "S3.2", title: "Organic Chemistry — Structure",
    meta: "Self-study course · Cambridge Ch.11 backbone · 5 modules · 30 worked examples, practice sets, 42 checkpoint questions · Apple Pencil sketching" },
  { id: "tl-s2bond", rule: "course:tl-s2bond", path: "topical-learning/s2-bonding/index.html",
    tag: "S2", title: "Chemical Bonding (Pre-IB)",
    meta: "Self-study course · Cambridge Ch.6–9 (SL) backbone · 6 parts · 13 interactive models, worked examples, checkpoint quizzes · Apple Pencil sketching" }
];
function courseAllowed(c) {
  if (assignedIds.has(c.rule)) return true;                    // the class was given the course as a task
  const a = getAccess();
  return !!a && (a.allow[0] === "*" || a.allow.indexOf(c.rule) > -1);
}
function openCourse(id) {
  const c = COURSES.find(x => x.id === id);
  if (!c || !courseAllowed(c)) { lockedClick(); return; }
  const base = location.pathname.replace(/\/[^\/]*$/, "/");   // folder this index.html lives in
  window.open(base + c.path, "_blank");
}
function renderTLHome() {
  const me = session(), acc = getAccess();
  const authBar = me
    ? `<div class="authbar"><button class="btn-auth light" onclick="openAccount()">My history</button><button class="btn-auth light" onclick="signOut()">Sign out</button></div>`
    : `<div class="authbar"><button class="btn-auth" onclick="openAccount()">Sign in</button></div>`;
  const levelTabs = LEVELS.map(l =>
    `<button class="pill${l === "TL" ? " on" : ""}" onclick="setLevel('${l}')">${LEVEL_LABELS[l] || l}</button>`).join("");
  const cards = COURSES.map(c => {
    const allowed = courseAllowed(c);
    return `<div class="chapter${allowed ? "" : " locked"}" onclick="${allowed ? `openCourse('${c.id}')` : "lockedClick()"}">
      <div class="chapter-main">
        <div class="chapter-no">${c.tag}</div>
        <div>
          <h3>${escHTML(c.title)}</h3>
          <div class="meta">${escHTML(c.meta)}</div>
        </div>
      </div>
      <div class="badge${allowed ? "" : " lock"}">${allowed ? "Open course" : "Locked"}</div>
    </div>`;
  }).join("");
  const openHere = COURSES.filter(courseAllowed).length;
  const accBar = `
    <div class="codebar">
      <div class="acc-status" id="accStatus">${me
        ? `Signed in to <b>${escHTML(me.cls || "your class")}</b> — the courses your teacher has opened for your class appear below`
        : `Locked — <b>sign in with your school email</b> and the courses your teacher opens for your class appear here`}</div>
    </div>
    ${me ? `<div id="taskBox">${tasksHTML()}</div>` : ""}`;
  app.innerHTML = `
  <header class="site"><div class="inner">
    ${authBar}
    <div class="kicker">${QUIZ_DATA.course} · Topic practice &amp; past papers</div>
    <h1>Choose your level and paper</h1>
    <p>Interactive self-study courses, opened for your class by your teacher. Real IB questions, by topic or as complete papers, stay in the other tabs.</p>
  </div></header>
  <main class="wrap">
    <div class="lvlrow">${levelTabs}</div>
    ${accBar}
    <div class="listhead">Topical Learning · interactive courses</div>
    ${cards}
    <div class="footnote">Each course is a full self-study unit: fill-in concept builders, worked examples from the Cambridge Coursebook with instant feedback, practice sets, checkpoint quizzes and free-hand sketching with Apple Pencil.<br><a class="tlink" href="teacher.html">Teacher view</a></div>
  </main>`;
}

function srcLabel(src) {
  if (/^Q\d+$/.test(src || "")) return "";               // past-paper sets: the number is already printed
  const m = /_(SL|HL)_(\w+?)_(\d{4})_Q(\d+)$/.exec(src || "");
  if (!m) return src || "";
  return `${m[3]} ${m[2]} · Q${m[4]}`;
}
function isRight(q, a) { return a !== undefined && a !== null && (a === q.answer || (q.alt || []).indexOf(a) > -1); }
function answerText(q) {
  return [q.answer].concat(q.alt || []).filter((v, i, arr) => arr.indexOf(v) === i).map(v => "ABCD"[v]).join(" / ");
}

function escAttr(s) { return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;"); }

function chapterStats(ch) {
  const saved = JSON.parse(localStorage.getItem("attempt:" + ch.id) || "null");
  return saved;
}

function render() {
  if (state.view === "home") renderHome();
  else if (state.view === "quiz") renderQuiz();
  else if (state.view === "account") renderAccount();
  else renderResult();
}

function renderHome() {
  if (state.browse.level === "TL") { renderTLHome(); return; }
  const { level, paper } = state.browse;
  const all = activeChapters();
  const group = all.map((ch, i) => ({ ch, i }))
    .filter(x => (x.ch.level2 || "SL") === (level === "Pre-IB" ? "SL" : level) && (x.ch.paper || "MCQ") === paper);
  const total = group.reduce((s, x) => s + x.ch.questions.length, 0);
  const hasBank = group.length > 0;
  const acc = getAccess();
  const me = session();
  const accLine = me
    ? `Signed in as <b>${escHTML(me.name)}</b> · <a class="tlink" onclick="openAccount()">My history</a> · <a class="tlink" onclick="signOut()">sign out</a>`
    : `<button class="btn-auth wide" onclick="openAccount()">Sign in with your school email</button>
       <div class="meta" style="margin-top:6px">Sign in to open the tasks your teacher sets for your class and to keep your results.</div>`;
  const authBar = ENTRY
    ? ""
    : me
    ? `<div class="authbar"><button class="btn-auth light" onclick="openAccount()">My history</button><button class="btn-auth light" onclick="signOut()">Sign out</button></div>`
    : `<div class="authbar"><button class="btn-auth" onclick="openAccount()">Sign in</button></div>`;

  const cards = group.filter(x => !x.ch.retired).map(x => {
    const ch = x.ch, i = x.i;
    const a = chapterStats(ch);
    const allowed = isAllowed(ch);
    const badge = !allowed
      ? `<div class="badge lock">Locked</div>`
      : (a ? `<div class="badge done">${a.score}/${a.total}</div>` : `<div class="badge">${ch.questions.length} Q</div>`);
    const isSub = ch.id.indexOf(".") > -1;
    const tag = isSub ? ch.id.replace("ch", "") : String(group.indexOf(x) + 1).padStart(2, "0");
    const groupLabel = ch.id === "ch4.1"
      ? `<div class="sublabel">Ch4 · Chemical Bonding &amp; Structure — split into three parts</div>` : "";
    return `${groupLabel}<div class="chapter${isSub ? " sub" : ""}${allowed ? "" : " locked"}"
      onclick="${allowed ? `openChapter(${i})` : "lockedClick()"}">
      <div class="chapter-main">
        <div class="chapter-no${isSub ? " small" : ""}">${tag}</div>
        <div>
          <h3>${ch.title}</h3>
          <div class="meta">${ch.level}${a ? " · last score " + a.score + "/" + a.total : ""}</div>
        </div>
      </div>${badge}
    </div>`;
  }).join("");

  const emptyCard = hasBank ? "" : `
    <div class="chapter placeholder">
      <div>
        <h3>No question bank here yet</h3>
        <div class="meta">${LEVEL_LABELS[level] || level} · ${paperLabel(level, paper)} — this section opens once the question bank is imported.</div>
      </div>
    </div>`;

  const codeRow = open => open
    ? `<div class="acc-row">
        <input type="text" id="accessInput" placeholder="Access code, e.g. IBQ.eyJjIjoiRFIyQSJ9.k3v2q" spellcheck="false">
        <button onclick="applyCode()">Unlock</button>
      </div>`
    : `<details class="codesmall"><summary>Or open a quiz with an access code</summary>
        <div class="acc-row" style="margin-top:8px">
          <input type="text" id="accessInput" placeholder="Access code, e.g. IBQ.eyJjIjoiRFIyQSJ9.k3v2q" spellcheck="false">
          <button onclick="applyCode()">Unlock</button>
        </div></details>`;
  const accBar = ENTRY
    ? `<div class="codebar"><div class="acc-status" id="accStatus">${acc
        ? `Open for you: <b>${acc.allow[0] === "*" ? "all chapters" : acc.allow.length + " chapter(s)"}</b> — results are kept on this device.`
        : `Chapters open here automatically once your teacher unlocks them for your account.`}</div></div>`
    : `
    <div class="codebar">
      <div class="acc-status" id="accStatus">${me
        ? `Signed in to <b>${escHTML(me.cls || "your class")}</b> — tasks your teacher has set for your class are open below`
        : acc
          ? `Unlocked as class <b>${escHTML(acc.cls)}</b> · ${acc.allow[0] === "*" ? "all chapters" : acc.allow.length + " chapter(s)"} <a class="tlink" onclick="clearAccess()">switch code</a>`
          : `Locked — <b>sign in</b> to open the tasks your teacher sets, or enter an access code`}</div>
      ${me ? "" : accLine}
      ${me && !acc ? "" : codeRow(me || acc)}
      ${me ? `<div class="accline" id="accLine">${accLine}</div>` : ""}
    </div>
    ${me ? `<div id="taskBox">${tasksHTML()}</div>` : ""}`;

  const paperTabs = (ENTRY ? ENTRY.papers : (LEVEL_PAPERS[level] || PAPERS)).map(p =>
    `<button class="tab${p === paper ? " on" : ""}" onclick="setPaper('${p}')">${paperLabel(level, p)}</button>`).join("");
  const levelTabs = (ENTRY ? ENTRY.levels : LEVELS).map(l =>
    `<button class="pill${l === level ? " on" : ""}" onclick="setLevel('${l}')">${LEVEL_LABELS[l] || l}</button>`).join("");
  const heading = `${LEVEL_LABELS[level] || level} · ${paperLabel(level, paper)}`;
  app.innerHTML = `
  <header class="site"><div class="inner">
    ${authBar}
    <div class="kicker">${QUIZ_DATA.course} · Topic practice &amp; past papers</div>
    <h1>${ENTRY ? "Choose your chapter" : "Choose your level and paper"}</h1>
    <p>${ENTRY
      ? "Real IB questions by syllabus unit. Chapters unlocked for your account open below — no extra sign-in needed."
      : "Real IB questions, by topic or as complete papers. Sign in with your school email to see the tasks your teacher sets."}</p>
  </div></header>
  <main class="wrap">
    <div class="lvlrow">${levelTabs}</div>
    <div class="tabs">${paperTabs}</div>
    ${accBar}
    ${level === "Pre-IB" && paper === "MCQ" ? preibLessonsHTML() : ""}
    <div class="listhead">${heading}${hasBank ? ` · ${total} questions` : ""}</div>
    ${cards}${emptyCard}
    <div class="footnote">Every question keeps its original diagram or structure, so figures stay exact. Your score is shown immediately after submission, with the correct answer for each question.${ENTRY ? "" : `<br><a class="tlink" href="teacher.html">Teacher view</a>`}</div>
  </main>`;
}

function escHTML(s) { return String(s).replace(/[<>&]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c])); }
function setLevel(l) {
  if (ENTRY && ENTRY.levels.indexOf(l) === -1) return;
  state.browse.level = l;
  const papers = ENTRY ? ENTRY.papers : (LEVEL_PAPERS[l] || PAPERS);
  if (papers.indexOf(state.browse.paper) === -1) state.browse.paper = ENTRY ? ENTRY.papers[0] : "MCQ";
  if (state.view !== "home") state.view = "home";
  render();
}
function setPaper(p) { if (ENTRY && ENTRY.papers.indexOf(p) === -1) return; state.browse.paper = p; if (state.view !== "home") state.view = "home"; render(); }

function openChapter(i) {
  const ch = activeChapters()[i];
  if (!isAllowed(ch)) { lockedClick(); return; }
  state = { view: "quiz", chapter: i, name: localStorage.getItem("stuName") || "", answers: {}, marks: {}, sketches: {}, page: 0, submitted: false, marking: false,
    browse: state.browse, frqResults: null, reviewDate: null, teacherMarking: ch.paper === "FRQ" && ch.marking === "teacher" };
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem("attempt:" + ch.id) || "null"); } catch (e) {}
  if (ch.paper === "FRQ" && ch.marking === "teacher" && saved && saved.kind === "frqT") {
    state.answers = saved.answers || {};
    state.sketches = saved.sketches || {};
    state.submitted = true;
    state.reviewDate = saved.date || "";
  }
  if (ch.paper === "FRQ" && ch.marking === "teacher" && !state.submitted) {
    let draft = null;
    try { draft = JSON.parse(localStorage.getItem("draft:" + ch.id) || "null"); } catch (e) {}
    if (draft) { state.answers = draft.answers || {}; state.sketches = draft.sketches || {}; }
  }
  if (ch.paper === "FRQ" && saved && saved.kind === "frq") {
    state.answers = saved.answers || {};
    state.frqResults = saved.results || ch.questions.map((q, qi) => gradeFRQ(q, state.answers[qi]));
    state.submitted = true;
    state.reviewDate = saved.date || "";
  }
  if (isStructPaper(ch.paper) && saved && saved.kind === "p2") {
    state.answers = saved.answers || {};
    state.marks = saved.marks || {};
    state.submitted = true;
    state.reviewDate = saved.date || "";
  }
  render(); window.scrollTo(0, 0);
}

function reviewAttempt() { state.view = "quiz"; render(); window.scrollTo(0, 0); }
function startFresh() {
  state.answers = {}; state.marks = {}; state.sketches = {}; state.frqResults = null; state.submitted = false; state.marking = false; state.reviewDate = null; state.reviewOnly = false; state.page = 0;
  render(); window.scrollTo(0, 0);
}

/* ---------- Paper 2 (structured questions + mark scheme self-marking) ---------- */
function p2QuestionHTML(q, qi) {
  const writing = !state.submitted && !state.marking;
  if (writing) {
    return `<article class="q p2">
      <div class="qtop"><span class="qidx">${qi + 1}</span><span class="qsrc">${srcLabel(q.src)}</span></div>
      <img class="qimg" src="${q.img}" alt="Question ${qi + 1}" loading="lazy">
      <textarea class="frqbox" data-q="${qi}" oninput="typeAns(this)" placeholder="Type your key answers here (optional — you can also work on paper)...">${escHTML(state.answers[qi] || "")}</textarea>
    </article>`;
  }
  const given = String(state.answers[qi] || "").trim();
  const m = state.marks[qi];
  const scoreCtl = state.marking
    ? `<div class="markrow">
         <label>My mark for this question:</label>
         <input type="number" class="mkin" min="0" step="1" value="${m ? m.g : 0}" data-q="${qi}" data-k="g" oninput="markInput(this)"> /
         <input type="number" class="mkin" min="0" step="1" placeholder="total" value="${m ? m.t : ""}" data-q="${qi}" data-k="t" oninput="markInput(this)">
       </div>`
    : `<div class="frqscore ${m && m.g === m.t ? "full" : !m || m.g === 0 ? "zero" : ""}">${m ? m.g + " / " + m.t : "not marked"}</div>`;
  return `<article class="q p2 graded">
    <div class="qtop"><span class="qidx">${qi + 1}</span><span class="qsrc">${srcLabel(q.src)}</span></div>
    <img class="qimg" src="${q.img}" alt="Question ${qi + 1}" loading="lazy">
    <div class="frqgiven"><div class="frqlabel">Your notes / answers</div>
      <div class="frqtext${given ? "" : " empty"}">${given ? escHTML(given).replace(/\n/g, "<br>") : "<i>Worked on paper</i>"}</div></div>
    <div class="msblock"><div class="frqlabel">Official mark scheme — check each marking point, then enter your mark above</div>
      ${q.ms
        ? `<img class="qimg msimg" src="${q.ms}" alt="Mark scheme ${qi + 1}" loading="lazy">`
        : `<div class="msmissing">Official mark scheme not available for this question yet — use the mark totals printed on the question paper, or ask your teacher.</div>`}</div>
    ${scoreCtl}
  </article>`;
}

function frqQuestionHTML(q, qi) {
  const teacher = state.teacherMarking;
  if (!state.submitted) {
    const sk = teacher && q.sketch
      ? `<div class="sketchwrap"><div class="skethtools">
           <button class="scol on" data-c="#0E2A47" style="background:#0E2A47"></button>
           <button class="scol" data-c="#C0392B" style="background:#C0392B"></button>
           <button class="scol" data-c="#1F6FB2" style="background:#1F6FB2"></button>
           <button class="sw on" data-w="2">thin</button><button class="sw" data-w="5">thick</button>
           <button class="sera">eraser</button><button class="sclr">clear</button>
         </div><canvas class="sketch" data-q="${qi}" height="240"></canvas></div>`
      : "";
    const qimg = teacher ? `<img class="qimg" src="${q.img}" alt="Question ${qi + 1}" loading="lazy">` : "";
    return `<article class="q frq">
      <div class="qtop"><span class="qidx">${qi + 1}</span><span class="qsrc">[${q.marks} marks]</span></div>
      ${qimg}
      <div class="frqprompt">${q.prompt}</div>
      <textarea class="frqbox" data-q="${qi}" oninput="typeAns(this)" placeholder="Type your answer here...">${escHTML(state.answers[qi] || "")}</textarea>
      ${sk}
    </article>`;
  }
  if (teacher) {
    const given = String(state.answers[qi] || "").trim();
    const sk = state.sketches && state.sketches[qi] ? `<div class="frqgiven"><div class="frqlabel">Your sketch</div><img class="sketchimg" src="${state.sketches[qi]}"></div>` : "";
    return `<article class="q frq graded">
      <div class="qtop"><span class="qidx">${qi + 1}</span><span class="qsrc">[${q.marks} marks]</span></div>
      <img class="qimg" src="${q.img}" alt="Question ${qi + 1}" loading="lazy">
      <div class="frqprompt">${q.prompt}</div>
      <div class="frqgiven"><div class="frqlabel">Your typed answer</div>
        <div class="frqtext${given ? "" : " empty"}">${given ? escHTML(given).replace(/\n/g, "<br>") : "<i>No typed answer</i>"}</div></div>
      ${sk}
      <div class="frqscore submitted">Submitted — your teacher marks this set</div>
    </article>`;
  }
  const res = (state.frqResults && state.frqResults[qi]) || { points: q.rubric.map(r => ({ d: r.d, ok: false })), s: 0 };
  const pts = res.points.map(p =>
    `<li class="${p.ok ? "pt ok" : "pt no"}"><span class="ptmark">${p.ok ? "✓" : "✗"}</span> ${escHTML(p.d)}</li>`).join("");
  const ans = String(state.answers[qi] || "").trim();
  return `<article class="q frq graded">
    <div class="qtop"><span class="qidx">${qi + 1}</span><span class="qsrc">${res.s} / ${q.marks} marks</span></div>
    <div class="frqprompt">${q.prompt}</div>
    <div class="frqgiven"><div class="frqlabel">Your answer</div>
      <div class="frqtext${ans ? "" : " empty"}">${ans ? escHTML(ans).replace(/\n/g, "<br>") : "<i>No answer given</i>"}</div></div>
    <div class="frqscore ${res.s === q.marks ? "full" : res.s === 0 ? "zero" : ""}">${res.s} / ${q.marks}</div>
    <ul class="ptlist">${pts}</ul>
    <div class="modelkey"><div class="frqlabel">Model answer</div>${q.key}</div>
  </article>`;
}

function renderQuiz() {
  const ch = activeChapters()[state.chapter];
  if (!ch) { state.view = "home"; renderHome(); return; }
  const isFRQ = ch.paper === "FRQ";
  const isP2 = isStructPaper(ch.paper);
  const total = ch.questions.length;
  const size = isFRQ ? 5 : isP2 ? P2_PAGE_SIZE : PAGE_SIZE;
  const pages = Math.ceil(total / size);
  const start = state.page * size;
  const slice = ch.questions.slice(start, start + size);
  const answered = isP2
    ? ch.questions.filter((q, qi) => String(state.answers[qi] || "").trim()).length
    : isFRQ
      ? ch.questions.filter((q, qi) => String(state.answers[qi] || "").trim()).length
      : Object.keys(state.answers).length;

  const qs = slice.map((q, k) => {
    const qi = start + k;
    if (isFRQ) return frqQuestionHTML(q, qi);
    if (isP2) return p2QuestionHTML(q, qi);
    const picked = state.answers[qi];
    const opts = ["A", "B", "C", "D"].map((L, oi) => {
      let cls = "";
      if (state.submitted) cls = isRight(q, oi) ? "correct" : (picked === oi ? "wrong" : "");
      else if (picked === oi) cls = "sel";
      return `<button class="opt ${cls}" data-q="${qi}" data-o="${oi}" onclick="pick(this)">${L}</button>`;
    }).join("");
    let verdict = "";
    if (state.submitted) {
      const ok = q.void || isRight(q, picked);          // a withdrawn question scores even if left blank
      verdict = q.void
        ? `<div class="verdict ${ok ? "ok" : "no"}">${ok ? "Mark awarded — this question was withdrawn in the original paper" : "Withdrawn question — no mark recorded"}</div>`
        : `<div class="verdict ${ok ? "ok" : "no"}">${ok ? "Correct" : `Incorrect — answer is ${answerText(q)}`}</div>`;
    }
    return `<article class="q">
      <div class="qtop"><span class="qidx">${qi + 1}</span><span class="qsrc">${srcLabel(q.src)}</span></div>
      <img class="qimg" src="${q.img}" alt="Question ${qi + 1}" loading="lazy">
      <div class="opts">${opts}</div>${verdict}
    </article>`;
  }).join("");

  const pager = pages > 1 ? `<div class="pager">
      <button class="ghost" onclick="goPage(${state.page - 1})" ${state.page === 0 ? "disabled" : ""}>Previous</button>
      <span class="pageinfo">${state.page + 1} / ${pages}</span>
      <button class="ghost" onclick="goPage(${state.page + 1})" ${state.page === pages - 1 ? "disabled" : ""}>Next</button>
    </div>` : "";

  const reviewBar = state.submitted && state.reviewDate
    ? `<div class="reviewbar">Reviewing your attempt from <b>${state.reviewDate}</b> · <a class="tlink" onclick="startFresh()">start a fresh attempt</a></div>` : "";
  const introBar = isFRQ && !state.submitted ? `<div class="q frqintro">${ch.intro || ""}</div>` : "";
  const teacherNote = isFRQ && ch.marking === "teacher"
    ? `<div class="reviewbar" style="background:#EEF4FB;border-color:#B9CFE8">${state.submitted
        ? "Submitted. Your teacher will mark this set and record the grade on ManageBac — check with them for your mark."
        : "This set is <b>marked by your teacher</b> (not the website). Type your answers, sketch the 'draw' parts, then submit."}</div>`
    : "";
  const p2bar = isP2 && state.marking && !state.submitted
    ? `<div class="reviewbar" style="background:#EAF3EA;border-color:#BBD8BB">Compare your answer with the <b>official mark scheme</b> under each question, then enter the mark you earned (and the question total) in the boxes. When every question is marked, click <b>Save my marks</b>.</div>` : "";

  app.innerHTML = `
  <header class="site small"><div class="inner">
    <div class="back" onclick="goHome()">← ${isPastPaperLevel(ch.level2) ? "All sets" : "All chapters"}</div>
    <h1>${ch.title}</h1>
    <p>${isFRQ ? (ch.marking === "teacher" ? total + " Cambridge practice questions · marked by your teacher" : total + " free-response questions · auto-marked") : isP2 ? total + " structured questions · mark-scheme self-marking" : total + " questions"} · ${ch.level}</p>
  </div></header>
  <main class="wrap">
    ${state.submitted ? "" : `<div class="namebar">
      <label>Your name</label>
      ${session() ? `<b>${escHTML(session().name)}</b><a class="tlink" style="margin-left:8px" onclick="signOut()">not you? sign out</a>` : nameField()}
    </div>`}
    ${reviewBar}
    <div class="progress"><div class="progress-bar"><i id="progBar" style="width:${Math.round(100 * answered / total)}%"></i></div>
      <span id="progText">${answered} / ${total} answered</span></div>
    ${introBar}
    ${teacherNote}
    ${p2bar}
    ${qs}
    ${pager}
    <div class="submitbar">
      ${state.submitted
        ? `<button onclick="finish()">See my score</button>`
        : isP2 && state.marking
          ? `<button onclick="saveMarks()">Save my marks</button>`
          : `<button onclick="submitQuiz()">Submit and mark</button>`}
    </div>
    ${state.submitted ? "" : `<div class="footnote">${isFRQ
      ? "Write your answers in full sentences. Marks are awarded per marking point — partial credit is given automatically, and the model answer appears after you submit."
      : isP2
        ? "Answer the questions (type key results here, or work on paper). After submitting, the official mark scheme appears under each question so you can mark yourself, just like an examiner would."
        : "Answer as many as you can, then submit. Correct answers appear with each question."}</div>`}
  </main>`;
  if (isFRQ && ch.marking === "teacher") initSketchPads();
}

/* ---------- class roster (from access code) ---------- */
function classRoster() {
  if (typeof MB_CLASSES === "undefined") return null;
  const a = { cls: currentClass() };
  if (!a.cls) return null;
  const norm = s => String(s || "").toLowerCase().replace(/[\s·._-]/g, "");
  return MB_CLASSES.find(c => norm(c.name) === norm(a.cls) || norm(c.name).indexOf(norm(a.cls)) > -1) || null;
}
function gradePrefix(clsName) {
  const s = String(clsName || "").toLowerCase();
  if (s.includes("grade 12")) return "12ib";
  if (s.includes("grade 11")) return "11ib";
  if (s.includes("grade 10") || s.includes("pre-ib") || s.includes("preib")) return "preib";
  return "";
}
function nameField() {
  const rc = classRoster();
  if (!rc || state.manualName) {
    return `<input type="text" id="stuName" placeholder="e.g. 12ib Alex" value="${escAttr(state.name)}">`;
  }
  const cur = state.name || "";
  const opts = rc.students.map(x => {
    const v = MB_displayName(rc.name, x);
    return `<option value="${escAttr(v)}"${v === cur ? " selected" : ""}>${v}</option>`;
  }).join("");
  return `<select id="stuName">
      <option value="">— select your name —</option>${opts}
    </select>
    <a class="tlink" style="font-size:12px; margin-left:8px" onclick="toggleManualName(true)">Not on the list?</a>`;
}
function toggleManualName(on) {
  state.manualName = !!on;
  renderQuiz();
}

function pick(btn) {
  if (state.submitted) return;
  const qi = +btn.dataset.q, oi = +btn.dataset.o;
  state.answers[qi] = oi;
  btn.parentElement.querySelectorAll(".opt").forEach(b => b.classList.remove("sel"));
  btn.classList.add("sel");
  const total = activeChapters()[state.chapter].questions.length;
  const answered = Object.keys(state.answers).length;
  const bar = document.getElementById("progBar"), txt = document.getElementById("progText");
  if (bar) bar.style.width = Math.round(100 * answered / total) + "%";
  if (txt) txt.textContent = `${answered} / ${total} answered`;
}

function goPage(p) {
  const ch = activeChapters()[state.chapter];
  const size = ch.paper === "FRQ" ? 5 : isStructPaper(ch.paper) ? P2_PAGE_SIZE : PAGE_SIZE;
  const total = ch.questions.length;
  const pages = Math.ceil(total / size);
  if (p < 0 || p >= pages) return;
  state.page = p;
  renderQuiz();
  window.scrollTo(0, 0);
}

function typeAns(ta) {
  if (state.submitted) return;
  state.answers[ta.dataset.q] = ta.value;
  saveDraft();
  const ch = activeChapters()[state.chapter];
  const total = ch.questions.length;
  const answered = ch.questions.filter((q, qi) => String(state.answers[qi] || "").trim()).length;
  const bar = document.getElementById("progBar"), txt = document.getElementById("progText");
  if (bar) bar.style.width = Math.round(100 * answered / total) + "%";
  if (txt) txt.textContent = `${answered} / ${total} answered`;
}

function goHome() { state.view = "home"; render(); window.scrollTo(0, 0); }

async function submitQuiz() {
  const el = document.getElementById("stuName");
  if (session()) state.name = session().name;
  else if (el) state.name = el.value.trim();
  if (!state.name) { alert("Please enter your name first."); el && el.focus(); return; }
  if (cloudOn() && (!session() || session().name !== state.name) && await hasAccount(state.name)) {
    alert(state.name + " already has an account. Sign in with your name and PIN to submit as " + state.name + ".");
    return;
  }
  localStorage.setItem("stuName", state.name);
  const ch = activeChapters()[state.chapter];
  const isFRQ = ch.paper === "FRQ";
  const isP2 = isStructPaper(ch.paper);
  const total = ch.questions.length;
  const answered = (isFRQ || isP2)
    ? ch.questions.filter((q, qi) => String(state.answers[qi] || "").trim()).length
    : Object.keys(state.answers).length;
  const unanswered = total - answered;
  if (unanswered > 0 && !confirm(unanswered + " question(s) still unanswered. Submit anyway?")) return;
  if (isFRQ && ch.marking !== "teacher") state.frqResults = ch.questions.map((q, qi) => gradeFRQ(q, state.answers[qi]));
  if (isP2) { state.marking = true; render(); window.scrollTo(0, 0); return; }
  state.submitted = true;
  render(); window.scrollTo(0, 0);
}

/* ---------- sketch pads for teacher-marked FRQ sets ---------- */
function initSketchPads() {
  document.querySelectorAll("canvas.sketch").forEach(cv => {
    if (cv._padReady) return;
    cv._padReady = true;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    cv.width = Math.round((cv.clientWidth || 700));
    cv.height = 240;
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, cv.width, cv.height);
    const qi = +cv.dataset.q;
    const saved = state.sketches && state.sketches[qi];
    if (saved) { const im = new Image(); im.onload = () => ctx.drawImage(im, 0, 0, cv.width, cv.height); im.src = saved; }
    let color = "#0E2A47", width = 3, eraser = false, drawing = false, last = null;
    const wrap = cv.closest(".sketchwrap");
    wrap.querySelectorAll(".scol").forEach(b => b.onclick = () => {
      wrap.querySelectorAll(".scol").forEach(x => x.classList.remove("on"));
      b.classList.add("on"); color = b.dataset.c; eraser = false;
      const er = wrap.querySelector(".sera"); if (er) er.classList.remove("on");
    });
    wrap.querySelectorAll(".sw").forEach(b => b.onclick = () => {
      wrap.querySelectorAll(".sw").forEach(x => x.classList.remove("on"));
      b.classList.add("on"); width = +b.dataset.w;
    });
    wrap.querySelector(".sera").onclick = e => { eraser = !eraser; e.target.classList.toggle("on", eraser); };
    wrap.querySelector(".sclr").onclick = () => { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, cv.width, cv.height); state.sketches = state.sketches || {}; delete state.sketches[qi]; saveDraft(); };
    function pt(e) { const r = cv.getBoundingClientRect(); const k = cv.width / r.width; return { x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k }; }
    function stroke(a, b) {
      ctx.globalCompositeOperation = eraser ? "destination-out" : "source-over";
      ctx.strokeStyle = eraser ? "rgba(0,0,0,1)" : color;
      ctx.lineWidth = width * (eraser ? 8 : 1); ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    cv.addEventListener("pointerdown", e => { drawing = true; try { cv.setPointerCapture(e.pointerId); } catch (err) {} last = pt(e); stroke(last, { x: last.x + 0.1, y: last.y }); });
    cv.addEventListener("pointermove", e => { if (!drawing) return; const p = pt(e); stroke(last, p); last = p; });
    const stop = () => {
      if (!drawing) return;
      drawing = false;
      try {
        state.sketches = state.sketches || {};
        state.sketches[qi] = cv.toDataURL("image/jpeg", 0.55);
        saveDraft();
      } catch (err) {}
    };
    cv.addEventListener("pointerup", stop);
    cv.addEventListener("pointercancel", stop);
  });
}

/* draft autosave for FRQ sets (typed answers + sketches), restored on reopen */
function saveDraft() {
  const ch = activeChapters()[state.chapter];
  if (!ch || ch.paper !== "FRQ" || state.submitted) return;
  try {
    localStorage.setItem("draft:" + ch.id, JSON.stringify({
      answers: state.answers, sketches: state.sketches || {}, date: nowStamp()
    }));
  } catch (e) { /* storage full — keep going without drafts */ }
}

function markInput(el) {
  const qi = +el.dataset.q;
  const m = state.marks[qi] || { g: 0, t: 0 };
  m[el.dataset.k] = parseInt(el.value, 10) || 0;
  state.marks[qi] = m;
}

function saveMarks() {
  const ch = activeChapters()[state.chapter];
  const marks = {};
  for (let qi = 0; qi < ch.questions.length; qi++) {
    const m = state.marks[qi];
    if (!m) continue;
    if (m.t < 1 || m.g < 0 || m.g > m.t) {
      alert("Question " + (qi + 1) + ": please enter a total of at least 1, with your mark between 0 and the total.");
      return;
    }
    marks[qi] = m;
  }
  if (Object.keys(marks).length === 0) {
    alert("Please enter your mark and the question total under each question first.");
    return;
  }
  state.marks = marks;
  state.marking = false;
  state.submitted = true;
  finish();
}

function score() {
  const ch = activeChapters()[state.chapter];
  if (ch.paper === "FRQ" && ch.marking === "teacher") {
    return { s: 0, t: ch.questions.reduce((a, q) => a + (q.marks || 0), 0) };
  }
  if (ch.paper === "FRQ") {
    const s = (state.frqResults || []).reduce((a, r) => a + r.s, 0);
    const t = ch.questions.reduce((a, q) => a + (q.marks || 0), 0);
    return { s, t };
  }
  if (isStructPaper(ch.paper)) {
    let s = 0, t = 0;
    ch.questions.forEach((q, qi) => {
      const m = state.marks[qi];
      if (m) { s += m.g; t += m.t; }
    });
    return { s, t };
  }
  let s = 0;
  ch.questions.forEach((q, qi) => { if (q.void || isRight(q, state.answers[qi])) s++; });
  return { s, t: ch.questions.length };
}

function finish() {
  const ch = activeChapters()[state.chapter];
  const isFRQ = ch.paper === "FRQ";
  const isP2 = isStructPaper(ch.paper);
  const { s, t } = score();
  if (!t) { alert("No marks recorded yet."); return; }
  const pct = Math.round(100 * s / t);
  const isTeacher = isFRQ && ch.marking === "teacher";
  const grid = ch.questions.map((q, qi) => {
    if (isTeacher) {
      const has = String(state.answers[qi] || "").trim() || (state.sketches && state.sketches[qi]);
      return `<span class="cell half" title="Q${qi + 1}: submitted for marking">${qi + 1}</span>${has ? "" : ""}`;
    }
    if (isFRQ) {
      const r = (state.frqResults && state.frqResults[qi]) || { s: 0 };
      return `<span class="cell ${r.s === q.marks ? "ok" : r.s === 0 ? "no" : "half"}" title="Q${qi + 1}: ${r.s}/${q.marks}">${qi + 1}</span>`;
    }
    if (isP2) {
      const m = state.marks[qi] || { g: 0, t: 0 };
      const ratio = m.t ? m.g / m.t : 0;
      return `<span class="cell ${m.t && m.g === m.t ? "ok" : ratio < 0.5 ? "no" : "half"}" title="Q${qi + 1}: ${m.g}/${m.t}">${qi + 1}</span>`;
    }
    const ok = q.void || isRight(q, state.answers[qi]);
    const given = state.answers[qi] !== undefined ? "ABCD"[state.answers[qi]] : "–";
    return `<span class="cell ${ok ? "ok" : "no"}" title="Q${qi + 1}: you ${given}, answer ${q.void ? "withdrawn" : answerText(q)}">${qi + 1}</span>`;
  }).join("");
  const payload = {
    n: state.name, c: ch.title, s: `${s}/${t}`,
    a: isTeacher
      ? ch.questions.map((q, qi) => (String(state.answers[qi] || "").trim() || (state.sketches && state.sketches[qi])) ? "1" : "0").join("-")
      : isFRQ
      ? ch.questions.map((q, qi) => ((state.frqResults && state.frqResults[qi]) || { s: 0 }).s).join("-")
      : isP2
        ? ch.questions.map((q, qi) => { const m = state.marks[qi]; return m ? m.g + "/" + m.t : "0/0"; }).join("-")
        : ch.questions.map((q, qi) => state.answers[qi] !== undefined ? "ABCD"[state.answers[qi]] : "-").join(""),
    d: nowStamp()
  };
  const code = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  const saved = isTeacher
    ? { score: 0, total: t, date: payload.d, kind: "frqT", answers: state.answers, sketches: state.sketches || {} }
    : isFRQ
    ? { score: s, total: t, date: payload.d, kind: "frq", answers: state.answers, results: state.frqResults }
    : isP2
      ? { score: s, total: t, date: payload.d, kind: "p2", answers: state.answers, marks: state.marks }
      : { score: s, total: t, date: payload.d, kind: "mcq", answers: state.answers };
  if (!state.reviewOnly) {                       // reviewing an old attempt must not overwrite or re-send it
    localStorage.setItem("attempt:" + ch.id, JSON.stringify(saved));
    localStorage.removeItem("draft:" + ch.id);
    ownedIds.add(ch.id);
    cloudReportAsync({
      n: payload.n, cls: currentClass(), ch: ch.id, title: ch.title,
      level: levelKeyOf(ch), paper: ch.paper || "MCQ",
      s: s, t: t, detail: payload.a, date: payload.d, data: JSON.stringify(saved)
    }).then(() => cloudMarkSynced(ch.id, payload.d))
      .catch(err => console.warn("cloud report skipped:", err && err.message || err));
  }

  app.innerHTML = `
  <header class="site small"><div class="inner">
    <div class="back" onclick="goHome()">← ${isPastPaperLevel(ch.level2) ? "All sets" : "All chapters"}</div>
    <h1>${ch.title}</h1>
  </div></header>
  <main class="wrap">
    <section class="card result">
      ${isTeacher
        ? `<div class="scoreline"><span class="score">✓</span><span class="oft">submitted</span></div>
           <div class="who">${state.name} · ${ch.title}</div>
           <p class="footnote">Your teacher marks these Cambridge questions and records the grade on ManageBac. (${t} marks across ${ch.questions.length} questions)</p>`
        : `<div class="scoreline"><span class="score">${s}</span><span class="oft">/ ${t}</span><span class="pct">${pct}%</span></div>
           <div class="who">${state.name} · ${ch.title}</div>
           <div class="progress-bar big"><i style="width:${pct}%"></i></div>
           <div class="grid">${grid}</div>
           <div class="legend"><span class="key ok"></span>${isFRQ || isP2 ? "full marks" : "correct"} <span class="key no"></span>${isFRQ || isP2 ? "no marks" : "incorrect"}</div>`}
    </section>
    <section class="card">
      <div class="listhead">Score report for your teacher</div>
      <p class="footnote" style="margin-top:0">Copy this code and paste it to your teacher (or send a screenshot of this page).</p>
      <div class="codebox" id="codeBox">${code}</div>
      <div class="row">
        <button onclick="copyCode(this)">Copy code</button>
        <button class="ghost" onclick="reviewAttempt()">Review my answers</button>
        <button class="ghost" onclick="goHome()">Back to chapters</button>
      </div>
    </section>
  </main>`;
  window.scrollTo(0, 0);
}

function copyCode(btn) {
  const text = document.getElementById("codeBox").textContent.trim();
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = "Copied";
    setTimeout(() => (btn.textContent = "Copy code"), 1500);
  });
}

refreshOwned();
refreshAssigned();
render();
backfillLocalAttempts();
