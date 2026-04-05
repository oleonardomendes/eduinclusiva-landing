'use client'

import { useState, useEffect } from 'react'
import { Menu, X, Leaf } from 'lucide-react'
import Button from '@/components/ui/Button'

const navLinks = [
  { label: 'Como Funciona', href: '#como-funciona' },
  { label: 'Portal Educativo', href: '#portal-educativo' },
  { label: 'Especialistas', href: '#especialistas' },
  { label: 'Planos', href: '#planos' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleCTA = () => alert('Em breve! Estamos preparando algo incrível. 🌱')

  const handleNavClick = (href: string) => {
    setMenuOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-soft border-b border-[#F0EBE0]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center gap-2 group"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          >
            <div className="w-8 h-8 bg-[#1B4332] rounded-xl flex items-center justify-center group-hover:bg-[#2D6A4F] transition-colors">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-lora font-bold text-lg text-[#1B4332]">
              Edu<span className="text-[#F59E0B]">+</span> Inclusiva
            </span>
          </a>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="px-4 py-2 text-sm font-medium text-[#4A5568] hover:text-[#1B4332] hover:bg-[#F0F7F4] rounded-full transition-all"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* CTA desktop */}
          <div className="hidden md:block">
            <Button variant="primary" size="md" onClick={handleCTA}>
              Começar Gratuitamente
            </Button>
          </div>

          {/* Hamburger mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-xl text-[#1B4332] hover:bg-[#F0F7F4] transition-colors"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-md border-t border-[#F0EBE0] px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="w-full text-left px-4 py-3 text-base font-medium text-[#4A5568] hover:text-[#1B4332] hover:bg-[#F0F7F4] rounded-xl transition-all"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2">
            <Button variant="primary" fullWidth onClick={handleCTA}>
              Começar Gratuitamente
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
