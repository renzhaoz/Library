describe('sessions js <task_scheduler> test', () => {

  const common = require('../../common');
  const dispatchEvent = common.dispatchEvent;

  beforeEach(done => {
    require('../../../js/session/task_scheduler');
    done();
  });

  test('TaskScheduler should be function', done => {
    expect(typeof window.taskScheduler).toBe('object');
    done();
  });

// services-load-complete event should be monitored
  test('services-load-complete event should be monitored', done => {
    const { taskScheduler } = window;
    dispatchEvent('services-load-complete');
    expect(taskScheduler.connected).toBe(true);
    done();
  });

// session-disconnected event should be monitored
  test('session-disconnected', done => {
    const { taskScheduler } = window;
    dispatchEvent('session-disconnected');
    expect(taskScheduler.connected).toBe(false);
    done();
  });

// request
  test('session-request', async done => {
    require('../../mock/window_api_mock');
    const { taskScheduler } = window;
    dispatchEvent('services-load-complete');
    const serversName = [
      'settings',
      'power',
      'usb',
      'accounts',
      'apps',
      'tcp_socket',
      'telephony',
      'device_capability',
      'contacts',
      'audio_volume',
      'process'
    ];
    for await (let server of serversName) {
      await taskScheduler.request({
        'serverName': server,
        'funcName': 'func',
        'args': {}
      });
    }
    done();
  });
});
