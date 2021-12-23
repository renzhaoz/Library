describe('utils js <crop_resize_rotate> test', () => {
  window.URL.createObjectURL = jest.fn();

  beforeAll(done => {
    require('../../../js/utils/blob/blobview');
    require('../../../js/utils/media/image_size');
    require('../../../js/utils/media/jpeg_metadata_parser');
    require('../../../js/utils/media/downsample');
    require('../../../js/utils/media/crop_resize_rotate');
    done();
  });

  test('cropResizeRotate should be function', done => {
    expect(typeof cropResizeRotate).toBe('function');
    done();
  });

  // Test cropResizeRotate
  test('cropResizeRotate run test', done => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const handleDone = x => {
      console.warn(x);
    };
    // Arguments.length === 0
    expect(() => {
      cropResizeRotate();
    }).toThrowError('wrong number of arguments: 0');

    // Arguments.length === 1
    expect(() => {
      cropResizeRotate('blob');
    }).toThrowError('wrong number of arguments: 1');

    // Arguments.length === 2
    const data = new Uint8Array([71, 13, 10, 26, 10, 0, 0, 0, 13]);
    const blob1 = new Blob(data, { type: 'image/jpeg' });
    const blob2 = new Blob(data, { type: 'image/png' });
    cropResizeRotate(blob1, {});

    // Arguments.length === 3
    cropResizeRotate(blob1, { left: 2, top: 2, width: 2, height: 2 }, {});

    // Arguments.length === 4
    cropResizeRotate(
      blob1,
      { left: 2, top: 2, width: 2, height: 2 },
      { width: 8, height: 8 },
      ''
    );

    // Arguments.length === 5
    cropResizeRotate(
      blob1,
      { left: 2, top: 2, width: 2, height: 2 },
      { width: 8, height: 8 },
      'image/png',
      {}
    );

    /*
     * Arguments.length === 6
     * outputSize === null/undefined
     */
    cropResizeRotate(
      blob1,
      { left: 2, top: 2, width: 2, height: 2 },
      undefined,
      'image/png',
      { width: 20, height: 20, rotation: 180, mirrored: true },
      handleDone
    );

    // Typeof outputSize === 'number'  <=0
    cropResizeRotate(
      blob1,
      { left: 2, top: 2, width: 2, height: 2 },
      -8,
      'image/png',
      { width: 20, height: 20, rotation: 180 },
      handleDone
    );

    // Typeof outputSize === 'number'  >0 &fullsize < outputSize
    cropResizeRotate(
      blob2,
      { left: 2, top: 2, width: 2, height: 2 },
      1000,
      'image/png',
      { width: 20, height: 20, rotation: 90 },
      handleDone
    );

    // Typeof outputSize === 'number'  >0 &fullsize >outputSize
    cropResizeRotate(
      blob1,
      { left: 2, top: 2, width: 2, height: 2 },
      200,
      'image/png',
      { width: 20, height: 20, rotation: 270, mirrored: true },
      handleDone
    );

    cropResizeRotate(
      blob1,
      { left: 2, top: 2, width: 2, height: 2 },
      { width: 8, height: 8 },
      'image/png',
      {},
      handleDone
    );

    cropResizeRotate(
      blob1,
      { left: 6, top: 6, width: 6, height: 6 },
      { width: 12, height: 12 },
      'image/png',
      { width: 10, height: 20, rotation: 180 },
      handleDone
    );

    // OutputSize.width < 0 or  outputSize.height < 0
    cropResizeRotate(
      blob1,
      { left: 2, top: 2, width: 2, height: 2 },
      { width: 2, height: -2 },
      'image/png',
      { width: 6, height: 6, rotation: 60 },
      handleDone
    );

    // ScaleX > scaleY
    cropResizeRotate(
      blob1,
      { left: 2, top: 2, width: 2, height: 2 },
      { width: 1.8, height: 1 },
      'image/png',
      { width: 6, height: 6, rotation: 180 },
      handleDone
    );

    // ScaleX < scaleY
    cropResizeRotate(
      blob1,
      { left: 2, top: 2, width: 2, height: 2 },
      { width: 1, height: 1.8 },
      'image/png',
      { width: 6, height: 6, rotation: 180 },
      handleDone
    );

    // ScaleX === scaleY
    cropResizeRotate(
      blob1,
      { left: 2, top: 2, width: 2, height: 2 },
      { width: 2, height: 2 },
      'image/png',
      { width: 6, height: 6, rotation: 180 },
      handleDone
    );

    // OutputType && outputType !== JPEG && outputType !== PNG
    cropResizeRotate(
      blob1,
      { left: 2, top: 2, width: 2, height: 2 },
      { width: 2, height: 2 },
      'image/gif',
      { width: 6, height: 6, rotation: 180 },
      handleDone
    );

    cropResizeRotate(
      blob2,
      { left: 0, top: 0, width: 2, height: 2 },
      { width: 2, height: 2 },
      'image/png',
      { width: 2, height: 2, rotation: 0, mirrored: false },
      handleDone
    );
    expect(warnSpy).toBeCalledTimes(5);
    expect(window.URL.createObjectURL).toBeCalledTimes(7);
    warnSpy.mockRestore();
    done();
  });

  afterAll(done => {
    window.URL.createObjectURL.mockReset();
    done();
  });
});
