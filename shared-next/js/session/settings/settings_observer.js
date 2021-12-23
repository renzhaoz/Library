/* exported SettingsObserver */
/* global lib_settings taskScheduler */

const SettingsObserver = {
  /* Keep record of observers in order to remove them in the future */
  _observers: [],
  _observersArray: [],
  _pendingGetValueRequests: {}, // Struct is { name: [resolve0, resolve1, ...] }
  initiated: false,
  restoreObserves: false,
  init() {
    if (!this.initiated) {
      this.initiated = true;
      window.addEventListener('session-disconnected', () => {
        const { settingsmanager } = window.api;
        if (settingsmanager) {
          this._observers.forEach(name => {
            settingsmanager.removeObserver(name, this.observer);
          });
        }
        this._observers = [];
        delete this.observer;
      });
      window.addEventListener('services-load-observer', () => {
        this.createObserver();
        this.processPendingRequest();
      });
      window.addEventListener('services-load-complete', () => {
        this.convertToGetBatch();
      });
    }
  },

  createObserver() {
    class Observer extends lib_settings.SettingObserverBase {
      constructor(service, session) {
        super(service.id, session);
      }

      display() {
        return 'Setting observer';
      }

      callback(setting) {
        SettingsObserver._observers.forEach(result => {
          if (result.name === setting.name) {
            result.callback(setting.value, setting.name);
          }
        });
        return Promise.resolve();
      }
    }
    const { settingsmanager } = window.api;
    this.observer = new Observer(settingsmanager, window.api.session);
  },

  processPendingRequest() {
    this.restoreObserves = true;
    this._observersArray.forEach(obj => {
      const { name, defaultValue, callbackHandle, observeOnly } = obj;
      this.observe(name, defaultValue, callbackHandle, observeOnly);
    });
    this.restoreObserves = false;
  },

  pendingProcessGetValue(name, resolve) {
    if (!this._pendingGetValueRequests[name]) {
      this._pendingGetValueRequests[name] = [];
    }
    this._pendingGetValueRequests[name].push(resolve);
  },

  convertToGetBatch() {
    const namesArray = [];
    for (const name in this._pendingGetValueRequests) {
      namesArray.push(name);
    }
    if (namesArray.length) {
      this.getBatch(namesArray).then(results => {
        results.forEach(result => {
          const { name, value } = result;
          const resolves = this._pendingGetValueRequests[name];
          if (resolves) {
            resolves.forEach(resolve => {
              resolve(value);
            });
            delete this._pendingGetValueRequests.name;
          }
        });
        for (const name in this._pendingGetValueRequests) {
          const resolves = this._pendingGetValueRequests[name];
          if (resolves) {
            resolves.forEach(resolve => {
              resolve(undefined);
            });
            delete this._pendingGetValueRequests.name;
          }
        }
        this._pendingGetValueRequests = {};
      });
    } else {
      this._pendingGetValueRequests = {};
    }
  },

  /**
   * @param name
   */
  getValue(...args) {
    return new Promise(resolve => {
      if (taskScheduler.connected) {
        taskScheduler
          .request({
            serverName: taskScheduler.SETTINGS,
            funcName: 'get',
            args
          })
          .then(
            result => {
              const { value } = result;
              resolve(value);
            },
            () => {
              resolve(undefined);
            }
          );
      } else {
        this.pendingProcessGetValue(args[0], resolve);
      }
    });
  },

  /**
   * @param names array
   */
  getBatch(...args) {
    return new Promise((resolve, reject) => {
      taskScheduler
        .request({
          serverName: taskScheduler.SETTINGS,
          funcName: 'getBatch',
          args
        })
        .then(
          result => {
            resolve(result);
          },
          e => {
            reject(e);
          }
        );
    });
  },

  /**
   * @param settings
   */
  setValue(...args) {
    return taskScheduler.request({
      serverName: taskScheduler.SETTINGS,
      funcName: 'set',
      args
    });
  },

  // eslint-disable-next-line
  observe(name, defaultValue, callbackHandle, observeOnly) {
    if (this.observer) {
      if (!observeOnly) {
        this.getValue(name).then(
          value => {
            if (value === undefined) {
              callbackHandle(defaultValue, name);
            } else {
              callbackHandle(value, name);
            }
          },
          () => {
            callbackHandle(defaultValue, name);
          }
        );
        observeOnly = true;
      }
      const observed = SettingsObserver._observers.find(value => {
        return value.name === name;
      });
      if (!observed) {
        const { settingsmanager } = window.api;
        settingsmanager.addObserver(name, this.observer);
      }
      this._observers.push({
        name,
        callback: callbackHandle
      });
    }
    if (!this.restoreObserves) {
      this._observersArray.push({
        name,
        defaultValue,
        callbackHandle,
        observeOnly
      });
    }
  },

  unobserve(name, callback) {
    for (let index = 0; index < this._observersArray.length; index++) {
      const observer = this._observersArray[index];
      if (observer.name === name && observer.callbackHandle === callback) {
        this._observersArray.splice(index, 1);
        break;
      }
    }
    if (!this.observer) {
      return;
    }

    const { settingsmanager } = window.api;
    if (settingsmanager) {
      for (let index = 0; index < this._observers.length; index++) {
        if (
          this._observers[index].name === name &&
          this._observers[index].callback === callback
        ) {
          this._observers.splice(index, 1);
          break;
        }
      }
      const observed = SettingsObserver._observers.find(value => {
        return value.name === name;
      });
      if (!observed) {
        settingsmanager.removeObserver(name, this.observer);
      }
    }
  }
};
SettingsObserver.init();
window.SettingsObserver = SettingsObserver;
