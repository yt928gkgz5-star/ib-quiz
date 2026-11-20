/* Pre-IB Chemistry practice page — Pre-IB / MCQ / FRQ framework.
   Reuses QUIZ_DATA + roster-data.js; MCQ topics are merged from the SL bank,
   FRQ sets will be added later by the teacher. */
const app = document.getElementById("app");
const PAGE_SIZE = 8;

/* ---------- Pre-IB topic map (built from the SL MCQ bank) ---------- */
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
const PAPERS = ["MCQ", "FRQ"];

let state = { view: "home", chapter: null, name: "", answers: {}, page: 0, submitted: false,
  browse: { paper: "MCQ" } };

/* ---------- access codes (same scheme as main site) ---------- */
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
function getAccess() {
  try { return JSON.parse(localStorage.getItem("access") || "null"); } catch (e) { return null; }
}
/* a Pre-IB topic is allowed when ANY of its source chapters is in the access code */
function isAllowed(ch) {
  const a = getAccess();
  if (!a) return false;
  if (a.allow[0] === "*") return true;
  return (ch._src || []).some(id => a.allow.indexOf(id) > -1);
}
function applyCode() {
  const input = document.getElementById("accessInput");
  try {
    const parts = String(input.value || "").trim().split(".");
    if (parts.length !== 3 || parts[0] !== "IBQ") throw new Error("format");
    const payload = b64urlDec(parts[1]);
    if (hash6(payload) !== parts[2]) throw new Error("checksum");
    const obj = JSON.parse(payload);
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
function escHTML(s) { return String(s).replace(/[<>&]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c])); }

function chapterStats(ch) {
  return JSON.parse(localStorage.getItem("attempt:" + ch.id) || "null");
}

function render() {
  if (state.view === "home") renderHome();
  else if (state.view === "quiz") renderQuiz();
  else renderResult();
}

function renderHome() {
  const paper = state.browse.paper;
  const acc = getAccess();

  let cards = "", total = 0;
  if (paper === "MCQ") {
    const group = PREIB_CH.map((ch, i) => ({ ch, i }));
    total = group.reduce((s, x) => s + x.ch.questions.length, 0);
    cards = group.map(x => {
      const ch = x.ch, i = x.i;
      const a = chapterStats(ch);
      const allowed = isAllowed(ch);
      const badge = !allowed
        ? `<div class="badge lock">Locked</div>`
        : (a ? `<div class="badge done">${a.score}/${a.total}</div>` : `<div class="badge">${ch.questions.length} Q</div>`);
      const tag = String(group.indexOf(x) + 1).padStart(2, "0");
      return `<div class="chapter${allowed ? "" : " locked"}"
        onclick="${allowed ? `openChapter(${i})` : "lockedClick()"}">
        <div class="chapter-main">
          <div class="chapter-no">${tag}</div>
          <div>
            <h3>${ch.title}</h3>
            <div class="meta">Pre-IB MCQ${a ? " · last score " + a.score + "/" + a.total : ""}</div>
          </div>
        </div>${badge}
      </div>`;
    }).join("");
  } else {
    cards = `
      <div class="chapter placeholder">
        <div>
          <h3>FRQ sets — coming soon</h3>
          <div class="meta">Free-response sets will appear here once your teacher uploads them.</div>
        </div>
      </div>`;
  }

  const accBar = `
    <div class="codebar">
      <div class="acc-status" id="accStatus">${acc
        ? `Unlocked as class <b>${escHTML(acc.cls)}</b> · ${acc.allow[0] === "*" ? "all topics" : acc.allow.length + " topic(s)"} <a class="tlink" onclick="clearAccess()">switch code</a>`
        : `Locked — enter the access code your teacher gave you`}</div>
      <div class="acc-row">
        <input type="text" id="accessInput" placeholder="Access code, e.g. IBQ.eyJjIjoiRFIyQSJ9.k3v2q" spellcheck="false">
        <button onclick="applyCode()">Unlock</button>
      </div>
    </div>`;

  const paperTabs = PAPERS.map(p =>
    `<button class="tab${p === paper ? " on" : ""}" onclick="setPaper('${p}')">${p}</button>`).join("");

  app.innerHTML = `
  <header class="site"><div class="inner">
    <div class="kicker">Pre-IB Chemistry · Topic practice</div>
    <h1>Pre-IB Chemistry</h1>
    <p>MCQ sets from real IB questions, split by topic. Instant marking, no login needed.</p>
  </div></header>
  <main class="wrap">
    <div class="tabs">${paperTabs}</div>
    ${accBar}
    <div class="listhead">Pre-IB · ${paper}${paper === "MCQ" ? ` · ${total} questions` : ""}</div>
    ${cards}
    <div class="footnote">Not Pre-IB? 11IB / 12IB students use the <a class="tlink" href="index.html">main SL / HL page</a>.<br>Every question keeps its original diagram or structure. Your score is shown immediately after submission.<br><a class="tlink" href="teacher.html">Teacher view</a></div>
  </main>`;
}

function setPaper(p) { state.browse.paper = p; render(); }

