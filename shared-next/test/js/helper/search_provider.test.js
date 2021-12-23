/* eslint-disable no-undef, global-require */
describe('helper js <search_provider> test', () => {
  const b2gNavigator = require('../../mock/b2g_navigator_mock');
  const { mockB2gNavigator } = b2gNavigator;
  const {
    MockMobileConnections
  } = require('../../mock/mobile_connections_mock');
  beforeAll(done => {
    window.navigator.b2g = {};
    mockB2gNavigator(window, 'mobileConnections', MockMobileConnections);
    require('../../mock/lazyLoader_mock');
    require('../../mock/settings_observer_mock');
    require('../../../js/helper/search_provider/clientId_customizer');
    require('../../../js/helper/search_provider/format');
    require('../../../js/helper/search_provider/search_provider');
    done();
  });

  // Test SearchProvider
  test('SearchProvider should be function', done => {
    expect(typeof window.SearchProvider).toBe('function');
    done();
  });

  // Test providerUpdated
  test('providerUpdated should be function', done => {
    expect(typeof window.SearchProvider.providerUpdated).toBe('function');
    done();
  });

  // Test setProvider
  test('setProvider should be function', done => {
    expect(typeof window.SearchProvider.setProvider).toBe('function');
    done();
  });

  // Test selected
  test('selected should be function', done => {
    expect(typeof window.SearchProvider.selected).toBe('function');
    done();
  });

  // Test providers
  test('providers should be function', done => {
    expect(typeof window.SearchProvider.providers).toBe('function');
    done();
  });

  // Test pickEngines
  test('pickEngines should be function', done => {
    expect(typeof window.SearchProvider.pickEngines).toBe('function');
    done();
  });

  // Test ready
  test('ready should be function', done => {
    expect(typeof window.SearchProvider.ready).toBe('function');
    done();
  });

  describe('SearchProvider.ready/selected/SearchProvider() test', () => {
    let spy = null;
    beforeEach(async done => {
      const json = require('../../../js/helper/search_provider/search_providers.json');
      LazyLoader.load.mockResolvedValueOnce();
      LazyLoader.getJSON.mockResolvedValueOnce(json);
      spy = jest.spyOn(SettingsObserver, 'getValue').mockResolvedValueOnce();
      await SearchProvider.ready();
      done();
    });

    // Test ready
    test('SearchProvider.ready should load json to providers', done => {
      expect(LazyLoader.load).toBeCalledTimes(1);
      expect(LazyLoader.getJSON).toBeCalledTimes(1);
      expect(SearchProvider.providers()).not.toBeNull();
      LazyLoader.load.mockReset();
      LazyLoader.getJSON.mockReset();
      spy.mockRestore();
      done();
    });

    // Test selected
    test('selected should return google', done => {
      // eslint-disable-next-line new-cap
      const obj = SearchProvider.selected();
      expect(obj).toBe('google');
      done();
    });

    // Test SearchProvider(key)
    test('SearchProvider(title) should return Google', done => {
      // eslint-disable-next-line new-cap
      const title = SearchProvider('title');
      expect(title).toBe('Google');
      done();
    });
  });

  // Test providerUpdated
  test('providerUpdated should be function', done => {
    // eslint-disable-next-line new-cap
    SearchProvider.providerUpdated(jest.fn());
    done();
  });

  // Test setProvider
  test('setProvider should be function', done => {
    // eslint-disable-next-line new-cap
    SearchProvider.setProvider('test');
    done();
  });
});
