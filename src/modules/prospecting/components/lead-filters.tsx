'use client'
import { Filter, Flame, RotateCcw, Snowflake } from 'lucide-react'
import type { LeadFilters } from '../schemas/lead.schema'
import { segments, states } from '../schemas/campaign.schema'
import { buttonClass, inputClass, opportunityLabels } from './shared'
const quickFilters = [
  ['hot', 'Quente'],
  ['cold', 'Frio'],
  ['none', 'Sem site'],
] as const
export function LeadFiltersPanel({
  filters,
  onChange,
}: {
  filters: LeadFilters
  onChange: (filters: LeadFilters) => void
}) {
  return (
    <section aria-label="Filtros de leads" className="border-b border-slate-200 pb-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {quickFilters.map(([value, label]) => (
            <button
              key={value}
              aria-pressed={filters.quick === value}
              onClick={() =>
                onChange({
                  ...filters,
                  page: 1,
                  classification: value === 'hot' || value === 'cold' ? undefined : filters.classification,
                  quick: filters.quick === value ? undefined : value,
                })
              }
              className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                value === 'hot'
                  ? filters.quick === value
                    ? 'border-amber-300 bg-amber-100 text-orange-800 font-semibold'
                    : 'border-amber-200 bg-amber-50 text-orange-700 hover:bg-amber-100'
                  : value === 'cold'
                    ? filters.quick === value
                      ? 'border-sky-300 bg-sky-100 text-sky-800 font-semibold'
                      : 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100'
                    : filters.quick === value
                      ? 'border-[#233141]/30 bg-[#233141]/10 text-[#182331] font-semibold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {value === 'hot' && <Flame size={13} aria-hidden="true" />}
              {value === 'cold' && <Snowflake size={13} aria-hidden="true" />}
              {label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <details className="relative">
            <summary
              title="Filtros avançados"
              aria-label="Filtros avançados"
              className="flex min-h-10 cursor-pointer list-none items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-slate-600 hover:bg-slate-50 [&::-webkit-details-marker]:hidden"
            >
              <Filter size={16} />
            </summary>
        <form
          key={JSON.stringify(filters)}
          onSubmit={(event) => {
            event.preventDefault()
            const entries = [...new FormData(event.currentTarget).entries()].filter(
              ([, value]) => value !== ''
            )
            const values = Object.fromEntries(entries)
            onChange({
              campaignId: filters.campaignId,
              page: 1,
              sort: filters.sort,
              quick: values.classification && (filters.quick === 'hot' || filters.quick === 'cold')
                ? undefined
                : filters.quick,
              ...values,
            } as LeadFilters)
          }}
          className="absolute right-0 z-20 mt-2 grid w-[min(92vw,52rem)] grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-[#FDFDFD] p-4 shadow-sm md:grid-cols-4 xl:grid-cols-7"
        >
          <Field label="Classificação">
            <select
              name="classification"
              defaultValue={filters.classification ?? ''}
              className={inputClass}
            >
              <option value="">Todas</option>
              <option value="hot">Quente</option>
              <option value="cold">Frio</option>
            </select>
          </Field>
          <Field label="Oportunidade">
            <select
              name="opportunity"
              defaultValue={filters.opportunity ?? ''}
              className={inputClass}
            >
              <option value="">Todas</option>
              {Object.entries(opportunityLabels).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Segmento">
            <select name="segment" defaultValue={filters.segment ?? ''} className={inputClass}>
              <option value="">Todos</option>
              {Object.entries(segments).map(([v, s]) => (
                <option key={v} value={v}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Cidade">
            <input name="city" maxLength={100} defaultValue={filters.city} className={inputClass} />
          </Field>
          <Field label="Estado">
            <select name="state" defaultValue={filters.state ?? ''} className={inputClass}>
              <option value="">Todos</option>
              {states.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="Website">
            <select name="website" defaultValue={filters.website ?? ''} className={inputClass}>
              <option value="">Todos</option>
              <option value="yes">Possui site</option>
              <option value="none">Sem site</option>
              <option value="social">Somente social</option>
            </select>
          </Field>
          <Field label="Rating mínimo">
            <input
              name="minRating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              defaultValue={filters.minRating}
              className={inputClass}
            />
          </Field>
          <Field label="Avaliações mínimas">
            <input
              name="minReviews"
              type="number"
              min="0"
              defaultValue={filters.minReviews}
              className={inputClass}
            />
          </Field>
          <Field label="Descoberto a partir de">
            <input name="since" type="date" defaultValue={filters.since} className={inputClass} />
          </Field>
          <div className="flex items-end gap-2">
            <button className={buttonClass}>Aplicar</button>
            <button
              type="reset"
              title="Limpar filtros"
              aria-label="Limpar filtros"
              onClick={() => onChange({ campaignId: filters.campaignId, page: 1, sort: 'classification' })}
              className={buttonClass}
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </form>
          </details>
          <label className="sr-only" htmlFor="lead-sort">
            Ordenar leads
          </label>
          <select
            id="lead-sort"
            value={filters.sort}
            onChange={(event) =>
              onChange({ ...filters, page: 1, sort: event.target.value as LeadFilters['sort'] })
            }
            className={`${inputClass} min-h-10 w-32 text-xs`}
          >
            <option value="classification">Quentes primeiro</option>
            <option value="reviews">Mais avaliações</option>
            <option value="rating">Maior rating</option>
            <option value="performance">Pior performance</option>
            <option value="recent">Mais recente</option>
          </select>
        </div>
      </div>
    </section>
  )
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1 text-xs text-slate-600">
      {label}
      {children}
    </label>
  )
}
