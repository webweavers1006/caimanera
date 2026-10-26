/**
 * Generates the PWA icon set from the brand source icon.
 *
 * Usage: node scripts/generate-pwa-icons.mjs
 *
 * Source: public/img/caimanera_icon.png (512x512).
 * Output: public/icons/icon-192.png, icon-512.png and icon-maskable-512.png.
 *
 * The maskable variant pads the artwork on a canvas filled with the icon's own
 * corner color. That keeps the Android mask safe zone intact without a visible
 * border around the rounded square.
 */
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const SOURCE = path.join(ROOT, 'public/img/caimanera_icon.png')
const OUT_DIR = path.join(ROOT, 'public/icons')

const ANY_SIZES = [192, 512]
const MASKABLE_SIZE = 512
// Keep the artwork inside the maskable safe zone (80% of the canvas).
const MASKABLE_ARTWORK = Math.round(MASKABLE_SIZE * 0.74)

// Fallback matches --background of the dark theme (`oklch(0.17 0.022 280)`).
const THEME_BACKGROUND = { r: 13, g: 14, b: 25, alpha: 1 }

/**
 * Samples an opaque patch of the icon (top edge, away from the rounded
 * corners) so the maskable canvas blends with the artwork's own background.
 */
async function sampleOpaqueColor(input) {
  const patchSize = 8
  const { width = 512, height = 512 } = await sharp(input).metadata()
  const left = Math.max(0, Math.round(width / 2 - patchSize / 2))
  const top = 12

  const { data, info } = await sharp(input)
    .extract({ left, top, width: patchSize, height: patchSize })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  let r = 0
  let g = 0
  let b = 0
  let count = 0

  for (let index = 0; index < data.length; index += info.channels) {
    const alpha = data[index + 3]
    if (alpha < 200) continue
    r += data[index]
    g += data[index + 1]
    b += data[index + 2]
    count += 1
  }

  if (count === 0) return THEME_BACKGROUND

  return {
    r: Math.round(r / count),
    g: Math.round(g / count),
    b: Math.round(b / count),
    alpha: 1,
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const sourceMeta = await sharp(SOURCE).metadata()
  if (!sourceMeta.width || !sourceMeta.height) {
    throw new Error(`No se pudo leer el icono de origen: ${SOURCE}`)
  }

  for (const size of ANY_SIZES) {
    await sharp(SOURCE)
      .resize(size, size, { fit: 'cover' })
      .png({ compressionLevel: 9 })
      .toFile(path.join(OUT_DIR, `icon-${size}.png`))
    console.log(`✔ icon-${size}.png`)
  }

  const background = await sampleOpaqueColor(SOURCE)

  await sharp({
    create: {
      width: MASKABLE_SIZE,
      height: MASKABLE_SIZE,
      channels: 4,
      background,
    },
  })
    .composite([
      {
        input: await sharp(SOURCE)
          .resize(MASKABLE_ARTWORK, MASKABLE_ARTWORK, { fit: 'contain' })
          .png()
          .toBuffer(),
        gravity: 'center',
      },
    ])
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT_DIR, 'icon-maskable-512.png'))
  console.log('✔ icon-maskable-512.png')

  console.log(`\nIconos generados en ${path.relative(ROOT, OUT_DIR)}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
