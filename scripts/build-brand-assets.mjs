/**
 * Builds the brand raster assets from the master artwork.
 *
 * Usage: node scripts/build-brand-assets.mjs
 *
 * Source: public/img/logocaimanera.jpg (white/orange artwork over a flat green
 * plate). The plate is keyed out by un-compositing every pixel against the
 * background colour, which recovers a real alpha channel plus clean edges.
 *
 * Output:
 *  - public/img/caimanera-logo.png    full lockup, transparent, trimmed
 *  - public/img/caimanera-emblem.png  "ca" emblem only, transparent, square
 *  - public/img/caimanera_icon.png    512px app icon (emblem on brand green)
 *  - public/img/apple-touch-icon.png  180px iOS icon (full-bleed green)
 *  - src/app/icon.svg                 favicon, emblem embedded as data URI
 *
 * The PWA icon set is still produced by `node scripts/generate-pwa-icons.mjs`
 * from `caimanera_icon.png`.
 */
import sharp from 'sharp'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const SOURCE = path.join(ROOT, 'public/img/logocaimanera.jpg')
const OUT_DIR = path.join(ROOT, 'public/img')
const FAVICON = path.join(ROOT, 'src/app/icon.svg')

/** Brand green sampled from the master artwork's plate. */
const BRAND_GREEN = { r: 24, g: 94, b: 48 }
/** Corner radius of the app icon, as a fraction of its side. */
const ICON_RADIUS = 0.22
/** The lockup is decorative: 1200px covers 2x retina without shipping a 3MB file. */
const LOCKUP_WIDTH = 1200
/** The emblem is used as a badge (≤64px), so 512px is plenty. */
const EMBLEM_SIZE = 512

const round = (value) => Math.round(value)
const clampByte = (value) => Math.max(0, Math.min(255, round(value)))

/** Per-channel median of the image border: the plate is flat, so this is exact. */
function sampleBackground(data, { width, height, channels }) {
  const samples = [[], [], []]
  const strip = 24

  const push = (x, y) => {
    const index = (y * width + x) * channels
    for (let channel = 0; channel < 3; channel += 1) {
      samples[channel].push(data[index + channel])
    }
  }

  for (let y = 0; y < height; y += 3) {
    for (let dx = 0; dx < strip; dx += 3) {
      push(dx, y)
      push(width - 1 - dx, y)
    }
  }
  for (let x = 0; x < width; x += 3) {
    for (let dy = 0; dy < strip; dy += 3) {
      push(x, dy)
      push(x, height - 1 - dy)
    }
  }

  return samples.map((values) => {
    values.sort((a, b) => a - b)
    return values[Math.floor(values.length / 2)]
  })
}

/**
 * Finds the two ink colours of the artwork (white and orange) by taking the
 * most frequent quantised colour among pixels far from the plate.
 */
function sampleInks(data, info, background) {
  const { width, height, channels } = info
  const white = new Map()
  const orange = new Map()

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const index = (y * width + x) * channels
      const r = data[index]
      const g = data[index + 1]
      const b = data[index + 2]

      const distance = Math.hypot(r - background[0], g - background[1], b - background[2])
      if (distance < 90) continue

      const key = `${r >> 3},${g >> 3},${b >> 3}`
      if (r - b > 110 && r > 170) {
        orange.set(key, (orange.get(key) ?? 0) + 1)
      } else if (Math.min(r, g, b) > 170) {
        white.set(key, (white.get(key) ?? 0) + 1)
      }
    }
  }

  const pick = (histogram, fallback) => {
    let bestKey = null
    let bestCount = -1
    for (const [key, count] of histogram) {
      if (count > bestCount) {
        bestCount = count
        bestKey = key
      }
    }
    if (!bestKey) return fallback
    return bestKey.split(',').map((part) => Number(part) * 8 + 4)
  }

  return {
    white: pick(white, [250, 250, 250]),
    orange: pick(orange, [235, 120, 35]),
  }
}

