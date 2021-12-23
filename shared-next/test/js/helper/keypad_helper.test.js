/* eslint-disable no-undef, global-require */
describe('helper js <keypad_helper> test', () => {
  let keypadHelper = null;

  beforeAll(done => {
    require('../../mock/settings_observer_mock');
    // eslint-disable-next-line no-unused-vars
    const { SettingsObserver } = window;
    require('../../../js/helper/keypad/keypad_helper');
    done();
  });

  beforeEach(done => {
    keypadHelper = new KeypadHelper();
    done();
  });

  // KeypadHelper test
  test('KeypadHelper should be function', done => {
    expect(keypadHelper instanceof KeypadHelper).toBe(true);
    done();
  });

  // DISPLAY_LANGUAGES test
  test('DISPLAY_LANGUAGES should return an object', done => {
    const displayLanguages = keypadHelper.DISPLAY_LANGUAGES;
    expect(typeof displayLanguages).toBe('object');
    done();
  });

  // LANGUAGES_ICON_TEXT test
  test('LANGUAGES_ICON_TEXT should return an object', done => {
    const languagesIconText = keypadHelper.LANGUAGES_ICON_TEXT;
    expect(typeof languagesIconText).toBe('object');
    done();
  });

  // SETTINGS_KEYS test
  test('SETTINGS_KEYS should return an object', done => {
    const settingsKey = keypadHelper.SETTINGS_KEYS;
    expect(typeof settingsKey).toBe('object');
    done();
  });

  // GetDisplayLanguageName test
  test('getDisplayLanguageName should return string', done => {
    const name = keypadHelper.getDisplayLanguageName('english');
    expect(typeof name).toBe('string');
    done();
  });

  // Start test
  test('start should be function', done => {
    expect(typeof keypadHelper.start).toBe('function');
    done();
  });

  // _startComponents test
  test('_startComponents should be function', done => {
    expect(typeof keypadHelper._startComponents).toBe('function');
    done();
  });

  // _observeSettings test
  test('_observeSettings should be function', done => {
    expect(typeof keypadHelper._observeSettings).toBe('function');
    done();
  });

  // GetSettings test
  test('getSettings should be function', done => {
    expect(typeof keypadHelper.getSettings).toBe('function');
    done();
  });

  // _stashSettings test
  test('_stashSettings should be function', done => {
    expect(typeof keypadHelper._stashSettings).toBe('function');
    done();
  });

  // _saveSettings test
  test('_saveSettings should be function', done => {
    expect(typeof keypadHelper._saveSettings).toBe('function');
    done();
  });

  // SetT9Enabled test
  test('setT9Enabled should be function', done => {
    expect(typeof keypadHelper.setT9Enabled).toBe('function');
    done();
  });

  // SetWordSuggestion test
  test('setWordSuggestion should be function', done => {
    expect(typeof keypadHelper.setWordSuggestion).toBe('function');
    done();
  });

  // SetActiveLayout test
  test('setActiveLayout should be function', done => {
    expect(typeof keypadHelper.setActiveLayout).toBe('function');
    done();
  });

  // SetActiveMode test
  test('setActiveMode should be function', done => {
    expect(typeof keypadHelper.setActiveMode).toBe('function');
    done();
  });

  // SetDefaultLayout test
  test('setDefaultLayout should be function', done => {
    expect(typeof keypadHelper.setDefaultLayout).toBe('function');
    done();
  });

  // SetLayouts test
  test('setLayouts should be function', done => {
    expect(typeof keypadHelper.setLayouts).toBe('function');
    done();
  });

  // GetT9Enabled test
  test('getT9Enabled should be function', done => {
    expect(typeof keypadHelper.getT9Enabled).toBe('function');
    done();
  });

  // GetWordSuggestion test
  test('getWordSuggestion should be function', done => {
    expect(typeof keypadHelper.getWordSuggestion).toBe('function');
    done();
  });

  // GetLayouts test
  test('getLayouts should be function', done => {
    expect(typeof keypadHelper.getLayouts).toBe('function');
    done();
  });

  // GetActiveLayout test
  test('getActiveLayout should be function', done => {
    expect(typeof keypadHelper.getActiveLayout).toBe('function');
    done();
  });

  // GetActiveMode test
  test('getActiveMode should be function', done => {
    expect(typeof keypadHelper.getActiveMode).toBe('function');
    done();
  });

  // SetT9ChangedCallback test
  test('setT9ChangedCallback should be function', done => {
    expect(typeof keypadHelper.setT9ChangedCallback).toBe('function');
    done();
  });

  // SetWordSuggestionChangedCallback test
  test('setWordSuggestionChangedCallback should be function', done => {
    expect(typeof keypadHelper.setWordSuggestionChangedCallback).toBe(
      'function'
    );
    done();
  });

  // SetLayoutsChangedCallback test
  test('setLayoutsChangedCallback should be function', done => {
    expect(typeof keypadHelper.setLayoutsChangedCallback).toBe('function');
    done();
  });

  // SetActiveLayoutChangedCallback test
  test('setActiveLayoutChangedCallback should be function', done => {
    expect(typeof keypadHelper.setActiveLayoutChangedCallback).toBe('function');
    done();
  });

  // SetActiveModeChangedCallback test
  test('setActiveModeChangedCallback should be function', done => {
    expect(typeof keypadHelper.setActiveModeChangedCallback).toBe('function');
    done();
  });

  // setDictChangedCallback test
  test('setDictChangedCallback should be function', done => {
    expect(typeof keypadHelper.setDictChangedCallback).toBe('function');
    done();
  });

  // Set callback methods test.
  test('set callback methods test', async done => {
    // eslint-disable-next-line no-empty-function
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const callback = jest.fn();
    keypadHelper.setT9ChangedCallback(callback);
    keypadHelper.setWordSuggestionChangedCallback(callback);
    keypadHelper.setLayoutsChangedCallback(callback);
    keypadHelper.setActiveLayoutChangedCallback(callback);
    keypadHelper.setActiveModeChangedCallback(callback);
    keypadHelper.setDictChangedCallback(callback);
    keypadHelper.start();
    keypadHelper._startComponents();
    keypadHelper._observeSettings();
    spy.mockRestore();
    done();
  });

  // Set value methods test.
  test('set value methods test', async done => {
    // eslint-disable-next-line no-empty-function
    const spy = jest.spyOn(console, 'log').mockImplementationOnce(() => {});
    const callback = jest.fn();
    const spyObserver = jest
      .spyOn(SettingsObserver, 'getValue')
      .mockResolvedValue({
        layouts: 'layouts',
        'keypad.t9-enabled': 'keypad.t9-enabled',
        'keypad.wordsuggestion': 'keypad.wordsuggestion',
        'keypad.layouts.default': 'keypad.layouts.default',
        'keypad.active-layout': 'keypad.active-layout',
        'keypad.active-mode': 'keypad.active-mode'
      });
    keypadHelper._stashSettings('T9_ENABLED', 'keypad.t9-enabled', {
      notify: true
    });
    keypadHelper._stashSettings('T9_ENABLED', '', { notify: true });
    keypadHelper._saveSettings('T9_ENABLED', 'keypad.t9-enabled');
    keypadHelper.setT9Enabled('keypad.t9-enabled');
    keypadHelper.setWordSuggestion('keypad.wordsuggestion');
    keypadHelper.setActiveLayout('keypad.active-layout');
    keypadHelper.setActiveMode('keypad.active-mode');
    keypadHelper.setDefaultLayout();
    keypadHelper.setLayouts('keypad.layouts');
    const t9 = await keypadHelper.getT9Enabled();
    expect(t9).toBe('keypad.t9-enabled');
    const wordSuggestion = await keypadHelper.getWordSuggestion();
    expect(wordSuggestion).toBe('keypad.wordsuggestion');
    const activeLayout = await keypadHelper.getActiveLayout();
    expect(activeLayout).toBe('keypad.active-layout');
    const activeMode = await keypadHelper.getActiveMode();
    expect(activeMode).toBe('keypad.active-mode');
    const layouts = await keypadHelper.getLayouts();
    spy.mockRestore();
    spyObserver.mockRestore();
    done();
  });

  describe('getDictBlobByLang/putDictBlobByLang/getUserWordList/putUserWordList methods test', () => {
    const lang = 'en-US';
    beforeAll(done => {
      const b2gNavigator = require('../../mock/b2g_navigator_mock');
      const { mockB2gNavigator } = b2gNavigator;
      window.navigator.b2g = {};
      require('../../mock/navigator_getDeviceStorage_mock');
      mockB2gNavigator(window, 'getDeviceStorage', MockGetDeviceStorage);
      const { mockFileReader } = require('../../mock/fileReader_mock');
      window.FileReader = mockFileReader;
      done();
    });

    // Test putDictBlobByLang methods.
    test('putDictBlobByLang methods test', async done => {
      const spy = jest.spyOn(console, 'log').mockImplementationOnce(() => {});
      const blob = new Blob();
      const res = await keypadHelper.putDictBlobByLang(lang, blob);
      expect(res).toEqual({"target": {"result": ".dictionary/en-US.dic"}});
      expect(spy).toBeCalledTimes(1);
      spy.mockRestore();
      done();
    });

    // Test getDictBlobByLang methods.
    test('getDictBlobByLang methods test', async done => {
      const spy = jest.spyOn(navigator.b2g, 'getDeviceStorage').mockImplementation(() => {
        return {
          get(name) {
            return {
              set onsuccess(cb) {
                cb({target: {result: 'result'}})
              },
              set onerror(cb) {
                cb()
              }

            }
          }
        }
      });

      const blob = await keypadHelper.getDictBlobByLang(lang);
      expect(blob instanceof Blob).toBeTruthy();
      spy.mockRestore();
      done();
    });

    // putUserWordList methods test.
    test('putUserWordList methods test', async done => {
      const spy = jest.spyOn(console, 'log').mockImplementationOnce(() => {});
      const blob = await keypadHelper.putUserWordList(lang, 'words');
      expect(blob).toEqual({ target: { result: '.dictionary/en-US.dic' } });
      expect(spy).toBeCalledTimes(1);
      spy.mockRestore();
      done();
    });

    // getUserWordList methods test.
    test('getUserWordList methods test', async done => {
      const blob = await keypadHelper.getUserWordList(lang);
      expect(blob).toEqual([ 'onload' ]);
      done();
    });
  });
});
