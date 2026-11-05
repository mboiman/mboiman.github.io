<div align="center">

# Michael Boiman

### Freelance Quality Engineer & AI Architect · Frankfurt am Main

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=20&pause=1400&center=true&vCenter=true&width=760&height=40&lines=Quality+engineering+%C3%97+AI+architecture;Agents+with+gates+and+evidence;open-bridge+%C2%B7+A2A+agents+%C2%B7+lab-bench" alt="Quality engineering × AI architecture" />

**Available for new projects**

[![CV](https://img.shields.io/badge/CV-English-1f6feb?style=flat-square)](https://mboiman.github.io/en/)
[![Lebenslauf](https://img.shields.io/badge/Lebenslauf-Deutsch-1f6feb?style=flat-square)](https://mboiman.github.io/de/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-mboiman-0A66C2?style=flat-square)](https://www.linkedin.com/in/mboiman/)
[![Email](https://img.shields.io/badge/mboiman%40gmail.com-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:mboiman@gmail.com)
[![BKS-Lab](https://img.shields.io/badge/GitHub-bks--lab-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/bks-lab)

</div>

Quality engineer and AI architect based in Frankfurt am Main. Quality engineering and AI architecture run in parallel for me rather than in sequence: the testing discipline is the reason my agent setup has gates and evidence instead of acting blind. Everything below links to the thing itself.

## Evidence

| | What it is |
|---|---|
| **[open-bridge](https://github.com/bks-lab/open-bridge)** · [demo](https://bks-lab.github.io/open-bridge/) | Context layer for coding agents: plain markdown and YAML in git, read at session start by Claude Code, Codex and Copilot CLI. Skills, rules and a promote flow with a content leak gate in CI. MIT, built as a team at [BKS-Lab](https://github.com/bks-lab) |
| **[Agent network](https://bks-lab.github.io/open-bridge/agents.html#gateway)** | Three A2A agents (person, company, OSS project) that ask each other questions, read only, plus a stateless MCP to A2A gateway so plain MCP clients reach them too. a2a-sdk, Agent Cards, JSON-RPC 2.0 |
| **[lab-bench](https://github.com/bks-lab/lab-bench)** · [results](https://huggingface.co/datasets/bks-lab/lab-bench-results) · [Space](https://huggingface.co/spaces/bks-lab/lab-bench) | Which model carries a task on hardware we control: open models self-hosted via vLLM and Ollama, measured on German retrieval, speech to text, invoice fields and routing, with bootstrap intervals and McNemar tests |
| **[Live CV agent](https://mboiman.github.io/en/)** | The chat on my CV is an A2A agent: it answers questions about my experience, jumps to the station it talks about and forwards meeting requests, which I approve |
| **[Project match](https://mboiman.github.io/en/match/)** | Paste a project description and the decision model Jev scores it against my CV, requirement by requirement |
| **Peppol e-invoicing** | EN 16931 in production: outbound and inbound services on Azure Functions, a certified Peppol access point, SAP ByDesign over SOAP, a mailbox channel for suppliers without Peppol. Client under NDA, details in the CV |
| **[This CV](https://github.com/mboiman/mboiman.github.io)** | Astro site in German and English, PDFs via Puppeteer, content guards in CI. This profile page is rendered from the same file |

## Try the agent

The agent behind my CV speaks A2A. Ask it from a terminal:

```bash
curl -s https://mboiman.bks-lab.com/ \
  -H 'Content-Type: application/json' -H 'A2A-Version: 1.0' \
  -d '{"jsonrpc":"2.0","id":1,"method":"SendMessage","params":{"message":{"messageId":"hello-1","role":"ROLE_USER","parts":[{"text":"Which programming languages does Michael use most?"}]}}}'
```

Its [agent card](https://mboiman.bks-lab.com/.well-known/agent-card.json) lists what else it can do: availability, meeting requests, questions about BKS-Lab and open-bridge.

## Experience

| When | Role | Where |
|---|---|---|
| since 06/2025 | [LLM Infrastructure Architect & Automation Engineer](https://mboiman.github.io/en/#exp-bks-llm-infra) | BKS · AI Research & Development (internal) |
| 09/2026-10/2026 | [AI Test Automation Engineer · Building the AI Test Automation Process](https://mboiman.github.io/en/#exp-kion) | KION Group |
| 09/2025-09/2026 | [Senior Quality Engineer · Test Automation and Monitoring](https://mboiman.github.io/en/#exp-tuev-sued) | TÜV Süd |
| 08/2021-05/2025 | [Platform Quality Architect (CI/CD, Monitoring, Automation)](https://mboiman.github.io/en/#exp-dvag) | DVAG |
| 01/2024-04/2025 | [Technical Lead & AI Automation Architect](https://mboiman.github.io/en/#exp-bks-ai-automation) | BKS on behalf of a client in the digital economy |
| 07/2024-01/2025 | [AI-driven QA Environment for Energy Infrastructure](https://mboiman.github.io/en/#exp-akkuswap) | AkkuSwap Startup |

<details>
<summary>Earlier positions</summary>

| When | Role | Where |
|---|---|---|
| 04/2023-04/2024 | [AI Engineering Lead & ML Solutions Architect](https://mboiman.github.io/en/#exp-ai-engineering-lead) | BKS on behalf of a publishing house |
| 06/2021-08/2021 | [Founder: Boiman.Solutions and QualityCluster](https://mboiman.github.io/en/#exp-boiman-solutions) | Boiman.Solutions |
| 01/2017-05/2021 | [DevOps Quality Lead & Dashboard Architect](https://mboiman.github.io/en/#exp-db-vertrieb) | DB Vertrieb |
| 09/2015-01/2017 | [Performance Engineering Lead & Test Architect](https://mboiman.github.io/en/#exp-db-systel) | DB Systel |
| 04/2015-09/2015 | [Senior iOS Developer & Mobile Architect](https://mboiman.github.io/en/#exp-telekom) | Telekom |
| 05/2009-03/2015 | [Quality Assurance Lead & Test Automation Architect](https://mboiman.github.io/en/#exp-siemens) | Siemens |
| 03/2009-05/2009 | [Performance Test Engineer & Load Testing Specialist](https://mboiman.github.io/en/#exp-ing-diba) | ING-DIBA |
| 09/2005-12/2008 | [Performance Test Engineer & Quality Consultant](https://mboiman.github.io/en/#exp-consulting-2006-2008) | SQS AG · C1 SetCon (Performance Engineering) · freelance |

</details>

## Talks and workshops

- **04/2026** · [Guest Lecture: AI-Assisted Software Development in Practice](https://mboiman.github.io/en/#exp-tu-darmstadt) · TU Darmstadt · Information Systems Group · Lab course “AI Startup: From Idea to Execution”
- **06/2025** · [Workshop: Development with Generative Language Models](https://mboiman.github.io/en/#exp-workshop-genai) · Developer Workshop · Agent-based Software Development
- **04/2025** · [Presentation: Efficient Documentation through Automation](https://mboiman.github.io/en/#exp-presentation-ai-docs) · Enterprise Presentation · AI-powered Documentation Workflows
- **2023** · [Applications of AI in Business Context](https://mboiman.github.io/en/#exp-ki-workshop-business) · AI Workshop for Business Integration

## Skills

![Claude Code](https://img.shields.io/badge/Claude%20Code-D97757?style=for-the-badge&logo=claude&logoColor=white)
![GitHub Copilot](https://img.shields.io/badge/GitHub%20Copilot-000000?style=for-the-badge&logo=githubcopilot&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge)
![pytest](https://img.shields.io/badge/pytest-0A9EDC?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Azure](https://img.shields.io/badge/Azure-0078D4?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![Elasticsearch](https://img.shields.io/badge/Elasticsearch-005571?style=for-the-badge&logo=elasticsearch&logoColor=white)
![Kibana](https://img.shields.io/badge/Kibana-E8478B?style=for-the-badge&logo=kibana&logoColor=white)
![Grafana](https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white)
![OpenTelemetry](https://img.shields.io/badge/OpenTelemetry-425CC7?style=for-the-badge&logo=opentelemetry&logoColor=white)
![Hugging Face](https://img.shields.io/badge/Hugging%20Face-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)
![Ollama](https://img.shields.io/badge/Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white)
![JMeter](https://img.shields.io/badge/JMeter-D22128?style=for-the-badge&logo=apachejmeter&logoColor=white)

| Area | Skills |
|---|---|
| **Quality Engineering** | Quality Engineering · Specification & Verification Design · Playwright · Behave / pytest (BDD) · Cucumber/Gauge · JMeter · Gatling |
| **AI & Agents** | Claude Code (Skills, Hooks, MCP) · Agent Harness Engineering · LLMs (Claude, Gemini, GPT) · Local LLMs (vLLM, Ollama) · LLM Evaluation & Benchmarks · Hugging Face (Spaces, Datasets) · Agent Orchestration (MCP & A2A) · a2a-sdk & Agent Cards · Google ADK · LangChain |
| **Delivery & Automation** | Python · TypeScript · FastAPI · JSON-RPC 2.0 & SSE · CI/CD · Docker & Container · REST APIs · Agile (Scrum/Kanban) |
| **Platform & Monitoring** | Peppol/E-Invoicing (EN 16931) · Azure Functions · Azure DevOps · Azure Monitor & KQL · Cloudflare (Workers, Pages, R2) · Microsoft 365 / Exchange Online · Grafana · Elasticsearch · Kibana · OpenTelemetry / OTLP |
| **More** | AWS · Google Cloud · VMware · PowerShell · LoadRunner (VuGen, Web HTTP/HTML, TruClient, Citrix) · SoapUI · Jira with Zephyr / Xray · Dynatrace · Jenkins · Instana |

## Education

- **Diploma in Computer Science (UAS)**, Cologne University of Applied Sciences, Gummersbach (2000-2005)
- **ISTQB Certified Tester** (2005)
- **Certified Dynatrace Diagnostics Basic Training** (2007)

Languages: German (native), English (fluent (c1))

## Activity

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://streak-stats.demolab.com/?user=mboiman&theme=github-dark-blue&hide_border=true" />
  <img alt="GitHub contribution streak of mboiman" src="https://streak-stats.demolab.com/?user=mboiman&hide_border=true" />
</picture>

---

<sub>Experience, talks, skills, education and languages are generated from the same TOML file as my <a href="https://mboiman.github.io/en/">CV</a> and checked in its CI.</sub>
