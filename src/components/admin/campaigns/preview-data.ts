// Dados de exemplo da prévia de Campanhas e Leads. Nada aqui vem da Meta nem do banco: quando o
// backend existir, cada bloco é trocado pela leitura real com o mesmo formato.

export type CampaignStatus = 'active' | 'paused' | 'in_review' | 'draft'

export interface PreviewCampaign {
  id: string
  name: string
  offer: string
  audience: string
  status: CampaignStatus
  cap: number
  spent: number
  conversations: number
  qualified: number
  clients: number
  startedAt: string
}

export interface PreviewCreative {
  id: string
  image: string
  headline: string
  primaryText: string
  cta: string
}

export interface PreviewDraft {
  id: string
  name: string
  offer: string
  rationale: string
  audience: { segment: string; location: string; age: string; interests: string[] }
  suggestedCap: number
  durationDays: number
  createdAt: string
  creatives: PreviewCreative[]
  research: { title: string; source: string; note: string }[]
}

export type AgentActionKind = 'pause' | 'shift_budget' | 'draft' | 'research' | 'blocked'

export interface PreviewAgentAction {
  id: string
  at: string
  kind: AgentActionKind
  campaign: string
  summary: string
  before?: string
  after?: string
  reason: string
  undone?: boolean
}

export type JobStatus = 'queued' | 'running' | 'done'

export interface PreviewJob {
  id: string
  label: string
  status: JobStatus
  startedAt: string
}

export type LeadStatus = 'Novo' | 'Em contato' | 'Orçamento' | 'Fechado' | 'Perdido'
export type LeadIntent = 'qualified' | 'not_interested' | 'unclear' | 'auto_reply' | null

export interface PreviewLead {
  id: string
  name: string
  company: string
  phone: string
  origin: { kind: 'ads'; campaign: string; ad: string } | { kind: 'prospecting'; campaign: string }
  status: LeadStatus
  intent: LeadIntent
  lastMessage: string
  lastMessageAt: string
  assignee: string | null
  enteredAt: string
  value?: number
}

const today = new Date()
const daysAgo = (n: number, hour = 10) => {
  const d = new Date(today)
  d.setDate(d.getDate() - n)
  d.setHours(hour, 12, 0, 0)
  return d.toISOString()
}

export const PREVIEW_CAMPAIGNS: PreviewCampaign[] = [
  { id: 'c1', name: 'Sites para escritórios de advocacia · SP', offer: 'Site institucional', audience: 'Advogados · São Paulo/SP', status: 'active', cap: 1500, spent: 842.37, conversations: 61, qualified: 19, clients: 2, startedAt: daysAgo(18) },
  { id: 'c2', name: 'Agendamento pelo WhatsApp · Clínicas odontológicas', offer: 'Landing page', audience: 'Dentistas · Grande SP', status: 'active', cap: 900, spent: 511.9, conversations: 47, qualified: 11, clients: 1, startedAt: daysAgo(12) },
  { id: 'c3', name: 'Lojas virtuais · Moda e acessórios', offer: 'Loja virtual', audience: 'Lojistas · Sul e Sudeste', status: 'paused', cap: 1200, spent: 398.14, conversations: 22, qualified: 2, clients: 0, startedAt: daysAgo(25) },
  { id: 'c4', name: 'Sites para contabilidades · Campinas', offer: 'Site institucional', audience: 'Contadores · Campinas/SP', status: 'in_review', cap: 600, spent: 0, conversations: 0, qualified: 0, clients: 0, startedAt: daysAgo(0) },
]

