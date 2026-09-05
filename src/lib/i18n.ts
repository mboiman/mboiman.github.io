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
  /**
   * One sentence on the mechanism. Not a benefit, not an adjective.
   *
   * RENDER IT. These four sentences are the densest prose in the whole
   * verification block, and the card in CVPage.astro showed `title` and `proof`
   * only, so all four sat in the file and reached nobody. A card that reads
   * "open-bridge, die quelloffene Schicht" over a URL states what it is called;
   * the mechanism line is the part that says what it does. It belongs one line
   * under the title and above the proof.
   */
  mechanism: string;
  /**
   * The proof itself: standard, repo, address. Rendered monospace.
   *
   * No pinned release number, and none in this comment either: the version
   * guard in scripts/check-i18n.mjs greps this file for the literal pattern, so
   * a number quoted in prose here is a number the guard counts.
   *
   * The open-bridge anchor used to name a release while the repo was six minors
   * further along, with the same number repeated in four passages of
   * config.cv.toml. Every release meant five hand edits, and the edit was missed
   * twice on one day. A version pinned in prose on a page whose argument is
   * "open it and check" ages into the opposite of a proof. The repo link plus
   * the licence carries the claim on its own, and the link is always current.
   */
  proof: string;
  /** Optional link — only when the proof can genuinely be opened by a visitor. */
  proofUrl?: string;
  /**
   * `public` renders a filled marker, `closed` a hollow one plus the reason.
   *
   * The card list filters on `state === 'public'`, so a closed entry renders
   * nowhere at all rather than as a hollow marker. One entry is `public` and
   * carries no `proofUrl`, which renders an anchor with no href.
   */
  state: 'public' | 'closed';
  /**
   * Why it is not public, or what "public" means where it is not a clickable
   * page. Required when state is `closed`.
   *
   * Kept although nothing reads it today, unlike the seven dead UI labels
   * removed alongside it. Those were labels a renderer can restate in one line;
   * this is the only record of WHY a proof cannot be opened, it cannot be
   * reconstructed from anywhere else in the repo, and it is the missing half of
   * the two defects named on `state` above.
   */
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
  /**
   * Shown only when the agent card is written in another language than the page.
   * The card is a single-language artifact (A2A has no field for it), so on the
   * English page every piece of prose it contributes arrived in German: the
   * description, all five skill names and descriptions, and the example
   * questions, which were clickable and would have sent a German question.
   *
   * Carries a `{lang}` placeholder, filled from `cardLangNames` with the
   * language the card actually declares. It used to name a fixed language in
   * the sentence itself, which is only correct as long as the card stays in
   * German, and the live card declares no language at all.
   */
  cardSourceNote: string;
  /**
   * Language names for the `{lang}` slot above, keyed by the primary subtag the
   * card declares. A map rather than a second pair of fixed sentences, because
   * the trigger and the claim were two different things: the note fires whenever
   * the card's language differs from the page's, and then asserted a language it
   * had never read. A card published in French would have been announced as
   * German on the English page.
   */
  cardLangNames: Record<string, string>;
  cardExamplesStatic: string;// hint above examples that are shown but not clickable
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
 * The act sequence is a portfolio, not an essay. The version before this one
 * was twelve screens of engineering principle with Michael himself appearing
 * exactly twice, and it failed for that reason. Projects carry the page now:
 * five of them, each with its own picture or diagram.
 *
 * Bullet budgets, enforced by scripts/check-i18n.mjs at build time:
 *   manifest 2 · portrait 3 · offer 4 · howto 4 · live 3 · closing 2
 * `project`, `beliefs` and `stations` carry no bullets at all.
 */
export type ActKind =
  | 'manifest' | 'portrait' | 'offer' | 'project'
  | 'howto' | 'beliefs' | 'live' | 'stations' | 'closing';

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
  src: 'nlpanalyse' | 'sla';
  /** What it shows, and that it is his own. Required. */
  caption: string;
  /** Describes the screenshot for a screen reader. The caption says whose work
   *  it is; the alt says what is on it. The old empty-string convention was
   *  wrong here: these are content images, not decoration. */
  alt: string;
}

/**
 * The three-part body of a project act: what was in the way, what I built,
 * what came out. Restored from the version on `main`, which showed real
 * projects this way and which Michael judged the better page. The rebuild
 * that replaced it dropped projects entirely in favour of principle essays,
 * and his verdict was that it "hat das Ziel verfehlt mich zu presentieren".
 * Prose, not bullet fragments: a challenge worth describing needs a sentence.
 */
export interface ActProject {
  challenge: string;
  solution: string;
  result: string;
}

/** A named rule plus its explanation. Two of the four come from Michael's own
 *  QualityCluster deck, which exists as an image with four grammar mistakes in
 *  it, so the text is retyped here rather than shown as a screenshot. */
export interface ActBelief { rule: string; text: string; }

