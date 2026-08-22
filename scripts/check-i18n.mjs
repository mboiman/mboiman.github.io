/**
 * Fail the build when a language branch is missing a key, when the two branches
 * disagree, or when an act breaks the contract its `kind` implies.
 *
 * This exists because a cleanup pass once silently deleted eight keys from BOTH
 * branches (storyRole, the proof labels, the aria labels). Astro does not
 * type-check at build time, so the build stayed green and the labels simply
 * rendered as empty strings on the live page. A separate incident overwrote the
 * entire German branch with English text and was likewise not caught by the
 * build.
 *
 * The rules below are not style preferences. Each one is a mistake that
 * already shipped once.
 */
import { readFileSync } from 'node:fs';
import { parse as tomlParse } from 'toml';
import { i18n } from '../src/lib/i18n.ts';

/**
 * Bullet budget per act kind. A uniform budget was the old shape and it is what
 * flattened the page: a manifest act and a figure act do not want the same
 * amount of text, and forcing them to made every act look alike.
 */
const BUDGET = {
  manifest: 2, portrait: 3, offer: 4, howto: 4, live: 3, closing: 2,
  // These three carry prose or data, never bullet fragments.
  project: 0, beliefs: 0, stations: 0,
};

/** How many labels each figure component expects. Wrong count renders blanks. */
const FIGURE_LABELS = {
  proofpair: 4, timeline: 5, mesh: 5, route: 4, gate: 6, checks: 3,
};

/** Screenshot keys the page knows how to render. A raw path could point at a
 *  file that was deleted for leaking personal data, and nothing would notice. */
const SHOTS = new Set(['nlpanalyse', 'sla', 'angebotstest']);

/**
 * Raised from 9 to 18 on 2026-08-08.
 *
 * Nine words cannot hold a complete German sentence, so the old cap did not
 * merely permit the telegram style Michael rejected ("das wording in deutsch
 * ist nicht gut"), it enforced it. A cap still belongs here, because the act
 * layouts assume short lines; it just has to sit above the length of an
 * ordinary sentence rather than below it.
 */
const MAX_BULLET_WORDS = 18;
const MAX_SCARS = 2;
const errors = [];

const [de, en] = [i18n.de, i18n.en];

// ── Key parity ─────────────────────────────────────────────────────────────
// Deep, not just the top level. The first version compared Object.keys(de)
// against Object.keys(en) and stopped there, so the twenty keys nested inside
// `agentWidget` were never compared at all: a string added to one branch only
// would have shipped silently. Nothing else catches that either, since the .ts
// is type-stripped at build time and never type-checked (see the file header).
// `acts` is skipped here because it has its own structural comparison below.
const isPlain = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const keys = new Set([...Object.keys(de), ...Object.keys(en)]);
const checkParity = (a, b, path) => {
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const at = path ? `${path}.${k}` : k;
    if (!(k in a)) { errors.push(`de is missing key: ${at}`); continue; }
    if (!(k in b)) { errors.push(`en is missing key: ${at}`); continue; }
    for (const [name, v] of [['de', a[k]], ['en', b[k]]]) {
      if (v === undefined || v === null) errors.push(`${name}.${at} is ${v}`);
      if (typeof v === 'string' && v.trim() === '') errors.push(`${name}.${at} is empty`);
    }
    if (at !== 'acts' && isPlain(a[k]) && isPlain(b[k])) checkParity(a[k], b[k], at);
  }
};
checkParity(de, en, '');

