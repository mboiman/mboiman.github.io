/**
 * One rule for "is this entry a talk, or a job", and one rule for "how recent
 * is it". Both used to exist twice.
 *
 * The talk rule lived as a TypeScript regex in src/components/CVPage.astro and
 * as a chain of `includes()` calls in scripts/html_to_pdf.js. The comment in
 * CVPage said outright that it "mirrors the PDF's isWorkshopOrPresentation",
 * which is the part that does not survive contact with a new entry: a talk
 * titled "Keynote" matched neither copy and would have been listed as a career
 * position, silently, in the web CV and in the PDF alike.
 *
 * The two copies had already drifted, though harmlessly: the PDF listed
 * `guest lecture` in front of `lecture`, which the shorter pattern already
 * covers. The list below is the union of both, plus the missing forms.
 *
 * The date rule never existed at all. The presentation took the CV list in
 * FILE order and sliced the first seven, so the act depended on the order rows
 * happen to sit in config.cv.toml rather than on when the work happened.
 */

/**
 * Position titles that mark a speaking engagement rather than a position.
 *
 * `vortrag` alone already covers `impulsvortrag` and `gastvortrag`, but the
 * spaced and hyphenated forms ("Impuls Vortrag", "Impuls-Vortrag") are written
 * out because a substring match is not obvious to the next person editing this
 * list, and an unmatched entry fails silently rather than loudly.
 */
// Single source of truth, shared with scripts/html_to_pdf.js. Two hand-kept
// copies had already drifted: the PDF side never knew "keynote" or "guest talk".
import talkPatterns from '../../scripts/lib/talk-patterns.json';

const TALK_POSITION_PATTERNS = talkPatterns.position;
const TALK_COMPANY_PATTERNS = talkPatterns.company;

const TALK_POSITION_RE = new RegExp(TALK_POSITION_PATTERNS.join('|'), 'i');
const TALK_COMPANY_RE = new RegExp(TALK_COMPANY_PATTERNS.join('|'), 'i');

/**
 * True when the entry is a talk or workshop rather than a career position.
 *
 * Both fields are optional so the same function serves the CV page, the PDF
 * script and the presentation, whose entry shapes differ in what they carry.
 */
export function isTalk(e: { position?: string; company?: string }): boolean {
  return TALK_POSITION_RE.test(e.position || '') || TALK_COMPANY_RE.test(e.company || '');
}

/**
 * Entries that have not ended yet sort above every finished one, whatever their
 * start date. Added rather than compared separately so the whole key stays a
 * single number the caller can sort on. Large enough that no real year can
 * reach it.
 */
const RUNNING_BIAS = 1_000_000;

/** "seit 06/2025" and "since 09/2025" are the two forms in the CV. */
const RUNNING_RE = /^\s*(?:seit|since|ab|from)\b/i;

/**
 * A sortable key for a `dates` string, larger meaning more recent.
 *
 * Formats in config.cv.toml: "04/2026", "seit 06/2025", "since 09/2025",
 * "08/2021-05/2025", "2023", "01/2006-12/2008". Only the START of a range is
 * read: a range's end says when the work stopped, not how recent the entry is,
 * and sorting by the end puts a job that ran for four years below one that
 * started later and finished sooner.
 *
 * A year without a month is keyed to January, its earliest possible start, so
 * a bare "2023" never jumps above a dated entry from the same year that we
 * actually know began later.
 *
 * An unparseable string returns 0 and lands at the end rather than throwing.
 */
export function startDate(dates: string): number {
  const raw = String(dates || '');
  const running = RUNNING_RE.test(raw);

  const monthYear = raw.match(/(\d{1,2})\s*\/\s*(\d{4})/);
  const year = monthYear ? Number(monthYear[2]) : Number(raw.match(/\d{4}/)?.[0] ?? NaN);
  if (!Number.isFinite(year)) return 0;

  const month = monthYear ? Math.min(12, Math.max(1, Number(monthYear[1]))) : 1;
  return year * 12 + month + (running ? RUNNING_BIAS : 0);
}

/**
 * Newest first, stable: two entries with the same key keep the order they had
 * in the source file. `Array.prototype.sort` is specified as stable since
 * ES2019, but the input is copied first so the caller's array is not reordered
 * underneath it.
 */
export function sortByRecency<T extends { dates?: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => startDate(b.dates || '') - startDate(a.dates || ''));
}
