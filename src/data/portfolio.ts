export interface ProfileInfo {
  name: string;
  role: string;
  bio: string;
  avatarUrl: string;
  bannerUrl: string;
  location: string;
  availability: string;
  specialty: string;
  freelasUrl: string;
}

export interface SocialLink {
  name: string;
  url: string;
  iconName: string;
  active: boolean;
  platformBadge?: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  categorySlug: "landing-page" | "ecommerce" | "institucional";
  description: string;
  technologies: string[];
  year: string;
  image: string;
  projectUrl: string;
  caseStudyUrl?: string;
}

export const profileData: ProfileInfo = {
  name: "MATEUS OLIVEIRA",
  role: "Designer & Desenvolvedor Web",
  bio: "Crio sites institucionais, landing pages de alta conversão e soluções web personalizadas unindo design refinado, performance extrema e foco em resultados.",
  avatarUrl: "/avatar.jpg",
  bannerUrl: "/banner.webp",
  location: "Brasil",
  availability: "Disponível para Projetos",
  specialty: "Landing Pages, E-commerce & Sites Institucionais",
  freelasUrl: "https://www.99freelas.com.br/user/anxis",
};

export const socialLinksData: SocialLink[] = [
  {
    name: "99Freelas",
    url: "https://www.99freelas.com.br/user/anxis",
    iconName: "Briefcase",
    active: true,
    platformBadge: "Perfil Verificado",
  },
];

export const specialtiesData: string[] = [
  "Landing Pages de Alta Conversão",
  "Sites Institucionais Corporativos",
  "Lojas Virtuais & E-commerce",
  "UI/UX Design & Prototipagem",
  "Desenvolvimento Front-end Responsivo",
  "Otimização de Performance & SEO",
];

export const technologiesData: string[] = [
  "WordPress",
  "Elementor Pro",
  "WooCommerce",
  "Next.js",
  "React",
  "Tailwind CSS",
  "TypeScript",
  "Figma",
  "Tray",
  "Nuvemshop",
];

export const projectsData: Project[] = [
  {
    id: "selo-brasil",
    title: "SELO BRASIL",
    category: "Site Institucional",
    categorySlug: "institucional",
    description: "Desenvolvimento de site institucional e plataforma para serviços de certificação digital, planos de assinaturas e soluções de tecnologia.",
    technologies: ["WordPress", "UI Design", "Front-end"],
    year: "2026",
    image: "/projects/selo-brasil.webp",
    projectUrl: "http://selobrasil.com.br/",
  },
  {
    id: "mirele-fabro",
    title: "MIRELE FABRO",
    category: "Landing Page & Saúde",
    categorySlug: "landing-page",
    description: "Website e landing page de alta conversão para consultoria em psicologia infantil e suporte familiar.",
    technologies: ["WordPress", "Elementor", "UI Design"],
    year: "2026",
    image: "/projects/mirele-fabro.webp",
    projectUrl: "https://mirelefabro.com.br/",
  },
  {
    id: "slouver-games",
    title: "SLOUVER GAMES",
    category: "E-commerce & Jogos",
    categorySlug: "ecommerce",
    description: "Plataforma e e-commerce especializado na venda de gift cards, moedas virtuais e licenças de jogos com entrega rápida.",
    technologies: ["WordPress", "WooCommerce", "UI Design"],
    year: "2026",
    image: "/projects/slouver-games.webp",
    projectUrl: "https://slouvergames.com.br/",
  },
  {
    id: "acj-advogados",
    title: "ACJ ADVOGADOS",
    category: "Site Institucional & Direito",
    categorySlug: "institucional",
    description: "Website corporativo e jurídico de alta autoridade para escritório de advocacia especializado em consultoria empresarial.",
    technologies: ["WordPress", "Elementor", "UI Design"],
    year: "2026",
    image: "/projects/acj-advogados.webp",
    projectUrl: "https://acjadvogados.com/",
  },
  {
    id: "neves-padua",
    title: "NEVES PÁDUA ADVOCACIA",
    category: "Landing Page & Direito",
    categorySlug: "landing-page",
    description: "Plataforma digital e landing page institucional focada em soluções jurídicas especializadas e captação de clientes.",
    technologies: ["WordPress", "Elementor", "UI Design"],
    year: "2026",
    image: "/projects/neves-padua.webp",
    projectUrl: "https://nevespaduaadvocacia.com.br/",
  },
  {
    id: "riosmed",
    title: "RIOSMED",
    category: "Landing Page & Saúde",
    categorySlug: "landing-page",
    description: "Landing page e portal de serviços médicos e hospitalares com catálogo de produtos e estrutura moderna de atendimento digital.",
    technologies: ["WordPress", "UI Design", "Front-end"],
    year: "2026",
    image: "/projects/riosmed.webp",
    projectUrl: "https://riosmed.com.br/",
  },
  {
    id: "felipe-bezerril",
    title: "FELIPE BEZERRIL ADVOCACIA",
    category: "Landing Page & Direito",
    categorySlug: "landing-page",
    description: "Landing page de alto padrão focada em direito de família e captação humanizada de clientes.",
    technologies: ["WordPress", "Elementor", "UI Design"],
    year: "2026",
    image: "/projects/felipe-bezerril.webp",
    projectUrl: "https://felipebezerril.adv.br/",
  },
];
