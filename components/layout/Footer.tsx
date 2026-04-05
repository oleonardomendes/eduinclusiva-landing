'use client'

import { Leaf, Instagram, Heart } from 'lucide-react'

const navSections = [
  {
    title: 'Produto',
    links: [
      { label: 'Como Funciona', href: '#como-funciona' },
      { label: 'Portal Educativo', href: '#portal-educativo' },
      { label: 'Planos', href: '#planos' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Especialistas', href: '#especialistas' },
      { label: 'Contato', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Política de Privacidade', href: '#' },
      { label: 'Termos de Uso', href: '#' },
      { label: 'LGPD', href: '#' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#2D6A4F] rounded-xl flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-lora font-bold text-lg">
                Edu<span className="text-[#F59E0B]">+</span> Inclusiva
              </span>
            </div>
            <p className="text-sm text-[#9CA3AF] leading-relaxed mb-5">
              Transformando o aprendizado inclusivo com inteligência artificial
              e muito carinho.
            </p>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="inline-flex items-center gap-2 text-[#9CA3AF] hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
              <span className="text-sm">@eduinclusiva</span>
            </a>
          </div>

          {/* Nav sections */}
          {navSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-sm text-white mb-4 uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={(e) => {
                        if (link.href === '#') e.preventDefault()
                      }}
                      className="text-sm text-[#9CA3AF] hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-[#374151] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#6B7280]">
            © 2026 Edu+ Inclusiva. Todos os direitos reservados.
          </p>
          <p className="text-sm text-[#6B7280] flex items-center gap-1">
            Feito com{' '}
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />{' '}
            para famílias e educadores brasileiros
          </p>
        </div>
      </div>
    </footer>
  )
}
