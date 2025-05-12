# Präsentations-Export als PDF und PPTX

Diese Dokumentation beschreibt die verbesserte Export-Funktionalität für reveal.js Präsentationen in unserer Hugo-Website. Mit diesen neuen Tools können Sie Ihre Präsentationen sowohl als PDF als auch als PowerPoint-Datei (PPTX) exportieren.

## Funktionen

- **Verbesserter PDF-Export**: Optimierte Ausgabe mit korrektem Querformat und automatischen Seitenzahlen
- **Neuer PPTX-Export**: Umwandeln von Präsentationen in PowerPoint-Format
- **Benutzerfreundliche Oberfläche**: Einfach zu bedienender Export-Dialog
- **Optimierte Druckeinstellungen**: Automatische Voreinstellung für beste Ergebnisse
- **Browserübergreifende Kompatibilität**: Funktioniert in allen modernen Browsern

## 1. PDF-Export

### Schritte zum Export als PDF

1. Klicke auf den "Präsentation exportieren" Button in der unteren linken Ecke der Präsentation
2. Wähle die Option "PDF-Ansicht öffnen"
3. Warte bis die PDF-Ansicht vollständig geladen ist
4. Der Druckdialog öffnet sich automatisch (alternativ: Drücke STRG+P/CMD+P)
5. Stelle folgende Einstellungen im Druckdialog ein:
   - **Ziel**: Als PDF speichern
   - **Layout**: Querformat
   - **Ränder**: Keine
   - **Hintergrundgrafiken**: Aktivieren
6. Klicke auf "Speichern"

### Tipps für beste PDF-Ergebnisse

- **Google Chrome oder Microsoft Edge** verwenden für optimale Druckergebnisse
- **Vollständig laden lassen**: Stelle sicher, dass alle Ressourcen geladen sind, bevor du druckst
- **Kopf- und Fußzeilen deaktivieren**: Wähle in den erweiterten Einstellungen "Keine" bei Kopf- und Fußzeilen
- **Auf Größe prüfen**: Falls der Text zu klein erscheint, verwende die Zoom-Funktion im Browser

## 2. PPTX-Export (PowerPoint)

### Schritte zum Export als PPTX

1. Klicke auf den "Präsentation exportieren" Button in der unteren linken Ecke der Präsentation
2. Wähle die Option "Als PPTX exportieren"
3. Warte während die Folien verarbeitet werden (das kann einige Sekunden dauern)
4. Die PowerPoint-Datei wird automatisch heruntergeladen

### Hinweise zum PPTX-Export

- Die PPTX-Funktion verwendet client-seitige Technologien (html2canvas und pptxgenjs)
- Komplexe Animationen und Übergänge werden in der PowerPoint-Datei nicht unterstützt
- Interaktive Elemente werden als statische Bilder exportiert
- Die erzeugten Folien können in PowerPoint nachbearbeitet werden

## Technische Details

Die Export-Funktionen wurden mit folgenden Technologien realisiert:

- **PDF-Export**: Nutzt die native PDF-Funktionalität von reveal.js mit verbesserten CSS-Regeln für Querformat
- **PPTX-Export**: Verwendet html2canvas zum Erfassen der Folien und pptxgenjs zur Erzeugung der PowerPoint-Datei
- **Optimierte Druckstile**: Spezielle CSS-Regeln stellen sicher, dass alle Inhalte korrekt dargestellt werden
- **Seitenzahlen**: Automatische Nummerierung aller Folien für bessere Orientierung im Export

## Fehlerbehebung

### PDF-Export

- **Problem**: Leere Seiten im PDF
  **Lösung**: Stelle sicher, dass "Hintergrundgrafiken anzeigen" in den Druckeinstellungen aktiviert ist

- **Problem**: Falsche Ausrichtung (Hochformat)
  **Lösung**: Wähle explizit "Querformat" in den Druckeinstellungen

- **Problem**: Abgeschnittene Inhalte
  **Lösung**: Überprüfe die Skalierungseinstellung im Druckdialog, setze sie auf 100% oder "An Seite anpassen"

### PPTX-Export

- **Problem**: Export funktioniert nicht
  **Lösung**: Stelle sicher, dass du eine stabile Internetverbindung hast, da die Bibliotheken aus dem CDN geladen werden müssen

- **Problem**: Bilder fehlen in der PowerPoint-Datei
  **Lösung**: Bei Bildern aus externen Quellen kann es zu Cross-Origin-Problemen kommen. Verwende lokale Bilder wenn möglich.

- **Problem**: Formatierung weicht ab
  **Lösung**: Die PowerPoint-Datei ist eine Näherung des Originals - nachträgliche Anpassungen können notwendig sein

## Einschränkungen

- Animationen und Übergänge werden in beiden Exportformaten nicht unterstützt
- Interaktive Elemente und Videos funktionieren nicht im Export
- Sehr komplexe SVGs oder Canvas-Elemente können im PPTX-Export Probleme verursachen
- Externe Webfonts werden möglicherweise nicht korrekt übernommen

## Support

Bei Problemen mit dem Export-Tool wende dich an das Entwicklerteam unter support@example.com oder erstelle ein Issue im GitHub-Repository des Projekts.
