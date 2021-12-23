/* exported PowerManager */
/* global taskScheduler */

const PowerManager = {
  _powerOff: false,
  _reboot: false,
  _factoryReset: undefined,
  _screenEnabled: undefined,
  _extScreenEnabled: undefined,
  _keyLightEnabled: undefined,
  _screenBrightness: undefined,
  _extScreenBrightness: undefined,
  _keyLightBrightness: undefined,
  _cpuSleepAllowed: undefined,
  connected: false,
  initFlag: false,
  _extScreenEnabledState: false,

  init() {
    if (!this.initFlag) {
      this.initFlag = true;
      window.addEventListener('session-disconnected', () => {
        this.connected = false;
      });
      window.addEventListener('services-load-complete', () => {
        if (!this.connected) {
          this.connected = true;
          this.processPendingRequest();
        }
      });
    }
  },

  getExtScreenState() {
    return this._extScreenEnabledState;
  },

  powerOff() {
    if (this.connected) {
      this._powerOff = false;
      window.api.powermanager.powerOff();
    } else {
      this._powerOff = true;
    }
  },

  reboot() {
    if (this.connected) {
      this._reboot = false;
      window.api.powermanager.reboot();
    } else {
      this._reboot = true;
    }
  },

  /*
   * Enum FactoryResetReason {
   * normal
   * wipe
   * root
   *}
   */
  setFactoryReset(reason) {
    if (this.connected) {
      window.api.powermanager.factoryReset = reason;
      this._factoryReset = undefined;
    } else {
      this._factoryReset = reason;
    }
  },

  setScreenEnabled(enable) {
    if (this.connected) {
      window.api.powermanager.screenEnabled = enable;
      this._screenEnabled = undefined;
    } else {
      this._screenEnabled = enable;
    }
  },

  setExtScreenEnabled(enable) {
    if (this.connected) {
      window.api.powermanager.extScreenEnabled = enable;
      this._extScreenEnabled = undefined;
    } else {
      this._extScreenEnabled = enable;
    }
    this._extScreenEnabledState = enable;
  },

  setKeyLightEnabled(enable) {
    if (this.connected) {
      window.api.powermanager.keyLightEnabled = enable;
      this._keyLightEnabled = undefined;
    } else {
      this._keyLightEnabled = enable;
    }
  },

  setScreenBrightness(bright) {
    if (this.connected) {
      window.api.powermanager.screenBrightness = bright;
      this._screenBrightness = undefined;
    } else {
      this._screenBrightness = bright;
    }
  },

  setExtScreenBrightness(bright) {
    if (this.connected) {
      window.api.powermanager.extScreenBrightness = bright;
      this._extScreenBrightness = undefined;
    } else {
      this._extScreenBrightness = bright;
    }
  },

  setKeyLightBrightness(bright) {
    if (this.connected) {
      window.api.powermanager.keyLightBrightness = bright;
      this._keyLightBrightness = undefined;
    } else {
      this._keyLightBrightness = bright;
    }
  },

  setCpuSleepAllowed(allow) {
    if (this.connected) {
      window.api.powermanager.cpuSleepAllowed = allow;
      this._cpuSleepAllowed = undefined;
    } else {
      this._cpuSleepAllowed = allow;
    }
  },

  getFactoryResetReason() {
    return taskScheduler.request({
      serverName: taskScheduler.POWER,
      funcName() {
        return new Promise((resolve, reject) => {
          window.api.powermanager.factoryReset.then(
            value => {
              resolve(value);
            },
            err => {
              reject(err);
            }
          );
        });
      }
    });
  },

  getScreenEnabled() {
    return taskScheduler.request({
      serverName: taskScheduler.POWER,
      funcName() {
        return new Promise((resolve, reject) => {
          window.api.powermanager.screenEnabled.then(
            value => {
              resolve(value);
            },
            err => {
              reject(err);
            }
          );
        });
      }
    });
  },

  getExtScreenEnabled() {
    return taskScheduler.request({
      serverName: taskScheduler.POWER,
      funcName() {
        return new Promise((resolve, reject) => {
          window.api.powermanager.extScreenEnabled.then(
            value => {
              resolve(value);
            },
            err => {
              reject(err);
            }
          );
        });
      }
    });
  },

  getKeyLightEnabled() {
    return taskScheduler.request({
      serverName: taskScheduler.POWER,
      funcName() {
        return new Promise((resolve, reject) => {
          window.api.powermanager.keyLightEnabled.then(
            value => {
              resolve(value);
            },
            err => {
              reject(err);
            }
          );
        });
      }
    });
  },

  getScreenBrightness() {
    return taskScheduler.request({
      serverName: taskScheduler.POWER,
      funcName() {
        return new Promise((resolve, reject) => {
          window.api.powermanager.screenBrightness.then(
            value => {
              resolve(value);
            },
            err => {
              reject(err);
            }
          );
        });
      }
    });
  },

  getExtScreenBrightness() {
    return taskScheduler.request({
      serverName: taskScheduler.POWER,
      funcName() {
        return new Promise((resolve, reject) => {
          window.api.powermanager.extScreenBrightness.then(
            value => {
              resolve(value);
            },
            err => {
              reject(err);
            }
          );
        });
      }
    });
  },

  getKeyLightBrightness() {
    return taskScheduler.request({
      serverName: taskScheduler.POWER,
      funcName() {
        return new Promise((resolve, reject) => {
          window.api.powermanager.keyLightBrightness.then(
            value => {
              resolve(value);
            },
            err => {
              reject(err);
            }
          );
        });
      }
    });
  },

  getCpuSleepAllowed() {
    return taskScheduler.request({
      serverName: taskScheduler.POWER,
      funcName() {
        return new Promise((resolve, reject) => {
          window.api.powermanager.cpuSleepAllowed.then(
            value => {
              resolve(value);
            },
            err => {
              reject(err);
            }
          );
        });
      }
    });
  },

  processPendingRequest() {
    if (this._powerOff) {
      this.powerOff();
    }

    if (this._reboot) {
      this.reboot();
    }

    if (this._screenEnabled !== undefined) {
      this.setScreenEnabled(this._screenEnabled);
    }

    if (this._extScreenEnabled !== undefined) {
      this.setExtScreenEnabled(this._extScreenEnabled);
    }

    if (this._keyLightEnabled !== undefined) {
      this.setKeyLightEnabled(this._keyLightEnabled);
    }

    if (this._screenBrightness !== undefined) {
      this.setScreenBrightness(this._screenBrightness);
    }

    if (this._extScreenBrightness !== undefined) {
      this.setExtScreenBrightness(this._extScreenBrightness);
    }

    if (this._keyLightBrightness !== undefined) {
      this.setKeyLightBrightness(this._keyLightBrightness);
    }

    if (this._cpuSleepAllowed !== undefined) {
      this.setCpuSleepAllowed(this._cpuSleepAllowed);
    }

    if (this._factoryReset !== undefined) {
      this.setFactoryReset(this._factoryReset);
    }
  }
};
PowerManager.init();
window.PowerManager = PowerManager;
