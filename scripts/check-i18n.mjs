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
import { readFileSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { parse as tomlParse } from 'toml';
import { i18n } from '../src/lib/i18n.ts';
import { catchAllSkills, multiGroupSkills } from '../src/lib/skill-groups.ts';

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
const SHOTS = new Set(['nlpanalyse', 'sla']);

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
/**
 * Findings that are worth reading but must not stop a build. A guard that fails
 * on something nobody decided is worse than no guard: it gets disabled. Notices
 * are printed on every run, green or red.
 */
const notices = [];

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

// ── Hero facts ─────────────────────────────────────────────────────────────
// checkParity walks objects, not arrays: it sees that both branches HAVE a
// `facts` key and stops there. That blind spot already shipped something. Until
// 2026-09-05 the German branch said "Stundensatz auf Anfrage" and the English
// one "Day rate on request", so the same CV quoted two different commercial
// units depending on which language you opened, and nothing looked.
if (de.facts.length !== en.facts.length) {
  errors.push(`facts: de has ${de.facts.length} entries, en has ${en.facts.length}`);
}
for (const [name, branch] of [['de', de.facts], ['en', en.facts]]) {
  branch.forEach((fact, i) => {
    const where = `${name}.facts[${i}]`;
    if (!fact?.label?.trim()) errors.push(`${where}: no label`);
    if (!fact?.value?.trim()) errors.push(`${where}: no value`);
    const blob = `${fact?.label ?? ''} ${fact?.value ?? ''}`;
    if (/[—–]/.test(blob)) errors.push(`${where}: em or en dash used as punctuation`);
    if (/\s--+\s/.test(blob)) errors.push(`${where}: double hyphen used as punctuation`);
  });
}

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
    if (/\s--+\s/.test(blob)) errors.push(`${where}: double hyphen used as punctuation`);

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
const i18nRaw = readFileSync(new URL('../src/lib/i18n.ts', import.meta.url), 'utf8');
const cv = tomlParse(cvRaw);
for (const branch of ['de', 'en']) {
  const params = cv?.languages?.[branch]?.params;
  if (!params) { errors.push(`config.cv.toml: no languages.${branch}.params`); continue; }
  const testString = (v, at) => {
    if (/[—–]/.test(v)) errors.push(`config.cv.toml ${branch} ${at}: em or en dash in "${v}"`);
    // A "- " that opens a line is a markdown bullet, not a replacement dash, so
    // the bullet marker is stripped before the test rather than excluded by a
    // lookbehind. The lookbehind version only forgave a bullet that followed a
    // BLANK line: in a list, every bullet from the second on is preceded by the
    // previous bullet's full stop, and fired. It flagged the first multi-line
    // tagline written after the rule shipped.
    const withoutBullets = v.replace(/^[ \t]*[-*][ \t]+/gm, '');
    if (/\s-\s/.test(withoutBullets)) errors.push(`config.cv.toml ${branch} ${at}: spaced hyphen reads as a dash in "${v}". Use a middot or rebuild the sentence.`);
    // The same rule bans the double hyphen, and the check above cannot see it:
    // "\s-\s" needs a space on BOTH sides of a single hyphen, so "a -- b" walks
    // straight through. It is the ASCII stand-in for the em dash, which makes it
    // the one form somebody actually types when the real dash is unavailable.
    if (/\s--+\s/.test(withoutBullets)) errors.push(`config.cv.toml ${branch} ${at}: double hyphen used as punctuation in "${v}". Comma, colon or two sentences.`);
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
 * Where a skill renders, and where it renders differently.
 *
 * The sidebar buckets ui.sidebar_skills by regex. This used to fail the build on
 * a skill matching no group, with the reason "would render nowhere", and that
 * reason was false: scripts/html_to_pdf.js renders the same list FLAT, so an
 * unmatched skill is in the PDF and missing from the page. Worse, no catch-all
 * existed, so Terraform, Kibana, SQL, ISTQB and every other entry nobody had
 * written a pattern for turned an ordinary content edit into a red build.
 *
 * src/lib/skill-groups.ts now ends in a catch-all, so every skill lands
 * somewhere by construction and the two questions left are advisory: what
 * collected in the catch-all (a heading may be missing) and what matches two
 * patterns (the first one wins, which may not be the intended one).
 */
for (const branch of ['de', 'en']) {
  const skills = cv?.languages?.[branch]?.params?.ui?.sidebar_skills ?? [];
  if (!skills.length) {
    errors.push(`config.cv.toml ${branch}: ui.sidebar_skills is empty.`);
    continue;
  }
  const caught = catchAllSkills(skills);
  if (caught.length) {
    notices.push(`config.cv.toml ${branch}: ${caught.length} sidebar skills render under the catch-all heading: ${caught.join(', ')}. Fine as is; add a pattern in src/lib/skill-groups.ts when a group of them shares an area.`);
  }
  for (const { skill, groups } of multiGroupSkills(skills)) {
    notices.push(`config.cv.toml ${branch}: "${skill}" matches ${groups.join(' and ')}. It renders once, under ${groups[0]}.`);
  }
}
/**
 * Both branches carry the same skill set, so the two lists must have the same
 * LENGTH: one entry more on one side is a missed edit, and that is the failure
 * this guards.
 *
 * The first shape compared the joined strings and so demanded them to be
 * character-identical, which outlawed ever translating a label ("Quality
 * Engineering" into "Qualitätssicherung") for good, on a page whose group
 * headings ARE translated. Nobody decided that. A differing entry is therefore
 * a notice: it is either a translation or a typo, and only a reader can say
 * which.
 */
{
  const deSkills = cv?.languages?.de?.params?.ui?.sidebar_skills ?? [];
  const enSkills = cv?.languages?.en?.params?.ui?.sidebar_skills ?? [];
  if (deSkills.length !== enSkills.length) {
    errors.push(`config.cv.toml: ui.sidebar_skills has ${deSkills.length} entries in de and ${enSkills.length} in en. The skills are the same person in both languages.`);
  } else {
    const differing = deSkills
      .map((skill, i) => [skill, enSkills[i]])
      .filter(([a, b]) => a !== b);
    if (differing.length) {
      notices.push(`config.cv.toml: ${differing.length} sidebar skills are worded differently per branch: ${differing.map(([a, b]) => `"${a}" vs "${b}"`).join(', ')}. Intended as a translation, or a missed edit?`);
    }
  }
}

/**
 * A label that was never translated at all.
 *
 * The check above treats a DIFFERING entry as a notice, and that is right: it is
 * either a translation or a typo, and only a reader can say which. What it does
 * not see is the opposite case, and that is the one that shipped. On 2026-09-04
 * "Spezifikation & Verifikationsdesign" stood in the English sidebar and in the
 * English PDF. Both branches were character-identical there, so nothing differed,
 * so nothing was reported, and the build called the branches "structurally
 * identical" while a German label sat on the English page.
 *
 * Identical is normal for this list: Playwright, Python, Docker and most other
 * entries are proper nouns. So identity alone proves nothing, and the test has
 * to be the wording itself. That makes this a HEURISTIC, deliberately: a list of
 * German markers that no English technology label carries. It grows by one entry
 * whenever a case slips through, exactly like OVERCLAIMS above. Umlauts alone
 * would not have caught this one, which is why stems are in the list too.
 *
 * Scoped to the `ui` block on purpose. Longer prose gets read by a human before
 * it ships; a two-word label in a sidebar does not.
 */
const GERMAN_MARKERS = [
  /[äöüß]/i,
  /\bspezifikat/i, /\bverifikat/i, /\bqualifikat/i,
  /\w+(ung|heit|keit|schaft)\b/i,
  /\b(zusätzlich|kenntnis|erfahrung|anforderung|umgebung|fähigkeit)/i,
];
// Proper nouns that stay German in an English CV. Extend rather than weaken a marker.
const GERMAN_ALLOWED = [/^TÜV\b/i, /Fachhochschule/i, /Diplom-/i, /\bGmbH\b/, /Deutsche\s+Telekom/i];
{
  const walk = (node, path, out) => {
    if (typeof node === 'string') out.push([path, node]);
    else if (Array.isArray(node)) node.forEach((v, i) => walk(v, `${path}[${i}]`, out));
    else if (node && typeof node === 'object') for (const [k, v] of Object.entries(node)) walk(v, `${path}.${k}`, out);
  };
  const strings = [];
  walk(cv?.languages?.en?.params?.ui ?? {}, 'en.params.ui', strings);
  for (const [path, value] of strings) {
    if (GERMAN_ALLOWED.some((rx) => rx.test(value))) continue;
    const hit = GERMAN_MARKERS.find((rx) => rx.test(value));
    if (hit) {
      errors.push(`config.cv.toml ${path}: "${value}" reads as German on the English page (matched ${hit}). Translate it, or add the proper noun to GERMAN_ALLOWED in scripts/check-i18n.mjs.`);
    }
  }
}

/**
 * The two branches must carry the SAME projects.
 *
 * Deleting a project by hand means deleting it twice, and the two entries are
 * six hundred lines apart. On 2026-08-22 a deletion pass matched three of four
 * blocks (the fourth wrote `title   =` with extra spaces) and left the German
 * branch with seventeen projects against sixteen English ones. Nothing here
 * would have noticed: the act parity above reads i18n.ts, not the TOML.
 *
 * Compared by anchor where there is one, and by position otherwise, because a
 * title is translated and an anchor is not.
 */
{
  const lists = Object.fromEntries(['de', 'en'].map(
    (b) => [b, cv?.languages?.[b]?.params?.projects?.list ?? []],
  ));
  if (lists.de.length !== lists.en.length) {
    errors.push(`config.cv.toml: project count differs, de=${lists.de.length} en=${lists.en.length}. The two branches are one CV in two languages.`);
  } else {
    lists.de.forEach((p, i) => {
      const q = lists.en[i];
      if ((p.anchor ?? null) !== (q.anchor ?? null)) {
        errors.push(`config.cv.toml projects[${i}]: anchor differs, de="${p.anchor ?? '-'}" en="${q.anchor ?? '-'}" ("${p.title}" vs "${q.title}").`);
      }
      if (!!p.featured !== !!q.featured) {
        errors.push(`config.cv.toml projects[${i}] "${p.title}": featured differs between branches, so the card renders at a different size per language.`);
      }
      if (!!p.screenshot !== !!q.screenshot) {
        errors.push(`config.cv.toml projects[${i}] "${p.title}": screenshot present in one branch only.`);
      }
      if (Number.isFinite(p.pdf_rank) !== Number.isFinite(q.pdf_rank)) {
        errors.push(`config.cv.toml projects[${i}] "${p.title}": pdf_rank present in one branch only.`);
      }
      // url and category were left out of the first pass, and they are the two
      // fields that produce exactly the defect this block was written against:
      // a url in one branch only makes the card a link in one language and
      // plain text in the other, and the category is an untranslated label that
      // groups and colours the card, so a divergence there is always a typo.
      if (!!p.url !== !!q.url) {
        errors.push(`config.cv.toml projects[${i}] "${p.title}": url present in one branch only, so the card links out in one language and not in the other.`);
      }
      if ((p.category ?? null) !== (q.category ?? null)) {
        errors.push(`config.cv.toml projects[${i}] "${p.title}": category differs, de="${p.category ?? '-'}" en="${q.category ?? '-'}". The category is an identifier, not prose.`);
      }
    });
  }
}

/**
 * One version number, six places.
 *
 * The CV names the open-bridge release in six spots: four prose passages in
 * config.cv.toml and two `running[].proof` anchors in i18n.ts. On 2026-08-22 all
 * six still said v0.14.0 while the repo was at v0.20.2, six minors along. A
 * pinned version on a page whose whole argument is "open it and check" ages into
 * the exact opposite of a proof.
 *
 * Nothing here can reach the network, so this cannot know the true version. What
 * it CAN do is make the six agree, which is the failure mode that actually bit:
 * a hand-bump that misses a copy. One number to change, and a broken build if a
 * copy is left behind.
 */
const versions = new Map();
for (const [label, text] of [['config.cv.toml', cvRaw], ['src/lib/i18n.ts', i18nRaw]]) {
  for (const m of text.matchAll(/\bv\d+\.\d+\.\d+\b/g)) {
    if (!versions.has(m[0])) versions.set(m[0], []);
    versions.get(m[0]).push(label);
  }
}
if (versions.size > 1) {
  const listed = [...versions.entries()]
    .map(([v, files]) => `${v} (${[...new Set(files)].join(', ')})`)
    .join(' vs ');
  errors.push(`open-bridge version disagrees across files: ${listed}. One release, one number.`);
}
// Deliberately NO rule that a version must exist. The pinned number went stale
// twice on 2026-08-22 alone (v0.14.0 while the repo was at v0.20.2, then v0.20.2
// while it was at v0.21.0), and a build-time guard cannot see the network, so it
// can only ever check that the copies agree with each other, never that they
// agree with the release. The prose now names the repo and the licence, which do
// not age. The rule above still fires the moment someone re-pins a number in one
// file and forgets the other.

/**
 * A screenshot without an alt text.
 *
 * The project cards rendered `alt=""` on every picture they carried, in both
 * languages. An empty alt is a real instruction: it tells a screen reader the
 * image is decoration and to skip it. On these cards the picture IS the evidence
 * the card offers, and the illustrated ones show placeholder figures, which a
 * reader who cannot see them has every right to be told. The rule is per
 * screenshot, not per count, so no number is written here to go stale. The
 * presentation had already settled this question the other way (see the `alt`
 * comment in src/lib/i18n.ts); the CV page never got the memo.
 */
for (const branch of ['de', 'en']) {
  for (const p of cv?.languages?.[branch]?.params?.projects?.list ?? []) {
    if (p.screenshot && !String(p.screenshot_alt ?? '').trim()) {
      errors.push(`config.cv.toml ${branch}: project "${p.title}" has a screenshot but no screenshot_alt. Say what is on it.`);
    }
    if (!p.screenshot && p.screenshot_alt) {
      errors.push(`config.cv.toml ${branch}: project "${p.title}" has screenshot_alt but no screenshot.`);
    }
  }
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
/*
 * The surface this reads has to be the surface the reader sees.
 *
 * Measured on 2026-09-04: `npm run check:i18n` ended green while
 * "Geladener Impulsgeber" stood in dist/de/index.html and "Invited guest
 * speaker" in dist/en/index.html, both of them word for word on the list above.
 * They live in experiences.list[].details, and this only ever read
 * summary.summary. A guard that measures a narrower surface than the renderer
 * is worse than none: it reports the all-clear for the very field nobody is
 * watching. The talk stayed overstated for a fortnight behind a green build.
 *
 * So every field a renderer turns into prose belongs in here. When a new prose
 * field is added to the TOML, it belongs in this list on the same day.
 */
const branchProse = (b) => {
  const p = cv?.languages?.[b]?.params ?? {};
  return [
    p.summary?.summary ?? '',
    ...(p.experiences?.list ?? []).flatMap((e) => [e.position ?? '', e.company ?? '', e.details ?? '']),
    ...(p.projects?.list ?? []).flatMap((x) => [x.title ?? '', x.tagline ?? '', x.tagline_pdf ?? '']),
    ...(p.interests?.list ?? []).map((x) => x.details ?? x.name ?? ''),
  ].join('\n');
};
const proseSources = [
  ['config.cv.toml', ['de', 'en'].map(branchProse).join('\n')],
  ['src/lib/i18n.ts', [de, en].flatMap((b) => [b.careerIntro, ...(b.careerDetails ?? [])]).join('\n')],
];
for (const [file, blob] of proseSources) {
  for (const rx of OVERCLAIMS) {
    if (rx.test(blob)) errors.push(`${file}: the TU Darmstadt talk is described as a standing role (${rx}). It was one Impulsvortrag, 04/2026.`);
  }
}

/**
 * A config field that no renderer reads.
 *
 * This is the failure this repo keeps producing, and it is expensive in a way
 * that looks free: the field is there, it is filled in, it reads as maintained,
 * and it reaches nobody. Three rounds of it, all found by hand, all on the same
 * day: `[languages.*.params.skills]` carried 56 entries that appeared on neither
 * page and in neither PDF; `challenge` / `solution` / `impact` carried 36 field
 * instances across six projects per branch that no renderer has ever read; five
 * Hugo keys survived the move to Astro because `getSiteConfig()` is never
 * called. Whoever edits the CV cannot tell the difference from the inside.
 *
 * The check is deliberately crude: does the key NAME appear anywhere in src/ or
 * scripts/. That over-accepts (a key named `title` is referenced by something
 * else entirely) but never over-rejects, so it cannot block honest work. It is a
 * floor, not a proof.
 *
 * ALLOWED holds keys that legitimately have no reader. Add to it only with a
 * reason on the line, because every silent entry here is a field that will look
 * maintained forever.
 */
const ALLOWED_WITHOUT_READER = new Map([
  ['sidebar_qualifications_title', 'heading kept for a block that was removed as duplicated content; see CVPage.astro'],
]);
{
  const roots = ['src', 'scripts'];
  const exts = new Set(['.astro', '.ts', '.tsx', '.js', '.mjs']);
  const files = [];
  const walkDir = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walkDir(full);
      else if (exts.has(extname(entry.name))) files.push(full);
    }
  };
  for (const r of roots) { try { walkDir(r); } catch { /* absent root is fine */ } }
  const blob = files.map((f) => readFileSync(f, 'utf8')).join('\n');

  const keysInToml = new Set();
  const collect = (node) => {
    if (Array.isArray(node)) { node.forEach(collect); return; }
    if (node && typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) { keysInToml.add(k); collect(v); }
    }
  };
  collect(cv);

  for (const key of [...keysInToml].sort()) {
    if (ALLOWED_WITHOUT_READER.has(key)) continue;
    const referenced = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(blob);
    if (!referenced) {
      errors.push(
        `config.cv.toml: key "${key}" is read by nothing in src/ or scripts/. ` +
        `Render it or delete it; a field nobody reads still looks maintained. ` +
        `If it is legitimately unread, add it to ALLOWED_WITHOUT_READER with the reason.`
      );
    }
  }
}

if (notices.length) {
  console.log('i18n check notes:');
  for (const n of notices) console.log('  -', n);
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