/**
 * Un-composites the artwork from the plate.
 *
 * For each pixel we project the colour onto the line plate→ink for both inks and
 * keep the hypothesis with the lowest residual, which yields the coverage
 * (alpha). The colour is then decontaminated so the edge pixels resolve to the
 * ink colour instead of a plate-tinted mix.
 */
function keyOutPlate(data, info, background, inks) {
  const { width, height, channels } = info
  const rgba = Buffer.alloc(width * height * 4)

  const backgroundVector = background
  const hypotheses = [inks.white, inks.orange].map((ink) => {
    const vector = [ink[0] - backgroundVector[0], ink[1] - backgroundVector[1], ink[2] - backgroundVector[2]]
    const norm = vector[0] ** 2 + vector[1] ** 2 + vector[2] ** 2
    return { vector, norm }
  })

  for (let pixel = 0; pixel < width * height; pixel += 1) {
    const index = pixel * channels
    const r = data[index]
    const g = data[index + 1]
    const b = data[index + 2]
    const delta = [r - backgroundVector[0], g - backgroundVector[1], b - backgroundVector[2]]

    let best = null
    for (const hypothesis of hypotheses) {
      const { vector, norm } = hypothesis
      const alpha = (delta[0] * vector[0] + delta[1] * vector[1] + delta[2] * vector[2]) / norm
      const clipped = Math.max(0, Math.min(1, alpha))
      const residual = Math.hypot(
        delta[0] - clipped * vector[0],
        delta[1] - clipped * vector[1],
        delta[2] - clipped * vector[2],
      )
      if (!best || residual < best.residual) best = { alpha: clipped, residual }
    }

    // Kill JPEG ringing around the plate without eating real antialiasing.
    let alpha = best.alpha < 0.09 ? 0 : Math.min(1, (best.alpha - 0.09) / 0.91)

    const offset = pixel * 4
    if (alpha === 0) {
      rgba[offset] = 255
      rgba[offset + 1] = 255
      rgba[offset + 2] = 255
      rgba[offset + 3] = 0
      continue
    }

    rgba[offset] = clampByte((r - (1 - alpha) * backgroundVector[0]) / alpha)
    rgba[offset + 1] = clampByte((g - (1 - alpha) * backgroundVector[1]) / alpha)
    rgba[offset + 2] = clampByte((b - (1 - alpha) * backgroundVector[2]) / alpha)
    rgba[offset + 3] = round(alpha * 255)
  }

  return rgba
}

/** Bounding box of the pixels above `threshold` alpha, optionally row-limited. */
function contentBox(rgba, width, height, { fromRow = 0, toRow = height, threshold = 12 } = {}) {
  let left = width
  let right = -1
  let top = -1
  let bottom = -1

  for (let y = fromRow; y < toRow; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (rgba[(y * width + x) * 4 + 3] <= threshold) continue
      if (x < left) left = x
      if (x > right) right = x
      if (top === -1) top = y
      bottom = y
    }
  }

  return { left, top, width: right - left + 1, height: bottom - top + 1 }
}

/** Splits the lockup into vertical bands of ink separated by empty gaps. */
function findBands(rgba, width, height, threshold = 12) {
  const bands = []
  let start = -1

  for (let y = 0; y < height; y += 1) {
    let inked = false
    for (let x = 0; x < width; x += 1) {
      if (rgba[(y * width + x) * 4 + 3] > threshold) {
        inked = true
        break
      }
    }
    if (inked && start === -1) start = y
    if (!inked && start !== -1) {
      bands.push({ top: start, bottom: y - 1 })
      start = -1
    }
  }
  if (start !== -1) bands.push({ top: start, bottom: height - 1 })

  return bands
}

