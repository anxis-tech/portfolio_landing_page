import React from "react";
import { LayoutTemplate, Rocket, Workflow, Plug, ArrowUpRight } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";

const services = [
  {
    icon: Rocket,
    title: "Landing pages de conversão",
    outcome: "Mais leads e vendas a partir do mesmo tráfego.",
    points: ["Copy e hierarquia orientadas à ação", "Carregamento rápido e SEO técnico", "Rastreamento de conversões"],
  },
  {
    icon: LayoutTemplate,
    title: "Sites institucionais & e-commerce",
    outcome: "Uma marca que transmite confiança no primeiro clique.",
    points: ["Direção visual autoral", "Painel fácil de atualizar", "Responsivo do celular ao desktop"],
  },
  {
    icon: Workflow,
    title: "Sistemas web, CRM & dashboards",
    outcome: "Processos internos organizados e menos trabalho manual.",
    points: ["Pipelines, permissões e relatórios", "Feito sob medida para sua operação", "Escalável conforme você cresce"],
  },
  {
    icon: Plug,
    title: "Integrações & automações",
    outcome: "Suas ferramentas conversando entre si, sem retrabalho.",
    points: ["WhatsApp, pagamentos e APIs", "Sincronização em tempo real", "Automação de rotinas"],
  },
];

const steps = [
  { n: "01", title: "Diagnóstico", desc: "Entendo seu negócio, público e objetivo antes de desenhar qualquer tela." },
  { n: "02", title: "Proposta & design", desc: "Escopo claro, prazo definido e layout aprovado por você." },
  { n: "03", title: "Desenvolvimento", desc: "Código de alto padrão com acompanhamento e prévias durante o processo." },
  { n: "04", title: "Entrega & suporte", desc: "Publicação, ajustes finos e suporte após o lançamento." },
];

export function ServicesProcess() {
  return (
    <section id="servicos" className="pt-16 sm:pt-20 pb-16 px-6 sm:px-10 lg:px-14">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-[#d8ff7c] border border-black/20" />
        <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400 font-mono">
          Como posso ajudar
        </span>
      </div>
      <h2 className="font-serif-editorial text-2xl sm:text-3xl lg:text-4xl text-neutral-950 font-normal tracking-tight leading-tight max-w-3xl">
        Soluções digitais pensadas para <span className="italic">gerar resultado</span>, não só para ficarem bonitas.
      </h2>

      {/* Grade de serviços */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {services.map((s, i) => (
          <BlurFade key={s.title} delay={i * 80}>
            <article className="group relative h-full rounded-2xl border border-neutral-200/80 bg-white/80 backdrop-blur-sm p-6 sm:p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.25)]">
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl bg-neutral-950 text-[#d8ff7c] flex items-center justify-center">
                  <s.icon size={19} />
                </div>
                <ArrowUpRight size={18} className="text-neutral-300 transition-colors group-hover:text-neutral-900" />
              </div>
              <h3 className="mt-5 text-[17px] font-semibold text-neutral-950 tracking-tight">{s.title}</h3>
              <p className="mt-1.5 font-serif-editorial text-[17px] text-neutral-600 leading-snug">{s.outcome}</p>
              <ul className="mt-5 space-y-2">
                {s.points.map((p) => (
                  <li key={p} className="flex items-center gap-2.5 text-[13px] text-neutral-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d8ff7c] ring-1 ring-black/15 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </article>
          </BlurFade>
        ))}
      </div>

      {/* Processo */}
      <div className="mt-16 sm:mt-20">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-[#d8ff7c] border border-black/20" />
          <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400 font-mono">
            Processo
          </span>
        </div>
        <h2 className="font-serif-editorial text-2xl sm:text-3xl text-neutral-950 font-normal tracking-tight leading-tight">
          Do briefing ao lançamento, sem surpresas.
        </h2>
        <ol className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-neutral-200/80 bg-neutral-200/80">
          {steps.map((st) => (
            <li key={st.n} className="bg-[#FAFAFA]/95 p-6">
              <span className="inline-flex items-center rounded-md bg-[#d8ff7c] px-2 py-0.5 text-[11px] font-bold font-mono text-neutral-900">
                {st.n}
              </span>
              <h3 className="mt-4 text-[15px] font-semibold text-neutral-950">{st.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">{st.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
