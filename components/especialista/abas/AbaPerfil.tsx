'use client'

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
}

interface Props {
  paciente: Paciente
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatData(d?: string) {
  if (!d) return undefined
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function Campo({ label, valor }: { label: string; valor?: string | boolean | number | string[] | null }) {
  if (valor === undefined || valor === null || valor === '') return null
  const texto = Array.isArray(valor)
    ? valor.join(', ')
    : typeof valor === 'boolean'
    ? (valor ? 'Sim' : 'Não')
    : String(valor)
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-gray-800">{texto}</p>
    </div>
  )
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AbaPerfil({ paciente }: Props) {
  return (
    <div className="flex flex-col gap-4">

      {/* Card: Perfil clínico */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Perfil clínico</h3>
        <div className="grid grid-cols-2 gap-4">
          <Campo label="Condição" valor={paciente.condicao} />
          <Campo label="Grau" valor={paciente.grau} />
          <Campo label="Idade" valor={paciente.idade ? `${paciente.idade} anos` : undefined} />
          <Campo label="Nascimento" valor={formatData(paciente.data_nascimento)} />
          <Campo label="Estilo de aprendizagem" valor={paciente.estilo_aprendizagem} />
          <Campo label="É verbal?" valor={paciente.verbal !== undefined ? paciente.verbal : undefined} />
          <Campo label="Comunicação alternativa" valor={paciente.comunicacao_alternativa !== undefined ? paciente.comunicacao_alternativa : undefined} />
          <Campo label="Usa ABA?" valor={paciente.usa_aba !== undefined ? paciente.usa_aba : undefined} />
          <Campo label="Terapias" valor={paciente.terapias} />
        </div>
      </div>

      {/* Card: Escola */}
      {(paciente.escola || paciente.serie) && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Escola</h3>
          <div className="grid grid-cols-2 gap-4">
            <Campo label="Escola" valor={paciente.escola} />
            <Campo label="Série" valor={paciente.serie} />
          </div>
        </div>
      )}

      {/* Card: Responsável */}
      {(paciente.nome_responsavel || paciente.telefone_responsavel || paciente.email_responsavel) && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Responsável</h3>
          <div className="grid grid-cols-2 gap-4">
            <Campo label="Nome" valor={paciente.nome_responsavel} />
            <Campo label="Telefone" valor={paciente.telefone_responsavel} />
            <Campo label="E-mail" valor={paciente.email_responsavel} />
          </div>
        </div>
      )}

      {/* Card: Observações clínicas */}
      {paciente.observacoes && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Observações clínicas</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{paciente.observacoes}</p>
        </div>
      )}

    </div>
  )
}
