/* exported MockWifiManager */
var MockWifiManager = {
  enabled: true,
  _certificateList: [],
  _cb: {
    onerror: []
  },
  forget: function(network) {
    return {
      set onsuccess(callback) {
        callback();
      },
      set onerror(callback) {
        callback();
      }
    };
  },
  setNetworks: function(networks) {
    this.networks = networks;
  },
  getKnownNetworks: function() {
    var self = this;
    const result = [
      {
        security: ['known'],
        capabilities: 'capabilities'
      }
    ];
    return {
      result,
      set onsuccess(callback) {
        callback(this);
      },
      set onerror(callback) {
        callback(this);
      }
    };
  },
  getNetworks: function() {
    var self = this;
    const result = [
      {
        security: ['available'],
        signalStrength: 'signalStrength',
        relSignalStrength: 'relSignalStrength'
      }
    ];
    return {
      result,
      error: 'getNetworks error',
      set onsuccess(callback) {
        callback(this);
      },
      set onerror(callback) {
        callback(this);
      }
    };
  },
  connection: {
    network: { }
  },
  connectionInfoUpdate: null,
  connectionInformation: {
    ipAddress: '0.0.0.0',
    linkSpeed: '10'
  },
  deleteCert: function(certName) {
    return {
      set onsuccess(callback) {
        callback();
      }
    };
  },
  getImportedCerts: function() {
    var self = this;
    return {
      result: {
        ServerCert: self._certificateList
      },
      set onsuccess(callback) {
        callback();
      }
    };
  },
  importCert: function() {
    var self = this;
    return {
      set onsuccess(callback) {
        callback();
      },
      set onerror(callback) {
        self._cb.onerror.push(callback);
      }
    };
  },
  associate: function(network) {
    return {
      set onsuccess(callback) {
        callback();
      },
      set onerror(callback) {
        callback();
      }
    };
  },
  mSetup: function() {
    this.enabled = true;
    this._certificateList = [];
    this._cb = {
      onerror: []
    };
  }
};

exports.MockWifiManager = MockWifiManager;
