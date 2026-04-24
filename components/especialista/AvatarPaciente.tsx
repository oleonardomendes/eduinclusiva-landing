const cores = [
  'bg-[#1B4332] text-white',
  'bg-[#2D6A4F] text-white',
  'bg-[#F59E0B] text-white',
  'bg-blue-600 text-white',
  'bg-purple-600 text-white',
  'bg-rose-600 text-white',
]

const tamanhos = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
}

interface Props {
  nome: string
  size?: 'sm' | 'md' | 'lg'
}

export default function AvatarPaciente({ nome, size = 'md' }: Props) {
  const iniciais = nome
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()

  const cor = cores[nome.charCodeAt(0) % cores.length]

  return (
    <div className={`${tamanhos[size]} ${cor} rounded-full flex items-center justify-center font-bold shrink-0`}>
      {iniciais}
    </div>
  )
}
