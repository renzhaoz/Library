describe('utils js <navigation_manager> test', () => {
  const { insertDomToBody } = require('../../common');
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const navObject = {
    clickHandler(el) {
      let link;
      if (!el.classlist) {
        return;
      }
      if (el.tagName === 'BODY') {
        return;
      } else if (el.tagName.toLowerCase() == 'button') {
        link = el;
      }
      link = link || el.querySelector('a');
      link = link || el.querySelector('button');
      link = link || el.querySelector('input');
      link = link || el.querySelector('select');
      if (link == null) {
        return;
      }
      link.click();
    }
  };
  window.HTMLElement.prototype.scrollIntoView = jest.fn();

  beforeAll(done => {
    require('../../mock/navigation_map');
    require('../../../js/utils/navigation/navigation_manager');
    done();
  });

  // NavigationManager test
  test('NavigationManager should be object', done => {
    expect(typeof NavigationManager).toBe('object');
    done();
  });

  // Test keyHandler ,(evt.key === 'Enter' || evt.key === 'Accept') --> test click
  test('test keyHandler & click', done => {
    const config = {
      scrollOptions: false,
      clickHandler: navObject.clickHandler
    };
    const keydownCb = jest.fn();
    const clickCb = jest.fn();
    NavigationManager.DEBUG = true;

    NavigationManager.init(config);
    window.addEventListener('keydown', keydownCb);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Accept' }));

    const btn = document.createElement('button');
    btn.classList.add('btn1');
    insertDomToBody(document, btn);
    btn.addEventListener('keydown', clickCb);
    btn.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    );
    btn.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Accept', bubbles: true })
    );

    expect(clickCb.mock.calls.length).toBe(2);
    expect(keydownCb.mock.calls.length).toBe(4);

    NavigationManager.init();
    btn.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    );
    expect(clickCb.mock.calls.length).toBe(3);

    window.removeEventListener('keydown', keydownCb);
    btn.removeEventListener('keydown', clickCb);
    done();
  });

  // Test keyHandler ,(evt.key === 'ArrowLeft' /'ArrowRight'/'ArrowDown'...) --> test findElementFromNavProp
  test('test keyHandler & findElementFromNavProp', done => {
    const cb1 = jest.fn();
    const cb2 = jest.fn();
    const cb3 = jest.fn();
    const cb4 = jest.fn();
    const cb5 = jest.fn();
    NavigationManager.DEBUG = true;
    NavigationManager.init();

    window.addEventListener('keydown', cb1);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));

    const div = document.createElement('div');
    div.innerHTML = `
            <input id="input1" class="focus" data-nav-id='2' style="--nav-right:2;--nav-down:2;--nav-up:2;--nav-left:2" click/>
            <div id="div2"  class="focus" data-nav-id='3' style="--nav-right:3;--nav-down:3;--nav-up:3;--nav-left:3" click/><input type="text" data-nav-id='4'/></div>
            <button id="btn" class="focus" data-nav-id='1' style="--nav-right:1;--nav-down:1;--nav-up:1;--nav-left:1" click/>
        `;
    insertDomToBody(document, div);

    div.addEventListener('keydown', cb2);
    div.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })
    );

    const input1 = document.querySelector('#input1');
    input1.addEventListener('keydown', cb3);
    input1.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
    );
    input1.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Alt', bubbles: true })
    );

    const div2 = document.querySelector('#div2');
    div2.addEventListener('keydown', cb4);
    div2.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
    );

    const btn = document.querySelector('#btn');
    btn.addEventListener('keydown', cb5);
    btn.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })
    );
    btn.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Home', bubbles: true })
    );

    expect(cb1.mock.calls.length).toBe(7);
    expect(cb2.mock.calls.length).toBe(6);
    expect(cb3.mock.calls.length).toBe(2);
    expect(cb4.mock.calls.length).toBe(1);
    expect(cb5.mock.calls.length).toBe(2);

    window.removeEventListener('keydown', cb1);
    div.removeEventListener('keydown', cb2);
    input1.removeEventListener('keydown', cb3);
    div2.removeEventListener('keydown', cb4);
    btn.removeEventListener('keydown', cb5);
    done();
  });

  // Test delNavId
  test('test delNavId', done => {
    NavigationManager.delNavId('header');
    const id1 = document
      .querySelector('input[type="text"]')
      .getAttribute('data-nav-id');
    expect(Number(id1)).toEqual(4);

    NavigationManager.delNavId('input[type="text"]');
    const id2 = document
      .querySelector('input[type="text"]')
      .getAttribute('data-nav-id');
    expect(id2).toBeNull();
    done();
  });

  // Test initNavId
  test('test initNavId', done => {
    const list = [];
    for (let i = 0; i < 3; i++) {
      const li = document.createElement('li');
      li.id = `li${i}`;
      list.push(li);
      insertDomToBody(document, li);
    }
    NavigationManager.initNavId(list);
    const li1 = document.querySelector('#li1');

    expect(li1.getAttribute('data-nav-id')).toBe('1');
    done();
  });

  // Test prepareElements
  test('test prepareElements', done => {
    expect(() => {
      NavigationManager.prepareElements();
    }).toThrowError('selector is undefined');

    const value = NavigationManager.prepareElements('div');
    expect(value.length).toBe(2);
    done();
  });

  // Test reset & setFocus & update
  test('Test reset & setFocus & update', done => {
    NavigationManager.reset('div', '3');
    NavigationManager.reset('div', '3', 'horizontal');
    expect(
      document.querySelector('div').classList.contains('focus')
    ).toBeTruthy();
    done();
  });

  // Test resetByNode & setFocus & update
  test('Test resetByNode & setFocus & update', done => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const node = document.createElement('span');
    const a = document.createElement('a');
    insertDomToBody(document, a);

    NavigationManager.resetByNode('div', node);
    NavigationManager.resetByNode('a');
    NavigationManager.resetByNode('h1');

    expect(errSpy).toBeCalledTimes(1);
    expect(
      document.querySelector('a').classList.contains('focus')
    ).toBeTruthy();
    errSpy.mockRestore();
    done();
  });

  // Test getElementByNavId
  test('Test getElementByNavId', done => {
    const value = NavigationManager.getElementByNavId('0');
    expect(value.nodeType).toBe(1);
    done();
  });

  // Test switchContext
  test('Test switchContext', done => {
    NavigationManager.switchContext('a');
    expect(() => {
      NavigationManager.switchContext();
    }).toThrowError('selector is undefined');
    done();
  });

  // Test _linkToUp & _linkToDown & _linkToLeft & _linkToRight
  test('Test _linkToUp & _linkToDown & _linkToLeft & _linkToRight', done => {
    const header = document.createElement('header');
    insertDomToBody(document, header);
    const to = document.querySelector('#div2');

    NavigationManager._linkToUp(header, to);
    NavigationManager._linkToDown(header, to);
    NavigationManager._linkToLeft(header, to);
    NavigationManager._linkToRight(header, to);

    expect(header.style.getPropertyValue('--nav-up')).toBe('3');
    expect(header.style.getPropertyValue('--nav-down')).toBe('3');
    expect(header.style.getPropertyValue('--nav-left')).toBe('3');
    expect(header.style.getPropertyValue('--nav-right')).toBe('3');
    done();
  });

  // Test appendToList
  test('Test appendToList', done => {
    const listContainer = document.createElement('ul');
    insertDomToBody(document, listContainer);
    const items = document.querySelectorAll('li');
    NavigationManager.appendToList(listContainer, items);
    NavigationManager.appendToList(listContainer, items, 'horizontal');
    expect(listContainer.children.length).toBe(3);
    done();
  });

  // Test getFocusedEl
  test('Test getFocusedEl', done => {
    const value = NavigationManager.getFocusedEl();
    expect(value.nodeType).toBe(1);
    done();
  });

  // Test unfocus
  test('Test unfocus', done => {
    NavigationManager.unfocus();
    expect(document.querySelectorAll('.focus').length).toBe(0);
    done();
  });

  afterAll(done => {
    logSpy.mockRestore();
    done();
  });
});
