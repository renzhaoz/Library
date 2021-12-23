/*
 * -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
 * vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab:
 */
// Start Outer IIFE
(function manifestHelper(exports) {
  // Helper function, bound to manifest and property name in constructor
  function ManifestHelper_get(prop) {
    const manifest = this;
    let value = manifest[prop];

    const lang = window.api.l10n.language.code || '';

    if (
      lang in window.api.l10n.qps &&
      (prop === 'name' || prop === 'description' || prop === 'short_name')
    ) {
      value = window.api.l10n.qps[navigator.language].translate(value);
    } else if (manifest.locales) {
      /*
       * Try to replace values from the locales object using the best language
       * match.  stop when a replacement is found
       */
      [lang, lang.substr(0, lang.indexOf('-'))].some(function tryLanguage(
        langStr
      ) {
        // This === manifest.locales
        if (this[langStr] && this[langStr][prop]) {
          value = this[langStr][prop];
          // Aborts [].some
          return true;
        }
        return false;
      },
      manifest.locales);
    }

    // Return a new ManifestHelper for any object children
    if (typeof value === 'object' && !(value instanceof Array)) {
      value = new ManifestHelper(value);
    }
    return value;
  }

  /**
   * Helper object to access manifest information with locale support.
   *
   * @constructor
   * @param {Object} manifest The app manifest.
   */
  function ManifestHelper(manifest) {
    // Bind getters for the localized property values.
    // eslint-disable-next-line prefer-const
    for (let prop in manifest) {
      Object.defineProperty(this, prop, {
        get: ManifestHelper_get.bind(manifest, prop),
        enumerable: true
      });
    }
  }

  /**
   * Getter for display name (short_name if defined, otherwise name).
   */
  Object.defineProperty(ManifestHelper.prototype, 'displayName', {
    get: function get() {
      return this.short_name || this.name;
    }
  });

  exports.ManifestHelper = ManifestHelper;

  // End outer IIFE
})(window);
