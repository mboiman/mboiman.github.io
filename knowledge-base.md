# Michael Boiman - Knowledge Base

<IMPORTANT>
This file contains knowledge, concepts, and technologies I'm familiar with
but which are NOT documented in my CV (config.cv.toml).

**Purpose:**
- Separate factual CV experience from conceptual knowledge
- Provide context for "transferable skills" in applications
- Enable honest disclaimers: "While I don't have X, I understand..."

**Usage in Applications:**
- ✅ Can mention with disclaimer: "While I don't have direct X, I understand..."
- ✅ Shows learning ability and awareness
- ❌ NEVER claim as direct experience
- ❌ NEVER list in CV unless you add actual project
</IMPORTANT>

---

## Technologies I Know (but not in CV projects)

### Infrastructure & Cloud

**gematik TI 2.0 (Telematikinfrastruktur)**
- **Knowledge Level:** Conceptual understanding
- **Context:** Aware of German healthcare regulatory framework
- **Why not in CV:** No direct project experience
- **Transferable from:** TÜV Süd Healthcare compliance, regulated environments
- **Honest Disclaimer:**
  > "While I don't have direct gematik TI 2.0 project experience, I bring
  > extensive Healthcare compliance experience from TÜV Süd IDAS, including
  > auditor coordination and regulatory documentation in highly regulated
  > environments."

**GCP (Google Cloud Platform)**
- **Knowledge Level:** Conceptual understanding, no major production projects
- **Context:** Familiar with cloud-native concepts (same as Azure/AWS)
- **Why not in CV:** Primary experience is AWS/Azure
- **Transferable from:** AWS, Azure, Kubernetes (cloud-agnostic)
- **Honest Disclaimer:**
  > "While my production cloud experience focuses on AWS and Azure, the principles of
  > cloud-native architecture, container orchestration, and DevOps pipelines
  > transfer directly across cloud providers including GCP."

---

## Domain-Specific Knowledge

### Healthcare & Compliance

**FHIR (Fast Healthcare Interoperability Resources)**
- **Knowledge Level:** Aware of standard, no implementation
- **Context:** Know it's used for healthcare data exchange
- **Why not in CV:** TÜV Süd project didn't use FHIR
- **Honest Disclaimer:**
  > "While my TÜV Süd Healthcare project didn't use FHIR specifically, I'm
  > familiar with the standard and have experience testing REST APIs and
  > data validation in regulated environments."

### Financial Services

**SAP**
- **Knowledge Level:** General understanding, no direct implementation
- **Context:** Aware of ERP principles, testing approaches
- **Why not in CV:** No SAP-specific projects (but 6 years Siemens with ERP systems)
- **Transferable from:** Siemens ERP testing, enterprise system QA
- **Honest Disclaimer:**
  > "While I don't have direct SAP project experience, my 6 years at Siemens
  > included extensive ERP system testing, complex integration testing, and
  > enterprise workflow validation that transfers directly to SAP environments."

---

## Methodologies & Practices

### Testing Approaches

**Mobile Testing (iOS/Android)**
- **Knowledge Level:** Understand principles, tooling (Appium, etc.)
- **Context:** No production mobile app testing
- **Why not in CV:** Focus has been web/backend/API testing
- **Transferable from:** Playwright E2E, cross-browser testing, UI automation
- **Honest Disclaimer:**
  > "While my automation focus has been web-based, the principles of UI
  > automation, cross-platform testing, and E2E workflows transfer directly.
  > I'm confident in quickly adapting Playwright/Selenium expertise to mobile
  > frameworks like Appium."

---

## Certifications I'm Aware Of (but don't have)

**ISTQB Advanced/Expert Levels**
- **Status:** ISTQB Certified Tester (Foundation, since 2005)
- **Why not advanced:** Haven't pursued higher levels
- **Knowledge:** Familiar with advanced concepts through 20+ years practice

**CISM, CISSP (Security)**
- **Status:** Not certified
- **Knowledge:** Security-aware through banking/healthcare projects
- **Why not certified:** Focus on QE, not dedicated security role

---

## Professional Skills & Philosophies

### English Language Proficiency

**English C1 Professional Usage - Concrete Examples:**
- **TÜV Süd IDAS (2025-present):** 90% English working environment
  - Complete technical documentation in English (README, API docs, test specifications)
  - Daily stakeholder communication in English
  - International team collaboration
