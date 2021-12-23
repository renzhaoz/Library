describe('session js <process_manager> test', () => {
  beforeEach((done) => {
    require('../../../js/session/process_manager/process_manager');
    done();
  });

  // PowerManager methods
  test('process manager methods', async done => {
    require('../../mock/daemon_task_scheduler_mock');
    const { ProcManager } = window;
    await ProcManager.abort();
    await ProcManager.add([]);
    await ProcManager.begin([]);
    await ProcManager.commit();
    await ProcManager.pending();
    await ProcManager.remove();
    await ProcManager.reset();
    done();
  });
});
