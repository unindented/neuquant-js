/**
 * NeuQuant Neural-Network Quantization Algorithm
 *
 * Copyright (c) 1994 Anthony Dekker
 *
 * See "Kohonen neural networks for optimal colour quantization" in "Network:
 * Computation in Neural Systems" Vol. 5 (1994) pp 351-367. for a discussion of
 * the algorithm.
 *
 * See also http://members.ozemail.com.au/~dekker/NEUQUANT.HTML
 *
 * Any party obtaining a copy of these files from the author, directly or
 * indirectly, is granted, free of charge, a full and unrestricted irrevocable,
 * world-wide, paid up, royalty-free, nonexclusive right and license to deal in
 * this software and documentation files (the "Software"), including without
 * limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons who
 * receive copies from any such party to do so, with the only requirement being
 * that this copyright notice remain intact.
 *
 * Copyright (c) 2012 Johan Nordberg (JavaScript port)
 * Copyright (c) 2014 Devon Govett (JavaScript port)
 */

const prime1 = 499
const prime2 = 491
const prime3 = 487
const prime4 = 503

const maxprime = Math.max(prime1, prime2, prime3, prime4)
const minpicturebytes = (3 * maxprime)

const defaults = {
  ncycles: 100,
  netsize: 256,
  samplefac: 10
}

const assign = function (target) {
  for (let i = 1, l = arguments.length; i < l; i++) {
    const nextSource = arguments[i]
    if (nextSource != null) {
      for (const nextKey in nextSource) {
        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
          target[nextKey] = nextSource[nextKey]
        }
      }
    }
  }
  return target
}

export default class NeuQuant {
  constructor (pixels, options) {
    assign(this, defaults, {pixels}, options)

    if (this.netsize < 4 || this.netsize > 256) {
      throw new Error('Color count must be between 4 and 256')
    }

    if (this.samplefac < 1 || this.samplefac > 30) {
      throw new Error('Sampling factor must be between 1 and 30')
    }

    this.maxnetpos = this.netsize - 1

    this.netbiasshift = 4
    this.intbiasshift = 16
    this.intbias = (1 << this.intbiasshift)
    this.gammashift = 10
    this.gamma = (1 << this.gammashift)
    this.betashift = 10
    this.beta = (this.intbias >> this.betashift)
    this.betagamma = (this.beta * this.gamma)

    this.initrad = (this.netsize >> 3)
    this.radiusbiasshift = 6
    this.radiusbias = (1 << this.radiusbiasshift)
    this.initradius = (this.initrad * this.radiusbias)
    this.radiusdec = 30

    this.alphabiasshift = 10
    this.initalpha = (1 << this.alphabiasshift)

    this.radbiasshift = 8
    this.radbias = (1 << this.radbiasshift)
    this.alpharadbshift = (this.alphabiasshift + this.radbiasshift)
    this.alpharadbias = (1 << this.alpharadbshift)

    this.network = []
    this.netindex = new Uint32Array(256)
    this.bias = new Uint32Array(this.netsize)
    this.freq = new Uint32Array(this.netsize)
    this.radpower = new Uint32Array(this.netsize >> 3)

    for (let i = 0, l = this.netsize; i < l; i++) {
      let v = (i << (this.netbiasshift + 8)) / this.netsize
      this.network[i] = new Float64Array([v, v, v, 0])
      this.freq[i] = this.intbias / this.netsize
      this.bias[i] = 0
    }
  }

  unbiasnet () {
    for (let i = 0, l = this.netsize; i < l; i++) {
      this.network[i][0] >>= this.netbiasshift
      this.network[i][1] >>= this.netbiasshift
      this.network[i][2] >>= this.netbiasshift
      this.network[i][3] = i
    }
  }

  altersingle (alpha, i, b, g, r) {
    this.network[i][0] -= (alpha * (this.network[i][0] - b)) / this.initalpha
    this.network[i][1] -= (alpha * (this.network[i][1] - g)) / this.initalpha
    this.network[i][2] -= (alpha * (this.network[i][2] - r)) / this.initalpha
  }

  alterneigh (radius, i, b, g, r) {
    const lo = Math.abs(i - radius)
    const hi = Math.min(i + radius, this.netsize)

    let j = i + 1
    let k = i - 1
    let m = 1

    while ((j < hi) || (k > lo)) {
      const a = this.radpower[m++]

      if (j < hi) {
        const p = this.network[j++]
        p[0] -= (a * (p[0] - b)) / this.alpharadbias
        p[1] -= (a * (p[1] - g)) / this.alpharadbias
        p[2] -= (a * (p[2] - r)) / this.alpharadbias
      }

      if (k > lo) {
        const p = this.network[k--]
        p[0] -= (a * (p[0] - b)) / this.alpharadbias
        p[1] -= (a * (p[1] - g)) / this.alpharadbias
        p[2] -= (a * (p[2] - r)) / this.alpharadbias
      }
    }
  }