function openChapter(i) {
  const ch = PREIB_CH[i];
  if (!isAllowed(ch)) { lockedClick(); return; }
  state = { view: "quiz", chapter: i, name: localStorage.getItem("stuName") || "", answers: {}, page: 0, submitted: false,
    browse: state.browse };
  render(); window.scrollTo(0, 0);
}

function renderQuiz() {
  const ch = PREIB_CH[state.chapter];
  const total = ch.questions.length;
  const pages = Math.ceil(total / PAGE_SIZE);
  const start = state.page * PAGE_SIZE;
  const slice = ch.questions.slice(start, start + PAGE_SIZE);
  const answered = Object.keys(state.answers).length;

  const qs = slice.map((q, k) => {
    const qi = start + k;
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

  app.innerHTML = `
  <header class="site small"><div class="inner">
    <div class="back" onclick="goHome()">← Pre-IB topics</div>
    <h1>${ch.title}</h1>
    <p>${total} questions · Pre-IB</p>
  </div></header>
  <main class="wrap">
    ${state.submitted ? "" : `<div class="namebar">
      <label for="stuName">Your name</label>
      ${nameField()}
    </div>`}
    <div class="progress"><div class="progress-bar"><i id="progBar" style="width:${Math.round(100 * answered / total)}%"></i></div>
      <span id="progText">${answered} / ${total} answered</span></div>
    ${qs}
    ${pager}
    <div class="submitbar">
      ${state.submitted
        ? `<button onclick="finish()">See my score</button>`
        : `<button onclick="submitQuiz()">Submit and mark</button>`}
    </div>
    ${state.submitted ? "" : `<div class="footnote">Answer as many as you can, then submit. Correct answers appear with each question.</div>`}
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
    return `<input type="text" id="stuName" placeholder="e.g. preib Juliana" value="${escAttr(state.name)}">`;
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
  const total = PREIB_CH[state.chapter].questions.length;
  const answered = Object.keys(state.answers).length;
  const bar = document.getElementById("progBar"), txt = document.getElementById("progText");
  if (bar) bar.style.width = Math.round(100 * answered / total) + "%";
  if (txt) txt.textContent = `${answered} / ${total} answered`;
}

function goPage(p) {
  const total = PREIB_CH[state.chapter].questions.length;
  const pages = Math.ceil(total / PAGE_SIZE);
  if (p < 0 || p >= pages) return;
  state.page = p;
  renderQuiz();
  window.scrollTo(0, 0);
}

function goHome() { state.view = "home"; render(); window.scrollTo(0, 0); }

function submitQuiz() {
  const el = document.getElementById("stuName");
  if (el) state.name = el.value.trim();
  if (!state.name) { alert("Please enter your name first."); el && el.focus(); return; }
  localStorage.setItem("stuName", state.name);
  const total = PREIB_CH[state.chapter].questions.length;
  const unanswered = total - Object.keys(state.answers).length;
  if (unanswered > 0 && !confirm(unanswered + " question(s) still unanswered. Submit anyway?")) return;
  state.submitted = true;
  render(); window.scrollTo(0, 0);
}

function score() {
  const ch = PREIB_CH[state.chapter];
  let s = 0;
  ch.questions.forEach((q, qi) => { if (state.answers[qi] === q.answer) s++; });
  return { s, t: ch.questions.length };
}

function finish() {
  const ch = PREIB_CH[state.chapter];
  const { s, t } = score();
  const pct = Math.round(100 * s / t);
  const grid = ch.questions.map((q, qi) => {
    const ok = state.answers[qi] === q.answer;
    const given = state.answers[qi] !== undefined ? "ABCD"[state.answers[qi]] : "–";
    return `<span class="cell ${ok ? "ok" : "no"}" title="Q${qi + 1}: you ${given}, answer ${"ABCD"[q.answer]}">${qi + 1}</span>`;
  }).join("");
  const payload = {
    n: state.name, c: ch.title, s: `${s}/${t}`,
    a: ch.questions.map((q, qi) => state.answers[qi] !== undefined ? "ABCD"[state.answers[qi]] : "-").join(""),
    d: new Date().toISOString().slice(0, 16).replace("T", " ")
  };
  const code = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  localStorage.setItem("attempt:" + ch.id, JSON.stringify({ score: s, total: t, date: payload.d }));

  app.innerHTML = `
  <header class="site small"><div class="inner">
    <div class="back" onclick="goHome()">← Pre-IB topics</div>
    <h1>${ch.title}</h1>
  </div></header>
  <main class="wrap">
    <section class="card result">
      <div class="scoreline"><span class="score">${s}</span><span class="oft">/ ${t}</span><span class="pct">${pct}%</span></div>
      <div class="who">${state.name} · ${ch.title}</div>
      <div class="progress-bar big"><i style="width:${pct}%"></i></div>
      <div class="grid">${grid}</div>
      <div class="legend"><span class="key ok"></span>correct <span class="key no"></span>incorrect</div>
    </section>
    <section class="card">
      <div class="listhead">Score report for your teacher</div>
      <p class="footnote" style="margin-top:0">Copy this code and paste it to your teacher (or send a screenshot of this page).</p>
      <div class="codebox" id="codeBox">${code}</div>
      <div class="row">
        <button onclick="copyCode(this)">Copy code</button>
        <button class="ghost" onclick="goHome()">Back to topics</button>
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
