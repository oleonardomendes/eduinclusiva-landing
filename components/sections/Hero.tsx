'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Star, BookOpen, Heart, Sparkles } from 'lucide-react'
import Button from '@/components/ui/Button'
import Link from 'next/link'
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
  const scrollToPreview = () => {
    const el = document.querySelector('#preview-atividade')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToComoFunciona = () => {
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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
        {/* Badge */}
        <motion.div {...fadeUp(0)} className="mb-6 flex justify-center">
          <span className="inline-flex items-center gap-2 bg-[#D1FAE5] text-[#065F46] text-sm font-semibold px-4 py-1.5 rounded-full">
            <Sparkles className="w-4 h-4" />
            Powered by Inteligência Artificial
          </span>
        </motion.div>

        {/* Título */}
        <motion.h1
          {...fadeUp(0.1)}
          className="font-lora font-bold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] text-[#1A1A1A] mb-6"
        >
          Seu filho tem um jeito{' '}
          <span className="text-gradient-green">único</span>{' '}
          de aprender.
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          {...fadeUp(0.2)}
          className="text-lg sm:text-xl text-[#4A5568] leading-relaxed mb-10 max-w-2xl mx-auto"
        >
          Nossa IA identifica como ele aprende, entende sua necessidade específica e cria
          atividades personalizadas para cada área do desenvolvimento —{' '}
          <strong className="text-[#1B4332] font-semibold">
            com orientações práticas para você fazer em casa.
          </strong>
        </motion.p>

        {/* CTAs */}
        <motion.div
          {...fadeUp(0.3)}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14"
        >
          <Button variant="primary" size="xl" onClick={scrollToPreview}>
            <Sparkles className="w-5 h-5" />
            Gerar atividade gratuita
          </Button>
          <button
            onClick={scrollToComoFunciona}
            className="inline-flex items-center gap-2 text-[#1B4332] font-semibold text-base px-4 py-3 hover:gap-3 transition-all group"
          >
            Ver como funciona
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div {...fadeUp(0.4)}>
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-[#E8E0D0] max-w-lg mx-auto">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
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

        {/* Social proof */}
        <motion.div
          {...fadeUp(0.5)}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
        >
          {['Sem cartão de crédito', 'Cancele quando quiser', 'Resultado em segundos'].map((item) => (
            <span key={item} className="text-sm text-[#718096] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F] inline-block" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
