<!-- Source for profile-README.md. Edit this file, then `npm run profile:readme`.
     Placeholders in double braces come from config.cv.toml (en); see scripts/profile-readme.mjs. -->
<div align="center">

# Michael Boiman

### {{tagline}}

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=20&pause=1400&center=true&vCenter=true&width=760&height=40&lines=Quality+engineering+%C3%97+AI+architecture;Agents+with+gates+and+evidence;open-bridge+%C2%B7+A2A+agents+%C2%B7+lab-bench" alt="Quality engineering × AI architecture" />

**{{availability}}**

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

{{experience: 6}}

## Talks and workshops

{{talks}}

## Skills

{{badges: Claude Code:claude:D97757 | GitHub Copilot:githubcopilot:000000 | Python:python:3776AB | TypeScript:typescript:3178C6 | Playwright::2EAD33 | pytest::0A9EDC | FastAPI:fastapi:009688 | Azure::0078D4 | Docker:docker:2496ED | GitHub Actions:githubactions:2088FF | Cloudflare:cloudflare:F38020 | Elasticsearch:elasticsearch:005571 | Kibana:kibana:E8478B | Grafana:grafana:F46800 | OpenTelemetry:opentelemetry:425CC7 | Hugging Face:huggingface:FFD21E:black | Ollama:ollama:000000 | JMeter:apachejmeter:D22128}}

{{skills}}

## Education

{{education}}

Languages: {{languages}}

## Activity

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://streak-stats.demolab.com/?user=mboiman&theme=github-dark-blue&hide_border=true" />
  <img alt="GitHub contribution streak of mboiman" src="https://streak-stats.demolab.com/?user=mboiman&hide_border=true" />
</picture>

---

<sub>Experience, talks, skills, education and languages are generated from the same TOML file as my <a href="https://mboiman.github.io/en/">CV</a> and checked in its CI.</sub>
