import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Newsreader } from "next/font/google";
import "./globals.css";
import { HostingerBadge } from "@/components/hostinger-badge";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mateus Oliveira — Designer & Desenvolvedor Web | Portfólio Profissional",
  description: "Portfólio de Mateus Oliveira. Sites institucionais, landing pages de alta conversão e plataformas e-commerce.",
  keywords: [
    "Web Designer",
    "Desenvolvedor Front-end",
    "Landing Pages",
    "Sites Institucionais",
    "E-commerce",
    "Portfólio Web",
    "Next.js",
    "WordPress",
  ],
  authors: [{ name: "Mateus Oliveira" }],
  openGraph: {
    title: "Mateus Oliveira — Designer & Desenvolvedor Web",
    description: "Portfólio profissional com projetos selecionados e casos reais de web design e desenvolvimento.",
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
    <html lang="pt-BR" className={`${plusJakarta.variable} ${newsreader.variable}`} suppressHydrationWarning>
      <body className="bg-[#FAFAFA] text-[#121212] antialiased selection:bg-[#121212] selection:text-white font-sans" suppressHydrationWarning>
        {children}
        <HostingerBadge />
      </body>
    </html>
  );
}
