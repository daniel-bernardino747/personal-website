# Formulário de agendamento (PT)

Versão em português de [`booking-intake.md`](booking-intake.md). As perguntas anexadas ao evento `get-off-the-ground` e como as respostas viram uma conversa de 15 minutos.

Use esta versão se o cliente que você quer é brasileiro. Nesse caso o CTA do site e a descrição do evento no cal.com também precisam virar — hoje ambos estão em inglês (`src/components/layout/Navbar.tsx:118`, `src/components/chat/ChatHeader.tsx:73`).

## A regra

Toda pergunta ou **desqualifica a call antes dela acontecer**, ou **tira um minuto dela**. Pergunta que só mata curiosidade é pergunta que custa agendamento — cada campo a mais derruba a taxa de conclusão. Cinco campos é o teto.

## O formulário

Tipo de campo do cal.com entre colchetes. Nome e e-mail já são nativos; estas vêm depois.

### 1. O que existe hoje? — obrigatória *[Radio Group]*

- Nada ainda — é uma ideia
- Um documento, spec ou planilha
- Um protótipo ou MVP que roda
- Um produto em produção com usuários reais

*Por quê:* define o formato inteiro da call antes dela começar. "Nada ainda" e "em produção" são duas conversas diferentes, e saber qual delas é economiza os primeiros cinco minutos de descoberta.

### 2. O que está travando agora? — obrigatória *[Long Text]*

Placeholder: `Duas ou três frases. O que está travado de verdade, não o histórico inteiro.`

*Por quê:* é a única pergunta que não dá para inferir. É também o filtro honesto — quem não consegue nomear o bloqueio em três frases ainda não tem um.

### 3. Se isso der certo, o que é verdade em 90 dias? — obrigatória *[Short Text]*

Placeholder: `Primeiro cliente pagante. Time fora da planilha. Demo que sobrevive a investidor.`

*Por quê:* transforma um pedido vago em alvo. Sem isso a call termina em concordância e nenhuma decisão.

### 4. Link do que já existe — opcional *[URL]*

Placeholder: `Repositório, Figma, deck, landing page, até a planilha.`

*Por quê:* cinco minutos lendo isso antes valem quinze minutos de descrição na call.

### 5. Quem mais precisa dizer sim? — opcional *[Short Text]*

*Por quê:* nomeia o decisor real cedo. Se não for quem agendou, o objetivo da call muda de "decidir" para "municiar essa pessoa para convencer outra".

## Os 15 minutos

| Minutos | O que acontece | Alimentado por |
|---|---|---|
| 0–2 | Devolvo o bloqueio com minhas palavras e deixo corrigir | P2 |
| 2–6 | O que existe de fato, o que sustenta peso, o que é descartável | P1, P4 |
| 6–11 | Caminho mais curto até o resultado de 90 dias — nomeado, não brainstormado | P3 |
| 11–14 | O primeiro passo, e se ele precisa de mim | P1, P5 |
| 14–15 | Uma próxima ação com data, ou um não honesto | — |

A preparação é ler as quatro respostas e o link. Se a preparação passa de cinco minutos, o formulário está pedindo pouco demais ou a call está escopada grande demais.

## Encerrar cedo é recurso, não falha

Diga isso nos primeiros cinco minutos quando:

- O bloqueio da P2 for um problema de **contratação** ou de **vendas** fantasiado de técnico
- A P1 for "nada ainda" **e** a P3 não couber em uma frase — isso é conversa de posicionamento, não de construção
- A resposta real for uma ferramenta que dá para comprar hoje

Terminar no sexto minuto com um "não é comigo, é com fulano" direto é o que torna verdadeira a promessa da página de agendamento. A descrição já se compromete com isso — *"se não for comigo, eu te falo isso também."*

## Descrição do evento em português

Para colar no cal.com se o funil virar PT:

> Você tem uma ideia validada, um MVP travado ou uma planilha que virou produto sem ninguém perceber. Traz o que existe hoje — em 30 minutos a gente define o menor caminho até a primeira versão real. Construí um SaaS multi-tenant que foi de zero a 38 organizações em 5 meses. Se não for comigo, eu te falo isso também.
