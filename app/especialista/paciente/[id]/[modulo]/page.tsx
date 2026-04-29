'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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

interface UltimaSessaoData {
  humor?: string
  data?: string
  duracao_minutos?: number
  o_que_funcionou?: string
  o_que_nao_funcionou?: string
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
  ultima_sessao?: UltimaSessaoData | null
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatValor(s: string) {
  return s.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())
}

function SkeletonRect({ className }: { className: string }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
}

// ─── AccordionSecao ────────────────────────────────────────────────────────────

function AccordionSecao({
  emoji, titulo, subtitulo, aberta, onToggle, children, destaque = false,
}: {
  emoji: string
  titulo: string
  subtitulo: string
  aberta: boolean
  onToggle: () => void
  children: React.ReactNode
  destaque?: boolean
}) {
  return (
    <div className={`rounded-2xl border-2 overflow-hidden transition-all bg-white ${
      destaque
        ? aberta
          ? 'border-[#F59E0B] shadow-md shadow-amber-100'
          : 'border-[#F59E0B]/30 hover:border-[#F59E0B]/60'
        : aberta
          ? 'border-[#1B4332]/20 shadow-md'
          : 'border-gray-100 hover:border-gray-200'
    }`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-gray-50/50"
      >
        <span className="text-2xl shrink-0">{emoji}</span>
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold leading-tight ${destaque ? 'text-[#92400E]' : 'text-[#1B4332]'}`}>
            {titulo}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{subtitulo}</p>
        </div>
        <span className={`shrink-0 transition-transform duration-200 text-gray-300 text-sm ${aberta ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>
      {aberta && (
        <div className="border-t border-gray-100 p-4">
          {children}
        </div>
      )}
    </div>
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
  const [secaoAberta, setSecaoAberta] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const [habExpandida, setHabExpandida] = useState<string | null>(null)
  const [relatorioAberto, setRelatorioAberto] = useState(false)
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

  const totalSessoes     = dados?.total_sessoes ?? 0
  const habilidades      = dados?.habilidades ?? {}
  const relatorioIA      = dados?.relatorio_ia ?? null
  const ultimaSessao     = dados?.ultima_sessao ?? null
  const listaHabilidades = config.habilidades ?? []
  const totalHabilidades = listaHabilidades.length

  const habConsolidadas = Object.values(habilidades).filter(
    (h) => h?.atual === 'consolidado' || h?.atual === 'consolidada'
  ).length
  const habEmDev = Object.values(habilidades).filter(
    (h) => getSemaforo(h?.atual ?? null) === 'amarelo'
  ).length
  const habAtencao = Object.values(habilidades).filter(
    (h) => getSemaforo(h?.atual ?? null) === 'vermelho'
  ).length

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-12">

      {/* Header */}
      <header className="bg-[#1B4332] text-white sticky top-0 z-20">
        <div className="px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push(`/especialista/paciente/${id}`)}
            className="text-white/50 hover:text-white transition-colors shrink-0"
          >
            ←
          </button>
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-lg shrink-0">
            {config?.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold leading-tight truncate">{config?.label}+</h1>
            <p className="text-xs text-white/50 truncate">{paciente?.nome}</p>
          </div>
          <button
            onClick={() => setModalSessaoAberto(true)}
            className="shrink-0 bg-[#F59E0B] text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-amber-400 transition-all shadow-lg hover:shadow-amber-500/30 flex items-center gap-1.5"
          >
            <span className="text-base leading-none">+</span>
            Sessão
          </button>
        </div>
      </header>

      {/* Seção 1 — Status rápido */}
      <div className="px-4 sm:px-6 pt-6 pb-4 max-w-2xl mx-auto">
        {carregando ? (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[1, 2, 3].map((i) => <SkeletonRect key={i} className="h-20" />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                <span className="text-2xl font-bold text-[#1B4332] block">{totalSessoes}</span>
                <span className="text-xs text-gray-400 mt-0.5 block">Sessões</span>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                <span className="text-2xl font-bold text-green-600 block">{habConsolidadas}</span>
                <span className="text-xs text-gray-400 mt-0.5 block">Consolidadas</span>
              </div>
              <div className={`rounded-2xl border shadow-sm p-4 text-center ${habAtencao > 0 ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}>
                <span className={`text-2xl font-bold block ${habAtencao > 0 ? 'text-red-500' : 'text-gray-300'}`}>
                  {habAtencao}
                </span>
                <span className="text-xs text-gray-400 mt-0.5 block">Atenção</span>
              </div>
            </div>

            {totalHabilidades > 0 && (
              <>
                <div className="flex rounded-full overflow-hidden h-2 gap-0.5">
                  <div className="bg-green-500 transition-all duration-500" style={{ width: `${(habConsolidadas / totalHabilidades) * 100}%` }} />
                  <div className="bg-yellow-400 transition-all duration-500" style={{ width: `${(habEmDev / totalHabilidades) * 100}%` }} />
                  <div className="bg-red-400 transition-all duration-500" style={{ width: `${(habAtencao / totalHabilidades) * 100}%` }} />
                  <div className="bg-gray-200 flex-1" />
                </div>
                <div className="flex gap-4 mt-2">
                  {habConsolidadas > 0 && (
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                      {habConsolidadas} consolidada{habConsolidadas > 1 ? 's' : ''}
                    </span>
                  )}
                  {habEmDev > 0 && (
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                      {habEmDev} em desenvolvimento
                    </span>
                  )}
                  {habAtencao > 0 && (
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                      {habAtencao} precisam de atenção
                    </span>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Seção 2 — Habilidades */}
      {!carregando && listaHabilidades.length > 0 && (
        <div className="px-4 sm:px-6 pb-6 max-w-2xl mx-auto">
          <h2 className="font-serif font-bold text-[#1B4332] text-base mb-4">Habilidades</h2>
          <div className="flex flex-col gap-2">
            {listaHabilidades.map((hab) => {
              const dadosHab  = habilidades[hab]
              const status    = dadosHab?.atual ?? 'nao_avaliado'
              const historico = dadosHab?.historico ?? []
              const tendencia = dadosHab?.tendencia ?? 'estavel'
              const expanded  = habExpandida === hab

              const statusVisual = ({
                consolidado:        { cor: '#22c55e', bg: 'bg-green-50',  label: 'Consolidado'        },
                consolidada:        { cor: '#22c55e', bg: 'bg-green-50',  label: 'Consolidado'        },
                em_desenvolvimento: { cor: '#f59e0b', bg: 'bg-yellow-50', label: 'Em desenvolvimento'  },
                emergente:          { cor: '#ef4444', bg: 'bg-red-50',    label: 'Emergente'           },
                nao_avaliado:       { cor: '#d1d5db', bg: 'bg-gray-50',   label: 'Não avaliado'        },
              } as Record<string, { cor: string; bg: string; label: string }>)[status]
                ?? { cor: '#d1d5db', bg: 'bg-gray-50', label: formatValor(status) }

              const tendenciaVisual = ({
                melhorando:      { emoji: '↑', cor: 'text-green-500' },
                estavel:         { emoji: '→', cor: 'text-gray-400'  },
                precisa_atencao: { emoji: '↓', cor: 'text-red-500'   },
              } as Record<string, { emoji: string; cor: string }>)[tendencia]
                ?? { emoji: '→', cor: 'text-gray-400' }

              const labelHab = hab.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())

              return (
                <div key={hab} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setHabExpandida(expanded ? null : hab)}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: statusVisual.cor }} />
                    <span className="flex-1 text-sm font-medium text-gray-800">{labelHab}</span>
                    <span className={`text-sm font-bold ${tendenciaVisual.cor}`}>{tendenciaVisual.emoji}</span>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusVisual.bg}`}
                      style={{ color: statusVisual.cor }}
                    >
                      {statusVisual.label}
                    </span>
                    <span className={`text-gray-300 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>▾</span>
                  </button>

                  {expanded && historico.length > 0 && (
                    <div className="px-4 pb-4 border-t border-gray-50">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mt-3 mb-3">Histórico</p>
                      <div className="relative pl-4">
                        <div className="absolute left-1.5 top-1 bottom-1 w-px bg-gray-100" />
                        <div className="flex flex-col gap-3">
                          {historico.map((h, i) => {
                            const sv = ({
                              consolidado:        { cor: '#22c55e', label: 'Consolidado'        },
                              consolidada:        { cor: '#22c55e', label: 'Consolidado'        },
                              em_desenvolvimento: { cor: '#f59e0b', label: 'Em desenvolvimento' },
                              emergente:          { cor: '#ef4444', label: 'Emergente'           },
                            } as Record<string, { cor: string; label: string }>)[h.valor]
                              ?? { cor: '#d1d5db', label: formatValor(h.valor) }
                            return (
                              <div key={i} className="flex items-center gap-3">
                                <div
                                  className="w-3 h-3 rounded-full border-2 border-white shrink-0 -ml-4 shadow-sm"
                                  style={{ backgroundColor: sv.cor }}
                                />
                                <span className="text-xs text-gray-400 w-16 shrink-0">
                                  {new Date(h.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                </span>
                                <span className="text-xs font-medium" style={{ color: sv.cor }}>{sv.label}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {expanded && historico.length === 0 && (
                    <div className="px-4 pb-4 pt-2 border-t border-gray-50">
                      <p className="text-xs text-gray-400 italic">
                        Registre mais sessões para ver a evolução desta habilidade
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Seção 3 — Última sessão */}
      {!carregando && ultimaSessao && (
        <div className="px-4 sm:px-6 pb-6 max-w-2xl mx-auto">
          <h2 className="font-serif font-bold text-[#1B4332] text-base mb-4">Última sessão</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 flex items-center gap-3 border-b border-gray-50">
              <span className="text-3xl">
                {ultimaSessao.humor === 'otimo'   ? '😄'
               : ultimaSessao.humor === 'bem'     ? '🙂'
               : ultimaSessao.humor === 'regular' ? '😐'
               : ultimaSessao.humor === 'dificil' ? '😟' : '—'}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {ultimaSessao.humor === 'otimo'   ? 'Paciente chegou ótimo'
                 : ultimaSessao.humor === 'bem'     ? 'Paciente chegou bem'
                 : ultimaSessao.humor === 'regular' ? 'Humor regular'
                 : ultimaSessao.humor === 'dificil' ? 'Sessão desafiadora'
                 : 'Sessão registrada'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {ultimaSessao.data
                    ? new Date(ultimaSessao.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
                    : '—'}
                  {ultimaSessao.duracao_minutos ? ` · ${ultimaSessao.duracao_minutos} min` : ''}
                </p>
              </div>
            </div>
            {ultimaSessao.o_que_funcionou && (
              <div className="p-4 bg-[#E8F4EE] border-l-4 border-[#2D6A4F]">
                <p className="text-[10px] font-bold text-[#2D6A4F] uppercase tracking-wide mb-1">✓ O que funcionou</p>
                <p className="text-sm text-[#1B4332] leading-relaxed">{ultimaSessao.o_que_funcionou}</p>
              </div>
            )}
            {ultimaSessao.o_que_nao_funcionou && (
              <div className="p-4 bg-[#FEF3C7] border-l-4 border-[#F59E0B]">
                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide mb-1">⚠ Precisa de atenção</p>
                <p className="text-sm text-amber-900 leading-relaxed">{ultimaSessao.o_que_nao_funcionou}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Seções 4–6 — Accordions inline */}
      <div className="px-4 sm:px-6 pb-6 max-w-2xl mx-auto flex flex-col gap-3">
        <AccordionSecao
          emoji="📋"
          titulo="Sessões"
          subtitulo={`${totalSessoes} registrada${totalSessoes !== 1 ? 's' : ''}`}
          aberta={secaoAberta === 'sessoes'}
          onToggle={() => setSecaoAberta(secaoAberta === 'sessoes' ? null : 'sessoes')}
        >
          <AbaSessoesModulo pacienteId={id} modulo={modulo} />
        </AccordionSecao>

        <AccordionSecao
          emoji="📊"
          titulo="Avaliação"
          subtitulo="Linha de base e progresso"
          aberta={secaoAberta === 'avaliacao'}
          onToggle={() => setSecaoAberta(secaoAberta === 'avaliacao' ? null : 'avaliacao')}
        >
          <AbaAvaliacaoModulo pacienteId={id} modulo={modulo} paciente={paciente} />
        </AccordionSecao>

        <AccordionSecao
          emoji="✨"
          titulo="Gerar atividade com IA"
          subtitulo="Prescrita para a família"
          aberta={secaoAberta === 'atividade'}
          onToggle={() => setSecaoAberta(secaoAberta === 'atividade' ? null : 'atividade')}
          destaque
        >
          <AbaAtividadeIA pacienteId={id} modulo={modulo} paciente={paciente} />
        </AccordionSecao>
      </div>

      {/* Seção 7 — Rascunho de relatório */}
      {!carregando && relatorioIA && (
        <div className="px-4 sm:px-6 pb-8 max-w-2xl mx-auto">
          <div className="rounded-2xl border-2 border-dashed border-[#F59E0B]/40 bg-[#FFFBEB] overflow-hidden">
            <button
              onClick={() => setRelatorioAberto(!relatorioAberto)}
              className="w-full flex items-center gap-3 p-4 text-left"
            >
              <span className="text-xl">✨</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#92400E]">Rascunho de relatório</h3>
                  <span className="text-[10px] font-bold text-white bg-[#F59E0B] px-2 py-0.5 rounded-full">
                    Sugestão IA
                  </span>
                </div>
                <p className="text-xs text-amber-700/60 mt-0.5">Revise e edite antes de usar</p>
              </div>
              <span className={`text-amber-400 text-sm transition-transform ${relatorioAberto ? 'rotate-180' : ''}`}>▾</span>
            </button>

            {relatorioAberto && (
              <div className="border-t border-amber-100 p-4 space-y-4 bg-white">
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
                  { label: '✓ Pontos positivos',              cor: 'text-green-600',   items: relatorioIA.pontos_positivos },
                  { label: '⚠ Áreas de atenção',              cor: 'text-amber-600',   items: relatorioIA.areas_atencao },
                  { label: '💡 Sugestões para próxima sessão', cor: 'text-blue-600',    items: relatorioIA.sugestoes_sessao },
                  { label: '🏠 Orientações para a família',    cor: 'text-[#1B4332]',   items: relatorioIA.orientacoes_familia },
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
            )}
          </div>
        </div>
      )}

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
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1B4332] text-white px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold whitespace-nowrap"
          >
            ✓ {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
