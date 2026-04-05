import type { Metadata } from 'next'
import { Lora, Plus_Jakarta_Sans, Caveat } from 'next/font/google'
import './globals.css'

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Edu+ Inclusiva — Atividades para crianças com necessidades especiais',
  description:
    'Atividades pedagógicas personalizadas por IA para crianças com Autismo, TDAH, Dislexia e outras necessidades especiais. Orientações para família e professores.',
  keywords: [
    'autismo',
    'TDAH',
    'dislexia',
    'NEE',
    'atividades inclusivas',
    'educação especial',
    'aprendizado personalizado',
    'inteligência artificial',
  ],
  authors: [{ name: 'Edu+ Inclusiva' }],
  openGraph: {
    title: 'Edu+ Inclusiva — Atividades para crianças com necessidades especiais',
    description:
      'Atividades pedagógicas personalizadas por IA para crianças com Autismo, TDAH, Dislexia e outras NEE.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Edu+ Inclusiva',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Edu+ Inclusiva',
    description: 'Atividades pedagógicas personalizadas por IA para crianças com NEE.',
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌱</text></svg>",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="pt-BR"
      className={`${lora.variable} ${jakarta.variable} ${caveat.variable}`}
    >
      <body className="font-jakarta antialiased">{children}</body>
    </html>
  )
}
