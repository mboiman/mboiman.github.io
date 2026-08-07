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

/** A question a visitor can fire at the live agent, plus what the answer proves. */
export interface ProbeItem {
  question: string;
  explains: string;
}

/**
 * The core act type. Replaces the old "featured project" rendering, which
 * coupled the presentation's layout to `projects.list` and to a vanity
 * `metric` field: a project without a number silently fell back to a raw
 * markdown bullet dump next to a designed one.
 */
export interface DecisionAct {
  id: string;
  category: string;
  stack: string;
  title: string;
  problem: string;
  /** Rejected options first (rendered struck back), chosen option last. */
  rejected: string[];
  chosen: string;
  decision: string;
  /** What the decision cost. A decision with a price cannot read as a success report. */
  price: string;
  /** Never a counter, a percentage or a year. Standard, licence/release, address, or named procedure. */
  proof: string;
  proofLabel: string;
  proofUrl?: string;
  state: 'public' | 'closed';
  stateNote?: string;
  /** Optional closing paragraph, set quieter than the body. */
  coda?: string;
}

/** A rule that runs, plus the event it came out of. */
export interface Gate {
  rule: string;
  mechanism: string;
  origin: string;
}

/** A claim that was withdrawn after checking. */
export interface Correction {
  assumption: string;
  check: string;
  result: string;
}

