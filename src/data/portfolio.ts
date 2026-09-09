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
  description: string;
  image: string;
  link: string;
  year?: string;
  client?: string;
  agency?: string; // Agency name if made in partnership
  type?: string;
  recent?: boolean; // Appears in "Projetos recentes"
  agencyProject?: boolean; // Appears in "Projetos em parceria" carousel
  featured?: boolean;
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
    id: "projects",
    value: "+100",
    label: "Projetos entregues",
    description: "Landing pages, plataformas e sistemas",
  },
  {
    id: "clients",
    value: "+100",
    label: "Clientes",
    description: "Marcas e parceiros atendidos com excelência",
  },
  {
    id: "experience",
    value: "05+",
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
    slug: "ui-ux",
    name: "UI/UX Design",
    title: "Projetos de UI/UX Design",
    description:
      "Uma seleção de interfaces concebidas com foco em arquitetura de informação, usabilidade, refinamento visual e design systems consistentes.",
  },
  {
    slug: "landing-pages",
    name: "Landing Pages",
    title: "Projetos de Landing Pages",
    description:
      "Páginas focadas em alta taxa de conversão, velocidade máxima de carregamento, storytelling visual persuasivo e posicionamento de marca.",
  },
  {
    slug: "desenvolvimento",
    name: "Desenvolvimento Web",
    title: "Projetos de Desenvolvimento",
    description:
      "Aplicações e websites construídos com tecnologias modernas, código limpo, semântica acessível e responsividade precisa em qualquer dispositivo.",
  },
  {
    slug: "institucional",
    name: "Sites Institucionais",
    title: "Sites Institucionais & Corporativos",
    description:
      "Plataformas digitais corporativas desenvolvidas para transmitir autoridade, elegância e credibilidade imediata ao mercado.",
  },
  {
    slug: "ecommerce",
    name: "E-commerce",
    title: "E-commerce & Lojas Virtuais",
    description:
      "Ecossistemas de venda online com fluxos intuitivos de navegação, checkout otimizado e apresentação envolvente de produtos.",
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
  // --- PROJETOS RECENTES (Primeira Linha - 3 Iniciais) ---
  {
    id: "selo-brasil",
    title: "Selo Brasil",
    slug: "selo-brasil",
    category: "Site Institucional & Tecnologia",
    categories: ["institucional", "desenvolvimento", "ui-ux"],
    description: "Plataforma institucional para certificação digital e serviços corporativos com interface limpa e segura.",
    image: "/projects/selo-brasil.webp",
    link: "http://selobrasil.com.br/",
    year: "2026",
    client: "Selo Brasil Certificados",
    type: "Web Design & Front-end",
    recent: true,
    featured: true,
  },
  {
    id: "mirele-fabro",
    title: "Mirele Fabro",
    slug: "mirele-fabro",
    category: "Landing Page & Saúde",
    categories: ["landing-pages", "ui-ux"],
    description: "Landing page de alto padrão e sensibilidade visual voltada para consultoria em psicologia e desenvolvimento infantil.",
    image: "/projects/mirele-fabro.webp",
    link: "https://mirelefabro.com.br/",
    year: "2026",
    client: "Dra. Mirele Fabro",
    type: "UI/UX & Landing Page",
    recent: true,
    featured: true,
  },
  {
    id: "slouver-games",
    title: "Slouver Games",
    slug: "slouver-games",
    category: "E-commerce & Plataforma Gamer",
    categories: ["ecommerce", "desenvolvimento", "ui-ux"],
    description: "E-commerce especializado na distribuição de gift cards digitais, assinaturas e chaves com entrega instantânea.",
    image: "/projects/slouver-games.webp",
    link: "https://slouvergames.com.br/",
    year: "2026",
    client: "Slouver Games",
    type: "E-commerce & UX",
    recent: true,
    featured: true,
  },

  // --- PROJETOS RECENTES (Segunda Linha - Revelados no 'Ver mais') ---
  {
    id: "acj-advogados",
    title: "ACJ Advogados",
    slug: "acj-advogados",
    category: "Site Institucional Jurídico",
    categories: ["institucional", "desenvolvimento"],
    description: "Website institucional com estética editorial sóbria para banca de advocacia de direito empresarial.",
    image: "/projects/acj-advogados.webp",
    link: "https://acjadvogados.com/",
    year: "2026",
    client: "ACJ Advogados",
    type: "Site Corporativo",
    recent: true,
  },
  {
    id: "riosmed",
    title: "Riosmed Hospitalar",
    slug: "riosmed",
    category: "Landing Page & Saúde",
    categories: ["landing-pages", "institucional"],
    description: "Portal e catálogo digital moderno para fornecimento de produtos hospitalares e equipamentos clínicos.",
    image: "/projects/riosmed.webp",
    link: "https://riosmed.com.br/",
    year: "2026",
    client: "Riosmed",
    type: "Landing Page & Catálogo",
    recent: true,
  },
  {
    id: "felipe-bezerril",
    title: "Felipe Bezerril",
    slug: "felipe-bezerril",
    category: "Landing Page de Conversão",
    categories: ["landing-pages", "ui-ux"],
    description: "Página de conversão humanizada com foco em consultoria jurídica especializada e captação de clientes.",
    image: "/projects/felipe-bezerril.webp",
    link: "https://felipebezerril.adv.br/",
    year: "2026",
    client: "Felipe Bezerril Advocacia",
    type: "Landing Page",
    recent: true,
  },

  // --- PROJETOS EM PARCERIA COM AGÊNCIAS (Carrossel) ---
  {
    id: "neves-padua",
    title: "Neves Pádua Advocacia",
    slug: "neves-padua",
    category: "Plataforma Digital & Landing Page",
    categories: ["parcerias", "landing-pages", "institucional"],
    description: "Desenvolvimento técnico completo da interface institucional em parceria estratégica com estúdio criativo.",
    agency: "Agência Alpha Studio",
    image: "/projects/neves-padua.webp",
    link: "https://nevespaduaadvocacia.com.br/",
    year: "2026",
    type: "Desenvolvimento Front-end",
    agencyProject: true,
  },
  {
    id: "selo-brasil-agency",
    title: "Portal Selo Brasil Corporate",
    slug: "selo-brasil-corporate",
    category: "Design System & Interface Web",
    categories: ["parcerias", "ui-ux", "desenvolvimento"],
    description: "Implementação da interface digital e integração de fluxos corporativos em colaboração com equipe externa.",
    agency: "Agência Nexus Branding",
    image: "/projects/selo-brasil.webp",
    link: "http://selobrasil.com.br/",
    year: "2026",
    type: "UI/UX & Desenvolvimento",
    agencyProject: true,
  },
  {
    id: "slouver-hub",
    title: "Slouver Checkout Flow",
    slug: "slouver-checkout",
    category: "Experiência de Compra & Performance",
    categories: ["parcerias", "ecommerce", "ui-ux"],
    description: "Otimização de checkout e interface do usuário para agilizar conversões de microtransações digitais.",
    agency: "Lab Digital Partners",
    image: "/projects/slouver-games.webp",
    link: "https://slouvergames.com.br/",
    year: "2026",
    type: "UI/UX & Otimização",
    agencyProject: true,
  },
  {
    id: "mirele-platform",
    title: "Mirele Fabro Portal Família",
    slug: "mirele-portal",
    category: "Interface & Storytelling",
    categories: ["parcerias", "landing-pages"],
    description: "Criação de landing page com narrativa acolhedora desenhada em conjunto com consultoria de marca.",
    agency: "Vértice Comunicação",
    image: "/projects/mirele-fabro.webp",
    link: "https://mirelefabro.com.br/",
    year: "2026",
    type: "Web Design & Front-end",
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

// Retorna projetos recentes (com limite opcional)
export function getRecentProjects(limit?: number): Project[] {
  const recent = projectsData.filter((p) => p.recent);
  return limit ? recent.slice(0, limit) : recent;
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
