<div align="center">

# Michael Boiman

### Freelance Quality Engineer & AI Architect · Frankfurt am Main

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=20&pause=1400&center=true&vCenter=true&width=760&height=40&lines=Quality+engineering+%C3%97+AI+architecture;Agents+with+gates+and+evidence;open-bridge+%C2%B7+A2A+agents+%C2%B7+lab-bench" alt="Quality engineering × AI architecture" />

**Available for new projects**

[![CV](https://img.shields.io/badge/CV-English-1f6feb?style=flat-square)](https://mboiman.github.io/en/)
[![Lebenslauf](https://img.shields.io/badge/Lebenslauf-Deutsch-1f6feb?style=flat-square)](https://mboiman.github.io/de/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-mboiman-0A66C2?style=flat-square)](https://www.linkedin.com/in/mboiman/)
[![Email](https://img.shields.io/badge/mboiman%40gmail.com-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:mboiman@gmail.com)

</div>

## Hi, I'm Michael

I'm a freelance quality engineer and AI architect in Frankfurt. Quality engineering and AI architecture run in parallel for me, not one after the other: the testing discipline is the reason my agents have gates and evidence instead of acting blind.

My background is enterprise quality engineering: test automation, performance engineering and quality dashboards in rail, financial services, industry and medical device certification. Today I build agent systems, measure which models carry a task, and build and operate e-invoicing services in production.

## What I'm working on

### open-bridge

[![release](https://img.shields.io/github/v/release/bks-lab/open-bridge?style=flat-square&label=release&color=1f6feb)](https://github.com/bks-lab/open-bridge/releases)
[![last commit](https://img.shields.io/github/last-commit/bks-lab/open-bridge?style=flat-square)](https://github.com/bks-lab/open-bridge/commits/main)
[![license](https://img.shields.io/github/license/bks-lab/open-bridge?style=flat-square)](https://github.com/bks-lab/open-bridge/blob/main/LICENSE)

[![open-bridge: a coding agent answers good morning from plain markdown and YAML in git (click for the 1:25 film)](https://raw.githubusercontent.com/bks-lab/open-bridge/main/docs/assets/video/open-bridge-loop.gif)](https://www.youtube.com/watch?v=pkieGFYcO88)

Stop re-explaining your work to your coding agent. open-bridge is plain markdown and YAML in git that Claude Code, Codex and Copilot CLI read at session start: repos, clients, rules, skills and a work log. A promote flow with a content leak gate in CI keeps private data out of the public core. We build it as a team at BKS-Lab and release it continuously under MIT.

[Repository](https://github.com/bks-lab/open-bridge) · [Demo page](https://bks-lab.github.io/open-bridge/) · [Film](https://www.youtube.com/watch?v=pkieGFYcO88)

### Agents that ask each other

Three A2A agents (a person, a company, an open source project) that query each other, read only, with a stateless MCP to A2A gateway in front so plain MCP clients reach them too. a2a-sdk, Agent Cards, JSON-RPC 2.0, streaming. One of them is the chat on my CV, and it forwards meeting requests to me for approval instead of booking on its own. [How the gateway works](https://bks-lab.github.io/open-bridge/agents.html#gateway)

### lab-bench

[![last commit](https://img.shields.io/github/last-commit/bks-lab/lab-bench?style=flat-square)](https://github.com/bks-lab/lab-bench/commits/main)

Which model carries a task on hardware we control? Open models run self-hosted via vLLM and Ollama and are measured on German retrieval for RAG, speech to text, invoice fields from page images and routing, with bootstrap intervals and McNemar tests rather than single numbers. The results are open. [Repository](https://github.com/bks-lab/lab-bench) · [Dataset](https://huggingface.co/datasets/bks-lab/lab-bench-results) · [Space](https://huggingface.co/spaces/bks-lab/lab-bench)

### E-invoicing in production

Peppol BIS 3.0 and EN 16931: outbound and inbound services on Azure Functions behind a certified Peppol access point, an ERP coupling over SOAP, and a mailbox channel for suppliers without Peppol (PDF, ZUGFeRD, XRechnung). Managed identity, Key Vault, separate pre and production environments. Client under NDA, so no code here.

## Try it

**Ask my CV agent.** It speaks A2A, so a terminal is enough:

```bash
curl -s https://mboiman.bks-lab.com/ \
  -H 'Content-Type: application/json' -H 'A2A-Version: 1.0' \
  -d '{"jsonrpc":"2.0","id":1,"method":"SendMessage","params":{"message":{"messageId":"hello-1","role":"ROLE_USER","parts":[{"text":"Which programming languages does Michael use most?"}]}}}'
```

Its [agent card](https://mboiman.bks-lab.com/.well-known/agent-card.json) lists what else it does: availability, meeting requests, questions about open-bridge. Or use the chat on the [CV page](https://mboiman.github.io/en/).

**Match your project.** Paste a project description on [mboiman.github.io/en/match](https://mboiman.github.io/en/match/) and the decision model Jev scores it against my CV, requirement by requirement.

## Stations

| When | Role | Sector |
|---|---|---|
| since 06/2025 | [LLM Infrastructure Architect & Automation Engineer](https://mboiman.github.io/en/#exp-bks-llm-infra) | Own firm, internal R&D |
| 09/2026-10/2026 | [AI Test Automation Engineer · Building the AI Test Automation Process](https://mboiman.github.io/en/#exp-kion) | Industrial group, customer portal |
| 09/2025-09/2026 | [Senior Quality Engineer · Test Automation and Monitoring](https://mboiman.github.io/en/#exp-tuev-sued) | Testing and certification, medical devices |
| 08/2021-05/2025 | [Platform Quality Architect (CI/CD, Monitoring, Automation)](https://mboiman.github.io/en/#exp-dvag) | Financial services |
| 01/2024-04/2025 | [Technical Lead & AI Automation Architect](https://mboiman.github.io/en/#exp-bks-ai-automation) | Client in the digital economy |
| 07/2024-01/2025 | [AI-driven QA Environment for Energy Infrastructure](https://mboiman.github.io/en/#exp-akkuswap) | Energy startup |

<details>
<summary>Earlier stations</summary>

| When | Role | Sector |
|---|---|---|
| 04/2023-04/2024 | [AI Engineering Lead & ML Solutions Architect](https://mboiman.github.io/en/#exp-ai-engineering-lead) | Publishing house |
| 06/2021-08/2021 | [Founder of a QA consultancy and a quality engineering community](https://mboiman.github.io/en/#exp-boiman-solutions) | Own firm |
| 01/2017-05/2021 | [DevOps Quality Lead & Dashboard Architect](https://mboiman.github.io/en/#exp-db-vertrieb) | Rail, sales |
| 09/2015-01/2017 | [Performance Engineering Lead & Test Architect](https://mboiman.github.io/en/#exp-db-systel) | Rail, IT services |
| 04/2015-09/2015 | [Senior iOS Developer & Mobile Architect](https://mboiman.github.io/en/#exp-telekom) | Telecommunications |
| 05/2009-03/2015 | [Quality Assurance Lead & Test Automation Architect](https://mboiman.github.io/en/#exp-siemens) | Industrial technology |
| 03/2009-05/2009 | [Performance Test Engineer & Load Testing Specialist](https://mboiman.github.io/en/#exp-ing-diba) | Banking |
| 09/2005-12/2008 | [Performance Test Engineer & Quality Consultant](https://mboiman.github.io/en/#exp-consulting-2006-2008) | QA consultancy, freelance |

</details>

**Talks and workshops**

- **04/2026** · [Guest Lecture: AI-Assisted Software Development in Practice](https://mboiman.github.io/en/#exp-tu-darmstadt)
- **06/2025** · [Workshop: Development with Generative Language Models](https://mboiman.github.io/en/#exp-workshop-genai)
- **04/2025** · [Presentation: Efficient Documentation through Automation](https://mboiman.github.io/en/#exp-presentation-ai-docs)
- **2023** · [Applications of AI in Business Context](https://mboiman.github.io/en/#exp-ki-workshop-business)

## Toolbox

**AI and agents**<br>
![Claude Code](https://img.shields.io/badge/Claude%20Code-D97757?style=for-the-badge&logo=claude&logoColor=white) ![GitHub Copilot](https://img.shields.io/badge/GitHub%20Copilot-000000?style=for-the-badge&logo=githubcopilot&logoColor=white) ![MCP](https://img.shields.io/badge/MCP-000000?style=for-the-badge&logo=modelcontextprotocol&logoColor=white) ![A2A](https://img.shields.io/badge/A2A-374151?style=for-the-badge) ![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white) ![Gemini](https://img.shields.io/badge/Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white) ![Ollama](https://img.shields.io/badge/Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white) ![vLLM](https://img.shields.io/badge/vLLM-30A2FF?style=for-the-badge&logo=vllm&logoColor=white) ![Hugging Face](https://img.shields.io/badge/Hugging%20Face-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)

**Quality engineering**<br>
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge) ![pytest](https://img.shields.io/badge/pytest-0A9EDC?style=for-the-badge&logo=pytest&logoColor=white) ![Selenium](https://img.shields.io/badge/Selenium-43B02A?style=for-the-badge&logo=selenium&logoColor=white) ![Cucumber](https://img.shields.io/badge/Cucumber-23D96C?style=for-the-badge&logo=cucumber&logoColor=white) ![JMeter](https://img.shields.io/badge/JMeter-D22128?style=for-the-badge&logo=apachejmeter&logoColor=white) ![Gatling](https://img.shields.io/badge/Gatling-FF9E2A?style=for-the-badge&logo=gatling&logoColor=white) ![LoadRunner](https://img.shields.io/badge/LoadRunner-0073E7?style=for-the-badge) ![Dynatrace](https://img.shields.io/badge/Dynatrace-1496FF?style=for-the-badge&logo=dynatrace&logoColor=white) ![Jira](https://img.shields.io/badge/Jira-0052CC?style=for-the-badge&logo=jira&logoColor=white)

**Languages and backend**<br>
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white) ![Bash](https://img.shields.io/badge/Bash-4EAA25?style=for-the-badge&logo=gnubash&logoColor=white) ![PowerShell](https://img.shields.io/badge/PowerShell-5391FE?style=for-the-badge)

**Cloud and operations**<br>
![Azure](https://img.shields.io/badge/Azure-0078D4?style=for-the-badge) ![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge) ![Google Cloud](https://img.shields.io/badge/Google%20Cloud-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white) ![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=cloudflare&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white) ![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white) ![Proxmox](https://img.shields.io/badge/Proxmox-E57000?style=for-the-badge&logo=proxmox&logoColor=white) ![Tailscale](https://img.shields.io/badge/Tailscale-242424?style=for-the-badge&logo=tailscale&logoColor=white)

**Observability**<br>
![OpenTelemetry](https://img.shields.io/badge/OpenTelemetry-425CC7?style=for-the-badge&logo=opentelemetry&logoColor=white) ![Elasticsearch](https://img.shields.io/badge/Elasticsearch-005571?style=for-the-badge&logo=elasticsearch&logoColor=white) ![Kibana](https://img.shields.io/badge/Kibana-E8478B?style=for-the-badge&logo=kibana&logoColor=white) ![Grafana](https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white) ![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=prometheus&logoColor=white)

<details>
<summary>Full skill list from my CV</summary>

| Area | Skills |
|---|---|
| **Quality Engineering** | Quality Engineering · Specification & Verification Design · Playwright · Behave / pytest (BDD) · Cucumber/Gauge · JMeter · Gatling |
| **AI & Agents** | Claude Code (Skills, Hooks, MCP) · Agent Harness Engineering · LLMs (Claude, Gemini, GPT) · Local LLMs (vLLM, Ollama) · LLM Evaluation & Benchmarks · Hugging Face (Spaces, Datasets) · Agent Orchestration (MCP & A2A) · a2a-sdk & Agent Cards · Google ADK · LangChain |
| **Delivery & Automation** | Python · TypeScript · FastAPI · JSON-RPC 2.0 & SSE · CI/CD · Docker & Container · REST APIs · Agile (Scrum/Kanban) |
| **Platform & Monitoring** | Peppol/E-Invoicing (EN 16931) · Azure Functions · Azure DevOps · Azure Monitor & KQL · Cloudflare (Workers, Pages, R2) · Microsoft 365 / Exchange Online · Grafana · Elasticsearch · Kibana · OpenTelemetry / OTLP |
| **More** | AWS · Google Cloud · VMware · PowerShell · LoadRunner (VuGen, Web HTTP/HTML, TruClient, Citrix) · SoapUI · Jira with Zephyr / Xray · Dynatrace · Jenkins · Instana |

</details>

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

<sub>Stations, talks, skills, education and languages are generated from the same TOML file as my <a href="https://mboiman.github.io/en/">CV</a> and checked in its CI. Every tool badge has to appear in the CV, or the build fails.</sub>
