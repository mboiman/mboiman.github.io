#!/bin/bash

# Testskript für die PDF-Export-Funktionalität

echo "PDF-Export-Funktionalitätstest"
echo "============================"

# Verzeichnisse prüfen
echo "Prüfe erforderliche Dateien und Verzeichnisse..."

# CSS-Datei
if [ -f "./static/assets/css/presentation-print.css" ]; then
  echo "✓ presentation-print.css gefunden"
else
  echo "✗ presentation-print.css nicht gefunden!"
fi

# JS-Bundle
if [ -f "./static/assets/js/build/presentation-pdf-bundle.js" ]; then
  echo "✓ presentation-pdf-bundle.js gefunden"
else
  echo "✗ presentation-pdf-bundle.js nicht gefunden!"
fi

# Partials
if [ -f "./themes/my-hugo-orbit-theme/layouts/partials/reveal-hugo/pdf-script.html" ]; then
  echo "✓ pdf-script.html gefunden"
else
  echo "✗ pdf-script.html nicht gefunden!"
fi

if [ -f "./themes/my-hugo-orbit-theme/layouts/partials/reveal-hugo/pdf-export.html" ]; then
  echo "✓ pdf-export.html gefunden"
else
  echo "✗ pdf-export.html nicht gefunden!"
fi

# Layouts
if [ -f "./themes/my-hugo-orbit-theme/layouts/_default/pdf-export.html" ]; then
  echo "✓ pdf-export.html Layout gefunden"
else
  echo "✗ pdf-export.html Layout nicht gefunden!"
fi

if [ -f "./themes/my-hugo-orbit-theme/layouts/_default/pdf-output.html" ]; then
  echo "✓ pdf-output.html Layout gefunden"
else
  echo "✗ pdf-output.html Layout nicht gefunden!"
fi

# Demo-Inhalte
if [ -f "./content/pdf-demo.md" ]; then
  echo "✓ pdf-demo.md gefunden"
else
  echo "✗ pdf-demo.md nicht gefunden!"
fi

if [ -f "./content/pdf-export.md" ]; then
  echo "✓ pdf-export.md gefunden"
else
  echo "✗ pdf-export.md nicht gefunden!"
fi

# Button-Test
echo ""
echo "Prüfe PDF-Download Button in end.html..."
if grep -q "PDF herunterladen" "./themes/my-hugo-orbit-theme/layouts/partials/reveal-hugo/end.html"; then
  echo "✓ PDF-Download-Button gefunden"
else
  echo "✗ PDF-Download-Button nicht gefunden!"
fi

# CSS-Überprüfung
echo ""
echo "Prüfe wichtige CSS-Regeln..."
if grep -q "@media print" "./static/assets/css/presentation-print.css"; then
  echo "✓ @media print CSS-Regeln gefunden"
else
  echo "✗ @media print CSS-Regeln nicht gefunden!"
fi

if grep -q ".reveal .slides section" "./static/assets/css/presentation-print.css"; then
  echo "✓ Folien-CSS-Regeln gefunden"
else
  echo "✗ Folien-CSS-Regeln nicht gefunden!"
fi

# JS-Funktionalität
echo ""
echo "Prüfe PDF-Export-JavaScript-Funktionalität..."
if grep -q "isPrintPDF" "./static/assets/js/build/presentation-pdf-bundle.js"; then
  echo "✓ PDF-Erkennung gefunden"
else
  echo "✗ PDF-Erkennung nicht gefunden!"
fi

if grep -q "addSlideNumbers" "./static/assets/js/build/presentation-pdf-bundle.js"; then
  echo "✓ Slide-Nummerierung gefunden"
else
  echo "✗ Slide-Nummerierung nicht gefunden!"
fi

# Zusammenfassung
echo ""
echo "Test abgeschlossen!"
echo "Manuelle Tests:"
echo "1. Öffne die Demo-Präsentation unter /pdf-demo/"
echo "2. Klicke auf den PDF-Download-Button"
echo "3. Prüfe, ob der Druckdialog erscheint"
echo "4. Prüfe, ob die PDF-Ausgabe korrekt formatiert ist"
