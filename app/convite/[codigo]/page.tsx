'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { getConvite } from '@/lib/api'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ConviteData {
  especialista: { nome: string }
  paciente: { nome: string; condicao?: string; grau?: string }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="animate-spin h-6 w-6 text-[#1B4332]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ConvitePage() {
  const params = useParams()
  const codigo = params.codigo as string

  const [convite, setConvite] = useState<ConviteData | null>(null)
  const [erro, setErro] = useState(false)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!codigo) return
    const carregar = async () => {
      try {
        const data = await getConvite(codigo)
        setConvite(data)
      } catch {
        setErro(true)
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [codigo])

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

      {/* Conteúdo */}
      {carregando ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : erro ? (
        /* ─── Tela de erro ─── */
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-soft-lg border border-[#F0EBE0] p-8 text-center"
        >
          <div className="text-5xl mb-4">❌</div>
          <h1 className="font-lora font-bold text-2xl text-[#1A1A1A] mb-3">
            Convite inválido
          </h1>
          <p className="text-[#4A5568] text-sm leading-relaxed mb-6">
            Este convite não é mais válido ou já foi utilizado. Entre em contato com seu especialista para solicitar um novo convite.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full bg-[#1B4332] text-white font-semibold py-3.5 rounded-xl hover:bg-[#2D6A4F] transition-colors"
          >
            Ir para o site
          </Link>
        </motion.div>
      ) : convite ? (
        /* ─── Tela de boas-vindas ─── */
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md bg-white rounded-3xl shadow-soft-lg border border-[#F0EBE0] p-8"
        >
          {/* Ícone e título */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">👋</div>
            <h1 className="font-lora font-bold text-2xl text-[#1A1A1A]">
              Você foi convidado!
            </h1>
          </div>

          {/* Card do convite */}
          <div className="bg-[#E8F4EE] border border-[#2D6A4F]/20 rounded-2xl p-4 mb-4">
            <p className="text-sm text-[#1B4332] font-semibold leading-relaxed">
              {convite.especialista.nome} convidou você para acompanhar{' '}
              <span className="font-bold">{convite.paciente.nome}</span> na plataforma
            </p>
            {(convite.paciente.condicao || convite.paciente.grau) && (
              <span className="mt-2 inline-block text-xs font-medium text-[#2D6A4F] bg-[#2D6A4F]/10 px-2.5 py-1 rounded-full">
                {[convite.paciente.condicao, convite.paciente.grau].filter(Boolean).join(' · ')}
              </span>
            )}
          </div>

          {/* Benefícios */}
          <p className="text-sm font-semibold text-[#1A1A1A] mb-3">
            Crie sua conta gratuitamente e tenha acesso a:
          </p>
          <ul className="space-y-2 mb-6">
            {[
              'Atividades prescritas pelo especialista',
              'Plano semanal personalizado',
              'Acompanhamento do progresso',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-[#4A5568]">
                <span className="text-green-500 shrink-0">✅</span>
                {item}
              </li>
            ))}
          </ul>

          {/* CTA principal */}
          <Link
            href={`/cadastro?tipo=familia&convite=${codigo}`}
            className="flex items-center justify-center w-full bg-[#1B4332] text-white font-bold py-3.5 rounded-xl hover:bg-[#2D6A4F] transition-colors text-sm"
          >
            Criar minha conta →
          </Link>

          {/* Link login */}
          <p className="text-center text-sm text-[#4A5568] mt-4">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-[#1B4332] font-semibold hover:underline">
              Entre aqui →
            </Link>
          </p>
        </motion.div>
      ) : null}

    </div>
  )
}
