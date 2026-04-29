'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'
import { createSessao } from '@/lib/api'
import { getToken } from '@/lib/auth'
import { CAMPOS_SESSAO_ESPECIALIDADE, especialidadeParaModulo } from '@/lib/modulos'

// ─── Opções ───────────────────────────────────────────────────────────────────

const especialidades = [
  'Psicomotricidade', 'Psicopedagogia', 'Fonoaudiologia',
  'Terapia Ocupacional', 'Psicologia', 'ABA', 'Nutrição', 'Fisioterapia',
]

const humores = [
  { valor: 'otimo',   emoji: '😊', label: 'Ótimo',   desc: 'Animado e colaborativo' },
  { valor: 'bem',     emoji: '🙂', label: 'Bem',     desc: 'Tranquilo e receptivo'  },
  { valor: 'regular', emoji: '😐', label: 'Regular', desc: 'Algumas dificuldades'   },
  { valor: 'dificil', emoji: '😔', label: 'Difícil', desc: 'Resistência ou agitação' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatOpcao(s: string) {
  return s.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Props {
  aberto: boolean
  onFechar: () => void
  pacienteId: number
  onSalvo: () => void
  especialidadeInicial?: string
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ModalSessao({ aberto, onFechar, pacienteId, onSalvo, especialidadeInicial }: Props) {
  const hoje = new Date().toISOString().split('T')[0]

  const [step, setStep] = useState(1)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  // Step 1
  const [humor, setHumor] = useState<string | null>(null)
  const [dataSessao, setDataSessao] = useState(hoje)
  const [duracao, setDuracao] = useState<number | ''>('')
  const [especialidade, setEspecialidade] = useState(especialidadeInicial ?? '')

  // Step 2
  const [atividadesRealizadas, setAtividadesRealizadas] = useState('')
  const [respostaCrianca, setRespostaCrianca] = useState('')

  // Step 3
  const [camposEspecificos, setCamposEspecificos] = useState<Record<string, string>>({})
  const [oQueFuncionou, setOQueFuncionou] = useState('')
  const [oQueNaoFuncionou, setOQueNaoFuncionou] = useState('')

  // Step 4
  const [focoProxima, setFocoProxima] = useState('')
  const [observacoesClin, setObservacoesClin] = useState('')

  const moduloKey    = especialidadeParaModulo[especialidade]
  const camposConfig = moduloKey ? (CAMPOS_SESSAO_ESPECIALIDADE[moduloKey] ?? []) : []

  const toggleCampo = (campo: string, valor: string) =>
    setCamposEspecificos((prev) => ({
      ...prev,
      [campo]: prev[campo] === valor ? '' : valor,
    }))

  const resetar = () => {
    setStep(1)
    setHumor(null)
    setDataSessao(hoje)
    setDuracao('')
    setEspecialidade(especialidadeInicial ?? '')
    setAtividadesRealizadas('')
    setRespostaCrianca('')
    setCamposEspecificos({})
    setOQueFuncionou('')
    setOQueNaoFuncionou('')
    setFocoProxima('')
    setObservacoesClin('')
    setErro('')
    setSucesso(false)
  }

  const handleFechar = () => { resetar(); onFechar() }

  const canGoNext = (): boolean => {
    if (step === 1) return !!humor && !!especialidade
    if (step === 2) return !!atividadesRealizadas.trim()
    return true
  }

  const handleSalvar = async () => {
    const token = getToken()
    if (!token) return
    setSalvando(true)
    setErro('')

    const payload: Record<string, unknown> = {
      especialidade,
      data_sessao:         dataSessao,
      duracao_minutos:     duracao || undefined,
      humor_inicio:        humor,
      atividades_realizadas: atividadesRealizadas || undefined,
      resposta_crianca:    respostaCrianca || undefined,
      o_que_funcionou:     oQueFuncionou || undefined,
      o_que_nao_funcionou: oQueNaoFuncionou || undefined,
      observacoes_clinicas: observacoesClin || undefined,
      foco_proxima_sessao: focoProxima || undefined,
    }

    camposConfig.forEach(({ campo, tipo }) => {
      const val = camposEspecificos[campo]
      if (val) payload[campo] = tipo === 'number' ? Number(val) : val
    })

    try {
      await createSessao(pacienteId, payload, token)
      setSucesso(true)
    } catch (e: unknown) {
      const err = e as { detail?: string; message?: string }
      setErro(err?.detail ?? err?.message ?? 'Não foi possível salvar.')
    } finally {
      setSalvando(false)
    }
  }

  const humorAtual = humores.find((h) => h.valor === humor)

  const inputCls  = 'w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1A1A1A] bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent transition-all placeholder:text-[#A0AEC0]'
  const labelCls  = 'block text-xs font-semibold text-[#4A5568] uppercase tracking-wide mb-1.5'

  return (
    <AnimatePresence>
      {aberto && (
        <motion.div
          key="modal-sessao"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && handleFechar()}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto"
          >
            {/* Header */}
            {!sucesso && (
              <div className="sticky top-0 bg-white rounded-t-3xl sm:rounded-t-3xl border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <h2 className="font-bold text-lg text-[#1B4332]">Registrar Sessão</h2>
                  <div className="flex items-center gap-1 mt-1.5">
                    {[1, 2, 3, 4].map((s) => (
                      <div
                        key={s}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          step >= s ? 'bg-[#1B4332] w-7' : 'bg-gray-200 w-4'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <button onClick={handleFechar} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            )}

            <div className="p-6">

              {/* ── Sucesso ────────────────────────────────────────────── */}
              {sucesso && (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="text-lg font-bold text-[#1B4332] mb-2">Sessão registrada!</h3>
                  <p className="text-sm text-gray-500 mb-6">Dados salvos com sucesso.</p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => { resetar(); onSalvo() }}
                      className="w-full py-3.5 bg-[#1B4332] text-white rounded-xl font-semibold text-sm hover:bg-[#2D6A4F] transition-colors"
                    >
                      Fechar
                    </button>
                    <button
                      onClick={resetar}
                      className="w-full py-3 text-gray-400 text-sm hover:text-gray-600 transition-colors"
                    >
                      Registrar outra sessão
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 1: Setup ──────────────────────────────────────── */}
              {!sucesso && step === 1 && (
                <div className="space-y-5">
                  <div>
                    <p className="text-base font-bold text-[#1B4332] mb-1">Como a criança chegou?</p>
                    <p className="text-xs text-gray-400 mb-4">Selecione o humor no início da sessão</p>
                    <div className="grid grid-cols-2 gap-3">
                      {humores.map((h) => (
                        <button
                          key={h.valor}
                          type="button"
                          onClick={() => setHumor(h.valor)}
                          className={`flex flex-col items-start gap-2 p-4 rounded-2xl border-2 transition-all ${
                            humor === h.valor
                              ? 'border-[#1B4332] bg-[#1B4332]/5'
                              : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                          }`}
                        >
                          <span className="text-3xl">{h.emoji}</span>
                          <div>
                            <p className={`text-sm font-semibold ${humor === h.valor ? 'text-[#1B4332]' : 'text-gray-700'}`}>
                              {h.label}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{h.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Data</label>
                      <input
                        type="date"
                        value={dataSessao}
                        onChange={(e) => setDataSessao(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Duração (min)</label>
                      <input
                        type="number" min={1} max={480} value={duracao}
                        onChange={(e) => setDuracao(e.target.value ? Number(e.target.value) : '')}
                        placeholder="Ex: 45"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {!especialidadeInicial && (
                    <div>
                      <label className={labelCls}>Especialidade *</label>
                      <select
                        value={especialidade}
                        onChange={(e) => { setEspecialidade(e.target.value); setCamposEspecificos({}) }}
                        className={inputCls + ' cursor-pointer'}
                      >
                        <option value="">Selecionar...</option>
                        {especialidades.map((e) => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 2: Conteúdo ───────────────────────────────────── */}
              {!sucesso && step === 2 && (
                <div className="space-y-4">
                  <div>
                    <p className="text-base font-bold text-[#1B4332] mb-1">O que foi trabalhado?</p>
                    <p className="text-xs text-gray-400 mb-4">Descreva as atividades da sessão</p>
                  </div>
                  <div>
                    <label className={labelCls}>Atividades realizadas *</label>
                    <textarea
                      value={atividadesRealizadas}
                      onChange={(e) => setAtividadesRealizadas(e.target.value)}
                      rows={5}
                      autoFocus
                      placeholder="Descreva as atividades e exercícios realizados na sessão..."
                      className={inputCls + ' resize-none'}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>
                      Resposta da criança{' '}
                      <span className="font-normal normal-case text-gray-400">(opcional)</span>
                    </label>
                    <textarea
                      value={respostaCrianca}
                      onChange={(e) => setRespostaCrianca(e.target.value)}
                      rows={2}
                      placeholder="Como a criança respondeu às atividades..."
                      className={inputCls + ' resize-none'}
                    />
                  </div>
                </div>
              )}

              {/* ── Step 3: Como foi ───────────────────────────────────── */}
              {!sucesso && step === 3 && (
                <div className="space-y-5">
                  <div>
                    <p className="text-base font-bold text-[#1B4332] mb-1">Como foi a sessão?</p>
                    <p className="text-xs text-gray-400 mb-2">Todos os campos são opcionais</p>
                  </div>

                  {/* Chips por especialidade */}
                  {camposConfig.length > 0 && (
                    <div className="bg-[#E8F4EE] rounded-2xl p-4 space-y-4">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-[#1B4332]">📊 Avaliação da sessão</p>
                        <span className="text-[10px] font-semibold bg-[#1B4332] text-white px-2 py-0.5 rounded-full">
                          {especialidade}
                        </span>
                      </div>
                      {camposConfig.map(({ campo, label, opcoes, tipo, min, max }) => (
                        <div key={campo}>
                          <label className={labelCls}>{label}</label>
                          {tipo === 'number' ? (
                            <input
                              type="number" min={min} max={max}
                              value={camposEspecificos[campo] ?? ''}
                              onChange={(e) =>
                                setCamposEspecificos((prev) => ({ ...prev, [campo]: e.target.value }))
                              }
                              placeholder={`${min ?? 0}–${max ?? 100}`}
                              className={inputCls}
                            />
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {(opcoes ?? []).map((opcao) => (
                                <button
                                  key={opcao}
                                  type="button"
                                  onClick={() => toggleCampo(campo, opcao)}
                                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                    camposEspecificos[campo] === opcao
                                      ? 'bg-[#1B4332] text-white border-[#1B4332]'
                                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#1B4332]/40'
                                  }`}
                                >
                                  {formatOpcao(opcao)}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* O que funcionou / não funcionou */}
                  <div className="space-y-3">
                    <div>
                      <label className={labelCls}>
                        O que funcionou{' '}
                        <span className="font-normal normal-case text-gray-400">(opcional)</span>
                      </label>
                      <textarea
                        value={oQueFuncionou}
                        onChange={(e) => setOQueFuncionou(e.target.value)}
                        rows={2}
                        placeholder="Estratégias e abordagens efetivas..."
                        className={inputCls + ' resize-none'}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>
                        O que não funcionou{' '}
                        <span className="font-normal normal-case text-gray-400">(opcional)</span>
                      </label>
                      <textarea
                        value={oQueNaoFuncionou}
                        onChange={(e) => setOQueNaoFuncionou(e.target.value)}
                        rows={2}
                        placeholder="Dificuldades encontradas..."
                        className={inputCls + ' resize-none'}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 4: Próximos passos ────────────────────────────── */}
              {!sucesso && step === 4 && (
                <div className="space-y-4">
                  <div>
                    <p className="text-base font-bold text-[#1B4332] mb-1">Próximos passos</p>
                    <p className="text-xs text-gray-400 mb-4">Finalize o registro da sessão</p>
                  </div>

                  <div>
                    <label className={labelCls}>
                      Foco da próxima sessão{' '}
                      <span className="font-normal normal-case text-gray-400">(opcional)</span>
                    </label>
                    <textarea
                      value={focoProxima}
                      onChange={(e) => setFocoProxima(e.target.value)}
                      rows={3}
                      placeholder="O que trabalhar na próxima sessão..."
                      className={inputCls + ' resize-none'}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>
                      Observações clínicas{' '}
                      <span className="font-normal normal-case text-gray-400">(opcional)</span>
                    </label>
                    <textarea
                      value={observacoesClin}
                      onChange={(e) => setObservacoesClin(e.target.value)}
                      rows={2}
                      placeholder="Observações relevantes..."
                      className={inputCls + ' resize-none'}
                    />
                  </div>

                  {/* Resumo */}
                  <div className="bg-[#F5F5F0] rounded-2xl p-4 text-xs text-gray-500 space-y-1.5">
                    <p className="font-semibold text-gray-700 text-sm mb-2">Resumo da sessão</p>
                    <p>📅 {new Date(dataSessao + 'T12:00:00').toLocaleDateString('pt-BR')}
                      {duracao ? ` · ${duracao} min` : ''}
                    </p>
                    <p>{humorAtual?.emoji} {humorAtual?.label}</p>
                    {especialidade && <p>🏷 {especialidade}</p>}
                    {atividadesRealizadas && (
                      <p className="truncate">
                        📝 {atividadesRealizadas.slice(0, 70)}
                        {atividadesRealizadas.length > 70 ? '...' : ''}
                      </p>
                    )}
                  </div>

                  {erro && (
                    <div className="bg-red-50 text-red-600 text-xs px-4 py-3 rounded-xl border border-red-100">
                      {erro}
                    </div>
                  )}
                </div>
              )}

              {/* Navegação */}
              {!sucesso && (
                <div className="flex gap-3 mt-6">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => setStep((s) => s - 1)}
                      className="flex items-center gap-1.5 px-4 py-3 border border-gray-200 text-gray-500 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Voltar
                    </button>
                  )}
                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={() => setStep((s) => s + 1)}
                      disabled={!canGoNext()}
                      className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-[#1B4332] text-white rounded-xl text-sm font-semibold hover:bg-[#2D6A4F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continuar
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSalvar}
                      disabled={salvando}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1B4332] text-white rounded-xl text-sm font-semibold hover:bg-[#2D6A4F] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {salvando ? <><Spinner /> Salvando...</> : '✓ Salvar sessão'}
                    </button>
                  )}
                </div>
              )}

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
