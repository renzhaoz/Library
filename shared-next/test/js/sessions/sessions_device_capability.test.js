describe('session js <device_capability> test', () => {
  beforeEach((done) => {
    require('../../../js/session/device_capability/device_capability');
    done();
  });

  test('services-load-complete', async done => {
    require('../../mock/daemon_task_scheduler_mock');
    const { DeviceCapabilityManager } = window;
    await DeviceCapabilityManager.get({});
    done();
  });
});
