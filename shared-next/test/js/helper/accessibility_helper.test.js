/* eslint-disable no-undef, global-require */
describe('helper js <accessbility_helper> test', () => {
  const common = require('../../common');
  const { insertDomToBody } = common;
  beforeAll(done => {
    require('../../../js/helper/accessibility/accessibility_helper');
    done();
  });

  test('setAriaSelected should be function', done => {
    expect(typeof window.AccessibilityHelper.setAriaSelected).toBe('function');
    done();
  });

  test('aria-selected attribute should be add', done => {
    const template = document.createElement('div');
    template.classList.add('tabs');
    for (let i = 0; i < 3; i++) {
      const child = document.createElement('div');
      child.id = `${i}`;
      child.classList.add('tab');
      template.appendChild(child);
    }
    insertDomToBody(document, template);
    const [selectedTab] = document.querySelectorAll('.tab');
    const tabs = document.querySelectorAll('.tab');
    window.AccessibilityHelper.setAriaSelected(selectedTab, tabs);
    tabs.forEach(tab => {
      expect(tab.hasAttribute('aria-selected')).toBe(true);
    });
    done();
  });
});
