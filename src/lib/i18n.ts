type Belief = { text: string; align: string };
type NumberLabel = { num: string; label: string };
type ImpactMetric = { metric: string; label: string; detail: string };

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

export interface I18nStrings {
  pdfDownload: string;
  experienceTheStory: string;
  storyBackToCv: string;
  classicCV: string;
  otherLangLabel: string;
  skipToContent: string;
  availability: string;
  numberLabels: NumberLabel[];
  impactMetrics: ImpactMetric[];
  originQuote: string;
  gammaLabels: { challenge: string; solution: string };
  beliefs: Belief[];
  experienceTitle: string;
  earlierPositions: string;
  closingLine: string;
  // Aria labels (story page)
  ariaNumbers: string;
  ariaProjects: string;
  ariaBeliefs: string;
  ariaEducation: string;
  // CV-specific
  careerIntro: string;
  talksTitle: string;
  careerDetails: string[];
  cvImpactMetrics: ImpactMetric[];
  cvFooterOtherLang: string;
  // Legal footer links (rendered site-wide: CV, story, legal pages)
  legalPrivacy: string;
  legalImpressum: string;
  truncatePatterns: string[];
  truncateToolPatterns: string[];
  // Agent chat widget
  agentWidget: AgentWidgetStrings;
}

export const i18n: Record<'de' | 'en', I18nStrings> = {
  de: {
    pdfDownload: 'PDF herunterladen',
    experienceTheStory: 'Experience the Story',
    storyBackToCv: 'Zum Lebenslauf',
    classicCV: 'Klassischer Lebenslauf',
    otherLangLabel: 'English',
    skipToContent: 'Zum Inhalt springen',
    availability: 'Freiberuflicher Quality Engineer & KI-Architekt. Verfügbar für Projekte, Architektur-Reviews und AI-Workshops.',
    numberLabels: [
      { num: '20+', label: 'Jahre Quality Engineering' },
      { num: '40+', label: 'Automatisierungen im Einsatz' },
    ],
    impactMetrics: [
      { metric: '40+', label: 'Skills', detail: 'Ökosystem, ein Hub' },
      { metric: '20+', label: 'Repos orchestriert', detail: 'über 7 Projekt-Boards' },
      { metric: 'Live', label: 'A2A-Agent', detail: 'dieser Lebenslauf antwortet selbst' },
    ],
    originQuote: 'Alles, was KI heute braucht — Verlässlichkeit, Messbarkeit, Selbstkorrektur — habe ich 20 Jahre lang in Systeme eingebaut, die noch nicht denken konnten. Als LLMs kamen, fehlte kein neuer Anfang. Es fehlte nur noch das letzte Puzzlestück.',
    gammaLabels: { challenge: 'Herausforderung', solution: 'Lösung' },
    beliefs: [
      { text: 'Wenn du 10 Tools hast\nund keine Übersicht,\nhast du null Tools.', align: 'text-left' },
      { text: 'Eine Million Kombinationen\ntestet kein Mensch.\nAber eine Maschine,\ndie nie schläft, schon.', align: 'text-center' },
      { text: 'Der beste Test ist der,\nden ein Entwickler\nnie schreiben musste.', align: 'text-right' },
      { text: 'Automatisierung ohne Messbarkeit\nist nur schnelleres Raten.', align: 'text-left' },
    ],
    experienceTitle: 'Berufserfahrung',
    earlierPositions: 'Frühere Positionen',
    closingLine: 'The impossible just takes a system that doesn\'t sleep.',
    ariaNumbers: 'Zahlen',
    ariaProjects: 'Projekte',
    ariaBeliefs: 'Überzeugungen',
    ariaEducation: 'Ausbildung',
    careerIntro: 'Quality Engineer und KI-Automatisierungsexperte mit 20+ Jahren Erfahrung in der Software-Qualitätssicherung und 4 Jahren spezialisierter KI-Entwicklung. Mein Schwerpunkt: Geschäftsprozesse durch messbare Automatisierung transformieren.',
    talksTitle: 'Vorträge & Workshops',
    careerDetails: [
      'In Enterprise-Projekten (DB Vertrieb, DVAG, TÜV Süd) habe ich Quality-Monitoring-Systeme aufgebaut, KI-gestützte Testautomatisierung eingeführt und Legacy-Migrationen mit 24/7-Validierung abgesichert.',
      'Heute verbinde ich Quality Engineering mit KI-Architektur: <strong style="color: var(--accent); font-weight: 500">MCP- und A2A-Protokolle</strong>, Multi-Agent-Systeme, E-Invoicing-Plattformen nach EU-Standard und ein <strong style="color: var(--accent); font-weight: 500">40+ Skills</strong> umfassendes Automatisierungs-Ökosystem.',
      'Dieses Wissen gebe ich weiter — in Entwickler- und Business-Workshops sowie als geladener <strong style="color: var(--accent); font-weight: 500">Impulsgeber an der TU Darmstadt</strong> — und übersetze KI-Praxis für technische wie nicht-technische Zielgruppen.',
    ],
    cvImpactMetrics: [
      { metric: '40+', label: 'Skills', detail: 'Ökosystem, ein Hub' },
      { metric: '20+', label: 'Repos orchestriert', detail: 'über 7 Projekt-Boards' },
      { metric: 'Live', label: 'A2A-Agent', detail: 'dieser Lebenslauf antwortet selbst' },
    ],
    cvFooterOtherLang: 'English',
    legalPrivacy: 'Datenschutz',
    legalImpressum: 'Impressum',
    truncatePatterns: ['Schwerpunkte', 'Key Responsibilities', 'Workshop-Inhalte', 'Präsentationsinhalte', 'Praktischer', 'Practical', 'Hauptverantwortlichkeiten', 'Projekte\\b', 'Energiesektor', 'Quantifizierbare', 'Quantifiable', 'Technische Lösungen', 'Focus areas', 'Key Focus'],
    truncateToolPatterns: ['Tools', 'Technologien', 'Technologies', 'Eingesetzte', 'Technical Stack', 'Technischer'],
    agentWidget: {
      launcherLabel: 'Mit meinem KI-Agenten chatten',
      launcherText: 'Live A2A-Agent fragen',
      headerTitle: 'KI-Agent von Michael',
      headerSubtitle: 'Fragen Sie zu Projekten, Stack und Verfügbarkeit',
      inputPlaceholder: 'Nachricht schreiben …',
      send: 'Senden',
      close: 'Schließen',
      greeting: 'Hallo, ich bin Michaels Bridge-Agent. Fragen Sie mich zu seiner Erfahrung, seinem Tech-Stack oder seiner Verfügbarkeit.',
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
      cardIntro: 'Die maschinenlesbare A2A-Visitenkarte dieses Agenten — live aus /.well-known/agent-card.json.',
      cardProtocol: 'A2A-Protokoll',
      cardEndpoint: 'Endpunkt',
      cardModes: 'Ein-/Ausgabe',
      cardSkills: 'Fähigkeiten',
      cardExamplesHint: 'Beispiel-Frage anklicken zum Starten',
      cardStreaming: 'Streaming',
      cardPush: 'Push',
      cardLoading: 'Lade Agent-Card …',
      cardUnavailable: 'Agent-Card gerade nicht erreichbar.',
      privacyNote: 'Nachrichten werden zur Beantwortung an Anthropic (Claude, USA) übermittelt; der Verlauf wird nicht dauerhaft gespeichert.',
      privacyLink: 'Datenschutz',
    },
  },
  en: {
    pdfDownload: 'Download PDF',
    experienceTheStory: 'Experience the Story',
    storyBackToCv: 'Back to CV',
    classicCV: 'Classic CV',
    otherLangLabel: 'Deutsche Version',
    skipToContent: 'Skip to content',
    availability: 'Freelance Quality Engineer & AI Architect. Available for projects, architecture reviews, and AI workshops.',
    numberLabels: [
      { num: '20+', label: 'years in Quality Engineering' },
      { num: '40+', label: 'automations in production' },
    ],
    impactMetrics: [
      { metric: '40+', label: 'Skills', detail: 'one orchestration hub' },
      { metric: '20+', label: 'Repos orchestrated', detail: 'across 7 project boards' },
      { metric: 'Live', label: 'A2A agent', detail: 'this CV answers for itself' },
    ],
    originQuote: 'Everything AI needs today — reliability, measurability, self-correction — I spent 20 years building into systems that couldn\'t yet think. When LLMs arrived, I didn\'t need a new beginning. I just needed the last puzzle piece.',
    gammaLabels: { challenge: 'Challenge', solution: 'Solution' },
    beliefs: [
      { text: 'When you have 10 tools\nand no overview,\nyou have zero tools.', align: 'text-left' },
      { text: 'A million combinations\nno human can test.\nBut a machine\nthat never sleeps, can.', align: 'text-center' },
      { text: 'The best test is the one\na developer\nnever had to write.', align: 'text-right' },
      { text: 'Automation without measurability\nis just faster guessing.', align: 'text-left' },
    ],
    experienceTitle: 'Professional Experience',
    earlierPositions: 'Earlier Positions',
    closingLine: 'The impossible just takes a system that doesn\'t sleep.',
    ariaNumbers: 'Numbers',
    ariaProjects: 'Projects',
    ariaBeliefs: 'Beliefs',
    ariaEducation: 'Education',
    careerIntro: 'Quality Engineer and AI Automation Expert with 20+ years in software quality assurance and 4 years of specialized AI development. My focus: transforming business processes through measurable automation.',
    talksTitle: 'Speaking & Workshops',
    careerDetails: [
      'In enterprise projects (DB Vertrieb, DVAG, TÜV Süd), I built quality monitoring systems, introduced AI-driven test automation, and secured legacy migrations with 24/7 validation.',
      'Today I combine quality engineering with AI architecture: <strong style="color: var(--accent); font-weight: 500">MCP and A2A protocols</strong>, multi-agent systems, e-invoicing platforms to EU standards, and a <strong style="color: var(--accent); font-weight: 500">40+ skill</strong> automation ecosystem.',
      'I also pass this knowledge on — in developer and business workshops and as an invited <strong style="color: var(--accent); font-weight: 500">guest speaker at TU Darmstadt</strong> — translating hands-on AI for technical and non-technical audiences alike.',
    ],
    cvImpactMetrics: [
      { metric: '40+', label: 'Skills', detail: 'one orchestration hub' },
      { metric: '20+', label: 'Repos orchestrated', detail: 'across 7 project boards' },
      { metric: 'Live', label: 'A2A agent', detail: 'this CV answers for itself' },
    ],
    cvFooterOtherLang: 'Deutsch',
    legalPrivacy: 'Privacy',
    legalImpressum: 'Legal Notice',
    truncatePatterns: ['Schwerpunkte', 'Key Responsibilities', 'Workshop-Inhalte', 'Workshop Content', 'Practical', 'Projekte\\b', 'Focus areas', 'Key Focus', 'Key responsibilities'],
    truncateToolPatterns: ['Tools', 'Technologien', 'Technologies', 'Technical Stack', 'Technischer'],
    agentWidget: {
      launcherLabel: 'Chat with my AI agent',
      launcherText: 'Ask the live A2A agent',
      headerTitle: "Michael's AI Agent",
      headerSubtitle: 'Ask about projects, stack, and availability',
      inputPlaceholder: 'Type a message …',
      send: 'Send',
      close: 'Close',
      greeting: "Hi, I'm Michael's Bridge agent. Ask me about his experience, his tech stack, or his availability.",
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
      cardIntro: "This agent's machine-readable A2A card — live from /.well-known/agent-card.json.",
      cardProtocol: 'A2A protocol',
      cardEndpoint: 'Endpoint',
      cardModes: 'Input/Output',
      cardSkills: 'Skills',
      cardExamplesHint: 'Click an example question to start',
      cardStreaming: 'Streaming',
      cardPush: 'Push',
      cardLoading: 'Loading agent card …',
      cardUnavailable: 'Agent card unavailable right now.',
      privacyNote: 'Messages are sent to Anthropic (Claude, USA) to generate a reply; the conversation is not stored permanently.',
      privacyLink: 'Privacy',
    },
  },
};

export const darkScreenshots: Record<string, Record<string, string>> = {
  de: {
    'Quality Dashboard - Echtzeit-Übersicht': '/images/projects/qualitydashboard.png',
    'E-Mail-Klassifizierung und -Verarbeitungsprozess': '/images/projects/nlpanalyse.png',
  },
  en: {
    'Quality Dashboard - Real-time Overview': '/images/projects/qualitydashboard.png',
    'Email Classification and Processing Workflow': '/images/projects/nlpanalyse.png',
  },
};
