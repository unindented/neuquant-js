import chai from 'chai'
import {quantize} from '../src'

import pixels from './fixtures/dekker.json'
import paletteDefaults from './fixtures/palette-defaults.json'
import paletteSamplefac5 from './fixtures/palette-samplefac-5.json'
import paletteNetsize16 from './fixtures/palette-netsize-16.json'
import indexedDefaults from './fixtures/indexed-defaults.json'
import indexedSamplefac5 from './fixtures/indexed-samplefac-5.json'
import indexedNetsize16 from './fixtures/indexed-netsize-16.json'

const expect = chai.expect
const slice = Array.prototype.slice

describe('Helpers', function () {
  this.timeout(20000)

  describe('#quantize', function () {
    let palette
    let indexed

    describe('with default options', function () {
      before(function () {
        const data = quantize(pixels.data)
        palette = data.palette
        indexed = data.indexed
      })

      it('builds a palette of the default size', function () {
        expect(palette.length).to.equal(256 * 3)
      })

      it('builds the expected palette', function () {
        expect(slice.call(palette, 0)).to.eql(paletteDefaults.data)
      })

      it('builds an indexed image of the expected size', function () {
        expect(indexed.length).to.equal(pixels.data.length / 3)
      })

      it('builds the expected indexed image', function () {
        expect(slice.call(indexed, 0, 256)).to.eql(indexedDefaults.data.slice(0, 256))
      })
    })

    describe('with custom sampling factor', function () {
      before(function () {
        const data = quantize(pixels.data, {samplefac: 5})
        palette = data.palette
        indexed = data.indexed
      })

      it('builds a palette of the default size', function () {
        expect(palette.length).to.equal(256 * 3)
      })

      it('builds the expected palette', function () {
        expect(slice.call(palette, 0)).to.eql(paletteSamplefac5.data)
      })

      it('builds an indexed image of the expected size', function () {
        expect(indexed.length).to.equal(pixels.data.length / 3)
      })

      it('builds the expected indexed image', function () {
        expect(slice.call(indexed, 0, 256)).to.eql(indexedSamplefac5.data.slice(0, 256))
      })
    })

    describe('with custom network size', function () {
      before(function () {
        const data = quantize(pixels.data, {netsize: 16})
        palette = data.palette
        indexed = data.indexed
      })

      it('builds a palette of the specified size', function () {
        expect(palette.length).to.equal(16 * 3)
      })

      it('builds the expected palette', function () {
        expect(slice.call(palette, 0)).to.eql(paletteNetsize16.data)
      })

      it('builds an indexed image of the expected size', function () {
        expect(indexed.length).to.equal(pixels.data.length / 3)
      })

      it('builds the expected indexed image', function () {
        expect(slice.call(indexed, 0, 256)).to.eql(indexedNetsize16.data.slice(0, 256))
      })
    })
  })
})
