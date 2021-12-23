import React from 'react';
import { render, cleanup, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import OptionMenu from 'components/OptionMenu';

const defaultOptionMenuProps = {
  openOptionMenu: false,
  optionMenuParams: {
    options: {
      header: 'header',
      options: [],
      onCancel: () => { }
    }
  },
  showOptionMenu: () => { }
};

const newOptionMenuProps = {
  openOptionMenu: true,
  optionMenuParams: {
    header: 'header',
    options: [
      {
        id: 'callLog',
        callback: () => { },
        debounce: 10
      },
      {
        id: 'callLog1',
        callback: () => { },
        debounce: 10
      }
    ],
    onCancel: () => { }
  },
  showOptionMenu: () => { }
};

const { rerender, getByRole } = render(<OptionMenu {...defaultOptionMenuProps} />);
window.HTMLElement.prototype.scrollIntoView = () => { };

describe('OptionMenu Component', () => {

  // default render
  rerender(<OptionMenu {...newOptionMenuProps} />);
  test('OptionMenu worker success', () => {
    // open Option Menu
    expect(getByRole('heading')).toBeTruthy();
  });

  // keydown select
  fireEvent.keyDown(getByRole('heading'), { key: 'Enter', code: 'select' });
  let dom = getByRole('heading').getAttribute('class').includes('hidden');
  test('OptionMenu click ok normal.', () => {
    expect(dom).toBeTruthy();
  });

  // keydown close OptionMenu
  rerender(<OptionMenu {...newOptionMenuProps} />);
  fireEvent.keyDown(getByRole('heading'), { key: 'Backspace', code: 'cancel' });
  dom = getByRole('heading').getAttribute('class').includes('hidden');
  test('OptionMenu click cancel normal.', () => {
    expect(dom).toBeTruthy();
  });
});

afterEach(cleanup);
