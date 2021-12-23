/* eslint-disable no-undef, global-require */
describe('helper js <simslot_manager> test', () => {
  const b2gNavigator = require('../../mock/b2g_navigator_mock');
  const { mockB2gNavigator } = b2gNavigator;
  const {
    MockMobileConnections
  } = require('../../mock/mobile_connections_mock');
  const { MockIccManager } = require('../../mock/iccManager_mock');

  beforeAll(done => {
    window.navigator.b2g = {};
    mockB2gNavigator(window, 'mobileConnections', MockMobileConnections);
    mockB2gNavigator(window, 'iccManager', MockIccManager);
    require('../../../js/helper/simslot/simslot');
    require('../../../js/helper/simslot/simslot_manager');
    done();
  });

  // Test SIMSlotManager
  test('SIMSlotManager should be object', done => {
    expect(typeof window.SIMSlotManager).toBe('object');
    expect(window.SIMSlotManager.instances.length).toBe(2);
    done();
  });

  // Test noSIMCardOnDevice
  test('noSIMCardOnDevice should be invoke', done => {
    const bool = window.SIMSlotManager.noSIMCardOnDevice();
    expect(bool).toBeTruthy();
    done();
  });

  // Test noSIMCardConnectedToNetwork
  test('noSIMCardConnectedToNetwork should be invoke', done => {
    const bool = window.SIMSlotManager.noSIMCardConnectedToNetwork();
    expect(bool).toBeFalsy();
    done();
  });

  // Test getMobileConnection
  test('getMobileConnection should be invoke', done => {
    const obj = window.SIMSlotManager.getMobileConnection(0);
    expect(typeof obj).toBe('object');
    done();
  });

  // Test getSlots
  test('getSlots should be invoke', done => {
    const arr = window.SIMSlotManager.getSlots();
    expect(Array.isArray(arr)).toBeTruthy();
    expect(arr.length).toBe(2);
    done();
  });

  // Test getSlotByIccId
  test('getSlotByIccId should be invoke', done => {
    const val = window.SIMSlotManager.getSlotByIccId('iccId');
    expect(val).toBeTruthy();
    done();
  });

  // Test waitForSecondSIM
  test('waitForSecondSIM should be invoke', done => {
    const callback = jest.fn();
    jest.useFakeTimers();
    window.addEventListener('simslotready', callback);
    window.SIMSlotManager.waitForSecondSIM();
    jest.runAllTimers();
    expect(setTimeout).toBeCalledTimes(1);
    expect(clearTimeout).toBeCalledTimes(1);
    expect(callback).toBeCalledTimes(1);
    window.removeEventListener('simslotready', callback);
    done();
  });
});