export interface ActTerminal {
  title: string;
  lines: { kind: 'cmd' | 'out' | 'hit'; text: string }[];
  /** When it was recorded. Renders under the block. */
  recorded: string;
}

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
  /** Present on `project` acts. Carries the prose body. */
  project?: ActProject;
  /** Present on the `beliefs` act, which has no bullets. */
  beliefs?: ActBelief[];
  figure?: ActFigure;
  shot?: ActShot;
  terminal?: ActTerminal;
  tree?: ActTreeItem[];
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
  /** Label of the link into the presentation. Names what is behind it, because
   *  a visitor decides from the label alone whether to spend the click. */
  experienceTheStory: string;
  storyBackToCv: string;
  classicCV: string;
  otherLangLabel: string;

  /** Accessible names for the controls in the page chrome. They were hardcoded
   *  in the components, in one language, so the German page announced English
   *  control names to a screen reader and nothing in the build noticed. */
  /* Three states, not two. The old pair named only the two forced modes, so
     the control had no vocabulary for "follow the system" and no way back to it
     once a visitor had clicked once. Each label names the CURRENT state and the
     next step, because with three states the icon alone cannot say where you are. */
  themeSystem: string;
  themeLight: string;
  themeDark: string;
  navLanguage: string;
  navFooter: string;
  /** Accessible name of the sticky section bar (§ Section bar in CVPage). */
  navSections: string;
  /** Label of the bar's section disclosure below the width where the four
      section links fit side by side. */
  jumpTo: string;
  /** Accessible name of the bar's name link, which goes back to the top. */
  backToTop: string;
  /** Result of scripts/check-links.mjs, rendered under the proof cards.
   *  `{ok}`, `{n}` and `{date}` are replaced. Renders only when the check has
   *  actually run, so the sentence is never older than the deploy. */
  linkCheck: string;
  sidebarLabel: string;
  /**
   * The three numbers a buyer looks for and did not find anywhere on this page.
   *
   * Availability, weekly capacity and work location produced zero hits in the
   * built HTML; the one availability sentence that exists lives in
   * config.cv.toml and renders only into the PDF. A recruiter decides from these
   * before reading a single project. Keep it short enough to stay one line per
   * entry, and keep it honest: a stale availability date is worse than none.
   */
  /**
   * The four or five things a buyer looks for before reading anything else.
   *
   * Label and value apart, not one sentence each. They used to be four full
   * sentences in 13px secondary grey, wrapping raggedly over four lines and
   * centred on a phone: the most decision-relevant text on the page rendered as
   * the least legible. A label tells the eye what it is looking at, a value is
   * short enough to be read at a glance, and neither needs a badge around it.
   */
  facts: { label: string; value: string }[];

  /** The presentation, in order. First act opens, second carries the portrait, last closes. */
  acts: PitchAct[];

  storyRole: string;
  storyClosingEyebrow: string;
  /** Section labels inside a `project` act. Three, in this order. */
  projectChallenge: string;
  projectSolution: string;
  projectResult: string;
  /** One line under the stations headline, pointing at the full CV. */
  stationsNote: string;
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
  /** Label of the skills row. The values themselves are not translated: they
   *  are the ids an A2A client addresses, and they come from the live card. */
  agentCardSkills: string;
  /** The honest state before any script has run. Without the bundle the card
   *  used to sit on "checking" forever while nothing was being checked. */
  agentCardStatic: string;
  /** Placeholder in a row that could not be filled. Was a literal em dash
   *  written by the script, which is the one character this project bans. */
  agentFactUnknown: string;
  /** Build stamp in the closing act. */
  builtOn: string;
  builtOnNote: string;

  // CV page only
  running: RunningItem[];
  careerIntro: string;
  talksTitle: string;
  careerDetails: string[];
  cvRunningTitle: string;
  cvFooterOtherLang: string;
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
    // Said "Die Arbeit ansehen", which describes every link on the page. Behind
    // it lie five projects with challenge, solution and result in plain
    // language, and a visitor decides from the label alone. The number matches
    // the manifest bullet on the presentation, which scripts/check-i18n.mjs
    // already ties to the number of project acts.
    experienceTheStory: 'Fünf Projekte im Detail',
    storyBackToCv: 'Zum Lebenslauf',
    classicCV: 'Klassischer Lebenslauf',
    otherLangLabel: 'English',
    themeSystem: 'Darstellung folgt dem System. Weiter zu hell.',
    themeLight: 'Darstellung ist hell. Weiter zu dunkel.',
    themeDark: 'Darstellung ist dunkel. Weiter zur Systemeinstellung.',
    navLanguage: 'Sprache und Ansicht',
    navFooter: 'Fußzeile',
    navSections: 'Abschnitte',
    jumpTo: 'Springen',
    backToTop: 'Nach oben',
    linkCheck: '{ok} von {n} verlinkten Adressen dieser Seite am {date} erreichbar.',
    sidebarLabel: 'Profil-Kurzangaben',
    // "Freiberuflich" is gone: the tagline directly above already says it.
    facts: [
      { label: 'Verfügbar', value: 'ab sofort, 5 Tage/Woche' },
      { label: 'Ort', value: 'Frankfurt am Main und Remote' },
      { label: 'Reise', value: 'nach Absprache' },
      { label: 'Abrechnung', value: 'eigene Rechnung oder BKS-Lab GmbH' },
      { label: 'Stundensatz', value: 'auf Anfrage' },
    ],
    acts: [
      {
        id: '01-auftakt',
        kind: 'manifest',
        tone: 'base',
        eyebrow: 'Quality Engineer · KI-Architekt · Frankfurt am Main',
        headline: 'Ich baue KI-Automatisierung, die im Betrieb hält.',
        // Both numbers are checkable on this same page, so both have to hold.
        // "Zwanzig" against the stations act, which reads the career out of
        // config.cv.toml: the earliest entry is 01/2006. "Drei" against the
        // earliest AI entry in that same file, 04/2023. It said "vier Jahre
        // Agenten-Architektur", which the CV two screens down did not carry.
        // The project count is guarded in scripts/check-i18n.mjs; it said six
        // while five project acts existed, and a visitor can count them.
        bullets: [
          'Zwanzig Jahre Qualitätssicherung, drei Jahre KI-Architektur. Beides zusammen ist der Punkt.',
          'Fünf Projekte auf dieser Seite, jedes mit Bild, Ergebnis und, wo möglich, offenem Beleg.',
        ],
      },
      {
        id: '02-person',
        kind: 'portrait',
        tone: 'alt',
        eyebrow: 'Michael Boiman',
        headline: 'Ich komme aus der Qualitätssicherung. Deshalb traue ich keinem grünen Haken.',
        bullets: [
          'Ich baue die Systeme selbst und betreibe sie danach auch selbst.',
          'Ich arbeite mit offenen Standards, weil jeder sie nachlesen kann.',
          'Was ich behaupte, hinterlege ich mit etwas, das Sie aufrufen können.',
        ],
        hook: 'Der KI-Agent, der auf dieser Seite antwortet, läuft auf einem Rechner in meinem Arbeitszimmer.',
      },
      {
        id: '03-arbeit',
        kind: 'offer',
        tone: 'base',
        eyebrow: 'Zusammenarbeit',
        headline: 'Wofür Unternehmen mich holen.',
        bullets: [
          'Ich baue Agenten-Systeme und nehme sie in Betrieb.',
          'Ich prüfe, ob eine bestehende Automatisierung wirklich liefert.',
          'Ich sichere KI ab: Grenzen, Freigaben, Nachweise.',
          // "als Impulsgeber an der TU Darmstadt" reads as a standing role.
          // config.cv.toml carries exactly one entry, an Impulsvortrag in
          // 04/2026. Michael: "ich hab einmal gehalten, bitte nicht
          // uebertreiben". The workshops stay plural, the CV carries three.
          'Ich gebe das Wissen weiter, in Workshops und in einem Vortrag an der TU Darmstadt.',
        ],
        hook: 'Als Projekt, als Review oder als Workshop. Für den Anfang genügt eine Mail.',
      },
      {
        id: '04-orchestrator',
        kind: 'project',
        tone: 'alt',
        eyebrow: 'Projekt · KI-Automatisierung',
        headline: 'Ein Orchestrator, über den meine gesamte Arbeit läuft.',
        bullets: [],
        project: {
          challenge: 'Entwicklung über viele Repos, mehrere Kunden und ein Dutzend Werkzeuge. Der Kontextwechsel hat mich jeden Tag Stunden gekostet.',
          solution: 'Ein zentrales System aus adressierbaren Agenten, einer Registry über alle Projekte und einem Skill-Baum für jedes Werkzeug. Die Agenten fragen sich gegenseitig über das offene A2A-Protokoll, ein Gateway übersetzt dieselben Agenten für MCP-Clients.',
          result: 'Von der Incident-Analyse über Board-Pflege bis zum Meeting-Protokoll läuft alles über einen Einstiegspunkt. Das generische Gerüst dahinter liegt quelloffen unter MIT, die Kundendaten bleiben in der privaten Schicht.',
        },
        figure: {
          id: 'mesh',
          labels: [
            'Projekt-Agent',
            'Firmen-Agent',
            'Persönlicher Agent',
            'Gateway',
            'list · card · ask',
          ],
          caption: 'Drei Agenten, ein Gateway, ein offenes Protokoll.',
        },
        terminal: {
          title: 'open-bridge',
          lines: [
            // git's progress chatter came out here and was dropped when the
            // gateway pair went in: the block is a proof, and "Cloning into
            // ..." proves nothing the next command does not, while costing the
            // line that pushed the recording date off a 1024x640 screen.
            { kind: 'cmd', text: 'gh repo clone bks-lab/open-bridge' },
            { kind: 'cmd', text: 'cd open-bridge && head -1 LICENSE' },
            { kind: 'out', text: '  MIT License' },
            { kind: 'cmd', text: "ls rules/ | grep -E 'guard|safety'" },
            { kind: 'hit', text: '  promote-safety.md' },
            { kind: 'hit', text: '  push-guard.md' },
            // The solution text above claims a gateway that serves the same
            // agents to MCP clients. It was a sentence when this act was
            // written and shipped as a release since, so it is shown now
            // instead of asserted.
            { kind: 'cmd', text: 'ls agents/ | grep gateway' },
            { kind: 'hit', text: '  _gateway' },
          ],
          recorded: 'Befehle am 21. August 2026 gegen das offene Repo ausgeführt.',
        },
        anchor: {
          text: 'github.com/bks-lab/open-bridge · MIT',
          label: 'Klonen und selbst hineinsehen',
          url: 'https://github.com/bks-lab/open-bridge',
          state: 'public',
        },
      },
      {
        id: '05-sprachbot',
        kind: 'project',
        tone: 'base',
        eyebrow: 'Projekt · Sprach-KI',
        headline: 'Ein Sprachbot, der am Telefon echte freie Termine nennt.',
        bullets: [],
        project: {
          challenge: 'Eine Praxis verliert Anrufe, weil während der Behandlung niemand abnimmt. Ein Sprachmodell darf sich Termine aber auf keinen Fall ausdenken.',
          solution: 'Das Modell führt das Gespräch, die freien Zeiten holt es live aus dem Terminportal. Es merkt vor und bucht nie. Die Einwilligung steht vor dem ersten inhaltlichen Satz.',
          result: 'Der Anrufer hört eine kurze Zwischenansage, während die Antwort im Hintergrund fertig wird. Datum und Uhrzeit nennt der Bot als Wörter, weil die Sprachausgabe einzelne Ziffern verschluckt.',
        },
        figure: {
          id: 'timeline',
          labels: [
            'Netz',
            'Termine holen',
            'Modell',
            'Antwort',
            'Zwischenansage',
          ],
          caption: 'Ein Gesprächszug, aufgeteilt nach Zeitanteilen.',
        },
        phone: {
          lines: [
            'Ich brauche einen Termin nächste Woche',
            'Einen Moment, ich schaue nach',
            'Am Dienstag, dem elften, um zehn Uhr dreißig',
          ],
          note: 'Mitschnitt aus dem Testbetrieb, sinngemäß wiedergegeben.',
        },
        anchor: {
          text: 'Sprachkanal beim Auftraggeber',
          label: 'nicht öffentlich',
          state: 'closed',
          note: 'Der Anschluss gehört dem Auftraggeber, die Rufnummer bleibt privat.',
        },
      },
      {
        id: '06-email',
        kind: 'project',
        tone: 'alt',
        eyebrow: 'Projekt · Prozessautomatisierung',
        headline: 'E-Mails lesen, einsortieren und ins ERP buchen, ohne Mensch dazwischen.',
        bullets: [],
        project: {
          challenge: 'Eingehende Mails wurden von Hand gelesen, klassifiziert und nach SAP übertragen. Das kostete jeden Tag Zeit und produzierte Übertragungsfehler.',
          solution: 'Microsoft Graph holt die Mails, ein Sprachmodell klassifiziert sie, Azure Functions verarbeiten sie weiter und übergeben das Ergebnis per RFC an SAP.',
          result: 'Die Klassifizierung läuft durch, das Dashboard zeigt jede Kategorie und ihren Verlauf. Bei unsicherer Zuordnung landet die Mail beim Menschen statt im falschen Vorgang.',
        },
        shot: {
          src: 'nlpanalyse',
          caption: 'Mein Dashboard der E-Mail-Klassifizierung. Kategorien generisch, keine Absender.',
          alt: 'Dashboard mit Kategorien und Verlaufskurven der automatischen E-Mail-Klassifizierung',
        },
        // Das Umbenennungs-Widget stand hier: scan_0042.pdf wird zu
        // 2026-08-07-versicherung-beitragsanpassung.pdf. Der Akt handelt von
        // Mail, Klassifizierung und SAP, config.cv.toml nennt zu diesem Projekt
        // Graph API, Sprachmodell, Azure Functions, SAP RFC, Elasticsearch und
        // Kibana, aber kein Namensschema fuer Dateien. Es zeigte also die
        // Faehigkeit eines anderen Projekts. Ersatzlos raus statt ein neues
        // Vorher-Nachher zu erfinden.
        //
        // Stattdessen der Anker, den der Akt als einziger Projekt-Akt gar nicht
        // hatte: weder Beleg noch Eingestaendnis, dass keiner moeglich ist.
        anchor: {
          text: 'E-Mail-Klassifizierung beim Auftraggeber',
          label: 'nicht öffentlich',
          state: 'closed',
          note: 'Das System läuft beim Auftraggeber, es hat keine öffentliche Adresse.',
        },
      },
      {
        id: '07-rechnungen',
        kind: 'project',
        tone: 'base',
        eyebrow: 'Projekt · Enterprise-Integration',
        headline: 'Rechnungen, die europaweit ankommen müssen.',
        bullets: [],
        project: {
          challenge: 'Aus- und Eingangsrechnungen mussten in beide Richtungen zwischen SAP Business ByDesign und dem europäischen Peppol-Netz laufen, im Produktivbetrieb und ohne dass ein Beleg verloren gehen durfte.',
          solution: 'Zwei Strecken nach der offenen Norm EN 16931. Eingehend über zwei parallele Wege, per Webhook und aus einem Postfach, beide enden in derselben Verarbeitungsschicht.',
          result: 'Bei einer forensischen Prüfung zeigte sich, dass angenommen und zugestellt zwei verschiedene Dinge sind. Die Hälfte der Stichprobe kam nie an, die Ursache lag in den Stammdaten und nicht im Code. Die Prüfung selbst liegt beim Auftraggeber und bleibt unter Verschluss.',
        },
        figure: {
          id: 'route',
          labels: [
            'Absender',
            'Access Point',
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
      },
      {
        id: '08-monitoring',
        kind: 'project',
        tone: 'alt',
        eyebrow: 'Projekt · Quality Engineering',
        headline: 'Freigaben aus Daten statt aus Bauchgefühl.',
        bullets: [],
        project: {
          challenge: 'Go- oder No-Go-Entscheidungen kosteten stundenlanges Zusammentragen aus den Testwerkzeugen mehrerer Teams und mehrerer Umgebungen.',
          solution: 'Eine durchgängige Pipeline zieht alle Quellen zusammen und zeigt Verfügbarkeit, Antwortzeiten und offene Vorfälle nebeneinander in einem Dashboard.',
          result: 'Bei einer Legacy-Migration lief die Validierung rund um die Uhr im Doppelbetrieb: alte und neue Strecke gleichzeitig unter Last, jede Abweichung meldet die Maschine statt ein Mensch.',
        },
        shot: {
          src: 'sla',
          caption: 'Mein eigenes SLA-Dashboard aus einer internen Evaluierung, gespeist aus simulierten Daten. Es ist die Architektur-Referenz, nicht das System des Auftraggebers.',
          alt: 'SLA-Dashboard mit Verfügbarkeitskurve, Antwortzeit-Histogramm und Vorfallsliste',
        },
        // Der einzige Projekt-Akt ohne Anker, obwohl es hier einen echten gibt:
        // das gezeigte Dashboard liegt oeffentlich (live geprueft, visibility
        // PUBLIC). Nur zusammen mit der korrigierten Bildunterschrift richtig,
        // sonst haengt ein offener Beleg an einer Zeile, die ein Kundensystem
        // behauptet.
        anchor: {
          text: 'github.com/bks-lab/experimental-django-sla-dashboard',
          label: 'Das Dashboard aus dem Bild liegt offen',
          url: 'https://github.com/bks-lab/experimental-django-sla-dashboard',
          state: 'public',
        },
      },
      {
        id: '09-freigabe',
        kind: 'howto',
        tone: 'base',
        eyebrow: 'Wie ich mit KI arbeite',
        headline: 'Die Maschine arbeitet bis zum Entwurf. Freigeben darf sie nicht.',
        bullets: [
          'Ein Mensch zieht die Karte, das startet den Lauf.',
          'Jede Stufe startet frisch, ohne den Kontext der vorherigen.',
          'Der Prüfer sieht nur die Artefakte, nie die Begründung des Umsetzers.',
          'Auch Änderungen am System selbst gehen durch dasselbe Tor.',
        ],
        figure: {
          id: 'gate',
          labels: [
            'gestartet',
            'umgesetzt',
            'geprüft',
            'Entwurf',
            'merge',
            'wartet auf einen Menschen',
          ],
          caption: 'Die Karte hält vor dem Tor. Sie geht nicht durch.',
        },
        anchor: {
          text: 'rules/learning-autonomy.md',
          label: 'Die Regel liegt offen im Repo',
          url: 'https://github.com/bks-lab/open-bridge/blob/main/rules/learning-autonomy.md',
          state: 'public',
        },
        hook: 'Das ist für mich der Unterschied zwischen KI, die man einsetzen kann, und KI, die man vorführen kann.',
      },
      {
        id: '10-leitsaetze',
        kind: 'beliefs',
        tone: 'alt',
        eyebrow: 'Leitsätze',
        headline: 'Vier Regeln, die sich bei mir bewährt haben.',
        bullets: [],
        beliefs: [
          {
            rule: 'One Bug Policy',
            text: 'Nach jeder Korrektur klären wir, auf welcher Ebene der Test-Pipeline der Fehler hätte auffallen müssen. Genau dieser Test wird dann gebaut.',
          },
          {
            rule: 'Logging before Debugging',
            text: 'Wer für eine Analyse den Debugger braucht, dem fehlt Logging. Das kommt zusammen mit der Behebung dazu.',
          },
          {
            rule: 'Maschinen ermüden nicht',
            text: 'Eine Million Kombinationen testet kein Mensch. Eine Maschine, die nie schläft, schon.',
          },
          {
            rule: 'Messbar oder gar nicht',
            text: 'Automatisierung ohne Messbarkeit ist nur schnelleres Raten.',
          },
        ],
      },
      {
        id: '11-agent',
        kind: 'live',
        tone: 'base',
        eyebrow: 'Live auf dieser Seite',
        headline: 'Fragen Sie meinen Agenten, statt mir zu glauben.',
        // The hardware question moved out and the peer question moved in.
        // Reason: act 02 already states that the agent runs on a machine in his
        // study, so asking it the same thing produced the one answer on this
        // act that proved nothing new. Nothing on the page let a visitor check
        // the agent mesh drawn in act 04, and this question does: the answer
        // names the two neighbouring agents it can consult. Verified against
        // the running agent before it was put here.
        bullets: [
          'Was liest du, und was nicht?',
          'Wen fragst du, wenn du etwas nicht weißt?',
          'Woher kommen deine Terminzeiten?',
        ],
        askAgent: true,
        probeNotes: [
          'Prüft die absichtlich schmale Wissensquelle.',
          'Prüft, ob die Agenten sich gegenseitig erreichen.',
          'Prüft den Terminspiegel: nur Zeiten, kein Titel, kein Ort.',
        ],
        anchor: {
          text: 'mboiman.bks-lab.com/.well-known/agent-card.json',
          label: 'Seine Agent Card, direkt aufrufbar',
          url: 'https://mboiman.bks-lab.com/.well-known/agent-card.json',
          state: 'public',
        },
        hook: 'Drei Fragen an seine Grenzen: was er weiß, wen er erreicht, was er über Termine preisgibt.',
      },
      {
        id: '12-stationen',
        kind: 'stations',
        tone: 'alt',
        eyebrow: 'Stationen',
        headline: 'Wo ich das gelernt habe.',
        bullets: [],
      },
      {
        id: '13-kontakt',
        kind: 'closing',
        tone: 'base',
        eyebrow: 'Nächster Schritt',
        headline: 'Michael Boiman',
        bullets: [
          'Schreiben Sie mir, was ansteht. Zwei Sätze zur Aufgabe genügen.',
          'Alles auf dieser Seite ist aufrufbar oder als vertraulich gekennzeichnet.',
        ],
      },
    ],
    storyRole: 'Quality Engineer · KI-Architekt',
    storyClosingEyebrow: 'BKS-Lab GmbH · Frankfurt am Main',
    projectChallenge: 'Herausforderung',
    projectSolution: 'Lösung',
    projectResult: 'Ergebnis',
    stationsNote: 'Die Kurzfassung. Alle Stationen, Zertifikate und Vorträge stehen im Lebenslauf.',
    proofPublicLabel: 'öffentlich prüfbar',
    proofClosedLabel: 'nicht öffentlich',
    agentUnavailable: 'Der Agent antwortet gerade nicht. Sein Steckbrief liegt trotzdem offen.',
    agentChecking: 'Erreichbarkeit wird geprüft',
    agentReachable: 'Erreichbar',
    agentCardName: 'Name',
    agentCardProtocol: 'Protokoll',
    agentCardEndpoint: 'Adresse',
    agentCardSkills: 'Fähigkeiten',
    agentCardStatic: 'noch nicht geprüft',
    agentFactUnknown: 'nicht abrufbar',
    builtOn: 'zuletzt gebaut am',
    builtOnNote: 'Zur Bauzeit gestempelt, nicht getippt.',
    running: [
      {
        title: 'Die Rechnungsstrecke',
        mechanism: 'Aus- und Eingangsrechnungen eines Online-Stellenmarkts laufen produktiv zwischen SAP Business ByDesign und dem Peppol-Netz. Eingehend über zwei parallele Wege, per Webhook und aus einem Postfach, beide enden in derselben Schicht.',
        proof: 'EN 16931 · Peppol BIS 3.0',
        state: 'closed',
        stateNote: 'Kunde unter NDA',
      },
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
        proof: 'github.com/bks-lab/open-bridge · MIT',
        proofUrl: 'https://github.com/bks-lab/open-bridge',
        state: 'public',
      },
      {
        title: 'Das Übersetzungs-Gateway',
        mechanism: 'Ein zustandsloser Übersetzer stellt dieselben Agenten für MCP-Clients bereit. Drei Werkzeuge, kein eigenes Modell, keine eigene Logik, kein Zustand zwischen zwei Aufrufen.',
        proof: 'MCP nach A2A',
        state: 'public',
        stateNote: 'offen für MCP-Clients, anonym nur Auskunft; keine Seite zum Anklicken',
      },
    ],
    careerIntro: 'Quality Engineer und KI-Architekt aus Frankfurt am Main. Quality Engineering und KI-Architektur laufen bei mir parallel, nicht nacheinander: die Prüfdisziplin ist der Grund, warum mein Agentensystem Tore und Belege hat statt blind zu handeln.',
    talksTitle: 'Vorträge & Workshops',
    careerDetails: [
      'In Enterprise-Projekten (DB Vertrieb, DVAG, TÜV Süd) habe ich an Quality-Monitoring, KI-gestützter Testautomatisierung und mit Dauerbetrieb-Validierung abgesicherten Legacy-Migrationen mitgewirkt.',
      'Heute verbinde ich Quality Engineering mit KI-Architektur: <strong style="color: var(--accent); font-weight: 500">MCP- und A2A-Protokolle</strong>, ein Netz aus Agenten, die sich gegenseitig befragen, und eine produktive E-Invoicing-Plattform nach <strong style="color: var(--accent); font-weight: 500">EN 16931</strong>. Der generische Rahmen dahinter liegt quelloffen unter MIT, einer dieser Agenten beantwortet diesen Lebenslauf live.',
      // Same correction as act 03 on the presentation: this said "als geladener
      // Impulsgeber an der TU Darmstadt", accent-highlighted, which reads as a
      // standing role. It is one Impulsvortrag, 04/2026. The highlight moves to
      // the workshops, which the CV does carry several of.
      'Dieses Wissen gebe ich weiter, in <strong style="color: var(--accent); font-weight: 500">Entwickler- und Business-Workshops</strong> und in einem Impulsvortrag an der TU Darmstadt, und übersetze KI-Praxis für technische wie nicht-technische Zielgruppen.',
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
      cardSourceNote: 'Der Agent veröffentlicht seinen Steckbrief auf {lang}. Die Protokollangaben darunter sind sprachneutral.',
      cardLangNames: { de: 'Deutsch', en: 'Englisch', fr: 'Französisch', es: 'Spanisch' },
      cardExamplesStatic: 'Beispiel-Fragen aus dem Steckbrief, in der Sprache des Steckbriefs',
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
    experienceTheStory: 'Five projects in detail',
    storyBackToCv: 'Back to CV',
    classicCV: 'Classic CV',
    otherLangLabel: 'Deutsch',
    themeSystem: 'Appearance follows the system. Next: light.',
    themeLight: 'Appearance is light. Next: dark.',
    themeDark: 'Appearance is dark. Next: follow the system.',
    navLanguage: 'Language and appearance',
    navFooter: 'Footer',
    navSections: 'Sections',
    jumpTo: 'Jump to',
    backToTop: 'Back to top',
    linkCheck: '{ok} of {n} linked addresses on this page reachable on {date}.',
    sidebarLabel: 'Profile at a glance',
    // "Hourly rate", not "day rate". The two branches disagreed about the unit
    // Michael bills in: German said Stundensatz, English said day rate. Same CV,
    // two different commercial terms, and nothing checked it. Aligned to the
    // German wording, which is the default page.
    facts: [
      { label: 'Available', value: 'immediately, 5 days a week' },
      { label: 'Based', value: 'Frankfurt am Main and remote' },
      { label: 'Travel', value: 'by arrangement' },
      { label: 'Billing', value: 'own account or BKS-Lab GmbH' },
      { label: 'Hourly rate', value: 'on request' },
    ],
    acts: [
      {
        id: '01-auftakt',
        kind: 'manifest',
        tone: 'base',
        eyebrow: 'Quality Engineer · AI Architect · Frankfurt am Main',
        headline: 'I build AI automation that survives production.',
        // See the note on the German branch: both numbers are checkable on this
        // page and both were wrong.
        bullets: [
          'Twenty years of quality engineering, three years of AI architecture. The combination is the point.',
          'Five projects on this page, each with a picture, a result and, where possible, open evidence.',
        ],
      },
      {
        id: '02-person',
        kind: 'portrait',
        tone: 'alt',
        eyebrow: 'Michael Boiman',
        headline: 'I come from quality engineering. That is why I trust no green checkmark.',
        bullets: [
          'I build the systems myself and then run them myself.',
          'I work with open standards, because anyone can read them.',
          'Whatever I claim, I back with something you can open.',
        ],
        hook: 'The AI agent answering on this page runs on a machine in my study.',
      },
      {
        id: '03-arbeit',
        kind: 'offer',
        tone: 'base',
        eyebrow: 'Working together',
        headline: 'What companies bring me in for.',
        bullets: [
          'I build agent systems and take them into production.',
          'I check whether an existing automation really delivers.',
          'I put guardrails on AI: boundaries, approvals, evidence.',
          // See the German branch: one talk, not a standing role.
          'I pass that knowledge on, in workshops and in a talk at TU Darmstadt.',
        ],
        hook: 'As a project, a review or a workshop. One email is enough to start.',
      },
      {
        id: '04-orchestrator',
        kind: 'project',
        tone: 'alt',
        eyebrow: 'Project · AI automation',
        headline: 'An orchestrator that all of my work runs through.',
        bullets: [],
        project: {
          challenge: 'Development across many repos, several clients and a dozen tools. Switching context cost me hours every day.',
          solution: 'A central system of addressable agents, a registry across every project and a skill tree for each tool. The agents query each other over the open A2A protocol, and a gateway serves the same agents to MCP clients.',
          result: 'From incident analysis through board upkeep to meeting minutes, everything runs through one entry point. The generic framework behind it is open source under MIT, while client data stays in the private layer.',
        },
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
        terminal: {
          title: 'open-bridge',
          lines: [
            // See the German branch: git's progress line came out to pay for
            // the gateway pair.
            { kind: 'cmd', text: 'gh repo clone bks-lab/open-bridge' },
            { kind: 'cmd', text: 'cd open-bridge && head -1 LICENSE' },
            { kind: 'out', text: '  MIT License' },
            { kind: 'cmd', text: "ls rules/ | grep -E 'guard|safety'" },
            { kind: 'hit', text: '  promote-safety.md' },
            { kind: 'hit', text: '  push-guard.md' },
            { kind: 'cmd', text: 'ls agents/ | grep gateway' },
            { kind: 'hit', text: '  _gateway' },
          ],
          recorded: 'Commands run against the open repo on 21 August 2026.',
        },
        anchor: {
          text: 'github.com/bks-lab/open-bridge · MIT',
          label: 'Clone it and look inside',
          url: 'https://github.com/bks-lab/open-bridge',
          state: 'public',
        },
      },
      {
        id: '05-sprachbot',
        kind: 'project',
        tone: 'base',
        eyebrow: 'Project · Voice AI',
        headline: 'A voice bot that names real open slots on the phone.',
        bullets: [],
        project: {
          challenge: 'A practice loses calls because nobody can pick up during treatment. A language model, however, must never invent an appointment.',
          solution: 'The model runs the conversation, the open slots come live from the booking portal. It pencils in and never books. Consent comes before the first substantive sentence.',
          result: 'The caller hears a short holding line while the answer finishes in the background. The bot says date and time as words, because speech synthesis swallows individual digits.',
        },
        figure: {
          id: 'timeline',
          labels: [
            'Network',
            'Fetch slots',
            'Model',
            'Answer',
            'Holding line',
          ],
          caption: 'One conversational turn, split by share of time.',
        },
        phone: {
          lines: [
            'I need an appointment next week',
            'One moment, let me check',
            'On Tuesday the eleventh, at half past ten',
          ],
          note: 'Recorded in test operation, reproduced in substance.',
        },
        anchor: {
          text: 'Voice channel at the client',
          label: 'not public',
          state: 'closed',
          note: 'The line belongs to the client, the number stays private.',
        },
      },
      {
        id: '06-email',
        kind: 'project',
        tone: 'alt',
        eyebrow: 'Project · Process automation',
        headline: 'Read email, sort it, post it into the ERP, with nobody in between.',
        bullets: [],
        project: {
          challenge: 'Incoming mail was read by hand, classified and typed into SAP. That cost time every day and produced transcription errors.',
          solution: 'Microsoft Graph fetches the mail, a language model classifies it, Azure Functions process it further and hand the result to SAP over RFC.',
          result: 'Classification runs end to end and the dashboard shows every category over time. When the assignment is uncertain, the mail goes to a human instead of into the wrong case.',
        },
        shot: {
          src: 'nlpanalyse',
          caption: 'My dashboard for email classification. Categories generic, no senders.',
          alt: 'Dashboard showing categories and trend curves of the automatic email classification',
        },
        // Siehe den deutschen Zweig: Widget raus, geschlossener Anker rein.
        anchor: {
          text: 'Email classification at the client',
          label: 'not public',
          state: 'closed',
          note: 'The system runs at the client, and it has no public address.',
        },
      },
      {
        id: '07-rechnungen',
        kind: 'project',
        tone: 'base',
        eyebrow: 'Project · Enterprise integration',
        headline: 'Invoices that have to arrive across Europe.',
        bullets: [],
        project: {
          challenge: 'Outgoing and incoming invoices had to move in both directions between SAP Business ByDesign and the European Peppol network, in production, and without losing a single document.',
          solution: 'Two routes under the open EN 16931 standard. Inbound over two parallel paths, by webhook and from a mailbox, both ending in the same processing layer.',
          result: 'A forensic check showed that accepted and delivered are two different things. Half the sample had never arrived, and the cause sat in master data rather than in code. The check itself belongs to the client and stays confidential.',
        },
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
          label: 'Open standards, independently readable',
          url: 'https://docs.peppol.eu/poacc/billing/3.0/',
          state: 'public',
        },
      },
      {
        id: '08-monitoring',
        kind: 'project',
        tone: 'alt',
        eyebrow: 'Project · Quality engineering',
        headline: 'Release decisions from data instead of gut feeling.',
        bullets: [],
        project: {
          challenge: 'Go or no-go decisions cost hours of collecting numbers from the test tools of several teams and several environments.',
          solution: 'One continuous pipeline pulls every source together and shows availability, response times and open incidents side by side on a dashboard.',
          result: 'During a legacy migration the validation ran around the clock in dual operation: old and new route under load at the same time, with every deviation reported by the machine rather than a person.',
        },
        shot: {
          src: 'sla',
          caption: 'My own SLA dashboard from an internal evaluation, fed with simulated data. It is the architecture reference, not the client system.',
          alt: 'SLA dashboard with availability curve, response time histogram and incident list',
        },
        anchor: {
          text: 'github.com/bks-lab/experimental-django-sla-dashboard',
          label: 'The dashboard in the picture is public',
          url: 'https://github.com/bks-lab/experimental-django-sla-dashboard',
          state: 'public',
        },
      },
      {
        id: '09-freigabe',
        kind: 'howto',
        tone: 'base',
        eyebrow: 'How I work with AI',
        headline: 'The machine works up to the draft. Approving is not its job.',
        bullets: [
          'A human moves the card, and that starts the run.',
          'Each stage starts fresh, without the context of the previous one.',
          "The reviewer sees only the artefacts, never the implementer's reasoning.",
          'Even changes to the system itself pass through the same gate.',
        ],
        figure: {
          id: 'gate',
          labels: [
            'started',
            'built',
            'reviewed',
            'draft',
            'merge',
            'waiting for a human',
          ],
          caption: 'The card stops at the gate. It does not pass.',
        },
        anchor: {
          text: 'rules/learning-autonomy.md',
          label: 'The rule is public in the repo',
          url: 'https://github.com/bks-lab/open-bridge/blob/main/rules/learning-autonomy.md',
          state: 'public',
        },
        hook: 'To me that is the difference between AI you can deploy and AI you can demo.',
      },
      {
        id: '10-leitsaetze',
        kind: 'beliefs',
        tone: 'alt',
        eyebrow: 'Principles',
        headline: 'Four rules that have held up for me.',
        bullets: [],
        beliefs: [
          {
            rule: 'One Bug Policy',
            text: 'After every fix we establish which level of the test pipeline should have caught it. That exact test then gets written.',
          },
          {
            rule: 'Logging before Debugging',
            text: 'If an analysis needed the debugger, logging was missing. It ships together with the fix.',
          },
          {
            rule: 'Machines do not tire',
            text: 'No human tests a million combinations. A machine that never sleeps does.',
          },
          {
            rule: 'Measurable or not at all',
            text: 'Automation without measurement is only faster guessing.',
          },
        ],
      },
      {
        id: '11-agent',
        kind: 'live',
        tone: 'base',
        eyebrow: 'Live on this page',
        headline: 'Ask my agent instead of taking my word.',
        // See the note on the German branch for why the hardware question gave
        // way to the peer question.
        bullets: [
          'What do you read, and what do you not?',
          'Who do you ask when you do not know something?',
          'Where do your appointment times come from?',
        ],
        askAgent: true,
        probeNotes: [
          'Probes the deliberately narrow knowledge source.',
          'Probes whether the agents really reach each other.',
          'Probes the calendar mirror: times only, no title, no place.',
        ],
        anchor: {
          text: 'mboiman.bks-lab.com/.well-known/agent-card.json',
          label: 'Its agent card, open it directly',
          url: 'https://mboiman.bks-lab.com/.well-known/agent-card.json',
          state: 'public',
        },
        hook: 'Three questions at its edges: what it knows, who it reaches, what it gives away about appointments.',
      },
      {
        id: '12-stationen',
        kind: 'stations',
        tone: 'alt',
        eyebrow: 'Track record',
        headline: 'Where I learned this.',
        bullets: [],
      },
      {
        id: '13-kontakt',
        kind: 'closing',
        tone: 'base',
        eyebrow: 'Next step',
        headline: 'Michael Boiman',
        bullets: [
          'Write to me about what is coming up. Two sentences on the task are enough.',
          'Everything on this page can be opened or is marked confidential.',
        ],
      },
    ],
    storyRole: 'Quality Engineer · AI Architect',
    storyClosingEyebrow: 'BKS-Lab GmbH · Frankfurt am Main',
    projectChallenge: 'Challenge',
    projectSolution: 'Solution',
    projectResult: 'Result',
    stationsNote: 'The short version. Every position, certificate and talk is on the CV.',
    proofPublicLabel: 'publicly verifiable',
    proofClosedLabel: 'not public',
    agentUnavailable: 'The agent is not answering right now. Its profile card is public regardless.',
    agentChecking: 'Checking reachability',
    agentReachable: 'Reachable',
    agentCardName: 'Name',
    agentCardProtocol: 'Protocol',
    agentCardEndpoint: 'Address',
    agentCardSkills: 'Skills',
    agentCardStatic: 'not checked yet',
    agentFactUnknown: 'not retrievable',
    builtOn: 'last built on',
    builtOnNote: 'Stamped at build time, not typed.',
    running: [
      {
        title: 'The invoicing pipeline',
        mechanism: 'Outbound and inbound invoices for an online job marketplace run in production between SAP Business ByDesign and the Peppol network. Inbound arrives over two parallel routes, a webhook and a mailbox, and both end in the same layer.',
        proof: 'EN 16931 · Peppol BIS 3.0',
        state: 'closed',
        stateNote: 'client under NDA',
      },
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
        proof: 'github.com/bks-lab/open-bridge · MIT',
        proofUrl: 'https://github.com/bks-lab/open-bridge',
        state: 'public',
      },
      {
        title: 'The translation gateway',
        mechanism: 'A stateless translator exposes the same agents to MCP clients. Three tools, no model of its own, no logic of its own, and no state carried between two calls.',
        proof: 'MCP to A2A',
        state: 'public',
        stateNote: 'open to MCP clients, anonymous gets lookups only; not a page you can click',
      },
    ],
    careerIntro: 'Quality engineer and AI architect based in Frankfurt am Main. Quality engineering and AI architecture run in parallel for me rather than in sequence: the testing discipline is the reason my agent system has gates and evidence instead of acting blind.',
    talksTitle: 'Speaking & Workshops',
    careerDetails: [
      'In enterprise projects (DB Vertrieb, DVAG, TÜV Süd) I worked on quality monitoring, AI-driven test automation, and legacy migrations secured by continuous validation.',
      'Today I combine quality engineering with AI architecture: <strong style="color: var(--accent); font-weight: 500">MCP and A2A protocols</strong>, a network of agents that consult each other, and a production e-invoicing platform to <strong style="color: var(--accent); font-weight: 500">EN 16931</strong>. The generic framework behind it is open source under MIT, and one of those agents answers this very CV, live.',
      // See the German branch: one invited talk, not a standing role.
      'I also pass this knowledge on, in <strong style="color: var(--accent); font-weight: 500">developer and business workshops</strong> and in an invited talk at TU Darmstadt, translating hands-on AI for technical and non-technical audiences alike.',
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
      cardSourceNote: 'The agent publishes its card in {lang}. The protocol facts below are language-neutral.',
      cardLangNames: { de: 'German', en: 'English', fr: 'French', es: 'Spanish' },
      cardExamplesStatic: 'Example questions from the card, in the language the card is written in',
      cardStreaming: 'Streaming',
      cardPush: 'Push',
      cardLoading: 'Loading agent card …',
      cardUnavailable: 'Agent card unavailable right now.',
      privacyNote: "We don't store the conversation, so please don't enter confidential data.",
      privacyLink: 'Privacy',
    },
  },
};

