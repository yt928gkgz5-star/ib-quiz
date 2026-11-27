/* Grade frameworks for the school site (2026-11-27).
   Each grade sees only its own course. This file is the catalogue: add a course, a homework set or
   a practice chapter here and it appears for that grade. Nothing else needs to change.

   practice   = quiz chapters of the question bank (data.js): SL / HL, each [Paper 1 chapter, Paper 2 chapter]
   courses    = interactive courses (COURSES in app.js), opened by the teacher per class like a task
   homework   = quiz chapters used as homework (Pre-IB written-answer sets)
   hub        = the unit opens as a page of its own. true = the Pre-IB Chemical Bonding page;
                "unit" = the numbered unit page (app.js renderUnitHub). Grade 11 units use it, and their
                courses and homework are per level: { SL: [ids], HL: [ids] }. Leave a list empty to show
                the dashed "coming soon" box of that part.
   sets       = full past papers (every SL and HL set) are listed for this grade
   extras     = "lab" and "ia" pages, and "p1b" = Paper 1B practice chapters            */

const FRAMEWORK = {
  "Pre-IB": {
    label: "Pre-IB Chemistry",
    hint: "Your four units. Each has its courseware, homework and past-paper questions.",
    units: [
      { title: "Unit 1.1 · Structure Models of Matter",            practice: { SL: ["u1a"] }, courses: [], homework: [] },
      { title: "Unit 1.2 · Counting Particles & Stoichiometry",    practice: { SL: ["u1b"] }, courses: [], homework: [] },
      { title: "Unit 2 · Bonding & Structure",                    hub: true },
      { title: "Unit 3.1 · Periodicity",                          practice: { SL: ["u3"] }, courses: [], homework: [] }
    ],
    sets: false,
    extras: []
  },

  "11": {
    label: "IB Chemistry · Grade 11",
    hint: "Five units in SL and HL. Open a unit for its courseware, Paper 1 and Paper 2 practice by section, and homework.",
    units: [
      { title: "Unit 1.1 · Structure Models of Matter", hub: "unit",            practice: { SL: ["u1a", "p2u1a"], HL: ["hu1a", "hp2u1a"] }, courses: { SL: [], HL: [] }, homework: { SL: [], HL: [] } },
      { title: "Unit 1.2 · Counting Particles & Stoichiometry", hub: "unit",    practice: { SL: ["u1b", "p2u1b"], HL: ["hu1b", "hp2u1b"] }, courses: { SL: [], HL: [] }, homework: { SL: [], HL: [] } },
      { title: "Unit 2 · Bonding & Structure", hub: "unit",                    practice: { SL: ["u2", "p2u2"], HL: ["hu2", "hp2u2"] }, courses: { SL: [], HL: [] }, homework: { SL: [], HL: [] } },
      { title: "Unit 4 · Organic Structure (S3.2)", hub: "unit",                practice: { SL: ["u4", "p2u4"], HL: ["hu4", "hp2u4"] }, courses: { SL: ["tl-s32"], HL: [] }, homework: { SL: [], HL: [] } },
      { title: "Unit 10 · Organic Reactions (R3.3–R3.4)", hub: "unit",           practice: { SL: ["u10", "p2u10"], HL: ["hu10", "hp2u10"] }, courses: { SL: [], HL: [] }, homework: { SL: [], HL: [] } }
    ],
    sets: false,
    extras: ["p1b", "ia", "lab"]
  },

  "12": {
    label: "IB Chemistry · Grade 12",
    hint: "Chapter practice for every unit in SL and HL, the full past papers, and the Lab / IA / Paper 1B section.",
    units: [
      { title: "Unit 1.1 · Structure Models of Matter",            practice: { SL: ["u1a", "p2u1a"], HL: ["hu1a", "hp2u1a"] }, courses: [], homework: [] },
      { title: "Unit 1.2 · Counting Particles & Stoichiometry",    practice: { SL: ["u1b", "p2u1b"], HL: ["hu1b", "hp2u1b"] }, courses: [], homework: [] },
      { title: "Unit 2 · Bonding & Structure",                    practice: { SL: ["u2", "p2u2"], HL: ["hu2", "hp2u2"] }, courses: [], homework: [] },
      { title: "Unit 3 · Periodicity",                            practice: { SL: ["u3", "p2u3"], HL: ["hu3", "hp2u3"] }, courses: [], homework: [] },
      { title: "Unit 4 · Organic Structure & Spectroscopy",       practice: { SL: ["u4", "p2u4"], HL: ["hu4", "hp2u4"] }, courses: [], homework: [] },
      { title: "Unit 5 · Thermochemistry",                         practice: { SL: ["u5", "p2u5"], HL: ["hu5", "hp2u5"] }, courses: [], homework: [] },
      { title: "Unit 6 · Kinetics",                               practice: { SL: ["u6", "p2u6"], HL: ["hu6", "hp2u6"] }, courses: [], homework: [] },
      { title: "Unit 7 · Equilibrium",                            practice: { SL: ["u7", "p2u7"], HL: ["hu7", "hp2u7"] }, courses: [], homework: [] },
      { title: "Unit 8 · Acids & Bases",                           practice: { SL: ["u8", "p2u8"], HL: ["hu8", "hp2u8"] }, courses: [], homework: [] },
      { title: "Unit 9 · Redox Processes",                        practice: { SL: ["u9", "p2u9"], HL: ["hu9", "hp2u9"] }, courses: [], homework: [] },
      { title: "Unit 10 · Organic Reactions",                      practice: { SL: ["u10", "p2u10"], HL: ["hu10", "hp2u10"] }, courses: [], homework: [] }
    ],
    sets: true,
    extras: ["p1b", "ia", "lab"]
  }
};

