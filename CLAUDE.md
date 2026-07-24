# personal-website

Portfolio pessoal — Next.js 16 (App Router, React 19, TypeScript, Tailwind v4, static export via `output: 'export'`).

## Agent skills

### Issue tracker

Issues e specs vivem como markdown em `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Os cinco papéis canônicos, sem renomeações. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — `CONTEXT.md` na raiz e ADRs em `docs/adr/`. See `docs/agents/domain.md`.

## Tooling prerequisites

- **Tectonic** é obrigatório para renderizar currículos (`npm run render`) e para o smoke test em `src/lib/render/resume.test.ts` (o teste faz `skipIf` quando ausente). Instale com `scoop install tectonic` (ou winget/cargo) — é um binário único que baixa só os pacotes LaTeX usados.

### Capture

Interview que grava um Accomplishment ou Affiliation no Corpus (`content/`), sem inventar número. See `.claude/skills/capture/SKILL.md`.

### Generate

Job posting → Selection estruturada → PDF de currículo via Tectonic (o modelo nunca escreve LaTeX). Também produz blocos LinkedIn/GitHub e currículo em português. Saída em `generated/` (gitignored). See `.claude/skills/generate/SKILL.md`.
