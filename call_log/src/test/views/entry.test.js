import React from 'react';
import { render, cleanup } from '@testing-library/react';
import Main from 'views/main/index';

const keepAlive = () => new Promise((resolve, reject) => {
  setTimeout(() => { resolve() }, 4000);
});

describe('Main index test!', () => {
  test('isSnapshot is true!', (done) => {
    render(<Main isSnapshot />);
    keepAlive().then(() => {
      done();
    })
  });

  test('isSnapshot is false!', (done) => {
    let mainDom = null;
    render(<Main ref={ref => mainDom = ref} isSnapshot={false} />);

    keepAlive().then(() => {
      const event = { event: { detail: { data: null } } };
      window.dispatchEvent(new CustomEvent('showDialDialog', { detail: { data: null } }));
      window.dispatchEvent(new CustomEvent('showDialOptionMenu', { detail: { data: null } }));
      done();
    })
  });
})

afterEach(cleanup);
