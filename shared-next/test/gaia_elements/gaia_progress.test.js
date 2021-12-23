import { expect, fixture, html } from '@open-wc/testing';

import '../../elements/gaia_progress/gaia_progress';

describe('shared webcomponents gaia-progress test', () => {
  it('gaia-progress initial value should be zero', async () => {
    const el = await fixture(html`
      <gaia-progress></gaia-progress>
    `);
    expect(el.value).to.equal(0);
  });

  it('gaia-progress value should be 75', async () => {
    const el = await fixture(html`
      <gaia-progress></gaia-progress>
    `);
    el.value = 75;
    const progress = document.querySelector('gaia-progress');
    expect(progress.value).to.equal(75);
  });
});
