/**
 * Browser behaviour the alternative CV views share. The minimal view uses all
 * of it (initCvLinks); the future view draws a graph instead of lists and takes
 * only readFocus, focusText and agentPrompts.
 *
 * Written once when the third view arrived: the minimal page carried all of
 * this inline, and a second copy in the future page would have drifted the
 * way the talk rule once did (see experience.ts). The pages opt in through
 * data attributes, so the markup says what takes part and this file never
 * needs to know a page's class names.
 *
 *   [data-focus-list]      a list whose children may be moved to the top
 *   [data-focus-title]     inside an entry: where the "matching" tag goes
 *   [data-focus-banner]    the line above the sections; carries data-for,
 *                          data-plain, data-tag, and holds [data-focus-text]
 *   [data-agent-prompt]    a button that asks the agent its text
 */

/** Same pattern the agent's highlight uses, see AgentWidget.astro. */
const ANCHOR = /^[a-z0-9-]+$/;

/**
 * A link made for one application:
 *   ?for=DB%20InfraGO&focus=db-vertrieb,tuev-sued,e-invoicing-platform
 * moves the named entries to the top of their list, in the order given, opens
 * them, and says so in the banner. Built entirely from the URL: nothing about
 * an application is ever written into this public repository. An unknown
 * anchor is ignored, not an error.
 */
/** The anchors and the recipient's name from a tailored link, validated. */
export function readFocus(): { anchors: string[]; name: string } {
  const params = new URLSearchParams(location.search);
  const anchors = (params.get('focus') || '')
    .split(',').map(a => a.trim()).filter(a => ANCHOR.test(a)).slice(0, 20);
  return { anchors, name: (params.get('for') || '').trim().slice(0, 80) };
}

/** The banner sentence for a tailored link: with the name, or without. */
export function focusText(banner: HTMLElement, name: string): string {
  return name ? (banner.dataset.for || '').replace('{for}', name) : (banner.dataset.plain || '');
}

function applyFocus(): void {
  const { anchors: focus, name } = readFocus();
  const banner = document.querySelector<HTMLElement>('[data-focus-banner]');
  if (!focus.length || !banner) return;

  const hits = focus
    .map(a => document.querySelector<HTMLElement>(`[data-focus-list] > [data-cv-anchor="${a}"]`))
    .filter((el): el is HTMLElement => el !== null);
  if (!hits.length) return;

  // Reverse, so prepending leaves them in the order the link gave.
  [...hits].reverse().forEach(el => {
    if (el instanceof HTMLDetailsElement) el.open = true;
    el.classList.add('is-focus');
    const tag = document.createElement('span');
    tag.className = 'cv-focus-tag';
    tag.textContent = banner.dataset.tag || '';
    (el.querySelector('[data-focus-title]') ?? el).prepend(tag);
    el.parentElement?.prepend(el);
  });

  const text = focusText(banner, name);
  const out = banner.querySelector('[data-focus-text]');
  if (out) out.textContent = text;   // textContent: the name comes from the URL
  banner.hidden = false;
}

/**
 * #exp-dvag or #project-agent-mesh-gateway opens that entry, and any
 * <details> around it, then brings it into view. A closed <details> has no
 * height, so the browser's own jump lands on the summary at best.
 */
function openFromHash(): void {
  const id = decodeURIComponent(location.hash.slice(1));
  if (!id) return;
  const el = document.getElementById(id);
  if (!el) return;
  if (el instanceof HTMLDetailsElement) el.open = true;
  for (let d = el.parentElement?.closest('details'); d; d = d.parentElement?.closest('details')) d.open = true;
  el.scrollIntoView({ block: 'start' });
}

/** A closed <details> prints as its summary alone. Open all, then restore. */
function printOpen(): void {
  let closed: HTMLDetailsElement[] = [];
  window.addEventListener('beforeprint', () => {
    closed = [...document.querySelectorAll<HTMLDetailsElement>('main details:not([open])')];
    closed.forEach(d => { d.open = true; });
  });
  window.addEventListener('afterprint', () => {
    closed.forEach(d => { d.open = false; });
    closed = [];
  });
}

/** The same event the classic page sends; AgentWidget opens and asks. */
export function agentPrompts(): void {
  document.querySelectorAll<HTMLElement>('[data-agent-prompt]').forEach(button => {
    button.addEventListener('click', () => {
      const text = button.getAttribute('data-agent-prompt') || '';
      window.dispatchEvent(new CustomEvent('bridge-agent:prompt', { detail: { text } }));
    });
  });
}

export function initCvLinks(): void {
  applyFocus();
  openFromHash();
  window.addEventListener('hashchange', openFromHash);
  printOpen();
  agentPrompts();
}
