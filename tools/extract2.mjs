// OCR por columnas + ancla de fecha de nacimiento.
// En cada columna las figuritas se apilan: NOMBRE / fecha|altura|peso / CLUB.
// El nombre es la línea anterior a la fecha (D-M-AAAA).
import { createWorker, PSM } from 'tesseract.js'
import { createCanvas, loadImage } from '@napi-rs/canvas'
import fs from 'node:fs'
import path from 'node:path'

const dir = 'C:/Claude/figus-mundial/tools/out'
const range = process.argv[2] || '1'
const [a, b] = range.split('-').map(Number)
const start = a, end = b || a

const COLS = [0.015, 0.252, 0.502, 0.752]
const CELL_W = 0.233

function preprocess(ctx, w, h) {
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
    const v = lum > 150 ? 0 : 255
    d[i] = d[i + 1] = d[i + 2] = v
  }
  ctx.putImageData(img, 0, 0)
}

const DOB = /\b\d{1,2}\s*[-.]\s*\d{1,2}\s*[-.]\s*\d{4}\b/

function cleanName(s) {
  s = (s || '').replace(/PANINI/gi, ' ').replace(/[^A-Za-zÀ-ÿ.\-' ]/g, ' ')
  s = s.replace(/\s+/g, ' ').trim()
  // quitar tokens basura de 1 letra sueltos al inicio/fin
  s = s.replace(/^(?:[A-Z] )+/, '').replace(/(?: [A-Z])+$/, '').trim()
  return s
}

const worker = await createWorker('eng')
await worker.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_BLOCK })

const results = []
for (let p = start; p <= end; p++) {
  const f = path.join(dir, `TODAS_LAS_FIGURITAS_EN_PDF_p${String(p).padStart(3, '0')}.png`)
  if (!fs.existsSync(f)) continue
  const img = await loadImage(fs.readFileSync(f))
  const W = img.width, H = img.height
  const names = []
  for (let c = 0; c < 4; c++) {
    const bx = COLS[c] * W, bw = CELL_W * W
    const scale = 2
    const cv = createCanvas(bw * scale, H * scale)
    const ctx = cv.getContext('2d')
    ctx.drawImage(img, bx, 0, bw, H, 0, 0, bw * scale, H * scale)
    preprocess(ctx, bw * scale, H * scale)
    const { data } = await worker.recognize(cv.toBuffer('image/png'))
    const lines = data.text.split('\n').map((l) => l.trim()).filter(Boolean)
    for (let i = 0; i < lines.length; i++) {
      if (DOB.test(lines[i])) {
        // nombre = línea previa (o lo previo a la fecha si está en la misma línea)
        let nm = ''
        const before = lines[i].split(DOB)[0].trim()
        if (cleanName(before).length >= 3) nm = before
        else if (i > 0) nm = lines[i - 1]
        nm = cleanName(nm)
        if (nm.length >= 3) names.push({ c, name: nm })
      }
    }
  }
  results.push({ page: p, names })
  console.log(`pág ${p} (${names.length}):`)
  names.forEach((n) => console.log(`  c${n.c}  ${n.name}`))
}

fs.writeFileSync(path.join(dir, `names2_${start}_${end}.json`), JSON.stringify(results, null, 2))
await worker.terminate()
