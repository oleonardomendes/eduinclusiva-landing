'use client'

import { motion } from 'framer-motion'
import { Sparkles, Users, Star } from 'lucide-react'
import Link from 'next/link'
import AnimatedSection from '@/components/ui/AnimatedSection'

export default function CTA() {
  return (
    <section className="relative py-12 md:py-16 lg:py-20 overflow-hidden bg-[#1B4332]">
      {/* Blob decorativo superior direito */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 w-[480px] h-[480px] blob-shape opacity-10"
        style={{ background: 'radial-gradient(circle, #40916C, transparent)' }}
      />
      {/* Blob decorativo inferior esquerdo */}
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 w-[320px] h-[320px] blob-shape opacity-8"
        style={{
          background: 'radial-gradient(circle, #F59E0B, transparent)',
          animationDelay: '4s',
        }}
      />

      {/* Pontos decorativos */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/10"
            style={{
              left: `${(i * 17 + 5) % 95}%`,
              top: `${(i * 23 + 10) % 85}%`,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <AnimatedSection>
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-[#A7F3D0] text-sm font-semibold px-4 py-1.5 rounded-full mb-8">
            <Sparkles className="w-4 h-4" />
            Comece hoje, de graça
          </span>
        </AnimatedSection>

        {/* Título */}
        <AnimatedSection delay={0.1}>
          <h2 className="font-lora font-bold text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.1] mb-6">
            Seu filho merece
            <br />
            <span className="text-[#F59E0B]">o melhor suporte.</span>
          </h2>
        </AnimatedSection>

        {/* Subtítulo */}
        <AnimatedSection delay={0.2}>
          <p className="text-lg sm:text-xl text-[#A7F3D0] leading-relaxed mb-10 max-w-2xl mx-auto">
            Junte-se às famílias que já estão transformando o aprendizado dos seus filhos com
            atividades personalizadas e orientações claras.
          </p>
        </AnimatedSection>

        {/* CTA */}
        <AnimatedSection delay={0.3} className="mb-12">
          <Link
            href="/cadastro"
            className="inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 bg-[#F59E0B] text-white hover:bg-[#D97706] focus-visible:ring-[#F59E0B] shadow-soft hover:shadow-soft-lg active:scale-[0.98] text-lg px-8 py-4"
          >
            <Sparkles className="w-5 h-5" />
            Criar conta gratuita agora
          </Link>
        </AnimatedSection>

        {/* Social proof */}
        <AnimatedSection delay={0.4}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            {/* Avatares mock */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {['#2D6A4F', '#40916C', '#1B4332', '#52B788'].map((color, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-[#1B4332] flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: color }}
                  >
                    {['M', 'A', 'L', 'P'][i]}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-0.5 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                  ))}
                </div>
                <p className="text-xs text-[#A7F3D0]">Famílias já cadastradas</p>
              </div>
            </div>

            <div className="hidden sm:block w-px h-8 bg-white/20" />

            {/* Stats */}
            <div className="flex items-center gap-2 text-[#A7F3D0]">
              <Users className="w-4 h-4" />
              <span className="text-sm">Sem cartão de crédito • Cancele quando quiser</span>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
