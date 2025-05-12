/**
 * Verbessertes Debug-Skript für den PDF-Export von Präsentationen
 * Enthält verbesserte Fehlerbehandlung und Protokollierung
 */

// Sofort ausführbare Funktion, um globalen Scope nicht zu verschmutzen
(function () {
  "use strict";

  // Logger-Funktion für einfaches Debugging
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

  log("Initialisiere PDF-Export-System...");

  // Prüfen, ob Reveal.js korrekt geladen ist
  function isRevealLoaded() {
    return typeof Reveal !== "undefined";
  }

  // Prüft, ob wir im PDF-Export-Modus sind
  function isPrintPdfMode() {
    return window.location.search.match(/print-pdf/gi);
  }

  // Hauptfunktion für den PDF-Export
  function initPdfExport() {
    try {
      if (isPrintPdfMode()) {
        log("PDF-Export-Modus erkannt");

        // Optimiere die Präsentation für den PDF-Export
        prepareForPdfExport();
      } else {
        // Normaler Modus: Button-Handler hinzufügen
        setupPdfButton();
      }
    } catch (e) {
      log(`Fehler bei der Initialisierung: ${e.message}`, "error");
      console.error(e);
    }
  }

  // Einrichtung des PDF-Download-Buttons
  function setupPdfButton() {
    try {
      const pdfButton = document.querySelector(".pdf-download-button");

      if (!pdfButton) {
        log("PDF-Download-Button nicht gefunden", "warn");
        return;
      }

      log("PDF-Download-Button gefunden, füge Event-Handler hinzu");

      // Event-Listener hinzufügen
      pdfButton.addEventListener("click", function (e) {
        e.preventDefault();

        try {
          // URL für PDF-Export vorbereiten
          let pdfUrl = window.location.href;

          // Entferne vorhandene print-pdf Parameter
          pdfUrl = pdfUrl.replace(/[?&]print-pdf/gi, "");

          // Füge den print-pdf Parameter hinzu
          pdfUrl += (pdfUrl.indexOf("?") >= 0 ? "&" : "?") + "print-pdf";

          log(`Öffne PDF-Export-URL: ${pdfUrl}`);

          // Öffne in neuem Fenster
          const newWindow = window.open(pdfUrl, "_blank");

          if (!newWindow) {
            alert(
              "Popup wurde blockiert! Bitte erlauben Sie Popups für diese Seite, um das PDF herunterzuladen."
            );
            log("Popup wurde blockiert", "warn");
          }
        } catch (err) {
          log(
            `Fehler beim Öffnen des PDF-Export-Fensters: ${err.message}`,
            "error"
          );
        }

        return false;
      });

      log("PDF-Button-Handler erfolgreich hinzugefügt");
    } catch (e) {
      log(`Fehler bei der Button-Einrichtung: ${e.message}`, "error");
    }
  }

  // Bereite die Präsentation für den PDF-Export vor
  function prepareForPdfExport() {
    try {
      // 1. Zusätzliche PDF-Stylesheets laden
      loadPdfStylesheets();

      // 2. Folien für den Druck optimieren
      optimizeSlides();

      // 3. Hilfe-Dialog anzeigen und Druck starten
      showPrintHelpAndStartPrinting();
    } catch (e) {
      log(`Fehler bei der PDF-Export-Vorbereitung: ${e.message}`, "error");
    }
  }

  // Lade notwendige Stylesheets für den PDF-Export
  function loadPdfStylesheets() {
    log("Lade PDF-Stylesheets...");

    // Reveal.js PDF-Stylesheet
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";

    // Mögliche Pfade für das PDF-Stylesheet
    const possiblePaths = [
      "/reveal-js/dist/print/pdf.css",
      "/reveal-js/css/print/pdf.css",
      "/reveal-js/plugin/print-pdf/pdf.css",
      "/reveal-js/print/pdf.css",
    ];

    // Versuche, ein funktionierendes Stylesheet zu finden
    let styleFound = false;

    for (const path of possiblePaths) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("HEAD", path, false);
        xhr.send();

        if (xhr.status === 200) {
          link.href = path;
          styleFound = true;
          log(`PDF-Stylesheet gefunden: ${path}`);
          break;
        }
      } catch (e) {
        log(`Stylesheet-Test für ${path} fehlgeschlagen: ${e.message}`, "warn");
      }
    }

    // Fallback, wenn kein Stylesheet gefunden wurde
    if (!styleFound) {
      link.href = possiblePaths[0];
      log(
        `Kein Stylesheet gefunden, verwende Standard: ${possiblePaths[0]}`,
        "warn"
      );
    }

    document.head.appendChild(link);

    // Zusätzliche benutzerdefinierte Styles
    const customStyles = document.createElement("style");
    customStyles.textContent = `
      @media print {
        @page {
          size: landscape;
          margin: 0;
        }
        
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
        }
        
        .reveal .slides section {
          page-break-after: always !important;
          page-break-inside: avoid !important;
          visibility: visible !important;
          position: relative !important;
          display: block !important;
          width: 100% !important;
          height: auto !important;
          transform: none !important;
        }
        
        .reveal .slides section .fragment {
          opacity: 1 !important;
          visibility: visible !important;
        }
        
        .reveal .controls,
        .reveal .progress,
        #download-pdf,
        #keyboard-shortcut-hint,
        #pdf-help-overlay {
          display: none !important;
        }
        
        .reveal .slides {
          position: static !important;
          width: 100% !important;
          height: auto !important;
          transform: none !important;
          margin: 0 !important;
          padding: 0 !important;
          zoom: 1 !important;
        }
        
        .page-number {
          position: absolute;
          bottom: 10px;
          right: 10px;
          font-size: 14px;
          color: #666;
          background: rgba(255,255,255,0.7);
          padding: 2px 6px;
          border-radius: 2px;
        }
      }
    `;

    document.head.appendChild(customStyles);
    log("Benutzerdefinierte Druck-Styles hinzugefügt");
  }

  // Optimiere Folien für den PDF-Export
  function optimizeSlides() {
    log("Optimiere Folien für den PDF-Export...");

    // Warte kurz, um sicherzustellen, dass Reveal.js vollständig geladen ist
    setTimeout(() => {
      try {
        const slides = document.querySelectorAll(".reveal .slides section");

        if (!slides.length) {
          log("Keine Slides gefunden", "warn");
          return;
        }

        log(`${slides.length} Folien gefunden, beginne Optimierung`);

        // Verarbeite jede Folie
        slides.forEach((slide, index) => {
          // Füge Seitenzahl hinzu
          const pageNumber = document.createElement("div");
          pageNumber.className = "page-number";
          pageNumber.textContent = `${index + 1} / ${slides.length}`;
          slide.appendChild(pageNumber);

          // Stelle sicher, dass Hintergrundbilder korrekt angezeigt werden
          const bgImage = slide.getAttribute("data-background-image");
          if (bgImage && !slide.style.backgroundImage) {
            slide.style.backgroundImage = `url(${bgImage})`;
            slide.style.backgroundSize = "cover";
          }

          // Optimiere Code-Blöcke für den Druck
          const codeBlocks = slide.querySelectorAll("pre code");
          codeBlocks.forEach((block) => {
            block.style.fontSize = "0.8em";
            block.style.padding = "0.5em";
            block.style.maxHeight = "none";
            block.style.border = "1px solid #ddd";
            block.style.borderRadius = "5px";
          });
        });

        log("Folien-Optimierung abgeschlossen");
      } catch (e) {
        log(`Fehler bei der Folien-Optimierung: ${e.message}`, "error");
      }
    }, 200);
  }

  // Hilfeoverlay anzeigen und Druck starten
  function showPrintHelpAndStartPrinting() {
    log("Erstelle Hilfe-Overlay und starte Druck-Prozess...");

    try {
      const helpOverlay = document.createElement("div");
      helpOverlay.id = "pdf-help-overlay";
      helpOverlay.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); z-index: 9999; color: white; padding: 40px; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center;">
          <h2 style="color: white; margin: 0 0 20px 0; font-size: 26px;">PDF-Export wird vorbereitet</h2>
          <div style="max-width: 600px; margin: 0 auto;">
            <p>Der Druckdialog wird automatisch geöffnet.</p>
            <div style="background: rgba(255,255,255,0.1); border-radius: 8px; padding: 15px; margin: 15px 0; text-align: left;">
              <p style="margin-top: 0; font-weight: bold;">Wichtige Einstellungen für optimale Ergebnisse:</p>
              <ul style="margin-bottom: 0; padding-left: 20px;">
                <li>Wählen Sie <strong>"Als PDF speichern"</strong></li>
                <li>Aktivieren Sie <strong>"Hintergrundgrafiken"</strong> unter "Weitere Einstellungen"</li>
                <li>Wählen Sie <strong>Querformat</strong> (Landscape)</li>
                <li>Deaktivieren Sie alle Kopf- und Fußzeilen</li>
              </ul>
            </div>
            <button onclick="window.print(); return false;" style="margin: 15px auto; padding: 12px 25px; background: #42A8C0; border: none; color: white; cursor: pointer; font-size: 16px; border-radius: 30px; font-weight: 500;">Druckdialog öffnen</button>
            <p style="margin-top: 20px; font-size: 14px;">
              <a href="javascript:history.back()" style="color: #42A8C0; text-decoration: underline;">Zurück zur Präsentation</a>
            </p>
          </div>
        </div>
      `;

      document.body.appendChild(helpOverlay);
      log("Hilfe-Overlay hinzugefügt");

      // Automatisch den Druckdialog öffnen
      setTimeout(() => {
        try {
          log("Öffne Druckdialog...");
          window.print();
        } catch (e) {
          log(`Fehler beim Öffnen des Druckdialogs: ${e.message}`, "error");
          alert(
            "Der Druckdialog konnte nicht automatisch geöffnet werden. Bitte drücken Sie Strg+P (Windows/Linux) oder Cmd+P (Mac), um den Druck zu starten."
          );
        }
      }, 1500);
    } catch (e) {
      log(`Fehler beim Erstellen des Hilfe-Overlays: ${e.message}`, "error");
    }
  }

  // Starte den PDF-Export-Prozess
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPdfExport);
  } else {
    // Dokument bereits geladen, sofort starten
    initPdfExport();
  }
})();
