/**
 * IccHelper redirect calls to ICC related APIs to correct object. IccHelper is
 * created for backward compatibility of gaia master after the patch of
 * bug 814637 landed in m-c. In the patch the interface provided by IccManager
 * was moved to a icc object. Details please refer to the URL[1].
 * The helper *MUST* be removed once all gaia developement no longer depend
 * on b2g26.
 * [1]: https://wiki.mozilla.org/WebAPI/WebIccManager/Multi-SIM
 */
(function iccHelper(exports) {
  const _iccManager = navigator.b2g.iccManager;
  let _iccProxy = null;
  Object.defineProperty(exports, 'IccHelper', {
    configurable: true,
    get() {
      return _iccProxy;
    },
    /*
     * This is for code that sets value to IccHelper. And for unit tests that
     * mock IccHelper.
     */
    set(value) {
      _iccProxy = value;
    }
  });
  if (_iccManager && _iccManager.getIccById) {
    let activeIccObj = null;

    const eventListeners = {};
    const cachedEventListeners = {}; // Cache on + 'eventName' event handlers
    const events = [
      'cardstatechange',
      'iccinfochange',
      'stkcommand',
      'stksessionend'
    ];

    const getters = ['iccInfo', 'cardState'];
    const methods = [
      'sendStkResponse',
      'sendStkMenuSelection',
      'sendStkTimerExpiration',
      'sendStkEventDownload'
    ];
    const domRequests = [
      'getCardLock',
      'unlockCardLock',
      'setCardLock',
      'getCardLockRetryCount',
      'readContacts',
      'updateContact',
      'iccOpenChannel',
      'iccExchangeAPDU',
      'iccCloseChannel'
    ];

    const getterTemplate = name => {
      return () => {
        if (activeIccObj) {
          return activeIccObj[name];
        }
        return null;
      };
    };

    const methodTemplate = name => {
      return () => {
        if (activeIccObj) {
          // eslint-disable-next-line
          return activeIccObj[name].apply(activeIccObj, arguments);
        }
        return null;
      };
    };

    // Multi-SIM API available
    const createIccProxy = function createIccProxy() {
      const iccProxy = {
        addEventListener(eventName, callback) {
          if (typeof callback !== 'function') {
            return;
          }
          if (events.indexOf(eventName) === -1) {
            return;
          }

          let listeners = eventListeners[eventName];
          if (listeners === null) {
            eventListeners[eventName] = [];
            listeners = [];
          }
          if (listeners.indexOf(callback) === -1) {
            listeners.push(callback);
          }
        },
        removeEventListener(eventName, callback) {
          const listeners = eventListeners[eventName];
          if (listeners) {
            const index = listeners.indexOf(callback);
            if (index !== -1) {
              listeners.splice(index, 1);
            }
          }
        }
      };

      getters.forEach(getter => {
        Object.defineProperty(iccProxy, getter, {
          enumerable: true,
          get: getterTemplate(getter)
        });
      });

      methods.forEach(method => {
        iccProxy[method] = methodTemplate(method);
      });

      domRequests.forEach(request => {
        iccProxy[request] = methodTemplate(request);
      });

      events.forEach(eventName => {
        /*
         * Define 'on' + eventName properties
         * Assigning an event handler and adding an event listener are
         * handled separately. We need to simulate the same behavior in
         * IccHelper.
         */
        Object.defineProperty(iccProxy, `on${eventName}`, {
          enumerable: true,
          set(newListener) {
            const oldListener = cachedEventListeners[eventName];
            if (oldListener) {
              iccProxy.removeEventListener(eventName, oldListener);
            }
            cachedEventListeners[eventName] = newListener;

            if (newListener) {
              iccProxy.addEventListener(eventName, newListener);
            }
          },
          get() {
            return cachedEventListeners[eventName];
          }
        });
      });

      return iccProxy;
    };

    // Initialize icc proxy
    _iccProxy = createIccProxy();
    if (_iccManager.iccIds && _iccManager.iccIds.length) {
      activeIccObj = _iccManager.getIccById(_iccManager.iccIds[0]);

      if (activeIccObj) {
        // Register to callback
        events.forEach(eventName => {
          activeIccObj.addEventListener(eventName, function activeIccHandle(
            event
          ) {
            const listeners = eventListeners[eventName];
            if (listeners) {
              listeners.forEach(listener => {
                listener(event);
              });
            }
          });
        });
      }
    }

    _iccManager.oniccdetected = function oniccdetected(event) {
      if (_iccProxy.cardState === null) {
        activeIccObj = _iccManager.getIccById(event.iccId);

        if (activeIccObj) {
          // Register to callback
          events.forEach(eventName => {
            activeIccObj.addEventListener(eventName, function activeIccHandle(
              evt
            ) {
              const listeners = eventListeners[eventName];
              if (listeners) {
                listeners.forEach(listener => {
                  listener(evt);
                });
              }
            });
          });

          /*
           * Trigger cardstatechange and iccinfochange manually when a icc
           * object becomes valid (detected).
           */
          ['cardstatechange', 'iccinfochange'].forEach(eventName => {
            if (eventListeners[eventName]) {
              eventListeners[eventName].forEach(listener => {
                listener();
              });
            }
          });
        }
      }
    };
  } else {
    _iccProxy = _iccManager;
  }
})(window);
