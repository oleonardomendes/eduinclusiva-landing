'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Plus } from 'lucide-react'
import { getSessoes } from '@/lib/api'
import { getToken } from '@/lib/auth'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Sessao {
  id: number
  especialidade?: string
  data_sessao?: string
  duracao_minutos?: number
  humor_inicio?: string
  atividades_realizadas?: string
  resposta_crianca?: string
  o_que_funcionou?: string
  o_que_nao_funcionou?: string
  observacoes_clinicas?: string
  foco_proxima_sessao?: string
  coordenacao_fina?: string
  coordenacao_grossa?: string
  equilibrio?: string
  lateralidade?: string
  esquema_corporal?: string
  nivel_leitura?: string
  nivel_escrita?: string
  nivel_matematica?: string
  habilidades_trabalhadas?: string[]
}

interface Props {
  paciente: { id: number; nome?: string }
  onRegistrarSessao: () => void
  onSessaoSalva?: () => void
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const humorEmoji: Record<string, string> = { otimo: '😊', bem: '🙂', regular: '😐', dificil: '😔' }

function formatData(d?: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 text-[#1B4332]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AbaSessoes({ paciente, onRegistrarSessao }: Props) {
  const [sessoes, setSessoes] = useState<Sessao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [expandida, setExpandida] = useState<number | null>(null)

  useEffect(() => {
    const token = getToken()
    if (!token) return
    const carregar = async () => {
      setCarregando(true)
      try {
        const data = await getSessoes(paciente.id, token)
        setSessoes(Array.isArray(data) ? data : data?.sessoes ?? [])
      } catch {
        setSessoes([])
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [paciente.id])

  if (carregando) {
    return <div className="flex justify-center py-12"><Spinner /></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#718096]">{sessoes.length} sessão(ões) registrada(s)</p>
        <button
          onClick={onRegistrarSessao}
          className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[#1B4332] px-4 py-2 rounded-xl hover:bg-[#2D6A4F] transition-colors"
        >
          <Plus className="w-4 h-4" /> Registrar sessão
        </button>
      </div>

      {sessoes.length === 0 ? (
        <div className="text-center py-12 text-[#A0AEC0]">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium">Nenhuma sessão registrada ainda</p>
          <button
            onClick={onRegistrarSessao}
            className="mt-4 text-sm text-[#1B4332] font-semibold hover:underline"
          >
            Registrar primeira sessão →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {[...sessoes]
            .sort((a, b) => ((b.data_sessao ?? '') > (a.data_sessao ?? '') ? 1 : -1))
            .map((s) => (
              <div key={s.id} className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setExpandida(expandida === s.id ? null : s.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{humorEmoji[s.humor_inicio ?? ''] ?? '📋'}</span>
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A1A]">{s.especialidade ?? 'Sessão'}</p>
                      <p className="text-xs text-[#718096]">
                        {formatData(s.data_sessao)}
                        {s.duracao_minutos ? ` · ${s.duracao_minutos} min` : ''}
                      </p>
                    </div>
                  </div>
                  {expandida === s.id
                    ? <ChevronUp className="w-4 h-4 text-[#718096] shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-[#718096] shrink-0" />}
                </button>

                <AnimatePresence>
                  {expandida === s.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-1 space-y-3 border-t border-gray-100">
                        {([
                          ['O que foi trabalhado', s.atividades_realizadas],
                          ['Resposta da criança', s.resposta_crianca],
                          ['O que funcionou', s.o_que_funcionou],
                          ['O que não funcionou', s.o_que_nao_funcionou],
                          ['Observações clínicas', s.observacoes_clinicas],
                          ['Foco da próxima sessão', s.foco_proxima_sessao],
                        ] as [string, string | undefined][]).filter(([, v]) => !!v).map(([label, value]) => (
                          <div key={label}>
                            <p className="text-xs font-semibold text-[#718096] uppercase tracking-wide mb-0.5">{label}</p>
                            <p className="text-sm text-[#4A5568] leading-relaxed">{value}</p>
                          </div>
                        ))}

                        {/* Campos específicos — Psicomotricidade */}
                        {s.coordenacao_fina && (
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            {([
                              ['Coord. fina', s.coordenacao_fina],
                              ['Coord. grossa', s.coordenacao_grossa],
                              ['Equilíbrio', s.equilibrio],
                              ['Lateralidade', s.lateralidade],
                              ['Esquema corporal', s.esquema_corporal],
                            ] as [string, string | undefined][]).filter(([, v]) => !!v).map(([l, v]) => (
                              <div key={l}>
                                <p className="text-xs text-[#718096]">{l}</p>
                                <p className="text-sm font-medium text-[#1A1A1A]">{v}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Campos específicos — Psicopedagogia */}
                        {s.nivel_leitura && (
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            {([
                              ['Nível leitura', s.nivel_leitura],
                              ['Nível escrita', s.nivel_escrita],
                              ['Nível matemática', s.nivel_matematica],
                            ] as [string, string | undefined][]).filter(([, v]) => !!v).map(([l, v]) => (
                              <div key={l}>
                                <p className="text-xs text-[#718096]">{l}</p>
                                <p className="text-sm font-medium text-[#1A1A1A]">{v}</p>
                              </div>
                            ))}
                            {s.habilidades_trabalhadas && s.habilidades_trabalhadas.length > 0 && (
                              <div className="col-span-2">
                                <p className="text-xs text-[#718096] mb-1">Habilidades</p>
                                <div className="flex flex-wrap gap-1">
                                  {s.habilidades_trabalhadas.map((h) => (
                                    <span key={h} className="text-xs bg-[#1B4332]/10 text-[#1B4332] px-2 py-0.5 rounded-full">{h}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
