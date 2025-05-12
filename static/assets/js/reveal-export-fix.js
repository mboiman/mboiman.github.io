/**
 * Fix für Klick-Probleme bei Overlay-Elementen in reveal.js
 *
 * Dieses Skript stellt sicher, dass export-buttons und andere overlay-elemente
 * korrekt angeklickt werden können, indem es die Event-Propagation kontrolliert.
 */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    // Warte, bis Reveal initialisiert ist
    setTimeout(function () {
      if (typeof Reveal !== "undefined") {
        console.log(
          "[Export-Fix] Initialisiere Klick-Fix für Reveal.js Overlays"
        );
        fixRevealClickIssues();
      } else {
        console.log("[Export-Fix] Reveal.js wurde nicht gefunden");
      }
    }, 1000);
  });

  function fixRevealClickIssues() {
    // Sammle alle Export-Buttons und Dialog-Elemente
    const overlayElements = document.querySelectorAll(
      ".export-button, .pdf-download-button, #export-dialog, .export-dialog, #export-dialog button, .export-dialog button"
    );

    // Hinzufügen einer unverzichtbaren Z-Index-Überschreibung und Klick-Control
    overlayElements.forEach(function (element) {
      // Stelle sicher, dass Element über Folien liegt
      element.style.zIndex = "9999";
      element.style.position = "relative";
      element.style.pointerEvents = "auto";

      // Stoppe Event-Propagation zu Reveal
      element.addEventListener(
        "click",
        function (e) {
          e.stopPropagation();
          e.stopImmediatePropagation();
        },
        true
      );

      // Mache sicher, dass auch Mausdown-Events nicht weitergeleitet werden
      element.addEventListener(
        "mousedown",
        function (e) {
          e.stopPropagation();
          e.stopImmediatePropagation();
        },
        true
      );
    });

    // Offensivere Methode: Events abfangen, bevor sie Reveal erreichen
    const revealElement = document.querySelector(".reveal");
    if (revealElement) {
      // Überwache Klick-Events auf dem Reveal-Container
      revealElement.addEventListener(
        "click",
        function (e) {
          // Überprüfe, ob ein Overlay-Element geklickt wurde
          const path = e.composedPath ? e.composedPath() : e.path || [];

          for (let i = 0; i < path.length; i++) {
            const element = path[i];
            if (
              element.classList &&
              (element.classList.contains("export-button") ||
                element.classList.contains("pdf-download-button") ||
                element.classList.contains("export-dialog") ||
                element.id === "export-dialog")
            ) {
              // Überspringen der Reveal-Navigation für dieses Event
              e.stopPropagation();
              e.preventDefault();
              return;
            }

            // Auch Button-Klicks in Dialogen erkennen
            if (
              element.tagName === "BUTTON" &&
              path.some(
                (p) =>
                  p.classList &&
                  (p.classList.contains("export-dialog") ||
                    p.id === "export-dialog")
              )
            ) {
              e.stopPropagation();
              e.preventDefault();
              return;
            }
          }
        },
        true
      );
    }

    // MutationObserver für dynamisch hinzugefügte Overlay-Elemente
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.addedNodes) {
          mutation.addedNodes.forEach(function (node) {
            // Überprüfen, ob neu hinzugefügte Nodes Overlay-Elemente sind
            if (
              node.nodeType === 1 &&
              (node.classList.contains("export-dialog") ||
                node.id === "export-dialog" ||
                node.classList.contains("export-button") ||
                node.classList.contains("pdf-download-button"))
            ) {
              // Stelle sicher, dass Element über Folien liegt
              node.style.zIndex = "9999";
              node.style.position = "relative";
              node.style.pointerEvents = "auto";

              // Event-Listener für Klicks hinzufügen
              node.addEventListener(
                "click",
                function (e) {
                  e.stopPropagation();
                  e.stopImmediatePropagation();
                },
                true
              );
            }
          });
        }
      });
    });

    // Überwache den body für dynamische Änderungen
    observer.observe(document.body, { childList: true, subtree: true });

    console.log("[Export-Fix] Klick-Fix erfolgreich installiert");
  }
})();
