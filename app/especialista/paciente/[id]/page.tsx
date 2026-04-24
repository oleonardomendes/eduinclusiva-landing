'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { getPaciente } from '@/lib/api'
import { getToken, getUser } from '@/lib/auth'
import AbaPerfil from '@/components/especialista/abas/AbaPerfil'
import AbaSessoes from '@/components/especialista/abas/AbaSessoes'
import AbaPlano from '@/components/especialista/abas/AbaPlano'
import AbaEvolucao from '@/components/especialista/abas/AbaEvolucao'
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
  emoji?: string
  ultima_sessao?: string
}

type Aba = 'perfil' | 'sessoes' | 'plano' | 'evolucao'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="animate-spin h-6 w-6 text-[#1B4332]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

const abas: { id: Aba; label: string }[] = [
  { id: 'perfil',   label: 'Perfil'    },
  { id: 'sessoes',  label: 'Sessões'   },
  { id: 'plano',    label: 'Plano'     },
  { id: 'evolucao', label: 'Evolução'  },
]

// ─── Página ───────────────────────────────────────────────────────────────────

export default function PacientePage() {
  const params = useParams()
  const router = useRouter()
  const pacienteId = Number(params.id)

  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [abaAtiva, setAbaAtiva] = useState<Aba>('perfil')
  const [modalSessaoAberto, setModalSessaoAberto] = useState(false)
  const [toast, setToast] = useState('')
  const [sessaoKey, setSessaoKey] = useState(0)

  useEffect(() => {
    const token = getToken()
    if (!token) { router.push('/login'); return }
    const user = getUser()
    if (user?.papel !== 'especialista') { router.push('/login'); return }

    const carregar = async () => {
      setCarregando(true)
      try {
        const data = await getPaciente(pacienteId, token)
        setPaciente(data)
      } catch {
        setPaciente(null)
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [pacienteId])

  const mostrarToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleSessaoSalva = () => {
    setModalSessaoAberto(false)
    setSessaoKey((k) => k + 1)
    mostrarToast('Sessão registrada com sucesso!')
    if (abaAtiva !== 'sessoes') setAbaAtiva('sessoes')
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

  return (
    <div className="min-h-screen bg-[#FDFBF7]">

      {/* Header */}
      <header className="bg-[#1B4332] sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="hover:opacity-80 transition-opacity shrink-0">
            <Logo size="sm" theme="dark" />
          </Link>
          <Link
            href="/especialista"
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:block">Meus Pacientes</span>
          </Link>
        </div>

        {/* Sub-header: avatar + nome + botão sessão */}
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pb-4 flex items-end justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl shrink-0">
              {paciente.emoji ?? '👤'}
            </div>
            <div className="min-w-0">
              <h1 className="text-white font-lora font-bold text-lg leading-tight truncate">{paciente.nome}</h1>
              {(paciente.condicao || paciente.idade) && (
                <p className="text-white/50 text-xs mt-0.5 truncate">
                  {[paciente.condicao, paciente.idade ? `${paciente.idade} anos` : null].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setModalSessaoAberto(true)}
            className="shrink-0 hidden sm:flex items-center gap-1.5 bg-[#F59E0B] text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-amber-400 transition-colors"
          >
            <Plus className="w-4 h-4" /> Registrar sessão
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto scrollbar-none">
          {abas.map((aba) => (
            <button
              key={aba.id}
              onClick={() => setAbaAtiva(aba.id)}
              className={`px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-colors whitespace-nowrap ${
                abaAtiva === aba.id
                  ? 'bg-[#FDFBF7] text-[#1B4332]'
                  : 'text-white/60 hover:text-white/90'
              }`}
            >
              {aba.label}
            </button>
          ))}
        </div>
      </header>

      {/* Conteúdo da aba */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={abaAtiva}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {abaAtiva === 'perfil'   && <AbaPerfil   paciente={paciente} />}
              {abaAtiva === 'sessoes'  && (
                <AbaSessoes
                  key={sessaoKey}
                  paciente={paciente}
                  onRegistrarSessao={() => setModalSessaoAberto(true)}
                />
              )}
              {abaAtiva === 'plano'    && <AbaPlano    paciente={paciente} />}
              {abaAtiva === 'evolucao' && <AbaEvolucao paciente={paciente} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* FAB mobile — Registrar sessão */}
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
