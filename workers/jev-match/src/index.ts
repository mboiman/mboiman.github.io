/**
 * jev-match: the live side of the project match on mboiman.github.io/<lang>/match/.
 *
 *   GET  /health            reachability, for the page's live dot
 *   POST /match   {lang, text}   one posting: project request + one request per line
 *   POST /profile {lang}         how deep the CV is per area (used by the measure script)
 *
 * Why a worker at all: the Jev key must never reach a browser, and GitHub Pages
 * has no server. Why not the agent host on macminim4: that box shares the home
 * connection, and TypeSafe answered it with 403 before any key check on
 * 2026-09-26 while the same request from elsewhere went through.
 *
 * Nothing is stored here: no text, no answer, no log line with content. The
 * questions and the scoring are the page's own module (src/lib/match.ts), so
 * the replay of the examples and a live run ask exactly the same things.
 */
import {
  splitRequirements, projectRequest, requirementRequest, profileRequest,
  readProject, readRequirement, readProfile, MODEL, type CvEntry, type JevRequest, type JevAnswer, type Lang,
} from '../../../src/lib/match';
import entriesDe from '../.generated/entries.de.json';
import entriesEn from '../.generated/entries.en.json';

interface Env {
  TYPESAFE_API_KEY: string;
  ALLOWED_ORIGINS: string;
  LIMITER?: { limit(o: { key: string }): Promise<{ success: boolean }> };
}

const API = 'https://api.typesafe.ai/v1/systemone';
const MAX_CHARS = 12000;
const PARALLEL = 4;
const ENTRIES: Record<Lang, CvEntry[]> = { de: entriesDe as CvEntry[], en: entriesEn as CvEntry[] };

function cors(origin: string | null, env: Env): Record<string, string> {
  const allowed = env.ALLOWED_ORIGINS.split(',').map(s => s.trim());
  return origin && allowed.includes(origin)
    ? { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', Vary: 'Origin' }
    : {};
}

const json = (data: unknown, status: number, headers: Record<string, string>) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers } });

async function ask(body: JevRequest, key: string): Promise<JevAnswer> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const started = Date.now();
    const res = await fetch(API, { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) {
      const out = await res.json() as JevAnswer;
      out._seconds = (Date.now() - started) / 1000;
      return out;
    }
    if ([429, 500, 502, 503, 504].includes(res.status) && attempt < 2) {
      await new Promise(r => setTimeout(r, 600 * 2 ** attempt));
      continue;
    }
    throw new Error(`jev ${res.status}`);
  }
  throw new Error('jev unavailable');
}

async function pool<T, R>(items: T[], fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(PARALLEL, items.length) }, async () => {
    while (next < items.length) { const i = next++; out[i] = await fn(items[i]); }
  }));
  return out;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const h = cors(origin, env);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: h });
    if (url.pathname === '/health') return json({ ok: Boolean(env.TYPESAFE_API_KEY), model: MODEL }, 200, h);
    if (request.method !== 'POST') return json({ error: 'method' }, 405, h);
    // A browser from another site gets no CORS header and cannot read the
    // answer anyway; refusing it here also spares the Jev budget.
    if (origin && !h['Access-Control-Allow-Origin']) return json({ error: 'origin' }, 403, h);

    if (env.LIMITER) {
      const { success } = await env.LIMITER.limit({ key: request.headers.get('CF-Connecting-IP') || 'unknown' });
      if (!success) return json({ error: 'rate' }, 429, h);
    }

    let body: { lang?: string; text?: string };
    try { body = await request.json(); } catch { return json({ error: 'json' }, 400, h); }
    const lang: Lang = body.lang === 'en' ? 'en' : 'de';
    const entries = ENTRIES[lang];

    try {
      if (url.pathname === '/profile') {
        const a = await ask(profileRequest(entries), env.TYPESAFE_API_KEY);
        return json({ lang, model: a.model ?? MODEL, depth: readProfile(a), seconds: a._seconds, tokens: a.usage?.input_tokens ?? 0 }, 200, h);
      }
      if (url.pathname === '/match') {
        const text = String(body.text || '').slice(0, MAX_CHARS);
        const lines = splitRequirements(text);
        if (lines.length < 2) return json({ error: 'short' }, 422, h);
        const [project, answers] = await Promise.all([
          ask(projectRequest(text), env.TYPESAFE_API_KEY),
          pool(lines, line => ask(requirementRequest(line, entries), env.TYPESAFE_API_KEY)),
        ]);
        return json({
          lang, live: true, measuredAt: new Date().toISOString().slice(0, 10), model: project.model ?? MODEL,
          project: readProject(project),
          requirements: lines.map((line, i) => readRequirement(line, answers[i])),
        }, 200, h);
      }
    } catch (e) {
      return json({ error: e instanceof Error ? e.message : 'failed' }, 502, h);
    }
    return json({ error: 'not found' }, 404, h);
  },
};
