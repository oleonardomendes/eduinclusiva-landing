'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2 } from 'lucide-react'
import { createPlano } from '@/lib/api'
import { getToken } from '@/lib/auth'

// ─── Opções ───────────────────────────────────────────────────────────────────

const areas = [
  { id: 'comunicacao', label: 'Comunicação e Linguagem' },
  { id: 'cognicao', label: 'Cognição e Aprendizagem' },
  { id: 'motor', label: 'Desenvolvimento Motor' },
  { id: 'emocional', label: 'Regulação Emocional' },
  { id: 'social', label: 'Habilidades Sociais' },
  { id: 'autonomia', label: 'Autonomia e Vida Diária' },
]

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Tarefa {
  titulo: string
  descricao: string
  duracao_minutos: number | ''
  area: string
}

interface Props {
  aberto: boolean
  onFechar: () => void
  pacienteId: number
  onCriado: () => void
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function tarefaVazia(): Tarefa {
  return { titulo: '', descricao: '', duracao_minutos: '', area: '' }
}

// Retorna a segunda-feira da semana a partir de uma data
function getSegunda(dateStr: string): Date {
  const d = new Date(dateStr + 'T12:00:00')
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

function formatarSemana(dateStr: string): string {
  if (!dateStr) return ''
  const seg = getSegunda(dateStr)
  const dom = new Date(seg)
  dom.setDate(seg.getDate() + 6)
  const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  return `Semana de ${fmt(seg)} a ${fmt(dom)}`
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ModalPlanoSemanal({ aberto, onFechar, pacienteId, onCriado }: Props) {
  const hoje = new Date().toISOString().split('T')[0]

  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [semana, setSemana] = useState(hoje)
  const [orientacoes, setOrientacoes] = useState('')
  const [tarefas, setTarefas] = useState<Tarefa[]>([tarefaVazia()])

  const resetar = () => {
    setSemana(hoje); setOrientacoes(''); setTarefas([tarefaVazia()]); setErro('')
  }

  const handleFechar = () => { resetar(); onFechar() }

  const adicionarTarefa = () => setTarefas((prev) => [...prev, tarefaVazia()])

  const removerTarefa = (i: number) =>
    setTarefas((prev) => prev.length === 1 ? [tarefaVazia()] : prev.filter((_, idx) => idx !== i))

  const atualizarTarefa = (i: number, campo: keyof Tarefa, valor: string | number) =>
    setTarefas((prev) => prev.map((t, idx) => idx === i ? { ...t, [campo]: valor } : t))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const tarefasValidas = tarefas.filter((t) => t.titulo.trim())
    if (tarefasValidas.length === 0) { setErro('Adicione pelo menos uma tarefa com título'); return }
    const token = getToken()
    if (!token) return
    setSalvando(true)
    setErro('')

    const seg = getSegunda(semana)
    const dom = new Date(seg)
    dom.setDate(seg.getDate() + 6)

    try {
      await createPlano(pacienteId, {
        semana_inicio: seg.toISOString().split('T')[0],
        semana_fim: dom.toISOString().split('T')[0],
        orientacoes_gerais: orientacoes || undefined,
        tarefas: tarefasValidas.map((t) => ({
          titulo: t.titulo.trim(),
          descricao: t.descricao || undefined,
          duracao_minutos: t.duracao_minutos || undefined,
          area: t.area || undefined,
        })),
      }, token)
      resetar()
      onCriado()
    } catch (e: unknown) {
      const err = e as { detail?: string; message?: string }
      setErro(err?.detail ?? err?.message ?? 'Não foi possível criar o plano. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1A1A1A] bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent transition-all placeholder:text-[#A0AEC0]'
  const selectCls = inputCls + ' cursor-pointer'
  const labelCls = 'block text-xs font-semibold text-[#4A5568] uppercase tracking-wide mb-1.5'

  return (
    <AnimatePresence>
      {aberto && (
        <motion.div
          key="modal-plano"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && handleFechar()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white rounded-t-3xl border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="font-lora font-bold text-xl text-[#1B4332]">Plano Semanal</h2>
                <p className="text-sm text-[#718096] mt-0.5">
                  {semana ? formatarSemana(semana) : 'Selecione a semana'}
                </p>
              </div>
              <button onClick={handleFechar} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-[#718096]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">

              {/* Semana + orientações */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Semana</label>
                  <input type="date" value={semana} onChange={(e) => setSemana(e.target.value)} className={inputCls} />
                  {semana && (
                    <p className="text-xs text-[#718096] mt-1">{formatarSemana(semana)}</p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Orientações gerais</label>
                  <textarea value={orientacoes} onChange={(e) => setOrientacoes(e.target.value)}
                    rows={3} placeholder="Orientações gerais para a família..."
                    className={inputCls + ' resize-none'} />
                </div>
              </div>

              {/* Tarefas */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-[#1B4332]">Tarefas ({tarefas.length})</p>
                  <button type="button" onClick={adicionarTarefa}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#1B4332] bg-[#1B4332]/5 px-3 py-1.5 rounded-full hover:bg-[#1B4332]/10 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar tarefa
                  </button>
                </div>

                <div className="space-y-4">
                  {tarefas.map((tarefa, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 rounded-2xl p-4 border border-gray-100"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-[#718096] uppercase tracking-wide">
                          Tarefa {i + 1}
                        </span>
                        <button type="button" onClick={() => removerTarefa(i)}
                          className="p-1 rounded-full hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <label className={labelCls}>Título *</label>
                          <input type="text" value={tarefa.titulo}
                            onChange={(e) => atualizarTarefa(i, 'titulo', e.target.value)}
                            placeholder="Ex: Jogo de encaixe com blocos..." className={inputCls} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className={labelCls}>Descrição</label>
                          <textarea value={tarefa.descricao}
                            onChange={(e) => atualizarTarefa(i, 'descricao', e.target.value)}
                            rows={2} placeholder="Como realizar a atividade..."
                            className={inputCls + ' resize-none'} />
                        </div>
                        <div>
                          <label className={labelCls}>Duração (min)</label>
                          <input type="number" min={1} value={tarefa.duracao_minutos}
                            onChange={(e) => atualizarTarefa(i, 'duracao_minutos', e.target.value ? Number(e.target.value) : '')}
                            placeholder="Ex: 15" className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls}>Área</label>
                          <select value={tarefa.area}
                            onChange={(e) => atualizarTarefa(i, 'area', e.target.value)}
                            className={selectCls}
                          >
                            <option value="">Selecionar...</option>
                            {areas.map((a) => <option key={a.id} value={a.label}>{a.label}</option>)}
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Erro */}
              {erro && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">{erro}</div>
              )}

              {/* Botão */}
              <button type="submit" disabled={salvando}
                className="w-full flex items-center justify-center gap-2 bg-[#1B4332] text-white font-semibold py-3.5 rounded-xl hover:bg-[#2D6A4F] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {salvando ? <><Spinner /> Criando plano...</> : '✓ Criar plano'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
