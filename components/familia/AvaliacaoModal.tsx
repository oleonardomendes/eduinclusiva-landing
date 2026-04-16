'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { getToken } from '@/lib/auth'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface AtividadeAvaliacao {
  id: string | number
  titulo?: string
  area?: string
}

interface Props {
  aberto: boolean
  onFechar: () => void
  atividade: AtividadeAvaliacao
  nomeFilho: string
  onAvaliada: () => void
}

// ─── Opções ───────────────────────────────────────────────────────────────────

const opcoesHumor = [
  { valor: 'otimo',   emoji: '😄', label: 'Ótimo'   },
  { valor: 'bem',     emoji: '🙂', label: 'Bem'     },
  { valor: 'regular', emoji: '😐', label: 'Regular' },
  { valor: 'dificil', emoji: '😟', label: 'Difícil' },
]

const opcoesResultado = [
  { valor: 'completo',      label: '✅ Conseguiu completar'       },
  { valor: 'parcial',       label: '⚡ Conseguiu parcialmente'    },
  { valor: 'nao_conseguiu', label: '❌ Não conseguiu desta vez'   },
]

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AvaliacaoModal({ aberto, onFechar, atividade, nomeFilho, onAvaliada }: Props) {
  const [humor, setHumor]           = useState<string | null>(null)
  const [resultado, setResultado]   = useState<string | null>(null)
  const [observacao, setObservacao] = useState('')
  const [salvando, setSalvando]     = useState(false)
  const [salvo, setSalvo]           = useState(false)

  const handleFechar = () => {
    setHumor(null)
    setResultado(null)
    setObservacao('')
    setSalvo(false)
    onFechar()
  }

  const handleSalvar = async () => {
    if (!humor || !resultado) return
    const token = getToken()
    if (!token) return
    setSalvando(true)
    try {
      await api.patch(
        `/v1/ai/atividades/${atividade.id}/concluir`,
        {
          observacoes: [
            `Resultado: ${resultado}`,
            `Humor: ${humor}`,
            observacao.trim(),
          ].filter(Boolean).join(' | '),
          nota_geral: humor === 'otimo'   ? 9
                    : humor === 'bem'     ? 7
                    : humor === 'regular' ? 5
                    : 3,
        },
        token,
      )
      setSalvo(true)
      onAvaliada()
    } catch (e) {
      console.error('Erro ao salvar avaliação:', e)
    } finally {
      setSalvando(false)
    }
  }

  if (!aberto) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && handleFechar()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">

        {/* Tela de sucesso */}
        {salvo ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🌟</div>
            <h3 className="text-lg font-bold text-[#1B4332] mb-2">Avaliação salva!</h3>
            <p className="text-sm text-gray-500 mb-6">
              Obrigado por registrar. Isso ajuda a IA a melhorar as próximas
              atividades para {nomeFilho}.
            </p>
            <button
              onClick={handleFechar}
              className="w-full py-3 bg-[#1B4332] text-white rounded-xl font-semibold text-sm hover:bg-[#2D6A4F] transition-colors"
            >
              Fechar
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#1B4332]">Como foi a atividade?</h2>
                {atividade.titulo && (
                  <p className="text-sm text-gray-400 mt-0.5 line-clamp-2">{atividade.titulo}</p>
                )}
              </div>
              <button
                onClick={handleFechar}
                className="text-gray-400 hover:text-gray-600 text-xl p-1 flex-shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Humor */}
            <div className="mb-6">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
                Como estava {nomeFilho} durante a atividade?
              </label>
              <div className="grid grid-cols-4 gap-2">
                {opcoesHumor.map((op) => (
                  <button
                    key={op.valor}
                    onClick={() => setHumor(op.valor)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all duration-150 ${
                      humor === op.valor
                        ? 'border-[#1B4332] bg-[#1B4332]/5'
                        : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                    }`}
                  >
                    <span className="text-2xl">{op.emoji}</span>
                    <span className={`text-xs font-medium ${humor === op.valor ? 'text-[#1B4332]' : 'text-gray-500'}`}>
                      {op.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Resultado */}
            <div className="mb-6">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
                {nomeFilho} conseguiu realizar?
              </label>
              <div className="flex flex-col gap-2">
                {opcoesResultado.map((op) => (
                  <button
                    key={op.valor}
                    onClick={() => setResultado(op.valor)}
                    className={`w-full text-left py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-150 ${
                      resultado === op.valor
                        ? 'border-[#1B4332] bg-[#1B4332]/5 text-[#1B4332]'
                        : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Observação opcional */}
            <div className="mb-6">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                Observação{' '}
                <span className="font-normal normal-case text-gray-400">(opcional)</span>
              </label>
              <textarea
                placeholder="Ex: Ela ficou muito animada com as cores dos cartões..."
                rows={2}
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] resize-none placeholder:text-gray-300"
              />
            </div>

            {/* CTA */}
            <button
              onClick={handleSalvar}
              disabled={!humor || !resultado || salvando}
              className={`w-full py-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                humor && resultado
                  ? 'bg-[#1B4332] text-white hover:bg-[#2D6A4F] shadow-md'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {salvando ? '⏳ Salvando...' : '✓ Salvar avaliação'}
            </button>
          </>
        )}

      </div>
    </div>
  )
}
