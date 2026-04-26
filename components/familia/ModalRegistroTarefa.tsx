'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { registrarTarefa } from '@/lib/api'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Props {
  aberto: boolean
  onFechar: () => void
  planoId: number
  tarefaIndex: number
  tarefaTitulo: string
  token: string
  onSalvo: () => void
}

// ─── Opções de resultado ──────────────────────────────────────────────────────

const opcoes = [
  {
    emoji: '✅',
    label: 'Conseguiu completar',
    concluiu: true,
    humor: 'otimo',
    cor: 'border-green-300 bg-green-50 text-green-800',
    corSel: 'border-green-500 bg-green-100 text-green-900 ring-2 ring-green-400',
  },
  {
    emoji: '⚡',
    label: 'Conseguiu parcialmente',
    concluiu: true,
    humor: 'regular',
    cor: 'border-amber-300 bg-amber-50 text-amber-800',
    corSel: 'border-amber-400 bg-amber-100 text-amber-900 ring-2 ring-amber-400',
  },
  {
    emoji: '🔄',
    label: 'Com muita ajuda',
    concluiu: false,
    humor: 'bem',
    cor: 'border-blue-300 bg-blue-50 text-blue-800',
    corSel: 'border-blue-400 bg-blue-100 text-blue-900 ring-2 ring-blue-400',
  },
  {
    emoji: '❌',
    label: 'Não conseguiu desta vez',
    concluiu: false,
    humor: 'dificil',
    cor: 'border-red-300 bg-red-50 text-red-800',
    corSel: 'border-red-400 bg-red-100 text-red-900 ring-2 ring-red-400',
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ModalRegistroTarefa({
  aberto, onFechar, planoId, tarefaIndex, tarefaTitulo, token, onSalvo,
}: Props) {
  const [opcaoSelecionada, setOpcaoSelecionada] = useState<number | null>(null)
  const [observacao, setObservacao] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const resetar = () => {
    setOpcaoSelecionada(null)
    setObservacao('')
    setSalvando(false)
    setErro('')
  }

  const handleFechar = () => { resetar(); onFechar() }

  const handleSalvar = async () => {
    if (opcaoSelecionada === null) return
    const opcao = opcoes[opcaoSelecionada]
    setSalvando(true)
    setErro('')
    try {
      await registrarTarefa(planoId, tarefaIndex, {
        concluiu: opcao.concluiu,
        humor: opcao.humor,
        observacao: observacao.trim() || undefined,
      }, token)
      resetar()
      onFechar()
      onSalvo()
    } catch (e: unknown) {
      const err = e as { detail?: string; message?: string }
      setErro(err?.detail ?? err?.message ?? 'Não foi possível salvar. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <AnimatePresence>
      {aberto && (
        <motion.div
          key="modal-registro-tarefa"
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
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex items-start justify-between border-b border-gray-100">
              <div>
                <h2 className="font-lora font-bold text-xl text-[#1A1A1A]">Como foi a tarefa?</h2>
                <p className="text-sm text-[#718096] mt-0.5 line-clamp-2">{tarefaTitulo}</p>
              </div>
              <button onClick={handleFechar} className="ml-3 p-1.5 rounded-full hover:bg-gray-100 transition-colors shrink-0">
                <X className="w-5 h-5 text-[#718096]" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Opções */}
              <div>
                <p className="text-sm font-semibold text-[#1A1A1A] mb-3">Conseguiu realizar?</p>
                <div className="grid grid-cols-2 gap-2">
                  {opcoes.map((op, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setOpcaoSelecionada(i)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center ${
                        opcaoSelecionada === i ? op.corSel : op.cor
                      }`}
                    >
                      <span className="text-2xl">{op.emoji}</span>
                      <span className="text-xs font-medium leading-tight">{op.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Observação */}
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">
                  Como foi?{' '}
                  <span className="font-normal text-[#A0AEC0]">(opcional)</span>
                </label>
                <textarea
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  rows={3}
                  placeholder="O que você observou durante a tarefa..."
                  className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#1A1A1A] placeholder:text-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent resize-none transition-all"
                />
              </div>

              {/* Erro */}
              {erro && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">{erro}</div>
              )}

              {/* Botão */}
              <button
                onClick={handleSalvar}
                disabled={opcaoSelecionada === null || salvando}
                className="w-full flex items-center justify-center gap-2 bg-[#1B4332] text-white font-semibold py-3.5 rounded-xl hover:bg-[#2D6A4F] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {salvando ? <><Spinner /> Salvando...</> : 'Salvar registro'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
