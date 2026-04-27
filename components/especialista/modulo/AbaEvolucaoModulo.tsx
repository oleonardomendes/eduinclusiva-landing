/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { MODULOS_CONFIG } from '@/lib/modulos'

// ─── Configs ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; cor: string }> = {
  emergente:          { label: 'Emergente',    cor: 'bg-red-100 text-red-700'       },
  em_desenvolvimento: { label: 'Em dev.',      cor: 'bg-yellow-100 text-yellow-700' },
  consolidado:        { label: 'Consolidado',  cor: 'bg-green-100 text-green-700'   },
  nao_avaliado:       { label: 'Não avaliado', cor: 'bg-gray-100 text-gray-400'     },
}

const TENDENCIA_CONFIG: Record<string, { label: string; emoji: string; cor: string }> = {
  melhorando:      { label: 'Melhorando', emoji: '↑', cor: 'text-green-600' },
  estavel:         { label: 'Estável',    emoji: '→', cor: 'text-gray-400'  },
  precisa_atencao: { label: 'Atenção',    emoji: '↓', cor: 'text-red-500'   },
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface HabilidadeData {
  atual: string | null
  historico: Array<{ data: string; valor: string }>
  tendencia: string
}

interface RelatorioIA {
  pontos_positivos: string[]
  areas_atencao: string[]
  sugestoes_sessao: string[]
  orientacoes_familia: string[]
  resumo: string
}

interface Props {
  dados: {
    total_sessoes?: number
    habilidades?: Record<string, HabilidadeData>
    relatorio_ia?: RelatorioIA | null
  } | null | undefined
  modulo: string
  paciente: any
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AbaEvolucaoModulo({ dados, modulo }: Props) {
  const config = MODULOS_CONFIG[modulo]

  if (!dados) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3">📊</div>
        <p className="text-sm text-gray-500 font-medium mb-1">Nenhuma avaliação registrada</p>
        <p className="text-xs text-gray-400">
          Registre a avaliação inicial para acompanhar a evolução
        </p>
      </div>
    )
  }

  const totalSessoes     = dados.total_sessoes ?? 0
  const habilidades      = dados.habilidades ?? {}
  const relatorioIA      = dados.relatorio_ia ?? null
  const listaHabilidades = config?.habilidades ?? []

  const habConsolidadas = Object.values(habilidades).filter(h => h?.atual === 'consolidado').length
  const habEmDev        = Object.values(habilidades).filter(h => h?.atual === 'em_desenvolvimento').length

  return (
    <div className="flex flex-col gap-4">

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
          <span className="text-2xl font-bold text-[#1B4332] block">{totalSessoes}</span>
          <span className="text-xs text-gray-400 mt-1 block">Sessões</span>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
          <span className="text-2xl font-bold text-green-600 block">{habConsolidadas}</span>
          <span className="text-xs text-gray-400 mt-1 block">Consolidadas</span>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
          <span className="text-2xl font-bold text-[#F59E0B] block">{habEmDev}</span>
          <span className="text-xs text-gray-400 mt-1 block">Em dev.</span>
        </div>
      </div>

      {/* Habilidades com status e tendência */}
      {listaHabilidades.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Habilidades
          </h3>
          <div className="flex flex-col gap-3">
            {listaHabilidades.map((hab) => {
              const dadosHab    = habilidades[hab]
              const statusAtual = dadosHab?.atual ?? 'nao_avaliado'
              const tendencia   = dadosHab?.tendencia ?? 'estavel'
              const statusCfg   = STATUS_CONFIG[statusAtual] ?? STATUS_CONFIG['nao_avaliado']
              const tendCfg     = TENDENCIA_CONFIG[tendencia] ?? TENDENCIA_CONFIG['estavel']
              const labelHab    = hab.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())

              return (
                <div key={hab} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-gray-700 flex-1 min-w-0 truncate">{labelHab}</span>
                  <span className={`text-sm font-bold shrink-0 ${tendCfg.cor}`} title={tendCfg.label}>
                    {tendCfg.emoji}
                  </span>
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusCfg.cor}`}>
                    {statusCfg.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Relatório IA */}
      {relatorioIA && (
        <div className="rounded-2xl border-2 border-dashed border-[#F59E0B]/40 bg-[#F59E0B]/5 p-5">

          {/* Header */}
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
            <span className="text-[10px] font-semibold text-[#92400E] bg-[#F59E0B]/20 px-2 py-1 rounded-full border border-[#F59E0B]/30 shrink-0">
              Sugestão IA
            </span>
          </div>

          {/* Resumo */}
          {relatorioIA.resumo && (
            <div className="bg-white rounded-xl p-4 mb-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Resumo</p>
              <p className="text-sm text-gray-700 leading-relaxed">{relatorioIA.resumo}</p>
            </div>
          )}

          {/* Pontos positivos */}
          {relatorioIA.pontos_positivos?.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wide mb-2">
                ✓ Pontos positivos
              </p>
              <ul className="flex flex-col gap-1.5">
                {relatorioIA.pontos_positivos.map((p, i) => (
                  <li key={i} className="flex gap-2 text-xs text-gray-600">
                    <span className="text-green-500 shrink-0">•</span>{p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Áreas de atenção */}
          {relatorioIA.areas_atencao?.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide mb-2">
                ⚠ Áreas de atenção
              </p>
              <ul className="flex flex-col gap-1.5">
                {relatorioIA.areas_atencao.map((p, i) => (
                  <li key={i} className="flex gap-2 text-xs text-gray-600">
                    <span className="text-amber-500 shrink-0">•</span>{p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sugestões para sessão */}
          {relatorioIA.sugestoes_sessao?.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide mb-2">
                💡 Sugestões para próxima sessão
              </p>
              <ul className="flex flex-col gap-1.5">
                {relatorioIA.sugestoes_sessao.map((p, i) => (
                  <li key={i} className="flex gap-2 text-xs text-gray-600">
                    <span className="text-blue-400 shrink-0">•</span>{p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Orientações para família */}
          {relatorioIA.orientacoes_familia?.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] font-semibold text-[#1B4332] uppercase tracking-wide mb-2">
                🏠 Orientações para a família
              </p>
              <ul className="flex flex-col gap-1.5">
                {relatorioIA.orientacoes_familia.map((p, i) => (
                  <li key={i} className="flex gap-2 text-xs text-gray-600">
                    <span className="text-[#2D6A4F] shrink-0">•</span>{p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-[10px] text-gray-400 italic mb-4 leading-relaxed">
            ⚠️ Rascunho automático gerado com base nas anotações clínicas.
            Não substitui o julgamento profissional.
          </p>

          {/* Ações */}
          <div className="flex gap-2">
            <button className="flex-1 py-2.5 bg-[#1B4332] text-white rounded-xl text-xs font-semibold hover:bg-[#2D6A4F] transition-colors">
              ✏️ Editar e usar
            </button>
            <button
              onClick={() => {
                const texto = [
                  relatorioIA.resumo,
                  '\nPontos positivos:',
                  ...(relatorioIA.pontos_positivos ?? []).map((p) => `• ${p}`),
                  '\nÁreas de atenção:',
                  ...(relatorioIA.areas_atencao ?? []).map((p) => `• ${p}`),
                  '\nSugestões:',
                  ...(relatorioIA.sugestoes_sessao ?? []).map((p) => `• ${p}`),
                  '\nOrientações para família:',
                  ...(relatorioIA.orientacoes_familia ?? []).map((p) => `• ${p}`),
                ].join('\n')
                navigator.clipboard.writeText(texto)
              }}
              className="px-4 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-xs hover:border-gray-300 transition-colors"
            >
              Copiar
            </button>
          </div>

        </div>
      )}

      {/* CTA gerar relatório */}
      {!relatorioIA && totalSessoes >= 1 && (
        <button className="w-full py-4 border-2 border-dashed border-[#F59E0B]/40 rounded-2xl text-sm font-medium text-[#92400E] hover:bg-[#F59E0B]/5 transition-colors">
          ✨ Gerar rascunho de relatório com IA
        </button>
      )}

      {/* Sem sessões ainda */}
      {!relatorioIA && totalSessoes === 0 && (
        <div className="text-center py-6 text-gray-400">
          <p className="text-xs">Registre sessões para gerar o relatório automático</p>
        </div>
      )}

    </div>
  )
}
