import type { Dictionary } from './en';

/**
 * The interface text in Brazilian Portuguese (ADR-0015). Typed against `en`, so
 * a missing key is a type error. Daniel reviews this file before it ships.
 */
export const pt: Dictionary = {
  skipLink: 'Pular para o conteúdo principal',

  nav: {
    ariaLabel: 'Navegação principal',
    home: 'Início',
    about: 'Sobre',
    projects: 'Projetos',
    labs: 'Labs',
    agents: 'Agentes',
    achievements: 'Conquistas',
    chat: 'Chat',
    services: 'Serviços',
    process: 'Como funciona',
    contact: 'Contato',
    booking: 'Agendar conversa',
  },

  footer: {
    builtWith: 'Feito com Next.js e Tailwind CSS',
    github: 'Perfil no GitHub',
    linkedin: 'Perfil no LinkedIn',
    resume: 'Currículo em PDF (em inglês)',
    email: 'Enviar e-mail',
  },

  hero: {
    greeting: 'Oi, eu sou',
    scroll: 'Role',
  },

  questions: {
    me: { label: 'Sobre mim', phrase: 'Me fale sobre o Daniel...' },
    projects: { label: 'Projetos', phrase: 'O que ele já entregou de verdade?' },
    skills: { label: 'Stack', phrase: 'Com quais tecnologias ele trabalha?' },
    site: { label: 'Este site', phrase: 'Como este site foi feito?' },
    contact: { label: 'Contato', phrase: 'Ele está disponível para projetos?' },
  },

  aiInput: {
    emptyQuestion: 'Oi',
  },

  bento: {
    connect: 'Vamos conversar',
    connectAria: (name) => `Conectar com ${name} no LinkedIn (abre em uma nova aba)`,
    craftTitle: 'Ofício',
    craftLead: 'Crio **apps, sites e automações** que crescem junto com o negócio.',
    craftBody:
      'Conheço o que a tecnologia moderna pode oferecer, e isso me ajuda a indicar as soluções de que um negócio realmente precisa.',
    openToCollaboration: 'Aberto a colaborações',
    fullResume: 'Currículo completo (EN)',
    now: 'hoje',
    mindsetTitle: 'Mindset',
    mindsetLead:
      '**Construindo mais do que software.** Minhas paixões me dão a **disciplina e o foco** de que preciso para crescer.',
    mindsetCaption: 'Foco e disciplina',
    mindsetClose: 'Dominar o corpo e a mente é o meu caminho para a **excelência.**',
    letsTalk: 'Vamos conversar',
  },

  projects: {
    eyebrow: 'Trabalhos selecionados',
    title: 'Projetos',
    lede: 'O que eu já construí — projetos pessoais, contribuições open source e trabalhos profissionais.',
    empty: 'Os projetos estão sendo documentados — volte em breve.',
    others: 'Outros projetos',
    seeMore: (count) => `Ver mais (${count})`,
    seeLess: 'Ver menos',
    live: 'Site',
    source: 'Código',
    featured: 'Destaque',
    thisSite: 'Você está aqui',
    thisSiteNote:
      'Este é o site que você está vendo agora — o código abaixo é o que monta esta página.',
    view: 'Ver projeto',
    visit: (title) => (title ? `Visitar ${title}` : 'Visitar o site'),
    onGitHub: (title) => (title ? `${title} no GitHub` : 'Código no GitHub'),
    carousel: 'Projetos, um de cada vez',
    slide: (index, total, title) => `Projeto ${index} de ${total}: ${title}`,
    previous: 'Projeto anterior',
    next: 'Próximo projeto',
    pause: 'Pausar a rotação',
    play: 'Retomar a rotação',
    open: (title) => `Abrir ${title}`,
    close: 'Fechar',
    screens: (title) => `Telas de ${title}`,
    screen: (index, total) => `Tela ${index} de ${total}`,
    previousScreen: 'Tela anterior',
    nextScreen: 'Próxima tela',
  },

  agents: {
    eyebrow: 'Agentes de IA',
    title: 'Sistemas que trabalham sozinhos',
    lede: 'Nem tudo que eu construo tem tela. Estes rodam em segundo plano: lembram, vigiam, conferem. Veja o que cada um faz.',
    technical: 'Detalhes técnicos',
    technicalAria: (title) => `Detalhes técnicos de ${title}`,
    stepsAria: (title) => `O que o ${title} faz, passo a passo`,
    scholia: {
      summary:
        'Um segundo cérebro para a IA. Ele guarda o que você decidiu numa conversa e, quando você pergunta de novo dias depois, ele lembra.',
      steps: ['Você conversa', 'Ele guarda o que importa', 'Dias depois, você pergunta', 'Ele lembra'],
      scene: {
        chat: 'Conversa',
        notes: 'Notas',
        you1: 'Comparei três gráficas para o cardápio. Qual fecho?',
        ai1: 'A Gráfica Sul: a mais barata, e entrega em 2 dias.',
        note: 'Gráfica Sul para o cardápio: mais barata, entrega em 2 dias',
        later: '3 dias depois',
        you2: 'Qual gráfica eu escolhi para o cardápio?',
        ai2: 'A Gráfica Sul — a mais barata, e entrega em 2 dias.',
        older: ['Horário: 7h às 18h', 'Fornecedor de café: entrega às terças', 'Logo: a versão verde'],
      },
    },
    square: {
      summary:
        'Uma pré-análise de pedidos de alvará de construção. Ele confere a planta e os documentos contra a lei do município e entrega um checklist com as evidências. Quem decide se aprova é o engenheiro.',
      steps: ['Chega o pedido de alvará', 'Ele confere item por item na lei', 'Mostra onde está o problema', 'O engenheiro decide'],
      scene: {
        request: 'Pedido de alvará',
        docs: ['Planta (DWG)', 'Implantação', 'Matrícula'],
        rooms: { living: 'Sala', bedroom: 'Quarto', bath: 'Banho', balcony: 'Sacada' },
        depth: '1,80 m',
        checklist: 'Checklist',
        items: [
          'Taxa de ocupação: 58% (máx. 60%)',
          'Sacada: 1,80 m de profundidade (máx. 1,20 m)',
          'Vaga para PcD: não se aplica',
          'Banheiro: cota ilegível na planta',
        ],
        suggested: 'Parecer sugerido: pedir correção da sacada',
        engineer: 'Engenheiro',
        decision: 'Decide: pedir correção',
      },
    },
    forget: {
      summary:
        'Para ideias que você não quer perder, mas não tem tempo agora. Ele guarda em um segundo e traz de volta depois de 1 dia, 3 dias, 1 semana, 2 semanas e 4 semanas, até você fazer ou arquivar.',
      steps: ['Você guarda a ideia em um segundo', 'Ela volta para você, de novo e de novo', 'No fim, chega ao Muro', 'Você faz, ou arquiva'],
      scene: {
        now: 'Agora',
        task: 'Montando o orçamento de um cliente',
        idea: 'Ideia: ler sobre como precificar serviços',
        kept: 'Guardada. De volta ao orçamento.',
        queue: 'Fila',
        short: 'Precificação',
        stops: ['1 dia', '3 dias', '1 sem', '2 sem', '4 sem', 'Muro'],
        postponed: (times) => `adiada ${times}×`,
        doIt: 'Fazer',
        archive: 'Arquivar',
        done: 'Virou tarefa',
      },
    },
  },

  labs: {
    title: 'Labs',
    lede: 'Onde eu construo demos pequenas e funcionais com dados públicos. Cada uma responde a uma única pergunta concreta e cita todas as fontes que usa. São conceitos, não produtos de nenhuma empresa.',
    exitLabel: 'Todas as demos, com fontes e método',
    departures: 'Partidas',
    position: (index, total, title) => `Demo ${index} de ${total}: ${title}`,
    previous: 'Demo anterior',
    next: 'Próxima demo',
    listAria: 'Demos do Labs',
    shipped: 'Lançada',
    open: 'Abrir demo',
  },

  chat: {
    metaTitle: 'Pergunte sobre o trabalho dele',
    metaDescription: (name) =>
      `Pergunte o que quiser sobre o trabalho de ${name}. Toda resposta vem dos projetos e resultados que ele registrou — nada inventado.`,
    home: 'Início',
    online: 'Online',
    github: 'GitHub',
    linkedin: 'LinkedIn',
    email: 'E-mail',
    clearConfirm: 'Apagar o histórico da conversa?',
    clearTitle: 'Apagar histórico (debug)',
    empty: 'Pergunte o que quiser pelos botões abaixo ou digite uma mensagem.',
    placeholder: 'Pergunte o que quiser...',
    error: 'Algo deu errado, e prefiro dizer isso a chutar uma resposta.',
    emptyReply: 'Voltei sem nada para dizer, e isso é um bug.',
    unreachable: 'Não consegui falar com o servidor agora. Vale tentar de novo daqui a pouco.',
  },

  achievements: {
    metaTitle: 'Conquistas em destaque',
    metaDescription: 'As conquistas que o Daniel considera mais importantes.',
    back: 'Voltar ao início',
    title: 'Conquistas em destaque',
    lede: 'Os trabalhos que considero mais importantes — os destaques, sem precisar ler tudo.',
    empty: 'As conquistas em destaque vão aparecer aqui conforme forem registradas.',
    illustration: (id) => `Ilustração de ${id}`,
  },

  kinds: {
    engineering: 'Engenharia',
    talk: 'Palestra',
    'open-source': 'Open Source',
    project: 'Projeto',
    education: 'Formação',
    writing: 'Texto',
  },

  guestbook: {
    back: 'Voltar ao início',
    title: 'Livro de visitas',
    lede: 'Deixe um recado — diga oi, mande um feedback ou só passe para dar um alô.',
    name: 'Nome',
    message: 'Mensagem',
    sending: 'Enviando…',
    submit: 'Assinar o livro de visitas',
    done: 'Obrigado por assinar! Sua mensagem chegou.',
    error: 'Algo deu errado. Tente de novo.',
  },

  meta: {
    imageAlt: (owner) => `${owner} — portfólio`,
  },
};
