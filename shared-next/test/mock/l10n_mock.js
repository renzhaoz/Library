const rtlList = [
  'ar-SA',
  'he-IL',
  'fa-IR',
  'ps-AF',
  'qps-plocm',
  'ur-PK',
  'ks-IN',
  'ur-IN'
];

window.api = {
  l10n: {
    change: cb => {
      cb();
    },
    get: text => {
      return text;
    },
    setAttributes: (element, id, args) => {
      element.setAttribute('data-l10n-id', id);
      if (args) {
        element.setAttribute('data-l10n-args', JSON.stringify(args));
      }
    },
    language: {
      set code(lang) {
        this.lang = lang;
      },
      get code() {
        return this.lang;
      },
      get direction() {
        return rtlList.indexOf(this.lang) >= 0 ? 'rtl' : 'ltr';
      }
    },
    qps: {
      'qps-ploc': {
        id: 'qps-ploc',
        name: 'Accented English',
        translate: value => {
          return value;
        }
      },
      'qps-plocm': {
        id: 'qps-plocm',
        name: 'Mirrored English',
        translate: value => {
          return value;
        }
      }
    },
    once: function once(callback) {
      callback();
    },
    DateTimeFormat: class DateTimeFormat {
      localeFormat(timestamp) {
        return new Date(timestamp);
      }
    }
  }
};
