/* eslint-disable prefer-destructuring */
/* globals LazyLoader, SettingsObserver, ClientIdCustomizer, Format */
/* exported SearchProvider */

(function searchProvide(exports) {
  /*
   * When the "search_providers_input.json" file is edited, both this
   * and PROVIDERS_VERSION in app/search/test/marionette/lib/search.js
   * should be bumped so existing clients reload the updated data
   */
  const VERSION = 3;

  // Cache for current provider configuration
  const SEARCH_CACHE_KEY = 'search.cache';
  // The users current provider selection
  const SEARCH_PROVIDER_KEY = 'search.provider';

  // File containing the provider configurations for all partners
  const DEFAULT_PROVIDERS_URL =
    '%SHARED_APP_ORIGIN%/js/helper/search_provider/search_providers.json';

  const PRELOADFILES = [];
  if (!window.ClientIdCustomizer) {
    PRELOADFILES.push(
      '%SHARED_APP_ORIGIN%/js/helper/search_provider/clientId_customizer.js'
    );
  }
  if (!window.Format) {
    PRELOADFILES.push(
      '%SHARED_APP_ORIGIN%/js/helper/search_provider/format.js'
    );
  }

  // Store the users current provider selection
  let provider = null;

  // Store the list of available providers
  let providers = {};
  let defaultEngine = null;

  // Notify a client when provider configuration changes
  let updatedFun = null;

  // Allow consumers to wait for data to be initialised
  let readyPromise = null;
  let resolver = null;

  function extend(dest, source) {
    for (const k in source) {
      if (Object.prototype.hasOwnProperty.call(source, k)) {
        const value = source[k];
        if (
          Object.prototype.hasOwnProperty.call(dest, k) &&
          typeof dest[k] === 'object' &&
          typeof value === 'object'
        ) {
          extend(dest[k], value);
        } else {
          dest[k] = value;
        }
      }
    }

    return dest;
  }

  function resolveUrl(urlConf) {
    const params = Object.keys(urlConf.params)
      .map(k => `${k}=${urlConf.params[k]}`)
      .join('&');
    return urlConf.url + (params ? `?${params}` : '');
  }

  /*
   * We havent got valid cached data so load the json configuration
   * file and pick the configuration based on the current
   * partner code
   */
  function loadProviderConfig() {
    LazyLoader.getJSON(DEFAULT_PROVIDERS_URL).then(result => {
      const conns = navigator.b2g.mobileConnections || [];
      const mccs = Array.prototype.slice.call(conns).map(conn => {
        if (conn.voice && conn.voice.network) {
          return `${Format.padLeft(conn.voice.network.mcc, 3, '0')}-
            ${Format.padLeft(conn.voice.network.mnc, 3, '0')}`;
        }

        return undefined;
      });
      const engines = SearchProvider.pickEngines(
        result,
        mccs,
        result.partner_code || null,
        navigator.language
      );
      defaultEngine = engines.defaultEngine;
      providers = engines.providers;

      // Cache for future lookups
      SettingsObserver.setValue([
        {
          name: SEARCH_CACHE_KEY,
          value: {
            defaultEngine,
            providers,
            version: VERSION
          }
        }
      ]);

      providersLoaded();
    });
  }

  /*
   * Once the providers are loaded, find the users current provider
   * selection
   */
  function providersLoaded() {
    SettingsObserver.observe(SEARCH_PROVIDER_KEY, false, value => {
      if (value === false || !(value in providers)) {
        provider = defaultEngine;
      } else {
        provider = value;
      }

      if (resolver && isReady()) {
        resolver();
        resolver = null;
      }

      if (updatedFun) {
        updatedFun();
      }
    });
  }

  function isReady() {
    return provider !== null && Object.keys(providers).length;
  }

  function SearchProvider(key) {
    if (!provider || !(key in providers[provider])) {
      return false;
    }
    return providers[provider][key];
  }

  SearchProvider.providerUpdated = cb => {
    updatedFun = cb;
  };

  SearchProvider.setProvider = value => {
    if (!(value in providers)) {
      return false;
    }

    SettingsObserver.setValue([
      {
        name: SEARCH_PROVIDER_KEY,
        value
      }
    ]);

    return true;
  };

  SearchProvider.selected = () => provider;

  SearchProvider.providers = () => providers;

  SearchProvider.pickEngines = (...args) => {
    const [config, sims, partnerCode, locale] = args;

    const _config = JSON.parse(JSON.stringify(config));

    let engine = _config.defaultEngines;
    const usersConfig = { defaultEngine: null, providers: {} };

    if (
      partnerCode in _config.partnerConfig &&
      locale in _config.partnerConfig[partnerCode]
    ) {
      engine = _config.partnerConfig[partnerCode][locale];
    }

    sims.forEach(sim => {
      if (sim in _config.simConfigs && locale in _config.simConfigs[sim]) {
        engine = _config.simConfigs[sim][locale];
      }
    });

    usersConfig.defaultEngine = engine.defaultEngine;
    Object.keys(engine.providers)
      .sort()
      // eslint-disable-next-line no-shadow
      .forEach(provider => {
        let obj = _config.search_providers[provider];

        if (locale in _config.locales && provider in _config.locales[locale]) {
          obj = extend(obj, _config.locales[locale][provider]);
        }

        obj = extend(obj, engine.providers[provider]);

        usersConfig.providers[provider] = {
          title: obj.title,
          searchUrl: ClientIdCustomizer.parse(resolveUrl(obj.search)),
          suggestUrl: resolveUrl(obj.suggest)
        };
      });

    return usersConfig;
  };

  SearchProvider.ready = () => {
    if (readyPromise) {
      return readyPromise;
    }

    // Attempt to load cached provider configuration
    LazyLoader.load(PRELOADFILES).then(() => {
      if (SettingsObserver) {
        SettingsObserver.getValue(SEARCH_CACHE_KEY).then(value => {
          /**
           * Do a version check so if the data has updated since it
           * was cached, reload it
           */
          if (value && value.version === VERSION) {
            defaultEngine = value.defaultEngine;
            providers = value.providers;
            providersLoaded();
          } else {
            /*
             * There was no cache or it failed the version check, reload
             * from file
             */
            loadProviderConfig();
          }
        });
      } else {
        console.warn('SettingsObserver is not loaded');
      }
    });

    readyPromise = new Promise(resolve => {
      resolver = resolve;
    });

    return readyPromise;
  };

  exports.SearchProvider = SearchProvider;
})(window);
