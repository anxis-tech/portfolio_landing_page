'use client'

import { notify } from '@/components/admin/ui/notifications'

import { useState } from 'react'
import { Project } from '@/types/database.types'
import { Icon } from '@/components/ui/icon'
import { PortfolioNavIcon } from '@/lib/icons/navigation'
import {
  AddActionIcon,
  EditActionIcon,
  DeleteActionIcon,
  ViewActionIcon,
  HideActionIcon,
  SearchActionIcon,
  StarActionIcon,
  CancelActionIcon,
} from '@/lib/icons/actions'
import { cn } from '@/lib/utils'
import { saveHomeProjectAction, deleteHomeProjectAction } from '@/lib/actions/projects'

interface HomePortfolioTabProps {
  projects: Project[]
  onUpdateProjects: (updated: Project[]) => void
  canEdit: boolean
  canDelete: boolean
  canCreate: boolean
  isDarkMode?: boolean
}

export function HomePortfolioTab({
  projects = [],
  onUpdateProjects,
  canEdit = true,
  canDelete = true,
  canCreate = true,
  isDarkMode = false,
}: HomePortfolioTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.client?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'todos' || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleToggleVisibility = (id: string) => {
    if (!canEdit) return
    const updated = projects.map((p) => (p.id === id ? { ...p, is_visible: !p.is_visible } : p))
    onUpdateProjects(updated)
  }

  const handleToggleFeatured = (id: string) => {
    if (!canEdit) return
    const updated = projects.map((p) => (p.id === id ? { ...p, is_featured: !p.is_featured } : p))
    onUpdateProjects(updated)
  }

  const handleSaveModal = async () => {
    if (!editingProject?.title) {
      notify.error('Preencha o título do projeto.')
      return
    }

    const payload: Project = {
      id: editingProject.id || `proj-${Date.now()}`,
      title: editingProject.title || '',
      category: (editingProject.category as any) || 'institucional',
      client: editingProject.client || '',
      year: editingProject.year || '2026',
      short_description: editingProject.short_description || '',
      full_description: editingProject.full_description || '',
      desktop_image_url: editingProject.desktop_image_url || '/images/hero-desktop.webp',
      mobile_image_url: editingProject.mobile_image_url || '/images/hero-mobile.webp',
      project_url: editingProject.project_url || '',
      technologies: editingProject.technologies || ['Next.js'],
      is_visible: editingProject.is_visible !== undefined ? editingProject.is_visible : true,
      is_featured: editingProject.is_featured !== undefined ? editingProject.is_featured : false,
      display_order: editingProject.display_order || 1,
      created_at: editingProject.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    await saveHomeProjectAction(payload)

    if (editingProject.id) {
      onUpdateProjects(projects.map((p) => (p.id === payload.id ? payload : p)))
    } else {
      onUpdateProjects([payload, ...projects])
    }

    setIsModalOpen(false)
    setEditingProject(null)
  }

  const handleDeleteProject = async (id: string) => {
    if (!canDelete) return
    if (!confirm('Deseja excluir este projeto do portfólio público?')) return

    await deleteHomeProjectAction(id)
    onUpdateProjects(projects.filter((p) => p.id !== id))
  }

  return (
    <div className={cn('space-y-6 max-w-full overflow-hidden font-sans transition-colors', isDarkMode ? 'text-white' : 'text-slate-900')}>
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={cn('text-xl font-bold tracking-tight', isDarkMode ? 'text-white' : 'text-slate-900')}>
            Portfólio da Home
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Gerenciamento dos cases e projetos em destaque na página inicial.
          </p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={() => {
              setEditingProject({
                category: 'institucional',
                is_visible: true,
                is_featured: false,
                technologies: ['Next.js', 'Tailwind CSS'],
              })
              setIsModalOpen(true)
            }}
            className="h-8 px-3 rounded-lg text-xs font-medium text-white bg-[#2E3E4F] hover:bg-[#182331] shadow-2xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Icon icon={AddActionIcon} size={15} />
            <span>Adicionar Case</span>
          </button>
        )}
      </div>

      {/* FILTERS & SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400">
            <Icon icon={SearchActionIcon} size={15} />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou cliente..."
            className={cn(
              'w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs outline-none transition-colors',
              isDarkMode
                ? 'bg-[#1A1E26] border-slate-700 text-white placeholder:text-slate-500 focus:border-[#2E3E4F]'
                : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#2E3E4F]'
            )}
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['todos', 'institucional', 'e-commerce', 'landing-page', 'personalizado'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors whitespace-nowrap cursor-pointer border',
                selectedCategory === cat
                  ? 'bg-white dark:bg-[#202530] text-slate-900 dark:text-white shadow-2xs font-semibold border-slate-300 dark:border-slate-700'
                  : isDarkMode
                    ? 'bg-[#1A1E26] text-slate-400 hover:text-white border-slate-800'
                    : 'bg-slate-100/80 text-slate-600 hover:text-slate-900 border-slate-200/60'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* PROJECT LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((project) => (
          <div
            key={project.id}
            className={cn(
              'border rounded-xl p-4 flex flex-col justify-between space-y-3.5 shadow-2xs hover:shadow-xs transition-all',
              isDarkMode
                ? 'bg-[#16181D] border-slate-800'
                : 'bg-white border-slate-200/80'
            )}
          >
            <div className="space-y-3">
              {/* IMAGE PREVIEW */}
              <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <img
                  src={project.desktop_image_url}
                  alt={project.title}
                  className="w-full h-full object-cover object-top"
                />
                <span className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded">
                  {project.category}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className={cn('text-sm font-semibold', isDarkMode ? 'text-white' : 'text-slate-900')}>{project.title}</h3>
                  {project.is_featured && (
                    <span className="text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 font-medium px-2 py-0.5 rounded flex items-center gap-1">
                      <Icon icon={StarActionIcon} size={11} /> Destaque
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{project.short_description}</p>
              </div>
            </div>

            {/* CARD ACTIONS */}
            <div className={cn('flex items-center justify-between pt-2.5 border-t text-xs', isDarkMode ? 'border-slate-800' : 'border-slate-100')}>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleToggleVisibility(project.id)}
                  className={cn(
                    'p-1.5 rounded-md transition-colors cursor-pointer border',
                    project.is_visible
                      ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                      : 'text-slate-400 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  )}
                  title={project.is_visible ? 'Visível na Home' : 'Oculto na Home'}
                >
                  <Icon icon={project.is_visible ? ViewActionIcon : HideActionIcon} size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleFeatured(project.id)}
                  className={cn(
                    'p-1.5 rounded-md transition-colors cursor-pointer border',
                    project.is_featured
                      ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
                      : 'text-slate-400 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  )}
                  title={project.is_featured ? 'Remover Destaque' : 'Marcar Destaque'}
                >
                  <Icon icon={StarActionIcon} size={15} />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProject(project)
                      setIsModalOpen(true)
                    }}
                    className={cn(
                      'p-1.5 rounded-md transition-colors cursor-pointer border',
                      isDarkMode
                        ? 'bg-[#1C202B] border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    )}
                    title="Editar Projeto"
                  >
                    <Icon icon={EditActionIcon} size={15} />
                  </button>
                )}

                {canDelete && (
                  <button
                    type="button"
                    onClick={() => handleDeleteProject(project.id)}
                    className={cn(
                      'p-1.5 rounded-md transition-colors cursor-pointer border',
                      isDarkMode
                        ? 'bg-rose-950/30 border-rose-900/50 text-rose-400 hover:bg-rose-900/50'
                        : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                    )}
                    title="Excluir Projeto"
                  >
                    <Icon icon={DeleteActionIcon} size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT / CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={cn(
              'w-full max-w-xl rounded-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto border',
              isDarkMode ? 'bg-[#16181D] text-white border-slate-800' : 'bg-white text-[#0C1D36] border-slate-200'
            )}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-700">
              <h3 className="text-lg font-bold">
                {editingProject?.id ? 'Editar Case da Home' : 'Novo Case para a Home'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-700 text-slate-400"
              >
                <Icon icon={CancelActionIcon} size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Título do Projeto</label>
                <input
                  type="text"
                  value={editingProject?.title || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                  placeholder="Ex: E-commerce Nike Brasil"
                  className={cn(
                    'w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none',
                    isDarkMode ? 'bg-[#1A1E26] border-slate-700 text-white' : 'bg-white border-slate-200 text-[#0C1D36]'
                  )}
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Categoria</label>
                <select
                  value={editingProject?.category || 'institucional'}
                  onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value as any })}
                  className={cn(
                    'w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none',
                    isDarkMode ? 'bg-[#1A1E26] border-slate-700 text-white' : 'bg-white border-slate-200 text-[#0C1D36]'
                  )}
                >
                  <option value="institucional">Institucional</option>
                  <option value="e-commerce">E-commerce</option>
                  <option value="landing-page">Landing Page</option>
                  <option value="personalizado">Personalizado</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Descrição Curta</label>
                <textarea
                  rows={3}
                  value={editingProject?.short_description || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, short_description: e.target.value })}
                  placeholder="Resumo do projeto para o card público..."
                  className={cn(
                    'w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none',
                    isDarkMode ? 'bg-[#1A1E26] border-slate-700 text-white' : 'bg-white border-slate-200 text-[#0C1D36]'
                  )}
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">URL da Imagem Desktop</label>
                <input
                  type="text"
                  value={editingProject?.desktop_image_url || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, desktop_image_url: e.target.value })}
                  placeholder="/images/hero-desktop.webp ou https://..."
                  className={cn(
                    'w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none',
                    isDarkMode ? 'bg-[#1A1E26] border-slate-700 text-white' : 'bg-white border-slate-200 text-[#0C1D36]'
                  )}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-700 text-slate-200 hover:bg-slate-600"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#2E3E4F] hover:bg-[#182331] shadow-md transition-colors"
              >
                Salvar Case
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
