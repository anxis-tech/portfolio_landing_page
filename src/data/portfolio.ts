export interface ProfileInfo {
  name: string;
  role: string;
  headlinePrefix: string;
  headlineHighlight: string;
  headlineSuffix: string;
  statusBadge: string;
  availabilityText: string;
  bio: string;
  email: string;
  whatsapp: string;
  linkedin: string;
  github: string;
  location: string;
  footerQuote: {
    primary: string;
    secondary: string;
  };
}

export interface StatItem {
  id: string;
  value: string;
  label: string;
  description?: string;
}

export interface ProjectCategory {
  slug: string;
  name: string;
  title: string;
  description: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  category: string;
  categories: string[]; // Slugs for dynamic category routing
  technologies?: string[]; // Stack de tecnologias e integrações
  description: string;
  titleTone?: "dark"; // Dark title for light cover images
  image: string; // Editorial cover image
  fullPageImage?: string; // Full-page real screenshot
  link: string;
  year?: string;
  client?: string;
  agency?: string; // Agency name if made in partnership
  agencyUrl?: string; // Agency website URL
  agencyLogo?: string; // Agency logo image path
  type?: string;
  recent?: boolean; // Appears in "Projetos recentes"
  agencyProject?: boolean; // Appears in "Projetos em parceria" carousel
  featured?: boolean;
  gallery?: string[]; // Imagens adicionais do projeto
  detailedDescription?: string; // Descrição detalhada do projeto para o case study
  features?: string[]; // Principais funcionalidades implementadas
  purpose?: string; // Intenção e objetivo estratégico do projeto
  highlights?: string[]; // Principais destaques/entregas
}

export interface ServiceArea {
  number: string;
  title: string;
  image: string;
  shortDesc?: string;
  highlights?: string[];
}

/* =========================================================================
   DADOS EDITÁVEIS DO PERFIL
   Edite facilmente seu nome, textos de introdução e links de contato aqui.
   ========================================================================= */
export const profileData: ProfileInfo = {
  name: "Mateus Oliveira", // Substitua pelo seu nome se preferir: [SEU NOME]
  role: "Desenvolvedor & UI/UX Designer",
  headlinePrefix: "Olá, eu sou",
  headlineHighlight: "UI/UX Designer & Desenvolvedor",
  headlineSuffix: "construindo ferramentas que geram resultados para seu negócio ou serviço.",
  statusBadge: "Vamos conversar",
  availabilityText: "Disponível para novos projetos",
  bio: "Atuo na intersecção entre design de interface e engenharia front-end, desenvolvendo plataformas, landing pages e produtos digitais autorais de alto impacto visual e desempenho.",
  email: "contato@mateusoliveira.dev", // [EMAIL]
  whatsapp: "https://wa.me/5511999999999", // [WHATSAPP]
  linkedin: "https://linkedin.com/in/mateusoliveiradev", // [LINKEDIN]
  github: "https://github.com/mateusoliveiradev", // [GITHUB]
  location: "Brasil · Remoto",
  footerQuote: {
    primary: "Obrigado pela visita.",
    secondary: "Até o próximo projeto.",
  },
};

/* =========================================================================
   SEÇÃO EM NÚMEROS (AT A GLANCE)
   ========================================================================= */
export const statsData: StatItem[] = [
  {
    id: "rating",
    value: "5.0",
    label: "Avaliação 5 estrelas",
    description: "Avaliação máxima no 99Freelas",
  },
  {
    id: "projects",
    value: "+100",
    label: "Projetos entregues",
    description: "Landing pages, plataformas e sistemas",
  },
  {
    id: "experience",
    value: "+4",
    label: "Anos de experiência",
    description: "Projetando e codificando interfaces",
  },
];

/* =========================================================================
   CATEGORIAS DINÂMICAS
   Utilizadas para as páginas dinâmicas /projetos/[categoria]
   ========================================================================= */
