import chai from 'chai'
import {Stream as NeuQuantStream} from '../src/'

import pixels from './fixtures/dekker.json'

const expect = chai.expect

describe('Stream', function () {
  let stream

  this.timeout(20000)

  describe('with default options', function () {
    before(function () {
      stream = new NeuQuantStream(510, 383)
    })

    it('quantizes the image', function (done) {
      stream.on('frame', function (frame) {
        expect(frame.palette.length).to.equal(256 * 3)
        done()
      })
      stream.end(new Buffer(pixels.data))
    })
  })

  describe('with custom sampling factor', function () {
    before(function () {
      stream = new NeuQuantStream(510, 383, {samplefac: 5})
    })

    it('quantizes the image', function (done) {
      stream.on('frame', function (frame) {
        expect(frame.palette.length).to.equal(256 * 3)
        done()
      })
      stream.end(new Buffer(pixels.data))
    })
  })

  describe('with custom network size', function () {
    before(function () {
      stream = new NeuQuantStream(510, 383, {netsize: 16})
    })

    it('quantizes the image', function (done) {
      stream.on('frame', function (frame) {
        expect(frame.palette.length).to.equal(16 * 3)
        done()
      })
      stream.end(new Buffer(pixels.data))
    })
  })
})
