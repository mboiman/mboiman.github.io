/**
 * Enhanced PDF Export System
 * Optimiert die bestehende Website für professionelle PDF-Ausgabe
 */
document.addEventListener('DOMContentLoaded', function() {
  
  /**
   * Creates a PDF-optimized CV layout for browser printing
   * Converts the regular website to a professional CV format
   */
  function preparePDFExport() {
    console.log('🚀 Starting PDF CV layout generation...');
    
    // Check if we're already in PDF layout mode
    if (document.querySelector('.pdf-cv-layout')) {
      console.log('✅ PDF CV layout already active');
      return true;
    }
    
    // Create PDF-specific CV layout
    const pdfTemplate = `
<!DOCTYPE html>
<html lang="de" class="pdf-cv-layout">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Michael Boiman - Professional CV</title>
    
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        @page {
            size: A4 portrait;
            margin: 12mm 10mm 12mm 10mm;
        }
        
        @media print {
            body {
                font-family: 'Inter', 'Arial', sans-serif;
                font-size: 8.5pt;
                line-height: 1.4;
                color: #2c3e50;
                background: white;
                -webkit-font-smoothing: antialiased;
                text-rendering: optimizeLegibility;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
        }
        
        body {
            font-family: 'Inter', 'Arial', sans-serif;
            font-size: 8.5pt;
            line-height: 1.4;
            color: #2c3e50;
            background: white;
            -webkit-font-smoothing: antialiased;
            text-rendering: optimizeLegibility;
        }
        
        .cv-container { max-width: 100%; margin: 0; padding: 0; }
        
        .cv-header {
            display: grid;
            grid-template-columns: 80px 1fr;
            gap: 15px;
            align-items: center;
            padding: 15px 0;
            border-bottom: 2px solid #2d7788;
            margin-bottom: 15px;
        }
        
        .profile-photo {
            width: 75px; height: 75px; border-radius: 6px;
            border: 2px solid #e1e8ed; object-fit: cover;
        }
        
        .header-content h1 {
            font-size: 18pt; font-weight: 700; color: #2d7788; margin-bottom: 3px;
        }
        
        .header-tagline {
            font-size: 9pt; color: #5a6c7d; font-style: italic; margin-bottom: 8px;
        }
        
        .contact-grid {
            display: grid; grid-template-columns: 1fr 1fr;
            gap: 4px 20px; font-size: 7pt;
        }
        
        .contact-item {
            display: flex; align-items: center; gap: 4px;
        }
        
        .contact-item i { width: 10px; color: #2d7788; font-size: 6pt; }
        .contact-item a { color: #2d7788; text-decoration: none; }
        
        .ai-showcase {
            background: linear-gradient(135deg, #f8fafc 0%, #e3f2fd 100%);
            border-left: 4px solid #2d7788;
            padding: 12px 15px; margin: 15px 0;
            border-radius: 0 4px 4px 0;
        }
        
        .ai-showcase h2 {
            font-size: 11pt; font-weight: 600; color: #2d7788;
            margin-bottom: 8px; text-align: center;
        }
        
        .ai-skills-grid {
            display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
        }
        
        .ai-skill-card {
            background: white; padding: 8px; border-radius: 4px;
            border: 1px solid #e1e8ed;
        }
        
        .ai-skill-name {
            font-size: 7.5pt; font-weight: 600; color: #2d7788; margin-bottom: 3px;
        }
        
        .ai-skill-desc {
            font-size: 6.5pt; color: #5a6c7d; line-height: 1.3;
        }
        
        .cv-main {
            display: grid; grid-template-columns: 2fr 1fr;
            gap: 20px; margin-top: 15px;
        }
        
        .cv-section h2 {
            font-size: 10pt; font-weight: 600; color: #2d7788;
            margin: 12px 0 8px 0; padding-bottom: 3px;
            border-bottom: 1px solid #2d7788;
            text-transform: uppercase; letter-spacing: 0.5px;
        }
        
        .career-profile {
            background: #f8fafc; border-left: 4px solid #2d7788;
            padding: 12px; margin: 12px 0; border-radius: 0 4px 4px 0;
        }
        
        .career-profile h2 {
            margin-top: 0; margin-bottom: 8px; border: none; font-size: 10pt;
        }
        
        .career-profile p {
            font-size: 7pt; line-height: 1.4; margin-bottom: 6px;
        }
        
        .career-profile strong { font-weight: 600; color: #2d7788; }
        
        .experience-item {
            margin-bottom: 12px; padding: 10px; background: #f8fafc;
            border-left: 3px solid #2d7788; border-radius: 0 4px 4px 0;
            page-break-inside: avoid;
        }
        
        .experience-header {
            display: grid; grid-template-columns: 1fr auto;
            align-items: baseline; margin-bottom: 4px;
        }
        
        .experience-title {
            font-size: 8.5pt; font-weight: 600; color: #2d7788;
        }
        
        .experience-dates {
            font-size: 7pt; color: #7a8b9a; font-style: italic;
        }
        
        .experience-company {
            font-size: 7.5pt; font-weight: 500; color: #5a6c7d; margin-bottom: 6px;
        }
        
        .experience-details {
            font-size: 6.5pt; line-height: 1.4; color: #3c4858;
        }
        
        .experience-details p { margin-bottom: 4px; }
        .experience-details ul { margin: 4px 0 0 12px; padding: 0; }
        .experience-details li { margin-bottom: 2px; }
        
        .cv-sidebar {
            background: #f8fafc; padding: 15px; border-radius: 6px;
            border: 1px solid #e1e8ed; height: fit-content;
        }
        
        .sidebar-section { margin-bottom: 15px; }
        
        .sidebar-section h3 {
            font-size: 8pt; font-weight: 600; color: #2d7788;
            margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.3px;
        }
        
        .skills-list { display: flex; flex-wrap: wrap; gap: 3px; }
        
        .skill-tag {
            background: #e3f2fd; color: #2d7788; padding: 2px 6px;
            border-radius: 3px; font-size: 6pt; font-weight: 500;
            border: 1px solid #2d7788;
        }
        
        .education-item { margin-bottom: 8px; font-size: 6.5pt; }
        .education-degree { font-weight: 600; color: #2d7788; margin-bottom: 1px; }
        .education-school { color: #5a6c7d; margin-bottom: 1px; }
        .education-dates { color: #7a8b9a; font-style: italic; }
        
        .language-item {
            display: flex; justify-content: space-between;
            margin-bottom: 3px; font-size: 6.5pt;
        }
        
        .language-name { font-weight: 500; color: #2d7788; }
        .language-level { color: #5a6c7d; }
        
        .project-item {
            margin-bottom: 10px; padding: 8px; background: #f8fafc;
            border-left: 3px solid #2d7788; border-radius: 0 4px 4px 0;
            page-break-inside: avoid;
        }
        
        .project-title {
            font-size: 8pt; font-weight: 600; color: #2d7788; margin-bottom: 3px;
        }
        
        .project-tech { margin: 4px 0; }
        
        .tech-tag {
            background: #e1e8ed; color: #3c4858; padding: 1px 4px;
            border-radius: 2px; font-size: 5.5pt; font-weight: 500; margin-right: 3px;
        }
        
        .project-description {
            font-size: 6.5pt; line-height: 1.3; color: #3c4858; margin-top: 4px;
        }
        
        .page-break-before { page-break-before: always; }
        .page-break-avoid { page-break-inside: avoid; }
        .no-print { display: none !important; }
        
        /* Ensure print compatibility */
        @media print {
            .cv-container {
                width: 100% !important;
                max-width: none !important;
            }
            
            .cv-header, .ai-showcase, .cv-main, .experience-item, .project-item {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
        }
    </style>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div class="cv-container">
        <header class="cv-header">
            <div class="profile-image">
                <img src="../images/profile.png" alt="Michael Boiman" class="profile-photo">
            </div>
            <div class="header-content">
                <h1>Michael Boiman</h1>
                <div class="header-tagline">Quality Engineering & KI-Automatisierungsexperte • 4+ Jahre KI-Entwicklung • 20+ Jahre Qualitätssicherung</div>
                <div class="contact-grid">
                    <div class="contact-item">
                        <i class="fa fa-envelope"></i>
                        <a href="mailto:mboiman@gmail.com">mboiman@gmail.com</a>
                    </div>
                    <div class="contact-item">
                        <i class="fa fa-phone"></i>
                        <span>Auf Anfrage per E-Mail verfügbar</span>
                    </div>
                    <div class="contact-item">
                        <i class="fa fa-globe"></i>
                        <a href="http://boiman-kupermann.com">BKS Homepage</a>
                    </div>
                    <div class="contact-item">
                        <i class="fa fa-linkedin"></i>
                        <a href="//linkedin.com/in/michael-boiman-ab709912">michael-boiman</a>
                    </div>
                    <div class="contact-item">
                        <i class="fa fa-github"></i>
                        <a href="//github.com/mboiman">Persönliches GitHub</a>
                    </div>
                    <div class="contact-item">
                        <i class="fa fa-github"></i>
                        <a href="//github.com/bks-lab">BKS-Lab Organisation</a>
                    </div>
                </div>
            </div>
        </header>

        <section class="ai-showcase">
            <h2>Quality Engineering & KI-Kompetenzen</h2>
            <div class="ai-skills-grid">
                <div class="ai-skill-card">
                    <div class="ai-skill-name">Quality Engineering & AI-Automatisierung</div>
                    <div class="ai-skill-desc">Quality-First Automatisierung: E-Mail-Bots, Rechnungsverarbeitung, Workflow-Automatisierung mit 80% Aufwandsreduktion</div>
                </div>
                <div class="ai-skill-card">
                    <div class="ai-skill-name">KI-Quality Engineering Excellence</div>
                    <div class="ai-skill-desc">80% auto-generierte Tests & Test-Cases, IDE-Integration, Go/No-Go in Minuten statt Stunden</div>
                </div>
                <div class="ai-skill-card">
                    <div class="ai-skill-name">Next-Gen AI Protocols & Agentic Systems</div>
                    <div class="ai-skill-desc">MCP & A2A Protocol Implementation, Multi-Agent-Orchestrierung, JSON-RPC, sichere Agent-to-Agent Communication</div>
                </div>
                <div class="ai-skill-card">
                    <div class="ai-skill-name">RAG-Systeme & Enterprise NLP</div>
                    <div class="ai-skill-desc">Vector Embeddings, LangChain, Q&A-Bots, spaCy/NLTK, 95% Genauigkeit, EU-Standards</div>
                </div>
                <div class="ai-skill-card">
                    <div class="ai-skill-name">Multi-Cloud AI Architecture</div>
                    <div class="ai-skill-desc">Azure OpenAI, Google Cloud AI, Serverless MLOps, Auto-Scaling, Echtzeit-Monitoring</div>
                </div>
                <div class="ai-skill-card">
                    <div class="ai-skill-name">Transparenz & Business Intelligence</div>
                    <div class="ai-skill-desc">Real-time Dashboards, Qualitäts-Visualisierung, End-to-End-Monitoring, KPI-Automation</div>
                </div>
            </div>
        </section>

        <div class="cv-main">
            <div class="cv-content">
                <section class="career-profile page-break-avoid">
                    <h2>Karriereprofil</h2>
                    <p><strong>Quality Engineering & Enterprise AI-Experte</strong> mit 20+ Jahren Qualitätssicherung und 4 Jahren spezialisierter KI-Entwicklung. Transformiere Geschäftsprozesse durch messbare, ROI-optimierte Quality-Automatisierung:</p>
                    <p><strong>🎯 Quality Engineering Excellence</strong><br>
                    • <strong>20+ Jahre QE-Expertise:</strong> Testautomatisierung, CI/CD Quality Gates, End-to-End-Monitoring<br>
                    • <strong>KI-gesteuerte Testgenerierung:</strong> 80% automatisch generierte Test-Cases, 50% weniger Entwicklungszeit<br>
                    • <strong>Quality Dashboards:</strong> Real-time Monitoring mit 10 Test-Tools, Go/No-Go in Minuten statt Stunden</p>
                    <p><strong>🚀 Business Impact & ROI</strong><br>
                    • <strong>80% Aufwandsreduktion</strong> bei Automatisierung & Rechnungsverarbeitung mit <strong>messbaren Kosteneinsparungen</strong><br>
                    • <strong>80% weniger Rückfragen</strong> durch transparente Quality-Monitoring-Systeme</p>
                    <p><strong>🤖 AI Technology & NLP Excellence</strong><br>
                    • <strong>Enterprise LLMs:</strong> GPT-4, Claude, Gemini Integration mit Production-Grade Security<br>
                    • <strong>Agentic AI & Protocols:</strong> MCP, A2A Implementation für Multi-Agent-Orchestrierung<br>
                    • <strong>NLP & Dokumentenverarbeitung:</strong> spaCy, NLTK, Vector Databases (Pinecone, Elasticsearch), 95% Genauigkeit</p>
                </section>

                <section class="cv-section">
                    <h2>Berufserfahrung</h2>
                    
                    <div class="experience-item page-break-avoid">
                        <div class="experience-header">
                            <div class="experience-title">Quality Lead</div>
                            <div class="experience-dates">08/2021 – 05/2025</div>
                        </div>
                        <div class="experience-company">DVAG</div>
                        <div class="experience-details">
                            <p><strong>Testmanagement & Testkoordination</strong>, sowie Einführung von CICD mit Aufbau von QualityGates. Koordination als Quality-Lead (übergreifendes QA-Team) inklusive Einarbeitung, Hilfestellung, Beratung, Schulung zur Einführung von Qualitätsmetriken und Testautomatisierung innerhalb der Pipeline.</p>
                            <p><strong>Schwerpunkte:</strong></p>
                            <ul>
                                <li>Konzeption und Aufbau von fachlichen und technischen Dashboards mit Grafana zur Echtzeitmessung der Qualität</li>
                                <li>Aufbau und Konzeption einer CICD-Pipeline für verschiedene Entwicklungs-Teams (Backend + Frontend)</li>
                                <li>Einführung von QualityGates zur Sicherung der Qualität innerhalb der CICD-Pipeline</li>
                                <li>Einführung von Gauge (BDD) und Playwright, Integration in bestehende CICD-Pipeline</li>
                            </ul>
                        </div>
                    </div>

                    <div class="experience-item page-break-avoid">
                        <div class="experience-header">
                            <div class="experience-title">Technische Leitung & Entwicklung</div>
                            <div class="experience-dates">01/2024 – 04/2025</div>
                        </div>
                        <div class="experience-company">BKS</div>
                        <div class="experience-details">
                            <p><strong>Technische Leitung & Entwicklung:</strong> Konzeption und Umsetzung einer skalierbaren Automatisierungslösung für die Verarbeitung von E-Rechnungen und PDF-Rechnungen aus dem Postfach einer führenden Online-Jobplattform.</p>
                            <p><strong>Schwerpunkte:</strong></p>
                            <ul>
                                <li><strong>Workflow-Automatisierung:</strong> Extraktion, Analyse und Klassifizierung eingehender Rechnungen mittels Python und Azure Functions</li>
                                <li><strong>E-Rechnungs-Klassifizierung & Daten-Extraction:</strong> Vollständige Verarbeitung nach EU-Standards (EN 16931: ZUGFeRD, XRechnung)</li>
                                <li><strong>Monitoring & Logging:</strong> Echtzeit-Überwachung des End-to-End-Prozesses mit Kibana, inklusive Alerting und Dashboard-Erstellung</li>
                            </ul>
                        </div>
                    </div>

                    <div class="experience-item page-break-avoid">
                        <div class="experience-header">
                            <div class="experience-title">Technische Leitung & Entwicklung</div>
                            <div class="experience-dates">04/2023 - 04/2024</div>
                        </div>
                        <div class="experience-company">BKS im Auftrag für Ryze</div>
                        <div class="experience-details">
                            <p><strong>Projektmanagement & Technische Leitung:</strong> Entwicklung und Einführung eines KI-gesteuerten E-Mail-Bots zur Automatisierung der Kundenkommunikation, KI-gestützte Verarbeitung eingehender E-Mails und Auslösen von Folge-Aktivitäten in bestehenden SAP-Systeme.</p>
                            <p><strong>Schwerpunkte:</strong></p>
                            <ul>
                                <li><strong>Entwicklung von ML-Modellen:</strong> Entwurf und Training spezialisierter Modelle zur effektiven Klassifizierung von E-Mails</li>
                                <li><strong>API-Integrationen:</strong> Nahtlose Anbindung an Microsoft Outlook 365 über die Microsoft Graph API und an SAP-Systeme</li>
                                <li><strong>DevOps und Monitoring:</strong> Implementierung von CI/CD Pipelines sowie Einsatz von Kibana für das Monitoring</li>
                            </ul>
                        </div>
                    </div>

                    <div class="experience-item page-break-avoid">
                        <div class="experience-header">
                            <div class="experience-title">Quality-Lead</div>
                            <div class="experience-dates">01/2017 - 05/2021</div>
                        </div>
                        <div class="experience-company">DB Vertrieb</div>
                        <div class="experience-details">
                            <p><strong>Testmanagement, Testkoordination, Testautomatisierung - Agil (Kanban, Scrum, SAFE)</strong> Koordination als PO eines übergreifendes QA-Teams inklusive teamübergreifender Einarbeitung, Hilfestellung, Beratung, Schulung.</p>
                            <p><strong>Schwerpunkte:</strong></p>
                            <ul>
                                <li>Agile Qualitätssicherung durch Konzeption von QualityGates in der CI/CD Pipeline</li>
                                <li>Konzeption und Aufbau von fachlichen und technischen Dashboards mit Kibana, Graylog, Grafana, Instana & Elastic Search</li>
                                <li>Performance Tests innerhalb der CI/CD mit Gatling / JMeter und Analyse mittels Kibana, Graylog, Grafana und Instana</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section class="cv-section page-break-before">
                    <h2>Schlüsselprojekte</h2>
                    
                    <div class="project-item page-break-avoid">
                        <div class="project-title">Quality Dashboard - Echtzeit-Übersicht</div>
                        <div class="project-tech">
                            <span class="tech-tag">Grafana</span>
                            <span class="tech-tag">Elasticsearch</span>
                            <span class="tech-tag">Python</span>
                            <span class="tech-tag">CI/CD</span>
                            <span class="tech-tag">Playwright</span>
                        </div>
                        <div class="project-description">Vollautomatische End-to-End-Lösung für Echtzeit-Qualitätsübersicht mit 10 Test-Tools, 5 Umgebungen plus Multi-Source-Integration. Impact: -80% Rückfragen, Go/No-Go-Entscheidungen in Minuten statt Stunden.</div>
                    </div>

                    <div class="project-item page-break-avoid">
                        <div class="project-title">24/7 Automated Legacy Migration Validator</div>
                        <div class="project-tech">
                            <span class="tech-tag">Java</span>
                            <span class="tech-tag">Cucumber</span>
                            <span class="tech-tag">Kibana</span>
                            <span class="tech-tag">Elasticsearch</span>
                        </div>
                        <div class="project-description">Enterprise Legacy-Transformation mit vollautomatischer Qualitätssicherung. 24/7 Dual-Run Validation System mit intelligenter Abweichungsanalyse. Qualitätskennzahl von 30% auf 96% erhöht.</div>
                    </div>

                    <div class="project-item page-break-avoid">
                        <div class="project-title">E-Mail-Klassifizierung und -Verarbeitungsprozess</div>
                        <div class="project-tech">
                            <span class="tech-tag">Python</span>
                            <span class="tech-tag">Azure Functions</span>
                            <span class="tech-tag">OpenAI GPT-3.5</span>
                            <span class="tech-tag">Microsoft Graph API</span>
                        </div>
                        <div class="project-description">Vollständige Automatisierungslösung mit Microsoft Graph API, SAP RFC, Azure Functions, OpenAI GPT-3.5-Turbo, Elasticsearch 8.x, Kibana Dashboards - 80% Reduktion manueller Arbeit.</div>
                    </div>

                    <div class="project-item page-break-avoid">
                        <div class="project-title">MCP - Model Context Protokoll & A2A</div>
                        <div class="project-tech">
                            <span class="tech-tag">Python</span>
                            <span class="tech-tag">TypeScript</span>
                            <span class="tech-tag">JSON-RPC</span>
                            <span class="tech-tag">A2A Protocol</span>
                        </div>
                        <div class="project-description">Implementierung von Next-Generation AI-Interoperabilitäts-Protokollen: MCP (Anthropic, 2024) und A2A (Google, 2025) für sichere AI-zu-Tool-Verbindungen und Multi-Agent-Kollaboration.</div>
                    </div>
                </section>
            </div>

            <div class="cv-sidebar">
                <div class="sidebar-section">
                    <h3>Technische Skills</h3>
                    <div class="skills-list">
                        <span class="skill-tag">Quality Engineering</span>
                        <span class="skill-tag">Playwright</span>
                        <span class="skill-tag">Cucumber/Gauge</span>
                        <span class="skill-tag">Python</span>
                        <span class="skill-tag">LLMs & AI APIs</span>
                        <span class="skill-tag">LangChain</span>
                        <span class="skill-tag">CI/CD</span>
                        <span class="skill-tag">Kubernetes</span>
                        <span class="skill-tag">Azure Functions</span>
                        <span class="skill-tag">Grafana</span>
                        <span class="skill-tag">Elasticsearch</span>
                        <span class="skill-tag">REST APIs</span>
                        <span class="skill-tag">Docker</span>
                        <span class="skill-tag">JMeter</span>
                        <span class="skill-tag">Gatling</span>
                    </div>
                </div>

                <div class="sidebar-section">
                    <h3>Ausbildung</h3>
                    <div class="education-item">
                        <div class="education-degree">Diplom-Informatiker (FH)</div>
                        <div class="education-school">Fachhochschule Köln, Gummersbach</div>
                        <div class="education-dates">2000 – 2005</div>
                    </div>
                    <div class="education-item">
                        <div class="education-degree">ISTQB Certified Tester</div>
                        <div class="education-dates">2005</div>
                    </div>
                </div>

                <div class="sidebar-section">
                    <h3>Sprachen</h3>
                    <div class="language-item">
                        <span class="language-name">Deutsch</span>
                        <span class="language-level">Muttersprache</span>
                    </div>
                    <div class="language-item">
                        <span class="language-name">Englisch</span>
                        <span class="language-level">Fließend</span>
                    </div>
                    <div class="language-item">
                        <span class="language-name">Russisch</span>
                        <span class="language-level">Konversationslevel</span>
                    </div>
                    <div class="language-item">
                        <span class="language-name">Hebräisch</span>
                        <span class="language-level">Konversationslevel</span>
                    </div>
                </div>

                <div class="sidebar-section">
                    <h3>Zusätzliche Qualifikationen</h3>
                    <div class="skills-list">
                        <span class="skill-tag">Scrum Master</span>
                        <span class="skill-tag">Product Owner</span>
                        <span class="skill-tag">ISTQB Certified</span>
                        <span class="skill-tag">4+ Jahre KI-Entwicklung</span>
                        <span class="skill-tag">20+ Jahre QE</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
    `;
    
    // Replace the current document with the PDF-optimized layout
    document.open();
    document.write(pdfTemplate);
    document.close();
    
    console.log('✅ PDF CV layout generated successfully');
    return true;
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
  
  // Speichert den ursprünglichen Zustand aller Elemente
  function saveOriginalStateBeforePrint() {
    // Zurücksetzen der gespeicherten Stile
    Object.keys(originalStyles).forEach(key => delete originalStyles[key]);
    
    // Wichtige Elemente sichern
    const elementsToSave = [
      '.sidebar-wrapper',
      '.footer',
      '.cv-footer', 
      '.header-top',
      '.tech-tag'
    ];
    
    elementsToSave.forEach(selector => {
      const element = document.querySelector(selector);
      if (element) {
        saveOriginalStyles(element, ['display', 'background', 'color', 'transform', 'boxShadow']);
      }
    });
  }
  
  // Stellt den ursprünglichen Zustand wieder her
  function restoreOriginalStateAfterPrint() {
    // Ursprüngliche Stile wiederherstellen
    restoreOriginalStyles();
    
    // CSS-Klassen entfernen
    document.body.classList.remove('pdf-export-mode');
    
    const sidebarWrapper = document.querySelector('.sidebar-wrapper');
    if (sidebarWrapper) {
      sidebarWrapper.removeAttribute('data-print-mode');
    }
    
    // Temporäre Styles entfernen
    document.querySelectorAll('style').forEach(style => {
      if (style.textContent.includes('animation-delay: 0s')) {
        style.remove();
      }
    });
  }
  
  // Globale Funktionen für PDF-Export
  window.preparePDFPrint = preparePDFExport;
  window.preparePDFAndPrint = function() {
    try {
      console.log('🚀 Initiating PDF CV export...');
      
      // Generate PDF-optimized CV layout
      preparePDFExport();
      
      // Wait for layout to render and fonts to load
      setTimeout(function() {
        console.log('📄 Starting PDF print process...');
        window.print();
      }, 1000);
      
    } catch (error) {
      console.error('❌ PDF CV generation error:', error);
      // Fallback to simple print
      window.print();
    }
  };
  
  // Cleanup nach dem Drucken
  window.addEventListener('afterprint', function() {
    console.log('🧹 PDF export completed');
    // Note: With the new layout approach, we replace the entire document
    // so cleanup happens automatically when the user navigates away or refreshes
  });
  
  console.log('✅ PDF export system ready');
});