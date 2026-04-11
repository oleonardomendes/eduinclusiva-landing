'use client'

import Link from 'next/link'
import { Eye, Music, Hand, Check } from 'lucide-react'
import AnimatedSection from '@/components/ui/AnimatedSection'

const estilos = [
  {
    icon: Eye,
    titulo: 'Aprendiz Visual',
    descricao: 'Aprende melhor com imagens, cores e organização visual',
    badge: 'Mais comum no autismo',
    badgeCor: '#3B82F6',
    badgeBg: '#EFF6FF',
    cor: '#3B82F6',
    bg: '#EFF6FF',
  },
  {
    icon: Music,
    titulo: 'Aprendiz Auditivo',
    descricao: 'Aprende melhor com sons, músicas e explicações orais',
    badge: null,
    cor: '#8B5CF6',
    bg: '#F5F3FF',
  },
  {
    icon: Hand,
    titulo: 'Aprendiz Cinestésico',
    descricao: 'Aprende melhor tocando, movendo e experimentando',
    badge: 'Mais comum no TDAH',
    badgeCor: '#F59E0B',
    badgeBg: '#FFFBEB',
    cor: '#10B981',
    bg: '#ECFDF5',
  },
]

const beneficios = [
  'Estilo de aprendizagem identificado',
  'Dicas práticas para casa',
  'Como comunicar ao professor',
  'Atividades recomendadas',
  'O que evitar',
]

export default function QuestionarioEstilo() {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-[#F5F0E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* Coluna esquerda */}
          <AnimatedSection direction="left">
            <span className="inline-block text-sm font-semibold text-[#2D6A4F] bg-[#D1FAE5] px-4 py-1.5 rounded-full mb-5">
              Aprendizagem personalizada
            </span>
            <h2 className="font-lora font-bold text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] mb-2 leading-tight">
              Descubra como seu filho aprende
            </h2>
            <p className="font-caveat text-xl text-[#2D6A4F] mb-5">
              O segredo para atividades que realmente funcionam
            </p>
            <p className="text-[#4A5568] leading-relaxed mb-8">
              Cada criança processa o mundo de um jeito único.
              Identificar o estilo de aprendizagem do seu filho é o
              primeiro passo para criar atividades que realmente
              fazem diferença.
            </p>

            {/* Cards de estilos */}
            <div className="space-y-3">
              {estilos.map((estilo) => {
                const Icon = estilo.icon
                return (
                  <div
                    key={estilo.titulo}
                    className="bg-white rounded-2xl border border-[#F0EBE0] shadow-soft p-4 flex items-start gap-4"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: estilo.bg }}
                    >
                      <Icon className="w-5 h-5" style={{ color: estilo.cor }} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="font-semibold text-[#1A1A1A] text-sm">{estilo.titulo}</p>
                        {estilo.badge && (
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ color: estilo.badgeCor, background: estilo.badgeBg }}
                          >
                            {estilo.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[#4A5568] text-sm">{estilo.descricao}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </AnimatedSection>

          {/* Coluna direita */}
          <AnimatedSection direction="right" delay={0.1}>
            <div className="bg-white rounded-3xl shadow-soft-lg border border-[#F0EBE0] p-6 sm:p-8">
              {/* Ícone grande */}
              <div className="w-16 h-16 bg-[#FEF3C7] rounded-2xl flex items-center justify-center text-3xl mb-5">
                🎯
              </div>

              <h3 className="font-lora font-bold text-2xl text-[#1A1A1A] mb-2">
                Questionário Inteligente
              </h3>
              <p className="text-[#4A5568] text-sm mb-4">
                8 perguntas simples sobre o comportamento do seu filho
              </p>
              <p className="text-[#4A5568] text-sm leading-relaxed mb-5">
                Nossa IA analisa as respostas e identifica o estilo exato, gerando um relatório completo com:
              </p>

              {/* Lista de benefícios */}
              <ul className="space-y-2.5 mb-6">
                {beneficios.map((b) => (
                  <li key={b} className="flex items-center gap-2.5 text-sm text-[#1A1A1A]">
                    <Check className="w-4 h-4 text-[#059669] flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>

              {/* Badge plano */}
              <div className="mb-3">
                <span className="inline-block bg-[#F59E0B] text-white text-xs font-bold px-3 py-1 rounded-full">
                  Plano Família
                </span>
              </div>

              <p className="text-[#4A5568] text-sm mb-5">
                Disponível no Plano Família — descubra como seu filho aprende com 8 perguntas simples.
              </p>

              {/* CTA */}
              <a
                href="#planos"
                onClick={(e) => {
                  e.preventDefault()
                  document.querySelector('#planos')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="block w-full text-center bg-[#1B4332] text-white font-semibold py-4 rounded-xl hover:bg-[#2D6A4F] transition-colors shadow-green cursor-pointer"
              >
                Conhecer o Plano Família →
              </a>
            </div>
          </AnimatedSection>

        </div>
      </div>
    </section>
  )
}
