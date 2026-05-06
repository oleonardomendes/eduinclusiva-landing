'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { getPlanosPrescritos } from '@/lib/api'
import ModalRegistroTarefa from '@/components/familia/ModalRegistroTarefa'
import ModalDetalhesTarefa from '@/components/familia/ModalDetalhesTarefa'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Tarefa {
  titulo: string
  descricao?: string
  duracao_minutos?: number
  area?: string
}

interface RegistroTarefa {
  tarefa_index: number
  concluiu: boolean
  humor: string
  observacao?: string
}

interface EspecialidadePlano {
  especialidade: string
  cor: string
  especialista_nome: string
  plano_id: number
  tarefas: Tarefa[]
  orientacoes_gerais?: string
  registros: RegistroTarefa[]
  percentual_conclusao: number
}

interface SemanaAtual {
  inicio: string
  fim: string
}

interface SemanaAnterior {
  semana_inicio: string
  semana_fim: string
  por_especialidade: EspecialidadePlano[]
}

interface PlanosResponse {
  semana_atual: SemanaAtual
  por_especialidade: EspecialidadePlano[]
  semanas_anteriores: SemanaAnterior[]
}

interface Props {
  token: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const especialidadeEmoji: Record<string, string> = {
  psicomotricidade: '🧍',
  psicopedagogia: '📚',
  fono: '🗣️',
  fonoaudiologia: '🗣️',
  to: '🖐️',
  terapia_ocupacional: '🖐️',
  psicologia: '🧠',
  aba: '🎯',
  nutricao: '🥗',
  nutrição: '🥗',
  fisioterapia: '💪',
}

const especialidadeCor: Record<string, string> = {
  psicomotricidade: '#1B4332',
  psicopedagogia: '#2D6A4F',
  fono: '#065F4B',
  fonoaudiologia: '#065F4B',
  to: '#0F766E',
  terapia_ocupacional: '#0F766E',
  psicologia: '#6D28D9',
  aba: '#1E40AF',
  nutricao: '#92400E',
  nutrição: '#92400E',
  fisioterapia: '#991B1B',
}

const humorInfo: Record<string, { emoji: string; label: string }> = {
  otimo:   { emoji: '😊', label: 'Ótimo' },
  bem:     { emoji: '🙂', label: 'Bem' },
  regular: { emoji: '😐', label: 'Regular' },
  dificil: { emoji: '😔', label: 'Difícil' },
}

function getEmoji(esp: string) {
  return especialidadeEmoji[esp.toLowerCase()] ?? '🩺'
}

function getCor(esp: string, corApi?: string) {
  return corApi ?? especialidadeCor[esp.toLowerCase()] ?? '#1B4332'
}

function formatarNome(esp: string): string {
  return esp.charAt(0).toUpperCase() + esp.slice(1).replace(/_/g, ' ')
}

function formatData(d?: string) {
  if (!d) return '?'
  const parts = d.split('-')
  if (parts.length === 3) return `${parts[2]}/${parts[1]}`
  return d
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="h-16 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-2 bg-gray-100 rounded-full" />
        <div className="h-10 bg-gray-100 rounded-xl" />
        <div className="space-y-2">
          <div className="h-3 w-24 bg-gray-100 rounded" />
          <div className="h-12 bg-gray-50 rounded-xl" />
          <div className="h-12 bg-gray-50 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

// ─── Config dos modais (compartilhado) ───────────────────────────────────────

interface DetalhesConfig {
  tarefa: Tarefa
  especialidade: string
  especialistaNome: string
  planoId: number
  tarefaIndex: number
  registro?: RegistroTarefa
}

interface RegistroConfig {
  planoId: number
  tarefaIndex: number
  tarefaTitulo: string
  especialidade: string
  especialistaNome: string
}

// ─── Card de uma especialidade ────────────────────────────────────────────────

interface CardEspecialidadeProps {
  item: EspecialidadePlano
  semanaAtual: boolean
  onVerDetalhes: (config: DetalhesConfig) => void
  onRegistrar: (config: RegistroConfig) => void
}

function CardEspecialidade({ item, semanaAtual, onVerDetalhes, onRegistrar }: CardEspecialidadeProps) {
  const cor = getCor(item.especialidade, item.cor)
  const emoji = getEmoji(item.especialidade)
  const nome = formatarNome(item.especialidade)
  const pct = item.percentual_conclusao ?? 0
  const corBarra = pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444'

  // Converte array de registros em mapa tarefa_index → registro
  const registroMap: Record<number, RegistroTarefa> = {}
  for (const r of item.registros ?? []) {
    registroMap[r.tarefa_index] = r
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header colorido */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ backgroundColor: cor }}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <div>
            <p className="text-white font-bold text-sm uppercase tracking-wide">{nome}</p>
            <p className="text-white/70 text-xs">{item.especialista_nome}</p>
          </div>
        </div>
        <span className="text-white/90 text-xs font-semibold bg-white/20 px-2.5 py-1 rounded-full">
          {Math.round(pct)}% concluído
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Barra de progresso */}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: corBarra }}
          />
        </div>

        {/* Orientações gerais */}
        {item.orientacoes_gerais && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-2">
            <span className="text-base shrink-0">💡</span>
            <div>
              <p className="text-xs font-semibold text-blue-700 mb-0.5">Orientações da especialista</p>
              <p className="text-sm text-blue-800 leading-relaxed">{item.orientacoes_gerais}</p>
            </div>
          </div>
        )}

        {/* Lista de tarefas */}
        {(item.tarefas ?? []).length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Atividades da semana
            </p>
            {item.tarefas.map((tarefa, idx) => {
              const registro = registroMap[idx]
              const humor = registro ? humorInfo[registro.humor] : null

              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                    registro ? 'bg-[#F0F7F4]' : 'bg-gray-50'
                  }`}
                >
                  {/* Checkbox */}
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    registro ? 'bg-green-500' : 'border-2 border-gray-300'
                  }`}>
                    {registro && <span className="text-white text-[10px] font-bold">✓</span>}
                  </div>

                  {/* Conteúdo + botões */}
                  <div className="flex-1 min-w-0">
                    {/* Título e duração */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-medium leading-snug ${
                        registro ? 'text-gray-400 line-through' : 'text-[#1A1A1A]'
                      }`}>
                        {tarefa.titulo}
                      </p>
                      {tarefa.duracao_minutos && !registro && (
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {tarefa.duracao_minutos} min
                        </span>
                      )}
                    </div>

                    {/* Registro — humor + observação */}
                    {registro ? (
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {humor && (
                          <span className="text-xs text-gray-600">{humor.emoji} {humor.label}</span>
                        )}
                        {registro.observacao && (
                          <span className="text-xs text-gray-400 italic">
                            &ldquo;{registro.observacao}&rdquo;
                          </span>
                        )}
                      </div>
                    ) : (
                      /* Área badge para tarefas pendentes */
                      tarefa.area && (
                        <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full mt-1 inline-block">
                          {tarefa.area}
                        </span>
                      )
                    )}

                    {/* Botões de ação */}
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {registro ? (
                        /* Tarefa registrada: Ver detalhes */
                        <button
                          onClick={() =>
                            onVerDetalhes({
                              tarefa,
                              especialidade: item.especialidade,
                              especialistaNome: item.especialista_nome,
                              planoId: item.plano_id,
                              tarefaIndex: idx,
                              registro,
                            })
                          }
                          className="text-[10px] font-medium px-2.5 py-1 rounded-full border border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
                        >
                          Ver detalhes
                        </button>
                      ) : semanaAtual ? (
                        /* Tarefa pendente + semana atual: Ver instruções + Registrar */
                        <>
                          <button
                            onClick={() =>
                              onVerDetalhes({
                                tarefa,
                                especialidade: item.especialidade,
                                especialistaNome: item.especialista_nome,
                                planoId: item.plano_id,
                                tarefaIndex: idx,
                              })
                            }
                            className="text-[10px] font-medium px-2.5 py-1 rounded-full border border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
                          >
                            Ver instruções
                          </button>
                          <button
                            onClick={() =>
                              onRegistrar({
                                planoId: item.plano_id,
                                tarefaIndex: idx,
                                tarefaTitulo: tarefa.titulo,
                                especialidade: item.especialidade,
                                especialistaNome: item.especialista_nome,
                              })
                            }
                            className="text-[10px] font-semibold text-white px-2.5 py-1 rounded-full transition-colors whitespace-nowrap hover:opacity-90"
                            style={{ backgroundColor: cor }}
                          >
                            ✓ Registrar
                          </button>
                        </>
                      ) : (
                        /* Tarefa pendente + semana anterior: Ver instruções (sem registrar) */
                        <button
                          onClick={() =>
                            onVerDetalhes({
                              tarefa,
                              especialidade: item.especialidade,
                              especialistaNome: item.especialista_nome,
                              planoId: item.plano_id,
                              tarefaIndex: idx,
                            })
                          }
                          className="text-[10px] font-medium px-2.5 py-1 rounded-full border border-gray-300 text-gray-600 hover:border-gray-400 transition-colors"
                        >
                          Ver instruções
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function SecaoPlanosPrescritos({ token }: Props) {
  const [dados, setDados] = useState<PlanosResponse | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [reload, setReload] = useState(0)
  const [semanasAnterioresAberto, setSemanasAnterioresAberto] = useState(false)

  // Estado dos modais
  const [detalhesConfig, setDetalhesConfig] = useState<DetalhesConfig | null>(null)
  const [registroConfig, setRegistroConfig] = useState<RegistroConfig | null>(null)

  useEffect(() => {
    if (!token) return
    const carregar = async () => {
      setCarregando(true)
      try {
        const data = await getPlanosPrescritos(token)
        if (data && data.por_especialidade !== undefined) {
          setDados(data as PlanosResponse)
        } else {
          setDados(null)
        }
      } catch {
        setDados(null)
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [token, reload])

  const handleVerDetalhes = (config: DetalhesConfig) => {
    setDetalhesConfig(config)
  }

  const handleRegistrar = (config: RegistroConfig) => {
    setRegistroConfig(config)
  }

  // Chamado quando ModalDetalhesTarefa pede para abrir o registro
  const handleAbrirRegistroDeDetalhes = () => {
    if (!detalhesConfig) return
    setRegistroConfig({
      planoId: detalhesConfig.planoId,
      tarefaIndex: detalhesConfig.tarefaIndex,
      tarefaTitulo: detalhesConfig.tarefa.titulo,
      especialidade: detalhesConfig.especialidade,
      especialistaNome: detalhesConfig.especialistaNome,
    })
  }

  const handleRegistroSalvo = () => {
    setRegistroConfig(null)
    setDetalhesConfig(null)
    setReload((k) => k + 1)
  }

  const porEspecialidade = dados?.por_especialidade ?? []
  const semanaAtual = dados?.semana_atual
  const semanasAnteriores = dados?.semanas_anteriores ?? []

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-8"
        id="secao-planos-prescritos"
      >
        {/* Header da seção */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👩‍⚕️</span>
            <div>
              <h2 className="text-xl font-bold text-[#1B4332]">Plano da Semana</h2>
              {semanaAtual && !carregando && (
                <p className="text-sm text-gray-500">
                  Semana de {formatData(semanaAtual.inicio)} a {formatData(semanaAtual.fim)}
                </p>
              )}
            </div>
          </div>
          {porEspecialidade.length > 0 && (
            <span className="text-xs font-semibold bg-[#1B4332] text-white px-2.5 py-1 rounded-full shrink-0 mt-1">
              {porEspecialidade.length} especialidade{porEspecialidade.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Loading skeleton */}
        {carregando ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : porEspecialidade.length === 0 ? (
          /* Estado vazio */
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-gray-700 font-semibold mb-1">Nenhum plano prescrito esta semana.</p>
            <p className="text-gray-400 text-sm">Seu especialista ainda não enviou atividades.</p>
          </div>
        ) : (
          /* Cards por especialidade */
          <div className="grid gap-4 sm:grid-cols-2">
            {porEspecialidade.map((item) => (
              <CardEspecialidade
                key={`${item.plano_id}-${item.especialidade}`}
                item={item}
                semanaAtual={true}
                onVerDetalhes={handleVerDetalhes}
                onRegistrar={handleRegistrar}
              />
            ))}
          </div>
        )}

        {/* Semanas anteriores */}
        {!carregando && semanasAnteriores.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => setSemanasAnterioresAberto((v) => !v)}
              className="flex items-center gap-2 text-sm font-medium text-[#2D6A4F] hover:text-[#1B4332] transition-colors"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  semanasAnterioresAberto ? 'rotate-180' : ''
                }`}
              />
              {semanasAnterioresAberto ? 'Ocultar' : 'Ver'} semanas anteriores
            </button>

            <AnimatePresence>
              {semanasAnterioresAberto && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 space-y-6">
                    {semanasAnteriores.map((semana, si) => (
                      <div key={si}>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                          Semana de {formatData(semana.semana_inicio)} a {formatData(semana.semana_fim)}
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2 opacity-75">
                          {(semana.por_especialidade ?? []).map((item) => (
                            <CardEspecialidade
                              key={`${si}-${item.plano_id}-${item.especialidade}`}
                              item={item}
                              semanaAtual={false}
                              onVerDetalhes={handleVerDetalhes}
                              onRegistrar={handleRegistrar}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Modal de detalhes da tarefa */}
      {detalhesConfig && (
        <ModalDetalhesTarefa
          aberto={!!detalhesConfig}
          onFechar={() => setDetalhesConfig(null)}
          tarefa={detalhesConfig.tarefa}
          especialidade={detalhesConfig.especialidade}
          especialistaNome={detalhesConfig.especialistaNome}
          jaRegistrada={!!detalhesConfig.registro}
          registroExistente={detalhesConfig.registro}
          onAbrirRegistro={handleAbrirRegistroDeDetalhes}
        />
      )}

      {/* Modal de registro */}
      {registroConfig && (
        <ModalRegistroTarefa
          aberto={!!registroConfig}
          onFechar={() => setRegistroConfig(null)}
          planoId={registroConfig.planoId}
          tarefaIndex={registroConfig.tarefaIndex}
          tarefaTitulo={registroConfig.tarefaTitulo}
          especialidade={registroConfig.especialidade}
          especialistaNome={registroConfig.especialistaNome}
          token={token}
          onSalvo={handleRegistroSalvo}
        />
      )}
    </>
  )
}
