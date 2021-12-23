/**
 * Shim for window.api.hour12 API.
 * Send `localechanged` event if hour12 is changed.
 *
 * App need include following permission in manifest:
 *
 * "settings":{ "access": "readonly" }
 */
/* eslint-disable no-undef */
(function datetimeHelper() {
  // Not polyfill if API already exists
  if (!window.api) {
    window.api = {};
  }
  if (window.api.hour12) {
    return;
  }
  // Mock hour12 onto window.api
  window.api.hour12 = null;

  // Set hour12 and emit the locale change event if value changed
  const _setHour12 = function _setHour12(result) {
    if (window.api.hour12 !== result) {
      window.api.hour12 = result;
      // Emit the locale change event
      window.dispatchEvent(new CustomEvent('timeformatchange'));
    }
  };

  // Update hour12 to real value
  if (SettingsObserver) {
    SettingsObserver.observe('locale.hour12', false, value => {
      _setHour12(value);
    });
  }
})();
