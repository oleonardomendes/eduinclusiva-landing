'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import AnimatedSection, { StaggerContainer, StaggerItem } from '@/components/ui/AnimatedSection'
import Button from '@/components/ui/Button'

/* SVGs inline para os ícones das condições */
const PuzzleIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
    <path
      d="M16 8h8v4a2 2 0 0 1 4 0v-4h4v8h-4a2 2 0 0 0 0 4h4v4h-4a2 2 0 0 1 0 4h4v4h-8v-4a2 2 0 0 0-4 0v4h-8v-4a2 2 0 0 1 0-4H8v-8h4a2 2 0 0 0 0-4H8V8h8z"
      fill="currentColor"
      opacity="0.9"
    />
  </svg>
)

const BoltIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
    <path
      d="M22 4L8 22h12l-2 14 16-18H22L24 4z"
      fill="currentColor"
      opacity="0.9"
    />
  </svg>
)

const BookIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
    <path
      d="M6 8a2 2 0 0 1 2-2h8c2.2 0 4.2.7 5.8 1.9A10 10 0 0 1 27.4 6H34a2 2 0 0 1 2 2v22a2 2 0 0 1-2 2h-6.6a6 6 0 0 0-4.6 2.1A6 6 0 0 0 18.2 32H8a2 2 0 0 1-2-2V8zm14 3.3A8 8 0 0 0 14 10H8v20h10.2a8 8 0 0 1 1.8.2V11.3zm2 19.2c.5-.1 1.2-.2 1.8-.2H32V10h-6c-1.4 0-2.8.4-4 1.3v19.2z"
      fill="currentColor"
      opacity="0.9"
    />
  </svg>
)

const BrainIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
    <path
      d="M20 6c-1.7 0-3 1.3-3 3 0-.4-.1-.7-.2-1A5 5 0 0 0 10 13a5 5 0 0 0 0 10 5 5 0 0 0 4.9 6H20V6zm0 0c1.7 0 3 1.3 3 3 0-.4.1-.7.2-1A5 5 0 0 1 30 13a5 5 0 0 1 0 10 5 5 0 0 1-4.9 6H20V6z"
      fill="currentColor"
      opacity="0.85"
    />
  </svg>
)

const conditions = [
  {
    icon: PuzzleIcon,
    title: 'Transtorno do Espectro Autista',
    short: 'TEA / Autismo',
    description:
      'O TEA é um transtorno do neurodesenvolvimento que afeta a comunicação, interação social e comportamento. Crianças com TEA frequentemente aprendem melhor com rotinas visuais, pistas concretas e atividades estruturadas.',
    color: '#3B82F6',
    bg: '#DBEAFE',
    badgeVariant: 'blue' as const,
  },
  {
    icon: BoltIcon,
    title: 'TDAH',
    short: 'Déficit de Atenção',
    description:
      'O TDAH é caracterizado por desatenção, hiperatividade e impulsividade. Crianças com TDAH aprendem melhor com atividades curtas, movimento, recompensas imediatas e muita variedade para manter o engajamento.',
    color: '#D97706',
    bg: '#FEF3C7',
    badgeVariant: 'amber' as const,
  },
  {
    icon: BookIcon,
    title: 'Dislexia',
    short: 'Dificuldade de leitura',
    description:
      'A dislexia é uma dificuldade específica de aprendizagem que afeta a leitura e a escrita. Crianças com dislexia se beneficiam de abordagens multissensoriais, textos com fontes adequadas e muito encorajamento.',
    color: '#059669',
    bg: '#D1FAE5',
    badgeVariant: 'green' as const,
  },
  {
    icon: BrainIcon,
    title: 'Deficiência Intelectual',
    short: 'DI',
    description:
      'A DI é caracterizada por limitações significativas no funcionamento intelectual e no comportamento adaptativo. Crianças com DI aprendem com repetição, linguagem simples, atividades concretas e muito afeto.',
    color: '#DB2777',
    bg: '#FCE7F3',
    badgeVariant: 'rose' as const,
  },
]

export default function PortalEducativo() {
  const [email, setEmail] = useState('')

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    alert('Obrigado! Você será avisado quando o canal de apoio estiver disponível. 🌱')
    setEmail('')
  }

  return (
    <section id="portal-educativo" className="py-12 md:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection className="text-center mb-4">
          <span className="inline-block text-sm font-semibold text-[#2D6A4F] bg-[#D1FAE5] px-4 py-1.5 rounded-full mb-4">
            Portal Educativo
          </span>
          <h2 className="font-lora font-bold text-4xl sm:text-5xl text-[#1A1A1A] mb-3">
            Entenda melhor o seu filho
          </h2>
        </AnimatedSection>

        <AnimatedSection delay={0.1} className="text-center mb-14">
          <p className="font-caveat text-2xl text-[#2D6A4F]">
            &quot;Porque o conhecimento é o primeiro passo para ajudar&quot;
          </p>
        </AnimatedSection>

        {/* Grid de condições */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-14">
          {conditions.map((cond) => {
            const Icon = cond.icon
            return (
              <StaggerItem key={cond.title}>
                <div className="group bg-white rounded-3xl p-7 border border-[#F0EBE0] shadow-soft hover:-translate-y-1 hover:shadow-soft-lg transition-all duration-200 h-full cursor-pointer">
                  {/* Ícone */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: cond.bg, color: cond.color }}
                  >
                    <Icon />
                  </div>

                  {/* Badge */}
                  <span
                    className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3"
                    style={{ background: cond.bg, color: cond.color }}
                  >
                    {cond.short}
                  </span>

                  <h3 className="font-lora font-bold text-xl text-[#1A1A1A] mb-3">
                    {cond.title}
                  </h3>
                  <p className="text-sm text-[#4A5568] leading-relaxed mb-4">
                    {cond.description}
                  </p>

                  <button
                    onClick={() => alert('Em breve! O portal completo está chegando. 🌱')}
                    className="inline-flex items-center gap-1 text-sm font-semibold transition-all duration-200"
                    style={{ color: cond.color }}
                  >
                    Saiba mais →
                  </button>
                </div>
              </StaggerItem>
            )
          })}
        </StaggerContainer>

        {/* Banner "Em breve" */}
        <AnimatedSection delay={0.2}>
          <div className="bg-[#1B4332] rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Ícone decorativo */}
            <div className="flex-shrink-0 w-14 h-14 bg-[#2D6A4F] rounded-2xl flex items-center justify-center">
              <Bell className="w-7 h-7 text-[#A7F3D0]" />
            </div>

            {/* Texto */}
            <div className="flex-1">
              <span className="inline-block bg-[#F59E0B] text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                Em breve
              </span>
              <h3 className="font-lora font-bold text-2xl text-white mb-2">
                Canal de apoio psicológico para famílias
              </h3>
              <p className="text-[#A7F3D0] text-sm leading-relaxed max-w-lg">
                Estamos fechando parcerias com psicólogos especializados em NEE para oferecer
                suporte completo às famílias. Seja avisado quando lançarmos.
              </p>
            </div>

            {/* Formulário email */}
            <form
              onSubmit={handleEmailSubmit}
              className="flex-shrink-0 flex flex-col sm:flex-row gap-2 w-full md:w-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="px-4 py-2.5 rounded-full text-sm bg-white/10 border border-white/20 text-white placeholder-[#6EE7B7] focus:outline-none focus:border-white/50 transition-colors min-w-[220px]"
                required
              />
              <Button type="submit" variant="amber" size="md">
                Quero ser avisado
              </Button>
            </form>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
