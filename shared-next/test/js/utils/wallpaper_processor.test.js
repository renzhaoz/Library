describe('utils js <wallpaper_processor> test', () => {
  const { mockB2gNavigator } = require('../../mock/b2g_navigator_mock');
  const { mockFileReader } = require('../../mock/fileReader_mock');
  window.navigator.b2g = {};
  require('../../mock/navigator_getDeviceStorage_mock');
  mockB2gNavigator(window, 'getDeviceStorage', MockGetDeviceStorage);
  const mockgetDeviceStorages = () => { return [MockGetDeviceStorage()] };
  mockB2gNavigator(window, 'getDeviceStorages', mockgetDeviceStorages);
  const oldFileReader = window.FileReader;
  window.FileReader = mockFileReader;
  const oldImage = window.Image;
  const mockImage = {
    onload: jest.fn(),
    onerror: jest.fn()
  };
  window.Image = function() {
    return mockImage;
  };
  window.URL.createObjectURL = jest.fn(() => {
    return '../test.jpg';
  });
  window.URL.revokeObjectURL = jest.fn(() => {
    return '';
  });

  window.HTMLCanvasElement.prototype.toBlob = jest.fn(cb => {
    cb();
  });

  beforeAll(done => {
    require('../../mock/lazyLoader_mock');
    require('../../mock/device_capability_manager_mock');
    require('../../../js/utils/device_storage/get_storage_if_available');
    require('../../../js/utils/blob/blobview');
    require('../../../js/utils/media/jpeg_metadata_parser');
    require('../../../js/utils/media/image_size');
    require('../../../js/utils/media/downsample');
    require('../../../js/utils/media/wallpaper_processor');
    done();
  });

  // Test WallpaperProcessor
  test('WallpaperProcessor test', done => {
    const {
      LOW_MEMORY_VALUE,
      MAX_IMAGE_PIXEL_SIZE,
      LOW_MAX_IMAGE_PIXEL_SIZE,
      LOW_MAX_IMAGE_PIXEL_SIZE_NO_JPEG,
      MAX_UNKNOWN_IMAGE_SIZE,
      MIN_UNKNOWN_IMAGE_SIZE,
      WALLPAPER_IMAGE_PATCH,
      WALLPAPER_SETTINGS_KEY,
      SCREEN_WIDTH,
      SCREEN_HEIGHT,
      lowMemory,
      storageType,
      errorMessages,
      offscreenImage,
      offscreenImageURL,
      getDeviceStorageByFileName,
      getFileBlob,
      saveBlob,
      cropBlob,
      getDownResolutionBlob,
      getWallpaperBlob,
      setWallpaper,
      init,
      cleanupImage
    } = WallpaperProcessor;
    expect(typeof WallpaperProcessor).toBe('object');
    expect(typeof LOW_MEMORY_VALUE).toBe('number');
    expect(typeof MAX_IMAGE_PIXEL_SIZE).toBe('number');
    expect(typeof LOW_MAX_IMAGE_PIXEL_SIZE).toBe('number');
    expect(typeof LOW_MAX_IMAGE_PIXEL_SIZE_NO_JPEG).toBe('number');
    expect(typeof MAX_UNKNOWN_IMAGE_SIZE).toBe('number');
    expect(typeof MIN_UNKNOWN_IMAGE_SIZE).toBe('number');
    expect(typeof WALLPAPER_IMAGE_PATCH).toBe('string');
    expect(typeof WALLPAPER_SETTINGS_KEY).toBe('string');
    expect(typeof SCREEN_WIDTH).toBe('number');
    expect(typeof SCREEN_HEIGHT).toBe('number');
    expect(typeof lowMemory).toBe('object');
    expect(typeof storageType).toBe('object');
    expect(typeof errorMessages).toBe('object');
    expect(typeof offscreenImage).toBe('object');
    expect(typeof offscreenImageURL).toBe('object');
    expect(typeof getDeviceStorageByFileName).toBe('function');
    expect(typeof getFileBlob).toBe('function');
    expect(typeof saveBlob).toBe('function');
    expect(typeof cropBlob).toBe('function');
    expect(typeof getDownResolutionBlob).toBe('function');
    expect(typeof getWallpaperBlob).toBe('function');
    expect(typeof setWallpaper).toBe('function');
    expect(typeof init).toBe('function');
    expect(typeof cleanupImage).toBe('function');
    done();
  });

  // Test getDeviceStorageByFileName
  test('test getDeviceStorageByFileName', done => {
    const fileName1 = '../../../js/utils/media/wallpaper_processor';
    const value1 = WallpaperProcessor.getDeviceStorageByFileName(fileName1);
    const fileName2 = './sdcard';
    const value2 = WallpaperProcessor.getDeviceStorageByFileName(fileName2);

    expect(typeof value2).toBe('object');
    expect(value2).not.toBeNull();
    expect(value1).toBeNull();
    done();
  });

  // Test getFileBlob
  test('test getFileBlob', async done => {
    expect.assertions(2);
    const fileName1 = '../../../js/utils/media/wallpaper_processor';
    const fileName2 = './sdcard';
    await expect(WallpaperProcessor.getFileBlob(fileName1)).rejects.toEqual(
      'image-invalid'
    );
    await expect(WallpaperProcessor.getFileBlob(fileName2)).resolves.toEqual({
      name: './sdcard',
      size: 1
    });
    done();
  });

  // Test saveBlob
  test('test saveBlob', async done => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const blob = new Blob(['he'], { type: 'text/plain' });
    await expect(WallpaperProcessor.saveBlob(blob)).rejects.toEqual(
      'not-enough-storage'
    );
    expect(spy).toBeCalledTimes(0);
    spy.mockRestore();
    done();
  });

  // Test getDownResolutionBlob , WallpaperProcessor.lowMemory = true , getImageSize->successHandle
  test('test getDownResolutionBlob', done => {
    WallpaperProcessor.lowMemory = true;
    const spy = jest.spyOn(String, 'fromCharCode').mockReturnValueOnce('GIF8');
    const data = new Uint8Array([71, 13, 10, 26, 10, 0, 0, 0, 13]);
    const blob = new Blob(data, { type: 'image/gif' });
    WallpaperProcessor.getDownResolutionBlob(blob);
    expect(window.URL.revokeObjectURL.mock.calls.length).toBe(0);
    expect(window.URL.createObjectURL.mock.calls.length).toBe(1);
    expect(spy).toBeCalledTimes(1);
    spy.mockRestore();
    done();
  });

  // Test getDownResolutionBlob , WallpaperProcessor.lowMemory = false, getImageSize->successHandle
  test('test getDownResolutionBlob', done => {
    WallpaperProcessor.lowMemory = false;
    const spy = jest.spyOn(String, 'fromCharCode').mockReturnValueOnce('GIF8');
    const data = new Uint8Array([71, 13, 10, 26, 10, 0, 0, 0, 13]);
    const blob = new Blob(data, { type: 'image/gif' });
    WallpaperProcessor.getDownResolutionBlob(blob);
    mockImage.onload();
    expect(window.URL.revokeObjectURL.mock.calls.length).toBe(1);
    expect(window.URL.createObjectURL.mock.calls.length).toBe(2);
    expect(spy).toBeCalledTimes(1);
    spy.mockRestore();
    done();
  });

  // Test getWallpaperBlob
  test('test getWallpaperBlob', done => {
    const getSuccess = jest.fn();
    const getError = jest.fn();
    WallpaperProcessor.getWallpaperBlob(
      '/sdcard/.wallpaper/custom_wallpaper.jpg',
      getSuccess,
      getError
    );
    expect(getSuccess.mock.calls.length).toBe(0);
    done();
  });

  // Test setWallpaper
  test('test setWallpaper', done => {
    const setSuccess = jest.fn();
    const setError = jest.fn();
    WallpaperProcessor.setWallpaper('./sdcard', setSuccess, setError);
    expect(setSuccess.mock.calls.length).toBe(0);
    done();
  });

  // Test getDownResolutionBlob ,getImageSize->errorHandle
  test('test getDownResolutionBlob', async done => {
    const spyClean = jest
      .spyOn(WallpaperProcessor, 'cleanupImage')
      .mockImplementationOnce(() => {});
    const spy = jest.spyOn(String, 'fromCharCode').mockReturnValueOnce('BM');
    const data = new Uint8Array([71, 13, 10, 26, 10, 0, 0, 0, 13]);
    const blob = new Blob(data, { type: 'image/gif' });
    await expect(
      WallpaperProcessor.getDownResolutionBlob(blob)
    ).rejects.toEqual('image-invalid');
    expect(window.URL.revokeObjectURL.mock.calls.length).toBe(1);
    expect(spyClean).toBeCalledTimes(0);
    expect(spy).toBeCalledTimes(1);
    spyClean.mockRestore();
    spy.mockRestore();
    done();
  });

  afterAll(done => {
    window.FileReader = oldFileReader;
    window.Image = oldImage;
    window.URL.createObjectURL.mockReset();
    window.URL.revokeObjectURL.mockReset();
    done();
  });
});
