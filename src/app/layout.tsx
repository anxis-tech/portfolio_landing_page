import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mateus Oliveira — Designer & Desenvolvedor Web | Currículo Digital & Portfólio",
  description: "Portfólio profissional e editorial de Mateus Oliveira. Sites, landing pages e experiências digitais focadas em design, performance e conversão.",
  keywords: [
    "Web Designer",
    "Desenvolvedor Front-end",
    "Landing Pages",
    "Sites Institucionais",
    "E-commerce",
    "Portfólio Minimalista",
    "Next.js",
    "Tailwind CSS",
  ],
  authors: [{ name: "Mateus Oliveira" }],
  openGraph: {
    title: "Mateus Oliveira — Designer & Desenvolvedor Web",
    description: "Currículo digital e portfólio profissional com projetos selecionados em web design e desenvolvimento.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${plusJakarta.variable}`} suppressHydrationWarning>
      <body className="bg-[#F7F4F0] text-[#252525] antialiased selection:bg-[#C96A4A] selection:text-[#FFFFFF]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
