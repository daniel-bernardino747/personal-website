# Draft: copy for the Portuguese home page

Status: approved by Daniel on 11/11/2026. Every claim cites its source.

The page itself is in Portuguese; the notes around it are in English.

---

## Hero

**Software sob medida para empresas de Criciúma e região.**

Sites, sistemas, aplicativos, automações e agentes de IA, feitos por quem está aqui, atende pessoalmente e mostra o andamento do projeto em tempo real.

[Chamar no WhatsApp] · [Agendar uma conversa]

> Sources: services (Daniel, 11/11/2026); in-person service (Daniel, 11/11/2026); "andamento em tempo real" = the Elo portal (`elo/PRODUCT.md`).

## O que eu faço

| Serviço | Para quê |
|---|---|
| Software personalizado | Um sistema feito para o jeito que a sua empresa trabalha, e não o contrário. |
| Soluções sob medida | Integrar o que você já usa, tirar planilha do caminho, resolver o gargalo específico. |
| Aplicativos | App para celular ou para instalar direto do navegador (PWA). |
| Automações | Tarefas repetitivas rodando sozinhas: avisos, relatórios, cobranças, WhatsApp. |
| Agentes de IA | Atendimento e tarefas com IA, onde ela ajuda de verdade. |
| Sites | Institucional, landing page e e-commerce. |

> Source: Daniel's list (11/11/2026). The one-line descriptions were written by Claude and approved by Daniel.

## Como funciona

1. **Conversa.** A gente se encontra, aqui em Criciúma ou por vídeo, e eu entendo o problema antes de falar em tecnologia.
2. **Escopo por escrito.** Você recebe o que entra, o que fica de fora, o que eu preciso de você e as datas de cada etapa, em linguagem simples. *(regras-do-escopo 1–6)*
3. **Contrato.** Valor fechado, assinado eletronicamente. Você paga uma entrada e depois uma parcela a cada etapa aprovada, por Pix e com nota fiscal. *(decisões 9 e 17)*
4. **Etapas curtas que você testa.** O projeto é dividido em partes que você reconhece e pode testar no celular, cada uma com data. *(Elo PRODUCT: "etapas de dias ou semanas", link de preview)*
5. **Você aprova.** Ao fim de cada etapa você tem 5 dias úteis para apontar o que ficou diferente do combinado. *(projeto.md.hbs, Cláusula da Entrega e do Aceite)*
6. **Entrega e garantia.** Código e instruções na sua mão, e 90 dias de garantia. *(Cláusula da Propriedade Intelectual e Cláusula da Garantia)*

## Por que é rápido

- **Etapas de dias ou semanas, não de meses.** Você vê e testa o que está pronto a cada etapa, em vez de esperar o fim. *(Elo PRODUCT)*
- **O tempo do projeto vai para o que você pediu.** Partes que se repetem de um projeto para outro (login, painel, pagamentos) já existem e são reaproveitadas, e você recebe licença perpétua delas. *(decisão 7, Componentes Pré-existentes)*
- **Exemplo real:** o Encaixai saiu da especificação (21/10/2026) para o banco de produção (04/11/2026) em duas semanas. Jadson already uses it. *(git log do `encaixa`; confirmed by Daniel on 11/11/2026)*

## Você acompanha tudo pelo Elo

Contratou um software e as perguntas não param? Quando fica pronto, o que mudou, o que foi combinado, quanto falta pagar, se estão esperando algo de você. No Elo, o portal do cliente, a resposta está a um toque:

- a data de cada etapa, e **o motivo sempre que um prazo muda**;
- o que ficou pronto, com o link para testar no seu celular;
- o que foi combinado, em palavras simples, com o contrato assinado;
- cada parcela, com o vencimento e a chave Pix;
- o que está esperando você, com a data em que foi pedido.

Sem senha e sem instalar nada. Você entra pelo link que chega no seu WhatsApp.

> Source: `elo/src/client/landing/conteudo.ts` and `elo/PRODUCT.md`. The screens and videos use the fictional client Rafael (RS Aquecedores) and can be reused.

## Garantias

- **90 dias de garantia** depois da última etapa: se algo funcionar diferente do combinado, eu corrijo sem custo.
- **O código é seu.** Quitado o projeto, o código feito para você passa a ser seu, com instruções para publicar onde quiser.
- **Domínio, lojas e contas no seu nome.** Nada que identifica o seu negócio ou recebe dinheiro fica preso comigo.
- **Seus dados e os dos seus clientes seguem a LGPD.** Desenvolvo e testo com dados fictícios, e se acontecer um incidente de segurança você fica sabendo em até 48 horas.
- **Sigilo.** O que eu souber do seu negócio fica entre nós.
- **Saída sem multa.** Você pode encerrar com 15 dias de aviso, paga o que foi feito e leva o código pago.
- **Mudança só com o seu sim.** Mudança de escopo vem por escrito, com impacto no valor e no prazo, antes de qualquer coisa.

> Source: `contratos/docs/decisoes.md` 7, 8, 11, 12, 14, 15, 18 and `modelos/projeto.md.hbs`.
> The contract template is still 0.1.0. Daniel decided on 11/11/2026 to publish this section anyway, and to finish the legal review before the first real client signs.

## Primeira entrega: Encaixai

Um app para o Jadson, encanador e técnico de aquecedores em Criciúma (JADOTEC), orçar na casa do cliente e mandar pelo WhatsApp, ver a agenda do mês, saber o que comprar antes de cada serviço e ver quem está devendo. Instala direto do navegador do celular.

> Source: `encaixa/PRODUCT.md`. Promo material in `encaixa/promo/encaixai` (contact sheet, screens, a 79s reel).
> Note: it is a DB product, with Jadson as a validation partner (decisão 24). Do not describe it as a "sob encomenda" project for a paying client. Jadson already uses the app, and his name and the JADOTEC brand may appear (Daniel, 11/11/2026).

## Contato

**Chamar no WhatsApp:** (48) 99684-4907 (a regular WhatsApp account, not WhatsApp Business for now)
**Agendar uma conversa:** cal.com (Portuguese version, which Daniel is creating)
Team DB Solutions · DB SOFTWARE SOLUTIONS LTDA · CNPJ 63.169.584/0001-43
Atendimento presencial em Criciúma e região.

> No street address: the registered office is in Curitiba/PR (`contratos/empresa.yaml`). For local SEO, set the site up as a service-area business (`areaServed`), not an address.
