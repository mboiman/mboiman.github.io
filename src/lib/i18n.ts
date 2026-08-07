/**
 * All narrative copy for the presentation (/de/story/, /en/story/) and the
 * classic CV lives here, not in .astro files.
 *
 * The `I18nStrings` interface is the parity gate: adding a field to `de`
 * without adding it to `en` fails `astro build`. That is deliberate. The
 * previous version of this file let the English branch drift silently.
 *
 * COPY RULES (enforced by review, not by the compiler):
 *  - No dashes as punctuation. Neither em nor en nor double-hyphen. Rebuild the
 *    sentence: comma, colon, parenthesis, or two sentences. Hyphens inside a
 *    word and in date ranges are fine.
 *  - No vanity counters. "40+ skills", "20+ repos", "99.97%" and friends are
 *    banned. A counter compresses away everything that was interesting about
 *    the thing it counts. Name the thing instead.
 *  - Every claim on the presentation carries its proof next to it: an open
 *    standard, a licence or release, a callable address, or a named procedure.
 *    Where a claim cannot be published, say so rather than dropping the proof.
 */

/** One system that is actually running, shown in the act that replaced the numbers. */
export interface RunningItem {
  title: string;
  /** One sentence on the mechanism. Not a benefit, not an adjective. */
  mechanism: string;
  /** The proof itself: standard, repo, address. Rendered monospace. */
  proof: string;
  /** Optional link — only when the proof can genuinely be opened by a visitor. */
  proofUrl?: string;
  /** `public` renders a filled marker, `closed` a hollow one plus the reason. */
  state: 'public' | 'closed';
  /** Why it is not public. Required when state is `closed`. */
  stateNote?: string;
}






// UI strings for the floating agent chat widget (AgentWidget.astro).
// Kept here per the "no hardcoded text in .astro" rule; consumed by the
// bundled client script via a data-i18n attribute serialized in the markup.
export interface AgentWidgetStrings {
  launcherLabel: string;   // aria-label / tooltip for the floating button
  launcherText: string;    // visible label next to the floating button
  headerTitle: string;     // panel header title
  headerSubtitle: string;  // small line under the title
  inputPlaceholder: string;
  send: string;            // send button aria-label
  close: string;           // close button aria-label
  greeting: string;        // first agent bubble shown before any exchange
  connecting: string;      // shown while fetching the agent card
  working: string;         // generic "thinking" indicator label
  errorConnect: string;    // could not reach the agent (network/CORS, card never fetched)
  errorSend: string;       // reached the agent but the exchange threw
  errorAgent: string;      // agent reachable but reported a terminal error (no text)
  emptyAnswer: string;     // agent completed with nothing usable
  retry: string;           // retry button label on error bubbles
  maximize: string;        // enlarge-panel button label
  restore: string;         // restore-panel-size button label
  resize: string;          // drag-resize grip tooltip
  // Agent-Card (A2A) view inside the panel
  cardOpen: string;        // header toggle: show the agent card
  cardBack: string;        // header toggle: back to chat
  cardTitle: string;       // eyebrow above the agent name
  cardIntro: string;       // one-line explainer (what the A2A card is)
  cardProtocol: string;    // protocol section heading
  cardEndpoint: string;    // endpoint label
  cardModes: string;       // input/output modes label
  cardSkills: string;      // skills section heading
  cardExamplesHint: string;// hint above clickable examples
  cardStreaming: string;   // capability badge
  cardPush: string;        // capability badge
  cardLoading: string;     // while fetching the card
  cardUnavailable: string; // card fetch failed
  // Privacy disclosure — shown at the point of collection (under the composer)
  privacyNote: string;     // one-line data note
  privacyLink: string;     // link label → /de/datenschutz · /en/privacy
}

/**
 * One act of the presentation.
 *
 * `kind` is the load-bearing field. The version before this one had a single
 * composition for all eleven acts, and that is exactly what made it read worse
 * than its predecessor despite carrying better sentences: when every act has
 * the same shape, nothing can be emphasised, so nothing is. `kind` picks the
 * layout, the bullet budget and where the proof anchor sits.
 *
 * Budgets, enforced by scripts/check-i18n.mjs at build time:
 *   manifest 2 · portrait 3 · offer 4 · figure 4 · shot 3
 *   live 3 · finding 3 · terminal 3 · closing 2
 */
export type ActKind =
  | 'manifest' | 'portrait' | 'offer' | 'figure'
  | 'shot' | 'live' | 'finding' | 'terminal' | 'closing';

/** Which surface the act sits on. Not a strict alternation: `slab` appears once. */
export type ActTone = 'base' | 'alt' | 'slab';

/** Which inline SVG component under src/components/figures/ renders. */
export type FigureId = 'proofpair' | 'timeline' | 'mesh' | 'route' | 'gate' | 'checks';

export interface ActFigure {
  id: FigureId;
  /** Labels, rendered as HTML positioned over the SVG. Order is fixed and
   *  documented in the component. Never <text> inside the viewBox: text in a
   *  scaling viewBox scales with it, and 0.7rem in a 900-wide box lands at
   *  about five pixels on a phone. */
  labels: string[];
  /** One sentence on what the figure shows. Renders as <figcaption>. Required. */
  caption: string;
}

export interface ActShot {
  /** Key into the image map in StoryPage, never a raw path: a raw path can
   *  point at a file that was removed for leaking, and nothing would catch it. */
  src: 'nlpanalyse' | 'angebotstest' | 'websiteanalyzer';
  /** What it shows, and that it is his own. Required. */
  caption: string;
  /** Empty on purpose: the caption carries the information, the figure is proof. */
  alt: '';
}

export interface ActTerminal {
  title: string;
  lines: { kind: 'cmd' | 'out' | 'hit'; text: string }[];
  /** When it was recorded. Renders under the block. */
  recorded: string;
}

