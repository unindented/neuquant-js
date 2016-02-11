import {quantize} from './helpers'
import PixelStream from 'pixel-stream'

export default class NeuQuantStream extends PixelStream {
  constructor (width, height, options = {}) {
    super(width, height, options)

    this._options = options
    this._buffers = null
  }

  _start (done) {
    if (this.format.colorSpace !== 'rgb') {
      throw new Error('NeuQuantStream only accepts rgb input, got ' + this.format.colorSpace)
    }

    this.format.colorSpace = 'indexed'

    done()
  }

  _startFrame (frame, done) {
    this._buffers = []
    this.format.palette = frame.palette = new Buffer((this._options.netsize || 256) * 3)

    done()
  }

  _writePixels (chunk, done) {
    this._buffers.push(chunk)

    done()
  }

  _endFrame (done) {
    const data = Buffer.concat(this._buffers)
    const res = quantize(data, this._options)

    res.palette.copy(this.format.palette)
    this.push(res.indexed)

    done()
  }
}
