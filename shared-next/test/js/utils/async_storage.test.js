describe('utils js <async_storage> test', () => {
  beforeEach(done => {
    require('../../mock/indexDb_mock');
    require('../../../js/utils/storage/async_storage');
    done();
  });

// AsyncStorage test for all return value types
  test('asyncStorage test for all return value types', done => {
    const { getItem, setItem, removeItem, clear, length, key } = asyncStorage;
    expect(typeof asyncStorage).toBe('object');
    expect(typeof getItem).toBe('function');
    expect(typeof setItem).toBe('function');
    expect(typeof removeItem).toBe('function');
    expect(typeof clear).toBe('function');
    expect(typeof length).toBe('function');
    expect(typeof key).toBe('function');
    done();
  });

// GetItem return value test
  test('getItem return value test', done => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {
    });
    const closeSpy = jest.spyOn(window, 'close').mockImplementationOnce(() => {
    });
    const callback = jest.fn();
    const keyValue = 'test';
    const value = asyncStorage.getItem(keyValue, callback);
    expect(closeSpy).toBeCalledTimes(1);
    expect(errSpy).toBeCalledTimes(2);
    expect(value).toBeUndefined();
    errSpy.mockRestore();
    closeSpy.mockRestore();
    done();
  });

// SetItem return value test
  test('setItem return value test', done => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {
    });
    const closeSpy = jest.spyOn(window, 'close').mockImplementationOnce(() => {
    });
    const keyItem = 'testSet';
    const value = 123;
    asyncStorage.setItem(keyItem, value);
    expect(closeSpy).toBeCalledTimes(0);
    expect(errSpy).toBeCalledTimes(1);
    errSpy.mockRestore();
    closeSpy.mockRestore();
    done();
  });

// RemoveItem return value test
  test('removeItem return value test', done => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {
    });
    const closeSpy = jest.spyOn(window, 'close').mockImplementationOnce(() => {
    });
    const callback = jest.fn();
    const item = 'testSet';
    const value = asyncStorage.removeItem(item, callback);
    expect(closeSpy).toBeCalledTimes(0);
    expect(errSpy).toBeCalledTimes(1);
    expect(value).toBeUndefined();
    errSpy.mockRestore();
    closeSpy.mockRestore();
    done();
  });

// ClearItem return value test
  test('clearItem return value test', done => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {
    });
    const callback = jest.fn();
    const value = asyncStorage.clear(callback);
    expect(errSpy).toBeCalledTimes(1);
    expect(value).toBeUndefined();
    errSpy.mockRestore();
    done();
  });

// Length return value test
  test('length return value test', done => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {
    });
    const callback = jest.fn();
    const value = asyncStorage.length(callback);
    expect(errSpy).toBeCalledTimes(1);
    expect(value).toBeUndefined();
    errSpy.mockRestore();
    done();
  });

// Key return value test
  test('key return value test', done => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {
    });
    const callback = jest.fn();
    asyncStorage.key(-8, callback);
    asyncStorage.key(0, callback);
    asyncStorage.key(5, callback);
    expect(errSpy).toBeCalledTimes(2);
    errSpy.mockRestore();
    done();
  });
});