  contest (b, g, r) {
    let bestd = ~(1 << 31)
    let bestbiasd = bestd
    let bestpos = -1
    let bestbiaspos = bestpos

    for (let i = 0, l = this.netsize; i < l; i++) {
      let n = this.network[i]

      let dist = Math.abs(n[0] - b) + Math.abs(n[1] - g) + Math.abs(n[2] - r)
      if (dist < bestd) {
        bestd = dist
        bestpos = i
      }

      let biasdist = dist - ((this.bias[i]) >> (this.intbiasshift - this.netbiasshift))
      if (biasdist < bestbiasd) {
        bestbiasd = biasdist
        bestbiaspos = i
      }

      let betafreq = (this.freq[i] >> this.betashift)
      this.freq[i] -= betafreq
      this.bias[i] += (betafreq << this.gammashift)
    }

    this.freq[bestpos] += this.beta
    this.bias[bestpos] -= this.betagamma

    return bestbiaspos
  }

  inxbuild () {
    let previouscol = 0
    let startpos = 0

    for (let i = 0, l = this.netsize; i < l; i++) {
      let p = this.network[i]
      let q = null
      let smallpos = i
      let smallval = p[1]

      for (let j = i + 1; j < l; j++) {
        q = this.network[j]
        if (q[1] < smallval) {
          smallpos = j
          smallval = q[1]
        }
      }
      q = this.network[smallpos]

      if (i !== smallpos) {
        [p[0], q[0]] = [q[0], p[0]];
        [p[1], q[1]] = [q[1], p[1]];
        [p[2], q[2]] = [q[2], p[2]];
        [p[3], q[3]] = [q[3], p[3]]
      }

      if (smallval !== previouscol) {
        this.netindex[previouscol] = (startpos + i) >> 1
        for (let j = previouscol + 1; j < smallval; j++) {
          this.netindex[j] = i
        }
        previouscol = smallval
        startpos = i
      }
    }

    this.netindex[previouscol] = (startpos + this.maxnetpos) >> 1
    for (let i = previouscol + 1; i < 256; i++) {
      this.netindex[i] = this.maxnetpos
    }
  }

  learn () {
    const lengthcount = this.pixels.length
    const alphadec = 30 + ((this.samplefac - 1) / 3)
    const samplepixels = lengthcount / (3 * this.samplefac)

    let delta = samplepixels / this.ncycles | 0
    let alpha = this.initalpha
    let radius = this.initradius

    let rad = radius >> this.radiusbiasshift

    if (rad <= 1) {
      rad = 0
    }

    for (let i = 0; i < rad; i++) {
      this.radpower[i] = alpha * (((rad * rad - i * i) * this.radbias) / (rad * rad))
    }

    let step
    if (lengthcount < minpicturebytes) {
      this.samplefac = 1
      step = 3
    } else if ((lengthcount % prime1) !== 0) {
      step = 3 * prime1
    } else if ((lengthcount % prime2) !== 0) {
      step = 3 * prime2
    } else if ((lengthcount % prime3) !== 0) {
      step = 3 * prime3
    } else {
      step = 3 * prime4
    }

    let pix = 0

    for (let i = 0; i < samplepixels;) {
      let b = (this.pixels[pix] & 0xff) << this.netbiasshift
      let g = (this.pixels[pix + 1] & 0xff) << this.netbiasshift
      let r = (this.pixels[pix + 2] & 0xff) << this.netbiasshift

      let j = this.contest(b, g, r)
      this.altersingle(alpha, j, b, g, r)
      if (rad !== 0) {
        this.alterneigh(rad, j, b, g, r)
      }

      pix += step
      if (pix >= lengthcount) {
        pix -= lengthcount
      }

      if (delta === 0) {
        delta = 1
      }

      if (++i % delta === 0) {
        alpha -= alpha / alphadec
        radius -= radius / this.radiusdec
        rad = radius >> this.radiusbiasshift

        if (rad <= 1) {
          rad = 0
        }

        for (let k = 0; k < rad; k++) {
          this.radpower[k] = alpha * (((rad * rad - k * k) * this.radbias) / (rad * rad))
        }
      }
    }
  }

  buildColorMap () {
    this.learn()
    this.unbiasnet()
    this.inxbuild()
  }

  getColorMap () {
    const map = new Buffer(this.netsize * 3)
    const index = new Buffer(this.netsize)

    for (let i = 0, l = this.netsize; i < l; i++) {
      index[this.network[i][3]] = i
    }

    for (let i = 0, j = 0, k = 0, l = this.netsize; i < l; i++) {
      k = index[i]
      map[j++] = this.network[k][0] & 0xff
      map[j++] = this.network[k][1] & 0xff
      map[j++] = this.network[k][2] & 0xff
    }

    return map
  }
}
