'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus } from 'lucide-react'
import { createPaciente } from '@/lib/api'
import { getToken } from '@/lib/auth'

// ─── Opções ───────────────────────────────────────────────────────────────────

const condicoes = ['Autismo', 'TDAH', 'Dislexia', 'Deficiência Intelectual', 'Síndrome de Down', 'Outra']
const graus = ['Leve', 'Moderado', 'Severo', 'Não definido']
const estilos = ['Visual', 'Auditivo', 'Cinestésico', 'Misto', 'Não identificado']
const terapiasOpcoes = [
  'Psicomotricidade', 'Fonoaudiologia', 'Terapia Ocupacional',
  'Psicologia', 'Psicopedagogia', 'ABA', 'Outra',
]

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Props {
  aberto: boolean
  onFechar: () => void
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

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[#4A5568]">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${value ? 'bg-[#1B4332]' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ModalNovoPaciente({ aberto, onFechar, onCriado }: Props) {
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const [nome, setNome] = useState('')
  const [dataNasc, setDataNasc] = useState('')
  const [condicao, setCondicao] = useState('')
  const [grau, setGrau] = useState('Não definido')
  const [verbal, setVerbal] = useState(true)
  const [comAlt, setComAlt] = useState(false)
  const [estilo, setEstilo] = useState('Não identificado')
  const [usaAba, setUsaAba] = useState(false)
  const [terapias, setTerapias] = useState<string[]>([])
  const [escola, setEscola] = useState('')
  const [serie, setSerie] = useState('')
  const [nomeResp, setNomeResp] = useState('')
  const [telefoneResp, setTelefoneResp] = useState('')
  const [emailResp, setEmailResp] = useState('')
  const [observacoes, setObservacoes] = useState('')

  const resetar = () => {
    setNome(''); setDataNasc(''); setCondicao(''); setGrau('Não definido')
    setVerbal(true); setComAlt(false); setEstilo('Não identificado'); setUsaAba(false)
    setTerapias([]); setEscola(''); setSerie(''); setNomeResp('')
    setTelefoneResp(''); setEmailResp(''); setObservacoes(''); setErro('')
  }

  const handleFechar = () => { resetar(); onFechar() }

  const toggleTerapia = (t: string) =>
    setTerapias((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim()) { setErro('Informe o nome do paciente'); return }
    const token = getToken()
    if (!token) return
    setSalvando(true)
    setErro('')
    try {
      await createPaciente({
        nome: nome.trim(),
        data_nascimento: dataNasc || undefined,
        condicao: condicao || undefined,
        grau,
        verbal,
        comunicacao_alternativa: comAlt,
        estilo_aprendizagem: estilo,
        usa_aba: usaAba,
        terapias,
        escola: escola || undefined,
        serie: serie || undefined,
        nome_responsavel: nomeResp || undefined,
        telefone_responsavel: telefoneResp || undefined,
        email_responsavel: emailResp || undefined,
        observacoes: observacoes || undefined,
      }, token)
      resetar()
      onCriado()
    } catch (e: unknown) {
      const err = e as { detail?: string; message?: string }
      setErro(err?.detail ?? err?.message ?? 'Não foi possível cadastrar. Tente novamente.')
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
          key="modal-novo-paciente"
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
                <h2 className="font-lora font-bold text-xl text-[#1B4332]">Novo Paciente</h2>
                <p className="text-sm text-[#718096] mt-0.5">Preencha os dados do paciente</p>
              </div>
              <button onClick={handleFechar} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-[#718096]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">

              {/* Dados básicos */}
              <div>
                <p className="text-sm font-bold text-[#1B4332] mb-4">Dados básicos</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Nome do paciente *</label>
                    <input type="text" value={nome} onChange={(e) => setNome(e.target.value)}
                      placeholder="Nome completo" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Data de nascimento</label>
                    <input type="date" value={dataNasc} onChange={(e) => setDataNasc(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Condição</label>
                    <select value={condicao} onChange={(e) => setCondicao(e.target.value)} className={selectCls}>
                      <option value="">Selecionar...</option>
                      {condicoes.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Grau</label>
                    <select value={grau} onChange={(e) => setGrau(e.target.value)} className={selectCls}>
                      {graus.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Estilo de aprendizagem</label>
                    <select value={estilo} onChange={(e) => setEstilo(e.target.value)} className={selectCls}>
                      {estilos.map((e) => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Comunicação */}
              <div>
                <p className="text-sm font-bold text-[#1B4332] mb-4">Comunicação</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <Toggle value={verbal} onChange={setVerbal} label="É verbal?" />
                    <Toggle value={comAlt} onChange={setComAlt} label="Usa comunicação alternativa?" />
                    <Toggle value={usaAba} onChange={setUsaAba} label="Usa ABA?" />
                  </div>
                  <div>
                    <label className={labelCls}>Terapias em andamento</label>
                    <div className="flex flex-wrap gap-2">
                      {terapiasOpcoes.map((t) => (
                        <button key={t} type="button" onClick={() => toggleTerapia(t)}
                          className={`text-xs px-3 py-1.5 rounded-full border-2 font-medium transition-all ${
                            terapias.includes(t)
                              ? 'border-[#1B4332] bg-[#1B4332]/5 text-[#1B4332]'
                              : 'border-gray-200 text-gray-500 hover:border-gray-300'
                          }`}
                        >{t}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Escola */}
              <div>
                <p className="text-sm font-bold text-[#1B4332] mb-4">Escola</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Nome da escola</label>
                    <input type="text" value={escola} onChange={(e) => setEscola(e.target.value)}
                      placeholder="Escola..." className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Série / Ano</label>
                    <input type="text" value={serie} onChange={(e) => setSerie(e.target.value)}
                      placeholder="Ex: 3º ano EF" className={inputCls} />
                  </div>
                </div>
              </div>

              {/* Responsável */}
              <div>
                <p className="text-sm font-bold text-[#1B4332] mb-4">Responsável</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Nome do responsável</label>
                    <input type="text" value={nomeResp} onChange={(e) => setNomeResp(e.target.value)}
                      placeholder="Nome completo" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Telefone</label>
                    <input type="tel" value={telefoneResp} onChange={(e) => setTelefoneResp(e.target.value)}
                      placeholder="(11) 99999-9999" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>E-mail</label>
                    <input type="email" value={emailResp} onChange={(e) => setEmailResp(e.target.value)}
                      placeholder="email@exemplo.com" className={inputCls} />
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className={labelCls}>Observações</label>
                <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)}
                  rows={3} placeholder="Informações adicionais relevantes..."
                  className={inputCls + ' resize-none'} />
              </div>

              {/* Erro */}
              {erro && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">{erro}</div>
              )}

              {/* Botão */}
              <button type="submit" disabled={salvando}
                className="w-full flex items-center justify-center gap-2 bg-[#1B4332] text-white font-semibold py-3.5 rounded-xl hover:bg-[#2D6A4F] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {salvando ? <><Spinner /> Cadastrando...</> : <><Plus className="w-4 h-4" /> Cadastrar paciente</>}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
