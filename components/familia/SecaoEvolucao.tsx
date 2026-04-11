'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { getEvolucao } from '@/lib/api'

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

const tendenciaBadge: Record<
  string,
  { label: string; classes: string }
> = {
  melhorando: { label: '↑ Melhorando', classes: 'bg-green-100 text-green-700' },
  estavel: { label: '→ Estável', classes: 'bg-blue-100 text-blue-700' },
  precisa_atencao: { label: '↓ Atenção', classes: 'bg-amber-100 text-amber-700' },
}

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

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const valor = payload[0]?.value as number
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 shadow-md text-sm">
      <p className="font-semibold text-[#1A1A1A]">{label}</p>
      <p className="text-[#2D6A4F]">{humorLabel[valor] ?? '—'}</p>
    </div>
  )
}

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
      {/* Header da seção */}
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

          {/* Gráfico de humor — últimos 30 dias */}
          {dadosGrafico.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#F0EBE0] p-5">
              <p className="font-semibold text-[#1A1A1A] text-sm mb-4">
                Humor nos últimos 30 dias
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={dadosGrafico} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="humGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="dataFormatada"
                    tick={{ fontSize: 11, fill: '#A0AEC0' }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={[0, 3]}
                    ticks={[0, 1, 2, 3]}
                    tick={{ fontSize: 11, fill: '#A0AEC0' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => humorLabel[v]?.slice(0, 3) ?? ''}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="humor_valor"
                    stroke="#2D6A4F"
                    strokeWidth={2.5}
                    fill="url(#humGradient)"
                    dot={{ r: 3, fill: '#2D6A4F', strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#1B4332' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
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
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.classes}`}
                        >
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