export const categoriesData: ProjectCategory[] = [
  {
    slug: "sistemas",
    name: "Sistemas & CRM",
    title: "Sistemas Web, CRM & Dashboards",
    description:
      "Plataformas sob medida, painéis administrativos e sistemas de gestão desenhados para organizar operações e dar clareza aos negócios.",
  },
  {
    slug: "chatbots",
    name: "Chatbots & IA",
    title: "Chatbots & IA",
    description:
      "Fluxos inteligentes de atendimento e automações pensadas para responder leads com agilidade no WhatsApp e integrar com APIs externas.",
  },


  {
    slug: "landing-pages",
    name: "Landing Pages",
    title: "Projetos de Landing Pages",
    description:
      "Páginas focadas no que realmente importa: captar leads qualificados, vender produtos e serviços e transformar visitantes em clientes reais.",
  },
  {
    slug: "ecommerce",
    name: "E-commerce",
    title: "E-commerce & Lojas Virtuais",
    description:
      "Lojas virtuais com navegação sem fricção, vitrines atraentes e checkout rápido para transformar visitas em compras concluídas.",
  },
  {
    slug: "institucional",
    name: "Sites Institucionais",
    title: "Sites Institucionais & Corporativos",
    description:
      "Portais pensados para apresentar empresas com clareza, construir credibilidade sólida e abrir portas para novas parcerias comerciais.",
  },
  {
    slug: "parcerias",
    name: "Parcerias com Agências",
    title: "Projetos em Parceria",
    description:
      "Projetos desenvolvidos em colaboração técnica e de interface com agências digitais e estúdios de design.",
  },
];

/* =========================================================================
   LISTA DE PROJETOS
   Estrutura centralizada e unificada para fácil adição e edição.
   ========================================================================= */
