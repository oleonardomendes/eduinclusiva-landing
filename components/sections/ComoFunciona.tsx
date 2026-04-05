'use client'

import { UserCircle, Sparkles, Heart } from 'lucide-react'
import AnimatedSection, { StaggerContainer, StaggerItem } from '@/components/ui/AnimatedSection'

const steps = [
  {
    number: '01',
    icon: UserCircle,
    color: '#2D6A4F',
    bg: '#D1FAE5',
    title: 'Conte sobre seu filho',
    description:
      'Idade, condição e como ele aprende melhor. Leva menos de 2 minutos para preencher o perfil completo.',
  },
  {
    number: '02',
    icon: Sparkles,
    color: '#D97706',
    bg: '#FEF3C7',
    title: 'A IA cria a atividade',
    description:
      'Nossa inteligência artificial analisa o perfil e cria uma atividade única e personalizada, respeitando o ritmo do seu filho.',
  },
  {
    number: '03',
    icon: Heart,
    color: '#BE185D',
    bg: '#FCE7F3',
    title: 'Você faz em casa',
    description:
      'Recebe orientações claras para o professor e para a família. Com materiais do dia a dia que você já tem em casa.',
  },
]

export default function ComoFunciona() {
  return (
    <section id="como-funciona" className="py-20 lg:py-28 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header da seção */}
        <AnimatedSection className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-[#2D6A4F] bg-[#D1FAE5] px-4 py-1.5 rounded-full mb-4">
            Simples e rápido
          </span>
          <h2 className="font-lora font-bold text-4xl sm:text-5xl text-[#1A1A1A] mb-4">
            Simples como deve ser
          </h2>
          <p className="text-lg text-[#4A5568] max-w-xl mx-auto">
            Em três passos, você tem uma atividade personalizada pronta para usar com seu filho.
          </p>
        </AnimatedSection>

        {/* Cards dos passos */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
          {/* Linha conectora (desktop) */}
          <div
            className="hidden md:block absolute top-[52px] left-[calc(16.67%+32px)] right-[calc(16.67%+32px)] h-0.5 bg-gradient-to-r from-[#D1FAE5] via-[#FEF3C7] to-[#FCE7F3]"
            aria-hidden="true"
          />

          {steps.map((step) => {
            const Icon = step.icon
            return (
              <StaggerItem key={step.number}>
                <div className="relative bg-white rounded-3xl p-7 shadow-soft border border-[#F0EBE0] h-full hover:-translate-y-1 transition-transform duration-200 group">
                  {/* Número decorativo */}
                  <span className="absolute top-5 right-6 font-lora font-bold text-5xl text-[#F5F0E8] select-none leading-none">
                    {step.number}
                  </span>

                  {/* Ícone */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 relative z-10 group-hover:scale-110 transition-transform duration-200"
                    style={{ background: step.bg }}
                  >
                    <Icon className="w-7 h-7" style={{ color: step.color }} />
                  </div>

                  <h3 className="font-lora font-bold text-xl text-[#1A1A1A] mb-3 relative z-10">
                    {step.title}
                  </h3>
                  <p className="text-[#4A5568] leading-relaxed text-sm relative z-10">
                    {step.description}
                  </p>
                </div>
              </StaggerItem>
            )
          })}
        </StaggerContainer>

        {/* CTA abaixo */}
        <AnimatedSection delay={0.3} className="text-center mt-12">
          <p className="text-[#4A5568] text-sm">
            Pronto para experimentar?{' '}
            <button
              onClick={() => {
                const el = document.querySelector('#preview-atividade')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }}
              className="text-[#1B4332] font-semibold hover:underline underline-offset-2"
            >
              Gere uma atividade gratuita agora →
            </button>
          </p>
        </AnimatedSection>
      </div>
    </section>
  )
}
