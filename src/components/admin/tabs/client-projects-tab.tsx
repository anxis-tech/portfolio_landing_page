'use client'

import { notify } from '@/components/admin/ui/notifications'

import { useState, useRef, useEffect } from 'react'
import {
  ClientProject,
  ClientProjectStatus,
  ClientProjectFile,
  ClientProjectLink,
  FileCategory,
} from '@/types/client-project.types'
import { UserProfileWithRole, hasPermission, PERMISSIONS } from '@/lib/auth/permissions'
import {
  INITIAL_KANBAN_STAGES,
  normalizeProjectStage,
} from '@/components/admin/tabs/kanban-board-tab'
import { saveClientProjectAction, deleteClientProjectAction } from '@/lib/actions/client-projects'
import { buildProjectFromQuote } from '@/lib/services/project-from-quote'
import {
  getContractsForProjects,
  downloadContractAction,
  downloadSignedContractAction,
  retryContractGeneration,
  sendContractForSignatureAction,
  voidContractAction,
} from '@/lib/actions/contracts'
import { createPaymentLinkAction, getPaymentsForProjectsAction } from '@/lib/actions/payments'
import {
  getPaymentActionState,
  getPaymentReceiptUrl,
  isPaymentCompletedStatus,
} from '@/lib/services/payment-action-state'
import { createClient } from '@/lib/supabase/client'
import { CONTRACT_SIGNATURE_STATUS_LABELS, Contract } from '@/types/contract.types'
import type { Payment } from '@/types/payment.types'
import { SavedQuote } from '@/types/pricing.types'
import { getContractActionAvailability, mergeContractUpdate } from './client-projects-contract-actions'
import { Icon } from '@/components/ui/icon'
import {
  ProjectsNavIcon,
  DownNavIcon,
  BackNavIcon,
} from '@/lib/icons/navigation'
import {
  AddActionIcon,
  DeleteActionIcon,
  ViewActionIcon,
  SaveActionIcon,
  CancelActionIcon,
  UploadActionIcon,
  DownloadActionIcon,
  LinkActionIcon,
  ExternalLinkActionIcon,
  SearchActionIcon,
  FilterActionIcon,
  MoreActionIcon,
  MailActionIcon,
  PdfActionIcon,
  ContractsActionIcon,
  FileDownActionIcon,
  PaymentReceiptActionIcon,
} from '@/lib/icons/actions'
import {
  MetricUserIcon,
  MetricTeamIcon,
  MetricQuoteIcon,
} from '@/lib/icons/dashboard'
import {
  SuccessStatusIcon,
  ErrorStatusIcon,
  WarningStatusIcon,
  PendingStatusIcon,
  InfoStatusIcon,
  FileAttachmentStatusIcon,
  DateStatusIcon,
} from '@/lib/icons/status'
import { cn } from '@/lib/utils'
import { PaymentConditionField } from '@/components/admin/payment-condition-field'



interface ClientProjectsTabProps {
  projects: ClientProject[]
  onUpdateProjects: (updated: ClientProject[]) => void
  userProfile: UserProfileWithRole | null
  teamUsers: UserProfileWithRole[]
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canAssignResponsible: boolean
  canViewAll: boolean
  onOpenProjectDetail: (project: ClientProject, options?: { readOnly?: boolean }) => void
  prefilledFromQuote?: SavedQuote | null
  onClearPrefilledQuote?: () => void
  // Callback to notify the parent page of a deployment skew error (stale Server Action).
  // The parent shows a reload banner; this component delegates this error to the reload banner.
  onStaleDeployDetected?: () => void
  isDarkMode?: boolean
}

