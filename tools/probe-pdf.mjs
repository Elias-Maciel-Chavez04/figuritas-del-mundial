import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import fs from 'node:fs'

const file = process.argv[2]
const maxPages = Number(process.argv[3] || 3)

const data = new Uint8Array(fs.readFileSync(file))
const doc = await getDocument({ data, useSystemFonts: true }).promise
console.log(`=== ${file}`)
console.log(`páginas: ${doc.numPages}`)

const upto = Math.min(maxPages, doc.numPages)
for (let i = 1; i <= upto; i++) {
  const page = await doc.getPage(i)
  const content = await page.getTextContent()
  const text = content.items.map((it) => it.str).join(' ').replace(/\s+/g, ' ').trim()
  console.log(`\n--- pág ${i} (${text.length} chars) ---`)
  console.log(text.slice(0, 800))
}
