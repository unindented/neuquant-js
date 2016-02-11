# NeuQuant [![Version](https://img.shields.io/npm/v/neuquant-js.svg)](https://www.npmjs.com/package/neuquant-js) [![Build Status](https://img.shields.io/travis/unindented/neuquant-js.svg)](http://travis-ci.org/unindented/neuquant-js) [![Dependency Status](https://img.shields.io/gemnasium/unindented/neuquant-js.svg)](https://gemnasium.com/unindented/neuquant-js) [![Coverage Status](https://img.shields.io/coveralls/unindented/neuquant-js.svg)](https://coveralls.io/r/unindented/neuquant-js)

NeuQuant neural-network image quantization algorithm.


## Installation

Just run the following:

```
$ npm install --save neuquant-js
```

This assumes that you're using the [npm](http://npmjs.com/) package manager with a module bundler like [Webpack](http://webpack.github.io/) or [Browserify](http://browserify.org/).

If you don't yet use [npm](http://npmjs.com/) or a modern module bundler, and would rather prefer a single-file [UMD](https://github.com/umdjs/umd) build that makes `NeuQuant` available as a global object, you can build it yourself by running the following:

```
$ npm run build
```

You'll find the development (`neuquant.js`) and production (`neuquant.min.js`) versions of the library in the `dist` folder. I *don't* recommend this approach for any serious application.


## Examples

### Palette extraction (browser)

Here's an example extracting a palette of 16 colors from an image:

```js
import {palette} from 'neuquant-js'

const rgbToHex = (r, g, b) => {
  const hex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  return `#${hex}`
}

const extractPalette = (img) => {
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height

  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0)

  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  const colors = palette(data, {netsize: 16})

  const result = []
  for (let i = 0, l = colors.length; i < l;) {
    result.push(rgbToHex(colors[i++], colors[i++], colors[i++]))
  }
  return result
}

const img = document.createElement('img')
img.onload = (evt) => {
  console.log(extractPalette(evt.target))
}
img.src = '/image.png'
```

### Stream processing (Node)

Here's an example converting a PNG image to GIF, using a sampling factor of 1:

```js
import fs from 'fs'
import path from 'path'
import {Encoder as GIFEncoder} from 'gif-stream'
import {Decoder as PNGDecoder} from 'png-stream'
import {Stream as NeuQuantStream} from 'neuquant-js'

const src = path.resolve(__dirname, 'image.png')
const dest = path.resolve(__dirname, 'image.gif')

fs.createReadStream(src)
  .pipe(new PNGDecoder())
  .pipe(new NeuQuantStream(0, 0, {samplefac: 1}))
  .pipe(new GIFEncoder())
  .pipe(fs.createWriteStream(dest))
```


## API

### `palette (pixels, options)`

Returns a buffer containing a palette of RGB colors for the input image.

### `indexed (pixels, palette)`

Returns a new buffer containing the indexed pixel data for the input image using the given palette, which is a buffer obtained from the above method.

### `quantize (pixels, options)`

Combines the above two methods and returns an object containing both a palette buffer and the indexed pixel data at once.

### `Stream (width, height, options)`

You can pipe data to this stream, including multi-frame data, and it will produce an indexed output chunk for each frame. You can access the palette for each frame by listening for `frame` events on the stream.

### `NeuQuant (pixels, options)`

Underlying NeuQuant implementation.

### Options

* `netsize` (default *256*): Number of colors used.
* `samplefac` (default *10*): Sampling factor, which can be changed to increase or decrease quality at the expense of performance. The lower the number, the higher the quality.


## Meta

* Code: `git clone git://github.com/unindented/neuquant-js.git`
* Home: <https://github.com/unindented/neuquant-js/>


## Contributors

* Daniel Perez Alvarez ([unindented@gmail.com](mailto:unindented@gmail.com))


## License

Copyright (c) 2016 Daniel Perez Alvarez ([unindented.org](https://unindented.org/)). This is free software, and may be redistributed under the terms specified in the LICENSE file.
