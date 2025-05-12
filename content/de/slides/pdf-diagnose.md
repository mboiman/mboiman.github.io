+++
title = "PDF-Export-Diagnose"
outputs = ["Reveal"]
+++

# PDF-Export-Diagnose

Diese Präsentation hilft bei der Fehlersuche für den PDF-Export.

---

## Test 1: Button-Funktionalität

- Klicken Sie auf den PDF-Download-Button unten links
- Öffnen Sie die Browserkonsole (F12) und prüfen Sie die Log-Meldungen
- Der Button sollte ein neues Fenster mit dem Parameter `?print-pdf` öffnen

---

## Test 2: PDF-Stylesheet-Erkennung

```javascript
// Prüfung der PDF-Stylesheets
var possiblePaths = [
  "/reveal-js/dist/print/pdf.css",
  "/reveal-js/css/print/pdf.css",
  "/reveal-js/print/pdf.css",
];

possiblePaths.forEach(function (path) {
  var xhr = new XMLHttpRequest();
  xhr.open("HEAD", path, false);
  try {
    xhr.send();
    console.log(
      path + ": " + (xhr.status === 200 ? "GEFUNDEN" : "NICHT GEFUNDEN")
    );
  } catch (e) {
    console.log(path + ": FEHLER: " + e);
  }
});
```

---

## Test 3: Reveal.js-Version

- Diese Seite verwendet Reveal.js für Präsentationen
- Die PDF-Export-Funktion ist abhängig von der korrekten Reveal.js-Version
- Aktuelle Version ist in der Browserkonsole sichtbar

```javascript
if (typeof Reveal !== "undefined") {
  console.log("Reveal.js Version: " + Reveal.VERSION);
} else {
  console.log("Reveal.js nicht geladen!");
}
```

---

## Test 4: PDF-Druck-Simulation

- Klicken Sie auf den Button zum Drucken
- Die Seite sollte für den Druck formatiert werden
- Alle Folien sollten einzeln druckbar sein

<button onclick="window.print();" style="padding: 10px 20px; background-color: #42A8C0; color: white; border: none; border-radius: 5px; cursor: pointer;">Druck simulieren</button>

---

## Test 5: URL-Parameter-Test

<div id="url-param-result" style="margin: 20px; padding: 15px; border: 1px solid #ddd; background: #f8f8f8;"></div>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    var urlParams = new URLSearchParams(window.location.search);
    var resultDiv = document.getElementById('url-param-result');
    resultDiv.innerHTML = '<strong>Aktuelle URL-Parameter:</strong><br>';
    
    if (urlParams.toString()) {
      resultDiv.innerHTML += urlParams.toString().replace(/&/g, '<br>');
    } else {
      resultDiv.innerHTML += 'Keine Parameter gefunden';
    }
    
    if (urlParams.has('print-pdf')) {
      resultDiv.innerHTML += '<br><br><span style="color: green;">✓ print-pdf Parameter erkannt!</span>';
    }
  });
</script>