/** Before and after on one filename. Both names invented and generic. */
export interface ActRename { before: string; after: string; }

/** The three bubbles of the phone mock. Generic: no practice, person or place. */
export interface ActPhone { lines: string[]; note: string; }

/** One line of the two-colour tree beside the terminal. */
export interface ActTreeItem { path: string; label: string; side: 'shared' | 'private' }

export interface PitchAct {
  id: string;
  kind: ActKind;
  tone: ActTone;
  eyebrow: string;
  headline: string;
  /** On `figure` acts the bullets are also the figure's textual equivalent and
   *  render as an <ol>. There is no second list beside it. */
  bullets: string[];
  /** Bullets become buttons that hand their text to the live agent. Each must
   *  end in a question mark. */
  askAgent?: boolean;
  /** One quiet line under each question, saying what the answer proves. */
  probeNotes?: string[];
  /** At most two acts on the whole page carry this. Enforced by the guard.
   *  A page of scars reads as a postmortem, not as an offer. */
  scar?: true;
  figure?: ActFigure;
  shot?: ActShot;
  terminal?: ActTerminal;
  tree?: ActTreeItem[];
  rename?: ActRename;
  phone?: ActPhone;
  /** The verifiable identifier. Never a counter, a percentage or a year.
   *  A `closed` anchor is set as strongly as an open one: admitting that
   *  something cannot be published is the stronger trust signal. */
  anchor?: { text: string; label: string; url?: string; state: 'public' | 'closed'; note?: string };
  /** The line that points at depth NOT shown on the slide. */
  hook?: string;
}

export interface I18nStrings {
  pdfDownload: string;
  experienceTheStory: string;
  storyBackToCv: string;
  classicCV: string;
  otherLangLabel: string;
  skipToContent: string;
  availability: string;

  /** The presentation, in order. First act opens, second carries the portrait, last closes. */
  acts: PitchAct[];

  storyRole: string;
  storyClosingEyebrow: string;
  proofPublicLabel: string;
  proofClosedLabel: string;
  agentUnavailable: string;
  /** Live-card states on the `live` act. Three, because "checking" is a real
   *  state and collapsing it into "reachable" would be the exact kind of
   *  declared-not-verified claim act 01 argues against. */
  agentChecking: string;
  agentReachable: string;
  agentCardName: string;
  agentCardProtocol: string;
  agentCardEndpoint: string;
  /** Build stamp in the closing act. */
  builtOn: string;
  builtOnNote: string;

  // Aria labels (story page)
  ariaStatement: string;
  ariaProfile: string;
  ariaContact: string;

  // CV page only
  running: RunningItem[];
  careerIntro: string;
  talksTitle: string;
  careerDetails: string[];
  cvRunningTitle: string;
  cvFooterOtherLang: string;
  experienceTitle: string;
  earlierPositions: string;
  legalPrivacy: string;
  legalImpressum: string;
  truncatePatterns: string[];
  truncateToolPatterns: string[];
  showAllProjects: string;
  agentWidget: AgentWidgetStrings;
}

