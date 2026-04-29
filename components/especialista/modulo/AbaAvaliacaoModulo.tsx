'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAvaliacaoModulo, salvarAvaliacaoModulo } from '@/lib/api'
import { getToken } from '@/lib/auth'
import { MODULOS_CONFIG } from '@/lib/modulos'

// ─── Config dos campos por módulo ─────────────────────────────────────────────

interface CampoConfig {
  campo: string
  label: string
  opcoes: string[]
}

const CAMPOS_AVALIACAO: Record<string, CampoConfig[]> = {
  psicomotricidade: [
    { campo: 'coordenacao_fina',   label: 'Coordenação Motora Fina',   opcoes: ['emergente', 'em_desenvolvimento', 'consolidado'] },
    { campo: 'coordenacao_grossa', label: 'Coordenação Motora Grossa', opcoes: ['emergente', 'em_desenvolvimento', 'consolidado'] },
    { campo: 'equilibrio',         label: 'Equilíbrio',                opcoes: ['emergente', 'em_desenvolvimento', 'consolidado'] },
    { campo: 'lateralidade',       label: 'Lateralidade',              opcoes: ['definida_direita', 'definida_esquerda', 'indefinida', 'cruzada'] },
    { campo: 'esquema_corporal',   label: 'Esquema Corporal',          opcoes: ['emergente', 'em_desenvolvimento', 'consolidado'] },
    { campo: 'tonus_muscular',     label: 'Tônus Muscular',            opcoes: ['hipotonico', 'normal', 'hipertonico'] },
    { campo: 'praxia_fina',        label: 'Praxia Fina',               opcoes: ['emergente', 'em_desenvolvimento', 'consolidado'] },
    { campo: 'praxia_global',      label: 'Praxia Global',             opcoes: ['emergente', 'em_desenvolvimento', 'consolidado'] },
  ],
  psicopedagogia: [
    { campo: 'nivel_leitura',     label: 'Nível de Leitura',       opcoes: ['pre_silabico', 'silabico', 'silabico_alfabetico', 'alfabetico', 'fluente'] },
    { campo: 'nivel_escrita',     label: 'Nível de Escrita',       opcoes: ['pre_silabico', 'silabico', 'silabico_alfabetico', 'alfabetico', 'fluente'] },
    { campo: 'nivel_matematica',  label: 'Matemática',             opcoes: ['emergente', 'em_desenvolvimento', 'consolidado'] },
    { campo: 'atencao',           label: 'Atenção e Concentração', opcoes: ['muito_baixa', 'baixa', 'adequada', 'boa'] },
    { campo: 'memoria',           label: 'Memória',                opcoes: ['muito_baixa', 'baixa', 'adequada', 'boa'] },
    { campo: 'raciocinio_logico', label: 'Raciocínio Lógico',      opcoes: ['emergente', 'em_desenvolvimento', 'consolidado'] },
  ],
  fono: [
    { campo: 'linguagem_expressiva', label: 'Linguagem Expressiva', opcoes: ['nao_verbal', 'sons', 'palavras_isoladas', 'duas_palavras', 'frases_simples', 'frases_complexas'] },
    { campo: 'linguagem_receptiva',  label: 'Linguagem Receptiva',  opcoes: ['minima', 'basica', 'adequada', 'boa'] },
    { campo: 'articulacao',          label: 'Articulação',          opcoes: ['muito_comprometida', 'comprometida', 'levemente_comprometida', 'adequada'] },
    { campo: 'vocabulario',          label: 'Vocabulário',          opcoes: ['muito_reduzido', 'reduzido', 'adequado', 'amplo'] },
    { campo: 'pragmatica',           label: 'Pragmática',           opcoes: ['muito_comprometida', 'comprometida', 'em_desenvolvimento', 'adequada'] },
  ],
  to: [
    { campo: 'alimentacao',             label: 'Alimentação',             opcoes: ['dependente', 'assistida', 'supervisao', 'independente'] },
    { campo: 'higiene',                 label: 'Higiene Pessoal',         opcoes: ['dependente', 'assistida', 'supervisao', 'independente'] },
    { campo: 'vestir',                  label: 'Vestir-se',               opcoes: ['dependente', 'assistida', 'supervisao', 'independente'] },
    { campo: 'brincar',                 label: 'Habilidades de Jogo',     opcoes: ['nao_funcional', 'funcional_simples', 'simbolico', 'cooperativo'] },
    { campo: 'integracao_sensorial',    label: 'Integração Sensorial',    opcoes: ['muito_comprometida', 'comprometida', 'levemente_comprometida', 'adequada'] },
    { campo: 'processamento_sensorial', label: 'Processamento Sensorial', opcoes: ['hipersensivel', 'hiposensivel', 'misto', 'adequado'] },
  ],
  psicologia: [
    { campo: 'regulacao_emocional', label: 'Regulação Emocional', opcoes: ['muito_comprometida', 'comprometida', 'em_desenvolvimento', 'adequada'] },
    { campo: 'habilidades_sociais', label: 'Habilidades Sociais', opcoes: ['muito_comprometida', 'comprometida', 'em_desenvolvimento', 'adequada'] },
    { campo: 'nivel_ansiedade',     label: 'Nível de Ansiedade',  opcoes: ['muito_alto', 'alto', 'moderado', 'baixo', 'minimo'] },
    { campo: 'humor_geral',         label: 'Humor Geral',         opcoes: ['muito_negativo', 'negativo', 'neutro', 'positivo', 'muito_positivo'] },
    { campo: 'autoestima',          label: 'Autoestima',          opcoes: ['muito_baixa', 'baixa', 'adequada', 'boa'] },
    { campo: 'qualidade_sono',      label: 'Qualidade do Sono',   opcoes: ['muito_ruim', 'ruim', 'regular', 'boa'] },
  ],
  aba: [
    { campo: 'nivel_verbal',      label: 'Nível Verbal',        opcoes: ['nao_verbal', 'ecoico', 'mando', 'tato', 'intraverbal', 'conversacional'] },
    { campo: 'imitacao',          label: 'Imitação',            opcoes: ['ausente', 'emergente', 'em_desenvolvimento', 'consolidada'] },
    { campo: 'contato_visual',    label: 'Contato Visual',      opcoes: ['ausente', 'minimo', 'ocasional', 'frequente', 'consistente'] },
    { campo: 'seguir_instrucoes', label: 'Seguir Instruções',   opcoes: ['1_passo', '2_passos', '3_passos', 'complexas'] },
    { campo: 'habilidades_jogo',  label: 'Habilidades de Jogo', opcoes: ['solitario', 'paralelo', 'associativo', 'cooperativo'] },
  ],
  nutricao: [
    { campo: 'estado_nutricional',      label: 'Estado Nutricional',      opcoes: ['desnutricao', 'abaixo_peso', 'adequado', 'sobrepeso', 'obesidade'] },
    { campo: 'seletividade_alimentar',  label: 'Seletividade Alimentar',  opcoes: ['severa', 'moderada', 'leve', 'sem_seletividade'] },
    { campo: 'comportamento_alimentar', label: 'Comportamento Alimentar', opcoes: ['muito_dificil', 'dificil', 'regular', 'adequado'] },
    { campo: 'hidratacao',              label: 'Hidratação',              opcoes: ['insuficiente', 'regular', 'adequada'] },
    { campo: 'funcionamento_intestinal',label: 'Funcionamento Intestinal',opcoes: ['constipacao', 'diarreia_frequente', 'irregular', 'adequado'] },
  ],
  fisioterapia: [
    { campo: 'tonus_muscular',      label: 'Tônus Muscular',        opcoes: ['hipotonia_severa', 'hipotonia_moderada', 'hipotonia_leve', 'normal', 'hipertonia_leve', 'hipertonia_moderada', 'hipertonia_severa'] },
    { campo: 'forca_muscular',      label: 'Força Muscular',        opcoes: ['muito_reduzida', 'reduzida', 'adequada', 'boa'] },
    { campo: 'marcha',              label: 'Marcha',                opcoes: ['nao_deambula', 'com_auxilio_total', 'com_auxilio_parcial', 'independente_alterada', 'independente_adequada'] },
    { campo: 'equilibrio_estatico', label: 'Equilíbrio Estático',   opcoes: ['ausente', 'precario', 'regular', 'adequado'] },
    { campo: 'equilibrio_dinamico', label: 'Equilíbrio Dinâmico',   opcoes: ['ausente', 'precario', 'regular', 'adequado'] },
    { campo: 'coordenacao_motora',  label: 'Coordenação Motora',    opcoes: ['muito_comprometida', 'comprometida', 'levemente_comprometida', 'adequada'] },
    { campo: 'postura',             label: 'Postura',               opcoes: ['muito_comprometida', 'comprometida', 'levemente_comprometida', 'adequada'] },
  ],
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatLabel(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

function formatData(d?: string) {
  if (!d) return '—'
  return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 text-[#1B4332]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Props {
  pacienteId: string
  modulo: string
  paciente?: unknown
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AbaAvaliacaoModulo({ pacienteId, modulo }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [avaliacao, setAvaliacao] = useState<Record<string, any> | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [formularioAberto, setFormularioAberto] = useState(false)
  const [campos, setCampos] = useState<Record<string, string>>({})
  const [observacoesGerais, setObservacoesGerais] = useState('')
  const [dataAvaliacao, setDataAvaliacao] = useState(new Date().toISOString().split('T')[0])
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  const config       = MODULOS_CONFIG[modulo]
  const camposModulo = CAMPOS_AVALIACAO[modulo] ?? []

  const carregarAvaliacao = async () => {
    const token = getToken()
    if (!token) return
    setCarregando(true)
    try {
      const data = await getAvaliacaoModulo(pacienteId, modulo, token)
      setAvaliacao((data as Record<string, any>) ?? null)
    } catch {
      setAvaliacao(null)
    } finally {
      setCarregando(false)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { carregarAvaliacao() }, [pacienteId, modulo])

  const handleSalvar = async () => {
    const token = getToken()
    if (!token) return
    setSalvando(true)
    setErro(null)
    try {
      const payload: Record<string, unknown> = { ...campos, data_avaliacao: dataAvaliacao }
      if (observacoesGerais) payload.observacoes_gerais = observacoesGerais
      await salvarAvaliacaoModulo(pacienteId, modulo, payload, token)
      await carregarAvaliacao()
      setFormularioAberto(false)
      setCampos({})
      setObservacoesGerais('')
      setToast('Avaliação salva com sucesso!')
      setTimeout(() => setToast(''), 3000)
    } catch (e: unknown) {
      const err = e as { detail?: string }
      setErro(err?.detail ?? 'Não foi possível salvar a avaliação.')
    } finally {
      setSalvando(false)
    }
  }

  const toggleCampo = (campo: string, valor: string) =>
    setCampos((prev) => ({ ...prev, [campo]: prev[campo] === valor ? '' : valor }))

  if (carregando) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Avaliação atual */}
      {avaliacao && !formularioAberto && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#1B4332]">
                Avaliação atual — {config?.label}
              </h3>
              {avaliacao.data_avaliacao && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Registrada em {formatData(avaliacao.data_avaliacao as string)}
                </p>
              )}
            </div>
            <button
              onClick={() => setFormularioAberto(true)}
              className="text-xs text-[#2D6A4F] font-semibold hover:underline shrink-0"
            >
              Nova avaliação
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {camposModulo.map(({ campo, label }) => {
              const valor = avaliacao[campo] as string | undefined
              if (!valor) return null
              return (
                <div key={campo} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-gray-600">{label}</span>
                  <span className="text-xs font-semibold bg-[#1B4332]/10 text-[#1B4332] px-3 py-1 rounded-full shrink-0">
                    {formatLabel(valor)}
                  </span>
                </div>
              )
            })}
            {avaliacao.observacoes_gerais && (
              <div className="mt-2 pt-3 border-t border-gray-50">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  Observações gerais
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {avaliacao.observacoes_gerais as string}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Estado sem avaliação */}
      {!avaliacao && !formularioAberto && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-sm font-semibold text-gray-500 mb-1">
            Nenhuma avaliação registrada
          </p>
          <p className="text-xs text-gray-400 mb-5">
            Registre a avaliação inicial para acompanhar a evolução em {config?.label}
          </p>
          <button
            onClick={() => setFormularioAberto(true)}
            className="bg-[#1B4332] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2D6A4F] transition-colors"
          >
            Registrar avaliação inicial
          </button>
        </div>
      )}

      {/* Formulário com chips */}
      <AnimatePresence>
        {formularioAberto && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="bg-white rounded-2xl border border-gray-100 p-5"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-[#1B4332]">
                {avaliacao ? 'Nova avaliação' : 'Avaliação inicial'} — {config?.label}
              </h3>
              <button
                onClick={() => { setFormularioAberto(false); setCampos({}); setErro(null) }}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>

            <div className="space-y-5">
              {/* Data */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Data da avaliação
                </label>
                <input
                  type="date"
                  value={dataAvaliacao}
                  onChange={(e) => setDataAvaliacao(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]"
                />
              </div>

              {/* Chips por campo */}
              {camposModulo.map(({ campo, label, opcoes }) => (
                <div key={campo}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    {label}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {opcoes.map((op) => (
                      <button
                        key={op}
                        type="button"
                        onClick={() => toggleCampo(campo, op)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          campos[campo] === op
                            ? 'bg-[#1B4332] text-white border-[#1B4332]'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-[#1B4332]/30'
                        }`}
                      >
                        {formatLabel(op)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Observações */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Observações gerais{' '}
                  <span className="font-normal normal-case text-gray-400">(opcional)</span>
                </label>
                <textarea
                  value={observacoesGerais}
                  onChange={(e) => setObservacoesGerais(e.target.value)}
                  rows={3}
                  placeholder="Observações relevantes sobre o quadro atual..."
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] resize-none placeholder:text-gray-300"
                />
              </div>
            </div>

            {erro && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600">
                {erro}
              </div>
            )}

            <button
              onClick={handleSalvar}
              disabled={salvando}
              className="mt-5 w-full py-3.5 bg-[#1B4332] text-white rounded-xl text-sm font-semibold hover:bg-[#2D6A4F] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {salvando ? <><Spinner /> Salvando...</> : '✓ Salvar avaliação'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast-av"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1B4332] text-white px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold whitespace-nowrap"
          >
            ✓ {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
