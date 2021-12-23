describe('utils js <get_storage_if_available> test', () => {
  const b2gNavigator = require('../../mock/b2g_navigator_mock');
  const { mockB2gNavigator } = b2gNavigator;

  beforeEach(done => {
    require('../../mock/navigator_getDeviceStorage_mock');
    window.navigator.b2g = {};
    mockB2gNavigator(window, 'getDeviceStorage', MockGetDeviceStorage);
    require('../../../js/utils/device_storage/get_storage_if_available');
    done();
  });

// GetStorageIfAvailable test
  test('getStorageIfAvailable should be function', done => {
    expect(typeof getStorageIfAvailable).toBe('function');
    done();
  });

// GetStorageIfAvailable run test
  test('getStorageIfAvailable run test', done => {
    const kind = 'sdcard';
    const size = 23;
    const success = jest.fn(storage => {
      return storage;
    });
    const error = jest.fn(err => {
      return err;
    });
    getStorageIfAvailable(kind, size, success, error);
    expect(error.mock.calls.length).toBe(2);
    expect(error.mock.results[0].value).toBe('shared');
    expect(error.mock.results[1].value).toBe(20);
    expect(success.mock.calls.length).toBe(1);
    expect(typeof success.mock.results[0].value).toBe('object');

    getStorageIfAvailable(kind, size, success);
    expect(success.mock.calls.length).toBe(2);
    done();
  });
});
