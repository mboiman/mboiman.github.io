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
  // Story page hero / closing
  storyEyebrow: string;
  storyStatement: string;
  storyRole: string;
  storyClosingEyebrow: string;
  // Aria labels (story page)
  ariaNumbers: string;
  ariaProjects: string;
  ariaBeliefs: string;
  ariaEducation: string;
  ariaStatement: string;
  ariaProfile: string;
  ariaContact: string;
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
  showAllProjects: string;
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
    availability: 'Freiberuflicher Quality Engineer & KI-Architekt. Verfügbar für QE- und Testautomatisierungs-Projekte, KI-Architektur und AI-Workshops.',
    numberLabels: [
      { num: '20+', label: 'Jahre Quality Engineering' },
      { num: '40+', label: 'Automatisierungen im Einsatz' },
    ],
    impactMetrics: [
      { metric: '40+', label: 'Skills', detail: 'Ökosystem, ein Hub' },
      { metric: '20+', label: 'Repos orchestriert', detail: 'über 7 Projekt-Boards' },
      { metric: 'Live', label: 'KI-Agent', detail: 'dieser Lebenslauf antwortet selbst' },
    ],
    originQuote: 'Was KI heute braucht — Verlässlichkeit, Messbarkeit, Selbstkorrektur — baue ich seit zwei Jahrzehnten in Systeme, mit und ohne KI. Quality Engineering und KI-Architektur laufen bei mir parallel — jeder Strang macht den anderen besser.',
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
    storyEyebrow: 'Quality Engineer · KI-Architekt · System Thinker',
    storyStatement: `Auf die,<br>die das <em class="italic" style="color: var(--accent)">Unmögliche<br class="sm:hidden"> automatisieren.</em>`,
    storyRole: 'Quality Engineer · KI-Architekt',
    storyClosingEyebrow: 'BKS-Lab — AI Engineering · Frankfurt am Main',
    ariaNumbers: 'Zahlen',
    ariaProjects: 'Projekte',
    ariaBeliefs: 'Überzeugungen',
    ariaEducation: 'Ausbildung',
    ariaStatement: 'Leitsatz',
    ariaProfile: 'Profil',
    ariaContact: 'Kontakt',
    careerIntro: 'Quality Engineer und KI-Automatisierungsexperte mit 20+ Jahren Erfahrung in der Software-Qualitätssicherung und 4 Jahren spezialisierter KI-Entwicklung. Mein Schwerpunkt: Geschäftsprozesse durch messbare Automatisierung transformieren.',
    talksTitle: 'Vorträge & Workshops',
    careerDetails: [
      'In Enterprise-Projekten (DB Vertrieb, DVAG, TÜV Süd) habe ich an Quality-Monitoring, KI-gestützter Testautomatisierung und mit 24/7-Validierung abgesicherten Legacy-Migrationen mitgewirkt.',
      'Heute verbinde ich Quality Engineering mit KI-Architektur: <strong style="color: var(--accent); font-weight: 500">MCP- und A2A-Protokolle</strong>, Multi-Agent-Systeme und E-Invoicing-Plattformen nach EU-Standard — gebündelt in einem Automatisierungs-Ökosystem, das ein <strong style="color: var(--accent); font-weight: 500">Orchestrierungs-Hub</strong> über 20+ Repositories, Agenten und Protokolle koordiniert. Einer dieser Agenten beantwortet diesen Lebenslauf live.',
      'Dieses Wissen gebe ich weiter — in Entwickler- und Business-Workshops sowie als geladener <strong style="color: var(--accent); font-weight: 500">Impulsgeber an der TU Darmstadt</strong> — und übersetze KI-Praxis für technische wie nicht-technische Zielgruppen.',
    ],
    cvImpactMetrics: [
      { metric: '40+', label: 'Skills', detail: 'Ökosystem, ein Hub' },
      { metric: '20+', label: 'Repos orchestriert', detail: 'über 7 Projekt-Boards' },
      { metric: 'Live', label: 'KI-Agent', detail: 'dieser Lebenslauf antwortet selbst' },
    ],
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
      cardIntro: 'Der maschinenlesbare Steckbrief dieses Agenten nach dem offenen A2A-Standard (Agent-to-Agent) — live aus /.well-known/agent-card.json.',
      cardProtocol: 'A2A-Protokoll',
      cardEndpoint: 'Endpunkt',
      cardModes: 'Ein-/Ausgabe',
      cardSkills: 'Fähigkeiten',
      cardExamplesHint: 'Beispiel-Frage anklicken zum Starten',
      cardStreaming: 'Streaming',
      cardPush: 'Push',
      cardLoading: 'Lade Agent-Card …',
      cardUnavailable: 'Agent-Card gerade nicht erreichbar.',
      privacyNote: 'Wir speichern den Verlauf nicht — bitte keine vertraulichen Daten eingeben.',
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
    availability: 'Freelance Quality Engineer & AI Architect. Available for QE and test-automation projects, AI architecture, and AI workshops.',
    numberLabels: [
      { num: '20+', label: 'years in Quality Engineering' },
      { num: '40+', label: 'automations in production' },
    ],
    impactMetrics: [
      { metric: '40+', label: 'Skills', detail: 'one orchestration hub' },
      { metric: '20+', label: 'Repos orchestrated', detail: 'across 7 project boards' },
      { metric: 'Live', label: 'AI agent', detail: 'this CV answers for itself' },
    ],
    originQuote: 'Everything AI needs today — reliability, measurability, self-correction — I have been building into systems for two decades, with and without AI. Quality engineering and AI architecture run in parallel for me — each makes the other better.',
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
    storyEyebrow: 'Quality Engineer · AI Architect · System Thinker',
    storyStatement: `Here's to the ones<br>who <em class="italic" style="color: var(--accent)">automate<br class="sm:hidden"> the impossible.</em>`,
    storyRole: 'Quality Engineer · AI Architect',
    storyClosingEyebrow: 'BKS-Lab — AI Engineering · Frankfurt am Main',
    ariaNumbers: 'Numbers',
    ariaProjects: 'Projects',
    ariaBeliefs: 'Beliefs',
    ariaEducation: 'Education',
    ariaStatement: 'Statement',
    ariaProfile: 'Profile',
    ariaContact: 'Contact',
    careerIntro: 'Quality Engineer and AI Automation Expert with 20+ years in software quality assurance and 4 years of specialized AI development. My focus: transforming business processes through measurable automation.',
    talksTitle: 'Speaking & Workshops',
    careerDetails: [
      'In enterprise projects (DB Vertrieb, DVAG, TÜV Süd) I worked on quality monitoring, AI-driven test automation, and legacy migrations secured by 24/7 validation.',
      'Today I combine quality engineering with AI architecture: <strong style="color: var(--accent); font-weight: 500">MCP and A2A protocols</strong>, multi-agent systems and e-invoicing platforms to EU standards — bundled into an automation ecosystem that an <strong style="color: var(--accent); font-weight: 500">orchestration hub</strong> runs across 20+ repositories, agents and protocols. One of those agents answers this very CV, live.',
      'I also pass this knowledge on — in developer and business workshops and as an invited <strong style="color: var(--accent); font-weight: 500">guest speaker at TU Darmstadt</strong> — translating hands-on AI for technical and non-technical audiences alike.',
    ],
    cvImpactMetrics: [
      { metric: '40+', label: 'Skills', detail: 'one orchestration hub' },
      { metric: '20+', label: 'Repos orchestrated', detail: 'across 7 project boards' },
      { metric: 'Live', label: 'AI agent', detail: 'this CV answers for itself' },
    ],
    cvFooterOtherLang: 'Deutsch',
    legalPrivacy: 'Privacy',
    legalImpressum: 'Legal Notice',
    truncatePatterns: ['Schwerpunkte', 'Key Responsibilities', 'Workshop-Inhalte', 'Workshop Content', 'Practical', 'Projekte\\b', 'Focus areas', 'Key Focus', 'Key responsibilities', 'Presentation content'],
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
      cardIntro: "This agent's machine-readable profile card, built to the open A2A (agent-to-agent) standard — live from /.well-known/agent-card.json.",
      cardProtocol: 'A2A protocol',
      cardEndpoint: 'Endpoint',
      cardModes: 'Input/Output',
      cardSkills: 'Skills',
      cardExamplesHint: 'Click an example question to start',
      cardStreaming: 'Streaming',
      cardPush: 'Push',
      cardLoading: 'Loading agent card …',
      cardUnavailable: 'Agent card unavailable right now.',
      privacyNote: "We don't store the conversation — please don't enter confidential data.",
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
