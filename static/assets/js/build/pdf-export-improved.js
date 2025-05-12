/**
 * Optimiertes JavaScript für den PDF-Export von Präsentationen
 */
(function () {
  "use strict";

  // Sofort ausführen, um Verzögerungen zu vermeiden
  console.log("PDF-Export-System wird initialisiert...");

  // Haupt-PDF-Export-Funktionalität
  function initPdfExport() {
    // Prüfe, ob wir im PDF-Export-Modus sind
    var isPrintPDF = window.location.search.match(/print-pdf/gi);

    // PDF-Button-Handler hinzufügen, falls vorhanden
    setupPdfButton();

    if (isPrintPDF) {
      console.log("PDF-Export-Modus erkannt");

      // PDF-Export-Prozess starten
      preparePdfExport();
    }
  }

  // Initialisiere den PDF-Download-Button
  function setupPdfButton() {
    var pdfButton = document.querySelector(".pdf-download-button");
    if (!pdfButton) return;

    pdfButton.addEventListener("click", function (e) {
      e.preventDefault();

      // URL aufbauen für PDF-Export
      var pdfUrl = window.location.href;

      // Entferne alle vorhandenen print-pdf Parameter
      pdfUrl = pdfUrl.replace(/[?&]print-pdf/gi, "");

      // Füge den print-pdf Parameter hinzu
      pdfUrl += (pdfUrl.indexOf("?") >= 0 ? "&" : "?") + "print-pdf";

      console.log("PDF-Download wird vorbereitet: " + pdfUrl);

      // Öffne in neuem Fenster
      var printWindow = window.open(pdfUrl, "_blank");

      if (!printWindow) {
        alert(
          "Popup wurde blockiert! Bitte erlauben Sie Popups für diese Seite, um das PDF herunterladen zu können."
        );
      }

      return false;
    });

    console.log("PDF-Download-Button initialisiert");
  }

  // PDF-Export vorbereiten
  function preparePdfExport() {
    // 1. Lade die PDF-Stylesheets
    loadPdfStylesheets();

    // 2. Optimiere die Präsentation für den Druck
    optimizeForPrint();

    // 3. Zeige Hilfeoverlay und starte den Druck-Dialog
    showPrintDialog();
  }

  // Lädt die benötigten Stylesheets für den PDF-Export
  function loadPdfStylesheets() {
    // Reveal.js PDF-Stylesheet
    var revealStylesheet = document.createElement("link");
    revealStylesheet.rel = "stylesheet";
    revealStylesheet.type = "text/css";

    // Versuche verschiedene mögliche Pfade für das Reveal.js PDF-Stylesheet
    var possiblePaths = [
      "/reveal-js/dist/print/pdf.css",
      "/reveal-js/css/print/pdf.css",
      "/reveal-js/print/pdf.css",
    ];

    // Teste alle möglichen Pfade und verwende den ersten, der funktioniert
    var styleFound = false;
    for (var i = 0; i < possiblePaths.length; i++) {
      try {
        var xhr = new XMLHttpRequest();
        xhr.open("HEAD", possiblePaths[i], false);
        xhr.send();

        if (xhr.status === 200) {
          revealStylesheet.href = possiblePaths[i];
          styleFound = true;
          console.log("PDF-Stylesheet gefunden: " + possiblePaths[i]);
          break;
        }
      } catch (e) {
        console.warn("Fehler beim Laden von " + possiblePaths[i], e);
      }
    }

    // Fallback, wenn kein Stylesheet gefunden wurde
    if (!styleFound) {
      console.warn("Kein PDF-Stylesheet gefunden, verwende Standard-Pfad");
      revealStylesheet.href = possiblePaths[0];
    }

    document.head.appendChild(revealStylesheet);

    // Füge zusätzliche Metadaten für den PDF-Export hinzu
    var metaAuthor = document.createElement("meta");
    metaAuthor.name = "author";
    metaAuthor.content = document.title.split(" - ")[0] || "Präsentation";
    document.head.appendChild(metaAuthor);

    // Benutzerdefinierte Druck-Styles
    var printStyles = document.createElement("style");
    printStyles.textContent = `
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
          page-break-after: always !important;
          page-break-inside: avoid !important;
          height: 100% !important;
        }
        
        #pdf-help-overlay, #download-pdf, #keyboard-shortcut-hint, .controls, .progress {
          display: none !important;
        }
        
        .reveal h1, .reveal h2, .reveal h3, .reveal h4 {
          color: #000 !important;
          text-shadow: none !important;
        }
        
        .reveal pre, .reveal code {
          box-shadow: none !important;
          border: 1px solid #ddd !important;
        }
        
        .print-page-number {
          position: absolute;
          bottom: 10px;
          right: 10px;
          font-size: 12px;
          color: #777;
        }
      }
    `;
    document.head.appendChild(printStyles);
  }

  // Optimiert die Präsentation für den PDF-Export
  function optimizeForPrint() {
    // Nummeriere Folien
    var slides = document.querySelectorAll(".reveal .slides section");
    var totalSlides = slides.length;

    console.log("Optimiere " + totalSlides + " Folien für den Druck");

    slides.forEach(function (slide, index) {
      // Setze Daten-Attribute für die Folien-Nummerierung
      slide.setAttribute("data-slide-num", index + 1);
      slide.setAttribute("data-total-slides", totalSlides);

      // Füge sichtbare Seitenzahl hinzu
      var pageNumber = document.createElement("div");
      pageNumber.className = "print-page-number";
      pageNumber.textContent = "Seite " + (index + 1) + " / " + totalSlides;
      slide.appendChild(pageNumber);
    });

    // Optimiere Bilder für den Druck
    var images = document.querySelectorAll(".reveal .slides section img");
    images.forEach(function (img) {
      if (!img.classList.contains("no-print-optimize")) {
        img.style.maxWidth = "90%";
        img.style.maxHeight = "60vh";
        img.style.margin = "0 auto";
        img.style.display = "block";
      }
    });
  }

  // Zeigt den Hilfe-Dialog an und startet den Druck
  function showPrintDialog() {
    // Erstelle das Hilfe-Overlay
    var helpOverlay = document.createElement("div");
    helpOverlay.id = "pdf-help-overlay";
    helpOverlay.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); z-index: 9999; color: white; padding: 40px; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <h2 style="color: white; margin: 0 0 20px 0;">PDF-Export wird vorbereitet</h2>
        <p>Der Druckdialog wird automatisch geöffnet.</p>
        <p>Wichtige Einstellungen:</p>
        <ul style="text-align: left; max-width: 400px; margin: 0 auto 20px auto;">
          <li>Wählen Sie <strong>"Als PDF speichern"</strong></li>
          <li>Aktivieren Sie <strong>"Hintergrundgrafiken"</strong> unter "Weitere Einstellungen"</li>
          <li>Wählen Sie <strong>Querformat</strong></li>
          <li>Deaktivieren Sie Kopf- und Fußzeilen</li>
        </ul>
        <button onclick="window.print(); return false;" style="margin: 10px auto; padding: 10px 20px; background: #42A8C0; border: none; color: white; cursor: pointer; font-size: 16px; border-radius: 4px;">Druckdialog öffnen</button>
        <p style="margin-top: 20px;">
          <a href="javascript:history.back()" style="color: #42A8C0; text-decoration: underline;">Zurück zur Präsentation</a>
        </p>
      </div>
    `;
    document.body.appendChild(helpOverlay);

    // Automatisch den Druckdialog öffnen nach kurzer Verzögerung
    setTimeout(function () {
      console.log("Öffne Druckdialog...");
      window.print();
    }, 1500);
  }

  // Starte den PDF-Export beim Laden der Seite
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPdfExport);
  } else {
    initPdfExport();
  }
})();
