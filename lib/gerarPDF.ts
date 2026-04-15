import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Gera um PDF a partir do elemento #atividade-pdf-template.
 * Retorna um Blob do PDF gerado.
 */
export async function gerarPDFBlob(): Promise<Blob> {
  // Aguardar o elemento chegar ao DOM por até 3 segundos
  let elemento: HTMLElement | null = null
  let tentativas = 0

  while (!elemento && tentativas < 30) {
    elemento = document.getElementById('atividade-pdf-template')
    if (!elemento) {
      await new Promise<void>((r) => setTimeout(r, 100))
      tentativas++
    }
  }

  if (!elemento) throw new Error('Template PDF não encontrado após 3 segundos')

  // Mover para posição capturável (não display:none — html2canvas não captura)
  const estiloOriginal = elemento.style.cssText
  elemento.style.position = 'fixed'
  elemento.style.left = '0'
  elemento.style.top = '0'
  elemento.style.zIndex = '-1'
  elemento.style.opacity = '0'
  elemento.style.pointerEvents = 'none'

  // Aguardar render completo
  await new Promise<void>((r) => setTimeout(r, 300))

  const canvas = await html2canvas(elemento, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#FDFBF7',
    width: 794,
    windowWidth: 794,
    logging: false,
  })

  elemento.style.cssText = estiloOriginal

  const imgData = canvas.toDataURL('image/jpeg', 0.95)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: 'a4',
  })

  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width

  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)

  return pdf.output('blob')
}

/**
 * Faz o download do PDF no dispositivo.
 */
export async function downloadPDF(nomeArquivo = 'atividade-eduinclusiva.pdf'): Promise<void> {
  const blob = await gerarPDFBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nomeArquivo
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Compartilha o PDF via Web Share API (mobile).
 * Fallback: download direto (desktop).
 */
export async function compartilharPDF(
  nomeArquivo = 'atividade-eduinclusiva.pdf'
): Promise<'compartilhado' | 'baixado'> {
  const blob = await gerarPDFBlob()
  const file = new File([blob], nomeArquivo, { type: 'application/pdf' })

  if (
    typeof navigator !== 'undefined' &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    await navigator.share({
      files: [file],
      title: 'Atividade — Edu+ Inclusiva',
      text: 'Segue a atividade personalizada pelo Edu+ Inclusiva 🌱',
    })
    return 'compartilhado'
  }

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nomeArquivo
  link.click()
  URL.revokeObjectURL(url)
  return 'baixado'
}
