/* eslint-disable no-undef, global-require */
describe('helper js <notification_helper> test', () => {
  beforeAll(done => {
    require('../../mock/l10n_mock');
    require('../../mock/notification_mock');
    require('../../../js/helper/notification/notification_helper');
    // eslint-disable-next-line no-unused-vars
    const { NotificationHelper } = window;
    done();
  });

  // Test NotificationHelper
  test('NotificationHelper should be object', done => {
    expect(typeof NotificationHelper).toBe('object');
    done();
  });

  // Test getIconURI
  test('getIconURI should be function', done => {
    expect(typeof NotificationHelper.getIconURI).toBe('function');
    done();
  });

  // Test getIconURI return value1
  test('getIconURI should return null', done => {
    const app = {
      manifest: {}
    };
    const value = NotificationHelper.getIconURI(app);
    expect(value).toBeNull();
    done();
  });

  // Test getIconURI return value2
  test('getIconURI should return string 1', done => {
    const app = {
      manifest: {
        icons: {
          '56': '/style/icons/calculator_56.png',
          '112': '/style/icons/calculator_112.png'
        }
      },
      installOrigin: 'app://calculator.kaiostech.com'
    };
    const value = NotificationHelper.getIconURI(app);
    expect(value).toBe(
      'app://calculator.kaiostech.com/style/icons/calculator_56.png'
    );
    done();
  });

  // Test getIconURI return value3
  test('getIconURI should return string 2', done => {
    const app = {
      manifest: {
        icons: {
          '56': '/style/icons/calculator_56.png',
          '112': '/style/icons/calculator_112.png'
        }
      },
      installOrigin: 'app://calculator.kaiostech.com'
    };
    const spy = jest
      .spyOn(document.documentElement, 'clientWidth', 'get')
      .mockReturnValue(1080);
    const value = NotificationHelper.getIconURI(app);
    expect(value).toBe(
      'app://calculator.kaiostech.com/style/icons/calculator_112.png'
    );
    spy.mockRestore();
    done();
  });

  // Test getIconURI return value4
  test('getIconURI should return string', done => {
    const app = {
      manifest: {
        icons: {
          '56': '/style/icons/calculator_56.png',
          '112': '/style/icons/calculator_112.png'
        },
        entry_points: {
          test: {
            icons: {
              '224': '/style/icons/entry_224.png',
              '448': '/style/icons/entry_448.png'
            }
          }
        }
      },
      installOrigin: 'app://calculator.kaiostech.com'
    };
    const entryPoint = 'test';
    const value = NotificationHelper.getIconURI(app, entryPoint);
    expect(value).toBe(
      'app://calculator.kaiostech.com/style/icons/entry_224.png'
    );
    done();
  });

  // Test send
  test('send should be object', done => {
    expect(typeof NotificationHelper.send).toBe('function');
    done();
  });

  // Test send return value1
  test('send should return notification 1', done => {
    expect.assertions(1);
    const titleL10n = 'titleL10n';
    const options = {};
    NotificationHelper.send(titleL10n, options).then(res => {
      expect(typeof res).toBe('object');
      done();
    });
  });

  // Test send return value2
  test('send should return notification 2', done => {
    expect.assertions(1);
    const titleL10n = 'titleL10n';
    const options = {
      bodyL10n: {
        raw: 'raw'
      }
    };
    NotificationHelper.send(titleL10n, options).then(res => {
      expect(typeof res).toBe('object');
      done();
    });
  });
  // Test send return value3
  test('send should return notification', done => {
    expect.assertions(1);
    const titleL10n = 'titleL10n';
    const options = {
      closeOnClick: false,
      bodyL10n: {
        id: 'l10nId',
        args: 'l10nArgs'
      }
    };
    NotificationHelper.send(titleL10n, options).then(res => {
      expect(typeof res).toBe('object');
      done();
    });
  });
});
