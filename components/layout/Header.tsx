'use client'

import { useState, useEffect, useRef } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'

const navLinks = [
  { label: 'Como Funciona',   href: '#como-funciona'   },
  { label: 'Portal Educativo', href: '#portal-educativo' },
  { label: 'Especialistas',   href: '#especialistas'   },
  { label: 'Planos',          href: '#planos'          },
]

export default function Header() {
  const [scrolled, setScrolled]       = useState(false)
  const [menuOpen, setMenuOpen]       = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleNavClick = (href: string) => {
    setMenuOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-[#1B4332] transition-shadow duration-300 ${
        scrolled ? 'shadow-[0_2px_16px_rgba(0,0,0,0.25)]' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <a
            href="#"
            className="hover:opacity-80 transition-opacity"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          >
            <Logo size="md" />
          </a>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="px-4 py-2 text-sm font-medium rounded-full transition-opacity duration-150"
                style={{ color: 'rgba(253,251,247,0.85)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FDFBF7')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(253,251,247,0.85)')}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* CTAs desktop */}
          <div className="hidden md:flex items-center gap-2">
            <a
              href="/login"
              className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-150 hover:bg-white/10 active:scale-[0.98] border border-white/30"
              style={{ color: '#FDFBF7' }}
            >
              Entrar
            </a>
            {/* Dropdown "Começar" */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold transition-opacity duration-150 hover:opacity-90 active:scale-[0.98]"
                style={{ background: '#F59E0B', color: '#1B4332' }}
              >
                Começar Gratuitamente
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-56 z-50">
                  <Link
                    href="/cadastro?tipo=familia"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-50"
                  >
                    <span className="text-xl">👨‍👩‍👧</span>
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A1A]">Sou família</p>
                      <p className="text-xs text-[#718096]">Atividades para meu filho</p>
                    </div>
                  </Link>
                  <Link
                    href="/cadastro?tipo=especialista"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-xl">🩺</span>
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A1A]">Sou especialista</p>
                      <p className="text-xs text-[#718096]">Gerencie meus pacientes</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Hamburger mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-xl transition-colors hover:bg-white/10"
            style={{ color: '#FDFBF7' }}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#1B4332] border-t border-white/10 px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="w-full text-left px-4 py-3 text-base font-medium rounded-xl transition-colors hover:bg-white/10"
              style={{ color: 'rgba(253,251,247,0.85)' }}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 space-y-2">
            <a
              href="/login"
              className="block w-full py-3 rounded-full text-base font-semibold text-center transition-colors hover:bg-white/10 border border-white/30"
              style={{ color: '#FDFBF7' }}
            >
              Entrar
            </a>
            <Link
              href="/cadastro?tipo=familia"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-full text-base font-bold hover:opacity-90 transition-opacity text-center"
              style={{ background: '#F59E0B', color: '#1B4332' }}
            >
              👨‍👩‍👧 Começar — Sou família
            </Link>
            <Link
              href="/cadastro?tipo=especialista"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-full text-base font-semibold text-center transition-colors hover:bg-white/10 border border-white/30"
              style={{ color: '#FDFBF7' }}
            >
              🩺 Sou especialista
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
