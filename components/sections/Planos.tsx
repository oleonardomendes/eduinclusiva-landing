'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'
import AnimatedSection, { StaggerContainer, StaggerItem } from '@/components/ui/AnimatedSection'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

interface Feature {
  text: string
  included: boolean
}

interface Plan {
  id: string
  name: string
  badge: string
  badgeVariant: 'gray' | 'green' | 'amber'
  priceMonthly: number
  priceAnnual: number
  description: string
  features: Feature[]
  cta: string
  ctaVariant: 'secondary' | 'primary' | 'amber'
  highlighted: boolean
}

const plans: Plan[] = [
  {
    id: 'gratuito',
    name: 'Gratuito',
    badge: 'Para experimentar',
    badgeVariant: 'gray',
    priceMonthly: 0,
    priceAnnual: 0,
    description: 'Ideal para conhecer a plataforma e experimentar as primeiras atividades.',
    features: [
      { text: '3 atividades por mês', included: true },
      { text: '1 perfil de filho', included: true },
      { text: 'Orientações básicas', included: true },
      { text: 'Portal educativo completo', included: true },
      { text: 'Histórico de atividades', included: false },
      { text: 'Acompanhamento de progresso', included: false },
    ],
    cta: 'Começar grátis',
    ctaVariant: 'secondary',
    highlighted: false,
  },
  {
    id: 'familia',
    name: 'Família',
    badge: 'Mais popular',
    badgeVariant: 'green',
    priceMonthly: 29,
    priceAnnual: 23,
    description: 'Para famílias que querem apoio contínuo no desenvolvimento do filho.',
    features: [
      { text: 'Atividades ilimitadas', included: true },
      { text: '1 perfil de filho', included: true },
      { text: 'Orientações completas', included: true },
      { text: 'Portal educativo', included: true },
      { text: 'Histórico completo', included: true },
      { text: 'Acompanhamento de progresso', included: true },
      { text: 'Suporte por email', included: true },
      { text: 'Múltiplos filhos', included: false },
    ],
    cta: 'Assinar agora',
    ctaVariant: 'primary',
    highlighted: true,
  },
  {
    id: 'professor',
    name: 'Professor',
    badge: 'Para profissionais',
    badgeVariant: 'amber',
    priceMonthly: 79,
    priceAnnual: 63,
    description: 'Para educadores e profissionais de saúde que atendem múltiplos alunos.',
    features: [
      { text: 'Até 30 alunos', included: true },
      { text: 'Atividades ilimitadas', included: true },
      { text: 'Relatórios por aluno', included: true },
      { text: 'Dashboard completo', included: true },
      { text: 'Suporte prioritário', included: true },
      { text: 'Acesso antecipado a novidades', included: true },
    ],
    cta: 'Falar com equipe',
    ctaVariant: 'amber',
    highlighted: false,
  },
]

export default function Planos() {
  const [annual, setAnnual] = useState(false)

  const handleCTA = (plan: Plan) => {
    if (plan.id === 'professor') {
      alert('Em breve! Entre em contato pelo email contato@eduinclusiva.com.br 📧')
    } else {
      alert('Em breve! Estamos preparando algo incrível. 🌱')
    }
  }

  const formatPrice = (price: number) =>
    price === 0 ? 'Grátis' : `R$ ${price}/mês`

  return (
    <section id="planos" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection className="text-center mb-10">
          <span className="inline-block text-sm font-semibold text-[#2D6A4F] bg-[#D1FAE5] px-4 py-1.5 rounded-full mb-4">
            Planos e preços
          </span>
          <h2 className="font-lora font-bold text-4xl sm:text-5xl text-[#1A1A1A] mb-4">
            Comece gratuitamente
          </h2>
          <p className="text-lg text-[#4A5568] max-w-xl mx-auto">
            Escolha o plano que melhor se adapta à sua realidade. Sem taxa de adesão, sem surpresas.
          </p>
        </AnimatedSection>

        {/* Toggle mensal/anual */}
        <AnimatedSection delay={0.1} className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-3 bg-[#F5F0E8] rounded-full p-1.5">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                !annual
                  ? 'bg-white text-[#1B4332] shadow-soft'
                  : 'text-[#4A5568] hover:text-[#1B4332]'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                annual
                  ? 'bg-white text-[#1B4332] shadow-soft'
                  : 'text-[#4A5568] hover:text-[#1B4332]'
              }`}
            >
              Anual
              <span className="bg-[#D1FAE5] text-[#065F46] text-xs font-bold px-1.5 py-0.5 rounded-full">
                -20%
              </span>
            </button>
          </div>
        </AnimatedSection>

        {/* Cards de planos */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan) => {
            const price = annual ? plan.priceAnnual : plan.priceMonthly
            const originalPrice = annual && plan.priceMonthly > 0 ? plan.priceMonthly : null

            return (
              <StaggerItem key={plan.id}>
                <div
                  className={`relative flex flex-col h-full rounded-3xl p-7 transition-all duration-200 ${
                    plan.highlighted
                      ? 'bg-white border-2 border-[#1B4332] shadow-green'
                      : 'bg-white border border-[#F0EBE0] shadow-soft hover:shadow-soft-lg hover:-translate-y-1'
                  }`}
                >
                  {/* Badge popular */}
                  {plan.highlighted && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <Badge variant="green" size="md" className="shadow-soft">
                        ⭐ {plan.badge}
                      </Badge>
                    </div>
                  )}

                  {/* Cabeçalho */}
                  <div className="mb-6">
                    {!plan.highlighted && (
                      <Badge variant={plan.badgeVariant} className="mb-3">
                        {plan.badge}
                      </Badge>
                    )}
                    <h3 className="font-lora font-bold text-2xl text-[#1A1A1A] mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-[#4A5568]">{plan.description}</p>
                  </div>

                  {/* Preço */}
                  <div className="mb-6">
                    {price === 0 ? (
                      <div className="font-lora font-bold text-4xl text-[#1B4332]">Grátis</div>
                    ) : (
                      <div className="flex items-end gap-2">
                        <div className="font-lora font-bold text-4xl text-[#1B4332]">
                          R$ {price}
                          <span className="text-lg font-jakarta font-normal text-[#4A5568]">/mês</span>
                        </div>
                        {originalPrice && (
                          <span className="text-[#9CA3AF] line-through text-base mb-1">
                            R$ {originalPrice}
                          </span>
                        )}
                      </div>
                    )}
                    {annual && price > 0 && (
                      <p className="text-xs text-[#4A5568] mt-1">
                        Cobrado anualmente — R$ {price * 12}/ano
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className="flex items-center gap-2.5">
                        {feature.included ? (
                          <Check className="w-4 h-4 text-[#059669] flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-[#D1D5DB] flex-shrink-0" />
                        )}
                        <span
                          className={`text-sm ${
                            feature.included ? 'text-[#1A1A1A]' : 'text-[#9CA3AF]'
                          }`}
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    variant={plan.ctaVariant}
                    size="lg"
                    fullWidth
                    onClick={() => handleCTA(plan)}
                  >
                    {plan.cta}
                  </Button>
                </div>
              </StaggerItem>
            )
          })}
        </StaggerContainer>

        {/* Nota de rodapé */}
        <AnimatedSection delay={0.4} className="text-center mt-10">
          <p className="text-sm text-[#9CA3AF]">
            Todos os planos incluem acesso ao portal educativo. Cancele quando quiser, sem multas.
          </p>
        </AnimatedSection>
      </div>
    </section>
  )
}
