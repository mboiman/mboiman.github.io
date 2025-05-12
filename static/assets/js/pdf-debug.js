// Debugging-Skript für PDF-Export
console.log("PDF-Debug-Skript geladen");

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM geladen, suche nach PDF-Button");

  // PDF-Button abfangen
  var pdfButton = document.querySelector(".pdf-download-button");
  if (pdfButton) {
    console.log("PDF-Button gefunden, füge Event-Listener hinzu");

    pdfButton.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("PDF-Button wurde geklickt");

      // URL für den PDF-Export erstellen
      var currentUrl = window.location.href;

      // Entferne alle vorhandenen print-pdf Parameter
      currentUrl = currentUrl.replace(/[?&]print-pdf/gi, "");

      // Füge den Parameter hinzu
      var printUrl =
        currentUrl + (currentUrl.indexOf("?") >= 0 ? "&" : "?") + "print-pdf";

      console.log("Öffne PDF-Export-URL: " + printUrl);

      // Neues Fenster öffnen
      var newWindow = window.open(printUrl, "_blank");

      if (!newWindow) {
        console.error("Popup wurde blockiert!");
        alert(
          "Popup wurde blockiert. Bitte erlauben Sie Popups für diese Seite, um das PDF herunterladen zu können."
        );
      } else {
        console.log("PDF-Export-Fenster geöffnet");
      }

      return false;
    });
  } else {
    console.warn("PDF-Button nicht gefunden!");
  }

  // Prüfen, ob wir im PDF-Export-Modus sind
  var isPrintPDF = window.location.search.match(/print-pdf/gi);
  if (isPrintPDF) {
    console.log("Wir sind im PDF-Export-Modus");

    // Nach kurzer Verzögerung den Druck-Dialog öffnen
    setTimeout(function () {
      console.log("Öffne Druck-Dialog...");
      try {
        window.print();
        console.log("Druck-Dialog geöffnet");
      } catch (e) {
        console.error("Fehler beim Öffnen des Druck-Dialogs:", e);
      }
    }, 1500);
  }
});
