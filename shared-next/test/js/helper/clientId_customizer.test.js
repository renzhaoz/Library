describe('helper js <clientId_customizer> test', () => {
  /* eslint-disable no-undef, global-require */
  beforeAll(done => {
    require('../../mock/settings_observer_mock');
    require('../../../js/helper/search_provider/clientId_customizer');
    done();
  });

  // Test ClientIdCustomizer
  test('ClientIdCustomizer should be object', done => {
    expect(typeof window.ClientIdCustomizer).toBe('object');
    done();
  });

  // Test parse
  test('parse should be function', done => {
    expect(typeof window.ClientIdCustomizer.parse).toBe('function');
    done();
  });

  // Test parse
  test('parse should return string', done => {
    const str = window.ClientIdCustomizer.parse('test');
    expect(str).toBe('test');
    const str1 = window.ClientIdCustomizer.parse('client=google');
    expect(str1).toBe('client=google');
    done();
  });

  // Test parse
  test('parse should return string', async done => {
    const spy = jest
      .spyOn(SettingsObserver, 'getValue')
      .mockResolvedValue('google.client_id');
    await window.ClientIdCustomizer.getGoogleClientId();
    const str = window.ClientIdCustomizer.parse('test');
    expect(str).toBe('test');
    const str1 = window.ClientIdCustomizer.parse('client=google');
    expect(str1).toBe('client=google.client_id');
    const str2 = window.ClientIdCustomizer.parse('test-google');
    expect(str2).toBe('test-google');
    spy.mockRestore();
    done();
  });
});
