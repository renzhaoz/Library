/* eslint-disable no-undef, global-require */
describe('helper js <softkey_panel> test', () => {
  let confirmSoftkey = null;
  const { wrap } = require('jest-snapshot-serializer-raw');

  beforeAll(done => {
    require('../../mock/l10n_mock');
    require('../../mock/navigation_map');
    require('../../mock/lazyLoader_mock');
    require('../../mock/softkey_register_mock');
    require('../../mock/lazyLoader_mock');
    require('../../../js/helper/softkey/softkey_panel');

    const keyItems = [
      {
        name: 'cancel',
        l10nId: 'cancel',
        priority: 1,
        method: jest.fn()
      },
      {
        name: 'pair',
        l10nId: 'pair',
        priority: 3,
        method: jest.fn()
      }
    ];
    confirmSoftkey = new SoftkeyPanel({
      menuClassName: 'menu-button',
      items: keyItems
    });
    done();
  });

  test('SoftkeyPanel should be function', done => {
    expect(typeof window.SoftkeyPanel).toBe('function');
    done();
  });

  // Test SoftkeyPanel constructor
  test('SoftkeyPanel constructor should create SoftkeyPanel', done => {
    confirmSoftkey.form.dispatchEvent(new CustomEvent('updateKeyInfo'));
    confirmSoftkey.form.dispatchEvent(new CustomEvent('submit'));

    window.dispatchEvent(new CustomEvent('menuChangeEvent'));

    expect(wrap(confirmSoftkey.form)).toMatchSnapshot();
    expect(wrap(confirmSoftkey.buttonLsk)).toMatchSnapshot();
    expect(wrap(confirmSoftkey.buttonCsk)).toMatchSnapshot();
    expect(wrap(confirmSoftkey.buttonRsk)).toMatchSnapshot();
    done();
  });

  // Test confirmSoftkey.show
  test('confirmSoftkey.show should be function', done => {
    expect(typeof confirmSoftkey.show).toBe('function');
    done();
  });

  // Test confirmSoftkey.show
  test('confirmSoftkey.show add class to form', done => {
    confirmSoftkey.show();

    confirmSoftkey.form.dispatchEvent(new CustomEvent('transitionend'));

    expect(confirmSoftkey.form.classList.contains('visible')).toBeTruthy();
    expect(confirmSoftkey.form.classList.contains('focused')).toBeTruthy();
    done();
  });

  // Test confirmSoftkey.hide
  test('confirmSoftkey.hide should be function', done => {
    expect(typeof confirmSoftkey.hide).toBe('function');
    done();
  });

  // Test confirmSoftkey.hide return value
  test('confirmSoftkey.hide should hide form', done => {
    confirmSoftkey.hide();
    expect(confirmSoftkey.form.classList.contains('visible')).toBeFalsy();
    expect(confirmSoftkey.form.classList.contains('focused')).toBeFalsy();
    done();
  });

  // Test confirmSoftkey.initSoftKeyPanel
  test('confirmSoftkey.initSoftKeyPanel should create SoftkeyPanel', done => {
    const keyItems = [
      {
        name: 'test',
        l10nId: 'test',
        priority: 1,
        method: jest.fn()
      },
      {
        name: 'close',
        l10nId: 'close',
        priority: 3,
        method: jest.fn()
      }
    ];

    confirmSoftkey.initSoftKeyPanel({
      menuClassName: 'menu-button',
      items: keyItems
    });

    confirmSoftkey.form.dispatchEvent(new CustomEvent('updateKeyInfo'));
    confirmSoftkey.form.dispatchEvent(new CustomEvent('submit'));

    window.dispatchEvent(new CustomEvent('menuChangeEvent'));

    expect(wrap(confirmSoftkey.form)).toMatchSnapshot();
    expect(wrap(confirmSoftkey.buttonLsk)).toMatchSnapshot();
    expect(wrap(confirmSoftkey.buttonCsk)).toMatchSnapshot();
    expect(wrap(confirmSoftkey.buttonRsk)).toMatchSnapshot();
    done();
  });

  // Test confirmSoftkey.destroy
  test('confirmSoftkey.destroy should be function', done => {
    expect(typeof confirmSoftkey.destroy).toBe('function');
    done();
  });

  describe('confirmSoftkey.destroy should destroy form', () => {
    beforeEach(done => {
      confirmSoftkey.show();
      done();
    });

    // Test confirmSoftkey.destroy return value
    test('confirmSoftkey.destroy should destroy form', done => {
      confirmSoftkey.destroy();
      expect(confirmSoftkey.form).toBeNull();
      done();
    });
  });

  // Test SoftkeyPanel open option menu
  test('trigger keydown event', done => {
    const leftCallback = jest.fn();
    const centerCallback = jest.fn();
    const rightCallback = jest.fn();

    const keyItems = [
      {
        name: 'left',
        l10nId: 'left',
        priority: 1,
        method: leftCallback
      },
      {
        name: 'center',
        l10nId: 'center',
        priority: 2,
        method: centerCallback
      },
      {
        name: 'right',
        l10nId: 'right',
        priority: 3,
        method: rightCallback
      }
    ];
    confirmSoftkey = new SoftkeyPanel({
      menuClassName: 'menu-button',
      items: keyItems
    });
    confirmSoftkey.show();
    expect(confirmSoftkey.form.classList.contains('visible')).toBeTruthy();
    expect(confirmSoftkey.form.classList.contains('focused')).toBeTruthy();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ContextMenu' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F1' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'SoftLeft' }));
    expect(leftCallback).toBeCalledTimes(3);

    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'BrowserSearch' })
    );
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F2' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'SoftRight' }));
    expect(rightCallback).toBeCalledTimes(3);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Accept' }));
    expect(centerCallback).toBeCalledTimes(2);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'BrowserBack' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
    done();
  });

  // Test SoftkeyPanel open option menu
  test('trigger keydown event for key is SoftRight', done => {
    const spy = jest
      .spyOn(LazyLoader, 'load')
      .mockImplementation((files, callback) => {
        require('../../../js/helper/option_menu/option_menu');
        require('../../../style/commons/action_menu.css');
        require('../../../style/commons/option_menu.css');
        callback();
      });
    const rightCallback = jest.fn();

    const keyItems = [
      {
        name: 'left',
        l10nId: 'left',
        priority: 1,
        method: jest.fn()
      },
      {
        name: 'center',
        l10nId: 'center',
        priority: 3,
        method: jest.fn()
      },
      {
        name: 'right',
        l10nId: 'right',
        priority: 3,
        method: rightCallback
      }
    ];
    confirmSoftkey = new SoftkeyPanel({
      menuClassName: 'menu-button',
      items: keyItems
    });
    confirmSoftkey.show();

    expect(confirmSoftkey.form.classList.contains('visible')).toBeTruthy();
    expect(confirmSoftkey.form.classList.contains('focused')).toBeTruthy();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'SoftRight' }));
    expect(rightCallback).toBeCalledTimes(0);
    expect(spy).toBeCalledTimes(1);
    expect(document.getElementById('option-menu').classList.contains('visible')).toBeTruthy();
    spy.mockRestore();
    done();
  });
});