// ── Act structure parity ───────────────────────────────────────────────────
if (de.acts.length !== en.acts.length) {
  errors.push(`act count differs: de=${de.acts.length} en=${en.acts.length}`);
} else {
  de.acts.forEach((a, i) => {
    const b = en.acts[i];
    if (a.id !== b.id) errors.push(`acts[${i}]: id differs de=${a.id} en=${b.id}`);
    if (a.kind !== b.kind) errors.push(`acts[${i}] ${a.id}: kind differs`);
    if (a.tone !== b.tone) errors.push(`acts[${i}] ${a.id}: tone differs`);
    if (a.bullets.length !== b.bullets.length) errors.push(`acts[${i}] ${a.id}: bullet count differs`);
    if (!!a.figure !== !!b.figure) errors.push(`acts[${i}] ${a.id}: figure present in one branch only`);
    if (!!a.shot !== !!b.shot) errors.push(`acts[${i}] ${a.id}: shot present in one branch only`);
    if (a.figure && b.figure && a.figure.id !== b.figure.id) errors.push(`acts[${i}] ${a.id}: figure id differs`);
  });
}

// The DE and EN branches must be the same page, not two pages that happen to
// share a URL prefix. The German text is what got silently replaced once, so
// this checks for the symptom directly: identical strings in both branches
// where a translation was expected.
de.acts.forEach((a, i) => {
  const b = en.acts[i];
  if (!b) return;
  if (a.headline === b.headline && !/^[A-ZÄÖÜ][a-zäöüß]+ [A-ZÄÖÜ]/.test(a.headline)
      && a.headline.length > 24) {
    errors.push(`acts[${i}] ${a.id}: headline identical in both branches, likely an overwrite`);
  }
});

