/* global SettingsObserver */
(function settingsHelper(exports) {
  /**
   * SettingsHelper simplifies SettingsObserver access. It provides getter and
   * setter a specified setting. It iscreated by passing a setting key and an
   * optional default value.
   *
   * @param {String} key - The setting key
   * @param {Object} defaultValue - The default value
   *
   * Example:
   * // create a helper with a default false
   * var voicePrivacyHelper = SettingsHelper('ril.voicePrivacy.enabled', false);
   * // get value
   * voicePrivacyHelper.get(function(value) {});
   * // set value
   * voicePrivacyHelper.set(false, function() {});
   */
  const SettingsHelper = function SettingsHelper(key, defaultValue) {
    const SETTINGS_KEY = key;

    let _value = null;
    const _defaultValue = defaultValue;

    const _return = function _return(callback, ...args) {
      if (!callback) {
        return;
      }

      // eslint-disable-next-line prefer-spread
      callback.apply(null, Array.prototype.slice.call(args, 0));
    };

    const _getValue = function _getValue(callback) {
      SettingsObserver.getValue(SETTINGS_KEY).then(
        value => {
          _return(callback, value);
        },
        () => {
          console.error(`Error getting ${SETTINGS_KEY}.`);
          _return(callback, null);
        }
      );
    };

    const _setValue = function _setValue(value, callback) {
      SettingsObserver.setValue([
        {
          name: SETTINGS_KEY,
          value
        }
      ]).then(
        () => {
          _return(callback);
        },
        () => {
          console.error(`Error setting ${SETTINGS_KEY}.`);
          _return(callback);
        }
      );
    };

    return {
      /**
       * Get the setting value.
       *
       * @param {Function} callback - The setting value will be passed in the
       * callback function.
       */
      get: function get(callback) {
        _getValue(function _getValueFunc(value) {
          _value = value !== undefined ? value : _defaultValue;
          _return(callback, _value);
        });
      },
      /**
       * Set the setting value.
       *
       * @param {Object} value The setting value
       * @param {Function} callback The callback function.
       */
      set: function set(value, callback) {
        _setValue(value, _return.bind(null, callback));
      },
      /**
       * Cleanup ressources, specifically observers.
       */
      // eslint-disable-next-line no-empty-function
      uninit: function uninit() {}
    };
  };

  exports.SettingsHelper = SettingsHelper;
  // eslint-disable-next-line no-invalid-this
})(window);
