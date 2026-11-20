/* IB Chemistry - topic practice platform (SL & HL, MCQ / P2 / Paper 1B) */
const app = document.getElementById("app");
const PAGE_SIZE = 8;
let state = { view: "home", chapter: null, name: "", answers: {}, page: 0, submitted: false,
  browse: { level: "SL", paper: "MCQ" } };
const LEVELS = ["Pre-IB", "SL", "HL"];
const PAPERS = ["MCQ", "FRQ", "P1B"];
const PREIB_PAPERS = ["MCQ", "FRQ"];
if (typeof location !== "undefined" && location.hash === "#preib") state.browse.level = "Pre-IB";

/* ---------- Pre-IB topics (merged from the SL MCQ bank) ---------- */
const PREIB_TOPICS = [
  { id: "preib-stoich",   title: "Stoichiometry",     src: ["ch1"] },
  { id: "preib-atoms",    title: "Atomic Structure",  src: ["ch2"] },
  { id: "preib-periodic", title: "Periodic Trends",   src: ["ch3"] },
  { id: "preib-bonding",  title: "Chemical Bonding",  src: ["ch4.1", "ch4.2", "ch4.3"] }
];
const PREIB_CH = PREIB_TOPICS.map(t => ({
  id: t.id,
  title: t.title,
  level: "Pre-IB",
  level2: "SL",
  paper: "MCQ",
  _src: t.src,
  questions: t.src.flatMap(cid => {
    const c = QUIZ_DATA.chapters.find(x => x.id === cid);
    return c ? c.questions : [];
  })
}));

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
const PREIB_FRQ_CH = PREIB_FRQ_SETS;

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
  return state.browse.paper === "FRQ" ? PREIB_FRQ_CH : PREIB_CH;
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
  try { return JSON.parse(localStorage.getItem("access") || "null"); } catch (e) { return null; }
}
function isAllowed(ch) {
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

function srcLabel(src) {
  const m = /(_SL_)(\w+?)_(\d{4})_Q(\d+)$/.exec(src || "");
  if (!m) return src || "";
  return `${m[3]} ${m[2]} · Q${m[4]}`;
}

function escAttr(s) { return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;"); }

function chapterStats(ch) {
  const saved = JSON.parse(localStorage.getItem("attempt:" + ch.id) || "null");
  return saved;
}

function render() {
  if (state.view === "home") renderHome();
  else if (state.view === "quiz") renderQuiz();
  else renderResult();
}

function renderHome() {
  const { level, paper } = state.browse;
  const all = activeChapters();
  const group = all.map((ch, i) => ({ ch, i }))
    .filter(x => (x.ch.level2 || "SL") === (level === "Pre-IB" ? "SL" : level) && (x.ch.paper || "MCQ") === paper);
  const total = group.reduce((s, x) => s + x.ch.questions.length, 0);
  const hasBank = group.length > 0;
  const acc = getAccess();

  const cards = group.map(x => {
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
        <div class="meta">${level} · ${paper} — this section opens once the question bank is imported.</div>
      </div>
    </div>`;

  const accBar = `
    <div class="codebar">
      <div class="acc-status" id="accStatus">${acc
        ? `Unlocked as class <b>${escHTML(acc.cls)}</b> · ${acc.allow[0] === "*" ? "all chapters" : acc.allow.length + " chapter(s)"} <a class="tlink" onclick="clearAccess()">switch code</a>`
        : `Locked — enter the access code your teacher gave you`}</div>
      <div class="acc-row">
        <input type="text" id="accessInput" placeholder="Access code, e.g. IBQ.eyJjIjoiRFIyQSJ9.k3v2q" spellcheck="false">
        <button onclick="applyCode()">Unlock</button>
      </div>
    </div>`;

  const paperTabs = (level === "Pre-IB" ? PREIB_PAPERS : PAPERS).map(p =>
    `<button class="tab${p === paper ? " on" : ""}" onclick="setPaper('${p}')">${p}</button>`).join("");
  const levelTabs = LEVELS.map(l =>
    `<button class="pill${l === level ? " on" : ""}" onclick="setLevel('${l}')">${l}</button>`).join("");

  app.innerHTML = `
  <header class="site"><div class="inner">
    <div class="kicker">${QUIZ_DATA.course} · Topic practice</div>
    <h1>Choose your level and paper</h1>
    <p>Real IB questions from 2017–2024 papers, split by topic. Instant marking, no login needed.</p>
  </div></header>
  <main class="wrap">
    <div class="lvlrow">${levelTabs}</div>
    <div class="tabs">${paperTabs}</div>
    ${accBar}
    <div class="listhead">${level} · ${paper}${hasBank ? ` · ${total} questions` : ""}</div>
    ${cards}${emptyCard}
    <div class="footnote">Every question keeps its original diagram or structure, so figures stay exact. Your score is shown immediately after submission, with the correct answer for each question.<br><a class="tlink" href="teacher.html">Teacher view</a></div>
  </main>`;
}

function escHTML(s) { return String(s).replace(/[<>&]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c])); }
function setLevel(l) {
  state.browse.level = l;
  if (l === "Pre-IB" && PREIB_PAPERS.indexOf(state.browse.paper) === -1) state.browse.paper = "MCQ";
  if (state.view !== "home") state.view = "home";
  render();
}
function setPaper(p) { state.browse.paper = p; if (state.view !== "home") state.view = "home"; render(); }

function openChapter(i) {
  const ch = activeChapters()[i];
  if (!isAllowed(ch)) { lockedClick(); return; }
  state = { view: "quiz", chapter: i, name: localStorage.getItem("stuName") || "", answers: {}, page: 0, submitted: false,
    browse: state.browse, frqResults: null, reviewDate: null };
  if (ch.paper === "FRQ") {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem("attempt:" + ch.id) || "null"); } catch (e) {}
    if (saved && saved.kind === "frq") {
      state.answers = saved.answers || {};
      state.frqResults = saved.results || ch.questions.map((q, qi) => gradeFRQ(q, state.answers[qi]));
      state.submitted = true;
      state.reviewDate = saved.date || "";
    }
  }
  render(); window.scrollTo(0, 0);
}

function reviewAttempt() { state.view = "quiz"; render(); window.scrollTo(0, 0); }
function startFresh() {
  state.answers = {}; state.frqResults = null; state.submitted = false; state.reviewDate = null; state.page = 0;
  render(); window.scrollTo(0, 0);
}

function frqQuestionHTML(q, qi) {
  if (!state.submitted) {
    return `<article class="q frq">
      <div class="qtop"><span class="qidx">${qi + 1}</span><span class="qsrc">[${q.marks} marks]</span></div>
      <div class="frqprompt">${q.prompt}</div>
      <textarea class="frqbox" data-q="${qi}" oninput="typeAns(this)" placeholder="Type your answer here...">${escHTML(state.answers[qi] || "")}</textarea>
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
  const total = ch.questions.length;
  const size = isFRQ ? 5 : PAGE_SIZE;
  const pages = Math.ceil(total / size);
  const start = state.page * size;
  const slice = ch.questions.slice(start, start + size);
  const answered = isFRQ
    ? ch.questions.filter((q, qi) => String(state.answers[qi] || "").trim()).length
    : Object.keys(state.answers).length;

  const qs = slice.map((q, k) => {
    const qi = start + k;
    if (isFRQ) return frqQuestionHTML(q, qi);
    const picked = state.answers[qi];
    const opts = ["A", "B", "C", "D"].map((L, oi) => {
      let cls = "";
      if (state.submitted) cls = oi === q.answer ? "correct" : (picked === oi ? "wrong" : "");
      else if (picked === oi) cls = "sel";
      return `<button class="opt ${cls}" data-q="${qi}" data-o="${oi}" onclick="pick(this)">${L}</button>`;
    }).join("");
    let verdict = "";
    if (state.submitted) {
      const ok = picked === q.answer;
      verdict = `<div class="verdict ${ok ? "ok" : "no"}">${ok ? "Correct" : `Incorrect — answer is ${"ABCD"[q.answer]}`}</div>`;
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

  const reviewBar = isFRQ && state.submitted && state.reviewDate
    ? `<div class="reviewbar">Reviewing your attempt from <b>${state.reviewDate}</b> · <a class="tlink" onclick="startFresh()">start a fresh attempt</a></div>` : "";
  const introBar = isFRQ && !state.submitted ? `<div class="q frqintro">${ch.intro || ""}</div>` : "";

  app.innerHTML = `
  <header class="site small"><div class="inner">
    <div class="back" onclick="goHome()">← All chapters</div>
    <h1>${ch.title}</h1>
    <p>${isFRQ ? total + " free-response questions · auto-marked" : total + " questions"} · ${ch.level}</p>
  </div></header>
  <main class="wrap">
    ${state.submitted ? "" : `<div class="namebar">
      <label for="stuName">Your name</label>
      ${nameField()}
    </div>`}
    ${reviewBar}
    <div class="progress"><div class="progress-bar"><i id="progBar" style="width:${Math.round(100 * answered / total)}%"></i></div>
      <span id="progText">${answered} / ${total} answered</span></div>
    ${introBar}
    ${qs}
    ${pager}
    <div class="submitbar">
      ${state.submitted
        ? `<button onclick="finish()">See my score</button>`
        : `<button onclick="submitQuiz()">Submit and mark</button>`}
    </div>
    ${state.submitted ? "" : `<div class="footnote">${isFRQ
      ? "Write your answers in full sentences. Marks are awarded per marking point — partial credit is given automatically, and the model answer appears after you submit."
      : "Answer as many as you can, then submit. Correct answers appear with each question."}</div>`}
  </main>`;
}

/* ---------- class roster (from access code) ---------- */
function classRoster() {
  if (typeof MB_CLASSES === "undefined") return null;
  const a = getAccess();
  if (!a || !a.cls) return null;
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
  const p = gradePrefix(rc.name);
  const opts = rc.students.map(s => {
    const v = `${p} ${s.en || s.n}`.trim();
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
  const size = ch.paper === "FRQ" ? 5 : PAGE_SIZE;
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
  const ch = activeChapters()[state.chapter];
  const total = ch.questions.length;
  const answered = ch.questions.filter((q, qi) => String(state.answers[qi] || "").trim()).length;
  const bar = document.getElementById("progBar"), txt = document.getElementById("progText");
  if (bar) bar.style.width = Math.round(100 * answered / total) + "%";
  if (txt) txt.textContent = `${answered} / ${total} answered`;
}

function goHome() { state.view = "home"; render(); window.scrollTo(0, 0); }

function submitQuiz() {
  const el = document.getElementById("stuName");
  if (el) state.name = el.value.trim();
  if (!state.name) { alert("Please enter your name first."); el && el.focus(); return; }
  localStorage.setItem("stuName", state.name);
  const ch = activeChapters()[state.chapter];
  const isFRQ = ch.paper === "FRQ";
  const total = ch.questions.length;
  const answered = isFRQ
    ? ch.questions.filter((q, qi) => String(state.answers[qi] || "").trim()).length
    : Object.keys(state.answers).length;
  const unanswered = total - answered;
  if (unanswered > 0 && !confirm(unanswered + " question(s) still unanswered. Submit anyway?")) return;
  if (isFRQ) state.frqResults = ch.questions.map((q, qi) => gradeFRQ(q, state.answers[qi]));
  state.submitted = true;
  render(); window.scrollTo(0, 0);
}

function score() {
  const ch = activeChapters()[state.chapter];
  if (ch.paper === "FRQ") {
    const s = (state.frqResults || []).reduce((a, r) => a + r.s, 0);
    const t = ch.questions.reduce((a, q) => a + (q.marks || 0), 0);
    return { s, t };
  }
  let s = 0;
  ch.questions.forEach((q, qi) => { if (state.answers[qi] === q.answer) s++; });
  return { s, t: ch.questions.length };
}

function finish() {
  const ch = activeChapters()[state.chapter];
  const isFRQ = ch.paper === "FRQ";
  const { s, t } = score();
  const pct = Math.round(100 * s / t);
  const grid = ch.questions.map((q, qi) => {
    if (isFRQ) {
      const r = (state.frqResults && state.frqResults[qi]) || { s: 0 };
      return `<span class="cell ${r.s === q.marks ? "ok" : r.s === 0 ? "no" : "half"}" title="Q${qi + 1}: ${r.s}/${q.marks}">${qi + 1}</span>`;
    }
    const ok = state.answers[qi] === q.answer;
    const given = state.answers[qi] !== undefined ? "ABCD"[state.answers[qi]] : "–";
    return `<span class="cell ${ok ? "ok" : "no"}" title="Q${qi + 1}: you ${given}, answer ${"ABCD"[q.answer]}">${qi + 1}</span>`;
  }).join("");
  const payload = {
    n: state.name, c: ch.title, s: `${s}/${t}`,
    a: isFRQ
      ? ch.questions.map((q, qi) => ((state.frqResults && state.frqResults[qi]) || { s: 0 }).s).join("-")
      : ch.questions.map((q, qi) => state.answers[qi] !== undefined ? "ABCD"[state.answers[qi]] : "-").join(""),
    d: new Date().toISOString().slice(0, 16).replace("T", " ")
  };
  const code = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  localStorage.setItem("attempt:" + ch.id, JSON.stringify(isFRQ
    ? { score: s, total: t, date: payload.d, kind: "frq", answers: state.answers, results: state.frqResults }
    : { score: s, total: t, date: payload.d }));

  app.innerHTML = `
  <header class="site small"><div class="inner">
    <div class="back" onclick="goHome()">← All chapters</div>
    <h1>${ch.title}</h1>
  </div></header>
  <main class="wrap">
    <section class="card result">
      <div class="scoreline"><span class="score">${s}</span><span class="oft">/ ${t}</span><span class="pct">${pct}%</span></div>
      <div class="who">${state.name} · ${ch.title}</div>
      <div class="progress-bar big"><i style="width:${pct}%"></i></div>
      <div class="grid">${grid}</div>
      <div class="legend"><span class="key ok"></span>${isFRQ ? "full marks" : "correct"} <span class="key no"></span>${isFRQ ? "no marks" : "incorrect"}</div>
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

render();
