/* eslint-disable no-undef, global-require */
describe('helper js <date_time_helper> test', () => {
  const callback = jest.fn();
  beforeAll(done => {
    require('../../mock/settings_observer_mock');
    // eslint-disable-next-line no-unused-vars
    const { SettingsObserver } = window;
    window.addEventListener('timeformatchange', callback);
    require('../../../js/helper/date_time/date_time_helper');
    done();
  });

  // DatetimeHelper test
  test('datetimeHelper should be function', done => {
    expect(callback.mock.calls.length).toBe(1);
    expect(typeof window.api.hour12).toBe('boolean');
    done();
  });
});
