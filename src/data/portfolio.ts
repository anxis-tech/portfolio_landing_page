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
  // --- PROJETOS RECENTES (Ordem: Mirele > Felipe > Erika > Riosmed > Slouver) ---
  {
    id: "mirele-fabro",
    title: "Mirele Fabro",
    slug: "mirele-fabro",
    category: "Landing Page & Saúde",
    categories: ["landing-pages"],
    description: "Landing page de alto padrão e sensibilidade visual voltada para consultoria em psicologia e desenvolvimento infantil.",
    image: "/projects/behance_mockup_shot_cover.webp",
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
    slug: "felipe-bezerril",
    category: "Landing Page de Conversão",
    categories: ["landing-pages"],
    description: "Página de conversão humanizada com foco em consultoria jurídica especializada e captação de clientes.",
    image: "/projects/felipe_bezerril_cover.webp",
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
    slug: "erika-vieira",
    category: "Landing Page & Dermatologia",
    categories: ["landing-pages"],
    description: "Landing page elegante de alta conversão para clínica de dermatologia clínica, cirúrgica e estética com foco em captação de leads.",
    image: "/projects/erika_vieira_cover.webp",
    fullPageImage: "/projects/erika_vieira.webp",
    link: "https://erikavieiradermato.com/",
    year: "2026",
    client: "Dra. Érika Vieira",
    type: "Landing Page",
    recent: true,
    featured: true,
  },
  {
    id: "riosmed",
    title: "Riosmed Hospitalar",
    slug: "riosmed",
    category: "Landing Page & Saúde",
    categories: ["landing-pages", "institucional"],
    description: "Portal e catálogo digital moderno para fornecimento de produtos hospitalares e equipamentos clínicos.",
    image: "/projects/riosmed_cover.webp",
    fullPageImage: "/projects/riosmed.webp",
    link: "https://riosmed.com.br/",
    year: "2026",
    client: "Riosmed",
    type: "Site Institucional & Catálogo",
    recent: true,
  },
  {
    id: "slouver-games",
    title: "Slouver Games",
    slug: "slouver-games",
    category: "E-commerce & Plataforma Gamer",
    categories: ["ecommerce"],
    description: "E-commerce especializado na distribuição de gift cards digitais, assinaturas e chaves com entrega instantânea.",
    image: "/projects/slouver_cover.webp",
    fullPageImage: "/projects/slouver-games.webp",
    link: "https://slouvergames.com.br/",
    year: "2026",
    client: "Slouver Games",
    type: "E-commerce & Loja Virtual",
    recent: true,
  },

  // --- PROJETOS EM PARCERIA COM AGÊNCIAS (Carrossel) ---
  {
    id: "decopisos",
    title: "Decopisos Revestimentos",
    slug: "decopisos",
    category: "E-commerce & Revestimentos",
    categories: ["parcerias", "ecommerce"],
    description: "Loja virtual especializada em pisos vinílicos, rodapés e acabamentos com catálogo dinâmico e experiência de navegação orientada à conversão.",
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
    description: "Plataforma de comércio eletrônico no segmento óptico, oferecendo jornada de compra fluida e precisa para lentes de contato e soluções visuais.",
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
    description: "Portal de e-commerce de grande porte para materiais de construção, acabamentos e ferramentas, com arquitetura ágil e busca inteligente.",
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
