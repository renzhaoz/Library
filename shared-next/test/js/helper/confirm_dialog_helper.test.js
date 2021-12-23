/* eslint-disable no-undef, global-require */
describe('helper js <confirm_dialog_helper> test', () => {
  const { wrap } = require('jest-snapshot-serializer-raw');
  let dialog = null;

  beforeAll(done => {
    const {
      MockSoftkeyPanel,
      FORM_ID
    } = require('../../mock/softkeyPanel_mock');
    window.SoftkeyPanel = MockSoftkeyPanel;
    window.FORM_ID = FORM_ID;
    require('../../../js/helper/dialog/confirm_dialog_helper');

    const dialogConfig = {
      title: { id: 'error-pair-title', args: {} },
      body: { id: 'error-pair-fail', args: { devicename: 'deviceItem.name' } },
      desc: { id: 'error-pair-checkpin', args: {} },
      backcallback: jest.fn(),
      cancel: {
        l10nId: 'cancel',
        priority: 1,
        callback: jest.fn()
      },
      confirm: {
        l10nId: 'pair',
        priority: 3,
        callback: jest.fn()
      },
      accept: {
        l10nId: 'accept',
        priority: 3,
        callback: jest.fn()
      }
    };
    dialog = new ConfirmDialogHelper(dialogConfig);
    done();
  });

  describe('object/function existence test', () => {
    // Test ConfirmDialogHelper
    test('ConfirmDialogHelper should be function', done => {
      expect(typeof window.ConfirmDialogHelper).toBe('function');
      done();
    });

    // Test dialog.activeElement
    test('dialog.activeElement should be object', done => {
      expect(typeof dialog.activeElement).toBe('object');
      done();
    });

    // Test dialog.deltaTop
    test('dialog.deltaTop should be number', done => {
      expect(typeof dialog.deltaTop).toBe('number');
      done();
    });

    // Test dialog.Softkey
    test('dialog.Softkey should be object', done => {
      expect(typeof dialog.Softkey).toBe('object');
      done();
    });

    // Test dialog.isShown
    test('dialog.isShown should be boolean', done => {
      expect(typeof dialog.isShown).toBe('boolean');
      done();
    });

    // Test dialog.show
    test('dialog.show should be function', done => {
      expect(typeof dialog.show).toBe('function');
      done();
    });

    // Test dialog._show
    test('dialog._show should be function', done => {
      expect(typeof dialog._show).toBe('function');
      done();
    });

    // Test dialog.close
    test('dialog.close should be function', done => {
      expect(typeof dialog.close).toBe('function');
      done();
    });

    // Test dialog.destroy
    test('dialog.destroy should be function', done => {
      expect(typeof dialog.destroy).toBe('function');
      done();
    });

    // Test dialog.getSoftkeyHeight
    test('dialog.getSoftkeyHeight should be function', done => {
      expect(typeof dialog.getSoftkeyHeight).toBe('function');
      done();
    });

    // Test dialog.scrollContext
    test('dialog.scrollContext should be function', done => {
      expect(typeof dialog.scrollContext).toBe('function');
      done();
    });

    // Test dialog.handleEvent
    test('dialog.handleEvent should be function', done => {
      expect(typeof dialog.handleEvent).toBe('function');
      done();
    });
  });

  describe('function executed result test', () => {
    const parent = document.createElement('div');
    parent.id = 'confirm-dialog-container';
    beforeAll(done => {
      require('../../mock/lazyLoader_mock');
      require('../../mock/navigation_map');
      require('../../mock/l10n_mock');
      done();
    });

    // Test dialog.show
    test('dialog.show should invoke LazyLoader.load', done => {
      dialog.show();
      expect(LazyLoader.load).toBeCalledTimes(1);
      done();
    });

    // Test dialog.show
    test('dialog.show should appendchild to parent', done => {
      const openCallback = jest.fn();
      window.addEventListener('gaia-confirm-open', openCallback);
      LazyLoader.load.mockImplementationOnce((res, cb) => {
        cb();
      });
      jest.spyOn(document.body, 'clientHeight', 'get').mockReturnValue(960);
      document.body.setAttribute(
        'style',
        'font-size: 10px; --statusbar-height: 20px'
      );
      jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
        dialog.isShown = true;
        cb();
      });
      dialog.show(parent);
      expect(LazyLoader.load).toBeCalledTimes(1);
      expect(dialog.Softkey.initSoftKeyPanel).toBeCalledTimes(1);
      expect(dialog.Softkey.show).toBeCalledTimes(1);
      expect(openCallback).toBeCalledTimes(1);
      expect(wrap(parent)).toMatchSnapshot();
      done();
    });

    // Test handle Event
    describe('handle Event test', () => {
      beforeEach(done => {
        LazyLoader.load.mockImplementationOnce((res, cb) => {
          cb();
        });
        window.NavigationMap = undefined;
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
          cb();
        });
        dialog.show(parent);
        jest.resetAllMocks();
        done();
      });

      test('handle keydown BrowserBack', done => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', { type: 'keydown', key: 'BrowserBack' })
        );
        expect(dialog.Softkey.hide).toBeCalledTimes(1);
        expect(dialog.config.backcallback).toBeCalledTimes(1);
        done();
      });

      test('handle keydown Enter', done => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', { type: 'keydown', key: 'Enter' })
        );
        expect(dialog.Softkey.hide).toBeCalledTimes(1);
        done();
      });

      test('handle keydown ContextMenu', done => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', { type: 'keydown', key: 'ContextMenu' })
        );
        expect(dialog.Softkey.hide).toBeCalledTimes(1);
        done();
      });

      test('handle keydown ArrowUp', done => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', { type: 'keydown', key: 'ArrowUp' })
        );
        done();
      });

      test('handle keydown BrowserSearch', done => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', {
            type: 'keydown',
            key: 'BrowserSearch'
          })
        );
        expect(dialog.Softkey.hide).toBeCalledTimes(1);
        done();
      });

      test('handle CustomEvent hashchange', done => {
        window.dispatchEvent(
          new CustomEvent('hashchange', { type: 'hashchange' })
        );
        done();
      });

      test('handle CustomEvent confirm/cancel/accept test', done => {
        dialog.element.dispatchEvent(
          new CustomEvent('confirm', { type: 'confirm' })
        );
        expect(dialog.config.confirm.callback).toBeCalledTimes(1);
        dialog.element.dispatchEvent(
          new CustomEvent('cancel', { type: 'cancel' })
        );
        expect(dialog.config.cancel.callback).toBeCalledTimes(1);
        dialog.element.dispatchEvent(
          new CustomEvent('accept', { type: 'accept' })
        );
        expect(dialog.config.accept.callback).toBeCalledTimes(1);
        done();
      });

      test('test dialog.close', done => {
        dialog.close();
        expect(dialog.Softkey.hide).toBeCalledTimes(1);
        done();
      });

      test('test dialog.destroy', done => {
        const closeCallback = jest.fn();
        window.addEventListener('gaia-confirm-close', closeCallback);
        jest.useFakeTimers();
        dialog.destroy();
        jest.runAllTimers();
        dialog.element.dispatchEvent(new CustomEvent('transitionend'));
        expect(dialog.element).toBeNull();
        expect(closeCallback).toBeCalledTimes(1);
        done();
      });

      afterEach(done => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
        done();
      });
    });

    afterEach(done => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
      done();
    });

    afterAll(done => {
      document.body.removeAttribute('style');
      done();
    });
  });

  afterAll(done => {
    window.SoftkeyPanel = undefined;
    window.FORM_ID = undefined;
    done();
  });
});