export const projectsData: Project[] = [
  // --- PROJETOS RECENTES ---
  {
    id: "logoipsum-crm",
    title: "Sistema CRM & Gestão Empresarial",
    slug: "sistema-crm",
    titleTone: "dark",
    category: "Sistemas Web & CRM",
    categories: ["sistemas"],
    technologies: ["nextjs", "react", "node", "supabase", "whatsapp-business"],
    description: "Painel sob medida feito para o time comercial parar de se perder em planilhas, organizar negociações no funil e atender leads no WhatsApp com agilidade.",
    purpose: "A intenção deste sistema foi acabar com o retrabalho comercial. Antes, as conversas ficavam soltas em vários aparelhos e os dados em planilhas desatualizadas. O CRM centralizou tudo em uma esteira visual clara (Kanban), alertando o vendedor para responder na hora e dando ao gestor previsibilidade real de faturamento.",
    detailedDescription: "A plataforma foi desenhada para o dia a dia acelerado de vendas: cards que se movem de forma intuitiva, histórico unificado de conversas no WhatsApp e métricas automáticas de conversão. O foco foi criar uma interface leve e prática, onde qualquer membro da equipe aprende a usar em minutos sem precisar de treinamentos longos.",
    features: [
      "Pipeline de vendas e projetos em Kanban com drag-and-drop",
      "Inbox integrado ao WhatsApp Business API para atendimento e disparo de templates",
      "Calculadora dinâmica de precificação de propostas e honorários",
      "Módulo de gestão financeira com conciliação de faturas e fluxo de caixa",
      "Controle de acesso granular baseado em funções e permissões (RBAC)",
      "Emissão e visualização de notas fiscais integradas ao faturamento"
    ],
    image: "/projects/logoipsum-crm.webp",
    fullPageImage: "/projects/logoipsum-crm.webp",
    link: "https://anxis.com.br",
    year: "2026",
    client: "Anxis",
    type: "Sistema Web / SaaS CRM",
    recent: false,
    featured: true,
  },

  {
    id: "anxis-copilot",
    title: "ANXIS Copilot",
    slug: "anxis-copilot",
    category: "Chatbots & Inteligência Artificial",
    categories: ["chatbots"],
    technologies: ["chatbots", "nextjs", "react", "node", "supabase"],
    description: "Assistente inteligente integrado ao ecossistema do CRM da ANXIS, permitindo consultas instantâneas em linguagem natural sobre projetos, leads, contratos e métricas.",
    purpose: "A intenção do Copilot foi dar aos gestores e à equipe comercial uma forma imediata de consultar dados complexos do CRM sem precisar navegar por múltiplos menus ou filtros. Com uma simples pergunta no chat, ele cruza informações operacionais, pipeline e financeiro em segundos.",
    detailedDescription: "Desenvolvido como uma interface de conversa fluida e moderna com tema dark, o ANXIS Copilot interpreta dúvidas do dia a dia sobre o quadro Kanban, leads em prospecção, histórico de conversas do WhatsApp, orçamentos e auditoria. O assistente foi desenhado estritamente para consulta e análise segura, garantindo integridade dos dados e agilizando tomadas de decisão internas.",
    features: [
      "Processamento de linguagem natural para consulta ágil de tarefas e projetos no Kanban",
      "Varredura em tempo real de leads comerciais, oportunidades e status de prospecção",
      "Consulta e resumo de conversas e mensagens de atendimento via WhatsApp",
      "Verificação de orçamentos, tabelas de precificação e regras de comissionamento",
      "Visão consolidada de cobranças financeiras, contratos e notas fiscais",
      "Interface conversacional moderna com atalhos de teclado (⌘K), ditado por voz e tema dark"
    ],
    gallery: [
      "/projects/anxis-copilot-01.webp",
      "/projects/anxis-copilot-02.webp",
      "/projects/anxis-copilot-03.webp"
    ],
    image: "/projects/anxis-copilot.webp",
    fullPageImage: "/projects/anxis-copilot.webp",
    link: "https://anxis.com.br",
    year: "2026",
    client: "ANXIS",
    type: "Chatbot & IA Conversacional",
    recent: true,
    featured: true,
  },

  {
    id: "mirele-fabro",
    title: "Mirele Fabro",
    slug: "mirele-fabro",
    category: "Landing Page & Saúde",
    categories: ["landing-pages"],
    technologies: ["wordpress", "elementor", "whatsapp"],
    description: "Página pensada para acolher famílias em busca de psicologia infantil, tirando dúvidas sobre o desenvolvimento dos filhos e facilitando o agendamento no WhatsApp.",
    purpose: "O propósito principal da página é gerar acolhimento imediato. Pais que procuram apoio para os filhos geralmente chegam com dúvidas e inseguranças. A página explica as especialidades de forma humana e acessível, quebrando a hesitação e conduzindo a família diretamente para uma conversa inicial no WhatsApp.",
    detailedDescription: "Construída com cores suaves, espaçamentos generosos e ilustrações serenas, a página foge de termos técnicos frios da clínica e foca nas situações reais vividas em casa e na escola. Cada seção foi planejada para responder perguntas comuns dos pais e oferecer um botão de contato rápido e sem barreiras.",
    features: [
      "Jornada do usuário humanizada com foco em acolhimento e quebra de objeções",
      "Seções interativas de áreas de atuação clínica e metodologia de avaliação",
      "Integração direta com WhatsApp para agendamento ágil de triagens e consultas",
      "Carregamento ultraveloz com pontuação máxima no Google PageSpeed (Core Web Vitals)",
      "Tipografia editorial elegante combinada com paleta suave e acolhedora",
      "Layout totalmente responsivo adaptado para dispositivos móveis e tablets"
    ],
    image: "/projects/mirele-fabro.webp",
    fullPageImage: "/projects/mirele-fabro.webp",
    link: "https://mirelefabro.com.br/",
    year: "2026",
    client: "Dra. Mirele Fabro",
    type: "Landing Page",
    recent: true,
    featured: true,
  },
  {
    id: "felipe-bezerril",
    title: "Felipe Bezerril",
    gallery: ["/projects/felipe_bezerril_cover.webp"],
    slug: "felipe-bezerril",
    category: "Landing Page de Conversão",
    categories: ["landing-pages"],
    technologies: ["wordpress", "elementor", "whatsapp"],
    description: "Landing page direta ao ponto para captação de clientes jurídicos, explicando direitos de forma simples e direcionando o contato para análise no WhatsApp.",
    purpose: "Quem pesquisa por um advogado quase sempre está vivenciando um problema urgente ou um momento de estresse. A intenção dessa página foi cortar o juridiquês, mostrar que existe solução para o caso e colocar o botão de atendimento no WhatsApp acessível em qualquer ponto da rolagem para análise imediata.",
    detailedDescription: "A estrutura foi pensada para resposta rápida: uma proposta clara de valor já no primeiro bloco, explicação das áreas de atuação sem enrolação, depoimentos de clientes atendidos e respostas às dúvidas mais frequentes. O foco total é transformar visitas de tráfego pago em conversas reais com o escritório.",
    features: [
      "Estrutura de conversão rápida (Direct Response) focada em consultoria jurídica",
      "Pontos de contato estratégicos via WhatsApp com mensagens pré-configuradas",
      "Seção de autoridade profissional com credenciais, histórico e atuação jurídica",
      "Design minimalista de alto contraste transmitindo seriedade e confiança institucional",
      "Otimização completa de performance e código semântico para SEO local",
      "Formulário e CTAs flutuantes para retenção e captura de visitantes móveis"
    ],
    image: "/projects/felipe-bezerril.webp",
    fullPageImage: "/projects/felipe-bezerril.webp",
    link: "https://felipebezerril.adv.br/",
    year: "2026",
    client: "Felipe Bezerril Advocacia",
    type: "Landing Page",
    recent: true,
    featured: true,
  },
  {
    id: "erika-vieira",
    title: "Erika Vieira",
    gallery: ["/projects/erika_vieira_cover.webp"],
    slug: "erika-vieira",
    category: "Landing Page & Dermatologia",
    categories: ["landing-pages"],
    technologies: ["wordpress", "elementor", "whatsapp"],
    description: "Página desenvolvida para clínica dermatológica com foco em valorizar procedimentos estéticos de alto padrão e agendar consultas particulares de avaliação.",
    purpose: "A intenção foi valorizar a autoridade médica e a naturalidade dos procedimentos. Pacientes que buscam tratamentos faciais e corporais precisam de segurança clínica e elegância; a página apresenta os protocolos com clareza e estimula a marcação de uma avaliação presencial personalizada.",
    detailedDescription: "Combinamos fotografia com estética editorial, tipografia limpa e explicações práticas sobre cada queixa tratada (rejuvenescimento, bioestimuladores, manchas e saúde capilar). Cada procedimento conta com orientações claras sobre como funciona o tratamento e um direcionamento direto para a agenda da clínica.",
    features: [
      "Catálogo visual de tratamentos estéticos e dermatológicos com explicações claras",
      "Design editorial refinado com estética clean e tipografia de alto padrão",
      "Botões de agendamento rápido estrategicamente distribuídos ao longo da rolagem",
      "Seção detalhada sobre a médica com comprovação de títulos e associações (SBD)",
      "Depoimentos e prova social de pacientes integrados à narrativa da página",
      "Performance impecável com carregamento instantâneo de imagens em alta definição"
    ],
    image: "/projects/erika_vieira.webp",
    fullPageImage: "/projects/erika_vieira.webp",
    link: "https://erikavieiradermato.com/",
    year: "2026",
    client: "Dra. Érika Vieira",
    type: "Landing Page",
    recent: true,
    featured: true,
  },
  {
    id: "neves-padua",
    title: "Neves Pádua Advocacia",
    slug: "neves-padua",
    category: "Site Institucional & Advocacia",
    categories: ["institucional"],
    technologies: ["wordpress", "elementor", "whatsapp"],
    description: "Site institucional corporativo para escritório focado em defender empresas contra abusos bancários e reestruturar passivos financeiros.",
    purpose: "A real intenção do site é falar a linguagem do empresário. Diretores e executivos com dívidas bancárias ou litígios financeiros pesados precisam de segurança jurídica e discrição. O portal constrói essa autoridade institucional e incentiva o agendamento de uma reunião estratégica confidencial com os sócios.",
    detailedDescription: "A identidade do site reflete o porte dos casos atendidos: paleta institucional sóbria, detalhamento de teses bancárias vitoriosas e apresentação técnica dos advogados sócios. Toda a navegação foi projetada para que tomadores de decisão corporativos encontrem credibilidade imediata e peçam um diagnóstico do seu passivo.",
    features: [
      "Apresentação estruturada das áreas de atuação empresarial e bancária",
      "Seção de corpo jurídico e sócios com apresentação da equipe técnica",
      "Mecanismo de contato institucional com canais seguros para atendimento empresarial",
      "Identidade visual corporativa sóbria que transmite solidez e conformidade legal",
      "Arquitetura de conteúdo otimizada para captação de médias e grandes empresas",
      "Total compatibilidade e fluidez em telas desktop ultrawide e smartphones"
    ],
    image: "/projects/neves-padua.webp",
    fullPageImage: "/projects/neves-padua.webp",
    link: "https://nevespaduaadvocacia.com.br/",
    year: "2026",
    client: "Neves Pádua Advocacia",
    type: "Site Institucional & Advocacia",
    recent: true,
    featured: true,
  },
  {
    id: "drex-games",
    title: "Drex Games",
    gallery: ["/projects/drexgames-admin.webp"],
    slug: "drex-games",
    category: "E-commerce & Plataforma Gamer",
    categories: ["ecommerce"],
    technologies: ["nextjs", "react", "node", "pix"],
    description: "Loja virtual focada na venda rápida de chaves digitais para PC, com preços promocionais e liberação automática via PIX.",
    purpose: "O objetivo aqui é vender sem atrito: o gamer quer encontrar o jogo, conferir se os requisitos batem com o PC dele, pagar no PIX sem taxas abusivas e receber a chave na hora para ativar na Steam ou Epic. A experiência foi montada para concluir a compra em poucos cliques.",
    detailedDescription: "Com visual dark característico do universo gamer, a loja tem busca em tempo real com autocompletar, vitrine com selos de desconto bem destacados e checkout simplificado. O sistema valida o pagamento instantaneamente e exibe o código de ativação na própria tela e por e-mail, sem exigir cadastros longos ou burocráticos.",
    features: [
      "Catálogo dinâmico com filtros avançados por gênero, plataforma e faixa de preço",
      "Fluxo de checkout transparente de alta conversão integrado com PIX e cartão de crédito",
      "Sistema de despacho e entrega automatizada de chaves de ativação digitais",
      "Interface imersiva em tema dark projetada especificamente para o público gamer",
      "Painel operacional de suporte e histórico de pedidos para clientes",
      "Arquitetura moderna em Next.js e React garantindo navegação instantânea e sem recarregamentos"
    ],
    image: "/projects/drex-games.webp",
    fullPageImage: "/projects/drex-games.webp",
    link: "https://drexgames.com/",
    year: "2026",
    client: "Drex Games",
    type: "E-commerce & Catálogo Gamer",
    recent: true,
    featured: true,
  },
  {
    id: "games-drex",
    title: "GamesDrex",
    slug: "games-drex",
    category: "E-commerce & Games",
    categories: ["ecommerce"],
    technologies: ["wordpress", "woocommerce", "elementor", "pix"],
    description: "E-commerce de jogos digitais para PlayStation, Xbox e PC, estruturado para quem busca títulos populares com suporte próximo para instalação.",
    purpose: "A intenção deste projeto foi quebrar a desconfiança de quem quer economizar comprando jogos em mídia digital. A loja oferece preços mais em conta do que as lojas oficiais dos consoles, garantindo transparência, tutoriais passo a passo e um canal de atendimento pronto para tirar dúvidas antes e depois da compra.",
    detailedDescription: "A interface organiza os jogos por plataforma e faixas de preço, com seções dedicadas a lançamentos e promoções em destaque. As páginas de produto trazem explicações fáceis sobre o tipo de licença (primária ou secundária) e depoimentos reais de jogadores, dando tranquilidade para quem nunca comprou mídia digital antes.",
    features: [
      "Vitrine de ofertas dinâmicas com badges de desconto e promoções em destaque",
      "Mecanismo de busca instantânea com indexação ágil de catálogo de jogos",
      "Checkout otimizado com pagamento via PIX imediato e parcelamento",
      "Categorização por plataformas (PlayStation, Xbox, Nintendo e PC)",
      "Sistema de cálculo e entrega de gift cards e chaves digitais por e-mail e WhatsApp",
      "Estrutura robusta desenvolvida em WooCommerce com personalização de layout"
    ],
    image: "/projects/games-drex.webp",
    fullPageImage: "/projects/games-drex.webp",
    link: "https://www.gamesdrex.com.br/",
    year: "2026",
    client: "GamesDrex",
    type: "E-commerce & Loja Virtual",
    recent: true,
    featured: true,
  },
  {
    id: "felipe-torres-black",
    title: "Felipe Torres Black",
    slug: "felipe-torres-black",
    category: "Landing Page de Alta Conversão",
    categories: ["landing-pages"],
    technologies: ["wordpress", "elementor", "whatsapp"],
    description: "Página de vendas focada em preencher as vagas da imersão presencial 'Conquistadores de Sonhos', gerando desejo e urgência para a compra do ingresso.",
    purpose: "O intuito é converter tráfego pago em vendas de ingressos de alto valor. A página guia o visitante por uma narrativa envolvente: apresenta a história do mentor, toca nas dores e ambições de líderes e executivos, detalha a programação do evento presencial e estimula o fechamento antes da virada de lote.",
    detailedDescription: "Desenvolvida com contraste marcante, vídeo de abertura de alta produção e depoimentos em vídeo de ex-alunos, a página utiliza gatilhos de prova social, escassez de vagas e garantia. A tabela comparativa de ingressos (Silver, Gold e Black) facilita a escolha e direciona o usuário diretamente para o checkout seguro.",
    features: [
      "Design imersivo 'Black Edition' com contraste dramático e tipografia impactante",
      "Narrativa persuasiva estruturada para venda de ingressos e vagas de alto ticket",
      "Vídeo de vendas integrado com gatilhos de prova social e transformação pessoal",
      "Cronograma completo da imersão com módulos, palestrantes e diferenciais",
      "Garantia, FAQ interativo com accordion e quebra sistemática de objeções",
      "Checkout integrado com contadores regressivos para estímulo à ação imediata"
    ],
    image: "/projects/felipe-torres-black.webp",
    fullPageImage: "/projects/felipe-torres-black.webp",
    link: "https://treinamentofelipetorres.com.br/black/",
    year: "2026",
    client: "Felipe Torres",
    type: "Landing Page de Conversão",
    recent: true,
  },
  {
    id: "riosmed",
    title: "Riosmed Saúde",
    gallery: ["/projects/riosmed_cover.webp"],
    slug: "riosmed",
    category: "Site Institucional & Saúde",
    categories: ["institucional"],
    technologies: ["wordpress", "elementor", "whatsapp"],
    description: "Portal de clínica médica e diagnósticos desenvolvido para o paciente encontrar sua especialidade ou exame em segundos e agendar pelo WhatsApp.",
    purpose: "A proposta do site foi resolver o atendimento da clínica de forma prática. Em vez de obrigar o paciente a ligar e esperar na linha, o portal permite consultar médicos conveniados, especialidades e exames disponíveis, abrindo uma conversa no WhatsApp com um único clique para confirmar a data.",
    detailedDescription: "O layout é limpo e acessível para qualquer faixa etária, com carregamento rápido e navegação clara. O catálogo inclui orientações práticas de preparo para cada tipo de exame (laboratório e imagem), localização com mapa interativo e informações sobre convênios aceitos, desafogando a recepção da clínica.",
    features: [
      "Guia completo de especialidades médicas e exames laboratoriais/imagem disponíveis",
      "Apresentação do corpo clínico multidisciplinar com fotos e qualificações",
      "Módulo de agendamento direto de consultas integrado ao canal de atendimento",
      "Localização interativa com integração Google Maps e informações de convênios aceitos",
      "Layout institucional limpo e acessível em conformidade com as normas da área da saúde",
      "Navegação intuitiva com carregamento rápido projetado para pacientes de todas as idades"
    ],
    image: "/projects/riosmed.webp",
    fullPageImage: "/projects/riosmed.webp",
    link: "https://riosmed.com.br/",
    year: "2026",
    client: "Riosmed",
    type: "Site Institucional & Clínica",
    recent: true,
  },
  {
    id: "slouver-games",
    title: "Slouver Games",
    gallery: ["/projects/slouver_cover.webp"],
    slug: "slouver-games",
    category: "E-commerce & Plataforma Gamer",
    categories: ["ecommerce"],
    technologies: ["wordpress", "woocommerce", "elementor", "pix"],
    description: "Plataforma de recargas instantâneas e cartões-presente para consoles e mobile, feita para quem quer comprar créditos e receber o código no mesmo minuto.",
    purpose: "Aqui a intenção é atender compras de conveniência e impulso. O jogador está no meio da partida ou na madrugada de sábado e quer comprar uma skin ou renovar a assinatura do Game Pass ou PlayStation Plus. O site corta qualquer burocracia: selecionou o valor, pagou no PIX, recebeu o código imediatamente.",
    detailedDescription: "A plataforma foi desenhada prioritariamente para navegação mobile, com botões amplos e fluxo de pagamento em uma etapa. Uma rotina automatizada confirma a transação bancária e envia o voucher para o e-mail e para a tela do comprador, mantendo a operação rodando 24 horas por dia sem intervenção manual.",
    features: [
      "Catálogo organizado por cartões de presentes, assinaturas e créditos digitais",
      "Sistema de checkout expresso em uma única etapa com PIX nativo",
      "Disparo automático do código do voucher para a conta do usuário e e-mail",
      "Visual moderno e direto ao ponto focado em transações de compra por impulso",
      "Suporte a cupons de desconto promocionais e programa de fidelização",
      "Segurança e criptografia de ponta a ponta na transação comercial"
    ],
    image: "/projects/slouver-games.webp",
    fullPageImage: "/projects/slouver-games.webp",
    link: "https://slouvergames.com.br/",
    year: "2026",
    client: "Slouver Games",
    type: "E-commerce & Loja Virtual",
    recent: true,
  },
  {
    id: "sweet-beauty",
    title: "Sweet Beauty",
    slug: "sweet-beauty",
    category: "E-commerce & Cosméticos",
    categories: ["ecommerce"],
    technologies: ["wix"],
    description: "Loja virtual de cosméticos naturais e skincare, criada para inspirar rotinas de autocuidado e incentivar a compra de kits completos de beleza.",
    purpose: "O objetivo foi criar uma loja visualmente encantadora que despertasse o desejo de cuidar de si. Quem compra skincare quer conhecer a textura, os ingredientes e ver resultados reais. A página foi pensada para valorizar os benefícios de cada produto e incentivar a montagem de rotinas completas (limpeza, hidratação e massagem).",
    detailedDescription: "Customizada sobre a plataforma Wix, a loja conta com carrinho lateral deslizante (mini-cart) para facilitar compras de múltiplos itens sem sair da página, fotos em alta definição, avaliações com fotos de clientes e cálculo de frete rápido, proporcionando uma experiência de compra suave e prazerosa.",
    features: [
      "Vitrine estética de produtos com fotos em alta definição e variações de cor/modelo",
      "Carrinho lateral deslizante (Mini-cart) proporcionando experiência de compra contínua",
      "Filtros de navegação por rotina de cuidados (rosto, corpo, acessórios e kits)",
      "Avaliações reais de clientes com fotos e notas de satisfação por produto",
      "Integração com gateways de pagamento brasileiros com suporte a PIX e cartão",
      "Design delicado e harmônico com foco na valorização do bem-estar e autocuidado"
    ],
    image: "/projects/sweet-beauty.webp",
    fullPageImage: "/projects/sweet-beauty.webp",
    link: "https://www.sweetbeauty.com.br/",
    year: "2026",
    client: "Sweet Beauty",
    type: "E-commerce & Loja Virtual Wix",
    recent: true,
  },

  // --- PROJETOS EM PARCERIA COM AGÊNCIAS (Carrossel) ---
  {
    id: "decopisos",
    title: "Decopisos Revestimentos",
    slug: "decopisos",
    category: "E-commerce & Revestimentos",
    categories: ["parcerias", "ecommerce"],
    technologies: ["tray"],
    description: "Loja virtual de pisos vinílicos e acabamentos com calculadora automática de caixas por metro quadrado e cotação transparente de frete pesado.",
    purpose: "Desenvolvida em parceria com a agência Virtualiti, a intenção da loja foi acabar com a maior dor de quem compra piso pela internet: o medo de errar a quantidade de caixas ou levar um susto com o frete. O cliente insere a metragem do cômodo e a loja já calcula o número exato de caixas e o custo da transportadora.",
    detailedDescription: "Integrada na plataforma Tray, a calculadora de m² fica visível diretamente na página do produto, somando a margem de perda recomendada para recortes. O catálogo traz ambientações reais em alta definição para inspirar quem está reformando, além de filtros técnicos por espessura, padrão de cor e uso residencial ou comercial.",
    features: [
      "Calculadora de metragem quadrada (m²) integrada à página do produto",
      "Filtros técnicos de especificação por espessura, padrão de cor, textura e uso",
      "Cálculo inteligente de frete para produtos pesados com tabelas de transportadoras",
      "Catálogo rico em ambientações reais para inspirar projetos residenciais e comerciais",
      "Checkout corporativo B2C e B2B preparado para grandes volumes de metragem",
      "Plataforma Tray customizada com foco em usabilidade e redução de abandono de carrinho"
    ],
    agency: "Virtualiti",
    agencyUrl: "https://virtualiti.com.br/",
    agencyLogo: "/badges/virtualiti-logo.png",
    image: "/projects/decopisos.webp",
    fullPageImage: "/projects/decopisos.webp",
    link: "https://decopisos.commercesuite.com.br/",
    year: "2026",
    type: "E-commerce & Parceria",
    agencyProject: true,
  },
  {
    id: "visalens",
    title: "Visalens",
    slug: "visalens",
    category: "E-commerce & Lentes de Contato",
    categories: ["parcerias", "ecommerce"],
    technologies: ["tray"],
    description: "E-commerce de lentes de contato com seletor guiado de grau e curvatura, simplificando a compra conforme a receita médica.",
    purpose: "Em parceria com a agência Virtualiti, o propósito da loja foi transformar a compra de lentes de contato em algo tão simples e seguro quanto ir a uma ótica física. O configurador ajuda o cliente a preencher o grau e o eixo sem confusão, evitando erros médicos e fidelizando para recompras recorrentes.",
    detailedDescription: "A loja reúne marcas líderes de mercado (Acuvue, Alcon, Bausch + Lomb) organizadas por tipo de descarte (diário, quinzenal e mensal). O formulário de prescrição na plataforma Tray valida os parâmetros antes do checkout e o sistema conta com lembretes automáticos para avisar quando as lentes do cliente estiverem perto de vencer.",
    features: [
      "Configurador dinâmico de prescrição médica (grau esférico, cilíndrico e eixo) por olho",
      "Sistema de alerta de reposição periódica de lentes para compras recorrentes",
      "Busca especializada por fabricantes líderes mundiais (Acuvue, Alcon, Bausch + Lomb)",
      "Checkout rápido com validação de receitas oftalmológicas",
      "Design voltado para saúde ocular e precisão científica na escolha do produto",
      "Layout totalmente responsivo otimizado para navegação mobile na plataforma Tray"
    ],
    agency: "Virtualiti",
    agencyUrl: "https://virtualiti.com.br/",
    agencyLogo: "/badges/virtualiti-logo.png",
    image: "/projects/visalens.webp",
    fullPageImage: "/projects/visalens.webp",
    link: "https://www.visalens.com.br/",
    year: "2026",
    type: "E-commerce & Parceria",
    agencyProject: true,
  },
  {
    id: "jacare-home-center",
    title: "Jacaré Home Center",
    slug: "jacare-home-center",
    category: "E-commerce & Home Center",
    categories: ["parcerias", "ecommerce"],
    technologies: ["tray"],
    description: "Mega portal de materiais de construção, ferramentas e acabamentos, integrando o estoque físico da loja ao comércio eletrônico.",
    purpose: "Construído em parceria com a agência Virtualiti, o objetivo foi levar a conveniência do grande home center para o digital. A plataforma permite tanto ao morador comprar uma ferramenta ou torneira com entrega expressa, quanto ao mestre de obras cotar e encomendar materiais pesados direto para a obra.",
    detailedDescription: "Com milhares de produtos cadastrados na plataforma Tray, a estrutura conta com busca preditiva inteligente que corrige erros de digitação e filtros por departamentos. As páginas incluem fichas técnicas completas e sugestão de itens complementares essenciais (como argamassa para pisos), aumentando o ticket médio dos pedidos.",
    features: [
      "Catálogo expansivo com milhares de SKUs divididos em departamentos e categorias",
      "Sistema de busca inteligente com autocompletar e tolerância a erros de digitação",
      "Diferenciação de frete para entregas expressas locais e frete fracionado pesado",
      "Estrutura de promoções sazonais, combos de reforma e queima de estoque",
      "Arquitetura de alta robustez na plataforma Tray com suporte a picos de tráfego",
      "Páginas de produto completas com fichas técnicas, manuais e produtos correlatos"
    ],
    agency: "Virtualiti",
    agencyUrl: "https://virtualiti.com.br/",
    agencyLogo: "/badges/virtualiti-logo.png",
    image: "/projects/jacare-home-center.webp",
    fullPageImage: "/projects/jacare-home-center.webp",
    link: "https://www.jacarehomecenter.com.br/",
    year: "2026",
    type: "E-commerce & Parceria",
    agencyProject: true,
  },
];

