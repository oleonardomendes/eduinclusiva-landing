'use client'

import { useState, useEffect } from 'react'
import { Plus, Send } from 'lucide-react'
import { getPlanos, enviarPlanoFamilia } from '@/lib/api'
import { getToken } from '@/lib/auth'
import ModalPlanoSemanal from '@/components/especialista/ModalPlanoSemanal'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Tarefa {
  titulo: string
  descricao?: string
  duracao_minutos?: number
  area?: string
}

interface Plano {
  id: number
  semana_inicio?: string
  semana_fim?: string
  orientacoes_gerais?: string
  tarefas?: Tarefa[]
  enviado_familia?: boolean
  enviado_em?: string
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

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AbaPlano({ paciente }: Props) {
  const [planos, setPlanos] = useState<Plano[]>([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [enviando, setEnviando] = useState<number | null>(null)
  const [toast, setToast] = useState('')

  const carregarPlanos = async () => {
    const token = getToken()
    if (!token) return
    setCarregando(true)
    try {
      const data = await getPlanos(paciente.id, token)
      setPlanos(Array.isArray(data) ? data : data?.planos ?? [])
    } catch {
      setPlanos([])
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregarPlanos() }, [paciente.id])

  const mostrarToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleEnviar = async (planoId: number) => {
    const token = getToken()
    if (!token) return
    setEnviando(planoId)
    try {
      await enviarPlanoFamilia(planoId, token)
      setPlanos((prev) => prev.map((p) => p.id === planoId ? { ...p, enviado_familia: true } : p))
      mostrarToast('Plano enviado para a família!')
    } catch {
      mostrarToast('Não foi possível enviar o plano.')
    } finally {
      setEnviando(null)
    }
  }

  if (carregando) {
    return <div className="flex justify-center py-12"><Spinner /></div>
  }

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-[#718096]">{planos.length} plano(s) criado(s)</p>
          <button
            onClick={() => setModalAberto(true)}
            className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[#1B4332] px-4 py-2 rounded-xl hover:bg-[#2D6A4F] transition-colors"
          >
            <Plus className="w-4 h-4" /> Criar plano da semana
          </button>
        </div>

        {planos.length === 0 ? (
          <div className="text-center py-12 text-[#A0AEC0]">
            <p className="text-4xl mb-3">📅</p>
            <p className="font-medium">Nenhum plano criado ainda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {planos.map((p) => (
              <div key={p.id} className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-[#1A1A1A] text-sm">
                      {p.semana_inicio && p.semana_fim
                        ? `${formatData(p.semana_inicio)} a ${formatData(p.semana_fim)}`
                        : 'Plano semanal'}
                    </p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${
                      p.enviado_familia ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {p.enviado_familia
                        ? `✓ Enviado${p.enviado_em ? ` ${formatData(p.enviado_em)}` : ''}`
                        : 'Não enviado'}
                    </span>
                  </div>
                  {!p.enviado_familia && (
                    <button
                      onClick={() => handleEnviar(p.id)}
                      disabled={enviando === p.id}
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#1B4332] bg-[#1B4332]/10 px-3 py-1.5 rounded-full hover:bg-[#1B4332]/20 transition-colors disabled:opacity-50 shrink-0"
                    >
                      {enviando === p.id ? (
                        <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      Enviar para família
                    </button>
                  )}
                </div>

                {p.orientacoes_gerais && (
                  <p className="text-xs text-[#4A5568] mb-3 leading-relaxed">{p.orientacoes_gerais}</p>
                )}

                {p.tarefas && p.tarefas.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[#718096] uppercase tracking-wide">Tarefas</p>
                    {p.tarefas.map((t, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#1B4332] text-white text-[10px] flex items-center justify-center shrink-0 font-bold mt-0.5">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-[#1A1A1A]">{t.titulo}</p>
                          {t.descricao && <p className="text-xs text-[#718096] mt-0.5">{t.descricao}</p>}
                          {(t.area || t.duracao_minutos) && (
                            <div className="flex gap-2 mt-1">
                              {t.area && <span className="text-[10px] bg-[#F0F7F4] text-[#2D6A4F] px-2 py-0.5 rounded-full">{t.area}</span>}
                              {t.duracao_minutos && <span className="text-[10px] text-[#718096]">{t.duracao_minutos} min</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ModalPlanoSemanal
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        pacienteId={paciente.id}
        onCriado={() => {
          setModalAberto(false)
          carregarPlanos()
          mostrarToast('Plano semanal criado com sucesso!')
        }}
      />

      {/* Toast inline */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1B4332] text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold whitespace-nowrap">
          ✓ {toast}
        </div>
      )}
    </>
  )
}