/* ---------- practice by syllabus section ---------- */
/* Questions of the Grade 11 units carry a `sec` tag in data.js (set by sections/tag_sections.py).
   Every tagged question becomes part of a "section" quiz built here at load time, e.g. u1a@S1.1,
   so a student can practise one section at a time. "MIXED" = no single section could be identified. */

const SECTION_NAMES = {
  "S1.1": "Particulate nature of matter",
  "S1.2": "The nuclear atom",
  "S1.3": "Electron configurations",
  "S1.4": "Counting particles by mass",
  "S1.5": "Ideal gases",
  "R2.1": "Stoichiometry and solutions",
  "S2.1": "The ionic model",
  "S2.2": "The covalent model",
  "S2.3": "The metallic model",
  "S2.4": "Intermolecular forces and physical properties",
  "S3.2.1-4": "Functional groups and nomenclature",
  "S3.2.5-8": "Isomers and stereochemistry",
  "S3.2.6": "Physical properties",
  "S3.2.10-11": "Spectroscopic identification",
  "R3.3": "Radical substitution and electrophilic addition",
  "R3.3-4": "Oxidation, reduction, esters, pathways and mechanisms",
  "R3.4": "Nucleophilic substitution",
  "MIXED": "Mixed questions of this unit"
};
const SECTION_ORDER = ["S1.1", "S1.2", "S1.3", "S1.4", "S1.5", "R2.1", "S2.1", "S2.2", "S2.3", "S2.4",
  "S3.2.1-4", "S3.2.5-8", "S3.2.6", "S3.2.10-11", "R3.3", "R3.3-4", "R3.4", "MIXED"];

function buildSectionChapters() {
  const out = [];
  const at = code => { const i = SECTION_ORDER.indexOf(code); return i < 0 ? 99 : i; };
  QUIZ_DATA.chapters.forEach(ch => {
    const groups = {};
    ch.questions.forEach(q => { if (q.sec) (groups[q.sec] = groups[q.sec] || []).push(q); });
    Object.keys(groups).sort((a, b) => at(a) - at(b)).forEach(code => {
      out.push({
        id: ch.id + "@" + code,
        title: code + " · " + (SECTION_NAMES[code] || "Questions of this section"),
        level: ch.level, level2: ch.level2, paper: ch.paper,
        _parent: ch.id, _section: code,
        questions: groups[code]
      });
    });
  });
  return out;
}
(function installSectionChapters() {
  if (typeof QUIZ_DATA === "undefined") return;
  const have = new Set(QUIZ_DATA.chapters.map(c => c.id));
  QUIZ_DATA.chapters = QUIZ_DATA.chapters.concat(buildSectionChapters().filter(c => !have.has(c.id)));
})();

/* ---------- helpers used by the student app and the teacher page ---------- */
/* Which framework a class follows: "Pre-IB", "11" or "12"; "" when the class name says none of them. */
function frameworkKey(cls) {
  const s = String(cls || "").toLowerCase();
  if (/pre-?ib|grade 10/.test(s)) return "Pre-IB";
  if (/grade 11|11ib/.test(s)) return "11";
  if (/grade 12|12ib/.test(s)) return "12";
  return "";
}
function sectionChaptersOf(parentId) {
  return QUIZ_DATA.chapters.filter(c => c._parent === parentId);
}
