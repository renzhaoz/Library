/* eslint-disable no-undef, global-require */
describe('helper js <wifi_helper> test', () => {
  const b2gNavigator = require('../../mock/b2g_navigator_mock');
  const { mockB2gNavigator } = b2gNavigator;
  const { MockWifiManager } = require('../../mock/wifiManager_mock');
  let wifiManager = null;

  beforeAll(done => {
    window.navigator.b2g = {};
    mockB2gNavigator(window, 'wifiManager', MockWifiManager);
    require('../../../js/helper/wifi/wifi_helper');
    wifiManager = window.WifiHelper;
    done();
  });

  // Test WifiHelper
  test('WifiHelper should be object', done => {
    expect(typeof wifiManager).toBe('object');
    done();
  });

  // Test getWifiManager
  test('getWifiManager should be function', done => {
    expect(typeof wifiManager.getWifiManager).toBe('function');
    done();
  });

  // Test getWifiManager return value
  test('getWifiManager should return MockWifiManager', done => {
    const obj = wifiManager.getWifiManager();
    expect(obj).toEqual(MockWifiManager);
    done();
  });

  // Test setPassword
  test('setPassword should be function', done => {
    expect(typeof wifiManager.setPassword).toBe('function');
    done();
  });

  // Test setPassword return value 1
  test('setPassword should set attributes for network object', done => {
    const wifiInfo = {
      network: {
        security: ['WPA-PSK']
      },
      password: 'password'
    };
    wifiManager.setPassword(wifiInfo);
    expect(wifiInfo.network.psk).toBe('password');
    done();
  });

  // Test setPassword return value 2
  test('setPassword should set attributes for network object 2', done => {
    const wifiInfo = {
      network: {
        security: 'WAPI-PSK'
      },
      password: 'password'
    };
    wifiManager.setPassword(wifiInfo);
    expect(wifiInfo.network.wapi_psk).toBe('password');
    done();
  });

  // Test setPassword return value 3
  test('setPassword should set attributes for network object 3', done => {
    const wifiInfo = {
      network: {
        security: 'WPA-EAP'
      },
      password: 'password',
      eap: 'SIM'
    };
    wifiManager.setPassword(wifiInfo);
    expect(wifiInfo.network.eap).toBe('SIM');
    done();
  });

  // Test setPassword return value 4
  test('setPassword should set attributes for network object 4', done => {
    const wifiInfo = {
      network: {
        security: 'WPA-EAP'
      },
      password: 'password',
      eap: 'test'
    };
    wifiManager.setPassword(wifiInfo);
    expect(wifiInfo.network.eap).toBe('test');
    done();
  });

  // Test setPassword return value 5
  test('setPassword should set attributes for network object 5', done => {
    const wifiInfo = {
      network: {
        security: 'WPA-EAP'
      },
      password: 'password',
      eap: 'PEAP',
      identity: 'identity',
      phase2: 'phase2',
      certificate: 'certificate'
    };
    wifiManager.setPassword(wifiInfo);
    expect(wifiInfo.network.eap).toBe('PEAP');
    expect(wifiInfo.network.password).toBe('password');
    expect(wifiInfo.network.identity).toBe('identity');
    expect(wifiInfo.network.phase2).toBe('phase2');
    expect(wifiInfo.network.serverCertificate).toBe('certificate');
    done();
  });

  // Test setPassword return value 6
  test('setPassword should set attributes for network object 6', done => {
    const wifiInfo = {
      network: {
        security: 'WEP'
      },
      password: 'password',
      keyIndex: '0'
    };
    wifiManager.setPassword(wifiInfo);
    expect(wifiInfo.network.wep).toBe('password');
    expect(wifiInfo.network.keyIndex).toBe('0');
    done();
  });

  // Test setPassword return value 7
  test('setPassword should set attributes for network object 7', done => {
    const wifiInfo = {
      network: {
        security: 'test'
      }
    };
    wifiManager.setPassword(wifiInfo);
    expect(wifiInfo.network.keyManagement).toBeUndefined();
    done();
  });

  // Test setSecurity
  test('setSecurity should be function', done => {
    expect(typeof wifiManager.setSecurity).toBe('function');
    done();
  });

  // Test setSecurity return value
  test('setSecurity should set attributes for network object', done => {
    const network = {};
    wifiManager.setSecurity(network, 'test');
    expect(network.security).toBe('test');
    done();
  });

  // Test setSecurityValue
  test('setSecurityValue should be function', done => {
    expect(typeof wifiManager.setSecurityValue).toBe('function');
    done();
  });

  // Test setSecurityValue return value
  test('setSecurityValue should set attributes for network object', done => {
    const network = {};
    wifiManager.setSecurityValue(network, '');
    expect(network.security).toBeUndefined();
    wifiManager.setSecurityValue(network, 'test');
    expect(network.security).toBe('test');
    done();
  });

  // Test setSignalStrength
  test('setSignalStrength should be function', done => {
    expect(typeof wifiManager.setSignalStrength).toBe('function');
    done();
  });

  // Test setSignalStrength return value
  test('setSignalStrength should set attributes for network object', done => {
    const network = {};
    wifiManager.setSignalStrength(network, 'strength');
    expect(network.signalStrength).toBe('strength');
    done();
  });

  // Test setRelSignalStrength
  test('setRelSignalStrength should be function', done => {
    expect(typeof wifiManager.setRelSignalStrength).toBe('function');
    done();
  });

  // Test setRelSignalStrength return value
  test('setRelSignalStrength should set attributes for network object', done => {
    const network = {};
    wifiManager.setRelSignalStrength(network, 'strength');
    expect(network.relSignalStrength).toBe('strength');
    done();
  });

  // Test getCompositedKey
  test('getCompositedKey should be function', done => {
    expect(typeof wifiManager.getCompositedKey).toBe('function');
    done();
  });

  // Test getCompositedKey return value 1
  test('getCompositedKey should return key', done => {
    const network = {
      ssid: 'ssid',
      security: 'WPA-PSK'
    };
    const val = wifiManager.getCompositedKey(network);
    expect(val).toBe('ssid+WPA-PSK');
    done();
  });

  // Test getCompositedKey return value 2
  test('getCompositedKey should return key 2', done => {
    const network = {
      ssid: 'ssid',
      security: 'WEP'
    };
    const val = wifiManager.getCompositedKey(network);
    expect(val).toBe('ssid+WEP');
    done();
  });

  // Test getCapabilities
  test('getCapabilities should be function', done => {
    expect(typeof wifiManager.getCapabilities).toBe('function');
    done();
  });

  // Test getCapabilities return value 1
  test('getCapabilities should be return []', done => {
    const network = {};
    const val = wifiManager.getCapabilities(network);
    expect(val).toEqual([]);
    done();
  });

  // Test getCapabilities return value 2
  test('getCapabilities should be return capabilities', done => {
    const network = {
      capabilities: 'capabilities'
    };
    const val = wifiManager.getCapabilities(network);
    expect(val).toBe('capabilities');
    done();
  });

  // Test getKeyManagement
  test('getKeyManagement should be function', done => {
    expect(typeof wifiManager.getKeyManagement).toBe('function');
    done();
  });

  // Test getKeyManagement return value
  test('getKeyManagement should be return security', done => {
    const network = {
      security: 'WAPI-CERT'
    };
    const val = wifiManager.getKeyManagement(network);
    expect(val).toBe('WAPI-CERT');
    done();
  });

  // Test isConnected
  test('isConnected should be function', done => {
    expect(typeof wifiManager.isConnected).toBe('function');
    done();
  });

  // Test isConnected return value
  test('isConnected should be return security', done => {
    const network = {
      security: 'WAPI-CERT'
    };
    const val = wifiManager.isConnected(network);
    expect(val).toBeFalsy();
    done();
  });

  // Test isValidInput
  test('isValidInput should be function', done => {
    expect(typeof wifiManager.isValidInput).toBe('function');
    done();
  });

  // Test isValidInput return value 1
  test('isValidInput should be return boolean', done => {
    const val = wifiManager.isValidInput(
      'WPA-PSK',
      'password',
      'identity',
      'SIM'
    );
    expect(val).toBeTruthy();
    done();
  });

  // Test isValidInput return value 2
  test('isValidInput should be return boolean 2', done => {
    const val = wifiManager.isValidInput(
      'WAPI-CERT',
      'password',
      'identity',
      'SIM'
    );
    expect(val).toBeFalsy();
    done();
  });

  // Test isValidInput return value 3
  test('isValidInput should be return boolean 3', done => {
    const val = wifiManager.isValidInput('WPA-PSK', 'pass', 'identity', 'SIM');
    expect(val).toBeFalsy();
    done();
  });

  // Test isValidInput return value 4
  test('isValidInput should be return boolean 4', done => {
    const val = wifiManager.isValidInput('WPA-EAP', 'pass', 'identity', 'SIM');
    expect(val).toBeTruthy();
    done();
  });

  // Test isValidInput return value 5
  test('isValidInput should be return boolean 5', done => {
    const val = wifiManager.isValidInput('WPA-EAP', 'pass', 'identity', 'PEAP');
    expect(val).toBeTruthy();
    done();
  });

  // Test isValidInput return value 6
  test('isValidInput should be return boolean 6', done => {
    const val = wifiManager.isValidInput('WPA-EAP', '', 'identity', 'PEAP');
    expect(val).toBeFalsy();
    done();
  });

  // Test isValidInput return value 7
  test('isValidInput should be return boolean 7', done => {
    const val = wifiManager.isValidInput('WEP', '12345', 'identity', 'PEAP');
    expect(val).toBeTruthy();
    done();
  });

  // Test isValidInput return value 8
  test('isValidInput should be return boolean 8', done => {
    const val = wifiManager.isValidInput(
      'WEP',
      '0123456789',
      'identity',
      'PEAP'
    );
    expect(val).toBeTruthy();
    done();
  });

  // Test isValidInput return value 9
  test('isValidInput should be return boolean 9', done => {
    const val = wifiManager.isValidInput('WEP', '123', 'identity', 'PEAP');
    expect(val).toBeFalsy();
    done();
  });

  // Test isValidInput return value 10
  test('isValidInput should be return boolean 10', done => {
    const val = wifiManager.isValidInput('test', '123', 'identity', 'PEAP');
    expect(val).toBeTruthy();
    done();
  });

  // Test isWpsAvailable
  test('isWpsAvailable should be function', done => {
    expect(typeof wifiManager.isWpsAvailable).toBe('function');
    done();
  });

  // Test isWpsAvailable return value 1
  test('isWpsAvailable should be return boolean', done => {
    const network = {
      capabilities: ['WPS']
    };
    const val = wifiManager.isWpsAvailable(network);
    expect(val).toBeTruthy();
    done();
  });

  // Test isWpsAvailable return value 2
  test('isWpsAvailable should be return boolean 2', done => {
    const network = {
      capabilities: ['capabilities']
    };
    const val = wifiManager.isWpsAvailable(network);
    expect(val).toBeFalsy();
    done();
  });

  // Test isOpen
  test('isOpen should be function', done => {
    expect(typeof wifiManager.isOpen).toBe('function');
    done();
  });

  // Test isOpen return value
  test('isOpen should be return boolean', done => {
    const network = {
      security: ''
    };
    const val = wifiManager.isOpen(network);
    expect(val).toBeTruthy();
    done();
  });

  // Test isEap
  test('isEap should be function', done => {
    expect(typeof wifiManager.isEap).toBe('function');
    done();
  });

  // Test isEap return value
  test('isEap should be return boolean', done => {
    const network = {
      security: 'EAP'
    };
    const val = wifiManager.isEap(network);
    expect(val).toBeTruthy();
    done();
  });

  // Test unionOfNetworks
  test('unionOfNetworks should be function', done => {
    expect(typeof wifiManager.unionOfNetworks).toBe('function');
    done();
  });

  // Test unionOfNetworks return value
  test('unionOfNetworks should return object', done => {
    const available = [
      {
        security: ['available'],
        signalStrength: 'signalStrength',
        relSignalStrength: 'relSignalStrength'
      }
    ];
    const known = [
      {
        security: ['known'],
        capabilities: 'capabilities'
      }
    ];
    const result = wifiManager.unionOfNetworks(available, known);
    expect(result).toEqual([
      {
        security: ['available'],
        capabilities: 'capabilities',
        signalStrength: 'signalStrength',
        relSignalStrength: 'relSignalStrength'
      }
    ]);
    done();
  });

  // Test networksArrayToObject
  test('networksArrayToObject should be function', done => {
    expect(typeof wifiManager.networksArrayToObject).toBe('function');
    done();
  });

  // Test networksArrayToObject return value
  test('networksArrayToObject should return string', done => {
    const allNetworks = [
      {
        ssid: 'ssid',
        security: 'WPA-PSK',
        capabilities: 'capabilities',
        signalStrength: 'signalStrength',
        relSignalStrength: 'relSignalStrength'
      }
    ];
    const obj = wifiManager.networksArrayToObject(allNetworks);
    expect(obj).toEqual({
      'ssid+WPA-PSK': {
        ssid: 'ssid',
        security: 'WPA-PSK',
        capabilities: 'capabilities',
        signalStrength: 'signalStrength',
        relSignalStrength: 'relSignalStrength'
      }
    });
    done();
  });

  // Test onReqProxySuccess
  test('onReqProxySuccess should be function', done => {
    expect(typeof wifiManager.onReqProxySuccess).toBe('function');
    done();
  });

  // Test getAvailableAndKnownNetworks
  test('getAvailableAndKnownNetworks should be function', done => {
    expect(typeof wifiManager.getAvailableAndKnownNetworks).toBe('function');
    done();
  });

  // Test getAvailableAndKnownNetworks return value
  test('getAvailableAndKnownNetworks should be function 2', done => {
    const reqProxy = wifiManager.getAvailableAndKnownNetworks();
    expect(typeof reqProxy).toBe('object');
    expect(typeof reqProxy.onsuccess).toBe('function');
    expect(typeof reqProxy.onerror).toBe('function');
    expect(reqProxy.result).toEqual([
      {
        security: ['available'],
        capabilities: 'capabilities',
        signalStrength: 'signalStrength',
        relSignalStrength: 'relSignalStrength'
      }
    ]);
    expect(reqProxy.error).toBe('getNetworks error');
    done();
  });
});
