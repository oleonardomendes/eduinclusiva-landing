'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, BookOpen, X } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { api, getPercepcoes, getPlanoStatus } from '@/lib/api'
import { getToken, getUser, clearAuth } from '@/lib/auth'
import ModalPercepcao from '@/components/familia/ModalPercepcao'
import SecaoEvolucao from '@/components/familia/SecaoEvolucao'
import AtividadeModal from '@/components/familia/AtividadeModal'
import AvaliacaoModal from '@/components/familia/AvaliacaoModal'
import BloqueioPlano from '@/components/familia/BloqueioPlano'
import { compartilharPDF } from '@/lib/gerarPDF'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Filho {
  id?: string
  _id?: string
  nome: string
  idade?: number
  condicao?: string
  estilo_aprendizagem?: string
  relatorio_estilo?: string
  grau_necessidade?: string
}

interface Atividade {
  id?: string
  _id?: string
  titulo?: string
  area?: string
  area_desenvolvimento?: string
  objetivo?: string
  materiais?: string[]
  passos?: string[]
  passo_a_passo?: string[]
  // backend pode usar nomes alternativos nos campos abaixo:
  instrucao_familia?: string
  instrucao_para_familia?: string
  dica_emocional?: string
  suporte_emocional?: string
  adaptacoes?: string[]
  quando_buscar_ajuda?: string
  buscar_ajuda?: string
  created_at?: string
  data?: string
}

// ─── Parse de campos que chegam como JSON string do backend ───────────────────