- **DVAG (2021-2025):** International teams with English as working language
- **20+ years:** Regular collaboration with international colleagues across multiple projects
- **Technical Writing:** All documentation, code comments, commit messages in English

**Why documented here:**
While C1 proficiency is listed in CV, these specific examples provide proof points for applications requiring evidence of professional English usage.

### Test Coverage Philosophy

**Risk-Based Coverage Approach:**
- **Core Principle:** Coverage is a risk-management tool, not a vanity metric
- **Practical Range:** 30%-80% depending on project risk profile, business criticality, and team capacity
- **Quality over Quantity:** Meaningful tests that catch real bugs > high coverage with brittle tests
- **Test Pyramid Enforcement:** Focus on unit tests (fast feedback), strategic integration, critical E2E paths
- **Flake Detection:** Prioritize test stability over coverage percentage
- **Business Context:** Coverage targets vary by:
  - Regulatory requirements (Healthcare: higher coverage)
  - Technical complexity (Legacy systems: targeted coverage)
  - Team maturity (Greenfield: build coverage incrementally)
  - Risk appetite (Financial services: comprehensive, Prototypes: minimal)

**Why documented here:**
This philosophy differentiates from "coverage percentage bragging" common in job applications. It demonstrates mature, context-aware quality engineering thinking.

**Example Usage in Applications:**
> "I approach test coverage as a risk-management tool, not a vanity metric. Projects range from 30%-80% coverage depending on risk profile—what matters is meaningful tests that catch real bugs, not arbitrary percentage targets. I prioritize test pyramid enforcement and flake stabilization over coverage maximization."

---

## How to Use This File in Applications

### ✅ GOOD: Honest Transferable

**Job requires:** "Experience with Terraform"
**CV has:** "Azure DevOps, IaC"
**Knowledge-base says:** "Familiar with Terraform concepts, no direct projects"

**Application writes:**
> "While I don't have direct Terraform experience, I have extensive IaC practice
> with Azure DevOps including declarative infrastructure, state management, and
> automated provisioning. The principles transfer directly, and I'm confident in
> quickly becoming productive with Terraform."

**Why this works:**
- ✅ Honest about gap
- ✅ Shows awareness of the technology
- ✅ Demonstrates transferable skills
- ✅ Signals learning ability

---

### ❌ BAD: Fabrication

**Job requires:** "gematik TI 2.0 coordination"
**CV has:** "TÜV Süd Healthcare"
**Knowledge-base says:** "Conceptual understanding, no project"

**Application SHOULD NOT write:**
> "Experience coordinating with gematik and auditors"

**Why this fails:**
- ❌ Claims experience that doesn't exist
- ❌ Will be exposed in interview
- ❌ Damages credibility
- ❌ grep -i 'gematik' config.cv.toml → NOT FOUND

---

## Maintenance

**When to add entries:**
- You learn a new technology (courses, reading) but haven't used it in a project
- You're aware of industry standards but haven't implemented them
- You understand concepts but lack production experience

**When to REMOVE entries:**
- You complete a project using the technology → MOVE TO CV!
- You get certified → UPDATE CV with certification

**When to UPDATE entries:**
- Your knowledge level changes (conceptual → hands-on learning)
- You find better transferable skills to reference
- You improve your disclaimer phrasing

---

## Integration with job-application Skill

The job-application skill will:
1. Check CV first (config.cv.toml) for direct experience
2. If not found, check knowledge-base.md for transferable
3. If in knowledge-base, use provided disclaimer
4. If nowhere, report as gap

**Phase 3.5 CV Validation will:**
- ✅ Allow knowledge-base mentions WITH disclaimers
- ❌ Block direct claims of knowledge-base items
- ✅ Require specific CV reference OR knowledge-base reference

---

<IMPORTANT>
This file is your safety net for honest, transferable skill communication.

**Golden Rule:**
If it's not in CV and not in knowledge-base → You cannot mention it.

**Honesty Policy:**
Better to say "I don't know X" than to fabricate and fail in interview.

**Learning Signal:**
Mentioning knowledge-base items WITH disclaimers shows:
- Self-awareness
- Learning ability
- Honesty
- Industry awareness
</IMPORTANT>
