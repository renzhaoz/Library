/* exported BluetoothHelper */

const BluetoothHelper = function BluetoothHelper() {
  const profiles = {
    HFP: 0x111e,
    A2DP: 0x110d
  };

  const _bluetooth = window.navigator.b2g.bluetooth;
  let _isReady = false;
  let _callbacks = [];

  let _adapter = null;
  let _oldAdapter = null; // The varaible is accessed for v1 only.
  let _v2 = true;

  const _ready = readyCb => {
    if (!readyCb || !_bluetooth) {
      return;
    }

    if (_isReady) {
      readyCb();
    } else {
      _callbacks.push(readyCb);
    }
  };

  const _handleRequest = (request, successCb, errorcb) => {
    request.onsuccess = () => {
      if (successCb) {
        successCb(request.result);
      }
    };

    request.onerror = () => {
      console.log('Error handling bluetooth request');
      if (errorcb) {
        errorcb();
      }
    };
  };

  // Run callbacks when adapter is ready
  const _processCallbacks = () => {
    if (_adapter) {
      _isReady = true;

      _callbacks.forEach(callback => {
        callback();
      });
      // Clean up the _callback queue
      _callbacks = [];
    } else {
      // We can do nothing without default adapter.
      console.log('BluetoothHelper(): connot get default adapter yet');
    }
  };

  // API v2 get adapter via bluetooth
  const _fetchAdapterV2 = () => {
    // Need time to get bluetooth adapter at first run
    _bluetooth.onattributechanged = evt => {
      for (const i in evt.attrs) {
        switch (evt.attrs[i]) {
          case 'defaultAdapter':
            console.log(
              'defaultAdapter changed. address:',
              _bluetooth.defaultAdapter.address
            );
            _adapter = _bluetooth.defaultAdapter;
            _processCallbacks();
            break;
          default:
            break;
        }
      }
    };

    _adapter = _bluetooth.defaultAdapter;
    if (_adapter) {
      _processCallbacks();
    }
  };

  // API v1 get adapter via bluetooth
  const _fetchAdapter = () => {
    const req = _bluetooth.getDefaultAdapter();
    if (req) {
      req.onsuccess = () => {
        if (_adapter) {
          _oldAdapter = _adapter;
        }

        _isReady = true;
        _adapter = req.result;

        /*
         * Put the callback function of onpairedstatuschanged to the new adapter
         * because the new adapter won't remember those callback function which
         * is registered before. In other word, we get a new adpater after
         * turned on/off Bluetooth. The new adapter have no registered callback.
         */
        if (_oldAdapter && _oldAdapter.onpairedstatuschanged) {
          _adapter.onpairedstatuschanged = _oldAdapter.onpairedstatuschanged;
        }

        _callbacks.forEach(callback => {
          callback();
        });
        // Clean up the _callback queue
        _callbacks = [];
      };

      req.onerror = () => {
        // We can do nothing without default adapter.
        console.log('BluetoothHelper(): connot get default adapter!!!');
      };
    }
  };

  const _getAdapter = () => {
    if (_v2) {
      _fetchAdapterV2();
    } else {
      _fetchAdapter();
    }
  };

  const _resetAdapter = () => {
    if (_adapter) {
      _oldAdapter = _adapter;
    }
    // Clean up state and adapter
    _isReady = false;
    _adapter = null;
  };

  // Decode the URL scheme prefix of Eddystone-URL
  const _decodeUrlSchemePrefix = code => {
    switch (
      code // The encoded URL scheme prefix
    ) {
      case 0:
        return 'http://www.';
      case 1:
        return 'https://www.';
      case 2:
        return 'http://';
      case 3:
        return 'https://';
      default:
        break;
    }
    return '';
  };

  // Decode the URL of Eddystone-URL
  const _decodeEddystoneUrl = code => {
    switch (
      code // Encoded Eddystone-URL
    ) {
      case 0:
        return '.com/';
      case 1:
        return '.org/';
      case 2:
        return '.edu/';
      case 3:
        return '.net/';
      case 4:
        return '.info/';
      case 5:
        return '.biz/';
      case 6:
        return '.gov/';
      case 7:
        return '.com';
      case 8:
        return '.org';
      case 9:
        return '.edu';
      case 10:
        return '.net';
      case 11:
        return '.info';
      case 12:
        return '.biz';
      case 13:
        return '.gov';
      default:
        break;
    }
    return String.fromCharCode(code);
  };

  /*
   * Calculate the estimated distance in meters to the BLE beacon based on RSSI
   * and TX Power
   */
  const _calcDistance = (rssi, txPower) => {
    // 41dBm is the signal loss that occurs over 1 meter
    const signalLoss = 41;

    /*
     * The proper coefficients for distance estimatation may vary for different
     * hardwares.  We set fixed coefficients here only for generic estimatation.
     */
    const coefficient1 = 0.42093;
    const coefficient2 = 6.9476;
    const coefficient3 = 0.54992;

    const ratio = (rssi * 1.0) / (txPower - signalLoss);
    if (ratio < 1.0) {
      return ratio ** 10;
    }
    return coefficient1 * ratio ** coefficient2 + coefficient3;
  };

  // Find the index of the AD structure of Eddystone
  const _findEddystoneUrl = adData => {
    const boundary = 31 - 3; // PackageLen(31) - typeLen(1) - uuidLen(2)
    let offset = 0;
    while (offset < boundary) {
      const len = adData[offset];
      if (len === 0) {
        console.log('length of AD structure should not be 0.');
        return null;
      }
      let i = offset;
      const adType = adData[++i];
      if (adType === 22) {
        /*
         * Service Data: 0x16
         * The service data type should be Eddystone's UUID 0xFEAA
         */
        if (adData[++i] !== 170 || adData[++i] !== 254) {
          return null;
        }

        // The frame type of Eddystone-URL should be 0x10
        if (adData[++i] !== 16) {
          return null;
        }
        return offset;
      }
      offset += len;
    }
    return null;
  };

  // Parse LE scan result and return a object {url: xxx, distance: xxx}
  const _parseEddystoneUrl = (scanRecord, rssi) => {
    if (!(scanRecord instanceof ArrayBuffer)) {
      return null;
    }
    let uint8Array = new Uint8Array(scanRecord);

    const pos = _findEddystoneUrl(uint8Array);
    if (pos === null) {
      return null;
    }

    const dataLen = uint8Array[pos];
    const txPower = uint8Array[pos + 5];
    const urlScheme = uint8Array[pos + 6];

    const signedTxPower = (txPower << 24) >> 24;
    const dist = _calcDistance(rssi, signedTxPower);

    /*
     * |Length|,|Data Type|,|16bits-UUID|,|Frame Type|,|TX Power|,|URL Scheme|
     *  1 byte    1 byte       2 bytes      1 byte       1 byte      1 byte
     */
    const metaLen = 7;
    uint8Array = uint8Array.slice(pos + metaLen, pos + dataLen + 1);

    let eddystoneUrl = _decodeUrlSchemePrefix(urlScheme);
    uint8Array.forEach(element => {
      eddystoneUrl += _decodeEddystoneUrl(element);
    });

    return {
      url: eddystoneUrl,
      distance: dist
    };
  };

  // Init
  if (_bluetooth) {
    // Detect API version
    if (typeof _bluetooth.onattributechanged === 'undefined') {
      _v2 = false;
    }

    if (_v2) {
      _bluetooth.onadapteradded = () => {
        _getAdapter();
      };
    } else {
      _bluetooth.addEventListener('enabled', _getAdapter);
      _bluetooth.addEventListener('adapteradded', _getAdapter);
      _bluetooth.addEventListener('disabled', _resetAdapter);
    }
    _getAdapter();
  }

  /* eslint-disable accessor-pairs */
  return {
    profiles,

    answerWaitingCall() {
      _ready(() => {
        _adapter.answerWaitingCall();
      });
    },

    ignoreWaitingCall() {
      _ready(() => {
        _adapter.ignoreWaitingCall();
      });
    },

    toggleCalls() {
      _ready(() => {
        _adapter.toggleCalls();
      });
    },

    getConnectedDevicesByProfile(profileID, cb, errorcb) {
      _ready(() => {
        _handleRequest(_adapter.getConnectedDevices(profileID), cb, errorcb);
      });
    },

    connectSco(cb) {
      _ready(() => {
        _handleRequest(_adapter.connectSco(), cb);
      });
    },

    disconnectSco(cb) {
      _ready(() => {
        _handleRequest(_adapter.disconnectSco(), cb);
      });
    },

    getPairedDevices(cb) {
      _ready(() => {
        _handleRequest(_adapter.getPairedDevices(), cb);
      });
    },

    getAddress(cb) {
      if (_v2) {
        console.log('getAddress function is deprecated');
        return;
      }

      _ready(() => {
        const { address } = _adapter;
        cb(address);
      });
    },

    setPairingConfirmation(address, confirmed) {
      if (_v2) {
        console.log('setPairingConfirmation API is deprecated');
        return;
      }

      _ready(() => {
        _adapter.setPairingConfirmation(address, confirmed);
      });
    },

    setPinCode(address, pincode) {
      if (_v2) {
        console.log('setPairingConfirmation API is deprecated');
        return;
      }

      _ready(() => {
        _adapter.setPinCode(address, pincode);
      });
    },

    setPasskey(address, key) {
      if (_v2) {
        console.log('setPairingConfirmation API is deprecated');
        return;
      }

      _ready(() => {
        _adapter.setPasskey(address, key);
      });
    },

    isScoConnected(cb, errorcb) {
      _ready(() => {
        _handleRequest(_adapter.isScoConnected(), cb, errorcb);
      });
    },

    sendMediaMetaData(metadata, cb, errorcb) {
      _ready(() => {
        _handleRequest(_adapter.sendMediaMetaData(metadata), cb, errorcb);
      });
    },

    sendMediaPlayStatus(metadata, cb, errorcb) {
      _ready(() => {
        _handleRequest(_adapter.sendMediaPlayStatus(metadata), cb, errorcb);
      });
    },

    set onhfpstatuschanged(callback) {
      _ready(() => {
        _adapter.onhfpstatuschanged = callback;
      });
    },

    set onscostatuschanged(callback) {
      _ready(() => {
        _adapter.onscostatuschanged = callback;
      });
    },

    set ona2dpstatuschanged(callback) {
      _ready(() => {
        _adapter.ona2dpstatuschanged = callback;
      });
    },

    set onrequestmediaplaystatus(callback) {
      _ready(() => {
        _adapter.onrequestmediaplaystatus = callback;
      });
    },

    set onpairedstatuschanged(callback) {
      if (_v2) {
        console.log('onpairedstatuschanged API is deprecated');
        return;
      }

      _ready(() => {
        _adapter.onpairedstatuschanged = callback;
      });
    },

    v2: _v2, // Expose API version for app reference

    // Bypass the enable/disable state if works in APIv1
    enable() {
      if (_v2) {
        _ready(() => {
          _adapter.enable();
        });
      } else {
        console.log('enable is not support in v1 API!');
      }
    },

    disable() {
      if (_v2) {
        _ready(() => {
          _adapter.disable();
        });
      } else {
        console.log('disable is not support in v1 API!');
      }
    },

    // Parse LE scan result and return a object {url: xxx, distance: xxx}
    parseEddystoneUrl(scanRecord, rssi) {
      if (_v2) {
        return _parseEddystoneUrl(scanRecord, rssi);
      }
      console.log('parseEddystoneUrl is not support in v1 API!');
      return null;
    }
  };
};

window.BluetoothHelper = BluetoothHelper;
