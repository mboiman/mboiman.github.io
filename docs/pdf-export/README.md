# PDF-Export Dokumentation

## Überblick

Die PDF-Export-Funktionalität für Präsentationen mit reveal.js in Hugo wurde verbessert, um Popup-Blocker-Probleme zu umgehen und eine benutzerfreundlichere Oberfläche zu bieten.

## Funktionen

- **Popup-Blocker-resistente Lösung**: Umgeht Browser-Popup-Blocker durch verschiedene Export-Optionen
- **Zwei Export-Modi**:
  1. Direktes Öffnen der Druckversion im aktuellen Fenster
  2. Eingebettete Vorschau mit Druckoption
- **Verbesserte Benutzerführung**: Detaillierte Anweisungen für optimale Druckergebnisse
- **Optimierte Druckstile**: Verbesserte CSS-Styles für hochwertige PDF-Exporte

## Technische Details

### Dateien

1. **PDF-Export-Skript**: `/static/assets/js/build/pdf-export-solution.js`

   - Enthält die Hauptlogik für den PDF-Export
   - Behandelt verschiedene Export-Modi
   - Bietet Benutzerführung und Fehlermeldungen

2. **CSS-Styles**: `/static/assets/css/pdf-export-ui.css` und `/static/assets/css/presentation-print.css`

   - UI-Elemente für den Export-Dialog
   - Optimierte Druckstyles für PDF-Export

3. **Button-Integration**: `/themes/my-hugo-orbit-theme/layouts/partials/reveal-hugo/end.html`

   - Fügt den "PDF herunterladen" Button zur Präsentation hinzu

4. **Script-Einbindung**: `/themes/my-hugo-orbit-theme/layouts/partials/reveal-hugo/pdf-script.html`
   - Bindet die notwendigen Skripte in jede Präsentation ein

### Funktionsweise

1. Der Benutzer klickt auf den "PDF herunterladen" Button
2. Ein Dialog erscheint mit zwei Optionen:
   - **Druckansicht öffnen**: Öffnet die Druckversion im aktuellen Fenster
   - **In Vorschau öffnen**: Zeigt eine eingebettete Vorschau mit Druckoption
3. Der Benutzer folgt den Anweisungen für den Druck
4. Das resultierende PDF enthält optimierte Formatierungen, Seitenzahlen und mehr

## Verwendung für Redakteure

1. Erstellen Sie eine Präsentation wie gewohnt mit dem reveal-hugo-Theme
2. Der "PDF herunterladen" Button wird automatisch hinzugefügt
3. Testen Sie den Export, indem Sie auf den Button klicken
4. Folgen Sie den Anweisungen im Dialog

## Beispiele

- Testpräsentation: `/content/de/slides/pdf-optimiert.md`
- Diagnoseseite: `/content/de/slides/pdf-diagnose.md`

## Bekannte Einschränkungen

- Komplexe Animationen werden im PDF nicht angezeigt
- Druckqualität hängt vom Browser-Renderer ab
- Große Präsentationen können bei manchen Browsern Leistungsprobleme verursachen

## Problembehandlung

- **Der Druck startet nicht automatisch**: Verwenden Sie den manuellen "Druckdialog öffnen" Button
- **Bilder fehlen im PDF**: Stellen Sie sicher, dass "Hintergrundgrafiken" in den Druckeinstellungen aktiviert ist
- **Seitenzahlen fehlen**: Überprüfen Sie die CSS-Klasse `.page-number` in presentation-print.css
