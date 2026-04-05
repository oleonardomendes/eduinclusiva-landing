'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Lock, CheckCircle, Clock, ChevronRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import AnimatedSection from '@/components/ui/AnimatedSection'

/* ── Tipos ── */
type Condicao = 'Autismo' | 'TDAH' | 'Dislexia' | 'Deficiência Intelectual'
type FaixaEtaria = '4-6 anos' | '7-9 anos' | '10-12 anos'
type Nivel = 'Leve' | 'Moderada'

interface AtividadeResult {
  titulo: string
  objetivo: string
  passos: string[]
  instrucao_familia: string
  duracao: string
  dificuldade: string
}

/* ── Mocks de fallback ── */
const MOCKS: Record<string, AtividadeResult> = {
  default: {
    titulo: 'Sequência de Histórias com Figuras',
    objetivo:
      'Desenvolver sequência lógica e comunicação utilizando figuras de uma história simples do cotidiano.',
    passos: [
      'Separe 4 figuras que mostram uma história (acordar, escovar dentes, tomar café, ir à escola).',
      'Embaralhe as figuras na mesa e peça que seu filho organize na ordem certa.',
    ],
    instrucao_familia:
      'Sente junto com a criança em um ambiente tranquilo, sem distrações. Mostre entusiasmo a cada acerto e ofereça dicas gentis quando errar...',
    duracao: '20 min',
    dificuldade: 'Leve',
  },
  tdah: {
    titulo: 'Caça ao Tesouro dos Números',
    objetivo:
      'Trabalhar atenção e concentração de forma lúdica, usando movimento e recompensa imediata.',
    passos: [
      'Escreva números de 1 a 10 em pedaços de papel e esconda-os pela casa.',
      'Peça que seu filho encontre os papéis e coloque-os em ordem crescente.',
    ],
    instrucao_familia:
      'Mantenha a atividade curta (15-20 min). Faça pausas de movimento entre as rodadas para liberar energia...',
    duracao: '15 min',
    dificuldade: 'Leve',
  },
  dislexia: {
    titulo: 'Leitura com Dedos e Cores',
    objetivo:
      'Facilitar o reconhecimento de palavras e sílabas utilizando pistas visuais e táteis.',
    passos: [
      'Escreva 5 palavras simples em cartões com cores diferentes para cada sílaba.',
      'Peça que seu filho leia apontando cada sílaba com o dedo enquanto lê em voz alta.',
    ],
    instrucao_familia:
      'Elogie cada tentativa, independente do resultado. O processo é mais importante que a velocidade...',
    duracao: '25 min',
    dificuldade: 'Moderada',
  },
}

function getMock(condicao: Condicao): AtividadeResult {
  if (condicao === 'TDAH') return MOCKS.tdah
  if (condicao === 'Dislexia') return MOCKS.dislexia
  return MOCKS.default
}

