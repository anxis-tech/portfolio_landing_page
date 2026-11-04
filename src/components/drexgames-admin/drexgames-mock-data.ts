export interface DrexOrder {
  number: number;
  productName: string;
  variantName?: string;
  sku: string;
  amountCents: number;
  method: "PIX" | "CREDIT_CARD";
  status: "PAID" | "PENDING" | "PROCESSING" | "OVERDUE" | "CANCELED" | "REFUNDED";
  createdAt: string;
  customerName: string;
  customerEmail: string;
  itemsCount: number;
}

export interface DrexProduct {
  id: string;
  name: string;
  sku: string;
  categories: string[];
  active: boolean;
  priceCents: number;
  promoPriceCents: number | null;
  stockCount: number;
  platform: string;
}

export interface DrexCustomer {
  id: string;
  name: string;
  email: string;
  maskedDocument: string;
  incomplete: boolean;
  emailVerified: boolean;
  ordersCount: number;
  createdAt: string;
}

export interface DrexCoupon {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  usageCount: number;
  active: boolean;
  description: string;
}

export const DREX_METRICS = {
  totalProducts: 148,
  activeProducts: 134,
  inactiveProducts: 14,
  totalOrders: 1842,
  pendingOrders: 7,
  processingOrders: 3,
  overdueOrders: 4,
  paidOrders: 1629,
  monthlyRevenueCents: 4289050,
  averageTicketCents: 14230,
};

export const DREX_ORDERS: DrexOrder[] = [
  {
    number: 1842,
    productName: "EA Sports FC 25 — Chave de Ativação PC",
    variantName: "Edição Standard · Steam",
    sku: "EAFC25-PC-STM",
    amountCents: 24990,
    method: "PIX",
    status: "PAID",
    createdAt: "2026-11-04T15:10:00-03:00",
    customerName: "Lucas Henrique",
    customerEmail: "lucas.henrique@gmail.com",
    itemsCount: 1,
  },
  {
    number: 1841,
    productName: "Black Myth: Wukong — Deluxe Edition",
    variantName: "Edição Deluxe Completa · Steam",
    sku: "BMW-DLX-STM",
    amountCents: 29900,
    method: "CREDIT_CARD",
    status: "PAID",
    createdAt: "2026-11-04T14:45:00-03:00",
    customerName: "Matheus Silveira",
    customerEmail: "matheus.silveira@outlook.com",
    itemsCount: 1,
  },
  {
    number: 1840,
    productName: "Silent Hill 2 Remake — Chave Digital",
    variantName: "Chave Global PC · Steam",
    sku: "SH2-PC-STM",
    amountCents: 22950,
    method: "PIX",
    status: "PAID",
    createdAt: "2026-11-04T14:12:00-03:00",
    customerName: "Bruno Carvalho",
    customerEmail: "bruno.c@hotmail.com",
    itemsCount: 1,
  },
  {
    number: 1839,
    productName: "God of War Ragnarök — Steam Key",
    variantName: "Edição Digital Standard",
    sku: "GOW-RAG-PC",
    amountCents: 24990,
    method: "PIX",
    status: "PROCESSING",
    createdAt: "2026-11-04T13:50:00-03:00",
    customerName: "Daniel Faria",
    customerEmail: "daniel.faria@gmail.com",
    itemsCount: 1,
  },
  {
    number: 1838,
    productName: "Minecraft Java & Bedrock Edition",
    variantName: "Código Oficial Microsoft Store",
    sku: "MC-JB-PC",
    amountCents: 17800,
    method: "CREDIT_CARD",
    status: "PAID",
    createdAt: "2026-11-04T13:15:00-03:00",
    customerName: "Juliana Santos",
    customerEmail: "ju.santos@terra.com.br",
    itemsCount: 2,
  },
  {
    number: 1837,
    productName: "Cyberpunk 2077: Phantom Liberty Bundle",
    variantName: "Jogo Base + DLC · GOG Key",
    sku: "CP77-PL-STM",
    amountCents: 18990,
    method: "PIX",
    status: "PENDING",
    createdAt: "2026-11-04T12:40:00-03:00",
    customerName: "Rodrigo Prado",
    customerEmail: "rodrigo.prado@gmail.com",
    itemsCount: 1,
  },
  {
    number: 1836,
    productName: "Grand Theft Auto V: Premium Online",
    variantName: "Rockstar Launcher Activation Key",
    sku: "GTA5-PRM-RSC",
    amountCents: 8990,
    method: "PIX",
    status: "PAID",
    createdAt: "2026-11-04T11:20:00-03:00",
    customerName: "Felipe Costa",
    customerEmail: "felipe.costa@uol.com.br",
    itemsCount: 1,
  },
  {
    number: 1835,
    productName: "Elden Ring: Shadow of the Erdtree Edition",
    variantName: "Bundle Expansão Oficial · Steam",
    sku: "ER-SOTE-STM",
    amountCents: 34990,
    method: "CREDIT_CARD",
    status: "PAID",
    createdAt: "2026-11-04T10:05:00-03:00",
    customerName: "André Souza",
    customerEmail: "andre.souza@gmail.com",
    itemsCount: 1,
  },
  {
    number: 1834,
    productName: "Red Dead Redemption 2 — Ultimate Edition",
    variantName: "Rockstar Games Launcher",
    sku: "RDR2-ULT-PC",
    amountCents: 11990,
    method: "PIX",
    status: "OVERDUE",
    createdAt: "2026-11-03T22:30:00-03:00",
    customerName: "Caio Castro",
    customerEmail: "caio.castro@gmail.com",
    itemsCount: 1,
  },
  {
    number: 1833,
    productName: "The Last of Us Part I — Digital Deluxe",
    variantName: "Chave PC Steam Oficial",
    sku: "TLOU1-PC-STM",
    amountCents: 21990,
    method: "PIX",
    status: "PAID",
    createdAt: "2026-11-03T20:15:00-03:00",
    customerName: "Rafael Ribeiro",
    customerEmail: "rafael.ribeiro@gmail.com",
    itemsCount: 1,
  },
];

