# personal-website

Portfolio pessoal — Next.js 16 (App Router, React 19, TypeScript, Tailwind v4, `output: 'standalone'`, servidor no Railway — ADR-0007).

## Corpus

O Corpus e tudo que se gera dele moram no repo privado `career`, irmão deste checkout (`CORPUS_REPO`, padrão `../career`). Este site é só um leitor (ADR-0013): nunca faz parse do markdown. `npm run corpus:fetch` (rodado antes de `dev`, `build` e `test`) grava em `.corpus/` o `site:json` (só o que o site publica: o filtro fica no `career`) e o `resume.pdf`. No deploy, `SITE_JSON` aponta o recorte Featured embutido pelo `bake-corpus`. Depois de editar o Corpus, rode `corpus:fetch` de novo ou reinicie o `dev`. A migração segue `.scratch/corpus-leaves/`: as skills de carreira ainda rodam daqui até o ticket 04.

## Agent skills

### Issue tracker

Issues e specs vivem como markdown em `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Os cinco papéis canônicos, sem renomeações. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — `CONTEXT.md` na raiz e ADRs em `docs/adr/`. See `docs/agents/domain.md`.

## Tooling prerequisites

- **Tectonic** é obrigatório para renderizar currículos (`npm run render`), para o `resume:pdf` que o `career` roda a cada build (o `/resume.pdf`, ADR-0009) e para o smoke test em `src/lib/render/resume.test.ts` (o teste faz `skipIf` quando ausente). Instale com `scoop install tectonic` (ou winget/cargo) — é um binário único que baixa só os pacotes LaTeX usados.

### Capture

Interview que grava um Accomplishment ou Affiliation no Corpus (`../career/corpus/`), sem inventar número. See `.claude/skills/capture/SKILL.md`.

### Generate

Job posting → Selection estruturada → PDF de currículo via Tectonic (o modelo nunca escreve LaTeX). Também produz blocos LinkedIn/GitHub e currículo em português. Saída em `../career/generated/`. See `.claude/skills/generate/SKILL.md`.

### Cover letter

Job posting → Letter estruturada → PDF de carta de apresentação via Tectonic, par do currículo do `generate`. O que o Daniel fez vem do Corpus; por que ele quer a vaga vem só do que ele disse na sessão (ADR-0010). Saída em `../career/generated/letters/` (gitignored). See `.claude/skills/cover-letter/SKILL.md`.

### Prospect-me (antigo Recon)

Skill `/prospect-me`, que saiu deste repo: vive no repo `prospect-me` (irmão deste checkout), investiga a empresa, propõe 3 soluções digitais, e só aborda o decisor depois que uma delas foi construída. Ele lê o Corpus daqui por `npm run corpus:json` — o JSON validado pelo loader, só Accomplishments com Metric — e nunca parseia `../career/corpus/` sozinho; mudar o formato desse JSON é mudar um contrato com outro repo. Nunca rode `corpus:json` num build ou deploy. Ver ADR-0011.

### Article

Interview que escreve um Article (estudo de caso a partir do Corpus, ou ensaio técnico) em inglês, na voz do Daniel, sem inventar fato nem número. Grava em `../career/corpus/articles/<slug>.md` sempre como `status: draft`; só o Daniel marca `ready`. Ainda não há página que renderize Articles — ela é feita quando houver Articles `ready` suficientes. See `.claude/skills/article/SKILL.md`.
