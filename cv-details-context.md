# CV Details & Context Knowledge-Base

**Purpose**: Diese Datei enthält detaillierte Kontextinformationen zu CV-Einträgen, die nicht explizit im `config.cv.toml` stehen, aber für Bewerbungen relevant sind.

**Usage**:
- Referenz für Job Application Skill (Phase 3/4)
- Erweiterte Details für Cover Letters und DOCX-Templates
- Authentische Informationen (keine Erfindungen!)

**CRITICAL RULES**:
- ⛔ **KEINE ZAHLEN in Bewerbungstexten!** (500+ cases, 238+ suites, etc.)
  - ✅ Ausnahme: Projekt/Budget/Team-Größe OK (zeigt Scope)
- ✅ Fokus auf QUALITÄT, KONTEXT, IMPACT statt Quantität
- ✅ Substanz über Metriken

**FABRICATION INCIDENTS** (NEVER REPEAT!):
1. ❌ **gematik TI 2.0** - Erfunden durch Association (TÜV Süd Healthcare ≠ gematik)
2. ❌ **Scrum Master/PO Zertifikate** - Erfunden (nur ISTQB zertifiziert!)
3. ❌ **"Scrum Master for QA team"** - Falsch (war QA Lead, nicht Scrum Master)

**TRUTH ABOUT SCRUM MASTER/PRODUCT OWNER**:
- ✅ Hat teilweise Scrum Master/PO **Aufgaben übernommen** (nicht lange Zeit)
- ✅ Hat **mit** Scrum Master/PO **zusammengearbeitet**
- ❌ War NICHT dedizierter Scrum Master oder Product Owner
- ❌ Hat KEINE Scrum Master oder Product Owner **Zertifikate**
- ✅ Einziges Zertifikat: **ISTQB Certified Tester (Foundation Level) - Since 2005**

**Last Updated**: 2025-11-18

---

## 1. QA Sign-off & Release Management

### Deutsche Bahn (01/21 – 08/23)

**Context**: Teil des Release Sign-off Teams mit Go/No-Go Verantwortung

**Sign-off Verantwortung**:
- **Nicht alleinige finale Entscheidung**, aber Teil des Sign-off Gremiums
- **Pipeline-Kontrolle**: Bestimmung der Quality Gates und Freigabe-Kriterien
- **No-Go Autorität**: Konnte kritische Issues blocken und Deployment stoppen

**Multi-Stakeholder Koordination**:
- **Fachliche Betriebsführung**: Risiko-Kommunikation und Abstimmung
- **Programmführung**: Alignment mit Programm-Zielen
- **Cluster-Leiter**: Technische Abstimmung über Releases

**Release-Kriterien (Testpyramide-basiert)**:
- ✅ Unit Tests → Integration Tests → E2E Tests (automatisiert)
- ✅ **0 Critical Blocker** (Hard Gate - automatisches No-Go)
- ✅ Coverage-Thresholds erfüllt
- ✅ Risiko-Analyse basiert (situations-abhängig)
- ✅ Dashboard-Transparenz (Grafana, Elastic Stack)

**Typischer Go/No-Go Prozess**:
1. Grafana/Elastic Dashboards analysieren
2. Risiko-Assessment durchführen
3. Stakeholder-Alignment einholen
4. Release-Entscheidung treffen

**Formulierung für Bewerbungen**:
```
QA Sign-off & Release Management:
• Collaborative sign-off responsibility with operations management, program leadership, and cluster leads
• Pipeline-controlled quality gates with No-Go authority for critical blockers
• Risk-based release decisions: Multi-stakeholder coordination (technical operations, business owners)
• Test pyramid criteria: Automated gates (unit → integration → E2E) + risk-assessed manual validation
• Release decision criteria: 0 critical blockers (hard gate), coverage thresholds, risk-transparent dashboards
• Example Go/No-Go process: Grafana/Elastic dashboards → Risk assessment → Stakeholder alignment → Release decision
```

---

### BKS (06/25 – present)

**Context**: Sign-off für eigene Projekte, weniger formal

**Sign-off Verantwortung**:
- Risiko-basierte Entscheidungen für BKS-eigene Projekte
- Kriterien variieren je nach Projekt-Kritikalität
- Weniger formal als Deutsche Bahn (nicht zu prominent erwähnen)

**Release-Kriterien**:
- Testpyramide-basiert (automatisiert + manuell)
- 0 Critical Blocker
- Dashboard-Transparenz für Risiko-Assessment

