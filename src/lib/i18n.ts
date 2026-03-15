type Belief = { text: string; align: string };
type NumberLabel = { num: string; label: string };
type ImpactMetric = { metric: string; label: string; detail: string };

export interface I18nStrings {
  pdfDownload: string;
  experienceTheStory: string;
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
  careerDetails: string[];
  cvImpactMetrics: ImpactMetric[];
  cvFooterOtherLang: string;
  truncatePatterns: string[];
  truncateToolPatterns: string[];
}

export const i18n: Record<'de' | 'en', I18nStrings> = {
  de: {
    pdfDownload: 'PDF herunterladen',
    experienceTheStory: 'Experience the Story',
    classicCV: 'Klassischer Lebenslauf',
    otherLangLabel: 'English',
    skipToContent: 'Zum Inhalt springen',
    availability: 'Freiberuflicher Quality Engineer & KI-Architekt. Verfügbar für Projekte, Architektur-Reviews und AI-Workshops.',
    numberLabels: [
      { num: '20+', label: 'Jahre Quality Engineering' },
      { num: '40+', label: 'Automatisierungen im Einsatz' },
    ],
    impactMetrics: [
      { metric: '-80%', label: 'Rückfragen', detail: 'durch Quality-Monitoring' },
      { metric: '96%', label: 'Qualität', detail: 'nach Migration (vorher 30%)' },
      { metric: '80%', label: 'auto-generiert', detail: 'KI-gestützte Tests' },
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
    careerDetails: [
      'In Enterprise-Projekten (DB Vertrieb, DVAG, TÜV Süd) habe ich Quality-Monitoring-Systeme aufgebaut, KI-gestützte Testautomatisierung eingeführt und Legacy-Migrationen mit 24/7-Validierung abgesichert.',
      'Heute verbinde ich Quality Engineering mit KI-Architektur: <strong style="color: var(--accent); font-weight: 500">MCP- und A2A-Protokolle</strong>, Multi-Agent-Systeme, E-Invoicing-Plattformen nach EU-Standard und ein <strong style="color: var(--accent); font-weight: 500">40+ Skills</strong> umfassendes Automatisierungs-Ökosystem.',
    ],
    cvImpactMetrics: [
      { metric: '-80%', label: 'Rückfragen', detail: 'durch Quality-Monitoring' },
      { metric: '96%', label: 'Qualität', detail: 'nach Migration (vorher 30%)' },
      { metric: '80%', label: 'auto-generiert', detail: 'KI-gestützte Test-Cases' },
    ],
    cvFooterOtherLang: 'English',
    truncatePatterns: ['Schwerpunkte', 'Key Responsibilities', 'Workshop-Inhalte', 'Präsentationsinhalte', 'Praktischer', 'Practical', 'Hauptverantwortlichkeiten', 'Projekte\\b', 'Energiesektor', 'Quantifizierbare', 'Quantifiable', 'Technische Lösungen', 'Focus areas', 'Key Focus'],
    truncateToolPatterns: ['Tools', 'Technologien', 'Technologies', 'Eingesetzte', 'Technical Stack', 'Technischer'],
  },
  en: {
    pdfDownload: 'Download PDF',
    experienceTheStory: 'Experience the Story',
    classicCV: 'Classic CV',
    otherLangLabel: 'Deutsche Version',
    skipToContent: 'Skip to content',
    availability: 'Freelance Quality Engineer & AI Architect. Available for projects, architecture reviews, and AI workshops.',
    numberLabels: [
      { num: '20+', label: 'years in Quality Engineering' },
      { num: '40+', label: 'automations in production' },
    ],
    impactMetrics: [
      { metric: '-80%', label: 'Inquiries', detail: 'through quality monitoring' },
      { metric: '96%', label: 'Quality', detail: 'after migration (was 30%)' },
      { metric: '80%', label: 'Auto-generated', detail: 'AI-driven tests' },
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
    careerDetails: [
      'In enterprise projects (DB Vertrieb, DVAG, TÜV Süd), I built quality monitoring systems, introduced AI-driven test automation, and secured legacy migrations with 24/7 validation.',
      'Today I combine quality engineering with AI architecture: <strong style="color: var(--accent); font-weight: 500">MCP and A2A protocols</strong>, multi-agent systems, e-invoicing platforms to EU standards, and a <strong style="color: var(--accent); font-weight: 500">40+ skill</strong> automation ecosystem.',
    ],
    cvImpactMetrics: [
      { metric: '-80%', label: 'Inquiries', detail: 'through quality monitoring' },
      { metric: '96%', label: 'Quality', detail: 'after migration (was 30%)' },
      { metric: '80%', label: 'Auto-generated', detail: 'AI-driven test cases' },
    ],
    cvFooterOtherLang: 'Deutsch',
    truncatePatterns: ['Schwerpunkte', 'Key Responsibilities', 'Workshop-Inhalte', 'Workshop Content', 'Practical', 'Projekte\\b', 'Focus areas', 'Key Focus', 'Key responsibilities'],
    truncateToolPatterns: ['Tools', 'Technologien', 'Technologies', 'Technical Stack', 'Technischer'],
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
