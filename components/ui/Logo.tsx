'use client'

import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showTagline?: boolean
}

export default function Logo({ size = 'md', showTagline = false }: LogoProps) {
  const s = {
    sm: { bigR: 14, smallR: 10, plusW: 10, plusH: 3, gap: 6,  name: 12, tag: 9  },
    md: { bigR: 18, smallR: 13, plusW: 14, plusH: 5, gap: 8,  name: 15, tag: 10 },
    lg: { bigR: 28, smallR: 20, plusW: 20, plusH: 6, gap: 12, name: 22, tag: 11 },
  }[size]

  const svgW = s.bigR * 2 + s.smallR * 2 - 6
  const svgH = s.bigR * 2
  const cy = s.bigR
  const cxBig   = s.bigR
  const cxSmall = svgW - s.smallR

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: s.gap }}>
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Círculo branco maior (esquerdo) */}
        <circle cx={cxBig} cy={cy} r={s.bigR} fill="#FDFBF7" opacity="0.92" />

        {/* "+" âmbar — barra horizontal */}
        <rect
          x={cxBig - s.plusW / 2}
          y={cy - s.plusH / 2}
          width={s.plusW}
          height={s.plusH}
          rx={s.plusH / 2}
          fill="#F59E0B"
        />
        {/* "+" âmbar — barra vertical */}
        <rect
          x={cxBig - s.plusH / 2}
          y={cy - s.plusW / 2}
          width={s.plusH}
          height={s.plusW}
          rx={s.plusH / 2}
          fill="#F59E0B"
        />

        {/* Círculo verde menor (direito, sobrepõe o branco) */}
        <circle cx={cxSmall} cy={cy} r={s.smallR} fill="#2D6A4F" />
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
        <span style={{
          fontFamily: 'var(--font-lora)',
          fontSize: s.name,
          fontWeight: 700,
          color: '#FDFBF7',
        }}>
          Edu<span style={{ color: '#F59E0B' }}>+</span>
        </span>
        <span style={{
          fontFamily: 'var(--font-lora)',
          fontSize: s.name,
          fontWeight: 700,
          color: '#FDFBF7',
        }}>
          Inclusiva
        </span>
        {showTagline && (
          <span style={{
            fontFamily: 'var(--font-jakarta)',
            fontSize: s.tag,
            color: '#88BB99',
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
