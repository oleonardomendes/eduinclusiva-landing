'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { api } from '@/lib/api'
import { getToken, getUser, clearAuth } from '@/lib/auth'

// ─── Dados das perguntas ───────────────────────────────────────────────────────

const perguntas = [
  {
    id: 'p1',
    texto: 'Como {nome} aprende melhor uma coisa nova?',
    opcoes: [
      { id: 'a', texto: 'Vendo imagens, vídeos ou demonstrações' },
      { id: 'b', texto: 'Ouvindo explicações e conversando' },
      { id: 'c', texto: 'Tocando, fazendo com as mãos ou experimentando' },
    ],
  },
  {
    id: 'p2',
    texto: 'Quando está animado, como {nome} demonstra?',
    opcoes: [
      { id: 'a', texto: 'Faz expressões faciais, aponta e olha muito' },
      { id: 'b', texto: 'Fala bastante, canta ou faz sons' },
      { id: 'c', texto: 'Pula, abraça, não consegue ficar parado' },
    ],
  },
  {
    id: 'p3',
    texto: 'Como {nome} prefere brincar?',
    opcoes: [
      { id: 'a', texto: 'Com puzzles, desenhos, construções visuais' },
      { id: 'b', texto: 'Com músicas, histórias, brincadeiras de faz-de-conta' },
      { id: 'c', texto: 'Com objetos para manipular, correr, pular' },
    ],
  },
  {
    id: 'p4',
    texto: 'Quando precisa lembrar de algo, o que funciona melhor para {nome}?',
    opcoes: [
      { id: 'a', texto: 'Ver escrito, ver imagens ou fotos' },
      { id: 'b', texto: 'Repetir em voz alta ou ouvir alguém falar' },
      { id: 'c', texto: 'Fazer a ação, simular ou usar o corpo' },
    ],
  },
  {
    id: 'p5',
    texto: 'Como {nome} reage a histórias?',
    opcoes: [
      { id: 'a', texto: 'Fica atento quando tem imagens ou gestos' },
      { id: 'b', texto: 'Gosta de ouvir, pede para repetir, faz perguntas' },
      { id: 'c', texto: 'Quer encenar, imitar os personagens' },
    ],
  },
  {
    id: 'p6',
    texto: 'O que mais prende a atenção de {nome}?',
    opcoes: [
      { id: 'a', texto: 'Cores, formas, televisão, livros ilustrados' },
      { id: 'b', texto: 'Música, rádio, podcasts, conversas' },
      { id: 'c', texto: 'Esportes, dança, artes manuais, culinária' },
    ],
  },
  {
    id: 'p7',
    texto: 'Como {nome} se comunica melhor?',
    opcoes: [
      { id: 'a', texto: 'Aponta, desenha, usa gestos e expressões' },
      { id: 'b', texto: 'Fala muito, explica com detalhes' },
      { id: 'c', texto: 'Demonstra fazendo, usa o corpo para explicar' },
    ],
  },
  {
    id: 'p8',
    texto: 'O que {nome} faz quando está entediado?',
    opcoes: [
      { id: 'a', texto: 'Olha ao redor, observa detalhes, rabisca' },
      { id: 'b', texto: 'Faz sons, fala sozinho, canta' },
      { id: 'c', texto: 'Mexe em tudo, não consegue ficar quieto' },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function interpolate(texto: string, nome: string) {
  return texto.replace(/\{nome\}/g, nome)
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function QuestionarioPage() {
  const router = useRouter()

  const [filho, setFilho] = useState<{
    nome?: string
    condicao?: string
    idade?: number
    grau_necessidade?: string
  } | null>(null)

  const [step, setStep] = useState(0) // 0-7 = perguntas, 8 = resultado
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [slowNetwork, setSlowNetwork] = useState(false)
  const [resultado, setResultado] = useState<{ estilo: string; relatorio: string } | null>(null)
  const [erro, setErro] = useState('')

  // ── Auth check ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = getToken()
    if (!t) {
      router.replace('/cadastro')
      return
    }
    const filhoData = localStorage.getItem('edu_filho_data')
    if (filhoData) setFilho(JSON.parse(filhoData))
  }, [router])

  const nomeFilho = filho?.nome ?? 'seu filho'
  const perguntaAtual = perguntas[step]
  const respostaAtual = respostas[perguntaAtual?.id ?? '']
  const totalPerguntas = perguntas.length

  const handleOpcao = (opcaoId: string) => {
    setRespostas((prev) => ({ ...prev, [perguntaAtual.id]: opcaoId }))
  }

  const handleProxima = () => {
    if (step < totalPerguntas - 1) setStep((s) => s + 1)
  }

  const handleAnterior = () => {
    if (step > 0) setStep((s) => s - 1)
  }

  const handleFinalizar = async () => {
    const t = getToken()
    const filhoId = localStorage.getItem('edu_filho_id')
    if (!t || !filhoId) return

    setErro('')
    setSubmitting(true)
    const slowTimer = setTimeout(() => setSlowNetwork(true), 5000)

    try {
      const data = await api.post(
        `/v1/familia/filhos/${filhoId}/questionario-estilo`,
        {
          respostas,
          condicao: filho?.condicao,
          idade: filho?.idade,
          grau: filho?.grau_necessidade,
        },
        t
      )

      // Atualiza dados do filho no localStorage
      const filhoData = localStorage.getItem('edu_filho_data')
      if (filhoData) {
        const filhoAtual = JSON.parse(filhoData)
        const filhoAtualizado = {
          ...filhoAtual,
          estilo_aprendizagem: data.estilo ?? data.estilo_aprendizagem,
          relatorio_estilo: data.relatorio ?? data.relatorio_estilo ?? data.resultado,
        }
        localStorage.setItem('edu_filho_data', JSON.stringify(filhoAtualizado))
      }

      setResultado({
        estilo: data.estilo ?? data.estilo_aprendizagem ?? 'Identificado',
        relatorio: data.relatorio ?? data.relatorio_estilo ?? data.resultado ?? '',
      })
      setStep(totalPerguntas) // tela de resultado
    } catch (err: unknown) {
      const e = err as { message?: string; detail?: string }
      setErro(e?.message || e?.detail || 'Não foi possível processar o questionário. Tente novamente.')
    } finally {
      clearTimeout(slowTimer)
      setSubmitting(false)
      setSlowNetwork(false)
    }
  }

  const handleSair = () => {
    clearAuth()
    localStorage.removeItem('edu_filho_id')
    localStorage.removeItem('edu_filho_data')
    router.push('/')
  }

  // ── Tela de resultado ──────────────────────────────────────────────────────
  if (step === totalPerguntas && resultado) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <header className="bg-[#1B4332] sticky top-0 z-40">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <Logo size="md" theme="dark" />
            </Link>
            <button
              onClick={handleSair}
              className="flex items-center gap-1.5 text-[#FDFBF7]/80 hover:text-[#FDFBF7] text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Sair</span>
            </button>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="font-lora font-bold text-3xl text-[#1A1A1A] mb-2">
              {nomeFilho} é um aprendiz {resultado.estilo}!
            </h1>
            <p className="text-[#4A5568]">
              Aqui está o relatório personalizado da nossa IA
            </p>
          </motion.div>

          {resultado.relatorio && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl border border-[#F0EBE0] shadow-soft p-6 mb-6"
            >
              <div className="prose prose-sm max-w-none text-[#4A5568] leading-relaxed whitespace-pre-line">
                {resultado.relatorio}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <Link
              href="/familia"
              className="inline-flex items-center gap-2 bg-[#1B4332] text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-[#2D6A4F] transition-colors shadow-green"
            >
              Voltar ao dashboard
            </Link>
          </motion.div>
        </main>
      </div>
    )
  }

  // ── Tela das perguntas ─────────────────────────────────────────────────────
  const progresso = ((step + (respostaAtual ? 1 : 0)) / totalPerguntas) * 100

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <header className="bg-[#1B4332] sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Logo size="md" theme="dark" />
          </Link>
          <button
            onClick={handleSair}
            className="flex items-center gap-1.5 text-[#FDFBF7]/80 hover:text-[#FDFBF7] text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Sair</span>
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 text-center"
        >
          <h1 className="font-lora font-bold text-2xl sm:text-3xl text-[#1A1A1A] mb-1">
            Descobrindo como {nomeFilho} aprende
          </h1>
          <p className="text-[#718096] text-sm">
            8 perguntas simples sobre o comportamento do seu filho
          </p>
        </motion.div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-[#718096] mb-2">
            <span>Pergunta {step + 1} de {totalPerguntas}</span>
            <span>{Math.round(progresso)}%</span>
          </div>
          <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#1B4332] rounded-full"
              animate={{ width: `${progresso}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Card da pergunta */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            <div className="bg-white rounded-3xl border border-[#F0EBE0] shadow-soft p-6 sm:p-8 mb-6">
              <p className="font-lora font-semibold text-xl text-[#1A1A1A] mb-6 leading-snug">
                {interpolate(perguntaAtual.texto, nomeFilho)}
              </p>

              <div className="space-y-3">
                {perguntaAtual.opcoes.map((opcao) => {
                  const selecionada = respostaAtual === opcao.id
                  return (
                    <button
                      key={opcao.id}
                      onClick={() => handleOpcao(opcao.id)}
                      className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-200 font-medium text-sm sm:text-base leading-relaxed ${
                        selecionada
                          ? 'border-[#1B4332] bg-[#F0F7F4] text-[#1B4332]'
                          : 'border-[#E2E8F0] bg-white text-[#4A5568] hover:border-[#2D6A4F] hover:bg-[#F8FDFB]'
                      }`}
                    >
                      <span className={`inline-flex w-6 h-6 rounded-full border-2 items-center justify-center mr-3 text-xs font-bold flex-shrink-0 align-middle ${
                        selecionada
                          ? 'border-[#1B4332] bg-[#1B4332] text-white'
                          : 'border-[#CBD5E0] text-[#718096]'
                      }`}>
                        {opcao.id.toUpperCase()}
                      </span>
                      {opcao.texto}
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Erro */}
        {erro && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 mb-4">
            {erro}
          </div>
        )}

        {/* Aviso rede lenta */}
        {slowNetwork && (
          <div className="bg-amber-50 text-amber-700 text-sm px-4 py-3 rounded-xl border border-amber-100 mb-4">
            Aguarde, estamos acordando o servidor... (pode levar 30s)
          </div>
        )}

        {/* Navegação */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handleAnterior}
            disabled={step === 0}
            className="flex items-center gap-1.5 px-5 py-3 rounded-xl border-2 border-[#E2E8F0] text-[#4A5568] font-medium text-sm hover:border-[#2D6A4F] hover:text-[#1B4332] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>

          {step < totalPerguntas - 1 ? (
            <button
              onClick={handleProxima}
              disabled={!respostaAtual}
              className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-[#1B4332] text-white font-semibold text-sm hover:bg-[#2D6A4F] transition-colors shadow-green disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Próxima
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinalizar}
              disabled={!respostaAtual || submitting}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F59E0B] text-white font-semibold text-sm hover:bg-[#D97706] transition-colors shadow-soft disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Spinner />
                  Analisando...
                </>
              ) : (
                <>
                  Ver resultado ✨
                </>
              )}
            </button>
          )}
        </div>

        {/* Indicadores de progresso */}
        <div className="flex justify-center gap-1.5 mt-6">
          {perguntas.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                // Permite voltar para perguntas já respondidas
                if (i <= step || respostas[perguntas[i - 1]?.id]) setStep(i)
              }}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                i === step
                  ? 'bg-[#1B4332] w-4'
                  : respostas[perguntas[i].id]
                  ? 'bg-[#2D6A4F]'
                  : 'bg-[#E2E8F0]'
              }`}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
