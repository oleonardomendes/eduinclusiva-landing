'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { getPaciente, getSessoes, getEvolucaoModulo } from '@/lib/api'
import { getToken, getUser } from '@/lib/auth'
import { MODULOS_CONFIG, especialidadeParaModulo, parseTerapias } from '@/lib/modulos'
import AvatarPaciente from '@/components/especialista/AvatarPaciente'
import ModalSessao from '@/components/especialista/ModalSessao'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Paciente {
  id: number
  nome: string
  condicao?: string
  grau?: string
  idade?: number
  data_nascimento?: string
  estilo_aprendizagem?: string
  verbal?: boolean
  comunicacao_alternativa?: boolean
  usa_aba?: boolean
  terapias?: string[]
  escola?: string
  serie?: string
  nome_responsavel?: string
  telefone_responsavel?: string
  email_responsavel?: string
  observacoes?: string
  ultima_sessao?: string
  terapias_em_andamento?: string | string[]
}

interface Sessao {
  id: number
  especialidade?: string
  data_sessao?: string
  duracao_minutos?: number
  humor_inicio?: string
  o_que_funcionou?: string
}

interface HabilidadeData {
  atual: string | null
  historico: Array<{ data: string; valor: string }>
  tendencia: string
}

interface EvolucaoData {
  total_sessoes?: number
  habilidades?: Record<string, HabilidadeData>
  relatorio_ia?: unknown
}

// ─── Semáforo ─────────────────────────────────────────────────────────────────

const VERDE = new Set([
  'consolidado', 'consolidada', 'boa', 'adequada', 'adequado', 'independente',
  'fluente', 'amplo', 'normal', 'sem_seletividade', 'alfabetico', 'cooperativo',
  'consistente', 'conversacional', 'intraverbal', 'independente_adequada',
  'muito_positivo', 'positivo',
])

const AMARELO = new Set([
  'em_desenvolvimento', 'regular', 'supervisao',
  'silabico_alfabetico', 'silabico', 'levemente_comprometida', 'basica',
  'moderado', 'leve', 'reduzido', 'reduzida', 'precario', 'ocasional', 'frequente',
  'associativo', 'paralelo', 'com_auxilio_parcial', 'independente_alterada',
  'frases_simples', 'palavras_isoladas', '2_passos', '3_passos',
  'hipotonia_leve', 'hipertonia_leve', 'baixo', 'minimo', 'neutro', 'abaixo_peso',
])

function getSemaforo(v: string | null): 'verde' | 'amarelo' | 'vermelho' | 'cinza' {
  if (!v || v === 'nao_avaliado') return 'cinza'
  if (VERDE.has(v)) return 'verde'
  if (AMARELO.has(v)) return 'amarelo'
  return 'vermelho'
}

const SEM_COR: Record<string, string> = {
  verde:    'bg-green-500',
  amarelo:  'bg-amber-400',
  vermelho: 'bg-red-500',
  cinza:    'bg-gray-300',
}

