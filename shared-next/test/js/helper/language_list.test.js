/* eslint-disable no-undef, global-require */
describe('helper  <language_list> test', () => {
  const oldXMLHttpRequest = window.XMLHttpRequest;
  const file = '../../../resources/languages.json';
  const { createMockXHR } = require('../../mock/xhr_mock');
  const mockXHR = createMockXHR();

  beforeAll(done => {
    require('../../mock/settings_observer_mock');
    require('../../../js/helper/language/language_list');
    done();
  });

  beforeEach(done => {
    window.XMLHttpRequest = jest.fn(() => mockXHR);
    done();
  });

  // Test LanguageList
  test('LanguageList should be object', done => {
    expect(typeof window.LanguageList).toBe('object');
    done();
  });

  // Test readFile
  test('_readFile should be function', done => {
    expect(typeof window.LanguageList._readFile).toBe('function');
    done();
  });

  // Test readFile return value status = 0
  test('_readFile should return json file', done => {
    const promise = window.LanguageList._readFile(file);
    mockXHR.response = file;
    mockXHR.status = 200;
    mockXHR.readyState = 3;
    mockXHR.onreadystatechange();
    mockXHR.readyState = 4;
    mockXHR.onreadystatechange();
    expect(mockXHR.open.mock.calls.length).toBe(1);
    expect(mockXHR.open).toHaveBeenCalledWith('GET', file, true);
    expect(mockXHR.send.mock.calls.length).toBe(1);
    promise.then(res => {
      expect(res).toEqual(file);
      done();
    });
  });

  // Test readFile return value status = 200
  test('_readFile should return json file', done => {
    const promise = window.LanguageList._readFile(file);
    mockXHR.response = file;
    mockXHR.status = 200;
    mockXHR.onreadystatechange();
    expect(mockXHR.open.mock.calls.length).toBe(1);
    expect(mockXHR.open).toHaveBeenCalledWith('GET', file, true);
    expect(mockXHR.send.mock.calls.length).toBe(1);
    promise.then(res => {
      expect(res).toBe(file);
      done();
    });
  });

  // Test readFile return value status = 300
  test('_readFile should return json file', done => {
    const promise = window.LanguageList._readFile(file);
    mockXHR.statusText = 'reject';
    mockXHR.status = 300;
    mockXHR.onreadystatechange();
    expect(mockXHR.open.mock.calls.length).toBe(1);
    expect(mockXHR.open).toHaveBeenCalledWith('GET', file, true);
    expect(mockXHR.send.mock.calls.length).toBe(1);
    promise.catch(e => {
      expect(e).toBe('reject');
      done();
    });
  });

  // Test _readSetting
  test('_readSetting should be function', done => {
    expect(typeof window.LanguageList._readSetting).toBe('function');
    done();
  });

  // Test _readSetting return value
  test('_readSetting should return value', async done => {
    const spy = jest.spyOn(SettingsObserver, 'getValue');
    await SettingsObserver.setValue([
      {
        name: 'language.current',
        value: 'en-US'
      }
    ]);
    const value = await window.LanguageList._readSetting('language.current');
    expect(spy.mock.calls.length).toBe(1);
    expect(spy).toHaveBeenCalledWith('language.current');
    expect(value).toBe('en-US');
    done();
  });

  // Test get
  test('get should be function', done => {
    expect(typeof window.LanguageList.get).toBe('function');
    done();
  });

  // Test get return value1
  test('_readSetting should return undefined', done => {
    const value = window.LanguageList.get(undefined);
    expect(value).toBeUndefined();
    done();
  });

  // Test get return value2
  test('_readSetting should return {} when configLanguage is undefined', async done => {
    expect.assertions(1);
    window.api = {
      // eslint-disable-next-line no-empty-function
      l10n: () => {}
    };
    const callback = jest.fn(value => {
      expect(value).toEqual({});
      done();
    });
    const res = require(file);
    const mockPromise = jest
      .spyOn(Promise, 'all')
      .mockResolvedValueOnce([res, 'en-US', true, undefined]);
    await window.LanguageList.get(callback);
    mockPromise.mockRestore();
  });

  describe('_readSetting test', () => {
    beforeEach(done => {
      require('../../mock/l10n_mock');
      done();
    });
    // Test get return value3
    test('_readSetting should return qps when qpsEnabled is true', async done => {
      expect.assertions(1);
      const res = require(file);
      const callback = jest.fn(value => {
        expect(value).toEqual({
          'qps-ploc': 'Accented English',
          'qps-plocm': 'Mirrored English'
        });
        done();
      });
      const mockPromise = jest
        .spyOn(Promise, 'all')
        .mockResolvedValueOnce([
          res,
          'qps-ploc',
          true,
          ['en-US', 'es-ES', 'qps-ploc']
        ]);
      await window.LanguageList.get(callback);
      mockPromise.mockRestore();
    });

    // Test get return value4
    test('_readSetting should return qps-ploc when qpsEnabled is false', async done => {
      expect.assertions(1);
      const res = require(file);
      const callback = jest.fn(value => {
        expect(value).toEqual({ 'qps-ploc': 'Accented English' });
        done();
      });
      const mockPromise = jest
        .spyOn(Promise, 'all')
        .mockResolvedValueOnce([
          res,
          'qps-ploc',
          false,
          ['en-US', 'es-ES', 'qps-ploc']
        ]);
      await window.LanguageList.get(callback);
      mockPromise.mockRestore();
    });
  });

  // Test getRtlList
  test('getRtlList should be a function', done => {
    expect(typeof window.LanguageList.getRtlList).toBe('function');
    done();
  });

  // Test getRtlList return value
  test('getRtlList should return array', done => {
    const value = window.LanguageList.getRtlList();
    expect(Array.isArray(value)).toBeTruthy();
    done();
  });

  // Test wrapBidi
  test('getRtlList should be a function', done => {
    expect(typeof window.LanguageList.wrapBidi).toBe('function');
    done();
  });

  // Test wrapBidi return value1
  test('wrapBidi should return string', done => {
    const value = window.LanguageList.wrapBidi('en-US', 'English');
    expect(value).toBe('\u202aEnglish\u202c');
    done();
  });

  // Test wrapBidi return value2
  test('wrapBidi should return string', done => {
    const value = window.LanguageList.wrapBidi('ar', 'AR');
    expect(value).toBe('\u202bAR\u202c');
    done();
  });

  // Test filterLanguageList
  test('getRtlList should be a function', done => {
    expect(typeof window.LanguageList.filterLanguageList).toBe('function');
    done();
  });

  // Test filterLanguageList return configLanguage
  test('filterLanguageList should return configLanguage', done => {
    const value = window.LanguageList.filterLanguageList(
      ['en-US'],
      { 'en-US': 'EN' },
      ['en-US']
    );
    expect(value).toStrictEqual(['en-US']);
    done();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    window.XMLHttpRequest = oldXMLHttpRequest;
  });
});
