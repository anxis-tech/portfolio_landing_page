'use client'

import { useEffect, useState } from 'react'
import type { ClientProject } from '@/types/client-project.types'
import type { UserProfileWithRole } from '@/lib/auth/permissions'
import type { PricingConfig, QuoteFormData, SavedQuote } from '@/types/pricing.types'
import type { ProposalAdminState, ProposalDraftContext } from '@/types/proposal.types'
import { DEFAULT_PRICING_CONFIG, calculateProjectQuote } from '@/lib/utils/pricing-calculator'
import { saveQuoteAction, getPricingSettingsAction, generateQuoteProposalAction } from '@/lib/actions/quotes'
import { getQuoteProposalStateAction } from '@/lib/actions/proposals'
import { saveClientProjectAction } from '@/lib/actions/client-projects'
import { PaymentConditionField } from '@/components/admin/payment-condition-field'
import type { PaymentCondition } from '@/types/contract.types'
import { buildProjectFromQuote } from '@/lib/services/project-from-quote'
import { hashProposalDraft, isPublicProposalToken } from '@/lib/services/quote-proposal'
import { INITIAL_SITE_SETTINGS } from '@/lib/constants/initial-data'
import {
  STRICT_PROJECT_TYPES,
  CONTENT_COPY_OPTIONS,
  URGENCY_OPTIONS,
  type StrictProjectType,
  type ContentCopyOption,
  type UrgencyOption,
  quoteFormSchema,
} from '@/lib/validations/quote-schema'
import { Icon } from '@/components/ui/icon'
import { PricingNavIcon } from '@/lib/icons/navigation'
import { SaveActionIcon, AddActionIcon, LockActionIcon } from '@/lib/icons/actions'

import { SuccessStatusIcon, WarningStatusIcon } from '@/lib/icons/status'
import { cn } from '@/lib/utils'

interface PricingCalculatorTabProps {
  canSaveQuote?: boolean
  canCreateProject?: boolean
  teamUsers?: UserProfileWithRole[]
  onSaveQuote?: (quote: SavedQuote) => void
  onProjectCreated?: (project: ClientProject, quote: SavedQuote) => void
  onSourceQuoteConsumed?: () => void
  sourceQuote?: SavedQuote
  initialData?: QuoteFormData
  isDarkMode?: boolean
}

type ProjectDetails = {
  description: string
  deadline: string
  email: string
  phone: string
  cep: string
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  responsibleUserId: string
  objective: string
  targetAudience: string
  segment: string
  internalNotes: string
  cpf_cnpj: string
  legal_name: string
  person_type: '' | 'individual' | 'company'
  complement: string
  city_ibge: string
}