/* =========================================================================
   SEÇÃO "COMO POSSO AJUDAR" (SUBSTITUIÇÃO DE REDES SOCIAIS)
   ========================================================================= */
export const servicesHelpData: ServiceArea[] = [
  {
    number: "01",
    title: "UI/UX Design",
    image: "/services/ui-ux.jpg",
  },
  {
    number: "02",
    title: "Integrações com serviços externos",
    image: "/services/integracoes.jpg",
  },
  {
    number: "03",
    title: "Landing Pages de Conversão",
    image: "/services/landing-pages.jpg",
  },
  {
    number: "04",
    title: "Desenvolvimento de sistemas personalizado",
    image: "/services/sistemas.jpg",
  },
];

/* =========================================================================
   FUNÇÕES AUXILIARES DE CONSULTA
   ========================================================================= */

// Retorna todos os projetos
export function getAllProjects(): Project[] {
  return projectsData;
}


// Retorna projetos web (Sites institucionais, E-commerce e Landing pages), excluindo sistemas
export function getWebProjects(limit?: number): Project[] {
  const web = projectsData.filter(
    (p) =>
      !p.categories.includes("sistemas") &&
      p.categories.some((c) => ["landing-pages", "ecommerce", "institucional"].includes(c))
  );
  return limit ? web.slice(0, limit) : web;
}

