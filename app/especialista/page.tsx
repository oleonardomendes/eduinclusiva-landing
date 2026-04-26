'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut } from 'lucide-react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { getToken, getUser, clearAuth } from '@/lib/auth'
import { getPacientes } from '@/lib/api'
import { MODULOS_CONFIG, parseTerapias } from '@/lib/modulos'
import ModalNovoPaciente from '@/components/especialista/ModalNovoPaciente'
import AvatarPaciente from '@/components/especialista/AvatarPaciente'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Paciente {
  id: number
  nome: string
  condicao?: string
  grau?: string
  idade?: number
  last_session?: string
  total_sessoes?: number
  terapias_em_andamento?: string | string[]
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

function formatarData(d?: string) {
  if (!d) return null
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function EspecialistaPage() {
  const router = useRouter()
  const [user, setUser] = useState<Record<string, unknown> | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [toast, setToast] = useState('')

  const carregarPacientes = async () => {
    const token = getToken()
    if (!token) return
    try {
      const data = await getPacientes(token)
      const lista = Array.isArray(data) ? data : data?.pacientes ?? []
      setPacientes(lista)
    } catch {
      // silencia
    }
  }

  useEffect(() => {
    const token = getToken()
    if (!token) { router.push('/login'); return }

    const u = getUser()
    if (u) {
      if (u.papel !== 'especialista') { router.push('/login'); return }
      setUser(u)
    }

    const init = async () => {
      try {
        await carregarPacientes()
      } finally {
        setCarregando(false)
      }
    }
    init()
  }, [])

  const mostrarToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleSair = () => {
    clearAuth()
    router.push('/')
  }

  const nomeEspecialista = (user?.nome as string) || (user?.email as string)?.split('@')[0] || 'Especialista'

  const pacientesFiltrados = pacientes.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#FDFBF7]">

      {/* Header */}
      <header className="bg-[#1B4332] sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="hover:opacity-80 transition-opacity shrink-0">
            <Logo size="sm" theme="dark" />
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#2D6A4F] flex items-center justify-center text-white text-xs font-bold shrink-0">
                {nomeEspecialista[0]?.toUpperCase()}
              </span>
              <span className="text-[#A7F3D0] text-sm font-medium">{nomeEspecialista}</span>
            </div>
            <button
              onClick={handleSair}
              className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Sair</span>
            </button>
          </div>
        </div>

        {/* Sub-header: título + botão */}
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pb-4 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-white font-lora font-bold text-xl leading-tight">Meus Pacientes</h1>
            {!carregando && (
              <p className="text-white/50 text-xs mt-0.5">
                {pacientes.length} paciente{pacientes.length !== 1 ? 's' : ''} ativo{pacientes.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <button
            onClick={() => setModalAberto(true)}
            className="shrink-0 flex items-center gap-1.5 bg-[#F59E0B] text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-amber-400 transition-colors"
          >
            + Novo paciente
          </button>
        </div>
      </header>

      {/* Busca */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 max-w-screen-xl mx-auto w-full">
        <input
          type="text"
          placeholder="Buscar paciente por nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] bg-[#FDFBF7] placeholder:text-gray-400 transition-all"
        />
      </div>

      {/* Conteúdo */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        {carregando ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : pacientesFiltrados.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">👤</div>
            <p className="font-medium text-gray-500 mb-1">
              {busca ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado ainda'}
            </p>
            {!busca && (
              <p className="text-sm">Clique em "+ Novo paciente" para começar.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pacientesFiltrados.map((paciente) => (
              <motion.button
                key={paciente.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => router.push(`/especialista/paciente/${paciente.id}`)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left cursor-pointer hover:shadow-md hover:border-[#2D6A4F]/20 transition-all duration-200 group w-full"
              >
                {/* Avatar + nome + seta */}
                <div className="flex items-start gap-3">
                  <AvatarPaciente nome={paciente.nome} size="lg" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#1B4332] text-sm truncate">{paciente.nome}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {[paciente.condicao, paciente.grau && paciente.grau !== 'Não definido' ? paciente.grau : null, paciente.idade ? `${paciente.idade} anos` : null]
                        .filter(Boolean).join(' · ') || 'Sem diagnóstico informado'}
                    </p>
                  </div>
                  <span className="text-gray-300 group-hover:text-[#2D6A4F] transition-colors text-sm mt-0.5 shrink-0">→</span>
                </div>

                {/* Rodapé */}
                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {paciente.last_session
                      ? `Última sessão: ${formatarData(paciente.last_session)}`
                      : 'Sem sessões ainda'}
                  </span>
                  <div className="flex gap-1">
                    {parseTerapias(paciente.terapias_em_andamento).slice(0, 2).map((mod) => (
                      <span key={mod} className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        {MODULOS_CONFIG[mod]?.emoji}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Modal novo paciente */}
      <ModalNovoPaciente
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        onCriado={async () => {
          setModalAberto(false)
          await carregarPacientes()
          mostrarToast('Paciente cadastrado com sucesso!')
        }}
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
