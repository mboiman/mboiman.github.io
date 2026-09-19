/**
 * Guards the two privacy pages and the one-line note under the chat composer
 * against statements that were already false once.
 *
 * Why this exists. From 2026-08-06 the agent logged every question and every
 * answer in plain text, while the page and the composer note both said "Wir
 * speichern den Verlauf nicht". Nothing failed: the text is hand-written, no
 * other check reads it for meaning, and the build stayed green for six weeks.
 * The rewrite that fixed it then met a second branch that rewrote the same
 * three places with an older view of the facts (consent under lit. a, the
 * renamed TTDSG, "Microsoft Corporation", no word on the IP address in the
 * access log). A merge conflict resolved in the wrong direction would have
 * shipped that version, again with a green build.
 *
 * So the rules below are narrow on purpose. Each one names a statement that was
 * wrong on a real branch, or a fact whose absence was the finding. None of them
 * judges style. When the facts change (a commercial Anthropic contract, a
 * rotated key, a runtime that stops writing IP addresses), change the rule in
 * the same commit as the text, and say why in the rule's comment.
 *
 * Reads the .astro sources, not dist/: the legal pages have no dynamic content,
 * so source and output say the same words, and running before `astro build`
 * fails in a second instead of after a full build. The dash rule for these pages
 * lives in check-output.mjs, which reads dist/.
 *
 * Usage: node scripts/check-privacy.mjs [rootDir]
 *   rootDir defaults to the current directory. Pointing it at a tree with the
 *   same three paths lets you check another branch's files without checking
 *   the branch out.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { visibleText } from './lib/visible-text.js';

const root = process.argv[2] ?? '.';
const PATHS = {
  de: 'src/pages/de/datenschutz.astro',
  en: 'src/pages/en/datenschutz.astro',
  i18n: 'src/lib/i18n.ts',
};

const errors = [];
const read = (rel) => {
  try {
    return readFileSync(join(root, rel), 'utf8');
  } catch (err) {
    errors.push(`${rel}: cannot read (${err instanceof Error ? err.message : err})`);
    return '';
  }
};

const flat = (html) => visibleText(html).replace(/\s+/g, ' ').trim();

/** Text of numbered section `n` ("<h2>5. ..."), up to the next <h2>. */
function section(src, n) {
  const start = src.search(new RegExp(`<h2>\\s*${n}\\.`));
  if (start === -1) return '';
  const next = src.indexOf('<h2>', start + 4);
  return src.slice(start, next === -1 ? undefined : next);
}

