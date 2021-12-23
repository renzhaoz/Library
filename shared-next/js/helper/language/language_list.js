/* global SettingsObserver */

/**
 * Helper object to find all supported languages;
 *
 * (Needs window.api.l10n and the settings permission)
 */

(function languageList(exports) {
  const LOCALES_FILE = '%SHARED_APP_ORIGIN%/resources/languages.json';

  function readFile(file) {
    return new Promise(function loadFile(resolve, reject) {
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function onreadystatechange() {
        if (xhr.readyState === 4) {
          if (xhr.status === 0 || xhr.status === 200) {
            resolve(xhr.response);
          } else {
            reject(xhr.statusText);
          }
        }
      };
      xhr.open('GET', file, true); // Async
      xhr.responseType = 'json';
      xhr.send();
    });
  }

  function readSetting(name) {
    return SettingsObserver.getValue(name);
  }

  exports.LanguageList = {
    _languages: null,

    // For stubbing in tests
    _readFile: readFile,
    _readSetting: readSetting,
    rtlList: ['ar', 'he', 'fa', 'ps', 'qps-plocm', 'ur', 'ks-IN', 'ur-IN'],
    getRtlList() {
      return this.rtlList;
    },
    _extendPseudo(languages, currentLang, qpsEnabled) {
      if (!window.api.l10n) {
        return languages;
      }
      // eslint-disable-next-line
      for (let lang in window.api.l10n.qps) {
        const isCurrent = lang === currentLang;
        if (isCurrent || qpsEnabled) {
          languages[lang] = window.api.l10n.qps[lang].name;
        }
      }

      return languages;
    },

    _build() {
      return Promise.all([
        this._languages || (this._languages = this._readFile(LOCALES_FILE)),
        this._readSetting('language.current'),
        this._readSetting('devtools.qps.enabled'),
        this._readSetting('config.language.list')
      ]).then(([langsFromFile, current, qpsEnabled, configLanguage]) => {
        let configKeys = null;
        let langs = null;
        if (configLanguage) {
          configKeys = Object.keys(configLanguage);
        }
        if (configKeys && configKeys.length > 0) {
          const langsFromConfig = this.filterLanguageList(
            configLanguage,
            langsFromFile,
            configKeys
          );
          langs = Object.create(langsFromConfig);
        } else {
          langs = Object.create(langsFromFile);
        }

        this._extendPseudo(langs, current, qpsEnabled);
        return [langs, current];
      });
    },

    filterLanguageList(configLanguage, langsFromFile, configKeys) {
      for (let i = 0; i < configKeys.length; i++) {
        if (
          !Object.prototype.hasOwnProperty.call(langsFromFile, configKeys[i])
        ) {
          delete configLanguage[configKeys[i]];
        }
      }
      return configLanguage;
    },

    get(callback) {
      if (!callback) {
        return;
      }

      this._build().then(Function.prototype.apply.bind(callback, null));
    },

    wrapBidi(langCode, langName) {
      /*
       * Right-to-Left (RTL) languages:
       * (http://www.w3.org/International/questions/qa-scripts)
       * Arabic, Hebrew, Farsi, Pashto, Mirrored English (pseudo), Urdu
       * Use script direction control-characters to wrap the text labels
       * Since markup (i.e. <bdo>) does not work inside <option> tags
       * http://www.w3.org/International/tutorials/bidi-xhtml/#nomarkup
       */
      const lEmbedBegin =
        this.rtlList.indexOf(langCode) >= 0 ? '\u202b' : '\u202a';
      const lEmbedEnd = '\u202c';
      /*
       * The control-characters enforce the language-specific script
       * direction to correctly display the text label (Bug #851457)
       */
      return lEmbedBegin + langName + lEmbedEnd;
    }
  };
})(window);
