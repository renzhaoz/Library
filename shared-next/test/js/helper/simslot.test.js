/* eslint-disable no-undef, global-require */
describe('helper js <simslot> test', () => {
  const b2gNavigator = require('../../mock/b2g_navigator_mock');
  const { mockB2gNavigator } = b2gNavigator;
  const {
    MockMobileConnections
  } = require('../../mock/mobile_connections_mock');
  const { MockIccManager } = require('../../mock/iccManager_mock');
  let simslot = null;
  let createdCB = null;
  let updatedCB = null;

  beforeAll(done => {
    window.navigator.b2g = {};
    require('../../../js/helper/simslot/simslot');
    createdCB = jest.fn();
    updatedCB = jest.fn();
    window.addEventListener('simslot-created', createdCB);
    window.addEventListener('simslot-updated', updatedCB);
    simslot = new window.SIMSlot(MockMobileConnections[0], 0, MockIccManager);
    done();
  });

  // Test SIMSlot
  test('SIMSlot should be function', done => {
    expect(typeof window.SIMSlot).toBe('function');
    done();
  });

  // Test SIMSlot constructor
  test('SIMSlot constructor should dispatch event', done => {
    expect(createdCB).toBeCalledTimes(1);
    expect(updatedCB).toBeCalledTimes(1);
    window.removeEventListener('simslot-created', createdCB);
    window.removeEventListener('simslot-updated', updatedCB);
    done();
  });

  // Test handleEvent
  test('handleEvent should dispatch event', done => {
    const testCB = jest.fn();
    window.addEventListener('simslot-test', testCB);
    simslot.handleEvent({ type: 'test' });
    expect(testCB).toBeCalledTimes(1);
    window.removeEventListener('simslot-test', testCB);
    done();
  });

  // Test isAbsent
  test('isAbsent should return false', done => {
    const bool = simslot.isAbsent();
    expect(bool).toBeFalsy();
    done();
  });

  // Test isUnknownState
  test('isUnknownState should return false', done => {
    const bool = simslot.isUnknownState();
    expect(bool).toBeTruthy();
    done();
  });

  // Test isLocked
  test('isLocked should return false', done => {
    const bool = simslot.isLocked();
    expect(bool).toBeFalsy();
    done();
  });

  // Test getCardState
  test('getCardState should return false', done => {
    const bool = simslot.getCardState();
    expect(bool).toBeUndefined();
    done();
  });

  // Test getSmsc
  test('getSmsc should return false', done => {
    // eslint-disable-next-line no-empty-function
    const spy = jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    const callback = jest.fn();
    simslot.getSmsc(callback);
    expect(spy).toBeCalledTimes(1);
    expect(callback).toBeCalledTimes(1);
    expect(callback).toHaveBeenNthCalledWith(1, null);
    spy.mockRestore();
    done();
  });

  // Test getSmsc 2
  test('getSmsc should return false 2', done => {
    const { MockMobileMessage } = require('../../mock/mobile_message_mock');
    mockB2gNavigator(window, 'mobileMessage', MockMobileMessage);
    // eslint-disable-next-line no-empty-function
    const spy = jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    const callback = jest.fn();
    simslot.getSmsc(callback);
    expect(spy).toBeCalledTimes(1);
    expect(callback).toBeCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(1, 'res');
    expect(callback).toHaveBeenNthCalledWith(2, null);
    spy.mockRestore();
    done();
  });
});
