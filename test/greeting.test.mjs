// Tests for the personal greeting. Run with `npm run test:greeting`.
// A link like /de/?for=Anna&du=1#agent opens the chat and greets the visitor by
// name. The name lives only in the URL, never in this repository, and it ends
// up in the agent bubble, which renders markdown, so anything that is not a
// plain name is dropped rather than escaped.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readVisitor, greetingFor, visitorQuery } from '../src/lib/greeting.ts';

const t = {
  greeting: 'Hallo, ich bin Michaels persönlicher KI-Agent.',
  greetingNamed: 'Hallo {name}, schön, dass Sie vorbeischauen.',
  greetingNamedDu: 'Hallo {name}, schön, dass du vorbeischaust.',
};

test('readVisitor: name from for, du only on du=1', () => {
  assert.deepEqual(readVisitor('?for=Anna&du=1'), { name: 'Anna', du: true });
  assert.deepEqual(readVisitor('?for=Anna'), { name: 'Anna', du: false });
  assert.deepEqual(readVisitor('?for=Anna&du=0'), { name: 'Anna', du: false });
  assert.deepEqual(readVisitor(''), { name: '', du: false });
});

test('readVisitor: accepts real names with umlauts, spaces, hyphens, apostrophes', () => {
  assert.equal(readVisitor('?for=J%C3%BCrgen').name, 'Jürgen');
  assert.equal(readVisitor('?for=Frau%20Pandey%20Estrugo').name, 'Frau Pandey Estrugo');
  assert.equal(readVisitor('?for=Dr.%20Blessing').name, 'Dr. Blessing');
  assert.equal(readVisitor("?for=O'Neill").name, "O'Neill");
  assert.equal(readVisitor('?for=Anne-Marie').name, 'Anne-Marie');
  assert.equal(readVisitor('?for=%20%20Anna%20%20').name, 'Anna');
});

test('readVisitor: drops anything that is not a plain name', () => {
  for (const bad of ['<img src=x>', '[klick](https://x.y)', 'Anna*', '**Anna**', '1234', 'a'.repeat(41), '-Anna']) {
    assert.equal(readVisitor('?for=' + encodeURIComponent(bad)).name, '', bad);
  }
});

test('greetingFor: no name keeps the standard greeting', () => {
  assert.equal(greetingFor(t, { name: '', du: true }), t.greeting);
});

test('greetingFor: name uses Sie by default, du on request', () => {
  assert.equal(greetingFor(t, { name: 'Anna', du: false }), 'Hallo Anna, schön, dass Sie vorbeischauen.');
  assert.equal(greetingFor(t, { name: 'Anna', du: true }), 'Hallo Anna, schön, dass du vorbeischaust.');
});

test('greetingFor: a language without a du form falls back to the named form', () => {
  const en = { greeting: 'Hi.', greetingNamed: 'Hi {name}.' };
  assert.equal(greetingFor(en, { name: 'Kalpesh', du: true }), 'Hi Kalpesh.');
  assert.equal(greetingFor({ greeting: 'Hi.' }, { name: 'Kalpesh', du: false }), 'Hi.');
});


test('visitorQuery: a valid name and du travel with the language switch, nothing else', () => {
  assert.equal(visitorQuery('?for=Anna&du=1&focus=tuev-sued'), '?for=Anna&du=1');
  assert.equal(visitorQuery('?for=Anna'), '?for=Anna');
  assert.equal(visitorQuery('?for=J%C3%BCrgen'), '?for=J%C3%BCrgen');
  assert.equal(visitorQuery('?for=%3Cb%3E'), '');
  assert.equal(visitorQuery('?du=1'), '');
  assert.equal(visitorQuery(''), '');
});
