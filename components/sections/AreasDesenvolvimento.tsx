'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import AnimatedSection from '@/components/ui/AnimatedSection'

const areas = [
  {
    emoji: '😊',
    nome: 'Comunicação e Linguagem',
    cor: '#3B82F6',
    corBg: '#EFF6FF',
    descricao: 'Expressão, vocabulário e comunicação alternativa',
    exemplo: 'Ex: Cartões de emoções para expressar sentimentos',
  },
  {
    emoji: '🧠',
    nome: 'Cognição e Aprendizagem',
    cor: '#8B5CF6',
    corBg: '#F5F3FF',
    descricao: 'Memória, atenção e habilidades acadêmicas adaptadas',
    exemplo: 'Ex: Sequência numérica com objetos concretos',
  },
  {
    emoji: '💪',
    nome: 'Desenvolvimento Motor',
    cor: '#F59E0B',
    corBg: '#FFFBEB',
    descricao: 'Coordenação motora fina, grossa e psicomotricidade',
    exemplo: 'Ex: Atividade de recorte e colagem adaptada',
  },
  {
    emoji: '❤️',
    nome: 'Regulação Emocional',
    cor: '#EF4444',
    corBg: '#FEF2F2',
    descricao: 'Identificar emoções e estratégias de autorregulação',
    exemplo: 'Ex: Termômetro das emoções personalizado',
  },
  {
    emoji: '👥',
    nome: 'Habilidades Sociais',
    cor: '#10B981',
    corBg: '#ECFDF5',
    descricao: 'Interação, empatia e comunicação social',
    exemplo: 'Ex: Jogo cooperativo adaptado à condição',
  },
  {
    emoji: '🎯',
    nome: 'Autonomia e Vida Diária',
    cor: '#6366F1',
    corBg: '#EEF2FF',
    descricao: 'Rotina, higiene e independência no dia a dia',
    exemplo: 'Ex: Sequência visual da rotina matinal',
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function AreasDesenvolvimento() {
  return (
    <section className="py-14 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection className="text-center mb-4">
          <span className="inline-block text-sm font-semibold text-[#2D6A4F] bg-[#D1FAE5] px-4 py-1.5 rounded-full mb-4">
            Desenvolvimento completo
          </span>
          <h2 className="font-lora font-bold text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] mb-3">
            Um plano completo para o desenvolvimento
          </h2>
          <p className="font-caveat text-xl text-[#2D6A4F] mb-2">
            Porque cada criança precisa de atenção em todas as áreas
          </p>
        </AnimatedSection>

        {/* Grid 6 cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6 mt-12 mb-10">
          {areas.map((area, i) => (
            <motion.div
              key={area.nome}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={cardVariants}
              className="bg-white rounded-2xl border border-[#F0EBE0] shadow-soft p-3 sm:p-5 hover:-translate-y-1 hover:shadow-soft-lg transition-all duration-200"
            >
              {/* Emoji + accent bar */}
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: area.corBg }}
                >
                  {area.emoji}
                </div>
                <div
                  className="w-1 self-stretch rounded-full flex-shrink-0 mt-1"
                  style={{ background: area.cor }}
                />
              </div>

              <h3
                className="font-lora font-bold text-sm sm:text-base leading-tight mb-1"
                style={{ color: area.cor }}
              >
                {area.nome}
              </h3>
              <p className="text-[#4A5568] text-sm leading-relaxed mb-2">{area.descricao}</p>
              <p className="text-xs text-[#A0AEC0] italic">{area.exemplo}</p>
            </motion.div>
          ))}
        </div>

        {/* Banner destacado */}
        <AnimatedSection delay={0.3}>
          <div className="rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1B4332, #2D6A4F)' }}>
            <div className="px-5 py-7 sm:px-8 sm:py-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
              <p className="text-white text-lg sm:text-xl font-medium leading-relaxed max-w-2xl">
                ✨ Nossa IA cria atividades específicas para cada área,{' '}
                <strong className="text-[#A7F3D0]">
                  considerando a condição, o grau e o estilo de aprendizagem único do seu filho
                </strong>
              </p>
              <Link
                href="/cadastro"
                className="flex-shrink-0 inline-flex items-center gap-2 bg-[#F59E0B] text-[#1B4332] font-bold px-7 py-3.5 rounded-full hover:opacity-90 transition-opacity text-base whitespace-nowrap"
              >
                Começar gratuitamente →
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