// ── Per-act rules ──────────────────────────────────────────────────────────
for (const [name, br] of [['de', de], ['en', en]]) {
  const scars = br.acts.filter(a => a.scar).length;
  if (scars > MAX_SCARS) {
    errors.push(`${name}: ${scars} acts marked scar, cap is ${MAX_SCARS}. A page of scars reads as a postmortem.`);
  }

  br.acts.forEach((a, i) => {
    const where = `${name}.acts[${i}] ${a.id}`;

    if (!(a.kind in BUDGET)) { errors.push(`${where}: unknown kind "${a.kind}"`); return; }
    if (a.bullets.length > BUDGET[a.kind]) {
      errors.push(`${where}: ${a.bullets.length} bullets, budget for kind "${a.kind}" is ${BUDGET[a.kind]}`);
    }
    a.bullets.forEach((b) => {
      const n = b.split(/\s+/).filter(Boolean).length;
      if (n > MAX_BULLET_WORDS) errors.push(`${where}: bullet has ${n} words > ${MAX_BULLET_WORDS}: "${b}"`);
    });

    // Dashes as punctuation. Hyphens inside a word and in CLI flags are fine,
    // so this only catches em dash, en dash, and a standalone double hyphen.
    const blob = [a.eyebrow, a.headline, ...a.bullets, a.hook ?? '',
                  a.anchor?.label ?? '', a.anchor?.note ?? '',
                  ...(a.probeNotes ?? []), a.shot?.caption ?? '', a.shot?.alt ?? '',
                  a.figure?.caption ?? '', ...(a.figure?.labels ?? []),
                  a.project?.challenge ?? '', a.project?.solution ?? '', a.project?.result ?? '',
                  ...(a.beliefs ?? []).flatMap(b => [b.rule, b.text]),
                  ...(a.phone?.lines ?? []), a.phone?.note ?? ''].join(' ');
    if (/[—–]/.test(blob)) errors.push(`${where}: em or en dash used as punctuation`);
    if (/\s--\s/.test(blob)) errors.push(`${where}: double hyphen used as punctuation`);

    // Vanity counters. The whole rebuild exists because a full screen said
    // "20+" and "40+". `v0.14.0`, `EN 16931`, `A2A 1.0` and dates are
    // identifiers, not counts, so only the "<number>+" form is caught here.
    if (/\b\d+\s*\+/.test(blob)) errors.push(`${where}: "<n>+" reads as a vanity counter`);

    if (a.anchor?.state === 'closed' && !a.anchor.note) {
      errors.push(`${where}: closed anchor without a reason. Saying why it cannot be published is the point.`);
    }
    if (a.anchor?.state === 'public' && !a.anchor.url) {
      errors.push(`${where}: anchor claims public but carries no url`);
    }

    if (a.figure) {
      const want = FIGURE_LABELS[a.figure.id];
      if (want === undefined) errors.push(`${where}: unknown figure id "${a.figure.id}"`);
      else if (a.figure.labels.length !== want) {
        errors.push(`${where}: figure "${a.figure.id}" needs ${want} labels, got ${a.figure.labels.length}`);
      }
      if (!a.figure.caption?.trim()) errors.push(`${where}: figure without a caption`);
    }

    if (a.shot) {
      if (!SHOTS.has(a.shot.src)) errors.push(`${where}: unknown shot key "${a.shot.src}"`);
      if (!a.shot.caption?.trim()) {
        errors.push(`${where}: shot without a caption. The caption is what says it is his own work.`);
      }
      // These are content images now, not decoration, so an empty alt hides
      // a whole project act from a screen reader.
      if (!a.shot.alt?.trim()) errors.push(`${where}: shot without alt text`);
    }

    if (a.kind === 'project') {
      for (const f of ['challenge', 'solution', 'result']) {
        if (!a.project?.[f]?.trim()) errors.push(`${where}: project act missing "${f}"`);
      }
      // Prose, not fragments. A one-clause "challenge" is the telegram style
      // the rewrite removed, sneaking back in through a different field.
      for (const f of ['challenge', 'solution', 'result']) {
        const v = a.project?.[f] ?? '';
        const n = v.split(/\s+/).filter(Boolean).length;
        if (n && n < 8) errors.push(`${where}: project.${f} is ${n} words. Write the sentence.`);
        if (n > 55) errors.push(`${where}: project.${f} is ${n} words, too long for the block`);
      }
    }

    if (a.kind === 'beliefs') {
      if ((a.beliefs?.length ?? 0) !== 4) {
        errors.push(`${where}: ${a.beliefs?.length ?? 0} beliefs, expected exactly 4`);
      }
      (a.beliefs ?? []).forEach((b, k) => {
        if (!b.rule?.trim()) errors.push(`${where}: belief ${k} without a rule name`);
        if (!b.text?.trim()) errors.push(`${where}: belief ${k} without text`);
      });
    }

    // Question buttons only work if they are questions.
    if (a.askAgent) {
      a.bullets.forEach((b) => {
        if (!b.trim().endsWith('?')) errors.push(`${where}: askAgent bullet is not a question: "${b}"`);
      });
      if (a.probeNotes && a.probeNotes.length !== a.bullets.length) {
        errors.push(`${where}: ${a.probeNotes.length} probe notes for ${a.bullets.length} questions`);
      }
    }

    if (a.terminal) {
      const longest = Math.max(...a.terminal.lines.map(l => l.text.length));
      if (longest > 56) errors.push(`${where}: terminal line of ${longest} chars > 56, it will scroll sideways`);
      if (!a.terminal.recorded?.trim()) errors.push(`${where}: terminal without a recording date`);
    }
  });
}

// Exactly one act of each singular kind, or the rhythm argument collapses.
for (const kind of ['manifest', 'portrait', 'offer', 'howto', 'beliefs', 'live', 'stations', 'closing']) {
  const n = de.acts.filter(a => a.kind === kind).length;
  if (n !== 1) errors.push(`kind "${kind}" appears ${n} times, expected exactly 1`);
}

// The page is a portfolio. It stopped being one once, when twelve acts of
// engineering principle left room for no projects at all, and the verdict was
// that it no longer presented a person. Three is the floor that keeps it one.
const projectCount = de.acts.filter(a => a.kind === 'project').length;
if (projectCount < 3) {
  errors.push(`only ${projectCount} project acts. The page is a portfolio; below three it reads as an essay again.`);
}

