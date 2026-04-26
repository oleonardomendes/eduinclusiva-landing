'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { getPaciente, getSessoes } from '@/lib/api'
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="animate-spin h-6 w-6 text-[#1B4332]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function formatData(d?: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
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
  const [modalSessaoAberto, setModalSessaoAberto] = useState(false)
  const [toast, setToast] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const token = getToken()
    if (!token) { router.push('/login'); return }
    const user = getUser()
    if (user?.papel !== 'especialista') { router.push('/login'); return }

    const carregar = async () => {
      setCarregando(true)
      try {
        const [dadosPaciente, dadosSessoes] = await Promise.all([
          getPaciente(pacienteId, token),
          getSessoes(pacienteId, token).catch(() => []),
        ])
        setPaciente(dadosPaciente)
        const lista: Sessao[] = Array.isArray(dadosSessoes)
          ? dadosSessoes
          : (dadosSessoes as { sessoes?: Sessao[] })?.sessoes ?? []
        setSessoes([...lista].sort((a, b) => ((a.data_sessao ?? '') < (b.data_sessao ?? '') ? 1 : -1)))
      } catch {
        setPaciente(null)
      } finally {
        setCarregando(false)
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

  const ultimasSessoes = sessoes.slice(0, 3)

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
              {[
                paciente.condicao,
                paciente.grau || null,
                paciente.idade ? `${paciente.idade} anos` : null,
              ].filter(Boolean).join(' · ')}
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

      {/* Conteúdo */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ZONA 2 — Módulos clínicos */}
        <section>
          <p className="text-xs font-semibold text-[#718096] uppercase tracking-wide mb-3">Módulos clínicos</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {parseTerapias(paciente.terapias_em_andamento).map((modulo) => {
              const cfg = MODULOS_CONFIG[modulo]
              if (!cfg) return null
              return (
                <button
                  key={modulo}
                  onClick={() => router.push(`/especialista/paciente/${paciente.id}/${modulo}`)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 group hover:shadow-md hover:-translate-y-0.5 ${cfg.cor}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${cfg.corIcone} group-hover:scale-110 transition-transform duration-200`}>
                    {cfg.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm leading-tight">{cfg.label}</h3>
                    <p className="text-xs opacity-70 mt-0.5 leading-snug">{cfg.descricao}</p>
                  </div>
                  <span className="opacity-40 group-hover:opacity-80 group-hover:translate-x-1 transition-all duration-200 shrink-0">→</span>
                </button>
              )
            })}
            {parseTerapias(paciente.terapias_em_andamento).length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-400">
                <p className="text-sm">Nenhum módulo cadastrado</p>
                <p className="text-xs mt-1">Edite o perfil para adicionar as terapias em andamento</p>
              </div>
            )}
          </div>
        </section>

        {/* ZONA 3 — Sessões recentes */}
        <section>
          <p className="text-xs font-semibold text-[#718096] uppercase tracking-wide mb-3">Sessões recentes</p>
          {ultimasSessoes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
              <p className="text-4xl mb-2">📋</p>
              <p className="text-sm text-gray-400 font-medium">Nenhuma sessão registrada</p>
              <p className="text-xs text-gray-300 mt-1">Clique em &quot;+ Sessão&quot; para começar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ultimasSessoes.map((s) => {
                const moduloKey = s.especialidade ? especialidadeParaModulo[s.especialidade] : undefined
                const cfg = moduloKey ? MODULOS_CONFIG[moduloKey] : undefined
                return (
                  <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-3">
                    <span className="text-xl shrink-0 mt-0.5">{cfg?.emoji ?? '📋'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                          {s.especialidade ?? 'Sessão'}
                        </p>
                        <span className="text-xs text-gray-400 shrink-0">{formatData(s.data_sessao)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {s.humor_inicio && (
                          <span className="text-sm">{humorEmoji[s.humor_inicio] ?? ''}</span>
                        )}
                        {s.duracao_minutos && (
                          <span className="text-xs text-gray-400">{s.duracao_minutos} min</span>
                        )}
                        {s.o_que_funcionou && (
                          <span className="text-xs text-gray-500 italic truncate max-w-[180px]">&ldquo;{s.o_que_funcionou}&rdquo;</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              {sessoes.length > 3 && (
                <p className="text-center text-xs text-[#2D6A4F] font-medium pt-1">
                  +{sessoes.length - 3} sessões anteriores
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
