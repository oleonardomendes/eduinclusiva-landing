'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Star, BookOpen, Heart, Sparkles } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useEffect, useState } from 'react'

/* Contador animado */
function AnimatedCounter({
  target,
  suffix = '',
  prefix = '',
}: {
  target: number
  suffix?: string
  prefix?: string
}) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const duration = 1800
    const step = (target / duration) * 16
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target])

  return (
    <span>
      {prefix}
      {count.toLocaleString('pt-BR')}
      {suffix}
    </span>
  )
}

/* Card de preview mockado */
function AppMockup() {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Sombra decorativa */}
      <div className="absolute inset-0 bg-[#1B4332]/20 rounded-3xl blur-2xl translate-y-4 scale-95" />

      <div className="relative bg-white rounded-3xl shadow-soft-lg border border-[#F0EBE0] overflow-hidden">
        {/* Header do card */}
        <div className="bg-[#1B4332] px-5 py-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[#A7F3D0] text-xs font-medium">Atividade gerada por IA</span>
            <span className="bg-[#F59E0B] text-white text-xs font-bold px-2 py-0.5 rounded-full">
              TEA · 7-9 anos
            </span>
          </div>
          <h3 className="text-white font-lora font-bold text-lg leading-tight">
            Sequência de Histórias com Figuras
          </h3>
        </div>

        {/* Conteúdo */}
        <div className="p-5 space-y-3">
          <div className="bg-[#F0F7F4] rounded-2xl p-3">
            <p className="text-[#2D6A4F] text-xs font-semibold uppercase tracking-wide mb-1">Objetivo</p>
            <p className="text-[#1A1A1A] text-sm leading-relaxed">
              Desenvolver sequência lógica e comunicação por meio de figuras e histórias simples.
            </p>
          </div>

          <div>
            <p className="text-[#4A5568] text-xs font-semibold uppercase tracking-wide mb-2">Passo a passo</p>
            {['Organize 4 figuras de uma história no chão.', 'Peça que seu filho coloque na ordem certa.'].map(
              (step, i) => (
                <div key={i} className="flex gap-2.5 mb-2">
                  <span className="w-5 h-5 rounded-full bg-[#1B4332] text-white text-xs flex items-center justify-center flex-shrink-0 font-bold">
                    {i + 1}
                  </span>
                  <p className="text-sm text-[#4A5568] leading-relaxed">{step}</p>
                </div>
              )
            )}
          </div>

          {/* Bloqueado */}
          <div className="relative rounded-2xl overflow-hidden">
            <div className="bg-[#F5F0E8] p-3 opacity-40 select-none">
              <p className="text-sm text-[#4A5568]">Instrução para família: Sente junto com a criança e...</p>
              <p className="text-sm text-[#4A5568] mt-1">Orientação para professor: Avalie a sequência e...</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end pb-3 px-3">
              <div className="text-center w-full">
                <p className="text-xs text-[#1B4332] font-semibold">🔒 Ver atividade completa — É grátis</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const stats = [
  { value: 6, suffix: ' áreas', label: 'de desenvolvimento cobertas', prefix: '' },
  { value: 8, suffix: ' perguntas', label: 'para identificar o estilo de aprendizagem', prefix: '' },
  { value: 100, suffix: '%', label: 'personalizado para o seu filho', prefix: '' },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
})

export default function Hero() {
  const handleCTA = () => alert('Em breve! Estamos preparando algo incrível. 🌱')

  const scrollToSection = () => {
    const el = document.querySelector('#como-funciona')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden bg-gradient-to-br from-[#FDFBF7] via-[#F5FDF8] to-[#FDFBF7]">
      {/* Blob verde — canto superior direito */}
      <div
        className="pointer-events-none absolute -top-32 -right-32 w-[560px] h-[560px] blob-shape opacity-20"
        style={{ background: 'linear-gradient(135deg, #1B4332, #2D6A4F)' }}
      />

      {/* Blob âmbar — canto inferior esquerdo */}
      <div
        className="pointer-events-none absolute -bottom-20 -left-20 w-[360px] h-[360px] blob-shape opacity-10"
        style={{
          background: 'linear-gradient(135deg, #F59E0B, #FDE68A)',
          animationDelay: '4s',
        }}
      />

      {/* Floating elements */}
      <div className="pointer-events-none absolute top-1/4 left-[5%] animate-float opacity-40">
        <Heart className="w-8 h-8 text-rose-400 fill-rose-200" />
      </div>
      <div className="pointer-events-none absolute top-1/3 right-[8%] animate-float-slow opacity-30" style={{ animationDelay: '1s' }}>
        <Star className="w-7 h-7 text-[#F59E0B] fill-[#FDE68A]" />
      </div>
      <div className="pointer-events-none absolute bottom-1/3 left-[10%] animate-float-delay opacity-25">
        <BookOpen className="w-9 h-9 text-[#2D6A4F]" />
      </div>
      <div className="pointer-events-none absolute top-1/5 right-[20%] animate-float opacity-20" style={{ animationDelay: '2s' }}>
        <Sparkles className="w-6 h-6 text-[#F59E0B]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Conteúdo textual */}
          <div>
            {/* Badge de lançamento */}
            <motion.div {...fadeUp(0)} className="mb-6">
              <span className="inline-flex items-center gap-2 bg-[#D1FAE5] text-[#065F46] text-sm font-semibold px-4 py-1.5 rounded-full">
                <Sparkles className="w-4 h-4" />
                Powered by Inteligência Artificial
              </span>
            </motion.div>

            {/* Título principal */}
            <motion.h1
              {...fadeUp(0.1)}
              className="font-lora font-bold text-5xl sm:text-6xl lg:text-6xl xl:text-7xl leading-[1.1] text-[#1A1A1A] mb-6"
            >
              Seu filho tem um
              <br />
              jeito <span className="text-gradient-green">único</span> de
              <br />
              aprender.
            </motion.h1>

            {/* Subtítulo */}
            <motion.p
              {...fadeUp(0.2)}
              className="text-lg sm:text-xl text-[#4A5568] leading-relaxed mb-8 max-w-lg"
            >
              Nossa IA identifica como ele aprende, entende sua necessidade específica e cria atividades personalizadas
              para cada área do desenvolvimento —{' '}
              <strong className="text-[#1B4332] font-semibold">com orientações práticas para você fazer em casa.</strong>
            </motion.p>

            {/* CTAs */}
            <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row gap-3 mb-12">
              <Button variant="primary" size="xl" onClick={handleCTA}>
                <Sparkles className="w-5 h-5" />
                Gerar atividade gratuita
              </Button>
              <button
                onClick={scrollToSection}
                className="inline-flex items-center gap-2 text-[#1B4332] font-semibold text-base px-4 py-3 hover:gap-3 transition-all group"
              >
                Ver como funciona
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div {...fadeUp(0.4)}>
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-[#E8E0D0]">
                {stats.map((stat, i) => (
                  <div key={i} className="text-center sm:text-left">
                    <div className="font-lora font-bold text-2xl sm:text-3xl text-[#1B4332]">
                      <AnimatedCounter
                        target={stat.value}
                        suffix={stat.suffix}
                        prefix={stat.prefix}
                      />
                    </div>
                    <p className="text-xs sm:text-sm text-[#4A5568] mt-0.5 leading-tight">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Mockup do app */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:flex lg:justify-center"
          >
            <AppMockup />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
