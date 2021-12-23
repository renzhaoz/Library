/* eslint-disable no-undef, global-require */
describe('helper js <sim_settings_helper> test', () => {
  beforeAll(done => {
    require('../../mock/settings_observer_mock.js');
    require('../../../js/helper/sim_settings/sim_settings_helper');
    done();
  });

  test('Sim settings helper set/read outgoingCall', done => {
    window.SimSettingsHelper.setServiceOnCard('outgoingCall', -1);
    SimSettingsHelper.getCardIndexFrom('outgoingCall').then(value => {
      expect(value).toBe(SimSettingsHelper.ALWAYS_ASK_OPTION_VALUE);
      done();
    });
  });

  test('Sim settings helper set/read outgoingMessages', done => {
    window.SimSettingsHelper.setServiceOnCard('outgoingMessages', 0);
    SimSettingsHelper.getCardIndexFrom('outgoingMessages').then(value => {
      expect(value).toBe(0);
      done();
    });
  });

  test('Sim settings helper set/read outgoingData', done => {
    window.SimSettingsHelper.setServiceOnCard('outgoingData', 1);
    SimSettingsHelper.getCardIndexFrom('outgoingData').then(value => {
      expect(value).toBe(1);
      done();
    });
  });
  test('Sim settings helper observe', done => {
    window.SimSettingsHelper.observe('outgoingData', value => {
      expect(value).toBe(2);
      done();
    });
    window.SimSettingsHelper.setServiceOnCard('outgoingData', 2);
  });

  test('Sim settings helper unobserve', done => {
    const callback = jest.fn();
    window.SimSettingsHelper.unobserve('outgoingData', callback);
    window.SimSettingsHelper.setServiceOnCard('outgoingData', 2);
    expect(callback).not.toHaveBeenCalled();
    done();
  });
});
