describe('sessions js <lib_session> test', () => {
  beforeEach(done => {
    require('../../mock/lazyLoader_mock');
    require('../../../js/session/lib_session');
    done();
  });

// LibSession self
  test('libSession should be function', done => {
    expect(typeof window.libSession).toBe('object');
    done();
  });

// When no services pass SessionInit should reject
  test('initService should not work when no service passed in', async (done) => {
    const servicesArray = [];
    try {
      await window.libSession.initService(servicesArray);
    } catch (e) {
      expect(e.message).toEqual('No service');
    }
    done();
  });

// LibSession init
  test('libSession --> initService', async done => {
    require('../../mock/daemon_lib_session_mock');
    require('../../mock/daemon_lib_feature_mock');
    const servicesArray = [
      'settingsService',
      'powerService',
      'appsService',
      'tcpsocketService',
      'telephonyService',
      'devicecapabilityService',
      'appsService',
      'contactsService',
      'audiovolumeService',
      'procmanagerService',
      'usbmanagerService'
    ];
    LazyLoader.load.mockResolvedValue();
    window.lib_session = {};
    window.lib_session.Session = window.Session;
    await window.libSession.initService(servicesArray);
    LazyLoader.load.mockReset();
    done();
  });
});




