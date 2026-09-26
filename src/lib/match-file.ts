/**
 * Reads an uploaded posting in the browser, so the file itself never leaves
 * the visitor's machine. What comes out lands in the text field first; only
 * what the visitor then starts is sent.
 *
 *   .txt .md   as text
 *   .pdf       pdf.js, loaded only when a PDF arrives (it is the heavy part)
 *   .docx      a zip; the one entry word/document.xml is inflated with the
 *              browser's own DecompressionStream, no zip library
 */
export const MAX_FILE_BYTES = 5 * 1024 * 1024;

export class FileTooBig extends Error {}

export async function readFileText(file: File): Promise<string> {
  if (file.size > MAX_FILE_BYTES) throw new FileTooBig();
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf') || file.type === 'application/pdf') return readPdf(file);
  if (name.endsWith('.docx')) return readDocx(file);
  return (await file.text()).trim();
}

async function readPdf(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist');
  const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= Math.min(doc.numPages, 20); i += 1) {
    const content = await (await doc.getPage(i)).getTextContent();
    pages.push(content.items.map(it => ('str' in it ? it.str + (it.hasEOL ? '\n' : '') : '')).join(''));
  }
  return pages.join('\n').replace(/[ \t]+\n/g, '\n').trim();
}

/** The one file a docx needs, found through the zip's central directory. */
async function readDocx(file: File): Promise<string> {
  const buf = new Uint8Array(await file.arrayBuffer());
  const view = new DataView(buf.buffer);
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i -= 1) {
    if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('not a zip');
  const count = view.getUint16(eocd + 10, true);
  let p = view.getUint32(eocd + 16, true);
  const dec = new TextDecoder();
  for (let n = 0; n < count; n += 1) {
    const method = view.getUint16(p + 10, true);
    const size = view.getUint32(p + 20, true);
    const nameLen = view.getUint16(p + 28, true);
    const extraLen = view.getUint16(p + 30, true);
    const commentLen = view.getUint16(p + 32, true);
    const local = view.getUint32(p + 42, true);
    const entry = dec.decode(buf.subarray(p + 46, p + 46 + nameLen));
    p += 46 + nameLen + extraLen + commentLen;
    if (entry !== 'word/document.xml') continue;
    const start = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true);
    const raw = buf.subarray(start, start + size);
    const bytes = method === 0 ? raw : new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
    return docxXmlToText(dec.decode(bytes));
  }
  throw new Error('no document.xml');
}

export function docxXmlToText(xml: string): string {
  return xml
    .replace(/<w:tab\/>/g, '\t')
    .replace(/<w:br[^>]*\/>/g, '\n')
    .replace(/<\/w:p>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
