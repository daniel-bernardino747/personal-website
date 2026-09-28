# personal-website

Portfolio pessoal — Next.js 16 (App Router, React 19, TypeScript, Tailwind v4, `output: 'standalone'`, servidor no Railway — ADR-0007).

## Corpus

O Corpus e tudo que se gera dele moram no repo privado `career`, irmão deste checkout (`CORPUS_REPO`, padrão `../career`). Este site é só um leitor (ADR-0013): nunca faz parse do markdown. `npm run corpus:fetch` (rodado antes de `dev`, `build` e `test`; no `test`, só o JSON) grava em `.corpus/` o `site:json` (só o que o site publica: o filtro fica no `career`) e o `resume.pdf`. No deploy, `SITE_JSON` aponta o recorte Featured embutido pelo `bake-corpus`. Depois de editar o Corpus, rode `corpus:fetch` de novo ou reinicie o `dev`. Mudar o formato do `site:json` é mudar os dois repos juntos: `SITE_JSON_VERSION` em `src/lib/corpus/schema.ts` aqui e em `src/corpus/site-export.ts` lá.

**Deploy só por `npm run deploy` (ou `npm run build` antes de `railway up`), nunca `next build && railway up` à mão.** O `next build` sozinho rastreia o `.corpus/` inteiro para o artefato; o `bake-corpus` reduz ao recorte Featured e o `pack-deploy` recusa o pacote se sobrar algo (ADR-0008).

## Agent skills

### Issue tracker

Issues e specs vivem como markdown em `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Os cinco papéis canônicos, sem renomeações. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — `CONTEXT.md` na raiz (só os termos do site; o glossário do Corpus está no `career`) e ADRs em `docs/adr/`. Os ADRs do Corpus e das skills de carreira (0002–0005, 0009–0011, 0013) também ficam aqui, e o `career` aponta para eles. See `docs/agents/domain.md`.

## Tooling prerequisites

- **Tectonic** é obrigatório para o `dev` e o build: o `corpus:fetch` roda o `resume:pdf` do `career`, que gera o `/resume.pdf` (ADR-0009). Instale com `scoop install tectonic` (ou winget/cargo).

## Skills de carreira

`capture`, `generate`, `cover-letter` e `article` escrevem o Corpus ou renderizam a partir dele, e por isso moram no `career` (ADR-0013). Abra a sessão lá para usá-las. O `project:image` continua aqui, porque a imagem é apresentação do site (ADR-0012); o `capture` o chama por caminho.

## Prospect-me

Vive no repo `prospect-me`, irmão deste checkout. Lê o Corpus pelo `corpus:json` do `career`, não daqui (ADR-0011, ADR-0013).