/**
 * The manifest announces how many projects follow, and a visitor can count
 * them. It said six while five existed, in both languages, and survived a
 * review round because nothing compared the sentence to the act list. Same
 * class of defect as the "Eight jobs" line that shipped over seven cards
 * elsewhere: a number in prose that no longer has anything checking it.
 *
 * Spelled out rather than written as a digit, because a digit on the opening
 * screen reads as a counter, and counters are what this page removed.
 */
const NUMBER_WORDS = {
  de: ['null', 'ein', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn'],
  en: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'],
};
for (const [name, branch] of [['de', de], ['en', en]]) {
  const manifest = branch.acts.find(a => a.kind === 'manifest');
  const blob = (manifest?.bullets || []).join(' ').toLowerCase();
  const claimed = NUMBER_WORDS[name].findIndex(
    (w, i) => i > 0 && new RegExp(`\\b${w}\\b\\s+(projekte|projects)\\b`).test(blob),
  );
  if (claimed === -1) {
    errors.push(`${name}: the manifest states no project count. Say how many follow, spelled out.`);
  } else if (claimed !== projectCount) {
    errors.push(
      `${name}: the manifest announces ${NUMBER_WORDS[name][claimed]} projects but ${projectCount} project acts exist. A visitor counts them.`,
    );
  }
}

// Every project act needs a picture. A project told in prose alone is a CV
// entry, and the CV page already has it.
de.acts.filter(a => a.kind === 'project').forEach((a) => {
  if (!a.figure && !a.shot) {
    errors.push(`acts ${a.id}: project act without a figure or a screenshot`);
  }
});
if (de.acts.at(-1)?.kind !== 'closing') errors.push('the last act is not the closing act');
if (de.acts[0]?.kind !== 'manifest') errors.push('the first act is not the manifest act');

/**
 * The dash rule, applied to the OTHER half of the page.
 *
 * Everything above reads i18n.ts. But the stations act renders straight out of
 * config.cv.toml, and so does the whole CV page and both PDFs, and none of it
 * passed through any check. It carried 26 en dashes in its date ranges, every
 * one of them rendered on screen as "08/2021 – 05/2025", plus a second
 * separator convention (" - " between a name and its subtitle) that is the
 * spaced replacement dash the rule exists to prevent. A rule that covers half
 * a page is not a rule, it is a habit.
 *
 * Only the fields that actually reach a reader are scanned. Prose bodies
 * (`details`, `text`) are deliberately excluded: they legitimately contain
 * arrows and code, and widening the net there would make this fire on content
 * it was never meant to police.
 */
const RENDERED_FIELDS = [
  'dates', 'position', 'company', 'college', 'degree', 'title',
  // Widened 2026-08-22. The first pass covered the timeline and stopped, so the
  // same separator convention sat untouched in the project cards, in the
  // verification anchors and in the skills block: `tagline` carried two, and
  // `skill` carried twenty-two before that block was deleted for rendering
  // nowhere. A rule that covers a third of a page is not a rule.
  'tagline', 'challenge', 'solution', 'impact', 'intro',
  'metric', 'label', 'detail', 'skill', 'sidebar_skills',
];
// Bare strings inside an array (ui.sidebar_skills is twenty of them) were
// skipped entirely before: the walker only tested `typeof v === 'string'` for
// OBJECT properties, and an array element has no property name to test.
const cvRaw = readFileSync(new URL('../config.cv.toml', import.meta.url), 'utf8');
const cv = tomlParse(cvRaw);
for (const branch of ['de', 'en']) {
  const params = cv?.languages?.[branch]?.params;
  if (!params) { errors.push(`config.cv.toml: no languages.${branch}.params`); continue; }
  const testString = (v, at) => {
    if (/[—–]/.test(v)) errors.push(`config.cv.toml ${branch} ${at}: em or en dash in "${v}"`);
    // A newline followed by "- " is a markdown bullet, not a replacement dash.
    if (/(?<!\n)\s-\s/.test(v)) errors.push(`config.cv.toml ${branch} ${at}: spaced hyphen reads as a dash in "${v}". Use a middot or rebuild the sentence.`);
  };
  const walk = (node, path, key) => {
    if (typeof node === 'string') {
      if (RENDERED_FIELDS.includes(key)) testString(node, path);
      return;
    }
    if (Array.isArray(node)) return node.forEach((v, i) => walk(v, `${path}[${i}]`, key));
    if (!node || typeof node !== 'object') return;
    for (const [k, v] of Object.entries(node)) walk(v, `${path}.${k}`, k);
  };
  walk(params, branch, '');
}

/**
 * Which projects reach the PDF, and in which order, is declared as `pdf_rank`
 * on the project. It used to be a hardcoded title list inside
 * scripts/html_to_pdf.js, and a project added to the TOML could never appear
 * however correct its entry was. Nothing here can stop that returning, but
 * these three checks stop the new field from rotting the same way.
 */
const rankLabel = (branch) => `config.cv.toml ${branch} projects`;
const rankSets = {};
for (const branch of ['de', 'en']) {
  const list = cv?.languages?.[branch]?.params?.projects?.list ?? [];
  const ranked = list.filter((p) => typeof p.pdf_rank === 'number');
  if (!ranked.length) {
    errors.push(`${rankLabel(branch)}: no project carries pdf_rank, so the PDF would ship without projects.`);
  }
  const seen = new Map();
  for (const p of ranked) {
    if (seen.has(p.pdf_rank)) errors.push(`${rankLabel(branch)}: pdf_rank ${p.pdf_rank} used by both "${seen.get(p.pdf_rank)}" and "${p.title}".`);
    seen.set(p.pdf_rank, p.title);
    if (!p.anchor) errors.push(`${rankLabel(branch)}: "${p.title}" has pdf_rank but no anchor, so the two branches cannot be compared.`);
  }
  rankSets[branch] = ranked.map((p) => `${p.pdf_rank}:${p.anchor}`).sort().join(' ');
}
// Both PDFs are the same document in two languages. Ranking a project in one
// branch only produces two different CVs behind one download button.
if (rankSets.de !== rankSets.en) {
  errors.push(`config.cv.toml: pdf_rank differs between branches.\n      de: ${rankSets.de}\n      en: ${rankSets.en}`);
}

/**
 * One talk is one talk.
 *
 * Michael gave a single Impulsvortrag at TU Darmstadt in 04/2026 and said so
 * plainly: "ich hab einmal gehalten, bitte nicht übertreiben". The correction
 * was made in i18n.ts on 2026-08-21 and missed config.cv.toml, so the PDF kept
 * announcing a standing role for another day. Both files are checked, because
 * the sentence exists in both.
 */
const OVERCLAIMS = [
  /geladener\s+Impulsgeber/i,
  /invited\s+guest\s+speaker/i,
  /Impulsgeber\s+an\s+der\s+TU/i,
  /(regelmäßig|regularly|wiederholt|repeatedly)[^.]{0,40}TU\s+Darmstadt/i,
];
const proseSources = [
  ['config.cv.toml', ['de', 'en'].map((b) => cv?.languages?.[b]?.params?.summary?.summary ?? '').join('\n')],
  ['src/lib/i18n.ts', [de, en].flatMap((b) => [b.careerIntro, ...(b.careerDetails ?? [])]).join('\n')],
];
for (const [file, blob] of proseSources) {
  for (const rx of OVERCLAIMS) {
    if (rx.test(blob)) errors.push(`${file}: the TU Darmstadt talk is described as a standing role (${rx}). It was one Impulsvortrag, 04/2026.`);
  }
}

if (errors.length) {
  console.error('i18n check failed:');
  for (const e of errors) console.error('  -', e);
  process.exit(1);
}
console.log(
  `i18n check ok: ${de.acts.length} acts (${[...new Set(de.acts.map(a => a.kind))].length} kinds), ` +
  `${keys.size} keys, both branches structurally identical`
);