// Retorna projetos de sistemas / CRM
export function getSystemsProjects(): Project[] {
  return projectsData.filter((p) => p.categories.includes("sistemas"));
}

// Retorna projetos recentes (com limite opcional) - alinhado estritamente com sites, ecommerce e landing pages
export function getRecentProjects(limit?: number): Project[] {
  return getWebProjects(limit);
}


// Retorna projetos em parceria com agências
export function getAgencyProjects(): Project[] {
  return projectsData.filter((p) => p.agencyProject);
}

// Retorna projetos por categoria
export function getProjectsByCategory(categorySlug: string): Project[] {
  return projectsData.filter((p) =>
    p.categories.map((c) => c.toLowerCase()).includes(categorySlug.toLowerCase())
  );
}

// Retorna metadados da categoria por slug
export function getCategoryBySlug(slug: string): ProjectCategory | undefined {
  return categoriesData.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
}

// Retorna todas as categorias disponíveis
export function getAllCategories(): ProjectCategory[] {
  return categoriesData;
}


// Retorna projeto por id ou slug
export function getProjectByIdOrSlug(idOrSlug: string): Project | undefined {
  const normalized = idOrSlug.toLowerCase().trim();
  return projectsData.find(
    (p) => p.id.toLowerCase() === normalized || p.slug.toLowerCase() === normalized
  );
}
