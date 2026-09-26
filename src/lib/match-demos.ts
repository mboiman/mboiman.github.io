/**
 * Example projects for the project match, so the page can be tried without a
 * posting at hand. Invented postings, no real client: they stand for the three
 * kinds of request Michael gets, and one of them is meant to fit only in part,
 * so the page shows gaps as plainly as matches.
 *
 * The Jev answers for these texts are measured once and stored in
 * src/data/match/demo-<id>.<lang>.json (scripts/jev-measure.mjs). Changing a
 * text here without measuring again fails test/match.test.mjs, because the
 * replay would show answers to questions nobody asked.
 */
import type { Lang } from './match';

export interface Demo { id: string; title: Record<Lang, string>; teaser: Record<Lang, string>; text: Record<Lang, string> }

export const DEMOS: Demo[] = [
  {
    id: 'portal-testautomation',
    title: { de: 'KI-gestützte Testautomatisierung', en: 'AI-assisted test automation' },
    teaser: { de: 'Kundenportal eines Energieversorgers, 6 Monate, remote', en: 'Customer portal of a utility, 6 months, remote' },
    text: {
      de: `Freelance: Senior Test Automation Engineer (m/w/d) mit KI-Schwerpunkt
Energieversorger, Kundenportal, Start ab sofort, 6 Monate, überwiegend remote

Ihre Aufgaben:
- Aufbau einer End-to-End-Testautomatisierung mit Playwright und TypeScript für unser Kundenportal
- Automatisierte API-Tests für die REST-Schnittstellen zu Abrechnung und Vertragsverwaltung
- Integration der Testläufe in Azure DevOps Pipelines, inklusive Berichten für das Team
- Einsatz von KI zur Erzeugung und Pflege von Testfällen aus Anforderungen
- Analyse von Testfehlschlägen und Incidents, auch mit Unterstützung durch LLMs
- Coaching des Entwicklungsteams in Teststrategie und Testpyramide

Ihr Profil:
- Mindestens 5 Jahre Erfahrung in der Testautomatisierung von Webanwendungen
- Sehr gute Kenntnisse in Playwright oder vergleichbaren Frameworks
- Erfahrung mit CI/CD, idealerweise Azure DevOps
- Praktische Erfahrung mit LLMs in der Qualitätssicherung
- Kenntnisse in Lasttests sind ein Plus
- Sehr gute Deutschkenntnisse`,
      en: `Freelance: Senior Test Automation Engineer with an AI focus
Utility company, customer portal, start now, 6 months, mostly remote

Your tasks:
- Build end-to-end test automation with Playwright and TypeScript for our customer portal
- Automated API tests for the REST interfaces to billing and contract management
- Integrate the test runs into Azure DevOps pipelines, including reports for the team
- Use AI to generate and maintain test cases from requirements
- Analyse test failures and incidents, also with the help of LLMs
- Coach the development team on test strategy and the test pyramid

Your profile:
- At least 5 years of experience automating tests for web applications
- Very good knowledge of Playwright or comparable frameworks
- Experience with CI/CD, ideally Azure DevOps
- Hands-on experience with LLMs in quality assurance
- Load testing skills are a plus
- Very good German`,
    },
  },
  {
    id: 'agent-platform',
    title: { de: 'Agentenplattform mit MCP', en: 'Agent platform with MCP' },
    teaser: { de: 'Versicherer, interne KI-Assistenten, 9 Monate, hybrid', en: 'Insurer, internal AI assistants, 9 months, hybrid' },
    text: {
      de: `Projekt: KI-Architekt für eine interne Agentenplattform (m/w/d)
Versicherung, Fachbereich Schaden, 9 Monate, hybrid in Frankfurt

Aufgaben:
- Konzeption einer Plattform, auf der mehrere KI-Agenten Fachaufgaben übernehmen
- Anbindung interner Systeme über das Model Context Protocol (MCP)
- Kommunikation zwischen Agenten über A2A oder vergleichbare Protokolle
- Retrieval über interne Dokumente (RAG) mit nachvollziehbaren Quellen
- Aufbau von Evaluierung und Tests für Agentenantworten
- Betrieb auf Azure mit Monitoring und Protokollierung
- Workshops mit Fachbereich und IT zur Einführung

Anforderungen:
- Nachweisbare Projekte mit LLMs in Produktion
- Erfahrung mit Agenten-Frameworks und Tool-Anbindung
- Sehr gute Python-Kenntnisse
- Erfahrung mit Azure
- Kenntnisse der Versicherungsbranche wünschenswert`,
      en: `Project: AI architect for an internal agent platform
Insurer, claims department, 9 months, hybrid in Frankfurt

Tasks:
- Design a platform on which several AI agents take over business tasks
- Connect internal systems through the Model Context Protocol (MCP)
- Agent-to-agent communication via A2A or comparable protocols
- Retrieval over internal documents (RAG) with traceable sources
- Build evaluation and tests for agent answers
- Run it on Azure with monitoring and logging
- Workshops with the business unit and IT for the rollout

Requirements:
- Proven projects with LLMs in production
- Experience with agent frameworks and tool integration
- Very good Python skills
- Experience with Azure
- Knowledge of the insurance industry is desirable`,
    },
  },
  {
    id: 'sap-testmanagement',
    title: { de: 'Testmanagement SAP S/4HANA', en: 'SAP S/4HANA test management' },
    teaser: { de: 'Handelskonzern, Migration, 12 Monate, vor Ort', en: 'Retail group, migration, 12 months, on site' },
    text: {
      de: `Testmanager SAP S/4HANA Migration (m/w/d)
Handelskonzern, Umstellung von SAP ECC auf S/4HANA, 12 Monate, vor Ort in Düsseldorf

Ihre Aufgaben:
- Verantwortung für Teststrategie und Testplanung der Migration
- Steuerung der Integrationstests und der fachlichen Abnahmetests mit den Fachbereichen
- Fehlermanagement und Reporting an die Projektleitung
- Einführung von Testautomatisierung für SAP-Prozesse mit Tricentis Tosca
- Absicherung der Datenmigration durch Abgleiche zwischen Alt- und Neusystem

Ihr Profil:
- Mehrjährige Erfahrung als Testmanager in SAP-Projekten
- Fundierte Kenntnisse in SAP S/4HANA, idealerweise SD und MM
- Erfahrung mit Tricentis Tosca
- ISTQB-Zertifizierung
- Erfahrung in der Führung von Testteams
- Verhandlungssicheres Deutsch`,
      en: `Test manager for an SAP S/4HANA migration
Retail group, move from SAP ECC to S/4HANA, 12 months, on site in Düsseldorf

Your tasks:
- Own the test strategy and test planning of the migration
- Steer the integration tests and the user acceptance tests with the business units
- Defect management and reporting to the project management
- Introduce test automation for SAP processes with Tricentis Tosca
- Safeguard the data migration by reconciling the old and the new system

Your profile:
- Several years of experience as a test manager in SAP projects
- Solid knowledge of SAP S/4HANA, ideally SD and MM
- Experience with Tricentis Tosca
- ISTQB certification
- Experience leading test teams
- Business fluent German`,
    },
  },
];
