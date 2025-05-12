/**
 * PPTX-Export-Modul für reveal.js Präsentationen
 * Nutzt pptxgenjs für die Konvertierung
 * v1.1.0
 */
(function () {
  "use strict";

  // Logger-Funktion
  function log(message, type = "info") {
    const prefix = "[PPTX-Export]";
    if (type === "error") {
      console.error(`${prefix} ERROR: ${message}`);
    } else if (type === "warn") {
      console.warn(`${prefix} WARN: ${message}`);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }

  // Exportiere die Hauptfunktion global
  window.pptxExport = function () {
    log("PPTX-Export-Funktion wird ausgeführt");
    exportSlides();
  };

  // Prüft, ob alle benötigten Bibliotheken geladen sind
  function checkDependencies() {
    if (typeof html2canvas === "undefined") {
      log("html2canvas nicht gefunden", "error");
      return false;
    }

    if (typeof pptxgen === "undefined") {
      log("pptxgenjs nicht gefunden", "error");
      return false;
    }

    return true;
  }

  // Hauptfunktion für den Export
  function exportSlides() {
    // Prüfen, ob Abhängigkeiten vorhanden sind
    if (!checkDependencies()) {
      showDependencyError();
      return;
    }

    // Status-Dialog anzeigen
    var statusDialog = createStatusDialog();
    document.body.appendChild(statusDialog);
    updateStatusDialog(statusDialog, "Initialisiere PowerPoint...", 0);

    try {
      // Präsentationstitel ermitteln
      var title = document.title || "Reveal.js Präsentation";
      var filename = title.replace(/[^a-zA-Z0-9]/g, "_") + ".pptx";

      // Neue PowerPoint-Präsentation erstellen
      var pptx = new pptxgen();
      pptx.layout = "LAYOUT_16x9";
      pptx.author = "Erstellt mit Reveal.js und PptxGenJS";
      pptx.subject = title;
      pptx.company = "Automatisch generiert";

      // Alle Folien erfassen
      captureAllSlides(pptx, statusDialog, filename);
    } catch (err) {
      log("Fehler beim Erstellen der Präsentation: " + err.message, "error");
      updateStatusDialog(statusDialog, "Fehler: " + err.message, 100, true);
    }
  }

  // Fortschritts-Dialog erstellen
  function createStatusDialog() {
    var dialog = document.createElement("div");
    dialog.id = "pptx-status-dialog";
    dialog.style.position = "fixed";
    dialog.style.top = "0";
    dialog.style.left = "0";
    dialog.style.width = "100%";
    dialog.style.height = "100%";
    dialog.style.backgroundColor = "rgba(0,0,0,0.8)";
    dialog.style.zIndex = "10000";
    dialog.style.display = "flex";
    dialog.style.justifyContent = "center";
    dialog.style.alignItems = "center";
    dialog.style.pointerEvents = "auto";

    var content = document.createElement("div");
    content.style.backgroundColor = "#fff";
    content.style.borderRadius = "8px";
    content.style.padding = "30px";
    content.style.maxWidth = "500px";
    content.style.width = "90%";
    content.style.textAlign = "center";
    content.style.pointerEvents = "auto";

    content.innerHTML = `
      <h3 style="margin-top: 0; color: #333;">PPTX-Export wird vorbereitet</h3>
      <div id="pptx-status-message" style="margin: 15px 0;">Initialisiere...</div>
      <div style="height: 20px; background-color: #f0f0f0; border-radius: 10px; margin: 20px 0;">
        <div id="pptx-progress-bar" style="height: 100%; width: 0%; background-color: #5cb85c; border-radius: 10px; transition: width 0.3s;"></div>
      </div>
      <button id="cancel-pptx-export" style="padding: 8px 15px; margin-top: 10px; background-color: #f0f0f0; border: none; border-radius: 4px; cursor: pointer;">Abbrechen</button>
    `;

    dialog.appendChild(content);

    // Abbrechen-Button-Handler
    setTimeout(() => {
      var cancelBtn = document.getElementById("cancel-pptx-export");
      if (cancelBtn) {
        cancelBtn.addEventListener("click", function () {
          if (document.body.contains(dialog)) {
            document.body.removeChild(dialog);
          }
        });
      }
    }, 100);

    return dialog;
  }

  // Status-Dialog aktualisieren
  function updateStatusDialog(dialog, message, progress, isError = false) {
    var statusMessage = document.getElementById("pptx-status-message");
    var progressBar = document.getElementById("pptx-progress-bar");

    if (statusMessage && progressBar) {
      statusMessage.textContent = message;
      progressBar.style.width = progress + "%";

      if (isError) {
        progressBar.style.backgroundColor = "#d9534f"; // Rot für Fehler

        // Bei Fehler Cancel-Button zu "Schließen" ändern
        var cancelBtn = document.getElementById("cancel-pptx-export");
        if (cancelBtn) {
          cancelBtn.textContent = "Schließen";
        }
      }
    }
  }

  // Alle Folien erfassen
  function captureAllSlides(pptx, statusDialog, filename) {
    var slides = document.querySelectorAll(
      ".reveal .slides section:not(.stack)"
    );
    var totalSlides = slides.length;

    log("Gefundene Folien: " + totalSlides);
    updateStatusDialog(statusDialog, `Erfasse Folien (0/${totalSlides})...`, 5);

    // Aktuelle Folie merken
    var currentIndices = Reveal.getIndices();

    // Liste der Versprechungen für das Erfassen aller Folien
    var capturePromises = [];
    var capturedSlides = [];

    // Für jede Folie
    slides.forEach(function (slide, index) {
      // Navigiere zu dieser Folie (wichtig für korrekte Darstellung)
      var slideIndices = Reveal.getIndices(slide);

      capturePromises.push(
        // Verzögerung zwischen den Folien (verhindert Überlastung)
        new Promise(function (resolve) {
          setTimeout(function () {
            Reveal.slide(slideIndices.h, slideIndices.v || 0);

            // Überschriften aus der Folie für den Foliennamen extrahieren
            var title = "Folie " + (index + 1);
            var headings = slide.querySelectorAll("h1, h2, h3");
            if (headings.length > 0) {
              title = headings[0].textContent;
            }

            // Forschritts-Update
            var progress = 5 + Math.floor((index / totalSlides) * 70);
            updateStatusDialog(
              statusDialog,
              `Erfasse Folie ${index + 1}/${totalSlides}: ${title}`,
              progress
            );

            // Warten, bis Übergänge und Animationen fertig sind
            setTimeout(function () {
              // Folie mit html2canvas erfassen
              html2canvas(slide, {
                scale: 2, // Höhere Qualität
                useCORS: true, // Cross-Origin Bilder erlauben
                allowTaint: true,
                backgroundColor: null,
              })
                .then(function (canvas) {
                  // Canvas zu Base64-Bild umwandeln
                  var imgData = canvas.toDataURL("image/png");

                  // Folie zum Array hinzufügen (mit Position, damit wir später sortieren können)
                  capturedSlides.push({
                    index: index,
                    title: title,
                    imgData: imgData,
                  });

                  resolve();
                })
                .catch(function (err) {
                  log(
                    "Fehler beim Erfassen von Folie " +
                      (index + 1) +
                      ": " +
                      err.message,
                    "error"
                  );
                  resolve(); // Trotzdem fortsetzen
                });
            }, 300); // Warten vor Erfassung
          }, index * 200); // Verzögerung zwischen den Folien
        })
      );
    });

    // Wenn alle Folien erfasst wurden
    Promise.all(capturePromises)
      .then(function () {
        // Zur ursprünglichen Folie zurückkehren
        Reveal.slide(currentIndices.h, currentIndices.v || 0);

        updateStatusDialog(statusDialog, "Erstelle PPTX-Datei...", 80);

        // Sortieren nach Index, damit die Reihenfolge stimmt
        capturedSlides.sort(function (a, b) {
          return a.index - b.index;
        });

        // Folien zur PPTX hinzufügen
        capturedSlides.forEach(function (capturedSlide, index) {
          var slide = pptx.addSlide();

          // Bild auf der Folie platzieren (Vollbild)
          slide.addImage({
            data: capturedSlide.imgData,
            x: 0,
            y: 0,
            w: "100%",
            h: "100%",
          });

          // Optional: Titel als Kommentar hinzufügen
          slide.addNotes(capturedSlide.title);
        });

        updateStatusDialog(statusDialog, "PPTX wird heruntergeladen...", 90);

        // PPTX-Datei herunterladen
        pptx
          .writeFile({ fileName: filename })
          .then(function () {
            log("PPTX-Export erfolgreich abgeschlossen");
            updateStatusDialog(
              statusDialog,
              "PPTX-Export abgeschlossen! Datei wird heruntergeladen.",
              100
            );

            // Dialog nach kurzer Verzögerung ausblenden
            setTimeout(function () {
              if (document.body.contains(statusDialog)) {
                document.body.removeChild(statusDialog);
              }
            }, 3000);
          })
          .catch(function (err) {
            log(
              "Fehler beim Schreiben der PPTX-Datei: " + err.message,
              "error"
            );
            updateStatusDialog(
              statusDialog,
              "Fehler beim Erstellen der PPTX-Datei: " + err.message,
              100,
              true
            );
          });
      })
      .catch(function (err) {
        log("Fehler beim Erfassen der Folien: " + err.message, "error");
        updateStatusDialog(
          statusDialog,
          "Fehler beim Erfassen der Folien: " + err.message,
          100,
          true
        );
        // Zur ursprünglichen Folie zurückkehren
        Reveal.slide(currentIndices.h, currentIndices.v || 0);
      });
  }

  // Fehlermeldung für fehlende Abhängigkeiten
  function showDependencyError() {
    var errorDialog = document.createElement("div");
    errorDialog.style.position = "fixed";
    errorDialog.style.top = "0";
    errorDialog.style.left = "0";
    errorDialog.style.width = "100%";
    errorDialog.style.height = "100%";
    errorDialog.style.backgroundColor = "rgba(0,0,0,0.8)";
    errorDialog.style.zIndex = "10000";
    errorDialog.style.display = "flex";
    errorDialog.style.justifyContent = "center";
    errorDialog.style.alignItems = "center";
    errorDialog.style.pointerEvents = "auto";

    var content = document.createElement("div");
    content.style.backgroundColor = "#fff";
    content.style.borderRadius = "8px";
    content.style.padding = "30px";
    content.style.maxWidth = "500px";
    content.style.width = "90%";
    content.style.pointerEvents = "auto";

    content.innerHTML = `
      <h3 style="margin-top: 0; color: #d9534f;">PPTX-Export-Fehler</h3>
      <p>Für den PPTX-Export sind folgende JavaScript-Bibliotheken erforderlich:</p>
      <ul>
        <li>html2canvas - zum Aufnehmen der Folien</li>
        <li>pptxgenjs - zum Erstellen der PowerPoint-Datei</li>
      </ul>
      <p>Die benötigten Abhängigkeiten konnten nicht geladen werden.</p>
      <div style="text-align: center; margin-top: 20px;">
        <button id="close-dependency-error" style="padding: 10px 20px; background-color: #d9534f; color: white; border: none; border-radius: 4px; cursor: pointer;">OK</button>
      </div>
    `;

    errorDialog.appendChild(content);
    document.body.appendChild(errorDialog);

    document
      .getElementById("close-dependency-error")
      .addEventListener("click", function () {
        document.body.removeChild(errorDialog);
      });
  }
})();
