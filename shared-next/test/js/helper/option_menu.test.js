/* eslint-disable no-undef, global-require */
describe('helper js <option_menu> test', () => {
  const { wrap } = require('jest-snapshot-serializer-raw');
  let optionsMenu = null;
  const callback = jest.fn();

  beforeAll(done => {
    require('../../mock/l10n_mock');
    require('../../mock/navigation_map');
    require('../../../js/helper/option_menu/option_menu');
    done();
  });

  // Test OptionMenu
  test('OptionMenu should be function', done => {
    expect(typeof window.OptionMenu).toBe('function');
    done();
  });

  // Test OptionMenu
  test('OptionMenu should be not render', done => {
    optionsMenu = new OptionMenu({});
    expect(typeof optionsMenu).toBe('object');
    done();
  });

  describe('OptionMenu function test', () => {
    let optionsMenu = null;
    beforeEach(done => {
      const options = {
        items: [
          {
            name: 'Lorem ipsum',
            l10nId: 'lorem',
            l10nArgs: 'ipsum',
            method: function method() {
              // Method and params if needed
            },
            params: ['param1', '123123123'],
            priority: 4,
            disable: true
          }
        ],
        section: 'section',
        header: 'header',
        classes: ['containerClass']
      };
      optionsMenu = new OptionMenu(options, callback);
      jest.useFakeTimers();
      optionsMenu.show();
      jest.runAllTimers();
      done();
    });

    afterEach(done => {
      jest.resetAllMocks();
      done();
    });

    // Test OptionMenu
    test('OptionMenu should be renders correctly', done => {
      expect(wrap(optionsMenu.form)).toMatchSnapshot();
      done();
    });

    // Test OptionMenu.show()
    test('OptionMenu should be shows correctly', done => {
      expect(NavigationMap.lockNavigation).toBeTruthy();
      expect(optionsMenu.form.classList.contains('visible')).toBeTruthy();
      expect(document.body.classList.contains('dialog-animating')).toBeTruthy();
      expect(document.body.classList.contains('show-option')).toBeTruthy();
      expect(setTimeout.mock.calls.length).toBe(1);
      expect(document.querySelector('h1').hasAttribute('style')).toBeTruthy();
      expect(callback.mock.calls[0][0]).toBe(true);
      done();
    });

    // Test click eventListener on menu
    test('click eventListener on menu be invokes correctly', done => {
      const clickEvent = new window.CustomEvent('click');
      document.getElementById('mainmenu').dispatchEvent(clickEvent);
      done();
    });

    // Test submit eventListener
    test('submit eventListener be invokes correctly', done => {
      const submitEvent = new window.CustomEvent('submit');
      optionsMenu.form.dispatchEvent(submitEvent);
      done();
    });

    // Test transitionend eventListener
    test('transitionend eventListener be invokes correctly', done => {
      const transitionendEvent = new window.CustomEvent('transitionend');
      optionsMenu.form.dispatchEvent(transitionendEvent);
      expect(NavigationMap.lockNavigation).toBeFalsy();
      expect(document.body.classList.contains('dialog-animating')).toBeFalsy();
      done();
    });

    // Test OptionMenu._setFocus()
    test('_setFocus be invokes correctly', done => {
      optionsMenu._setFocus(optionsMenu.form);
      expect(optionsMenu.form.hasAttribute('tabindex')).toBeTruthy();
      expect(optionsMenu.form.classList.contains('focus')).toBeTruthy();
      done();
    });

    // Test OptionMenu.toggleMainMenu()
    test('toggleMainMenu be invokes correctly', done => {
      const header = document.querySelector('h1');
      const mainmenu = document.querySelector('#mainmenu');
      optionsMenu.toggleMainMenu(true);
      expect(header.classList.contains('hidden')).toBeFalsy();
      expect(mainmenu.classList.contains('hidden')).toBeFalsy();
      optionsMenu.toggleMainMenu(false);
      expect(header.classList.contains('hidden')).toBeTruthy();
      expect(mainmenu.classList.contains('hidden')).toBeTruthy();
      done();
    });

    // Test OptionMenu.hide()
    test('hide be invokes correctly', done => {
      jest.useFakeTimers();
      optionsMenu.hide();
      expect(optionsMenu.form.hasAttribute('aria-hidden')).toBeTruthy();
      expect(optionsMenu.form.classList.contains('visible')).toBeFalsy();
      expect(callback.mock.calls[0][0]).toBe(true);
      expect(callback.mock.calls[1][0]).toBe(false);
      jest.runAllTimers();
      expect(setTimeout.mock.calls.length).toBe(2);
      expect(document.body.classList.contains('show-option')).toBeFalsy();
      const transitionendEvent = new window.CustomEvent('transitionend');
      optionsMenu.form.dispatchEvent(transitionendEvent);
      expect(clearTimeout.mock.calls.length).toBe(1);
      done();
    });
  });
});
