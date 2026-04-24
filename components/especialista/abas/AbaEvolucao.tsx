'use client'

import { useState, useEffect } from 'react'
import { getEvolucaoPaciente } from '@/lib/api'
import { getToken } from '@/lib/auth'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Competencia {
  nome: string
  media?: number
  total_registros?: number
}

interface Evolucao {
  total_sessoes?: number
  semanas_ativas?: number
  ultima_sessao?: string
  competencias?: Competencia[]
  resumo?: string
  progresso_geral?: number
}

interface Props {
  paciente: { id: number }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 text-[#1B4332]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function formatData(d?: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function BarraProgresso({ valor, cor = '#1B4332' }: { valor: number; cor?: string }) {
  const pct = Math.min(100, Math.max(0, Math.round(valor * 10)))
  return (
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: cor }}
      />
    </div>
  )
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AbaEvolucao({ paciente }: Props) {
  const [evolucao, setEvolucao] = useState<Evolucao | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) return
    const carregar = async () => {
      setCarregando(true)
      try {
        const data = await getEvolucaoPaciente(paciente.id, token)
        setEvolucao(data ?? null)
      } catch {
        setEvolucao(null)
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [paciente.id])

  if (carregando) {
    return <div className="flex justify-center py-12"><Spinner /></div>
  }

  if (!evolucao || (!evolucao.total_sessoes && !evolucao.competencias?.length)) {
    return (
      <div className="text-center py-12 text-[#A0AEC0]">
        <p className="text-4xl mb-3">📈</p>
        <p className="font-medium">Sem dados de evolução ainda</p>
        <p className="text-sm mt-1">Registre sessões para acompanhar o progresso</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Resumo numérico */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Sessões', valor: evolucao.total_sessoes ?? '—' },
          { label: 'Semanas ativas', valor: evolucao.semanas_ativas ?? '—' },
          { label: 'Última sessão', valor: formatData(evolucao.ultima_sessao) },
        ].map(({ label, valor }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <p className="text-xl font-bold text-[#1B4332]">{valor}</p>
            <p className="text-xs text-[#718096] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Progresso geral */}
      {evolucao.progresso_geral !== undefined && (
        <div className="bg-[#F0F7F4] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-[#1B4332]">Progresso geral</p>
            <span className="text-sm font-bold text-[#1B4332]">{Math.round(evolucao.progresso_geral * 10)}%</span>
          </div>
          <BarraProgresso valor={evolucao.progresso_geral} />
        </div>
      )}

      {/* Competências */}
      {evolucao.competencias && evolucao.competencias.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#718096] uppercase tracking-wide mb-3">Competências</p>
          <div className="space-y-3">
            {evolucao.competencias.map((c) => (
              <div key={c.nome}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-[#1A1A1A]">{c.nome}</p>
                  <div className="flex items-center gap-2">
                    {c.total_registros !== undefined && (
                      <span className="text-xs text-[#718096]">{c.total_registros} registro{c.total_registros !== 1 ? 's' : ''}</span>
                    )}
                    {c.media !== undefined && (
                      <span className="text-xs font-semibold text-[#2D6A4F]">{c.media.toFixed(1)}</span>
                    )}
                  </div>
                </div>
                {c.media !== undefined && <BarraProgresso valor={c.media} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resumo textual */}
      {evolucao.resumo && (
        <div>
          <p className="text-xs font-semibold text-[#718096] uppercase tracking-wide mb-2">Observações gerais</p>
          <p className="text-sm text-[#4A5568] leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-100">{evolucao.resumo}</p>
        </div>
      )}

    </div>
  )
}
