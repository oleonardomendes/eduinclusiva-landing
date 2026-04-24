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

function formatData(d?: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AbaPerfil({ paciente }: Props) {
  const campo = (label: string, valor?: string | boolean | number | string[]) => {
    if (valor === undefined || valor === null || valor === '') return null
    const texto = Array.isArray(valor)
      ? valor.join(', ')
      : typeof valor === 'boolean'
      ? (valor ? 'Sim' : 'Não')
      : String(valor)
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
