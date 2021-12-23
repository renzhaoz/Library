import { expect, fixture, html } from '@open-wc/testing';

import '../../elements/gaia_header/gaia_header';

describe('shared webcomponents gaia-header test', () => {
  it('should render gaia-header correctly', async () => {
    const el = await fixture(html`
      <gaia-header>
        <h1 slot="text">title</h1>
      </gaia-header>
    `);

    expect(
      el.shadowRoot.querySelector('div.inner slot').assignedElements()[0]
        .textContent
    ).to.equal('title');
  });
});