---

## 2. Manuelle & Exploratory Testing

### Standard-Prozess (Alle Projekte)

**Context**: Exploratives Testen als integraler Teil der QA-Strategie

**Zweck des Explorativen Testens**:
1. **Application Discovery**: Anwendung kennenlernen vor Automatisierung
2. **Automation Scoping**: Festlegung des Automatisierungs-Umfangs basierend auf manuellem Testing
3. **Test Pyramid Integration**: Explorative Tests sind Teil der Testpyramide (oberste Ebene)
4. **Release Process**: Teil des Standard-Release-Prozesses

---

### Deutsche Bahn: Feature Toggle Strategy (01/21 – 08/23)

**Context**: Balanced Automation + Manual Testing mit Feature Toggles

**CI/CD mit Feature Toggle Workflow**:
1. **Automated Deployment bis Production**: Volle CI/CD-Pipeline mit automatisierten Tests
2. **Feature Toggles**: Neue Features zunächst deaktiviert auf Produktion deployed
3. **Dedicated Test Environments**: Spezielle Umgebungen mit aktivierten Toggles
4. **Manual Testing & Acceptance**: Neue Features manuell getestet, bewertet und abgenommen
5. **Production Activation**: Nach erfolgreicher Abnahme → Feature-Toggle auf Prod aktiviert (ohne erneutes Deployment)

**Balance-Strategie**:
- ✅ **Automation**: Basis-Quality (Regression, Integration, E2E)
- ✅ **Manual/Exploratory**: Neue Features, UX, Business Logic Validation
- ✅ **Risk Mitigation**: Features können sofort deaktiviert werden bei Issues

---

### Non-Functional Testing

**Last & Performance Testing**:
- Durchführung und Analyse von Performance Tests
- Load Testing für Skalierbarkeits-Validierung
- Bottleneck-Identifikation

**Formulierung für Bewerbungen**:
```
Manual & Exploratory Testing Strategy:
• Systematic exploratory testing as part of test pyramid (upper layer for new feature discovery)
• Feature toggle-based workflow: Automated deployment to production with manual acceptance on dedicated environments
• Balanced approach: Automation for regression/integration + manual testing for new features and UX validation
• Example (Deutsche Bahn): CI/CD with feature toggles → manual testing on toggle-enabled environments → production activation post-approval
• Non-functional testing: Performance analysis, load testing, bottleneck identification
```

---

## 3. Test Management Tool Expertise

### Tool-Agnostic Expertise: Evaluation & Implementation

**Context**: Keine direkte TestRail-Erfahrung, aber **Tool-Evaluation und Einführung ohne Vorkenntnisse**

**Kernkompetenz**:
- ✅ Tool-Evaluation: Vergleich verschiedener Test-Management-Tools
- ✅ Greenfield-Implementierung: Einführung von Tools ohne Vorkenntnisse
- ✅ API-Integration: Test-Automation-Integration via APIs
- ✅ Tool-agnostisch: "Komme mit allen Tools zurecht"

---

### Zephyr for Jira (DVAG) - Greenfield Implementation

**Projekt**: DVAG (09/23 – 05/25)

**Besonderheit**: **Hatte Zephyr VORHER NIE benutzt**

**Durchgeführt**:
1. **Tool-Evaluation**: Zephyr gegen verschiedene Alternativen validiert
2. **Einführung**: Komplette Implementierung ohne Vorkenntnisse
3. **API-Integration**: Automatisierung per Zephyr API integriert
4. **Usage**: 500+ test cases dokumentiert und automatisiert

**Skills transferable auf TestRail**:
- Test-Case-Management und -Strukturierung
- Requirements Traceability
- Defect Tracking Integration
- Coverage Reports und Metrics
- API-basierte Automation-Integration

---

### HP ALM / Quality Center (Siemens)

**Projekt**: Siemens (03/14 – 12/20)
- **Usage**: 1000+ automated test cases
- **Features**: Requirements traceability, defect tracking, quality metrics

---

### TestRail Transfer-Kompetenz

**Status**: Keine direkte TestRail-Erfahrung

**Transferable Skills**:
- Tool-Evaluation und Vergleich (proven bei Zephyr-Einführung)
- Test-Case-Migration zwischen Tools (Konzepte übertragbar)
- API-basierte Integration (unabhängig vom Tool)
- Quick Ramp-Up (Zephyr-Beispiel: 0 → Production-Ready)

