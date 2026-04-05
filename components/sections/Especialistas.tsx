'use client'

import { Instagram } from 'lucide-react'
import AnimatedSection, { StaggerContainer, StaggerItem } from '@/components/ui/AnimatedSection'

const especialistas = [
  {
    inicial: 'A',
    nome: 'Dra. Ana Paula Mendes',
    especialidade: 'Psicomotricista especializada em TEA',
    depoimento: 'As atividades respeitam o ritmo de cada criança.',
    cor: '#2D6A4F',
    bg: '#D1FAE5',
    instagram: '@anapaula.nee',
  },
  {
    inicial: 'C',
    nome: 'Prof. Carlos Eduardo Lima',
    especialidade: 'Pedagogo especialista em TDAH',
    depoimento: 'Finalmente uma ferramenta que entende a inclusão de verdade.',
    cor: '#D97706',
    bg: '#FEF3C7',
    instagram: '@prof.carlosedu',
  },
  {
    inicial: 'M',
    nome: 'Dra. Marina Costa',
    especialidade: 'Neuropsicóloga infantil',
    depoimento: 'Recomendo para todas as famílias que acompanho.',
    cor: '#DB2777',
    bg: '#FCE7F3',
    instagram: '@dra.marinacosta',
  },
]

/* Estrelas decorativas */
function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} viewBox="0 0 12 12" className="w-3.5 h-3.5 fill-[#F59E0B]">
          <path d="M6 1l1.5 3 3.5.5-2.5 2.5.6 3.5L6 9 2.9 10.5l.6-3.5L1 4.5 4.5 4z" />
        </svg>
      ))}
    </div>
  )
}

export default function Especialistas() {
  return (
    <section id="especialistas" className="py-20 lg:py-28 bg-[#F5F0E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection className="text-center mb-14">
          <span className="inline-block text-sm font-semibold text-[#2D6A4F] bg-[#D1FAE5] px-4 py-1.5 rounded-full mb-4">
            Time de especialistas
          </span>
          <h2 className="font-lora font-bold text-4xl sm:text-5xl text-[#1A1A1A] mb-4">
            Desenvolvido com especialistas
          </h2>
          <p className="text-lg text-[#4A5568] max-w-xl mx-auto">
            Cada atividade é fundamentada em práticas validadas por profissionais de saúde
            e educação inclusiva.
          </p>
        </AnimatedSection>

        {/* Cards — horizontal scroll em mobile */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {especialistas.map((esp) => (
            <StaggerItem key={esp.nome}>
              <div className="bg-white rounded-3xl p-7 shadow-soft border border-[#F0EBE0] flex flex-col h-full hover:-translate-y-1 hover:shadow-soft-lg transition-all duration-200">
                {/* Avatar + info */}
                <div className="flex items-center gap-4 mb-5">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center font-lora font-bold text-2xl flex-shrink-0"
                    style={{ background: esp.bg, color: esp.cor }}
                  >
                    {esp.inicial}
                  </div>
                  <div>
                    <p className="font-semibold text-[#1A1A1A] text-base leading-tight">{esp.nome}</p>
                    <p className="text-xs text-[#4A5568] mt-0.5 leading-snug">{esp.especialidade}</p>
                  </div>
                </div>

                {/* Estrelas */}
                <Stars />

                {/* Depoimento em Caveat */}
                <blockquote className="font-caveat text-xl text-[#2D6A4F] mt-3 mb-5 flex-1 leading-snug">
                  &ldquo;{esp.depoimento}&rdquo;
                </blockquote>

                {/* Instagram */}
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="inline-flex items-center gap-1.5 text-xs text-[#4A5568] hover:text-[#1B4332] transition-colors"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  {esp.instagram}
                </a>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Selos de confiança */}
        <AnimatedSection delay={0.3} className="mt-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Baseado em evidências', desc: 'Práticas pedagógicas validadas' },
              { label: 'LGPD compliant', desc: 'Dados protegidos e seguros' },
              { label: 'Especialistas parceiros', desc: 'Profissionais de saúde e educação' },
              { label: 'Feito no Brasil', desc: 'Para a realidade brasileira' },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white rounded-2xl p-4 text-center border border-[#F0EBE0] shadow-soft"
              >
                <p className="font-semibold text-sm text-[#1B4332] mb-1">{item.label}</p>
                <p className="text-xs text-[#4A5568]">{item.desc}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
