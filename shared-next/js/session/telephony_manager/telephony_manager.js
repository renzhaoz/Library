/* exported TelephonyManager */
/* global taskScheduler */

const TelephonyManager = {
  _observers: [],
  _observersArray: [],
  _callState: null,
  connected: false,
  initFlag: false,

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

  setCallState(value) {
    if (this.connected) {
      window.api.telephonymanager.callState = value;
      this._callState = null;
    } else {
      this._callState = value;
    }
  },

  getCallState() {
    return taskScheduler.request({
      serverName: taskScheduler.TELEPHONY,
      funcName() {
        return new Promise((resolve, reject) => {
          window.api.telephonymanager.callState.then(
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

  observeCallStateChange(callback) {
    if (this.connected) {
      window.api.telephonymanager.addEventListener(
        window.api.telephonymanager.CALLSTATE_CHANGE_EVENT,
        callback
      );
    }
    this._observersArray.push(callback);
  },

  unobserveCallStateChange(callback) {
    if (this.connected) {
      window.api.telephonymanager.removeEventListener(
        window.api.telephonymanager.CALLSTATE_CHANGE_EVENT,
        callback
      );
      let removeFlag = false;
      this._observersArray.forEach((cb, index) => {
        if (!removeFlag && cb === callback) {
          this._observersArray.splice(index, 1);
          removeFlag = true;
        }
      });
    }
  },

  processPendingRequest() {
    if (this._callState) {
      this.setCallState(this._callState);
    }

    this._observersArray.forEach(callback => {
      if (this.connected) {
        window.api.telephonymanager.addEventListener(
          window.api.telephonymanager.CALLSTATE_CHANGE_EVENT,
          callback
        );
      }
    });
  }
};
TelephonyManager.init();
window.TelephonyManager = TelephonyManager;
