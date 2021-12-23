/* global SettingsObserver */

const RingtoneHelper = (function ringtoneHelper() {
  const ringtoneSettings = 'dialer.ringtone';
  const ringtoneNameSettings = 'dialer.ringtone.name';
  const ringtoneIdSettings = 'dialer.ringtone.id';
  const defaultRingtoneSettings = 'dialer.ringtone.default';
  const defaultRingtoneNameSettings = 'dialer.ringtone.name.default';
  const defaultRingtoneIdSettings = 'dialer.ringtone.id.default';
  const settings = [
    ringtoneSettings,
    ringtoneNameSettings,
    ringtoneIdSettings,
    defaultRingtoneSettings,
    defaultRingtoneNameSettings,
    defaultRingtoneIdSettings
  ];
  const settingsValue = {};
  init();

  function init() {
    for (let i = 0; i < 3; i++) {
      SettingsObserver.observe(settings[i], '', value => {
        settingsValue[settings[i]] = value;
      });
    }
    for (let i = 3; i < 6; i++) {
      SettingsObserver.getValue(settings[i]).then(
        value => {
          settingsValue[settings[i]] = value;
        },
        () => {
          settingsValue[settings[i]] = '';
        }
      );
    }
  }

  function setToDefault() {
    return SettingsObserver.setValue([
      {
        name: ringtoneSettings,
        value: settingsValue[defaultRingtoneSettings]
      },
      {
        name: ringtoneNameSettings,
        value: settingsValue[defaultRingtoneNameSettings]
      },
      {
        name: ringtoneIdSettings,
        value: settingsValue[defaultRingtoneIdSettings]
      }
    ]);
  }

  function get() {
    return new Promise(resolve => {
      const value = settingsValue[ringtoneSettings];
      const name = settingsValue[ringtoneNameSettings];
      const id = settingsValue[ringtoneIdSettings];
      if (value && value.startsWith('http')) {
        resolve({
          src: value,
          name,
          id
        });
      } else {
        const storage = navigator.b2g.getDeviceStorage('sdcard');
        const request = storage.get(value);
        request.onsuccess = () => {
          resolve({
            src: request.result,
            name,
            id
          });
        };
        request.onerror = () => {
          setToDefault();
          resolve({
            src: settingsValue[defaultRingtoneSettings],
            name: settingsValue[defaultRingtoneNameSettings],
            id: settingsValue[defaultRingtoneIdSettings]
          });
        };
      }
    });
  }

  return {
    get
  };
})();

window.RingtoneHelper = RingtoneHelper;
