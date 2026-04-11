'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, Clock, Sparkles, BookOpen, X, ClipboardList } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { api } from '@/lib/api'
import { getToken, getUser, clearAuth } from '@/lib/auth'
import ModalPercepcao from '@/components/familia/ModalPercepcao'
import SecaoEvolucao from '@/components/familia/SecaoEvolucao'

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

const duracoes = ['15min', '20min', '30min']

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
  const [situacao, setSituacao] = useState('')
  const [duracao, setDuracao] = useState('20min')

  const [generating, setGenerating] = useState(false)
  const [slowNetwork, setSlowNetwork] = useState(false)
  const [atividadeGerada, setAtividadeGerada] = useState<Atividade | null>(null)

  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [atividadeModal, setAtividadeModal] = useState<Atividade | null>(null)

  const [modalPercepcaoConfig, setModalPercepcaoConfig] = useState<{
    atividadeId: string | number
    tituloAtividade: string
  } | null>(null)

  const [gerarErro, setGerarErro] = useState('')

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

      } catch (err) {
        console.error('Erro ao carregar dados:', err)
        router.push('/login')
      } finally {
        setCarregando(false)
      }
    }

    carregarDados()
  }, [])

  // ── Gerar atividade ────────────────────────────────────────────────────────
  const handleGerar = async () => {
    const token = getToken()
    // Usa o estado React — mais confiável que localStorage para o ID do filho
    const filhoId = filho?.id ?? filho?._id

    console.log('Token:', token)
    console.log('Filho ID:', filhoId)
    console.log('Area:', selectedArea)

    if (!token) {
      setGerarErro('Sessão expirada. Faça login novamente.')
      router.push('/login')
      return
    }
    if (!filhoId) {
      setGerarErro('Perfil do filho não encontrado. Complete o cadastro.')
      return
    }
    if (!selectedArea) return

    setGerarErro('')
    setAtividadeGerada(null)
    setGenerating(true)
    const slowTimer = setTimeout(() => setSlowNetwork(true), 5000)

    try {
      const areaLabel = areas.find((a) => a.id === selectedArea)?.label ?? selectedArea
      const body = {
        area: areaLabel,
        descricao_situacao: situacao.trim(), // string vazia em vez de undefined
        duracao_minutos: Number(duracao.replace(/\D/g, '')), // "20min" → 20
      }
      console.log('Body geração:', body)

      const resultado = await api.post(
        `/v1/familia/filhos/${filhoId}/gerar-atividade`,
        body,
        token
      )

      console.log('Resposta:', resultado)

      // Backend pode retornar { atividade: {...} } ou o objeto direto
      // Parsear campos que chegam como JSON string
      const atividadeRaw = resultado?.atividade ?? resultado
      setAtividadeGerada(normalizarAtividade(atividadeRaw))
      recarregarAtividades(String(filhoId))
    } catch (err: unknown) {
      console.error('Erro ao gerar atividade:', err)

      // detail pode ser string (FastAPI) ou array de erros Pydantic [{ msg, loc, type }]
      const e = err as { message?: string; detail?: string | Array<{ msg: string }> }
      let mensagem: string
      if (Array.isArray(e?.detail)) {
        mensagem = e.detail[0]?.msg ?? 'Erro de validação'
      } else if (typeof e?.detail === 'string') {
        mensagem = e.detail
      } else if (typeof e?.message === 'string') {
        mensagem = e.message
      } else {
        mensagem = 'Não foi possível gerar a atividade. Tente novamente.'
      }

      if (mensagem.toLowerCase().includes('not authenticated') || mensagem.toLowerCase().includes('credentials')) {
        setGerarErro('Sessão expirada. Faça login novamente.')
        router.push('/login')
      } else {
        setGerarErro(mensagem)
      }
    } finally {
      clearTimeout(slowTimer)
      setGenerating(false)
      setSlowNetwork(false)
    }
  }

  // ── Sair ───────────────────────────────────────────────────────────────────
  const handleSair = () => {
    clearAuth()
    localStorage.removeItem('edu_filho_id')
    localStorage.removeItem('edu_filho_data')
    router.push('/')
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

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-8">

        {/* Page title — full width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="font-lora font-bold text-3xl sm:text-4xl text-[#1A1A1A] mb-1">
            Olá, {nomeUsuario}! 👋
          </h1>
          <p className="text-[#4A5568] text-lg">
            Como podemos ajudar <strong className="text-[#1B4332]">{nomeFilho}</strong> hoje?
          </p>
        </motion.div>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row lg:gap-8 xl:gap-10 items-start">

          {/* ── Left sidebar ── */}
          <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0 space-y-4 lg:sticky lg:top-24">

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
                    <Link
                      href="/familia/questionario"
                      className="block text-center px-4 py-2.5 bg-[#1B4332] text-white text-sm font-semibold rounded-xl hover:bg-[#2D6A4F] transition-colors shadow-green"
                    >
                      Fazer questionário
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Histórico */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="font-lora font-bold text-xl text-[#1A1A1A] mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#2D6A4F]" />
                Histórico
              </h2>

              {atividades.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#F0EBE0] p-5 text-center">
                  <p className="text-[#718096] text-sm">Nenhuma atividade ainda. Gere sua primeira! ✨</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {atividades.map((at, i) => (
                    <div
                      key={at.id ?? at._id ?? i}
                      className="bg-white rounded-xl border border-[#F0EBE0] shadow-soft overflow-hidden"
                    >
                      <button
                        onClick={() => setAtividadeModal(at)}
                        className="w-full px-4 py-3 text-left hover:bg-[#F8FDFB] transition-colors"
                      >
                        <p className="font-medium text-[#1A1A1A] text-sm truncate">{at.titulo}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {(at.area_desenvolvimento ?? at.area) && (
                            <span className="text-xs text-[#2D6A4F] bg-[#F0F7F4] px-2 py-0.5 rounded-full">
                              {at.area_desenvolvimento ?? at.area}
                            </span>
                          )}
                          {(at.created_at ?? at.data) && (
                            <span className="text-xs text-[#A0AEC0] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(at.created_at ?? at.data ?? '').toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </button>
                      <div className="border-t border-[#F0EBE0] px-3 py-2">
                        <button
                          onClick={() =>
                            setModalPercepcaoConfig({
                              atividadeId: at.id ?? at._id ?? '',
                              tituloAtividade: at.titulo ?? 'Atividade',
                            })
                          }
                          className="text-xs font-medium text-[#2D6A4F] hover:text-[#1B4332] flex items-center gap-1 transition-colors"
                        >
                          <ClipboardList className="w-3 h-3" />
                          📝 Avaliar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </aside>

          {/* ── Right main area ── */}
          <section className="flex-1 min-w-0 mt-6 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="font-lora font-bold text-2xl text-[#1A1A1A] mb-1 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-[#F59E0B]" />
                Gerar atividade para {nomeFilho}
              </h2>
              <p className="text-[#718096] text-sm mb-5">Escolha uma área de desenvolvimento</p>

              {/* Grid de áreas 2×3 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {areas.map((area) => {
                  const isSelected = selectedArea === area.id
                  return (
                    <button
                      key={area.id}
                      onClick={() => {
                        setSelectedArea(isSelected ? null : area.id)
                        setAtividadeGerada(null)
                        setGerarErro('')
                      }}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 text-center font-medium text-sm ${
                        isSelected
                          ? 'border-[#1B4332] bg-[#F0F7F4] text-[#1B4332] shadow-green'
                          : 'border-[#E2E8F0] bg-white text-[#4A5568] hover:border-[#2D6A4F] hover:bg-[#F8FDFB]'
                      }`}
                    >
                      <span className="text-2xl">{area.emoji}</span>
                      <span className="leading-tight">{area.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Painel de geração */}
              <AnimatePresence>
                {selectedArea && (
                  <motion.div
                    key="painel-geracao"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-[#F8FBF9] rounded-2xl border border-[#E2E8F0] p-5 space-y-4 mt-1">
                      {/* Situação */}
                      <div>
                        <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                          Descreva a situação{' '}
                          <span className="text-[#A0AEC0] font-normal">(opcional)</span>
                        </label>
                        <textarea
                          value={situacao}
                          onChange={(e) => setSituacao(e.target.value)}
                          placeholder="Ex: Ele fica agitado quando precisa esperar..."
                          rows={2}
                          className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white text-[#1A1A1A] placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent transition-all resize-none text-sm"
                        />
                      </div>

                      {/* Duração */}
                      <div>
                        <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                          Duração
                        </label>
                        <div className="flex gap-2">
                          {duracoes.map((d) => (
                            <button
                              key={d}
                              onClick={() => setDuracao(d)}
                              className={`chip ${duracao === d ? 'selected' : ''}`}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Erro */}
                      {gerarErro && (
                        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
                          {gerarErro}
                        </div>
                      )}

                      {/* Aviso rede lenta */}
                      {slowNetwork && (
                        <div className="bg-amber-50 text-amber-700 text-sm px-4 py-3 rounded-xl border border-amber-100">
                          Aguarde, estamos acordando o servidor... (pode levar 30s)
                        </div>
                      )}

                      {/* Botão gerar */}
                      <button
                        onClick={handleGerar}
                        disabled={generating}
                        className="w-full flex items-center justify-center gap-2 bg-[#1B4332] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#2D6A4F] transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-green"
                      >
                        {generating ? (
                          <>
                            <Spinner className="h-4 w-4" />
                            Criando atividade personalizada para {nomeFilho}...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Gerar atividade
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Atividade gerada */}
              <AnimatePresence>
                {atividadeGerada && (
                  <motion.div
                    key="atividade-gerada"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-5 space-y-3"
                  >
                    <AtividadeCard atividade={atividadeGerada} />
                    <button
                      onClick={() =>
                        setModalPercepcaoConfig({
                          atividadeId: atividadeGerada.id ?? atividadeGerada._id ?? '',
                          tituloAtividade: atividadeGerada.titulo ?? 'Atividade',
                        })
                      }
                      className="w-full flex items-center justify-center gap-2 border-2 border-[#2D6A4F] text-[#2D6A4F] font-semibold px-6 py-3 rounded-xl hover:bg-[#F0F7F4] transition-colors"
                    >
                      <ClipboardList className="w-4 h-4" />
                      📝 Registrar como foi
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </section>

        </div>

        {/* Seção de Evolução — full width, abaixo do grid */}
        {filho && (
          <SecaoEvolucao
            filhoId={filho.id ?? filho._id ?? ''}
            nomeFilho={nomeFilho}
            token={getToken() ?? ''}
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
          onSalvo={() => setModalPercepcaoConfig(null)}
        />
      )}
    </div>
  )
}