export const DREX_PRODUCTS: DrexProduct[] = [
  {
    id: "ea-sports-fc-25",
    name: "EA Sports FC 25",
    sku: "EAFC25-PC-STM",
    categories: ["Esportes", "PC", "Steam"],
    active: true,
    priceCents: 29900,
    promoPriceCents: 24990,
    stockCount: 34,
    platform: "Steam",
  },
  {
    id: "black-myth-wukong",
    name: "Black Myth: Wukong — Deluxe Edition",
    sku: "BMW-DLX-STM",
    categories: ["Ação", "RPG", "Steam"],
    active: true,
    priceCents: 34900,
    promoPriceCents: 29900,
    stockCount: 18,
    platform: "Steam",
  },
  {
    id: "silent-hill-2",
    name: "Silent Hill 2 Remake",
    sku: "SH2-PC-STM",
    categories: ["Terror", "PC", "Steam"],
    active: true,
    priceCents: 27900,
    promoPriceCents: 22950,
    stockCount: 22,
    platform: "Steam",
  },
  {
    id: "god-of-war-ragnarok",
    name: "God of War Ragnarök",
    sku: "GOW-RAG-PC",
    categories: ["Ação", "Aventura", "Steam"],
    active: true,
    priceCents: 29900,
    promoPriceCents: 24990,
    stockCount: 45,
    platform: "Steam",
  },
  {
    id: "minecraft-java-bedrock",
    name: "Minecraft Java & Bedrock Edition",
    sku: "MC-JB-PC",
    categories: ["Sandbox", "Aventura", "Microsoft"],
    active: true,
    priceCents: 9900,
    promoPriceCents: 8900,
    stockCount: 89,
    platform: "Microsoft Store",
  },
  {
    id: "cyberpunk-2077-phantom-liberty",
    name: "Cyberpunk 2077: Phantom Liberty Bundle",
    sku: "CP77-PL-STM",
    categories: ["RPG", "Ficção", "Steam"],
    active: true,
    priceCents: 22900,
    promoPriceCents: 18990,
    stockCount: 15,
    platform: "Steam",
  },
  {
    id: "gta-v-premium",
    name: "Grand Theft Auto V: Premium Online",
    sku: "GTA5-PRM-RSC",
    categories: ["Mundo Aberto", "Rockstar"],
    active: true,
    priceCents: 11900,
    promoPriceCents: 8990,
    stockCount: 120,
    platform: "Rockstar Launcher",
  },
  {
    id: "elden-ring-shadow-erdtree",
    name: "Elden Ring: Shadow of the Erdtree",
    sku: "ER-SOTE-STM",
    categories: ["RPG", "Soulslike", "Steam"],
    active: true,
    priceCents: 39900,
    promoPriceCents: 34990,
    stockCount: 11,
    platform: "Steam",
  },
  {
    id: "hogwarts-legacy",
    name: "Hogwarts Legacy",
    sku: "HL-PC-STM",
    categories: ["RPG", "Fantasia", "Steam"],
    active: true,
    priceCents: 24900,
    promoPriceCents: 14990,
    stockCount: 28,
    platform: "Steam",
  },
  {
    id: "resident-evil-4-remake",
    name: "Resident Evil 4 Remake",
    sku: "RE4-R-STM",
    categories: ["Survival Horror", "Steam"],
    active: true,
    priceCents: 19900,
    promoPriceCents: 12990,
    stockCount: 19,
    platform: "Steam",
  },
];

