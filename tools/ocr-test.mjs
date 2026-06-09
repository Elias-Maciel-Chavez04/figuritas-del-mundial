import { createWorker } from 'tesseract.js'

const file = process.argv[2]
const worker = await createWorker('eng')
const { data } = await worker.recognize(file)
console.log(data.text)
await worker.terminate()
