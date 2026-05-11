import type { ReactElement } from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'

// Experimental: Chromium 147+ behind chrome://flags/#canvas-draw-element.
// Lets us draw a live DOM element into a <canvas> with full browser
// styling, including OpenType ligatures that Satori can't shape.
//
// Spec: https://github.com/WICG/html-in-canvas

interface DrawElementCtx extends CanvasRenderingContext2D {
  drawElementImage: (element: Element, x: number, y: number) => unknown
}

const hasDrawElementImage = (
  ctx: CanvasRenderingContext2D | null,
): ctx is DrawElementCtx =>
  ctx !== null &&
  typeof (ctx as { drawElementImage?: unknown }).drawElementImage === 'function'

let cachedSupport: boolean | undefined

export const isDrawElementImageSupported = (): boolean => {
  if (cachedSupport !== undefined) return cachedSupport
  if (typeof document === 'undefined') {
    cachedSupport = false
    return false
  }
  try {
    const c = document.createElement('canvas')
    cachedSupport = hasDrawElementImage(c.getContext('2d'))
  } catch {
    cachedSupport = false
  }
  return cachedSupport
}

const ensureOffscreenHost = (): HTMLDivElement => {
  const existing = document.getElementById('html-in-canvas-host')
  if (existing) return existing as HTMLDivElement
  const host = document.createElement('div')
  host.id = 'html-in-canvas-host'
  host.setAttribute('aria-hidden', 'true')
  // Must stay in the viewport so the browser actually paints the
  // subtree — drawElementImage relies on the cached paint record.
  // - Off-screen via `left:-99999px` -> "No cached paint record".
  // - `opacity:0` -> paints fine but composites the captured image
  //   with alpha=0, so the PNG comes out fully transparent.
  // `clip-path:inset(100%)` hides the element visually without
  // affecting the paint of its subtree.
  host.style.cssText =
    'position:fixed;top:0;left:0;pointer-events:none;z-index:-1;clip-path:inset(100%);'
  document.body.appendChild(host)
  return host
}

const nextFrame = (): Promise<void> =>
  new Promise((resolve) => requestAnimationFrame(() => resolve()))

const waitForPaint = (canvas: HTMLCanvasElement): Promise<void> =>
  new Promise((resolve) => {
    let settled = false
    const done = () => {
      if (settled) return
      settled = true
      canvas.removeEventListener('paint', done)
      resolve()
    }
    canvas.addEventListener('paint', done, { once: true })
    // Fallback: if the paint event doesn't fire (e.g. nothing about the
    // subtree changed since last frame), don't hang forever.
    setTimeout(done, 250)
  })

const SUPERSAMPLE = 2

export const renderTreeToPng = async (
  tree: ReactElement,
  width: number,
  height: number,
): Promise<Blob> => {
  if (!isDrawElementImageSupported()) {
    throw new Error('drawElementImage is not supported in this browser')
  }
  const host = ensureOffscreenHost()
  // Render at SUPERSAMPLE× the requested dimensions so the browser's
  // grayscale-AA rasteriser has more pixels to work with, then downscale
  // back to the requested size. The exported PNG matches what the user
  // configured, but with super-sampled AA quality.
  const renderWidth = Math.round(width * SUPERSAMPLE)
  const renderHeight = Math.round(height * SUPERSAMPLE)
  const canvas = document.createElement('canvas')
  canvas.width = renderWidth
  canvas.height = renderHeight
  canvas.setAttribute('layoutsubtree', '')
  // The element drawElementImage receives must be a direct child of the
  // canvas. CSS `zoom` rescales the layout of descendants — fonts,
  // paddings, borders all rasterise at the larger size, which is the
  // actual mechanism behind super-sampled AA. `transform: scale()` would
  // not work here: it scales the already-rasterised bitmap rather than
  // re-rasterising at higher density.
  const inner = document.createElement('div')
  inner.style.cssText = `width:${width}px;height:${height}px;zoom:${SUPERSAMPLE};`
  canvas.appendChild(inner)
  host.appendChild(canvas)

  const root = createRoot(inner)
  try {
    // flushSync forces React to commit synchronously — without it the
    // tree hasn't actually mounted by the time we ask the browser for a
    // paint, and drawElementImage captures an empty subtree.
    flushSync(() => {
      root.render(tree)
    })
    if ('fonts' in document) await document.fonts.ready
    // Let the browser paint at least once so a paint record exists.
    await nextFrame()
    await waitForPaint(canvas)
    const ctx = canvas.getContext('2d')
    if (!hasDrawElementImage(ctx)) {
      throw new Error('drawElementImage not available on this canvas context')
    }
    ctx.drawElementImage(inner, 0, 0)
    // Downscale the supersampled bitmap onto a canvas at the user's
    // requested size. High-quality smoothing preserves the AA.
    const out = document.createElement('canvas')
    out.width = width
    out.height = height
    const outCtx = out.getContext('2d')
    if (!outCtx) throw new Error('Could not create downscale context')
    outCtx.imageSmoothingEnabled = true
    outCtx.imageSmoothingQuality = 'high'
    outCtx.drawImage(canvas, 0, 0, width, height)
    const blob = await new Promise<Blob>((resolve, reject) => {
      out.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('toBlob returned null'))),
        'image/png',
      )
    })
    return blob
  } finally {
    root.unmount()
    canvas.remove()
  }
}
