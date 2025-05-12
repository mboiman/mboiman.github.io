/**
 * Zusammengeführtes JavaScript für den PDF-Export von Präsentationen
 */
document.addEventListener("DOMContentLoaded", function () {
  // Prüfe, ob wir im PDF-Export-Modus sind
  var isPrintPDF = window.location.search.match(/print-pdf/gi);

  if (isPrintPDF) {
    // 1. Füge PDF-Stylesheet hinzu
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";

    // Versuche verschiedene mögliche Pfade
    var possiblePaths = [
      "/reveal-js/dist/print/pdf.css",
      "/reveal-js/css/print/pdf.css",
      "/reveal-js/print/pdf.css",
    ];

    // Suche nach einer existierenden Datei
    var styleFound = false;
    for (var i = 0; i < possiblePaths.length; i++) {
      var path = possiblePaths[i];
      var xhr = new XMLHttpRequest();
      xhr.open("HEAD", path, false);
      try {
        xhr.send();
        if (xhr.status === 200) {
          link.href = path;
          styleFound = true;
          break;
        }
      } catch (e) {}
    }

    // Fallback, wenn keine Datei gefunden wurde
    if (!styleFound) {
      link.href = possiblePaths[0];
    }
    document.querySelector("head").appendChild(link);

    // 2. Füge Metadaten für den PDF-Export hinzu
    var metaAuthor = document.createElement("meta");
    metaAuthor.name = "author";
    metaAuthor.content = document.title.split(" - ")[0] || "Präsentation";
    document.querySelector("head").appendChild(metaAuthor);

    // 3. Zusätzliche Styles für bessere Druckqualität
    addPrintStyles();

    // 4. Zeige Hilfe-Overlay und Nummeriere Folien
    showPrintHelp();

    // 5. Optimiere Bilder für den Druck
    optimizeImagesForPrint();
  }

  /**
   * Fügt spezielle Druckstile hinzu
   */
  function addPrintStyles() {
    var style = document.createElement("style");
    style.textContent = `
      @media print {
        @page {
          size: 1210px 681px;
          margin: 0;
        }
        .reveal .slides {
          height: 681px !important;
        }
        .reveal .slides section {
          page-break-after: always !important;
        }
        body {
          margin: 0 !important;
          padding: 0 !important;
        }
        #pdf-help-overlay, #download-pdf, #keyboard-shortcut-hint {
          display: none !important;
        }
        .print-only-element {
          display: block !important;
        }
        
        /* Verbesserte Folien-Nummerierung */
        .slide-page-number {
          display: block !important;
          position: absolute;
          bottom: 10px;
          right: 10px;
          font-size: 12px;
          color: #777;
          background-color: rgba(255,255,255,0.7);
          padding: 2px 5px;
          border-radius: 3px;
        }
        
        /* QR-Code für Referenz zur Online-Version anzeigen */
        .slide-qr-code {
          display: block !important;
          position: absolute;
          bottom: 10px;
          left: 10px;
          width: 60px;
          height: 60px;
          opacity: 0.5;
        }
      }
    `;
    document.querySelector("head").appendChild(style);
  }

  /**
   * Zeigt ein Hilfe-Overlay für den Benutzer an
   */
  function showPrintHelp() {
    setTimeout(function () {
      // Erstelle das Hilfe-Overlay
      var helpOverlay = document.createElement("div");
      helpOverlay.id = "pdf-help-overlay";
      helpOverlay.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); z-index: 9999; color: white; padding: 40px; text-align: center; display: flex; flex-direction: column; justify-content: center;">
          <h2>PDF-Export wird vorbereitet</h2>
          <p>Der Druckdialog wird automatisch geöffnet.</p>
          <p>Bitte wählen Sie <strong>"Als PDF speichern"</strong> oder <strong>"Drucken in Datei"</strong> und bestätigen Sie.</p>
          <p>Wichtig: Aktivieren Sie die Option <strong>"Hintergrundgrafiken"</strong> im Druckdialog unter "Weitere Einstellungen".</p>
          <p>Zum Abbrechen schließen Sie den Druckdialog und <a href="javascript:history.back()" style="color: #42A8C0; text-decoration: underline;">klicken Sie hier</a>.</p>
          <button onclick="window.print(); return false;" style="margin: 20px auto; padding: 10px 20px; background: #42A8C0; border: none; color: white; cursor: pointer;">Drucken starten</button>
        </div>
      `;
      document.body.appendChild(helpOverlay);

      // Nummeriere die Folien und füge Seitenzahlen hinzu
      addSlideNumbers();

      // Automatisch den Druckdialog öffnen
      setTimeout(function () {
        window.print();
      }, 1500);
    }, 500);
  }

  /**
   * Nummeriert Folien und fügt sichtbare Seitenzahlen hinzu
   */
  function addSlideNumbers() {
    // Zähle die Gesamtzahl der Folien
    var slides = document.querySelectorAll(".reveal .slides section");
    var totalSlides = slides.length;

    // Füge jedem Slide Datenattribute und sichtbare Nummerierung hinzu
    slides.forEach(function (slide, index) {
      // Setze Datenattribute für die CSS-Selektoren
      slide.setAttribute("data-slide-num", index + 1);
      slide.setAttribute("data-total-slides", totalSlides);

      // Erstelle sichtbare Seitenzahl
      var pageNumber = document.createElement("div");
      pageNumber.className = "slide-page-number print-only-element";
      pageNumber.style.display = "none"; // Wird nur beim Drucken sichtbar
      pageNumber.textContent = "Seite " + (index + 1) + " / " + totalSlides;
      slide.appendChild(pageNumber);

      // Optional: Füge einen QR-Code für Verweise auf die Online-Version hinzu
      addSlideQRCode(slide);
    });
  }

  /**
   * Fügt einen QR-Code zu einer Folie hinzu, der auf die Online-Version verweist
   */
  function addSlideQRCode(slide) {
    // QR-Code nur für die erste Folie
    if (slide.getAttribute("data-slide-num") === "1") {
      var qrCode = document.createElement("img");
      qrCode.className = "slide-qr-code print-only-element";
      qrCode.style.display = "none"; // Wird nur beim Drucken sichtbar

      // QR-Code-URL (dynamisch generiert für die aktuelle Seite ohne print-pdf-Parameter)
      var currentURL = window.location.origin + window.location.pathname;
      var qrCodeURL =
        "https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=" +
        encodeURIComponent(currentURL);

      qrCode.src = qrCodeURL;
      qrCode.alt = "QR-Code für Online-Präsentation";
      slide.appendChild(qrCode);
    }
  }

  /**
   * Optimiert Bilder für den Druck
   */
  function optimizeImagesForPrint() {
    // Nach 1 Sekunde prüfen, wenn die Bilder geladen sein sollten
    setTimeout(function () {
      var images = document.querySelectorAll(".reveal .slides section img");
      images.forEach(function (img) {
        // Führe keine Änderungen bei bereits optimierten oder speziellen Bildern durch
        if (
          img.classList.contains("slide-qr-code") ||
          img.classList.contains("optimized-for-print")
        ) {
          return;
        }

        // Optimiere die Bilddarstellung für den Druck
        img.classList.add("optimized-for-print");
        img.style.maxWidth = "90%";
        img.style.maxHeight = "60vh";
        img.style.margin = "0 auto";
        img.style.display = "block";

        // Füge ein data-src Attribut hinzu, damit das Bild auch im PDF korrekt angezeigt wird
        if (!img.dataset.src && img.src) {
          img.dataset.src = img.src;
        }
      });
    }, 1000);
  }
});
