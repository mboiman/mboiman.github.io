/**
 * Optimierter PDF-Export für Reveal.js Präsentationen
 * Vermeidet Popup-Blocker-Probleme durch direkte Navigation
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

  // Prüfen, ob wir im PDF-Export-Modus sind
  function isPrintPdfMode() {
    return !!window.location.search.match(/print-pdf/gi);
  }

  // Hauptfunktion - wird aufgerufen, wenn DOM geladen
  function initPdfExport() {
    log("PDF-Export-System wird initialisiert...");

    if (isPrintPdfMode()) {
      log("PDF-Export-Modus erkannt");
      prepareForPrinting();
    } else {
      log("Normaler Ansichtsmodus");
      setupPdfButton();
    }
  }

  // PDF Export-Button einrichten
  function setupPdfButton() {
    var pdfButton = document.querySelector(".pdf-download-button");
    if (!pdfButton) {
      log("Kein PDF-Button gefunden", "warn");
      return;
    }

    log("PDF-Button gefunden, füge Event-Handler hinzu");
    pdfButton.addEventListener("click", handlePdfButtonClick);
  }

  // Handler für den PDF-Button-Klick
  function handlePdfButtonClick(e) {
    e.preventDefault();

    // Aktuelle URL und PDF URL vorbereiten
    var currentUrl = window.location.href;
    var pdfUrl =
      currentUrl + (currentUrl.indexOf("?") >= 0 ? "&" : "?") + "print-pdf";

    // URL im Session Storage speichern, damit man zurückkehren kann
    try {
      sessionStorage.setItem("returnUrl", currentUrl);
    } catch (e) {
      log("Konnte returnUrl nicht in sessionStorage speichern", "warn");
    }

    // Option 1: Informations-Dialog anzeigen
    showPdfDialog(pdfUrl, currentUrl);

    return false;
  }

  // Zeige Dialog mit PDF-Export-Optionen
  function showPdfDialog(pdfUrl, returnUrl) {
    // Dialog-Container erstellen
    var dialogContainer = document.createElement("div");
    dialogContainer.id = "pdf-export-dialog";
    dialogContainer.className = "pdf-export-dialog";
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

    // Dialog-Content erstellen
    var dialog = document.createElement("div");
    dialog.className = "pdf-dialog-content";
    dialog.style.backgroundColor = "#fff";
    dialog.style.borderRadius = "8px";
    dialog.style.padding = "30px";
    dialog.style.maxWidth = "600px";
    dialog.style.width = "90%";
    dialog.style.color = "#333";
    dialog.style.textAlign = "left";
    dialog.style.boxShadow = "0 10px 25px rgba(0,0,0,0.5)";

    // Dialog-Inhalt
    dialog.innerHTML = `
      <h2 style="margin-top: 0; color: #333;">PDF-Export</h2>
      
      <p>Es gibt zwei Möglichkeiten, diese Präsentation als PDF zu exportieren:</p>
      
      <div style="display: flex; gap: 20px; margin: 25px 0; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px; background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
          <h3 style="margin-top: 0; font-size: 18px;">Option 1: Direkte Methode</h3>
          <ol style="margin-left: 20px; padding-left: 0;">
            <li style="margin-bottom: 8px;">Klicken Sie auf "PDF-Ansicht öffnen"</li>
            <li style="margin-bottom: 8px;">Warten Sie, bis die Seite geladen ist</li>
            <li style="margin-bottom: 8px;">Drücken Sie STRG+P (oder CMD+P)</li>
            <li style="margin-bottom: 8px;">Wählen Sie "Als PDF speichern"</li>
            <li>Stellen Sie "Querformat" und "Hintergrundgrafiken" ein</li>
          </ol>
          <button id="open-pdf-view" style="width: 100%; padding: 10px; margin-top: 15px; background-color: #42a8c0; color: white; border: none; border-radius: 4px; cursor: pointer;">PDF-Ansicht öffnen</button>
        </div>
        
        <div style="flex: 1; min-width: 200px; background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
          <h3 style="margin-top: 0; font-size: 18px;">Option 2: Automatisch</h3>
          <p>Diese Methode nutzt die Decktape-Bibliothek, um automatisch ein PDF zu erstellen.</p>
          <p style="color: #888; font-style: italic;">Hinweis: Diese Option muss vom Administrator konfiguriert werden.</p>
          <button id="auto-pdf-generate" style="width: 100%; padding: 10px; margin-top: 15px; background-color: #5cb85c; color: white; border: none; border-radius: 4px; cursor: pointer;" disabled>PDF generieren (nicht verfügbar)</button>
        </div>
      </div>
      
      <div style="border-top: 1px solid #eee; padding-top: 15px; margin-top: 5px;">
        <p style="margin-bottom: 20px;"><strong>Drucktipps:</strong> Für beste Ergebnisse verwenden Sie Chrome oder Edge und aktivieren Sie "Hintergrundgrafiken" in den Druckeinstellungen.</p>
        <button id="close-pdf-dialog" style="padding: 8px 15px; background-color: #f0f0f0; border: none; border-radius: 4px; cursor: pointer;">Abbrechen</button>
      </div>`;

    // Dialog zur Seite hinzufügen
    dialogContainer.appendChild(dialog);
    document.body.appendChild(dialogContainer);

    // Event-Listener für Buttons
    document
      .getElementById("open-pdf-view")
      .addEventListener("click", function () {
        // Direkt zur PDF-Ansicht navigieren
        window.location.href = pdfUrl;
      });

    document
      .getElementById("close-pdf-dialog")
      .addEventListener("click", function () {
        document.body.removeChild(dialogContainer);
      });
  }

  // Vorbereitung der Präsentation für den Druck
  function prepareForPrinting() {
    log("Bereite Präsentation für den Druck vor");

    // Zurück-Button einfügen, wenn wir von einer normalen Ansicht kamen
    var returnUrl = null;
    try {
      returnUrl = sessionStorage.getItem("returnUrl");
    } catch (e) {
      log("Konnte returnUrl nicht aus sessionStorage laden", "warn");
    }

    if (returnUrl) {
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
      backButton.innerHTML = "← Zurück zur Präsentation";

      backButton.addEventListener("click", function () {
        window.location.href = returnUrl;
      });

      document.body.appendChild(backButton);
    }

    // Hilfe-Dialog für Druckeinstellungen anzeigen
    var printHelpDialog = document.createElement("div");
    printHelpDialog.style.position = "fixed";
    printHelpDialog.style.top = "10px";
    printHelpDialog.style.right = "10px";
    printHelpDialog.style.backgroundColor = "rgba(0,0,0,0.6)";
    printHelpDialog.style.color = "#fff";
    printHelpDialog.style.padding = "15px";
    printHelpDialog.style.borderRadius = "5px";
    printHelpDialog.style.maxWidth = "300px";
    printHelpDialog.style.fontSize = "14px";
    printHelpDialog.style.zIndex = "9999";

    printHelpDialog.innerHTML = `
      <div style="margin-bottom: 10px;">
        <strong>Druckeinstellungen:</strong>
        <ul style="margin: 5px 0; padding-left: 20px;">
          <li>Als PDF speichern</li>
          <li>Querformat</li>
          <li>Hintergrundgrafiken aktivieren</li>
          <li>Keine Ränder</li>
        </ul>
      </div>
      <button id="open-print-dialog" style="padding: 8px 15px; background-color: #42a8c0; color: white; border: none; border-radius: 4px; cursor: pointer;">Druckdialog öffnen</button>
    `;

    document.body.appendChild(printHelpDialog);

    // Druckdialog-Button
    document
      .getElementById("open-print-dialog")
      .addEventListener("click", function () {
        window.print();
      });

    // CSS für den Druck laden
    loadPrintStyles();

    // Optional: Automatisch Druckdialog öffnen nach kurzer Verzögerung
    setTimeout(function () {
      window.print();
    }, 1500);
  }

  // Lädt CSS-Styles für den Druck
  function loadPrintStyles() {
    // Benutzerdefinierten Druck-Style hinzufügen
    var printStyle = document.createElement("style");
    printStyle.textContent = `
      @media print {
        @page {
          size: landscape;
          margin: 0;
        }
        
        body {
          margin: 0 !important;
          padding: 0 !important;
        }
        
        .reveal .slides section {
          page-break-before: always !important;
          page-break-after: always !important;
          page-break-inside: avoid !important;
        }
        
        .reveal .slides section .fragment {
          opacity: 1 !important;
          visibility: visible !important;
        }
        
        #pdf-export-dialog, .controls, .progress, .slide-number {
          display: none !important;
        }
      }
    `;

    document.head.appendChild(printStyle);

    // Versuche das Standard-PDF-Stylesheet von Reveal.js zu laden
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = "/assets/css/presentation-print.css";
    document.head.appendChild(link);
  }

  // Direkte Event-Listener Registrierung für den PDF-Button
  document.addEventListener("DOMContentLoaded", function () {
    console.log(
      "[PDF-Export] DOM vollständig geladen, initialisiere PDF-Export..."
    );

    // Button direkt ansprechen
    var pdfButton = document.querySelector(".pdf-download-button");
    if (pdfButton) {
      console.log("[PDF-Export] PDF-Button gefunden, füge Click-Handler hinzu");

      pdfButton.addEventListener("click", function (e) {
        e.preventDefault();
        console.log("[PDF-Export] Button wurde geklickt!");

        // Einfache Weiterleitung zum PDF-Format
        var currentUrl = window.location.href;
        var pdfUrl =
          currentUrl + (currentUrl.indexOf("?") >= 0 ? "&" : "?") + "print-pdf";

        console.log("[PDF-Export] Leite weiter zu: " + pdfUrl);
        window.location.href = pdfUrl;

        return false;
      });
    } else {
      console.error("[PDF-Export] PDF-Button nicht gefunden!");
    }

    // Prüfen, ob wir bereits im PDF-Modus sind
    if (isPrintPdfMode()) {
      prepareForPrinting();
    }
  });
})();
