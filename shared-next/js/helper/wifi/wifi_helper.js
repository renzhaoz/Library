/* exported WifiHelper */
/* eslint-disable no-empty-function */

// eslint-disable-next-line no-unused-vars
const WifiHelper = {
  getWifiManager: function getWifiManager() {
    return this.wifiManager;
  },

  // eslint-disable-next-line
  wifiManager: (function wifiManager() {
    return navigator.b2g.wifiManager;
  })(),

  setPassword: function setPassword(wifiInfo) {
    const {
      network,
      password,
      identity,
      eap,
      phase2,
      certificate,
      keyIndex
    } = wifiInfo;
    const encType = this.getKeyManagement(network);
    switch (encType) {
      case 'WPA-PSK':
      case 'WPA2-PSK':
      case 'WPA/WPA2-PSK':
      case 'SAE':
        network.psk = password;
        break;
      case 'WAPI-PSK':
        // eslint-disable-next-line
        network.wapi_psk = password;
        break;
      case 'WPA-EAP':
        network.eap = eap;
        switch (eap) {
          case 'SIM':
          case 'AKA':
          case "AKA'":
            break;
          case 'PEAP':
          case 'TLS':
          case 'TTLS':
            if (password && password.length) {
              network.password = password;
            }
            if (identity && identity.length) {
              network.identity = identity;
            }
            if ('No' !== phase2) {
              network.phase2 = phase2;
            }
            if ('none' !== certificate) {
              network.serverCertificate = certificate;
            }
            break;
          default:
            break;
        }
        break;
      case 'WEP':
        network.wep = password;
        network.keyIndex = keyIndex;
        break;
      default:
        break;
    }
  },

  setSecurity: function setSecurity(network, encryptions) {
    network.security = encryptions;
  },

  setSecurityValue: function setSecurityValue(network, encryptions) {
    if (encryptions.length === 0) {
      return;
    }
    network.security = encryptions;
  },

  setSignalStrength: function setSignalStrength(network, strength) {
    network.signalStrength = strength;
  },

  setRelSignalStrength: function setRelSignalStrength(network, strength) {
    network.relSignalStrength = strength;
  },

  getSecurity: function getSecurity(network) {
    return network.security;
  },

  getCompositedKey: function getCompositedKey(network) {
    let security = this.getKeyManagement(network);
    switch (security) {
      case 'WPA-PSK':
      case 'WPA2-PSK':
      case 'WPA/WPA2-PSK':
        security = 'WPA-PSK';
        break;
      default:
        break;
    }
    // Use ssid + security as a composited key
    const key = `${network.ssid}+${security}`;
    return key;
  },

  getCapabilities: function getCapabilities(network) {
    // eslint-disable-next-line
    return network.capabilities === undefined || network.capabilities === null
      ? []
      : network.capabilities;
  },

  getKeyManagement: function getKeyManagement(network) {
    const key = this.getSecurity(network);
    if (/OPEN$/u.test(key)) {
      return 'OPEN';
    }
    if (/WEP$/u.test(key)) {
      return 'WEP';
    }
    if (/WAPI-PSK$/u.test(key)) {
      return 'WAPI-PSK';
    }
    if (/PSK$/u.test(key)) {
      return 'WPA-PSK';
    }
    if (/SAE$/u.test(key)) {
      return 'SAE';
    }
    if (/EAP$/u.test(key)) {
      return 'WPA-EAP';
    }
    if (/WAPI-CERT$/u.test(key)) {
      return 'WAPI-CERT';
    }
    return '';
  },

  isConnected: function isConnected(network) {
    /**
     * XXX the API should expose a 'connected' property on 'network',
     * and 'wifiManager.connection.network' should be comparable to 'network'.
     * Until this is properly implemented, we just compare SSIDs to tell wether
     * the network is already connected or not.
     */
    const currentNetwork = this.wifiManager.connection.network;
    if (!currentNetwork || !network) {
      return false;
    }
    const key = this.getCompositedKey(network);
    const curkey = this.getCompositedKey(currentNetwork);
    return key === curkey && currentNetwork.connected;
  },

  // eslint-disable-next-line max-params
  isValidInput: function isValidInput(key, password, identity, eap) {
    function isValidWepKey(passwords) {
      switch (passwords.length) {
        case 5:
        case 13:
        case 16:
        case 29:
          return true;
        case 10:
        case 26:
        case 32:
        case 58:
          return !/[^a-fA-F0-9]/.test(passwords);
        default:
          return false;
      }
    }

    if (key === 'WAPI-CERT') {
      return false;
    }

    switch (key) {
      case 'WPA-PSK':
      case 'WPA2-PSK':
      case 'WPA/WPA2-PSK':
      case 'WAPI-PSK':
      case 'SAE':
        if (!password || password.length < 8) {
          return false;
        }
        break;
      case 'WPA-EAP':
        switch (eap) {
          case 'SIM':
          case 'AKA':
          case "AKA'":
            break;
          case 'PEAP':
          case 'TLS':
          case 'TTLS':

          /* Falls through */
          default:
            if (
              !password ||
              password.length < 1 ||
              !identity ||
              identity.length < 1
            ) {
              return false;
            }
            break;
        }
        break;
      case 'WEP':
        if (!password || !isValidWepKey(password)) {
          return false;
        }
        break;
      default:
        break;
    }
    return true;
  },

  isWpsAvailable: function isWpsAvailable(network) {
    const capabilities = this.getCapabilities(network);
    for (let i = 0; i < capabilities.length; i++) {
      if (/WPS/u.test(capabilities[i])) {
        return true;
      }
    }
    return false;
  },

  isOpen: function isOpen(network) {
    return this.getKeyManagement(network) === '';
  },

  isEap: function isEap(network) {
    return this.getKeyManagement(network).indexOf('EAP') !== -1;
  },

  /**
   * Both 'available' and 'known' are "object of networks".
   * Each key of them is a composite key of a network,
   * and each value is the original network object received from DOMRequest
   * It'll be easier to compare in the form of "object of networks"
   */
  unionOfNetworks: function unionOfNetworks(available, known) {
    const allNetworks = available || {};
    const result = [];

    /**
     * Set the available network configuration parameter into known network
     * And push the new network object to all network list.
     */
    Object.keys(known).forEach(key => {
      if (allNetworks[key]) {
        this.setSecurityValue(known[key], allNetworks[key].security);
        this.setSignalStrength(known[key], allNetworks[key].signalStrength);
        this.setRelSignalStrength(
          known[key],
          allNetworks[key].relSignalStrength
        );
        allNetworks[key] = known[key];
      }
    });

    /**
     * However, people who use getAvailableAndKnownNetworks expect
     * GetAvailableAndKnownNetworks.result to be an array of network
     */
    Object.keys(allNetworks).forEach(key => {
      result.push(allNetworks[key]);
    });
    return result;
  },

  networksArrayToObject: function networksArrayToObject(allNetworks) {
    const networksObject = {};
    [].forEach.call(allNetworks, network => {
      const key = this.getCompositedKey(network);
      networksObject[key] = network;
    });
    return networksObject;
  },

  onReqProxySuccess: function onReqProxySuccess(
    reqProxy,
    availableNetworks,
    knownNetworks
  ) {
    reqProxy.result = this.unionOfNetworks(availableNetworks, knownNetworks);
    reqProxy.onsuccess();
  },

  getAvailableAndKnownNetworks: function getAvailableAndKnownNetworks() {
    const reqProxy = {
      onsuccess: () => {},
      onerror: () => {}
    };
    let knownNetworks = {};
    let availableNetworks = {};
    let knownNetworksReq = null;
    const availableNetworksReq = this.getWifiManager().getNetworks();

    /**
     * Request available networks first then known networks,
     * Since it is acceptible that error on requesting known networks
     */
    availableNetworksReq.onsuccess = () => {
      availableNetworks = this.networksArrayToObject(
        availableNetworksReq.result
      );
      knownNetworksReq = this.getWifiManager().getKnownNetworks();
      knownNetworksReq.onsuccess = () => {
        knownNetworks = this.networksArrayToObject(knownNetworksReq.result);
        this.onReqProxySuccess(reqProxy, availableNetworks, knownNetworks);
      };
      knownNetworksReq.onerror = () => {
        /**
         * It is acceptible that no known networks found or error
         * On requesting known networks
         */
        this.onReqProxySuccess(reqProxy, availableNetworks, knownNetworks);
      };
    };
    availableNetworksReq.onerror = () => {
      reqProxy.error = availableNetworksReq.error;
      reqProxy.onerror();
    };
    return reqProxy;
  }
};

window.WifiHelper = WifiHelper;
