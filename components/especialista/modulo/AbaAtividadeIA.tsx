'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api, createPlano, enviarPlanoFamilia } from '@/lib/api'
import { getToken } from '@/lib/auth'
import { MODULOS_CONFIG } from '@/lib/modulos'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface PacienteInfo {
  nome?: string
  condicao?: string
  grau?: string
}

interface Atividade {
  id?: number
  titulo: string
  objetivo?: string
  conteudo_atividade?: string
  disciplina?: string
  duracao_minutos?: number
  passo_a_passo: string[] | string
  plano_id?: number
}

interface Props {
  pacienteId: string
  modulo: string
  paciente: unknown
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getProximaSegunda(): string {
  const hoje = new Date()
  const diaSemana = hoje.getDay()
  const diasAte = diaSemana === 1 ? 7 : (8 - diaSemana) % 7
  const proxSegunda = new Date(hoje)
  proxSegunda.setDate(hoje.getDate() + diasAte)
  return proxSegunda.toISOString().split('T')[0]
}

function getDomingo(segunda: string): string {
  const d = new Date(segunda + 'T12:00:00')
  d.setDate(d.getDate() + 6)
  return d.toISOString().split('T')[0]
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AbaAtividadeIA({ pacienteId, modulo, paciente }: Props) {
  const p = paciente as PacienteInfo | null

  const [areaFoco, setAreaFoco] = useState('')
  const [nivelAtual, setNivelAtual] = useState('')
  const [duracaoMinutos, setDuracaoMinutos] = useState<number | ''>(20)
  const [observacoes, setObservacoes] = useState('')
  const [gerando, setGerando] = useState(false)
  const [atividade, setAtividade] = useState<Atividade | null>(null)
  const [enviada, setEnviada] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  // mini-modal criar plano
  const [modalPlanoAberto, setModalPlanoAberto] = useState(false)
  const [semanaInicio, setSemanaInicio] = useState('')
  const [orientacoesGerais, setOrientacoesGerais] = useState('')
  const [criandoPlano, setCriandoPlano] = useState(false)

  const config = MODULOS_CONFIG[modulo]

  const handleGerar = async () => {
    const token = getToken()
    if (!token) return
    setGerando(true)
    setAtividade(null)
    setErro(null)
    try {
      const moduloNormalizado = modulo.toLowerCase().replace(/\s+/g, '').replace(/\+/g, '')
      const payload = {
        area_foco:       areaFoco       || undefined,
        nivel_atual:     nivelAtual     || undefined,
        duracao_minutos: duracaoMinutos || 20,
        observacoes:     observacoes    || undefined,
      }
      console.log('Payload gerar atividade:', payload)
      console.log('URL:', `/v1/especialista/pacientes/${pacienteId}/${moduloNormalizado}/gerar-atividade/`)
      const data = await api.post(
        `/v1/especialista/pacientes/${pacienteId}/${moduloNormalizado}/gerar-atividade/`,
        payload,
        token
      )
      const atividadeData = (data as { atividade?: Atividade })?.atividade ?? (data as Atividade)
      setAtividade(atividadeData)
    } catch {
      setErro('Não foi possível gerar a atividade. Tente novamente.')
    } finally {
      setGerando(false)
    }
  }

  const handleAbrirModalPlano = () => {
    setSemanaInicio(getProximaSegunda())
    setOrientacoesGerais('')
    setErro(null)
    setModalPlanoAberto(true)
  }

  const handleCriarPlano = async () => {
    if (!atividade) return
    const token = getToken()
    if (!token) return
    setCriandoPlano(true)
    setErro(null)
    try {
      const plano = await createPlano(Number(pacienteId), {
        semana_inicio: semanaInicio,
        semana_fim: getDomingo(semanaInicio),
        tarefas: [{
          titulo: atividade.titulo,
          descricao: atividade.conteudo_atividade ?? atividade.objetivo,
          duracao_minutos: atividade.duracao_minutos,
          area: atividade.disciplina ?? modulo,
        }],
        orientacoes_gerais: orientacoesGerais || undefined,
        atividade_ia_id: atividade.id,
      }, token) as { id: number }

      await enviarPlanoFamilia(plano.id, token)
      setModalPlanoAberto(false)
      setEnviada(true)
    } catch (e: unknown) {
      const err = e as { detail?: string }
      setErro(err?.detail ?? 'Erro ao criar e enviar o plano.')
    } finally {
      setCriandoPlano(false)
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
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-[#1B4332] mb-1">
              O que trabalhar nesta atividade?
            </h3>
            <p className="text-xs text-gray-400">
              Todos os campos são opcionais — a IA usa as sessões registradas como base
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Área de foco
            </label>
            <textarea
              placeholder={`Ex: Trabalhar ${config?.habilidades?.[0]?.replace(/_/g, ' ') ?? '...'} com apoio visual...`}
              rows={2}
              value={areaFoco}
              onChange={(e) => setAreaFoco(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] resize-none placeholder:text-gray-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Nível atual
              </label>
              <input
                type="text"
                placeholder="Ex: emergente, em desenvolvimento..."
                value={nivelAtual}
                onChange={(e) => setNivelAtual(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] placeholder:text-gray-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Duração (min)
              </label>
              <input
                type="number"
                min={5}
                max={120}
                value={duracaoMinutos}
                onChange={(e) => setDuracaoMinutos(e.target.value ? Number(e.target.value) : '')}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Observações <span className="font-normal normal-case text-gray-400">(opcional)</span>
            </label>
            <textarea
              placeholder="Informações adicionais relevantes para a IA..."
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] resize-none placeholder:text-gray-300"
            />
          </div>

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

          {/* Ações */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleAbrirModalPlano}
              className="w-full py-4 bg-[#1B4332] text-white rounded-xl font-semibold text-sm hover:bg-[#2D6A4F] transition-colors flex items-center justify-center gap-2"
            >
              ✅ Aprovar e enviar à família
            </button>
            <button
              onClick={() => { setAtividade(null); setAreaFoco(''); setNivelAtual(''); setDuracaoMinutos(20); setObservacoes('') }}
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
          <h3 className="text-lg font-bold text-[#1B4332] mb-2">Plano enviado!</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
            A família de {p?.nome} receberá o plano semanal com esta atividade.
          </p>
          <button
            onClick={() => { setAtividade(null); setEnviada(false); setAreaFoco(''); setNivelAtual(''); setDuracaoMinutos(20); setObservacoes('') }}
            className="px-6 py-3 bg-[#1B4332] text-white rounded-xl text-sm font-semibold hover:bg-[#2D6A4F] transition-colors"
          >
            Gerar outra atividade
          </button>
        </div>
      )}

      {erro && !modalPlanoAberto && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600">
          {erro}
        </div>
      )}

      {/* Mini-modal — criar plano semanal */}
      <AnimatePresence>
        {modalPlanoAberto && atividade && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setModalPlanoAberto(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <h3 className="text-base font-bold text-[#1B4332] mb-1">
                Criar plano semanal com esta atividade?
              </h3>
              <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                Selecione a semana. A família de {p?.nome} receberá um plano com a
                atividade &ldquo;{atividade.titulo}&rdquo;.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Semana de início (segunda-feira)
                  </label>
                  <input
                    type="date"
                    value={semanaInicio}
                    onChange={(e) => setSemanaInicio(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]"
                  />
                  {semanaInicio && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      Semana: {new Date(semanaInicio + 'T12:00:00').toLocaleDateString('pt-BR')} –{' '}
                      {new Date(getDomingo(semanaInicio) + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Orientações gerais para a família <span className="font-normal normal-case">(opcional)</span>
                  </label>
                  <textarea
                    value={orientacoesGerais}
                    onChange={(e) => setOrientacoesGerais(e.target.value)}
                    rows={3}
                    placeholder="Dicas para apoiar em casa durante a semana..."
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] resize-none placeholder:text-gray-300"
                  />
                </div>
              </div>

              {erro && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600">
                  {erro}
                </div>
              )}

              <div className="flex gap-2 mt-5">
                <button
                  onClick={handleCriarPlano}
                  disabled={criandoPlano || !semanaInicio}
                  className="flex-1 py-3 bg-[#1B4332] text-white rounded-xl text-sm font-semibold hover:bg-[#2D6A4F] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {criandoPlano ? '⏳ Enviando...' : '✅ Criar e enviar'}
                </button>
                <button
                  onClick={() => setModalPlanoAberto(false)}
                  disabled={criandoPlano}
                  className="px-4 py-3 border border-gray-200 text-gray-500 rounded-xl text-sm hover:border-gray-300 transition-colors disabled:opacity-60"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
