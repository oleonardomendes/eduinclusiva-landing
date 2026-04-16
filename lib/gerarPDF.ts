import jsPDF from 'jspdf'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type RGB = [number, number, number]

export interface AtividadeParaPDF {
  titulo?: string
  objetivo?: string
  duracao_minutos?: number
  dificuldade?: string
  passo_a_passo?: string[] | string
  passos?: string[] | string
  instrucao_familia?: string
  instrucao_para_familia?: string
  instrucao_professor?: string
  materiais?: string[] | string
}

export interface FilhoParaPDF {
  nome?: string
  idade?: number
  necessidade?: string
  condicao?: string
}

export interface AreaParaPDF {
  id?: string
  emoji?: string
  label?: string
}

// ─── Paleta ───────────────────────────────────────────────────────────────────

const VERDE_ESCURO: RGB = [27, 67, 50]
const AMBAR: RGB        = [245, 158, 11]
const BEGE: RGB         = [245, 240, 232]
const AZUL_CLARO: RGB   = [239, 246, 255]
const VERDE_CLARO: RGB  = [240, 253, 244]
const CINZA_TEXTO: RGB  = [55, 65, 81]
const CINZA_SUAVE: RGB  = [107, 114, 128]
const BRANCO: RGB       = [255, 255, 255]
const VERDE_BADGE: RGB  = [60, 100, 80]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setFill(pdf: jsPDF, rgb: RGB): void {
  pdf.setFillColor(rgb[0], rgb[1], rgb[2])
}

function setTextColor(pdf: jsPDF, rgb: RGB | [number, number, number]): void {
  pdf.setTextColor(rgb[0], rgb[1], rgb[2])
}

function setDrawColor(pdf: jsPDF, rgb: RGB): void {
  pdf.setDrawColor(rgb[0], rgb[1], rgb[2])
}

function roundRect(pdf: jsPDF, x: number, y: number, w: number, h: number, rgb: RGB, filled = true): void {
  if (filled) {
    setFill(pdf, rgb)
    pdf.roundedRect(x, y, w, h, 3, 3, 'F')
  } else {
    setDrawColor(pdf, rgb)
    pdf.roundedRect(x, y, w, h, 3, 3, 'S')
  }
}

function parseJSON(value: string[] | string | undefined): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value
  try { return JSON.parse(value) } catch { return [] }
}

// ─── Gerador principal ────────────────────────────────────────────────────────