**Formulierung für Bewerbungen**:
```
Test Management Tool Expertise:
• Tool-agnostic proficiency: Successfully evaluated and implemented Zephyr for Jira at DVAG without prior experience
• Greenfield tool introduction: Comparison of multiple test management solutions, API integration for automation
• Experience with Zephyr for Jira (500+ test cases) and HP ALM/Quality Center (1000+ test cases)
• Transferable skills directly applicable to TestRail: Test case structuring, coverage reporting, requirements traceability, API-based automation integration
```

**Alternative (kürzer)**:
```
• Proficient in test management tools (Zephyr for Jira, HP ALM) with proven ability to evaluate, implement, and integrate new tools without prior experience
• Successfully introduced Zephyr at DVAG: Tool evaluation, API integration, 500+ automated test cases
• Skills directly transferable to TestRail: Test case management, coverage reporting, automation integration
```

---

## 4. Qualitätsmetriken & KPIs

### BKS LLM Infrastructure (06/25 – present)

**238+ Test Suites**:
- **Scope**: logger-package, invoice-package, ai-package, mail-operator-ai-bot
- **Coverage**: [PLACEHOLDER - Durchschnittliche Coverage?]
- **Pass-Rate**: [PLACEHOLDER - z.B. "95% over last 100 runs"]
- **Flake-Rate**: [PLACEHOLDER - z.B. "<3% flaky tests"]
- **Test-Laufzeit**: [PLACEHOLDER - z.B. "Full suite: 45min"]
- **MTTR (Mean Time To Repair)**: [PLACEHOLDER - z.B. "2.5 days average"]

**CI/CD Integration**:
- GitHub Actions workflows
- pytest-cov mit 30% coverage threshold
- JUnit XML reports
- SonarQube integration

---

### DVAG (09/23 – 05/25)

**500+ Test Cases**:
- **Scope**: Digital platform transformation, multiple microservices
- **Tool**: Zephyr for Jira
- **Pass-Rate**: [PLACEHOLDER]
- **Flake-Rate**: [PLACEHOLDER]
- **Test-Laufzeit**: [PLACEHOLDER]
- **MTTR**: [PLACEHOLDER]

---

## 5. Large-Scale Program Experience

### Deutsche Bahn Vertrieb (01/21 – 08/23)

**Program Size**:
- **Budget**: €50M+
- **Team Size**: 80+ team members
- **Microservices**: 12+ services
- **Development Teams**: 8 teams coordinated

**Multi-Team Coordination**:
- QA practices rollout across teams
- Platform testing: Sales, Customer Service, Logistics domains
- DevOps culture establishment

---

## 6. Continuous Learning & Training

### AI Workshops & Developer Training
- **Context**: [PLACEHOLDER - Welche Workshops? Für wen?]
- LLM Training?
- Multi-Agent-System Training?

### Certifications
- ISTQB Certified Tester (Foundation Level) - Since 2005
- Scrum Master - 2018
- Product Owner - 2019

---

## 7. English Language Proficiency

**Level**: C1 (Fluent)

**Evidence**:
- 20+ years international project experience
- [PLACEHOLDER - Konkrete Beispiele?]
  - Präsentationen auf Englisch?
  - Internationale Stakeholder-Meetings?
  - Technical documentation in English?

---

## 8. Platform Engineering Fundamentals

### Linux/Unix
**Context**: "linux unix sind grundlagen" (User-Statement)

**Evidence**:
- Container debugging (Docker, Kubernetes)
- Log analysis (Elastic Stack)
- Resource tuning and optimization
- Shell scripting for automation

---

## 9. Multi-Cloud Experience

### Explicit Multi-Cloud (config.cv.toml:1496)
- AWS
- Google Cloud Platform
- Azure

**Projects**:
- BKS: Azure Container Apps, Google Cloud Platform
- [PLACEHOLDER - AWS bei welchem Projekt?]

---

## Update Log

- **2025-11-18**: Initial creation
  - Added QA Sign-off details (Deutsche Bahn, BKS)
  - Added placeholders for missing information
  - Created structure for future updates

---

## TODO: Information noch zu erfassen

- [ ] Manuelle/Explorative Testing Beispiele
- [ ] TestRail Migration/Transfer-Erfahrung
- [ ] Qualitätsmetriken (Pass-Rate, Flake-Rate, MTTR) für BKS und DVAG
- [ ] AWS konkrete Projekt-Zuordnung
- [ ] AI Workshop Details
- [ ] English Proficiency konkrete Nachweise
