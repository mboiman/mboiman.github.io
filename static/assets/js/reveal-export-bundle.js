/**
 * Hauptpaket für PDF- und PPTX-Export von reveal.js Präsentationen
 * Kombiniert beide Export-Funktionen in einer Datei
 * v1.1.0
 */
(function () {
  "use strict";

  // Logger-Funktion
  function log(message, type = "info") {
    const prefix = "[Export-Tool]";
    if (type === "error") {
      console.error(`${prefix} ERROR: ${message}`);
    } else if (type === "warn") {
      console.warn(`${prefix} WARN: ${message}`);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }

  // Hauptfunktion zur Initialisierung des Export-Tools
  window.initExportTool = function () {
    log("Export-Tool wird initialisiert...");

    // Prüfe, ob wir im PDF-Export-Modus sind
    if (isPrintPdfMode()) {
      log("PDF-Export-Modus erkannt");
      prepareForPrinting();
    } else {
      log("Normaler Ansichtsmodus");
      setupExportButton();
    }

    // Event-Listener für Reveal ready event
    if (typeof Reveal !== "undefined") {
      Reveal.addEventListener("ready", function () {
        if (isPrintPdfMode()) {
          log("Reveal.js bereit, optimiere für PDF-Export...");
          optimizeRevealForPrint();
        }
      });
    }
  };

  // Prüfen, ob wir im PDF-Export-Modus sind
  function isPrintPdfMode() {
    return !!window.location.search.match(/print-pdf/gi);
  }

  // Export-Button einrichten oder erstellen
  function setupExportButton() {
    var exportButton = document.querySelector(
      ".pdf-download-button, .export-button"
    );
    if (!exportButton) {
      log("Kein Export-Button gefunden, erstelle einen neuen", "warn");
      createExportButton();
      return;
    }

    log("Export-Button gefunden, füge Event-Handler hinzu");
    // Wichtig: stopPropagation um sicherzustellen dass der Klick nicht von Reveal abgefangen wird
    exportButton.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      handleExportButtonClick(e);
      return false;
    });
  }

  // Falls kein Button existiert, einen erstellen
  function createExportButton() {
    var button = document.createElement("div");
    button.className = "export-button";
    button.innerHTML =
      '<i class="fas fa-file-export"></i> Präsentation exportieren';
    button.style.cssText =
      "position: fixed; bottom: 20px; left: 20px; background-color: rgba(0,0,0,0.6); color: white; padding: 10px 15px; border-radius: 5px; cursor: pointer; z-index: 9999; font-size: 14px; display: flex; align-items: center; gap: 8px;";

    document.body.appendChild(button);
    // Wichtig: stopPropagation um sicherzustellen dass der Klick nicht von Reveal abgefangen wird
    button.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      handleExportButtonClick(e);
      return false;
    });
  }

  // Handler für den Export-Button-Klick
  function handleExportButtonClick(e) {
    e.preventDefault();
    e.stopPropagation();

    // Aktuelle URL und PDF URL vorbereiten
    var currentUrl = window.location.href;
    var pdfUrl =
      currentUrl + (currentUrl.indexOf("?") >= 0 ? "&" : "?") + "print-pdf";

    // URL im Session Storage speichern für Zurück-Button
    try {
      sessionStorage.setItem("returnUrl", currentUrl);
    } catch (e) {
      log("Konnte returnUrl nicht in sessionStorage speichern", "warn");
    }

    // Export-Dialog anzeigen
    showExportDialog(pdfUrl);

    return false;
  }

  // Zeige verbesserten Dialog mit Export-Optionen
  function showExportDialog(pdfUrl) {
    // Dialog-Container erstellen
    var dialogContainer = document.createElement("div");
    dialogContainer.id = "export-dialog";
    dialogContainer.className = "export-dialog";
    dialogContainer.style.position = "fixed";
    dialogContainer.style.top = "0";
    dialogContainer.style.left = "0";
    dialogContainer.style.width = "100%";
    dialogContainer.style.height = "100%";
    dialogContainer.style.backgroundColor = "rgba(0,0,0,0.8)";
    dialogContainer.style.zIndex = "9999";
    dialogContainer.style.display = "flex";
    dialogContainer.style.justifyContent = "center";
    dialogContainer.style.alignItems = "center";
    // Wichtig: stopPropagation für Events im Dialog
    dialogContainer.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    // Dialog-Content erstellen
    var dialog = document.createElement("div");
    dialog.className = "export-dialog-content";
    dialog.style.backgroundColor = "#fff";
    dialog.style.borderRadius = "8px";
    dialog.style.padding = "30px";
    dialog.style.maxWidth = "650px";
    dialog.style.width = "90%";
    dialog.style.color = "#333";
    dialog.style.textAlign = "left";
    dialog.style.boxShadow = "0 10px 25px rgba(0,0,0,0.5)";
    // Wichtig: stopPropagation für Events im Dialog
    dialog.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    // Dialog-Inhalt mit verbesserter Anleitung
    dialog.innerHTML = `
      <h2 style="margin-top: 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Präsentation exportieren</h2>
      
      <div style="display: flex; gap: 20px; margin: 20px 0; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 240px; background-color: #f5f5f5; padding: 20px; border-radius: 5px; border-left: 4px solid #42a8c0;">
          <h3 style="margin-top: 0; font-size: 18px;"><i class="fas fa-file-pdf" style="color: #e74c3c; margin-right: 8px;"></i>PDF Export</h3>
          <ol style="margin-left: 10px; padding-left: 15px;">
            <li style="margin-bottom: 8px;">Klicken Sie auf "PDF-Ansicht öffnen"</li>
            <li style="margin-bottom: 8px;">Drücken Sie <strong>STRG+P</strong> (oder <strong>CMD+P</strong>)</li>
            <li style="margin-bottom: 8px;">Wählen Sie "PDF" als Ziel</li>
            <li style="margin-bottom: 8px;"><strong>Wichtig:</strong> Stellen Sie folgende Optionen ein:
              <ul style="margin-top: 5px; font-size: 13px;">
                <li>Querformat</li>
                <li>Keine Ränder/Kopf-/Fußzeilen</li>
                <li>Hintergrundgrafiken aktivieren</li>
              </ul>
            </li>
          </ol>
          <button id="open-pdf-view" style="width: 100%; padding: 10px; margin-top: 15px; background-color: #42a8c0; color: white; border: none; border-radius: 4px; cursor: pointer; pointer-events: auto;">PDF-Ansicht öffnen</button>
        </div>
        
        <div style="flex: 1; min-width: 240px; background-color: #f5f5f5; padding: 20px; border-radius: 5px; border-left: 4px solid #5cb85c;">
          <h3 style="margin-top: 0; font-size: 18px;"><i class="fas fa-file-powerpoint" style="color: #f39c12; margin-right: 8px;"></i>PPTX Export</h3>
          <p>Exportieren Sie als PowerPoint-Präsentation:</p>
          <ol style="margin-left: 10px; padding-left: 15px;">
            <li style="margin-bottom: 8px;">Klicken Sie auf "Als PPTX exportieren"</li>
            <li style="margin-bottom: 8px;">Die Konvertierung startet automatisch</li>
            <li style="margin-bottom: 8px;">Laden Sie die fertige PPTX-Datei herunter</li>
          </ol>
          <button id="export-pptx" style="width: 100%; padding: 10px; margin-top: 15px; background-color: #5cb85c; color: white; border: none; border-radius: 4px; cursor: pointer; pointer-events: auto;">Als PPTX exportieren</button>
        </div>
      </div>
      
      <div style="margin-top: 25px; background-color: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #6c757d;">
        <h4 style="margin-top: 0; font-size: 16px;"><i class="fas fa-info-circle" style="margin-right: 8px;"></i>Hinweise:</h4>
        <ul style="margin: 10px 0 15px; padding-left: 20px; font-size: 14px;">
          <li>Der PDF-Export funktioniert am besten in Chrome oder Edge</li>
          <li>Animationen werden im Export nicht unterstützt</li>
          <li>Für präzise Formatierung immer die empfohlenen Einstellungen verwenden</li>
        </ul>
        <button id="close-export-dialog" style="padding: 8px 15px; background-color: #f0f0f0; border: none; border-radius: 4px; cursor: pointer; pointer-events: auto;">Abbrechen</button>
      </div>`;

    // Dialog zur Seite hinzufügen
    dialogContainer.appendChild(dialog);
    document.body.appendChild(dialogContainer);

    // Event-Listener für Buttons
    var pdfButton = document.getElementById("open-pdf-view");
    pdfButton.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      // Direkt zur PDF-Ansicht navigieren
      window.location.href = pdfUrl;
    });

    var pptxButton = document.getElementById("export-pptx");
    pptxButton.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      // PPTX-Export starten
      handlePptxExport();
    });

    var closeButton = document.getElementById("close-export-dialog");
    closeButton.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      document.body.removeChild(dialogContainer);
    });
  }

  // Handler für PPTX-Export - Prüft, ob die PPTX-Export-Bibliothek geladen ist und führt den Export durch
  function handlePptxExport() {
    log("PPTX-Export angefordert");

    // Lade erforderliche Bibliotheken
    loadPptxDependencies()
      .then(function () {
        log("PPTX-Abhängigkeiten geladen");
        if (typeof window.pptxExport === "function") {
          // Wenn die Funktion existiert, führe sie aus
          window.pptxExport();
        } else {
          // Andernfalls zeige Notbehelf-Dialog
          showPptxAlternativeDialog();
        }
      })
      .catch(function (error) {
        log("Fehler beim Laden der PPTX-Abhängigkeiten: " + error, "error");
        showPptxAlternativeDialog();
      });
  }

  // Lädt PPTX-Export-Abhängigkeiten
  function loadPptxDependencies() {
    return new Promise(function (resolve, reject) {
      // Prüfe, ob html2canvas bereits geladen ist
      var html2canvasLoaded = typeof window.html2canvas !== "undefined";
      var pptxgenjsLoaded = typeof window.pptxgen !== "undefined";

      if (html2canvasLoaded && pptxgenjsLoaded) {
        resolve();
        return;
      }

      // Lade html2canvas
      if (!html2canvasLoaded) {
        var html2canvasScript = document.createElement("script");
        html2canvasScript.src =
          "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
        html2canvasScript.onload = checkDependencies;
        html2canvasScript.onerror = function () {
          reject("Fehler beim Laden von html2canvas");
        };
        document.head.appendChild(html2canvasScript);
      }

      // Lade pptxgenjs
      if (!pptxgenjsLoaded) {
        var pptxScript = document.createElement("script");
        pptxScript.src =
          "https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js";
        pptxScript.onload = checkDependencies;
        pptxScript.onerror = function () {
          reject("Fehler beim Laden von pptxgenjs");
        };
        document.head.appendChild(pptxScript);
      }

      // PPTX-Export-Skript laden
      var pptxExportScript = document.createElement("script");
      pptxExportScript.src = "/assets/js/reveal-pptx-export.js";
      pptxExportScript.onload = checkDependencies;
      pptxExportScript.onerror = function () {
        reject("Fehler beim Laden des PPTX-Export-Skripts");
      };
      document.head.appendChild(pptxExportScript);

      var dependenciesLoaded = 0;
      var totalDependencies = !html2canvasLoaded + !pptxgenjsLoaded + 1; // +1 für das Export-Skript

      function checkDependencies() {
        dependenciesLoaded++;
        if (dependenciesLoaded >= totalDependencies) {
          resolve();
        }
      }
    });
  }

  // Zeigt einen alternativen Dialog für PPTX-Export, wenn die Bibliotheken nicht geladen werden konnten
  function showPptxAlternativeDialog() {
    var infoContainer = document.createElement("div");
    infoContainer.id = "pptx-info-dialog";
    infoContainer.style.position = "fixed";
    infoContainer.style.top = "0";
    infoContainer.style.left = "0";
    infoContainer.style.width = "100%";
    infoContainer.style.height = "100%";
    infoContainer.style.backgroundColor = "rgba(0,0,0,0.8)";
    infoContainer.style.zIndex = "10000";
    infoContainer.style.display = "flex";
    infoContainer.style.justifyContent = "center";
    infoContainer.style.alignItems = "center";

    var infoContent = document.createElement("div");
    infoContent.style.backgroundColor = "#fff";
    infoContent.style.borderRadius = "8px";
    infoContent.style.padding = "30px";
    infoContent.style.maxWidth = "500px";
    infoContent.style.width = "90%";

    infoContent.innerHTML = `
      <h3 style="margin-top: 0; color: #333;">PPTX-Export-Funktion</h3>
      <p>Die PPTX-Exportfunktion benötigt zusätzliche JavaScript-Bibliotheken:</p>
      <ul>
        <li>html2canvas - zum Aufnehmen der Folien</li>
        <li>pptxgenjs - zum Erstellen der PowerPoint-Datei</li>
      </ul>
      <p>Für eine vollständige Integration müssen diese Bibliotheken in die Seite eingebunden werden.</p>
      <p>Alternativ können Sie:</p>
      <ol>
        <li>Zuerst ein PDF erstellen und dieses dann mit einem Online-Dienst in PPTX konvertieren</li>
        <li>Screenshots der Folien machen und manuell in PowerPoint einfügen</li>
      </ol>
      <div style="text-align: center; margin-top: 20px;">
        <button id="close-pptx-info" style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">OK</button>
      </div>
    `;

    infoContainer.appendChild(infoContent);
    document.body.appendChild(infoContainer);

    document
      .getElementById("close-pptx-info")
      .addEventListener("click", function () {
        document.body.removeChild(infoContainer);
      });
  }

  // Vorbereitung für den PDF-Druck
  function prepareForPrinting() {
    log("Bereite Präsentation für optimierten Druck vor");

    // Zurück-Button einfügen
    addBackButton();

    // Optimierte Druckstile laden
    loadPrintStyles();

    // Seitennummern hinzufügen
    addPageNumbersToPrint();

    // Hilfe-Dialog für Druckeinstellungen anzeigen
    showPrintHelp();

    // Automatischen Druckdialog öffnen nach kurzer Verzögerung
    setTimeout(function () {
      window.print();
    }, 1500);
  }

  // Zurück-Button hinzufügen
  function addBackButton() {
    var returnUrl = null;
    try {
      returnUrl = sessionStorage.getItem("returnUrl");
    } catch (e) {
      log("Konnte returnUrl nicht aus sessionStorage laden", "warn");
    }

    if (!returnUrl) {
      returnUrl = window.location.href.replace(/[?&]print-pdf/gi, "");
    }

    var backButton = document.createElement("div");
    backButton.style.position = "fixed";
    backButton.style.top = "10px";
    backButton.style.left = "10px";
    backButton.style.zIndex = "9999";
    backButton.style.backgroundColor = "rgba(0,0,0,0.6)";
    backButton.style.color = "#fff";
    backButton.style.padding = "10px 15px";
    backButton.style.borderRadius = "5px";
    backButton.style.cursor = "pointer";
    backButton.style.fontSize = "14px";
    backButton.style.display = "flex";
    backButton.style.alignItems = "center";
    backButton.style.gap = "8px";
    backButton.innerHTML =
      '<i class="fas fa-arrow-left"></i> Zurück zur Präsentation';

    backButton.addEventListener("click", function () {
      window.location.href = returnUrl;
    });

    document.body.appendChild(backButton);
  }

  // Hilfe-Dialog für Druckeinstellungen
  function showPrintHelp() {
    var printHelpDialog = document.createElement("div");
    printHelpDialog.style.position = "fixed";
    printHelpDialog.style.top = "10px";
    printHelpDialog.style.right = "10px";
    printHelpDialog.style.backgroundColor = "rgba(0,0,0,0.6)";
    printHelpDialog.style.color = "#fff";
    printHelpDialog.style.padding = "15px";
    printHelpDialog.style.borderRadius = "5px";
    printHelpDialog.style.maxWidth = "320px";
    printHelpDialog.style.fontSize = "14px";
    printHelpDialog.style.zIndex = "9999";

    printHelpDialog.innerHTML = `
      <div style="margin-bottom: 15px; font-weight: bold; display: flex; align-items: center; gap: 8px;">
        <i class="fas fa-print"></i> Optimierte Druckeinstellungen:
      </div>
      <div style="margin-bottom: 10px;">
        <ul style="margin: 5px 0; padding-left: 20px; line-height: 1.6;">
          <li><strong>Format:</strong> Querformat</li>
          <li><strong>Ziel:</strong> Als PDF speichern</li>
          <li><strong>Ränder:</strong> Keine</li>
          <li><strong>Optionen:</strong> Hintergrundgrafiken aktivieren</li>
        </ul>
      </div>
      <button id="open-print-dialog" style="width: 100%; padding: 8px; background-color: #42a8c0; color: white; border: none; border-radius: 4px; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px;">
        <i class="fas fa-print"></i> Druckdialog öffnen
      </button>
    `;

    document.body.appendChild(printHelpDialog);

    // Druckdialog-Button
    document
      .getElementById("open-print-dialog")
      .addEventListener("click", function () {
        window.print();
      });
  }

  // Lädt CSS-Styles für den Druck
  function loadPrintStyles() {
    // Standard-PDF-Stylesheet von Reveal.js laden
    var revealPdfStylesheet = document.createElement("link");
    revealPdfStylesheet.rel = "stylesheet";
    revealPdfStylesheet.type = "text/css";

    // Versuche verschiedene mögliche Pfade
    var possiblePaths = [
      "/reveal-js/dist/print/pdf.css",
      "/reveal-js/plugin/print-pdf/pdf.css",
      "/reveal-js/css/print/pdf.css",
    ];

    for (var i = 0; i < possiblePaths.length; i++) {
      var xhr = new XMLHttpRequest();
      xhr.open("HEAD", possiblePaths[i], false);
      try {
        xhr.send();
        if (xhr.status === 200) {
          revealPdfStylesheet.href = possiblePaths[i];
          break;
        }
      } catch (e) {
        // Ignoriere Fehler und versuche nächsten Pfad
      }
    }

    if (!revealPdfStylesheet.href) {
      log("Kein Standard-Reveal.js PDF-Stylesheet gefunden", "warn");
    } else {
      document.head.appendChild(revealPdfStylesheet);
    }

    // Unser verbessertes PDF-Stylesheet laden
    var improvedPrintStylesheet = document.createElement("link");
    improvedPrintStylesheet.rel = "stylesheet";
    improvedPrintStylesheet.type = "text/css";
    improvedPrintStylesheet.href = "/assets/css/improved-print.css";
    document.head.appendChild(improvedPrintStylesheet);

    // Benutzerdefinierte Inline-Styles für kritische Druckoptimierungen
    var printStyle = document.createElement("style");
    printStyle.textContent = `
      @media print {
        @page {
          size: landscape;
          margin: 0;
        }
        
        .reveal .slides > section {
          position: relative !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          min-height: 100% !important;
          transform: none !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        
        .reveal .slide-background {
          transform: none !important;
          background-size: cover !important;
        }
        
        .reveal .controls,
        .reveal .progress,
        .export-dialog,
        #export-dialog {
          display: none !important;
        }
        
        /* Verbesserte Seitenzahlen für den Druck */
        .slide-page-number {
          display: block !important;
          position: absolute !important;
          bottom: 10px !important;
          right: 20px !important;
          font-size: 14px !important;
          color: #555 !important;
          background-color: rgba(255,255,255,0.8) !important;
          padding: 3px 8px !important;
          border-radius: 4px !important;
          z-index: 2000 !important;
        }
      }
    `;
    document.head.appendChild(printStyle);
  }

  // Fügt Seitennummern zu allen Folien für den Druck hinzu
  function addPageNumbersToPrint() {
    setTimeout(function () {
      var slides = document.querySelectorAll(
        ".reveal .slides > section, .reveal .slides > section > section"
      );
      var totalSlides = slides.length;

      slides.forEach(function (slide, index) {
        slide.setAttribute("data-slide-num", index + 1);
        slide.setAttribute("data-total-slides", totalSlides);

        var pageNumber = document.createElement("div");
        pageNumber.className = "slide-page-number";
        pageNumber.textContent = "Seite " + (index + 1) + " von " + totalSlides;

        // Seitenzähler einfügen
        slide.appendChild(pageNumber);

        // Folie für Druck optimieren
        slide.classList.add("print-optimized");
      });
    }, 1000);
  }

  // Optimiert Reveal.js spezifisch für den Print
  function optimizeRevealForPrint() {
    if (typeof Reveal === "undefined") return;

    log("Optimiere Reveal.js für den Druck...");

    // Reveal-Konfiguration für PDF-Export anpassen
    try {
      // PDF maximale Höhe für eine Folie setzen, um mehrseitige Folien zu unterstützen
      Reveal.configure({
        pdfMaxPagesPerSlide: 1, // Bei Bedarf auf höheren Wert setzen für mehrseitige Folien
        pdfSeparateFragments: false, // Alle Fragmente auf einer Seite anzeigen
        center: true, // Zentrierte Inhalte
        margin: 0, // Kein Rand
      });
      log("Reveal.js für PDF-Export konfiguriert");
    } catch (e) {
      log("Fehler bei der Reveal.js-Konfiguration: " + e, "warn");
    }

    // WICHTIG: Page-Setup und Orientierung erzwingen
    var styleElement = document.createElement("style");
    styleElement.textContent = `
      @page {
        size: landscape !important;
        margin: 0 !important;
      }
      
      @media print {
        html, body {
          width: 100% !important;
          height: 100% !important;
          overflow: hidden !important;
        }
        
        .reveal .slides section {
          transform: none !important;
          min-height: 100% !important;
          width: 100% !important;
          height: 100% !important;
          page-break-before: always !important;
          page-break-after: always !important;
          page-break-inside: avoid !important;
          display: block !important;
        }
      }
    `;
    document.head.appendChild(styleElement);

    // Alle Fragmente zeigen
    var fragments = document.querySelectorAll(".fragment");
    Array.from(fragments).forEach(function (fragment) {
      fragment.classList.add("visible");
      fragment.classList.remove("fragment");
    });

    // Seitenzahlen hinzufügen, wenn sie nicht vorhanden sind
    if (
      typeof Reveal.getConfig().slideNumber === "undefined" ||
      !Reveal.getConfig().slideNumber
    ) {
      try {
        Reveal.configure({ slideNumber: "c/t" });
        log("Seitennummerierung aktiviert");
      } catch (e) {
        log("Konnte Seitennummerierung nicht aktivieren: " + e, "warn");
      }
    }

    // Alle Folien für den PDF-Export vorbereiten
    var slides = document.querySelectorAll(
      ".reveal .slides > section, .reveal .slides > section > section"
    );
    slides.forEach(function (slide) {
      // Sicherstellen, dass Inhalte bei Überlauf nicht abgeschnitten werden
      var slideContent = slide.querySelector(".slide-content") || slide;
      slideContent.style.overflow = "visible";

      // Falls Hintergrundbilder vorhanden sind, sicherstellen dass sie sichtbar sind
      var bg = slide.getAttribute("data-background");
      if (bg) {
        if (bg.startsWith("#")) {
          slide.style.backgroundColor = bg;
        } else if (bg.startsWith("rgb")) {
          slide.style.backgroundColor = bg;
        }
      }
    });

    // Versuche Reveal.js PDF-Modus zu aktivieren
    try {
      if (typeof Reveal.configure === "function") {
        Reveal.configure({
          center: true,
          pdfSeparateFragments: false,
        });
      }
    } catch (e) {
      log("Fehler beim Konfigurieren von Reveal.js: " + e, "warn");
    }
  }

  // Document ready event handler
  document.addEventListener("DOMContentLoaded", function () {
    log("DOM vollständig geladen, initialisiere Export-Tool...");
    initExportTool();
  });
})();
