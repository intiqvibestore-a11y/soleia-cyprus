import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const svgBuf = readFileSync(join(__dirname, 'public/icon.svg'))
const outDir = join(__dirname, 'public/icons')
mkdirSync(outDir, { recursive: true })

const icons = [
  { size: 72,  name: 'icon-72.png' },
  { size: 96,  name: 'icon-96.png' },
  { size: 128, name: 'icon-128.png' },
  { size: 144, name: 'icon-144.png' },
  { size: 152, name: 'icon-152.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 384, name: 'icon-384.png' },
  { size: 512, name: 'icon-512.png' },
]

for (const { size, name } of icons) {
  await sharp(svgBuf).resize(size, size).png().toFile(join(outDir, name))
  console.log(`✓ ${name}`)
}

// Also replace favicon.svg with the Soleia icon SVG
import { copyFileSync } from 'fs'
copyFileSync(join(__dirname, 'public/icon.svg'), join(__dirname, 'public/favicon.svg'))
console.log('✓ favicon.svg updated')
