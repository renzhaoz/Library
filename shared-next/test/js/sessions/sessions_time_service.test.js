describe('session js <time_service> test', () => {
  const common = require('../../common');
  const { dispatchEvent } = common;

  beforeEach((done) => {
    require('../../mock/window_api_mock');
    require('../../mock/daemon_lib_feature_mock');
    require('../../../js/session/time_service/time_service');
    done();
  });

  test('time_service init should work', async done => {
    require('../../mock/daemon_task_scheduler_mock');
    const { TimeService } = window;
    dispatchEvent('services-load-observer');
    expect(TimeService.observer.display()).toBe('Time observer');
    const observeHandle = () => {
      done();
    };
    TimeService.addEventListener('timeChange', observeHandle);
    TimeService.addEventListener('timeChange', observeHandle);
    expect(TimeService.timeObservers.length).toBe(2);
    dispatchEvent('session-disconnected');
    expect(TimeService.observer).toBe(undefined);
    dispatchEvent('services-load-observer');
    TimeService.removeEventListener('timeChange', observeHandle);
    TimeService.removeEventListener('timeChange', observeHandle);
    expect(TimeService.timeObservers.length).toBe(0);
    TimeService.addEventListener('timeChange', observeHandle);
    expect(TimeService.observer.callback()).toBe(Promise.resolve());
    done();
  });

  test('services-load-complete', async done => {
    require('../../mock/daemon_task_scheduler_mock');
    const spyFn = jest.spyOn(taskScheduler, 'request');
    const { TimeService } = window;
    await TimeService.get();
    await TimeService.set(new Date());
    expect(spyFn).toHaveBeenCalledTimes(2);
    done();
  });
});
