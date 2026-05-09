import { strToU8, zipSync } from 'fflate'

const triggerDownload = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const svgToPngBytes = async (
  svg: string,
  width: number,
  height: number,
  scale: number,
): Promise<Uint8Array> => {
  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)
  try {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = url
    await img.decode()
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(width * scale)
    canvas.height = Math.round(height * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get 2d canvas context')
    ctx.scale(scale, scale)
    ctx.drawImage(img, 0, 0, width, height)
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) =>
          b ? resolve(b) : reject(new Error('Canvas toBlob returned null')),
        'image/png',
      )
    })
    return new Uint8Array(await blob.arrayBuffer())
  } finally {
    URL.revokeObjectURL(url)
  }
}

export const downloadSvg = (svg: string, filename = 'code.svg'): void => {
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  triggerDownload(blob, filename)
}

export const copySvgToClipboard = async (svg: string): Promise<void> => {
  if (!navigator.clipboard?.writeText) {
    throw new Error('Clipboard text API not supported in this browser')
  }
  await navigator.clipboard.writeText(svg)
}

export const copyPngToClipboard = async (
  svg: string,
  width: number,
  height: number,
  scale = 2,
): Promise<void> => {
  if (typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) {
    throw new Error('Clipboard image API not supported in this browser')
  }
  const bytes = await svgToPngBytes(svg, width, height, scale)
  const blob = new Blob([new Uint8Array(bytes).buffer], { type: 'image/png' })
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
}

export const downloadPng = async (
  svg: string,
  width: number,
  height: number,
  filename = 'code.png',
  scale = 2,
): Promise<void> => {
  const bytes = await svgToPngBytes(svg, width, height, scale)
  const buffer = new Uint8Array(bytes).buffer
  triggerDownload(new Blob([buffer], { type: 'image/png' }), filename)
}

export const downloadPagesZip = async (
  svgs: ReadonlyArray<string>,
  width: number,
  height: number,
  format: 'png' | 'svg',
  filename: string,
  scale = 2,
): Promise<void> => {
  const pad = String(svgs.length).length
  const files: Record<string, Uint8Array> = {}
  for (let i = 0; i < svgs.length; i += 1) {
    const svg = svgs[i]
    if (svg === undefined) continue
    const name = `code-${String(i + 1).padStart(pad, '0')}.${format}`
    if (format === 'svg') {
      files[name] = strToU8(svg)
    } else {
      files[name] = await svgToPngBytes(svg, width, height, scale)
    }
  }
  const zipped = zipSync(files)
  triggerDownload(new Blob([zipped.buffer as ArrayBuffer], { type: 'application/zip' }), filename)
}
