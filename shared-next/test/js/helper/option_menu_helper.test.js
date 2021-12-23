/* eslint-disable no-undef, global-require */
describe('helper js <option_menu_helper> test', () => {
  const { MockSoftkeyPanel } = require('../../mock/softkeyPanel_mock');
  window.SoftkeyPanel = MockSoftkeyPanel;
  let spy = null;

  beforeAll(done => {
    require('../../../js/helper/option_menu/option_menu_helper');
    done();
  });

  beforeEach(done => {
    // eslint-disable-next-line no-empty-function
    spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    done();
  });

  // Test OptionHelper
  test('OptionHelper should be object', done => {
    expect(typeof window.OptionHelper).toBe('object');
    done();
  });

  // Test OptionHelper._initSoftKeyPanel
  test('OptionHelper._initSoftKeyPanel should be function', done => {
    expect(typeof window.OptionHelper._initSoftKeyPanel).toBe('function');
    done();
  });

  describe('OptionHelper._initSoftKeyPanel', () => {
    beforeEach(done => {
      window.OptionHelper._initSoftKeyPanel();
      done();
    });

    afterEach(done => {
      jest.resetAllMocks();
      done();
    });

    // Test OptionHelper._initSoftKeyPanel return value 1
    test('OptionHelper._initSoftKeyPanel should invoke SoftkeyPanel constructor and show', done => {
      expect(MockSoftkeyPanel).toBeCalledTimes(1);
      expect(window.OptionHelper.softkeyPanel.show).toBeCalledTimes(1);
      expect(spy).toBeCalledTimes(1);
      done();
    });

    // Test OptionHelper._initSoftKeyPanel return value 2
    test('OptionHelper._initSoftKeyPanel should invoke softkeyPanel.initSoftKeyPanel', done => {
      jest.resetAllMocks();
      window.OptionHelper._initSoftKeyPanel();
      expect(MockSoftkeyPanel.prototype.initSoftKeyPanel).toBeCalledTimes(1);
      done();
    });
  });

  describe('OptionHelper function test', () => {
    const { MockSoftkeyHelper } = require('../../mock/softkeyHelper_mock');
    beforeEach(done => {
      window.SoftkeyHelper = MockSoftkeyHelper;
      window.OptionHelper.softkeyPanel = undefined;
      window.OptionHelper._initSoftKeyPanel();
      done();
    });

    afterEach(done => {
      jest.resetAllMocks();
      done();
    });

    // Test OptionHelper._initSoftKeyPanel return value 3
    test('OptionHelper._initSoftKeyPanel should invoke SoftkeyHelper.getSoftkey', done => {
      expect(MockSoftkeyHelper.init).toBeCalledTimes(1);
      expect(window.OptionHelper.softkeyPanel.show).toBeCalledTimes(1);
      expect(spy).toBeCalledTimes(1);
      done();
    });

    // Test OptionHelper.show return value 1
    test('OptionHelper.show not found param', done => {
      jest.resetAllMocks();
      window.OptionHelper.show('test');
      expect(window.OptionHelper.softkeyPanel.show).toBeCalledTimes(1);
      expect(spy).toBeCalledTimes(2);
      done();
    });

    // Test OptionHelper.show return value 2
    test('OptionHelper.show should catch window.api is undefined', done => {
      jest.resetAllMocks();
      window.OptionHelper.optionParams.test = {};
      window.OptionHelper.show('test');
      expect(window.OptionHelper.softkeyPanel.show).toBeCalledTimes(1);
      expect(spy).toBeCalledTimes(2);
      window.OptionHelper.optionParams = Object.create(null);
      done();
    });

    // Test OptionHelper.hideMenu
    test('OptionHelper.hideMenu should invoke softkeyPanel.hide/softkeyPanel.stopListener', done => {
      window.OptionHelper.hideMenu();
      expect(window.OptionHelper.softkeyPanel.hide).toBeCalledTimes(1);
      expect(window.OptionHelper.softkeyPanel.stopListener).toBeCalledTimes(1);
      done();
    });

    // Test OptionHelper.showMenu
    test('OptionHelper.hideMenu should invoke softkeyPanel.show/softkeyPanel.startListener', done => {
      window.OptionHelper.softkeyPanel.show.mockClear();
      window.OptionHelper.showMenu();
      expect(window.OptionHelper.softkeyPanel.show).toBeCalledTimes(1);
      expect(window.OptionHelper.softkeyPanel.startListener).toBeCalledTimes(1);
      done();
    });

    describe('saveContext/ test', () => {
      const dom = document.createElement('button');
      beforeEach(done => {
        dom.classList.add('hide');
        window.OptionHelper.softkeyPanel.getLeftKey.mockReturnValue(dom);
        window.OptionHelper.saveContext();
        done();
      });

      // Test OptionHelper.saveContext
      test('OptionHelper.saveContext should remove hide', done => {
        expect(dom.classList.contains('hide')).toBeFalsy();
        window.OptionHelper.softkeyPanel.getLeftKey.mockReset();
        done();
      });

      // Test OptionHelper.returnContext return value
      test('OptionHelper.returnContext should add hide', done => {
        jest.resetAllMocks();
        const dom = document.createElement('button');
        window.OptionHelper.softkeyPanel.getLeftKey.mockReturnValue(dom);
        window.OptionHelper.returnContext();
        expect(window.OptionHelper.softkeyPanel.getLeftKey).toBeCalledTimes(1);
        expect(dom.classList.contains('hide')).toBeTruthy();
        window.OptionHelper.softkeyPanel.getLeftKey.mockReset();
        done();
      });
    });

    // Test OptionHelper.getLeftKey
    test('OptionHelper.getLeftKey should invoke softkeyPanel.getLeftKey', done => {
      window.OptionHelper.getLeftKey();
      expect(window.OptionHelper.softkeyPanel.getLeftKey).toBeCalledTimes(1);
      window.OptionHelper.softkeyPanel.getLeftKey.mockReset();
      done();
    });

    // Test OptionHelper.isAvailable
    test('OptionHelper.isAvailable should return false', done => {
      const obj = window.OptionHelper.isAvailable();
      expect(obj).toBeFalsy();
      done();
    });

    // Test OptionHelper.changeBtnState
    test('OptionHelper.changeBtnState should return false', done => {
      const obj = window.OptionHelper.changeBtnState();
      expect(obj).toBeFalsy();
      done();
    });
  });

  // Test OptionHelper.show
  test('OptionHelper.show should be function', done => {
    expect(typeof window.OptionHelper.show).toBe('function');
    done();
  });

  // Test OptionHelper.swapParams
  test('OptionHelper.swapParams should be function', done => {
    expect(typeof window.OptionHelper.swapParams).toBe('function');
    done();
  });

  // Test OptionHelper.swapParams return value
  test('OptionHelper.swapParams should swap item', done => {
    window.OptionHelper.optionParams.test = {
      items: [
        { name: 'oldTest', priority: 2 },
        { name: 'oldTest', priority: 1 }
      ],
      hidenItems: []
    };

    expect(window.OptionHelper.optionParams.test).toEqual({
      items: [
        { name: 'oldTest', priority: 2 },
        { name: 'oldTest', priority: 1 }
      ],
      hidenItems: []
    });
    window.OptionHelper.swapParams('test', 'oldTest', 'newName', true);

    expect(
      window.OptionHelper.optionParams.test.hidenItems.length
    ).toBeGreaterThan(0);
    expect(window.OptionHelper.optionParams.test).toEqual({
      items: [{ name: 'oldTest', priority: 1 }, undefined],
      hidenItems: [{ name: 'oldTest', priority: 2 }]
    });
    expect(spy).toBeCalledTimes(2);
    done();
  });

  // Test OptionHelper.showParams
  test('OptionHelper.showParams should be function', done => {
    expect(typeof window.OptionHelper.showParams).toBe('function');
    done();
  });

  // Test OptionHelper.showParams return value
  test('OptionHelper.showParams should change optionParams', done => {
    window.OptionHelper.optionParams.test = {
      items: [{ name: 'oldTest', priority: 1 }, undefined],
      hidenItems: [{ name: 'oldTest', priority: 2 }]
    };
    expect(window.OptionHelper.optionParams.test).toEqual({
      items: [{ name: 'oldTest', priority: 1 }, undefined],
      hidenItems: [{ name: 'oldTest', priority: 2 }]
    });
    window.OptionHelper.showParams('test', 'oldTest', true);
    expect(window.OptionHelper.optionParams.test).toEqual({
      items: [
        { name: 'oldTest', priority: 1 },
        { name: 'oldTest', priority: 2 },
        undefined
      ],
      hidenItems: []
    });
    done();
  });

  // Test OptionHelper.hideParams
  test('OptionHelper.hideParams should be function', done => {
    expect(typeof window.OptionHelper.hideParams).toBe('function');
    done();
  });

  // Test OptionHelper.hideParams return value
  test('OptionHelper.hideParams should change optionParams', done => {
    window.OptionHelper.optionParams.test = {
      items: [
        { name: 'oldTest', priority: 1 },
        { name: 'oldTest', priority: 2 }
      ],
      hidenItems: []
    };
    expect(window.OptionHelper.optionParams.test).toEqual({
      items: [
        { name: 'oldTest', priority: 1 },
        { name: 'oldTest', priority: 2 }
      ],
      hidenItems: []
    });
    window.OptionHelper.hideParams('test', 'oldTest', true);
    expect(window.OptionHelper.optionParams.test).toEqual({
      items: [{ name: 'oldTest', priority: 2 }],
      hidenItems: [{ name: 'oldTest', priority: 1 }]
    });
    done();
  });

  // Test OptionHelper.hideMenu
  test('OptionHelper.hideMenu should be function', done => {
    expect(typeof window.OptionHelper.hideMenu).toBe('function');
    done();
  });

  // Test OptionHelper.showMenu
  test('OptionHelper.showMenu should be function', done => {
    expect(typeof window.OptionHelper.showMenu).toBe('function');
    done();
  });

  // Test OptionHelper.saveContext
  test('OptionHelper.saveContext should be function', done => {
    expect(typeof window.OptionHelper.saveContext).toBe('function');
    done();
  });

  // Test OptionHelper.returnContext
  test('OptionHelper.returnContext should be function', done => {
    expect(typeof window.OptionHelper.returnContext).toBe('function');
    done();
  });

  // Test OptionHelper.getLeftKey
  test('OptionHelper.getLeftKey should be function', done => {
    expect(typeof window.OptionHelper.getLeftKey).toBe('function');
    done();
  });

  // Test OptionHelper.setLast
  test('OptionHelper.setLast should be function', done => {
    expect(typeof window.OptionHelper.setLast).toBe('function');
    done();
  });

  // Test OptionHelper.setLast
  test('OptionHelper.getLeftKey should set buttonState._cacheParams', done => {
    window.OptionHelper.setLast('test');
    done();
  });

  // Test OptionHelper.isAvailable
  test('OptionHelper.isAvailable should be function', done => {
    expect(typeof window.OptionHelper.isAvailable).toBe('function');
    done();
  });

  // Test OptionHelper.changeBtnState
  test('OptionHelper.changeBtnState should be function', done => {
    expect(typeof window.OptionHelper.changeBtnState).toBe('function');
    done();
  });

  // Test OptionHelper.doShowBtn
  test('OptionHelper.doShowBtn should be function', done => {
    expect(typeof window.OptionHelper.doShowBtn).toBe('function');
    done();
  });

  // Test OptionHelper.doShowBtn
  test('OptionHelper.doShowBtn should remove hide', done => {
    const button = document.createElement('button');
    button.classList.add('hide');
    window.OptionHelper.doShowBtn(button);
    expect(button.classList.contains('hide')).toBeFalsy();
    done();
  });

  // Test OptionHelper.doHideBtn
  test('OptionHelper.doHideBtn should be function', done => {
    expect(typeof window.OptionHelper.doHideBtn).toBe('function');
    done();
  });

  // Test OptionHelper.doHideBtn
  test('OptionHelper.doHideBtn should add hide', done => {
    const button = document.createElement('button');
    window.OptionHelper.doHideBtn(button);
    expect(button.classList.contains('hide')).toBeTruthy();
    done();
  });

  afterEach(done => {
    jest.restoreAllMocks();
    done();
  });
});
