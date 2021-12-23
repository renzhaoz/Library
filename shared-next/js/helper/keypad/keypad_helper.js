/* global SettingsObserver */
/* global */

(function keypadHelper(exports) {
  const KeypadHelper = function KeypadHelper() {
    this.t9Enabled = null;
    this.wordSuggestion = null;
    this.layouts = null;
    this.activeLayout = null;
    this.activeMode = null;
    this.defaultLayout = null;
    this.initSettings = false;
  };

  KeypadHelper.DICT_DELIMITER = '|';

  KeypadHelper.prototype.DISPLAY_LANGUAGES = {
    english: 'English',
    english_us: 'English(US)',
    spanish_us: 'Español(US)',
    french_ca: 'Français(CA)',
    hindi: 'हिन्दी',
    assamese: 'অসমীয়া',
    bengali: 'বাংলা(IN)',
    gujarati: 'ગુજરાતી',
    marathi: 'मराठी',
    telugu: 'తెలుగు',
    tamil: 'தமிழ்',
    malayalam: 'മലയാളം',
    punjabi: 'ਪੰਜਾਬੀ',
    odia: 'ଓଡ଼ିଆ',
    kannada: 'ಕನ್ನಡ',
    nepali: 'नेपाली',
    konkani: 'कोंकणी',
    maithili: 'मैथिली',
    dogri: 'डोगरी',
    sindhi: 'सिन्धी',
    sanskrit: 'संस्कृत',
    manipuri: 'মণিপুরী',
    bodo: 'बोड़ो',
    santali: 'ᱥᱟᱱᱛᱟᱞᱤ',
    urdu: 'اُردُو',
    kashmiri: 'کأشُر',
    portuguese_br: 'Português(BR)',
    afrikaans: 'Afrikaans',
    arabic: 'العربية',
    chinese_cn: '中文(拼音)',
    dutch: 'Nederlands',
    english_gb: 'English(GB)',
    french_fr: 'Français(FR)',
    german: 'Deutsch',
    hungarian: 'Magyar',
    indonesian: 'Bahasa Indonesia',
    italian: 'Italiano',
    malay: 'Bahasa Melayu',
    persian: 'فارسی',
    polish: 'Polski',
    portuguese_pt: 'Português(PT)',
    romanian: 'Română',
    russian: 'Русский',
    spanish_es: 'Español(ES)',
    swahili: 'Kiswahili',
    thai: 'ไทย',
    turkish: 'Türkçe',
    vietnamese: 'Tiếng Việt',
    zulu: 'isiZulu',
    bengali_bd: 'বাংলা(BD)',
    bulgarian: 'Български',
    croatian: 'Hrvatski',
    czech: 'Česky',
    finnish: 'Suomi',
    greek: 'Ελληνικά',
    kazakh: 'Қазақша',
    khmer: 'ភាសាខ្មែរ',
    macedonian: 'Македонски',
    serbian: 'Српски',
    sinhala: 'සිංහල',
    slovak: 'Slovenčina',
    slovenian: 'Slovenščina',
    swedish: 'Svenska',
    tagalog: 'Tagalog',
    ukrainian: 'Українська',
    xhosa: 'isiXhosa',
    albanian: 'Shqip',
    armenian: 'Հայերեն',
    azerbaijani: 'Azərbaycan',
    belarusian: 'Беларуская',
    bosnian_latin: 'Bosanski(latin)',
    chinese_hk: '中文(筆劃)',
    chinese_tw: '中文(注音)',
    danish: 'Dansk',
    estonian: 'Eesti',
    georgian: 'ქართული',
    hebrew: 'עברית',
    icelandic: 'Íslenska',
    lao: 'ລາວ',
    latvian: 'Latviešu',
    lithuanian: 'Lietuvių',
    norwegian: 'Norsk (bokmål)',
    uzbek_cyrillic: "O'zbek",
    korean: '한국어(대한민국)',
    galician: 'Galego',
    basque: 'Euskara',
    catalan: 'Català',
    spanish_mx: 'Español(MX)',
    burmese: 'မြန်မာဘာသာ',
    french_af: 'Français(AF)',
    portuguese_af: 'Português(AF)',
    spanish_ar: 'Español(AR)',
    bosnian_cyrillic: 'Bosanski(ćirilicom)',
    russian_blr: 'Русский(Беларусь)',
    english_gl: 'English(general)'
  };

  KeypadHelper.prototype.LANGUAGES_ICON_TEXT = {
    hindi: 'हि',
    assamese: 'অস',
    bengali: 'বাং',
    gujarati: 'ક',
    marathi: 'ळ',
    telugu: 'కే',
    tamil: 'க',
    malayalam: 'ക',
    punjabi: 'ਕ',
    odia: 'କ',
    kannada: 'ಕೆ',
    nepali: 'नेपा',
    konkani: 'कों',
    maithili: 'मैथ',
    dogri: 'डो',
    sindhi: 'सि',
    sanskrit: 'संस',
    manipuri: 'মণি',
    bodo: 'बर',
    santali: 'ᱟ',
    urdu: 'اُردُو',
    kashmiri: 'کأ',
    arabic: 'Ar',
    chinese_cn: '拼',
    persian: 'Pe',
    thai: 'Th',
    bengali_bd: 'বাং',
    khmer: 'Km',
    sinhala: 'Si',
    chinese_hk: '筆',
    chinese_tw: '注',
    georgian: 'Ka',
    hebrew: 'He',
    lao: 'Lo',
    korean: '가',
    burmese: 'ဗမာ'
  };

  KeypadHelper.prototype.SETTINGS_KEYS = {
    T9_ENABLED: 'keypad.t9-enabled',
    WORD_SUGGESTION: 'keypad.wordsuggestion',
    KEYPAD_LAYOUTS: 'keypad.layouts',
    DEFAULT_LAYOUT: 'keypad.layouts.default',
    ACTIVE_LAYOUT: 'keypad.active-layout',
    ACTIVE_MODE: 'keypad.active-mode',
    DICT_CHANGE: 'keypad.dict-change'
  };

  KeypadHelper.prototype.getDisplayLanguageName = function getDisplayLanguageName(
    key
  ) {
    return this.DISPLAY_LANGUAGES[key];
  };

  KeypadHelper.prototype.start = function start() {
    if (!this.initSettings) {
      this._startComponents();
    }
  };

  KeypadHelper.prototype._startComponents = function _startComponents() {
    this.initSettings = true;
    this._observeSettings();
  };

  KeypadHelper.prototype._observeSettings = function _observeSettings() {
    for (const prop in this.SETTINGS_KEYS) {
      const key = this.SETTINGS_KEYS[prop];
      SettingsObserver.observe(
        key,
        '',
        (value, vKey) => {
          this._stashSettings(vKey, value, { notify: true });
        },
        true
      );
    }
  };

  KeypadHelper.prototype.getSettings = function getSettings() {
    return new Promise((resolve, reject) => {
      const settingsKeys = Object.values(this.SETTINGS_KEYS);
      SettingsObserver.getBatch(settingsKeys)
        .then(settings => {
          settings.forEach(s => {
            if (s.value !== undefined) {
              this._stashSettings(s.name, s.value);
            }
          });
          const result = {
            t9Enabled: this.t9Enabled,
            wordSuggestion: this.wordSuggestion,
            layouts: this.layouts,
            activeLayout: this.activeLayout,
            activeMode: this.activeMode
          };
          resolve(result);
        })
        .catch(err => {
          console.log(`Get keypad settings error: ${err}`);
          reject(err);
        });
    });
  };

  KeypadHelper.prototype._stashSettings = function _stashSettings(
    key,
    value,
    option
  ) {
    if (value === '') {
      return;
    }
    switch (key) {
      case this.SETTINGS_KEYS.T9_ENABLED:
        this.t9Enabled = value;

        if (option && option.notify && this.t9ChangedCallback) {
          this.t9ChangedCallback(value);
        }
        break;
      case this.SETTINGS_KEYS.WORD_SUGGESTION:
        this.wordSuggestion = value;

        if (option && option.notify && this.wordSuggestionChangedCallback) {
          this.wordSuggestionChangedCallback(value);
        }
        break;
      case this.SETTINGS_KEYS.KEYPAD_LAYOUTS:
        this.layouts = value;

        if (option && option.notify && this.layoutsChangedCallback) {
          this.layoutsChangedCallback(this.layouts);
        }
        break;
      case this.SETTINGS_KEYS.ACTIVE_LAYOUT:
        this.activeLayout = value;

        if (option && option.notify && this.activeLayoutChangedCallback) {
          this.activeLayoutChangedCallback(value);
        }
        break;
      case this.SETTINGS_KEYS.ACTIVE_MODE:
        this.activeMode = value;

        if (option && option.notify && this.activeModeChangedCallback) {
          this.activeModeChangedCallback(value);
        }
        break;
      case this.SETTINGS_KEYS.DEFAULT_LAYOUT:
        this.defaultLayout = value;
        break;
      case this.SETTINGS_KEYS.DICT_CHANGE:
        if (option && option.notify && this.dictChangedCallback) {
          this.dictChangedCallback(value);
        }
        break;
      default:
        break;
    }

    if (option && option.save) {
      this._saveSettings(key, value);
    }
  };

  KeypadHelper.prototype._saveSettings = function _saveSettings(key, value) {
    SettingsObserver.setValue([
      {
        name: key,
        value
      }
    ]);
  };

  KeypadHelper.prototype.setT9Enabled = function setT9Enabled(option) {
    this._stashSettings(this.SETTINGS_KEYS.T9_ENABLED, option, { save: true });
  };

  KeypadHelper.prototype.setWordSuggestion = function setWordSuggestion(
    option
  ) {
    this._stashSettings(this.SETTINGS_KEYS.WORD_SUGGESTION, option, {
      save: true
    });
  };

  KeypadHelper.prototype.setActiveLayout = function setActiveLayout(layout) {
    this._stashSettings(this.SETTINGS_KEYS.ACTIVE_LAYOUT, layout, {
      save: true
    });
  };

  KeypadHelper.prototype.setActiveMode = function setActiveMode(mode) {
    this._stashSettings(this.SETTINGS_KEYS.ACTIVE_MODE, mode, { save: true });
  };

  KeypadHelper.prototype.setDefaultLayout = function setDefaultLayout() {
    for (const key in this.layouts) {
      this.layouts[key] = key === this.defaultLayout;
    }

    this._stashSettings(this.SETTINGS_KEYS.KEYPAD_LAYOUTS, this.layouts, {
      save: true
    });
  };

  KeypadHelper.prototype.setLayouts = function setLayouts(layouts) {
    this._stashSettings(this.SETTINGS_KEYS.KEYPAD_LAYOUTS, layouts, {
      save: true
    });
  };

  KeypadHelper.prototype.getT9Enabled = function getT9Enabled() {
    return new Promise(resolve => {
      if (this.t9Enabled === null) {
        this.getSettings().then(result => {
          resolve(result.t9Enabled);
        });
      } else {
        resolve(this.t9Enabled);
      }
    });
  };

  KeypadHelper.prototype.getWordSuggestion = function getWordSuggestion() {
    return new Promise(resolve => {
      if (this.wordSuggestion === null) {
        this.getSettings().then(result => {
          resolve(result.wordSuggestion);
        });
      } else {
        resolve(this.wordSuggestion);
      }
    });
  };

  KeypadHelper.prototype.getLayouts = function getLayouts() {
    return new Promise(resolve => {
      this.getSettings().then(result => {
        resolve(result.layouts);
      });
    });
  };

  KeypadHelper.prototype.getActiveLayout = function getActiveLayout() {
    return new Promise(resolve => {
      if (this.activeLayout === null) {
        this.getSettings().then(result => {
          resolve(result.activeLayout);
        });
      } else {
        resolve(this.activeLayout);
      }
    });
  };

  KeypadHelper.prototype.getActiveMode = function getActiveMode() {
    return new Promise(resolve => {
      if (this.activeMode === null) {
        this.getSettings().then(result => {
          resolve(result.activeMode);
        });
      } else {
        resolve(this.activeMode);
      }
    });
  };

  KeypadHelper.prototype.getUserWordList = function getUserWordList(lang) {
    return new Promise((resolve, reject) => {
      this.getDictBlobByLang(lang).then(
        blob => {
          const fileReader = new FileReader();
          fileReader.onload = event => {
            const blobString = event.target.result;
            resolve(blobString.split(KeypadHelper.DICT_DELIMITER).slice(0, -1));
          };
          fileReader.readAsText(blob);
        },
        err => {
          console.log(`Unable to parse ${lang} dictionary ${err}`);
          reject(err);
        }
      );
    });
  };

  KeypadHelper.prototype.putUserWordList = function putUserWordList(
    lang,
    words
  ) {
    let blobString = '';
    Array.from(words).forEach(word => {
      blobString = blobString + word + KeypadHelper.DICT_DELIMITER;
    });
    return this.putDictBlobByLang(lang, new Blob([blobString]));
  };

  KeypadHelper.prototype.getDictBlobByLang = function getDictBlobByLang(lang) {
    return new Promise((resolve, reject) => {
      const sdcard = navigator.b2g.getDeviceStorage('sdcard');
      const name = `.dictionary/${lang}.dic`;
      const request = sdcard.get(name);
      request.onsuccess = evt => {
        const fileReader = new FileReader();
        fileReader.onload = event => {
          const blobString = event.target.result;
          resolve(new Blob([blobString]));
        };
        fileReader.readAsText(evt.target.result);
      };
      request.onerror = err => {
        console.log(`Get ${lang} dict blob error: ${err}`);
        reject(err);
      };
    });
  };

  KeypadHelper.prototype.putDictBlobByLang = function putDictBlobByLang(
    lang,
    blob
  ) {
    return new Promise((resolve, reject) => {
      const sdcard = navigator.b2g.getDeviceStorage('sdcard');
      const name = `.dictionary/${lang}.dic`;
      const request = sdcard.delete(name);
      // eslint-disable-next-line no-multi-assign
      request.onsuccess = request.onerror = () => {
        const req = sdcard.addNamed(blob, name);
        req.onsuccess = result => {
          this._stashSettings(
            this.SETTINGS_KEYS.DICT_CHANGE,
            {
              lang,
              changeTime: Date.now()
            },
            { save: true }
          );
          resolve(result);
        };
        req.onerror = err => {
          console.log(`Unable to write ${lang} the file: ${err}`);
          reject(err);
        };
      };
    });
  };

  KeypadHelper.prototype.setT9ChangedCallback = function setT9ChangedCallback(
    callback
  ) {
    this.t9ChangedCallback = callback;
  };

  KeypadHelper.prototype.setWordSuggestionChangedCallback = function setWordSuggestionChangedCallback(
    callback
  ) {
    this.wordSuggestionChangedCallback = callback;
  };

  KeypadHelper.prototype.setLayoutsChangedCallback = function setLayoutsChangedCallback(
    callback
  ) {
    this.layoutsChangedCallback = callback;
  };

  KeypadHelper.prototype.setActiveLayoutChangedCallback = function setActiveLayoutChangedCallback(
    callback
  ) {
    this.activeLayoutChangedCallback = callback;
  };

  KeypadHelper.prototype.setActiveModeChangedCallback = function setActiveModeChangedCallback(
    callback
  ) {
    this.activeModeChangedCallback = callback;
  };

  KeypadHelper.prototype.setDictChangedCallback = function setDictChangedCallback(
    callback
  ) {
    this.dictChangedCallback = callback;
  };

  exports.KeypadHelper = KeypadHelper;
})(window);
