'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getPlanosPrescritos } from '@/lib/api'
import ModalRegistroTarefa from '@/components/familia/ModalRegistroTarefa'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Tarefa {
  titulo: string
  descricao?: string
  duracao_minutos?: number
  area?: string
}

interface RegistroTarefa {
  concluiu: boolean
  humor: string
  observacao?: string
  criado_em?: string
}

interface PlanoPrescritos {
  id: number
  semana_inicio?: string
  semana_fim?: string
  orientacoes_gerais?: string
  tarefas?: Tarefa[]
  registros?: Record<string, RegistroTarefa>
  percentual_conclusao?: number
  especialista?: { nome: string }
}

interface Props {
  token: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const humorInfo: Record<string, { emoji: string; label: string }> = {
  otimo:   { emoji: '😊', label: 'Ótimo'    },
  bem:     { emoji: '🙂', label: 'Bem'      },
  regular: { emoji: '😐', label: 'Regular'  },
  dificil: { emoji: '😔', label: 'Difícil'  },
}

function formatData(d?: string) {
  if (!d) return '?'
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
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

export default function SecaoPlanosPrescritos({ token }: Props) {
  const [planos, setPlanos] = useState<PlanoPrescritos[]>([])
  const [carregando, setCarregando] = useState(true)
  const [reload, setReload] = useState(0)
  const [modalConfig, setModalConfig] = useState<{
    planoId: number
    tarefaIndex: number
    tarefaTitulo: string
  } | null>(null)

  useEffect(() => {
    if (!token) return
    const carregar = async () => {
      setCarregando(true)
      try {
        const data = await getPlanosPrescritos(token)
        const lista = Array.isArray(data) ? data : data?.planos ?? []
        setPlanos(lista)
      } catch {
        setPlanos([])
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [token, reload])

  if (carregando) {
    return (
      <div className="flex justify-center py-6 mt-6">
        <Spinner />
      </div>
    )
  }

  if (planos.length === 0) return null

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-6"
        id="secao-planos-prescritos"
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">👩‍⚕️</span>
          <div>
            <h2 className="text-lg font-bold text-[#1B4332]">Planos do seu Especialista</h2>
            <p className="text-sm text-gray-400">Atividades prescritas para fazer em casa</p>
          </div>
        </div>

        <div className="space-y-4">
          {planos.map((plano) => {
            const pct = plano.percentual_conclusao ?? 0
            const corBarra = pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400'
            const corLabel = pct >= 80
              ? 'text-green-700 bg-green-100'
              : pct >= 50
              ? 'text-amber-700 bg-amber-100'
              : 'text-red-700 bg-red-100'

            return (
              <div key={plano.id} className="bg-white rounded-2xl border border-[#2D6A4F]/20 shadow-sm p-5">

                {/* Header do plano */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    {plano.especialista?.nome && (
                      <span className="text-xs font-medium text-[#2D6A4F] bg-[#F0F7F4] px-2 py-0.5 rounded-full mb-1.5 inline-block">
                        {plano.especialista.nome}
                      </span>
                    )}
                    <p className="text-sm font-semibold text-[#1A1A1A]">
                      {plano.semana_inicio && plano.semana_fim
                        ? `Semana de ${formatData(plano.semana_inicio)} a ${formatData(plano.semana_fim)}`
                        : 'Plano semanal'}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${corLabel}`}>
                    {Math.round(pct)}%
                  </span>
                </div>

                {/* Barra de progresso */}
                {(plano.tarefas ?? []).length > 0 && (
                  <div className="mb-4">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${corBarra}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Orientações gerais */}
                {plano.orientacoes_gerais && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-2 mb-4">
                    <span className="text-base shrink-0">💡</span>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      <span className="font-semibold">Orientações: </span>
                      {plano.orientacoes_gerais}
                    </p>
                  </div>
                )}

                {/* Lista de tarefas */}
                {(plano.tarefas ?? []).length > 0 && (
                  <div className="space-y-2">
                    {plano.tarefas!.map((tarefa, idx) => {
                      const registro = plano.registros?.[String(idx)]
                      const humor = registro ? humorInfo[registro.humor] : null

                      return (
                        <div
                          key={idx}
                          className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                            registro ? 'bg-[#F0F7F4]' : 'bg-gray-50'
                          }`}
                        >
                          {/* Checkbox */}
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            registro ? 'bg-green-500' : 'border-2 border-gray-300'
                          }`}>
                            {registro && <span className="text-white text-[10px] font-bold">✓</span>}
                          </div>

                          {/* Conteúdo */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium leading-snug ${
                              registro ? 'text-gray-400 line-through' : 'text-[#1A1A1A]'
                            }`}>
                              {tarefa.titulo}
                            </p>

                            {registro ? (
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {humor && (
                                  <span className="text-xs text-gray-600">{humor.emoji} {humor.label}</span>
                                )}
                                {registro.observacao && (
                                  <span className="text-xs text-gray-400 italic">&ldquo;{registro.observacao}&rdquo;</span>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {tarefa.duracao_minutos && (
                                  <span className="text-[10px] text-gray-400">{tarefa.duracao_minutos} min</span>
                                )}
                                {tarefa.area && (
                                  <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{tarefa.area}</span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Botão registrar */}
                          {!registro && (
                            <button
                              onClick={() => setModalConfig({
                                planoId: plano.id,
                                tarefaIndex: idx,
                                tarefaTitulo: tarefa.titulo,
                              })}
                              className="shrink-0 text-xs font-semibold text-[#1B4332] bg-[#1B4332]/10 px-3 py-1.5 rounded-full hover:bg-[#1B4332]/20 transition-colors whitespace-nowrap"
                            >
                              ✓ Registrar
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Modal de registro */}
      {modalConfig && (
        <ModalRegistroTarefa
          aberto={!!modalConfig}
          onFechar={() => setModalConfig(null)}
          planoId={modalConfig.planoId}
          tarefaIndex={modalConfig.tarefaIndex}
          tarefaTitulo={modalConfig.tarefaTitulo}
          token={token}
          onSalvo={() => {
            setModalConfig(null)
            setReload((k) => k + 1)
          }}
        />
      )}
    </>
  )
}
