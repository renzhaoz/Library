/* eslint-disable no-undef, global-require */
describe('helper js <bluetooth_helper> test', () => {
  const b2gNavigator = require('../../mock/b2g_navigator_mock');
  const { mockB2gNavigator } = b2gNavigator;
  let bluetoothHelper = null;

  beforeAll(done => {
    window.navigator.b2g = {};
    require('../../mock/bluetooth_mock');
    mockB2gNavigator(window, 'bluetooth', window.MockBluetooth);
    require('../../../js/helper/bluetooth/bluetooth_helper');
    done();
  });

  // Test BluetoothHelper
  test('BluetoothHelper should be function', done => {
    expect(typeof window.BluetoothHelper).toBe('function');
    done();
  });

  describe('test bluetoothHelper functions', () => {
    beforeEach(done => {
      bluetoothHelper = new window.BluetoothHelper();
      done();
    });

    // Test BluetoothHelper contructor
    test('BluetoothHelper should be function', done => {
      expect(bluetoothHelper).not.toBeNull();
      done();
    });

    // Test BluetoothHelper profiles
    test('BluetoothHelper.profiles should return object', done => {
      const { profiles } = bluetoothHelper;
      expect(profiles).toEqual({ A2DP: 4365, HFP: 4382 });
      done();
    });

    // Test BluetoothHelper answerWaitingCall
    test('BluetoothHelper.answerWaitingCall should invoke', done => {
      const spy = jest.spyOn(
        window.MockBluetooth.defaultAdapter,
        'answerWaitingCall'
      );
      bluetoothHelper.answerWaitingCall();
      expect(spy).toBeCalledTimes(1);
      done();
    });

    // Test BluetoothHelper ignoreWaitingCall
    test('BluetoothHelper.ignoreWaitingCall should invoke', done => {
      const spy = jest.spyOn(
        window.MockBluetooth.defaultAdapter,
        'ignoreWaitingCall'
      );
      bluetoothHelper.ignoreWaitingCall();
      expect(spy).toBeCalledTimes(1);
      done();
    });

    // Test BluetoothHelper toggleCalls
    test('BluetoothHelper.toggleCalls should invoke', done => {
      const spy = jest.spyOn(
        window.MockBluetooth.defaultAdapter,
        'toggleCalls'
      );
      bluetoothHelper.toggleCalls();
      expect(spy).toBeCalledTimes(1);
      done();
    });

    // Test BluetoothHelper getConnectedDevicesByProfile
    test('BluetoothHelper.getConnectedDevicesByProfile should return result', done => {
      // eslint-disable-next-line no-empty-function
      const spy = jest.spyOn(console, 'log').mockImplementationOnce(() => {});
      const profileID = 'profileID';
      const cb = jest.fn();
      const errorCB = jest.fn();
      bluetoothHelper.getConnectedDevicesByProfile(profileID, cb, errorCB);
      expect(cb).toBeCalledTimes(1);
      expect(cb).toHaveBeenNthCalledWith(1, 'getConnectedDevices result');
      expect(errorCB).toBeCalledTimes(1);
      expect(spy).toBeCalledTimes(1);
      spy.mockRestore();
      done();
    });

    // Test BluetoothHelper connectSco
    test('BluetoothHelper.connectSco should return result', done => {
      // eslint-disable-next-line no-empty-function
      const spy = jest.spyOn(console, 'log').mockImplementationOnce(() => {});
      const cb = jest.fn();
      bluetoothHelper.connectSco(cb);
      expect(cb).toBeCalledTimes(1);
      expect(cb).toHaveBeenNthCalledWith(1, 'connectSco result');
      expect(spy).toBeCalledTimes(1);
      spy.mockRestore();
      done();
    });

    // Test BluetoothHelper disconnectSco
    test('BluetoothHelper.disconnectSco should return object', done => {
      // eslint-disable-next-line no-empty-function
      const spy = jest.spyOn(console, 'log').mockImplementationOnce(() => {});
      const cb = jest.fn();
      bluetoothHelper.disconnectSco(cb);
      expect(cb).toBeCalledTimes(1);
      expect(cb).toHaveBeenNthCalledWith(1, 'disconnectSco result');
      expect(spy).toBeCalledTimes(1);
      spy.mockRestore();
      done();
    });

    // Test BluetoothHelper getPairedDevices
    test('BluetoothHelper.getPairedDevices should return object', done => {
      // eslint-disable-next-line no-empty-function
      const spy = jest.spyOn(console, 'log').mockImplementationOnce(() => {});
      const cb = jest.fn();
      bluetoothHelper.getPairedDevices(cb);
      expect(cb).toBeCalledTimes(1);
      expect(cb).toHaveBeenNthCalledWith(1, 'getPairedDevices result');
      expect(spy).toBeCalledTimes(1);
      spy.mockRestore();
      done();
    });

    // Test BluetoothHelper getAddress
    test('BluetoothHelper.getAddress should return when v2 is true', done => {
      // eslint-disable-next-line no-empty-function
      const spy = jest.spyOn(console, 'log').mockImplementationOnce(() => {});
      const cb = jest.fn();
      bluetoothHelper.getAddress(cb);
      expect(spy).toBeCalledTimes(1);
      spy.mockRestore();
      done();
    });

    // Test BluetoothHelper setPairingConfirmation
    test('BluetoothHelper.setPairingConfirmation should return when v2 is true', done => {
      // eslint-disable-next-line no-empty-function
      const spy = jest.spyOn(console, 'log').mockImplementationOnce(() => {});
      const address = 'address';
      const confirmed = true;
      bluetoothHelper.setPairingConfirmation(address, confirmed);
      expect(spy).toBeCalledTimes(1);
      spy.mockRestore();
      done();
    });

    // Test BluetoothHelper setPinCode
    test('BluetoothHelper.setPinCode should return when v2 is true', done => {
      // eslint-disable-next-line no-empty-function
      const spy = jest.spyOn(console, 'log').mockImplementationOnce(() => {});
      const address = 'address';
      const pincode = 'pincode';
      bluetoothHelper.setPinCode(address, pincode);
      expect(spy).toBeCalledTimes(1);
      spy.mockRestore();
      done();
    });

    // Test BluetoothHelper setPasskey
    test('BluetoothHelper.setPasskey should return when v2 is true', done => {
      // eslint-disable-next-line no-empty-function
      const spy = jest.spyOn(console, 'log').mockImplementationOnce(() => {});
      const address = 'address';
      const key = 'key';
      bluetoothHelper.setPasskey(address, key);
      expect(spy).toBeCalledTimes(1);
      spy.mockRestore();
      done();
    });

    // Test BluetoothHelper isScoConnected
    test('BluetoothHelper.isScoConnected should return result', done => {
      // eslint-disable-next-line no-empty-function
      const spy = jest.spyOn(console, 'log').mockImplementationOnce(() => {});
      const cb = jest.fn();
      const errorCB = jest.fn();
      bluetoothHelper.isScoConnected(cb, errorCB);
      expect(cb).toBeCalledTimes(1);
      expect(cb).toHaveBeenNthCalledWith(1, 'isScoConnected result');
      expect(errorCB).toBeCalledTimes(1);
      expect(spy).toBeCalledTimes(1);
      spy.mockRestore();
      done();
    });

    // Test BluetoothHelper sendMediaMetaData
    test('BluetoothHelper.sendMediaMetaData should return result', done => {
      // eslint-disable-next-line no-empty-function
      const spy = jest.spyOn(console, 'log').mockImplementationOnce(() => {});
      const metadata = 'metadata';
      const cb = jest.fn();
      const errorCB = jest.fn();
      bluetoothHelper.sendMediaMetaData(metadata, cb, errorCB);
      expect(cb).toBeCalledTimes(1);
      expect(cb).toHaveBeenNthCalledWith(1, 'sendMediaMetaData metadata');
      expect(errorCB).toBeCalledTimes(1);
      expect(spy).toBeCalledTimes(1);
      spy.mockRestore();
      done();
    });

    // Test BluetoothHelper sendMediaPlayStatus
    test('BluetoothHelper.sendMediaPlayStatus should return result', done => {
      // eslint-disable-next-line no-empty-function
      const spy = jest.spyOn(console, 'log').mockImplementationOnce(() => {});
      const metadata = 'metadata';
      const cb = jest.fn();
      const errorCB = jest.fn();
      bluetoothHelper.sendMediaPlayStatus(metadata, cb, errorCB);
      expect(cb).toBeCalledTimes(1);
      expect(cb).toHaveBeenNthCalledWith(1, 'sendMediaPlayStatus metadata');
      expect(errorCB).toBeCalledTimes(1);
      expect(spy).toBeCalledTimes(1);
      spy.mockRestore();
      done();
    });

    // Test BluetoothHelper onhfpstatuschanged
    test('BluetoothHelper.onhfpstatuschanged should be set', done => {
      const cb = jest.fn();
      bluetoothHelper.onhfpstatuschanged = cb;
      expect(
        window.MockBluetooth.defaultAdapter.onhfpstatuschanged
      ).not.toBeUndefined();
      done();
    });

    // Test BluetoothHelper onscostatuschanged
    test('BluetoothHelper.onscostatuschanged should return object', done => {
      const cb = jest.fn();
      bluetoothHelper.onscostatuschanged = cb;
      expect(
        window.MockBluetooth.defaultAdapter.onscostatuschanged
      ).not.toBeUndefined();
      done();
    });

    // Test BluetoothHelper ona2dpstatuschanged
    test('BluetoothHelper.ona2dpstatuschanged should return object', done => {
      const cb = jest.fn();
      bluetoothHelper.ona2dpstatuschanged = cb;
      expect(
        window.MockBluetooth.defaultAdapter.ona2dpstatuschanged
      ).not.toBeUndefined();
      done();
    });

    // Test BluetoothHelper onrequestmediaplaystatus
    test('BluetoothHelper.onrequestmediaplaystatus should return object', done => {
      const cb = jest.fn();
      bluetoothHelper.onrequestmediaplaystatus = cb;
      expect(
        window.MockBluetooth.defaultAdapter.onrequestmediaplaystatus
      ).not.toBeUndefined();
      done();
    });

    // Test BluetoothHelper onpairedstatuschanged
    test('BluetoothHelper.onpairedstatuschanged should return when v2 is true', done => {
      // eslint-disable-next-line no-empty-function
      const spy = jest.spyOn(console, 'log').mockImplementationOnce(() => {});
      const cb = jest.fn();
      bluetoothHelper.onpairedstatuschanged = cb;
      expect(
        window.MockBluetooth.defaultAdapter.onpairedstatuschanged
      ).toBeUndefined();
      expect(spy).toBeCalledTimes(1);
      spy.mockRestore();
      done();
    });

    // Test BluetoothHelper v2
    test('BluetoothHelper.v2 should return true', done => {
      const { v2 } = bluetoothHelper;
      expect(v2).toBeTruthy();
      done();
    });

    // Test BluetoothHelper enable
    test('BluetoothHelper.enable should invoke defaultAdapter.enable when v2 is true', done => {
      const spy = jest.spyOn(window.MockBluetooth.defaultAdapter, 'enable');
      bluetoothHelper.enable();
      expect(spy).toBeCalledTimes(1);
      done();
    });

    // Test BluetoothHelper disable
    test('BluetoothHelper.disable should invoke defaultAdapter.disable when v2 is true', done => {
      const spy = jest.spyOn(window.MockBluetooth.defaultAdapter, 'disable');
      bluetoothHelper.disable();
      expect(spy).toBeCalledTimes(1);
      done();
    });

    // Test BluetoothHelper parseEddystoneUrl
    test('BluetoothHelper.parseEddystoneUrl should invoke defaultAdapter.disable when v2 is true', done => {
      // eslint-disable-next-line no-empty-function
      const spy = jest.spyOn(console, 'log').mockImplementationOnce(() => {});
      const scanRecord = new ArrayBuffer(32);
      const rssi = 'rssi';
      bluetoothHelper.parseEddystoneUrl(scanRecord, rssi);
      expect(spy).toBeCalledTimes(1);
      spy.mockRestore();
      done();
    });
  });
});