/** A talk, workshop or engagement in the knowledge-transfer act. */
export interface TransferItem {
  title: string;
  body: string;
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
 * One act of the presentation. Bullets only.
 *
 * The previous shape carried paragraph-length `problem` / `decision` / `price`
 * fields per act and read as an essay on a slide. Michael's note was
 * "zu viel text für eine presentation wo nur bulletpoints laufen sollten".
 * Hard budget now, checked by scripts/check-acts.mjs at build time: at most
 * eight words per bullet, at most five bullets, at most 55 words per act.
 * If something does not fit, it belongs behind the hook, not on the slide.
 */
export interface PitchAct {
  id: string;
  eyebrow: string;
  headline: string;
  bullets: string[];
  /** Bullets ending in a question mark become clickable prompts for the live agent. */
  askAgent?: boolean;
  /** The verifiable identifier. Never a counter, a percentage or a year. */
  anchor?: { text: string; label: string; url?: string; state: 'public' | 'closed'; note?: string };
  /** The line that points at depth NOT shown on the slide. This is what creates the question. */
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
        eyebrow: 'Haltung',
        headline: 'Deklarierter Zustand ist nicht verifizierter Zustand',
        bullets: [
          'Config sagt läuft: ich frage den Dienst',
          'Anbieter sagt gefixt: ich lade die Spec',
          'Pipeline sagt Erfolg: ich prüfe die Quittung',
        ],
        anchor: {
          text: 'deploy-reconciliation.md',
          label: 'Regel im offenen Repo',
          url: 'https://github.com/bks-lab/open-bridge/blob/main/rules/deploy-reconciliation.md',
          state: 'public',
        },
        hook: 'Diese Seite hält sich selbst daran.',
      },
      {
        id: '02-angebot',
        eyebrow: 'Michael Boiman · BKS-Lab GmbH · Frankfurt',
        headline: 'Wofür man mich holt',
        bullets: [
          'Prüfen, ob ein System wirklich liefert',
          'E-Rechnung nach EN 16931 produktiv betreiben',
          'KI-Agenten bauen, die nach außen dichthalten',
          'Werkzeuge und Wissen an Teams übergeben',
          'Frei für Mandate, Reviews und Workshops',
        ],
        anchor: {
          text: 'mboiman.github.io',
          label: 'Klassischer Lebenslauf und PDF',
          url: 'https://mboiman.github.io/',
          state: 'public',
        },
        hook: 'Jeder Punkt bekommt gleich seinen Beleg.',
      },
      {
        id: '03-laeuft',
        eyebrow: 'Heute live gelesen',
        headline: 'Was gerade läuft',
        bullets: [
          'Dieser Agent, unter eigener Domain adressierbar',
          'open-bridge, öffentlich unter MIT, v0.14.0',
          'Die Rechnungsstrecke, produktiv, Kunde unter NDA',
          'Das MCP-Gateway, offen für fremde Clients',
        ],
        anchor: {
          text: 'agent-card.json',
          label: 'A2A 1.0, live abrufbar',
          url: 'https://mboiman.bks-lab.com/.well-known/agent-card.json',
          state: 'public',
        },
        hook: 'Drei davon öffnen Sie sofort selbst.',
      },
      {
        id: '04-zustellung',
        eyebrow: 'Beleg 1: Prüfen',
        headline: 'Ein Pipeline-Erfolg ist noch keine Zustellung',
        bullets: [
          'Jede Rechnung gegen die Nachweis-API gehalten',
          'Beleg: signierte AS4-Quittung oder SMTP-Nachweis',
          'Ein Teil war trotzdem nicht zugestellt',
          'Drei eigene frühere Thesen dabei kassiert',
        ],
        anchor: {
          text: 'AS4-Empfangsquittung',
          label: 'Peppol-Nichtabstreitbarkeit',
          state: 'closed',
          note: 'Kunde unter NDA',
        },
        hook: 'Die Ursachen lagen in drei Sphären.',
      },
      {
        id: '05-rechnungsstrecke',
        eyebrow: 'Beleg 2: E-Rechnung',
        headline: 'Eine Rechnung wandert durch benannte Stationen',
        bullets: [
          'SAP entgegennehmen, nach UBL wandeln, einliefern',
          'Bricht eine Station, greift die Fehlerkette',
          'Formate hinter Ports: XRechnung, ZUGFeRD, Factur-X',
          'Zwei Eingänge, Webhook und Postfach, eine Schicht',
        ],
        anchor: {
          text: 'EN 16931',
          label: 'Peppol BIS 3.0',
          state: 'public',
        },
        hook: 'Welche BT-Nummern fehlten, steht nicht hier.',
      },
      {
        id: '06-agenten',
        eyebrow: 'Beleg 3: Agenten',
        headline: 'Die interessanten Entscheidungen sind Weglassungen',
        bullets: [
          'Verworfen: Empfängerfeld mit Validierung',
          'Verworfen: Positivliste erlaubter Empfänger',
          'Gewählt: kein Empfänger-Argument, Adresse vom Betreiber',
          'Kein Kalenderrecht: er liest nur Frei/Belegt',
        ],
        anchor: {
          text: 'A2A 1.0',
          label: 'Steckbrief live abrufbar',
          url: 'https://mboiman.bks-lab.com/.well-known/agent-card.json',
          state: 'public',
        },
        hook: 'Durchgesetzt durch Abwesenheit, nicht durch Prüfung.',
      },
      {
        id: '07-fragen-sie-ihn',
        eyebrow: 'Der Agent auf dieser Seite',
        headline: 'Fragen Sie ihn selbst',
        bullets: [
          'Welche KI-Workshops bietet BKS-Lab an?',
          'Wann hätte Michael nächste Woche Zeit?',
          'Bei Fachfragen holt er einen zweiten Agenten',
          'Eine dieser Fragen beantwortet er nicht',
        ],
        askAgent: true,
        anchor: {
          text: 'agent-card.json',
          label: 'A2A 1.0, live gelesen',
          url: 'https://mboiman.bks-lab.com/.well-known/agent-card.json',
          state: 'public',
        },
        hook: 'Welche, sagt Ihnen nur er.',
      },
      {
        id: '08-open-bridge',
        eyebrow: 'Beleg 4: Werkzeuge',
        headline: 'Der Unterbau ist offen, nicht nur beschrieben',
        bullets: [
          'Öffentliches Repo unter MIT, Stand v0.14.0',
          'Sieben Pflicht-Checks vor jedem Merge',
          'Push-Guard blockt fail-closed, aus echtem Vorfall',
          'KI-Review im CI, ohne Merge-Rechte',
        ],
        anchor: {
          text: 'bks-lab/open-bridge',
          label: 'MIT, v0.14.0',
          url: 'https://github.com/bks-lab/open-bridge',
          state: 'public',
        },
        hook: 'Reifegrad steht im Repo: N=1, selbst genutzt.',
      },
      {
        id: '09-weitergeben',
        eyebrow: 'Beleg 4: Wissen',
        headline: 'KI ist das Benzin, nicht das Produkt',
        bullets: [
          'Impulsvortrag TU Darmstadt, KI-Startup-Praktikum',
          'Entwickler-Workshop: MCP, A2A, TDD mit Assistenz',
          'Vier Workshops für ein Ingenieurbüro, abgeschlossen',
          'Dort entschieden: KI bleibt im Haus',
        ],
        anchor: {
          text: 'TU Darmstadt · 04/2026',
          label: 'geladener Impulsvortrag, Fachgebiet Wirtschaftsinformatik',
          state: 'public',
        },
        hook: 'Der Satz kam aus einer Kritik an mir.',
      },
      {
        id: '10-stationen',
        eyebrow: 'Stationen',
        headline: 'Wo ich das gelernt habe',
        bullets: [
          'Prüf- und Zertifizierungskonzern: MDR und IVDR',
          'Finanzvertrieb: QualityGates, Pact, Grafana, Playwright',
          'Konzern der Bahnbranche: Legacy-Migration unter Dauervalidierung',
          'Heute: BKS-Lab GmbH, im Team',
        ],
        anchor: {
          text: 'mboiman.github.io',
          label: 'Vollständiger Lebenslauf, ein Klick',
          url: 'https://mboiman.github.io/',
          state: 'public',
        },
        hook: 'Die Namen stehen im Lebenslauf, nicht hier.',
      },
      {
        id: '11-kontakt',
        eyebrow: 'Nächster Schritt',
        headline: 'Was Sie jetzt tun können',
        bullets: [
          'Den Agenten fragen, er nimmt Terminwünsche auf',
          'Lebenslauf lesen oder das PDF laden',
          'Das Repo öffnen und selbst nachsehen',
          'Oder direkt schreiben',
        ],
        hook: 'Eine Frage reicht. Der Rest ist Gespräch.',
      },
    ],
    storyRole: 'Quality Engineer · KI-Architekt',
    storyClosingEyebrow: 'BKS-Lab GmbH · Frankfurt am Main',
    proofPublicLabel: 'öffentlich prüfbar',
    proofClosedLabel: 'nicht öffentlich',
    agentUnavailable: 'Der Agent antwortet gerade nicht. Sein Steckbrief liegt trotzdem offen.',
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
        eyebrow: 'Stance',
        headline: 'Declared state is not verified state',
        bullets: [
          'Config says running: I ask the service',
          'Vendor says fixed: I load the spec',
          'Pipeline says success: I check the receipt',
        ],
        anchor: {
          text: 'deploy-reconciliation.md',
          label: 'Rule in the open repo',
          url: 'https://github.com/bks-lab/open-bridge/blob/main/rules/deploy-reconciliation.md',
          state: 'public',
        },
        hook: 'This page holds itself to it.',
      },
      {
        id: '02-angebot',
        eyebrow: 'Michael Boiman · BKS-Lab GmbH · Frankfurt',
        headline: 'What people bring me in for',
        bullets: [
          'Check whether a system actually delivers',
          'Run EN 16931 e-invoicing in production',
          'Build AI agents that hold outward',
          'Hand tools and knowledge to teams',
          'Open for mandates, reviews and workshops',
        ],
        anchor: {
          text: 'mboiman.github.io',
          label: 'Classic CV and PDF',
          url: 'https://mboiman.github.io/',
          state: 'public',
        },
        hook: 'Every point gets its evidence next.',
      },
      {
        id: '03-laeuft',
        eyebrow: 'Read live, today',
        headline: 'What is running',
        bullets: [
          'This agent, addressable under its own domain',
          'open-bridge, public under MIT, v0.14.0',
          'The invoicing line, in production, under NDA',
          'The MCP gateway, open to foreign clients',
        ],
        anchor: {
          text: 'agent-card.json',
          label: 'A2A 1.0, callable live',
          url: 'https://mboiman.bks-lab.com/.well-known/agent-card.json',
          state: 'public',
        },
        hook: 'Three of them you can open now.',
      },
      {
        id: '04-zustellung',
        eyebrow: 'Proof 1: verifying',
        headline: 'A pipeline success is not a delivery',
        bullets: [
          'Every invoice held against the evidence API',
          'Proof: signed AS4 receipt or SMTP record',
          'Part of it still never arrived',
          'Three earlier theses of my own dropped',
        ],
        anchor: {
          text: 'AS4-Empfangsquittung',
          label: 'Peppol non-repudiation',
          state: 'closed',
          note: 'client under NDA',
        },
        hook: 'The causes sat in three spheres.',
      },
      {
        id: '05-rechnungsstrecke',
        eyebrow: 'Proof 2: e-invoicing',
        headline: 'An invoice travels through named stations',
        bullets: [
          'Take SAP in, convert to UBL, submit',
          'A broken station triggers the fallback chain',
          'Formats behind ports: XRechnung, ZUGFeRD, Factur-X',
          'Two inbound paths, one shared SAP layer',
        ],
        anchor: {
          text: 'EN 16931',
          label: 'Peppol BIS 3.0',
          state: 'public',
        },
        hook: 'Which BT numbers were missing is not here.',
      },
      {
        id: '06-agenten',
        eyebrow: 'Proof 3: agents',
        headline: 'The interesting decisions are omissions',
        bullets: [
          'Rejected: a recipient field with validation',
          'Rejected: an allow list of recipients',
          'Chosen: no recipient argument, operator sets it',
          'No calendar rights: only free/busy pairs',
        ],
        anchor: {
          text: 'A2A 1.0',
          label: 'card callable live',
          url: 'https://mboiman.bks-lab.com/.well-known/agent-card.json',
          state: 'public',
        },
        hook: 'Enforced by absence, not by validation.',
      },
      {
        id: '07-fragen-sie-ihn',
        eyebrow: 'The agent on this page',
        headline: 'Ask him yourself',
        bullets: [
          'Which AI workshops does BKS-Lab offer?',
          'When would Michael have time next week?',
          'On domain questions he asks a second agent',
          'One of these he will not answer',
        ],
        askAgent: true,
        anchor: {
          text: 'agent-card.json',
          label: 'A2A 1.0, read live',
          url: 'https://mboiman.bks-lab.com/.well-known/agent-card.json',
          state: 'public',
        },
        hook: 'Which one, only he will tell you.',
      },
      {
        id: '08-open-bridge',
        eyebrow: 'Evidence 4: Tools',
        headline: 'The substrate is open, not just described',
        bullets: [
          'Public repo under MIT, at v0.14.0',
          'Seven required checks before any merge',
          'Push guard fails closed, from a real incident',
          'AI review in CI, without merge rights',
        ],
        anchor: {
          text: 'bks-lab/open-bridge',
          label: 'MIT, v0.14.0',
          url: 'https://github.com/bks-lab/open-bridge',
          state: 'public',
        },
        hook: 'Maturity stated in the repo: N=1, self-used.',
      },
      {
        id: '09-weitergeben',
        eyebrow: 'Evidence 4: Knowledge',
        headline: 'AI is the fuel, not the product',
        bullets: [
          'Guest lecture, TU Darmstadt AI-startup lab',
          'Developer workshop: MCP, A2A, TDD with assistance',
          'Four workshops for an engineering office, closed',
          'Their decision: AI stays in-house',
        ],
        anchor: {
          text: 'TU Darmstadt · 04/2026',
          label: 'invited guest lecture, Information Systems group',
          state: 'public',
        },
        hook: 'That sentence came from criticism of me.',
      },
      {
        id: '10-stationen',
        eyebrow: 'Stations',
        headline: 'Where this was learned',
        bullets: [
          'Testing and certification group: MDR, IVDR',
          'Financial sales network: quality gates, Pact, Playwright',
          'Rail industry group: legacy migration under continuous validation',
          'Today: BKS-Lab GmbH, in a team',
        ],
        anchor: {
          text: 'mboiman.github.io',
          label: 'Full CV, one click',
          url: 'https://mboiman.github.io/',
          state: 'public',
        },
        hook: 'The names are in the CV, not here.',
      },
      {
        id: '11-kontakt',
        eyebrow: 'Next step',
        headline: 'What you can do now',
        bullets: [
          'Ask the agent, he takes booking requests',
          'Read the CV or grab the PDF',
          'Open the repo and look yourself',
          'Or just write to me',
        ],
        hook: 'One question is enough. The rest is conversation.',
      },
    ],
    storyRole: 'Quality Engineer · AI Architect',
    storyClosingEyebrow: 'BKS-Lab GmbH · Frankfurt am Main',
    proofPublicLabel: 'publicly verifiable',
    proofClosedLabel: 'not public',
    agentUnavailable: 'The agent is not answering right now. Its profile card is public regardless.',
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

/**
 * Background images for the decision acts, keyed by `DecisionAct.id`.
 * Keyed by id rather than by title on purpose: the old version keyed on the
 * German project title, so any wording change silently dropped the image.
 */
export const darkScreenshots: Record<string, string> = {
  'e-invoicing': '/images/projects/nlpanalyse.png',
};
