/* eslint-disable no-undef, global-require, new-cap */
describe('helper js <navigation_helper> test', () => {
  const { wrap } = require('jest-snapshot-serializer-raw');

  beforeAll(done => {
    require('../../../js/helper/navigation/navigation_helper');
    done();
  });

  test('NavigationHelper, HorizontalNavigator, VerticalNavigator, BoxNavigator, GroupNavigator should be object', done => {
    expect(typeof window.NavigationHelper).toBe('object');
    expect(typeof window.HorizontalNavigator).toBe('object');
    expect(typeof window.NavigationHelper).toBe('object');
    expect(typeof window.BoxNavigator).toBe('object');
    expect(typeof window.GroupNavigator).toBe('object');
    done();
  });

  // Test NavigationHelper.resetMenu
  test('NavigationHelper.resetMenu', done => {
    expect(typeof window.NavigationHelper.resetMenu).toBe('function');
    done();
  });

  // Test NavigationHelper.resetMenu return value 1
  test('NavigationHelper.resetMenu should return', done => {
    const spy = jest.spyOn(window.NavigationHelper, 'reset');
    document.body.innerHTML = `
    <form data-subtype="menu">
      <button id="button" />
    </form>
  `;
    const res = window.NavigationHelper.resetMenu();
    expect(spy).toBeCalledTimes(1);
    expect(res).toBeNull();
    done();
  });

  describe('NavigationHelper.resetMenu return value test', () => {
    let spyReset = null;
    let spyUpdateNav = null;
    let spySetFocus = null;
    beforeEach(done => {
      spyReset = jest.spyOn(window.NavigationHelper, 'reset');
      spyUpdateNav = jest.spyOn(window.NavigationHelper, 'updateNav');
      spySetFocus = jest.spyOn(window.NavigationHelper, 'setFocus');
      done();
    });

    // Test NavigationHelper.resetMenu return value 2
    test('NavigationHelper.resetMenu should return focusElement when child > 1', done => {
      document.body.innerHTML = `
        <form data-subtype="menu" id="mainmenu">
          <button id="submenu_button1" class="menu-button"/>
          <button id="submenu_button2" class="menu-button"/>
          <button id="submenu_button3" class="menu-button"/>
        </form>
      `;
      const ele = window.NavigationHelper.resetMenu();
      expect(spyReset).toBeCalledTimes(3);
      expect(spyUpdateNav).toBeCalledTimes(1);
      expect(spySetFocus).toBeCalledTimes(1);
      expect(wrap(ele)).toMatchSnapshot();
      done();
    });

    // Test NavigationHelper.resetMenu return value 3
    test('NavigationHelper.resetMenu should return focusElement when child = 1', done => {
      document.body.innerHTML = `
        <form data-subtype="menu" id="mainmenu">
          <button id="button" class="menu-button"/>
        </form>
      `;
      const ele = window.NavigationHelper.resetMenu();
      expect(spyReset).toBeCalledTimes(1);
      expect(spyUpdateNav).toBeCalledTimes(1);
      expect(spySetFocus).toBeCalledTimes(1);
      expect(wrap(ele)).toMatchSnapshot();
      done();
    });
  });

  // Test NavigationHelper.scrollToElement
  test('NavigationHelper.scrollToElement', done => {
    expect(typeof window.NavigationHelper.scrollToElement).toBe('function');
    done();
  });

  // Test NavigationHelper.scrollToElement return value
  test('NavigationHelper.scrollToElement return value test', done => {
    const element = document.createElement('div');
    const spyWidth = jest
      .spyOn(element, 'offsetWidth', 'get')
      .mockReturnValue(10);
    const spyHeight = jest
      .spyOn(element, 'offsetHeight', 'get')
      .mockReturnValue(10);
    const spyRects = jest
      .spyOn(element, 'getClientRects')
      .mockReturnValue([{ top: 10, bottom: 10 }]);
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    const event = { key: 'ArrowUp' };
    const top = 20;
    const bottom = 0;
    window.NavigationHelper.scrollToElement(element, event, top, bottom);
    expect(spyWidth).toBeCalledTimes(1);
    expect(spyHeight).toBeCalledTimes(1);
    expect(spyRects).toBeCalledTimes(1);
    expect(window.HTMLElement.prototype.scrollIntoView).toBeCalledTimes(1);
    window.HTMLElement.prototype.scrollIntoView = undefined;
    done();
  });

  // Test NavigationHelper.Key2Dir
  test('NavigationHelper.Key2Dir', done => {
    expect(typeof window.NavigationHelper.Key2Dir).toBe('function');
    done();
  });

  // Test NavigationHelper.Key2Dir return value
  test('NavigationHelper.Key2Dir return value test', done => {
    const left = window.NavigationHelper.Key2Dir('ArrowLeft');
    expect(left).toBe(0);
    const right = window.NavigationHelper.Key2Dir('ArrowRight');
    expect(right).toBe(1);
    const up = window.NavigationHelper.Key2Dir('ArrowUp');
    expect(up).toBe(2);
    const down = window.NavigationHelper.Key2Dir('ArrowDown');
    expect(down).toBe(3);
    const test = window.NavigationHelper.Key2Dir('test');
    expect(test).toBeUndefined();
    done();
  });

  // Test HorizontalNavigator.left, right, up, down
  test('HorizontalNavigator.left, right, up, down should be function', done => {
    expect(typeof window.HorizontalNavigator.left).toBe('function');
    expect(typeof window.HorizontalNavigator.right).toBe('function');
    expect(typeof window.HorizontalNavigator.up).toBe('function');
    expect(typeof window.HorizontalNavigator.down).toBe('function');
    done();
  });

  // Test HorizontalNavigator.left, right, up, down return value
  test('HorizontalNavigator.left, right, up, down return value test', done => {
    const left = window.HorizontalNavigator.left(0);
    expect(left).toBe(-1);
    const right = window.HorizontalNavigator.right(0);
    expect(right).toBe(1);
    const left1 = window.HorizontalNavigator.left(1);
    expect(left1).toBe(0);
    const right1 = window.HorizontalNavigator.right(-1);
    expect(right1).toBe(0);
    const up = window.HorizontalNavigator.up(0);
    expect(up).toBe(0);
    const down = window.HorizontalNavigator.down(0);
    expect(down).toBe(0);
    done();
  });

  // Test BoxNavigator.left, right, up, down
  test('BoxNavigator.left, right, up, down should be function', done => {
    expect(typeof window.BoxNavigator.left).toBe('function');
    expect(typeof window.BoxNavigator.right).toBe('function');
    expect(typeof window.BoxNavigator.up).toBe('function');
    expect(typeof window.BoxNavigator.down).toBe('function');
    done();
  });

  // Test BoxNavigator.left, right, up, down return value
  test('BoxNavigator.left, right, up, down return value test', done => {
    const left = window.BoxNavigator.left(0);
    expect(left).toBe(-1);
    const right = window.BoxNavigator.right(0);
    expect(right).toBe(0);
    const up = window.BoxNavigator.up(0);
    expect(up).toBe(-2);
    const down = window.BoxNavigator.down(0);
    expect(down).toBe(0);
    done();
  });

  // Test GroupNavigator.left, right, up, down
  test('GroupNavigator.left, right, up, down should be function', done => {
    expect(typeof window.GroupNavigator.left).toBe('function');
    expect(typeof window.GroupNavigator.right).toBe('function');
    expect(typeof window.GroupNavigator.up).toBe('function');
    expect(typeof window.GroupNavigator.down).toBe('function');
    done();
  });

  // Test GroupNavigator.left, right, up, down return value
  test('GroupNavigator.left, right, up, down return value test', done => {
    // eslint-disable-next-line no-unused-vars
    GroupNavigator.getGroupInfo = function getGroupInfo(navIndex, isup) {
      return {
        curGroupIndex: 0,
        curGroupLen: 6,
        destGroupLen: 8
      };
    };
    const left = window.GroupNavigator.left(0);
    expect(left).toBe(-1);
    const right = window.GroupNavigator.right(0);
    expect(right).toBe(0);
    const up = window.GroupNavigator.up(0);
    expect(up).toBe(-2);
    const down = window.GroupNavigator.down(0);
    expect(down).toBe(3);
    done();
  });

  afterEach(done => {
    jest.restoreAllMocks();
    done();
  });

  afterAll(done => {
    document.body.innerHTML = '';
    GroupNavigator.getGroupInfo = null;
    done();
  });
});
