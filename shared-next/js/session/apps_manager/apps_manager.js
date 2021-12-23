/* exported AppsManager */
/* global taskScheduler, lib_apps*/

const AppsManager = {
  connected: false,
  initFlag: false,
  eventListenerInfo: {},
  eventList: [
    'download_failed',
    'install',
    'installing',
    'uninstall',
    'update_available',
    'update',
    'updating',
    'status_changed'
  ],

  init() {
    if (!this.initFlag) {
      this.initFlag = true;
      window.addEventListener('session-disconnected', () => {
        this.connected = false;
      });
      window.addEventListener('services-load-observer', () => {
        if (!this.connected) {
          this.connected = true;
          this.recoverListener();
          this.updateDefaultConsts();
        }
      });
    }
    this.initDefaultConsts();
  },

  initDefaultConsts() {
    this.AppsInstallState = {
      INSTALLED: 0,
      INSTALLING: 1,
      PENDING: 2
    };

    this.AppsServiceError = {
      APP_NOT_FOUND: 0,
      CANCELED: 1,
      CLEAR_DATA_ERROR: 2,
      DEPENDENCIES_ERROR: 3,
      DISK_SPACE_NOT_ENOUGH: 4,
      DOWNLOAD_MANIFEST_FAILED: 5,
      DOWNLOAD_PACKAGE_FAILED: 6,
      DUPLICATED_ACTION: 7,
      INVALID_APP_NAME: 8,
      INVALID_START_URL: 9,
      INVALID_STATE: 10,
      INVALID_MANIFEST: 11,
      INVALID_PACKAGE: 12,
      INVALID_SIGNATURE: 13,
      INVALID_CERTIFICATE: 14,
      NETWORK_FAILURE: 15,
      FILESYSTEM_FAILURE: 16,
      PACKAGE_CORRUPT: 17,
      REGISTRATION_ERROR: 18,
      REINSTALL_FORBIDDEN: 19,
      UPDATE_ERROR: 20,
      UNKNOWN_ERROR: 21
    };

    this.AppsServiceState = {
      INITIALIZING: 0,
      RUNNING: 1,
      TERMINATING: 2
    };

    this.AppsStatus = {
      ENABLED: 0,
      DISABLED: 1
    };

    this.AppsUpdateState = {
      IDLE: 0,
      AVAILABLE: 1,
      DOWNLOADING: 2,
      UPDATING: 3,
      PENDING: 4
    };

    this.ClearType = {
      BROWSER: 0,
      STORAGE: 1
    };

    this.ConnectionType = {
      WI_FI_ONLY: 0,
      ANY: 1
    };
  },

  updateDefaultConsts() {
    if (typeof lib_apps === 'undefined') {
      return;
    }
    const {
      AppsInstallState,
      AppsServiceError,
      AppsServiceState,
      AppsStatus,
      AppsUpdateState,
      ClearType,
      ConnectionType
    } = lib_apps;
    this.AppsInstallState = AppsInstallState;
    this.AppsServiceError = AppsServiceError;
    this.AppsServiceState = AppsServiceState;
    this.AppsStatus = AppsStatus;
    this.AppsUpdateState = AppsUpdateState;
    this.ClearType = ClearType;
    this.ConnectionType = ConnectionType;
  },

  getAll() {
    return this._getAll().then(
      apps => {
        return apps;
      },
      () => {
        console.error('GetAll return from reject, retry it');
        return this.getAll();
      }
    );
  },

  _getAll() {
    return taskScheduler.request({
      serverName: taskScheduler.APPS,
      funcName: 'getAll'
    });
  },
  /**
   * @param manifestUrl
   */
  getApp(...args) {
    return taskScheduler.request({
      serverName: taskScheduler.APPS,
      funcName: 'getApp',
      args
    });
  },

  getState() {
    return taskScheduler.request({
      serverName: taskScheduler.APPS,
      funcName: 'getState'
    });
  },

  /**
   * @param manifestUrl
   */
  installPackage(...args) {
    return taskScheduler.request({
      serverName: taskScheduler.APPS,
      funcName: 'installPackage',
      args
    });
  },

  /**
   * @param manifestUrl
   */
  uninstall(...args) {
    return taskScheduler.request({
      serverName: taskScheduler.APPS,
      funcName: 'uninstall',
      args
    });
  },

  /**
   * @param manifestUrl
   */
  update(...args) {
    return taskScheduler.request({
      serverName: taskScheduler.APPS,
      funcName: 'update',
      args
    });
  },

  /**
   * @param {string} updateUrl - The updateUrl of a app.
   * @param {object} [AppsOptions] - AppsOptions for setup app autoInstall.
   * @param {boolean} [AppsOptions.autoInstall] - For enable and disable app autoInstall.
   */
  checkForUpdate(updateUrl, { autoInstall = false } = {}) {
    return taskScheduler.request({
      serverName: taskScheduler.APPS,
      funcName: 'checkForUpdate',
      args: [updateUrl, { autoInstall }]
    });
  },

  /**
   * @param The manifestUrl of a PWA manifest from the host server
   */
  installPwa(...args) {
    return taskScheduler.request({
      serverName: taskScheduler.APPS,
      funcName: 'installPwa',
      args
    });
  },

  /**
   * @param manifestUrl
   * @param AppsStatus
   */
  setEnabled(...args) {
    return taskScheduler.request({
      serverName: taskScheduler.APPS,
      funcName: 'setEnabled',
      args
    });
  },

  /**
   * @param manifestUrl
   * @param ClearType
   */
  clear(...args) {
    return taskScheduler.request({
      serverName: taskScheduler.APPS,
      funcName: 'clear',
      args
    });
  },

  // Get update policy from apps service.
  getUpdatePolicy() {
    return taskScheduler.request({
      serverName: taskScheduler.APPS,
      funcName: 'getUpdatePolicy'
    });
  },

  /**
   * @param {object} updatePolicyConfig
   * @param {bool} updatePolicyConfig.enabled - enabled to enable/disable auto update check.
   * @param {number} updatePolicyConfig.connType - ConnectionType.WI_FI_ONLY | ConnectionType.ANY
   * @param {number} updatePolicyConfig.delay, Interval to execute check for update for apps.
   */
  setUpdatePolicy(...args) {
    return taskScheduler.request({
      serverName: taskScheduler.APPS,
      funcName: 'setUpdatePolicy',
      args
    });
  },

  /**
   * @param {string} updateUrl - The updateUrl of a app.
   */
  cancelDownload(...args) {
    return taskScheduler.request({
      serverName: taskScheduler.APPS,
      funcName: 'cancelDownload',
      args
    });
  },

  getServiceEventList() {
    let serviceEventList = [];
    if (window.api && window.api.appsmanager) {
      serviceEventList = [
        window.api.appsmanager.APP_DOWNLOAD_FAILED_EVENT,
        window.api.appsmanager.APP_INSTALLED_EVENT,
        window.api.appsmanager.APP_INSTALLING_EVENT,
        window.api.appsmanager.APP_UNINSTALLED_EVENT,
        window.api.appsmanager.APP_UPDATE_AVAILABLE_EVENT,
        window.api.appsmanager.APP_UPDATED_EVENT,
        window.api.appsmanager.APP_UPDATING_EVENT,
        window.api.appsmanager.APPSTATUS_CHANGED_EVENT
      ];
    }
    return serviceEventList;
  },

  addEventListener(event, callback) {
    const index = this.eventList.indexOf(event);
    if (index === -1) {
      return;
    }
    if (this.connected) {
      const serviceEventList = this.getServiceEventList();
      window.api.appsmanager.addEventListener(
        serviceEventList[index],
        callback
      );
    }
    if (this.eventListenerInfo[event]) {
      this.eventListenerInfo[event].push(callback);
    } else {
      this.eventListenerInfo[event] = [callback];
    }
  },

  removeEventListener(event, callback) {
    const index = this.eventList.indexOf(event);
    if (index === -1) {
      return;
    }
    if (this.connected) {
      const serviceEventList = this.getServiceEventList();
      window.api.appsmanager.removeEventListener(
        serviceEventList[index],
        callback
      );
    }
    if (this.eventListenerInfo[event]) {
      this.eventListenerInfo[event].forEach((listener, listenerIndex) => {
        if (listener === callback) {
          this.eventListenerInfo[event].splice(listenerIndex, 1);
        }
      });
    }
  },

  recoverListener() {
    let event = '';
    const serviceEventList = this.getServiceEventList();
    for (event in this.eventListenerInfo) {
      const evt = event;
      const listeners = this.eventListenerInfo[evt];
      const index = this.eventList.indexOf(evt);

      if (index !== -1) {
        listeners.forEach(listener => {
          window.api.appsmanager.addEventListener(
            serviceEventList[index],
            listener
          );
        });
      }
    }
  }
};
AppsManager.init();
window.AppsManager = AppsManager;
