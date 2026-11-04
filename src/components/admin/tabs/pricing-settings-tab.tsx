'use client'

import { useEffect, useState } from 'react'
import { getPricingSettingsAction, savePricingSettingsAction } from '@/lib/actions/quotes'
import { Icon } from '@/components/ui/icon'
import { ConfigActionIcon, SaveActionIcon } from '@/lib/icons/actions'
import { CONTENT_COPY_OPTIONS, STRICT_PROJECT_TYPES, URGENCY_OPTIONS } from '@/lib/validations/quote-schema'
import { DEFAULT_PRICING_CONFIG } from '@/lib/utils/pricing-calculator'
import { cn } from '@/lib/utils'
import type { PricingConfig } from '@/types/pricing.types'

export function PricingSettingsTab({ isDarkMode = false }: { isDarkMode?: boolean }) {
  const [config, setConfig] = useState<PricingConfig>(DEFAULT_PRICING_CONFIG)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void getPricingSettingsAction().then((saved) => {
      if (!active) return
      if (saved) {
        setConfig({
          ...DEFAULT_PRICING_CONFIG,
          ...saved,
          baseRates: { ...DEFAULT_PRICING_CONFIG.baseRates, ...(saved.baseRates || {}) },
          contentRates: { ...DEFAULT_PRICING_CONFIG.contentRates, ...(saved.contentRates || {}) },
          urgencyMultipliers: { ...DEFAULT_PRICING_CONFIG.urgencyMultipliers, ...(saved.urgencyMultipliers || {}) },
        })
      }
      setIsLoading(false)
    })
    return () => { active = false }
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setFeedback(null)
    const result = await savePricingSettingsAction(config)
    setIsSaving(false)
    if (!result.success) {
      setError(result.message || 'Não foi possível salvar as regras de precificação.')
      return
    }
    setFeedback('Regras publicadas. Novos cálculos passam a usar esta versão.')
  }

  const cardClass = cn(
    'rounded-2xl border p-5 shadow-sm',
    isDarkMode ? 'border-slate-800 bg-[#16181D]' : 'border-slate-200 bg-white'
  )
  const inputClass = cn(
    'w-full rounded-xl border px-3 py-2.5 text-sm font-bold outline-none transition-colors',
    isDarkMode
      ? 'border-slate-700 bg-[#1A1E26] text-white focus:border-sky-500'
      : 'border-slate-200 bg-white text-[#172235] focus:border-[#2E3E4F]'
  )

  if (isLoading) {
    return <div className={cn(cardClass, 'text-sm text-slate-500')}>Carregando regras ativas…</div>
  }

  return (
    <div className={cn('space-y-5', isDarkMode ? 'text-white' : 'text-[#172235]')}>
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Icon icon={ConfigActionIcon} size={18} className="text-[#2E3E4F] dark:text-sky-400" />
            <h2 className="text-xl font-extrabold">Regras de Precificação</h2>
          </div>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 dark:text-slate-400">
            Valores-base, adicionais e multiplicadores usados pela calculadora. Cada salvamento cria uma nova versão no histórico.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2E3E4F] px-4 py-2.5 text-xs font-extrabold text-white hover:bg-[#182331] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon icon={SaveActionIcon} size={16} />
          {isSaving ? 'Salvando…' : 'Salvar nova versão'}
        </button>
      </header>

      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700">{error}</p>}
      {feedback && <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-700">{feedback}</p>}

      <section className={cardClass}>
        <h3 className="text-sm font-extrabold">Valores-base por tipo de projeto</h3>
        <p className="mt-1 text-xs text-slate-500">A base já contempla as páginas padrão exibidas na calculadora.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {STRICT_PROJECT_TYPES.map((type) => (
            <NumberField
              key={type}
              label={type}
              value={config.baseRates[type] || 0}
              inputClass={inputClass}
              onChange={(value) => setConfig((current) => ({
                ...current,
                baseRates: { ...current.baseRates, [type]: value },
              }))}
            />
          ))}
        </div>
      </section>

      <section className={cardClass}>
        <h3 className="text-sm font-extrabold">Adicionais</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <NumberField label="Página adicional" value={config.perAdditionalPageRate} inputClass={inputClass} onChange={(value) => setConfig((current) => ({ ...current, perAdditionalPageRate: value }))} />
          <NumberField label="Código personalizado" value={config.customCodeRate} inputClass={inputClass} onChange={(value) => setConfig((current) => ({ ...current, customCodeRate: value }))} />
          <NumberField label="Módulo de blog" value={config.blogModuleRate} inputClass={inputClass} onChange={(value) => setConfig((current) => ({ ...current, blogModuleRate: value }))} />
          <NumberField label="Margem padrão (%)" value={config.defaultMarginPercent} inputClass={inputClass} onChange={(value) => setConfig((current) => ({ ...current, defaultMarginPercent: value }))} />
        </div>
      </section>

      <section className={cardClass}>
        <h3 className="text-sm font-extrabold">Conteúdo e copy</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {CONTENT_COPY_OPTIONS.map((option) => (
            <NumberField key={option} label={option} value={config.contentRates[option]} inputClass={inputClass} onChange={(value) => setConfig((current) => ({ ...current, contentRates: { ...current.contentRates, [option]: value } }))} />
          ))}
        </div>
      </section>

      <section className={cardClass}>
        <h3 className="text-sm font-extrabold">Multiplicadores de urgência</h3>
        <p className="mt-1 text-xs text-slate-500">Use 1 para não alterar o valor, 1,3 para acréscimo de 30% e assim por diante.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {URGENCY_OPTIONS.map((option) => (
            <NumberField key={option} label={option} value={config.urgencyMultipliers[option]} step="0.05" inputClass={inputClass} onChange={(value) => setConfig((current) => ({ ...current, urgencyMultipliers: { ...current.urgencyMultipliers, [option]: value } }))} />
          ))}
        </div>
      </section>
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
  inputClass,
  step = '1',
}: {
  label: string
  value: number
  onChange: (value: number) => void
  inputClass: string
  step?: string
}) {
  return (
    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
      <span className="mb-1.5 block">{label}</span>
      <input
        type="number"
        min="0"
        step={step}
        value={value}
        onChange={(event) => onChange(Math.max(0, Number(event.target.value)))}
        className={inputClass}
      />
    </label>
  )
}