export async function gerarPDFBlob(
  atividade: AtividadeParaPDF,
  filho: FilhoParaPDF | null | undefined,
  area: AreaParaPDF | null | undefined,
): Promise<Blob> {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const W  = 210
  const M  = 14
  const CW = W - M * 2

  let y = 0

  const passos    = parseJSON(atividade.passo_a_passo ?? atividade.passos)
  const materiais = parseJSON(atividade.materiais)

  // ── HEADER ─────────────────────────────────────────────────────────────────
  setFill(pdf, VERDE_ESCURO)
  pdf.rect(0, 0, W, 28, 'F')

  // Círculo âmbar com "+"
  setFill(pdf, AMBAR)
  pdf.circle(M + 5, 14, 4, 'F')
  setTextColor(pdf, BRANCO)
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'bold')
  pdf.text('+', M + 5, 14.8, { align: 'center' })

  // Nome da marca
  pdf.setFontSize(13)
  pdf.setFont('helvetica', 'bold')
  setTextColor(pdf, BRANCO)
  pdf.text('Edu', M + 12, 15.5)
  setTextColor(pdf, AMBAR)
  pdf.text('+', M + 22.5, 15.5)
  setTextColor(pdf, BRANCO)
  pdf.text(' Inclusiva', M + 24, 15.5)

  // Tagline
  pdf.setFontSize(7)
  pdf.setFont('helvetica', 'normal')
  setTextColor(pdf, [180, 210, 195])
  pdf.text('educacao especial personalizada', M + 12, 20)

  // Badge da área
  const badgeX = W - M - 40
  roundRect(pdf, badgeX, 9, 40, 10, VERDE_BADGE)
  setTextColor(pdf, BRANCO)
  pdf.setFontSize(8)
  pdf.text(area?.label ?? '', badgeX + 20, 15.5, { align: 'center' })

  y = 28

  // ── FAIXA ÂMBAR — dados do filho ───────────────────────────────────────────
  setFill(pdf, AMBAR)
  pdf.rect(0, y, W, 10, 'F')

  setTextColor(pdf, BRANCO)
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'bold')

  const dadosFilho = [
    filho?.nome ?? '',
    filho?.idade ? `${filho.idade} anos` : null,
    filho?.necessidade ?? filho?.condicao ?? null,
    `${atividade.duracao_minutos ?? '?'} min`,
    atividade.dificuldade ?? null,
  ].filter(Boolean) as string[]

  const espacamento = CW / Math.max(dadosFilho.length, 1)
  dadosFilho.forEach((dado, i) => {
    pdf.text(dado, M + espacamento * i, y + 6.5)
  })

  y += 16

  // ── TÍTULO ─────────────────────────────────────────────────────────────────
  pdf.setFontSize(17)
  pdf.setFont('helvetica', 'bold')
  setTextColor(pdf, VERDE_ESCURO)
  const linhasTitulo = pdf.splitTextToSize(atividade.titulo ?? '', CW) as string[]
  pdf.text(linhasTitulo, M, y)
  y += linhasTitulo.length * 8 + 4

  // ── OBJETIVO ───────────────────────────────────────────────────────────────
  if (atividade.objetivo) {
    const objLines = pdf.splitTextToSize(atividade.objetivo, CW - 10) as string[]
    const objH = objLines.length * 6 + 12
    roundRect(pdf, M, y, CW, objH, BEGE)

    setFill(pdf, AMBAR)
    pdf.rect(M, y, 3, objH, 'F')

    pdf.setFontSize(7.5)
    pdf.setFont('helvetica', 'bold')
    setTextColor(pdf, [146, 64, 14])
    pdf.text('OBJETIVO', M + 7, y + 6)

    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    setTextColor(pdf, VERDE_ESCURO)
    let yObj = y + 11
    objLines.forEach((line) => { pdf.text(line, M + 7, yObj); yObj += 6 })

    y += objH + 8
  }

  // ── MATERIAIS ──────────────────────────────────────────────────────────────
  if (materiais.length > 0) {
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'bold')
    setTextColor(pdf, CINZA_SUAVE)
    pdf.text('MATERIAIS NECESSARIOS', M, y)
    y += 6

    let xMat = M
    for (const mat of materiais) {
      const matText = String(mat)
      const matW = pdf.getTextWidth(matText) + 8
      if (xMat + matW > W - M) { xMat = M; y += 9 }
      roundRect(pdf, xMat, y - 4, matW, 7, [229, 231, 235])
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      setTextColor(pdf, CINZA_TEXTO)
      pdf.text(matText, xMat + 4, y + 0.5)
      xMat += matW + 3
    }
    y += 10
  }

  // ── PASSO A PASSO ──────────────────────────────────────────────────────────
  if (passos.length > 0) {
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'bold')
    setTextColor(pdf, CINZA_SUAVE)
    pdf.text('PASSO A PASSO', M, y)
    y += 7

    passos.forEach((passo, i) => {
      const passoLines = pdf.splitTextToSize(String(passo), CW - 16) as string[]
      const passoH = passoLines.length * 6 + 4

      if (y + passoH > 272) { pdf.addPage(); y = 20 }

      setFill(pdf, VERDE_ESCURO)
      pdf.circle(M + 4, y + 2, 4, 'F')
      setTextColor(pdf, BRANCO)
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'bold')
      pdf.text(String(i + 1), M + 4, y + 3.5, { align: 'center' })

      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      setTextColor(pdf, CINZA_TEXTO)
      let yPasso = y
      passoLines.forEach((line) => { pdf.text(line, M + 12, yPasso + 3.5); yPasso += 6 })

      y += passoH + 3
    })

    y += 4
  }

  // ── ORIENTAÇÕES ────────────────────────────────────────────────────────────
  const instrucaoFamilia = atividade.instrucao_familia ?? atividade.instrucao_para_familia

  if (instrucaoFamilia || atividade.instrucao_professor) {
    if (y + 30 > 272) { pdf.addPage(); y = 20 }

    const colW = (CW - 6) / 2

    if (instrucaoFamilia) {
      const famLines = pdf.splitTextToSize(instrucaoFamilia, colW - 8) as string[]
      const famH = famLines.length * 5.5 + 14
      roundRect(pdf, M, y, colW, famH, AZUL_CLARO)
      setDrawColor(pdf, [191, 219, 254])
      pdf.setLineWidth(0.3)
      pdf.roundedRect(M, y, colW, famH, 3, 3, 'S')
      pdf.setFontSize(7.5)
      pdf.setFont('helvetica', 'bold')
      setTextColor(pdf, [29, 78, 216])
      pdf.text('PARA A FAMILIA', M + 4, y + 7)
      pdf.setFontSize(8.5)
      pdf.setFont('helvetica', 'normal')
      setTextColor(pdf, [30, 58, 138])
      let yFam = y + 13
      famLines.forEach((line) => { pdf.text(line, M + 4, yFam); yFam += 5.5 })

      if (atividade.instrucao_professor) {
        const escLines = pdf.splitTextToSize(atividade.instrucao_professor, colW - 8) as string[]
        const escH = escLines.length * 5.5 + 14
        const xEsc = M + colW + 6
        roundRect(pdf, xEsc, y, colW, escH, VERDE_CLARO)
        setDrawColor(pdf, [187, 247, 208])
        pdf.roundedRect(xEsc, y, colW, escH, 3, 3, 'S')
        pdf.setFontSize(7.5)
        pdf.setFont('helvetica', 'bold')
        setTextColor(pdf, [21, 128, 61])
        pdf.text('PARA A ESCOLA', xEsc + 4, y + 7)
        pdf.setFontSize(8.5)
        pdf.setFont('helvetica', 'normal')
        setTextColor(pdf, [20, 83, 45])
        let yEsc = y + 13
        escLines.forEach((line) => { pdf.text(line, xEsc + 4, yEsc); yEsc += 5.5 })
        y += Math.max(famH, escH) + 8
      } else {
        y += famH + 8
      }
    } else if (atividade.instrucao_professor) {
      const escLines = pdf.splitTextToSize(atividade.instrucao_professor, CW - 8) as string[]
      const escH = escLines.length * 5.5 + 14
      roundRect(pdf, M, y, CW, escH, VERDE_CLARO)
      setDrawColor(pdf, [187, 247, 208])
      pdf.setLineWidth(0.3)
      pdf.roundedRect(M, y, CW, escH, 3, 3, 'S')
      pdf.setFontSize(7.5)
      pdf.setFont('helvetica', 'bold')
      setTextColor(pdf, [21, 128, 61])
      pdf.text('PARA A ESCOLA', M + 4, y + 7)
      pdf.setFontSize(8.5)
      pdf.setFont('helvetica', 'normal')
      setTextColor(pdf, [20, 83, 45])
      let yEsc = y + 13
      escLines.forEach((line) => { pdf.text(line, M + 4, yEsc); yEsc += 5.5 })
      y += escH + 8
    }
  }

  // ── FOOTER em todas as páginas ─────────────────────────────────────────────
  const totalPages = pdf.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p)
    setFill(pdf, VERDE_ESCURO)
    pdf.rect(0, 287, W, 10, 'F')
    pdf.setFontSize(7)
    pdf.setFont('helvetica', 'normal')
    setTextColor(pdf, [150, 190, 170])
    pdf.text('Gerado pelo Edu+ Inclusiva — eduinclusiva.com.br', M, 293.5)
    const data = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    pdf.text(data, W - M, 293.5, { align: 'right' })
    if (totalPages > 1) {
      pdf.text(`Pagina ${p} de ${totalPages}`, W / 2, 293.5, { align: 'center' })
    }
  }

  return pdf.output('blob')
}

