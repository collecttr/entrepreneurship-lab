#!/usr/bin/env node
/**
 * Rasterize public/favicon.svg → apple-touch / PWA PNGs.
 * Opaque RGB (no alpha) — iOS Home Screen often falls back to a letter when the
 * touch icon is missing, HTML, or has awkward transparency at the corners.
 * Run: node scripts/generate-pwa-icons.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const svg = readFileSync(join(root, 'public/favicon.svg'))

/** Graphite plate — matches SVG gradient end / maskable bg. */
const PLATE = { r: 58, g: 58, b: 62 }

/** Full-bleed icon flattened to opaque RGB PNG (iOS-safe). */
async function writeFull(size, name) {
  const out = await sharp(svg)
    .resize(size, size)
    .flatten({ background: PLATE })
    .png({ palette: false })
    .toBuffer()
  writeFileSync(join(root, 'public', name), out)
  console.log('wrote', name, `${size}x${size}`, 'opaque-rgb')
}

/**
 * Maskable: flat graphite square + mark inset for safe zone.
 * SVG includes its own plate; we flatten onto solid square with padding.
 */
async function writeMaskable(size, name, padRatio = 0.18) {
  const pad = Math.round(size * padRatio)
  const inner = size - pad * 2
  const mark = await sharp(svg)
    .resize(inner, inner)
    .flatten({ background: PLATE })
    .png()
    .toBuffer()
  const out = await sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: PLATE,
    },
  })
    .composite([{ input: mark, left: pad, top: pad }])
    .flatten({ background: PLATE })
    .png({ palette: false })
    .toBuffer()
  writeFileSync(join(root, 'public', name), out)
  console.log('wrote', name, `${size}x${size}`, 'maskable opaque-rgb')
}

await writeFull(180, 'apple-touch-icon.png')
await writeFull(192, 'icon-192.png')
await writeFull(512, 'icon-512.png')
await writeMaskable(512, 'icon-512-maskable.png', 0.18)
console.log('done')
