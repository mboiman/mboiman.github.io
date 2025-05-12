/**
 * Zusätzliche Funktionen für den PDF-Export von Präsentationen
 */
document.addEventListener("DOMContentLoaded", function () {
  // Prüfe, ob wir im PDF-Export-Modus sind
  var isPrintPDF = window.location.search.match(/print-pdf/gi);

  if (isPrintPDF) {
    // Füge Metadaten für den PDF-Export hinzu
    addExportMetadata();

    // Füge Foliennummerierung hinzu
    addSlideNumbers();

    // Verbessere die PDF-Darstellung der Bilder
    optimizeImagesForPrint();

    // Entferne Links zum Download (da wir bereits im Download-Modus sind)
    hideDownloadButtons();
  }

  /**
   * Fügt Metadaten für den PDF-Export hinzu
   */
  function addExportMetadata() {
    // Füge Autor-Metadaten hinzu
    var metaAuthor = document.createElement("meta");
    metaAuthor.name = "author";
    metaAuthor.content = document.title.split(" - ")[0] || "Präsentation";
    document.querySelector("head").appendChild(metaAuthor);

    // Füge Beschreibung hinzu
    var metaDescription = document.createElement("meta");
    metaDescription.name = "description";
    metaDescription.content = "PDF-Export der Präsentation: " + document.title;
    document.querySelector("head").appendChild(metaDescription);

    // Füge Datum hinzu
    var metaDate = document.createElement("meta");
    metaDate.name = "date";
    metaDate.content = new Date().toISOString().slice(0, 10);
    document.querySelector("head").appendChild(metaDate);
  }

  /**
   * Fügt Foliennummern zu allen Slides hinzu
   */
  function addSlideNumbers() {
    // Warte etwas, bis der DOM vollständig geladen ist
    setTimeout(function () {
      // Zähle die Gesamtzahl der Folien
      var slides = document.querySelectorAll(
        ".reveal .slides > section, .reveal .slides > section > section"
      );
      var totalSlides = slides.length;

      // Setze die Nummerierung für jede Folie
      slides.forEach(function (slide, index) {
        slide.setAttribute("data-slide-num", index + 1);
        slide.setAttribute("data-total-slides", totalSlides);

        // Füge eine sichtbare Seitenzahl hinzu
        var pageNumber = document.createElement("div");
        pageNumber.className = "slide-page-number";
        pageNumber.textContent = "Seite " + (index + 1) + " von " + totalSlides;
        pageNumber.style.cssText =
          "position: absolute; bottom: 10px; right: 10px; font-size: 12px; color: #777; background-color: rgba(255,255,255,0.7); padding: 2px 5px; border-radius: 3px; z-index: 1000;";

        // Füge die Seitenzahl nur im Druck-Modus hinzu
        pageNumber.style.display = "none";
        pageNumber.classList.add("print-only-element");

        slide.appendChild(pageNumber);
      });
    }, 1000);
  }

  /**
   * Optimiert Bilder für den Druck
   */
  function optimizeImagesForPrint() {
    // Füge CSS-Regeln für Bilder hinzu
    var style = document.createElement("style");
    style.textContent = `
      @media print {
        .print-only-element {
          display: block !important;
        }
        
        .reveal .slides section img {
          max-width: 90% !important;
          max-height: 60vh !important;
          margin: 0 auto !important;
          display: block !important;
          page-break-inside: avoid !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Verbirgt Download-Buttons im Druck-Modus
   */
  function hideDownloadButtons() {
    var style = document.createElement("style");
    style.textContent = `
      @media print {
        #download-pdf, .download-button, #keyboard-shortcut-hint {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
});
