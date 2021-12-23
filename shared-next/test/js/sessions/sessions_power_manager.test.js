describe('session js <power_manager> test', () => {
  const common = require('../../common');
  const dispatchEvent = common.dispatchEvent;

  beforeEach((done) => {
    require('../../../js/session/power_manager/power_manager');
    done();
  });

  // services-load-complete event should be monitored
  test('services-load-complete', done => {
    dispatchEvent('services-load-complete');
    expect(PowerManager.connected).toBe(true);
    done();
  });

  // session-disconnected event should be monitored
  test('session-disconnected', done => {
    dispatchEvent('session-disconnected');
    expect(PowerManager.connected).toBe(false);
    done();
  });

  // PowerManager methods
  test('power manager set methods', done => {
    require('../../mock/window_api_mock');
    [1, 2].forEach(function(i) {
      if(i === 2) {
        dispatchEvent('services-load-complete');
      }
      PowerManager.powerOff();
      PowerManager.reboot();
      PowerManager.setFactoryReset('root');
      PowerManager.setScreenEnabled(true);
      PowerManager.setExtScreenEnabled(true);
      expect(PowerManager.getExtScreenState()).toBe(true);
      PowerManager.setKeyLightEnabled(true);
      PowerManager.setScreenBrightness(33);
      PowerManager.setExtScreenBrightness(90);
      PowerManager.setKeyLightBrightness(87);
      PowerManager.setCpuSleepAllowed(true);
    });
    done();
  });

  // PowerManager methods
  test('power manager get methods', done => {
    require('../../mock/daemon_task_scheduler_mock');
    PowerManager.getFactoryResetReason();
    PowerManager.getScreenEnabled();
    PowerManager.getExtScreenEnabled();
    PowerManager.getKeyLightEnabled();
    PowerManager.getScreenBrightness();
    PowerManager.getExtScreenBrightness();
    PowerManager.getKeyLightBrightness();
    PowerManager.getCpuSleepAllowed();
    done();
  });
});
