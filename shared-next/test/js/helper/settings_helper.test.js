/* eslint-disable no-undef, global-require */
describe('helper js <settings_helper> test', () => {
  let voicePrivacyHelper = null;

  beforeAll(done => {
    require('../../mock/settings_observer_mock');
    // eslint-disable-next-line no-unused-vars
    const { SettingsObserver } = window;
    require('../../../js/helper/settings/settings_helper');
    // eslint-disable-next-line new-cap
    voicePrivacyHelper = window.SettingsHelper(
      'ril.voicePrivacy.enabled',
      false
    );
    done();
  });

  // SettingsHelper test
  test('voicePrivacyHelper should be function', done => {
    expect(typeof voicePrivacyHelper).toBe('object');
    done();
  });

  // SettingsHelper.get test
  test('voicePrivacyHelper.get should be function', done => {
    expect(typeof voicePrivacyHelper.get).toBe('function');
    done();
  });

  // SettingsHelper.get test
  test('voicePrivacyHelper.get should return undefined', async done => {
    const getCallback = jest.fn(value => {
      expect(value).toBe(false);
    });
    await voicePrivacyHelper.get(getCallback);
    expect(getCallback.mock.calls.length).toBe(1);
    done();
  });

  // SettingsHelper.get test
  test('callback is null, should return', done => {
    voicePrivacyHelper.get();
    done();
  });

  // SettingsHelper.set test
  test('voicePrivacyHelper.set should be function', done => {
    expect(typeof voicePrivacyHelper.set).toBe('function');
    done();
  });

  describe('voicePrivacyHelper.set/get test', () => {
    const callback = jest.fn();
    beforeEach(async done => {
      await voicePrivacyHelper.set(true, callback);
      done();
    });

    // SettingsHelper.set test
    test('voicePrivacyHelper.set should be invoke resolve', done => {
      expect(callback.mock.calls.length).toBe(1);
      done();
    });

    // SettingsHelper.get test
    test('voicePrivacyHelper.get should return true', async done => {
      const getCallback = jest.fn(value => {
        expect(value).toBeTruthy();
      });
      await voicePrivacyHelper.get(getCallback);
      expect(getCallback.mock.calls.length).toBe(1);
      done();
    });
  });

  // SettingsHelper.uninit test
  test('voicePrivacyHelper.uninit should be function', done => {
    expect(typeof voicePrivacyHelper.uninit).toBe('function');
    done();
  });

  // SettingsHelper.uninit test
  test('voicePrivacyHelper.uninit should be invoke', done => {
    voicePrivacyHelper.uninit();
    done();
  });

  describe('SettingsHelper.set reject test/SettingsHelper.get reject test', () => {
    // SettingsHelper.set reject test
    test('voicePrivacyHelper.set should be invoke reject', async done => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        // eslint-disable-next-line no-empty-function
        .mockImplementationOnce(() => {});
      const callback = jest.fn();
      jest
        .spyOn(SettingsObserver, 'setValue')
        .mockRejectedValueOnce({ message: 'reject info' });
      await voicePrivacyHelper.set(true, callback);
      expect(callback.mock.calls.length).toBe(1);
      expect(consoleSpy.mock.calls.length).toBe(1);
      done();
    });

    // SettingsHelper.get reject test
    test('voicePrivacyHelper.get should be invoke reject', async done => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        // eslint-disable-next-line no-empty-function
        .mockImplementationOnce(() => {});
      jest
        .spyOn(SettingsObserver, 'getValue')
        .mockRejectedValueOnce({ message: 'reject info' });
      const getCallback = jest.fn(value => {
        expect(value).toBeNull();
      });
      await voicePrivacyHelper.get(getCallback);
      expect(getCallback.mock.calls.length).toBe(1);
      expect(consoleSpy.mock.calls.length).toBe(1);
      done();
    });

    afterEach(done => {
      jest.restoreAllMocks();
      done();
    });
  });
});
