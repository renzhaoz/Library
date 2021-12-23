describe('utils js <image_utils> test', () => {
  const oldFileReader = window.FileReader;
  const oldImage = window.Image;
  function FileReader() {}
  FileReader.prototype = {
    readAsArrayBuffer: x => {
      return x;
    },
    set onloadend(cb) {
      cb.call(this);
    },
    get result() {
      return new ArrayBuffer(32);
    }
  };
  window.FileReader = FileReader;

  window.URL.createObjectURL = jest.fn(() => {
    return '../test.png';
  });

  function Image() {}
  Image.prototype = {
    set onload(cb) {
      cb();
    }
  };
  window.Image = Image;

  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

  beforeAll(done => {
    require('../../../js/utils/media/downsample');
    require('../../../js/utils/media/image_utils');
    done();
  });

  // ImageUtils test
  test('ImageUtils test', done => {
    const {
      JPEG,
      PNG,
      GIF,
      BMP,
      getSizeAndType,
      resizeAndCropToCover,
      Downsample
    } = ImageUtils;
    expect(typeof JPEG).toBe('string');
    expect(typeof PNG).toBe('string');
    expect(typeof GIF).toBe('string');
    expect(typeof BMP).toBe('string');
    expect(typeof getSizeAndType).toBe('function');
    expect(typeof resizeAndCropToCover).toBe('function');
    expect(typeof Downsample).toBe('object');
    expect(typeof ImageUtils).toBe('object');
    done();
  });

  // Test getSizeAndType
  test('Test getSizeAndType', done => {
    expect.assertions(4);
    ImageUtils.getSizeAndType('test').catch(e => {
      expect(e.message).toBe('argument is not a Blob');
    });

    // ImageBlob.size <= 16
    const data1 = new Uint8Array([71, 13]);
    const blob1 = new Blob(data1, { type: 'image/gif' });
    ImageUtils.getSizeAndType(blob1).catch(e => {
      expect(e.message).toBe('corrupt image file');
    });

    // ImageBlob.size > 16
    const data2 = new Uint8Array([2, 3, 8, 7, 13, 10, 26, 10, 0, 0, 0, 13]);
    const blob2 = new Blob(data2, { type: 'image/bmp' });
    ImageUtils.getSizeAndType(blob2).catch(e => {
      expect(e).toBe('unknown image type');
    });
    const data3 = { hello: 'world' };
    const blob3 = new Blob([JSON.stringify(data3, null, 2)], {
      type: 'application/json'
    });
    ImageUtils.getSizeAndType(blob3).catch(e => {
      expect(e).toBe('unknown image type');
    });
    done();
  });

  // Test Downsample
  test('test Downsample', done => {
    // Test Downsample.NONE
    const strValue = ImageUtils.Downsample.NONE.toString();
    const scaleValue = ImageUtils.Downsample.NONE.scale(1);
    expect(strValue).toBe('');
    expect(scaleValue).toBe(1);

    // Test Downsample.MAX_SIZE_REDUCTION & Downsample.MAX_AREA_REDUCTION
    const maxSize = ImageUtils.Downsample.MAX_SIZE_REDUCTION;
    const maxArea = ImageUtils.Downsample.MAX_AREA_REDUCTION;
    expect(maxSize).toBe(7.692307692307692);
    expect(maxArea).toBe(50);

    // Test Downsample.sizeAtLeast
    const val1 = ImageUtils.Downsample.sizeAtLeast(3);
    expect(val1.dimensionScale).toBe(1);
    expect(val1.areaScale).toBe(1);
    expect(val1.toString()).toBe('');
    expect(val1.scale(5)).toBe(5);

    const val2 = ImageUtils.Downsample.sizeAtLeast(0.1);
    expect(val2.dimensionScale).toBe(0.13);
    expect(val2.areaScale).toBe(0.02);
    expect(val2.toString()).toBe('#-moz-samplesize=8');
    expect(val2.scale(5)).toBe(1);

    // Test Downsample.sizeNoMoreThan
    const val3 = ImageUtils.Downsample.sizeNoMoreThan(9);
    expect(val3).toStrictEqual(ImageUtils.Downsample.NONE);
    expect(val3.dimensionScale).toBe(1);
    expect(val3.areaScale).toBe(1);
    expect(val3.toString()).toBe('');
    expect(val3.scale(9)).toBe(9);

    const val4 = ImageUtils.Downsample.sizeNoMoreThan(0.5);
    expect(val4.dimensionScale).toBe(0.5);
    expect(val4.areaScale).toBe(0.25);
    expect(val4.toString()).toBe('#-moz-samplesize=2');
    expect(val4.scale(5)).toBe(3);

    // Test Downsample.areaAtLeast
    const val5 = ImageUtils.Downsample.areaAtLeast(20);
    expect(val5.dimensionScale).toBe(1);
    expect(val5.areaScale).toBe(1);
    expect(val5.toString()).toBe('');
    expect(val5.scale(6)).toBe(6);

    const val6 = ImageUtils.Downsample.areaAtLeast(0.0013);
    expect(val6.dimensionScale).toBe(0.13);
    expect(val6.areaScale).toBe(0.02);
    expect(val6.toString()).toBe('#-moz-samplesize=8');
    expect(val6.scale(5)).toBe(1);

    // Test Downsample.areaNoMoreThan
    const val7 = ImageUtils.Downsample.areaNoMoreThan(13);
    expect(val7).toStrictEqual(ImageUtils.Downsample.NONE);
    expect(val7.dimensionScale).toBe(1);
    expect(val7.areaScale).toBe(1);
    expect(val7.toString()).toBe('');
    expect(val7.scale(9)).toBe(9);

    const val8 = ImageUtils.Downsample.areaNoMoreThan(0.25);
    expect(val8.dimensionScale).toBe(0.5);
    expect(val8.areaScale).toBe(0.25);
    expect(val8.toString()).toBe('#-moz-samplesize=2');
    expect(val8.scale(5)).toBe(3);
    done();
  });

  // Test resizeAndCropToCover
  test('Test resizeAndCropToCover', done => {
    ImageUtils.resizeAndCropToCover('test').catch(e => {
      expect(e.message).toBe('invalid output dimensions');
    });
    const data1 = new Uint8Array([9, 71, 13, 10, 26, 10, 0, 0, 0, 13]);
    const blob1 = new Blob(data1, { type: 'image/gif' });
    const blob2 = new Blob(data1, { type: 'image/jpeg' });
    ImageUtils.resizeAndCropToCover(blob1, 65.9, 83.2, 'BMP').catch(data => {
      return data;
    });
    ImageUtils.resizeAndCropToCover(blob2, 65.9, 83.2).catch(data => {
      return data;
    });
    expect.assertions(1);
    done();
  });

  afterAll(done => {
    window.FileReader = oldFileReader;
    window.Image = oldImage;
    window.URL.createObjectURL.mockReset();
    warnSpy.mockRestore();
    done();
  });
});
