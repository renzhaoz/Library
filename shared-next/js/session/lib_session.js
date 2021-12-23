/* global LazyLoader, lib_session, lib_powermanager, lib_settings,
   lib_usbmanager, lib_apps, lib_telephony, lib_tcpsocket, importScripts
   lib_devicecapability, lib_contacts, lib_audiovolume, DUMP, lib_procmanager,
   lib_time, lib_fota, lib_accounts */

/*
 * 'services-load-complete': services load complete
 * 'session-disconnected': onsessiondisconnected
 */
let inServiceWorker = false;
if (typeof window === 'undefined') {
  inServiceWorker = true;
  window = { // eslint-disable-line
    dispatchEvent: (...args) => {
      dispatchEvent.apply(self, args);
    },
    addEventListener: (...args) => {
      addEventListener.apply(self, args);
    }
  };
}

function LibSession() {
  this.debug('LibSession');
  this.DEBUG = false;
  this.LOCALHOST = '%API_DAEMON_URI%/api/v1/';
  this.services = [];
  this.session = null;
  this.sessionFiles = [
    `${this.LOCALHOST}shared/core.js`,
    `${this.LOCALHOST}shared/session.js`
  ];

  this.serviceSessionMapping = {
    settingsService: {
      apiName: 'settingsmanager',
      sessionInitFunc: session => {
        return lib_settings.SettingsManager.get(session);
      },
      fileLists: [`${this.LOCALHOST}settings/service.js`]
    },

    powerService: {
      apiName: 'powermanager',
      sessionInitFunc: session => {
        return lib_powermanager.PowermanagerService.get(session);
      },
      fileLists: [`${this.LOCALHOST}powermanager/service.js`]
    },

    usbService: {
      apiName: 'usbmanager',
      sessionInitFunc: session => {
        return lib_usbmanager.UsbmanagerService.get(session);
      },
      fileLists: [`${this.LOCALHOST}usbmanager/service.js`]
    },

    accountsService: {
      apiName: 'accountmanager',
      sessionInitFunc: session => {
        return lib_accounts.AccountManager.get(session);
      },
      fileLists: [`${this.LOCALHOST}accounts/service.js`]
    },

    appsService: {
      apiName: 'appsmanager',
      sessionInitFunc: session => {
        return lib_apps.AppsManager.get(session);
      },
      fileLists: [`${this.LOCALHOST}apps/service.js`]
    },

    tcpsocketService: {
      apiName: 'tcpsocketmanager',
      sessionInitFunc: session => {
        return lib_tcpsocket.TcpSocketManager.get(session);
      },
      fileLists: [`${this.LOCALHOST}tcpsocket/service.js`]
    },

    telephonyService: {
      apiName: 'telephonymanager',
      sessionInitFunc: session => {
        return lib_telephony.Telephony.get(session);
      },
      fileLists: [`${this.LOCALHOST}telephony/service.js`]
    },

    devicecapabilityService: {
      apiName: 'devicecapabilitymanager',
      sessionInitFunc: session => {
        return lib_devicecapability.DeviceCapabilityManager.get(session);
      },
      fileLists: [`${this.LOCALHOST}devicecapability/service.js`]
    },

    contactsService: {
      apiName: 'contactsmanager',
      sessionInitFunc: session => {
        return lib_contacts.ContactsManager.get(session);
      },
      fileLists: [`${this.LOCALHOST}contacts/service.js`]
    },

    audiovolumeService: {
      apiName: 'audiovolumemanager',
      sessionInitFunc: session => {
        return lib_audiovolume.AudioVolumeManager.get(session);
      },
      fileLists: [`${this.LOCALHOST}audiovolumemanager/service.js`]
    },

    procmanagerService: {
      apiName: 'procmanager',
      sessionInitFunc: session => {
        return lib_procmanager.ProcManager.get(session);
      },
      fileLists: [`${this.LOCALHOST}procmanager/service.js`]
    },

    timeService: {
      apiName: 'timeservice',
      sessionInitFunc: session => {
        return lib_time.TimeService.get(session);
      },
      fileLists: [`${this.LOCALHOST}time/service.js`]
    },

    fotaService: {
      apiName: 'fota',
      sessionInitFunc: session => {
        return lib_fota.Fota.get(session);
      },
      fileLists: [`${this.LOCALHOST}fota/service.js`]
    }
  };
}

