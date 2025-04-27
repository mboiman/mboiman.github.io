/**
 * PDF-Optimierungsskript
 * Verbessert die Qualität des PDF-Exports
 */
document.addEventListener('DOMContentLoaded', function() {
  // PDF-Button Funktionalität
  const pdfButton = document.querySelector('.pdf-button');
  
  if (pdfButton) {
    pdfButton.addEventListener('click', function(e) {
      e.preventDefault();
      
      // PDF-Optimierungen vornehmen
      preparePDFExport();
      
      // Längere Verzögerung für bessere Renderergebnisse
      setTimeout(function() {
        window.print();
      }, 500);
    });
  }
  
  /**
   * Bereitet das Dokument für den PDF-Export vor
   */
  function preparePDFExport() {
    // Name des Nutzers für die Kopfzeile extrahieren
    const profileName = document.querySelector('.profile-container .name, .sidebar-wrapper h1')?.textContent.trim() || 'Lebenslauf';
    
    // Entfernt die blaue Hintergrundfarbe der Sidebar beim Drucken
    const sidebarWrapper = document.querySelector('.sidebar-wrapper');
    if (sidebarWrapper) {
      document.body.classList.add('pdf-export-mode');
      sidebarWrapper.setAttribute('data-print-mode', 'active');
    }
    
    // Footer ausblenden
    const footer = document.querySelector('.footer');
    if (footer) {
      footer.style.display = 'none';
    }
    
    // Profilbild optimieren - nur einmal anzeigen
    const profileImage = document.querySelector('.profile-container .profile');
    // Vorhandene temporäre Profilbilder entfernen
    document.querySelectorAll('.print-only-profile').forEach(img => img.remove());
    
    if (profileImage) {
      // Sicherstellen, dass das Bild vollständig geladen ist
      profileImage.style.display = 'block';
    }
    
    // Alle Skills-Level-Bars aktualisieren für bessere Anzeige
    document.querySelectorAll('.level-bar-inner').forEach(function(el) {
      // Originale Breite sichern
      const originalWidth = window.getComputedStyle(el).getPropertyValue('width');
      
      // Temporär auf 0 setzen und dann wieder auf Original
      el.style.width = '0';
      
      // CSS-Transition für Animation deaktivieren
      el.style.transition = 'none';
      
      // DOM-Update erzwingen
      void el.offsetWidth;
      
      // Originale Breite wieder setzen
      el.style.width = originalWidth;
    });
    
    // Wrapper-Element optimieren
    const wrapper = document.querySelector('.wrapper');
    if (wrapper) {
      wrapper.style.padding = '0';
      wrapper.style.margin = '0 auto';
    }
    
    // Erstellt einen temporären Stil für bessere PDF-Wiedergabe
    createCustomPrintStyle();
    
    return true;
  }
  
  /**
   * Erzeugt einen temporären Style-Tag mit zusätzlichen Print-Optimierungen
   */
  function createCustomPrintStyle() {
    // Vorhandene temporäre Stile entfernen
    document.querySelectorAll('style.pdf-temp-styles').forEach(s => s.remove());
    
    // Neuen Style-Tag erstellen
    const style = document.createElement('style');
    style.className = 'pdf-temp-styles';
    style.textContent = `
      @media print {
        /* Grundlegende Seitenformatierung */
        @page {
          size: A4 portrait !important;
          margin: 10mm 15mm 15mm 15mm !important; /* Oben, Rechts, Unten, Links */
        }
        
        /* Verhindern leerer Seiten am Ende */
        .footer, footer {
          display: none !important;
          height: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        /* Copyright-Info und powered-by ausblenden */
        .copyright, small.copyright, .footer .text-center {
          display: none !important;
          height: 0 !important;
        }
        }
        
        /* Verhindert leere erste Seite */
        @page :first {
          margin-top: 0 !important;
        }
        
        /* Grundlegende Formatierung */
        body { 
          background: white !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        /* Wrapper und Layout-Container */
        .wrapper {
          display: block !important;
          padding: 0 !important;
          margin: 0 auto !important;
          max-width: 100% !important;
        }
        
        /* Profil-Container optimieren */
        .sidebar-wrapper .profile-container {
          margin: 0 0 30px 0 !important;
          padding: 0 0 20px 0 !important;
          background-color: white !important;
          text-align: center !important;
        }
        
        /* Profilbild optimieren */
        .sidebar-wrapper .profile-container img.profile {
          width: 150px !important;
          height: auto !important;
          margin: 0 auto 15px auto !important;
          display: block !important;
          border: none !important;
        }
        
        /* Namen und Tagline optimieren */
        .profile-container .name {
          color: #2d7788 !important;
          font-size: 24pt !important;
          margin: 10px 0 5px 0 !important;
        }
        
        .profile-container .tagline {
          color: #778492 !important;
          font-size: 14pt !important;
          margin: 0 0 15px 0 !important;
        }
        
        /* Skill-Bars richtig anzeigen */
        .level-bar-inner {
          position: relative !important;
          display: block !important;
          box-shadow: inset 0 0 1px rgba(0,0,0,0.2) !important;
        }
        
        /* Abschnitte optimieren */
        .summary-section { margin-bottom: 30px !important; }
        .skills-section { margin-top: 25px !important; }
        .experiences-section .item { margin-bottom: 25px !important; }
        
        /* Hauptinhalt optimieren */
        .main-wrapper {
          float: none !important;
          width: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  // Print-Events abfangen
  window.onbeforeprint = function() {
    document.body.classList.add('printing');
    preparePDFExport();
  };
  
  window.onafterprint = function() {
    document.body.classList.remove('printing');
    
    // Temporäre Styles entfernen
    document.querySelectorAll('style.pdf-temp-styles').forEach(s => s.remove());
  };
});
