describe('utils js <settings_url> test', () => {
  beforeEach(done => {
    require('../../../js/utils/blob/settings_url');
    done();
  });

  // SettingsURL test
  test(' SettingsURL should be function', done => {
    expect(typeof window.SettingsURL).toBe('function');
    done();
  });

  //  SettingsURL Inheritance test
  test(' url1 inherits SettingsURL', done => {
    const url1 = new SettingsURL();
    expect(url1._url).toBeNull();
    expect(url1._isBlob).toBe(false);
    done();
  });

  //  Window.URL.revokeObjectURL() should be called test
  test(' window.URL.revokeObjectURL() should be called 1 time', done => {
    window.URL.revokeObjectURL = jest.fn();
    const url2 = new SettingsURL();
    url2._isBlob = true;
    url2.set('value');
    expect(url2.get()).toBe('value');
    expect(window.URL.revokeObjectURL.mock.calls.length).toBe(1);
    done();
  });

  // Set & get test
  test("url3.set('1.txt')  & url3.get('1.txt') should return '1.txt'", done => {
    const url3 = new SettingsURL();
    const value = '1.txt';
    const url3SetValue = url3.set(value);
    const url3GetValue = url3.get();
    expect(url3SetValue).toBe('1.txt');
    expect(url3GetValue).toBe('1.txt');
    done();
  });

  // Set blob test
  test('set blob test', done => {
    window.URL.createObjectURL = jest.fn();
    const blobURL = new SettingsURL();
    const blob = new Blob(['hello world'], { type: 'text/plain' });
    blobURL.set(blob);
    expect(blobURL._isBlob).toBe(true);
    expect(window.URL.createObjectURL.mock.calls.length).toBe(1);
    done();
  });
});