export const i18n: Record<'de' | 'en', I18nStrings> = {
  de: {
    pdfDownload: 'PDF herunterladen',
    experienceTheStory: 'Die Arbeit ansehen',
    storyBackToCv: 'Zum Lebenslauf',
    classicCV: 'Klassischer Lebenslauf',
    otherLangLabel: 'English',
    skipToContent: 'Zum Inhalt springen',
    availability: 'Verfügbar für Quality Engineering, Testautomatisierung, KI-Architektur und Workshops.',
    acts: [
      {
        id: '01-haltung',
        kind: 'manifest',
        tone: 'base',
        eyebrow: 'Haltung',
        headline: 'Behauptet ist nicht geprüft.',
        bullets: [
          'Kein Statusfeld gilt hier als Wahrheit.',
          'Jeder Beleg auf dieser Seite ist aufrufbar.',
        ],
        scar: true,
        figure: {
          id: 'proofpair',
          labels: [
            'Was die Datei sagt',
            'aktiv',
            'Was die Maschine sagt',
            'seit Tagen still',
          ],
          caption: 'Dieselbe Sicherung, zweimal befragt.',
        },
        anchor: {
          text: 'rules/deploy-reconciliation.md',
          label: 'Die Regel im offenen Repo',
          url: 'https://github.com/bks-lab/open-bridge/blob/main/rules/deploy-reconciliation.md',
          state: 'public',
        },
        hook: 'Die Statusdatei meldete aktiv. Der Dienst war seit Tagen still.',
      },
      {
        id: '02-person',
        kind: 'portrait',
        tone: 'alt',
        eyebrow: 'Michael Boiman · Frankfurt am Main',
        headline: 'Ich baue Systeme, die arbeiten, und Tore, an denen sie halten.',
        bullets: [
          'Erst Qualitätssicherung, dann Automatisierung, jetzt Agenten.',
          'Ich betreibe selbst, was ich baue.',
          'Offene Standards, weil man sie nachlesen kann.',
        ],
        hook: 'Was auf dieser Seite antwortet, läuft auf Hardware, die mir gehört.',
      },
      {
        id: '03-auftrag',
        kind: 'offer',
        tone: 'base',
        eyebrow: 'Zusammenarbeit',
        headline: 'Wofür man mich holt.',
        bullets: [
          'Bauen und betreiben: Agenten-Systeme im Betrieb.',
          'Prüfen: ob ein System wirklich liefert.',
          'Absichern: Grenzen, Tore, Beweisführung.',
          'Befähigen: ein Team macht danach allein weiter.',
        ],
        hook: 'Als Mandat, als Review oder als Workshop. Eine Mail reicht für den Anfang.',
      },
      {
        id: '04-anruf',
        kind: 'figure',
        tone: 'alt',
        eyebrow: 'Sprache',
        headline: 'Ein Anruf, ein Modell, echte freie Termine.',
        bullets: [
          'Die Termine liefert das Portal, nicht das Modell.',
          'Der Bot merkt vor, er bucht nicht.',
          'Einwilligung steht vor dem ersten Wort.',
          'Das Zeitfenster ist fest, der Turn läuft weiter.',
        ],
        figure: {
          id: 'timeline',
          labels: [
            'Netz',
            'Termine holen',
            'Modell',
            'Antwort',
            'Füller',
          ],
          caption: 'Ein Gesprächszug, aufgeteilt nach Anteilen.',
        },
        phone: {
          lines: [
            'Ich brauche einen Termin nächste Woche',
            'Einen Moment, ich schaue nach',
            'Am Dienstag, dem elften, um zehn Uhr dreißig',
          ],
          note: 'Datum und Uhrzeit als Wörter, weil die Sprachausgabe Ziffern verstümmelt.',
        },
        anchor: {
          text: 'Sprachkanal beim Auftraggeber',
          label: 'nicht öffentlich',
          state: 'closed',
          note: 'Der Anschluss gehört dem Auftraggeber, die Rufnummer bleibt privat.',
        },
        hook: 'Der Anrufer hört einen Füller, während die Antwort im Hintergrund fertig wird.',
      },
      {
        id: '05-eingang',
        kind: 'shot',
        tone: 'base',
        eyebrow: 'Eingang',
        headline: 'Was hereinkommt, liegt danach am richtigen Ort.',
        bullets: [
          'Eine Regel entscheidet das Ziel, nicht ich.',
          'Der Dateiname trägt das Datum vorn.',
          'Jede Bewegung landet in einer versionierten Zeile.',
        ],
        shot: {
          src: 'nlpanalyse',
          caption: 'Eigenes Dashboard einer E-Mail-Klassifizierung. Kategorien generisch, keine Absender.',
          alt: '',
        },
        rename: {
          before: 'scan_0042.pdf',
          after: '2026-08-07-versicherung-beitragsanpassung.pdf',
        },
        anchor: {
          text: 'rules/recording-provenance.md',
          label: 'Die Regel liegt offen',
          url: 'https://github.com/bks-lab/open-bridge/blob/main/rules/recording-provenance.md',
          state: 'public',
        },
        hook: 'Wer eine Aufnahme dokumentiert, archiviert das Original und verlinkt es. Immer beides.',
      },
      {
        id: '06-netz',
        kind: 'figure',
        tone: 'alt',
        eyebrow: 'Adressierbar',
        headline: 'Jeder Agent hat eine eigene Adresse.',
        bullets: [
          'Sie fragen sich über ein offenes Protokoll.',
          'Eine Vermittlung übersetzt, mehr nicht: kein Modell darin.',
          'Das Token des Aufrufers geht nie nach oben.',
          'Überlast kommt als benannte Absage zurück, nie als Stille.',
        ],
        figure: {
          id: 'mesh',
          labels: [
            'Projekt-Agent',
            'Firmen-Agent',
            'Persönlicher Agent',
            'Vermittlung',
            'list · card · ask',
          ],
          caption: 'Drei Agenten, ein Tor, ein offenes Protokoll.',
        },
        anchor: {
          text: 'A2A 1.0 · MCP 2025-06-18',
          label: 'Zwei offene Protokolle, live bestätigt',
          url: 'https://openbridge.bks-lab.com/.well-known/agent-card.json',
          state: 'public',
        },
        hook: 'Genau ein Pfad an der Vermittlung, bewusst kein zweiter für Prüfungen.',
      },
      {
        id: '07-fragen-sie-ihn',
        kind: 'live',
        tone: 'base',
        eyebrow: 'Live auf dieser Seite',
        headline: 'Fragen Sie ihn selbst.',
        bullets: [
          'Was liest du, und was nicht?',
          'Auf welcher Hardware läufst du?',
          'Woher kommen deine Terminzeiten?',
        ],
        askAgent: true,
        probeNotes: [
          'Prüft die absichtlich schmale Wissensquelle.',
          'Prüft den Betrieb auf eigener Hardware.',
          'Prüft den Terminspiegel: nur Zeiten, kein Titel, kein Ort.',
        ],
        anchor: {
          text: 'mboiman.bks-lab.com/.well-known/agent-card.json',
          label: 'Sein Steckbrief, direkt aufrufbar',
          url: 'https://mboiman.bks-lab.com/.well-known/agent-card.json',
          state: 'public',
        },
        hook: 'Jede der drei Fragen prüft eine andere Grenze seines Zuschnitts.',
      },
      {
        id: '08-strecke',
        kind: 'figure',
        tone: 'alt',
        eyebrow: 'Rechnungsverkehr',
        headline: 'Vermutung ersetzt durch gezählte Belege.',
        bullets: [
          'Zwei Strecken nach offener europäischer Norm.',
          'Angenommen und zugestellt sind zwei Dinge.',
          'Die Hälfte der Stichprobe kam nie an.',
          'Die Ursache lag in den Stammdaten, nicht im Code.',
        ],
        figure: {
          id: 'route',
          labels: [
            'Absender',
            'Zugangspunkt',
            'Dokument',
            'Zielsystem',
          ],
          caption: 'Die Strecke, wie sie im Betrieb durchläuft.',
        },
        anchor: {
          text: 'EN 16931 · Peppol BIS 3.0',
          label: 'Offene Normen, unabhängig nachlesbar',
          url: 'https://docs.peppol.eu/poacc/billing/3.0/',
          state: 'public',
        },
        hook: 'Im laufenden Betrieb beim Auftraggeber, forensisch geprüft, unter Vertraulichkeit.',
      },
      {
        id: '09-tor',
        kind: 'figure',
        tone: 'alt',
        eyebrow: 'Der Halt',
        headline: 'Die Maschine läuft bis zum Entwurf und hält an.',
        bullets: [
          'Ein Mensch zieht die Karte, das startet sie.',
          'Jede Stufe startet frisch, ohne den Kontext davor.',
          'Sie merged nie und setzt nie fertig.',
          'Auch Änderungen an sich selbst gehen durchs Tor.',
        ],
        figure: {
          id: 'gate',
          labels: [
            'armiert',
            'umgesetzt',
            'geprüft',
            'Entwurf',
            'merge',
            'wartet auf einen Menschen',
          ],
          caption: 'Die Karte hält vor dem Tor. Sie geht nicht durch.',
        },
        anchor: {
          text: 'skills/board-pilot · rules/learning-autonomy.md',
          label: 'Der Baustein und die Regel',
          url: 'https://github.com/bks-lab/open-bridge/blob/main/rules/learning-autonomy.md',
          state: 'public',
        },
        hook: 'Der Prüfer sieht die Begründung des Umsetzers nicht. Nur die Artefakte.',
      },
      {
        id: '10-befund',
        kind: 'finding',
        tone: 'base',
        eyebrow: 'Befund',
        headline: 'Zwei eigene Prüfer meldeten grün. Die Lücke lag dazwischen.',
        bullets: [
          'Beide prüften nur die oberste Ebene.',
          'Unbekanntes Ziel: früher durch, heute gesperrt.',
          'Eine Simulation prüft es seither, ohne selbst zu lecken.',
        ],
        scar: true,
        figure: {
          id: 'checks',
          labels: [
            'Pfad-Prüfer',
            'Scope-Prüfer',
            'hier',
          ],
          caption: 'Beide meldeten grün. Der Pfad dazwischen lief weiter.',
        },
        anchor: {
          text: 'rules/push-guard.md',
          label: 'Der Vorfall steht mit Datum in der Regel',
          url: 'https://github.com/bks-lab/open-bridge/blob/main/rules/push-guard.md',
          state: 'public',
        },
        hook: 'Sie fährt absichtlich mit dem schwächsten Modell. Kommt das nicht durch, kommt keins durch.',
      },
      {
        id: '11-offen',
        kind: 'terminal',
        tone: 'slab',
        eyebrow: 'Offen',
        headline: 'Die generische Schicht ist veröffentlicht. Die private bleibt privat.',
        bullets: [
          'Getrennte Pfade, deshalb konfliktfreie Zusammenführung.',
          'Nach oben nur durch Inhalts-Scan und Positivliste.',
          'Ein Beitrag ohne Herkunftserklärung macht die CI rot.',
        ],
        terminal: {
          title: 'open-bridge',
          lines: [
            { kind: 'cmd', text: 'gh repo clone bks-lab/open-bridge' },
            { kind: 'out', text: "  Cloning into 'open-bridge'..." },
            { kind: 'cmd', text: 'cd open-bridge && head -1 LICENSE' },
            { kind: 'out', text: '  MIT License' },
            { kind: 'cmd', text: "ls rules/ | grep -E 'guard|safety'" },
            { kind: 'hit', text: '  promote-safety.md' },
            { kind: 'hit', text: '  push-guard.md' },
          ],
          recorded: 'Befehle am 7. August 2026 gegen das offene Repo ausgeführt.',
        },
        tree: [
          { path: 'skills/', label: 'geteilt', side: 'shared' },
          { path: 'rules/', label: 'geteilt', side: 'shared' },
          { path: 'docs/', label: 'geteilt', side: 'shared' },
          { path: 'work/', label: 'privat', side: 'private' },
          { path: 'identity/', label: 'privat', side: 'private' },
          { path: 'infra/', label: 'privat', side: 'private' },
        ],
        anchor: {
          text: 'github.com/bks-lab/open-bridge · MIT · v0.14.0',
          label: 'Klonen, hineinsehen, gegenlesen',
          url: 'https://github.com/bks-lab/open-bridge',
          state: 'public',
        },
        hook: 'Vor der Veröffentlichung fand eine unabhängige Prüfung den Blocker in der Historie, nicht im Stand.',
      },
      {
        id: '12-schluss',
        kind: 'closing',
        tone: 'base',
        eyebrow: 'Nächster Schritt',
        headline: 'Michael Boiman',
        bullets: [
          'Verfügbar für Mandate, Reviews und Workshops.',
          'Alles hier ist aufrufbar oder als geschlossen gekennzeichnet.',
        ],
      },
    ],
    storyRole: 'Quality Engineer · KI-Architekt',
    storyClosingEyebrow: 'BKS-Lab GmbH · Frankfurt am Main',
    proofPublicLabel: 'öffentlich prüfbar',
    proofClosedLabel: 'nicht öffentlich',
    agentUnavailable: 'Der Agent antwortet gerade nicht. Sein Steckbrief liegt trotzdem offen.',
    agentChecking: 'Erreichbarkeit wird geprüft',
    agentReachable: 'Erreichbar',
    agentCardName: 'Name',
    agentCardProtocol: 'Protokoll',
    agentCardEndpoint: 'Adresse',
    builtOn: 'zuletzt gebaut am',
    builtOnNote: 'Zur Bauzeit gestempelt, nicht getippt.',
    ariaStatement: 'Leitsatz',
    ariaProfile: 'Profil',
    ariaContact: 'Kontakt',
    running: [
      {
        title: 'Der Agent auf dieser Seite',
        mechanism: 'Er beantwortet Fragen zu diesem Lebenslauf. Bei einer Fachfrage rät er nicht, sondern befragt selbständig einen zweiten Agenten nach dem offenen A2A-Standard und kennzeichnet dessen Antwort als fremd.',
        proof: 'mboiman.bks-lab.com/.well-known/agent-card.json',
        proofUrl: 'https://mboiman.bks-lab.com/.well-known/agent-card.json',
        state: 'public',
      },
      {
        title: 'open-bridge, die quelloffene Schicht',
        mechanism: 'Das generische Gerüst hinter dieser Arbeitsweise liegt öffentlich unter MIT: Betriebshandbuch, Fähigkeiten, Regeln, Agenten-Laufzeit. Vor jedem Merge laufen Pflichtprüfungen, darunter ein Scan auf durchgesickerte Inhalte.',
        proof: 'github.com/bks-lab/open-bridge · MIT · v0.14.0',
        proofUrl: 'https://github.com/bks-lab/open-bridge',
        state: 'public',
      },
      {
        title: 'Die Rechnungsstrecke',
        mechanism: 'Aus- und Eingangsrechnungen eines Online-Stellenmarkts laufen produktiv zwischen SAP Business ByDesign und dem Peppol-Netz. Eingehend über zwei parallele Wege, per Webhook und aus einem Postfach, beide enden in derselben Schicht.',
        proof: 'EN 16931 · Peppol BIS 3.0',
        state: 'closed',
        stateNote: 'Kunde unter NDA',
      },
      {
        title: 'Das Übersetzungs-Gateway',
        mechanism: 'Ein zustandsloser Übersetzer stellt dieselben Agenten für MCP-Clients bereit. Drei Werkzeuge, kein eigenes Modell, keine eigene Logik, kein Zustand zwischen zwei Aufrufen.',
        proof: 'MCP nach A2A',
        state: 'public',
        stateNote: 'offen für MCP-Clients, anonym nur Auskunft; keine Seite zum Anklicken',
      },
    ],
    experienceTitle: 'Stationen',
    earlierPositions: 'Frühere Positionen',
    careerIntro: 'Quality Engineer und KI-Architekt aus Frankfurt am Main. Quality Engineering und KI-Architektur laufen bei mir parallel, nicht nacheinander: die Prüfdisziplin ist der Grund, warum mein Agentensystem Tore und Belege hat statt blind zu handeln.',
    talksTitle: 'Vorträge & Workshops',
    careerDetails: [
      'In Enterprise-Projekten (DB Vertrieb, DVAG, TÜV Süd) habe ich an Quality-Monitoring, KI-gestützter Testautomatisierung und mit Dauerbetrieb-Validierung abgesicherten Legacy-Migrationen mitgewirkt.',
      'Heute verbinde ich Quality Engineering mit KI-Architektur: <strong style="color: var(--accent); font-weight: 500">MCP- und A2A-Protokolle</strong>, ein Netz aus Agenten, die sich gegenseitig befragen, und eine produktive E-Invoicing-Plattform nach <strong style="color: var(--accent); font-weight: 500">EN 16931</strong>. Der generische Rahmen dahinter liegt quelloffen unter MIT, einer dieser Agenten beantwortet diesen Lebenslauf live.',
      'Dieses Wissen gebe ich weiter, in Entwickler- und Business-Workshops sowie als geladener <strong style="color: var(--accent); font-weight: 500">Impulsgeber an der TU Darmstadt</strong>, und übersetze KI-Praxis für technische wie nicht-technische Zielgruppen.',
    ],
    cvRunningTitle: 'Öffentlich prüfbar',
    cvFooterOtherLang: 'English',
    legalPrivacy: 'Datenschutz',
    legalImpressum: 'Impressum',
    truncatePatterns: ['Schwerpunkte', 'Key Responsibilities', 'Workshop-Inhalte', 'Präsentationsinhalte', 'Praktischer', 'Practical', 'Hauptverantwortlichkeiten', 'Projekte\\b', 'Energiesektor', 'Quantifizierbare', 'Quantifiable', 'Technische Lösungen', 'Focus areas', 'Key Focus'],
    truncateToolPatterns: ['Tools', 'Technologien', 'Technologies', 'Eingesetzte', 'Technical Stack', 'Technischer'],
    showAllProjects: 'Alle Projekte anzeigen ({n} weitere)',
    agentWidget: {
      launcherLabel: 'Mit meinem KI-Agenten chatten',
      launcherText: 'Live-KI-Agent fragen',
      headerTitle: 'KI-Agent von Michael',
      headerSubtitle: 'Fragen Sie zu Projekten, Stack und Verfügbarkeit',
      inputPlaceholder: 'Nachricht schreiben …',
      send: 'Senden',
      close: 'Schließen',
      greeting: 'Hallo, ich bin Michaels persönlicher KI-Agent. Fragen Sie mich zu seiner Erfahrung, seinen Projekten oder seiner Verfügbarkeit.',
      connecting: 'Verbinde mit dem Agenten …',
      working: 'Agent arbeitet …',
      errorConnect: 'Der Agent ist gerade nicht erreichbar. Bitte später erneut versuchen.',
      errorSend: 'Die Nachricht konnte nicht zugestellt werden. Bitte erneut versuchen.',
      errorAgent: 'Beim Beantworten ist ein Fehler aufgetreten. Bitte erneut versuchen.',
      emptyAnswer: 'Keine Antwort erhalten.',
      retry: 'Erneut versuchen',
      maximize: 'Vergrößern',
      restore: 'Verkleinern',
      resize: 'Zum Ändern der Größe ziehen',
      cardOpen: 'Agent-Card anzeigen',
      cardBack: 'Zurück zum Chat',
      cardTitle: 'Agent-Card',
      cardIntro: 'Der maschinenlesbare Steckbrief dieses Agenten nach dem offenen A2A-Standard (Agent-to-Agent), live aus /.well-known/agent-card.json.',
      cardProtocol: 'A2A-Protokoll',
      cardEndpoint: 'Endpunkt',
      cardModes: 'Ein-/Ausgabe',
      cardSkills: 'Fähigkeiten',
      cardExamplesHint: 'Beispiel-Frage anklicken zum Starten',
      cardStreaming: 'Streaming',
      cardPush: 'Push',
      cardLoading: 'Lade Agent-Card …',
      cardUnavailable: 'Agent-Card gerade nicht erreichbar.',
      privacyNote: 'Wir speichern den Verlauf nicht, bitte keine vertraulichen Daten eingeben.',
      privacyLink: 'Datenschutz',
    },
  },

  en: {
    pdfDownload: 'Download PDF',
    experienceTheStory: 'See the work',
    storyBackToCv: 'Back to CV',
    classicCV: 'Classic CV',
    otherLangLabel: 'Deutsch',
    skipToContent: 'Skip to content',
    availability: 'Available for quality engineering, test automation, AI architecture and workshops.',
    acts: [
      {
        id: '01-haltung',
        kind: 'manifest',
        tone: 'base',
        eyebrow: 'Stance',
        headline: 'Declared is not verified.',
        bullets: [
          'No status field counts as truth here.',
          'Every proof on this page can be opened.',
        ],
        scar: true,
        figure: {
          id: 'proofpair',
          labels: [
            'What the file says',
            'active',
            'What the machine says',
            'silent for days',
          ],
          caption: 'The same backup, asked twice.',
        },
        anchor: {
          text: 'rules/deploy-reconciliation.md',
          label: 'The rule in the open repo',
          url: 'https://github.com/bks-lab/open-bridge/blob/main/rules/deploy-reconciliation.md',
          state: 'public',
        },
        hook: 'The state file reported active. The service had been silent for days.',
      },
      {
        id: '02-person',
        kind: 'portrait',
        tone: 'alt',
        eyebrow: 'Michael Boiman · Frankfurt am Main',
        headline: 'I build systems that work, and gates where they stop.',
        bullets: [
          'First quality engineering, then automation, now agents.',
          'I run what I build.',
          'Open standards, because anyone can read them.',
        ],
        hook: 'What answers on this page runs on hardware I own.',
      },
      {
        id: '03-auftrag',
        kind: 'offer',
        tone: 'base',
        eyebrow: 'Working together',
        headline: 'What people bring me in for.',
        bullets: [
          'Build and run: agent systems in production.',
          'Check: whether a system really delivers.',
          'Secure: boundaries, gates, evidence.',
          'Enable: a team carries on without me.',
        ],
        hook: 'As an engagement, a review or a workshop. One email is enough to start.',
      },
      {
        id: '04-anruf',
        kind: 'figure',
        tone: 'alt',
        eyebrow: 'Voice',
        headline: 'A call, a model, real open slots.',
        bullets: [
          'The portal supplies the slots, not the model.',
          'The bot pencils it in but never books.',
          'Consent comes before the first word.',
          'The time window is fixed, the turn keeps running.',
        ],
        figure: {
          id: 'timeline',
          labels: [
            'Network',
            'Fetch slots',
            'Model',
            'Answer',
            'Filler',
          ],
          caption: 'One conversational turn, by share of time.',
        },
        phone: {
          lines: [
            'I need an appointment next week',
            'One moment, let me check',
            'On Tuesday the eleventh, at half past ten',
          ],
          note: 'Date and time as words, because the speech output mangles digits.',
        },
        anchor: {
          text: 'Voice channel at the client',
          label: 'not public',
          state: 'closed',
          note: 'The line belongs to the client, the number stays private.',
        },
        hook: 'The caller hears a filler while the answer finishes in the background.',
      },
      {
        id: '05-eingang',
        kind: 'shot',
        tone: 'base',
        eyebrow: 'Intake',
        headline: 'What comes in ends up in the right place.',
        bullets: [
          'A rule picks the target, not me.',
          'The filename carries the date up front.',
          'Every move lands in one versioned line.',
        ],
        shot: {
          src: 'nlpanalyse',
          caption: 'My own dashboard for email classification. Categories generic, no senders.',
          alt: '',
        },
        rename: {
          before: 'scan_0042.pdf',
          after: '2026-08-07-versicherung-beitragsanpassung.pdf',
        },
        anchor: {
          text: 'rules/recording-provenance.md',
          label: 'The rule is public',
          url: 'https://github.com/bks-lab/open-bridge/blob/main/rules/recording-provenance.md',
          state: 'public',
        },
        hook: 'Documenting a recording means archiving the original and linking it. Always both.',
      },
      {
        id: '06-netz',
        kind: 'figure',
        tone: 'alt',
        eyebrow: 'Addressable',
        headline: 'Each agent has an address of its own.',
        bullets: [
          'They query each other over an open protocol.',
          'A gateway translates, nothing else: no model inside.',
          'The caller\'s token never travels upward.',
          'Overload returns a named refusal, never silence.',
        ],
        figure: {
          id: 'mesh',
          labels: [
            'Project agent',
            'Company agent',
            'Personal agent',
            'Gateway',
            'list · card · ask',
          ],
          caption: 'Three agents, one gateway, one open protocol.',
        },
        anchor: {
          text: 'A2A 1.0 · MCP 2025-06-18',
          label: 'Two open protocols, confirmed live',
          url: 'https://openbridge.bks-lab.com/.well-known/agent-card.json',
          state: 'public',
        },
        hook: 'Exactly one path at the gateway, deliberately no second one for health checks.',
      },
      {
        id: '07-fragen-sie-ihn',
        kind: 'live',
        tone: 'base',
        eyebrow: 'Live on this page',
        headline: 'Ask him yourself.',
        bullets: [
          'What do you read, and what do you not?',
          'What hardware do you run on?',
          'Where do your calendar times come from?',
        ],
        askAgent: true,
        probeNotes: [
          'Probes the deliberately narrow knowledge source.',
          'Probes that it runs on hardware he owns.',
          'Probes the calendar mirror: times only, no title, no place.',
        ],
        anchor: {
          text: 'mboiman.bks-lab.com/.well-known/agent-card.json',
          label: 'His card, open it directly',
          url: 'https://mboiman.bks-lab.com/.well-known/agent-card.json',
          state: 'public',
        },
        hook: 'Each of the three questions probes a different edge of his scope.',
      },
      {
        id: '08-strecke',
        kind: 'figure',
        tone: 'alt',
        eyebrow: 'Invoice traffic',
        headline: 'Assumption replaced by counted evidence.',
        bullets: [
          'Two routes under an open European standard.',
          'Accepted and delivered are two different things.',
          'Half the sample had never arrived.',
          'The cause sat in master data, not code.',
        ],
        figure: {
          id: 'route',
          labels: [
            'Sender',
            'Access point',
            'Document',
            'Target system',
          ],
          caption: 'The route as it runs in production.',
        },
        anchor: {
          text: 'EN 16931 · Peppol BIS 3.0',
          label: 'Open standards, independently checkable',
          url: 'https://docs.peppol.eu/poacc/billing/3.0/',
          state: 'public',
        },
        hook: 'In production at a client, checked forensically, under confidentiality.',
      },
      {
        id: '09-tor',
        kind: 'figure',
        tone: 'alt',
        eyebrow: 'The stop',
        headline: 'The machine runs to the draft and stops.',
        bullets: [
          'A human moves the card. That starts it.',
          'Each stage starts fresh, without the previous context.',
          'It never merges and never marks work done.',
          'Even changes to itself pass through the gate.',
        ],
        figure: {
          id: 'gate',
          labels: [
            'armed',
            'built',
            'reviewed',
            'draft',
            'merge',
            'waiting for a human',
          ],
          caption: 'The card stops at the gate. It does not pass.',
        },
        anchor: {
          text: 'skills/board-pilot · rules/learning-autonomy.md',
          label: 'The building block and the rule',
          url: 'https://github.com/bks-lab/open-bridge/blob/main/rules/learning-autonomy.md',
          state: 'public',
        },
        hook: 'The reviewer never sees the implementer\'s reasoning. Only the artefacts.',
      },
      {
        id: '10-befund',
        kind: 'finding',
        tone: 'base',
        eyebrow: 'Finding',
        headline: 'Two of my own checkers reported green. The gap sat between them.',
        bullets: [
          'Both checked only the topmost level.',
          'Unknown target: once through, now blocked.',
          'A simulation checks it since, unable to leak itself.',
        ],
        scar: true,
        figure: {
          id: 'checks',
          labels: [
            'path validator',
            'scope validator',
            'here',
          ],
          caption: 'Both reported green. The path between them kept running.',
        },
        anchor: {
          text: 'rules/push-guard.md',
          label: 'The incident is dated inside the rule',
          url: 'https://github.com/bks-lab/open-bridge/blob/main/rules/push-guard.md',
          state: 'public',
        },
        hook: 'It deliberately runs the weakest model. If that cannot get through, none can.',
      },
      {
        id: '11-offen',
        kind: 'terminal',
        tone: 'slab',
        eyebrow: 'Open',
        headline: 'The generic layer is published. The private one stays private.',
        bullets: [
          'Disjoint paths, therefore conflict-free merges.',
          'Upward only through content scan and allowlist.',
          'A contribution without a sign-off turns CI red.',
        ],
        terminal: {
          title: 'open-bridge',
          lines: [
            { kind: 'cmd', text: 'gh repo clone bks-lab/open-bridge' },
            { kind: 'out', text: "  Cloning into 'open-bridge'..." },
            { kind: 'cmd', text: 'cd open-bridge && head -1 LICENSE' },
            { kind: 'out', text: '  MIT License' },
            { kind: 'cmd', text: "ls rules/ | grep -E 'guard|safety'" },
            { kind: 'hit', text: '  promote-safety.md' },
            { kind: 'hit', text: '  push-guard.md' },
          ],
          recorded: 'Commands run against the open repo on 7 August 2026.',
        },
        tree: [
          { path: 'skills/', label: 'shared', side: 'shared' },
          { path: 'rules/', label: 'shared', side: 'shared' },
          { path: 'docs/', label: 'shared', side: 'shared' },
          { path: 'work/', label: 'private', side: 'private' },
          { path: 'identity/', label: 'private', side: 'private' },
          { path: 'infra/', label: 'private', side: 'private' },
        ],
        anchor: {
          text: 'github.com/bks-lab/open-bridge · MIT · v0.14.0',
          label: 'Clone it, look inside, read it',
          url: 'https://github.com/bks-lab/open-bridge',
          state: 'public',
        },
        hook: 'Before release, an independent review found the blocker in the history, not in the current tree.',
      },
      {
        id: '12-schluss',
        kind: 'closing',
        tone: 'base',
        eyebrow: 'Next step',
        headline: 'Michael Boiman',
        bullets: [
          'Available for engagements, reviews and workshops.',
          'Everything here can be opened or is marked closed.',
        ],
      },
    ],
    storyRole: 'Quality Engineer · AI Architect',
    storyClosingEyebrow: 'BKS-Lab GmbH · Frankfurt am Main',
    proofPublicLabel: 'publicly verifiable',
    proofClosedLabel: 'not public',
    agentUnavailable: 'The agent is not answering right now. Its profile card is public regardless.',
    agentChecking: 'Checking reachability',
    agentReachable: 'Reachable',
    agentCardName: 'Name',
    agentCardProtocol: 'Protocol',
    agentCardEndpoint: 'Address',
    builtOn: 'last built on',
    builtOnNote: 'Stamped at build time, not typed.',
    ariaStatement: 'Statement',
    ariaProfile: 'Profile',
    ariaContact: 'Contact',
    running: [
      {
        title: 'The agent on this page',
        mechanism: 'It answers questions about this CV. On a subject-matter question it does not guess: it consults a second agent over the open A2A standard on its own initiative, and marks that answer as coming from elsewhere.',
        proof: 'mboiman.bks-lab.com/.well-known/agent-card.json',
        proofUrl: 'https://mboiman.bks-lab.com/.well-known/agent-card.json',
        state: 'public',
      },
      {
        title: 'open-bridge, the open-source layer',
        mechanism: 'The generic scaffolding behind this way of working is public under MIT: operating manual, skills, rules, agent runtime. Mandatory checks run before every merge, one of them a scan for leaked content.',
        proof: 'github.com/bks-lab/open-bridge · MIT · v0.14.0',
        proofUrl: 'https://github.com/bks-lab/open-bridge',
        state: 'public',
      },
      {
        title: 'The invoicing pipeline',
        mechanism: 'Outbound and inbound invoices for an online job marketplace run in production between SAP Business ByDesign and the Peppol network. Inbound arrives over two parallel routes, a webhook and a mailbox, and both end in the same layer.',
        proof: 'EN 16931 · Peppol BIS 3.0',
        state: 'closed',
        stateNote: 'client under NDA',
      },
      {
        title: 'The translation gateway',
        mechanism: 'A stateless translator exposes the same agents to MCP clients. Three tools, no model of its own, no logic of its own, and no state carried between two calls.',
        proof: 'MCP to A2A',
        state: 'public',
        stateNote: 'open to MCP clients, anonymous gets lookups only; not a page you can click',
      },
    ],
    experienceTitle: 'Positions',
    earlierPositions: 'Earlier positions',
    careerIntro: 'Quality engineer and AI architect based in Frankfurt am Main. Quality engineering and AI architecture run in parallel for me rather than in sequence: the testing discipline is the reason my agent system has gates and evidence instead of acting blind.',
    talksTitle: 'Speaking & Workshops',
    careerDetails: [
      'In enterprise projects (DB Vertrieb, DVAG, TÜV Süd) I worked on quality monitoring, AI-driven test automation, and legacy migrations secured by continuous validation.',
      'Today I combine quality engineering with AI architecture: <strong style="color: var(--accent); font-weight: 500">MCP and A2A protocols</strong>, a network of agents that consult each other, and a production e-invoicing platform to <strong style="color: var(--accent); font-weight: 500">EN 16931</strong>. The generic framework behind it is open source under MIT, and one of those agents answers this very CV, live.',
      'I also pass this knowledge on, in developer and business workshops and as an invited <strong style="color: var(--accent); font-weight: 500">guest speaker at TU Darmstadt</strong>, translating hands-on AI for technical and non-technical audiences alike.',
    ],
    cvRunningTitle: 'Publicly verifiable',
    cvFooterOtherLang: 'Deutsch',
    legalPrivacy: 'Privacy',
    legalImpressum: 'Legal Notice',
    // 'Projects', 'Energy Sector' and 'Technical Solutions' were missing here while
    // config.cv.toml carries those headings in the English branch too, so the English
    // Siemens entry rendered its full project list while the German one stopped after
    // the intro. Two language versions of one station showed different amounts of text.
    truncatePatterns: ['Schwerpunkte', 'Key Responsibilities', 'Workshop-Inhalte', 'Workshop Content', 'Practical', 'Projekte\\b', 'Projects\\b', 'Energy Sector', 'Technical Solutions', 'Focus areas', 'Key Focus', 'Key responsibilities', 'Presentation content'],
    truncateToolPatterns: ['Tools', 'Technologien', 'Technologies', 'Technical Stack', 'Technischer'],
    showAllProjects: 'Show all projects ({n} more)',
    agentWidget: {
      launcherLabel: 'Chat with my AI agent',
      launcherText: 'Ask the live AI agent',
      headerTitle: "Michael's AI Agent",
      headerSubtitle: 'Ask about projects, stack, and availability',
      inputPlaceholder: 'Type a message …',
      send: 'Send',
      close: 'Close',
      greeting: "Hi, I'm Michael's personal AI agent. Ask me about his experience, his projects, or his availability.",
      connecting: 'Connecting to the agent …',
      working: 'Agent is working …',
      errorConnect: 'The agent is unreachable right now. Please try again later.',
      errorSend: 'The message could not be delivered. Please try again.',
      errorAgent: 'Something went wrong while answering. Please try again.',
      emptyAnswer: 'No answer received.',
      retry: 'Try again',
      maximize: 'Enlarge',
      restore: 'Restore size',
      resize: 'Drag to resize',
      cardOpen: 'Show agent card',
      cardBack: 'Back to chat',
      cardTitle: 'Agent Card',
      cardIntro: "This agent's machine-readable profile card, built to the open A2A (agent-to-agent) standard, live from /.well-known/agent-card.json.",
      cardProtocol: 'A2A protocol',
      cardEndpoint: 'Endpoint',
      cardModes: 'Input/Output',
      cardSkills: 'Skills',
      cardExamplesHint: 'Click an example question to start',
      cardStreaming: 'Streaming',
      cardPush: 'Push',
      cardLoading: 'Loading agent card …',
      cardUnavailable: 'Agent card unavailable right now.',
      privacyNote: "We don't store the conversation, so please don't enter confidential data.",
      privacyLink: 'Privacy',
    },
  },
};

