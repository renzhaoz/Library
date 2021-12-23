describe('utils js <mobile_operator> test', () => {
  const oldSettingsObserver = window.SettingsObserver;
  const { mockB2gNavigator } = require('../../mock/b2g_navigator_mock');
  const { MockMobileConnections } = require('../../mock/mobile_connections_mock');
  const { MockIccManager } = require('../../mock/iccManager_mock');
  beforeEach(done => {
    window.navigator.b2g = {};
    mockB2gNavigator(window, 'iccManager', MockIccManager);
    require('../../mock/settings_observer_mock');
    require('../../../js/utils/phone/mobile_operator');
    done();
  });

// MobileInfo test
  test('MobileInfo should be object', done => {
    expect(typeof MobileInfo).toBe('object');
    done();
  });

// MobileOperator test
  test('MobileOperator should be object', done => {
    expect(typeof MobileOperator).toBe('object');
    done();
  });

// UserFacingInfo test
  test('userFacingInfo should be function', done => {
    expect(typeof MobileOperator.userFacingInfo).toBe('function');
    done();
  });

// IsBrazil test
  test('isBrazil should be function', done => {
    expect(typeof MobileOperator.isBrazil).toBe('function');
    done();
  });

// UserFacingInfo & isBrazil return value test  (isBrazil return value is not false)
  test('userFacingInfo & isBrazil return value test', done => {
    const mobileConnection0 = MockMobileConnections[0];
    const mobileConnection = { ...mobileConnection0 };
    mobileConnection.voice.network.mcc = '724';
    mobileConnection.imsHandler = { capability: 'video-over-wifi' };

    const iccObj = {
      iccInfo: {
        isDisplaySpnRequired: true,
        spn: 'CMCC',
        isDisplayNetworkNameRequired: true
      }
    };

    const getIccByIdSpy = jest
      .spyOn(navigator.b2g.iccManager, 'getIccById')
      .mockReturnValueOnce(iccObj);

    const value = MobileOperator.userFacingInfo(mobileConnection);
    expect(getIccByIdSpy).toBeCalledTimes(1);
    expect(value).toEqual({
      operator: 'CMCC',
      carrier: '724mnc',
      region: 'SP 19'
    });
    getIccByIdSpy.mockRestore();
    done();
  });

// UserFacingInfo & isBrazil return value test  (isBrazil return value is false)
  test('userFacingInfo & isBrazil return value test', done => {
    const mobileConnection1 = MockMobileConnections[1];
    const mobileConnection = { ...mobileConnection1 };
    const getIccByIdSpy = jest
      .spyOn(navigator.b2g.iccManager, 'getIccById')
      .mockReturnValueOnce(null);
    const value = MobileOperator.userFacingInfo(mobileConnection);
    expect(value).toEqual({ operator: null, carrier: null, region: null });
    getIccByIdSpy.mockRestore();
    done();
  });

  afterEach(() => {
    window.SettingsObserver = oldSettingsObserver;
  });
});
