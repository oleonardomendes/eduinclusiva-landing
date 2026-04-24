'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { createSessao } from '@/lib/api'
import { getToken } from '@/lib/auth'

// ─── Opções ───────────────────────────────────────────────────────────────────

const especialidades = [
  'Psicomotricidade', 'Psicopedagogia', 'Fonoaudiologia',
  'Terapia Ocupacional', 'Psicologia', 'ABA',
]

const humores = [
  { valor: 'otimo', emoji: '😊', label: 'Ótimo' },
  { valor: 'bem', emoji: '🙂', label: 'Bem' },
  { valor: 'regular', emoji: '😐', label: 'Regular' },
  { valor: 'dificil', emoji: '😔', label: 'Difícil' },
]

const niveisPsicomotricidade = ['Emergente', 'Em desenvolvimento', 'Consolidado']
const niveisPedagogia = ['Pré-silábico', 'Silábico', 'Alfabético', 'Fluente']
const niveisCognitivos = ['Emergente', 'Em desenvolvimento', 'Consolidado']

const habilidadesOpcoes = ['Leitura', 'Escrita', 'Matemática', 'Atenção', 'Memória']

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Props {
  aberto: boolean
  onFechar: () => void
  pacienteId: number
  onSalvo: () => void
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ModalSessao({ aberto, onFechar, pacienteId, onSalvo }: Props) {
  const hoje = new Date().toISOString().split('T')[0]

  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  // Campos gerais
  const [especialidade, setEspecialidade] = useState('')
  const [dataSessao, setDataSessao] = useState(hoje)
  const [duracao, setDuracao] = useState<number | ''>('')
  const [humor, setHumor] = useState<string | null>(null)
  const [atividadesRealizadas, setAtividadesRealizadas] = useState('')
  const [respostaCrianca, setRespostaCrianca] = useState('')
  const [oQueFuncionou, setOQueFuncionou] = useState('')
  const [oQueNaoFuncionou, setOQueNaoFuncionou] = useState('')
  const [observacoesClin, setObservacoesClin] = useState('')
  const [focoProxima, setFocoProxima] = useState('')

  // Psicomotricidade
  const [coordFina, setCoordFina] = useState('')
  const [coordGrossa, setCoordGrossa] = useState('')
  const [equilibrio, setEquilibrio] = useState('')
  const [lateralidade, setLateralidade] = useState('')
  const [esquemaCorporal, setEsquemaCorporal] = useState('')

  // Psicopedagogia
  const [nivelLeitura, setNivelLeitura] = useState('')
  const [nivelEscrita, setNivelEscrita] = useState('')
  const [nivelMatematica, setNivelMatematica] = useState('')
  const [habilidades, setHabilidades] = useState<string[]>([])

  const resetar = () => {
    setEspecialidade(''); setDataSessao(hoje); setDuracao(''); setHumor(null)
    setAtividadesRealizadas(''); setRespostaCrianca(''); setOQueFuncionou('')
    setOQueNaoFuncionou(''); setObservacoesClin(''); setFocoProxima('')
    setCoordFina(''); setCoordGrossa(''); setEquilibrio(''); setLateralidade('')
    setEsquemaCorporal(''); setNivelLeitura(''); setNivelEscrita('')
    setNivelMatematica(''); setHabilidades([]); setErro('')
  }

  const handleFechar = () => { resetar(); onFechar() }

  const toggleHabilidade = (h: string) =>
    setHabilidades((prev) => prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!especialidade) { setErro('Selecione a especialidade'); return }
    if (!humor) { setErro('Selecione o humor no início da sessão'); return }
    const token = getToken()
    if (!token) return
    setSalvando(true)
    setErro('')

    const payload: Record<string, unknown> = {
      especialidade,
      data_sessao: dataSessao,
      duracao_minutos: duracao || undefined,
      humor_inicio: humor,
      atividades_realizadas: atividadesRealizadas || undefined,
      resposta_crianca: respostaCrianca || undefined,
      o_que_funcionou: oQueFuncionou || undefined,
      o_que_nao_funcionou: oQueNaoFuncionou || undefined,
      observacoes_clinicas: observacoesClin || undefined,
      foco_proxima_sessao: focoProxima || undefined,
    }

    if (especialidade === 'Psicomotricidade') {
      Object.assign(payload, {
        coordenacao_fina: coordFina || undefined,
        coordenacao_grossa: coordGrossa || undefined,
        equilibrio: equilibrio || undefined,
        lateralidade: lateralidade || undefined,
        esquema_corporal: esquemaCorporal || undefined,
      })
    }

    if (especialidade === 'Psicopedagogia') {
      Object.assign(payload, {
        nivel_leitura: nivelLeitura || undefined,
        nivel_escrita: nivelEscrita || undefined,
        nivel_matematica: nivelMatematica || undefined,
        habilidades_trabalhadas: habilidades.length > 0 ? habilidades : undefined,
      })
    }

    try {
      await createSessao(pacienteId, payload, token)
      resetar()
      onSalvo()
    } catch (e: unknown) {
      const err = e as { detail?: string; message?: string }
      setErro(err?.detail ?? err?.message ?? 'Não foi possível salvar. Tente novamente.')
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
          key="modal-sessao"
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
                <h2 className="font-lora font-bold text-xl text-[#1B4332]">Registrar Sessão</h2>
                <p className="text-sm text-[#718096] mt-0.5">Preencha os dados da sessão</p>
              </div>
              <button onClick={handleFechar} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-[#718096]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">

              {/* Dados gerais */}
              <div>
                <p className="text-sm font-bold text-[#1B4332] mb-4">Dados gerais</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Especialidade *</label>
                    <select value={especialidade} onChange={(e) => setEspecialidade(e.target.value)} className={selectCls}>
                      <option value="">Selecionar...</option>
                      {especialidades.map((e) => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Data da sessão</label>
                    <input type="date" value={dataSessao} onChange={(e) => setDataSessao(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Duração (minutos)</label>
                    <input type="number" min={1} max={480} value={duracao}
                      onChange={(e) => setDuracao(e.target.value ? Number(e.target.value) : '')}
                      placeholder="Ex: 45" className={inputCls} />
                  </div>
                </div>
              </div>

              {/* Humor */}
              <div>
                <label className={labelCls}>Humor no início da sessão *</label>
                <div className="grid grid-cols-4 gap-2">
                  {humores.map((h) => (
                    <button key={h.valor} type="button" onClick={() => setHumor(h.valor)}
                      className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all ${
                        humor === h.valor ? 'border-[#1B4332] bg-[#1B4332]/5' : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                      }`}
                    >
                      <span className="text-2xl">{h.emoji}</span>
                      <span className={`text-xs font-medium ${humor === h.valor ? 'text-[#1B4332]' : 'text-gray-500'}`}>{h.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Conteúdo da sessão */}
              <div>
                <p className="text-sm font-bold text-[#1B4332] mb-4">Conteúdo da sessão</p>
                <div className="space-y-4">
                  {[
                    { label: 'Atividades realizadas', value: atividadesRealizadas, set: setAtividadesRealizadas, placeholder: 'Descreva as atividades...' },
                    { label: 'Resposta da criança', value: respostaCrianca, set: setRespostaCrianca, placeholder: 'Como a criança respondeu...' },
                    { label: 'O que funcionou', value: oQueFuncionou, set: setOQueFuncionou, placeholder: 'Estratégias e abordagens efetivas...' },
                    { label: 'O que não funcionou', value: oQueNaoFuncionou, set: setOQueNaoFuncionou, placeholder: 'Dificuldades encontradas...' },
                    { label: 'Observações clínicas', value: observacoesClin, set: setObservacoesClin, placeholder: 'Observações relevantes...' },
                    { label: 'Foco da próxima sessão', value: focoProxima, set: setFocoProxima, placeholder: 'O que trabalhar na próxima sessão...' },
                  ].map(({ label, value, set, placeholder }) => (
                    <div key={label}>
                      <label className={labelCls}>{label}</label>
                      <textarea value={value} onChange={(e) => set(e.target.value)}
                        rows={2} placeholder={placeholder} className={inputCls + ' resize-none'} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Campos condicionais — Psicomotricidade */}
              {especialidade === 'Psicomotricidade' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="text-sm font-bold text-[#1B4332] mb-4">Avaliação Psicomotora</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Coordenação fina', value: coordFina, set: setCoordFina },
                      { label: 'Coordenação grossa', value: coordGrossa, set: setCoordGrossa },
                      { label: 'Equilíbrio', value: equilibrio, set: setEquilibrio },
                      { label: 'Lateralidade', value: lateralidade, set: setLateralidade },
                      { label: 'Esquema corporal', value: esquemaCorporal, set: setEsquemaCorporal },
                    ].map(({ label, value, set }) => (
                      <div key={label}>
                        <label className={labelCls}>{label}</label>
                        <select value={value} onChange={(e) => set(e.target.value)} className={selectCls}>
                          <option value="">Selecionar...</option>
                          {niveisPsicomotricidade.map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Campos condicionais — Psicopedagogia */}
              {especialidade === 'Psicopedagogia' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="text-sm font-bold text-[#1B4332] mb-4">Avaliação Psicopedagógica</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Nível de leitura</label>
                      <select value={nivelLeitura} onChange={(e) => setNivelLeitura(e.target.value)} className={selectCls}>
                        <option value="">Selecionar...</option>
                        {niveisPedagogia.map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Nível de escrita</label>
                      <select value={nivelEscrita} onChange={(e) => setNivelEscrita(e.target.value)} className={selectCls}>
                        <option value="">Selecionar...</option>
                        {niveisPedagogia.map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Nível de matemática</label>
                      <select value={nivelMatematica} onChange={(e) => setNivelMatematica(e.target.value)} className={selectCls}>
                        <option value="">Selecionar...</option>
                        {niveisCognitivos.map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Habilidades trabalhadas</label>
                      <div className="flex flex-wrap gap-2">
                        {habilidadesOpcoes.map((h) => (
                          <button key={h} type="button" onClick={() => toggleHabilidade(h)}
                            className={`text-xs px-3 py-1.5 rounded-full border-2 font-medium transition-all ${
                              habilidades.includes(h)
                                ? 'border-[#1B4332] bg-[#1B4332]/5 text-[#1B4332]'
                                : 'border-gray-200 text-gray-500 hover:border-gray-300'
                            }`}
                          >{h}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Erro */}
              {erro && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">{erro}</div>
              )}

              {/* Botão */}
              <button type="submit" disabled={salvando}
                className="w-full flex items-center justify-center gap-2 bg-[#1B4332] text-white font-semibold py-3.5 rounded-xl hover:bg-[#2D6A4F] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {salvando ? <><Spinner /> Salvando...</> : '✓ Salvar sessão'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
