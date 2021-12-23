describe('utils js <navigation_handler> test', () => {
  const { insertDomToBody } = require('../../common');

  beforeEach(done => {
    window.LazyLoader = {
      load: (file, cb) => {
        require('../../mock/navigation_map'), cb();
      }
    };
    require('../../../js/utils/navigation/navigation_handler');
    done();
  });

  // Test menuEvent
  test('test menuEvent', done => {
    const event = new window.CustomEvent('menuEvent', {
      detail: {
        menuVisible: true
      }
    });
    window.dispatchEvent(event);
    expect(window.NavigationMap.optionMenuVisible).toBe(true);
    done();
  });

  // Test keydown event, run handleClick function
  test('test keydown event,run handleClick function', done => {
    const div = document.createElement('div');
    div.classList.add('focus');
    div.innerHTML = `
        <menu>
            <button id="btn" class="menu-button focus" click/>
        </menu>`;
    insertDomToBody(document, div);
    const clickCb = jest.fn();
    const keydownCb = jest.fn();
    const btn = document.querySelector('#btn');
    btn.addEventListener('click', clickCb);
    div.addEventListener('keydown', keydownCb);
    div.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    );
    div.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Accept', bubbles: true })
    );
    expect(clickCb.mock.calls.length).toBe(2);
    expect(keydownCb.mock.calls.length).toBe(2);

    btn.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Accept', bubbles: true })
    );
    expect(clickCb.mock.calls.length).toBe(2);
    expect(keydownCb.mock.calls.length).toBe(3);

    btn.removeEventListener('click', clickCb);
    div.removeEventListener('keydown', keydownCb);
    done();
  });

  // Test keydown event, run findElementFromNavProp function
  test('test keydown event,run findElementFromNavProp function', done => {
    const div = document.createElement('div');
    div.innerHTML = `
        <menu>
            <button id="button1" class="menu-button  focus" />
            <button id="button2" class="menu-button  focus"  data-nav-id='2' style="--nav-right:2;--nav-down:2;--nav-up:2;--nav-left:2"/>
        </menu>`;
    document.dir = 'rtl';
    insertDomToBody(document, div);
    const btnCb = jest.fn();
    const divCb = jest.fn();
    const btn = document.querySelector('#button2');
    div.addEventListener('keydown', divCb);
    btn.addEventListener('keydown', btnCb);

    btn.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })
    );
    btn.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        repeat: true,
        bubbles: true
      })
    );
    btn.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowUp',
        repeat: true,
        bubbles: true
      })
    );
    btn.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
    );
    btn.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Center', bubbles: true })
    );
    div.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })
    );
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));

    expect(btnCb.mock.calls.length).toBe(5);
    expect(divCb.mock.calls.length).toBe(6);
    expect(
      document.querySelector('#button1').classList.contains('.focus')
    ).toBeFalsy();

    div.removeEventListener('keydown', divCb);
    btn.removeEventListener('keydown', btnCb);
    done();
  });
});
