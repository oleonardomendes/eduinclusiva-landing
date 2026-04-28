'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { getSessoes } from '@/lib/api'
import { getToken } from '@/lib/auth'
import { MODULOS_CONFIG, CAMPOS_SESSAO_ESPECIALIDADE } from '@/lib/modulos'
import ModalSessao from '@/components/especialista/ModalSessao'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Sessao {
  id: number
  data_sessao?: string
  duracao_minutos?: number
  humor_inicio?: string
  o_que_funcionou?: string
  o_que_nao_funcionou?: string
  observacoes_clinicas?: string
  atividades_realizadas?: string
  foco_proxima_sessao?: string
  especialidade?: string
  coordenacao_fina?: string
  coordenacao_grossa?: string
  equilibrio?: string
  lateralidade?: string
  esquema_corporal?: string
  nivel_leitura?: string
  nivel_escrita?: string
  nivel_matematica?: string
  habilidades_trabalhadas?: string[] | string
}

interface Props {
  pacienteId: string
  modulo: string
}

// ─── Configs ─────────────────────────────────────────────────────────────────

const HUMOR_EMOJI: Record<string, string> = {
  otimo: '😄', bem: '🙂', regular: '😐', dificil: '😟',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatData(d?: string) {
  if (!d) return '—'
  return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

function formatValor(s: string) {
  return s.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())
}

function Spinner() {
  return (
    <svg className="animate-spin h-6 w-6 text-[#1B4332]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AbaSessoesModulo({ pacienteId, modulo }: Props) {
  const [sessoes, setSessoes] = useState<Sessao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [expandidos, setExpandidos] = useState<Set<number>>(new Set())
  const [modalAberto, setModalAberto] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const config = MODULOS_CONFIG[modulo]
  const especialidadeLabel = config?.label ?? modulo

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const token = getToken()
    if (!token) return

    const carregar = async () => {
      setCarregando(true)
      setErro(null)
      try {
        const data = await getSessoes(Number(pacienteId), token)
        const lista: Sessao[] = Array.isArray(data)
          ? data
          : (data as { sessoes?: Sessao[] })?.sessoes ?? []
        const filtradas = lista.filter((s) => s.especialidade === especialidadeLabel)
        filtradas.sort((a, b) => ((a.data_sessao ?? '') < (b.data_sessao ?? '') ? 1 : -1))
        setSessoes(filtradas)
      } catch {
        setErro('Não foi possível carregar as sessões.')
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [pacienteId, modulo, reloadKey])

  const toggleExpandir = (id: number) => {
    setExpandidos((prev) => {
      const novo = new Set(prev)
      novo.has(id) ? novo.delete(id) : novo.add(id)
      return novo
    })
  }

  if (carregando) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[#718096] uppercase tracking-wide">
          {sessoes.length} sessão{sessoes.length !== 1 ? 'ões' : ''} registrada{sessoes.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => setModalAberto(true)}
          className="flex items-center gap-1.5 bg-[#F59E0B] text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-amber-400 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Nova sessão
        </button>
      </div>

      {/* Erro */}
      {erro && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600">
          {erro}
        </div>
      )}

      {/* Estado vazio */}
      {sessoes.length === 0 && !erro && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm font-semibold text-gray-500 mb-1">
            Nenhuma sessão registrada ainda
          </p>
          <p className="text-xs text-gray-400 mb-4">para {especialidadeLabel}</p>
          <button
            onClick={() => setModalAberto(true)}
            className="bg-[#1B4332] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2D6A4F] transition-colors"
          >
            Registrar primeira sessão
          </button>
        </div>
      )}

      {/* Lista de sessões */}
      {sessoes.map((sessao) => {
        const expandida = expandidos.has(sessao.id)
        const camposConfig = CAMPOS_SESSAO_ESPECIALIDADE[modulo] ?? []

        return (
          <div key={sessao.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Cabeçalho do card */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl shrink-0">
                    {HUMOR_EMOJI[sessao.humor_inicio ?? ''] ?? '📋'}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A1A]">
                      {formatData(sessao.data_sessao)}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {sessao.duracao_minutos && (
                        <span className="text-xs text-gray-400">⏱ {sessao.duracao_minutos} min</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggleExpandir(sessao.id)}
                  className="text-xs text-[#2D6A4F] font-semibold hover:underline shrink-0"
                >
                  {expandida ? 'Fechar' : 'Ver detalhes'}
                </button>
              </div>

              {sessao.o_que_funcionou && (
                <p className="text-xs text-gray-400 mt-2 italic truncate">
                  &ldquo;{sessao.o_que_funcionou}&rdquo;
                </p>
              )}
            </div>

            {/* Detalhes expandidos */}
            <AnimatePresence>
              {expandida && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-gray-50"
                >
                  <div className="p-4 space-y-3">

                    {/* Campos gerais */}
                    {[
                      { label: 'O que foi trabalhado', valor: sessao.atividades_realizadas },
                      { label: 'O que funcionou',      valor: sessao.o_que_funcionou },
                      { label: 'O que não funcionou',  valor: sessao.o_que_nao_funcionou },
                      { label: 'Observações clínicas', valor: sessao.observacoes_clinicas },
                      { label: 'Foco da próxima sessão', valor: sessao.foco_proxima_sessao },
                    ].filter((f) => f.valor).map(({ label, valor }) => (
                      <div key={label}>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                          {label}
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed">{valor}</p>
                      </div>
                    ))}

                    {/* Campos específicos do módulo */}
                    {camposConfig.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                          Avaliação {config?.label}
                        </p>
                        <div className="flex flex-col gap-1.5">
                          {camposConfig.map(({ campo, label }) => {
                            const valor = (sessao as unknown as Record<string, string>)[campo]
                            if (!valor) return null
                            return (
                              <div key={campo} className="flex items-center justify-between gap-3">
                                <span className="text-xs text-gray-500">{label}</span>
                                <span className="text-xs font-medium text-[#1B4332] bg-[#1B4332]/10 px-2.5 py-0.5 rounded-full shrink-0">
                                  {formatValor(valor)}
                                </span>
                              </div>
                            )
                          })}

                          {modulo === 'psicopedagogia' && sessao.habilidades_trabalhadas && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Habilidades trabalhadas</p>
                              <div className="flex flex-wrap gap-1">
                                {(Array.isArray(sessao.habilidades_trabalhadas)
                                  ? sessao.habilidades_trabalhadas
                                  : [sessao.habilidades_trabalhadas as string]
                                ).map((h, i) => (
                                  <span key={i} className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                    {h}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}

      {/* Modal de nova sessão */}
      <ModalSessao
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        pacienteId={Number(pacienteId)}
        especialidadeInicial={especialidadeLabel}
        onSalvo={() => {
          setModalAberto(false)
          setReloadKey((k) => k + 1)
        }}
      />

    </div>
  )
}
