'use client'

import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { getPaciente, getEvolucaoModulo } from '@/lib/api'
import { getToken, getUser } from '@/lib/auth'
import { MODULOS_CONFIG } from '@/lib/modulos'
import ModalSessao from '@/components/especialista/ModalSessao'
import AbaSessoesModulo from '@/components/especialista/modulo/AbaSessoesModulo'
import AbaAvaliacaoModulo from '@/components/especialista/modulo/AbaAvaliacaoModulo'
import AbaAtividadeIA from '@/components/especialista/modulo/AbaAtividadeIA'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface HabilidadeData {
  atual: string | null
  historico: Array<{ data: string; valor: string }>
  tendencia: string
}

interface DadosModulo {
  total_sessoes?: number
  habilidades?: Record<string, HabilidadeData>
  relatorio_ia?: {
    pontos_positivos: string[]
    areas_atencao: string[]
    sugestoes_sessao: string[]
    orientacoes_familia: string[]
    resumo: string
  } | null
}

interface Paciente {
  id: number
  nome: string
  condicao?: string
  grau?: string
  idade?: number
  [key: string]: unknown
}

// ─── Semáforo ─────────────────────────────────────────────────────────────────

const VERDE = new Set([
  'consolidado', 'consolidada', 'boa', 'adequada', 'adequado', 'independente',
  'fluente', 'amplo', 'normal', 'sem_seletividade', 'alfabetico', 'cooperativo',
  'consistente', 'conversacional', 'intraverbal', 'independente_adequada',
  'muito_positivo', 'positivo', 'complexas',
])
const AMARELO = new Set([
  'em_desenvolvimento', 'regular', 'supervisao', 'silabico_alfabetico', 'silabico',
  'levemente_comprometida', 'basica', 'moderado', 'leve', 'reduzido', 'reduzida',
  'precario', 'ocasional', 'frequente', 'associativo', 'paralelo',
  'com_auxilio_parcial', 'independente_alterada', 'frases_simples', 'palavras_isoladas',
  '2_passos', '3_passos', 'hipotonia_leve', 'hipertonia_leve', 'baixo', 'minimo',
  'neutro', 'abaixo_peso', 'ecoico', 'mando', 'tato', 'funcional_simples',
  'assistida', 'frases_complexas',
])

function getSemaforo(v: string | null): 'verde' | 'amarelo' | 'vermelho' | 'cinza' {
  if (!v) return 'cinza'
  if (VERDE.has(v)) return 'verde'
  if (AMARELO.has(v)) return 'amarelo'
  return 'vermelho'
}

const SEMAFORO_DOT: Record<string, string> = {
  verde:    'bg-green-500',
  amarelo:  'bg-yellow-400',
  vermelho: 'bg-red-400',
  cinza:    'bg-gray-300',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatValor(s: string) {
  return s.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())
}

