// Copies face-api model files from node_modules to public/models/
// Run once with: npm run models
import fs   from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SRC  = path.join(__dirname, '..', 'node_modules', '@vladmandic', 'face-api', 'model')
const DEST = path.join(__dirname, '..', 'public', 'models')

const FILES = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model.bin',
  'face_expression_model-weights_manifest.json',
  'face_expression_model.bin',
]

if (!fs.existsSync(DEST)) fs.mkdirSync(DEST, { recursive: true })

let copied = 0
for (const file of FILES) {
  const src  = path.join(SRC, file)
  const dest = path.join(DEST, file)
  if (fs.existsSync(dest)) {
    console.log(`  ✓  ${file}  (already there)`)
  } else if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest)
    console.log(`  ↓  ${file}  copied`)
    copied++
  } else {
    console.error(`  ✗  ${file}  not found in node_modules`)
    process.exit(1)
  }
}
console.log(copied ? `\nDone — ${copied} file(s) copied to public/models/` : '\nAll model files already in public/models/')
