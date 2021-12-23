describe('helper js <ringtone_helper> test', () => {
  beforeAll(async done => {
    require('../../mock/settings_observer_mock');
    const { SettingsObserver } = window;
    const settingsJson = {
      'dialer.ringtone': '/sdcard/downloads/m.mp3',
      'dialer.ringtone.name': 'm',
      'dialer.ringtone.id': 'custom:2',
      'dialer.ringtone.default': 'http://shared.localhost/resources/media/ringtones/ringer_kai.ogg',
      'dialer.ringtone.name.default': { 'l10nID': 'ringer_kai'},
      'dialer.ringtone.id.default': 'builtin:ringtone/ringer_kai'
    };
    const  settings = [];
    Object.keys(settingsJson).forEach((id) => {
      settings.push({ name: id, value: settingsJson[id]});
    });
    await SettingsObserver.setValue(settings);
    require('../../../js/helper/ringtone/ringtone_helper');
    done();
  });

  test('RingtoneHelper should be object', done => {
    expect(typeof window.RingtoneHelper).toBe('object');
    done();
  });

  // Get test
  test('Ringtone is existent', async done => {
    window.navigator.b2g = {
      getDeviceStorage: () => {
        return {
          get(filepath) {
            return {
              set onsuccess(cb) {
                cb.call(this);
              },
              set onerror(cb) {
              },
              get result() {
                return filepath;
              }
            };
          }
        };
      }
    };
    const result = await window.RingtoneHelper.get();
    expect(result.src).toBe('/sdcard/downloads/m.mp3');
    expect(result.name).toBe('m');
    expect(result.id).toBe('custom:2');

    done();
  });
  test('Ringtone is non-existent, set to default ringtone', async done => {
    window.navigator.b2g = {
      getDeviceStorage: () => {
        return {
          get(filepath) {
            return {
              set onsuccess(cb) {
              },
              set onerror(cb) {
                cb.call(this);
              }
            };
          }
        };
      }
    };
    const result = await window.RingtoneHelper.get();
    expect(result.src).toBe('http://shared.localhost/resources/media/ringtones/ringer_kai.ogg');
    expect(result.name.l10nID).toBe('ringer_kai');
    expect(result.id).toBe('builtin:ringtone/ringer_kai');
    done();
  });
});
