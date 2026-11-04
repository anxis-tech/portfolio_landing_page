'use client'

import { useEffect, useState } from 'react'
import { getFiscalCertificateStatusAction, getFiscalSettingsAction, saveFiscalSettingsAction } from '@/lib/actions/fiscal'

type Section = 'issuer' | 'service'
const issuerFields = [ ['cpf_cnpj','CNPJ'], ['legal_name','Razão social'], ['municipal_registration','Inscrição municipal'], ['municipality_code','Código IBGE do município'], ['email','E-mail'], ['street','Logradouro'], ['number','Número'], ['complement','Complemento'], ['neighborhood','Bairro'], ['city','Cidade'], ['state','UF'], ['cep','CEP'], ['simple_national_option','Opção no Simples Nacional (código fiscal)'], ['special_tax_regime','Regime especial (código fiscal)'] ] as const
const serviceFields = [ ['description','Descrição do serviço'], ['national_tax_code','Código de tributação nacional'], ['municipal_tax_code','Código municipal do serviço'], ['cnae','CNAE'], ['nbs','NBS'], ['municipality_code','Município de prestação (IBGE)'], ['iss_taxation','Tributação do ISS (código fiscal)'], ['iss_withholding','Retenção do ISS (código fiscal)'], ['iss_rate','Alíquota ISS (%)'], ['total_tax_rate','Alíquota total de tributos (%)'] ] as const
const numericFields = new Set(['simple_national_option','special_tax_regime','iss_taxation','iss_withholding','iss_rate','total_tax_rate'])

export function FiscalSettingsTab({ canEdit }: { canEdit: boolean }) {
  const [fields, setFields] = useState<Record<Section, Record<string,string>>>({ issuer: {}, service: {} })
  const [providerMode, setProviderMode] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [credentialsConfigured, setCredentialsConfigured] = useState(false)
  const [certificate, setCertificate] = useState('Não consultado')
  useEffect(() => {
    let active = true
    void getFiscalSettingsAction().then((result) => {
      if (!active) return
      setCredentialsConfigured(result.credentialsConfigured)
      if (result.settings) {
        const strings = (input: object) => Object.fromEntries(Object.entries(input).map(([key,value]) => [key,value == null ? '' : String(value)]))
        setFields({ issuer: strings(result.settings.issuer || {}), service: strings(result.settings.service || {}) })
        setProviderMode(result.settings.service?.provider_mode || '')
      }
      if (!result.success) setMessage(result.message || 'Não foi possível consultar a configuração fiscal.')
    }).catch(() => { if (active) setMessage('Não foi possível consultar a configuração fiscal.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  async function save() {
    setSaving(true)
    const normalize = (section: Section) => Object.fromEntries(Object.entries(fields[section]).filter(([,value]) => value.trim() !== '').map(([key,value]) => [key,numericFields.has(key) ? Number(value) : value.trim()]))
    try {
      const result = await saveFiscalSettingsAction({ id: true, provider: 'fiscal_contora', environment: 'homologation', is_enabled: false, issuer: normalize('issuer'), service: { ...normalize('service'), ...(providerMode ? { provider_mode: providerMode } : {}) } })
      setMessage(result.message || (result.success ? 'Rascunho fiscal salvo.' : 'Não foi possível salvar.'))
    } catch { setMessage('Não foi possível salvar a configuração fiscal.') } finally { setSaving(false) }
  }
  return <div className="max-w-4xl space-y-5 text-xs">
    <div className="border-b border-slate-200 pb-4 dark:border-slate-800"><h2 className="text-lg font-bold">Fiscal</h2><p className="mt-1 text-slate-500">Cadastro da empresa e dos serviços para emissão de NFS-e.</p></div>
    <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800"><strong>Contora · integração ainda não configurada; transmissão indisponível</strong><p>Preencha os códigos e alíquotas conforme orientação contábil. O rascunho pode ser salvo; nenhuma nota será transmitida nesta versão.</p></div>
    {message && <p role="status" className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">{message}</p>}
    {loading ? <p>Carregando cadastro fiscal...</p> : <>
      {(['issuer','service'] as const).map((section) => <section key={section} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#16181D]">
        <h3 className="text-sm font-bold">{section === 'issuer' ? 'Empresa emitente' : 'Serviço'}</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(section === 'issuer' ? issuerFields : serviceFields).map(([key,label]) => <label key={key}><span className="mb-1 block font-bold text-slate-500">{label}</span><input disabled={!canEdit} type={numericFields.has(key) ? 'number' : 'text'} step={numericFields.has(key) ? 'any' : undefined} value={fields[section][key] || ''} onChange={(event) => setFields((current) => ({ ...current, [section]: { ...current[section], [key]: event.target.value } }))} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900" /></label>)}
          {section === 'service' && <label><span className="mb-1 block font-bold text-slate-500">Modelo de emissão</span><select value={providerMode} disabled={!canEdit} onChange={(event) => setProviderMode(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"><option value="">Selecione após confirmar o município</option><option value="padrao">Municipal</option><option value="nacional">Nacional</option></select></label>}
        </div>
      </section>)}
      <p className="rounded-xl border border-slate-200 p-4 font-semibold text-slate-500 dark:border-slate-700">Integração ainda não configurada. Transmissão de notas indisponível.</p>
      <div className="space-y-2 rounded-xl border border-slate-200 p-4 dark:border-slate-700"><p>Integração Contora: {credentialsConfigured ? 'Credenciais configuradas no servidor' : 'Credenciais ainda não configuradas'}</p><p>Certificado: {certificate}</p><button type="button" onClick={async () => { try { const result = await getFiscalCertificateStatusAction(); setCertificate(result.message || ({ valid: 'Válido', expired: 'Expirado', missing: 'Ausente', unconfigured: 'Não configurado' }[result.status])); } catch { setCertificate('Consulta indisponível') } }} className="rounded-lg border border-slate-300 px-3 py-2 font-bold">Consultar certificado</button></div>
      {canEdit && <button type="button" disabled={saving} onClick={() => void save()} className="rounded-xl bg-[#2E3E4F] px-4 py-2.5 font-bold text-white disabled:opacity-50">{saving ? 'Salvando...' : 'Salvar rascunho'}</button>}
    </>}
  </div>
}
