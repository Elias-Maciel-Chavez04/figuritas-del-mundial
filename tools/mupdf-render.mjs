// Renderiza páginas de un PDF a PNG usando mupdf (WASM).
import * as mupdf from 'mupdf'
import fs from 'node:fs'
import path from 'node:path'

const file = process.argv[2]
const range = process.argv[3] || '1'
const dpi = Number(process.argv[4] || 150)
const outDir = process.argv[5] || 'C:/Claude/figus-mundial/tools/out'

fs.mkdirSync(outDir, { recursive: true })
const [a, b] = range.split('-').map(Number)
const start = a
const end = b || a

const buf = fs.readFileSync(file)
const doc = mupdf.Document.openDocument(new Uint8Array(buf), 'application/pdf')
const n = doc.countPages()
const base = path.basename(file).replace(/[^a-z0-9]+/gi, '_').replace(/_pdf$/i, '')
const zoom = dpi / 72

for (let i = start; i <= Math.min(end, n); i++) {
  const page = doc.loadPage(i - 1)
  const pix = page.toPixmap(mupdf.Matrix.scale(zoom, zoom), mupdf.ColorSpace.DeviceRGB, false)
  const png = pix.asPNG()
  const out = path.join(outDir, `${base}_p${String(i).padStart(3, '0')}.png`)
  fs.writeFileSync(out, png)
  const [x0, y0, x1, y1] = page.getBounds()
  console.log(out, `${Math.round((x1 - x0) * zoom)}x${Math.round((y1 - y0) * zoom)}`)
}
console.log('total pages:', n)
