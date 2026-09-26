/**
 * The personal greeting for a link made for one person:
 *   /de/?for=Anna&du=1#agent
 * opens the chat (#agent, see AgentWidget.astro) and greets Anna by name, in
 * the informal form because of du=1. Without du the greeting stays formal; a
 * language without an informal form (English) uses its named greeting.
 *
 * Same `for` parameter as the tailored CV link in cv-links.ts. The name is
 * built entirely from the URL: nothing about a recipient is ever written into
 * this public repository.
 *
 * The greeting lands in an agent bubble, which renders markdown. A name is
 * therefore accepted only when it is plainly a name (letters, spaces, dot,
 * hyphen, apostrophe, at most 40 characters) and dropped otherwise, never
 * escaped: a link that does not carry a plain name gets the standard greeting.
 */

const NAME = /^\p{L}[\p{L} .'-]{0,39}$/u;

export interface Visitor { name: string; du: boolean }

export interface GreetingStrings {
  greeting: string;
  greetingNamed?: string;    // {name} is replaced
  greetingNamedDu?: string;  // informal form, only where the language has one
}

/** The visitor's name and form of address from the query string, validated. */
export function readVisitor(search: string): Visitor {
  const params = new URLSearchParams(search);
  const raw = (params.get('for') || '').trim().replace(/\s+/g, ' ');
  return { name: NAME.test(raw) ? raw : '', du: params.get('du') === '1' };
}

/** The first agent bubble: standard, or with the visitor's name. */
export function greetingFor(t: GreetingStrings, v: Visitor): string {
  if (!v.name) return t.greeting;
  const named = (v.du && t.greetingNamedDu) || t.greetingNamed;
  return named ? named.replace('{name}', v.name) : t.greeting;
}

