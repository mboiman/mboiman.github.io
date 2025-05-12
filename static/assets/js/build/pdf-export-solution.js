/**
 * Verbesserte PDF-Export-Lösung für Präsentationen
 * Vermeidet Popup-Blocker durch direkte Download-Methode
 */
(function () {
  "use strict";

  // Logger-Funktion
  function log(message, type = "info") {
    const prefix = "[PDF-Export]";
    if (type === "error") {
      console.error(`${prefix} ERROR: ${message}`);
    } else if (type === "warn") {
      console.warn(`${prefix} WARN: ${message}`);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }

  // Hauptinitialisierung
  function initPdfExport() {
    log("PDF-Export-System wird initialisiert...");

    // Prüfe, ob wir im PDF-Export-Modus sind
    var isPrintPDF = window.location.search.match(/print-pdf/gi);

    if (isPrintPDF) {
      log("PDF-Export-Modus erkannt");
      preparePdfExport();
    } else {
      // Normaler Modus: Button-Handler hinzufügen
      setupPdfButton();
    }
  }

  // PDF-Download-Button initialisieren
  function setupPdfButton() {
    var pdfButton = document.querySelector(".pdf-download-button");
    if (!pdfButton) {
      log("Kein PDF-Button gefunden", "warn");
      return;
    }

    log("PDF-Download-Button gefunden, füge Event-Handler hinzu");

    pdfButton.addEventListener("click", function (e) {
      e.preventDefault();
      startPdfDownload();
      return false;
    });
  }

  // PDF-Download starten ohne Popup-Blocker-Probleme
  function startPdfDownload() {
    log("Starte PDF-Download-Prozess...");

    // Aktuelle URL ohne print-pdf Parameter
    var currentUrl = window.location.href.replace(/[?&]print-pdf/gi, "");

    // Füge print-pdf Parameter hinzu
    var pdfUrl =
      currentUrl + (currentUrl.indexOf("?") >= 0 ? "&" : "?") + "print-pdf";

    log("Erzeuge PDF-Export-URL: " + pdfUrl);

    // Verbesserte Version ohne Popup-Blocker-Probleme
    var overlay = document.createElement("div");
    overlay.id = "pdf-instructions-overlay";
    overlay.className = "pdf-instructions-dialog";

    var content = `
      <div class="pdf-dialog-content">
        <h2>PDF-Export wird vorbereitet</h2>
        <p>Bitte wählen Sie eine der folgenden Optionen:</p>
        
        <div class="pdf-options">
          <div class="pdf-option">
            <h3>Option 1: Direkt öffnen</h3>
            <p>Öffnet die Druckversion direkt im aktuellen Fenster</p>
            <a href="${pdfUrl}" id="manual-pdf-trigger" class="pdf-action-button primary">Druckansicht öffnen</a>
          </div>
          
          <div class="pdf-option">
            <h3>Option 2: In Vorschau anzeigen</h3>
            <p>Öffnet die Druckversion in einer Vorschau mit Druckoption</p>
            <button id="iframe-pdf-trigger" class="pdf-action-button secondary">In Vorschau öffnen</button>
          </div>
        </div>
        
        <div class="pdf-instructions">
          <h4>Wichtige Druckeinstellungen:</h4>
          <ul>
            <li>✅ <strong>"Als PDF speichern"</strong> oder PDF-Drucker auswählen</li>
            <li>✅ <strong>"Hintergrundgrafiken"</strong> aktivieren (unter weitere Einstellungen)</li>
            <li>✅ <strong>Querformat</strong> wählen</li>
            <li>✅ <strong>Kopf- und Fußzeilen deaktivieren</strong></li>
          </ul>
        </div>
        
        <button id="close-pdf-overlay" class="pdf-action-button neutral">Schließen</button>
      </div>
    `;

    overlay.innerHTML = content;
    document.body.appendChild(overlay);

    // Event-Handler für die Buttons hinzufügen
    document
      .getElementById("iframe-pdf-trigger")
      .addEventListener("click", function () {
        log("iframe PDF-Trigger wurde angeklickt");

        // Overlay schließen
        document.getElementById("pdf-instructions-overlay").remove();

        var iframe = document.createElement("iframe");
        iframe.id = "pdf-preview-iframe";
        iframe.style.position = "fixed";
        iframe.style.top = "0";
        iframe.style.left = "0";
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.zIndex = "9998";
        iframe.style.border = "none";
        iframe.style.backgroundColor = "#fff";
        iframe.src = pdfUrl;

        // Loading-Anzeige
        var loadingOverlay = document.createElement("div");
        loadingOverlay.id = "pdf-loading-overlay";
        loadingOverlay.innerHTML = `
        <div class="loading-spinner"></div>
        <p>Druckansicht wird geladen...</p>
      `;
        document.body.appendChild(loadingOverlay);

        // iframe dem Dokument hinzufügen
        document.body.appendChild(iframe);

        // Hinzufügen eines Schließen-Buttons
        var controlsDiv = document.createElement("div");
        controlsDiv.id = "pdf-preview-controls";
        controlsDiv.innerHTML = `
        <button id="print-pdf-button" class="pdf-action-button primary">Drucken</button>
        <button id="close-preview-button" class="pdf-action-button neutral">Zurück zur Präsentation</button>
      `;

        // Überwache, wann der iframe geladen ist
        iframe.onload = function () {
          log("PDF-Vorschau ist bereit im iframe");
          document.getElementById("pdf-loading-overlay").remove();
          document.body.appendChild(controlsDiv);

          // Druck-Button-Handler
          document
            .getElementById("print-pdf-button")
            .addEventListener("click", function () {
              try {
                iframe.contentWindow.print();
              } catch (e) {
                log("Konnte Druckdialog nicht öffnen: " + e.message, "error");
                alert(
                  "Der Druckdialog konnte nicht geöffnet werden. Bitte versuchen Sie es mit Option 1."
                );
              }
            });

          // Schließen-Button-Handler
          document
            .getElementById("close-preview-button")
            .addEventListener("click", function () {
              document.body.removeChild(iframe);
              document.body.removeChild(controlsDiv);
            });
        };
      });

    document
      .getElementById("close-pdf-overlay")
      .addEventListener("click", function () {
        document.getElementById("pdf-instructions-overlay").remove();
      });
  }

  // PDF-Export vorbereiten für Druckversion
  function preparePdfExport() {
    // Lade die benötigten Stylesheets
    loadPdfStylesheets();

    // Optimiere die Präsentation für den Druck
    optimizeForPrint();

    // Wenn aus einer normalen Ansicht hierher navigiert wurde
    if (window.history.length > 1) {
      // Füge Zurück-Button hinzu
      var backButton = document.createElement("div");
      backButton.id = "pdf-back-button";
      backButton.innerHTML = `
        <a href="javascript:history.back()" class="pdf-action-button neutral">
          <span>← Zurück zur Präsentation</span>
        </a>
      `;
      document.body.appendChild(backButton);
    }

    // Zeige Hilfeoverlay und starte den Druck-Dialog
    var printHelp = document.createElement("div");
    printHelp.id = "print-help-overlay";
    printHelp.innerHTML = `
      <div class="pdf-dialog-content">
        <h2>PDF-Export bereit</h2>
        <p>Der Druckdialog wird automatisch geöffnet.</p>
        <p>Bitte folgen Sie den Druckanweisungen.</p>
        <button id="manual-print-button" class="pdf-action-button primary">Druckdialog öffnen</button>
      </div>
    `;
    document.body.appendChild(printHelp);

    document
      .getElementById("manual-print-button")
      .addEventListener("click", function () {
        window.print();
      });

    // Automatisch den Druckdialog öffnen nach kurzer Verzögerung
    setTimeout(function () {
      log("Öffne Druckdialog...");
      try {
        window.print();
      } catch (e) {
        log("Fehler beim Öffnen des Druckdialogs: " + e.message, "error");
      }
    }, 1000);
  }

  // Diese Funktion wurde durch eine verbesserte Version ersetzt

  // Lädt die benötigten Stylesheets für den PDF-Export
  function loadPdfStylesheets() {
    log("Lade PDF-Stylesheets...");

    // Reveal.js PDF-Stylesheet laden
    var stylePaths = [
      "/reveal-js/dist/print/pdf.css",
      "/reveal-js/css/print/pdf.css",
      "/reveal-js/print/pdf.css",
    ];

    // Prüfen, welcher Pfad existiert
    var cssLoaded = false;

    for (var i = 0; i < stylePaths.length; i++) {
      try {
        var xhr = new XMLHttpRequest();
        xhr.open("HEAD", stylePaths[i], false);
        xhr.send();

        if (xhr.status === 200) {
          log("Gefundenes PDF-Stylesheet: " + stylePaths[i]);

          var link = document.createElement("link");
          link.rel = "stylesheet";
          link.type = "text/css";
          link.href = stylePaths[i];
          document.head.appendChild(link);

          cssLoaded = true;
          break;
        }
      } catch (e) {
        log(
          "Fehler beim Laden von " + stylePaths[i] + ": " + e.message,
          "warn"
        );
      }
    }

    if (!cssLoaded) {
      log(
        "Kein Reveal.js PDF-Stylesheet gefunden, lade benutzerdefiniertes Stylesheet",
        "warn"
      );
    }

    // Benutzerdefiniertes PDF-Stylesheet immer laden
    var customLink = document.createElement("link");
    customLink.rel = "stylesheet";
    customLink.type = "text/css";
    customLink.href = "/assets/css/presentation-print.css";
    document.head.appendChild(customLink);
  }

  // Optimiert die Präsentation für den Druck
  function optimizeForPrint() {
    log("Optimiere Präsentation für den Druck...");

    // Verstecke UI-Elemente
    var hideElements = document.querySelectorAll(
      ".controls, .progress, #download-pdf, #keyboard-shortcut-hint"
    );
    hideElements.forEach(function (el) {
      if (el) el.style.display = "none";
    });

    // Füge Seitenzahlen hinzu
    var slides = document.querySelectorAll(".reveal .slides section");
    var totalSlides = slides.length;

    slides.forEach(function (slide, index) {
      // Füge Seitenzahlen hinzu
      var pageNumber = document.createElement("div");
      pageNumber.className = "page-number";
      pageNumber.textContent = "Seite " + (index + 1) + " von " + totalSlides;
      slide.appendChild(pageNumber);
    });

    // Optimiere Bilder für den Druck
    var images = document.querySelectorAll(".reveal .slides img");
    images.forEach(function (img) {
      if (!img.classList.contains("no-print-optimize")) {
        img.style.maxHeight = "60vh";
      }
    });
  }

  // Führe die Initialisierung beim Laden der Seite aus
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPdfExport);
  } else {
    initPdfExport();
  }
})();
