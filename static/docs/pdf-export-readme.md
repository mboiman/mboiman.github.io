# PDF-Export für Präsentationen

Dies ist eine verbesserte PDF-Export-Funktionalität für Ihre Hugo-Website mit reveal-hugo Präsentationen.

## Funktionen

- **PDF-Download-Button**: Ein schön gestalteter Button in jeder Präsentation zum Herunterladen als PDF
- **Optimierte PDF-Layout**: Speziell angepasste Stylesheets für bessere Druckausgabe
- **Verbesserte Seitenzahlen**: Automatische Nummerierung der Folien im PDF
- **Hilfreiche Anweisungen**: Informationen zum korrekten Export als PDF
- **Optimiert für Browser**: Funktioniert in allen modernen Browsern

## Verwendung für Besucher

1. Klicken Sie auf den "PDF herunterladen" Button in der unteren linken Ecke einer Präsentation
2. Warten Sie, bis der Druckdialog erscheint
3. Wählen Sie die Option "Als PDF speichern" oder "In PDF drucken"
4. **Wichtig**: Aktivieren Sie die Option "Hintergrundgrafiken" unter den erweiterten Druckeinstellungen
5. Klicken Sie auf "Speichern" oder "Drucken"

## Tipps für beste Ergebnisse

- **Querformat wählen**: Präsentationen sind für Querformat optimiert
- **Keine Kopf-/Fußzeilen**: Deaktivieren Sie Kopf- und Fußzeilen im Druckdialog
- **Hintergrundgrafiken aktivieren**: Wichtig für die korrekte Anzeige von Folien mit Hintergründen
- **Gesamte Präsentation drucken**: Wählen Sie "Alle Seiten" im Druckdialog

## Technische Details

Diese Implementierung nutzt die PDF-Export-Funktionalität von reveal.js, erweitert mit benutzerdefinierten Skripten:

- Optimiertes CSS für Druckmedien
- Automatische Generierung von Foliennummern
- Verbesserte Bildoptimierung für PDFs
- Automatische Erkennung des PDF-Export-Modus

## Browser-Unterstützung

- **Chrome/Edge**: Volle Unterstützung, beste Ergebnisse
- **Firefox**: Gute Unterstützung, aktivieren Sie "Hintergrundfarben drucken"
- **Safari**: Grundsätzliche Unterstützung

## Anpassung

Der PDF-Export-Stil kann durch Bearbeitung der folgenden Dateien angepasst werden:

- `/static/assets/css/presentation-print.css` - Druck-Stylesheets
- `/static/assets/js/build/presentation-pdf-bundle.js` - JavaScript für den PDF-Export
- `/themes/my-hugo-orbit-theme/layouts/partials/reveal-hugo/end.html` - Button-Darstellung

## Bekannte Einschränkungen

- Animation werden im PDF nicht unterstützt
- Komplexe Hintergründe können je nach Browser-Einstellungen anders aussehen
- Interaktive Elemente sind im PDF nicht funktional

## Fehlerbehebung

Falls der PDF-Export nicht wie erwartet funktioniert:

1. Stellen Sie sicher, dass Sie "Hintergrundgrafiken" aktiviert haben
2. Prüfen Sie, ob Ihre Browser-Zoom-Einstellung auf 100% steht
3. Versuchen Sie einen anderen Browser (Chrome bietet die beste Unterstützung)
