'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { api } from '@/lib/api'
import { getToken, getUser } from '@/lib/auth'

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
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

const condicoes = [
  'Autismo (TEA)',
  'TDAH',
  'Dislexia',
  'Deficiência Intelectual',
  'Síndrome de Down',
  'Ansiedade',
  'Outra',
  'Prefiro não informar',
]

const graus = ['Leve', 'Moderado', 'Severo', 'Não sei']

const series = [
  'Educação Infantil',
  '1º Ano',
  '2º Ano',
  '3º Ano',
  '4º Ano',
  '5º Ano',
  '6º Ano',
  '7º Ano',
  '8º Ano',
  '9º Ano',
  'Ensino Médio',
]

const estilos = [
  { value: 'nao_sei', label: 'Não sei ainda' },
  { value: 'visual', label: 'Visual' },
  { value: 'auditivo', label: 'Auditivo' },
  { value: 'cinestesico', label: 'Cinestésico' },
  { value: 'misto', label: 'Misto' },
]

function Stepper() {
  return (
    <div className="flex items-center justify-center gap-2 mb-8 text-sm">
      <div className="flex items-center gap-1.5 text-[#2D6A4F] font-medium">
        <CheckCircle className="w-4 h-4" />
        <span>Conta criada</span>
      </div>
      <div className="h-px w-8 bg-[#E2E8F0]" />
      <div className="flex items-center gap-1.5 text-[#1B4332] font-semibold">
        <span className="w-5 h-5 rounded-full bg-[#1B4332] text-white text-xs flex items-center justify-center font-bold">2</span>
        <span>Perfil do filho</span>
      </div>
      <div className="h-px w-8 bg-[#E2E8F0]" />
      <div className="flex items-center gap-1.5 text-[#A0AEC0]">
        <span className="w-5 h-5 rounded-full border-2 border-[#E2E8F0] text-xs flex items-center justify-center font-bold text-[#A0AEC0]">3</span>
        <span>Pronto!</span>
      </div>
    </div>
  )
}

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white text-[#1A1A1A] placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent transition-all disabled:opacity-60'

const selectClass =
  'w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent transition-all disabled:opacity-60 appearance-none'

export default function CadastroFilhoPage() {
  const router = useRouter()

  const [nome, setNome] = useState('')
  const [idade, setIdade] = useState('')
  const [condicao, setCondicao] = useState('')
  const [grau, setGrau] = useState('')
  const [serie, setSerie] = useState('')
  const [estilo, setEstilo] = useState('nao_sei')
  const [observacoes, setObservacoes] = useState('')

  const [loading, setLoading] = useState(false)
  const [slowNetwork, setSlowNetwork] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    const token = getToken()
    if (!token) router.replace('/cadastro')
  }, [router])

  const mostrarGrau = condicao && condicao !== 'Prefiro não informar'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')

    if (!nome.trim()) {
      setErro('Informe o nome do filho')
      return
    }
    if (!condicao) {
      setErro('Selecione a condição')
      return
    }
    if (!serie) {
      setErro('Selecione a série escolar')
      return
    }

    const token = getToken() // lê na hora do submit, não no render
    const user = getUser()
    if (!token) {
      setErro('Sessão expirada. Faça login novamente.')
      router.push('/cadastro')
      return
    }

    setLoading(true)
    const slowTimer = setTimeout(() => setSlowNetwork(true), 5000)

    try {
      const payload: Record<string, unknown> = {
        nome,
        idade: idade ? Number(idade) : undefined,
        condicao,
        serie_escolar: serie,
        estilo_aprendizagem: estilo,
        observacoes: observacoes.trim() || undefined,
      }
      if (mostrarGrau && grau) payload.grau_necessidade = grau

      const filho = await api.post('/v1/familia/filhos/', payload, token)

      localStorage.setItem('edu_filho_id', filho.id ?? filho._id ?? '')
      localStorage.setItem('edu_filho_data', JSON.stringify(filho))

      // Atualiza o user no localStorage com o nome da família
      if (user) {
        const updatedUser = { ...user, nome_familia: nome }
        localStorage.setItem('edu_user', JSON.stringify(updatedUser))
      }

      router.push('/familia')
    } catch (err: unknown) {
      const e = err as { message?: string; detail?: string }
      setErro(e?.message || e?.detail || 'Não foi possível salvar o perfil. Tente novamente.')
    } finally {
      clearTimeout(slowTimer)
      setLoading(false)
      setSlowNetwork(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <Link href="/" className="inline-flex items-center hover:opacity-80 transition-opacity">
          <div className="bg-[#1B4332] rounded-2xl px-4 py-2">
            <Logo size="md" theme="dark" />
          </div>
        </Link>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-soft-lg border border-[#F0EBE0] p-8"
      >
        <Stepper />

        <h1 className="font-lora font-bold text-2xl text-[#1A1A1A] mb-1">
          Conte-nos sobre seu filho
        </h1>
        <p className="text-[#4A5568] text-sm mb-6">
          Essas informações nos ajudam a personalizar as atividades
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nome do filho */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                Nome do filho <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome da criança"
                className={inputClass}
                disabled={loading}
              />
            </div>

            {/* Idade */}
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                Idade
              </label>
              <input
                type="number"
                min={1}
                max={18}
                value={idade}
                onChange={(e) => setIdade(e.target.value)}
                placeholder="Ex: 7"
                className={inputClass}
                disabled={loading}
              />
            </div>

            {/* Condição */}
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                Condição <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  value={condicao}
                  onChange={(e) => { setCondicao(e.target.value); setGrau('') }}
                  className={selectClass}
                  disabled={loading}
                >
                  <option value="">Selecione...</option>
                  {condicoes.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#718096]">▾</div>
              </div>
            </div>

            {/* Grau — só aparece se condição selecionada e != "Prefiro não informar" */}
            {mostrarGrau && (
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                  Grau
                </label>
                <div className="relative">
                  <select
                    value={grau}
                    onChange={(e) => setGrau(e.target.value)}
                    className={selectClass}
                    disabled={loading}
                  >
                    <option value="">Selecione...</option>
                    {graus.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#718096]">▾</div>
                </div>
              </div>
            )}

            {/* Série escolar */}
            <div className={mostrarGrau ? '' : 'sm:col-span-1'}>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                Série escolar <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  value={serie}
                  onChange={(e) => setSerie(e.target.value)}
                  className={selectClass}
                  disabled={loading}
                >
                  <option value="">Selecione...</option>
                  {series.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#718096]">▾</div>
              </div>
            </div>

            {/* Estilo de aprendizagem */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                Como ele aprende?
              </label>
              <div className="relative">
                <select
                  value={estilo}
                  onChange={(e) => setEstilo(e.target.value)}
                  className={selectClass}
                  disabled={loading}
                >
                  {estilos.map((e) => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#718096]">▾</div>
              </div>
              <p className="text-xs text-[#718096] mt-1.5 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
                💡 No plano Família você pode descobrir o estilo exato com nosso questionário inteligente
              </p>
            </div>

            {/* Observações */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                Observações <span className="text-[#A0AEC0] font-normal">(opcional)</span>
              </label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Conte um pouco sobre seu filho: o que ele gosta, o que tem dificuldade, como é sua rotina..."
                rows={3}
                className={`${inputClass} resize-none`}
                disabled={loading}
              />
            </div>
          </div>

          {/* Erros */}
          {erro && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 mt-4">
              {erro}
            </div>
          )}

          {/* Aviso rede lenta */}
          {slowNetwork && (
            <div className="bg-amber-50 text-amber-700 text-sm px-4 py-3 rounded-xl border border-amber-100 mt-4">
              Aguarde, estamos acordando o servidor... (pode levar 30s)
            </div>
          )}

          {/* Botão */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#1B4332] text-white font-semibold py-3.5 rounded-xl hover:bg-[#2D6A4F] transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-green mt-6"
          >
            {loading && <Spinner />}
            {loading ? 'Salvando perfil...' : 'Criar perfil →'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
