'use client'

import { useState, useEffect, useRef } from 'react'
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
}

// ─── Mapas ────────────────────────────────────────────────────────────────────

const humorEmoji: Record<string, string> = {
  otimo: '😊',
  bem: '🙂',
  regular: '😐',
  dificil: '😔',
}

const humorLabel: Record<number, string> = {
  3: 'Ótimo',
  2: 'Bem',
  1: 'Regular',
  0: 'Difícil',
}

const tendenciaBadge: Record<string, { label: string; classes: string }> = {
  melhorando: { label: '↑ Melhorando', classes: 'bg-green-100 text-green-700' },
  estavel:    { label: '→ Estável',    classes: 'bg-blue-100 text-blue-700'  },
  precisa_atencao: { label: '↓ Atenção', classes: 'bg-amber-100 text-amber-700' },
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

// ─── Gráfico SVG nativo ───────────────────────────────────────────────────────

interface PontoGrafico {
  dataFormatada: string
  humor_valor: number
}

interface TooltipState {
  x: number
  y: number
  label: string
  valor: number
}

const Y_LABELS = [
  { v: 0, label: 'Dif' },
  { v: 1, label: 'Reg' },
  { v: 2, label: 'Bem' },
  { v: 3, label: 'Óti' },
]

const PAD = { top: 14, right: 14, bottom: 30, left: 40 }
const SVG_H = 164
const TOOLTIP_W = 74
const TOOLTIP_H = 32

function GraficoHumor({ dados }: { dados: PontoGrafico[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(540)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    setWidth(el.offsetWidth)
    const obs = new ResizeObserver(() => setWidth(el.offsetWidth))
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  if (dados.length === 0) return null

  const chartW = width - PAD.left - PAD.right
  const chartH = SVG_H - PAD.top - PAD.bottom
  const n = dados.length

  const toX = (i: number) =>
    PAD.left + (n === 1 ? chartW / 2 : (i / (n - 1)) * chartW)
  const toY = (v: number) =>
    PAD.top + chartH - (v / 3) * chartH

  const polylinePoints = dados
    .map((d, i) => `${toX(i)},${toY(d.humor_valor)}`)
    .join(' ')

  // X labels: first, last e até 3 intermediários
  const labelIndices = new Set([0, n - 1])
  if (n > 4) {
    const step = Math.floor(n / 4)
    for (let i = step; i < n - 1; i += step) labelIndices.add(i)
  }

  // Tooltip rect clamped dentro do SVG
  const ttRectX = (x: number) =>
    Math.max(PAD.left, Math.min(x - TOOLTIP_W / 2, width - PAD.right - TOOLTIP_W))
  const ttTextX = (x: number) => ttRectX(x) + TOOLTIP_W / 2

  return (
    <div ref={containerRef} className="w-full">
      <svg
        width={width}
        height={SVG_H}
        className="overflow-visible"
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Grid horizontal + labels Y */}
        {Y_LABELS.map(({ v, label }) => (
          <g key={v}>
            <line
              x1={PAD.left}
              y1={toY(v)}
              x2={width - PAD.right}
              y2={toY(v)}
              stroke="#F0EBE0"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 6}
              y={toY(v) + 4}
              textAnchor="end"
              fontSize={10}
              fill="#A0AEC0"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {label}
            </text>
          </g>
        ))}

        {/* Linha conectando pontos */}
        {n > 1 && (
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="#2D6A4F"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Pontos clicáveis */}
        {dados.map((d, i) => (
          <circle
            key={i}
            cx={toX(i)}
            cy={toY(d.humor_valor)}
            r={4}
            fill="#2D6A4F"
            stroke="white"
            strokeWidth={1.5}
            style={{ cursor: 'pointer' }}
            onMouseEnter={() =>
              setTooltip({
                x: toX(i),
                y: toY(d.humor_valor),
                label: d.dataFormatada,
                valor: d.humor_valor,
              })
            }
          />
        ))}

        {/* Labels eixo X */}
        {dados.map((d, i) =>
          labelIndices.has(i) ? (
            <text
              key={i}
              x={toX(i)}
              y={SVG_H - 6}
              textAnchor="middle"
              fontSize={10}
              fill="#A0AEC0"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {d.dataFormatada}
            </text>
          ) : null
        )}

        {/* Tooltip no hover */}
        {tooltip && (
          <g>
            <rect
              x={ttRectX(tooltip.x)}
              y={tooltip.y - TOOLTIP_H - 8}
              width={TOOLTIP_W}
              height={TOOLTIP_H}
              rx={6}
              fill="white"
              stroke="#E2E8F0"
              strokeWidth={1}
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))' }}
            />
            <text
              x={ttTextX(tooltip.x)}
              y={tooltip.y - TOOLTIP_H - 8 + 13}
              textAnchor="middle"
              fontSize={10}
              fontWeight="600"
              fill="#1A1A1A"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {tooltip.label}
            </text>
            <text
              x={ttTextX(tooltip.x)}
              y={tooltip.y - TOOLTIP_H - 8 + 25}
              textAnchor="middle"
              fontSize={10}
              fill="#2D6A4F"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {humorLabel[tooltip.valor] ?? '—'}
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}

// ─── Seção principal ──────────────────────────────────────────────────────────

export default function SecaoEvolucao({ filhoId, nomeFilho, token }: Props) {
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
  }, [filhoId, token])

  const dadosGrafico = (evolucao?.ultimos_30_dias ?? []).map((p) => ({
    ...p,
    dataFormatada: new Date(p.data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    }),
  }))

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
          {/* Cards de métricas */}
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

          {/* Gráfico SVG — últimos 30 dias */}
          {dadosGrafico.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#F0EBE0] p-5">
              <p className="font-semibold text-[#1A1A1A] text-sm mb-4">
                Humor nos últimos 30 dias
              </p>
              <GraficoHumor dados={dadosGrafico} />
            </div>
          )}

          {/* Cards por área */}
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

          {/* Insights da IA */}
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
