describe('utils js <get_unused_filename> test', () => {
  beforeEach(done => {
    require('../../mock/navigator_getDeviceStorage_mock');
    require('../../../js/utils/device_storage/get_unused_filename');
    done();
  });

// GetUnusedFilename test
  test('getUnusedFilename should be function', done => {
    expect(typeof getUnusedFilename).toBe('function');
    done();
  });

// GetUnusedFilename run test
  test('getUnusedFilename run test', done => {
    const callback = jest.fn(name => {
      return name;
    });
    const storage = MockGetDeviceStorage();
    getUnusedFilename(storage, 'shared/as_mock_1', callback);
    expect(callback.mock.calls.length).toBe(1);
    done();
  });
});
