describe('utils js <toaster> test', () => {
  beforeEach((done) => {
    require('../../../js/utils/toaster/toaster');
    require('../../mock/l10n_mock');
    var WebActivity = jest.fn(()=>{});
    WebActivity.prototype.start = jest.fn(()=>{});
    window.WebActivity = WebActivity;
    done();
  });

  test('Toaster.showToast should be function', (done) => {
    expect(typeof window.Toaster.showToast).toBe('function');
    window.Toaster.showToast({
      messageL10nId: 'test message id'
    });
    expect(WebActivity.mock.calls[0][0]).toStrictEqual("show-toast");
    expect(WebActivity.mock.calls[0][1]).toStrictEqual({
      "gaiaIcon": undefined,
      "text": "test message id",
      "timeout": undefined,
      "title": undefined
    });
    window.Toaster.showToast({
      message: 'test message',
      titleL10nId: 'test title id',
      latency: 2000
    });
    expect(WebActivity.mock.calls.length).toBe(2);
    expect(WebActivity.mock.calls[1][0]).toStrictEqual("show-toast");
    expect(WebActivity.mock.calls[1][1]).toStrictEqual({
      "gaiaIcon": undefined,
      "text": "test message",
      "timeout": 2000,
      "title": 'test title id'
    });
    done();
  });
});
