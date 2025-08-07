# Bewerbung - Maßgeschneidertes Anschreiben mit CV

Interaktiver Workflow zur Erstellung einer professionellen Bewerbung mit maßgeschneidertem Anschreiben als Deckblatt vor dem vollständigen CV.

## Workflow

Ich führe dich durch den gesamten Bewerbungsprozess für **deutsche und englische Bewerbungen**:

1. **Sprachauswahl**: Deutsche (de) oder englische (en) Bewerbung
2. **Stellenanalyse**: Analyse der Stellenausschreibung und Firmeninfos
3. **Requirement-Mapping**: Zuordnung deiner CV-Qualifikationen zu den Stellenanforderungen
4. **Anschreiben-Generierung**: Erstellung eines personalisierten Anschreibens in der gewählten Sprache
5. **PDF-Generierung**: Kombination von Anschreiben + CV zu einer professionellen Bewerbung

**Unterstützte Sprachen:**
- 🇩🇪 **Deutsch (de)**: Deutsche Bewerbung mit deutschem CV
- 🇬🇧 **Englisch (en)**: English application with English CV

## Phase 1: Datensammlung

Zuerst benötige ich von dir:

**Sprache:**
- Deutsch (de) oder Englisch (en)?

**Stellenausschreibung:**
- Bitte füge die komplette Stellenausschreibung hier ein (Text kopieren/einfügen)

**Firmeninformationen:**
- Firmenname:
- Ansprechperson (falls bekannt):
- Firmenadresse (falls bekannt):

**Zusätzliche Informationen:**
- Besondere Aspekte, die du betonen möchtest:
- Warum interessiert dich diese Position besonders:

---

## Phase 2: CV-Analyse und Requirement-Mapping

Basierend auf deiner Eingabe analysiere ich:

1. **CV-Inhalte** aus `config.cv.toml`
2. **Stellenanforderungen** aus der Ausschreibung
3. **Matching** zwischen deinen Qualifikationen und den Anforderungen

Ich erstelle ein **Requirement-Mapping**, das zeigt:
- "Sie suchen: [Anforderung]"
- "Ich biete: [Deine Qualifikation]" 
- "Siehe CV: [Seitenreferenz/Abschnitt]"

## Phase 3: Anschreiben-Generierung

Ich erstelle ein professionelles Anschreiben mit:

- **Personalisierte Anrede** (firmenbezogen)
- **Einleitung** mit Bezug zum Unternehmen
- **Requirement-Mapping Sektion** (Kernstück!)
- **Abschluss** mit Call-to-Action

Das Anschreiben wird als **erste Seite** vor deinen CV gesetzt, damit Personaler sofort sehen, wo im CV die relevanten Qualifikationen stehen.

## Phase 4: PDF-Generierung

Abschließend generiere ich:

1. **Anschreiben-PDF** mit konsistentem Design
2. **CV-PDF** (bestehende Generierung)
3. **Kombinierte Bewerbung** als finale PDF

**Output-Datei**: 
- Deutsch: `bewerbung_[firmenname].pdf`
- English: `application_[company].pdf`

---

## Beispiel Requirement-Mapping

### 🇩🇪 Deutsch
```
🎯 Ihre Anforderungen → Meine Qualifikationen

Sie suchen: "5+ Jahre Erfahrung in Quality Engineering"
→ Ich biete: 20+ Jahre QE-Expertise mit CI/CD-Integration
→ Siehe CV: Berufserfahrung, Seite 3-4

Sie suchen: "KI/ML-Kenntnisse zur Prozessautomatisierung"  
→ Ich biete: 4 Jahre spezialisierte KI-Entwicklung mit 80% Aufwandsreduktion
→ Siehe CV: AI-Kompetenzen, Seite 1 + Projekte, Seite 2
```

### 🇬🇧 English
```
🎯 Your Requirements → My Qualifications

You need: "5+ years experience in Quality Engineering"
→ I offer: 20+ years QE expertise with CI/CD integration
→ See CV: Professional Experience, Pages 3-4

You need: "AI/ML skills for process automation"
→ I offer: 4 years specialized AI development with 80% effort reduction
→ See CV: AI Competencies, Page 1 + Projects, Page 2
```

## Vorteile dieses Ansatzes

- **Personaler-freundlich**: Sofortiger Überblick, wo relevante Qualifikationen im CV stehen
- **Maßgeschneidert**: Jede Bewerbung perfekt auf die Stelle abgestimmt  
- **Zeiteffizient**: Professionelle Bewerbung in Minuten statt Stunden
- **Konsistentes Design**: Anschreiben und CV im gleichen Layout
- **Erhöhte Erfolgsquote**: Direkte Zuordnung steigert Relevanz

---

---

## Technische Details

**Direkte Script-Verwendung:**

```bash
# Deutsche Bewerbung
./scripts/generate_application.sh config.cv.toml bewerbung_firma.pdf de cover_letter_data.json

# English Application  
./scripts/generate_application.sh config.cv.toml application_company.pdf en cover_letter_data_en.json
```

**Automatische Sprach-Features:**
- ✅ CV-Content in gewählter Sprache (aus config.cv.toml)
- ✅ Template-Lokalisierung
- ✅ Anschreiben-Struktur angepasst
- ✅ Requirement-Mapping in der Zielsprache

---

**Bereit zu beginnen? Teile die Stellenausschreibung mit mir und sag mir die gewünschte Sprache (de/en)!**