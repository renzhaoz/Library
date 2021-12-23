describe('session js <apps_manager> test', () => {
  const common = require('../../common');
  const dispatchEvent = common.dispatchEvent;

  beforeEach((done) => {
    require('../../../js/session/audio_volume_manager/audio_volume_manager');
    done();
  });

  // services-load-complete event should be monitored
  test('services-load-complete', done => {
    dispatchEvent('services-load-complete');
    expect(AudioVolumeManager.connected).toBe(true);
    done();
  });

  // session-disconnected event should be monitored
  test('session-disconnected', done => {
    dispatchEvent('session-disconnected');
    expect(AudioVolumeManager.connected).toBe(false);
    done();
  });

  test('request service', done => {
    require('../../mock/daemon_task_scheduler_mock');
    AudioVolumeManager.requestVolumeDown();
    AudioVolumeManager.requestVolumeShow();
    AudioVolumeManager.requestVolumeUp();
    done();
  });

  test('process pending request', done => {
    require('../../mock/window_api_mock');
    AudioVolumeManager.observeAudioVolumeChanged(() => {});
    dispatchEvent('services-load-complete');
    AudioVolumeManager.unobserveAudioVolumeChanged(() => {})
    done();
  });
});
