import React from "react";
import Image from "next/image";
import { Bot, Zap } from "lucide-react";

export type TechKey =
  | "wordpress"
  | "elementor"
  | "woocommerce"
  | "woo"
  | "chatbots"
  | "chatbot"
  | "whatsapp"
  | "whatsapp-business"
  | "whatsapp_business"
  | "nextjs"
  | "react"
  | "nodejs"
  | "node"
  | "tray"
  | "pix"
  | "erp"
  | "bling"
  | "wix"
  | "supabase";

interface TechMeta {
  label: string;
  showLabel?: boolean;
  icon: React.ReactNode;
}

const TECH_DEFINITIONS: Record<TechKey, TechMeta> = {
  wordpress: {
    label: "WordPress",
    icon: (
      <Image
        src="/icons/wordpress.svg"
        alt="WordPress"
        width={14}
        height={14}
        className="w-3.5 h-3.5 shrink-0 object-contain"
      />
    ),
  },
  elementor: {
    label: "Elementor",
    icon: (
      <Image
        src="/icons/elementor.svg"
        alt="Elementor"
        width={14}
        height={14}
        className="w-3.5 h-3.5 shrink-0 object-contain"
      />
    ),
  },
  woocommerce: {
    label: "WooCommerce",
    showLabel: false,
    icon: (
      <Image
        src="/icons/woocommerce.svg"
        alt="WooCommerce"
        width={38}
        height={13}
        className="h-3 w-auto shrink-0 object-contain"
      />
    ),
  },
  woo: {
    label: "WooCommerce",
    showLabel: false,
    icon: (
      <Image
        src="/icons/woocommerce.svg"
        alt="WooCommerce"
        width={38}
        height={13}
        className="h-3 w-auto shrink-0 object-contain"
      />
    ),
  },
  tray: {
    label: "Loja Tray",
    icon: (
      <Image
        src="/icons/tray.webp"
        alt="Loja Tray"
        width={42}
        height={12}
        className="h-3 w-auto shrink-0 object-contain"
      />
    ),
  },
  chatbots: {
    label: "Chatbot & IA",
    icon: <Bot className="w-3.5 h-3.5 text-neutral-800 shrink-0" />,
  },
  chatbot: {
    label: "Chatbot & IA",
    icon: <Bot className="w-3.5 h-3.5 text-neutral-800 shrink-0" />,
  },
  whatsapp: {
    label: "WhatsApp",
    icon: (
      <Image
        src="/icons/whatsapp.svg"
        alt="WhatsApp"
        width={14}
        height={14}
        className="w-3.5 h-3.5 shrink-0 object-contain"
      />
    ),
  },
  "whatsapp-business": {
    label: "WhatsApp Business API",
    icon: (
      <Image
        src="/icons/whatsapp-business.svg"
        alt="WhatsApp Business API"
        width={14}
        height={14}
        className="w-3.5 h-3.5 shrink-0 object-contain"
      />
    ),
  },
  whatsapp_business: {
    label: "WhatsApp Business API",
    icon: (
      <Image
        src="/icons/whatsapp-business.svg"
        alt="WhatsApp Business API"
        width={14}
        height={14}
        className="w-3.5 h-3.5 shrink-0 object-contain"
      />
    ),
  },
  nextjs: {
    label: "Next.js",
    icon: (
      <Image
        src="/icons/nextjs.svg"
        alt="Next.js"
        width={14}
        height={14}
        className="w-3.5 h-3.5 shrink-0 object-contain"
      />
    ),
  },
  react: {
    label: "React",
    icon: (
      <Image
        src="/icons/react.svg"
        alt="React"
        width={14}
        height={14}
        className="w-3.5 h-3.5 shrink-0 object-contain"
      />
    ),
  },
  nodejs: {
    label: "Node.js",
    icon: (
      <Image
        src="/icons/nodejs.svg"
        alt="Node.js"
        width={14}
        height={14}
        className="w-3.5 h-3.5 shrink-0 object-contain"
      />
    ),
  },
  node: {
    label: "Node.js",
    icon: (
      <Image
        src="/icons/nodejs.svg"
        alt="Node.js"
        width={14}
        height={14}
        className="w-3.5 h-3.5 shrink-0 object-contain"
      />
    ),
  },
  pix: {
    label: "Pix",
    icon: (
      <Image
        src="/icons/pix.svg"
        alt="Pix"
        width={14}
        height={14}
        className="w-3.5 h-3.5 shrink-0 object-contain"
      />
    ),
  },
  erp: {
    label: "Bling ERP",
    icon: (
      <Image
        src="/icons/bling.svg"
        alt="Bling ERP"
        width={14}
        height={14}
        className="w-3.5 h-3.5 shrink-0 object-contain rounded-[3px]"
      />
    ),
  },
  bling: {
    label: "Bling ERP",
    icon: (
      <Image
        src="/icons/bling.svg"
        alt="Bling ERP"
        width={14}
        height={14}
        className="w-3.5 h-3.5 shrink-0 object-contain rounded-[3px]"
      />
    ),
  },
  wix: {
    label: "Wix",
    icon: (
      <Image
        src="/icons/wix.svg"
        alt="Wix"
        width={14}
        height={14}
        className="w-3.5 h-3.5 shrink-0 object-contain"
      />
    ),
  },
  supabase: {
    label: "Supabase",
    icon: (
      <Image
        src="/icons/supabase.svg"
        alt="Supabase"
        width={14}
        height={14}
        className="w-3.5 h-3.5 shrink-0 object-contain"
      />
    ),
  },
};

export function TechBadge({ techKey }: { techKey: string }) {
  const normalizedKey = techKey.toLowerCase().trim() as TechKey;
  const meta = TECH_DEFINITIONS[normalizedKey];

  if (!meta) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-600 bg-neutral-100 border border-neutral-200/70 px-2 py-0.5 rounded-md">
        <Zap className="w-3 h-3 text-neutral-400" />
        <span>{techKey}</span>
      </span>
    );
  }

  return (
    <span
      title={meta.label}
      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-700 bg-neutral-100/90 border border-neutral-200/80 hover:bg-neutral-200/60 transition-colors px-2 py-0.5 rounded-md select-none"
    >
      {meta.icon}
      {meta.showLabel !== false && <span>{meta.label}</span>}
    </span>
  );
}

export function TechBadgeList({ technologies }: { technologies?: string[] }) {
  if (!technologies || technologies.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
      {technologies.map((tech) => (
        <TechBadge key={tech} techKey={tech} />
      ))}
    </div>
  );
}
