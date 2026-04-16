'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { downloadPDF, compartilharPDF } from '@/lib/gerarPDF'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Area {
  id: string
  emoji: string
  label: string
}

export interface AtividadeGerada {
  id?: string
  _id?: string
  titulo?: string
  objetivo?: string
  duracao_minutos?: number
  dificuldade?: string
  area?: string
  area_desenvolvimento?: string
  passo_a_passo?: string[] | string
  passos?: string[] | string
  instrucao_familia?: string
  instrucao_para_familia?: string
  materiais?: string[] | string
  adaptacoes?: string[] | string
  quando_buscar_ajuda?: string
  buscar_ajuda?: string
}

interface FilhoProp {
  nome?: string
  idade?: number
  condicao?: string
}

interface Props {
  aberto: boolean
  onFechar: () => void
  area: Area | null | undefined
  nomeFilho: string
  filhoId: number | string
  token: string
  filho?: FilhoProp | null
  onAtividadeSalva?: () => void
  descricaoInicial?: string
}

// ─── Placeholder por área ─────────────────────────────────────────────────────

const placeholderPorArea: Record<string, string> = {
  comunicacao: 'Ex: Ela tem dificuldade em expressar o que sente...',
  cognicao:    'Ex: Ele perde o foco rapidamente em atividades longas...',
  motor:       'Ex: Ela tem dificuldade com atividades que exigem precisão...',
  emocional:   'Ex: Ele fica muito agitado quando a rotina muda...',
  social:      'Ex: Ela prefere brincar sozinha e evita grupos...',
  autonomia:   'Ex: Ele ainda precisa de ajuda para se organizar...',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parsarLista(campo: string[] | string | undefined): string[] {
  if (!campo) return []
  if (Array.isArray(campo)) return campo
  try {
    const parsed = JSON.parse(campo)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function AtividadeModal({
  aberto,
  onFechar,
  area,
  nomeFilho,
  filhoId,
  token,
  filho,
  onAtividadeSalva,
  descricaoInicial = '',
}: Props) {
  const [etapa, setEtapa] = useState<'configurar' | 'gerando' | 'resultado'>('configurar')
  const [descricao, setDescricao] = useState(descricaoInicial)
  const [duracao, setDuracao] = useState(20)
  const [nivel, setNivel] = useState('Médio')
  const [atividade, setAtividade] = useState<AtividadeGerada | null>(null)
  const [erro, setErro] = useState('')
  const [slowNetwork, setSlowNetwork] = useState(false)
  const [gerandoPDF, setGerandoPDF] = useState(false)

  // Reset ao abrir / trocar area/descricaoInicial
  useEffect(() => {
    if (aberto) {
      setDescricao(descricaoInicial)
      setEtapa('configurar')
      setAtividade(null)
      setErro('')
      setSlowNetwork(false)
    }
  }, [aberto, descricaoInicial])

  const handleFechar = () => {
    setEtapa('configurar')
    setDescricao('')
    setDuracao(20)
    setNivel('Médio')
    setAtividade(null)
    setErro('')
    setSlowNetwork(false)
    onFechar()
  }

  const handleGerar = async () => {
    if (!area) return
    setEtapa('gerando')
    setErro('')

    const slowTimer = setTimeout(() => setSlowNetwork(true), 6000)

    try {
      const resultado = await api.post(
        `/v1/familia/filhos/${filhoId}/gerar-atividade`,
        {
          area: area.label,
          descricao_situacao: descricao.trim() || undefined,
          duracao_minutos: duracao,
        },
        token
      )
      clearTimeout(slowTimer)

      const raw = (resultado as { atividade?: AtividadeGerada })?.atividade
        ?? (resultado as AtividadeGerada)
      setAtividade(raw)
      setEtapa('resultado')
      if (onAtividadeSalva) onAtividadeSalva()
    } catch (e: unknown) {
      clearTimeout(slowTimer)
      const err = e as { detail?: string | Array<{ msg: string }>; message?: string }
      const mensagem = Array.isArray(err?.detail)
        ? (err.detail[0]?.msg ?? 'Erro de validação')
        : typeof err?.detail === 'string'
        ? err.detail
        : (err?.message ?? 'Não foi possível gerar a atividade. Tente novamente.')
      setErro(mensagem)
      setEtapa('configurar')
    } finally {
      setSlowNetwork(false)
    }
  }

  const handleCompartilhar = async () => {
    if (!atividade) return
    setGerandoPDF(true)
    try {
      await compartilharPDF(atividade, filho ?? { nome: nomeFilho }, area)
    } catch (e) {
      console.error('Erro ao compartilhar:', e)
    } finally {
      setGerandoPDF(false)
    }
  }

  const handleBaixarPDF = async () => {
    if (!atividade) return
    setGerandoPDF(true)
    try {
      await downloadPDF(atividade, filho ?? { nome: nomeFilho }, area)
    } catch (e) {
      console.error('Erro ao gerar PDF:', e)
    } finally {
      setGerandoPDF(false)
    }
  }

  if (!aberto || !area) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && handleFechar()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ─── ETAPA 1: CONFIGURAR ─── */}
        {etapa === 'configurar' && (
          <div className="p-6">

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{area.emoji}</span>
                  <h2 className="text-lg font-bold text-[#1B4332]">{area.label}</h2>
                </div>
                <p className="text-sm text-gray-400">Atividade para {nomeFilho}</p>
              </div>
              <button
                onClick={handleFechar}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none p-1 flex-shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Situação */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                Descreva a situação{' '}
                <span className="font-normal normal-case text-gray-400">(opcional)</span>
              </label>
              <textarea
                placeholder={placeholderPorArea[area.id] ?? 'Ex: Ela fica agitada quando precisa esperar...'}
                rows={3}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] resize-none placeholder:text-gray-300"
              />
            </div>

            {/* Duração */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                Duração
              </label>
              <div className="flex gap-2">
                {[15, 20, 30].map((min) => (
                  <button
                    key={min}
                    onClick={() => setDuracao(min)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all duration-150 ${
                      duracao === min
                        ? 'border-[#1B4332] bg-[#1B4332] text-white'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {min} min
                  </button>
                ))}
              </div>
            </div>

            {/* Nível */}
            <div className="mb-8">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                Nível da atividade
              </label>
              <div className="flex gap-2">
                {['Fácil', 'Médio', 'Difícil'].map((n) => (
                  <button
                    key={n}
                    onClick={() => setNivel(n)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all duration-150 ${
                      nivel === n
                        ? 'border-[#F59E0B] bg-[#F59E0B]/10 text-[#92400E]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Erro */}
            {erro && (
              <p className="text-red-500 text-xs text-center mb-4">{erro}</p>
            )}

            {/* CTA */}
            <button
              onClick={handleGerar}
              className="w-full py-4 bg-[#1B4332] text-white rounded-xl font-semibold text-sm hover:bg-[#2D6A4F] shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              ✨ Gerar atividade para {nomeFilho}
            </button>
          </div>
        )}

        {/* ─── ETAPA 2: GERANDO ─── */}
        {etapa === 'gerando' && (
          <div className="p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
            <div className="text-5xl mb-6 animate-bounce">✨</div>
            <h3 className="text-lg font-bold text-[#1B4332] mb-2">
              Preparando a atividade...
            </h3>
            <p className="text-sm text-gray-400 max-w-xs">
              A IA está criando uma atividade personalizada para{' '}
              <strong>{nomeFilho}</strong> em {area.label}
            </p>
            {slowNetwork && (
              <p className="text-xs text-amber-600 mt-3 max-w-xs">
                Aguarde, estamos acordando o servidor... (pode levar 30s)
              </p>
            )}
            <div className="w-48 h-1.5 bg-gray-100 rounded-full mt-8 overflow-hidden">
              <div className="h-full bg-[#F59E0B] rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        )}

        {/* ─── ETAPA 3: RESULTADO ─── */}
        {etapa === 'resultado' && atividade && (
          <div id="print-area" className="p-6">

            {/* Header resultado */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded-full">
                  ✨ Atividade gerada
                </span>
                <h2 className="text-lg font-bold text-[#1B4332] mt-2 leading-tight">
                  {atividade.titulo}
                </h2>
              </div>
              <button
                onClick={handleFechar}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none p-1 shrink-0 ml-3"
              >
                ✕
              </button>
            </div>

            {/* Objetivo */}
            {atividade.objetivo && (
              <div className="bg-[#F5F0E8] rounded-xl p-4 mb-5">
                <p className="text-xs font-semibold text-gray-500 mb-1">OBJETIVO</p>
                <p className="text-sm text-[#1B4332] font-medium">{atividade.objetivo}</p>
              </div>
            )}

            {/* Info chips */}
            <div className="flex gap-2 mb-5 flex-wrap">
              <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                ⏱ {atividade.duracao_minutos ?? duracao} min
              </span>
              {atividade.dificuldade && (
                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                  📊 {atividade.dificuldade}
                </span>
              )}
              <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                {area.emoji} {area.label}
              </span>
            </div>

            {/* Passo a passo */}
            {parsarLista(atividade.passo_a_passo ?? atividade.passos).length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Passo a passo
                </p>
                <ol className="flex flex-col gap-3">
                  {parsarLista(atividade.passo_a_passo ?? atividade.passos).map((passo, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-700">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-[#1B4332] text-white text-xs flex items-center justify-center font-bold mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{passo}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Para a família */}
            {(atividade.instrucao_familia ?? atividade.instrucao_para_familia) && (
              <div className="bg-blue-50 rounded-xl p-4 mb-3">
                <p className="text-xs font-semibold text-blue-700 mb-1">🏠 Para a família</p>
                <p className="text-sm text-blue-900 leading-relaxed">
                  {atividade.instrucao_familia ?? atividade.instrucao_para_familia}
                </p>
              </div>
            )}

            {/* Ações */}
            <div className="flex flex-col gap-2 pt-4 border-t border-gray-100 mt-2">
              <button
                onClick={handleCompartilhar}
                disabled={gerandoPDF}
                className="w-full py-3 bg-[#25D366] text-white rounded-xl font-semibold text-sm hover:bg-[#22c55e] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-wait"
              >
                {gerandoPDF ? <>⏳ Gerando PDF...</> : <>📲 Compartilhar PDF</>}
              </button>
              <button
                onClick={handleBaixarPDF}
                disabled={gerandoPDF}
                className="w-full py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:border-gray-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-wait"
              >
                {gerandoPDF ? <>⏳ Gerando PDF...</> : <>⬇️ Baixar PDF</>}
              </button>
              <button
                onClick={handleFechar}
                className="w-full py-3 text-gray-400 text-sm hover:text-gray-600 transition-colors"
              >
                Fechar
              </button>
            </div>

          </div>
        )}

      </motion.div>
    </div>
  )
}