function parsearLista(campo: any): string[] {
  if (!campo) return []
  if (Array.isArray(campo)) return campo
  try {
    const parsed = JSON.parse(campo)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function normalizarAtividade(raw: any): Atividade {
  return {
    ...raw,
    materiais: parsearLista(raw.materiais),
    passo_a_passo: parsearLista(raw.passo_a_passo ?? raw.passos),
    adaptacoes: parsearLista(raw.adaptacoes),
  }
}

// ─── Áreas de desenvolvimento ─────────────────────────────────────────────────

const areas = [
  { id: 'comunicacao', emoji: '😊', label: 'Comunicação e Linguagem' },
  { id: 'cognicao', emoji: '🧠', label: 'Cognição e Aprendizagem' },
  { id: 'motor', emoji: '💪', label: 'Desenvolvimento Motor' },
  { id: 'emocional', emoji: '❤️', label: 'Regulação Emocional' },
  { id: 'social', emoji: '👥', label: 'Habilidades Sociais' },
  { id: 'autonomia', emoji: '🎯', label: 'Autonomia e Vida Diária' },
]

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

// ─── Card de atividade gerada ──────────────────────────────────────────────────

function AtividadeCard({ atividade }: { atividade: Atividade }) {
  const titulo = atividade.titulo ?? 'Atividade'
  const passos = atividade.passo_a_passo ?? atividade.passos ?? []
  const instrucaoFamilia = atividade.instrucao_familia ?? atividade.instrucao_para_familia
  const dicaEmocional = atividade.dica_emocional ?? atividade.suporte_emocional
  const quandoBuscar = atividade.quando_buscar_ajuda ?? atividade.buscar_ajuda
  const adaptacoes = (atividade.adaptacoes ?? []).join('\n')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl border border-[#F0EBE0] shadow-soft overflow-hidden"
    >
      {/* Header */}
      <div className="bg-[#1B4332] px-5 py-4">
        <p className="text-[#A7F3D0] text-xs font-medium mb-1">Atividade gerada por IA ✨</p>
        <h3 className="text-white font-lora font-bold text-xl leading-tight">{titulo}</h3>
      </div>

      <div className="p-5 space-y-4">
        {/* Objetivo */}
        {atividade.objetivo && (
          <div className="bg-[#F0F7F4] rounded-xl p-4">
            <p className="text-[#2D6A4F] text-xs font-semibold uppercase tracking-wide mb-1">Objetivo</p>
            <p className="text-[#1A1A1A] text-sm leading-relaxed">{atividade.objetivo}</p>
          </div>
        )}

        {/* Materiais */}
        {atividade.materiais && atividade.materiais.length > 0 && (
          <div>
            <p className="text-[#4A5568] text-xs font-semibold uppercase tracking-wide mb-2">Materiais</p>
            <ul className="space-y-1">
              {atividade.materiais.map((m, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#4A5568]">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#2D6A4F] flex-shrink-0" />
                  {m}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Passo a passo */}
        {passos.length > 0 && (
          <div>
            <p className="text-[#4A5568] text-xs font-semibold uppercase tracking-wide mb-2">Passo a passo</p>
            <ol className="space-y-2">
              {passos.map((passo, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#1B4332] text-white text-xs flex items-center justify-center flex-shrink-0 font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-[#4A5568] leading-relaxed">{passo}</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Instrução para família — fundo verde claro */}
        {instrucaoFamilia && (
          <div className="bg-[#E8F4EE] rounded-xl p-4 border border-[#A7F3D0]">
            <p className="text-[#065F46] text-xs font-semibold uppercase tracking-wide mb-1">Instrução para família</p>
            <p className="text-[#065F46] text-sm leading-relaxed">{instrucaoFamilia}</p>
          </div>
        )}

        {/* Dica emocional — fundo âmbar */}
        {dicaEmocional && (
          <div className="bg-[#FEF3C7] rounded-xl p-4 border border-amber-200">
            <p className="text-amber-700 text-xs font-semibold uppercase tracking-wide mb-1">Dica emocional</p>
            <p className="text-amber-800 text-sm leading-relaxed">{dicaEmocional}</p>
          </div>
        )}

        {/* Adaptações */}
        {adaptacoes && (
          <div>
            <p className="text-[#4A5568] text-xs font-semibold uppercase tracking-wide mb-1">Adaptações</p>
            <p className="text-sm text-[#4A5568] leading-relaxed">{adaptacoes}</p>
          </div>
        )}

        {/* Quando buscar ajuda — fundo azul claro */}
        {quandoBuscar && (
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-blue-700 text-xs font-semibold uppercase tracking-wide mb-1">Quando buscar ajuda</p>
            <p className="text-blue-800 text-sm leading-relaxed">{quandoBuscar}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Modal de atividade do histórico ──────────────────────────────────────────

function ModalAtividade({
  atividade,
  onClose,
}: {
  atividade: Atividade
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-soft-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-5 h-5 text-[#718096]" />
        </button>
        <AtividadeCard atividade={atividade} />
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function FamiliaPage() {
  const router = useRouter()
  const [user, setUser] = useState<Record<string, unknown> | null>(null)
  const [filho, setFilho] = useState<Filho | null>(null)
  const [carregando, setCarregando] = useState(true)

  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [modalAtividadeAberto, setModalAtividadeAberto] = useState(false)
  const [descricaoModal, setDescricaoModal] = useState('')

  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [atividadeModal, setAtividadeModal] = useState<Atividade | null>(null)

  const [modalPercepcaoConfig, setModalPercepcaoConfig] = useState<{
    atividadeId: string | number
    tituloAtividade: string
  } | null>(null)

  const [atividadesAvaliadas, setAtividadesAvaliadas] = useState<string[]>([])
  const [recarregarEvolucao, setRecarregarEvolucao] = useState(0)
  const [evolucaoInsights, setEvolucaoInsights] = useState<string[]>([])

  const [gerandoPDFId, setGerandoPDFId] = useState<string | null>(null)
  const [modalAvaliacaoAberto, setModalAvaliacaoAberto] = useState(false)
  const [atividadeParaAvaliar, setAtividadeParaAvaliar] = useState<Atividade | null>(null)

  const [plano, setPlano] = useState<any>(null)
  const [bannerFechado, setBannerFechado] = useState(false)
  const [toastUpgrade, setToastUpgrade] = useState(false)
  const [bloqueioAberto, setBloqueioAberto] = useState<{ funcionalidade: string; descricao: string } | null>(null)


  // ── Recarregar atividades (chamado após gerar nova atividade) ──────────────
  const recarregarAtividades = async (filhoId: string) => {
    const t = getToken()
    if (!t || !filhoId) return
    try {
      const data = await api.get(`/v1/familia/filhos/${filhoId}/atividades`, t)
      const lista = Array.isArray(data) ? data : data?.atividades ?? []
      setAtividades(lista.map(normalizarAtividade))
    } catch {
      // silencia erro no histórico
    }
  }

  // ── Carregar dados ao montar ───────────────────────────────────────────────
  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push('/login')
      return
    }

    const u = getUser()
    if (u) setUser(u)

    const carregarDados = async () => {
      try {
        setCarregando(true)

        // Buscar filhos do backend
        const filhosData = await api.get('/v1/familia/filhos/', token)
        const filhos = Array.isArray(filhosData)
          ? filhosData
          : filhosData?.filhos ?? []

        if (!filhos || filhos.length === 0) {
          router.push('/cadastro/filho')
          return
        }

        const filhoAtual = filhos[0]
        setFilho(filhoAtual)
        localStorage.setItem('edu_filho_id', String(filhoAtual.id ?? filhoAtual._id ?? ''))
        localStorage.setItem('edu_filho_data', JSON.stringify(filhoAtual))

        // Buscar atividades do filho
        try {
          const atividadesData = await api.get(
            `/v1/familia/filhos/${filhoAtual.id ?? filhoAtual._id}/atividades`,
            token
          )
          const listaInicial = Array.isArray(atividadesData) ? atividadesData : atividadesData?.atividades ?? []
          setAtividades(listaInicial.map(normalizarAtividade))
        } catch {
          setAtividades([])
        }

        // Buscar status do plano
        try {
          const statusPlano = await getPlanoStatus(token)
          setPlano(statusPlano)
        } catch {
          // silencia
        }

        // Buscar percepções já registradas para popular atividadesAvaliadas
        try {
          const percepcoesBruto = await getPercepcoes(Number(filhoAtual.id ?? filhoAtual._id), token)
          const listaPercepcoes = Array.isArray(percepcoesBruto)
            ? percepcoesBruto
            : (percepcoesBruto as { percepcoes?: unknown[] })?.percepcoes ?? []
          type Percepcao = { atividade_id: string | number; criado_em?: string }
          const porAtividade = (listaPercepcoes as Percepcao[]).reduce(
            (acc: Record<string, Percepcao>, p) => {
              const id = String(p.atividade_id)
              if (!acc[id] || (p.criado_em ?? '') > (acc[id].criado_em ?? '')) acc[id] = p
              return acc
            },
            {}
          )
          setAtividadesAvaliadas(Object.keys(porAtividade))
        } catch {
          // silencia erro ao carregar percepções
        }

      } catch (err) {
        console.error('Erro ao carregar dados:', err)
        router.push('/login')
      } finally {
        setCarregando(false)
      }
    }

    setBannerFechado(localStorage.getItem('edu_banner_upgrade_fechado') === '1')
    carregarDados()
  }, [])

  // ── Sair ───────────────────────────────────────────────────────────────────
  const handleSair = () => {
    clearAuth()
    localStorage.removeItem('edu_filho_id')
    localStorage.removeItem('edu_filho_data')
    router.push('/')
  }

  // ── Scroll para seção de evolução ─────────────────────────────────────────
  const irParaEvolucao = () => {
    document.getElementById('secao-evolucao')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // ── Mapear label da área para id do grid ───────────────────────────────────
  const areaLabelParaId = (label: string): string | null =>
    areas.find((a) => a.label === label || a.id === label)?.id ?? null

  // ── Repetir atividade do histórico ─────────────────────────────────────────
  const handleRepetir = (at: Atividade) => {
    const areaId = areaLabelParaId(at.area_desenvolvimento ?? at.area ?? '')
    if (areaId) setSelectedArea(areaId)
    setDescricaoModal(`Repetir: ${at.titulo ?? ''}`.trim())
    setModalAtividadeAberto(true)
  }

  // ── Gerar PDF de atividade do histórico ────────────────────────────────────
  const handlePDFHistorico = async (at: Atividade) => {
    const atId = String(at.id ?? at._id ?? '')
    setGerandoPDFId(atId)
    try {
      const areaLabel = at.area_desenvolvimento ?? at.area ?? ''
      const area = areas.find((a) => a.label === areaLabel || a.id === areaLabel)
        ?? { id: '', emoji: '📋', label: areaLabel }
      await compartilharPDF(at, filho, area)
    } catch (e) {
      console.error('Erro ao gerar PDF do histórico:', e)
    } finally {
      setGerandoPDFId(null)
    }
  }

  // ── Percepção salva — atualizar listas e forçar re-fetch da evolução ───────
  const handlePercepcaoSalva = (_resultado: unknown) => {
    if (modalPercepcaoConfig) {
      const id = String(modalPercepcaoConfig.atividadeId)
      setAtividadesAvaliadas((prev) => prev.includes(id) ? prev : [...prev, id])
    }
    setModalPercepcaoConfig(null)
    const filhoId = filho?.id ?? filho?._id
    if (filhoId) recarregarAtividades(String(filhoId))
    setRecarregarEvolucao((k) => k + 1)
  }

  // ── Upgrade bem-sucedido ──────────────────────────────────────────────────
  const handleUpgradeSuccess = async () => {
    const token = getToken()
    if (token) {
      try {
        const novoPlano = await getPlanoStatus(token)
        setPlano(novoPlano)
      } catch { }
    }
    setToastUpgrade(true)
    setBloqueioAberto(null)
    setTimeout(() => {
      setToastUpgrade(false)
      window.location.reload()
    }, 2000)
  }

  // ── Verificar se atividade já foi avaliada ─────────────────────────────────
  const jaAvaliada = (at: Atividade): boolean => {
    const id = String(at.id ?? at._id ?? '')
    if (atividadesAvaliadas.includes(id)) return true
    const raw = at as Record<string, unknown>
    return !!(raw.percepcao_humor || raw.humor_registrado || raw.percepcao)
  }

  // ── Nome display ───────────────────────────────────────────────────────────
  const nomeUsuario =
    (user?.nome as string) ||
    (user?.email as string)?.split('@')[0] ||
    'você'

  const nomeFilho = filho?.nome ?? 'seu filho'

  const temEstilo =
    !!filho?.estilo_aprendizagem &&
    !['nao_sei', 'Não sei ainda', ''].includes(filho.estilo_aprendizagem)

  if (carregando) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8 text-[#1B4332]" />
          <p className="text-[#718096] font-medium">Carregando seus dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Header — full width */}
      <header className="bg-[#1B4332] sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 h-16 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Logo size="md" theme="dark" />
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-[#A7F3D0] text-sm hidden sm:block font-medium">
              {nomeUsuario}
            </span>
            <button
              onClick={handleSair}
              className="flex items-center gap-1.5 text-[#FDFBF7]/80 hover:text-[#FDFBF7] text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Banner de upgrade */}
      {plano?.plano === 'gratuito' && (plano?.atividades_usadas ?? 0) >= 2 && !bannerFechado && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#FEF3C7] to-[#FDFBF7] border-b border-amber-100"
        >
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 flex items-center justify-between gap-4 py-2.5">
            <p className="text-sm text-amber-800">
              Você usou{' '}
              <strong>{plano.atividades_usadas}</strong> de{' '}
              <strong>{plano.limite_atividades ?? 3}</strong> atividades gratuitas este mês.
            </p>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => setBloqueioAberto({
                  funcionalidade: 'atividades',
                  descricao: 'Assine o Plano Família para ter atividades ilimitadas e muito mais.',
                })}
                className="text-xs font-semibold text-white bg-[#F59E0B] px-3 py-1.5 rounded-lg hover:bg-amber-500 transition-colors whitespace-nowrap"
              >
                Plano Família — R$ 29/mês →
              </button>
              <button
                onClick={() => {
                  setBannerFechado(true)
                  localStorage.setItem('edu_banner_upgrade_fechado', '1')
                }}
                className="text-amber-600 hover:text-amber-800 text-lg leading-none flex-shrink-0"
                aria-label="Fechar banner"
              >
                ✕
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-8">

        {/* Page title + quick stats — full width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="font-lora font-bold text-3xl sm:text-4xl text-[#1A1A1A] mb-1">
            Olá, {nomeUsuario}! 👋
          </h1>
          <p className="text-[#4A5568] text-base mb-6">
            Veja como {nomeFilho} está progredindo
          </p>

          {/* Quick stats */}
          {(() => {
            const agora = new Date()
            const seteDiasAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000)

            // STAT 1 — Atividades esta semana
            const atividadesSemana = atividades.filter((at: Atividade) => {
              const d = at.created_at ?? at.data
              if (!d) return false
              return new Date(d) >= seteDiasAtras
            }).length

            // STAT 2 — Última área trabalhada
            const maisRecente = atividades.length > 0
              ? [...atividades].sort((a, b) => {
                  const da = new Date(a.created_at ?? a.data ?? 0).getTime()
                  const db = new Date(b.created_at ?? b.data ?? 0).getTime()
                  return db - da
                })[0]
              : null
            const ultimaAreaLabel = maisRecente
              ? (maisRecente.area_desenvolvimento ?? maisRecente.area ?? null)
              : null
            const ultimaArea = ultimaAreaLabel
              ? areas.find((a) => a.label === ultimaAreaLabel || a.id === ultimaAreaLabel)
              : null

            // STAT 3 — Sugestão de hoje (área com menos atividades recentes)
            const contagemPorArea: Record<string, number> = {}
            areas.forEach((a) => { contagemPorArea[a.id] = 0 })
            atividades.forEach((at: Atividade) => {
              const lbl = at.area_desenvolvimento ?? at.area ?? ''
              const match = areas.find((a) => a.label === lbl || a.id === lbl)
              if (match) contagemPorArea[match.id] = (contagemPorArea[match.id] ?? 0) + 1
            })
            const areaSugerida = areas.reduce((min, a) =>
              (contagemPorArea[a.id] ?? 0) < (contagemPorArea[min.id] ?? 0) ? a : min
            , areas[0])

            return (
              <div className="grid grid-cols-3 gap-4">

                {/* Stat 1 — Atividades esta semana */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                  <div className="text-2xl mb-1">📅</div>
                  <p className="text-lg font-bold text-[#1B4332]">{atividadesSemana}</p>
                  <p className="text-xs text-gray-500 mt-1">Atividades esta semana</p>
                </div>

                {/* Stat 2 — Última área trabalhada */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                  <div className="text-2xl mb-1">{ultimaArea?.emoji ?? '—'}</div>
                  <p className="text-sm font-bold text-[#1B4332] leading-tight truncate">
                    {ultimaArea?.label ?? '—'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {ultimaArea ? 'Última área' : 'Nenhuma ainda'}
                  </p>
                </div>

                {/* Stat 3 — Sugestão de hoje (clicável) */}
                <button
                  onClick={() => {
                    setSelectedArea(areaSugerida.id)
                    setDescricaoModal('')
                    setModalAtividadeAberto(true)
                  }}
                  className="bg-white rounded-2xl p-4 border border-[#F59E0B]/30 shadow-sm text-center
                             cursor-pointer hover:border-[#F59E0B] hover:shadow-md transition-all duration-150"
                >
                  <div className="text-2xl mb-1">✨</div>
                  <p className="text-sm font-bold text-[#1B4332] leading-tight truncate">
                    {areaSugerida.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Sugerida para hoje</p>
                </button>

              </div>
            )
          })()}
        </motion.div>

        {/* Three-column layout */}
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_2fr_1fr] gap-6">

          {/* ── Coluna esquerda — Perfil (order-3 em mobile) ── */}
          <aside className="order-3 lg:order-1 space-y-4 lg:sticky lg:top-24 lg:self-start">

            {/* Card do filho */}
            {filho && (
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-2xl border border-[#F0EBE0] shadow-soft p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#D1FAE5] flex items-center justify-center text-2xl flex-shrink-0">
                    👦
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#1A1A1A] text-lg leading-tight">{filho.nome}</p>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {filho.idade && (
                        <span className="text-xs bg-[#F0F7F4] text-[#2D6A4F] px-2.5 py-1 rounded-full font-medium">
                          {filho.idade} anos
                        </span>
                      )}
                      {filho.condicao && (
                        <span className="text-xs bg-[#F5F0E8] text-[#92400E] px-2.5 py-1 rounded-full font-medium">
                          {filho.condicao}
                        </span>
                      )}
                      {temEstilo && (
                        <span className="text-xs bg-[#EDE9FE] text-[#5B21B6] px-2.5 py-1 rounded-full font-medium">
                          {filho.estilo_aprendizagem}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Estilo de aprendizagem */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              {temEstilo && filho?.relatorio_estilo ? (
                <div className="bg-[#D1FAE5] rounded-2xl border border-[#A7F3D0] p-5">
                  <p className="font-semibold text-[#065F46]">
                    Estilo: {filho.estilo_aprendizagem} ✓
                  </p>
                  <p className="text-sm text-[#065F46]/80 mt-0.5 mb-3">
                    Questionário de estilo concluído
                  </p>
                  <button
                    onClick={() => setAtividadeModal({ titulo: 'Relatório de Estilo', objetivo: filho.relatorio_estilo })}
                    className="w-full px-4 py-2 bg-[#1B4332] text-white text-sm font-medium rounded-xl hover:bg-[#2D6A4F] transition-colors"
                  >
                    Ver relatório completo
                  </button>
                </div>
              ) : (
                <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5">
                  <p className="font-semibold text-amber-800 mb-1">
                    🎯 Descubra como {nomeFilho} aprende
                  </p>
                  <p className="text-sm text-amber-700 mt-1 mb-3">
                    Responda 8 perguntas e nossa IA identifica o estilo de aprendizagem.
                  </p>
                  <div className="flex flex-col gap-2">
                    <span className="text-xs bg-[#F59E0B] text-white px-3 py-1 rounded-full font-bold self-start">
                      Plano Família
                    </span>
                    {plano?.plano === 'gratuito' ? (
                      <button
                        onClick={() => setBloqueioAberto({
                          funcionalidade: 'questionario',
                          descricao: 'Descubra o estilo de aprendizagem do seu filho com 8 perguntas e receba um relatório personalizado da IA.',
                        })}
                        className="block w-full text-center px-4 py-2.5 bg-[#1B4332] text-white text-sm font-semibold rounded-xl hover:bg-[#2D6A4F] transition-colors shadow-green"
                      >
                        🔒 Fazer questionário
                      </button>
                    ) : (
                      <Link
                        href="/familia/questionario"
                        className="block text-center px-4 py-2.5 bg-[#1B4332] text-white text-sm font-semibold rounded-xl hover:bg-[#2D6A4F] transition-colors shadow-green"
                      >
                        Fazer questionário
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Mini card — Observações da IA */}
            {evolucaoInsights.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-[#F59E0B]/10 rounded-2xl p-4 border border-[#F59E0B]/20"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-sm">✨</span>
                  <span className="text-xs font-semibold text-[#1B4332]">Observação da IA</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                  {evolucaoInsights[0]}
                </p>
                <button
                  onClick={irParaEvolucao}
                  className="text-xs text-[#F59E0B] font-medium mt-2 hover:underline"
                >
                  Ver evolução completa →
                </button>
              </motion.div>
            )}
          </aside>

          {/* ── Coluna central — Gerar Atividade (order-1 em mobile) ── */}
          <section id="secao-gerar" className="order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
            >
              <h2 className="text-lg font-bold text-[#1B4332] mb-1">
                ✨ Atividade para {nomeFilho}
              </h2>
              <p className="text-sm text-gray-400 mb-6">
                Escolha uma área e gere em segundos
              </p>

              {/* Seleção de área */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
                {areas.map((area) => {
                  const isSelected = selectedArea === area.id
                  return (
                    <button
                      key={area.id}
                      onClick={() => setSelectedArea(isSelected ? null : area.id)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-xs font-medium transition-all duration-150 ${
                        isSelected
                          ? 'border-[#1B4332] bg-[#1B4332]/5 text-[#1B4332]'
                          : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'
                      }`}
                    >
                      <span className="text-xl">{area.emoji}</span>
                      <span className="text-center leading-tight">{area.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Contador plano gratuito */}
              {plano?.plano === 'gratuito' && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>
                      {plano.atividades_usadas ?? 0} de {plano.limite_atividades ?? 3} atividades gratuitas usadas
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-amber-400"
                      style={{
                        width: `${Math.min(((plano.atividades_usadas ?? 0) / (plano.limite_atividades ?? 3)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* CTA — abre modal ou bloqueio */}
              {plano?.plano === 'gratuito' && (plano?.atividades_usadas ?? 0) >= (plano?.limite_atividades ?? 3) ? (
                <BloqueioPlano
                  funcionalidade="atividades"
                  descricao="Você usou suas 3 atividades gratuitas este mês. Assine o Plano Família para atividades ilimitadas."
                  onUpgradeSuccess={handleUpgradeSuccess}
                />
              ) : (
                <button
                  onClick={() => selectedArea && setModalAtividadeAberto(true)}
                  disabled={!selectedArea}
                  className={`w-full py-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                    selectedArea
                      ? 'bg-[#1B4332] text-white hover:bg-[#2D6A4F] shadow-md hover:shadow-lg'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  ✨ Gerar atividade
                </button>
              )}
            </motion.div>
          </section>

          {/* ── Coluna direita — Histórico (order-2 em mobile) ── */}
          <aside className="order-2 lg:order-3">
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:sticky lg:top-24"
            >
              <h3 className="text-sm font-bold text-[#1B4332] mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#2D6A4F]" />
                Histórico recente
              </h3>

              {atividades.length === 0 ? (
                <p className="text-[#718096] text-sm text-center py-4">
                  Nenhuma atividade ainda. Gere sua primeira! ✨
                </p>
              ) : (
                <>
                  <div className="flex flex-col gap-3">
                    {atividades.slice(0, 5).map((at, i) => {
                      console.log('Item histórico:', at)
                      const atId = String(at.id ?? at._id ?? i)
                      return (
                        <div
                          key={atId}
                          className="flex flex-col gap-2 pb-3 border-b border-gray-50 last:border-0 last:pb-0"
                        >
                          {/* Título e área */}
                          <div>
                            <button
                              onClick={() => setAtividadeModal(at)}
                              className="text-xs font-medium text-gray-700 leading-snug line-clamp-2 text-left hover:text-[#1B4332] transition-colors block"
                            >
                              {at.titulo}
                            </button>
                            {(at.area_desenvolvimento ?? at.area) && (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F0F7F4] text-[#2D6A4F] mt-1 inline-block">
                                {at.area_desenvolvimento ?? at.area}
                              </span>
                            )}
                          </div>

                          {/* Ações */}
                          <div className="flex gap-1.5 flex-wrap">
                            <button
                              onClick={() => handleRepetir(at)}
                              className="flex items-center gap-1 text-[10px] font-medium text-[#2D6A4F] bg-[#2D6A4F]/10 px-2.5 py-1 rounded-full hover:bg-[#2D6A4F]/20 transition-colors"
                            >
                              🔁 Repetir
                            </button>

                            <button
                              onClick={() => {
                                if (plano?.plano === 'gratuito') {
                                  setBloqueioAberto({
                                    funcionalidade: 'pdf',
                                    descricao: 'Baixe e compartilhe as atividades em PDF com professores e familiares.',
                                  })
                                } else {
                                  handlePDFHistorico(at)
                                }
                              }}
                              disabled={gerandoPDFId === atId}
                              className="flex items-center gap-1 text-[10px] font-medium text-[#1B4332] bg-[#1B4332]/10 px-2.5 py-1 rounded-full hover:bg-[#1B4332]/20 transition-colors disabled:opacity-50"
                            >
                              {gerandoPDFId === atId ? '⏳' : plano?.plano === 'gratuito' ? '🔒' : '📄'} PDF
                            </button>

                            {jaAvaliada(at) ? (
                              <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                ✓ Avaliada
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  if (plano?.plano === 'gratuito') {
                                    setBloqueioAberto({
                                      funcionalidade: 'avaliar',
                                      descricao: 'Registre como foi cada atividade e receba análises da IA para melhorar as próximas.',
                                    })
                                  } else {
                                    console.log('Abrindo avaliação para:', at)
                                    const raw = at as Record<string, any>
                                    setAtividadeParaAvaliar({
                                      ...at,
                                      id: raw.id ?? raw.atividadeId ?? raw.atividade_id ?? raw._id,
                                    })
                                    setModalAvaliacaoAberto(true)
                                  }
                                }}
                                className="flex items-center gap-1 text-[10px] font-medium text-[#92400E] bg-[#F59E0B]/15 px-2.5 py-1 rounded-full hover:bg-[#F59E0B]/25 transition-colors"
                              >
                                {plano?.plano === 'gratuito' ? '🔒' : '⭐'} Avaliar
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {atividades.length > 5 && (
                    <p className="text-xs text-center text-[#A0AEC0] mt-4">
                      +{atividades.length - 5} atividades no histórico
                    </p>
                  )}
                </>
              )}
            </motion.div>
          </aside>

        </div>

        {/* Seção de Evolução — full width, abaixo do grid */}
        {filho && (
          <SecaoEvolucao
            filhoId={filho.id ?? filho._id ?? ''}
            nomeFilho={nomeFilho}
            token={getToken() ?? ''}
            recarregar={recarregarEvolucao}
            onInsights={setEvolucaoInsights}
            plano={plano}
            onUpgradeSuccess={handleUpgradeSuccess}
          />
        )}
      </div>

      {/* Modal histórico */}
      <AnimatePresence>
        {atividadeModal && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ModalAtividade
              atividade={atividadeModal}
              onClose={() => setAtividadeModal(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de percepção */}
      {modalPercepcaoConfig && filho && (
        <ModalPercepcao
          aberto={!!modalPercepcaoConfig}
          onFechar={() => setModalPercepcaoConfig(null)}
          atividadeId={modalPercepcaoConfig.atividadeId}
          filhoId={filho.id ?? filho._id ?? ''}
          tituloAtividade={modalPercepcaoConfig.tituloAtividade}
          nomeFilho={nomeFilho}
          token={getToken() ?? ''}
          onSalvo={handlePercepcaoSalva}
        />
      )}

      {/* Modal — Gerar atividade */}
      <AtividadeModal
        aberto={modalAtividadeAberto}
        onFechar={() => setModalAtividadeAberto(false)}
        area={areas.find(a => a.id === selectedArea) ?? null}
        nomeFilho={nomeFilho}
        filhoId={filho?.id ?? filho?._id ?? ''}
        token={getToken() ?? ''}
        filho={filho}
        onAtividadeSalva={() => {
          const id = filho?.id ?? filho?._id
          if (id) recarregarAtividades(String(id))
        }}
        descricaoInicial={descricaoModal}
      />

      {/* Modal — Avaliar atividade */}
      <AvaliacaoModal
        aberto={modalAvaliacaoAberto}
        onFechar={() => {
          setModalAvaliacaoAberto(false)
          setAtividadeParaAvaliar(null)
        }}
        atividade={atividadeParaAvaliar ?? { id: 0, titulo: '' }}
        nomeFilho={nomeFilho}
        onAvaliada={() => {
          const id = filho?.id ?? filho?._id
          if (id) recarregarAtividades(String(id))
          if (atividadeParaAvaliar) {
            const atId = String(atividadeParaAvaliar.id ?? atividadeParaAvaliar._id ?? '')
            setAtividadesAvaliadas((prev: string[]) => prev.includes(atId) ? prev : [...prev, atId])
          }
          setModalAvaliacaoAberto(false)
          setAtividadeParaAvaliar(null)
        }}
      />

      {/* Modal — Bloqueio de plano */}
      <AnimatePresence>
        {bloqueioAberto && (
          <motion.div
            key="bloqueio-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setBloqueioAberto(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm"
            >
              <div className="relative">
                <button
                  onClick={() => setBloqueioAberto(null)}
                  className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-gray-600 z-10"
                  aria-label="Fechar"
                >
                  ✕
                </button>
                <BloqueioPlano
                  funcionalidade={bloqueioAberto.funcionalidade}
                  descricao={bloqueioAberto.descricao}
                  onUpgradeSuccess={handleUpgradeSuccess}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast — upgrade bem-sucedido */}
      <AnimatePresence>
        {toastUpgrade && (
          <motion.div
            key="toast-upgrade"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1B4332] text-white px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-2 whitespace-nowrap"
          >
            🎉 Bem-vindo ao Plano Família! Todas as funcionalidades estão liberadas.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