/** Extracts a sub-image and pads it into a square canvas. */
async function squareIcon(rgba, width, height, box, { canvas, artwork, background = { ...BRAND_GREEN, alpha: 1 } }) {
  const crop = await sharp(rgba, { raw: { width, height, channels: 4 } })
    .extract(box)
    .resize(artwork, artwork, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  return sharp({
    create: { width: canvas, height: canvas, channels: 4, background },
  })
    .composite([{ input: crop, gravity: 'center' }])
    .png()
    .toBuffer()
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const { data, info } = await sharp(SOURCE).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const background = sampleBackground(data, info)
  const inks = sampleInks(data, info, background)
  console.log('plate', background, 'inks', inks)

  const rgba = keyOutPlate(data, info, background, inks)
  const { width, height } = info
  const fullBox = contentBox(rgba, width, height)
  const bands = findBands(rgba, width, height)
  console.log('bands', bands)

  // Lockup: trimmed with a small even margin.
  const margin = Math.round(Math.min(fullBox.width, fullBox.height) * 0.03)
  const lockup = await sharp(rgba, { raw: { width, height, channels: 4 } })
    .extract(fullBox)
    .extend({ top: margin, bottom: margin, left: margin, right: margin, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize({ width: LOCKUP_WIDTH, withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true, quality: 90 })
    .toFile(path.join(OUT_DIR, 'caimanera-logo.png'))
  console.log('✔ caimanera-logo.png', `${lockup.width}x${lockup.height}`)

  // Emblem: first band (the "ca" monogram plus the runner), centred on a square.
  const emblemBand = bands[0]
  const emblemBox = contentBox(rgba, width, height, { fromRow: emblemBand.top, toRow: emblemBand.bottom + 1 })
  const emblem = await squareIcon(rgba, width, height, emblemBox, {
    canvas: EMBLEM_SIZE,
    artwork: Math.round(EMBLEM_SIZE * 0.88),
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  }).then((buffer) => sharp(buffer).png({ compressionLevel: 9, palette: true, quality: 90 }).toBuffer())
  await writeFile(path.join(OUT_DIR, 'caimanera-emblem.png'), emblem)
  console.log('✔ caimanera-emblem.png', `${EMBLEM_SIZE}x${EMBLEM_SIZE}`)

  // App icon: emblem on the brand plate, rounded like the previous icon.
  const iconSize = 512
  const iconArtwork = Math.round(iconSize * 0.74)
  const iconBody = await squareIcon(rgba, width, height, emblemBox, { canvas: iconSize, artwork: iconArtwork })
  const radius = Math.round(iconSize * ICON_RADIUS)
  const roundedMask = Buffer.from(
    `<svg width="${iconSize}" height="${iconSize}"><rect width="${iconSize}" height="${iconSize}" rx="${radius}" ry="${radius}" fill="#fff"/></svg>`,
  )
  await sharp(iconBody)
    .composite([{ input: roundedMask, blend: 'dest-in' }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT_DIR, 'caimanera_icon.png'))
  console.log('✔ caimanera_icon.png 512x512')

  // iOS applies its own mask, so this one is full-bleed.
  const touchSize = 180
  await sharp(await squareIcon(rgba, width, height, emblemBox, { canvas: touchSize, artwork: Math.round(touchSize * 0.76) }))
    .flatten({ background: BRAND_GREEN })
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT_DIR, 'apple-touch-icon.png'))
  console.log('✔ apple-touch-icon.png 180x180')

  // Favicon: same rounded plate, emblem embedded so the SVG stays standalone.
  const faviconSize = 64
  const faviconBody = await squareIcon(rgba, width, height, emblemBox, { canvas: 256, artwork: Math.round(256 * 0.74) })
  const faviconPng = await sharp(faviconBody)
    .resize(faviconSize, faviconSize)
    .png({ compressionLevel: 9 })
    .toBuffer()
  const faviconRadius = Math.round(faviconSize * ICON_RADIUS)
  await writeFile(
    FAVICON,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${faviconSize} ${faviconSize}" role="img" aria-label="Caimanera">\n` +
      `  <defs>\n` +
      `    <clipPath id="plate"><rect width="${faviconSize}" height="${faviconSize}" rx="${faviconRadius}" ry="${faviconRadius}"/></clipPath>\n` +
      `  </defs>\n` +
      `  <g clip-path="url(#plate)">\n` +
      `    <image width="${faviconSize}" height="${faviconSize}" href="data:image/png;base64,${faviconPng.toString('base64')}"/>\n` +
      `  </g>\n` +
      `</svg>\n`,
  )
  console.log('✔ src/app/icon.svg')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
