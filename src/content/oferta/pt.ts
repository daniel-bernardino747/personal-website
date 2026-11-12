/**
 * The offer to local businesses, shown on the Portuguese home page only
 * (ADR-0015). It is presentation of how Daniel works, not the career record, so
 * it lives here rather than in the Corpus; the services themselves, the WhatsApp
 * and the company come from the Identity.
 *
 * Approved by Daniel on 11/11/2026 in `.scratch/site-speaks-to-criciuma/copy-pt.md`.
 * Every promise below restates the contract templates in the `contratos`
 * repository; when they change version, re-read the clauses cited and update.
 */
export const CONTRACT_TEMPLATE_VERSION = "0.1.0";

export const oferta = {
  /** What a search result and a shared link say about the Portuguese home. */
  seo: {
    title: "Desenvolvedor de software em Criciúma, SC",
    description:
      "Software sob medida, aplicativos, automações, agentes de IA e sites para empresas de Criciúma e região. Atendimento presencial, contrato com garantia e o andamento do projeto em tempo real.",
  },

  hero: {
    eyebrow: "Desenvolvedor de software em Criciúma, SC",
    title: "Software sob medida para empresas de Criciúma e região.",
    lede: "Sites, sistemas, aplicativos, automações e agentes de IA, feitos por quem está aqui, atende pessoalmente e mostra o andamento do projeto em tempo real.",
  },

  whatsapp: {
    cta: "Chamar no WhatsApp",
    message: "Oi, Daniel! Vi o seu site e quero conversar sobre um projeto.",
  },
  booking: { cta: "Agendar uma conversa", href: "/agendar" },

  services: {
    eyebrow: "Serviços",
    title: "O que eu faço",
    /**
     * One line per service, in the order the Identity lists them
     * (Custom software, Tailored solutions, Apps, Automations, AI agents, Websites).
     * A service without a line here still shows, without its explanation.
     */
    notes: [
      "Um sistema feito para o jeito que a sua empresa trabalha, e não o contrário.",
      "Integrar o que você já usa, tirar planilha do caminho, resolver o gargalo específico.",
      "App para celular ou para instalar direto do navegador.",
      "Tarefas repetitivas rodando sozinhas: avisos, relatórios, cobranças, WhatsApp.",
      "Atendimento e tarefas com IA, onde ela ajuda de verdade.",
      "Para apresentar a sua empresa, atrair clientes ou vender online.",
    ],
  },

  process: {
    eyebrow: "Como funciona",
    title: "Do primeiro café à entrega",
    steps: [
      { title: "Conversa", body: "A gente se encontra, aqui em Criciúma ou por vídeo, e eu entendo o problema antes de falar em tecnologia." },
      { title: "Escopo por escrito", body: "Você recebe o que entra, o que fica de fora, o que eu preciso de você e as datas de cada etapa, em linguagem simples." },
      { title: "Contrato", body: "Valor fechado, assinado eletronicamente. Uma entrada e depois uma parcela a cada etapa aprovada, por Pix e com nota fiscal." },
      { title: "Etapas curtas que você testa", body: "O projeto é dividido em partes que você reconhece e testa no celular, cada uma com data." },
      { title: "Você aprova", body: "Ao fim de cada etapa você tem 5 dias úteis para apontar o que ficou diferente do combinado." },
      { title: "Entrega e garantia", body: "Código e instruções na sua mão, e 90 dias de garantia." },
    ],
  },

  speed: {
    title: "Por que é rápido",
    points: [
      { title: "Etapas de dias ou semanas, não de meses", body: "Você vê e testa o que está pronto a cada etapa, em vez de esperar o fim." },
      { title: "O tempo vai para o que você pediu", body: "Partes que se repetem de um projeto para outro, como login, painel e pagamentos, já existem e são reaproveitadas, com licença perpétua para você." },
    ],
  },

  elo: {
    eyebrow: "Portal do cliente",
    title: "Você acompanha tudo pelo Elo",
    lede: "Contratou um software e as perguntas não param? Quando fica pronto, o que mudou, o que foi combinado, quanto falta pagar, se estão esperando algo de você. No Elo, a resposta está a um toque.",
    points: [
      "A data de cada etapa, e o motivo sempre que um prazo muda.",
      "O que ficou pronto, com o link para testar no seu celular.",
      "O que foi combinado, em palavras simples, com o contrato assinado.",
      "Cada parcela, com o vencimento e a chave Pix.",
      "O que está esperando você, com a data em que foi pedido.",
    ],
    closing: "Sem senha e sem instalar nada: você entra pelo link que chega no seu WhatsApp.",
    /** Screens of the portal in demo mode; the client on them, Rafael of RS Aquecedores, is invented. */
    screens: [
      { src: "/elo/03-inicio-quando-fica-pronto.webp", alt: "O início do portal Elo: a etapa Agenda dos atendimentos fica pronta em 20/11, faltam 9 dias, 4 de 7 itens prontos." },
      { src: "/elo/04-inicio-o-que-ficou-pronto.webp", alt: "O portal mostra 3 coisas novas para testar, cada uma com o botão de gostei, e o botão Testar agora." },
      { src: "/elo/10-parcelas.webp", alt: "As parcelas no portal: falta pagar R$ 5.600,00, já pago R$ 2.800,00 de R$ 8.400,00." },
    ],
  },

  guarantees: {
    eyebrow: "Garantias",
    title: "O que está no contrato",
    items: [
      { title: "90 dias de garantia", body: "Depois da última etapa, se algo funcionar diferente do combinado, eu corrijo sem custo.", clause: "Cláusula da Garantia" },
      { title: "O código é seu", body: "Quitado o projeto, o código feito para você passa a ser seu, com instruções para publicar onde quiser.", clause: "Cláusula da Propriedade Intelectual" },
      { title: "Contas no seu nome", body: "Domínio, lojas de aplicativo e contas que recebem dinheiro ficam no seu nome. Nada que identifica o seu negócio fica preso comigo.", clause: "Cláusula da Infraestrutura" },
      { title: "LGPD", body: "Desenvolvo e testo com dados fictícios, e se acontecer um incidente de segurança você fica sabendo em até 48 horas.", clause: "Cláusula dos Dados Pessoais" },
      { title: "Sigilo", body: "O que eu souber do seu negócio fica entre nós.", clause: "Cláusula da Confidencialidade" },
      { title: "Saída sem multa", body: "Você pode encerrar com 15 dias de aviso, paga o que foi feito e leva o código pago.", clause: "Cláusula da Rescisão" },
      { title: "Mudança só com o seu sim", body: "Mudança de escopo vem por escrito, com o impacto no valor e no prazo, antes de qualquer coisa.", clause: "Cláusula das Mudanças de Escopo" },
    ],
  },

  firstDelivery: {
    eyebrow: "Primeira entrega",
    /** The Corpus id the section reads; it renders nothing until the record exists. */
    accomplishmentId: "encaixai",
    speedNote: "Da especificação ao app em produção em duas semanas, e o Jadson já usa no dia a dia.",
  },

  contact: {
    eyebrow: "Contato",
    title: "Vamos conversar sobre o seu projeto",
    lede: "O jeito mais rápido é o WhatsApp. Se preferir, marque um horário.",
    inPerson: (area: string) => `Atendimento presencial em ${area}.`,
    company: (name: string, legalName: string, cnpj: string) => `${name} · ${legalName} · CNPJ ${cnpj}`,
  },
} as const;
