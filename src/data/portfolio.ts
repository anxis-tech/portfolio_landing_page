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
  headlineSuffix: "criando experiências digitais funcionais, estratégicas e visualmente refinadas.",
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
      "Plataformas sob medida, painéis administrativos interativos, CRM de vendas, automação de processos e controle financeiro robusto.",
  },
  {
    slug: "chatbots",
    name: "Chatbots & IA",
    title: "Chatbots & IA",
    description:
      "Automação de atendimento inteligente via WhatsApp, fluxos de conversão automatizados, conciliação de pagamentos e conexões com APIs externas.",
  },


  {
    slug: "landing-pages",
    name: "Landing Pages",
    title: "Projetos de Landing Pages",
    description:
      "Páginas focadas em alta taxa de conversão, velocidade máxima de carregamento, storytelling visual persuasivo e posicionamento de marca.",
  },
  {
    slug: "ecommerce",
    name: "E-commerce",
    title: "E-commerce & Lojas Virtuais",
    description:
      "Ecossistemas de venda online com fluxos intuitivos de navegação, checkout otimizado e apresentação envolvente de produtos.",
  },
  {
    slug: "institucional",
    name: "Sites Institucionais",
    title: "Sites Institucionais & Corporativos",
    description:
      "Plataformas digitais corporativas desenvolvidas para transmitir autoridade, elegância e credibilidade imediata ao mercado.",
  },
  {
    slug: "parcerias",
    name: "Parcerias com Agências",
    title: "Projetos em Parceria",
    description:
      "Trabalhos desenvolvidos em estreita colaboração técnica e criativa com agências de publicidade, estúdios de design e consultorias.",
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
    category: "Sistemas Web & CRM",
    categories: ["sistemas", "chatbots"],
    technologies: ["nextjs", "react", "node", "supabase", "whatsapp-business"],
    description:
      "SaaS corporativo de gestão operacional e CRM com foco em centralização de vendas, controle financeiro e automação de atendimento multicanal.",
    purpose: "Desenvolvido com o objetivo de unificar a operação comercial e operacional da empresa em um único ecossistema, eliminando planilhas dispersas, reduzindo o tempo de resposta aos leads no WhatsApp e oferecendo visibilidade financeira em tempo real para a tomada de decisões executivas.",
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
    id: "mirele-fabro",
    title: "Mirele Fabro",
    slug: "mirele-fabro",
    category: "Landing Page & Saúde",
    categories: ["landing-pages"],
    technologies: ["wordpress", "elementor", "whatsapp"],
    description: "Landing page de alta sensibilidade e sofisticação desenvolvida para consolidar a autoridade clínica e captar novos pacientes para consultoria em psicologia e desenvolvimento infantil.",
    purpose: "A intenção central do projeto foi traduzir o acolhimento e a abordagem clínica multidisciplinar da psicóloga em uma experiência digital refinada, transmitindo segurança imediata aos pais e facilitando o contato direto com a clínica.",
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
    description: "Página de conversão humanizada criada para posicionar o advogado como autoridade jurídica consultiva e acelerar a captação de clientes qualificados.",
    purpose: "Criada com a intenção clara de atrair e filtrar potenciais clientes em momentos de urgência jurídica, apresentando soluções de forma direta, clara e acessível, gerando conversões imediatas para o canal de atendimento no WhatsApp.",
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
    description: "Landing page premium voltada para clínica dermatológica com foco em procedimentos clínicos, cirúrgicos e estéticos avançados.",
    purpose: "O projeto teve como intenção primordial elevar a percepção de valor dos tratamentos oferecidos pela clínica, diferenciando a profissional no mercado de estética médica de alta renda e convertendo visitantes em consultas agendadas.",
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
    description: "Portal institucional corporativo para escritório de advocacia especializado em Direito Bancário Empresarial, reestruturação de passivos e defesa patrimonial.",
    purpose: "A intenção foi construir uma presença digital imponente e institucional que transmita segurança jurídica a diretores e empresários que enfrentam endividamento bancário ou litígios financeiros de alto valor.",
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
    description: "Plataforma moderna de e-commerce gamer desenvolvida sob medida para comercialização e entrega automatizada de jogos digitais para PC.",
    purpose: "Projetada com a intenção de competir no mercado digital de games oferecendo preços competitivos, experiência de compra sem fricção e liberação imediata do produto após o pagamento via PIX.",
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
    description: "Loja virtual especializada na venda de jogos digitais para consoles e PC, estruturada com foco em ofertas, variedade de títulos e compra descomplicada.",
    purpose: "A intenção foi criar uma loja virtual acessível e amigável para o consumidor gamer final que busca jogos digitais a preços populares, garantindo segurança na transação e suporte ágil pós-compra.",
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
    description: "Landing page de altíssimo impacto visual voltada para o lançamento e captação de vagas do treinamento executivo de imersão 'Conquistadores de Sonhos'.",
    purpose: "Desenvolvida com a intenção estratégica de maximizar as conversões de tráfego pago para um evento presencial exclusivo, transmitindo exclusividade, transformação e urgência aos executivos e líderes interessados.",
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
    description: "Portal institucional e catálogo digital da clínica de especialidades médicas e diagnósticos Riosmed em Feira de Santana.",
    purpose: "A intenção do site foi transformar a presença online da clínica em um ponto central de informação e agendamento para a população local, facilitando a consulta de médicos conveniados e reduzindo o tempo de espera no agendamento.",
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
    description: "E-commerce ágil voltado para a distribuição de gift cards digitais, assinaturas de serviços (PlayStation Plus, Xbox Game Pass) e moedas virtuais.",
    purpose: "Criado para oferecer uma alternativa rápida, segura e sem burocracia para gamers que precisam recarregar suas carteiras virtuais ou renovar assinaturas instantaneamente a qualquer hora do dia ou da noite.",
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
    description: "Loja virtual de cosméticos naturais, skincare e massageadores faciais de autocuidado, desenvolvida sobre a plataforma Wix com catálogo visual fluido.",
    purpose: "A intenção foi criar uma loja visualmente encantadora e profissional que transmitisse a essência de relaxamento da marca, incentivando a compra de produtos de cuidados diários por meio de uma navegação suave e intuitiva.",
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
    description: "Loja virtual de e-commerce especializada em pisos vinílicos, laminados, rodapés e acabamentos, desenvolvida em parceria com a agência Virtualiti.",
    purpose: "Desenvolvida em parceria com a Virtualiti com o propósito de descomplicar a compra de revestimentos online, permitindo que o cliente calcule a quantidade exata de caixas necessárias para sua reforma e feche o pedido com confiança técnica.",
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
    description: "E-commerce de lentes de contato de grau, coloridas e produtos ópticos, desenvolvido em parceria com a agência Virtualiti.",
    purpose: "A intenção do projeto conjunto com a Virtualiti foi oferecer aos usuários de lentes uma experiência de compra online tão precisa quanto uma ótica física, facilitando a inserção dos parâmetros médicos e fidelizando clientes de uso contínuo.",
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
    description: "Mega portal de comércio eletrônico no segmento de materiais de construção, ferramentas e acabamentos, desenvolvido em parceria com a agência Virtualiti.",
    purpose: "Construído em cooperação com a agência Virtualiti com a intenção de digitalizar o catálogo tradicional de um home center de grande porte, permitindo tanto ao consumidor final quanto ao profissional da construção comprar materiais com agilidade e entrega programada.",
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
