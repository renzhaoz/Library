describe('utils js <component_utlis> test', () => {
  const { insertDomToBody } = require('../../common');

  beforeEach(done => {
    require('../../../js/utils/components/component_utils');
    done();
  });

  // ComponentUtils test
  test('ComponentUtils should be object', done => {
    expect(typeof ComponentUtils).toBe('object');
    done();
  });

  // ComponentUtils.style test
  test('ComponentUtils.style should be function', done => {
    expect(typeof ComponentUtils.style).toBe('function');
    done();
  });

  // ComponentUtils.style run test
  test('ComponentUtils.style run test', done => {
    const baseUrl = 'assets/';
    const header = document.createElement('header');
    header.id = 'header';
    header.attachShadow({ mode: 'open' });
    insertDomToBody(document, header);
    ComponentUtils.style(baseUrl, header);
    expect(document.querySelector('#header').style.visibility).toBe('hidden');

    const style = document.querySelector('style');
    style.dispatchEvent(new CustomEvent('load'));
    expect(document.querySelector('#header').style.visibility).toBe('');
    done();
  });
});
