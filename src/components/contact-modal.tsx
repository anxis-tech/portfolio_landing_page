"use client";

import React, { useState } from "react";
import { X, Mail, MessageCircle, Send, Check, Copy } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    projectType: "Landing Page",
    message: "",
  });

  if (!isOpen) return null;

  const emailAddress = "contato@lucasalmeida.dev";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailAddress);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#252525]/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-[#FFFFFF] border border-[#E7E1DB] rounded-2xl shadow-xl p-6 sm:p-8 text-[#252525] space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#73706C] hover:text-[#252525] hover:bg-[#F7F4F0] transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pr-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#C96A4A]">
            Solicitar Orçamento
          </span>
          <h3 className="text-2xl font-bold tracking-tight text-[#252525]">
            Vamos criar algo incrível juntos?
          </h3>
          <p className="text-sm text-[#73706C] leading-relaxed">
            Preencha o formulário abaixo ou utilize um dos canais diretos para conversarmos sobre o seu projeto.
          </p>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3 bg-[#F7F4F0] rounded-xl p-6 border border-[#E7E1DB]">
            <div className="w-12 h-12 rounded-full bg-[#C96A4A]/10 text-[#C96A4A] flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-semibold text-[#252525]">Mensagem enviada com sucesso!</h4>
            <p className="text-sm text-[#73706C]">
              Obrigado pelo contato. Retornarei em até 24 horas úteis.
            </p>
          </div>
        ) : (
          <>
            {/* Quick Contact Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyEmail}
                className="flex items-center justify-between p-3 rounded-xl border border-[#E7E1DB] bg-[#F7F4F0] hover:border-[#C96A4A] transition-all text-left group"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <Mail className="w-4 h-4 text-[#C96A4A] shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-semibold text-[#252525]">Copiar E-mail</p>
                    <p className="text-[11px] text-[#73706C] truncate">{emailAddress}</p>
                  </div>
                </div>
                {copiedEmail ? (
                  <Check className="w-4 h-4 text-green-600 shrink-0" />
                ) : (
                  <Copy className="w-4 h-4 text-[#73706C] group-hover:text-[#C96A4A] shrink-0 transition-colors" />
                )}
              </button>

              <a
                href="https://wa.me/5500000000000?text=Ol%C3%A1%2C%20gostaria%20de%20solicitar%20um%20or%C3%A7amento."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 rounded-xl border border-[#E7E1DB] bg-[#F7F4F0] hover:border-[#C96A4A] transition-all text-left"
              >
                <MessageCircle className="w-4 h-4 text-[#C96A4A] shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-[#252525]">Conversar no WhatsApp</p>
                  <p className="text-[11px] text-[#73706C]">Resposta rápida</p>
                </div>
              </a>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E7E1DB]" />
              </div>
              <span className="relative px-3 bg-[#FFFFFF] text-[11px] font-semibold uppercase tracking-wider text-[#73706C]">
                ou envie os detalhes
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#73706C] mb-1">
                  Seu Nome
                </label>
                <input
                  type="text"
                  required
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E1DB] bg-[#F7F4F0] text-sm text-[#252525] focus:outline-none focus:border-[#C96A4A] transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#73706C] mb-1">
                    Seu E-mail
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="email@exemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E1DB] bg-[#F7F4F0] text-sm text-[#252525] focus:outline-none focus:border-[#C96A4A] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#73706C] mb-1">
                    Tipo de Projeto
                  </label>
                  <select
                    value={formData.projectType}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E1DB] bg-[#F7F4F0] text-sm text-[#252525] focus:outline-none focus:border-[#C96A4A] transition-colors"
                  >
                    <option value="Landing Page">Landing Page</option>
                    <option value="Site Institucional">Site Institucional</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="UI Design">UI Design</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#73706C] mb-1">
                  Resumo do Projeto
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Descreva brevemente seus objetivos, prazos ou expectativas..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E1DB] bg-[#F7F4F0] text-sm text-[#252525] focus:outline-none focus:border-[#C96A4A] transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-5 rounded-xl bg-[#C96A4A] hover:bg-[#B25638] text-[#FFFFFF] font-semibold text-sm tracking-wide transition-all shadow-xs flex items-center justify-center space-x-2"
              >
                <span>Enviar Solicitação</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
