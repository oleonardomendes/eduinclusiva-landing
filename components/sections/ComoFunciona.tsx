'use client'

import { motion } from 'framer-motion'
import AnimatedSection from '@/components/ui/AnimatedSection'

const steps = [
  {
    number: 1,
    emoji: '🧩',
    title: 'Conte sobre o seu filho',
    description:
      'Nome, idade, condição e como ele aprende melhor. Leva menos de 3 minutos. Você conhece ele melhor do que qualquer sistema.',
  },
  {
    number: 2,
    emoji: '🤖',
    title: 'A IA monta a atividade certa',
    description:
      'Com base no perfil único do seu filho — estilo de aprendizagem, grau da necessidade e o que já foi trabalhado — a plataforma gera uma atividade personalizada para hoje.',
  },
  {
    number: 3,
    emoji: '🏠',
    title: 'Você recebe o guia completo',
    description:
      'O que fazer em casa, passo a passo. E o que comunicar para a escola. Tudo em linguagem simples, sem jargão técnico.',
  },
]

const stepVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function ComoFunciona() {
  return (
    <section id="como-funciona" className="py-12 md:py-16 lg:py-20 bg-[#FDFBF7]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <AnimatedSection className="text-center mb-14">
          <h2 className="font-lora font-bold text-3xl md:text-4xl text-[#1B4332]">
            Da dúvida ao caminho certo — em minutos
          </h2>
          <p className="text-lg text-gray-500 mt-3 max-w-xl mx-auto">
            Você conhece seu filho melhor do que ninguém. A plataforma cuida do resto.
          </p>
        </AnimatedSection>

        {/* Steps */}
        <div className="relative">

          {/* Linha conectora — mobile vertical, desktop horizontal */}
          {/* Mobile: borda vertical à esquerda do container de steps */}
          {/* Desktop: linha horizontal entre os números (posicionada via absolute) */}
          <div
            className="hidden md:block absolute top-5 left-[calc(16.67%)] right-[calc(16.67%)] h-0.5 border-t-2 border-dashed border-[#F59E0B]/40"
            aria-hidden="true"
          />

          <div className="flex flex-col md:flex-row md:items-start md:gap-0">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                variants={stepVariants}
                className="relative flex md:flex-col md:items-center md:flex-1 md:text-center mb-8 md:mb-0 md:px-6"
              >
                {/* Linha conectora vertical — mobile only, entre steps */}
                {i < steps.length - 1 && (
                  <div
                    className="md:hidden absolute left-5 top-12 w-0.5 h-12 border-l-2 border-dashed border-[#F59E0B]/40"
                    aria-hidden="true"
                  />
                )}

                {/* Número círculo */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#F59E0B] text-white flex items-center justify-center font-bold text-lg mr-5 md:mr-0 md:mb-4 relative z-10">
                  {step.number}
                </div>

                {/* Conteúdo */}
                <div className="md:mt-0">
                  <div className="text-4xl mb-3">{step.emoji}</div>
                  <h3 className="font-semibold text-[#1B4332] text-lg mb-2 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed max-w-xs md:mx-auto">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Banner âncora */}
        <AnimatedSection delay={0.4} className="mt-16 text-center">
          <div className="bg-[#1B4332] rounded-2xl px-8 py-6 max-w-2xl mx-auto">
            <p className="font-caveat text-2xl text-white leading-snug">
              "E se em 5 minutos você tivesse uma atividade pronta para hoje à noite?"
            </p>
            <button
              onClick={() => {
                document.querySelector('#preview-atividade')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="mt-4 inline-flex items-center bg-[#F59E0B] text-white font-bold px-7 py-3 rounded-full hover:bg-amber-500 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Experimentar agora →
            </button>
          </div>
        </AnimatedSection>

      </div>
    </section>
  )
}
