/* eslint-disable no-empty-function */
(function bluetooth(window) {
  /*
   * Refer to http://dxr.mozilla.org/mozilla-central/source/
   * dom/webidl/BluetoothAdapter2.webidl
   */
  const MockBTAdapter = {
    answerWaitingCall: function answerWaitingCall() {},
    ignoreWaitingCall: function ignoreWaitingCall() {},
    toggleCalls: function toggleCalls() {},
    getConnectedDevices: function getConnectedDevices() {
      return {
        set onsuccess(cb) {
          cb.call(this);
        },
        set onerror(cb) {
          cb.call(this);
        },
        get result() {
          return 'getConnectedDevices result';
        }
      }
    },
    connectSco: function connectSco() {
      return {
        set onsuccess(cb) {
          cb.call(this);
        },
        set onerror(cb) {
          cb.call(this);
        },
        get result() {
          return 'connectSco result';
        }
      }
    },
    disconnectSco: function disconnectSco() {
      return {
        set onsuccess(cb) {
          cb.call(this);
        },
        set onerror(cb) {
          cb.call(this);
        },
        get result() {
          return 'disconnectSco result';
        }
      }
    },
    getPairedDevices: function getPairedDevices() {
      return {
        set onsuccess(cb) {
          cb.call(this);
        },
        set onerror(cb) {
          cb.call(this);
        },
        get result() {
          return 'getPairedDevices result';
        }
      }
    },
    isScoConnected: function isScoConnected() {
      return {
        set onsuccess(cb) {
          cb.call(this);
        },
        set onerror(cb) {
          cb.call(this);
        },
        get result() {
          return 'isScoConnected result';
        }
      }
    },
    sendMediaMetaData: function sendMediaMetaData(metadata) {
      return {
        set onsuccess(cb) {
          cb.call(this);
        },
        set onerror(cb) {
          cb.call(this);
        },
        get result() {
          return 'sendMediaMetaData metadata';
        }
      }
    },
    sendMediaPlayStatus: function sendMediaPlayStatus(metadata) {
      return {
        set onsuccess(cb) {
          cb.call(this);
        },
        set onerror(cb) {
          cb.call(this);
        },
        get result() {
          return 'sendMediaPlayStatus metadata';
        }
      }
    },
    enable: function enable() {},
    disable: function disable() {},

    onscostatuschanged: null
  };

  const mEventListeners = [];

  function mmb_defaultAdapter() {
    return MockBTAdapter;
  }

  function mmb_addEventListener(type, callback) {
    mEventListeners.push({
      type,
      callback
    });
  }

  function mmb_triggerEventListeners(type) {
    mEventListeners.forEach(function cb(eventListener) {
      if (eventListener.type === type) {
        eventListener.callback();
      }
    });
  }

  /*
   * Refer to http://dxr.mozilla.org/mozilla-central/source/
   * dom/webidl/BluetoothManager2.webidl
   */
  window.MockBluetooth = {
    defaultAdapter: mmb_defaultAdapter(),
    addEventListener: mmb_addEventListener,
    triggerEventListeners: mmb_triggerEventListeners,
    onattributechanged: function onattributechanged() {},
    getAdapters: function getAdapters() {}
  };
})(window);
