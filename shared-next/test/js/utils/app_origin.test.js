describe('utils js <app_origin> test', () => {
  beforeEach(done => {
    require('../../../js/utils/common/app_origin');
    done();
  });

  // AppOrigin test
  test('AppOrigin should be an object', done => {
    expect(typeof AppOrigin).toBe('object');
    done();
  });

  // AppOrigin.getOrigin test
  test('getOrigin() is a function and should return a template', done => {
    expect(typeof AppOrigin.getOrigin).toBe('function');
    expect(AppOrigin.getOrigin('shared'))
      .toBe('%GAIA_SCHEME%shared.%GAIA_DOMAIN%');
    done();
  });

  test('getOrigin() should follow the route map', done => {
    expect(AppOrigin.getOrigin('kaios-plus'))
      .toBe('%GAIA_SCHEME%kaios-store.%GAIA_DOMAIN%');
    done();
  });

  // AppOrigin.getManifestURL test
  test('getManifestURL() is a function and should return a template', done => {
    expect(typeof AppOrigin.getManifestURL).toBe('function');
    expect(AppOrigin.getManifestURL('name'))
      .toBe('%GAIA_SCHEME%name.%GAIA_DOMAIN%/%MANIFEST_NAME%');
    done();
  });

  test('getManifestURL() follow the route map', done => {
    expect(AppOrigin.getManifestURL('kaios-plus'))
      .toBe('%GAIA_SCHEME%kaios-store.%GAIA_DOMAIN%/%MANIFEST_NAME%');
    done();
  });

  // AppOrigin.getManifestName test
  test('getManifestName() is a function and should return a template', done => {
    expect(typeof AppOrigin.getManifestName).toBe('function');
    expect(AppOrigin.getManifestName()).toBe('%MANIFEST_NAME%');
    done();
  });

  // AppOrigin.getScheme test
  test('getScheme() is a function and should return a template', done => {
    expect(typeof AppOrigin.getScheme).toBe('function');
    expect(AppOrigin.getScheme()).toBe('%GAIA_SCHEME%');
    done();
  });

  // AppOrigin.getProtocol test
  test('getProtocol() is a function and should return a template', done => {
    expect(typeof AppOrigin.getProtocol).toBe('function');
    expect(AppOrigin.getProtocol()).toBe('%GAIA_SCHEME%'.replace('://', ''));
    done();
  });

  // AppOrigin.getRootDomain test
  test('getRootDomain() is a function and should return a template', done => {
    expect(typeof AppOrigin.getRootDomain).toBe('function');
    expect(AppOrigin.getRootDomain()).toBe('%GAIA_DOMAIN%');
    done();
  });
});