LibSession.prototype.debug = function debug(msg) {
  if (this.DEBUG) {
    console.log(`[LibSession] ${msg}`);
  } else if (window.DUMP) {
    DUMP(`[LibSession] ${msg}`); // eslint-disable-line
  }
};

LibSession.prototype.sessionInit = function sessionInit(services) {
  this.debug('sessionInit');
  const promises = [];
  services.forEach(service => {
    const sessionInfo = this.serviceSessionMapping[service];
    if (sessionInfo) {
      const promise = sessionInfo.sessionInitFunc(this.session);
      promise.then(managerService => {
        window.api[sessionInfo.apiName] = managerService;
      });
      promises.push(promise);
    }
  });
  return Promise.all(promises).then(() => {
    this.debug('services-load-complete');
    window.dispatchEvent(new CustomEvent('services-load-observer'));
    window.dispatchEvent(new CustomEvent('services-load-complete'));
    return this.session;
  });
};

LibSession.prototype.initService = function initService(services) {
  return new Promise((resolve, reject) => {
    if (!services || !services.length) {
      reject(Error('No service'));
    }
    let load = null;
    let lazyLoadFiles = this.sessionFiles;
    services.forEach(service => {
      const sessionInfo = this.serviceSessionMapping[service];
      if (sessionInfo) {
        lazyLoadFiles = lazyLoadFiles.concat(sessionInfo.fileLists);
      }
    });
    if (inServiceWorker) {
      load = new Promise(res => {
        lazyLoadFiles.forEach(file => {
          importScripts(file);
        });
        res();
      });
    } else {
      load = LazyLoader.load(lazyLoadFiles);
    }
    load.then(
      () => {
        if (this.services.length) {
          services.forEach(service => {
            if (!this.services.includes(service)) {
              this.services.push(service);
            }
          });
        } else {
          this.services = this.services.concat(services);
        }
        // Not first initService
        if (this.session) {
          // Session already connected before this init
          if (
            window.api &&
            window.api.session &&
            window.api.session.connected
          ) {
            this.sessionInit(services).then(resolve);
          } else {
            this.debug('Waiting for session connected');
            window.addEventListener(
              'services-load-complete',
              () => {
                resolve(this.session);
              },
              { once: true }
            );
          }
        } else {
          this.session = new lib_session.Session();
          const sessionstate = {};
          if (!window.api) {
            window.api = {};
          }
          const { api } = window;
          api.session = this.session;

          sessionstate.onsessionconnected = () => {
            this.debug('onsessionconnected');
            this.sessionInit(this.services).then(resolve);
          };
          sessionstate.onsessiondisconnected = () => {
            window.dispatchEvent(new CustomEvent('session-disconnected'));
            this.debug('session onsessiondisconnected Daemon Crashed');
            if (
              document.hidden &&
              window &&
              window.parent &&
              window.parent.location.hostname !== 'b2g'
            ) {
              const { href } = window.parent.location;
              if (href && !href.includes('callscreen.localhost')) {
                this.debug(`Force close app: ${href}`);
                window.close();
              }
            }
          };
          try {
            navigator.b2g.externalapi.getToken().then(token => {
              this.session.open(
                'websocket',
                '%API_DAEMON_HOST%',
                token,
                sessionstate,
                true
              );
            });
          } catch (e) {
            this.session.open(
              'websocket',
              '%API_DAEMON_HOST%',
              'secrettoken',
              sessionstate,
              true
            );
          }
        }
      },
      () => {
        this.debug('session lazyload failed');
      }
    );
  });
};

window.libSession = new LibSession();