/** Every <li>, as flattened text. */
const items = (src) => [...src.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map((m) => flat(m[1]));

/** Every block (<p> or <li>), as flattened text. */
const blocks = (src) =>
  [...src.matchAll(/<(p|li)\b[^>]*>([\s\S]*?)<\/\1>/g)].map((m) => flat(m[2]));

const count = (src, tag) => (src.match(new RegExp(`<${tag}\\b`, 'g')) ?? []).length;

const pages = { de: read(PATHS.de), en: read(PATHS.en) };
const i18nSource = read(PATHS.i18n);

// ── The composer note, both languages ────────────────────────────────────────
// Parsed as text rather than imported, so the same check runs against any tree
// passed as rootDir. Fail closed: anything other than exactly one note per
// language means the parse no longer understands the file.
const notes = [...i18nSource.matchAll(/privacyNote:\s*(['"])((?:(?!\1).)*)\1/g)].map((m) => m[2]);
if (i18nSource && notes.length !== 2) {
  errors.push(`${PATHS.i18n}: expected exactly two privacyNote strings (de, en), found ${notes.length}. Teach the parse rather than skipping it.`);
}
const [noteDe = '', noteEn = ''] = notes;

// ── Statements that were false on a real branch ──────────────────────────────
// Checked in every text a visitor reads: both pages and both notes.
const FORBIDDEN = [
  // Live from 2026-06-09 until this rewrite, false since 2026-08-06.
  [/speichern den Verlauf nicht/i, 'the conversation IS logged (Elastic, since 2026-08-06)'],
  [/do(?:n'?t| not) store the conversation/i, 'the conversation IS logged (Elastic, since 2026-08-06)'],
  // The agent's own system prompt said this to visitors.
  [/Chat-Verlauf als Ganzes/i, 'the conversation IS logged'],
  // Consent by sending a message: withdrawing it cannot stop the processing
  // that already happened, and the processing does not depend on it.
  [/Einwilligung durch das Absenden/i, 'no consent basis: lit. b and lit. f carry the chat'],
  [/lit\.\s*a\s+DSGVO/i, 'no consent basis: lit. b and lit. f carry the chat'],
  [/Art\.\s*6\s*\(1\)\s*\(a\)/i, 'no consent basis: Art. 6(1)(b) and (f) carry the chat'],
  // Renamed in May 2024.
  [/TTDSG/, 'the act is called TDDDG since May 2024'],
  // The page speaks of Michael Boiman in the third person throughout.
  [/meiner Person/i, 'third person: "Michael Boimans Person"'],
  // The EU contracting party for Microsoft 365 is the Irish entity.
  [/Microsoft Corporation/, 'the EU contracting party is Microsoft Ireland Operations Limited'],
  // The cv-widget branch's note: it names two purposes and hides the logging.
  [/gespeichert, um Anfragen zu bearbeiten/i, 'the note has to say that the conversation is logged'],
  [/stored to process requests/i, 'the note has to say that the conversation is logged'],
  // Too narrow. A superuser key of the cluster sits in more places than the
  // account's admin list (infra/remotes/elastic.yaml, master_key).
  [/Zugriff haben Michael Boiman und die Administratoren/i, 'more people can read the logs than the account admins'],
  [/Michael Boiman and the administrators of that account have access/i, 'more people can read the logs than the account admins'],
  // Acceptance 2026-09-19: the widget fetches the card whenever the chat window opens,
  // also by itself (window left open last time) and via ...#agent, on every page,
  // the legal pages included (headless probe: /de/impressum/ and /en/datenschutz/).
  [/Auf allen übrigen Seiten, darunter Impressum/i, 'the card is fetched whenever the chat window opens, on every page'],
  [/On every other page, including the legal\s+notice/i, 'the card is fetched whenever the chat window opens, on every page'],
];
for (const [where, text] of [
  [PATHS.de, flat(pages.de)],
  [PATHS.en, flat(pages.en)],
  [`${PATHS.i18n} privacyNote (de)`, noteDe],
  [`${PATHS.i18n} privacyNote (en)`, noteEn],
]) {
  for (const [rx, why] of FORBIDDEN) {
    const m = text.match(rx);
    if (m) errors.push(`${where}: "${m[0]}" is a statement that was already false once. ${why}.`);
  }
}

// ── The composer note says what happens ──────────────────────────────────────
if (noteDe && !/protokolliert/i.test(noteDe)) {
  errors.push(`${PATHS.i18n} privacyNote (de): has to say that the conversation is logged ("protokolliert"), found "${noteDe}".`);
}
if (noteEn && !/\blogged\b/i.test(noteEn)) {
  errors.push(`${PATHS.i18n} privacyNote (en): has to say that the conversation is logged, found "${noteEn}".`);
}

// ── Facts whose absence was the finding, per language ────────────────────────
const LANG = {
  de: {
    opLog: /Betriebsprotokoll/i,
    ip: /IP-Adresse/,
    senderBox: /Absenderpostfach/,
    toVisitor: /an Sie\b/,
    noAutoDelete: /nicht eingerichtet|ohne automatische Löschung/,
    ownResponsibility: /eigener Verantwortung/,
    noDpa: /kein(?:en)? Vertrag zur Auftragsverarbeitung/,
    training: /Training/,
    elastic: /Elastic Cloud/,
    keys: /Zugangsschlüssel/,
    litB: /Art\.\s*6 Abs\.\s*1 lit\.\s*b/,
    litF: /Art\.\s*6 Abs\.\s*1 lit\.\s*f/,
    objection: /Protokollierung Ihres Gesprächs widersprechen/,
    card: /Agentenkarte/,
    cardOnOpen: /Öffnen des Chatfensters/,
    cardDeepLink: /#agent/,
    replies: /Antworten auf diese E-Mails/,
    repliesNotEvaluated: /nicht automatisch ausgewertet/,
    repliesKept: /Ihre Antworten/,
  },
  en: {
    opLog: /operational log/i,
    ip: /IP address/,
    senderBox: /sending mailbox/,
    toVisitor: /\bto you\b/,
    noAutoDelete: /[Nn]o automatic deletion|without automatic deletion/,
    ownResponsibility: /own responsibility/,
    noDpa: /no data processing agreement/i,
    training: /\btrain/i,
    elastic: /Elastic Cloud/,
    keys: /access keys?/,
    litB: /Art\.\s*6\(1\)\(b\)/,
    litF: /Art\.\s*6\(1\)\(f\)/,
    objection: /object to your conversation being logged/,
    card: /agent card/,
    cardOnOpen: /open(?:s|ing)? the chat window|chat window (?:is )?open/,
    cardDeepLink: /#agent/,
    replies: /[Rr]eplies to these emails/,
    repliesNotEvaluated: /not evaluated automatically/,
    repliesKept: /your replies/,
  },
};

for (const lang of ['de', 'en']) {
  const src = pages[lang];
  if (!src) continue;
  const file = PATHS[lang];
  const L = LANG[lang];
  const s3 = items(section(src, 3));
  const s4 = blocks(section(src, 4));
  const s5 = items(section(src, 5));
  const s6 = flat(section(src, 6));
  const all = flat(src);

  // The runtime starts uvicorn with its defaults: access log on, proxy headers
  // trusted from 127.0.0.1, where cloudflared connects from. Every request,
  // including the agent-card fetch on page load, writes the visitor's IP
  // address to ~/Library/Logs/mboiman-agent.log. Reproduced with uvicorn 0.49
  // and a synthetic X-Forwarded-For. If the runtime stops doing that, drop the
  // sentence and this rule together.
  if (!s3.some((t) => L.opLog.test(t) && L.ip.test(t))) {
    errors.push(`${file} section 3: the operational-log item has to name the IP address the service writes to its access log.`);
  }
  if (!s5.some((t) => L.opLog.test(t) && L.ip.test(t))) {
    errors.push(`${file} section 5: the retention line for operational logs has to cover the IP addresses in the access log.`);
  }

  // Code mails, invitations and Michael's answer go out through Graph and stay
  // in the sender's Sent Items. A retention list without them is incomplete.
  if (!s5.some((t) => L.senderBox.test(t) && L.toVisitor.test(t))) {
    errors.push(`${file} section 5: needs a retention line for the agent's emails to the visitor in the sending mailbox.`);
  }
  // The mailboxes (ai@bks-lab.com Sent Items, Michael's Gmail) and the Telegram chat
  // have no automatic deletion. The first version promised 12 months for them, which
  // nothing implemented. Every section-5 line about a mailbox has to say that there is
  // no automatic deletion. When a rule or a Graph cleanup exists, change the text and
  // this check in the same commit.
  for (const t of s5.filter((t) => L.senderBox.test(t))) {
    if (!L.noAutoDelete.test(t)) {
      errors.push(`${file} section 5: "${t.slice(0, 60)}…" names a mailbox without saying that no automatic deletion is set up there.`);
    }
  }

  // The agent runs on a Claude subscription, not under Anthropic's Commercial
  // Terms: no processing agreement, Anthropic acts as its own controller, and
  // the training setting of the account decides how long it keeps the data.
  // If that changes, rewrite this rule with the text.
  const anthropic = s4.find((t) => /^Anthropic\b/.test(t)) ?? '';
  if (!anthropic) {
    errors.push(`${file} section 4: no recipient item that starts with "Anthropic".`);
  } else {
    for (const [rx, what] of [
      [L.ownResponsibility, 'that Anthropic processes the data under its own responsibility'],
      [L.noDpa, 'that there is no processing agreement'],
      [L.training, 'the training setting'],
    ]) {
      if (!rx.test(anthropic)) errors.push(`${file} section 4, Anthropic: has to state ${what}.`);
    }
  }
  // The DPF/SCC sentence is Michael's basis for his own transfers. It must name
  // the providers it covers and must not cover Anthropic, for which he has no
  // such basis of his own.
  const dpf = s4.filter((t) => /Data Privacy Framework/.test(t));
  if (!dpf.length) {
    errors.push(`${file} section 4: the transfer basis for the US providers is missing.`);
  }
  for (const t of dpf) {
    if (/Anthropic/.test(t)) {
      errors.push(`${file} section 4: the DPF/SCC sentence mentions Anthropic. There is no DPF or SCC basis between Michael Boiman and Anthropic; say that in the Anthropic item instead.`);
    }
    if (!/GitHub/.test(t) || !/Cloudflare/.test(t)) {
      errors.push(`${file} section 4: the DPF/SCC sentence has to name the providers it covers, otherwise it reads as covering every recipient.`);
    }
  }

  // Who can read the transcripts: the account and every holder of one of its
  // keys, not a named admin list.
  if (!s3.some((t) => L.elastic.test(t) && L.keys.test(t))) {
    errors.push(`${file} section 3: the conversation-log item has to say that holders of the account's access keys can read the logs.`);
  }

  // The card fetch happens on opening the chat window, on every page, also when the
  // window opens by itself or through the #agent link (acceptance 2026-09-19). The
  // item has to say so; the forbidden sentence above caught the old claim.
  const card = s3.find((t) => L.card.test(t) && L.ip.test(t)) ?? '';
  if (!card) {
    errors.push(`${file} section 3: no item on fetching the agent card with the IP address.`);
  } else {
    if (!L.cardOnOpen.test(card)) errors.push(`${file} section 3, agent card: has to say that opening the chat window fetches it.`);
    if (!L.cardDeepLink.test(card)) errors.push(`${file} section 3, agent card: has to name the #agent link that opens the window.`);
  }

  // Replies to the agent's emails land in ai@bks-lab.com. The mailbox watcher sets
  // them aside without reading them (Bridge: infra/channels/ai-mailbox-set-aside.json).
  // Section 3 says where they go and that nothing evaluates them, section 5 keeps them
  // with the agent's emails, without automatic deletion.
  if (!s3.some((t) => L.replies.test(t) && /ai@bks-lab\.com/.test(t) && L.repliesNotEvaluated.test(t))) {
    errors.push(`${file} section 3: has to say that replies to the agent's emails go to ai@bks-lab.com and are not evaluated automatically.`);
  }
  if (!s5.some((t) => L.senderBox.test(t) && L.toVisitor.test(t) && L.repliesKept.test(t))) {
    errors.push(`${file} section 5: the retention line for the agent's emails to the visitor has to cover the visitor's replies.`);
  }

  if (!L.litB.test(all) || !L.litF.test(all)) {
    errors.push(`${file}: both legal bases, lit. b and lit. f, have to be named.`);
  }
  if (!L.objection.test(s6)) {
    errors.push(`${file} section 6: the objection and deletion route for the chat is missing.`);
  }
}

// ── The two languages describe the same processing ───────────────────────────
// check-i18n.mjs keeps the widget strings in step, nothing did that for the
// legal pages. Counting headings and items is crude and catches the drift that
// matters: an item added to one language only. The English page carries one
// extra <p>, the courtesy-translation note, so paragraphs are not compared.
if (pages.de && pages.en) {
  for (const tag of ['h2', 'h3', 'li']) {
    const [d, e] = [count(pages.de, tag), count(pages.en, tag)];
    if (d !== e) errors.push(`privacy pages: ${d} <${tag}> in German, ${e} in English. The translation has to describe the same processing.`);
  }
}

if (errors.length) {
  console.error('privacy check failed:');
  for (const e of errors) console.error('  -', e);
  process.exit(1);
}
console.log('privacy check ok: no statement that was false before, the missing facts are present in both languages');
