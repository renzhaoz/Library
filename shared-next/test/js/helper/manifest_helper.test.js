/* eslint-disable no-undef, global-require */
describe('helper js <manifest_helper> test', () => {
  const manifest = {
    name: 'Shared',
    description: 'description',
    short_name: 'short_name',
    locales: {
      'en-US': {
        name: 'STK',
        description: 'STK app',
        short_name: 'STK short_name'
      }
    }
  };

  beforeAll(done => {
    require('../../../js/helper/manifest/manifest_helper');
    require('../../mock/l10n_mock');
    const { ManifestHelper } = window;
    done();
  });

  // ManifestHelper test
  test('ManifestHelper should be function', done => {
    expect(typeof ManifestHelper).toBe('function');
    done();
  });

  // ManifestHelper constructor test without window.api.l10n
  test('ManifestHelper constructor test without window.api.l10n', done => {
    const manifestHelper = new ManifestHelper(manifest);
    const spy = jest
      .spyOn(window.api.l10n.language, 'code', 'get')
      .mockReturnValueOnce(undefined);
    expect(manifestHelper.name).toBe('Shared');
    expect(manifestHelper.description).toBe('description');
    expect(manifestHelper.short_name).toBe('short_name');
    expect(manifestHelper.locales).toEqual(manifest.locales);
    expect(manifestHelper.displayName).toBe('short_name');
    spy.mockRestore();
    done();
  });

  // ManifestHelper constructor test without window.api.l10n, and no short_name in manifest
  test('ManifestHelper constructor test without window.api.l10n, and no short_name in manifest', done => {
    const newManifest = {
      name: 'Shared',
      description: 'description'
    };
    const manifestHelper = new ManifestHelper(newManifest);
    const spy = jest
      .spyOn(window.api.l10n.language, 'code', 'get')
      .mockReturnValueOnce(undefined);
    expect(manifestHelper.name).toBe('Shared');
    expect(manifestHelper.description).toBe('description');
    expect(manifestHelper.displayName).toBe('Shared');
    spy.mockRestore();
    done();
  });

  // ManifestHelper constructor test for qps
  test('ManifestHelper constructor test for qps', done => {
    const manifestHelper = new ManifestHelper(manifest);
    const spyCode = jest
      .spyOn(window.api.l10n.language, 'code', 'get')
      .mockReturnValue('qps-ploc');
    const spy = jest
      .spyOn(window.navigator, 'language', 'get')
      .mockReturnValue('qps-ploc');
    expect(manifestHelper.name).toBe('Shared');
    expect(manifestHelper.description).toBe('description');
    expect(manifestHelper.short_name).toBe('short_name');
    expect(manifestHelper.locales).toEqual(manifest.locales);
    expect(manifestHelper.displayName).toBe('short_name');
    spy.mockRestore();
    spyCode.mockRestore();
    done();
  });

  // ManifestHelper constructor test for locales
  test('ManifestHelper constructor test for locales', done => {
    const manifestHelper = new ManifestHelper(manifest);
    const spyCode = jest
      .spyOn(window.api.l10n.language, 'code', 'get')
      .mockReturnValue('en-US');
    expect(manifestHelper.name).toBe('STK');
    expect(manifestHelper.description).toBe('STK app');
    expect(manifestHelper.short_name).toBe('STK short_name');
    expect(manifestHelper.locales).toEqual(manifest.locales);
    expect(manifestHelper.displayName).toBe('STK short_name');
    spyCode.mockRestore();
    done();
  });
});
