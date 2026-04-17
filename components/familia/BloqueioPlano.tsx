'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { upgradePlano } from '@/lib/api'
import { getToken } from '@/lib/auth'

interface Props {
  funcionalidade: string
  descricao: string
  onUpgradeSuccess?: () => void
}

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

export default function BloqueioPlano({ descricao, onUpgradeSuccess }: Props) {
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  const handleUpgrade = async () => {
    const token = getToken()
    if (!token) return
    setCarregando(true)
    setErro('')
    try {
      await upgradePlano(token)
      onUpgradeSuccess?.()
    } catch (e: unknown) {
      const err = e as { detail?: string; message?: string }
      setErro(err?.detail ?? err?.message ?? 'Não foi possível processar. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#FEF3C7] border border-[#F59E0B] rounded-2xl p-6"
    >
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 bg-[#F59E0B]/20 rounded-full flex items-center justify-center text-2xl">
          🔒
        </div>
        <div>
          <h3 className="font-semibold text-[#92400E] text-base">
            Funcionalidade exclusiva do Plano Família
          </h3>
          <p className="text-sm text-amber-700 mt-1 leading-relaxed">{descricao}</p>
        </div>
        <p className="text-sm font-bold text-[#92400E]">Por apenas R$ 29/mês</p>

        {erro && (
          <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg w-full">{erro}</p>
        )}

        <button
          onClick={handleUpgrade}
          disabled={carregando}
          className="w-full py-3 bg-[#F59E0B] text-white font-semibold text-sm rounded-xl hover:bg-amber-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {carregando ? <><Spinner /> Processando...</> : '✨ Assinar Plano Família'}
        </button>

        <Link
          href="/#planos"
          className="text-xs text-amber-700 hover:text-amber-900 hover:underline transition-colors"
        >
          Ver todos os benefícios →
        </Link>
      </div>
    </motion.div>
  )
}
