/**
 * The project match as a PDF: the evaluation first, Michael's CV PDF after it.
 *
 * Asked for on 2026-09-26 ("die Auswertung als PDF exportieren mit meinem
 * PDF-CV"). Built in the browser with pdf-lib, which the repo already carries
 * for the application PDFs, and loaded only when a visitor clicks export. The
 * posting never leaves the browser for this.
 *
 * Helvetica, not IBM Plex: pdf-lib embeds TrueType or OpenType only, and the
 * site ships its faces as subset woff2. Helvetica's WinAnsi set covers German;
 * anything outside it is replaced by `safe()` instead of throwing mid-export.
 */
import type { PDFDocument as PDFDocumentT, PDFFont, PDFPage, RGB } from 'pdf-lib';

export interface ReportAxis { label: string; demand: number; cover: number; fromLines: boolean }
export interface ReportLine { text: string; kind: string; level: string; evidence: string; gap: boolean; counts: boolean }

export interface ReportInput {
  lang: 'de' | 'en';
  kicker: string;          // "Projekt-Abgleich · mit Jev"
  title: string;           // demo title or "Eigene Ausschreibung"
  modeLine: string;        // replay date or live
  total: number;
  verdict: string;
  subs: [string, string][];
  roleLine: string;
  weightsLine: string;
  axes: ReportAxis[];
  legend: { demand: string; cover: string };
  gapsTitle: string;
  gaps: ReportLine[];
  gapsNone: string;
  gapsNote: string;
  linesTitle: string;
  cols: [string, string, string, string];
  lines: ReportLine[];
  methodTitle: string;
  method: string[];
  footer: string;          // "Erstellt am … · mboiman.github.io/de/match/"
  cvNote: string;
  /** The CV to append, already fetched; null when it could not be loaded. */
  cv: Uint8Array | null;
  cvMissing: string;
}

const A4: [number, number] = [595.28, 841.89];
const M = 48;

