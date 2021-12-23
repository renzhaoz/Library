/**
 * The util is created to facilitate the app origin stuff.
 * The placeholders, %var%, would be replaced
 * with environment variables by Gaia build script.
 */

(function app_origin(exports) {
  /**
   * In case some of the app name changes may cause hundred of places
   * to be revised, we can utilize the route map to perform
   * the transition instead.
   */
  const routeMap = {
    // [from]: [to]
    'kaios-plus': 'kaios-store'
  };

  const AppOrigin = {
    getOrigin: function getOrigin(appName) {
      if (appName) {
        // Route to the destination app name, if any.
        const destAppName = routeMap[appName] || appName;
        return `%GAIA_SCHEME%${destAppName}.%GAIA_DOMAIN%`;
      }
      throw new TypeError('"appName" is required for getOrigin().');
    },
    getManifestURL: function getManifestURL(appName) {
      if (appName) {
        // Route to the destination app name, if any.
        const destAppName = routeMap[appName] || appName;
        return `%GAIA_SCHEME%${destAppName}.%GAIA_DOMAIN%/%MANIFEST_NAME%`;
      }
      throw new TypeError('"appName" is required for getManifestURL().');
    },
    getManifestName: function getManifestName() {
      return '%MANIFEST_NAME%';
    },
    getScheme: function getScheme() {
      return '%GAIA_SCHEME%';
    },
    getProtocol: function getProtocol() {
      return '%GAIA_SCHEME%'.replace('://', '');
    },
    getRootDomain: function getRootDomain() {
      return '%GAIA_DOMAIN%';
    }
  };

  exports.AppOrigin = AppOrigin;
})(window);
