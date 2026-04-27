'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { api } from '@/lib/api'
import { getToken, getUser } from '@/lib/auth'
import { MODULOS_CONFIG } from '@/lib/modulos'
import ModalSessao from '@/components/especialista/ModalSessao'
import AbaEvolucaoModulo from '@/components/especialista/modulo/AbaEvolucaoModulo'
import AbaSessoesModulo from '@/components/especialista/modulo/AbaSessoesModulo'
import AbaAvaliacaoModulo from '@/components/especialista/modulo/AbaAvaliacaoModulo'
import AbaAtividadeIA from '@/components/especialista/modulo/AbaAtividadeIA'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface DadosModulo {
  total_sessoes?: number
  habilidades?: Record<string, {
    atual: string | null
    historico: Array<{ data: string; valor: string }>
    tendencia: string
  }>
  relatorio_ia?: {
    pontos_positivos: string[]
    areas_atencao: string[]
    sugestoes_sessao: string[]
    orientacoes_familia: string[]
    resumo: string
  } | null
}

interface PacienteData {
  id?: number
  nome?: string
  condicao?: string
  grau?: string
  idade?: number
  terapias_em_andamento?: string | string[]
  [key: string]: unknown
}

interface Paciente {
  id: number
  nome: string
  condicao?: string
  grau?: string
  idade?: number
  [key: string]: unknown
}

// ─── Config ───────────────────────────────────────────────────────────────────

const ABAS_MODULO = [
  { id: 'evolucao',  label: 'Evolução',     emoji: '📈' },
  { id: 'sessoes',   label: 'Sessões',      emoji: '📋' },
  { id: 'avaliacao', label: 'Avaliação',    emoji: '📊' },
  { id: 'atividade', label: 'Atividade IA', emoji: '✨' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="animate-spin h-6 w-6 text-white/70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function ModuloClinico() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const modulo = params.modulo as string

  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [abaAtiva, setAbaAtiva] = useState('evolucao')
  const [dados, setDados] = useState<DadosModulo | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [modalSessaoAberto, setModalSessaoAberto] = useState(false)
  const [toast, setToast] = useState('')
  const [erroRender, setErroRender] = useState<string | null>(null)

  const config = MODULOS_CONFIG[modulo]

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const token = getToken()
    if (!token) { router.push('/login'); return }
    const user = getUser()
    if (user?.papel !== 'especialista') { router.push('/login'); return }

    const carregar = async () => {
      setCarregando(true)
      try {
        const [pacRes, evolRes] = await Promise.allSettled([
          api.get(`/v1/especialista/pacientes/${id}`, token),
          api.get(`/v1/especialista/pacientes/${id}/${modulo}/evolucao/`, token),
        ])
        if (pacRes.status === 'fulfilled')  setPaciente(pacRes.value as Paciente)
        if (evolRes.status === 'fulfilled') setDados(evolRes.value)
        if (evolRes.status === 'rejected')  setDados(null)
      } catch (e) {
        const err = e as { message?: string }
        setErroRender(err?.message ?? 'Erro desconhecido ao carregar dados')
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [id, modulo])

  const mostrarToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleSessaoSalva = () => {
    setModalSessaoAberto(false)
    mostrarToast('Sessão registrada com sucesso!')
  }

  if (erroRender) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-lg w-full">
          <h3 className="text-sm font-bold text-red-700 mb-2">Erro ao carregar módulo</h3>
          <p className="text-xs text-red-600 font-mono whitespace-pre-wrap break-all">{erroRender}</p>
          <button
            onClick={() => router.push(`/especialista/paciente/${id}`)}
            className="mt-4 text-xs text-red-500 underline"
          >
            ← Voltar para o paciente
          </button>
        </div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <p className="text-gray-400">Módulo não encontrado</p>
      </div>
    )
  }

  if (carregando) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">

      {/* Header */}
      <header className="bg-[#1B4332] text-white sticky top-0 z-10">
        <div className="px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push(`/especialista/paciente/${id}`)}
            className="text-white/50 hover:text-white transition-colors text-sm shrink-0"
          >
            ←
          </button>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 ${config.corIcone}`}>
            {config.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold leading-tight">{config.label}</h1>
            <p className="text-xs text-white/50 truncate">{paciente?.nome ?? '...'}</p>
          </div>
          <button
            onClick={() => setModalSessaoAberto(true)}
            className="shrink-0 bg-[#F59E0B] text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-amber-400 transition-colors"
          >
            + Sessão
          </button>
        </div>

        {/* Abas */}
        <div className="flex overflow-x-auto px-4 sm:px-6">
          {ABAS_MODULO.map((aba) => (
            <button
              key={aba.id}
              onClick={() => setAbaAtiva(aba.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-all shrink-0 ${
                abaAtiva === aba.id
                  ? 'border-[#F59E0B] text-white'
                  : 'border-transparent text-white/50 hover:text-white/80'
              }`}
            >
              {aba.emoji} {aba.label}
            </button>
          ))}
        </div>
      </header>

      {/* Conteúdo */}
      <div className="px-4 sm:px-6 py-6 max-w-3xl mx-auto">
        {abaAtiva === 'evolucao'  && <AbaEvolucaoModulo dados={dados} modulo={modulo} paciente={paciente} />}
        {abaAtiva === 'sessoes'   && <AbaSessoesModulo  pacienteId={id} modulo={modulo} />}
        {abaAtiva === 'avaliacao' && <AbaAvaliacaoModulo pacienteId={id} modulo={modulo} paciente={paciente} />}
        {abaAtiva === 'atividade' && <AbaAtividadeIA     pacienteId={id} modulo={modulo} paciente={paciente} />}
      </div>

      {/* FAB mobile */}
      <button
        onClick={() => setModalSessaoAberto(true)}
        className="sm:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#F59E0B] text-white shadow-lg flex items-center justify-center hover:bg-amber-400 transition-colors active:scale-95"
        aria-label="Registrar sessão"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modal sessão */}
      {paciente && (
        <ModalSessao
          aberto={modalSessaoAberto}
          onFechar={() => setModalSessaoAberto(false)}
          pacienteId={paciente.id}
          onSalvo={handleSessaoSalva}
        />
      )}

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