function calcularTendenciaGeral(hab: Record<string, HabilidadeData>): 'melhorando' | 'estavel' | 'precisa_atencao' {
  let mel = 0, est = 0, ate = 0
  Object.values(hab).forEach(h => {
    if (h.tendencia === 'melhorando') mel++
    else if (h.tendencia === 'precisa_atencao') ate++
    else est++
  })
  if (mel > est && mel > ate) return 'melhorando'
  if (ate > mel && ate >= est) return 'precisa_atencao'
  return 'estavel'
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatData(d?: string) {
  if (!d) return '—'
  return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function formatValorCurto(s: string) {
  return s.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())
}

function Spinner() {
  return (
    <svg className="animate-spin h-6 w-6 text-[#1B4332]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

const humorEmoji: Record<string, string> = {
  otimo: '😄', bem: '🙂', regular: '😐', dificil: '😟',
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function PacientePage() {
  const params = useParams()
  const router = useRouter()
  const pacienteId = Number(params.id)

  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [sessoes, setSessoes] = useState<Sessao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [evolucoes, setEvolucoes] = useState<Record<string, EvolucaoData | null>>({})
  const [carregandoEvolucoes, setCarregandoEvolucoes] = useState(true)
  const [modalSessaoAberto, setModalSessaoAberto] = useState(false)
  const [toast, setToast] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const token = getToken()
    if (!token) { router.push('/login'); return }
    const user = getUser()
    if (user?.papel !== 'especialista') { router.push('/login'); return }

    const carregar = async () => {
      setCarregando(true)
      setCarregandoEvolucoes(true)
      setEvolucoes({})
      try {
        const [dadosPaciente, dadosSessoes] = await Promise.all([
          getPaciente(pacienteId, token),
          getSessoes(pacienteId, token).catch(() => []),
        ])
        const pac = dadosPaciente as Paciente
        setPaciente(pac)
        const lista: Sessao[] = Array.isArray(dadosSessoes)
          ? dadosSessoes
          : (dadosSessoes as { sessoes?: Sessao[] })?.sessoes ?? []
        setSessoes([...lista].sort((a, b) => ((a.data_sessao ?? '') < (b.data_sessao ?? '') ? 1 : -1)))
        setCarregando(false)

        const modulosAtivos = parseTerapias(pac.terapias_em_andamento)
        if (modulosAtivos.length > 0) {
          const resultados = await Promise.allSettled(
            modulosAtivos.map((m) => getEvolucaoModulo(pacienteId, m, token))
          )
          const evolMap: Record<string, EvolucaoData | null> = {}
          modulosAtivos.forEach((m, i) => {
            const r = resultados[i]
            evolMap[m] = r.status === 'fulfilled' ? (r.value as EvolucaoData) : null
          })
          setEvolucoes(evolMap)
        }
      } catch {
        setPaciente(null)
        setCarregando(false)
      } finally {
        setCarregandoEvolucoes(false)
      }
    }
    carregar()
  }, [pacienteId, reloadKey])

  const mostrarToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleSessaoSalva = () => {
    setModalSessaoAberto(false)
    setReloadKey((k) => k + 1)
    mostrarToast('Sessão registrada com sucesso!')
  }

  if (carregando) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!paciente) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Paciente não encontrado.</p>
        <Link href="/especialista" className="text-[#1B4332] font-semibold hover:underline text-sm">
          ← Voltar para a lista
        </Link>
      </div>
    )
  }

  const modulosAtivos = parseTerapias(paciente.terapias_em_andamento)
  const ultimasSessoes = sessoes.slice(0, 5)

  // Resumo executivo
  const totalAvaliacoes = modulosAtivos.filter((m) => {
    const hab = evolucoes[m]?.habilidades ?? {}
    return Object.values(hab).some((h) => h.atual !== null)
  }).length

  const areasAtencao: string[] = []
  const areasConsolidadas: string[] = []
  if (!carregandoEvolucoes) {
    modulosAtivos.forEach((m) => {
      const hab = evolucoes[m]?.habilidades ?? {}
      Object.entries(hab).forEach(([nome, dados]) => {
        const label = formatValorCurto(nome)
        if (dados.tendencia === 'precisa_atencao') areasAtencao.push(label)
        else if (dados.atual && VERDE.has(dados.atual)) areasConsolidadas.push(label)
      })
    })
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">

      {/* Header */}
      <header className="bg-[#1B4332] text-white sticky top-0 z-10">
        <div className="px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push('/especialista')}
            className="text-white/50 hover:text-white transition-colors text-sm shrink-0"
          >
            ←
          </button>
          <AvatarPaciente nome={paciente.nome} size="sm" />
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold leading-tight truncate">{paciente.nome}</h1>
            <p className="text-xs text-white/50 truncate">
              {[paciente.condicao, paciente.grau || null, paciente.idade ? `${paciente.idade} anos` : null]
                .filter(Boolean).join(' · ')}
            </p>
          </div>
          <button
            onClick={() => setModalSessaoAberto(true)}
            className="shrink-0 bg-[#F59E0B] text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-amber-400 transition-colors"
          >
            + Sessão
          </button>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* PAINEL DE RESUMO */}
        <section className="bg-[#1B4332] text-white rounded-2xl p-5">
          <h2 className="text-sm font-bold mb-0.5">
            Visão geral · {paciente.nome.split(' ')[0]}
          </h2>
          <p className="text-xs text-white/50 mb-4">
            {[paciente.condicao, paciente.grau, paciente.idade ? `${paciente.idade} anos` : null]
              .filter(Boolean).join(' · ')}
          </p>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { valor: modulosAtivos.length, label: 'Módulos' },
              { valor: sessoes.length, label: 'Sessões' },
              { valor: carregandoEvolucoes ? '…' : totalAvaliacoes, label: 'Avaliações' },
            ].map(({ valor, label }) => (
              <div key={label} className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-xl font-bold">{valor}</p>
                <p className="text-[10px] text-white/60 mt-0.5 leading-tight">{label}</p>
              </div>
            ))}
          </div>

          {!carregandoEvolucoes && (areasAtencao.length > 0 || areasConsolidadas.length > 0) && (
            <div className="space-y-2">
              {areasAtencao.length > 0 && (
                <div className="bg-red-500/20 rounded-xl px-3 py-2.5">
                  <p className="text-[10px] text-red-200 font-semibold mb-0.5">⚠ Áreas em atenção</p>
                  <p className="text-xs text-white/90 leading-relaxed">
                    {areasAtencao.slice(0, 5).join(', ')}
                    {areasAtencao.length > 5 ? ` +${areasAtencao.length - 5}` : ''}
                  </p>
                </div>
              )}
              {areasConsolidadas.length > 0 && (
                <div className="bg-green-500/20 rounded-xl px-3 py-2.5">
                  <p className="text-[10px] text-green-200 font-semibold mb-0.5">✓ Áreas consolidadas</p>
                  <p className="text-xs text-white/90 leading-relaxed">
                    {areasConsolidadas.slice(0, 5).join(', ')}
                    {areasConsolidadas.length > 5 ? ` +${areasConsolidadas.length - 5}` : ''}
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* MÓDULOS CLÍNICOS */}
        <section>
          <p className="text-xs font-semibold text-[#718096] uppercase tracking-wide mb-3">
            Módulos clínicos
          </p>
          {modulosAtivos.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">Nenhum módulo cadastrado</p>
              <p className="text-xs mt-1">Edite o perfil para adicionar as terapias em andamento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {modulosAtivos.map((modulo, idx) => {
                const cfg = MODULOS_CONFIG[modulo]
                if (!cfg) return null

                const evolData = evolucoes[modulo]
                const habilidades = evolData?.habilidades ?? {}
                const temDados = Object.values(habilidades).some((h) => h.atual !== null)
                const totalSessoesMod = evolData?.total_sessoes ?? 0
                const habsParaMostrar = cfg.habilidades.slice(0, 4)
                const temMais = cfg.habilidades.length > 4
                const tendencia = temDados ? calcularTendenciaGeral(habilidades) : null
                const ultimaSessao = sessoes.find(
                  (s) => s.especialidade && especialidadeParaModulo[s.especialidade] === modulo
                )

                return (
                  <motion.div
                    key={modulo}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.04 }}
                  >
                    <div
                      onClick={() => router.push(`/especialista/paciente/${paciente.id}/${modulo}`)}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    >
                      {/* Card header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0 ${cfg.corIcone}`}>
                            {cfg.emoji}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#1A1A1A] leading-tight">{cfg.label}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {carregandoEvolucoes ? (
                                <span className="inline-block w-16 h-3 bg-gray-100 rounded animate-pulse" />
                              ) : (
                                <>
                                  {totalSessoesMod} sessão{totalSessoesMod !== 1 ? 'ões' : ''}
                                  {ultimaSessao?.data_sessao
                                    ? ` · Última: ${formatData(ultimaSessao.data_sessao)}`
                                    : ''}
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                        <span className="text-gray-300 text-sm shrink-0">→</span>
                      </div>

                      {/* Habilidades ou skeleton */}
                      {carregandoEvolucoes ? (
                        <div className="space-y-2 mb-3">
                          {[75, 55, 65].map((w, i) => (
                            <div
                              key={i}
                              className="h-3.5 bg-gray-100 rounded-full animate-pulse"
                              style={{ width: `${w}%` }}
                            />
                          ))}
                        </div>
                      ) : !temDados ? (
                        <p className="text-xs text-gray-400 italic py-2 mb-1">Sem avaliações ainda</p>
                      ) : (
                        <div className="space-y-1.5 mb-3">
                          {habsParaMostrar.map((hab) => {
                            const dadosHab = habilidades[hab]
                            const valor = dadosHab?.atual ?? null
                            const sem = getSemaforo(valor)
                            const label = formatValorCurto(hab)
                            return (
                              <div key={hab} className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full shrink-0 ${SEM_COR[sem]}`} />
                                <span className="text-xs text-gray-600 flex-1 truncate">{label}</span>
                                {valor && valor !== 'nao_avaliado' && (
                                  <span className="text-[10px] text-gray-400 shrink-0 max-w-[90px] truncate">
                                    {formatValorCurto(valor)}
                                  </span>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Card footer */}
                      {!carregandoEvolucoes && (
                        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                          {tendencia ? (
                            <span className={`text-xs font-medium ${
                              tendencia === 'melhorando'       ? 'text-green-600' :
                              tendencia === 'precisa_atencao' ? 'text-red-500'   : 'text-gray-400'
                            }`}>
                              {tendencia === 'melhorando'       ? '↑ Melhorando' :
                               tendencia === 'precisa_atencao' ? '↓ Atenção'    : '→ Estável'}
                            </span>
                          ) : <span />}
                          {temMais && (
                            <span className="text-[10px] text-[#2D6A4F] font-medium">
                              +{cfg.habilidades.length - 4} mais →
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </section>

        {/* SESSÕES RECENTES */}
        <section>
          <p className="text-xs font-semibold text-[#718096] uppercase tracking-wide mb-3">
            Sessões recentes
          </p>
          {ultimasSessoes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
              <p className="text-4xl mb-2">📋</p>
              <p className="text-sm text-gray-400 font-medium">Nenhuma sessão registrada</p>
              <p className="text-xs text-gray-300 mt-1">Clique em &quot;+ Sessão&quot; para começar</p>
            </div>
          ) : (
            <div className="space-y-2">
              {ultimasSessoes.map((s) => {
                const moduloKey = s.especialidade ? especialidadeParaModulo[s.especialidade] : undefined
                const cfg = moduloKey ? MODULOS_CONFIG[moduloKey] : undefined
                return (
                  <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-xl shrink-0 mt-0.5">{cfg?.emoji ?? '📋'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {s.especialidade && cfg && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.cor}`}>
                              {s.especialidade}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">{formatData(s.data_sessao)}</span>
                          {s.humor_inicio && (
                            <span className="text-base leading-none">{humorEmoji[s.humor_inicio] ?? ''}</span>
                          )}
                          {s.duracao_minutos && (
                            <span className="text-xs text-gray-400">{s.duracao_minutos} min</span>
                          )}
                        </div>
                        {s.o_que_funcionou && (
                          <p className="text-xs text-gray-500 italic truncate">
                            &ldquo;{s.o_que_funcionou}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                    {moduloKey && (
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/especialista/paciente/${paciente.id}/${moduloKey}`)
                          }}
                          className="text-xs text-[#2D6A4F] font-medium hover:underline"
                        >
                          Ver no módulo →
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
              {sessoes.length > 5 && (
                <p className="text-center text-xs text-[#2D6A4F] font-medium pt-1">
                  +{sessoes.length - 5} sessões anteriores
                </p>
              )}
            </div>
          )}
        </section>

      </main>

      {/* FAB mobile */}
      <button
        onClick={() => setModalSessaoAberto(true)}
        className="sm:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#F59E0B] text-white shadow-lg flex items-center justify-center hover:bg-amber-400 transition-colors active:scale-95"
        aria-label="Registrar sessão"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modal sessão */}
      <ModalSessao
        aberto={modalSessaoAberto}
        onFechar={() => setModalSessaoAberto(false)}
        pacienteId={paciente.id}
        onSalvo={handleSessaoSalva}
      />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
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
