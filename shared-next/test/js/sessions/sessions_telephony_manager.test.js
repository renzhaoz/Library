describe('session js <telephony_manager> test', () => {
  const common = require('../../common');
  const dispatchEvent = common.dispatchEvent;

  beforeEach((done) => {
    require('../../../js/session/telephony_manager/telephony_manager');
    done();
  });

  // services-load-complete event should be monitored
  test('services-load-complete', done => {
    dispatchEvent('services-load-complete');
    expect(TelephonyManager.connected).toBe(true);
    done();
  });

  // session-disconnected event should be monitored
  test('session-disconnected', done => {
    dispatchEvent('session-disconnected');
    expect(TelephonyManager.connected).toBe(false);
    done();
  });

  test('observer and process pending request', done => {
    require('../../mock/window_api_mock');
    dispatchEvent('services-load-complete');
    const observerFunc = jest.fn();
    TelephonyManager.observeCallStateChange(observerFunc);
    expect(TelephonyManager._observersArray.length).toBe(1);
    dispatchEvent('session-disconnected');
    dispatchEvent('services-load-complete');
    TelephonyManager.unobserveCallStateChange(observerFunc);
    expect(TelephonyManager._observersArray.length).toBe(0);
    done();
  });
  //
  test('set and get call state', async done => {
    require('../../mock/daemon_task_scheduler_mock');
    dispatchEvent('services-load-complete');
    TelephonyManager.setCallState('done1');
    expect(TelephonyManager._callState).toBeNull();
    dispatchEvent('session-disconnected');
    TelephonyManager.setCallState('done2');
    expect(TelephonyManager._callState).toBe('done2');
    await TelephonyManager.getCallState();
    done();
  });
});
