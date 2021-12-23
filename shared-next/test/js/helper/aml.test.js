/* eslint-disable no-undef, global-require */
describe('helper js <aml> test', () => {
  const b2gNavigator = require('../../mock/b2g_navigator_mock');
  const { mockB2gNavigator } = b2gNavigator;
  const {
    MockMobileConnections
  } = require('../../mock/mobile_connections_mock');
  const json = require('../../../resources/aml.json');
  const { MockRequestWakeLock } = require('../../mock/requestWakeLock_mock');
  const { MockIccManager } = require('../../mock/iccManager_mock');

  const val = { iccInfo: { imsi: 'imsi' } };

  beforeAll(done => {
    window.navigator.getBattery = jest.fn().mockImplementation(() => Promise.resolve(0.5));
    window.navigator.b2g = {};
    mockB2gNavigator(window, 'mobileConnections', MockMobileConnections);
    mockB2gNavigator(window, 'requestWakeLock', MockRequestWakeLock);
    mockB2gNavigator(window, 'iccManager', MockIccManager);
    require('../../mock/lazyLoader_mock');
    require('../../mock/settings_observer_mock');
    require('../../mock/navigator_battery_mock');
    require('../../mock/navigator_geolocation_mock');
    require('../../../js/helper/aml/aml');
    done();
  });

  // AML test
  test('AML should be object', done => {
    expect(typeof window.AML).toBe('object');
    done();
  });

  // TriggerBySMS test
  test('triggerBySMS should be function', done => {
    expect(typeof window.AML.triggerBySMS).toBe('function');
    done();
  });

  // SendAMLSms test
  test('sendAMLSms should be function', done => {
    expect(typeof window.AML.sendAMLSms).toBe('function');
    done();
  });

  // SendAMLSms test
  test('sendAMLSms should return undefind without conns', done => {
    expect(typeof window.AML.sendAMLSms).toBe('function');
    done();
  });

  // TriggerBySMS return value
  test('triggerBySMS should be resolve', done => {
    LazyLoader.getJSON.mockResolvedValue(json);

    const spyObserver = jest
      .spyOn(SettingsObserver, 'getValue')
      .mockResolvedValueOnce({ t1Timeout: '300', batteryForFiveMinutes: 0.2 })
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true);

    navigator.battery.level = 0.3;
    navigator.b2g.iccManager.getIccById.mockReturnValue(val);
    navigator.b2g.mobileConnections[0].getDeviceIdentities.mockResolvedValue({
      imei: 'imei'
    });
    window.AML.triggerBySMS(0);
    process.nextTick(() => {
      /*
       * Due to await doesn't work for chain promise, so workaround it use process.nextTick.
       * assert
       */
      expect(LazyLoader.getJSON).toBeCalledTimes(2);
      expect(SettingsObserver.getValue).toBeCalledTimes(3);
      expect(navigator.b2g.iccManager.getIccById).toBeCalledTimes(1);
      expect(
        navigator.b2g.mobileConnections[0].getDeviceIdentities
      ).toBeCalledTimes(1);
      // Clear mock
      LazyLoader.getJSON.mockReset();
      spyObserver.mockRestore();
      navigator.b2g.iccManager.getIccById.mockReset();
      navigator.b2g.mobileConnections[0].getDeviceIdentities.mockReset();
      navigator.battery.level = 0.1;
      done();
    });
  });

  // TriggerBySMS return value
  test('triggerBySMS should be resolve', done => {
    LazyLoader.getJSON.mockResolvedValue(json);
    window.AML.triggerBySMS(1);
    process.nextTick(() => {
      // Due to await doesn't work for chain promise, so workaround it use process.nextTick.
      expect(LazyLoader.getJSON).toBeCalledTimes(1);
      LazyLoader.getJSON.mockReset();
      done();
    });
  });

  // TriggerBySMS return value
  test('triggerBySMS should be reject', done => {
    // eslint-disable-next-line no-empty-function
    const spy = jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    LazyLoader.getJSON.mockRejectedValue();
    window.AML.triggerBySMS(0);
    process.nextTick(() => {
      // Due to await doesn't work for chain promise, so workaround it use process.nextTick.
      expect(console.error).toBeCalledTimes(1);
      LazyLoader.getJSON.mockReset();
      spy.mockRestore();
      done();
    });
  });

  // SendAMLSms return value test 1
  test('sendAMLSms should be resolve', done => {
    // Mock
    LazyLoader.getJSON.mockResolvedValue(json);

    const spyObserver = jest
      .spyOn(SettingsObserver, 'getValue')
      .mockResolvedValueOnce({ t1Timeout: '300', batteryForFiveMinutes: 0.2 })
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true);

    navigator.battery.level = 0.3;
    navigator.b2g.iccManager.getIccById.mockReturnValue(val);
    navigator.b2g.mobileConnections[0].getDeviceIdentities.mockResolvedValue({
      imei: 'imei'
    });

    // Run test
    window.AML.sendAMLSms(0, '1', true);
    process.nextTick(() => {
      /*
       * Due to await doesn't work for chain promise, so workaround it use process.nextTick.
       * assert
       */
      expect(LazyLoader.getJSON).toBeCalledTimes(1);
      expect(SettingsObserver.getValue).toBeCalledTimes(3);
      expect(navigator.b2g.iccManager.getIccById).toBeCalledTimes(1);
      expect(
        navigator.b2g.mobileConnections[0].getDeviceIdentities
      ).toBeCalledTimes(1);
      // Clear mock
      LazyLoader.getJSON.mockReset();
      spyObserver.mockRestore();
      navigator.b2g.iccManager.getIccById.mockReset();
      navigator.b2g.mobileConnections[0].getDeviceIdentities.mockReset();
      navigator.battery.level = 0.1;
      done();
    });
  });

  // SendAMLSms return value test 2
  test('sendAMLSms should return when getAMLInfo throw error', done => {
    // Mock
    const spyError = jest
      .spyOn(console, 'error')
      // eslint-disable-next-line no-empty-function
      .mockImplementationOnce(() => {});
    LazyLoader.getJSON.mockRejectedValueOnce();

    // Run test
    window.AML.sendAMLSms(0, '333', false);
    process.nextTick(() => {
      /*
       * Due to await doesn't work for chain promise, so workaround it use process.nextTick.
       * assert
       */
      expect(LazyLoader.getJSON).toBeCalledTimes(1);
      // Clear mock
      LazyLoader.getJSON.mockReset();
      spyError.mockRestore();
      done();
    });
  });

  // SendAMLSms return value test 3
  test('sendAMLSms should return when amlInfo.triggerNumbers exclude number', done => {
    // Mock
    LazyLoader.getJSON.mockResolvedValue({
      232: { triggerNumbers: '202, 505' }
    });

    // Run test
    window.AML.sendAMLSms(0, '333', false);
    process.nextTick(() => {
      /*
       * Due to await doesn't work for chain promise, so workaround it use process.nextTick.
       * assert
       */
      expect(LazyLoader.getJSON).toBeCalledTimes(1);
      // Clear mock
      LazyLoader.getJSON.mockReset();
      done();
    });
  });
});