export const PREVIEW_DRAFTS: PreviewDraft[] = [
  {
    id: 'd1',
    name: 'Sites para escritórios de advocacia · RJ',
    offer: 'Site institucional',
    rationale: 'A campanha de advogados em SP tem o menor custo por lead qualificado do mês (R$ 44,34). A pesquisa mostrou que poucos concorrentes anunciam para escritórios no Rio, e o mesmo ângulo ("site que gera clientes") é o que mais converteu em SP.',
    audience: { segment: 'Advogados e escritórios de advocacia', location: 'Rio de Janeiro/RJ + 25 km', age: '28–60', interests: ['Direito', 'OAB', 'Gestão de escritório', 'Marketing jurídico'] },
    suggestedCap: 1200,
    durationDays: 21,
    createdAt: daysAgo(0, 8),
    creatives: [
      { id: 'cr1', image: '/images/campaigns-preview/advogados.jpg', headline: 'Site que gera clientes para o seu escritório', primaryText: 'Seu escritório aparece no Google e recebe contatos direto no WhatsApp. Site profissional, rápido e dentro das regras da OAB. Fale com a ANXIS e receba um orçamento em minutos.', cta: 'Enviar mensagem' },
      { id: 'cr2', image: '/images/campaigns-preview/advogados.jpg', headline: 'Mais consultas, menos indicação', primaryText: 'Escritórios com site bem feito recebem novos clientes todos os meses. Criamos o seu com páginas por área de atuação e botão de WhatsApp. Entre em contato.', cta: 'Enviar mensagem' },
    ],
    research: [
      { title: 'Biblioteca de Anúncios da Meta', source: 'facebook.com/ads/library', note: 'Só 4 anúncios ativos de agências focadas em advogados no RJ; nenhum fala de WhatsApp.' },
      { title: 'Provimento 205/2021 da OAB', source: 'oab.org.br', note: 'Publicidade de advogados precisa ser informativa: os textos evitam promessa de resultado.' },
      { title: 'Busca por "criação de site advogado rio"', source: 'google.com', note: 'Concorrentes cobram a partir de R$ 1.800; a oferta da ANXIS fica competitiva.' },
    ],
  },
  {
    id: 'd2',
    name: 'Agendamento pelo WhatsApp · Clínicas odontológicas (variação B)',
    offer: 'Landing page',
    rationale: 'A campanha atual de dentistas gera muitas conversas, mas poucas qualificadas (23%). Esta variação foca em clínicas com mais de um dentista e destaca o agendamento, que foi o assunto mais citado nas conversas que avançaram.',
    audience: { segment: 'Clínicas odontológicas', location: 'São Paulo/SP + 30 km', age: '30–55', interests: ['Odontologia', 'Gestão de clínicas', 'Implantodontia'] },
    suggestedCap: 700,
    durationDays: 14,
    createdAt: daysAgo(1, 16),
    creatives: [
      { id: 'cr3', image: '/images/campaigns-preview/dentistas.jpg', headline: 'Pacientes agendando pelo WhatsApp', primaryText: 'Uma página da sua clínica com agenda pelo WhatsApp, pronta em poucos dias. Menos ligações, mais consultas marcadas. Chame a ANXIS no WhatsApp.', cta: 'Enviar mensagem' },
    ],
    research: [
      { title: 'Conversas qualificadas da campanha atual', source: 'CRM · Conversas', note: '8 de 11 conversas qualificadas mencionaram agendamento ou agenda cheia.' },
    ],
  },
]

export const PREVIEW_ACTIONS: PreviewAgentAction[] = [
  { id: 'a1', at: daysAgo(0, 7), kind: 'shift_budget', campaign: 'Sites para escritórios de advocacia · SP', summary: 'Moveu R$ 15/dia do anúncio "Mais consultas" para "Site que gera clientes"', before: 'R$ 35 / R$ 35 por dia', after: 'R$ 50 / R$ 20 por dia', reason: 'Custo por lead qualificado de R$ 38,20 contra R$ 71,90 nos últimos 5 dias, com 4.800+ impressões em cada.' },
  { id: 'a2', at: daysAgo(1, 7), kind: 'pause', campaign: 'Lojas virtuais · Moda e acessórios', summary: 'Pausou a campanha', before: 'Ativa', after: 'Pausada', reason: '22 conversas e só 2 qualificadas em 9 dias (R$ 199,07 por lead qualificado, 4× a média das outras).' },
  { id: 'a3', at: daysAgo(1, 6), kind: 'research', campaign: '—', summary: 'Pesquisa de mercado: escritórios de advocacia no Rio de Janeiro', reason: 'Base para o rascunho "Sites para escritórios de advocacia · RJ".' },
  { id: 'a4', at: daysAgo(2, 7), kind: 'blocked', campaign: 'Agendamento pelo WhatsApp · Clínicas odontológicas', summary: 'Quis aumentar o orçamento total para R$ 1.100 e foi bloqueado', reason: 'Acima do teto de R$ 900 definido por você. Virou sugestão no rascunho "variação B".' },
]

export const PREVIEW_JOBS: PreviewJob[] = [
  { id: 'j1', label: 'Sincronizar métricas da Meta', status: 'done', startedAt: daysAgo(0, 6) },
  { id: 'j2', label: 'Rodada de otimização diária', status: 'done', startedAt: daysAgo(0, 7) },
  { id: 'j3', label: 'Gerar criativos · Sites para contabilidades', status: 'running', startedAt: daysAgo(0, 9) },
]

