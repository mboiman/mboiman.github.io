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

export interface AIShowcaseItem {
  name: string;
  description: string;
}

export interface ExperienceItem {
  position: string;
  dates: string;
  company: string;
  details: string;
}

export interface ProjectItem {
  title: string;
  url?: string;
  tech_stack: string[];
  category: string;
  featured: boolean;
  screenshot?: string;
  tagline: string;
}

export interface SkillItem {
  skill: string;
}

export interface UIStrings {
  tagline: string;
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
  ai_showcase: { enable: boolean; list: AIShowcaseItem[] };
  profile: { name: string; tagline: string; avatar: string };
  contact: { enable: boolean; list: ContactItem[] };
  education: { enable: boolean; title: string; list: EducationItem[] };
  language: { enable: boolean; title: string; list: LanguageItem[] };
  summary: { enable: boolean; icon: string; title: string; summary: string };
  experiences: { enable: boolean; icon: string; title: string; list: ExperienceItem[] };
  projects: { enable: boolean; icon: string; title: string; intro: string; list: ProjectItem[] };
  skills: { enable: boolean; icon: string; title: string; list: SkillItem[] };
  footer: {
    copyright: string;
    license_title: string;
    license_text: string;
    license_link: string;
    license_link_text: string;
    attribution_format: string;
    attribution_link: string;
    attribution_hint: string;
  };
}
