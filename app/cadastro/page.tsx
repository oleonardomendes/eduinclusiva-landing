'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { api } from '@/lib/api'
import { setAuth } from '@/lib/auth'

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

export default function CadastroPage() {
  const router = useRouter()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [showConfirmar, setShowConfirmar] = useState(false)
  const [loading, setLoading] = useState(false)
  const [slowNetwork, setSlowNetwork] = useState(false)
  const [erro, setErro] = useState('')

  const validate = (): string | null => {
    if (!nome.trim()) return 'Informe seu nome completo'
    if (!email.includes('@')) return 'Informe um email válido'
    if (senha.length < 6) return 'A senha deve ter pelo menos 6 caracteres'
    if (senha !== confirmar) return 'As senhas não coincidem'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')

    const validationError = validate()
    if (validationError) {
      setErro(validationError)
      return
    }

    setLoading(true)
    const slowTimer = setTimeout(() => setSlowNetwork(true), 5000)

    try {
      await api.post('/v1/auth/register', {
        nome,
        email,
        senha,
        papel: 'familia',
      })

      const loginData = await api.post('/v1/auth/login', { email, senha })
      // Backends OAuth2/FastAPI retornam 'access_token'; outros retornam 'token'
      const token = loginData.token ?? loginData.access_token
      if (!token) throw new Error('Token não encontrado na resposta do login')
      const user = loginData.user ?? { email, nome }
      setAuth(token, user)
      router.push('/cadastro/filho')
    } catch (err: unknown) {
      const e = err as { message?: string; detail?: string }
      const msg = e?.message || e?.detail || ''
      if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('já')) {
        setErro('Este email já está em uso')
      } else {
        setErro('Não foi possível criar a conta. Tente novamente.')
      }
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
        className="w-full max-w-md bg-white rounded-3xl shadow-soft-lg border border-[#F0EBE0] p-8"
      >
        <h1 className="font-lora font-bold text-2xl text-[#1A1A1A] mb-1">
          Crie sua conta gratuita
        </h1>
        <p className="text-[#4A5568] text-sm mb-6">
          Comece a apoiar seu filho com atividades personalizadas
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
              Nome completo
            </label>
            <input
              type="text"
              autoComplete="name"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
              className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white text-[#1A1A1A] placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent transition-all"
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white text-[#1A1A1A] placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent transition-all"
              disabled={loading}
            />
          </div>

          {/* Senha */}
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
              Senha
            </label>
            <div className="relative">
              <input
                type={showSenha ? 'text' : 'password'}
                autoComplete="new-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-3 pr-11 rounded-xl border border-[#E2E8F0] bg-white text-[#1A1A1A] placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent transition-all"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowSenha(!showSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#1B4332] transition-colors"
                tabIndex={-1}
              >
                {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirmar senha */}
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
              Confirmar senha
            </label>
            <div className="relative">
              <input
                type={showConfirmar ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                placeholder="Repita a senha"
                className="w-full px-4 py-3 pr-11 rounded-xl border border-[#E2E8F0] bg-white text-[#1A1A1A] placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent transition-all"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmar(!showConfirmar)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#1B4332] transition-colors"
                tabIndex={-1}
              >
                {showConfirmar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Erro */}
          {erro && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
              {erro}
            </div>
          )}

          {/* Aviso rede lenta */}
          {slowNetwork && (
            <div className="bg-amber-50 text-amber-700 text-sm px-4 py-3 rounded-xl border border-amber-100">
              Aguarde, estamos acordando o servidor... (pode levar 30s)
            </div>
          )}

          {/* Botão */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#1B4332] text-white font-semibold py-3.5 rounded-xl hover:bg-[#2D6A4F] transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-green mt-2"
          >
            {loading && <Spinner />}
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        {/* Link login */}
        <p className="text-center text-sm text-[#4A5568] mt-5">
          Já tem conta?{' '}
          <Link href="/login" className="text-[#1B4332] font-semibold hover:underline">
            Entrar →
          </Link>
        </p>
      </motion.div>

      {/* Aviso gratuito */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 text-sm text-[#718096] flex flex-wrap items-center justify-center gap-3"
      >
        <span>✓ Gratuito</span>
        <span>✓ Sem cartão de crédito</span>
        <span>✓ Cancele quando quiser</span>
      </motion.p>
    </div>
  )
}
