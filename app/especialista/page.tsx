'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, Search, Plus, ChevronLeft, Users, Send, ChevronDown, ChevronUp } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { getToken, getUser, clearAuth } from '@/lib/auth'
import {
  getPacientes, getSessoes, getPlanos, getEvolucaoPaciente, enviarPlanoFamilia,
} from '@/lib/api'
import ModalNovoPaciente from '@/components/especialista/ModalNovoPaciente'
import ModalSessao from '@/components/especialista/ModalSessao'
import ModalPlanoSemanal from '@/components/especialista/ModalPlanoSemanal'

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
}

interface Sessao {
  id: number
  especialidade?: string
  data_sessao?: string
  duracao_minutos?: number
  humor_inicio?: string
  atividades_realizadas?: string
  resposta_crianca?: string
  o_que_funcionou?: string
  o_que_nao_funcionou?: string
  observacoes_clinicas?: string
  foco_proxima_sessao?: string
  coordenacao_fina?: string
  coordenacao_grossa?: string
  equilibrio?: string
  lateralidade?: string
  esquema_corporal?: string
  nivel_leitura?: string
  nivel_escrita?: string
  nivel_matematica?: string
  habilidades_trabalhadas?: string[]
}

interface Tarefa {
  titulo: string
  descricao?: string
  duracao_minutos?: number
  area?: string
}

interface Plano {
  id: number
  semana_inicio?: string
  semana_fim?: string
  orientacoes_gerais?: string
  tarefas?: Tarefa[]
  enviado_familia?: boolean
  enviado_em?: string
}

interface EvolucaoIA {
  pontos_progresso?: string[]
  areas_atencao?: string[]
  sugestoes_proxima_sessao?: string[]
  orientacoes_familia?: string[]
  resumo_geral?: string
}

