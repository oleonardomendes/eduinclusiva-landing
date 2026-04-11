'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getEvolucao } from '@/lib/api'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface AreaEvolucao {
  nome: string
  total: number
  tendencia: 'melhorando' | 'estavel' | 'precisa_atencao'
}

interface PontoDia {
  data: string
  humor_valor: number
  humor?: string
}

interface DadosEvolucao {
  total_registros: number
  humor_geral?: string
  areas_trabalhadas?: number
  ultimos_30_dias?: PontoDia[]
  por_area?: AreaEvolucao[]
  insights?: string[]
}

interface Props {
  filhoId: number | string
  nomeFilho: string
  token: string
  refreshKey?: number
}

// ─── Configuração de humor ────────────────────────────────────────────────────

const humorConfig: Record<number, { emoji: string; label: string; color: string; bgLight: string }> = {
  3: { emoji: '😊', label: 'Ótimo',   color: '#2D6A4F', bgLight: '#D1FAE5' },
  2: { emoji: '🙂', label: 'Bem',     color: '#3B82F6', bgLight: '#DBEAFE' },
  1: { emoji: '😐', label: 'Regular', color: '#F59E0B', bgLight: '#FEF3C7' },
  0: { emoji: '😔', label: 'Difícil', color: '#EF4444', bgLight: '#FEE2E2' },
}

const humorEmoji: Record<string, string> = {
  otimo: '😊', bem: '🙂', regular: '😐', dificil: '😔',
}

