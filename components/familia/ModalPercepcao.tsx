'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { registrarPercepcao } from '@/lib/api'

interface Props {
  aberto: boolean
  onFechar: () => void
  atividadeId: number | string
  filhoId: number | string
  tituloAtividade: string
  nomeFilho?: string
  token: string
  onSalvo: (resultado: unknown) => void
}

const humores = [
  {
    valor: 'otimo',
    label: 'Ótimo',
    emoji: '😊',
    bg: 'bg-green-50',
    border: 'border-green-400',
    text: 'text-green-700',
  },
  {
    valor: 'bem',
    label: 'Bem',
    emoji: '🙂',
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    text: 'text-blue-700',
  },
  {
    valor: 'regular',
    label: 'Regular',
    emoji: '😐',
    bg: 'bg-yellow-50',
    border: 'border-yellow-400',
    text: 'text-yellow-700',
  },
  {
    valor: 'dificil',
    label: 'Difícil',
    emoji: '😔',
    bg: 'bg-red-50',
    border: 'border-red-400',
    text: 'text-red-700',
  },
]

const proximasAcoes = [
  { valor: 'repetir', label: '🔁 Repetir' },
  { valor: 'adaptar', label: '🔄 Adaptar' },
  { valor: 'nova', label: '➡️ Nova atividade' },
]

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
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

export default function ModalPercepcao({
  aberto,
  onFechar,
  atividadeId,
  filhoId,
  tituloAtividade,
  nomeFilho = 'a criança',
  token,
  onSalvo,
}: Props) {
  const [humor, setHumor] = useState<string | null>(null)
  const [observacao, setObservacao] = useState('')
  const [proximaAcao, setProximaAcao] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [resultado, setResultado] = useState<Record<string, any> | null>(null)
  const [erro, setErro] = useState('')

  const resetar = () => {
    setHumor(null)
    setObservacao('')
    setProximaAcao(null)
    setResultado(null)
    setErro('')
  }

  const handleFechar = () => {
    resetar()
    onFechar()
  }

  const handleConcluir = () => {
    const res = resultado
    resetar()
    onFechar()
    onSalvo(res)
  }

  const handleSalvar = async () => {
    if (!humor || !proximaAcao) return
    setSalvando(true)
    setErro('')
    try {
      const res = await registrarPercepcao(
        Number(filhoId),
        Number(atividadeId),
        {
          humor,
          observacao: observacao.trim() || undefined,
          proxima_acao: proximaAcao,
        },
        token
      )
      setResultado(res as Record<string, any>)
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      setErro(e?.detail ?? e?.message ?? 'Erro ao salvar registro.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <AnimatePresence>
      {aberto && (
        <motion.div
          key="modal-percepcao-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={resultado ? undefined : handleFechar}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex-1 min-w-0">
                <h2 className="font-lora font-bold text-xl text-[#1A1A1A]">
                  Como foi a atividade?
                </h2>
                <p className="text-[#718096] text-sm mt-0.5 line-clamp-2">{tituloAtividade}</p>
              </div>
              <button
                onClick={resultado ? handleConcluir : handleFechar}
                className="ml-3 flex-shrink-0 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-[#718096]" />
              </button>
            </div>

            {/* Tela de resultado */}
            {resultado ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* Ícone + título */}
                <div className="text-center pt-2 pb-1">
                  <div className="text-5xl mb-3">🎉</div>
                  <h3 className="font-lora font-bold text-xl text-[#1A1A1A]">Registro salvo!</h3>
                  {resultado?.analise_ia && (
                    <p className="text-[#718096] text-sm mt-1">Veja o que a IA observou:</p>
                  )}
                </div>

                {resultado?.analise_ia ? (
                  <>
                    {/* Ponto positivo */}
                    {resultado.analise_ia.ponto_positivo && (
                      <div className="bg-[#E8F4EE] border border-[#A7F3D0] rounded-xl p-4">
                        <p className="text-[#065F46] text-sm leading-relaxed">
                          💚 {resultado.analise_ia.ponto_positivo}
                        </p>
                      </div>
                    )}

                    {/* Sugestão */}
                    {resultado.analise_ia.sugestao && (
                      <div className="bg-[#FEF3C7] border border-amber-200 rounded-xl p-4">
                        <p className="text-amber-700 text-xs font-semibold uppercase tracking-wide mb-1">
                          💡 Sugestão para próxima vez:
                        </p>
                        <p className="text-amber-800 text-sm leading-relaxed">
                          {resultado.analise_ia.sugestao}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-[#E8F4EE] border border-[#A7F3D0] rounded-xl p-4 text-center">
                    <p className="text-[#065F46] text-sm">✅ Percepção registrada com sucesso!</p>
                  </div>
                )}

                {/* Botão fechar */}
                <button
                  onClick={handleConcluir}
                  className="w-full bg-[#1B4332] text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-[#2D6A4F] transition-colors mt-2"
                >
                  Fechar
                </button>
              </motion.div>
            ) : (
              <div className="space-y-5">
                {/* Humor */}
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A] mb-3">
                    Como {nomeFilho} ficou durante a atividade?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {humores.map((h) => {
                      const sel = humor === h.valor
                      return (
                        <button
                          key={h.valor}
                          onClick={() => setHumor(h.valor)}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-150 ${
                            sel
                              ? `${h.bg} ${h.border} ${h.text}`
                              : 'bg-white border-[#E2E8F0] text-[#4A5568] hover:border-[#CBD5E0]'
                          }`}
                        >
                          <span className="text-2xl">{h.emoji}</span>
                          <span className="text-sm font-medium">{h.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Observação */}
                <div>
                  <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">
                    O que você observou?{' '}
                    <span className="font-normal text-[#A0AEC0]">(opcional)</span>
                  </label>
                  <textarea
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    placeholder="Ex: Ele ficou animado, teve dificuldade em..., conseguiu fazer sozinho..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white text-[#1A1A1A] placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent transition-all resize-none text-sm"
                  />
                </div>

                {/* Próxima ação */}
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A] mb-2">
                    O que fazer na próxima vez?
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {proximasAcoes.map((a) => {
                      const sel = proximaAcao === a.valor
                      return (
                        <button
                          key={a.valor}
                          onClick={() => setProximaAcao(a.valor)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all duration-150 ${
                            sel
                              ? 'bg-[#1B4332] border-[#1B4332] text-white'
                              : 'bg-white border-[#CBD5E0] text-[#4A5568] hover:border-[#2D6A4F]'
                          }`}
                        >
                          {a.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Erro */}
                {erro && (
                  <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
                    {erro}
                  </div>
                )}

                {/* Botão salvar */}
                <button
                  onClick={handleSalvar}
                  disabled={!humor || !proximaAcao || salvando}
                  className="w-full flex items-center justify-center gap-2 bg-[#1B4332] text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-[#2D6A4F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-green"
                >
                  {salvando ? (
                    <>
                      <Spinner />
                      Salvando...
                    </>
                  ) : (
                    'Salvar registro'
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