// ─── Download direto ──────────────────────────────────────────────────────────

export async function downloadPDF(
  atividade: AtividadeParaPDF,
  filho: FilhoParaPDF | null | undefined,
  area: AreaParaPDF | null | undefined,
): Promise<void> {
  const blob = await gerarPDFBlob(atividade, filho, area)
  const nomeArquivo = `atividade-${(filho?.nome ?? 'eduinclusiva')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')}.pdf`

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nomeArquivo
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

// ─── Compartilhar (Web Share API / fallback download) ─────────────────────────

export async function compartilharPDF(
  atividade: AtividadeParaPDF,
  filho: FilhoParaPDF | null | undefined,
  area: AreaParaPDF | null | undefined,
): Promise<'compartilhado' | 'cancelado' | 'baixado'> {
  const blob = await gerarPDFBlob(atividade, filho, area)
  const nomeArquivo = `atividade-${(filho?.nome ?? 'eduinclusiva')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')}.pdf`

  const file = new File([blob], nomeArquivo, { type: 'application/pdf' })

  if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: `Atividade: ${atividade.titulo ?? 'Edu+ Inclusiva'}`,
        text: `Atividade personalizada pelo Edu+ Inclusiva para ${filho?.nome ?? 'seu filho'} 🌱`,
      })
      return 'compartilhado'
    } catch (e: unknown) {
      if ((e as Error).name === 'AbortError') return 'cancelado'
      // outros erros: cai no fallback abaixo
    }
  }

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nomeArquivo
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 5000)
  return 'baixado'
}
