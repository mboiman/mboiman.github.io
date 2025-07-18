/**
 * PDF-Optimierungsskript
 * Verbessert die Qualität des PDF-Exports
 */
document.addEventListener('DOMContentLoaded', function() {
  // PDF-Button Funktionalität - Deaktiviert, da onClick im HTML-Button verwendet wird
  // const pdfButton = document.querySelector('.pdf-button');
  
  // if (pdfButton) {
  //   pdfButton.addEventListener('click', function(e) {
  //     e.preventDefault();
  //     
  //     // Ursprünglichen Zustand speichern
  //     saveOriginalStateBeforePrint();
  //     
  //     // PDF-Optimierungen vornehmen
  //     preparePDFExport();
  //     
  //     // Längere Verzögerung für bessere Renderergebnisse
  //     setTimeout(function() {
  //       window.print();
  //     }, 500);
  //   });
  // }
  
  /**
   * Bereitet das Dokument für den PDF-Export vor
   */
  function preparePDFExport() {
    // Name des Nutzers für die Kopfzeile extrahieren
    const profileName = document.querySelector('.profile-container .name, .sidebar-wrapper h1')?.textContent.trim() || 'Lebenslauf';
    const profileTagline = document.querySelector('.profile-container .tagline')?.textContent.trim() || '';
    
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
    
    // Profilbild optimieren und neu positionieren
    const profileImage = document.querySelector('.profile-container .profile');
    // Vorhandene temporäre Profilbilder entfernen
    document.querySelectorAll('.print-only-profile').forEach(img => img.remove());
    
    // Hochwertige Kopfzeile für den PDF-Export erstellen
    createPDFHeader(profileName, profileTagline, profileImage);
    
    if (profileImage) {
      // Standardprofil anpassen
      profileImage.style.display = 'none'; // Originalbild ausblenden, wir nutzen eine Kopie
    }
    
    // Summary-Sektion optimieren
    const summarySection = document.querySelector('.summary-section');
    if (summarySection) {
      summarySection.style.pageBreakAfter = 'avoid';
      summarySection.style.pageBreakInside = 'avoid';
      // Zusammenfassung verkürzen, falls zu lang
      const summaryParagraph = summarySection.querySelector('.summary p');
      if (summaryParagraph && summaryParagraph.offsetHeight > 100) {
        summaryParagraph.style.fontSize = '10pt';
        summaryParagraph.style.lineHeight = '1.4';
      }
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
   * Erstellt eine professionelle Kopfzeile für den PDF-Export
   */
  function createPDFHeader(name, tagline, profileImage) {
    // Bestehenden Header entfernen falls vorhanden
    document.querySelectorAll('.pdf-professional-header').forEach(h => h.remove());
    
    // Neue professionelle Kopfzeile erstellen
    const header = document.createElement('div');
    header.className = 'pdf-professional-header';
    header.style.cssText = 'display:flex; width:100%; margin:0 auto 20px; padding:0 0 15px; border-bottom:2px solid #2d7788; page-break-after:avoid; page-break-inside:avoid;';
    
    // Layout für die erste Seite erstellen
    const headerHTML = `
      <div class="pdf-header-left" style="width:25%; padding-right:20px; text-align:center;">
        ${profileImage ? `<img class="pdf-header-image" src="${profileImage.src}" style="width:150px; height:auto; border-radius:5px; display:block; margin:0 auto 10px;" />` : ''}
      </div>
      <div class="pdf-header-right" style="width:75%; display:flex; flex-direction:column; justify-content:center;">
        <h1 style="margin:0 0 5px; padding:0; color:#2d7788; font-size:24pt; line-height:1.2;">${name}</h1>
        <p style="margin:0 0 15px; padding:0; color:#666; font-size:14pt; font-style:italic;">${tagline}</p>
        
        <!-- Kontaktzeile mit Icons -->
        <div class="pdf-header-contacts" style="display:flex; flex-wrap:wrap; margin-top:5px; font-size:10pt;">
          ${getContactItemsForHeader()}
        </div>
      </div>
    `;
    
    header.innerHTML = headerHTML;
    
    // Header an den Anfang des Dokuments einfügen
    const mainWrapper = document.querySelector('.main-wrapper');
    if (mainWrapper && mainWrapper.parentNode) {
      mainWrapper.parentNode.insertBefore(header, mainWrapper);
    }
    
    // Kontakt-Sektion neu positionieren
    repositionContactSection();
  }
  
  /**
   * Sammelt Kontaktinformationen für die Kopfzeile
   */
  function getContactItemsForHeader() {
    const contactItems = [];
    const contactList = document.querySelectorAll('.contact-container .list-unstyled li, .pdf-contact-list li');
    
    // Begrenzen auf maximal 4-5 Kontaktinformationen für eine saubere Darstellung
    const maxItems = 5;
    let count = 0;
    
    contactList.forEach(item => {
      if (count < maxItems) {
        const icon = item.querySelector('.fa');
        const link = item.querySelector('a');
        
        if (icon && link) {
          const iconClass = icon.className;
          const linkText = link.textContent.trim();
          const linkHref = link.getAttribute('href');
          
          contactItems.push(`
            <div class="pdf-contact-item" style="margin-right:20px; margin-bottom:8px;">
              <i class="${iconClass}" style="margin-right:5px; color:#2d7788;"></i>
              <a href="${linkHref}" style="color:#2d7788; text-decoration:none;">${linkText}</a>
            </div>
          `);
          
          count++;
        }
      }
    });
    
    return contactItems.join('');
  }
  
  /**
   * Positioniert die Kontakt-Sektion neu für das PDF-Layout
   */
  function repositionContactSection() {
    const contactSection = document.querySelector('.pdf-only-contact-section');
    const compactHeaderSection = document.querySelector('.compact-header-section');
    
    if (contactSection) {
      // Verbesserte Darstellung für die Kontaktsektion
      contactSection.style.display = 'none'; // Standardmäßig ausblenden, wir verwenden jetzt den Header
    }
    
    if (compactHeaderSection) {
      compactHeaderSection.style.display = 'none'; // Keine Verwendung mehr
    }
    
    // Summary-Sektion optimieren und direkt nach dem Header platzieren
    const summarySection = document.querySelector('.summary-section');
    if (summarySection) {
      summarySection.style.marginTop = '20px';
      summarySection.style.marginBottom = '25px';
      summarySection.style.pageBreakAfter = 'avoid';
      summarySection.style.pageBreakInside = 'avoid';
      
      // Umfasst die gesamte Seitenbreite
      summarySection.style.maxWidth = '100%';
    }
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
          margin: 15mm 12mm !important; /* Professionelle Ränder */
        }
        
        /* Optimierungen für professionelles Erscheinungsbild */
        html, body {
          font-size: 10pt !important;
          line-height: 1.4 !important;
          color: #333 !important;
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
        
        /* Professionelle Kopfzeile und Layout */
        .pdf-professional-header {
          display: flex !important;
          width: 100% !important;
          margin: 0 auto 20px auto !important;
          padding: 0 0 15px 0 !important;
          border-bottom: 2px solid #2d7788 !important;
          page-break-after: avoid !important;
          page-break-inside: avoid !important;
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
        
        /* Profil-Container ausblenden (wird ersetzt durch Header) */
        .sidebar-wrapper .profile-container {
          display: none !important;
        }
        
        /* Namen und Tagline optimieren */
        .pdf-professional-header h1 {
          color: #2d7788 !important;
          font-size: 24pt !important;
          margin: 0 0 5px 0 !important;
          line-height: 1.2 !important;
        }
        
        .pdf-professional-header p {
          color: #666 !important;
          font-size: 14pt !important;
          margin: 0 0 15px 0 !important;
          font-style: italic !important;
        }
        
        /* Profilbild im Header */
        .pdf-header-image {
          width: 150px !important;
          height: auto !important;
          border-radius: 5px !important;
          border: 1px solid #e8e8e8 !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
        }
        
        /* Skill-Bars richtig anzeigen */
        .level-bar-inner {
          position: relative !important;
          display: block !important;
          box-shadow: inset 0 0 1px rgba(0,0,0,0.2) !important;
        }
        
        /* Abschnitte optimieren */
        .section {
          margin-bottom: 1.5em !important;
          page-break-inside: avoid !important;
        }
        
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
        
        /* Sidebar-Inhalte für PDF-Layout neu strukturieren */
        .sidebar-wrapper {
          background-color: transparent !important;
          color: inherit !important;
          page-break-after: avoid !important;
          float: none !important;
          width: 100% !important;
        }
        
        /* Verbesserte Darstellung der Erfahrungen */
        .experiences-section .item {
          page-break-inside: avoid !important;
        }
        
        /* Verbesserte Skill-Darstellung */
        .skills-section {
          page-break-before: auto !important;
          page-break-inside: avoid !important;
        }
        
        /* Kontaktbereich ausblenden (wird im Header gezeigt) */
        .pdf-only-contact-section,
        .compact-header-section,
        .contact-container {
          display: none !important;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  // Speichern des ursprünglichen Seitenzustands
  const originalStyles = {};
  
  // Speichert den ursprünglichen Stil eines Elements
  function saveOriginalStyles(element, properties) {
    if (!element || !element.style) return;
    
    const id = element.id || `element_${Math.random().toString(36).substr(2, 9)}`;
    if (!element.id) element.id = id;
    
    if (!originalStyles[id]) originalStyles[id] = {};
    
    properties.forEach(prop => {
      originalStyles[id][prop] = element.style[prop];
    });
  }
  
  // Stellt den ursprünglichen Stil eines Elements wieder her
  function restoreOriginalStyles() {
    for (const id in originalStyles) {
      const element = document.getElementById(id);
      if (!element) continue;
      
      for (const prop in originalStyles[id]) {
        element.style[prop] = originalStyles[id][prop] || '';
      }
    }
  }
  
  // Print-Events abfangen - Deaktiviert, da onclick im HTML-Button verwendet wird
  // window.onbeforeprint = function() {
  //   // Ursprünglichen Zustand speichern
  //   saveOriginalStateBeforePrint();
  //   
  //   document.body.classList.add('printing');
  //   preparePDFExport();
  // };
  // 
  // window.onafterprint = function() {
  //   document.body.classList.remove('printing');
  //   
  //   // Temporäre Styles entfernen
  //   document.querySelectorAll('style.pdf-temp-styles').forEach(s => s.remove());
  //   
  //   // Ursprünglichen Zustand wiederherstellen
  //   restoreOriginalStateAfterPrint();
  // };
  
  // Speichert den ursprünglichen Zustand aller Elemente, die vom PDF-Export verändert werden
  function saveOriginalStateBeforePrint() {
    // Zurücksetzen der gespeicherten Stile
    Object.keys(originalStyles).forEach(key => delete originalStyles[key]);
    
    // Sidebar-Wrapper
    const sidebarWrapper = document.querySelector('.sidebar-wrapper');
    if (sidebarWrapper) {
      saveOriginalStyles(sidebarWrapper, ['backgroundColor', 'color', 'width', 'display']);
    }
    
    // Footer
    const footer = document.querySelector('.footer');
    if (footer) {
      saveOriginalStyles(footer, ['display', 'height', 'margin', 'padding']);
    }
    
    // Profile-Container
    const profileContainer = document.querySelector('.profile-container');
    if (profileContainer) {
      saveOriginalStyles(profileContainer, ['display', 'margin', 'padding', 'textAlign']);
    }
    
    // Profilbild
    const profileImage = document.querySelector('.profile-container .profile');
    if (profileImage) {
      saveOriginalStyles(profileImage, ['display', 'width', 'height', 'margin', 'border']);
    }
    
    // Kontakt-Sektion
    const contactSection = document.querySelector('.pdf-only-contact-section');
    if (contactSection) {
      saveOriginalStyles(contactSection, ['display', 'textAlign']);
      
      // Links in den Kontaktinformationen
      contactSection.querySelectorAll('a').forEach((link, index) => {
        saveOriginalStyles(link, ['color', 'borderBottom']);
      });
    }
    
    // Header-Sektion
    const compactHeaderSection = document.querySelector('.compact-header-section');
    if (compactHeaderSection) {
      saveOriginalStyles(compactHeaderSection, [
        'display', 'flexDirection', 'pageBreakAfter', 'pageBreakInside', 
        'textAlign', 'paddingBottom', 'marginBottom'
      ]);
    }
    
    // Summary-Sektion
    const summarySection = document.querySelector('.summary-section');
    if (summarySection) {
      saveOriginalStyles(summarySection, ['pageBreakAfter', 'pageBreakInside']);
      
      const summaryParagraph = summarySection?.querySelector('.summary p');
      if (summaryParagraph) {
        saveOriginalStyles(summaryParagraph, ['fontSize', 'lineHeight']);
      }
    }
    
    // Skills-Level-Bars
    document.querySelectorAll('.level-bar-inner').forEach((el, index) => {
      saveOriginalStyles(el, ['width', 'transition']);
    });
    
    // Wrapper-Element
    const wrapper = document.querySelector('.wrapper');
    if (wrapper) {
      saveOriginalStyles(wrapper, ['padding', 'margin']);
    }
  }
  
  // Stellt den ursprünglichen Zustand aller Elemente wieder her
  function restoreOriginalStateAfterPrint() {
    // Ursprüngliche Stile wiederherstellen
    restoreOriginalStyles();
    
    // Attribut entfernen
    const sidebarWrapper = document.querySelector('.sidebar-wrapper');
    if (sidebarWrapper) {
      sidebarWrapper.removeAttribute('data-print-mode');
    }
    
    // Spezielle PDF-Header entfernen
    document.querySelectorAll('.pdf-professional-header').forEach(el => el.remove());
    
    // Profile-Container wieder anzeigen
    const profileContainer = document.querySelector('.profile-container');
    if (profileContainer) {
      profileContainer.style.display = 'block';
    }
    
    // Profilbild wieder anzeigen
    const profileImage = document.querySelector('.profile-container .profile');
    if (profileImage) {
      profileImage.style.display = 'block';
    }
    
    // Sicherstellen, dass die PDF-only-Elemente wieder ausgeblendet sind
    const pdfOnlyElements = document.querySelectorAll('.pdf-only-contact-section, .print-only-contact-info');
    pdfOnlyElements.forEach(el => {
      if (el) el.style.display = 'none';
    });
    
    // Entfernen aller temporären Elemente
    document.body.classList.remove('pdf-export-mode');
  };
});
