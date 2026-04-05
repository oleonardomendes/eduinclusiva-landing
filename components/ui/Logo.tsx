'use client'

import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showTagline?: boolean
  variant?: 'dark' | 'light'
}

export default function Logo({
  size = 'md',
  showTagline = false,
  variant = 'dark',
}: LogoProps) {
  const sizes = {
    sm: { small: 22, large: 30, plus: 8,  plusW: 18, gap: 8,  name: 14, tag: 9  },
    md: { small: 30, large: 42, plus: 10, plusW: 22, gap: 10, name: 18, tag: 10 },
    lg: { small: 44, large: 62, plus: 14, plusW: 32, gap: 14, name: 26, tag: 12 },
  }

  const s = sizes[size]
  const textColor = variant === 'dark' ? '#FDFBF7' : '#1B4332'
  const tagColor  = variant === 'dark' ? '#88BB99' : '#2D6A4F'

  const totalW = s.small * 2 + s.large * 2 + s.gap
  const totalH = s.large * 2
  const cy     = totalH / 2

  // Círculo branco maior fica à esquerda
  const cxLarge = s.large
  // Círculo verde menor sobrepõe levemente à direita
  const cxSmall = cxLarge + s.large + s.small - 8

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: s.gap }}>
      {/* ── Símbolo ── */}
      <svg
        width={totalW}
        height={totalH}
        viewBox={`0 0 ${totalW} ${totalH}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Círculo branco maior (direito no design, esquerdo no SVG) */}
        <circle cx={cxLarge} cy={cy} r={s.large} fill="#FDFBF7" opacity="0.92" />

        {/* Círculo verde menor sobreposto */}
        <circle cx={cxSmall} cy={cy} r={s.small} fill="#2D6A4F" />

        {/* "+" âmbar dentro do círculo branco — barra horizontal */}
        <rect
          x={cxLarge - s.plusW / 2}
          y={cy - s.plus / 2}
          width={s.plusW}
          height={s.plus}
          rx={s.plus / 2}
          fill="#F59E0B"
        />
        {/* "+" âmbar — barra vertical */}
        <rect
          x={cxLarge - s.plus / 2}
          y={cy - s.plusW / 2}
          width={s.plus}
          height={s.plusW}
          rx={s.plus / 2}
          fill="#F59E0B"
        />
      </svg>

      {/* ── Nome + tagline ── */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span style={{
          fontFamily: 'var(--font-lora)',
          fontSize: s.name,
          fontWeight: 700,
          color: textColor,
        }}>
          Edu<span style={{ color: '#F59E0B' }}>+</span>
        </span>
        <span style={{
          fontFamily: 'var(--font-lora)',
          fontSize: s.name,
          fontWeight: 700,
          color: textColor,
        }}>
          Inclusiva
        </span>
        {showTagline && (
          <span style={{
            fontFamily: 'var(--font-jakarta)',
            fontSize: s.tag,
            color: tagColor,
            letterSpacing: '0.05em',
            marginTop: 2,
          }}>
            educação especial personalizada
          </span>
        )}
      </div>
    </div>
  )
}
