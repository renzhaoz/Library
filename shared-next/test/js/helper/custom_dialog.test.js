/* eslint-disable no-undef, global-require */
describe('helper js <custom_dialog> test', () => {
  beforeAll(done => {
    require('../../../js/helper/dialog/custom_dialog');
    done();
  });

  describe('object/function existence test', () => {
    // Test CustomDialog
    test('CustomDialog should be object', done => {
      expect(typeof window.CustomDialog).toBe('object');
      done();
    });

    // Test CustomDialog
    test('CustomDialog.setVersion should be function', done => {
      expect(typeof window.CustomDialog.setVersion).toBe('function');
      done();
    });

    // Test CustomDialog.hide
    test('CustomDialog.hide should be function', done => {
      expect(typeof window.CustomDialog.hide).toBe('function');
      done();
    });

    // Test CustomDialog.show
    test('CustomDialog.show should be function', done => {
      expect(typeof window.CustomDialog.show).toBe('function');
      done();
    });

    // Test CustomDialog.runConfirm
    test('CustomDialog.runConfirm should be function', done => {
      expect(typeof window.CustomDialog.runConfirm).toBe('function');
      done();
    });

    // Test CustomDialog.runCancel
    test('CustomDialog.runCancel should be function', done => {
      expect(typeof window.CustomDialog.runCancel).toBe('function');
      done();
    });

    // Test CustomDialog.__version
    test('CustomDialog.__version should be number', done => {
      expect(typeof window.CustomDialog.__version).toBe('number');
      done();
    });

    // Test CustomDialog.setVersion
    test('CustomDialog.setVersion should be function', done => {
      expect(typeof window.CustomDialog.setVersion).toBe('function');
      done();
    });

    // Test CustomDialog.setSoftkeyPanel
    test('CustomDialog.setSoftkeyPanel should be function', done => {
      expect(typeof window.CustomDialog.setSoftkeyPanel).toBe('function');
      done();
    });

    // Test CustomDialog.isVisible
    test('CustomDialog.isVisible should be boolean', done => {
      expect(typeof window.CustomDialog.isVisible).toBe('boolean');
      done();
    });
  });

  describe('window.CustomDialog.show() execution result test', () => {
    const backkeyCallback = jest.fn();
    const confirmCallback = jest.fn();
    const centerCallback = jest.fn();
    const title = { icon: 'icon.png', id: 'titleId' };
    const msg = 'msg';
    const cancelAndBack = {
      title: 'cancelAndBackTitle',
      callback: jest.fn(),
      backkeyCallback
    };
    const confirm = { title: 'confirmTitle', callback: confirmCallback };
    const center = { title: 'centerTitle', callback: centerCallback };

    beforeAll(done => {
      const { MockSoftkeyPanel } = require('../../mock/softkeyPanel_mock');
      const { MockSoftkeyHelper } = require('../../mock/softkeyHelper_mock');
      require('../../mock/l10n_mock');
      window.SoftkeyPanel = MockSoftkeyPanel;
      window.SoftkeyHelper = MockSoftkeyHelper;
      done();
    });

    // Test CustomDialog.show
    test('CustomDialog.show should return screen', done => {
      expect.assertions(5);
      SoftkeyHelper.init.mockImplementation((actions, callback) => {
        callback();
      });
      const callback = e => {
        expect(e.detail.visibility).toBeTruthy();
      };
      window.addEventListener('customDialogEvent', callback);
      const screen = window.CustomDialog.show(
        title,
        msg,
        cancelAndBack,
        confirm,
        null,
        center,
        true
      );
      expect(screen).toMatchSnapshot();
      expect(SoftkeyHelper.init).toBeCalledTimes(1);
      expect(SoftkeyHelper.hide).toBeCalledTimes(1);
      expect(backkeyCallback).toBeCalledTimes(1);
      SoftkeyHelper.init.mockReset();
      window.removeEventListener('customDialogEvent', callback);
      done();
    });

    describe('runConfirm/runCancel test', () => {
      beforeEach(done => {
        window.CustomDialog.show(
          title,
          msg,
          cancelAndBack,
          confirm,
          null,
          center,
          true
        );
        done();
      });

      // Test CustomDialog.runConfirm
      test('CustomDialog.runConfirm should run confirm callback', done => {
        window.CustomDialog.runConfirm();
        expect(confirmCallback).toBeCalledTimes(1);
        done();
      });

      // Test CustomDialog.runCancel
      test('CustomDialog.runCancel should run cancel callback', done => {
        window.CustomDialog.runCancel();
        expect(cancelAndBack.callback).toBeCalledTimes(1);
        done();
      });
    });

    // Test CustomDialog.setVersion
    test('CustomDialog.setVersion should set __version', done => {
      window.CustomDialog.setVersion(5);
      expect(window.CustomDialog.__version).toBe(5);
      window.CustomDialog.setVersion(1);
      expect(window.CustomDialog.__version).toBe(1);
      done();
    });

    // Test CustomDialog.hide
    test('CustomDialog.hide should set __version', done => {
      const callback = e => {
        expect(e.detail.visibility).toBeFalsy();
      };
      window.addEventListener('customDialogEvent', callback);
      window.CustomDialog.hide();
      window.removeEventListener('customDialogEvent', callback);
      done();
    });

    afterAll(done => {
      window.SoftkeyPanel = undefined;
      window.SoftkeyHelper = undefined;
      done();
    });
  });
});