export const DREX_CUSTOMERS: DrexCustomer[] = [
  {
    id: "cust-1",
    name: "Lucas Henrique",
    email: "lucas.henrique@gmail.com",
    maskedDocument: "***.418.902-**",
    incomplete: false,
    emailVerified: true,
    ordersCount: 8,
    createdAt: "2026-03-12T10:00:00-03:00",
  },
  {
    id: "cust-2",
    name: "Matheus Silveira",
    email: "matheus.silveira@outlook.com",
    maskedDocument: "***.129.873-**",
    incomplete: false,
    emailVerified: true,
    ordersCount: 4,
    createdAt: "2026-04-18T14:20:00-03:00",
  },
  {
    id: "cust-3",
    name: "Bruno Carvalho",
    email: "bruno.c@hotmail.com",
    maskedDocument: "***.981.234-**",
    incomplete: false,
    emailVerified: true,
    ordersCount: 6,
    createdAt: "2026-05-22T09:15:00-03:00",
  },
  {
    id: "cust-4",
    name: "Daniel Faria",
    email: "daniel.faria@gmail.com",
    maskedDocument: "***.765.432-**",
    incomplete: false,
    emailVerified: true,
    ordersCount: 2,
    createdAt: "2026-06-05T18:40:00-03:00",
  },
  {
    id: "cust-5",
    name: "Juliana Santos",
    email: "ju.santos@terra.com.br",
    maskedDocument: "***.341.678-**",
    incomplete: false,
    emailVerified: true,
    ordersCount: 11,
    createdAt: "2026-01-30T11:00:00-03:00",
  },
  {
    id: "cust-6",
    name: "Rodrigo Prado",
    email: "rodrigo.prado@gmail.com",
    maskedDocument: "***.890.123-**",
    incomplete: false,
    emailVerified: true,
    ordersCount: 3,
    createdAt: "2026-07-14T16:25:00-03:00",
  },
  {
    id: "cust-7",
    name: "Felipe Costa",
    email: "felipe.costa@uol.com.br",
    maskedDocument: "***.567.890-**",
    incomplete: false,
    emailVerified: true,
    ordersCount: 5,
    createdAt: "2026-08-01T12:30:00-03:00",
  },
];

export const DREX_COUPONS: DrexCoupon[] = [
  {
    code: "DREX10",
    discountType: "percentage",
    discountValue: 10,
    usageCount: 142,
    active: true,
    description: "10% de desconto em todo o catálogo de chaves digitais.",
  },
  {
    code: "BEMVINDO5",
    discountType: "fixed",
    discountValue: 15,
    usageCount: 389,
    active: true,
    description: "R$ 15,00 de desconto no primeiro pedido acima de R$ 90.",
  },
  {
    code: "BLACKDREX",
    discountType: "percentage",
    discountValue: 20,
    usageCount: 67,
    active: true,
    description: "20% OFF promocional para lançamentos selecionados.",
  },
];
