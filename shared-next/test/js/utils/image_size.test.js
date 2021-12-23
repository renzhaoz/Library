describe('utils js <image_size> test', () => {
  const oldFileReader = window.FileReader;
  beforeEach(done => {
    const { mockFileReader } = require('../../mock/fileReader_mock');
    window.FileReader = mockFileReader;
    require('../../../js/utils/blob/blobview');
    require('../../../js/utils/media/jpeg_metadata_parser');
    require('../../../js/utils/media/image_size');
    done();
  });

  // Test getImageSize
  test('getImageSize should be function', done => {
    expect(typeof getImageSize).toBe('function');
    done();
  });

  // Test getImageSize run (data.byteLength <= 8)
  test('test getImageSize run (data.byteLength <= 8)', done => {
    const successHandle = jest.fn();
    const errorHandle = jest.fn();
    const blob = new Blob(['he'], { type: 'text/plain' });
    getImageSize(blob, successHandle, errorHandle);

    expect(errorHandle.mock.calls.length).toBe(1);
    expect(errorHandle.mock.calls[0][0]).toBe('corrupt image file');
    done();
  });

  // Test getImageSize run (data.byteLength > 8,type is text)
  test('test getImageSize run (data.byteLength > 8,type is text)', done => {
    const successHandle = jest.fn();
    const errorHandle = jest.fn();
    const blob = new Blob(['hello,world'], { type: 'text/plain' });
    getImageSize(blob, successHandle, errorHandle);

    expect(errorHandle.mock.calls.length).toBe(1);
    expect(errorHandle.mock.calls[0][0]).toBe('unknown image type');
    done();
  });

  // Test getImageSize run (data.byteLength > 8,types are GIF, PNG and JPEG)
  test('test getImageSize run (data.byteLength > 8,types are GIF, PNG and JPEG)', done => {
    const spy = jest
      .spyOn(String, 'fromCharCode')
      .mockReturnValueOnce('GIF8')
      .mockReturnValueOnce('GIF8')
      .mockReturnValueOnce('\x89PNG\r\n\x1A\n')
      .mockReturnValueOnce('\x89PNG\r\n\x1A\n')
      .mockReturnValueOnce('BM')
      .mockReturnValueOnce('BM')
      .mockReturnValueOnce('\xFF\xD8')
      .mockReturnValueOnce('\xFF\xD8');

    const successHandle = jest.fn();
    const errorHandle = jest.fn();
    const data = new Uint8Array([71, 13, 10, 26, 10, 0, 0, 0, 13]);
    const blob1 = new Blob(data, { type: 'image/gif' });
    const blob2 = new Blob(data, { type: 'image/png' });
    const blob3 = new Blob(data, { type: 'image/bmp' });
    const blob4 = new Blob(data, { type: 'image/pjpeg' });
    const blob5 = new Blob(data, { type: 'image/jpeg' });

    getImageSize(blob1, successHandle, errorHandle);
    getImageSize(blob2, successHandle, errorHandle);
    getImageSize(blob3, successHandle, errorHandle);
    getImageSize(blob4, successHandle, errorHandle);
    getImageSize(blob5, successHandle, errorHandle);

    expect(spy).toBeCalledTimes(5);
    expect(successHandle).toBeCalledTimes(2);
    spy.mockRestore();
    done();
  });

  afterEach(() => {
    window.FileReader = oldFileReader;
  });
});
