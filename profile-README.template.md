<!-- Source for profile-README.md. Edit this file, then `npm run profile:readme`.
     Placeholders in double braces come from config.cv.toml (en); see scripts/profile-readme.mjs.
     No client or employer names on the profile (Michael, 2026-11-05): stations show a sector. -->
<div align="center">

# Michael Boiman

### {{tagline}}

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=20&pause=1400&center=true&vCenter=true&width=760&height=40&lines=Quality+engineering+%C3%97+AI+architecture;Agents+with+gates+and+evidence;open-bridge+%C2%B7+A2A+agents+%C2%B7+lab-bench" alt="Quality engineering × AI architecture" />

**{{availability}}**

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

{{experience: 6}}

**Talks and workshops**

{{talks}}

## Toolbox

**AI and agents**<br>
{{badges: Claude Code:claude:D97757 | GitHub Copilot:githubcopilot:000000 | MCP:modelcontextprotocol:000000 | A2A::374151 | LangChain:langchain:1C3C3C | Gemini:googlegemini:8E75B2 | Ollama:ollama:000000 | vLLM:vllm:30A2FF | Hugging Face:huggingface:FFD21E:black}}

**Quality engineering**<br>
{{badges: Playwright::2EAD33 | pytest:pytest:0A9EDC | Selenium:selenium:43B02A | Cucumber:cucumber:23D96C | JMeter:apachejmeter:D22128 | Gatling:gatling:FF9E2A | LoadRunner::0073E7 | Dynatrace:dynatrace:1496FF | Jira:jira:0052CC}}

**Languages and backend**<br>
{{badges: Python:python:3776AB | TypeScript:typescript:3178C6 | FastAPI:fastapi:009688 | Bash:gnubash:4EAA25 | PowerShell::5391FE}}

**Cloud and operations**<br>
{{badges: Azure::0078D4 | AWS::232F3E | Google Cloud:googlecloud:4285F4 | Cloudflare:cloudflare:F38020 | Docker:docker:2496ED | GitHub Actions:githubactions:2088FF | Proxmox:proxmox:E57000 | Tailscale:tailscale:242424}}

**Observability**<br>
{{badges: OpenTelemetry:opentelemetry:425CC7 | Elasticsearch:elasticsearch:005571 | Kibana:kibana:E8478B | Grafana:grafana:F46800 | Prometheus:prometheus:E6522C}}

<details>
<summary>Full skill list from my CV</summary>

{{skills}}

</details>

## Education

{{education}}

Languages: {{languages}}

## Activity

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://streak-stats.demolab.com/?user=mboiman&theme=github-dark-blue&hide_border=true" />
  <img alt="GitHub contribution streak of mboiman" src="https://streak-stats.demolab.com/?user=mboiman&hide_border=true" />
</picture>

---

<sub>Stations, talks, skills, education and languages are generated from the same TOML file as my <a href="https://mboiman.github.io/en/">CV</a> and checked in its CI. Every tool badge has to appear in the CV, or the build fails.</sub>
