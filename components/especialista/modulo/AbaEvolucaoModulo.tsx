'use client'

import { MODULOS_CONFIG } from '@/lib/modulos'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface SessaoResumo {
  humor?: string
  data?: string
}

interface DadosEvolucao {
  total_sessoes?: number
  habilidades_consolidadas?: number
  habilidades_em_desenvolvimento?: number
  habilidades?: Record<string, string>
  sessoes?: SessaoResumo[]
  relatorio_ia?: string
}

interface Props {
  dados: unknown
  modulo: string
  paciente: unknown
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_HABILIDADE: Record<string, { label: string; cor: string }> = {
  nao_avaliado:       { label: 'Não avaliado', cor: 'bg-gray-100 text-gray-500'        },
  emergente:          { label: 'Emergente',    cor: 'bg-red-100 text-red-700'           },
  em_desenvolvimento: { label: 'Em dev.',      cor: 'bg-yellow-100 text-yellow-700'    },
  consolidado:        { label: 'Consolidado',  cor: 'bg-green-100 text-green-700'      },
}

const humorEmoji: Record<string, string> = {
  otimo: '😄', bem: '🙂', regular: '😐', dificil: '😟',
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AbaEvolucaoModulo({ dados, modulo }: Props) {
  const config = MODULOS_CONFIG[modulo]
  const d = dados as DadosEvolucao | null

  if (!d) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3">📊</div>
        <p className="text-sm text-gray-500 font-medium mb-1">Nenhuma avaliação registrada</p>
        <p className="text-xs text-gray-400">
          Registre a avaliação inicial para começar a acompanhar a evolução
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Stats rápidos */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { valor: d.total_sessoes ?? 0,                  label: 'Sessões',      cor: 'text-[#1B4332]' },
          { valor: d.habilidades_consolidadas ?? 0,       label: 'Consolidadas', cor: 'text-[#1B4332]' },
          { valor: d.habilidades_em_desenvolvimento ?? 0, label: 'Em dev.',      cor: 'text-[#F59E0B]' },
        ].map(({ valor, label, cor }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <span className={`text-2xl font-bold block ${cor}`}>{valor}</span>
            <span className="text-xs text-gray-400 mt-1 block">{label}</span>
          </div>
        ))}
      </div>

      {/* Habilidades monitoradas */}
      {config && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Habilidades
          </h3>
          <div className="flex flex-col gap-3">
            {config.habilidades.map((hab) => {
              const statusAtual = d.habilidades?.[hab] ?? 'nao_avaliado'
              const statusCfg = STATUS_HABILIDADE[statusAtual] ?? STATUS_HABILIDADE.nao_avaliado
              const labelHab = hab
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase())

              return (
                <div key={hab} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-gray-700 flex-1">{labelHab}</span>
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusCfg.cor}`}>
                    {statusCfg.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Timeline de humor */}
      {(d.sessoes ?? []).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Humor por sessão
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {d.sessoes!.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1 shrink-0">
                <span className="text-2xl">
                  {s.humor ? (humorEmoji[s.humor] ?? '—') : '—'}
                </span>
                <span className="text-[10px] text-gray-400">
                  {s.data
                    ? new Date(s.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                    : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Relatório da IA */}
      {d.relatorio_ia && (
        <div className="rounded-2xl border-2 border-dashed border-[#F59E0B]/40 bg-[#F59E0B]/5 p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">✨</span>
              <div>
                <h3 className="text-sm font-semibold text-[#1B4332]">Rascunho de relatório</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Gerado pela IA com base nas suas anotações. Revise antes de usar.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-[#92400E] bg-[#F59E0B]/20 px-2 py-1 rounded-full shrink-0 border border-[#F59E0B]/30">
              Sugestão IA
            </span>
          </div>

          <div className="bg-white rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {d.relatorio_ia}
            </p>
          </div>

          <p className="text-[10px] text-gray-400 italic mb-4 leading-relaxed">
            ⚠️ Este rascunho foi gerado automaticamente a partir das suas anotações clínicas.
            Não substitui o julgamento profissional. O especialista é sempre o responsável pelo conteúdo final.
          </p>

          <div className="flex gap-2">
            <button className="flex-1 py-2.5 bg-[#1B4332] text-white rounded-xl text-xs font-semibold hover:bg-[#2D6A4F] transition-colors">
              ✏️ Editar e usar
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(d.relatorio_ia!)}
              className="px-4 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-xs font-medium hover:border-gray-300 transition-colors"
            >
              Copiar
            </button>
          </div>
        </div>
      )}

      {/* CTA gerar relatório se não existe */}
      {!d.relatorio_ia && (d.total_sessoes ?? 0) >= 3 && (
        <button className="w-full py-4 border-2 border-dashed border-[#F59E0B]/40 rounded-2xl text-sm font-medium text-[#92400E] hover:bg-[#F59E0B]/5 transition-colors">
          ✨ Gerar rascunho de relatório com IA
        </button>
      )}

    </div>
  )
}
