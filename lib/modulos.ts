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

export interface CampoSessaoConfig {
  campo: string
  label: string
  opcoes?: string[]
  tipo?: 'number'
  min?: number
  max?: number
}

export const CAMPOS_SESSAO_ESPECIALIDADE: Record<string, CampoSessaoConfig[]> = {
  psicomotricidade: [
    { campo: 'coordenacao_fina',   label: 'Coordenação Motora Fina',   opcoes: ['emergente', 'em_desenvolvimento', 'consolidado'] },
    { campo: 'coordenacao_grossa', label: 'Coordenação Motora Grossa', opcoes: ['emergente', 'em_desenvolvimento', 'consolidado'] },
    { campo: 'equilibrio',         label: 'Equilíbrio',                opcoes: ['emergente', 'em_desenvolvimento', 'consolidado'] },
    { campo: 'lateralidade',       label: 'Lateralidade',              opcoes: ['definida_direita', 'definida_esquerda', 'indefinida', 'cruzada'] },
    { campo: 'esquema_corporal',   label: 'Esquema Corporal',          opcoes: ['emergente', 'em_desenvolvimento', 'consolidado'] },
  ],
  psicopedagogia: [
    { campo: 'nivel_leitura',    label: 'Nível de Leitura', opcoes: ['pre_silabico', 'silabico', 'silabico_alfabetico', 'alfabetico', 'fluente'] },
    { campo: 'nivel_escrita',    label: 'Nível de Escrita', opcoes: ['pre_silabico', 'silabico', 'silabico_alfabetico', 'alfabetico', 'fluente'] },
    { campo: 'nivel_matematica', label: 'Matemática',       opcoes: ['emergente', 'em_desenvolvimento', 'consolidado'] },
  ],
  fono: [
    { campo: 'linguagem_expressiva', label: 'Linguagem Expressiva', opcoes: ['nao_verbal', 'sons', 'palavras_isoladas', 'duas_palavras', 'frases_simples', 'frases_complexas'] },
    { campo: 'linguagem_receptiva',  label: 'Linguagem Receptiva',  opcoes: ['minima', 'basica', 'adequada', 'boa'] },
    { campo: 'articulacao',          label: 'Articulação',          opcoes: ['muito_comprometida', 'comprometida', 'levemente_comprometida', 'adequada'] },
    { campo: 'vocabulario',          label: 'Vocabulário',          opcoes: ['muito_reduzido', 'reduzido', 'adequado', 'amplo'] },
    { campo: 'fluencia',             label: 'Fluência',             opcoes: ['muito_comprometida', 'comprometida', 'adequada'] },
    { campo: 'pragmatica',           label: 'Pragmática',           opcoes: ['muito_comprometida', 'comprometida', 'em_desenvolvimento', 'adequada'] },
  ],
  to: [
    { campo: 'alimentacao',          label: 'Alimentação',          opcoes: ['dependente', 'assistida', 'supervisao', 'independente'] },
    { campo: 'higiene',              label: 'Higiene Pessoal',      opcoes: ['dependente', 'assistida', 'supervisao', 'independente'] },
    { campo: 'vestir',               label: 'Vestir-se',            opcoes: ['dependente', 'assistida', 'supervisao', 'independente'] },
    { campo: 'brincar',              label: 'Habilidades de Jogo',  opcoes: ['nao_funcional', 'funcional_simples', 'simbolico', 'cooperativo'] },
    { campo: 'integracao_sensorial', label: 'Integração Sensorial', opcoes: ['muito_comprometida', 'comprometida', 'levemente_comprometida', 'adequada'] },
  ],
  psicologia: [
    { campo: 'regulacao_emocional', label: 'Regulação Emocional', opcoes: ['muito_comprometida', 'comprometida', 'em_desenvolvimento', 'adequada'] },
    { campo: 'habilidades_sociais', label: 'Habilidades Sociais', opcoes: ['muito_comprometida', 'comprometida', 'em_desenvolvimento', 'adequada'] },
    { campo: 'nivel_ansiedade',     label: 'Nível de Ansiedade',  opcoes: ['muito_alto', 'alto', 'moderado', 'baixo', 'minimo'] },
    { campo: 'humor_geral_sessao',  label: 'Humor Geral',         opcoes: ['muito_negativo', 'negativo', 'neutro', 'positivo', 'muito_positivo'] },
    { campo: 'autoestima',          label: 'Autoestima',          opcoes: ['muito_baixa', 'baixa', 'adequada', 'boa'] },
    { campo: 'qualidade_sono',      label: 'Qualidade do Sono',   opcoes: ['muito_ruim', 'ruim', 'regular', 'boa'] },
  ],
  aba: [
    { campo: 'nivel_verbal',       label: 'Nível Verbal',        opcoes: ['nao_verbal', 'ecoico', 'mando', 'tato', 'intraverbal', 'conversacional'] },
    { campo: 'imitacao',           label: 'Imitação',            opcoes: ['ausente', 'emergente', 'em_desenvolvimento', 'consolidada'] },
    { campo: 'contato_visual',     label: 'Contato Visual',      opcoes: ['ausente', 'minimo', 'ocasional', 'frequente', 'consistente'] },
    { campo: 'seguir_instrucoes',  label: 'Seguir Instruções',   opcoes: ['1_passo', '2_passos', '3_passos', 'complexas'] },
    { campo: 'habilidades_jogo',   label: 'Habilidades de Jogo', opcoes: ['solitario', 'paralelo', 'associativo', 'cooperativo'] },
    { campo: 'taxa_acerto_sessao', label: 'Taxa de Acerto (%)',  tipo: 'number', min: 0, max: 100 },
  ],
  nutricao: [
    { campo: 'estado_nutricional',      label: 'Estado Nutricional',      opcoes: ['desnutricao', 'abaixo_peso', 'adequado', 'sobrepeso', 'obesidade'] },
    { campo: 'seletividade_alimentar',  label: 'Seletividade Alimentar',  opcoes: ['severa', 'moderada', 'leve', 'sem_seletividade'] },
    { campo: 'comportamento_alimentar', label: 'Comportamento Alimentar', opcoes: ['muito_dificil', 'dificil', 'regular', 'adequado'] },
    { campo: 'hidratacao_sessao',       label: 'Hidratação',              opcoes: ['insuficiente', 'regular', 'adequada'] },
  ],
  fisioterapia: [
    { campo: 'tonus_muscular_ft',     label: 'Tônus Muscular',      opcoes: ['hipotonia_severa', 'hipotonia_moderada', 'hipotonia_leve', 'normal', 'hipertonia_leve', 'hipertonia_moderada', 'hipertonia_severa'] },
    { campo: 'forca_muscular',        label: 'Força Muscular',      opcoes: ['muito_reduzida', 'reduzida', 'adequada', 'boa'] },
    { campo: 'marcha',                label: 'Marcha',              opcoes: ['nao_deambula', 'com_auxilio_total', 'com_auxilio_parcial', 'independente_alterada', 'independente_adequada'] },
    { campo: 'equilibrio_estatico',   label: 'Equilíbrio Estático', opcoes: ['ausente', 'precario', 'regular', 'adequado'] },
    { campo: 'equilibrio_dinamico',   label: 'Equilíbrio Dinâmico', opcoes: ['ausente', 'precario', 'regular', 'adequado'] },
    { campo: 'coordenacao_motora_ft', label: 'Coordenação Motora',  opcoes: ['muito_comprometida', 'comprometida', 'levemente_comprometida', 'adequada'] },
    { campo: 'postura',               label: 'Postura',             opcoes: ['muito_comprometida', 'comprometida', 'levemente_comprometida', 'adequada'] },
  ],
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
