describe('session js <account_manager> test', () => {
  beforeEach((done) => {
    require('../../mock/daemon_lib_feature_mock');
    require('../../mock/window_api_mock');
    require('../../../js/session/account_manager/account_manager');
    done();
  });

  test('observe account status and callback', async done => {
    require('../../mock/daemon_task_scheduler_mock');
    const { AccountManager } = window;
    const activesyncCb = jest.fn();
    const googleCb = jest.fn();
    const kaiCb = jest.fn();
    const kaiCb2 = jest.fn();
    const kaiCb3 = jest.fn();
    const mockActivity = jest.fn();
    mockActivity.prototype.start = jest.fn().mockResolvedValue([]);
    window.WebActivity = mockActivity;

    // Mock LazyLoader and AccountCryptoHelper
    global.LazyLoader = {
      load: jest.fn().mockResolvedValue()
    };
    global.AccountCryptoHelper = {
      getKey: jest.fn().mockResolvedValue('publicKey'),
      unwrapKey: jest.fn().mockResolvedValue([])
    };

    AccountManager.init();
    window.dispatchEvent(new CustomEvent('services-load-complete'));
    await AccountManager.observe('activesync', activesyncCb);
    await AccountManager.observe('google', googleCb);
    await AccountManager.observe('kaiaccount', kaiCb);
    await AccountManager.observe('kaiaccount', kaiCb2);
    await AccountManager.observe('kaiaccount', kaiCb3, true);

    expect(AccountManager._observers.length).toBe(5);
    // Only kaiaccount would run callback function immediately.
    expect(activesyncCb).toBeCalledTimes(0);
    expect(googleCb).toBeCalledTimes(0);
    expect(kaiCb).toBeCalledTimes(1);
    expect(kaiCb2).toBeCalledTimes(1);
    expect(kaiCb3).toBeCalledTimes(0);

    // Test google callback
    AccountManager.observer.callback({
      accountType: 'google',
      accountId: 'example@google.com',
      state: AccountManager.state.LOGGED_IN
    });
    expect(activesyncCb).toBeCalledTimes(0);
    expect(googleCb).toBeCalledTimes(1);
    expect(kaiCb).toBeCalledTimes(1);
    expect(kaiCb2).toBeCalledTimes(1);
    expect(kaiCb3).toBeCalledTimes(0);

    // Test activesync callback
    AccountManager.observer.callback({
      accountType: 'activesync',
      accountId: 'example@kaiostech.com',
      state: AccountManager.state.LOGGED_IN
    });
    expect(activesyncCb).toBeCalledTimes(1);
    expect(googleCb).toBeCalledTimes(1);
    expect(kaiCb).toBeCalledTimes(1);
    expect(kaiCb2).toBeCalledTimes(1);
    expect(kaiCb3).toBeCalledTimes(0);

    // Test kaiaccount callback
    AccountManager.observer.callback({
      accountType: 'kaiaccount',
      state: AccountManager.state.LOGGED_IN
    });

    expect(activesyncCb).toBeCalledTimes(1);
    expect(googleCb).toBeCalledTimes(1);
    expect(kaiCb).toBeCalledTimes(2);
    expect(kaiCb2).toBeCalledTimes(2);
    expect(kaiCb3).toBeCalledTimes(1);
    done();
  });
});
