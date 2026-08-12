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
    image: "/projects/selo-brasil.png",
    projectUrl: "http://selobrasil.com.br/",
  },
  {
    id: "louver-games",
    title: "LOUVER GAMES",
    category: "E-commerce",
    description: "Redesign e desenvolvimento da experiência da loja com foco em organização dos produtos, conversão e experiência de compra.",
    technologies: ["Tray", "UI Design", "Front-end"],
    year: "2026",
    image: "/projects/louver-games.png",
    projectUrl: "https://example.com/louver-games",
    caseStudyUrl: "#estudo-de-caso-louver",
  },
  {
    id: "lumina-architecture",
    title: "STUDIO LUMINA ARCHITECTURE",
    category: "Site Institucional",
    description: "Website minimalista para escritório de arquitetura de alto padrão, destacando projetos através de fotografia editorial e navegação fluida.",
    technologies: ["Next.js", "React", "Tailwind CSS", "UI Design"],
    year: "2025",
    image: "/projects/lumina-architecture.png",
    projectUrl: "https://example.com/lumina",
  },
  {
    id: "veloce-saas",
    title: "VELOCE PRODUCTIVITY SAAS",
    category: "Landing Page & UI Design",
    description: "Landing page de alta conversão para plataforma de gestão de fluxos de trabalho e produtividade com métricas em tempo real.",
    technologies: ["Next.js", "Tailwind CSS", "UI Design", "Front-end"],
    year: "2025",
    image: "/projects/veloce-saas.png",
    projectUrl: "https://example.com/veloce",
    caseStudyUrl: "#estudo-de-caso-veloce",
  },
  {
    id: "atelier-gourmet",
    title: "ATELIER GOURMET BAKERY",
    category: "E-commerce & Branding",
    description: "Experiência digital para padaria artesanal e confeitaria gourmet com catálogo interativo e sistema de encomendas personalizadas.",
    technologies: ["WooCommerce", "WordPress", "UI Design"],
    year: "2025",
    image: "/projects/atelier-gourmet.png",
    projectUrl: "https://example.com/atelier",
  },
];
