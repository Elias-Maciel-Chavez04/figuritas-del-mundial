// Pipeline: por cada página, recorta las 16 figuritas (grilla 4x4),
// aísla y binariza la zona de datos, y le pasa OCR para sacar el nombre.
import { createWorker, PSM } from 'tesseract.js'
import { createCanvas, loadImage } from '@napi-rs/canvas'
import fs from 'node:fs'
import path from 'node:path'

const dir = 'C:/Claude/figus-mundial/tools/out'
const range = process.argv[2] || '1'
const SAVE = process.argv[3] === 'save'
const [a, b] = range.split('-').map(Number)
const start = a, end = b || a

// Geometría de la grilla (fracciones del ancho/alto de la página).
const COLS = [0.015, 0.252, 0.502, 0.752]
const CELL_W = 0.233
// Banda de datos (nombre + dob + club): top absoluto por fila + alto fijo.
const ROW_BAND_TOP = [0.175, 0.42, 0.655, 0.888]
const BAND_H = 0.085

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

function pickName(text) {
  // El nombre va primero y luego la fecha (D-M-AAAA). Cortamos en el 1er dígito.
  let s = text.replace(/\s+/g, ' ').trim()
  s = s.replace(/PANINI/gi, ' ')
  const m = s.search(/\d/)
  if (m >= 0) s = s.slice(0, m)
  // limpiar tokens basura de 1 letra al inicio (ruido de la foto)
  s = s.replace(/^([A-Z] )+/, '').trim()
  s = s.replace(/[^A-Za-zÀ-ÿ.\-' ]/g, ' ').replace(/\s+/g, ' ').trim()
  return s
}

const worker = await createWorker('eng')
await worker.setParameters({
  tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
  tessedit_char_whitelist:
    "ABCDEFGHIJKLMNOPQRSTUVWXYZÀÁÂÄÃÅĀÆÇÈÉÊËĖĘÌÍÎÏŁŃÑÒÓÔÖÕØŒÙÚÛÜŚŠÝŸŻŹŽ.-'() 0123456789",
})

const results = []
for (let p = start; p <= end; p++) {
  const f = path.join(dir, `TODAS_LAS_FIGURITAS_EN_PDF_p${String(p).padStart(3, '0')}.png`)
  if (!fs.existsSync(f)) continue
  const img = await loadImage(fs.readFileSync(f))
  const W = img.width, H = img.height
  const cells = []
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const bx = COLS[c] * W, by = ROW_BAND_TOP[r] * H
      const bw = CELL_W * W, bh = BAND_H * H
      const scale = 3
      const cv = createCanvas(bw * scale, bh * scale)
      const ctx = cv.getContext('2d')
      ctx.drawImage(img, bx, by, bw, bh, 0, 0, bw * scale, bh * scale)
      preprocess(ctx, bw * scale, bh * scale)
      const buf = cv.toBuffer('image/png')
      if (SAVE) fs.writeFileSync(path.join(dir, `band_p${p}_${r}${c}.png`), buf)
      const { data } = await worker.recognize(buf)
      cells.push({ r, c, name: pickName(data.text), raw: data.text.replace(/\s+/g, ' ').trim() })
    }
  }
  results.push({ page: p, cells })
  console.log(`pág ${p}:`)
  cells.forEach((cell) => console.log(`  [${cell.r}${cell.c}] "${cell.name}"  <= ${cell.raw}`))
}

fs.writeFileSync(path.join(dir, `names_${start}_${end}.json`), JSON.stringify(results, null, 2))
await worker.terminate()