const tendenciaBadge: Record<string, { label: string; classes: string }> = {
  melhorando:      { label: '↑ Melhorando', classes: 'bg-green-100 text-green-700' },
  estavel:         { label: '→ Estável',    classes: 'bg-blue-100 text-blue-700'   },
  precisa_atencao: { label: '↓ Atenção',    classes: 'bg-amber-100 text-amber-700' },
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      className="animate-spin h-6 w-6 text-[#2D6A4F]"
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

// ─── Visualização 1 — Timeline de humor ──────────────────────────────────────

function TimelineHumor({ pontos }: { pontos: PontoDia[] }) {
  if (pontos.length === 0) return null

  const ordenados = [...pontos].sort(
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
  )

  return (
    <div className="bg-white rounded-2xl border border-[#F0EBE0] p-5">
      <p className="font-semibold text-[#1A1A1A] text-sm mb-4">Histórico de humor</p>
      <div className="overflow-x-auto pb-1">
        <div className="flex items-start gap-0 min-w-max px-1">
          {ordenados.map((ponto, i) => {
            const cfg = humorConfig[ponto.humor_valor] ?? humorConfig[2]
            const dataFmt = new Date(ponto.data).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
            })
            return (
              <div key={i} className="flex items-center">
                {/* Linha conectora */}
                {i > 0 && (
                  <div className="w-5 h-0.5 bg-[#E2E8F0] flex-shrink-0 mb-6" />
                )}
                {/* Bolinha + data */}
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-sm flex-shrink-0"
                    style={{
                      backgroundColor: cfg.bgLight,
                      border: `2px solid ${cfg.color}`,
                    }}
                    title={`${cfg.label} — ${dataFmt}`}
                  >
                    {cfg.emoji}
                  </div>
                  <span className="text-[10px] text-[#A0AEC0] leading-none">{dataFmt}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Visualização 2 — Barras de distribuição de humor ────────────────────────

function BarrasHumor({ pontos }: { pontos: PontoDia[] }) {
  if (pontos.length === 0) return null

  const total = pontos.length
  const contagem: Record<number, number> = { 3: 0, 2: 0, 1: 0, 0: 0 }
  pontos.forEach((p) => {
    const v = p.humor_valor
    if (v in contagem) contagem[v]++
  })

  return (
    <div className="bg-white rounded-2xl border border-[#F0EBE0] p-5">
      <p className="font-semibold text-[#1A1A1A] text-sm mb-4">Distribuição de humor</p>
      <div className="space-y-3">
        {([3, 2, 1, 0] as const).map((v) => {
          const cfg = humorConfig[v]
          const count = contagem[v]
          const pct = total > 0 ? (count / total) * 100 : 0
          return (
            <div key={v} className="flex items-center gap-3">
              {/* Emoji + label */}
              <div className="flex items-center gap-1.5 w-24 flex-shrink-0">
                <span className="text-base">{cfg.emoji}</span>
                <span className="text-sm text-[#4A5568]">{cfg.label}</span>
              </div>
              {/* Barra */}
              <div className="flex-1 h-3 bg-[#F0EBE0] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: cfg.color }}
                />
              </div>
              {/* Contagem */}
              <span className="text-xs text-[#718096] w-5 text-right flex-shrink-0">
                {count}x
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Seção principal ──────────────────────────────────────────────────────────

export default function SecaoEvolucao({ filhoId, nomeFilho, token, refreshKey = 0 }: Props) {
  const [evolucao, setEvolucao] = useState<DadosEvolucao | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    const carregar = async () => {
      try {
        setCarregando(true)
        const data = await getEvolucao(Number(filhoId), token)
        setEvolucao(data as DadosEvolucao)
      } catch {
        setErro('Não foi possível carregar a evolução.')
      } finally {
        setCarregando(false)
      }
    }
    if (filhoId && token) carregar()
  }, [filhoId, token, refreshKey])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-10"
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-lora font-bold text-2xl text-[#1A1A1A]">
          Evolução de {nomeFilho}
        </h2>
        <p className="text-[#718096] text-sm mt-0.5">
          Acompanhe o progresso ao longo do tempo
        </p>
      </div>

      {/* Loading */}
      {carregando && (
        <div className="flex items-center justify-center py-16">
          <Spinner />
        </div>
      )}

      {/* Erro */}
      {!carregando && erro && (
        <div className="bg-red-50 text-red-600 text-sm px-5 py-4 rounded-xl border border-red-100">
          {erro}
        </div>
      )}

      {/* Sem registros */}
      {!carregando && !erro && evolucao?.total_registros === 0 && (
        <div className="bg-white rounded-2xl border border-[#F0EBE0] p-8 text-center">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-[#4A5568] font-medium mb-1">
            Ainda não há registros de evolução.
          </p>
          <p className="text-[#A0AEC0] text-sm leading-relaxed max-w-sm mx-auto">
            Após realizar atividades, registre como foi para acompanhar o
            progresso de {nomeFilho}.
          </p>
        </div>
      )}

      {/* Com registros */}
      {!carregando && !erro && evolucao && evolucao.total_registros > 0 && (
        <div className="space-y-6">

          {/* 1. Cards de métricas */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-[#F0EBE0] p-4 text-center">
              <p className="text-3xl font-bold text-[#1B4332]">
                {evolucao.total_registros}
              </p>
              <p className="text-xs text-[#718096] mt-1">Atividades realizadas</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#F0EBE0] p-4 text-center">
              <p className="text-3xl">
                {evolucao.humor_geral ? (humorEmoji[evolucao.humor_geral] ?? '📊') : '📊'}
              </p>
              <p className="text-xs text-[#718096] mt-1">Humor geral</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#F0EBE0] p-4 text-center">
              <p className="text-3xl font-bold text-[#1B4332]">
                {evolucao.areas_trabalhadas ?? evolucao.por_area?.length ?? 0}
              </p>
              <p className="text-xs text-[#718096] mt-1">Áreas trabalhadas</p>
            </div>
          </div>

          {/* 2. Timeline de humor */}
          {evolucao.ultimos_30_dias && evolucao.ultimos_30_dias.length > 0 && (
            <TimelineHumor pontos={evolucao.ultimos_30_dias} />
          )}

          {/* 3. Distribuição de humor */}
          {evolucao.ultimos_30_dias && evolucao.ultimos_30_dias.length > 0 && (
            <BarrasHumor pontos={evolucao.ultimos_30_dias} />
          )}

          {/* 4. Cards por área */}
          {evolucao.por_area && evolucao.por_area.length > 0 && (
            <div>
              <p className="font-semibold text-[#1A1A1A] text-sm mb-3">Por área</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {evolucao.por_area.map((area, i) => {
                  const badge = tendenciaBadge[area.tendencia]
                  return (
                    <div
                      key={i}
                      className="bg-white rounded-xl border border-[#F0EBE0] px-4 py-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-[#1A1A1A] text-sm">{area.nome}</p>
                        <p className="text-xs text-[#A0AEC0] mt-0.5">
                          {area.total} {area.total === 1 ? 'atividade' : 'atividades'}
                        </p>
                      </div>
                      {badge && (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.classes}`}>
                          {badge.label}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 5. Insights da IA */}
          {evolucao.insights && evolucao.insights.length > 0 && (
            <div className="bg-[#F0F7F4] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">✨</span>
                <p className="font-semibold text-[#1B4332] text-sm">Observações da IA</p>
              </div>
              <ul className="space-y-2">
                {evolucao.insights.slice(0, 3).map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#2D6A4F]">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#2D6A4F] flex-shrink-0" />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      )}
    </motion.div>
  )
}
