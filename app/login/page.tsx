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

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [slowNetwork, setSlowNetwork] = useState(false)
  const [erro, setErro] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')

    if (!email.includes('@')) {
      setErro('Informe um email válido')
      return
    }
    if (!senha) {
      setErro('Informe a senha')
      return
    }

    setLoading(true)
    const slowTimer = setTimeout(() => setSlowNetwork(true), 5000)

    try {
      // 1. Login
      const loginData = await api.post('/v1/auth/login', { email, senha })
      const token = loginData.token ?? loginData.access_token
      if (!token) throw new Error('Token não encontrado na resposta')

      // 2. Buscar dados do usuário
      const user = await api.get('/v1/auth/me', token)

      // 3. Verificar papel
      if (user.papel && user.papel !== 'familia') {
        setErro('Esta conta não é de uma família. Acesse o painel institucional.')
        return
      }

      setAuth(token, user)
      router.push('/familia')
    } catch (err: unknown) {
      const e = err as { message?: string; detail?: string; status?: number }
      const status = (err as Response)?.status
      const msg = e?.message || e?.detail || ''

      if (
        status === 401 ||
        msg.toLowerCase().includes('senha') ||
        msg.toLowerCase().includes('credencial') ||
        msg.toLowerCase().includes('incorrect') ||
        msg.toLowerCase().includes('unauthorized') ||
        msg.toLowerCase().includes('invalid')
      ) {
        setErro('Email ou senha incorretos')
      } else if (msg.includes('painel institucional')) {
        setErro(msg)
      } else {
        setErro('Não foi possível entrar. Tente novamente.')
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
          Bem-vindo de volta
        </h1>
        <p className="text-[#4A5568] text-sm mb-6">
          Entre na sua conta para continuar
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Sua senha"
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
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Link cadastro */}
        <p className="text-center text-sm text-[#4A5568] mt-5">
          Não tem conta?{' '}
          <Link href="/cadastro" className="text-[#1B4332] font-semibold hover:underline">
            Criar conta gratuita →
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
