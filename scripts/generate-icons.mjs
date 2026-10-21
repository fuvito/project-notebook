#!/usr/bin/env node
// Generates icon16.png, icon48.png, icon128.png in public/
// Uses only Node.js built-ins — no extra dependencies.

import { deflateSync } from 'zlib'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const publicDir = resolve(dirname(fileURLToPath(import.meta.url)), '../public')
mkdirSync(publicDir, { recursive: true })

// ── Minimal PNG encoder ───────────────────────────────────────────────────────

const CRC_TABLE = new Uint32Array(256)
for (let i = 0; i < 256; i++) {
  let c = i
  for (let j = 0; j < 8; j++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
  CRC_TABLE[i] = c >>> 0
}

function crc32(buf) {
  let c = 0xFFFFFFFF
  for (let i = 0; i < buf.length; i++) c = (CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8)) >>> 0
  return (c ^ 0xFFFFFFFF) >>> 0
}

function pngChunk(type, data) {
  const t = Buffer.from(type, 'ascii')
  const d = Buffer.isBuffer(data) ? data : Buffer.from(data)
  const len = Buffer.allocUnsafe(4); len.writeUInt32BE(d.length, 0)
  const crc = Buffer.allocUnsafe(4); crc.writeUInt32BE(crc32(Buffer.concat([t, d])), 0)
  return Buffer.concat([len, t, d, crc])
}

function encodePng(size, rgba) {
  const ihdr = Buffer.allocUnsafe(13)
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = ihdr[11] = ihdr[12] = 0

  const stride = size * 4
  const raw = Buffer.allocUnsafe(size * (1 + stride))
  for (let y = 0; y < size; y++) {
    raw[y * (1 + stride)] = 0
    rgba.copy(raw, y * (1 + stride) + 1, y * stride, (y + 1) * stride)
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

// ── Drawing helpers ───────────────────────────────────────────────────────────

function createImage(size) {
  const buf = Buffer.alloc(size * size * 4, 0)

  function setPixel(x, y, r, g, b, a = 255) {
    const xi = Math.round(x), yi = Math.round(y)
    if (xi < 0 || xi >= size || yi < 0 || yi >= size) return
    const i = (yi * size + xi) * 4
    const sA = a / 255, dA = buf[i + 3] / 255
    const oA = sA + dA * (1 - sA)
    if (oA < 0.001) return
    buf[i]     = Math.round((r * sA + buf[i]     * dA * (1 - sA)) / oA)
    buf[i + 1] = Math.round((g * sA + buf[i + 1] * dA * (1 - sA)) / oA)
    buf[i + 2] = Math.round((b * sA + buf[i + 2] * dA * (1 - sA)) / oA)
    buf[i + 3] = Math.round(oA * 255)
  }

  function fillRoundRect(x, y, w, h, radius, r, g, b, a = 255) {
    for (let py = y; py <= y + h; py++) {
      for (let px = x; px <= x + w; px++) {
        const lx = px - x, ly = py - y
        if (lx < 0 || lx > w || ly < 0 || ly > h) continue

        let dx = 0, dy = 0, inCorner = false
        if      (lx < radius && ly < radius)         { dx = radius - lx; dy = radius - ly; inCorner = true }
        else if (lx > w - radius && ly < radius)     { dx = lx - (w - radius); dy = radius - ly; inCorner = true }
        else if (lx < radius && ly > h - radius)     { dx = radius - lx; dy = ly - (h - radius); inCorner = true }
        else if (lx > w - radius && ly > h - radius) { dx = lx - (w - radius); dy = ly - (h - radius); inCorner = true }

        let alpha = a
        if (inCorner) {
          const dist = Math.hypot(dx, dy)
          if (dist > radius + 0.5) continue
          if (dist > radius - 0.5) alpha = Math.round(a * (radius + 0.5 - dist))
        }
        setPixel(px, py, r, g, b, alpha)
      }
    }
  }

  function fillRect(x, y, w, h, r, g, b, a = 255) {
    for (let py = y; py < y + h; py++)
      for (let px = x; px < x + w; px++)
        setPixel(px, py, r, g, b, a)
  }

  return { buf, fillRoundRect, fillRect }
}

// ── Icon design ───────────────────────────────────────────────────────────────
// Indigo background, white bold "N" centered

const BRAND = [79, 70, 229]   // #4F46E5  indigo-600
const WHITE = [255, 255, 255]

function drawIcon(size) {
  const img = createImage(size)
  const { buf, fillRoundRect, fillRect } = img
  const s = size

  // Background — rounded square
  const radius = Math.round(s * 0.20)
  fillRoundRect(0, 0, s - 1, s - 1, radius, ...BRAND)

  // Subtle inner highlight along top edge
  if (s >= 48) {
    fillRoundRect(0, 0, s - 1, Math.round(s * 0.45), radius, 108, 99, 240, 35)
  }

  // White "N"
  //  • Two vertical strokes at ~15% and ~67% from left, each ~18% wide, ~64% tall
  //  • Diagonal from top of left stroke to bottom of right stroke
  const top     = Math.round(s * 0.18)
  const bot     = Math.round(s * 0.82)
  const height  = bot - top
  const strokeW = Math.max(2, Math.round(s * 0.18))
  const lX      = Math.round(s * 0.15)
  const rX      = s - lX - strokeW

  // Left vertical
  fillRect(lX, top, strokeW, height, ...WHITE)
  // Right vertical
  fillRect(rX, top, strokeW, height, ...WHITE)

  // Diagonal: from (lX + strokeW, top) to (rX, bot), drawn as overlapping tiles
  const dxTotal = rX - (lX + strokeW)
  const dyTotal = height
  const steps   = Math.max(dxTotal, dyTotal)
  for (let i = 0; i <= steps; i++) {
    const t  = i / steps
    const px = Math.round(lX + strokeW + t * dxTotal)
    const py = Math.round(top + t * dyTotal)
    fillRect(px, py, Math.max(1, Math.round(strokeW * 0.9)), Math.max(1, Math.round(strokeW * 0.55)), ...WHITE)
  }

  return buf
}

// ── Generate files ────────────────────────────────────────────────────────────

for (const size of [16, 48, 128]) {
  const pixels = drawIcon(size)
  const png    = encodePng(size, pixels)
  const path   = resolve(publicDir, `icon${size}.png`)
  writeFileSync(path, png)
  console.log(`✓  public/icon${size}.png  (${png.length} B)`)
}
