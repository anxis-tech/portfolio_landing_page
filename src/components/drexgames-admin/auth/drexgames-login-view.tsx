"use client";

import React, { useState } from "react";
import { ArrowRight, Eye, EyeOff, Gamepad2, ShieldCheck, Loader2 } from "lucide-react";

interface DrexLoginViewProps {
  onSuccessLogin: () => void;
}

export function DrexLoginView({ onSuccessLogin }: DrexLoginViewProps) {
  const [email, setEmail] = useState("admin@drexgames.com.br");
  const [password, setPassword] = useState("DrexGames@2026MasterKey!");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSuccessLogin();
    }, 600);
  };

  return (
    <div className="admin-auth">
      {/* Coluna Visual e Institucional Oficial da DrexGames */}
      <aside className="admin-auth-story select-none">
        <div className="admin-brand">
          <Gamepad2 size={32} />
          <span>
            DREX<strong>GAMES</strong>
            <small>ADMINISTRAÇÃO</small>
          </span>
        </div>

        <div className="admin-auth-copy">
          <span className="admin-eyebrow">NOS BASTIDORES DO PLAY</span>
          <h2>
            Uma visão clara.
            <br />
            Uma operação
            <br />
            <em>no controle.</em>
          </h2>
          <p>Consulte o catálogo de jogos, faturamento e acompanhe a entrega de chaves digitais.</p>
        </div>

        <span className="admin-auth-security">
          <ShieldCheck size={18} /> Acesso exclusivo para a equipe autorizada
        </span>
      </aside>

      {/* Formulário de Login */}
      <main id="admin-content" className="admin-auth-main">
        <div className="admin-auth-card">
          <span className="admin-eyebrow">BEM-VINDO À ADMINISTRAÇÃO</span>
          <h1 className="text-xl font-bold text-neutral-900 mt-1 mb-2">Acesse seu painel</h1>
          <p className="text-xs text-neutral-500 mb-6">
            Entre com seu e-mail e senha de administrador para acessar a operação da loja.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="admin-field">
              E-mail de acesso
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@drexgames.com.br"
                className="admin-field"
              />
            </label>

            <label className="admin-field">
              Senha
              <div className="admin-password">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha administrativa"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="admin-button admin-full cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Entrar no painel</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <p className="text-[11px] text-neutral-400 text-center mt-6">
            Ambiente demonstrativo corporativo com autenticação protegida.
          </p>
        </div>

        <span className="admin-store-link">Drex Games E-commerce Platform</span>
      </main>
    </div>
  );
}
