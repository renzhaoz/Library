// A fragment object that represents no downsampling with no fragment
const NONE = Object.freeze({
  dimensionScale: 1,
  areaScale: 1,
  toString: () => '',
  scale: x => x
});

// Round to the nearest hundredth to combat floating point rounding errors
function round(x) {
  return Math.round(x * 100) / 100;
}

//
// A factory method for returning an object that represents a
// #-moz-samplesize media fragment. The use of Math.ceil() in the
// scale method is from jpeg_core_output_dimensions() in
// media/libjpeg/jdmaster.c and jdiv_round_up() in media/libjpeg/jutils.c
//
function MozSampleSize(n, scale) {
  return Object.freeze({
    dimensionScale: round(scale),
    areaScale: round(scale * scale),
    toString: () => `#-moz-samplesize=${n}`,
    scale: x => Math.ceil(x * scale)
  });
}

//
// The five possible #-moz-samplesize values.
// The mapping from sample size to scale comes from:
// the moz-samplesize code in /image/decoders/nsJPEGDecoder.cpp and
// the jpeg_core_output_dimensions() function in media/libjpeg/jdmaster.c
//
const fragments = [
  NONE,
  // samplesize=2 reduces size by 1/2 and area by 1/4, etc.
  MozSampleSize(2, 1 / 2),
  MozSampleSize(3, 3 / 8),
  MozSampleSize(4, 1 / 4),
  MozSampleSize(8, 1 / 8)
];

const Downsample = {
  // Return the fragment object that has the largest scale and downsamples the
  // dimensions of an image at least as much as the specified scale.
  // If none of the choices scales enough, return the one that comes closest
  sizeAtLeast: (scale) => {
    const newScale = round(scale);
    for (let i = 0; i < fragments.length; i++) {
      const f = fragments[i];
      if (f.dimensionScale <= newScale) {
        return f;
      }
    }
    return fragments[fragments.length - 1];
  },

  // Return the fragment object that downsamples an image as far as possible
  // without going beyond the specified scale. This might return NONE.
  sizeNoMoreThan: (scale) => {
    const newScale = round(scale);
    for (let i = fragments.length - 1; i >= 0; i--) {
      const f = fragments[i];
      if (f.dimensionScale >= newScale) {
        return f;
      }
    }
    return NONE;
  },

  // Return the fragment object that has the largest scale and downsamples the
  // area of an image at least as much as the specified scale.
  // If none of the choices scales enough, return the one that comes closest
  areaAtLeast: (scale) => {
    const newScale = round(scale);
    for (let i = 0; i < fragments.length; i++) {
      const f = fragments[i];
      if (f.areaScale <= newScale) {
        return f;
      }
    }
    return fragments[fragments.length - 1];
  },

  // Return the fragment object that downsamples the area of an image
  // as far as possible without going beyond the specified scale. This
  // might return NONE.
  areaNoMoreThan: (scale) => {
    const newScale = round(scale);
    for (let i = fragments.length - 1; i >= 0; i--) {
      const f = fragments[i];
      if (f.areaScale >= newScale) {
        return f;
      }
    }
    return NONE;
  }
};

export default Downsample;
