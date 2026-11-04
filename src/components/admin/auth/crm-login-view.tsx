'use client'

import React, { useState } from 'react'
import { AnxisLogo } from '@/components/ui/anxis-logo'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Mail01Icon,
  LockIcon,
  ArrowRight01Icon,
  Shield01Icon,
  Loading01Icon,
  CheckmarkCircle01Icon,
} from '@hugeicons/core-free-icons'

interface CRMLoginViewProps {
  onSuccessLogin: () => void
  isDarkMode?: boolean
}

export function CRMLoginView({ onSuccessLogin }: CRMLoginViewProps) {
  const [email, setEmail] = useState('mateus@logoipsum.dev')
  const [password, setPassword] = useState('••••••••••••')
  const [loading, setLoading] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    setTimeout(() => {
      setLoading(false)
      setIsTransitioning(true)
      setTimeout(() => {
        onSuccessLogin()
      }, 700)
    }, 600)
  }

  // TRANSITION OVERLAY BEFORE ENTERING CRM
  if (isTransitioning) {
    return (
      <div className="fixed inset-0 z-50 bg-[#081D3A] text-white flex flex-col items-center justify-center p-6 space-y-6 font-sans overflow-hidden animate-in fade-in duration-300">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#0075FF]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-center py-4 animate-pulse">
          <AnxisLogo size="lg" theme="dark" variant="crm" className="scale-125 sm:scale-150" />
        </div>

        <div className="flex flex-col items-center gap-3 bg-[#0B2F63]/80 border border-[#BBC4D1]/20 p-6 rounded-3xl shadow-2xl backdrop-blur-md max-w-sm w-full text-center">
          <div className="w-12 h-12 rounded-full bg-[#0075FF]/20 border border-[#0075FF]/40 flex items-center justify-center text-[#168CFF]">
            <HugeiconsIcon icon={Loading01Icon} className="w-6 h-6 animate-spin text-[#0075FF]" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center justify-center gap-1.5">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
              <span>Login efetuado com sucesso!</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1">Carregando permissões e dados do painel...</p>
          </div>

          <div className="w-full bg-[#081D3A] h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-[#0075FF] h-full animate-pulse w-full transition-all duration-700 ease-out" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-[#081D3A] text-white flex items-center justify-center p-4 font-sans select-none">
      <div className="w-full max-w-md bg-[#0B2F63] border border-[#BBC4D1]/20 rounded-3xl p-8 shadow-2xl space-y-7 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#0075FF]/20 rounded-full blur-2xl pointer-events-none" />

        {/* LOGO & TITLE */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <AnxisLogo size="lg" theme="dark" variant="crm" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0075FF]/20 text-[#38bdf8] text-[11px] font-bold">
            <HugeiconsIcon icon={Shield01Icon} className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>PAINEL ADMINISTRATIVO RESTRITO</span>
          </div>
          <p className="text-xs text-slate-300">
            Ambiente demonstrativo corporativo com acesso liberado.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              E-mail de Acesso
            </label>
            <div className="relative">
              <HugeiconsIcon
                icon={Mail01Icon}
                className="w-5 h-5 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400"
                strokeWidth={1.5}
              />
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@logoipsum.dev"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#081D3A] border border-slate-700 text-white placeholder-slate-500 focus:border-[#0075FF] focus:ring-2 focus:ring-[#0075FF]/20 text-sm outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Senha de Acesso
            </label>
            <div className="relative">
              <HugeiconsIcon
                icon={LockIcon}
                className="w-5 h-5 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400"
                strokeWidth={1.5}
              />
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#081D3A] border border-slate-700 text-white placeholder-slate-500 focus:border-[#0075FF] focus:ring-2 focus:ring-[#0075FF]/20 text-sm outline-none transition-all"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-[#0075FF] hover:bg-[#168CFF] shadow-lg transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <HugeiconsIcon icon={Loading01Icon} className="w-4 h-4 mr-2 animate-spin" strokeWidth={1.5} />
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                <span>Acessar Painel CRM</span>
                <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 ml-2" strokeWidth={1.5} />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-[11px] text-slate-400 pt-2 border-t border-slate-800">
          <span>Demonstração de autenticação e proteção RBAC.</span>
        </div>
      </div>
    </div>
  )
}
