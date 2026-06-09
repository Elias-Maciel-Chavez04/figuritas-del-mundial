import { createCanvas, loadImage } from '@napi-rs/canvas'
import fs from 'node:fs'

// crop.mjs <png> <x%> <y%> <w%> <h%> <out>
const [src, xp, yp, wp, hp, out] = process.argv.slice(2)
const img = await loadImage(fs.readFileSync(src))
const x = (Number(xp) / 100) * img.width
const y = (Number(yp) / 100) * img.height
const w = (Number(wp) / 100) * img.width
const h = (Number(hp) / 100) * img.height
const scale = 3
const canvas = createCanvas(w * scale, h * scale)
const ctx = canvas.getContext('2d')
ctx.imageSmoothingEnabled = true
ctx.drawImage(img, x, y, w, h, 0, 0, w * scale, h * scale)
fs.writeFileSync(out, canvas.toBuffer('image/png'))
console.log(out, `${Math.round(w * scale)}x${Math.round(h * scale)}`)
