// Recorta cada figurita del PDF, OCR del nombre, y la empareja por nombre con
// el dataset. Guarda las imágenes en public/figus/<id>.jpg y un reporte.
import { createWorker, PSM } from 'tesseract.js'
import { createCanvas, loadImage } from '@napi-rs/canvas'
import fs from 'node:fs'
import path from 'node:path'
import { STICKERS } from '../src/data/stickers.js'

const dir = 'C:/Claude/figus-mundial/tools/out'
const outImg = 'C:/Claude/figus-mundial/public/figus'
fs.mkdirSync(outImg, { recursive: true })

// --- geometría de la grilla 4x4 (fracciones de la página) ---
const COLS = [0.02, 0.253, 0.502, 0.75]
const CELL_W = 0.23
// recorte de la figurita (cabeza .. debajo del nombre)
const ROW_TOP = [0.005, 0.245, 0.478, 0.7]
const CELL_H = 0.216
// banda del nombre (absoluta) para OCR
const NAME_BAND_TOP = [0.175, 0.42, 0.655, 0.888]
const BAND_H = 0.085

function preprocess(ctx, w, h) {
  const im = ctx.getImageData(0, 0, w, h)
  const d = im.data
  for (let i = 0; i < d.length; i += 4) {
    const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
    const v = lum > 150 ? 0 : 255
    d[i] = d[i + 1] = d[i + 2] = v
  }
  ctx.putImageData(im, 0, 0)
}

function parseName(text) {
  let s = text.replace(/\s+/g, ' ').trim().replace(/PANINI/gi, ' ')
  const m = s.search(/\d/)
  if (m >= 0) s = s.slice(0, m)
  s = s.replace(/[^A-Za-zÀ-ÿ.\-' ]/g, ' ').replace(/\s+/g, ' ').trim()
  return s
}

const norm = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z ]/g, ' ').replace(/\s+/g, ' ').trim()

function lev(a, b) {
  const m = a.length, n = b.length
  if (!m) return n
  if (!n) return m
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)])
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      )
  return dp[m][n]
}

function score(ocr, cand) {
  const a = norm(ocr), b = norm(cand)
  if (!a || a.length < 3) return 0
  const ratio = 1 - lev(a, b) / Math.max(a.length, b.length)
  // bonus si el apellido (última palabra del candidato) aparece en el OCR
  const last = b.split(' ').slice(-1)[0]
  let bonus = 0
  if (last.length >= 4 && a.includes(last)) bonus = 0.35
  const first = b.split(' ')[0]
  if (first.length >= 4 && a.includes(first)) bonus = Math.max(bonus, 0.2)
  return Math.min(1, ratio + bonus)
}

// --- recorrido de páginas ---
const worker = await createWorker('eng')
await worker.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_BLOCK })

const cells = [] // {key, ocr, jpeg}
for (let p = 1; p <= 54; p++) {
  const f = path.join(dir, `TODAS_LAS_FIGURITAS_EN_PDF_p${String(p).padStart(3, '0')}.png`)
  if (!fs.existsSync(f)) continue
  const img = await loadImage(fs.readFileSync(f))
  const W = img.width, H = img.height
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      // imagen completa de la celda (la figurita)
      const cx = COLS[c] * W, cy = ROW_TOP[r] * H
      const cw = CELL_W * W, ch = CELL_H * H
      const cv = createCanvas(Math.round(cw), Math.round(ch))
      cv.getContext('2d').drawImage(img, cx, cy, cw, ch, 0, 0, cw, ch)
      const jpeg = cv.toBuffer('image/jpeg', 0.82)

      // banda del nombre para OCR (posición absoluta)
      const nx = cx, ny = NAME_BAND_TOP[r] * H
      const nw = cw, nh = BAND_H * H
      const sc = 3
      const ncv = createCanvas(nw * sc, nh * sc)
      const nctx = ncv.getContext('2d')
      nctx.drawImage(img, nx, ny, nw, nh, 0, 0, nw * sc, nh * sc)
      preprocess(nctx, nw * sc, nh * sc)
      const { data } = await worker.recognize(ncv.toBuffer('image/png'))
      const ocr = parseName(data.text)
      cells.push({ key: `${p}_${r}${c}`, ocr, jpeg })
    }
  }
  process.stdout.write(`.`)
}
await worker.terminate()
console.log(`\nceldas: ${cells.length}`)

// --- matching greedy único ---
const pairs = []
for (const cell of cells) {
  if (!cell.ocr || cell.ocr.length < 3) continue
  for (const s of STICKERS) {
    const sc = score(cell.ocr, s.name)
    if (sc >= 0.5) pairs.push({ cell: cell.key, id: s.id, sc })
  }
}
pairs.sort((a, b) => b.sc - a.sc)
const cellUsed = new Set(), idUsed = new Map()
for (const pr of pairs) {
  if (cellUsed.has(pr.cell) || idUsed.has(pr.id)) continue
  cellUsed.add(pr.cell)
  idUsed.set(pr.id, pr.cell)
}

// --- guardar imágenes de las que se emparejaron ---
const cellMap = Object.fromEntries(cells.map((c) => [c.key, c]))
let saved = 0
for (const [id, cellKey] of idUsed) {
  fs.writeFileSync(path.join(outImg, `${id}.jpg`), cellMap[cellKey].jpeg)
  saved++
}

const unmatchedPlayers = STICKERS.filter((s) => !idUsed.has(s.id)).map((s) => `${s.id} ${s.name} (${s.team})`)
fs.writeFileSync(
  path.join(dir, 'match-report.json'),
  JSON.stringify({ cells: cells.length, saved, unmatchedCount: unmatchedPlayers.length, unmatchedPlayers, ocrSample: cells.slice(0, 16).map((c) => ({ key: c.key, ocr: c.ocr })) }, null, 2)
)
console.log(`emparejadas/guardadas: ${saved} / ${STICKERS.length}`)
console.log(`sin emparejar: ${unmatchedPlayers.length}`)
