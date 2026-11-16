---
status: built
product: Latente (demo Selar/Rastrear)
slug: latente
source:
  repo: github.com/daniel-bernardino747/latente (clonado em promo/latente/src-repo, fora do git)
  url: https://latente-mu.vercel.app
  capture: promo/latente/capture
workflow: product-launch-video
flow: automation
storyboard: no
message: "A foto sai idêntica, mas carrega o nome de quem recebeu, e a própria imagem diz de onde vazou."
destination: landing          # na prática: tela (screen) do projeto no carrossel do portfólio, ADR-0018
aspect: 1200x630
language: pt-BR
audience: "visitantes do portfólio (recrutadores e clientes em potencial)"
length: 11.9s
angle: one-feature-deep
narration: no
---

## Intent

Inspirado no vídeo da DB Barbearia: uma tela em vídeo do projeto Latente no carrossel, muda, em loop, sem logo nem chamada no fim. O vídeo acompanha uma prévia só: a foto da noiva (a mesma do hero) é selada para "Maria Silva", a lente do hero passa sobre ela e mostra a assinatura escondida, e o rastreio devolve a entrega com o nome dela. **Assinatura de motion:** a mira do hero virando lente sobre a foto selada, levada pela mesma câmera contínua da barbearia (push vertical e zoom, sem cortes).

## Produto (o que foi capturado, 16/11/2026)

- Landing `index.html`: hero escuro "Sua assinatura vive dentro da foto — e ninguém a vê.", logotipo "Latente\Forense", "2048 bits de assinatura", noiva recortada com a mira (capture/index.png).
- Demo `#demo`, tema escuro (capture/dark-demo-*.png). A demo real foi rodada no Chrome com `capture/noiva-3x2.png` (recorte 3:2 de `assets-src/Gemini_Generated_Image_…jpg`, a foto de origem do hero) e os campos padrão: Maria Silva · galeria de prévia · prévia · antes do pagamento.
- Valores reais devolvidos pelo motor: trace id **A0412**, **700×** repetições, "≤ 1 nível · imperceptível"; no rastreio, "Assinatura recuperada ✓", "confiança 100% · 700 cópias lidas", data 16/11/2026.
- Imagens tiradas dos canvases da própria demo: `stage-original.png`, `stage-sealed.png` (pixels diferentes, visualmente iguais) e `stage-diff.png` (a diferença ×60 do botão "Ver a assinatura").

## Beats

| # | tempo | na tela | texto na tela | motion |
|---|---|---|---|---|
| 1 | 0.0-1.0 | Hero recriado (é o poster) | — | A câmera já desce no quadro 0 até o console da demo. |
| 2 | 1.0-3.2 | Aba Selar | Legenda: "A foto sai idêntica" | Cursor clica em "Selar imagem" (1.6s). A faixa de pontos verdes do hero varre a foto; a etiqueta vai de ORIGINAL para SELADA · IDÊNTICA; o readout (A0412, 700×, ≤ 1 nível) e os botões entram. |
| 3 | 3.2-5.8 | Foto selada, zoom 1.6× | Etiqueta da lente: "assinatura revelada" | A mira do hero vira lente e passa por rosto → buquê → vestido; dentro dela, a diferença da selagem. A câmera volta ao console. |
| 4 | 5.8-7.6 | Aba Rastrear | — | Clique em "Rastrear esta imagem →" (troca a aba como no site), clique em "Revelar assinatura", nova varredura. |
| 5 | 7.6-10.2 | Resultado, zoom 1.1× | Legenda: "Se vazar, ela diz de quem partiu" | Barra de confiança enche, as linhas entram, "entregue a · Maria Silva" ganha realce coral. |
| 6 | 10.2-11.9 | Resultado → hero | — | A câmera sobe; o último quadro é idêntico ao quadro 0. |

## Look & Motion

- Paleta do tema escuro de `src/style.css` (--bg #14110D, --surface #1E1914, --surface-2 #241E18, --ink #ECE6DC, --accent #E9694A, --good #7FBF97) e a do hero (--h-bg #100C08, --h-ink #EDE6DA).
- Tipos: Fraunces (títulos), Hanken Grotesk (interface e legendas), IBM Plex Mono (marcações e readout), em `video/assets/fonts/`.
- Câmera `power2.inOut`; entradas `expo.out`. Legendas em Hanken 600 36px, --h-ink sobre --h-bg com filete coral, uma por vez.

## Notes

- Entrega: `promo/latente/out/latente.mp4` (1200×630, 11.9s, H.264 CRF 22, 2,0 MB, mudo); o master do render é `out/latente-master.mp4` (4,0 MB, acima do limite de 3 MB).
- A diferença ×60 real é quase preta em tela pequena, então a imagem da lente foi clareada 3× (`lutrgb val*3`) e a etiqueta diz "assinatura revelada", sem número, para não afirmar uma ampliação que não é a do site.
- A noiva do hero leva o filtro "developed" do site embutido no arquivo (`noiva-hero.png`); o reel do hero é um recorte estático de capture/index.png.
- `check`: os dois erros de contraste restantes são cores do próprio site (o prefixo `// 00.03°` e a nota em --faint) e ficaram fiéis. Os avisos de texto pequeno são da interface recriada, como na barbearia.

## Log

- 2026-11-16 built: out/latente.mp4. Quadro 0 e último quadro idênticos byte a byte nos snapshots sem perda. Instalado com `npm run project:image -- latente --screen rastreio --file promo/latente/out/latente.mp4` → public/projects/latente/rastreio.mp4 + rastreio.webp. Falta: entrada em `images:` de career/corpus/accomplishments/latente.md (alt e tradução), a cargo do Daniel.
