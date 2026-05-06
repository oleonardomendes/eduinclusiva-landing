'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface TarefaDetalhes {
  titulo: string
  descricao?: string
  duracao_minutos?: number
  area?: string
}

interface RegistroExistente {
  concluiu: boolean
  humor: string
  observacao?: string
}

interface Props {
  aberto: boolean
  onFechar: () => void
  tarefa: TarefaDetalhes
  especialidade: string
  especialistaNome: string
  jaRegistrada: boolean
  registroExistente?: RegistroExistente
  onAbrirRegistro: () => void
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const especialidadeEmoji: Record<string, string> = {
  psicomotricidade: '🧍',
  psicopedagogia: '📚',
  fono: '🗣️',
  fonoaudiologia: '🗣️',
  to: '🖐️',
  terapia_ocupacional: '🖐️',
  psicologia: '🧠',
  aba: '🎯',
  nutricao: '🥗',
  nutrição: '🥗',
  fisioterapia: '💪',
}

const especialidadeCor: Record<string, string> = {
  psicomotricidade: '#1B4332',
  psicopedagogia: '#2D6A4F',
  fono: '#065F4B',
  fonoaudiologia: '#065F4B',
  to: '#0F766E',
  terapia_ocupacional: '#0F766E',
  psicologia: '#6D28D9',
  aba: '#1E40AF',
  nutricao: '#92400E',
  nutrição: '#92400E',
  fisioterapia: '#991B1B',
}

const humorInfo: Record<string, { emoji: string; label: string }> = {
  otimo:   { emoji: '😊', label: 'Ótimo' },
  bem:     { emoji: '🙂', label: 'Bem' },
  regular: { emoji: '😐', label: 'Regular' },
  dificil: { emoji: '😔', label: 'Difícil' },
}

function getEmoji(esp: string) {
  return especialidadeEmoji[esp.toLowerCase()] ?? '🩺'
}

function getCor(esp: string) {
  return especialidadeCor[esp.toLowerCase()] ?? '#1B4332'
}

function formatarNome(esp: string): string {
  return esp.charAt(0).toUpperCase() + esp.slice(1).replace(/_/g, ' ')
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ModalDetalhesTarefa({
  aberto, onFechar, tarefa, especialidade, especialistaNome,
  jaRegistrada, registroExistente, onAbrirRegistro,
}: Props) {
  const cor = getCor(especialidade)
  const emoji = getEmoji(especialidade)
  const nomeFormatado = formatarNome(especialidade)
  const humor = registroExistente ? humorInfo[registroExistente.humor] : null

  const handleRegistrar = () => {
    onFechar()
    // Pequeno delay para a animação de fechar terminar antes de abrir o próximo modal
    setTimeout(() => onAbrirRegistro(), 150)
  }

  return (
    <AnimatePresence>
      {aberto && (
        <motion.div
          key="modal-detalhes-tarefa"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onFechar()}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="bg-white w-full rounded-t-3xl sm:rounded-3xl sm:max-w-lg sm:shadow-2xl max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Indicador de arraste — mobile */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            {/* Header colorido */}
            <div
              className="px-6 pt-4 pb-4 flex items-start justify-between"
              style={{ backgroundColor: cor }}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{emoji}</span>
                  <span className="text-white font-bold text-sm uppercase tracking-wide">
                    {nomeFormatado}
                  </span>
                </div>
                <p className="text-white/70 text-xs">Prescrita por {especialistaNome}</p>
              </div>
              <button
                onClick={onFechar}
                className="ml-3 p-1.5 rounded-full hover:bg-white/20 transition-colors shrink-0"
                aria-label="Fechar"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-5">

              {/* Seção 1 — Identificação */}
              <div>
                <h2 className="font-lora font-bold text-2xl text-[#1A1A1A] leading-snug mb-3">
                  {tarefa.titulo}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {tarefa.area && (
                    <span className="text-xs bg-[#F0F7F4] text-[#2D6A4F] px-3 py-1 rounded-full font-medium">
                      {tarefa.area}
                    </span>
                  )}
                  {tarefa.duracao_minutos && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
                      ⏱ {tarefa.duracao_minutos} minutos
                    </span>
                  )}
                </div>
              </div>

              {/* Seção 2 — Como fazer */}
              {tarefa.descricao ? (
                <div className="bg-[#E8F4EE] rounded-2xl p-4 border border-[#A7F3D0]">
                  <p className="text-[#065F46] text-xs font-semibold uppercase tracking-wide mb-2">
                    📋 Como fazer
                  </p>
                  <p className="text-[#1A1A1A] text-sm leading-relaxed">{tarefa.descricao}</p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-2xl p-4 border border-dashed border-gray-200 text-center">
                  <p className="text-gray-400 text-sm">Nenhuma descrição disponível para esta tarefa.</p>
                </div>
              )}

              {/* Seção 3 — Registro existente */}
              {jaRegistrada && registroExistente && (
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Seu registro
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{humor?.emoji ?? '😊'}</span>
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A1A]">{humor?.label}</p>
                      <p className="text-xs text-gray-500">
                        {registroExistente.concluiu
                          ? '✅ Conseguiu realizar'
                          : '❌ Não conseguiu desta vez'}
                      </p>
                    </div>
                  </div>
                  {registroExistente.observacao && (
                    <p className="text-sm text-gray-500 italic border-t border-gray-200 pt-3">
                      &ldquo;{registroExistente.observacao}&rdquo;
                    </p>
                  )}
                  <button
                    onClick={handleRegistrar}
                    className="w-full mt-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all hover:opacity-80"
                    style={{ borderColor: cor, color: cor }}
                  >
                    Atualizar registro
                  </button>
                </div>
              )}

              {/* Seção 4 — Botão registrar (pendente) */}
              {!jaRegistrada && (
                <button
                  onClick={handleRegistrar}
                  className="w-full py-4 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ backgroundColor: cor }}
                >
                  ✓ Registrar como foi
                </button>
              )}

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
