'use client'

// Componente invisível que serve como template para geração do PDF.
// Não é exibido ao usuário diretamente — é capturado pelo html2canvas.

interface Area {
  id: string
  emoji: string
  label: string
}

interface FilhoPDF {
  nome: string
  idade?: number
  necessidade?: string
}

interface AtividadePDFData {
  titulo?: string
  objetivo?: string
  duracao_minutos?: number
  dificuldade?: string
  passo_a_passo?: string[] | string
  passos?: string[] | string
  materiais?: string[] | string
  instrucao_familia?: string
  instrucao_para_familia?: string
  instrucao_professor?: string
}

interface Props {
  atividade: AtividadePDFData
  filho: FilhoPDF
  area: Area | null | undefined
}

function parsarLista(campo: string[] | string | undefined): string[] {
  if (!campo) return []
  if (Array.isArray(campo)) return campo
  try {
    const parsed = JSON.parse(campo)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function AtividadePDF({ atividade, filho, area }: Props) {
  const passos = parsarLista(atividade.passo_a_passo ?? atividade.passos)
  const materiais = parsarLista(atividade.materiais)
  const instrucaoFamilia = atividade.instrucao_familia ?? atividade.instrucao_para_familia

  return (
    <div
      id="atividade-pdf-template"
      style={{
        position: 'fixed',
        left: '-9999px',
        top: 0,
        width: '794px',
        backgroundColor: '#FDFBF7',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        color: '#1a1a1a',
        padding: '0',
      }}
    >
      {/* HEADER */}
      <div style={{
        backgroundColor: '#1B4332',
        padding: '32px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ color: 'white' }}>
          <div style={{
            fontSize: '22px',
            fontWeight: '700',
            letterSpacing: '-0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <span style={{
              backgroundColor: '#F59E0B',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              color: 'white',
              fontWeight: '900',
            }}>+</span>
            Edu<span style={{ color: '#F59E0B' }}>+</span> Inclusiva
          </div>
          <div style={{
            fontSize: '11px',
            color: 'rgba(255,255,255,0.6)',
            marginTop: '2px',
            letterSpacing: '0.5px',
          }}>
            educação especial personalizada
          </div>
        </div>

        {area && (
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '999px',
            padding: '6px 16px',
            color: 'white',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <span>{area.emoji}</span>
            <span>{area.label}</span>
          </div>
        )}
      </div>

      {/* FAIXA ÂMBAR */}
      <div style={{
        backgroundColor: '#F59E0B',
        padding: '12px 48px',
        display: 'flex',
        gap: '32px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        <span style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>
          👤 {filho.nome}
        </span>
        {filho.idade && (
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px' }}>
            {filho.idade} anos
          </span>
        )}
        {filho.necessidade && (
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px' }}>
            {filho.necessidade}
          </span>
        )}
        {atividade.duracao_minutos && (
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px' }}>
            ⏱ {atividade.duracao_minutos} minutos
          </span>
        )}
        {atividade.dificuldade && (
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px' }}>
            📊 {atividade.dificuldade}
          </span>
        )}
      </div>

      {/* CORPO */}
      <div style={{ padding: '40px 48px' }}>

        <h1 style={{
          fontSize: '26px',
          fontWeight: '700',
          color: '#1B4332',
          margin: '0 0 8px 0',
          lineHeight: '1.2',
        }}>
          {atividade.titulo}
        </h1>

        {atividade.objetivo && (
          <div style={{
            backgroundColor: '#F5F0E8',
            borderLeft: '4px solid #F59E0B',
            borderRadius: '0 12px 12px 0',
            padding: '14px 20px',
            marginTop: '20px',
            marginBottom: '32px',
          }}>
            <div style={{
              fontSize: '10px',
              fontWeight: '700',
              color: '#92400E',
              letterSpacing: '1px',
              marginBottom: '6px',
            }}>
              OBJETIVO
            </div>
            <p style={{
              fontSize: '14px',
              color: '#1B4332',
              margin: 0,
              lineHeight: '1.6',
              fontWeight: '500',
            }}>
              {atividade.objetivo}
            </p>
          </div>
        )}

        {materiais.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#6b7280',
              letterSpacing: '1px',
              marginBottom: '10px',
            }}>
              🧰 MATERIAIS NECESSÁRIOS
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {materiais.map((mat, i) => (
                <span key={i} style={{
                  backgroundColor: '#e5e7eb',
                  borderRadius: '999px',
                  padding: '4px 12px',
                  fontSize: '12px',
                  color: '#374151',
                }}>
                  {mat}
                </span>
              ))}
            </div>
          </div>
        )}

        {passos.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#6b7280',
              letterSpacing: '1px',
              marginBottom: '14px',
            }}>
              📋 PASSO A PASSO
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {passos.map((passo, i) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start',
                }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#1B4332',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '1px',
                  }}>
                    {i + 1}
                  </div>
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    color: '#374151',
                    lineHeight: '1.65',
                  }}>
                    {passo}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          {instrucaoFamilia && (
            <div style={{
              flex: 1,
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '12px',
              padding: '16px 20px',
            }}>
              <div style={{
                fontSize: '11px',
                fontWeight: '700',
                color: '#1d4ed8',
                letterSpacing: '0.5px',
                marginBottom: '8px',
              }}>
                🏠 PARA A FAMÍLIA
              </div>
              <p style={{
                margin: 0,
                fontSize: '13px',
                color: '#1e3a8a',
                lineHeight: '1.6',
              }}>
                {instrucaoFamilia}
              </p>
            </div>
          )}

          {atividade.instrucao_professor && (
            <div style={{
              flex: 1,
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '12px',
              padding: '16px 20px',
            }}>
              <div style={{
                fontSize: '11px',
                fontWeight: '700',
                color: '#15803d',
                letterSpacing: '0.5px',
                marginBottom: '8px',
              }}>
                🏫 PARA A ESCOLA
              </div>
              <p style={{
                margin: 0,
                fontSize: '13px',
                color: '#14532d',
                lineHeight: '1.6',
              }}>
                {atividade.instrucao_professor}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* FOOTER */}
      <div style={{
        backgroundColor: '#1B4332',
        padding: '16px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>
          Gerado pelo Edu+ Inclusiva — eduinclusiva.com.br
        </span>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>
          {new Date().toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
        </span>
      </div>

    </div>
  )
}
