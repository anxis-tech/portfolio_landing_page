'use client'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { segments, states } from '../schemas/campaign.schema'
import { inputClass, primaryClass } from './shared'
export function CampaignForm({
  disabled,
  busy,
  onCreate,
}: {
  disabled: boolean
  busy: boolean
  onCreate: (data: unknown) => void
}) {
  const [segment, setSegment] = useState('dentist')
  const [volumeMode, setVolumeMode] = useState('50')
  const [customVolume, setCustomVolume] = useState('')

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        const volumeVal =
          volumeMode === 'custom'
            ? Math.floor(Number(customVolume || data.get('customVolume')))
            : Number(volumeMode)

        if (!volumeVal || volumeVal < 1 || isNaN(volumeVal)) {
          return
        }

        onCreate({
          segment: data.get('segment'),
          customSegment: data.get('customSegment') || undefined,
          city: data.get('city'),
          state: data.get('state'),
          volume: volumeVal,
        })
      }}
      className="border-b border-slate-200 pb-5"
    >
      <fieldset disabled={disabled || busy}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5 xl:items-end">
          <label className="flex min-w-0 flex-col gap-1.5 text-xs font-semibold text-slate-700">
              Segmento
              <select
                name="segment"
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className={inputClass}
              >
                {Object.entries(segments).map(([id, v]) => (
                  <option key={id} value={id}>
                    {v.label}
                  </option>
                ))}
              </select>
          </label>
          <label className="flex min-w-0 flex-col gap-1.5 text-xs font-semibold text-slate-700">
              Volume alvo
              <select
                name="volumePreset"
                value={volumeMode}
                onChange={(e) => setVolumeMode(e.target.value)}
                className={inputClass}
              >
                {[10, 20, 50, 100, 200, 500].map((v) => (
                  <option key={v} value={v}>
                    {v} empresas
                  </option>
                ))}
                <option value="custom">Personalizado</option>
              </select>
          </label>
          <label className="flex min-w-0 flex-col gap-1.5 text-xs font-semibold text-slate-700">
            Cidade
            <input
              name="city"
              required
              placeholder="Ex.: Natal"
              minLength={2}
              maxLength={100}
              className={inputClass}
            />
          </label>
          <label className="flex min-w-0 flex-col gap-1.5 text-xs font-semibold text-slate-700">
            Estado
            <select name="state" defaultValue="RN" className={inputClass}>
              {states.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>

          <button type="submit" className={`${primaryClass} w-full xl:min-w-40`}>
            <Plus size={16} />
            Gerar campanha
          </button>
        </div>
        {segment === 'other' && (
          <label className="mt-3 flex max-w-md flex-col gap-1.5 text-xs font-semibold text-slate-700">
            Qual segmento deseja pesquisar?
            <input name="customSegment" required minLength={2} maxLength={80} className={inputClass} />
          </label>
        )}
        {volumeMode === 'custom' && (
          <label className="mt-3 flex max-w-xs flex-col gap-1.5 text-xs font-semibold text-slate-700">
            Quantidade de empresas
            <input
              type="number"
              name="customVolume"
              value={customVolume}
              onChange={(e) => setCustomVolume(e.target.value)}
              min="1"
              step="1"
              required
              placeholder="Ex.: 25"
              className={inputClass}
              autoFocus
            />
          </label>
        )}
      </fieldset>
    </form>
  )
}
