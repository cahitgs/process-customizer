import { toPng, toSvg } from 'html-to-image'

interface ExportOptions {
  /** Filename without extension. */
  filename: string
  /** Pixel ratio for raster export. Default 2× for crisp output. */
  pixelRatio?: number
  /** Background color. Default: transparent. */
  backgroundColor?: string
}

function triggerDownload(dataUrl: string, filename: string) {
  const a = document.createElement('a')
  a.setAttribute('download', filename)
  a.setAttribute('href', dataUrl)
  a.click()
}

/**
 * Capture the React Flow canvas (the .react-flow viewport content) as PNG.
 *
 * We target `.react-flow__viewport` rather than `.react-flow` so we don't
 * include the Controls / MiniMap UI in the exported image.
 */
export async function exportPng(rootEl: HTMLElement, opts: ExportOptions): Promise<void> {
  const viewport = rootEl.querySelector<HTMLElement>('.react-flow__viewport')
  const canvas = rootEl.querySelector<HTMLElement>('.react-flow')
  if (!viewport || !canvas) throw new Error('React Flow canvas not found')

  const { width, height } = canvas.getBoundingClientRect()

  const dataUrl = await toPng(viewport, {
    width,
    height,
    pixelRatio: opts.pixelRatio ?? 2,
    backgroundColor: opts.backgroundColor,
    style: {
      transform: getComputedStyle(viewport).transform,
      transformOrigin: '0 0',
      width: `${width}px`,
      height: `${height}px`,
    },
  })
  triggerDownload(dataUrl, `${opts.filename}.png`)
}

export async function exportSvg(rootEl: HTMLElement, opts: ExportOptions): Promise<void> {
  const viewport = rootEl.querySelector<HTMLElement>('.react-flow__viewport')
  const canvas = rootEl.querySelector<HTMLElement>('.react-flow')
  if (!viewport || !canvas) throw new Error('React Flow canvas not found')

  const { width, height } = canvas.getBoundingClientRect()

  const dataUrl = await toSvg(viewport, {
    width,
    height,
    backgroundColor: opts.backgroundColor,
    style: {
      transform: getComputedStyle(viewport).transform,
      transformOrigin: '0 0',
      width: `${width}px`,
      height: `${height}px`,
    },
  })
  triggerDownload(dataUrl, `${opts.filename}.svg`)
}
