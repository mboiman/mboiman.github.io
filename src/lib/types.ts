export interface ContactItem {
  class: string;
  icon: string;
  url: string;
  title: string;
}

export interface EducationItem {
  degree: string;
  college?: string;
  dates: string;
}

export interface LanguageItem {
  language: string;
  level: string;
}

export interface ExperienceItem {
  position: string;
  dates: string;
  company: string;
  details: string;
  /** Stable slug for agent-driven scroll+highlight. Single source of truth in
   *  config.cv.toml; rendered as id="exp-<anchor>" + data-cv-anchor. */
  anchor?: string;
}

export interface ProjectItem {
  title: string;
  url?: string;
  tech_stack: string[];
  category: string;
  featured: boolean;
  screenshot?: string;
  tagline: string;
  challenge?: string;
  solution?: string;
  impact?: string;
  /** Stable slug for agent-driven scroll+highlight (featured projects). See ExperienceItem.anchor. */
  anchor?: string;
}
// NOTE: `metric` / `metric_label` were removed on 2026-08-07. They fed the giant
// number beside each act on the presentation, and their presence also *selected*
// the layout there (`challenge && metric`), so a project without a number fell
// back to a raw markdown dump next to a designed act. The presentation now renders
// from `i18n.decisions`, and the visual anchor is a verifiable identifier, never a
// counter. Do not reintroduce these fields.

export interface AgentProof {
  eyebrow: string;
  headline: string;
  text: string;
  status: string;
  card: string;
  endpoint: string;
  ask: string;
  promptTitle: string;
  prompts: string[];
  facts: string[];
}

export interface UIStrings {
  tagline: string;
  /** Rendered on the presentation's portrait act; was hardcoded in StoryPage.astro. */
  location?: string;
  ai_badge: string;
  ai_skills_title: string;
  contact_label: string;
  linkedin_label: string;
  github_label: string;
  pdf_download: string;
  sidebar_skills_title: string;
  sidebar_qualifications_title: string;
  sidebar_skills: string[];
  application_subject_prefix: string;
  requirements_mapping_title: string;
  attachment_label: string;
}

export interface CVData {
  ui: UIStrings;
  agent_proof: AgentProof;
  /** `avatar_story` is the portrait used by the presentation; `avatar` stays the CV one. */
  profile: { name: string; tagline: string; avatar: string; avatar_story?: string };
  contact: { enable: boolean; list: ContactItem[] };
  education: { enable: boolean; title: string; list: EducationItem[] };
  language: { enable: boolean; title: string; list: LanguageItem[] };
  summary: { enable: boolean; icon: string; title: string; summary: string };
  experiences: { enable: boolean; icon: string; title: string; list: ExperienceItem[] };
  projects: { enable: boolean; icon: string; title: string; intro: string; list: ProjectItem[] };
}

// Absichtlich NICHT hier: `skills`, `ai_showcase`, `footer`. Alle drei standen als
// Pflichtfelder in CVData, ohne dass config.cv.toml sie (noch) trug: footer und
// ai_showcase waren längst gelöscht, skills wurde am 2026-08-22 gelöscht, weil
// nichts es rendert. Ein Pflichtfeld für Daten, die es nicht gibt, ist eine
// Behauptung über die Config, keine Beschreibung.
