'use client'

import { motion } from 'framer-motion'
import { Star, BookOpen, Heart, Sparkles } from 'lucide-react'
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
  { value: 2400, suffix: '+', prefix: '', label: 'Famílias atendidas' },
  { value: 6,    suffix: '',  prefix: '', label: 'Áreas do desenvolvimento' },
  { value: 98,   suffix: '%', prefix: '', label: 'Recomendam para outros pais' },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
})

export default function Hero() {
  const scrollToComoFunciona = () => {
    document.querySelector('#como-funciona')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex items-center pt-16 pb-10 md:pt-20 md:pb-14 overflow-hidden bg-gradient-to-br from-[#FDFBF7] via-[#F5FDF8] to-[#FDFBF7]">
      {/* Blobs decorativos */}
      <div
        className="pointer-events-none absolute -top-32 -right-32 w-[560px] h-[560px] blob-shape opacity-20"
        style={{ background: 'linear-gradient(135deg, #1B4332, #2D6A4F)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-20 w-[360px] h-[360px] blob-shape opacity-10"
        style={{ background: 'linear-gradient(135deg, #F59E0B, #FDE68A)', animationDelay: '4s' }}
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

        {/* Badge de confiança */}
        <motion.div {...fadeUp(0)} className="mb-6 flex justify-center">
          <span className="inline-flex items-center gap-2 bg-[#F59E0B]/10 text-[#1B4332] text-sm font-medium px-4 py-1.5 rounded-full border border-[#F59E0B]/30">
            ✓ Aprovado por psicomotricistas e psicólogos
          </span>
        </motion.div>

        {/* Título principal */}
        <motion.h1
          {...fadeUp(0.1)}
          className="font-lora text-4xl sm:text-5xl lg:text-6xl mb-5"
        >
          <span className="block font-normal leading-tight text-[#1B4332]">
            Seu filho tem um jeito único de aprender —
          </span>
          <span className="block font-bold leading-tight text-[#1A1A1A]">
            agora você tem o guia{' '}
            <span className="text-[#F59E0B]">certo</span>
            {' '}para ajudá-lo.
          </span>
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          {...fadeUp(0.2)}
          className="text-lg md:text-xl text-[#4A5568] leading-relaxed mt-4 mb-8 max-w-2xl mx-auto"
        >
          Atividades personalizadas por IA para crianças com Autismo, TDAH, Dislexia e
          Deficiência Intelectual — com orientações para casa e para a escola.
        </motion.p>

        {/* CTAs */}
        <motion.div
          {...fadeUp(0.3)}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8"
        >
          {/* CTA primário — âmbar, destaque total */}
          <a
            href="/cadastro"
            className="w-full sm:w-auto text-center bg-[#F59E0B] text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:bg-amber-500 transition-all duration-200"
          >
            Gerar atividade gratuita para o meu filho →
          </a>

          {/* CTA secundário — ghost discreto */}
          <button
            onClick={scrollToComoFunciona}
            className="w-full sm:w-auto border border-[#1B4332] text-[#1B4332] text-base px-6 py-3 rounded-full hover:bg-[#1B4332] hover:text-white transition-all duration-200"
          >
            Ver como funciona
          </button>
        </motion.div>

        {/* Stats — prova social */}
        <motion.div {...fadeUp(0.4)} className="mt-12">
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">

            {/* Stat 1 — Famílias atendidas */}
            <div className="flex flex-col items-center justify-start text-center px-2 border-r border-gray-200">
              <span className="block font-lora font-bold text-[#1B4332] text-2xl sm:text-3xl leading-none min-h-[2.5rem] flex items-center justify-center">
                <AnimatedCounter target={2400} suffix="+" prefix="" />
              </span>
              <span className="block text-xs sm:text-sm text-gray-500 mt-2 leading-snug min-h-[2.5rem] flex items-start justify-center">
                Famílias atendidas
              </span>
            </div>

            {/* Stat 2 — Áreas do desenvolvimento */}
            <div className="flex flex-col items-center justify-start text-center px-2 border-r border-gray-200">
              <span className="block font-lora font-bold text-[#1B4332] text-2xl sm:text-3xl leading-none min-h-[2.5rem] flex items-center justify-center">
                <AnimatedCounter target={6} suffix="" prefix="" />
              </span>
              <span className="block text-xs sm:text-sm text-gray-500 mt-2 leading-snug min-h-[2.5rem] flex items-start justify-center">
                Áreas do{' '}
                <br className="hidden sm:block" />
                desenvolvimento
              </span>
            </div>

            {/* Stat 3 — Recomendam */}
            <div className="flex flex-col items-center justify-start text-center px-2">
              <span className="block font-lora font-bold text-[#1B4332] text-2xl sm:text-3xl leading-none min-h-[2.5rem] flex items-center justify-center">
                <AnimatedCounter target={98} suffix="%" prefix="" />
              </span>
              <span className="block text-xs sm:text-sm text-gray-500 mt-2 leading-snug min-h-[2.5rem] flex items-start justify-center">
                Recomendam para outros pais
              </span>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  )
}
