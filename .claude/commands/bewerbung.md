---
command: "/bewerbung"
category: "Business & Professional"
purpose: "Generate personalized German job application with cover letter and CV"
wave-enabled: false
performance-profile: "standard"
---

# /bewerbung - Professionelle Deutsche Bewerbung

Generiert eine maßgeschneiderte deutsche Bewerbung mit personalisiertem Anschreiben und vollständigem CV.

## Überblick

Dieser Command automatisiert die Erstellung einer vollständigen deutschen Bewerbung mit **Interactive Review Mode**:

1. **Stellenanalyse**: Extraktion der Kernanforderungen aus der Stellenausschreibung
2. **CV-Analyse**: Identifikation relevanter Qualifikationen aus dem bestehenden CV
3. **Requirement-Mapping**: Direkte Zuordnung zwischen Stellenanforderungen und CV-Qualifikationen
4. **📝 Interactive Review**: Anschreiben-Vorschau mit Bestätigung vor PDF-Erstellung
5. **Anschreiben-Generierung**: Personalisiertes deutsches Anschreiben mit Requirement-Mapping
6. **PDF-Generierung**: Kombination von Anschreiben + CV zu einer professionellen Bewerbung

## Interactive Review Features

- ✅ **Volltext-Vorschau**: Komplettes Anschreiben vor PDF-Generierung
- ✅ **Requirement-Check**: Übersicht aller gemappten Anforderungen
- ✅ **Benutzer-Bestätigung**: "Sieht gut aus? Soll ich die PDF erstellen?"
- ✅ **Änderungsmöglichkeit**: Option zur Anpassung vor finaler Erstellung
- ✅ **CV-Hinweis**: Automatischer Anhang-Verweis im Anschreiben

## Syntax

```bash
/bewerbung [Stellenausschreibung-Text]
```

## Workflow

### Phase 1: Stellenanalyse
- Automatische Extraktion von Kernanforderungen
- Identifikation von Must-have vs. Nice-to-have Skills
- Erkennung von Firmendaten und Ansprechpersonen

### Phase 2: Requirement-Mapping
- Zuordnung CV-Qualifikationen zu Stellenanforderungen
- "Sie suchen → Ich biete → Siehe CV"-Format
- Präzise CV-Referenzen mit Seitenzahlen

### Phase 3: Interactive Review
- **Volltext-Vorschau**: Komplettes Anschreiben wird angezeigt
- **Requirement-Check**: Übersicht aller 6-8 gemappten Anforderungen
- **User-Dialog**: "Sieht das Anschreiben gut aus? Soll ich die PDF erstellen?"
- **Änderungsoptionen**: Bei Bedarf Anpassungen vor PDF-Generierung

### Phase 4: Anschreiben-Generierung
- Personalisierte Anrede und Firmenadresse  
- Strukturiertes Requirement-Mapping als Kernstück
- Professioneller Abschluss mit Kontaktdaten
- **CV-Hinweis**: Automatischer "📎 Anlage: Vollständiger Lebenslauf..." 

### Phase 5: PDF-Erstellung  
- Anschreiben als erste Seite (mit CV-Verweis)
- Vollständiger CV dahinter
- Konsistentes Design und Layout

## Features

- ✅ **Interactive Review Mode**: Volltext-Vorschau vor PDF-Erstellung
- ✅ **Automatische Stellenanalyse**: KI-basierte Extraktion der Kernanforderungen
- ✅ **CV-Integration**: Verwendet bestehende `config.cv.toml` Konfiguration
- ✅ **Requirement-Mapping**: Direkte Zuordnung mit CV-Referenzen
- ✅ **Personalisierung**: Firmenspezifische Anpassung
- ✅ **CV-Anhang-Hinweis**: Automatischer Verweis auf beigefügten Lebenslauf
- ✅ **Professionelles Layout**: PDF mit konsistentem Design
- ✅ **Deutsche Bewerbungsstandards**: Vollständige DIN 5008 Konformität

## Output

**Datei**: `bewerbung_[firmenname].pdf`

**Inhalt**:
1. Personalisiertes Anschreiben (1 Seite)
2. Vollständiger CV (8-9 Seiten)
3. Gesamt: ~10 Seiten professionelle Bewerbung

## Technische Details

**Scripts**: 
- `scripts/generate_application.sh` - Master-Script
- `scripts/application_to_pdf.js` - PDF-Generierung
- `templates/cover-letter.html` - Anschreiben-Template

**Dependencies**:
- Hugo (CV-Generierung)
- Node.js + Puppeteer (PDF-Erstellung)
- Sharp (Bildkompression)

## Interactive Workflow Beispiel

### Eingabe:
```bash
/bewerbung "Stellenausschreibung: Senior Quality Engineer bei ACME Corp..."
```

