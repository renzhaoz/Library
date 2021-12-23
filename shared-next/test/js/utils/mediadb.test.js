describe('utils js <mediadb> test', () => {
  const { mockB2gNavigator } = require('../../mock/b2g_navigator_mock');
  window.navigator.b2g = {};
  require('../../mock/navigator_getDeviceStorage_mock');
  mockB2gNavigator(window, 'getDeviceStorages', MockGetDeviceStorage);
  mockB2gNavigator(window, 'getDeviceStorage', MockGetDeviceStorage);
  const warnMock = jest.spyOn(console, 'warn').mockImplementation();
  const errorMock = jest.spyOn(console, 'error').mockImplementation();

  beforeAll(done => {
    require('../../mock/indexDb_mock');
    require('../../../js/utils/media/mediadb');
    done();
  });

  // Test MediaDB
  test('MediaDB should be function', done => {
    expect(typeof MediaDB).toBe('function');
    done();
  });

  // Test close, addEventListener, removeEventListener, getFileInfo
  test('test getFileInfo', done => {
    const mediaDb = new MediaDB('pictures');
    mediaDb.close();
    mediaDb.addEventListener('deleted');
    mediaDb.removeEventListener('deleted');
    const getSuccess = jest.fn();
    const getError = jest.fn();
    // 1,this.state !== MediaDB.OPENING
    mediaDb.getFileInfo('file1', getSuccess, getError);
    expect(getSuccess).toBeCalledTimes(1);
    mediaDb.getFileInfo('file1');

    // 2,this.state === MediaDB.OPENING
    mediaDb.state = 'opening';
    expect(() => {
      mediaDb.getFileInfo('file1', getSuccess, getError);
    }).toThrowError('MediaDB is not ready. State: opening');
    expect(getSuccess).toBeCalledTimes(1);
    done();
  });

  // Test getFile
  test('test getFile', done => {
    const mediaDb = new MediaDB('pictures');
    const getSuccess = jest.fn();
    const getError = jest.fn();
    // 1,this.state !== MediaDB.READY && this.state !== MediaDB.ENUMERABLE
    expect(() => {
      mediaDb.getFile('file1', getSuccess, getError);
    }).toThrowError('MediaDB is not ready. State: nocard');
    expect(getSuccess).toBeCalledTimes(0);

    // 2,this.state === 'ready'
    mediaDb.state = 'ready';
    mediaDb.getFile('file1', getSuccess, getError);
    mediaDb.getFile('file1', getSuccess);
    expect(getSuccess).toBeCalledTimes(2);
    expect(getError).toBeCalledTimes(1);
    done();
  });

  // Test  deleteFile
  test('test  deleteFile', done => {
    const mediaDb = new MediaDB('pictures');
    const deleteSuccess = jest.fn();
    // 1,this.state !== MediaDB.READY
    expect(() => {
      mediaDb.deleteFile('file1', deleteSuccess);
    }).toThrow();
    expect(deleteSuccess).toBeCalledTimes(0);

    // 2,this.state === 'ready'
    mediaDb.state = 'ready';
    mediaDb.deleteFile('file1', deleteSuccess);
    expect(deleteSuccess).toBeCalledTimes(1);

    mediaDb.deleteFile('file1');
    expect(deleteSuccess).toBeCalledTimes(1);
    done();
  });

  // Test  addFile
  test('test  addFile', done => {
    const mediaDb = new MediaDB('pictures');
    const addSuccess = jest.fn();
    const addError = jest.fn();
    // 1,this.state !== MediaDB.READY
    expect(() => {
      mediaDb.addFile('file1', 'file', addSuccess, addError);
    }).toThrow();
    expect(addSuccess).toBeCalledTimes(0);
    expect(addError).toBeCalledTimes(0);

    // 2,this.state === 'ready'
    mediaDb.state = 'ready';
    mediaDb.addFile('file1', 'file', addSuccess, addError);
    mediaDb.addFile('file1', 'file');
    expect(addSuccess).toBeCalledTimes(1);
    done();
  });

  // Test  appendFile
  test('test appendFile', done => {
    const mediaDb = new MediaDB('pictures');
    const appendSuccess = jest.fn();
    const appendError = jest.fn();
    // 1,this.state !== MediaDB.READY
    expect(() => {
      mediaDb.appendFile('file1', 'file', appendSuccess, appendError);
    }).toThrow();
    expect(appendSuccess).toBeCalledTimes(0);
    expect(appendError).toBeCalledTimes(0);

    // 2,this.state === 'ready'
    mediaDb.state = 'ready';
    mediaDb.appendFile('file1', 'file', appendSuccess, appendError);
    mediaDb.appendFile('file1', 'file');
    expect(appendSuccess).toBeCalledTimes(1);
    done();
  });

  // Test  updateMetadata
  test('test updateMetadata', done => {
    const mediaDb = new MediaDB('pictures');
    const updateSuccess = jest.fn();
    // 1,this.state === MediaDB.OPENING
    mediaDb.state = 'opening';
    expect(() => {
      mediaDb.updateMetadata('file1', 'metadata', updateSuccess);
    }).toThrow();
    expect(updateSuccess).toBeCalledTimes(0);

    // 2,this.state !== MediaDB.OPENING
    mediaDb.state = 'ready';
    mediaDb.updateMetadata('file1', 'metadata', updateSuccess);
    mediaDb.updateMetadata('file1', 'metadata');
    expect(updateSuccess).toBeCalledTimes(1);
    done();
  });

  // Test  count
  test('test count', done => {
    const mediaDb = new MediaDB('pictures');
    const countSuccess = jest.fn();
    // 1,this.state !== MediaDB.READY && this.state !== MediaDB.ENUMERABLE
    mediaDb.state = 'opening';
    expect(() => {
      mediaDb.count('file1', 2, countSuccess);
    }).toThrow();
    expect(countSuccess).toBeCalledTimes(0);

    // 2,this.state === MediaDB.READY
    mediaDb.state = 'ready';
    mediaDb.count('file1');
    mediaDb.count('file1', 2);
    mediaDb.count('file1', 2, countSuccess);
    expect(countSuccess).toBeCalledTimes(1);
    done();
  });

  // Test  enumerate
  test('test enumerate', done => {
    const mediaDb = new MediaDB('pictures');
    const enumerateDone = jest.fn();
    const test = jest.fn();
    // 1,this.state !== MediaDB.READY && this.state !== MediaDB.ENUMERABLE
    mediaDb.state = 'opening';
    expect(() => {
      mediaDb.enumerate('file1', 2, 'ascending', enumerateDone);
    }).toThrow();
    expect(enumerateDone).toBeCalledTimes(0);

    // 2,this.state === MediaDB.READY
    mediaDb.state = 'ready';
    const value1 = mediaDb.enumerate('file1');
    const value2 = mediaDb.enumerate('file1', test);
    const value3 = mediaDb.enumerate('file1', 3, test);
    const value4 = mediaDb.enumerate('file1', 3, 'ascending', enumerateDone);
    expect(value1).toStrictEqual({ state: 'error' });
    expect(value2).toStrictEqual({ state: 'complete' });
    expect(value3).toStrictEqual({ state: 'complete' });
    expect(value4).toStrictEqual({ state: 'complete' });
    expect(enumerateDone).toBeCalledTimes(1);
    expect(test).toBeCalledTimes(2);
    done();
  });

  // Test  advancedEnumerate
  test('test advancedEnumerate', done => {
    const mediaDb = new MediaDB('pictures');
    const enumerateDone = jest.fn();
    // 1,this.state !== MediaDB.READY
    mediaDb.state = 'opening';
    expect(() => {
      mediaDb.advancedEnumerate('file1', 3, 'ascending', 1, enumerateDone);
    }).toThrow();
    expect(enumerateDone).toBeCalledTimes(0);

    // 2,this.state === MediaDB.READY
    mediaDb.state = 'ready';
    const value = mediaDb.advancedEnumerate(
      'file1',
      3,
      'ascending',
      1,
      enumerateDone
    );
    expect(value).toStrictEqual({ state: 'complete' });
    expect(enumerateDone).toBeCalledTimes(1);
    done();
  });

  // Test  enumerateAll
  test('test enumerateAll', done => {
    const mediaDb = new MediaDB('pictures');
    const enumerateDone = jest.fn();
    const test = jest.fn();
    mediaDb.state = 'ready';
    mediaDb.enumerateAll('file1');
    mediaDb.enumerateAll('file1', test);
    mediaDb.enumerateAll('file1', 2, test);
    const value = mediaDb.enumerateAll('file1', 3, 'ascending', enumerateDone);
    expect(value).toStrictEqual({ state: 'complete' });
    expect(enumerateDone).toBeCalledTimes(1);
    expect(test).toBeCalledTimes(2);
    done();
  });

  // Test  cancelEnumeration
  test('test cancelEnumeration', done => {
    const mediaDb = new MediaDB('pictures');

    const handle1 = { state: 'enumerating' };
    mediaDb.cancelEnumeration(handle1);
    expect(handle1.state).toBe('cancelling');

    const handle2 = { state: 'ready' };
    mediaDb.cancelEnumeration(handle2);
    expect(handle2.state).toBe('ready');
    done();
  });

  // Test  getAll
  test('test getAll', done => {
    const mediaDb = new MediaDB('pictures');
    const getAllDone = jest.fn();
    // 1,this.state !== MediaDB.READY && this.state !== MediaDB.ENUMERABLE
    mediaDb.state = 'opening';
    expect(() => {
      mediaDb.getAll(getAllDone);
    }).toThrow();
    expect(getAllDone).toBeCalledTimes(0);

    // 2,this.state === MediaDB.READY
    mediaDb.state = 'ready';
    mediaDb.getAll(getAllDone);
    expect(getAllDone).toBeCalledTimes(1);
    done();
  });

  // Test  freeSpace
  test('test freeSpace', done => {
    const metadataParser = (file, sucess, error) => {
      if (file) {
        sucess();
      } else {
        error();
      }
    };
    const option = {
      autoscan: false,
      excludeFilter: /html/
    };

    const mediaDb = new MediaDB('movies', metadataParser, option);
    const freeSpaceHandle = jest.fn();
    // 1,this.state !== MediaDB.READY
    mediaDb.state = 'opening';
    expect(() => {
      mediaDb.freeSpace(freeSpaceHandle);
    }).toThrow();
    expect(freeSpaceHandle).toBeCalledTimes(0);

    // 2,this.state === MediaDB.READY
    mediaDb.state = 'ready';
    mediaDb.freeSpace(freeSpaceHandle);
    expect(freeSpaceHandle).toHaveBeenCalled();
    done();
  });

  // Test  scan & stopScan
  test('test scan & stopScan', done => {
    const mediaDb = new MediaDB('pictures');
    mediaDb.scan();
    mediaDb.scanning = false;
    mediaDb.stopScan();
    expect(mediaDb.stopScanning).toBeFalsy();

    mediaDb.scanning = true;
    mediaDb.stopScan();
    expect(mediaDb.stopScanning).toBeTruthy();
    done();
  });

  afterAll(done => {
    warnMock.mockRestore();
    errorMock.mockRestore();
    done();
  });
});
