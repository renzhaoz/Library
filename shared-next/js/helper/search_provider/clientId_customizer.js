/* globals SettingsObserver */
/* exported ClientIdCustomizer */

(function clientIdCustomizer(exports) {
  // Provider name which is supported for OEM client id.
  const CUSTOMIZED_PROVIDER_NAME = 'google';

  // Google customized client configuration key.
  const GOOGLE_CLIENT_ID_KEY = 'google.client_id';
  // The value to search for client id.
  const CLIENT_REGEXP = 'client=';
  // Runtime value
  let googleClientId = null;

  // Flag to control debug toggle state.
  const DEBUG = false;

  function debug(msg) {
    if (DEBUG) {
      console.log(`--> ClientIdCustomizer(): ${msg}`);
    }
  }

  /**
   * A parser to customize google search client id according to
   * the settings key 'google.client_id' given or not.
   */
  function ClientIdCustomizer() {
    this.getGoogleClientId();
  }

  ClientIdCustomizer.prototype = {
    /**
     * Fetch client id which is customized and configured in common settings.
     */
    getGoogleClientId() {
      if (SettingsObserver) {
        SettingsObserver.getValue(GOOGLE_CLIENT_ID_KEY).then(customizedId => {
          if (customizedId && customizedId !== '') {
            googleClientId = customizedId;
            debug(`customized google client id to be = ${googleClientId}`);
          }
        });
      }
    },

    /**
     * Replace client by settings configuration.
     * If there is no configuration, return it directly.
     */
    parse(searchUrl) {
      if (!googleClientId) {
        // Early return since no customized request.
        return searchUrl;
      }

      if (searchUrl.indexOf(CUSTOMIZED_PROVIDER_NAME) < 0) {
        // Early return since the url is not contained provider name 'google'.
        return searchUrl;
      }

      if (searchUrl.indexOf(CLIENT_REGEXP) < 0) {
        // Early return since the url is not contained 'client' id.
        return searchUrl;
      }

      const newUrl =
        searchUrl.slice(
          0,
          searchUrl.indexOf(CLIENT_REGEXP) + CLIENT_REGEXP.length
        ) + googleClientId;

      debug(`newUrl = ${newUrl}`);

      return newUrl;
    }
  };

  exports.ClientIdCustomizer = new ClientIdCustomizer();
})(window);