export const PREVIEW_SPEND_DAYS = (() => {
  const spend = [41, 38, 52, 47, 55, 61, 44, 58, 63, 57, 66, 72, 69, 74]
  const conversations = [4, 3, 6, 5, 7, 8, 4, 7, 9, 7, 9, 11, 10, 12]
  const qualified = [1, 1, 2, 1, 2, 3, 1, 2, 3, 2, 3, 4, 3, 4]
  const labels = spend.map((_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (spend.length - 1 - i))
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  })
  return { labels, spend, conversations, qualified }
})()

export const PREVIEW_LEADS: PreviewLead[] = [
  { id: 'l1', name: 'Dr. Ricardo Menezes', company: 'Menezes & Prado Advogados', phone: '+55 11 98123-4410', origin: { kind: 'ads', campaign: 'Sites para escritórios de advocacia · SP', ad: 'Site que gera clientes' }, status: 'Orçamento', intent: 'qualified', lastMessage: 'Pode me mandar o orçamento com as páginas de cada área?', lastMessageAt: daysAgo(0, 11), assignee: 'Mateus', enteredAt: daysAgo(3), value: 3200 },
  { id: 'l2', name: 'Dra. Angélica Bravo', company: 'Angélica Bravo Advocacia', phone: '+55 11 99195-3716', origin: { kind: 'prospecting', campaign: 'Advogados · São Paulo/SP' }, status: 'Em contato', intent: 'qualified', lastMessage: 'Tenho interesse, mas queria ver alguns sites que vocês fizeram.', lastMessageAt: daysAgo(0, 9), assignee: 'Mateus', enteredAt: daysAgo(1) },
  { id: 'l3', name: 'Clínica Sorriso Pleno', company: 'Sorriso Pleno Odontologia', phone: '+55 11 97440-2281', origin: { kind: 'ads', campaign: 'Agendamento pelo WhatsApp · Clínicas odontológicas', ad: 'Pacientes agendando pelo WhatsApp' }, status: 'Novo', intent: 'unclear', lastMessage: 'Oi, vi o anúncio. Como funciona?', lastMessageAt: daysAgo(0, 8), assignee: null, enteredAt: daysAgo(0) },
  { id: 'l4', name: 'Paula Ribeiro', company: 'Ateliê Ribeiro', phone: '+55 41 99812-0034', origin: { kind: 'ads', campaign: 'Lojas virtuais · Moda e acessórios', ad: 'Sua loja vendendo 24h' }, status: 'Perdido', intent: 'not_interested', lastMessage: 'Agora não é o momento, obrigada.', lastMessageAt: daysAgo(4, 15), assignee: 'Mateus', enteredAt: daysAgo(6) },
  { id: 'l5', name: 'Dr. Felipe Andrade', company: 'Andrade Advocacia Trabalhista', phone: '+55 11 98777-1920', origin: { kind: 'ads', campaign: 'Sites para escritórios de advocacia · SP', ad: 'Mais consultas, menos indicação' }, status: 'Fechado', intent: 'qualified', lastMessage: 'Contrato assinado! Obrigado.', lastMessageAt: daysAgo(2, 17), assignee: 'Mateus', enteredAt: daysAgo(10), value: 2800 },
  { id: 'l6', name: 'Contábil Nogueira', company: 'Nogueira Contabilidade', phone: '+55 19 99633-5512', origin: { kind: 'prospecting', campaign: 'Contabilidade · Campinas/SP' }, status: 'Novo', intent: 'auto_reply', lastMessage: 'Olá! No momento estamos fora do horário de atendimento.', lastMessageAt: daysAgo(0, 7), assignee: null, enteredAt: daysAgo(0) },
  { id: 'l7', name: 'Dra. Camila Tavares', company: 'Odonto Tavares', phone: '+55 11 96620-7718', origin: { kind: 'ads', campaign: 'Agendamento pelo WhatsApp · Clínicas odontológicas', ad: 'Pacientes agendando pelo WhatsApp' }, status: 'Em contato', intent: 'qualified', lastMessage: 'Quero sim, temos 3 dentistas e a agenda é toda por telefone.', lastMessageAt: daysAgo(1, 14), assignee: 'Mateus', enteredAt: daysAgo(2) },
  { id: 'l8', name: 'Lucas Martins', company: 'LM Advogados Associados', phone: '+55 21 98450-6631', origin: { kind: 'prospecting', campaign: 'Advogados · Rio de Janeiro/RJ' }, status: 'Em contato', intent: 'unclear', lastMessage: 'Quanto custa mais ou menos?', lastMessageAt: daysAgo(1, 10), assignee: null, enteredAt: daysAgo(1) },
]

export const formatMoney = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