/* ── Chip selector ── */
function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: T[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-[#4A5568] mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`chip ${value === opt ? 'selected' : ''}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── Loading animado ── */
function LoadingState() {
  const messages = [
    'Analisando o perfil...',
    'Criando atividade personalizada...',
    'Finalizando orientações...',
  ]
  const [msgIndex, setMsgIndex] = useState(0)

  useState(() => {
    const timer = setInterval(() => {
      setMsgIndex((i) => (i + 1) % messages.length)
    }, 900)
    return () => clearInterval(timer)
  })

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-[#D1FAE5]" />
        <div className="absolute inset-0 rounded-full border-4 border-[#1B4332] border-t-transparent animate-spin" />
        <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-[#1B4332]" />
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={msgIndex}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="text-[#4A5568] text-sm font-medium text-center"
        >
          {messages[msgIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}

/* ── Card do resultado ── */
function AtividadeCard({ atividade }: { atividade: AtividadeResult }) {
  const handleVerCompleta = () => alert('Em breve! Crie sua conta gratuita para acessar. 🌱')

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-3xl shadow-soft-lg border border-[#F0EBE0] overflow-hidden"
    >
      {/* Header */}
      <div className="bg-[#1B4332] px-6 py-5">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="green" className="bg-[#A7F3D0] text-[#065F46]">
            ✨ Gerada por IA
          </Badge>
          <Badge variant="amber">
            <Clock className="w-3 h-3" />
            {atividade.duracao}
          </Badge>
        </div>
        <h3 className="text-white font-lora font-bold text-xl leading-tight">
          {atividade.titulo}
        </h3>
      </div>

      <div className="p-6 space-y-5">
        {/* Objetivo */}
        <div className="bg-[#F0F7F4] rounded-2xl p-4">
          <p className="text-[#2D6A4F] text-xs font-bold uppercase tracking-wider mb-1.5">
            Objetivo
          </p>
          <p className="text-[#1A1A1A] text-sm leading-relaxed">{atividade.objetivo}</p>
        </div>

        {/* Passo a passo */}
        <div>
          <p className="text-[#4A5568] text-xs font-bold uppercase tracking-wider mb-3">
            Passo a passo (prévia)
          </p>
          <div className="space-y-2.5">
            {atividade.passos.map((step, i) => (
              <div key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1B4332] text-white text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-sm text-[#4A5568] leading-relaxed pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Instrução família — trecho */}
        <div className="bg-[#FFF8E8] rounded-2xl p-4 border border-[#FDE68A]">
          <p className="text-[#92400E] text-xs font-bold uppercase tracking-wider mb-1.5">
            Instrução para família (prévia)
          </p>
          <p className="text-sm text-[#78350F] leading-relaxed">
            {atividade.instrucao_familia.slice(0, 100)}
            {atividade.instrucao_familia.length > 100 ? '...' : ''}
          </p>
        </div>

        {/* Seção bloqueada */}
        <div className="relative rounded-2xl overflow-hidden border border-[#F0EBE0]">
          {/* Conteúdo borrado por trás */}
          <div className="p-4 space-y-2 opacity-30 select-none pointer-events-none">
            <div className="h-3 bg-[#E2E8F0] rounded-full w-4/5" />
            <div className="h-3 bg-[#E2E8F0] rounded-full w-3/5" />
            <div className="h-3 bg-[#E2E8F0] rounded-full w-4/5" />
            <div className="h-3 bg-[#E2E8F0] rounded-full w-2/5" />
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-white/60 flex flex-col items-center justify-center p-4 text-center">
            <Lock className="w-5 h-5 text-[#1B4332] mb-2" />
            <p className="text-sm font-semibold text-[#1A1A1A] mb-1">
              Orientação completa para o professor
            </p>
            <p className="text-xs text-[#4A5568] mb-3">
              Conteúdo completo · Histórico e progresso do filho
            </p>
            <Button variant="primary" size="sm" onClick={handleVerCompleta} className="gap-1">
              Ver atividade completa — É grátis
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Componente principal ── */
export default function PreviewAtividade() {
  const [condicao, setCondicao] = useState<Condicao>('Autismo')
  const [faixaEtaria, setFaixaEtaria] = useState<FaixaEtaria>('7-9 anos')
  const [nivel, setNivel] = useState<Nivel>('Leve')
  const [loading, setLoading] = useState(false)
  const [atividade, setAtividade] = useState<AtividadeResult | null>(null)

  const gerarAtividade = async () => {
    setLoading(true)
    setAtividade(null)

    try {
      const res = await fetch(
        'https://backend-eduinclusiva-v1.onrender.com/v1/publico/preview-atividade',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ condicao, faixa_etaria: faixaEtaria, nivel }),
          signal: AbortSignal.timeout(12000),
        }
      )

      if (!res.ok) throw new Error('API unavailable')

      const data = await res.json()
      setAtividade(data)
    } catch {
      // Fallback com mock bonito
      await new Promise((r) => setTimeout(r, 1200))
      setAtividade(getMock(condicao))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="preview-atividade" className="py-20 lg:py-28 bg-[#F5F0E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection className="text-center mb-14">
          <span className="inline-block text-sm font-semibold text-[#2D6A4F] bg-[#D1FAE5] px-4 py-1.5 rounded-full mb-4">
            Experimente agora
          </span>
          <h2 className="font-lora font-bold text-4xl sm:text-5xl text-[#1A1A1A] mb-4">
            Veja como funciona, agora
          </h2>
          <p className="text-lg text-[#4A5568] max-w-xl mx-auto">
            Gere uma atividade de exemplo.{' '}
            <strong className="text-[#1B4332]">Gratuitamente. Sem cadastro.</strong>
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Formulário */}
          <AnimatedSection direction="left">
            <div className="bg-white rounded-3xl shadow-soft p-7 space-y-7">
              <ChipGroup<Condicao>
                label="1. Condição"
                options={['Autismo', 'TDAH', 'Dislexia', 'Deficiência Intelectual']}
                value={condicao}
                onChange={setCondicao}
              />
              <ChipGroup<FaixaEtaria>
                label="2. Faixa etária"
                options={['4-6 anos', '7-9 anos', '10-12 anos']}
                value={faixaEtaria}
                onChange={setFaixaEtaria}
              />
              <ChipGroup<Nivel>
                label="3. Nível de suporte"
                options={['Leve', 'Moderada']}
                value={nivel}
                onChange={setNivel}
              />

              <Button
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                onClick={gerarAtividade}
                className="mt-2"
              >
                {!loading && <Sparkles className="w-5 h-5" />}
                {loading ? 'Gerando atividade...' : '✨ Gerar atividade de exemplo'}
              </Button>

              {/* Garantias */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                {['Sem cadastro', 'Gratuito', 'Resultado em segundos'].map((item) => (
                  <div key={item} className="flex items-center gap-1.5 text-xs text-[#4A5568]">
                    <CheckCircle className="w-3.5 h-3.5 text-[#2D6A4F] flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Resultado */}
          <AnimatedSection direction="right">
            <div className="min-h-[300px]">
              {!atividade && !loading && (
                <div className="bg-white rounded-3xl border-2 border-dashed border-[#D1FAE5] h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 bg-[#F0F7F4] rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-[#2D6A4F]" />
                  </div>
                  <p className="font-semibold text-[#1A1A1A] mb-1">Sua atividade aparecerá aqui</p>
                  <p className="text-sm text-[#4A5568]">
                    Selecione as opções ao lado e clique em gerar
                  </p>
                </div>
              )}
              {loading && (
                <div className="bg-white rounded-3xl shadow-soft min-h-[300px]">
                  <LoadingState />
                </div>
              )}
              {atividade && !loading && <AtividadeCard atividade={atividade} />}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
