import fs from 'node:fs';
import path from 'node:path';
import toml from 'toml';
import type { CVData } from './types';

let _parsed: Record<string, any> | undefined;

function parseConfig(): Record<string, any> {
  if (_parsed) return _parsed;
  const configPath = path.join(process.cwd(), 'config.cv.toml');
  const raw = fs.readFileSync(configPath, 'utf-8');
  _parsed = toml.parse(raw);
  return _parsed!;
}

export function getCVData(lang: 'de' | 'en'): CVData {
  const config = parseConfig();
  return config.languages[lang].params as CVData;
}

export function getSiteConfig() {
  const config = parseConfig();
  return {
    baseurl: config.baseurl as string,
    title: config.title as string,
    defaultLanguage: config.defaultContentLanguage as string,
  };
}