const emptyProjectDetails: ProjectDetails = {
  description: '', deadline: '', email: '', phone: '', cep: '', street: '', number: '',
  neighborhood: '', city: '', state: '', responsibleUserId: '', objective: '',
  targetAudience: '', segment: '', internalNotes: '', cpf_cnpj: '', legal_name: '', person_type: '', complement: '', city_ibge: '',
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function PricingCalculatorTab({
  canSaveQuote = true,
  canCreateProject = false,
  teamUsers = [],
  onSaveQuote,
  onProjectCreated,
  onSourceQuoteConsumed,
  sourceQuote,
  initialData,
  isDarkMode = false,
}: PricingCalculatorTabProps) {
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(DEFAULT_PRICING_CONFIG)
  const [saveSuccessFeedback, setSaveSuccessFeedback] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [paymentCondition, setPaymentCondition] = useState<PaymentCondition | ''>('')
  const [projectSuccess, setProjectSuccess] = useState(false)
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false)
  const [proposalUrl, setProposalUrl] = useState<string | null>(() => (
    isPublicProposalToken(sourceQuote?.public_token) && typeof window !== 'undefined'
      ? `${window.location.origin}/proposta/${sourceQuote.public_token}`
      : null
  ))
  const [proposalState, setProposalState] = useState<ProposalAdminState | null>(null)
  const [proposalFeedback, setProposalFeedback] = useState<string | null>(null)
  const [proposalLinkCopied, setProposalLinkCopied] = useState(false)
  const [proposalValidUntil, setProposalValidUntil] = useState('')
  const [selectedProjectType, setSelectedProjectType] = useState<StrictProjectType | null>(initialData?.projectType ?? sourceQuote?.project_type ?? null)
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>(emptyProjectDetails)
  const [currentStep, setCurrentStep] = useState(1)
  const [furthestStep, setFurthestStep] = useState(1)
  const [draftIdentity] = useState(() => ({
    id: `quote-${Date.now()}`,
    timestamp: new Date().toISOString(),
  }))
  const [frameMotion, setFrameMotion] = useState<'settled' | 'exit-left' | 'exit-right' | 'enter-left' | 'enter-right'>('settled')
  const [isFrameTransitioning, setIsFrameTransitioning] = useState(false)

  const [formData, setFormData] = useState<QuoteFormData>(() => initialData || sourceQuote?.form_data || ({
    clientName: '', company: '', projectName: '', projectType: 'Site institucional', platform: 'Next.js',
    desiredDeadline: 'Prazo normal', pageCount: 5, additionalPageCount: 0, hasCustomCode: false,
    hasBlogModule: false, contentOption: 'Cliente fornecerá todo o conteúdo', urgency: 'Sem urgência',
    additionalCosts: 0, notes: '', paymentTerms: '50% de entrada e 50% na publicação',
  }))

  useEffect(() => {
    async function loadPricingSettings() {
      const savedConfig = await getPricingSettingsAction()
      if (!savedConfig) return
      setPricingConfig({
        ...DEFAULT_PRICING_CONFIG,
        ...savedConfig,
        baseRates: { ...DEFAULT_PRICING_CONFIG.baseRates, ...(savedConfig.baseRates || {}) },
        urgencyMultipliers: { ...DEFAULT_PRICING_CONFIG.urgencyMultipliers, ...(savedConfig.urgencyMultipliers || {}) },
        contentRates: { ...DEFAULT_PRICING_CONFIG.contentRates, ...(savedConfig.contentRates || {}) },
      })
    }
    void loadPricingSettings()
  }, [])

  useEffect(() => {
    if (!sourceQuote?.id || !/^[0-9a-f-]{36}$/i.test(sourceQuote.id)) return

    let active = true
    void getQuoteProposalStateAction(sourceQuote.id).then((state) => {
      if (!active || !state) return
      setProposalState(state)
      if (state.expiresAt) {
        setProposalValidUntil(new Intl.DateTimeFormat('en-CA', {
          timeZone: 'America/Sao_Paulo',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(new Date(state.expiresAt)))
      }
      if (typeof window !== 'undefined') {
        setProposalUrl(`${window.location.origin}/proposta/${state.publicToken}`)
      }
    })
    return () => { active = false }
  }, [sourceQuote?.id])

  const breakdown = calculateProjectQuote(formData, pricingConfig)
  const isLojaVirtual = formData.projectType === 'Loja virtual'
  const isBlog = formData.projectType === 'Blog'
  const isIntegracao = formData.projectType === 'Integração ou funcionalidade'
  const selectedResponsible = teamUsers.find((user) => user.user_id === projectDetails.responsibleUserId)

  const updateProjectDetails = <K extends keyof ProjectDetails>(key: K, value: ProjectDetails[K]) => {
    setProjectDetails((current) => ({ ...current, [key]: value }))
  }

  const handleProjectTypeChange = (projectType: StrictProjectType) => {
    const pageCount = projectType === 'Landing page' || projectType === 'Página de vendas'
      ? 1
      : projectType === 'Site institucional'
        ? 5
        : projectType === 'Loja virtual' || projectType === 'Blog' || projectType === 'Integração ou funcionalidade'
          ? 0
          : 1
    setSelectedProjectType(projectType)
    setFormData((current) => ({ ...current, projectType, pageCount, hasBlogModule: projectType === 'Blog' ? false : current.hasBlogModule }))
  }

  const navigateStep = (nextStep: number) => {
    if (isFrameTransitioning || nextStep < 1 || nextStep > 5 || nextStep === currentStep || nextStep > furthestStep + 1) return
    if (nextStep === 2 && !selectedProjectType) return

    const goingForward = nextStep > currentStep
    setIsFrameTransitioning(true)
    setFrameMotion(goingForward ? 'exit-left' : 'exit-right')

    window.setTimeout(() => {
      setCurrentStep(nextStep)
      setFurthestStep((current) => Math.max(current, nextStep))
      setFrameMotion(goingForward ? 'enter-right' : 'enter-left')
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setFrameMotion('settled')
          setIsFrameTransitioning(false)
        })
      })
    }, 170)
  }


  const buildQuote = (status: 'Aprovado' | 'Enviado' | 'Convertido em Projeto'): SavedQuote => ({
    ...(sourceQuote || {}),
    id: sourceQuote?.id || draftIdentity.id,
    client_name: formData.clientName,
    company: formData.company,
    project_name: formData.projectName,
    project_type: formData.projectType,
    platform: formData.platform,
    form_data: { ...formData },
    pricing_snapshot: JSON.parse(JSON.stringify(pricingConfig)),
    calculation_breakdown: { ...breakdown },
    subtotal: breakdown.subtotal,
    discount: sourceQuote?.discount || 0,
    additional_costs: breakdown.additionalCosts,
    taxes: sourceQuote?.taxes || 0,
    final_value: breakdown.finalValue,
    status,
    notes: formData.notes,
    created_by_name: sourceQuote?.created_by_name || 'Administrador ANXIS',
    created_at: sourceQuote?.created_at || draftIdentity.timestamp,
    updated_at: draftIdentity.timestamp,
  })

  const validateForQuote = () => {
    const validation = quoteFormSchema.safeParse(formData)
    if (validation.success) return true
    setValidationError(validation.error.issues[0]?.message || 'Por favor, preencha os campos obrigatórios.')
    return false
  }

  const persistQuote = async (status: 'Aprovado' | 'Convertido em Projeto') => {
    const result = await saveQuoteAction(buildQuote(status))
    if (!result.success || !result.quote) {
      setValidationError(result.message || 'Não foi possível salvar o orçamento.')
      return null
    }
    return result.quote as SavedQuote
  }

  const handleSaveQuote = async () => {
    setValidationError(null)
    if (!validateForQuote()) return
    const quote = await persistQuote('Aprovado')
    if (!quote) return
    onSaveQuote?.(quote)
    setSaveSuccessFeedback(true)
    window.setTimeout(() => setSaveSuccessFeedback(false), 3000)
  }

  const handleGenerateProposal = async () => {
    setValidationError(null)
    setProposalFeedback(null)
    if (!validateForQuote()) return

    setIsGeneratingProposal(true)
    const context: ProposalDraftContext = {
      clientEmail: projectDetails.email,
      clientPhone: projectDetails.phone,
      projectDescription: projectDetails.description,
      objective: projectDetails.objective,
      targetAudience: projectDetails.targetAudience,
      segment: projectDetails.segment,
      deliveryTerm: formData.desiredDeadline || projectDetails.deadline,
      validUntil: proposalValidUntil || null,
    }
    const result = await generateQuoteProposalAction(buildQuote('Enviado'), context)
    setIsGeneratingProposal(false)

    if (!result.success || !result.quote || !result.proposal || !result.proposalUrl) {
      setValidationError(result.message || 'Não foi possível gerar a proposta comercial.')
      return
    }

    setProposalUrl(result.proposalUrl)
    setProposalState(result.proposal)
    setProposalFeedback(result.versionCreated
      ? `Versão ${result.proposal.version} publicada e pronta para envio.`
      : `A versão ${result.proposal.version} já contém estes dados; o link foi mantido.`)
    onSaveQuote?.(result.quote)
  }

  const handleCreateProject = async () => {
    setValidationError(null)
    if (!validateForQuote()) return
    if (!paymentCondition) { setValidationError('Selecione a condição de pagamento antes de gerar o contrato.'); return }
    const missing = [
      !projectDetails.description.trim() && 'Descrição do projeto',
      !projectDetails.deadline && 'Prazo final',
      !projectDetails.email.trim() && 'E-mail do cliente',
      !projectDetails.phone.trim() && 'Telefone/WhatsApp',
      !projectDetails.cep.trim() && 'CEP',
      !projectDetails.street.trim() && 'Endereço',
      !projectDetails.number.trim() && 'Número',
      !projectDetails.neighborhood.trim() && 'Bairro',
      !projectDetails.city.trim() && 'Cidade',
      !projectDetails.state.trim() && 'Estado (UF)',
    ].filter(Boolean)
    if (missing.length) {
      setValidationError(`Preencha os dados necessários para criar o projeto: ${missing.join(', ')}.`)
      return
    }

    setIsCreatingProject(true)
    const quote = await persistQuote('Aprovado')
    if (!quote) {
      setIsCreatingProject(false)
      return
    }
    const projectPayload = buildProjectFromQuote(quote, {
      description: projectDetails.description,
      deadline: projectDetails.deadline,
      contact: {
        email: projectDetails.email, phone: projectDetails.phone, cep: projectDetails.cep,
        street: projectDetails.street, number: projectDetails.number, neighborhood: projectDetails.neighborhood,
        city: projectDetails.city, state: projectDetails.state,
      },
      responsible: selectedResponsible ? { userId: selectedResponsible.user_id, name: selectedResponsible.full_name, email: selectedResponsible.email } : undefined,
      scope: { objective: projectDetails.objective, targetAudience: projectDetails.targetAudience, segment: projectDetails.segment },
      internalNotes: projectDetails.internalNotes,
    })
    const projectResult = await saveClientProjectAction({ ...projectPayload, payment_condition: paymentCondition, client_contact_json: { ...projectPayload.client_contact_json, cpf_cnpj: projectDetails.cpf_cnpj, legal_name: projectDetails.legal_name, person_type: projectDetails.person_type || undefined, complement: projectDetails.complement, city_ibge: projectDetails.city_ibge } })
    if (!projectResult.success || !projectResult.project) {
      setIsCreatingProject(false)
      setValidationError(projectResult.message || 'Não foi possível criar o projeto.')
      return
    }
    const convertedQuote = await persistQuote('Convertido em Projeto')
    const finalQuote = convertedQuote || quote
    onSaveQuote?.(finalQuote)
    onProjectCreated?.(projectResult.project as ClientProject, finalQuote)
    onSourceQuoteConsumed?.()
    setProjectSuccess(true)
    setIsCreatingProject(false)
  }

  const handleCopyProposalLink = async () => {
    if (!proposalUrl) return
    await navigator.clipboard.writeText(proposalUrl)
    setProposalLinkCopied(true)
    window.setTimeout(() => setProposalLinkCopied(false), 2000)
  }

  const proposalContext: ProposalDraftContext = {
    clientEmail: projectDetails.email,
    clientPhone: projectDetails.phone,
    projectDescription: projectDetails.description,
    objective: projectDetails.objective,
    targetAudience: projectDetails.targetAudience,
    segment: projectDetails.segment,
    deliveryTerm: formData.desiredDeadline || projectDetails.deadline,
    validUntil: proposalValidUntil || null,
  }
  const draftProposalHash = hashProposalDraft(
    buildQuote('Enviado'),
    proposalContext,
    { email: INITIAL_SITE_SETTINGS.email, whatsapp: INITIAL_SITE_SETTINGS.whatsapp }
  )
  const proposalHasChanges = Boolean(proposalState && proposalState.snapshotHash !== draftProposalHash)

  const cardClass = cn('rounded-[22px] border p-5 space-y-4 shadow-[0_8px_30px_rgba(15,23,42,0.045)] transition-colors', isDarkMode ? 'bg-[#16181D] border-slate-800 shadow-black/15' : 'bg-white border-slate-200/80')
  const inputClass = cn('w-full px-3 py-2.5 rounded-xl border text-xs outline-none transition-colors duration-200', isDarkMode ? 'bg-[#1A1E26] border-slate-700 text-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15' : 'bg-white border-slate-200 text-[#0C1D36] focus:border-[#2E3E4F] focus:ring-2 focus:ring-[#2E3E4F]/10')
  const frameMotionClass = frameMotion === 'exit-left' || frameMotion === 'enter-left'
    ? '-translate-x-5 opacity-0'
    : frameMotion === 'exit-right' || frameMotion === 'enter-right'
      ? 'translate-x-5 opacity-0'
      : 'translate-x-0 opacity-100'
  const stepTitle = (number: number, title: string, detail: string) => (
    <div className="flex items-start gap-3 border-b pb-4 border-slate-100 dark:border-slate-800">
      <span className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-[11px] font-extrabold text-white shadow-sm', isDarkMode ? 'bg-sky-600 shadow-sky-950/40' : 'bg-[#2E3E4F] shadow-[#2E3E4F]/25')}>{number}</span>
      <div><h3 className="text-sm font-extrabold tracking-tight">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{detail}</p></div>
    </div>
  )

  return (
    <div className={cn('space-y-6 max-w-full font-sans transition-colors', isDarkMode ? 'text-white' : 'text-[#0C1D36]')}>
      {validationError && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-700 flex gap-2"><Icon icon={WarningStatusIcon} size={16} />{validationError}</div>}
      {saveSuccessFeedback && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 flex gap-2"><Icon icon={SuccessStatusIcon} size={16} />Orçamento salvo e registrado no histórico.</div>}
      {projectSuccess && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 flex gap-2"><Icon icon={SuccessStatusIcon} size={16} />Projeto criado e contrato iniciado com sucesso.</div>}

      <FlowStepper currentStep={currentStep} furthestStep={furthestStep} isDarkMode={isDarkMode} onSelectStep={navigateStep} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <main className="space-y-6 lg:col-span-2">
          <section className={cn(cardClass, 'min-h-[520px] overflow-hidden')}>
            <div key={currentStep} className={cn('space-y-5 transition-all duration-200 ease-out', frameMotionClass)}>
              {currentStep === 1 && (
                <div className="space-y-5">
            {stepTitle(1, 'O que o cliente precisa?', 'Escolha o tipo de projeto para revelar uma configuração comercial adequada.')}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {STRICT_PROJECT_TYPES.map((type) => {
                const isSelected = selectedProjectType === type
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleProjectTypeChange(type)}
                    className={cn(
                      'group relative min-h-32 overflow-hidden rounded-2xl border p-5 text-left transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                      isSelected
                        ? isDarkMode
                          ? 'border-sky-400 bg-gradient-to-br from-sky-500/20 via-[#16273A] to-[#16181D] shadow-[0_12px_30px_rgba(14,165,233,0.15)] ring-1 ring-sky-400/40'
                          : 'border-[#2E3E4F] bg-gradient-to-br from-[#2E3E4F]/15 via-[#2E3E4F]/7 to-white shadow-[0_12px_28px_rgba(46,62,79,0.16)] ring-1 ring-[#2E3E4F]/25'
                        : isDarkMode
                          ? 'border-slate-700 bg-[#1A1E26] hover:-translate-y-0.5 hover:border-slate-500 hover:bg-[#1E2632] hover:shadow-lg'
                          : 'border-slate-200 bg-slate-50/80 hover:-translate-y-0.5 hover:border-[#2E3E4F]/50 hover:bg-white hover:shadow-lg'
                    )}
                    aria-pressed={isSelected}
                  >
                    <span className={cn('absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full border text-xs font-extrabold transition-all', isSelected ? (isDarkMode ? 'border-sky-300 bg-sky-400 text-[#0B132B]' : 'border-[#2E3E4F] bg-[#2E3E4F] text-white') : (isDarkMode ? 'border-slate-600 text-slate-600 group-hover:border-slate-500' : 'border-slate-200 text-slate-300 group-hover:border-slate-300'))}>{isSelected ? '✓' : '○'}</span>
                    <span className={cn('mb-5 block h-1 w-9 rounded-full transition-all', isSelected ? (isDarkMode ? 'bg-sky-400' : 'bg-[#2E3E4F]') : (isDarkMode ? 'bg-slate-700 group-hover:bg-slate-600' : 'bg-slate-200 group-hover:bg-slate-300'))} />
                    <span className={cn('block pr-6 text-sm font-extrabold tracking-tight transition-colors', isSelected ? (isDarkMode ? 'text-sky-100' : 'text-[#182331]') : (isDarkMode ? 'text-slate-200 group-hover:text-white' : 'text-[#243449]'))}>{type}</span>
                    <span className={cn('mt-2 block text-[11px] font-medium transition-colors', isSelected ? (isDarkMode ? 'text-sky-200/80' : 'text-[#2E3E4F]') : 'text-slate-500')}>Valor base · {formatCurrency(pricingConfig.baseRates[type] || 0)}</span>
                    <span className={cn('mt-4 inline-flex text-[10px] font-bold uppercase tracking-[0.12em]', isSelected ? (isDarkMode ? 'text-sky-300' : 'text-[#2E3E4F]') : 'text-slate-400')}>{isSelected ? 'Tipo selecionado' : 'Selecionar tipo'}</span>
                  </button>
                )
              })}
            </div>
                </div>
              )}

          {currentStep === 2 && (
            <div className="space-y-5">
            {stepTitle(2, 'Configure o escopo', 'Os parâmetros abaixo usam exatamente as regras ativas da calculadora.')}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
              {!isLojaVirtual && !isBlog && !isIntegracao ? <label><span className="mb-1 flex items-center gap-1 font-bold text-slate-500">Páginas padrão <Icon icon={LockActionIcon} size={12} className="text-amber-500" /></span><input readOnly value={formData.pageCount} className={cn(inputClass, 'cursor-not-allowed opacity-70')} /><span className="mt-1 block text-[10px] text-slate-400">Inclusas no valor base para {formData.projectType}.</span></label> : <div className={cn('rounded-xl border p-3 text-xs', isDarkMode ? 'border-slate-700 bg-[#1A1E26]' : 'border-slate-200 bg-slate-50')}><strong>{formData.projectType}</strong><p className="mt-1 text-slate-500">Este tipo não usa páginas padrão na regra de cálculo.</p></div>}
              <label><span className="mb-1 block font-bold text-slate-500">Páginas adicionais</span><input type="number" min={0} value={formData.additionalPageCount} onChange={(event) => setFormData((current) => ({ ...current, additionalPageCount: Math.max(0, Number(event.target.value)) }))} className={inputClass} /></label>
              <label><span className="mb-1 block font-bold text-slate-500">Conteúdo e copy</span><select value={formData.contentOption} onChange={(event) => setFormData((current) => ({ ...current, contentOption: event.target.value as ContentCopyOption }))} className={inputClass}>{CONTENT_COPY_OPTIONS.map((option) => <option key={option} value={option}>{option} {pricingConfig.contentRates[option] ? `(+ ${formatCurrency(pricingConfig.contentRates[option])})` : ''}</option>)}</select></label>
              <label><span className="mb-1 block font-bold text-slate-500">Urgência</span><select value={formData.urgency} onChange={(event) => setFormData((current) => ({ ...current, urgency: event.target.value as UrgencyOption }))} className={inputClass}>{URGENCY_OPTIONS.map((option) => <option key={option} value={option}>{option} (x{pricingConfig.urgencyMultipliers[option] || 1})</option>)}</select></label>
              <label><span className="mb-1 block font-bold text-slate-500">Custos adicionais (R$)</span><input type="number" min={0} value={formData.additionalCosts} onChange={(event) => setFormData((current) => ({ ...current, additionalCosts: Math.max(0, Number(event.target.value)) }))} className={inputClass} /></label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1"><Toggle label="Desenvolvimento em código personalizado" detail="Recursos avançados fora de CMS padrão." checked={Boolean(formData.hasCustomCode)} onChange={(checked) => setFormData((current) => ({ ...current, hasCustomCode: checked }))} isDarkMode={isDarkMode} />{formData.projectType !== 'Blog' && <Toggle label="Incluir módulo de blog" detail="Área de artigos e gestão de conteúdo." checked={Boolean(formData.hasBlogModule)} onChange={(checked) => setFormData((current) => ({ ...current, hasBlogModule: checked }))} isDarkMode={isDarkMode} />}</div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-5">
            {stepTitle(3, 'Dados do cliente', 'Registre os dados comerciais e de contato que serão usados na criação do projeto e contrato.')}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
              <TextField label="Nome do cliente *" value={formData.clientName} onChange={(value) => setFormData((current) => ({ ...current, clientName: value }))} className={inputClass} />
              <TextField label="Empresa / razão social *" value={formData.company || ''} onChange={(value) => setFormData((current) => ({ ...current, company: value }))} className={inputClass} />
              <TextField label="CPF / CNPJ" value={projectDetails.cpf_cnpj} onChange={(value) => updateProjectDetails('cpf_cnpj', value)} className={inputClass} />
              <TextField label="Nome / razão social fiscal" value={projectDetails.legal_name} onChange={(value) => updateProjectDetails('legal_name', value)} className={inputClass} />
              <label><span className="mb-1 block font-bold text-slate-500">Tipo de pessoa</span><select value={projectDetails.person_type} onChange={(event) => updateProjectDetails('person_type', event.target.value as ProjectDetails['person_type'])} className={inputClass}><option value="">Selecione</option><option value="individual">Pessoa física</option><option value="company">Pessoa jurídica</option></select></label>
              <TextField label="Complemento" value={projectDetails.complement} onChange={(value) => updateProjectDetails('complement', value)} className={inputClass} />
              <TextField label="Código IBGE do município" value={projectDetails.city_ibge} onChange={(value) => updateProjectDetails('city_ibge', value)} className={inputClass} />
              <TextField label="E-mail *" type="email" value={projectDetails.email} onChange={(value) => updateProjectDetails('email', value)} className={inputClass} />
              <TextField label="Telefone / WhatsApp *" value={projectDetails.phone} onChange={(value) => updateProjectDetails('phone', value)} className={inputClass} />
              <TextField label="CEP *" value={projectDetails.cep} onChange={(value) => updateProjectDetails('cep', value)} className={inputClass} />
              <TextField label="Endereço *" value={projectDetails.street} onChange={(value) => updateProjectDetails('street', value)} className={inputClass} />
              <TextField label="Número *" value={projectDetails.number} onChange={(value) => updateProjectDetails('number', value)} className={inputClass} />
              <TextField label="Bairro *" value={projectDetails.neighborhood} onChange={(value) => updateProjectDetails('neighborhood', value)} className={inputClass} />
              <TextField label="Cidade *" value={projectDetails.city} onChange={(value) => updateProjectDetails('city', value)} className={inputClass} />
              <TextField label="Estado (UF) *" value={projectDetails.state} maxLength={2} onChange={(value) => updateProjectDetails('state', value.toUpperCase())} className={inputClass} />
            </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-5">
            {stepTitle(4, 'Dados do projeto', 'Complete as informações utilizadas no projeto recém-criado. Arquivos e links continuam disponíveis no detalhe do projeto.')}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
              <TextField label="Nome identificador do projeto *" value={formData.projectName} onChange={(value) => setFormData((current) => ({ ...current, projectName: value }))} className={inputClass} />
              <label><span className="mb-1 block font-bold text-slate-500">Plataforma *</span><select value={formData.platform || 'Next.js'} onChange={(event) => setFormData((current) => ({ ...current, platform: event.target.value }))} className={inputClass}><option value="Next.js">Next.js / React</option><option value="Tray">Tray</option><option value="Nuvemshop">Nuvemshop</option><option value="WordPress">WordPress / Elementor</option><option value="WooCommerce">WooCommerce</option><option value="Desenvolvimento personalizado">Desenvolvimento personalizado</option></select></label>
              <label><span className="mb-1 block font-bold text-slate-500">Responsável</span><select value={projectDetails.responsibleUserId} onChange={(event) => updateProjectDetails('responsibleUserId', event.target.value)} className={inputClass}><option value="">Atribuir depois</option>{teamUsers.filter((user) => user.is_active).map((user) => <option key={user.user_id} value={user.user_id}>{user.full_name} — {user.role_slug}</option>)}</select></label>
              <TextField label="Prazo final *" type="date" value={projectDetails.deadline} onChange={(value) => updateProjectDetails('deadline', value)} className={inputClass} />
              <label className="sm:col-span-2"><span className="mb-1 block font-bold text-slate-500">Descrição do projeto *</span><textarea rows={3} value={projectDetails.description} onChange={(event) => updateProjectDetails('description', event.target.value)} className={inputClass} placeholder="Resumo comercial, objetivo e direcionamento principal." /></label>
              <TextField label="Objetivo (opcional)" value={projectDetails.objective} onChange={(value) => updateProjectDetails('objective', value)} className={inputClass} />
              <TextField label="Público-alvo (opcional)" value={projectDetails.targetAudience} onChange={(value) => updateProjectDetails('targetAudience', value)} className={inputClass} />
              <TextField label="Segmento (opcional)" value={projectDetails.segment} onChange={(value) => updateProjectDetails('segment', value)} className={inputClass} />
              <label><span className="mb-1 block font-bold text-slate-500">Prazo comercial</span><input value={formData.desiredDeadline || ''} onChange={(event) => setFormData((current) => ({ ...current, desiredDeadline: event.target.value }))} className={inputClass} placeholder="Ex.: Prazo normal" /></label>
              <label className="sm:col-span-2"><span className="mb-1 block font-bold text-slate-500">Observações internas (opcional)</span><textarea rows={2} value={projectDetails.internalNotes} onChange={(event) => updateProjectDetails('internalNotes', event.target.value)} className={inputClass} /></label>
            </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-5">
            {stepTitle(5, 'Revise e conclua', 'Salvar orçamento registra a proposta. Criar projeto preserva o fluxo atual de contrato, assinatura e pagamento.')}
            <dl className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2"><ReviewItem label="Cliente" value={`${formData.clientName} — ${formData.company || 'Sem empresa'}`} /><ReviewItem label="Projeto" value={formData.projectName} /><ReviewItem label="Tipo e plataforma" value={`${formData.projectType} · ${formData.platform || 'Next.js'}`} /><ReviewItem label="Escopo" value={`${formData.pageCount} páginas padrão · ${formData.additionalPageCount} adicionais · ${formData.contentOption}`} /><ReviewItem label="Prazo" value={projectDetails.deadline} /><ReviewItem label="Responsável" value={selectedResponsible?.full_name || 'Atribuir depois'} /><ReviewItem label="Valor final" value={formatCurrency(breakdown.finalValue)} strong /></dl>
            <PaymentConditionField value={paymentCondition} finalValue={breakdown.finalValue} onChange={setPaymentCondition} />
            <label className="block max-w-sm text-xs font-bold text-slate-500 dark:text-slate-400"><span className="mb-1.5 block">Validade da proposta (opcional)</span><input type="date" value={proposalValidUntil} min={draftIdentity.timestamp.slice(0, 10)} onChange={(event) => setProposalValidUntil(event.target.value)} className={inputClass} /><span className="mt-1.5 block text-[10px] font-medium text-slate-400">Sem data, a proposta não expira automaticamente.</span></label>
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row"><button type="button" onClick={handleSaveQuote} disabled={!canSaveQuote} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-xs font-extrabold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><Icon icon={SaveActionIcon} size={16} />Salvar orçamento</button><button type="button" onClick={handleCreateProject} disabled={!canCreateProject || isCreatingProject} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2E3E4F] px-4 py-3 text-xs font-extrabold text-white hover:bg-[#182331] disabled:cursor-not-allowed disabled:opacity-50"><Icon icon={AddActionIcon} size={16} />{isCreatingProject ? 'Criando projeto...' : 'Criar projeto'}</button></div>
            <div className="rounded-2xl border border-[#2E3E4F]/15 bg-[#2E3E4F]/5 p-3 dark:border-slate-700 dark:bg-slate-800/60">
              <button type="button" onClick={handleGenerateProposal} disabled={!canSaveQuote || isGeneratingProposal} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#2E3E4F] px-4 py-3 text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-[#182331] disabled:cursor-not-allowed disabled:opacity-50"><Icon icon={PricingNavIcon} size={16} />{isGeneratingProposal ? 'Publicando proposta…' : proposalState ? (proposalHasChanges ? 'Gerar nova versão' : 'Confirmar versão publicada') : 'Gerar proposta comercial'}</button>
              {proposalState && proposalHasChanges && <p className="mt-2 text-[11px] font-semibold text-amber-700 dark:text-amber-300">Há alterações desde a versão {proposalState.version}. Publique uma nova versão para atualizar o link.</p>}
              {proposalFeedback && <p className="mt-2 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">{proposalFeedback}</p>}
              {proposalUrl && <div className="mt-3"><div className="mb-1.5 flex flex-wrap items-center justify-between gap-2"><label className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Proposta publicada</label>{proposalState && <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-extrabold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">Versão {proposalState.version} · {proposalState.status}</span>}</div><div className="flex flex-col gap-2 sm:flex-row"><input readOnly value={proposalUrl} aria-label="Link público da proposta" className={cn(inputClass, 'min-w-0 flex-1 py-2 text-[11px] text-slate-500')} /><a href={proposalUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-300 px-3 py-2 text-center text-xs font-extrabold text-[#2E3E4F] transition-colors hover:bg-white dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">Abrir proposta</a><button type="button" onClick={() => void handleCopyProposalLink()} className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-extrabold text-[#2E3E4F] transition-colors hover:bg-white dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">{proposalLinkCopied ? 'Copiado!' : 'Copiar link'}</button></div><p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">O link permanece estável e sempre aponta para a versão publicada mais recente.</p></div>}
            </div>
            </div>
          )}
          {currentStep < 5 && <div className="mt-7 flex items-center justify-between gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
            <button type="button" onClick={() => navigateStep(currentStep - 1)} disabled={currentStep === 1 || isFrameTransitioning} className="rounded-xl px-4 py-2.5 text-xs font-extrabold text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-0 dark:text-slate-400 dark:hover:bg-slate-800">Voltar</button>
            <button type="button" onClick={() => navigateStep(currentStep + 1)} disabled={isFrameTransitioning || (currentStep === 1 && !selectedProjectType)} className="inline-flex items-center gap-2 rounded-xl bg-[#2E3E4F] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-[#182331] disabled:cursor-not-allowed disabled:opacity-50">{currentStep === 1 ? 'Continuar para escopo' : 'Continuar' } <span aria-hidden="true">→</span></button>
          </div>}
            </div>
          </section>
        </main>

        <aside className="space-y-4">
          <div className={cn('sticky top-24 overflow-hidden rounded-[24px] border p-5 shadow-[0_18px_45px_rgba(15,23,42,0.18)] space-y-5', isDarkMode ? 'border-slate-700/80 bg-[#0B132B] text-white' : 'border-[#182331]/40 bg-gradient-to-br from-[#2E3E4F] via-[#263849] to-[#182331] text-white')}>
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-300 via-white/90 to-sky-300/40" />
            <div className="relative border-b border-white/10 pb-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300/80">Resumo vivo</span>
                <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-sky-100">Atualizado</span>
              </div>
              <p className="mt-4 text-xs font-semibold text-slate-200">{selectedProjectType || 'Selecione o tipo de projeto'}</p>
              <div className="mt-3 rounded-2xl border border-white/10 bg-black/10 px-4 py-3.5 shadow-inner">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-sky-200">Valor final</span>
                <p className="mt-1 text-3xl font-extrabold tracking-tight text-white">{selectedProjectType ? formatCurrency(breakdown.finalValue) : '—'}</p>
              </div>
            </div>
            {selectedProjectType ? (
              <div className="relative space-y-2.5 text-xs text-slate-200">
                <SummaryLine label="Valor base" value={formatCurrency(breakdown.baseValue)} />
                {breakdown.additionalPagesValue > 0 && <SummaryLine label={`Páginas adicionais (${formData.additionalPageCount})`} value={`+ ${formatCurrency(breakdown.additionalPagesValue)}`} />}
                {breakdown.customCodeValue > 0 && <SummaryLine label="Código personalizado" value={`+ ${formatCurrency(breakdown.customCodeValue)}`} />}
                {breakdown.blogModuleValue > 0 && <SummaryLine label="Módulo de blog" value={`+ ${formatCurrency(breakdown.blogModuleValue)}`} />}
                {breakdown.contentValue > 0 && <SummaryLine label="Conteúdo e copy" value={`+ ${formatCurrency(breakdown.contentValue)}`} />}
                {breakdown.additionalCosts > 0 && <SummaryLine label="Custos adicionais" value={`+ ${formatCurrency(breakdown.additionalCosts)}`} />}
                {breakdown.urgencyMultiplier !== 1 && <SummaryLine label={`Urgência: ${formData.urgency}`} value={`x${breakdown.urgencyMultiplier}`} />}
                <div className="mt-4 flex justify-between rounded-xl border border-white/10 bg-white/[0.07] px-3 py-3 font-extrabold text-white"><span>Subtotal</span><span>{formatCurrency(breakdown.subtotal)}</span></div>
              </div>
            ) : (
              <p className="relative rounded-xl border border-dashed border-white/15 bg-white/[0.04] p-3 text-xs leading-5 text-slate-300">O valor detalhado aparece assim que você selecionar o tipo de projeto.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

function FlowStepper({ currentStep, furthestStep, isDarkMode, onSelectStep }: { currentStep: number; furthestStep: number; isDarkMode: boolean; onSelectStep: (step: number) => void }) {
  const steps = ['Tipo de projeto', 'Escopo', 'Dados do cliente', 'Dados do projeto', 'Revisão']
  return (
    <nav aria-label="Etapas da proposta" className={cn('rounded-2xl border px-3 py-3 shadow-sm', isDarkMode ? 'border-slate-800 bg-[#16181D]' : 'border-slate-200/80 bg-white')}>
      <ol className="grid grid-cols-5 gap-1">
        {steps.map((step, index) => {
          const number = index + 1
          const isComplete = number < currentStep
          const isActive = number === currentStep
          const isReachable = number <= furthestStep
          return (
            <li key={step} className="relative min-w-0">
              {index > 0 && <span className={cn('absolute right-[calc(50%+1.25rem)] top-3 hidden h-px w-[calc(100%-2.5rem)] sm:block', isComplete ? (isDarkMode ? 'bg-sky-500/70' : 'bg-[#2E3E4F]/60') : (isDarkMode ? 'bg-slate-700' : 'bg-slate-200'))} />}
              <button type="button" onClick={() => onSelectStep(number)} disabled={!isReachable || isActive} className={cn('relative z-10 flex w-full flex-col items-center gap-1.5 text-center transition-opacity', isReachable && !isActive ? 'cursor-pointer hover:opacity-80' : 'cursor-default')} aria-current={isActive ? 'step' : undefined}>
                <span className={cn('flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-extrabold transition-colors', isComplete ? (isDarkMode ? 'border-sky-400 bg-sky-500 text-white' : 'border-[#2E3E4F] bg-[#2E3E4F] text-white') : isActive ? (isDarkMode ? 'border-sky-400 bg-sky-500/15 text-sky-300 ring-4 ring-sky-500/10' : 'border-[#2E3E4F] bg-[#2E3E4F]/10 text-[#2E3E4F] ring-4 ring-[#2E3E4F]/10') : (isDarkMode ? 'border-slate-700 bg-[#1A1E26] text-slate-500' : 'border-slate-200 bg-slate-50 text-slate-400'))}>{isComplete ? '✓' : number}</span>
                <span className={cn('hidden truncate text-[10px] font-bold sm:block', isActive ? (isDarkMode ? 'text-sky-300' : 'text-[#2E3E4F]') : isComplete ? (isDarkMode ? 'text-slate-300' : 'text-slate-600') : 'text-slate-400')}>{step}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
function TextField({ label, value, onChange, className, type = 'text', maxLength }: { label: string; value: string; onChange: (value: string) => void; className: string; type?: string; maxLength?: number }) { return <label><span className="mb-1 block font-bold text-slate-500">{label}</span><input type={type} maxLength={maxLength} value={value} onChange={(event) => onChange(event.target.value)} className={className} /></label> }
function Toggle({ label, detail, checked, onChange, isDarkMode }: { label: string; detail: string; checked: boolean; onChange: (checked: boolean) => void; isDarkMode: boolean }) { return <label className={cn('flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-colors', isDarkMode ? 'border-slate-700 bg-[#1A1E26]' : 'border-slate-200 bg-slate-50')}><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4" /><span><strong className="block text-xs">{label}</strong><span className="text-[10px] text-slate-500">{detail}</span></span></label> }
function ReviewItem({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) { return <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</dt><dd className={cn('mt-1 text-xs text-slate-700 dark:text-slate-200', strong && 'font-extrabold text-[#2E3E4F] dark:text-sky-300')}>{value}</dd></div> }
function SummaryLine({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-3"><span>{label}</span><span className="font-bold text-white text-right">{value}</span></div> }
