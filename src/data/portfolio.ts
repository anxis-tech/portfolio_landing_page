export interface ProfileInfo {
  name: string;
  role: string;
  bio: string;
  avatarUrl: string;
  location: string;
  availability: string;
  specialty: string;
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
  bio: "Crio sites, landing pages e experiências digitais focadas em design, performance e conversão.",
  avatarUrl: "/avatar.jpg",
  location: "Brasil",
  availability: "Freelancer",
  specialty: "Sites, Landing Pages e E-commerce",
};

export const socialLinksData: SocialLink[] = [
  {
    name: "99Freelas",
    url: "https://www.99freelas.com.br/user/anxis",
    iconName: "Briefcase",
    active: true,
    platformBadge: "Perfil verificado",
  },
  /* Estrutura pronta para futuras redes:
  {
    name: "LinkedIn",
    url: "https://linkedin.com/in/seu-perfil",
    iconName: "Linkedin",
    active: false,
  },
  {
    name: "GitHub",
    url: "https://github.com/seu-perfil",
    iconName: "Github",
    active: false,
  },
  {
    name: "Behance",
    url: "https://behance.net/seu-perfil",
    iconName: "Globe",
    active: false,
  },
  {
    name: "Dribbble",
    url: "https://dribbble.com/seu-perfil",
    iconName: "Dribbble",
    active: false,
  },
  {
    name: "E-mail",
    url: "mailto:contato@exemplo.com",
    iconName: "Mail",
    active: false,
  },
  {
    name: "WhatsApp",
    url: "https://wa.me/5500000000000",
    iconName: "MessageCircle",
    active: false,
  },
  */
];

export const specialtiesData: string[] = [
  "Landing Pages",
  "Sites Institucionais",
  "E-commerce",
  "UI Design",
  "Desenvolvimento Front-end",
];

export const technologiesData: string[] = [
  "Next.js",
  "React",
  "WordPress",
  "Elementor",
  "WooCommerce",
  "Tray",
  "Nuvemshop",
  "Tailwind CSS",
];

export const projectsData: Project[] = [
  {
    id: "selo-brasil",
    title: "SELO BRASIL",
    category: "Certificação Digital & Plataforma",
    description: "Desenvolvimento de plataforma para serviços de certificação digital, planos de assinaturas, consultas e soluções de tecnologia.",
    technologies: ["WordPress", "UI Design", "Front-end"],
    year: "2026",
    image: "/projects/selo-brasil.webp",
    projectUrl: "http://selobrasil.com.br/",
  },
  {
    id: "mirele-fabro",
    title: "MIRELE FABRO",
    category: "Landing Page & Saúde",
    description: "Website e landing page de alta conversão para consultoria em psicologia infantil, desenvolvimento comportamental e suporte familiar.",
    technologies: ["WordPress", "Elementor", "UI Design"],
    year: "2026",
    image: "/projects/mirele-fabro.webp",
    projectUrl: "https://mirelefabro.com.br/",
  },
  {
    id: "slouver-games",
    title: "SLOUVER GAMES",
    category: "E-commerce & Jogos",
    description: "Plataforma e e-commerce especializado na venda de gift cards, moedas virtuais e licenças de jogos digitais com entrega rápida.",
    technologies: ["WordPress", "WooCommerce", "UI Design"],
    year: "2026",
    image: "/projects/slouver-games.webp",
    projectUrl: "https://slouvergames.com.br/",
  },
  {
    id: "acj-advogados",
    title: "ACJ ADVOGADOS",
    category: "Site Institucional & Direito",
    description: "Website corporativo e jurídico de alta autoridade para escritório de advocacia especializado em consultoria empresarial e contencioso.",
    technologies: ["WordPress", "Elementor", "UI Design"],
    year: "2026",
    image: "/projects/acj-advogados.webp",
    projectUrl: "https://acjadvogados.com/",
  },
  {
    id: "neves-padua",
    title: "NEVES PÁDUA ADVOCACIA",
    category: "Landing Page & Direito",
    description: "Plataforma digital e landing page institucional focada em soluções jurídicas especializadas, posicionamento de marca e captação de clientes.",
    technologies: ["WordPress", "Elementor", "UI Design"],
    year: "2026",
    image: "/projects/neves-padua.webp",
    projectUrl: "https://nevespaduaadvocacia.com.br/",
  },
  {
    id: "riosmed",
    title: "RIOSMED",
    category: "Plataforma & Saúde",
    description: "Website e portal de serviços médicos e hospitalares com catálogo de produtos, soluções em saúde e estrutura de atendimento digital.",
    technologies: ["WordPress", "UI Design", "Front-end"],
    year: "2026",
    image: "/projects/riosmed.webp",
    projectUrl: "https://riosmed.com.br/",
  },
  {
    id: "felipe-bezerril",
    title: "FELIPE BEZERRIL ADVOCACIA",
    category: "Site Institucional & Direito",
    description: "Website institucional de alto padrão e landing page jurídica focada em direito de família, atendimento humanizado e conversão de clientes.",
    technologies: ["WordPress", "Elementor", "UI Design"],
    year: "2026",
    image: "/projects/felipe-bezerril.webp",
    projectUrl: "https://felipebezerril.adv.br/",
  },
];