export async function buildReportPdf(input: ReportInput): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const doc: PDFDocumentT = await PDFDocument.create();
  doc.setTitle(`${input.kicker}: ${input.title}`);
  doc.setAuthor('Michael Boiman');
  doc.setLanguage(input.lang === 'de' ? 'de-DE' : 'en-GB');
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const ink = rgb(0.08, 0.09, 0.11);
  const text = rgb(0.24, 0.27, 0.31);
  const muted = rgb(0.38, 0.41, 0.45);
  const line = rgb(0.86, 0.88, 0.91);
  const blue = rgb(0.114, 0.306, 0.847);
  const amber = rgb(0.706, 0.325, 0.035);
  const red = rgb(0.706, 0.137, 0.094);

  // Characters Helvetica cannot draw become a close ASCII form or go.
  const cache = new Map<string, boolean>();
  const drawable = (f: PDFFont, ch: string) => {
    const k = f.name + ch;
    if (!cache.has(k)) { try { f.encodeText(ch); cache.set(k, true); } catch { cache.set(k, false); } }
    return cache.get(k)!;
  };
  const MAP: Record<string, string> = { '↳': '>', '→': '->', '≥': '>=', '≤': '<=', '−': '-', '×': 'x', ' ': ' ', ' ': ' ' };
  const safe = (s: string, f: PDFFont = font) => [...s].map(ch => (drawable(f, ch) ? ch : MAP[ch] ?? '')).join('');

  const wrap = (s: string, f: PDFFont, size: number, width: number): string[] => {
    const out: string[] = [];
    let cur = '';
    for (const word of safe(s, f).split(/\s+/).filter(Boolean)) {
      const next = cur ? `${cur} ${word}` : word;
      if (f.widthOfTextAtSize(next, size) <= width) { cur = next; continue; }
      if (cur) out.push(cur);
      cur = word;
    }
    if (cur) out.push(cur);
    return out.length ? out : [''];
  };

  let page: PDFPage = doc.addPage(A4);
  let y = A4[1] - M;
  const pages: PDFPage[] = [page];
  const newPage = () => { page = doc.addPage(A4); pages.push(page); y = A4[1] - M; };
  const ensure = (h: number) => { if (y - h < M + 24) newPage(); };
  const put = (s: string, x: number, size: number, f: PDFFont = font, color: RGB = text) =>
    page.drawText(safe(s, f), { x, y, size, font: f, color });

  // ── Page 1: head ─────────────────────────────────────────────────────────
  y -= 4;
  put(input.kicker.toUpperCase(), M, 8.5, bold, blue);
  y -= 26;
  for (const l of wrap(input.title, font, 22, A4[0] - 2 * M)) { put(l, M, 22, font, ink); y -= 26; }
  put(input.modeLine, M, 9, font, muted);
  y -= 26;

  // Score ring (left) and figures.
  const cx = M + 58; const cy = y - 58; const r = 50;
  page.drawCircle({ x: cx, y: cy, size: r, borderColor: line, borderWidth: 7 });
  const frac = Math.max(0, Math.min(0.9999, input.total / 100));
  if (frac > 0) {
    const a0 = Math.PI / 2; const a1 = a0 - frac * 2 * Math.PI;
    const sx = r * Math.cos(a0); const sy = -r * Math.sin(a0);
    const ex = r * Math.cos(a1); const ey = -r * Math.sin(a1);
    page.drawSvgPath(`M ${sx} ${sy} A ${r} ${r} 0 ${frac > 0.5 ? 1 : 0} 1 ${ex} ${ey}`, { x: cx, y: cy, borderColor: blue, borderWidth: 7 });
  }
  const num = String(input.total);
  page.drawText(num, { x: cx - font.widthOfTextAtSize(num, 34) / 2, y: cy - 8, size: 34, font, color: ink });

  const fx = M + 140;
  let fy = y - 18;
  page.drawText(safe(input.verdict, bold), { x: fx, y: fy, size: 15, font: bold, color: ink });
  fy -= 24;
  for (const [k, v] of input.subs) {
    page.drawText(safe(k), { x: fx, y: fy, size: 10, font, color: text });
    page.drawText(safe(v), { x: fx + 170, y: fy, size: 10, font: bold, color: ink });
    fy -= 16;
  }
  fy -= 4;
  for (const l of wrap(input.roleLine, font, 9, 250)) { page.drawText(l, { x: fx, y: fy, size: 9, font, color: muted }); fy -= 12; }
  for (const l of wrap(input.weightsLine, font, 9, 250)) { page.drawText(l, { x: fx, y: fy, size: 9, font, color: muted }); fy -= 12; }
  y = Math.min(cy - r - 24, fy - 10);

  // Net diagram.
  const rcx = A4[0] / 2; const R = 92; const rcy = y - R - 22;
  /** A point on spoke i at radius f·R, in the flipped y of drawSvgPath. */
  const at = (i: number, f: number): [number, number] => {
    const a = Math.PI / 2 - (i * 2 * Math.PI) / input.axes.length;
    return [R * f * Math.cos(a), -R * f * Math.sin(a)];
  };
  const pt = (i: number, v: number) => at(i, Math.max(0, Math.min(1, v)));
  const poly = (vals: number[]) => vals.map((v, i) => pt(i, v)).map(([x, yy], i) => `${i ? 'L' : 'M'} ${x.toFixed(1)} ${yy.toFixed(1)}`).join(' ') + ' Z';
  for (const f of [1 / 3, 2 / 3, 1]) page.drawSvgPath(poly(input.axes.map(() => f)), { x: rcx, y: rcy, borderColor: line, borderWidth: 0.7 });
  input.axes.forEach((_, i) => { const [x, yy] = pt(i, 1); page.drawSvgPath(`M 0 0 L ${x} ${yy}`, { x: rcx, y: rcy, borderColor: line, borderWidth: 0.7 }); });
  page.drawSvgPath(poly(input.axes.map(a => a.cover)), { x: rcx, y: rcy, color: blue, opacity: 0.14, borderColor: blue, borderWidth: 1.4 });
  page.drawSvgPath(poly(input.axes.map(a => a.demand)), { x: rcx, y: rcy, color: amber, opacity: 0.06, borderColor: amber, borderWidth: 1.2, borderDashArray: [3, 2] });
  input.axes.forEach((a, i) => {
    const [x, yy] = at(i, 1.1);
    const label = safe(a.label);
    const w = font.widthOfTextAtSize(label, 8);
    const lx = Math.abs(x) < 4 ? rcx + x - w / 2 : x > 0 ? rcx + x + 2 : rcx + x - w - 2;
    const ly = yy < -4 ? rcy - yy + 2 : yy > 4 ? rcy - yy - 9 : rcy - yy - 3;
    page.drawText(label, { x: lx, y: ly, size: 8, font, color: muted });
  });
  y = rcy - R - 36;
  page.drawSvgPath('M 0 0 L 16 0', { x: M, y: y + 3, borderColor: amber, borderWidth: 1.2, borderDashArray: [3, 2] });
  page.drawText(safe(input.legend.demand), { x: M + 22, y, size: 9, font, color: text });
  page.drawSvgPath('M 0 0 L 16 0', { x: M + 150, y: y + 3, borderColor: blue, borderWidth: 1.4 });
  page.drawText(safe(input.legend.cover), { x: M + 172, y, size: 9, font, color: text });
  y -= 30;

  // Open points.
  ensure(60);
  put(input.gapsTitle, M, 12, bold, ink);
  y -= 16;
  for (const l of wrap(input.gapsNote, font, 8.5, A4[0] - 2 * M)) { put(l, M, 8.5, font, muted); y -= 11; }
  y -= 4;
  if (!input.gaps.length) { put(input.gapsNone, M, 10, font, blue); y -= 16; }
  for (const g of input.gaps) {
    const ls = wrap(g.text, font, 10, A4[0] - 2 * M - 150);
    ensure(ls.length * 13 + 6);
    page.drawText(safe(g.kind, bold), { x: M, y, size: 8, font: bold, color: ink });
    ls.forEach((l, k) => page.drawText(l, { x: M + 40, y: y - k * 13, size: 10, font, color: ink }));
    page.drawText(safe(g.level), { x: A4[0] - M - 100, y, size: 9, font, color: red });
    y -= ls.length * 13 + 6;
  }

  // ── Requirements and evidence ────────────────────────────────────────────
  newPage();
  put(input.linesTitle, M, 14, bold, ink);
  y -= 22;
  const colX = [M, M + 250, M + 292, M + 360];
  const colW = [240, 38, 64, A4[0] - M - (M + 360)];
  const head = () => {
    input.cols.forEach((c, i) => page.drawText(safe(c.toUpperCase(), bold), { x: colX[i], y, size: 7.5, font: bold, color: muted }));
    y -= 8;
    page.drawLine({ start: { x: M, y }, end: { x: A4[0] - M, y }, thickness: 0.6, color: line });
    y -= 13;
  };
  head();
  for (const r of input.lines) {
    const a = wrap(r.text, font, 9.5, colW[0]);
    const d = wrap(r.evidence, font, 8.5, colW[3]);
    const h = Math.max(a.length * 12, d.length * 11);
    if (y - h - 14 < M + 24) { newPage(); head(); }
    const c = r.counts ? ink : muted;
    a.forEach((l, k) => page.drawText(l, { x: colX[0], y: y - k * 12, size: 9.5, font, color: c }));
    page.drawText(safe(r.kind, bold), { x: colX[1], y, size: 7.5, font: bold, color: c });
    page.drawText(safe(r.level), { x: colX[2], y, size: 8.5, font, color: r.gap ? red : c });
    d.forEach((l, k) => page.drawText(l, { x: colX[3], y: y - k * 11, size: 8.5, font, color: r.gap ? red : text }));
    // Baseline of the last line is y - h + 12; the rule sits under its descenders
    // and the next row starts a full line below the rule.
    const rule = y - h + 12 - 6;
    page.drawLine({ start: { x: M, y: rule }, end: { x: A4[0] - M, y: rule }, thickness: 0.4, color: line });
    y = rule - 13;
  }

  // ── Method ───────────────────────────────────────────────────────────────
  y -= 18;
  ensure(40);
  put(input.methodTitle, M, 12, bold, ink);
  y -= 16;
  for (const para of input.method) {
    const ls = wrap(para, font, 9, A4[0] - 2 * M);
    ensure(ls.length * 12 + 4);
    ls.forEach(l => { put(l, M, 9, font, text); y -= 12; });
    y -= 4;
  }
  y -= 8;
  ensure(20);
  put(input.cv ? input.cvNote : input.cvMissing, M, 9, bold, blue);

  // Footer on the report pages.
  pages.forEach((p, i) => {
    p.drawText(safe(`${input.footer} · ${i + 1}/${pages.length}`), { x: M, y: 26, size: 7.5, font, color: muted });
  });

  // ── The CV behind it ─────────────────────────────────────────────────────
  if (input.cv) {
    const cv = await PDFDocument.load(input.cv);
    for (const p of await doc.copyPages(cv, cv.getPageIndices())) doc.addPage(p);
  }
  return doc.save();
}
