export const MODULOS_CONFIG: Record<string, {
  label: string
  emoji: string
  cor: string
  corIcone: string
  descricao: string
  habilidades: string[]
}> = {
  psicomotricidade: {
    label: 'Psicomotricidade',
    emoji: '🏃',
    cor: 'bg-blue-50 border-blue-200 text-blue-800',
    corIcone: 'bg-blue-100',
    descricao: 'Coordenação, equilíbrio, lateralidade',
    habilidades: ['coordenacao_fina', 'coordenacao_grossa', 'equilibrio', 'lateralidade', 'esquema_corporal'],
  },
  psicopedagogia: {
    label: 'Psicopedagogia',
    emoji: '📚',
    cor: 'bg-purple-50 border-purple-200 text-purple-800',
    corIcone: 'bg-purple-100',
    descricao: 'Leitura, escrita, matemática, atenção',
    habilidades: ['nivel_leitura', 'nivel_escrita', 'nivel_matematica', 'atencao', 'memoria', 'raciocinio_logico', 'linguagem_oral', 'compreensao', 'organizacao'],
  },
  fono: {
    label: 'Fonoaudiologia',
    emoji: '🗣️',
    cor: 'bg-green-50 border-green-200 text-green-800',
    corIcone: 'bg-green-100',
    descricao: 'Linguagem, articulação, comunicação',
    habilidades: ['linguagem_expressiva', 'linguagem_receptiva', 'articulacao', 'vocabulario', 'fluencia', 'pragmatica'],
  },
  to: {
    label: 'Terapia Ocupacional',
    emoji: '🤲',
    cor: 'bg-orange-50 border-orange-200 text-orange-800',
    corIcone: 'bg-orange-100',
    descricao: 'Autonomia, alimentação, sensorial',
    habilidades: ['alimentacao', 'higiene', 'vestir', 'mobilidade', 'brincar', 'integracao_sensorial'],
  },
  psicologia: {
    label: 'Psicologia',
    emoji: '🧠',
    cor: 'bg-pink-50 border-pink-200 text-pink-800',
    corIcone: 'bg-pink-100',
    descricao: 'Regulação emocional, ansiedade, sono',
    habilidades: ['regulacao_emocional', 'habilidades_sociais', 'nivel_ansiedade', 'humor_geral', 'autoestima', 'qualidade_sono'],
  },
  aba: {
    label: 'ABA',
    emoji: '🎯',
    cor: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    corIcone: 'bg-yellow-100',
    descricao: 'Comportamentos-alvo, reforçadores',
    habilidades: ['nivel_verbal', 'imitacao', 'contato_visual', 'seguir_instrucoes', 'habilidades_jogo'],
  },
  nutricao: {
    label: 'Nutrição',
    emoji: '🥗',
    cor: 'bg-lime-50 border-lime-200 text-lime-800',
    corIcone: 'bg-lime-100',
    descricao: 'Seletividade alimentar, IMC',
    habilidades: ['estado_nutricional', 'seletividade_alimentar', 'comportamento_alimentar', 'hidratacao'],
  },
  fisioterapia: {
    label: 'Fisioterapia',
    emoji: '💪',
    cor: 'bg-cyan-50 border-cyan-200 text-cyan-800',
    corIcone: 'bg-cyan-100',
    descricao: 'Tônus, marcha, equilíbrio, postura',
    habilidades: ['tonus_muscular', 'forca_muscular', 'marcha', 'equilibrio_estatico', 'equilibrio_dinamico', 'coordenacao_motora', 'postura'],
  },
}

export const especialidadeParaModulo: Record<string, string> = {
  'Psicomotricidade':    'psicomotricidade',
  'Psicopedagogia':      'psicopedagogia',
  'Fonoaudiologia':      'fono',
  'Terapia Ocupacional': 'to',
  'Psicologia':          'psicologia',
  'ABA':                 'aba',
  'Nutrição':            'nutricao',
  'Fisioterapia':        'fisioterapia',
}

export const TERAPIA_PARA_MODULO: Record<string, string> = {
  'Psicomotricidade':    'psicomotricidade',
  'Psicopedagogia':      'psicopedagogia',
  'Fonoaudiologia':      'fono',
  'Terapia Ocupacional': 'to',
  'Psicologia':          'psicologia',
  'ABA':                 'aba',
  'Nutrição':            'nutricao',
  'Fisioterapia':        'fisioterapia',
  'Fono':                'fono',
  'TO':                  'to',
}

export function parseTerapias(terapias: string | string[] | null | undefined): string[] {
  if (!terapias) return []

  if (Array.isArray(terapias)) {
    return terapias
      .map((t) => TERAPIA_PARA_MODULO[t] ?? t.toLowerCase())
      .filter((t) => t in MODULOS_CONFIG)
  }

  try {
    const arr = JSON.parse(terapias) as string[]
    return arr
      .map((t) => TERAPIA_PARA_MODULO[t] ?? t.toLowerCase())
      .filter((t) => t in MODULOS_CONFIG)
  } catch {
    return []
  }
}
