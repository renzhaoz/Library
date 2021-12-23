describe('utils js <enumerate_all> test', () => {
  beforeEach(done => {
    require('../../mock/navigator_getDeviceStorageEnumrate_mock');
    require('../../../js/utils/device_storage/enumerate_all');
    done();
  });

// EnumerateAll test
  test('enumerateAll should be function', done => {
    expect(typeof enumerateAll).toBe('function');
    done();
  });

// EnumerateAll  return value test
  test('enumerateAll return value test', done => {
    const storage = [
      MockGetDeviceStorageEnumerate()
    ];
    enumerateAll(storage).then((value) => {
      expect(typeof value).toBe('object');
      expect(value.length).toBe(3);
      done();
    });
  });
});
