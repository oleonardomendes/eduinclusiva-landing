import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Gera um PDF a partir do elemento #atividade-pdf-template.
 * Retorna um Blob do PDF gerado.
 */
export async function gerarPDFBlob(): Promise<Blob> {
  // Aguardar elemento estar no DOM (até 3 segundos)
  let elemento: HTMLElement | null = null
  let tentativas = 0
  while (!elemento && tentativas < 30) {
    elemento = document.getElementById('atividade-pdf-template')
    if (!elemento) {
      await new Promise<void>((r) => setTimeout(r, 100))
      tentativas++
    }
  }
  if (!elemento) throw new Error('Template PDF não encontrado')

  // Aguardar fontes carregarem
  if (document.fonts?.ready) {
    await document.fonts.ready
  }

  // Salvar estilo original (via atributo para restauração fiel)
  const estiloOriginal = elemento.getAttribute('style') || ''

  // CRÍTICO: posicionar DENTRO do viewport durante captura.
  // z-index alto e opacity: 0 — visível para html2canvas, invisível para o usuário.
  elemento.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 794px !important;
    z-index: 9999 !important;
    opacity: 0 !important;
    pointer-events: none !important;
    background-color: #FDFBF7 !important;
  `

  // Aguardar o browser aplicar os novos estilos
  await new Promise<void>((r) => setTimeout(r, 500))

  let blob: Blob | null = null

  try {
    const canvas = await html2canvas(elemento, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#FDFBF7',
      width: 794,
      height: elemento.scrollHeight,
      windowWidth: 794,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
      logging: false,
      onclone: (documentClone: Document) => {
        const el = documentClone.getElementById('atividade-pdf-template')
        if (el) {
          el.style.opacity = '1'
          el.style.position = 'relative'
          el.style.left = '0'
          el.style.top = '0'
        }
      },
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.95)

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4',
    })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    const alturaA4px = pdf.internal.pageSize.getHeight()

    if (pdfHeight <= alturaA4px) {
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
    } else {
      // Conteúdo maior que uma página — dividir em páginas
      let posicaoY = 0
      let pagina = 0
      while (posicaoY < pdfHeight) {
        if (pagina > 0) pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, -posicaoY, pdfWidth, pdfHeight)
        posicaoY += alturaA4px
        pagina++
      }
    }

    blob = pdf.output('blob')
  } finally {
    // Sempre restaurar estilo original, mesmo em caso de erro
    elemento.setAttribute('style', estiloOriginal)
  }

  return blob!
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
