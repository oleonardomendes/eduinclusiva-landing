'use client'

import { useState, useEffect } from 'react'
import { getEvolucaoPaciente, getSessoes, getRegistrosFamilia } from '@/lib/api'
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
  [key: string]: unknown
}

interface Sessao {
  id: number
  data_sessao?: string
  humor_inicio?: string
  o_que_funcionou?: string
}

interface RegistroTarefa {
  tarefa_titulo?: string
  concluiu: boolean
  humor?: string
  observacao?: string
  criado_em?: string
}

interface PlanoRegistros {
  semana_inicio?: string
  semana_fim?: string
  percentual_conclusao?: number
  registros?: RegistroTarefa[]
}

interface RegistrosFamiliaData {
  engajamento_geral?: number
  total_tarefas_concluidas?: number
  total_tarefas_enviadas?: number
  planos?: PlanoRegistros[]
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

function formatDataCurta(d?: string) {
  if (!d) return '?'
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

const humorEmoji: Record<string, string> = {
  otimo: '😄',
  bem: '🙂',
  regular: '😐',
  dificil: '😟',
}

function BarraProgresso({ valor }: { valor: number }) {
  const pct = Math.min(100, Math.max(0, Math.round(valor * 10)))
  return (
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500 bg-[#1B4332]"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AbaEvolucao({ paciente }: Props) {
  const [evolucao, setEvolucao] = useState<Evolucao | null>(null)
  const [sessoes, setSessoes] = useState<Sessao[]>([])
  const [registrosFamilia, setRegistrosFamilia] = useState<RegistrosFamiliaData | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) return
    const carregar = async () => {
      setCarregando(true)
      try {
        const [dadosEvolucao, dadosSessoes, dadosRegistros] = await Promise.all([
          getEvolucaoPaciente(paciente.id, token),
          getSessoes(paciente.id, token),
          getRegistrosFamilia(paciente.id, token).catch(() => null),
        ])
        console.log('Dados evolução:', dadosEvolucao)
        console.log('Registros família:', dadosRegistros)
        setEvolucao(dadosEvolucao ?? null)
        const lista: Sessao[] = Array.isArray(dadosSessoes)
          ? dadosSessoes
          : dadosSessoes?.sessoes ?? []
        setSessoes([...lista].sort((a, b) => ((a.data_sessao ?? '') > (b.data_sessao ?? '') ? 1 : -1)))
        setRegistrosFamilia(dadosRegistros ?? null)
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

  const semSessoes = sessoes.length === 0
  const semEvolucao = !evolucao || (!evolucao.total_sessoes && !evolucao.competencias?.length)

  if (semSessoes && semEvolucao) {
    return (
      <div className="text-center py-12 text-[#A0AEC0]">
        <p className="text-4xl mb-3">📈</p>
        <p className="font-medium">Sem dados de evolução ainda</p>
        <p className="text-sm mt-1">Registre sessões para acompanhar o progresso</p>
      </div>
    )
  }

  // Normaliza campos com possíveis nomes alternativos do backend
  const totalSessoes = evolucao?.total_sessoes
  const semanasAtivas = evolucao?.semanas_ativas
  const ultimaSessao = (evolucao?.ultima_sessao ?? evolucao?.last_session ?? evolucao?.ultima_data) as string | undefined

  const humorEmojiFamilia: Record<string, string> = { otimo: '😊', bem: '🙂', regular: '😐', dificil: '😔' }

  return (
    <div className="space-y-5">

      {/* Registros da família */}
      {registrosFamilia && (
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-4">
          <h3 className="text-xs font-semibold text-[#718096] uppercase tracking-wide">Engajamento da família</h3>

          {/* Card de engajamento */}
          {registrosFamilia.engajamento_geral !== undefined && (
            <div className="flex items-center gap-4">
              <div className="text-center">
                {(() => {
                  const pct = registrosFamilia.engajamento_geral ?? 0
                  const cor = pct >= 80 ? 'text-green-600 bg-green-100' : pct >= 50 ? 'text-amber-600 bg-amber-100' : 'text-red-600 bg-red-100'
                  return (
                    <span className={`text-2xl font-bold px-3 py-1 rounded-xl ${cor}`}>
                      {Math.round(pct)}%
                    </span>
                  )
                })()}
              </div>
              <p className="text-sm text-[#4A5568]">
                <span className="font-semibold text-[#1A1A1A]">{registrosFamilia.total_tarefas_concluidas ?? 0}</span>
                {' '}de{' '}
                <span className="font-semibold text-[#1A1A1A]">{registrosFamilia.total_tarefas_enviadas ?? 0}</span>
                {' '}tarefas concluídas
              </p>
            </div>
          )}

          {/* Planos com registros */}
          {(registrosFamilia.planos ?? []).length > 0 ? (
            <div className="space-y-3">
              {registrosFamilia.planos!.map((plano, pi) => {
                const pct = plano.percentual_conclusao ?? 0
                const corBarra = pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400'
                return (
                  <div key={pi} className="bg-white rounded-xl p-3 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-[#1A1A1A]">
                        {plano.semana_inicio && plano.semana_fim
                          ? `Semana de ${formatData(plano.semana_inicio)} a ${formatData(plano.semana_fim)}`
                          : 'Plano semanal'}
                      </p>
                      <span className="text-xs font-bold text-[#2D6A4F]">{Math.round(pct)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                      <div className={`h-full rounded-full ${corBarra}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                    {(plano.registros ?? []).length > 0 && (
                      <div className="space-y-2">
                        {plano.registros!.map((reg, ri) => (
                          <div key={ri} className="flex items-start gap-2 text-xs">
                            <span>{reg.concluiu ? '✅' : '❌'}</span>
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-[#1A1A1A]">{reg.tarefa_titulo ?? `Tarefa ${ri + 1}`}</span>
                              {reg.humor && (
                                <span className="ml-2 text-gray-500">{humorEmojiFamilia[reg.humor] ?? ''}</span>
                              )}
                              {reg.observacao && (
                                <p className="text-gray-400 italic mt-0.5">&ldquo;{reg.observacao}&rdquo;</p>
                              )}
                              {reg.criado_em && (
                                <p className="text-gray-300 mt-0.5">{formatData(reg.criado_em)}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
              <p className="text-sm text-gray-400">A família ainda não registrou nenhuma tarefa desta semana.</p>
            </div>
          )}
        </div>
      )}

      {/* Resumo numérico */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Sessões', valor: totalSessoes ?? sessoes.length },
          { label: 'Semanas ativas', valor: semanasAtivas ?? '—' },
          { label: 'Última sessão', valor: ultimaSessao ? formatData(ultimaSessao) : (sessoes.at(-1)?.data_sessao ? formatData(sessoes.at(-1)?.data_sessao) : '—') },
        ].map(({ label, valor }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <p className="text-xl font-bold text-[#1B4332]">{valor}</p>
            <p className="text-xs text-[#718096] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Progresso geral */}
      {evolucao?.progresso_geral !== undefined && (
        <div className="bg-[#F0F7F4] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-[#1B4332]">Progresso geral</p>
            <span className="text-sm font-bold text-[#1B4332]">{Math.round(evolucao.progresso_geral * 10)}%</span>
          </div>
          <BarraProgresso valor={evolucao.progresso_geral} />
        </div>
      )}

      {/* Competências */}
      {evolucao?.competencias && evolucao.competencias.length > 0 && (
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

      {/* Humor ao longo das sessões */}
      {sessoes.length > 0 && (
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
          <h3 className="text-xs font-semibold text-[#718096] uppercase tracking-wide mb-3">
            Humor ao longo das sessões
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {sessoes.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-1 shrink-0">
                <span className="text-2xl">
                  {humorEmoji[s.humor_inicio ?? ''] ?? '—'}
                </span>
                <span className="text-[10px] text-gray-400">
                  {formatDataCurta(s.data_sessao)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* O que tem funcionado */}
      {sessoes.some((s) => s.o_que_funcionou) && (
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
          <h3 className="text-xs font-semibold text-[#718096] uppercase tracking-wide mb-3">
            O que tem funcionado
          </h3>
          <div className="flex flex-col gap-2.5">
            {sessoes
              .filter((s) => s.o_que_funcionou)
              .slice(-3)
              .map((s) => (
                <div key={s.id} className="flex gap-2 text-sm">
                  <span className="text-green-500 shrink-0 mt-0.5">✓</span>
                  <span className="text-gray-600 leading-relaxed">{s.o_que_funcionou}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Resumo textual do backend */}
      {evolucao?.resumo && (
        <div>
          <p className="text-xs font-semibold text-[#718096] uppercase tracking-wide mb-2">Observações gerais</p>
          <p className="text-sm text-[#4A5568] leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-100">{evolucao.resumo}</p>
        </div>
      )}

      {/* Empty state se dados insuficientes */}
      {sessoes.length < 2 && (
        <p className="text-center text-xs text-gray-400 pt-2">
          Registre mais sessões para ver a evolução completa do paciente
        </p>
      )}

    </div>
  )
}
