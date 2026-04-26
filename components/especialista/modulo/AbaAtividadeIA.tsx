'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { getToken } from '@/lib/auth'
import { MODULOS_CONFIG } from '@/lib/modulos'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface PacienteInfo {
  nome?: string
  condicao?: string
  grau?: string
}

interface Atividade {
  titulo: string
  objetivo?: string
  duracao_minutos?: number
  passo_a_passo: string[] | string
  plano_id?: number
}

interface Props {
  pacienteId: string
  modulo: string
  paciente: unknown
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AbaAtividadeIA({ pacienteId, modulo, paciente }: Props) {
  const p = paciente as PacienteInfo | null

  const [descricao, setDescricao] = useState('')
  const [gerando, setGerando] = useState(false)
  const [atividade, setAtividade] = useState<Atividade | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [enviada, setEnviada] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const config = MODULOS_CONFIG[modulo]

  const handleGerar = async () => {
    const token = getToken()
    if (!token) return
    setGerando(true)
    setAtividade(null)
    setErro(null)
    try {
      const data = await api.post(
        `/v1/especialista/pacientes/${pacienteId}/${modulo}/gerar-atividade/`,
        { descricao_foco: descricao },
        token
      )
      setAtividade(data as Atividade)
    } catch {
      setErro('Não foi possível gerar a atividade. Tente novamente.')
    } finally {
      setGerando(false)
    }
  }

  const handleEnviarFamilia = async () => {
    if (!atividade?.plano_id) return
    const token = getToken()
    if (!token) return
    setEnviando(true)
    setErro(null)
    try {
      await api.post(
        `/v1/especialista/planos/${atividade.plano_id}/enviar-familia`,
        {},
        token
      )
      setEnviada(true)
    } catch {
      setErro('Erro ao enviar para a família.')
    } finally {
      setEnviando(false)
    }
  }

  const passos: string[] = Array.isArray(atividade?.passo_a_passo)
    ? atividade.passo_a_passo
    : (() => {
        try { return JSON.parse((atividade?.passo_a_passo as string) ?? '[]') as string[] }
        catch { return [] }
      })()

  return (
    <div className="flex flex-col gap-4">

      {/* Contexto do paciente */}
      <div className="bg-[#E8F4EE] rounded-2xl p-4 flex gap-3">
        <span className="text-2xl shrink-0">{config?.emoji}</span>
        <div>
          <p className="text-xs font-semibold text-[#1B4332]">
            Atividade para {p?.nome}
          </p>
          <p className="text-xs text-[#2D6A4F] mt-0.5">
            {config?.label}
            {p?.condicao ? ` · ${p.condicao}` : ''}
            {p?.grau ? ` · ${p.grau}` : ''}
          </p>
        </div>
      </div>

      {/* Formulário de geração */}
      {!atividade && !enviada && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-[#1B4332] mb-1">
            O que trabalhar nesta atividade?
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Descreva o foco ou deixe em branco para a IA sugerir
            com base nas sessões registradas
          </p>
          <textarea
            placeholder={`Ex: Trabalhar ${config?.habilidades?.[0]?.replace(/_/g, ' ') ?? '...'} com apoio visual...`}
            rows={3}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] resize-none placeholder:text-gray-300 mb-4"
          />
          <button
            onClick={handleGerar}
            disabled={gerando}
            className="w-full py-3.5 bg-[#1B4332] text-white rounded-xl font-semibold text-sm hover:bg-[#2D6A4F] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {gerando
              ? <><span className="animate-spin inline-block">⚙️</span> Gerando atividade...</>
              : <>✨ Gerar atividade com IA</>
            }
          </button>
        </div>
      )}

      {/* Resultado da atividade */}
      {atividade && !enviada && (
        <div className="flex flex-col gap-3">

          {/* Badge de revisão obrigatória */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2">
            <span className="text-amber-500 shrink-0 mt-0.5">⚠️</span>
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Revise antes de enviar.</strong> Esta atividade foi gerada
              pela IA com base no perfil do paciente. O especialista é responsável
              por validar o conteúdo antes de prescrever.
            </p>
          </div>

          {/* Conteúdo da atividade */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-base font-bold text-[#1B4332] flex-1 pr-4">
                {atividade.titulo}
              </h3>
              <span className="text-[10px] font-semibold text-[#92400E] bg-[#F59E0B]/15 px-2 py-1 rounded-full shrink-0 border border-[#F59E0B]/20">
                Sugestão IA
              </span>
            </div>

            {atividade.objetivo && (
              <div className="bg-[#F5F0E8] rounded-xl p-3 mb-4">
                <p className="text-[10px] font-semibold text-gray-500 mb-1">OBJETIVO</p>
                <p className="text-sm text-[#1B4332]">{atividade.objetivo}</p>
              </div>
            )}

            <div className="flex gap-2 mb-4 flex-wrap">
              {atividade.duracao_minutos && (
                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                  ⏱ {atividade.duracao_minutos} min
                </span>
              )}
              <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                {config?.emoji} {config?.label}
              </span>
            </div>

            {passos.length > 0 && (
              <>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Passo a passo
                </p>
                <ol className="flex flex-col gap-2">
                  {passos.map((passo, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-700">
                      <span className="w-5 h-5 rounded-full bg-[#1B4332] text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{passo}</span>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </div>

          {/* Ações — aprovar ou descartar */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleEnviarFamilia}
              disabled={enviando}
              className="w-full py-4 bg-[#1B4332] text-white rounded-xl font-semibold text-sm hover:bg-[#2D6A4F] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {enviando ? '⏳ Enviando...' : '✅ Aprovar e enviar à família'}
            </button>
            <button
              onClick={() => { setAtividade(null); setDescricao('') }}
              className="w-full py-3 text-gray-400 text-sm hover:text-gray-600 transition-colors"
            >
              Descartar e gerar outra
            </button>
          </div>

        </div>
      )}

      {/* Confirmação de envio */}
      {enviada && (
        <div className="text-center py-10">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-lg font-bold text-[#1B4332] mb-2">Atividade enviada!</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
            A família de {p?.nome} receberá a atividade no portal deles.
          </p>
          <button
            onClick={() => { setAtividade(null); setEnviada(false); setDescricao('') }}
            className="px-6 py-3 bg-[#1B4332] text-white rounded-xl text-sm font-semibold hover:bg-[#2D6A4F] transition-colors"
          >
            Gerar outra atividade
          </button>
        </div>
      )}

      {erro && (
        <p className="text-red-500 text-xs text-center">{erro}</p>
      )}

    </div>
  )
}