function formatDataCurta(d?: string) {
  if (!d) return '—'
  return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function SkeletonRect({ className }: { className: string }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
}

// ─── SlideOver ────────────────────────────────────────────────────────────────

function SlideOver({ aberto, onFechar, titulo, children }: {
  aberto: boolean
  onFechar: () => void
  titulo: string
  children: ReactNode
}) {
  return (
    <AnimatePresence>
      {aberto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onFechar()}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-[#FDFBF7] shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
              <h2 className="font-bold text-sm text-[#1B4332]">{titulo}</h2>
              <button onClick={onFechar} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function ModuloClinico() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const modulo = params.modulo as string

  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [dados, setDados] = useState<DadosModulo | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erroRender, setErroRender] = useState<string | null>(null)

  const [modalSessaoAberto, setModalSessaoAberto] = useState(false)
  const [slideOver, setSlideOver] = useState<'sessoes' | 'avaliacao' | 'atividade' | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const [habExpandida, setHabExpandida] = useState<string | null>(null)
  const [iaExpandido, setIaExpandido] = useState(false)
  const [modoEdicaoIA, setModoEdicaoIA] = useState(false)
  const [textoIAEditado, setTextoIAEditado] = useState('')
  const [toastCopiado, setToastCopiado] = useState(false)
  const [toast, setToast] = useState('')

  const config = MODULOS_CONFIG[modulo]

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const token = getToken()
    if (!token) { router.push('/login'); return }
    const user = getUser()
    if (user?.papel !== 'especialista') { router.push('/login'); return }

    const carregar = async () => {
      setCarregando(true)
      try {
        const [pacRes, evolRes] = await Promise.allSettled([
          getPaciente(Number(id), token),
          getEvolucaoModulo(Number(id), modulo, token),
        ])
        if (pacRes.status === 'fulfilled') setPaciente(pacRes.value as Paciente)
        if (evolRes.status === 'fulfilled') setDados(evolRes.value as DadosModulo)
        if (evolRes.status === 'rejected') setDados(null)
      } catch (e) {
        const err = e as { message?: string }
        setErroRender(err?.message ?? 'Erro ao carregar dados')
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [id, modulo, reloadKey])

  const mostrarToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleSessaoSalva = () => {
    setModalSessaoAberto(false)
    setReloadKey((k) => k + 1)
    mostrarToast('Sessão registrada com sucesso!')
  }

  const copiarIA = (texto: string) => {
    navigator.clipboard.writeText(texto)
    setToastCopiado(true)
    setTimeout(() => setToastCopiado(false), 2000)
  }

  if (erroRender) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-lg w-full">
          <p className="text-xs text-red-600 mb-3">{erroRender}</p>
          <button onClick={() => router.push(`/especialista/paciente/${id}`)} className="text-xs text-red-500 underline">
            ← Voltar para o paciente
          </button>
        </div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Módulo não encontrado</p>
      </div>
    )
  }

  const totalSessoes    = dados?.total_sessoes ?? 0
  const habilidades     = dados?.habilidades ?? {}
  const relatorioIA     = dados?.relatorio_ia ?? null
  const listaHabilidades = config.habilidades ?? []

  const habConsolidadas = Object.values(habilidades).filter(
    (h) => h?.atual === 'consolidado' || h?.atual === 'consolidada'
  ).length
  const habAtencao = Object.values(habilidades).filter(
    (h) => getSemaforo(h?.atual ?? null) === 'vermelho'
  ).length

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24">

      {/* Header */}
      <header className="bg-[#1B4332] text-white sticky top-0 z-20">
        <div className="px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push(`/especialista/paciente/${id}`)}
            className="text-white/50 hover:text-white transition-colors shrink-0 text-lg leading-none"
          >
            ←
          </button>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 ${config.corIcone}`}>
            {config.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold leading-tight">{config.label}</h1>
            <p className="text-xs text-white/50 truncate">{paciente?.nome ?? '...'}</p>
          </div>
          <button
            onClick={() => setModalSessaoAberto(true)}
            className="shrink-0 bg-[#F59E0B] text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-amber-400 transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Sessão
          </button>
        </div>
      </header>

      <div className="px-4 sm:px-6 py-5 max-w-2xl mx-auto space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {carregando ? (
            [1, 2, 3].map((i) => <SkeletonRect key={i} className="h-20" />)
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                <span className="text-2xl font-bold text-[#1B4332] block">{totalSessoes}</span>
                <span className="text-xs text-gray-400 mt-1 block">Sessões</span>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                <span className="text-2xl font-bold text-green-600 block">{habConsolidadas}</span>
                <span className="text-xs text-gray-400 mt-1 block">Consolidadas</span>
              </div>
              <div className={`rounded-2xl border p-4 text-center ${habAtencao > 0 ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}>
                <span className={`text-2xl font-bold block ${habAtencao > 0 ? 'text-red-500' : 'text-gray-300'}`}>
                  {habAtencao}
                </span>
                <span className="text-xs text-gray-400 mt-1 block">Atenção</span>
              </div>
            </>
          )}
        </div>

        {/* Habilidades */}
        {carregando ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            {[1, 2, 3, 4].map((i) => <SkeletonRect key={i} className="h-8" />)}
          </div>
        ) : listaHabilidades.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-50">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Habilidades</p>
            </div>
            <div className="divide-y divide-gray-50">
              {listaHabilidades.map((hab) => {
                const dadosHab   = habilidades[hab]
                const statusAtual = dadosHab?.atual ?? null
                const semaforo   = getSemaforo(statusAtual)
                const tendencia  = dadosHab?.tendencia ?? null
                const historico  = dadosHab?.historico ?? []
                const expandida  = habExpandida === hab
                const labelHab   = hab.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())

                return (
                  <div key={hab}>
                    <button
                      onClick={() => setHabExpandida(expandida ? null : hab)}
                      className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left"
                    >
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${SEMAFORO_DOT[semaforo]}`} />
                      <span className="text-sm text-gray-700 flex-1 min-w-0 truncate">{labelHab}</span>
                      {statusAtual && (
                        <span className="text-xs text-gray-400 shrink-0">{formatValor(statusAtual)}</span>
                      )}
                      {tendencia === 'melhorando' && (
                        <span className="text-green-500 text-xs font-bold shrink-0">↑</span>
                      )}
                      {tendencia === 'precisa_atencao' && (
                        <span className="text-red-400 text-xs font-bold shrink-0">↓</span>
                      )}
                      {historico.length > 0 && (
                        expandida
                          ? <ChevronUp className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                          : <ChevronDown className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      )}
                    </button>

                    <AnimatePresence>
                      {expandida && historico.length > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-4 pt-1">
                            <div className="flex gap-4 overflow-x-auto pb-1">
                              {[...historico].reverse().map((h, i) => (
                                <div key={i} className="flex flex-col items-center gap-1 shrink-0">
                                  <span className={`w-2 h-2 rounded-full ${SEMAFORO_DOT[getSemaforo(h.valor)]}`} />
                                  <span className="text-[10px] text-gray-500 text-center whitespace-nowrap">
                                    {formatValor(h.valor)}
                                  </span>
                                  <span className="text-[9px] text-gray-300 whitespace-nowrap">
                                    {formatDataCurta(h.data)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}

        {/* Relatório IA */}
        {!carregando && relatorioIA && (
          <div className="rounded-2xl border-2 border-dashed border-[#F59E0B]/40 overflow-hidden">
            <button
              onClick={() => setIaExpandido((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-4 bg-[#F59E0B]/5 hover:bg-[#F59E0B]/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span>✨</span>
                <span className="text-sm font-semibold text-[#92400E]">Rascunho de relatório</span>
                <span className="text-[10px] font-semibold text-[#92400E] bg-[#F59E0B]/20 px-2 py-0.5 rounded-full border border-[#F59E0B]/30">
                  Sugestão IA
                </span>
              </div>
              {iaExpandido
                ? <ChevronUp className="w-4 h-4 text-[#92400E]" />
                : <ChevronDown className="w-4 h-4 text-[#92400E]" />}
            </button>

            <AnimatePresence>
              {iaExpandido && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 pt-4 space-y-4 bg-white">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2">
                      <span className="shrink-0">⚠️</span>
                      <p className="text-xs text-amber-800">
                        Revise e adapte antes de usar. Não substitui o julgamento profissional.
                      </p>
                    </div>

                    {relatorioIA.resumo && (
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Resumo</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{relatorioIA.resumo}</p>
                      </div>
                    )}

                    {[
                      { label: '✓ Pontos positivos', cor: 'text-green-600', items: relatorioIA.pontos_positivos },
                      { label: '⚠ Áreas de atenção', cor: 'text-amber-600', items: relatorioIA.areas_atencao },
                      { label: '💡 Sugestões para próxima sessão', cor: 'text-blue-600', items: relatorioIA.sugestoes_sessao },
                      { label: '🏠 Orientações para a família', cor: 'text-[#1B4332]', items: relatorioIA.orientacoes_familia },
                    ].filter((s) => s.items.length > 0).map(({ label, cor, items }) => (
                      <div key={label}>
                        <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1.5 ${cor}`}>{label}</p>
                        <ul className="space-y-1">
                          {items.map((p, i) => (
                            <li key={i} className="flex gap-2 text-xs text-gray-600">
                              <span className="shrink-0">•</span>{p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}

                    {!modoEdicaoIA ? (
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => {
                            const texto = [
                              relatorioIA.resumo ?? '',
                              '\nPontos positivos:',
                              ...(relatorioIA.pontos_positivos ?? []).map((p) => `• ${p}`),
                              '\nÁreas de atenção:',
                              ...(relatorioIA.areas_atencao ?? []).map((p) => `• ${p}`),
                              '\nSugestões:',
                              ...(relatorioIA.sugestoes_sessao ?? []).map((p) => `• ${p}`),
                              '\nOrientações para família:',
                              ...(relatorioIA.orientacoes_familia ?? []).map((p) => `• ${p}`),
                            ].join('\n')
                            setTextoIAEditado(texto)
                            setModoEdicaoIA(true)
                          }}
                          className="flex-1 py-2.5 bg-[#1B4332] text-white rounded-xl text-xs font-semibold hover:bg-[#2D6A4F] transition-colors"
                        >
                          ✏️ Editar e usar
                        </button>
                        <button
                          onClick={() =>
                            copiarIA(
                              [
                                relatorioIA.resumo ?? '',
                                ...(relatorioIA.pontos_positivos ?? []),
                                ...(relatorioIA.areas_atencao ?? []),
                                ...(relatorioIA.sugestoes_sessao ?? []),
                                ...(relatorioIA.orientacoes_familia ?? []),
                              ].join('\n')
                            )
                          }
                          className="px-4 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-xs hover:border-gray-300 transition-colors"
                        >
                          Copiar
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <textarea
                          value={textoIAEditado}
                          onChange={(e) => setTextoIAEditado(e.target.value)}
                          rows={10}
                          className="w-full text-xs font-mono border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 resize-none leading-relaxed"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => copiarIA(textoIAEditado)}
                            className="flex-1 py-2.5 bg-[#1B4332] text-white rounded-xl text-xs font-semibold hover:bg-[#2D6A4F] transition-colors"
                          >
                            📋 Copiar editado
                          </button>
                          <button
                            onClick={() => setModoEdicaoIA(false)}
                            className="px-4 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-xs transition-colors"
                          >
                            Fechar
                          </button>
                        </div>
                      </div>
                    )}

                    {toastCopiado && (
                      <p className="text-center text-xs text-green-600 font-semibold">✓ Copiado!</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {!carregando && !relatorioIA && totalSessoes >= 1 && (
          <button className="w-full py-4 border-2 border-dashed border-[#F59E0B]/40 rounded-2xl text-sm font-medium text-[#92400E] hover:bg-[#F59E0B]/5 transition-colors">
            ✨ Gerar rascunho de relatório com IA
          </button>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'sessoes',   emoji: '📋', label: 'Sessões' },
            { id: 'avaliacao', emoji: '📊', label: 'Avaliação' },
            { id: 'atividade', emoji: '✨', label: 'Atividade IA' },
          ].map(({ id: sid, emoji, label }) => (
            <button
              key={sid}
              onClick={() => setSlideOver(sid as 'sessoes' | 'avaliacao' | 'atividade')}
              className="flex flex-col items-center gap-2 bg-white rounded-2xl border border-gray-100 p-4 hover:border-[#1B4332]/20 hover:bg-[#1B4332]/5 transition-colors"
            >
              <span className="text-xl">{emoji}</span>
              <span className="text-xs font-semibold text-gray-600">{label}</span>
            </button>
          ))}
        </div>

      </div>

      {/* Sticky bottom bar — mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-100 px-4 py-3 sm:hidden">
        <div className="flex gap-2 max-w-lg mx-auto">
          <button
            onClick={() => setModalSessaoAberto(true)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#F59E0B] text-white py-3 rounded-xl text-sm font-bold hover:bg-amber-400 transition-colors"
          >
            <Plus className="w-4 h-4" /> Nova sessão
          </button>
          <button
            onClick={() => setSlideOver('avaliacao')}
            className="flex-1 flex items-center justify-center bg-white border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            📊 Avaliação
          </button>
          <button
            onClick={() => setSlideOver('atividade')}
            className="flex-1 flex items-center justify-center bg-white border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            ✨ IA
          </button>
        </div>
      </div>

      {/* Slide-overs */}
      <SlideOver
        aberto={slideOver === 'sessoes'}
        onFechar={() => setSlideOver(null)}
        titulo={`Sessões — ${config.label}`}
      >
        <AbaSessoesModulo pacienteId={id} modulo={modulo} />
      </SlideOver>
      <SlideOver
        aberto={slideOver === 'avaliacao'}
        onFechar={() => setSlideOver(null)}
        titulo={`Avaliação — ${config.label}`}
      >
        <AbaAvaliacaoModulo pacienteId={id} modulo={modulo} paciente={paciente} />
      </SlideOver>
      <SlideOver
        aberto={slideOver === 'atividade'}
        onFechar={() => setSlideOver(null)}
        titulo={`Atividade IA — ${config.label}`}
      >
        <AbaAtividadeIA pacienteId={id} modulo={modulo} paciente={paciente} />
      </SlideOver>

      {/* Modal nova sessão */}
      {paciente && (
        <ModalSessao
          aberto={modalSessaoAberto}
          onFechar={() => setModalSessaoAberto(false)}
          pacienteId={paciente.id}
          especialidadeInicial={config.label}
          onSalvo={handleSessaoSalva}
        />
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#1B4332] text-white px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold whitespace-nowrap sm:bottom-6"
          >
            ✓ {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