export function ClientProjectsTab({
  projects = [],
  onUpdateProjects,
  userProfile,
  teamUsers = [],
  canCreate,
  canEdit,
  canDelete,
  canAssignResponsible,
  canViewAll,
  onOpenProjectDetail,
  prefilledFromQuote,
  onClearPrefilledQuote,
  onStaleDeployDetected,
  isDarkMode = false,
}: ClientProjectsTabProps) {
  const canReadPayments = hasPermission(userProfile, PERMISSIONS.PAYMENTS_VIEW) ||
    hasPermission(userProfile, PERMISSIONS.FINANCE_VIEW_PAYMENTS)
  const canCreatePayment = hasPermission(userProfile, PERMISSIONS.PAYMENTS_CREATE)
  const canGenerateContract = [PERMISSIONS.CONTRACTS_GENERATE, PERMISSIONS.CLIENT_PROJECTS_CREATE,
    PERMISSIONS.CLIENT_PROJECTS_EDIT].some((key) => hasPermission(userProfile, key))
  const canDownloadContract = [PERMISSIONS.CONTRACTS_DOWNLOAD, PERMISSIONS.CONTRACTS_VIEW,
    PERMISSIONS.CLIENT_PROJECTS_VIEW, PERMISSIONS.CLIENT_PROJECTS_VIEW_ALL,
    PERMISSIONS.CLIENT_PROJECTS_VIEW_ASSIGNED].some((key) => hasPermission(userProfile, key))
  // Helper: detects deployment skew errors and notifies the parent page.
  const handleActionError = (err: unknown): boolean => {
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('Failed to find Server Action') || message.includes('older or newer deployment')) {
      onStaleDeployDetected?.()
      return true // is stale error, suppress generic alert
    }
    return false
  }
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [platformFilter, setPlatformFilter] = useState('todos')

  // Contracts state
  const [contractsMap, setContractsMap] = useState<Record<string, Contract>>({})
  const [paymentsMap, setPaymentsMap] = useState<Record<string, Payment>>({})
  const [openContractMenuProjectId, setOpenContractMenuProjectId] = useState<string | null>(null)
  const contractMenuCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isGeneratingContract, setIsGeneratingContract] = useState(false)
  const [generatingContractMsg, setGeneratingContractMsg] = useState('Salvando projeto e iniciando geração do contrato em PDF...')
  const [contractActionId, setContractActionId] = useState<string | null>(null)

  const openContractMenu = (projectId: string) => {
    if (contractMenuCloseTimeoutRef.current) {
      clearTimeout(contractMenuCloseTimeoutRef.current)
      contractMenuCloseTimeoutRef.current = null
    }
    setOpenContractMenuProjectId(projectId)
  }

  const scheduleContractMenuClose = () => {
    if (contractMenuCloseTimeoutRef.current) clearTimeout(contractMenuCloseTimeoutRef.current)
    contractMenuCloseTimeoutRef.current = setTimeout(() => {
      setOpenContractMenuProjectId(null)
      contractMenuCloseTimeoutRef.current = null
    }, 180)
  }

  useEffect(() => () => {
    if (contractMenuCloseTimeoutRef.current) clearTimeout(contractMenuCloseTimeoutRef.current)
  }, [])

  // Expanded Spacious Dialog State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Partial<ClientProject> | null>(null)
  const [activeFormTab, setActiveFormTab] = useState<
    'geral' | 'contato' | 'escopo' | 'links_arquivos' | 'responsavel' | 'planejamento' | 'observacoes'
  >('geral')

  // Auto-open modal when prefilledFromQuote changes
  useEffect(() => {
    if (prefilledFromQuote) {
      const quote = prefilledFromQuote
      setEditingProject({
        ...buildProjectFromQuote(quote, {
          description: `Projeto gerado a partir do Orçamento #${quote.id}.`,
          deadline: '',
          contact: {
            email: '',
            phone: '',
            cep: '',
            street: '',
            number: '',
            neighborhood: '',
            city: '',
            state: '',
          },
        }),
        responsible_user_name: userProfile?.full_name || 'Admin',
        responsible_user_email: userProfile?.email || '',
      })
      setIsEditModalOpen(true)
      if (onClearPrefilledQuote) onClearPrefilledQuote()
    }
  }, [prefilledFromQuote])

  // Refresh contract state after webhook updates so payment availability never depends on stale UI data.
  useEffect(() => {
    let active = true
    const projectIds = projects.map((p) => p.id).filter((id) => !id.startsWith('temp-'))

    const refreshContractActions = async () => {
      if (projectIds.length === 0) {
        if (active) {
          setContractsMap({})
          setPaymentsMap({})
        }
        return
      }

      const [contracts, payments] = await Promise.all([
        getContractsForProjects(projectIds),
        canReadPayments ? getPaymentsForProjectsAction(projectIds) : Promise.resolve({}),
      ])
      if (active) {
        setContractsMap(contracts)
        setPaymentsMap(payments)
      }
    }

    void refreshContractActions()

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') void refreshContractActions()
    }
    document.addEventListener('visibilitychange', refreshWhenVisible)

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return () => {
        active = false
        document.removeEventListener('visibilitychange', refreshWhenVisible)
      }
    }

    const supabase = createClient()
    const channel = supabase
      .channel('contract-actions-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'contracts' }, (payload) => {
        const updatedContract = payload.new as Partial<Contract>
        if (!updatedContract.id || !updatedContract.project_id) {
          void refreshContractActions()
          return
        }

        setContractsMap((current) => mergeContractUpdate(current, updatedContract as Contract))
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'payments' }, (payload) => {
        if (!canReadPayments) return
        const updatedPayment = payload.new as Partial<Payment>
        if (!updatedPayment.id || !updatedPayment.project_id) {
          void refreshContractActions()
          return
        }

        setPaymentsMap((current) => {
          const currentPayment = current[updatedPayment.project_id!]
          if (currentPayment && isPaymentCompletedStatus(currentPayment.status) && !isPaymentCompletedStatus(updatedPayment.status)) {
            return current
          }

          return {
            ...current,
            [updatedPayment.project_id!]: updatedPayment as Payment,
          }
        })
      })
      .subscribe()

    return () => {
      active = false
      document.removeEventListener('visibilitychange', refreshWhenVisible)
      supabase.removeChannel(channel)
    }
  }, [projects, canReadPayments])

  // Searchable Combobox for Responsible User
  const [userSearchText, setUserSearchText] = useState('')
  const [isComboboxOpen, setIsComboboxOpen] = useState(false)

  // Sub-state for Adding New Link
  const [newLink, setNewLink] = useState({ label: '', url: '', category: 'Figma', description: '' })

  // Real Drag & Drop File Upload Dropzone State
  const [isDraggingFile, setIsDraggingFile] = useState(false)
  const [newFileCategory, setNewFileCategory] = useState<FileCategory>('Documentos')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const canEditBaseValue = hasPermission(userProfile, PERMISSIONS.CLIENT_PROJECTS_EDIT_BASE_VALUE)

  // FILTER VISIBILITY BY PERMISSION:
  const visibleProjects = projects.filter((p) => {
    if (canViewAll) return true
    if (!userProfile) return false
    return (
      p.responsible_user_id === userProfile.user_id ||
      p.created_by === userProfile.user_id
    )
  })

  const filteredProjects = visibleProjects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.client_name.toLowerCase().includes(searchTerm.toLowerCase())
    const normalized = normalizeProjectStage(p.status)
    const matchesStatus = statusFilter === 'todos' || normalized === statusFilter
    const matchesPlatform = platformFilter === 'todos' || p.platform === platformFilter
    return matchesSearch && matchesStatus && matchesPlatform
  })

  const filteredTeamUsers = teamUsers.filter(
    (u) =>
      u.is_active &&
      (u.full_name.toLowerCase().includes(userSearchText.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearchText.toLowerCase()))
  )

  const handleOpenCreateModal = () => {
    setEditingProject({
      title: '',
      client_name: '',
      company: '',
      approved_value: 0,
      project_type: 'Site institucional',
      platform: 'Next.js',
      status: 'Novo projeto',
      kanban_stage_name: 'Novo projeto',
      priority: 'Normal',
      responsible_user_id: userProfile?.user_id || '',
      responsible_user_name: userProfile?.full_name || '',
      responsible_user_email: userProfile?.email || '',
      client_contact_json: {
        contact_name: '',
        company: '',
        email: '',
        phone: '',
        whatsapp: '',
        cep: '',
        street: '',
        neighborhood: '',
        city: '',
        state: '',
      },
      scope_briefing_json: {
        objective: '',
        target_audience: '',
        segment: '',
        requested_pages: [],
        requested_features: [],
        requested_integrations: [],
        visual_references: [],
        technical_requirements: '',
        client_notes: '',
      },
      files: [],
      links: [],
      tasks: [],
    })
    setActiveFormTab('geral')
    setIsEditModalOpen(true)
  }

  const [isSaving, setIsSaving] = useState(false)

  const handleSaveProjectForm = async () => {
    if (!editingProject) return

    // Validate mandatory fields (except links, scope, responsible, internal_notes)
    const missing: { fieldName: string; tab: typeof activeFormTab }[] = []

    if (!editingProject?.title?.trim()) {
      missing.push({ fieldName: 'Nome do Projeto', tab: 'geral' })
    }
    if (!editingProject?.client_name?.trim()) {
      missing.push({ fieldName: 'Nome do Cliente', tab: 'geral' })
    }
    if (!editingProject?.company?.trim()) {
      missing.push({ fieldName: 'Empresa / Razão Social', tab: 'geral' })
    }
    if (!editingProject?.project_type?.trim()) {
      missing.push({ fieldName: 'Tipo de Projeto', tab: 'geral' })
    }
    if (!editingProject?.platform?.trim()) {
      missing.push({ fieldName: 'Plataforma', tab: 'geral' })
    }
    if (!editingProject?.approved_value || Number(editingProject.approved_value) <= 0) {
      missing.push({ fieldName: 'Valor Aprovado do Projeto (R$)', tab: 'geral' })
    }
    if (!editingProject?.description?.trim()) {
      missing.push({ fieldName: 'Descrição Geral do Projeto', tab: 'geral' })
    }

    // Tab 2: Informações do cliente
    const contactName = editingProject?.client_contact_json?.contact_name || editingProject?.client_name
    if (!contactName?.trim()) {
      missing.push({ fieldName: 'Nome do Contato Principal', tab: 'contato' })
    }
    const email = editingProject?.client_contact_json?.email || editingProject?.email
    if (!email?.trim()) {
      missing.push({ fieldName: 'E-mail de Contato', tab: 'contato' })
    }
    const phone = editingProject?.client_contact_json?.phone || editingProject?.phone || editingProject?.whatsapp
    if (!phone?.trim()) {
      missing.push({ fieldName: 'Telefone/WhatsApp', tab: 'contato' })
    }
    if (!editingProject?.client_contact_json?.cep?.trim()) {
      missing.push({ fieldName: 'CEP', tab: 'contato' })
    }
    if (!editingProject?.client_contact_json?.street?.trim()) {
      missing.push({ fieldName: 'Endereço (Rua/Logradouro)', tab: 'contato' })
    }
    if (!editingProject?.client_contact_json?.number?.trim()) {
      missing.push({ fieldName: 'Número', tab: 'contato' })
    }
    if (!editingProject?.client_contact_json?.neighborhood?.trim()) {
      missing.push({ fieldName: 'Bairro', tab: 'contato' })
    }
    if (!editingProject?.client_contact_json?.city?.trim()) {
      missing.push({ fieldName: 'Cidade', tab: 'contato' })
    }
    if (!editingProject?.client_contact_json?.state?.trim()) {
      missing.push({ fieldName: 'Estado (UF)', tab: 'contato' })
    }

    // Tab 6: Planejamento
    if (!editingProject?.deadline?.trim()) {
      missing.push({ fieldName: 'Prazo Final Prometido ao Cliente', tab: 'planejamento' })
    }

    if (missing.length > 0) {
      const firstTab = missing[0].tab
      setActiveFormTab(firstTab)
      notify.error(
        `Por favor, preencha todos os campos obrigatórios antes de salvar:\n\n• ` +
          missing.map((m) => m.fieldName).join('\n• ')
      )
      return
    }

    const isEdit = !!editingProject.id && !editingProject.id.startsWith('cp-temp-') && !editingProject.id.startsWith('temp-') && !editingProject.id.startsWith('cp-')

    if (isEdit && !canEdit) {
      notify.error('Você não possui permissão para editar projetos de clientes.')
      return
    }

    if (!isEdit && !canCreate) {
      notify.error('Você não possui permissão para criar novos projetos de clientes.')
      return
    }

    if (!isEdit && !editingProject.payment_condition) {
      setActiveFormTab('geral')
      notify.error('Selecione a condição de pagamento antes de gerar o contrato.')
      return
    }

    setIsSaving(true)

    const normStatus = normalizeProjectStage(editingProject.status)

    const projectToSave = {
      ...editingProject,
      status: normStatus,
      kanban_stage_name: normStatus,
    }

    let res: Awaited<ReturnType<typeof saveClientProjectAction>>
    try {
      res = await saveClientProjectAction(projectToSave)
    } catch (err) {
      setIsSaving(false)
      if (!handleActionError(err)) {
        notify.error(`Erro inesperado ao salvar o projeto.`)
      }
      return
    }

    if (!res.success || !res.project) {
      setIsSaving(false)
      notify.error(`Erro ao salvar no banco de dados: ${res.message || 'Falha na gravação.'}`)
      return
    }

    const savedProject = res.project as ClientProject

    if (isEdit) {
      const updated = projects.map((p) => (p.id === savedProject.id ? savedProject : p))
      onUpdateProjects(updated)
      notify.success('Projeto atualizado com sucesso no banco de dados!')
      setIsSaving(false)
      setIsEditModalOpen(false)
      setEditingProject(null)
    } else {
      onUpdateProjects([savedProject, ...projects])
      setIsSaving(false)
      setIsEditModalOpen(false)
      setEditingProject(null)

      // Show contract generation loading screen for new projects
      setIsGeneratingContract(true)
      setGeneratingContractMsg('Projeto salvo no banco de dados! Gerando o arquivo do contrato em PDF no servidor...')

      setTimeout(() => {
        setIsGeneratingContract(false)
        notify.success(`Projeto "${savedProject.title}" criado com sucesso! O contrato em PDF foi gerado e está disponível na lista de projetos.`)
        // Refresh contract map
        getContractsForProjects([savedProject.id]).then((map) => {
          setContractsMap((prev) => ({ ...prev, ...map }))
        })
      }, 3500)
    }
  }

  // DOWNLOAD CONTRACT HANDLER
  const handleDownloadContract = async (projectId: string) => {
    if (!canDownloadContract) return
    const contract = contractsMap[projectId]
    if (!contract) {
      notify.info('Nenhum contrato encontrado para este projeto. O contrato pode estar em fila de geração.')
      return
    }

    if (contract.status === 'failed') {
      if (!canGenerateContract) return
      const retry = window.confirm(`A geração do contrato em PDF falhou previamente.\nErro: ${contract.error_message || 'Erro no servidor'}\n\nDeseja tentar gerar novamente?`)
      if (retry) {
        setIsGeneratingContract(true)
        setGeneratingContractMsg('Gerando o contrato novamente...')
        const res = await retryContractGeneration(contract.id)
        setIsGeneratingContract(false)
        if (res.success) {
          notify.success('Nova tentativa iniciada com sucesso. Por favor, aguarde alguns segundos.')
        } else {
          notify.error(`Erro ao tentar regerar contrato: ${res.message}`)
        }
      }
      return
    }

    if (contract.status === 'pending' || contract.status === 'processing') {
      notify.info('O contrato em PDF ainda está sendo gerado no servidor. Por favor, aguarde alguns instantes e tente novamente.')
      return
    }

    const res = await downloadContractAction(contract.id)
    if (res.success && res.signedUrl) {
      const a = document.createElement('a')
      a.href = res.signedUrl
      a.download = res.fileName || 'contrato.pdf'
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } else {
      notify.error(`Erro ao baixar contrato: ${res.message}`)
    }
  }

  const refreshProjectContract = async (projectId: string) => {
    const map = await getContractsForProjects([projectId])
    setContractsMap((previous) => ({ ...previous, ...map }))
  }

  const openDownload = (signedUrl: string, fileName: string) => {
    const anchor = document.createElement('a')
    anchor.href = signedUrl
    anchor.download = fileName
    anchor.target = '_blank'
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
  }

  const handleSendForSignature = async (projectId: string) => {
    if (!canGenerateContract) return
    const contract = contractsMap[projectId]
    if (!contract) return

    setContractActionId(contract.id)
    try {
      const result = await sendContractForSignatureAction(contract.id)
      if (!result.success) {
        notify.error(result.message || 'Não foi possível enviar o contrato para assinatura.')
        return
      }

      await refreshProjectContract(projectId)
      notify.success('Contrato enviado para assinatura. O link está disponível para cópia.')
    } catch (error) {
      if (!handleActionError(error)) notify.error('Erro inesperado ao enviar o contrato para assinatura.')
    } finally {
      setContractActionId(null)
    }
  }

  const handleDownloadSignedContract = async (projectId: string) => {
    if (!canDownloadContract) return
    const contract = contractsMap[projectId]
    if (!contract) return

    setContractActionId(contract.id)
    try {
      const result = await downloadSignedContractAction(contract.id)
      if (result.success && result.signedUrl) {
        openDownload(result.signedUrl, result.fileName || 'contrato-assinado.pdf')
      } else {
        notify.error(result.message || 'O PDF assinado ainda não está disponível.')
      }
    } catch (error) {
      if (!handleActionError(error)) notify.error('Erro inesperado ao baixar o PDF assinado.')
    } finally {
      setContractActionId(null)
    }
  }

  const handleGeneratePaymentLink = async (projectId: string) => {
    if (!canCreatePayment) return
    const contract = contractsMap[projectId]
    if (!contract) return

    setContractActionId(contract.id)
    try {
      const result = await createPaymentLinkAction({ projectId, contractId: contract.id })
      if (!result.success) {
        notify.error(result.message || 'Não foi possível gerar o link de pagamento.')
        return
      }

      if (result.paymentUrl) {
        onUpdateProjects(projects.map((project) => project.id === projectId
          ? { ...project, payment_link: result.paymentUrl, payment_status: 'Pendente' }
          : project
        ))
      }
      notify.success(result.message || 'Link de pagamento gerado com sucesso.')
    } catch (error) {
      if (!handleActionError(error)) notify.error('Erro inesperado ao gerar o link de pagamento.')
    } finally {
      setContractActionId(null)
    }
  }

  // DELETE PROJECT HANDLER
  const handleDeleteProject = async (projectId: string, projectTitle: string) => {
    if (!canDelete) {
      notify.error('Você não possui permissão para excluir projetos de clientes.')
      return
    }

    const confirmDelete = window.confirm(
      `Tem certeza de que deseja excluir permanentemente o projeto "${projectTitle}"?\n\nEsta ação removerá todos os arquivos, links e pendências vinculadas ao projeto.`
    )

    if (!confirmDelete) return

    const res = await deleteClientProjectAction(projectId)

    if (!res.success) {
      notify.error(`Erro ao excluir projeto: ${res.message}`)
      return
    }

    const updated = projects.filter((p) => p.id !== projectId)
    onUpdateProjects(updated)

    if (editingProject?.id === projectId) {
      setIsEditModalOpen(false)
      setEditingProject(null)
    }

    notify.success(`Projeto "${projectTitle}" excluído com sucesso!`)
  }

  // LINK MANAGEMENT
  const handleAddLink = () => {
    if (!newLink.label || !newLink.url) return
    const lObj: ClientProjectLink = {
      id: `l-${Date.now()}`,
      project_id: editingProject?.id || 'new',
      label: newLink.label,
      url: newLink.url,
      category: newLink.category,
      description: newLink.description,
      created_at: new Date().toISOString(),
    }
    setEditingProject((prev) => ({
      ...prev,
      links: [...(prev?.links || []), lObj],
    }))
    setNewLink({ label: '', url: '', category: 'Figma', description: '' })
  }

  const handleRemoveLink = (linkId: string) => {
    setEditingProject((prev) => ({
      ...prev,
      links: (prev?.links || []).filter((l) => l.id !== linkId),
    }))
  }

  // REAL FILE DRAG & DROP & SELECT HANDLERS
  const processFilesToAdd = (files: FileList | File[]) => {
    const fileListArray = Array.from(files)
    if (fileListArray.length === 0) return

    const newAttachedFiles: ClientProjectFile[] = fileListArray.map((file, idx) => ({
      id: `f-${Date.now()}-${idx}`,
      project_id: editingProject?.id || 'new',
      file_name: file.name,
      storage_path: `client-project-files/uploads/${file.name}`,
      file_size: file.size,
      file_type: file.type,
      category: newFileCategory,
      uploaded_by: userProfile?.full_name || 'Usuário Logado',
      created_at: new Date().toISOString(),
    }))

    setEditingProject((prev) => ({
      ...prev,
      files: [...(prev?.files || []), ...newAttachedFiles],
    }))
  }

  const handleDragOverFileDropzone = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingFile(true)
  }

  const handleDragLeaveFileDropzone = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingFile(false)
  }

  const handleDropFiles = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingFile(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFilesToAdd(e.dataTransfer.files)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFilesToAdd(e.target.files)
    }
  }

  const handleRemoveFile = (fileId: string) => {
    if (!canDelete && !canEdit) return
    setEditingProject((prev) => ({
      ...prev,
      files: (prev?.files || []).filter((f) => f.id !== fileId),
    }))
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 KB'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn('space-y-5 max-w-full font-sans transition-colors', isDarkMode ? 'text-white' : 'text-[#0C1D36]')}>
      {/* HEADER */}
      <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b', isDarkMode ? 'border-slate-800' : 'border-slate-200/80')}>
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className={cn('text-lg font-bold tracking-tight', isDarkMode ? 'text-white' : 'text-[#0C1D36]')}>
              Projetos
            </h2>
            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600')}>
              {filteredProjects.length} {filteredProjects.length === 1 ? 'projeto' : 'projetos'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Acompanhamento de projetos de clientes, contratos, assinatura e faturamento.
          </p>
        </div>
      </div>

      {/* FILTERS & SEARCH TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Icon icon={SearchActionIcon} size={15} />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por projeto ou cliente..."
            className={cn(
              'w-full h-9 pl-9 pr-3 rounded-lg text-xs outline-none transition-colors border',
              isDarkMode
                ? 'bg-[#111622] border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-[#2E3E4F]'
                : 'bg-white border-slate-200 text-[#0C1D36] placeholder:text-slate-400 focus:border-[#2E3E4F]'
            )}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={cn(
              'h-9 px-3 rounded-lg border text-xs outline-none transition-colors cursor-pointer',
              isDarkMode
                ? 'bg-[#111622] border-slate-800 text-slate-200 focus:border-[#2E3E4F]'
                : 'bg-white border-slate-200 text-slate-700 focus:border-[#2E3E4F]'
            )}
          >
            <option value="todos">Todos os Estágios</option>
            {INITIAL_KANBAN_STAGES.map((s: any) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className={cn(
              'h-9 px-3 rounded-lg border text-xs outline-none transition-colors cursor-pointer',
              isDarkMode
                ? 'bg-[#111622] border-slate-800 text-slate-200 focus:border-[#2E3E4F]'
                : 'bg-white border-slate-200 text-slate-700 focus:border-[#2E3E4F]'
            )}
          >
            <option value="todos">Todas as Plataformas</option>
            <option value="Next.js">Next.js</option>
            <option value="Tray">Tray</option>
            <option value="Nuvemshop">Nuvemshop</option>
            <option value="WordPress">WordPress</option>
            <option value="WooCommerce">WooCommerce</option>
          </select>
        </div>
      </div>

      {/* PROJECTS LIST VIEW */}
      {filteredProjects.length === 0 && !canViewAll ? (
        <div className={cn('text-center py-12 rounded-xl border border-dashed space-y-2', isDarkMode ? 'bg-[#111622] border-slate-800' : 'bg-slate-50 border-slate-200')}>
          <Icon icon={MetricUserIcon} size={32} className="text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-400">Você não possui projetos atribuídos no momento.</p>
        </div>
      ) : (
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left text-xs border-collapse min-w-[900px]">
            <thead>
              <tr className={cn('border-b font-medium uppercase tracking-wider text-[11px]', isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200/80 text-slate-400')}>
                <th className="py-2.5 px-3 whitespace-nowrap">Projeto & E-mail</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Tipo & Plataforma</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Estágio</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Assinatura</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Pagamento</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Responsável</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Responsável comercial</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody className={cn('divide-y', isDarkMode ? 'divide-slate-800/60' : 'divide-slate-100')}>
              {filteredProjects.map((project) => {
                const normStage = normalizeProjectStage(project.status)
                const payment = paymentsMap[project.id]
                const paymentStatus = payment?.status || project.payment_status || 'Sem link'
                const paymentLink = payment?.payment_url || project.payment_link
                const paymentReceiptUrl = getPaymentReceiptUrl(payment?.receipt_url)
                const contract = contractsMap[project.id]
                const canSendForSignature = Boolean(
                  !contract?.voided_at && contract?.status === 'completed' && ['generated', 'error'].includes(contract.signature_status)
                )
                const hasSignedContract = Boolean(contract?.signed_document_path)
                const actionAvailability = contract
                  ? getContractActionAvailability({
                    voidedAt: contract.voided_at,
                    signatureStatus: contract.signature_status,
                    signingUrl: contract.autentique_signing_url,
                    paymentUnlockedAt: contract.payment_unlocked_at,
                    paymentLink,
                    paymentStatus,
                  })
                  : {
                    canAccessSignatureLink: false,
                    paymentAction: getPaymentActionState({
                      paymentUnlockedAt: null,
                      paymentLink,
                      paymentStatus,
                    }),
                  }
                const isContractActionInFlight = contractActionId === contract?.id

                return (
                  <tr key={project.id} className={cn('transition-colors group', isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50/80')}>
                    <td className="py-3 px-3 max-w-[240px]">
                      <button
                        type="button"
                        onClick={() => onOpenProjectDetail(project, { readOnly: true })}
                        className={cn('font-semibold text-xs truncate text-left block hover:text-[#2E3E4F] transition-colors cursor-pointer', isDarkMode ? 'text-slate-100 hover:text-sky-400' : 'text-[#0C1D36]')}
                      >
                        {project.title}
                      </button>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{project.email || project.client_contact_json?.email || 'E-mail não informado'}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-medium text-slate-700 dark:text-slate-300 text-xs">{project.project_type}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{project.platform || 'N/A'}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {normStage}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {contract ? (
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border',
                            contract.signature_status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/30'
                              : contract.signature_status === 'rejected' || contract.signature_status === 'error'
                                ? 'bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/30'
                                : 'bg-slate-100 text-slate-500 border-slate-200/60 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/60'
                          )}
                        >
                          {contract.voided_at ? 'Inutilizado' : CONTRACT_SIGNATURE_STATUS_LABELS[contract.signature_status]}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">PDF pendente</span>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border",
                          isPaymentCompletedStatus(paymentStatus)
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/30"
                            : paymentStatus === 'Pendente'
                            ? "bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/30"
                            : paymentStatus.includes('Falha')
                            ? "bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/30"
                            : "bg-slate-100 text-slate-500 border-slate-200/60 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/60"
                        )}
                      >
                        {paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-[10px] font-semibold shrink-0">
                          {project.responsible_user_name ? project.responsible_user_name.charAt(0) : '?'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-slate-700 dark:text-slate-300 truncate">{project.responsible_user_name || 'Sem responsável'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      <span className="font-medium truncate block max-w-[160px]" title={project.commercial_user_name || undefined}>
                        {project.commercial_user_name || 'Não atribuído'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        {canGenerateContract && !hasSignedContract && canSendForSignature && (
                          <button type="button" disabled={isContractActionInFlight} onClick={() => handleSendForSignature(project.id)} className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors cursor-pointer disabled:cursor-wait disabled:opacity-50" title="Enviar contrato para assinatura">
                            <Icon icon={ContractsActionIcon} size={15} />
                          </button>
                        )}

                        {!hasSignedContract && actionAvailability.canAccessSignatureLink && contract?.autentique_signing_url && (
                          <>
                            <button type="button" onClick={() => window.open(contract.autentique_signing_url!, '_blank', 'noopener,noreferrer')} className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors cursor-pointer" title="Abrir contrato para assinatura">
                              <Icon icon={ContractsActionIcon} size={15} />
                            </button>
                            <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(contract.autentique_signing_url!); notify.success('Link de assinatura copiado com sucesso!') } catch { notify.error('Não foi possível copiar o link de assinatura.') } }} className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors cursor-pointer" title="Copiar link de assinatura">
                              <Icon icon={LinkActionIcon} size={15} />
                            </button>
                          </>
                        )}

                        {canDownloadContract && hasSignedContract && (
                          <button type="button" disabled={isContractActionInFlight} onClick={() => handleDownloadSignedContract(project.id)} className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-sky-600 hover:bg-sky-50 hover:text-sky-700 dark:text-sky-300 dark:hover:bg-sky-950/40 transition-colors cursor-pointer disabled:cursor-wait disabled:opacity-50" title="Baixar contrato assinado">
                            <Icon icon={FileDownActionIcon} size={15} />
                          </button>
                        )}

                        {canCreatePayment && actionAvailability.paymentAction === 'ready' && (
                          <button type="button" disabled={isContractActionInFlight} onClick={() => handleGeneratePaymentLink(project.id)} className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-base font-extrabold text-white shadow-sm hover:bg-emerald-700 transition-colors cursor-pointer disabled:cursor-wait disabled:opacity-50" title="Gerar link de pagamento" aria-label="Gerar link de pagamento">
                            $
                          </button>
                        )}
                        {canReadPayments && actionAvailability.paymentAction === 'existing' && paymentLink && (
                          <button type="button" onClick={() => window.open(paymentLink, '_blank', 'noopener,noreferrer')} className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-base font-extrabold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer" title="Abrir cobrança existente" aria-label="Abrir cobrança existente">
                            $
                          </button>
                        )}
                        {canReadPayments && actionAvailability.paymentAction === 'paid' && (
                          <button
                            type="button"
                            disabled={!paymentReceiptUrl}
                            onClick={() => paymentReceiptUrl && window.open(paymentReceiptUrl, '_blank', 'noopener,noreferrer')}
                            className={cn(
                              'inline-flex h-7 w-7 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors disabled:opacity-50',
                              paymentReceiptUrl ? 'cursor-pointer' : 'cursor-not-allowed'
                            )}
                            title={paymentReceiptUrl ? 'Ver comprovante de pagamento' : 'Comprovante de pagamento indisponível'}
                            aria-label={paymentReceiptUrl ? 'Ver comprovante de pagamento' : 'Comprovante de pagamento indisponível'}
                          >
                            <Icon icon={PaymentReceiptActionIcon} size={15} />
                          </button>
                        )}
                        {canCreatePayment && actionAvailability.paymentAction === 'blocked' && (
                          <button type="button" disabled className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-base font-extrabold text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50" title="Aguardando assinatura do contrato" aria-label="Aguardando assinatura do contrato">
                            $
                          </button>
                        )}

                        <button type="button" onClick={() => onOpenProjectDetail(project, { readOnly: true })} className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-[#2E3E4F] hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer" title="Ver detalhes do contrato">
                          <Icon icon={ViewActionIcon} size={15} />
                        </button>

                        <div
                          className="relative"
                          onMouseEnter={() => openContractMenu(project.id)}
                          onMouseLeave={scheduleContractMenuClose}
                        >
                          <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-[#2E3E4F] hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-default" title="Mais ações do contrato" aria-haspopup="menu" aria-expanded={openContractMenuProjectId === project.id}>
                            <Icon icon={MoreActionIcon} size={15} />
                          </button>
                          <div className={cn(
                            'absolute right-0 bottom-full z-50 mb-0.5 w-52 rounded-lg border border-slate-200 bg-white py-1 text-left shadow-xl transition-opacity duration-150 dark:border-slate-700 dark:bg-slate-900',
                            openContractMenuProjectId === project.id
                              ? 'pointer-events-auto visible opacity-100'
                              : 'pointer-events-none invisible opacity-0'
                          )}>
                              {(canGenerateContract || canEdit) && contract && !contract.voided_at && !contract.client_signed_at && !['client_signed','completed'].includes(contract.signature_status) && <button type="button" disabled={isContractActionInFlight} onClick={async () => {
                                const reason = window.prompt('Motivo para inutilizar este contrato e cancelar o envio para assinatura:')
                                if (!reason?.trim()) return
                                setContractActionId(contract.id)
                                try {
                                  const result = await voidContractAction(contract.id, reason.trim())
                                  notify[result.success ? 'success' : 'error'](result.message || (result.success ? 'Contrato inutilizado. Edite o projeto para escolher a condição e gerar a nova versão.' : 'Não foi possível inutilizar o contrato.'))
                                  if (result.success) { const refreshed = await getContractsForProjects([project.id]); setContractsMap((previous) => { const next = { ...previous }; delete next[project.id]; return { ...next, ...refreshed } }) }
                                } catch (error) { if (!handleActionError(error)) notify.error('Não foi possível inutilizar o contrato.') } finally { setContractActionId(null) }
                              }} className="w-full px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50">Inutilizar contrato</button>}
                              {contract?.voided_at && <span className="block px-3 py-2 text-xs text-amber-700">Contrato inutilizado. Salve o projeto para gerar nova versão.</span>}
                              {canDownloadContract && contract?.status === 'completed' ? (
                                <button type="button" onClick={() => handleDownloadContract(project.id)} className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                                  Baixar contrato original
                                </button>
                              ) : (
                                <span className="block px-3 py-2 text-xs text-slate-400">Contrato original indisponível</span>
                              )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* OVERHAULED SPACIOUS DIALOG (90% WIDTH / 90% HEIGHT) */}
      {isEditModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className={cn("rounded-2xl w-[94vw] max-w-6xl h-[92vh] shadow-xl flex flex-col justify-between overflow-hidden animate-in zoom-in-95 border", isDarkMode ? "bg-[#16181D] border-slate-800 text-white" : "bg-white border-slate-200 text-[#0C1D36]")}>
            {/* MODAL HEADER */}
            <div className={cn("p-4 sm:p-5 border-b flex items-center justify-between shrink-0", isDarkMode ? "bg-[#111622] border-slate-800 text-white" : "bg-white border-slate-200 text-[#0C1D36]")}>
              <div className="flex items-center gap-2.5">
                <Icon icon={ProjectsNavIcon} size={20} className="text-[#2E3E4F] dark:text-sky-400" />
                <div>
                  <h3 className="text-base font-bold tracking-tight">
                    {editingProject.id ? `Editar Projeto: ${editingProject.title}` : 'Cadastrar Novo Projeto de Cliente'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Formulário completo de escopo, arquivos, briefing e equipe responsável.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center cursor-pointer"
              >
                <Icon icon={CancelActionIcon} size={18} />
              </button>
            </div>

            {/* SPACIOUS TABS BAR */}
            <div className={cn("px-4 sm:px-6 py-2 border-b flex items-center gap-1.5 overflow-x-auto shrink-0 text-xs font-medium", isDarkMode ? "bg-slate-900/50 border-slate-800" : "bg-slate-50 border-slate-200/80")}>
              {[
                { id: 'geral', label: '1. Informações Gerais', icon: ProjectsNavIcon },
                { id: 'contato', label: '2. Informações do cliente', icon: MetricUserIcon },
                { id: 'escopo', label: '3. Escopo & Briefing', icon: MetricQuoteIcon },
                { id: 'links_arquivos', label: '4. Links & Arquivos', icon: LinkActionIcon },
                { id: 'responsavel', label: '5. Responsáveis', icon: MetricTeamIcon },
                { id: 'planejamento', label: '6. Planejamento & Prazo', icon: DateStatusIcon },
                { id: 'observacoes', label: '7. Observações Internas', icon: InfoStatusIcon },
              ].map((tab) => {
                const IconRaw = tab.icon
                const isActive = activeFormTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveFormTab(tab.id as any)}
                    className={cn(
                      'flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer',
                      isActive
                        ? isDarkMode ? 'bg-sky-600 text-white shadow-sm' : 'bg-[#182331] text-white shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    )}
                  >
                    <Icon icon={IconRaw} size={16} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* TAB CONTENTS (MAIN EXPANDED SCROLL AREA) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-[#0C1D36]">
              {/* TAB 1: INFORMAÇÕES GERAIS */}
              {activeFormTab === 'geral' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold mb-1">Nome do Projeto *</label>
                      <input
                        type="text"
                        value={editingProject.title || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                        placeholder="Ex: Redesign Loja Decor Studio"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1">Nome do Cliente *</label>
                      <input
                        type="text"
                        value={editingProject.client_name || ''}
                        onChange={(e) =>
                          setEditingProject({
                            ...editingProject,
                            client_name: e.target.value,
                            client_contact_json: {
                              ...editingProject.client_contact_json,
                              contact_name: editingProject.client_contact_json?.contact_name || e.target.value,
                            },
                          })
                        }
                        placeholder="Ex: Mariana Lima"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1">Empresa / Razão Social *</label>
                      <input
                        type="text"
                        value={editingProject.company || ''}
                        onChange={(e) =>
                          setEditingProject({
                            ...editingProject,
                            company: e.target.value,
                            client_contact_json: {
                              ...editingProject.client_contact_json,
                              company: e.target.value,
                            },
                          })
                        }
                        placeholder="Ex: Decor Studio Ltda"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1">Tipo de Projeto *</label>
                      <select
                        value={editingProject.project_type || 'Site institucional'}
                        onChange={(e) => setEditingProject({ ...editingProject, project_type: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold cursor-pointer"
                      >
                        <option value="Landing page">Landing page</option>
                        <option value="Página de vendas">Página de vendas</option>
                        <option value="Site institucional">Site institucional</option>
                        <option value="Loja virtual">Loja virtual</option>
                        <option value="Blog">Blog</option>
                        <option value="Integração ou funcionalidade">Integração ou funcionalidade</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold mb-1">Plataforma *</label>
                      <select
                        value={editingProject.platform || 'Next.js'}
                        onChange={(e) => setEditingProject({ ...editingProject, platform: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold cursor-pointer"
                      >
                        <option value="Next.js">Next.js / React</option>
                        <option value="Tray">Tray</option>
                        <option value="Nuvemshop">Nuvemshop</option>
                        <option value="WordPress">WordPress / Elementor</option>
                        <option value="WooCommerce">WooCommerce</option>
                        <option value="Desenvolvimento personalizado">Desenvolvimento personalizado</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold">Valor Aprovado do Projeto (R$) *</label>
                        {canEditBaseValue ? (
                          <span className="text-[10px] bg-amber-50 text-amber-700 font-extrabold px-2 py-0.5 rounded border border-amber-200">
                            Edição permitida
                          </span>
                        ) : (
                          <span className="text-[10px] bg-slate-100 text-slate-600 font-extrabold px-2 py-0.5 rounded border border-slate-200">
                            🔒 Calculadora Comercial (Bloqueado)
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        readOnly={!canEditBaseValue}
                        disabled={!canEditBaseValue}
                        value={editingProject.approved_value || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, approved_value: parseFloat(e.target.value) || 0 })}
                        placeholder={canEditBaseValue ? "Ex: 4500.00" : "Valor fixado pela Calculadora"}
                        className={cn(
                          'w-full px-3.5 py-2.5 rounded-xl border font-mono font-bold text-[#2E3E4F] dark:text-sky-400',
                          !canEditBaseValue
                            ? 'bg-slate-100/90 text-slate-600 border-slate-200 cursor-not-allowed select-none opacity-90'
                            : 'bg-white border-slate-200'
                        )}
                      />
                      {!canEditBaseValue && (
                        <p className="text-[10px] text-slate-400 mt-1">
                          Definido estritamente pelas regras da Calculadora Comercial. Seu acesso não permite alterar este valor.
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Descrição Geral do Projeto *</label>
                    <textarea
                      rows={4}
                      value={editingProject.description || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                      placeholder="Descreva o resumo comercial, objetivos e direcionamento principal..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              )}

              {(activeFormTab === 'geral' || activeFormTab === 'contato') && <PaymentConditionField
                value={editingProject.payment_condition || ''}
                finalValue={editingProject.approved_value ?? 0}
                disabled={Boolean(contractsMap[editingProject.id || '']?.signature_requested_at && !contractsMap[editingProject.id || '']?.voided_at)}
                onChange={(payment_condition) => setEditingProject({ ...editingProject, payment_condition: payment_condition || undefined })}
              />}

              {/* TAB 2: INFORMAÇÕES DO CLIENTE */}
              {activeFormTab === 'contato' && (
                <div className="space-y-6">
                  {/* DADOS DE CONTATO */}
                  <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <h4 className="font-bold text-sm text-[#2E3E4F] dark:text-sky-400 flex items-center gap-2">
                      <Icon icon={MailActionIcon} size={16} />
                      <span>Informações de Contato do Cliente</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-bold mb-1">Nome do Contato Principal *</label>
                        <input
                          type="text"
                          value={editingProject.client_contact_json?.contact_name || editingProject.client_name || ''}
                          onChange={(e) =>
                            setEditingProject({
                              ...editingProject,
                              client_contact_json: {
                                ...editingProject.client_contact_json,
                                contact_name: e.target.value,
                              },
                            })
                          }
                          placeholder="Ex: Mariana Lima"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-bold mb-1">E-mail de Contato *</label>
                        <input
                          type="email"
                          value={editingProject.client_contact_json?.email || editingProject.email || ''}
                          onChange={(e) =>
                            setEditingProject({
                              ...editingProject,
                              email: e.target.value,
                              client_contact_json: {
                                ...editingProject.client_contact_json,
                                email: e.target.value,
                              },
                            })
                          }
                          placeholder="cliente@empresa.com.br"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-bold mb-1">Telefone/WhatsApp *</label>
                        <input
                          type="text"
                          value={editingProject.client_contact_json?.phone || editingProject.phone || editingProject.whatsapp || ''}
                          onChange={(e) =>
                            setEditingProject({
                              ...editingProject,
                              phone: e.target.value,
                              whatsapp: e.target.value,
                              client_contact_json: {
                                ...editingProject.client_contact_json,
                                phone: e.target.value,
                                whatsapp: e.target.value,
                              },
                            })
                          }
                          placeholder="(11) 98888-7777"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <h4 className="font-bold text-sm">Dados fiscais do cliente</h4>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {([['cpf_cnpj','CPF / CNPJ'],['legal_name','Nome / razão social fiscal'],['complement','Complemento'],['city_ibge','Código IBGE do município']] as const).map(([key,label]) => <label key={key} className="block font-bold"><span className="mb-1 block">{label}</span><input value={editingProject.client_contact_json?.[key] || ''} onChange={(event) => setEditingProject({ ...editingProject, client_contact_json: { ...editingProject.client_contact_json, [key]: event.target.value } })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2" /></label>)}
                      <label className="block font-bold"><span className="mb-1 block">Tipo de pessoa</span><select value={editingProject.client_contact_json?.person_type || ''} onChange={(event) => setEditingProject({ ...editingProject, client_contact_json: { ...editingProject.client_contact_json, person_type: (event.target.value || undefined) as 'individual' | 'company' | undefined } })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2"><option value="">Selecione</option><option value="individual">Pessoa física</option><option value="company">Pessoa jurídica</option></select></label>
                    </div>
                  </div>
                  {/* ENDEREÇO DO CLIENTE */}
                  <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <h4 className="font-bold text-sm text-[#2E3E4F] dark:text-sky-400 flex items-center gap-2">
                      <Icon icon={ProjectsNavIcon} size={16} />
                      <span>Endereço Completo do Cliente</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block font-bold mb-1">CEP *</label>
                        <input
                          type="text"
                          value={editingProject.client_contact_json?.cep || ''}
                          onChange={(e) =>
                            setEditingProject({
                              ...editingProject,
                              client_contact_json: {
                                ...editingProject.client_contact_json,
                                cep: e.target.value,
                              },
                            })
                          }
                          placeholder="00000-000"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                        />
                      </div>

                      <div className="sm:col-span-2 lg:col-span-2">
                        <label className="block font-bold mb-1">Endereço (Rua/Logradouro) *</label>
                        <input
                          type="text"
                          value={editingProject.client_contact_json?.street || ''}
                          onChange={(e) =>
                            setEditingProject({
                              ...editingProject,
                              client_contact_json: {
                                ...editingProject.client_contact_json,
                                street: e.target.value,
                              },
                            })
                          }
                          placeholder="Ex: Av. Paulista"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-bold mb-1">Número *</label>
                        <input
                          type="text"
                          value={editingProject.client_contact_json?.number || ''}
                          onChange={(e) =>
                            setEditingProject({
                              ...editingProject,
                              client_contact_json: {
                                ...editingProject.client_contact_json,
                                number: e.target.value,
                              },
                            })
                          }
                          placeholder="Ex: 1000 ou S/N"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-bold mb-1">Bairro *</label>
                        <input
                          type="text"
                          value={editingProject.client_contact_json?.neighborhood || ''}
                          onChange={(e) =>
                            setEditingProject({
                              ...editingProject,
                              client_contact_json: {
                                ...editingProject.client_contact_json,
                                neighborhood: e.target.value,
                              },
                            })
                          }
                          placeholder="Ex: Bela Vista"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-bold mb-1">Cidade *</label>
                        <input
                          type="text"
                          value={editingProject.client_contact_json?.city || ''}
                          onChange={(e) =>
                            setEditingProject({
                              ...editingProject,
                              client_contact_json: {
                                ...editingProject.client_contact_json,
                                city: e.target.value,
                              },
                            })
                          }
                          placeholder="Ex: São Paulo"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-bold mb-1">Estado (UF) *</label>
                        <input
                          type="text"
                          maxLength={2}
                          value={editingProject.client_contact_json?.state || ''}
                          onChange={(e) =>
                            setEditingProject({
                              ...editingProject,
                              client_contact_json: {
                                ...editingProject.client_contact_json,
                                state: e.target.value.toUpperCase(),
                              },
                            })
                          }
                          placeholder="SP"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono uppercase"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ESCOPO & BRIEFING */}
              {activeFormTab === 'escopo' && (
                <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <h4 className="font-bold text-sm text-[#2E3E4F] dark:text-sky-400 flex items-center gap-2">
                    <Icon icon={MetricQuoteIcon} size={16} />
                    <span>Definição de Escopo e Briefing do Projeto</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold mb-1">Objetivo do Projeto</label>
                      <input
                        type="text"
                        value={editingProject.scope_briefing_json?.objective || ''}
                        onChange={(e) =>
                          setEditingProject({
                            ...editingProject,
                            scope_briefing_json: {
                              ...editingProject.scope_briefing_json,
                              objective: e.target.value,
                            },
                          })
                        }
                        placeholder="Ex: Aumentar conversões em 40%"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1">Público-Alvo</label>
                      <input
                        type="text"
                        value={editingProject.scope_briefing_json?.target_audience || ''}
                        onChange={(e) =>
                          setEditingProject({
                            ...editingProject,
                            scope_briefing_json: {
                              ...editingProject.scope_briefing_json,
                              target_audience: e.target.value,
                            },
                          })
                        }
                        placeholder="Ex: Arquitetos e Designers B2B"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1">Segmento do Mercado</label>
                      <input
                        type="text"
                        value={editingProject.scope_briefing_json?.segment || ''}
                        onChange={(e) =>
                          setEditingProject({
                            ...editingProject,
                            scope_briefing_json: {
                              ...editingProject.scope_briefing_json,
                              segment: e.target.value,
                            },
                          })
                        }
                        placeholder="Ex: Decoração de Interiores"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: LINKS & ARQUIVOS (WITH REAL DRAG AND DROP DROPZONE) */}
              {activeFormTab === 'links_arquivos' && (
                <div className="space-y-6">
                  {/* LINKS SECTION */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                    <h4 className="font-bold text-sm text-[#2E3E4F] dark:text-sky-400 flex items-center gap-2">
                      <Icon icon={LinkActionIcon} size={16} />
                      <span>Links do Projeto (Figma, Drive, Repositórios, Homologação)</span>
                    </h4>

                    {/* ADD LINK INPUTS */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-slate-200">
                      <input
                        type="text"
                        placeholder="Título do Link (Ex: Protótipo Figma)"
                        value={newLink.label}
                        onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
                        className="px-3 py-1.5 rounded-lg border border-slate-200"
                      />
                      <input
                        type="url"
                        placeholder="URL (https://...)"
                        value={newLink.url}
                        onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                        className="px-3 py-1.5 rounded-lg border border-slate-200"
                      />
                      <select
                        value={newLink.category}
                        onChange={(e) => setNewLink({ ...newLink, category: e.target.value })}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                      >
                        <option value="Figma">Figma</option>
                        <option value="Google Drive">Google Drive</option>
                        <option value="Repositório">Repositório GitHub / Git</option>
                        <option value="Homologação">Homologação (Staging)</option>
                        <option value="Produção">Produção</option>
                        <option value="Site de referência">Site de Referência</option>
                        <option value="Outro">Outro</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleAddLink}
                        className="px-4 py-1.5 bg-[#2E3E4F] text-white font-bold rounded-lg hover:bg-[#182331] transition-colors"
                      >
                        Adicionar Link
                      </button>
                    </div>

                    {/* LINKS LIST */}
                    <div className="space-y-2">
                      {editingProject.links?.length === 0 ? (
                        <p className="text-slate-400 italic">Nenhum link cadastrado ainda.</p>
                      ) : (
                        editingProject.links?.map((link) => (
                          <div key={link.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                            <div className="flex items-center gap-3">
                              <Icon icon={LinkActionIcon} size={16} className="text-[#2E3E4F] dark:text-sky-400" />
                              <div>
                                <a href={link.url} target="_blank" rel="noreferrer" className="font-bold text-[#2E3E4F] dark:text-sky-400 hover:underline">
                                  {link.label}
                                </a>
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold ml-2">
                                  {link.category}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveLink(link.id)}
                              className="text-rose-500 hover:text-rose-700 flex items-center justify-center"
                            >
                              <Icon icon={DeleteActionIcon} size={16} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* PRIVATE FILES SECTION WITH DRAG AND DROP */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                      <h4 className="font-bold text-sm text-[#2E3E4F] dark:text-sky-400 flex items-center gap-2">
                        <Icon icon={FileAttachmentStatusIcon} size={16} />
                        <span>Arquivos Privados do Projeto (Upload Drag & Drop)</span>
                      </h4>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-600">Categoria dos Arquivos:</span>
                        <select
                          value={newFileCategory}
                          onChange={(e) => setNewFileCategory(e.target.value as FileCategory)}
                          className="px-3 py-1 rounded-lg border border-slate-200 bg-white font-semibold text-xs"
                        >
                          <option value="Identidade visual">Identidade visual</option>
                          <option value="Imagens">Imagens</option>
                          <option value="Copy">Copy</option>
                          <option value="Documentos">Documentos</option>
                          <option value="Referências">Referências</option>
                          <option value="Contratos">Contratos</option>
                          <option value="Materiais do cliente">Materiais do cliente</option>
                          <option value="Entregas">Entregas</option>
                        </select>
                      </div>
                    </div>

                    {/* INTERACTIVE DRAG AND DROP ZONE */}
                    <div
                      onDragOver={handleDragOverFileDropzone}
                      onDragLeave={handleDragLeaveFileDropzone}
                      onDrop={handleDropFiles}
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3',
                        isDraggingFile
                          ? 'border-[#2E3E4F] bg-[#2E3E4F]/10 scale-[1.01]'
                          : 'border-slate-300 bg-white hover:border-[#2E3E4F] hover:bg-slate-50'
                      )}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileInputChange}
                        className="hidden"
                      />

                      <div className="w-12 h-12 rounded-full bg-[#2E3E4F]/10 text-[#2E3E4F] flex items-center justify-center">
                        <Icon icon={UploadActionIcon} size={24} className="animate-bounce text-[#2E3E4F]" />
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-bold text-[#0C1D36]">
                          Arraste e solte seus arquivos do computador aqui
                        </p>
                        <p className="text-[11px] text-slate-500">
                          ou <span className="text-[#2E3E4F] font-extrabold underline">clique para selecionar do seu dispositivo</span> (PDFs, imagens, ZIPs, docs)
                        </p>
                      </div>

                      <span className="text-[10px] text-slate-400 bg-slate-100 px-3 py-1 rounded-full font-mono font-bold">
                        Bucket Privado client-project-files (URLs assinadas)
                      </span>
                    </div>

                    {/* ATTACHED FILES LIST */}
                    <div className="space-y-2 pt-2">
                      <h5 className="font-bold text-xs text-[#0C1D36]">Arquivos Anexados ({editingProject.files?.length || 0})</h5>
                      {editingProject.files?.length === 0 ? (
                        <p className="text-slate-400 italic">Nenhum arquivo anexado ainda.</p>
                      ) : (
                        editingProject.files?.map((file) => (
                          <div key={file.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-[#2E3E4F]/10 text-[#2E3E4F]">
                                <Icon icon={SuccessStatusIcon} size={16} />
                              </div>
                              <div>
                                <span className="font-bold text-[#0C1D36] block">{file.file_name}</span>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                  <span>{formatFileSize(file.file_size)}</span>
                                  <span>•</span>
                                  <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded font-bold border border-purple-100">
                                    {file.category}
                                  </span>
                                  {file.uploaded_by && (
                                    <>
                                      <span>•</span>
                                      <span>Por {file.uploaded_by}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => notify.info(`Baixando arquivo privado ${file.file_name} via URL assinada segura.`)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 font-bold hover:bg-slate-200 text-xs text-[#2E3E4F]"
                              >
                                <Icon icon={DownloadActionIcon} size={14} className="text-[#2E3E4F]" />
                                Baixar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(file.id)}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 flex items-center justify-center"
                              >
                                <Icon icon={DeleteActionIcon} size={16} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: RESPONSÁVEIS COMBOBOX APERFEIÇOADO */}
              {activeFormTab === 'responsavel' && (
                <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <h4 className="font-bold text-sm text-[#2E3E4F] dark:text-sky-400 flex items-center gap-2">
                    <Icon icon={MetricUserIcon} size={18} />
                    <span>Selecione o Profissional Responsável Principal pelo Projeto</span>
                  </h4>

                  {/* CURRENTLY SELECTED RESPONSIBLE CARD */}
                  {editingProject.responsible_user_name ? (
                    <div className="bg-white p-4 rounded-xl border border-[#2E3E4F]/30 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#081D3A] text-white flex items-center justify-center font-bold text-sm">
                          {editingProject.responsible_user_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-extrabold text-[#0C1D36] text-sm">
                            {editingProject.responsible_user_name}
                          </div>
                          <div className="text-xs text-slate-500">{editingProject.responsible_user_email}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setEditingProject({
                            ...editingProject,
                            responsible_user_id: '',
                            responsible_user_name: '',
                            responsible_user_email: '',
                          })
                        }
                        className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 font-bold hover:bg-rose-100"
                      >
                        Trocar / Limpar Seleção
                      </button>
                    </div>
                  ) : (
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-800 text-xs font-semibold">
                      ⚠️ Nenhum profissional atribuído. O projeto aparecerá como &quot;Sem responsável&quot; para os gestores.
                    </div>
                  )}

                  {/* COMBOBOX SEARCHABLE SELECTOR */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsComboboxOpen(!isComboboxOpen)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-left flex items-center justify-between text-xs font-bold shadow-sm"
                    >
                      <span>Clique para pesquisar ou alterar o responsável...</span>
                      <Icon icon={DownNavIcon} size={16} className="text-slate-400" />
                    </button>

                    {isComboboxOpen && (
                      <div className="absolute top-full left-0 right-0 z-30 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl p-3 space-y-2">
                        <input
                          type="text"
                          value={userSearchText}
                          onChange={(e) => setUserSearchText(e.target.value)}
                          placeholder="Buscar profissional por nome ou e-mail..."
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#2E3E4F]"
                        />

                        <div className="max-h-56 overflow-y-auto space-y-1">
                          {filteredTeamUsers.length === 0 ? (
                            <div className="p-4 text-center text-slate-400 italic">Nenhum profissional ativo encontrado.</div>
                          ) : (
                            filteredTeamUsers.map((u) => (
                              <button
                                key={u.id}
                                type="button"
                                onClick={() => {
                                  setEditingProject({
                                    ...editingProject,
                                    responsible_user_id: u.user_id,
                                    responsible_user_name: u.full_name,
                                    responsible_user_email: u.email,
                                    professional_user_id: u.user_id,
                                    professional_user_name: u.full_name,
                                  })
                                  setIsComboboxOpen(false)
                                }}
                                className={cn(
                                  'w-full p-3 text-left rounded-xl flex items-center justify-between text-xs transition-colors',
                                  editingProject.responsible_user_id === u.user_id
                                    ? 'bg-[#2E3E4F]/10 border border-[#2E3E4F]/30'
                                    : 'hover:bg-slate-50'
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-[#081D3A] text-white flex items-center justify-center font-bold">
                                    {u.full_name.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="font-bold text-[#0C1D36]">{u.full_name}</div>
                                    <div className="text-[11px] text-slate-500">{u.email}</div>
                                  </div>
                                </div>
                                <span className="text-[10px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-bold uppercase">
                                  {u.role_slug}
                                </span>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* COMERCIAL RESPONSÁVEL PELO FECHAMENTO */}
                  <div className="pt-4 border-t border-slate-200/80 space-y-3">
                    <label className="block font-bold text-xs text-[#0C1D36]">
                      Comercial Responsável pelo Fechamento (Gera comissão comercial)
                    </label>

                    <select
                      value={editingProject.commercial_user_id || ''}
                      onChange={(e) => {
                        const selectedUser = teamUsers.find((u) => u.user_id === e.target.value)
                        setEditingProject({
                          ...editingProject,
                          commercial_user_id: e.target.value || undefined,
                          commercial_user_name: selectedUser ? selectedUser.full_name : undefined,
                        })
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-xs outline-none focus:border-[#2E3E4F]"
                    >
                      <option value="">Nenhum comercial vinculado</option>
                      {teamUsers.map((u) => (
                        <option key={u.user_id} value={u.user_id}>
                          {u.full_name} ({u.role_slug || 'Membro'}) - {u.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* TAB 6: PLANEJAMENTO & PRAZO */}
              {activeFormTab === 'planejamento' && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <label className="block font-bold mb-1">Prazo Final Prometido ao Cliente *</label>
                  <input
                    type="date"
                    value={editingProject.deadline || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, deadline: e.target.value })}
                    className="w-full sm:w-1/2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold"
                  />
                </div>
              )}

              {/* TAB 7: OBSERVAÇÕES INTERNAS */}
              {activeFormTab === 'observacoes' && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block font-bold text-sm text-[#0C1D36]">Observações & Notas Internas da Equipe</label>
                  <textarea
                    rows={6}
                    value={editingProject.internal_notes || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, internal_notes: e.target.value })}
                    placeholder="Anotações privadas para a equipe interna de desenvolvimento..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            {(() => {
              const formTabList = [
                { id: 'geral', stepNumber: 1, name: 'Informações Gerais' },
                { id: 'contato', stepNumber: 2, name: 'Informações do cliente' },
                { id: 'escopo', stepNumber: 3, name: 'Escopo & Briefing' },
                { id: 'links_arquivos', stepNumber: 4, name: 'Links & Arquivos' },
                { id: 'responsavel', stepNumber: 5, name: 'Responsáveis' },
                { id: 'planejamento', stepNumber: 6, name: 'Planejamento & Prazo' },
                { id: 'observacoes', stepNumber: 7, name: 'Observações Internas' },
              ]

              const currentTabIdx = formTabList.findIndex((t) => t.id === activeFormTab)
              const isLastTab = currentTabIdx === formTabList.length - 1
              const nextTabInfo = !isLastTab ? formTabList[currentTabIdx + 1] : null
              const prevTabInfo = currentTabIdx > 0 ? formTabList[currentTabIdx - 1] : null

              return (
                <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    {editingProject.id && canDelete ? (
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(editingProject.id!, editingProject.title || 'Projeto')}
                        className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 font-bold hover:bg-rose-100 transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Icon icon={DeleteActionIcon} size={16} />
                        <span>Excluir Projeto</span>
                      </button>
                    ) : (
                      <div className="text-[11px] text-slate-500 font-semibold hidden sm:block">
                        * Preencha as etapas para cadastrar o projeto.
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    {prevTabInfo && (
                      <button
                        type="button"
                        onClick={() => setActiveFormTab(prevTabInfo.id as any)}
                        className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-200 text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Icon icon={BackNavIcon} size={14} />
                        <span>Etapa Anterior</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-200 text-xs cursor-pointer"
                    >
                      Cancelar
                    </button>

                    {isLastTab ? (
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={handleSaveProjectForm}
                        className="px-6 py-2.5 rounded-xl bg-[#2E3E4F] text-white font-bold text-xs hover:bg-[#182331] shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer transition-colors"
                      >
                        <Icon icon={SuccessStatusIcon} size={16} />
                        <span>{isSaving ? 'Salvando no banco...' : 'Salvar Projeto'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (nextTabInfo) {
                            setActiveFormTab(nextTabInfo.id as any)
                          }
                        }}
                        className="px-6 py-2.5 rounded-xl bg-[#2E3E4F] text-white font-bold text-xs hover:bg-[#182331] shadow-md flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <span>Ir para Etapa {nextTabInfo?.stepNumber}: {nextTabInfo?.name}</span>
                        <Icon icon={DownNavIcon} size={14} className="-rotate-90" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* CONTRACT GENERATION OVERLAY SCREEN */}
      {isGeneratingContract && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center p-6 space-y-6 font-sans text-white animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full bg-[#2E3E4F]/20 border border-[#2E3E4F]/40 flex items-center justify-center text-slate-200">
            <Icon icon={PdfActionIcon} size={32} className="animate-bounce text-slate-200" />
          </div>
          <div className="text-center space-y-2 max-w-md">
            <h3 className="text-lg font-extrabold text-white">Processando Contrato em PDF</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{generatingContractMsg}</p>
          </div>
          <div className="w-64 bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#2E3E4F] h-full animate-pulse w-full transition-all duration-700" />
          </div>
        </div>
      )}
    </div>
  )
}