interface Evolucao {
  total_sessoes?: number
  relatorio_ia?: EvolucaoIA
  ultimas_sessoes?: { data?: string; especialidade?: string; resumo?: string }[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

const humorEmoji: Record<string, string> = { otimo: '😊', bem: '🙂', regular: '😐', dificil: '😔' }

function formatData(d?: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

// ─── Aba Perfil ───────────────────────────────────────────────────────────────

function AbaPerfil({ paciente }: { paciente: Paciente }) {
  const campo = (label: string, valor?: string | boolean | number | string[]) => {
    if (valor === undefined || valor === null || valor === '') return null
    const texto = Array.isArray(valor) ? valor.join(', ') : typeof valor === 'boolean' ? (valor ? 'Sim' : 'Não') : String(valor)
    return (
      <div>
        <p className="text-xs font-semibold text-[#718096] uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm text-[#1A1A1A]">{texto}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {campo('Condição', paciente.condicao)}
        {campo('Grau', paciente.grau)}
        {campo('Idade', paciente.idade)}
        {campo('Data de nascimento', paciente.data_nascimento ? formatData(paciente.data_nascimento) : undefined)}
        {campo('Estilo de aprendizagem', paciente.estilo_aprendizagem)}
        {campo('É verbal?', paciente.verbal)}
        {campo('Comunicação alternativa', paciente.comunicacao_alternativa)}
        {campo('Usa ABA?', paciente.usa_aba)}
        {campo('Terapias', paciente.terapias)}
        {campo('Escola', paciente.escola)}
        {campo('Série', paciente.serie)}
      </div>
      {(paciente.nome_responsavel || paciente.telefone_responsavel || paciente.email_responsavel) && (
        <div>
          <p className="text-sm font-bold text-[#1B4332] mb-3">Responsável</p>
          <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3">
            {campo('Nome', paciente.nome_responsavel)}
            {campo('Telefone', paciente.telefone_responsavel)}
            {campo('E-mail', paciente.email_responsavel)}
          </div>
        </div>
      )}
      {paciente.observacoes && (
        <div>
          <p className="text-xs font-semibold text-[#718096] uppercase tracking-wide mb-1">Observações</p>
          <p className="text-sm text-[#4A5568] leading-relaxed">{paciente.observacoes}</p>
        </div>
      )}
    </div>
  )
}

// ─── Aba Sessões ──────────────────────────────────────────────────────────────

function AbaSessoes({
  sessoes, carregando, onNovaSessao,
}: { sessoes: Sessao[] | null; carregando: boolean; onNovaSessao: () => void }) {
  const [expandida, setExpandida] = useState<number | null>(null)

  if (carregando) return <div className="flex justify-center py-12"><Spinner /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#718096]">{sessoes?.length ?? 0} sessão(ões) registrada(s)</p>
        <button onClick={onNovaSessao}
          className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[#1B4332] px-4 py-2 rounded-xl hover:bg-[#2D6A4F] transition-colors"
        >
          <Plus className="w-4 h-4" /> Registrar sessão
        </button>
      </div>

      {!sessoes || sessoes.length === 0 ? (
        <div className="text-center py-12 text-[#A0AEC0]">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium">Nenhuma sessão registrada ainda</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...sessoes].sort((a, b) => (b.data_sessao ?? '') > (a.data_sessao ?? '') ? 1 : -1).map((s) => (
            <div key={s.id} className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
              <button
                onClick={() => setExpandida(expandida === s.id ? null : s.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{humorEmoji[s.humor_inicio ?? ''] ?? '📋'}</span>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A1A]">{s.especialidade ?? 'Sessão'}</p>
                    <p className="text-xs text-[#718096]">{formatData(s.data_sessao)}{s.duracao_minutos ? ` · ${s.duracao_minutos} min` : ''}</p>
                  </div>
                </div>
                {expandida === s.id ? <ChevronUp className="w-4 h-4 text-[#718096]" /> : <ChevronDown className="w-4 h-4 text-[#718096]" />}
              </button>
              <AnimatePresence>
                {expandida === s.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-1 space-y-3 border-t border-gray-100">
                      {[
                        ['Atividades realizadas', s.atividades_realizadas],
                        ['Resposta da criança', s.resposta_crianca],
                        ['O que funcionou', s.o_que_funcionou],
                        ['O que não funcionou', s.o_que_nao_funcionou],
                        ['Observações clínicas', s.observacoes_clinicas],
                        ['Foco da próxima sessão', s.foco_proxima_sessao],
                      ].filter(([, v]) => !!v).map(([label, value]) => (
                        <div key={label}>
                          <p className="text-xs font-semibold text-[#718096] uppercase tracking-wide mb-0.5">{label}</p>
                          <p className="text-sm text-[#4A5568] leading-relaxed">{value}</p>
                        </div>
                      ))}
                      {/* Campos específicos psicomotricidade */}
                      {s.coordenacao_fina && (
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            ['Coord. fina', s.coordenacao_fina],
                            ['Coord. grossa', s.coordenacao_grossa],
                            ['Equilíbrio', s.equilibrio],
                            ['Lateralidade', s.lateralidade],
                            ['Esquema corporal', s.esquema_corporal],
                          ].filter(([, v]) => !!v).map(([l, v]) => (
                            <div key={l}>
                              <p className="text-xs text-[#718096]">{l}</p>
                              <p className="text-sm font-medium text-[#1A1A1A]">{v}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Campos específicos psicopedagogia */}
                      {s.nivel_leitura && (
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            ['Nível leitura', s.nivel_leitura],
                            ['Nível escrita', s.nivel_escrita],
                            ['Nível matemática', s.nivel_matematica],
                          ].filter(([, v]) => !!v).map(([l, v]) => (
                            <div key={l}>
                              <p className="text-xs text-[#718096]">{l}</p>
                              <p className="text-sm font-medium text-[#1A1A1A]">{v}</p>
                            </div>
                          ))}
                          {s.habilidades_trabalhadas && s.habilidades_trabalhadas.length > 0 && (
                            <div className="col-span-2">
                              <p className="text-xs text-[#718096] mb-1">Habilidades</p>
                              <div className="flex flex-wrap gap-1">
                                {s.habilidades_trabalhadas.map((h) => (
                                  <span key={h} className="text-xs bg-[#1B4332]/10 text-[#1B4332] px-2 py-0.5 rounded-full">{h}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Aba Planos ───────────────────────────────────────────────────────────────

function AbaPlanos({
  planos, carregando, onNovoPlano, onEnviar,
}: { planos: Plano[] | null; carregando: boolean; onNovoPlano: () => void; onEnviar: (id: number) => void }) {
  if (carregando) return <div className="flex justify-center py-12"><Spinner /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#718096]">{planos?.length ?? 0} plano(s) criado(s)</p>
        <button onClick={onNovoPlano}
          className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[#1B4332] px-4 py-2 rounded-xl hover:bg-[#2D6A4F] transition-colors"
        >
          <Plus className="w-4 h-4" /> Criar plano da semana
        </button>
      </div>

      {!planos || planos.length === 0 ? (
        <div className="text-center py-12 text-[#A0AEC0]">
          <p className="text-4xl mb-3">📅</p>
          <p className="font-medium">Nenhum plano criado ainda</p>
        </div>
      ) : (
        <div className="space-y-4">
          {planos.map((p) => (
            <div key={p.id} className="bg-gray-50 rounded-xl border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold text-[#1A1A1A] text-sm">
                    {p.semana_inicio && p.semana_fim
                      ? `${formatData(p.semana_inicio)} a ${formatData(p.semana_fim)}`
                      : 'Plano semanal'}
                  </p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${
                    p.enviado_familia ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {p.enviado_familia ? `✓ Enviado ${p.enviado_em ? formatData(p.enviado_em) : ''}` : 'Não enviado'}
                  </span>
                </div>
                {!p.enviado_familia && (
                  <button onClick={() => onEnviar(p.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#1B4332] bg-[#1B4332]/10 px-3 py-1.5 rounded-full hover:bg-[#1B4332]/20 transition-colors flex-shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" /> Enviar para família
                  </button>
                )}
              </div>
              {p.orientacoes_gerais && (
                <p className="text-xs text-[#4A5568] mb-3 leading-relaxed">{p.orientacoes_gerais}</p>
              )}
              {p.tarefas && p.tarefas.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[#718096] uppercase tracking-wide">Tarefas</p>
                  {p.tarefas.map((t, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#1B4332] text-white text-[10px] flex items-center justify-center flex-shrink-0 font-bold mt-0.5">{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-[#1A1A1A]">{t.titulo}</p>
                        {t.descricao && <p className="text-xs text-[#718096] mt-0.5">{t.descricao}</p>}
                        {(t.area || t.duracao_minutos) && (
                          <div className="flex gap-2 mt-1">
                            {t.area && <span className="text-[10px] bg-[#F0F7F4] text-[#2D6A4F] px-2 py-0.5 rounded-full">{t.area}</span>}
                            {t.duracao_minutos && <span className="text-[10px] text-[#718096]">{t.duracao_minutos} min</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Aba Evolução ─────────────────────────────────────────────────────────────

function AbaEvolucao({ evolucao, carregando }: { evolucao: Evolucao | null; carregando: boolean }) {
  if (carregando) return <div className="flex justify-center py-12"><Spinner /></div>

  if (!evolucao) return (
    <div className="text-center py-12 text-[#A0AEC0]">
      <p className="text-4xl mb-3">📊</p>
      <p className="font-medium">Nenhum dado de evolução disponível</p>
    </div>
  )

  const ia = evolucao.relatorio_ia

  return (
    <div className="space-y-5">
      {/* Total de sessões */}
      <div className="bg-[#1B4332] rounded-2xl p-4 text-center">
        <p className="text-3xl font-bold text-white">{evolucao.total_sessoes ?? 0}</p>
        <p className="text-sm text-white/70 mt-1">Sessões registradas</p>
      </div>

      {ia ? (
        <>
          {/* Resumo geral */}
          {ia.resumo_geral && (
            <div className="bg-[#1B4332] rounded-2xl p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/60 mb-2">Resumo geral</p>
              <p className="text-sm leading-relaxed">{ia.resumo_geral}</p>
            </div>
          )}

          {/* Pontos de progresso */}
          {ia.pontos_progresso && ia.pontos_progresso.length > 0 && (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-3">✅ Pontos de progresso</p>
              <ul className="space-y-1.5">
                {ia.pontos_progresso.map((p, i) => (
                  <li key={i} className="flex gap-2 text-sm text-green-800">
                    <span className="text-green-400 shrink-0 mt-0.5">•</span>{p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Áreas de atenção */}
          {ia.areas_atencao && ia.areas_atencao.length > 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3">⚠️ Áreas de atenção</p>
              <ul className="space-y-1.5">
                {ia.areas_atencao.map((a, i) => (
                  <li key={i} className="flex gap-2 text-sm text-amber-800">
                    <span className="text-amber-400 shrink-0 mt-0.5">•</span>{a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sugestões para próxima sessão */}
          {ia.sugestoes_proxima_sessao && ia.sugestoes_proxima_sessao.length > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3">💡 Sugestões para próxima sessão</p>
              <ul className="space-y-1.5">
                {ia.sugestoes_proxima_sessao.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm text-blue-800">
                    <span className="text-blue-400 shrink-0 mt-0.5">•</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Orientações para família */}
          {ia.orientacoes_familia && ia.orientacoes_familia.length > 0 && (
            <div className="bg-[#E8F4EE] border border-[#A7F3D0] rounded-2xl p-4">
              <p className="text-xs font-semibold text-[#065F46] uppercase tracking-wide mb-3">🏠 Orientações para família</p>
              <ul className="space-y-1.5">
                {ia.orientacoes_familia.map((o, i) => (
                  <li key={i} className="flex gap-2 text-sm text-[#065F46]">
                    <span className="text-[#2D6A4F] shrink-0 mt-0.5">•</span>{o}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <div className="bg-gray-50 rounded-xl p-4 text-center text-sm text-[#718096]">
          Relatório de IA será gerado após mais sessões registradas.
        </div>
      )}

      {/* Últimas sessões resumidas */}
      {evolucao.ultimas_sessoes && evolucao.ultimas_sessoes.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#718096] uppercase tracking-wide mb-3">Últimas sessões</p>
          <div className="space-y-2">
            {evolucao.ultimas_sessoes.map((s, i) => (
              <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3">
                <span className="text-xs text-[#A0AEC0] flex-shrink-0 mt-0.5">{formatData(s.data)}</span>
                <div className="min-w-0">
                  {s.especialidade && <p className="text-xs font-semibold text-[#1B4332]">{s.especialidade}</p>}
                  {s.resumo && <p className="text-xs text-[#718096] leading-relaxed line-clamp-2">{s.resumo}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function EspecialistaPage() {
  const router = useRouter()
  const [user, setUser] = useState<Record<string, unknown> | null>(null)
  const [carregandoPacientes, setCarregandoPacientes] = useState(true)
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [busca, setBusca] = useState('')

  // Mobile: 'lista' ou 'detalhes'
  const [mobileView, setMobileView] = useState<'lista' | 'detalhes'>('lista')

  // Tabs
  const [aba, setAba] = useState<'perfil' | 'sessoes' | 'planos' | 'evolucao'>('perfil')

  // Dados das abas (carregados sob demanda)
  const [sessoes, setSessoes] = useState<Sessao[] | null>(null)
  const [planos, setPlanos] = useState<Plano[] | null>(null)
  const [evolucao, setEvolucao] = useState<Evolucao | null>(null)
  const [carregandoSessoes, setCarregandoSessoes] = useState(false)
  const [carregandoPlanos, setCarregandoPlanos] = useState(false)
  const [carregandoEvolucao, setCarregandoEvolucao] = useState(false)

  // Modais
  const [modalPaciente, setModalPaciente] = useState(false)
  const [modalSessao, setModalSessao] = useState(false)
  const [modalPlano, setModalPlano] = useState(false)

  // Toast
  const [toast, setToast] = useState('')

  // ── Carregar dados ao montar ──────────────────────────────────────────────
  useEffect(() => {
    const token = getToken()
    if (!token) { router.push('/login'); return }

    const u = getUser()
    if (u) {
      if (u.papel !== 'especialista') { router.push('/login'); return }
      setUser(u)
    }

    const carregar = async () => {
      try {
        const data = await getPacientes(token)
        const lista = Array.isArray(data) ? data : data?.pacientes ?? []
        setPacientes(lista)
      } catch {
        // silencia
      } finally {
        setCarregandoPacientes(false)
      }
    }
    carregar()
  }, [])

  // ── Selecionar paciente ───────────────────────────────────────────────────
  const selecionarPaciente = (p: Paciente) => {
    setPaciente(p)
    setAba('perfil')
    setSessoes(null)
    setPlanos(null)
    setEvolucao(null)
    setMobileView('detalhes')
  }

  // ── Carregar aba ──────────────────────────────────────────────────────────
  const trocarAba = async (novaAba: 'perfil' | 'sessoes' | 'planos' | 'evolucao') => {
    setAba(novaAba)
    const token = getToken()
    if (!token || !paciente) return

    if (novaAba === 'sessoes' && sessoes === null) {
      setCarregandoSessoes(true)
      try {
        const data = await getSessoes(paciente.id, token)
        setSessoes(Array.isArray(data) ? data : data?.sessoes ?? [])
      } catch { setSessoes([]) } finally { setCarregandoSessoes(false) }
    }
    if (novaAba === 'planos' && planos === null) {
      setCarregandoPlanos(true)
      try {
        const data = await getPlanos(paciente.id, token)
        setPlanos(Array.isArray(data) ? data : data?.planos ?? [])
      } catch { setPlanos([]) } finally { setCarregandoPlanos(false) }
    }
    if (novaAba === 'evolucao' && evolucao === null) {
      setCarregandoEvolucao(true)
      try {
        const data = await getEvolucaoPaciente(paciente.id, token)
        setEvolucao(data as Evolucao)
      } catch { setEvolucao(null) } finally { setCarregandoEvolucao(false) }
    }
  }

  // ── Recarregar sessões ────────────────────────────────────────────────────
  const recarregarSessoes = async () => {
    const token = getToken()
    if (!token || !paciente) return
    setCarregandoSessoes(true)
    try {
      const data = await getSessoes(paciente.id, token)
      setSessoes(Array.isArray(data) ? data : data?.sessoes ?? [])
    } catch { setSessoes([]) } finally { setCarregandoSessoes(false) }
  }

  // ── Recarregar planos ─────────────────────────────────────────────────────
  const recarregarPlanos = async () => {
    const token = getToken()
    if (!token || !paciente) return
    setCarregandoPlanos(true)
    try {
      const data = await getPlanos(paciente.id, token)
      setPlanos(Array.isArray(data) ? data : data?.planos ?? [])
    } catch { setPlanos([]) } finally { setCarregandoPlanos(false) }
  }

  // ── Enviar plano para família ─────────────────────────────────────────────
  const handleEnviarPlano = async (planoId: number) => {
    const token = getToken()
    if (!token) return
    try {
      await enviarPlanoFamilia(planoId, token)
      setPlanos((prev) => prev?.map((p) => p.id === planoId ? { ...p, enviado_familia: true } : p) ?? null)
      mostrarToast('Plano enviado para a família com sucesso!')
    } catch {
      mostrarToast('Não foi possível enviar o plano. Tente novamente.')
    }
  }

  const mostrarToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleSair = () => {
    clearAuth()
    router.push('/')
  }

  const pacientesFiltrados = pacientes.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  )

  const nomeEspecialista = (user?.nome as string) || (user?.email as string)?.split('@')[0] || 'Especialista'

  const tabs = [
    { id: 'perfil', label: 'Perfil' },
    { id: 'sessoes', label: 'Sessões' },
    { id: 'planos', label: 'Plano Semanal' },
    { id: 'evolucao', label: 'Evolução' },
  ] as const

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Header */}
      <header className="bg-[#1B4332] sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12 h-16 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Logo size="md" theme="dark" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[#2D6A4F] flex items-center justify-center text-white text-sm font-bold">
                {nomeEspecialista[0]?.toUpperCase()}
              </span>
              <span className="text-[#A7F3D0] text-sm font-medium">{nomeEspecialista}</span>
            </div>
            <button onClick={handleSair}
              className="flex items-center gap-1.5 text-[#FDFBF7]/80 hover:text-[#FDFBF7] text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12 py-6">
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_2fr] gap-6">

          {/* ── Coluna esquerda — Lista de pacientes ─────────────────── */}
          <aside className={`${mobileView === 'detalhes' ? 'hidden lg:block' : 'block'}`}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Cabeçalho */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-lora font-bold text-xl text-[#1B4332] flex items-center gap-2">
                    <Users className="w-5 h-5" /> Meus Pacientes
                  </h2>
                  <button onClick={() => setModalPaciente(true)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[#1B4332] px-3 py-2 rounded-xl hover:bg-[#2D6A4F] transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Novo
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
                  <input
                    type="text" value={busca} onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar por nome..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1A1A1A] bg-[#FDFBF7] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent transition-all placeholder:text-[#A0AEC0]"
                  />
                </div>
              </div>

              {/* Lista */}
              <div className="overflow-y-auto max-h-[calc(100vh-220px)]">
                {carregandoPacientes ? (
                  <div className="flex justify-center py-12"><Spinner /></div>
                ) : pacientesFiltrados.length === 0 ? (
                  <div className="text-center py-12 px-6">
                    <p className="text-4xl mb-3">👤</p>
                    <p className="font-medium text-[#4A5568] mb-1">
                      {busca ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado ainda'}
                    </p>
                    {!busca && (
                      <p className="text-sm text-[#A0AEC0]">
                        Clique em "+ Novo" para começar.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {pacientesFiltrados.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => selecionarPaciente(p)}
                        className={`w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors ${
                          paciente?.id === p.id ? 'bg-[#F0F7F4] border-l-4 border-[#1B4332]' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#D1FAE5] flex items-center justify-center text-lg flex-shrink-0">
                            👦
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#1A1A1A] text-sm">{p.nome}</p>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {p.condicao && (
                                <span className="text-[10px] bg-[#F5F0E8] text-[#92400E] px-2 py-0.5 rounded-full font-medium">
                                  {p.condicao}
                                </span>
                              )}
                              {p.grau && p.grau !== 'Não definido' && (
                                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                                  {p.grau}
                                </span>
                              )}
                              {p.idade && (
                                <span className="text-[10px] bg-[#F0F7F4] text-[#2D6A4F] px-2 py-0.5 rounded-full font-medium">
                                  {p.idade} anos
                                </span>
                              )}
                            </div>
                            {p.ultima_sessao && (
                              <p className="text-[10px] text-[#A0AEC0] mt-1">
                                Última sessão: {formatData(p.ultima_sessao)}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* ── Coluna direita — Detalhes do paciente ─────────────────── */}
          <section className={`${mobileView === 'lista' ? 'hidden lg:block' : 'block'}`}>
            {!paciente ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-64 flex items-center justify-center">
                <div className="text-center text-[#A0AEC0]">
                  <ChevronLeft className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-medium">Selecione um paciente para ver os detalhes</p>
                </div>
              </div>
            ) : (
              <motion.div
                key={paciente.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Cabeçalho do paciente */}
                <div className="bg-[#1B4332] px-6 py-5">
                  <div className="flex items-center gap-3 mb-1">
                    {/* Botão voltar (mobile) */}
                    <button
                      onClick={() => setMobileView('lista')}
                      className="lg:hidden p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 text-white" />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-[#2D6A4F] flex items-center justify-center text-xl flex-shrink-0">
                      👦
                    </div>
                    <div>
                      <h2 className="font-lora font-bold text-xl text-white">{paciente.nome}</h2>
                      <p className="text-[#A7F3D0] text-sm">
                        {[paciente.condicao, paciente.grau !== 'Não definido' ? paciente.grau : null]
                          .filter(Boolean).join(' · ') || 'Sem diagnóstico informado'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Abas */}
                <div className="border-b border-gray-100 px-6 overflow-x-auto">
                  <div className="flex gap-0 min-w-max">
                    {tabs.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => trocarAba(t.id)}
                        className={`px-4 py-3.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                          aba === t.id
                            ? 'border-[#1B4332] text-[#1B4332]'
                            : 'border-transparent text-[#718096] hover:text-[#4A5568]'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conteúdo da aba */}
                <div className="p-6 overflow-y-auto max-h-[calc(100vh-320px)]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={aba}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {aba === 'perfil' && <AbaPerfil paciente={paciente} />}
                      {aba === 'sessoes' && (
                        <AbaSessoes
                          sessoes={sessoes}
                          carregando={carregandoSessoes}
                          onNovaSessao={() => setModalSessao(true)}
                        />
                      )}
                      {aba === 'planos' && (
                        <AbaPlanos
                          planos={planos}
                          carregando={carregandoPlanos}
                          onNovoPlano={() => setModalPlano(true)}
                          onEnviar={handleEnviarPlano}
                        />
                      )}
                      {aba === 'evolucao' && (
                        <AbaEvolucao evolucao={evolucao} carregando={carregandoEvolucao} />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </section>
        </div>
      </div>

      {/* Modal — Novo Paciente */}
      <ModalNovoPaciente
        aberto={modalPaciente}
        onFechar={() => setModalPaciente(false)}
        onCriado={async () => {
          setModalPaciente(false)
          const token = getToken()
          if (!token) return
          try {
            const data = await getPacientes(token)
            setPacientes(Array.isArray(data) ? data : data?.pacientes ?? [])
          } catch { }
          mostrarToast('Paciente cadastrado com sucesso!')
        }}
      />

      {/* Modal — Registrar Sessão */}
      {paciente && (
        <ModalSessao
          aberto={modalSessao}
          onFechar={() => setModalSessao(false)}
          pacienteId={paciente.id}
          onSalvo={() => {
            setModalSessao(false)
            recarregarSessoes()
            mostrarToast('Sessão registrada com sucesso!')
          }}
        />
      )}

      {/* Modal — Plano Semanal */}
      {paciente && (
        <ModalPlanoSemanal
          aberto={modalPlano}
          onFechar={() => setModalPlano(false)}
          pacienteId={paciente.id}
          onCriado={() => {
            setModalPlano(false)
            recarregarPlanos()
            mostrarToast('Plano semanal criado com sucesso!')
          }}
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
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1B4332] text-white px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-2 whitespace-nowrap"
          >
            ✓ {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
