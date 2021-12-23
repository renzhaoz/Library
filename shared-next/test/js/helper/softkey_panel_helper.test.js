/* eslint-disable no-undef, global-require */
describe('helper js <softkey_panel_helper> test', () => {
  const { wrap } = require('jest-snapshot-serializer-raw');
  const back = jest.fn();
  const front = jest.fn();
  const app = { back, front };
  const callback = jest.fn();
  let softkey = null;

  beforeAll(done => {
    require('../../mock/l10n_mock');
    require('../../mock/lazyLoader_mock');
    require('../../mock/softkey_register_mock');
    require('../../../js/helper/softkey/softkey_panel');
    require('../../../js/helper/softkey/softkey_panel_helper');
    done();
  });

  // Test SoftkeyHelper
  test('SoftkeyHelper should be object', done => {
    expect(typeof window.SoftkeyHelper).toBe('object');
    done();
  });

  // Test SoftkeyHelper.init
  test('SoftkeyHelper.init should be function', done => {
    expect(typeof window.SoftkeyHelper.init).toBe('function');
    done();
  });

  // Test SoftkeyHelper.updateSoftkey
  test('SoftkeyHelper.updateSoftkey should be function', done => {
    expect(typeof window.SoftkeyHelper.updateSoftkey).toBe('function');
    done();
  });

  // Test SoftkeyHelper.show
  test('SoftkeyHelper.show should be function', done => {
    expect(typeof window.SoftkeyHelper.show).toBe('function');
    done();
  });

  // Test SoftkeyHelper.onlyHide
  test('SoftkeyHelper.onlyHide should be function', done => {
    expect(typeof window.SoftkeyHelper.onlyHide).toBe('function');
    done();
  });

  // Test SoftkeyHelper.hide
  test('SoftkeyHelper.hide should be function', done => {
    expect(typeof window.SoftkeyHelper.hide).toBe('function');
    done();
  });

  // Test SoftkeyHelper.getSoftkey
  test('SoftkeyHelper.getSoftkey should be function', done => {
    expect(typeof window.SoftkeyHelper.getSoftkey).toBe('function');
    done();
  });

  // Test SoftkeyHelper.register
  test('SoftkeyHelper.register should be function', done => {
    expect(typeof window.SoftkeyHelper.register).toBe('function');
    done();
  });

  // Test SoftkeyHelper.register return value
  test('SoftkeyHelper.register should return applist', done => {
    const name = 'test';
    SoftkeyHelper.register(app, name);
    expect(SoftkeyHelper.applist.length).toBe(1);
    SoftkeyHelper.register({}, name);
    expect(SoftkeyHelper.applist.length).toBe(1);
    SoftkeyHelper.register(app, 'test1');
    expect(SoftkeyHelper.applist.length).toBe(2);
    expect(back).toBeCalledTimes(1);
    done();
  });

  describe('SoftkeyHelper.init', () => {
    beforeEach(done => {
      const softkeyParams = {
        menuClassName: 'menu-button',
        header: { name: 'Ring' },
        items: [
          {
            l10nId: 'ringer-dismiss',
            priority: 3,
            method: jest.fn()
          }
        ]
      };
      SoftkeyHelper.init(softkeyParams, callback);
      softkey = SoftkeyHelper.getSoftkey();
      done();
    });

    // Test SoftkeyHelper.init
    test('SoftkeyHelper.init should create soft key panel', done => {
      expect(wrap(softkey.form)).toMatchSnapshot();
      expect(wrap(softkey.buttonLsk)).toMatchSnapshot();
      expect(wrap(softkey.buttonCsk)).toMatchSnapshot();
      expect(wrap(softkey.buttonRsk)).toMatchSnapshot();
      expect(typeof softkey.show).toBe('function');
      expect(typeof softkey.hide).toBe('function');
      expect(softkey.form.classList.contains('visible')).toBeTruthy();
      expect(softkey.form.classList.contains('focused')).toBeTruthy();
      done();
    });

    // Test HelperEvent
    test('HelperEvent should show/hide softkey form', done => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { type: 'keydown', key: 'Backspace' })
      );
      window.dispatchEvent(
        new KeyboardEvent('keydown', { type: 'keydown', key: 'BrowserBack' })
      );
      expect(callback).toBeCalledTimes(2);
      window.dispatchEvent(
        new CustomEvent('lockscreen-appopened', { type: 'lockscreen-appopened' })
      );
      expect(softkey.form.classList.contains('visible')).toBeFalsy();
      expect(softkey.form.classList.contains('focused')).toBeFalsy();
      window.dispatchEvent(
        new CustomEvent('lockscreen-appclosed', { type: 'lockscreen-appclosed' })
      );
      expect(softkey.form.classList.contains('visible')).toBeTruthy();
      expect(softkey.form.classList.contains('focused')).toBeTruthy();
      window.dispatchEvent(
        new CustomEvent('screenchange', {
          type: 'screenchange',
          detail: { screenEnabled: false }
        })
      );
      expect(softkey.form.classList.contains('visible')).toBeFalsy();
      expect(softkey.form.classList.contains('focused')).toBeFalsy();
      done();
    });

    // Test SoftkeyHelper.show
    test('SoftkeyHelper.show should show form', done => {
      window.SoftkeyHelper.show();
      expect(softkey.form.classList.contains('visible')).toBeTruthy();
      expect(softkey.form.classList.contains('focused')).toBeTruthy();
      done();
    });

    // Test SoftkeyHelper.onlyHide
    test('SoftkeyHelper.onlyHide should hide form', done => {
      window.SoftkeyHelper.onlyHide();
      expect(softkey.form.classList.contains('visible')).toBeFalsy();
      expect(softkey.form.classList.contains('focused')).toBeFalsy();
      done();
    });

    // Test SoftkeyHelper.hide
    test('SoftkeyHelper.hide should hide form', done => {
      SoftkeyHelper.register(app, 'test');
      SoftkeyHelper.register(app, 'test1');
      expect(window.SoftkeyHelper.applist.length).toBe(2);
      window.SoftkeyHelper.hide('test1');
      expect(softkey.form.classList.contains('visible')).toBeFalsy();
      expect(softkey.form.classList.contains('focused')).toBeFalsy();
      expect(window.SoftkeyHelper.applist.length).toBe(1);
      expect(front).toBeCalledTimes(1);
      done();
    });

    // Test SoftkeyHelper.updateSoftkey
    test('SoftkeyHelper.updateSoftkey should update Softkey panel', done => {
      const params = {
        items: [
          {
            l10nId: 'ringer-dismiss',
            priority: 2,
            method: jest.fn()
          },
          {
            l10nId: 'ringer-dismiss',
            priority: 3,
            method: jest.fn()
          }
        ]
      };
      window.SoftkeyHelper.updateSoftkey(params, '1', 'new-ringer-dismiss1');
      window.SoftkeyHelper.updateSoftkey(params, '2', 'new-ringer-dismiss2');
      window.SoftkeyHelper.updateSoftkey(params, '3', 'new-ringer-dismiss3');
      expect(wrap(softkey.form)).toMatchSnapshot();
      expect(wrap(softkey.buttonLsk)).toMatchSnapshot();
      expect(wrap(softkey.buttonCsk)).toMatchSnapshot();
      expect(wrap(softkey.buttonRsk)).toMatchSnapshot();
      done();
    });
  });
});
