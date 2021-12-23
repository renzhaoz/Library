/* eslint-disable no-undef, global-require */
describe('helper js <icons_helper> test', () => {
  beforeAll(done => {
    require('../../../js/helper/common/icons_helper');
    done();
  });

  // IconsHelper test
  test('IconsHelper should be object', done => {
    expect(typeof window.IconsHelper).toBe('object');
    done();
  });

  // GetIcon test
  test('getIcon should be function', done => {
    expect(typeof window.IconsHelper.getIcon).toBe('function');
    done();
  });

  // GetIcon return value test
  test('getIcon should return an promise', done => {
    const uri = './imgs';
    const promise = window.IconsHelper.getIcon(uri, null, null);
    expect(typeof promise).toBe('object');
    done();
  });

  // GetIcon return value1 test
  test('getIcon should return an function', done => {
    const uri = './url1';
    const iconSize = '16x16';
    const placeObj = {
      icons: {
        '[../url1]': {
          sizes: ['16x16 32x32 48x48', '60x60']
        },
        '[../url2]': {
          sizes: ['16x16']
        }
      }
    };
    const promise = window.IconsHelper.getIcon(uri, iconSize, placeObj);
    expect(typeof promise).toBe('object');
    done();
  });

  // GetBestIcon test
  test('getBestIcon should be function', done => {
    expect(typeof window.IconsHelper.getBestIcon).toBe('function');
    done();
  });

  // GetBestIcon return value test
  test('getBestIcon should return null', done => {
    const uri = window.IconsHelper.getBestIcon(null, ['16x16']);
    expect(uri).toBeNull();
    done();
  });

  test('getBestIcon should return null', done => {
    // eslint-disable-next-line no-empty-function
    const spy = jest.spyOn(console, 'warn').mockImplementationOnce(() => {});
    const icons = {
      '[../url1]': {
        rel: 'apple-touch-icon',
        sizes: ['16x16 32x32 48x48', '60x60']
      },
      '[../url2]': {
        rel: 'apple-touch-icon',
        sizes: ['16x16']
      }
    };
    const uri = window.IconsHelper.getBestIcon(icons, ['16x16']);
    expect(typeof uri).toBe('string');
    expect(spy.mock.calls.length).toBe(1);
    spy.mockRestore();
    done();
  });

  // GetSizes test
  test('getSizes should be function', done => {
    expect(typeof window.IconsHelper.getSizes).toBe('function');
    done();
  });

  // GetSizes test
  test('getSizes should return function', done => {
    const icons = {
      '[../url1]': {
        sizes: ['16-16 32-32 48-48', '60-60']
      },
      '[../url2]': {
        sizes: ['16-16']
      }
    };
    const size = window.IconsHelper.getSizes(icons);
    expect(typeof size).toBe('object');
    done();
  });
});
