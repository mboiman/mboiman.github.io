/**
 * What goes into the match PDF, from one measurement. Shared by the page's
 * export button (CVMatch.astro) and the command line (scripts/jev-match.mjs),
 * so an application bundle carries exactly the evaluation a visitor would
 * download. No DOM here: every text comes from i18n, every number from match.ts.
 */
import { AXES, DEFAULT_WEIGHTS, MET_LEVEL, scoreMatch, verdictOf, type CvEntry, type Lang, type Measurement, type RequirementResult, type Weights } from './match.ts';
import { i18n } from './i18n.ts';
import type { ReportInput, ReportLine } from './match-pdf.ts';

export interface ReportArgs {
  lang: Lang;
  meas: Measurement & { live?: boolean };
  /** Stored profile depth per area (src/data/match/profile.<lang>.json). */
  profile: Record<string, number>;
  /** The CV entries Jev chose from, for their labels. */
  entries: Pick<CvEntry, 'id' | 'label'>[];
  title: string;
  date: Date;
  cv: Uint8Array | null;
  weights?: Weights;
  /** Small lines under the method: what made this and where. */
  credit?: string[];
  /** The bundle puts the CV right after the evaluation (application PDF). */
  cvFollows?: boolean;
}

export function reportInput(a: ReportArgs): ReportInput {
  const T = i18n[a.lang].match;
  const locale = a.lang === 'de' ? 'de-DE' : 'en-GB';
  const w = a.weights ?? DEFAULT_WEIGHTS;
  const nf = (n: number) => n.toLocaleString(a.lang === 'de' ? 'de-DE' : 'en-US', { maximumFractionDigits: 0 });
  const label = new Map(a.entries.map(e => [e.id, e.label]));
  const s = scoreMatch(a.meas.requirements, a.meas.project.demand, a.profile, w);

  const kind = (r: RequirementResult) => (!r.counts ? T.notReq : r.must >= 0.5 ? T.must : T.nice);
  const evidence = (r: RequirementResult) => (r.counts && r.evidence && r.level >= 0.75 && label.has(r.evidence) ? label.get(r.evidence)! : r.counts ? T.noEvidence : '');
  const toLine = (r: RequirementResult): ReportLine => ({
    text: r.text, kind: kind(r), level: r.counts ? T.levels[Math.round(r.level)] : '', evidence: evidence(r), gap: r.counts && r.level < MET_LEVEL, counts: r.counts,
  });
  const share = Math.round(w.reqShare * 100);

  return {
    lang: a.lang,
    kicker: T.kicker,
    title: a.title,
    modeLine: a.meas.live ? T.modeLive : T.modeReplay.replace('{date}', new Date(`${a.meas.measuredAt}T12:00:00Z`).toLocaleDateString(locale)),
    total: s.total,
    verdict: T.verdicts[verdictOf(s.total)],
    subs: [[T.subCoverage, `${nf(s.coverage * 100)} %`], [T.subMust, `${s.mustMet} / ${s.mustTotal}`], [T.subTopics, `${nf(s.topicFit * 100)} %`]],
    roleLine: T.role.replace('{role}', T.roles[a.meas.project.role as keyof typeof T.roles] ?? T.roles.other),
    weightsLine: T.pdfWeights.replace('{a}', String(share)).replace('{b}', String(100 - share)).replace('{n}', String(w.mustFactor)),
    axes: AXES.map(ax => ({ label: ax.label[a.lang], demand: s.perAxis[ax.key].demand, cover: s.perAxis[ax.key].cover, fromLines: s.perAxis[ax.key].fromLines })),
    legend: { demand: T.legendDemand, cover: T.legendCover },
    gapsTitle: T.gapsTitle, gaps: s.gaps.map(toLine), gapsNone: T.gapsNone, gapsNote: T.gapsNote,
    linesTitle: T.pdfLinesTitle, cols: T.pdfCols as [string, string, string, string], lines: a.meas.requirements.map(toLine),
    methodTitle: T.methodTitle, method: [T.methodLead, ...T.formula, ...T.limits],
    footer: T.pdfFooter.replace('{date}', a.date.toLocaleDateString(locale)),
    credit: a.credit ?? [],
    cvNote: T.pdfCvNote, cv: a.cv, cvMissing: a.cvFollows ? T.pdfCvNote : T.pdfCvMissing,
  };
}
