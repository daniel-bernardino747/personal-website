# personal-website

Portfolio pessoal — Next.js 16 (App Router, React 19, TypeScript, Tailwind v4, `output: 'standalone'`, servidor no Railway — ADR-0007).

## Agent skills

### Issue tracker

Issues e specs vivem como markdown em `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Os cinco papéis canônicos, sem renomeações. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — `CONTEXT.md` na raiz e ADRs em `docs/adr/`. See `docs/agents/domain.md`.

## Tooling prerequisites

- **Tectonic** é obrigatório para o build (`/resume.pdf`, o currículo completo, é gerado no build — ver ADR-0009), para renderizar currículos (`npm run render`) e para o smoke test em `src/lib/render/resume.test.ts` (o teste faz `skipIf` quando ausente). Instale com `scoop install tectonic` (ou winget/cargo) — é um binário único que baixa só os pacotes LaTeX usados.

### Capture

Interview que grava um Accomplishment ou Affiliation no Corpus (`content/`), sem inventar número. See `.claude/skills/capture/SKILL.md`.

### Generate

Job posting → Selection estruturada → PDF de currículo via Tectonic (o modelo nunca escreve LaTeX). Também produz blocos LinkedIn/GitHub e currículo em português. Saída em `generated/` (gitignored). See `.claude/skills/generate/SKILL.md`.

### Cover letter

Job posting → Letter estruturada → PDF de carta de apresentação via Tectonic, par do currículo do `generate`. O que o Daniel fez vem do Corpus; por que ele quer a vaga vem só do que ele disse na sessão (ADR-0010). Saída em `generated/letters/` (gitignored). See `.claude/skills/cover-letter/SKILL.md`.

### Prospect-me (antigo Recon)

Skill `/prospect-me`, que saiu deste repo: vive no repo `prospect-me` (irmão deste checkout), investiga a empresa, propõe 3 soluções digitais, e só aborda o decisor depois que uma delas foi construída. Ele lê o Corpus daqui por `npm run corpus:json` — o JSON validado pelo loader, só Accomplishments com Metric — e nunca parseia `content/` sozinho; mudar o formato desse JSON é mudar um contrato com outro repo. Nunca rode `corpus:json` num build ou deploy. Ver ADR-0011.

### Article

Interview que escreve um Article (estudo de caso a partir do Corpus, ou ensaio técnico) em inglês, na voz do Daniel, sem inventar fato nem número. Grava em `content/articles/<slug>.md` sempre como `status: draft`; só o Daniel marca `ready`. Ainda não há página que renderize Articles — ela é feita quando houver Articles `ready` suficientes. See `.claude/skills/article/SKILL.md`.
