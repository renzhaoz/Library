import { expect, fixture, html } from '@open-wc/testing';

import '../../elements/gaia_slider/gaia_slider';

describe('shared webcomponents gaia-slider test', () => {
  it('gaia-slider initial value should be zero/noborder should be false', async () => {
    const el = await fixture(html`
      <gaia-slider></gaia-slider>
    `);
    expect(el.value).to.equal(0);
    expect(el.noborder).to.equal('false');
  });

  it('gaia-slider set value should work', async () => {
    const el = await fixture(html`
      <gaia-slider></gaia-slider>
    `);
    el.value = 75;
    const shadowInput = el.shadowRoot.querySelector('input');
    expect(parseInt(shadowInput.value, 10)).to.equal(75);
  });

  it('gaia-slider setRange should work property', async () => {
    const el = await fixture(html`
      <gaia-slider></gaia-slider>
    `);
    el.setRange(10, 90);
    const shadowInput = el.shadowRoot.querySelector('input');
    expect(parseInt(shadowInput.min, 10)).to.equal(10);
    expect(parseInt(shadowInput.max, 10)).to.equal(90);
  });

  it('gaia-slider events should work property', async () => {
    const el = await fixture(html`
      <gaia-slider></gaia-slider>
    `);
    const eventFired = true;
    const shadowInput = el.shadowRoot.querySelector('input');

    const event = new CustomEvent('change');
    shadowInput.dispatchEvent(event);

    const event1 = new CustomEvent('input');
    shadowInput.dispatchEvent(event1);
    expect(eventFired).to.equal(true);
  });

  it('gaia-slider input min&max should work property', async () => {
    const el = await fixture(html`
      <gaia-slider></gaia-slider>
    `);
    const shadowInput = el.shadowRoot.querySelector('input');
    shadowInput.min = 1;
    shadowInput.max = 110;
    el.value = 75;
    expect(parseInt(shadowInput.value, 10)).to.equal(75);
  });

  it('gaia-slider with transparent property should normally render', async () => {
    const el = await fixture(html`
      <gaia-slider transparent="true"></gaia-slider>
    `);
    const shadowInput = el.shadowRoot.querySelector('input');
    expect(shadowInput.classList.contains('transparent')).to.equal(true);
  });

  it('gaia-slider input should include min class when value is 0', async () => {
    const el = await fixture(html`
      <gaia-slider></gaia-slider>
    `);
    const shadowInput = el.shadowRoot.querySelector('input');
    shadowInput.min = 0;
    shadowInput.max = 110;
    el.value = 0;
    expect(parseInt(shadowInput.value, 10)).to.equal(0);
    expect(shadowInput.classList.contains('min')).to.equal(true);
  });

  it('gaia-slider input should include max class when value is 110', async () => {
    const el = await fixture(html`
      <gaia-slider></gaia-slider>
    `);
    const shadowInput = el.shadowRoot.querySelector('input');
    shadowInput.min = 0;
    shadowInput.max = 110;
    el.value = 110;
    expect(parseInt(shadowInput.value, 10)).to.equal(110);
    expect(shadowInput.classList.contains('max')).to.equal(true);
  });

  it('gaia-slider with data-no-border property should normally render', async () => {
    const el = await fixture(html`
      <gaia-slider data-no-border="true"></gaia-slider>
    `);
    expect(el._noborder).to.equal("true");
    const shadowInput = el.shadowRoot.querySelector('input');
    expect(shadowInput.classList.contains('no-border-radius')).to.equal(true);
  });
});
