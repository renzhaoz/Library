/* eslint-disable no-undef, global-require */
describe('sessions js <settingsa_observer> test', () => {
  const common = require('../../common');
  const { dispatchEvent } = common;

  beforeEach(done => {
    require('../../mock/window_api_mock');
    require('../../mock/daemon_lib_feature_mock');
    require('../../../js/session/settings/settings_observer');
    done();
  });

  // SettingsObserver self
  test('settings_observer init should work', async done => {
    require('../../mock/daemon_task_scheduler_mock');
    const { SettingsObserver } = window;
    taskScheduler.connected = true;
    SettingsObserver.init();
    expect(SettingsObserver.initiated).toBe(true);
    expect(SettingsObserver.observer).toBe(undefined);
    dispatchEvent('services-load-observer');
    expect(SettingsObserver.observer.display()).toBe('Setting observer');
    dispatchEvent('services-load-complete');

    const spyObserver = jest
      .spyOn(taskScheduler, 'request')
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce({ value: 'test' });
    const setter = await SettingsObserver.setValue([
      {
        name: 'settings.test',
        value: 'test'
      }
    ]);
    expect(setter).toBe(true);
    const getter = await SettingsObserver.getValue('settings.test');
    expect(getter).toBe('test');
    spyObserver.mockRestore();
    done();
  });

  test('settings_observer getValue before init ', done => {
    require('../../mock/daemon_task_scheduler_mock');
    const { SettingsObserver } = window;

    taskScheduler.connected = false;
    expect(SettingsObserver._pendingGetValueRequests['settings.test']).toBeUndefined();
    SettingsObserver.getValue('settings.test').then(value => {
      done();
    });
    expect(SettingsObserver._pendingGetValueRequests['settings.test']).not.toBeUndefined();


    SettingsObserver.init();
    taskScheduler.connected = true;
    const spyObserver = jest
      .spyOn(taskScheduler, 'request')
      .mockResolvedValueOnce([{ name: 'settings.test', value: 'test' }])
    dispatchEvent('services-load-observer');
    dispatchEvent('services-load-complete');
    expect(spyObserver).toBeCalledTimes(1);
    expect(spyObserver.mock.calls[0][0]).toEqual({
      "args": [["settings.test"]],
      "funcName": "getBatch",
      "serverName": "settings"
    });
    spyObserver.mockRestore();
  });

  // Event test
  test('settings_observer observe & unobserve in disconnected', done => {
    const observeHandle = (value, name) => {
    };
    const spyObserver = jest
      .spyOn(taskScheduler, 'request')
      .mockResolvedValueOnce({ value: 'test' })
      .mockResolvedValueOnce({ value: 'test' });
    dispatchEvent('session-disconnected');
    expect(SettingsObserver.observer).toBeUndefined();
    SettingsObserver.observe('settings.test', 'test', observeHandle);
    expect(SettingsObserver._observersArray.length).toBe(1);
    expect(SettingsObserver._observers.length).toBe(0);
    SettingsObserver.unobserve('settings.test', observeHandle);
    expect(SettingsObserver._observersArray.length).toBe(0);
    spyObserver.mockRestore();
    done();
  });


  // Event test
  test('settings_observer event should work and unobserve after diconnected',
    done => {
    const observeHandle = (value, name) => {
      expect(name).toBe('settings.test');
      expect(value).toBe('test default');
    };
    const observeHandle1 = (value, name) => {
      expect(name).toBe('settings.test.next');
      expect(value).toBe('test new');
    };
    dispatchEvent('services-load-observer');
    SettingsObserver.observe('settings.test', 'test default', observeHandle);
    SettingsObserver.observe('settings.test.next', 'test', observeHandle1, true);
    expect(SettingsObserver._observersArray.length).toBe(2);
    expect(SettingsObserver._observers.length).toBe(2);
    SettingsObserver.observer.callback({
      name: 'settings.test.next',
      value: 'test new'
    });
    dispatchEvent('session-disconnected');
    expect(SettingsObserver._observers.length).toBe(0);
    SettingsObserver.unobserve('settings.test', observeHandle);
    SettingsObserver.unobserve('settings.test.next', observeHandle1);
    expect(SettingsObserver._observersArray.length).toBe(0);
    done();
  });
  test('settings_observer event should work', done => {
    const observeHandle = (value, name) => {
    };
    SettingsObserver.observe('settings.test', 'test default', observeHandle);
    SettingsObserver.observe('settings.test.next', 'test default', observeHandle);
    dispatchEvent('services-load-observer');
    expect(SettingsObserver._observersArray.length).toBe(2);
    expect(SettingsObserver._observers.length).toBe(2);

    SettingsObserver.unobserve('settings.test', observeHandle);
    SettingsObserver.unobserve('settings.test.next', observeHandle);
    expect(SettingsObserver._observers.length).toBe(0);
    expect(SettingsObserver._observersArray.length).toBe(0);
    done();
  });
});
