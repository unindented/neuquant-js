import chai from 'chai'
import {NeuQuant} from '../src/'

import pixels from './fixtures/dekker.json'
import paletteDefaults from './fixtures/palette-defaults.json'
import paletteSamplefac5 from './fixtures/palette-samplefac-5.json'
import paletteNetsize16 from './fixtures/palette-netsize-16.json'

const expect = chai.expect
const slice = Array.prototype.slice

describe('NeuQuant', function () {
  let quantizer
  let palette

  this.timeout(20000)

  describe('with default options', function () {
    before(function () {
      quantizer = new NeuQuant(pixels.data)
      quantizer.buildColorMap()
      palette = quantizer.getColorMap()
    })

    it('builds a palette of the default size', function () {
      expect(palette.length).to.equal(256 * 3)
    })

    it('builds the expected palette', function () {
      expect(slice.call(palette, 0)).to.eql(paletteDefaults.data)
    })
  })

  describe('with custom sampling factor', function () {
    before(function () {
      quantizer = new NeuQuant(pixels.data, {samplefac: 5})
      quantizer.buildColorMap()
      palette = quantizer.getColorMap()
    })

    it('builds a palette of the default size', function () {
      expect(palette.length).to.equal(256 * 3)
    })

    it('builds the expected palette', function () {
      expect(slice.call(palette, 0)).to.eql(paletteSamplefac5.data)
    })
  })

  describe('with custom network size', function () {
    before(function () {
      quantizer = new NeuQuant(pixels.data, {netsize: 16})
      quantizer.buildColorMap()
      palette = quantizer.getColorMap()
    })

    it('builds a palette of the specified size', function () {
      expect(palette.length).to.equal(16 * 3)
    })

    it('builds the expected palette', function () {
      expect(slice.call(palette, 0)).to.eql(paletteNetsize16.data)
    })
  })
})
