/**
 * Optimierter PDF-Export für Reveal.js Präsentationen
 * Vereinfachte Version mit direktem Link zum Print-Modus
 */
(function () {
  "use strict";

  // Prüfen, ob wir im PDF-Export-Modus sind
  function isPrintPdfMode() {
    return window.location.search.indexOf("print-pdf") !== -1;
  }

  // Diese Funktion wird aufgerufen, wenn die Seite geladen ist
  document.addEventListener("DOMContentLoaded", function () {
    console.log("[PDF-Export] Skript geladen");

    // Wenn wir im PDF-Modus sind, für den Druck vorbereiten
    if (isPrintPdfMode()) {
      console.log("[PDF-Export] PDF-Druckmodus erkannt");
      prepareForPrinting();
    }
  });

  // Funktion zur Vorbereitung der Seite für den Druck
  function prepareForPrinting() {
    // Zurück-Button hinzufügen
    addBackButton();

    // Hilfe-Dialog anzeigen
    showPrintHelp();

    // PDF-Stylesheet laden
    loadPrintStyles();

    // Automatisch Druckdialog öffnen
    setTimeout(function () {
      window.print();
    }, 1000);
  }

  // Zurück-Button zum normalen Ansichtsmodus
  function addBackButton() {
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
      // Zurück zur normalen Ansicht navigieren
      window.location.href = window.location.href.replace(
        /[?&]print-pdf/gi,
        ""
      );
    });

    document.body.appendChild(backButton);
  }

  // Zeigt einen Hilfe-Dialog für die Druckeinstellungen
  function showPrintHelp() {
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
  }

  // Lädt CSS-Styles für den Druck
  function loadPrintStyles() {
    // 1. Standard Reveal.js PDF-Stylesheet laden
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = "/assets/css/presentation-print.css";
    document.head.appendChild(link);

    // 2. Inline-Styles für optimalen Druck
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
        
        /* Elemente ausblenden, die im Druck stören */
        .controls, .progress, .slide-number, #pdf-export-dialog, #keyboard-shortcut-hint, #download-pdf {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(printStyle);
  }
})();
