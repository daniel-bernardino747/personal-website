---
workflow: product-launch-video
flow: automation
storyboard: yes
message: "É um produto inteiro, não só uma landing: o cliente agenda sozinho e o dono gerencia o dia num painel."
destination: landing          # na prática: tela (screen) do projeto no carrossel do portfólio, ADR-0018
aspect: 1200x630
language: pt-BR
audience: "visitantes do portfólio (recrutadores e clientes em potencial)"
length: 11.9s
angle: one-feature-deep
narration: no
---

## Intent

Conceito 2, "Do clique ao painel". Uma tela em vídeo do projeto DB Barbearia no carrossel do portfólio do Daniel: muda, em loop e sem logo ou chamada no final, porque o card do projeto já cumpre esse papel. O vídeo acompanha um único agendamento: o cliente escolhe Cabelo, Bruno, Hoje e 11:00 no widget da landing e confirma. O resumo "Seu atendimento" se descola da página e voa em arco até a coluna do Bruno no painel "HOJE" do dono, onde pousa com o selo APP enquanto os KPIs contam. **Assinatura de motion:** o card que voa da landing para o painel, levado por uma câmera contínua. O tom é premium e contido, como o próprio site.

## Assets

- promo/db-barbearia/capture/index.png - hero (referência para recriar) - beats 1 e 6
- promo/db-barbearia/capture/index-full.png - página inteira; a seção de agendamento fica em y≈1700-2600 (referência) - beats 2-3
- promo/db-barbearia/capture/admin.png - painel "HOJE" (referência) - beats 4-5
- public/demos/db-barbearia/assets/ambiente/bg-pente-e-tesoura.jpg - fundo do hero - beat 1/6
- public/demos/db-barbearia/assets/equipe/hero.png - equipe recortada no hero - beat 1/6
- public/demos/db-barbearia/assets/equipe/bruno.webp, rafael.webp, caio.webp - avatares no widget e nos cabeçalhos da grade - beats 2, 5
- public/demos/db-barbearia/assets/marca/selo-branco.svg - selo DB no nav e na sidebar - beats 1, 5
- public/demos/db-barbearia/index.html e admin.html - fonte de verdade de CSS, tokens e markup para a recriação

## Customizations

- O quadro 0 é o poster com movimento reduzido (ADR-0018: o poster é o primeiro quadro). Hero completo e legível, sem elemento pela metade. O movimento do gancho vem só da câmera.
- O loop não pode ter corte: o último quadro é idêntico ao quadro 0.
- O card do painel não mostra nome de cliente: só "11:00–11:30", "Cabelo" e o selo "APP".
- KPIs: antes de animar 65→66 e R$ 4.572→R$ 4.632, confirme no demo real (agendar Cabelo/Bruno/hoje/11:00 pela landing e abrir o admin) que o painel soma o agendamento do app nesses KPIs. Se não somar, os KPIs ficam parados nos valores capturados.
- Os KPIs e a grade usam os valores de capture/admin.png. Se a grade real tiver o Bruno ocupado às 11:00, use o primeiro horário livre dele e atualize a legenda do resumo para combinar.
- Beat 1: 0.0-1.0 · Hero recriado: nav, título, fundo bg-pente-e-tesoura.jpg, equipe hero.png · "SENTE. RELAXE. SAIA OUTRO." (o próprio hero, já inteiro no quadro 0) · A câmera já está descendo no quadro 0. O título fica parado, legível (é o poster). · Push vertical até o widget de agendamento · -
- Beat 2: 1.0-4.2 · Widget de agendamento recriado (passos 1-4) e o painel "Seu atendimento" · Legenda: "O cliente agenda sozinho" · Cursor clica em Cabelo (1.3s) → Bruno (2.0s) → Hoje (2.6s) → 11:00 (3.2s). A cada clique, o resumo preenche uma linha: Cabelo · Bruno · Hoje, 11:00 · 30 min · R$ 60 · - · -
- Beat 3: 4.2-5.2 · O mesmo widget · - · Clique em "Confirmar horário". O resumo se descola (escala 1.04 e sombra) e vira um card. · - · -
- Beat 4: 5.2-6.6 · Do widget para o painel "HOJE" recriado (sidebar, KPIs, grade) · - · O card voa em arco. Por baixo, a câmera faz um pan lateral da landing para o painel. · Pan horizontal da câmera (mesma família do beat 1) · -
- Beat 5: 6.6-9.6 · Painel, enquadrado em 3 colunas (Rafael, Bruno, Caio), zoom ≈1.6×, com a linha das 11:00 · Legenda: "O dono vê na hora" · O card pousa na coluna do Bruno como "11:00–11:30 · Cabelo", com o selo APP. Um pulso menta passa pela coluna. Os KPIs contam 65 → 66 e R$ 4.572 → R$ 4.632 (ver Customizations). · - · -
- Beat 6: 9.6-11.9 · Painel → hero · - · Hold de 1.1s. A câmera sobe, e o último quadro é idêntico ao quadro 0. · Push vertical (o beat 1 ao contrário) · -
- Look & Motion: palette: #102A1E fundo (--night), #1B3F2D superfícies (--navy), #8AD7B0 destaque (--lav), #F2F5F3 texto (--paper), #B9CAC0 / #728C7B secundários (--mist / --steel), #D2D2D2 (--silver). Todos de `index.html` :root.
- Look & Motion: type: Big Shoulders Display 800 (títulos, KPIs), Libre Caslon Text (corpo da landing), Manrope 600 (legendas e interface). Google Fonts, a mesma URL do `index.html`.
- Look & Motion: easings: `cubic-bezier(.16,1,.3,1)` (o --ease do site) para entradas; `power2.inOut` para a câmera. Durações: entrada 0.5s, hold de pelo menos 1.2s por legenda, saída 0.35s.
- Look & Motion: transitions: uma família só, câmera contínua (push vertical e pan lateral). Sem fades nem cortes secos.
- Look & Motion: UI treatment: landing (hero e widget) e painel recriados em HTML a partir do markup/CSS reais, animados elemento por elemento, nos beats 1-6. Nada de screenshot deslizando.
- Look & Motion: legendas: Manrope 600, pelo menos 36px no quadro de 1200, cor --paper sobre uma faixa --night, uma por vez.
- Som: music: nenhuma (o vídeo é mudo; o `project:image` remove o áudio)
- Som: sfx: não
- Som: narration: no

## Notes

- Entrega: `promo/db-barbearia/out/db-barbearia.mp4`, 1200×630, 11.9s, H.264, abaixo de 3 MB. Depois: `npm run project:image -- <id do projeto> --screen agendamento --file promo/db-barbearia/out/db-barbearia.mp4`, que reencoda e escreve o poster a partir do primeiro quadro. Confirmar o id do projeto no Corpus antes de rodar.
- Limites do contrato (`src/lib/projects/image.ts`): no máximo 12s, no máximo 3 MB, proporção dentro de 3% de 1200:630.
- Leitura em tamanho pequeno (carrossel com ≈600-800px de largura): nada de texto de interface como mensagem. As legendas carregam a mensagem, e a grade aparece com zoom.
- O `npx hyperframes capture` foi bloqueado no servidor local (403). As capturas foram feitas com o Chrome headless a 1440×900.