### Ablauf:
1. **Analyse**: "Ich analysiere die Stellenausschreibung von ACME Corp..."
2. **Mapping**: Requirement-Mapping wird erstellt und angezeigt
3. **Vorschau**: Vollständiges Anschreiben wird präsentiert
4. **Dialog**: "📝 **Sieht das Anschreiben gut aus? Soll ich die PDF erstellen?**"
5. **User-Feedback**: Bestätigung oder Änderungswünsche
6. **PDF-Erstellung**: Bei Bestätigung wird `bewerbung_acme.pdf` generiert

### Ergebnis:
**Datei**: `bewerbung_acme.pdf` mit:
- Anschreiben mit direktem Requirement-Mapping (+ CV-Anhang-Hinweis)
- Vollständiger CV mit Projektdetails  
- Professionelles Layout und Design

## Interactive Review Prompts

**Standard Dialog nach Anschreiben-Generierung**:
```
📝 **Anschreiben-Vorschau für [Firmenname]:**

[Vollständiges Anschreiben mit Requirement-Mapping]

---
🎯 **Requirement-Coverage**: [X/Y] Anforderungen gemappt
📎 **CV-Anhang**: Automatischer Hinweis eingefügt
✅ **Personalisierung**: [Firmenname] & [Ansprechperson] 

**Sieht das Anschreiben gut aus? Soll ich die PDF erstellen?**
- ✅ "Ja, sieht perfekt aus!" → PDF wird generiert
- ✏️ "Kleine Änderungen nötig..." → Anpassungen möglich
- 🔄 "Neu erstellen mit anderen Schwerpunkten" → Überarbeitung
```

## Best Practices

1. **Interactive Review nutzen**: Immer Vorschau checken vor PDF-Erstellung
2. **Vollständige Stellenausschreibung**: Je detaillierter, desto präziser das Mapping
3. **Firmendaten**: Ansprechperson und Firmenadresse für Personalisierung
4. **Aktuelle CV-Daten**: `config.cv.toml` vor Bewerbung aktualisieren
5. **Mehrere Varianten**: Verschiedene Schwerpunkte für unterschiedliche Positionen

## Erfolgsmetriken

- **Interactive Review**: 100% Vorschau vor Erstellung
- **Requirement-Coverage**: ~95% der Anforderungen abgedeckt
- **CV-Referenzen**: Präzise Verweise mit Seitenzahlen
- **Personalisierung**: 100% firmenspezifisch  
- **CV-Anhang-Hinweis**: Automatisch in jeder Bewerbung
- **Professionelle Standards**: DIN 5008 konform

## Learnings & Optimierungen (2025-08)

### JSON-Format für Cover Letter
**Problem**: Script-Error durch falsche JSON-Struktur  
**Lösung**: Korrektes Format für `application_to_pdf.js`:
```json
{
  "language": "de",
  "company": "[Firmenname]",
  "address": "[Stadt/Adresse]", 
  "contactPerson": "[Ansprechperson]",
  "position": "[Stellentitel]",
  "requirements": [
    {
      "requirement": "🎯 [Anforderung]",
      "response": "[CV-Match Beschreibung]",
      "cvReference": ""
    }
  ],
  "signOff": "Mit freundlichen Grüßen\n\n[Name]"
}
```

### Firmenname-Generierung  
**Problem**: Hardcoded "wematch" im Dateinamen  
**Lösung**: Dynamische Dateinamen basierend auf Firmennamen
- `cover_letter_[firmenname_slug].json`
- `bewerbung_[firmenname_slug].pdf`

### Script-Parameter
**Korrekte Syntax**: `./scripts/generate_application.sh <config> <output.pdf> <language> <cover_letter.json>`
- Alle 4 Parameter sind erforderlich
- Language Parameter: "de" oder "en"

### Formatierung-Fix

**Problem**: Fehlende Zeilenumbrüche im Abschluss ("Mit freundlichen GrüßenMichael Boiman")  
**Lösung**: 
- JSON: `"signOff": "Mit freundlichen Grüßen\n\n[Name]"` (doppelter Zeilenumbruch)
- Script: `application_to_pdf.js` korrigiert um `\n` → `<br>` Konvertierung

### Performance-Optimierungen
- ✅ Automatische Bildkompression (99%+ Reduktion)  
- ✅ 10-Seiten-PDF in <30 Sekunden
- ✅ Parallele PDF-Generierung (Anschreiben + CV)

### Workflow-Verbesserungen
1. **TodoWrite für Tracking**: 6-Phasen-Workflow mit Status-Updates
2. **Interactive Review**: User-Bestätigung vor PDF-Generierung  
3. **Requirement-Mapping**: Strukturierte Anforderungs-Zuordnung
4. **Error Recovery**: Robuste JSON-Parsing und File-Handling
