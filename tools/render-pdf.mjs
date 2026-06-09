// Renderiza páginas de un PDF a PNG para poder mirarlas / OCR.
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { createCanvas } from '@napi-rs/canvas'
import fs from 'node:fs'
import path from 'node:path'

const file = process.argv[2]
const range = process.argv[3] || '1' // ej: "1-5"
const scale = Number(process.argv[4] || 2.0)
const outDir = process.argv[5] || 'C:/Claude/figus-mundial/tools/out'

fs.mkdirSync(outDir, { recursive: true })

const [a, b] = range.split('-').map(Number)
const start = a
const end = b || a

const data = new Uint8Array(fs.readFileSync(file))
const doc = await getDocument({ data, useSystemFonts: true }).promise
const base = path.basename(file).replace(/[^a-z0-9]+/gi, '_').replace(/\.pdf$/i, '')

for (let i = start; i <= Math.min(end, doc.numPages); i++) {
  const page = await doc.getPage(i)
  const viewport = page.getViewport({ scale })
  const canvas = createCanvas(viewport.width, viewport.height)
  const ctx = canvas.getContext('2d')
  await page.render({ canvasContext: ctx, viewport }).promise
  const out = path.join(outDir, `${base}_p${String(i).padStart(3, '0')}.png`)
  fs.writeFileSync(out, canvas.toBuffer('image/png'))
  console.log(out, `${Math.round(viewport.width)}x${Math.round(viewport.height)}`)
}
