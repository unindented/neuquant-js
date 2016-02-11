import NeuQuant from './neuquant'

function findClosest (palette, r, g, b) {
  let minpos = 0
  let mind = 256 * 256 * 256

  for (let i = 0, l = palette.length; i < l;) {
    const dr = r - palette[i++]
    const dg = g - palette[i++]
    const db = b - palette[i]
    const d = dr * dr + dg * dg + db * db
    const pos = i / 3 | 0

    if (d < mind) {
      mind = d
      minpos = pos
    }

    i++
  }

  return minpos
}

export function palette (pixels, options) {
  const nq = new NeuQuant(pixels, options)
  nq.buildColorMap()
  return nq.getColorMap()
}

export function indexed (pixels, palette) {
  const indexed = new Buffer(pixels.length / 3)
  const memo = {}

  for (let i = 0, j = 0, l = pixels.length; i < l;) {
    const r = pixels[i++]
    const g = pixels[i++]
    const b = pixels[i++]
    const k = r << 16 | g << 8 | b

    if (k in memo) {
      indexed[j++] = memo[k]
    } else {
      indexed[j++] = memo[k] = findClosest(palette, r, g, b)
    }
  }

  return indexed
}

export function quantize (pixels, options) {
  const p = palette(pixels, options)
  const i = indexed(pixels, p)

  return {
    palette: p,
    indexed: i
  }
}
