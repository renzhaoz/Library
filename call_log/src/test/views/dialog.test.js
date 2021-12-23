import React from 'react';
import { render, cleanup, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Dialog from 'components/Dialog';

const dialogProps = {
  openDialog: true, // open dialog
  dialogParams: {
    header: 'confirmation',
    content: 'no-recent-numbers',
    type: 'alert',
    noClose: false,
    translated: false
  },
  showDialog: () => { }
};

const newDialogProps = {
  openDialog: false, // close dialog
  dialogParams: {
    header: 'confirmation',
    content: 'no-recent-numbers',
    type: 'alert',
    noClose: false,
    translated: false
  },
  showDialog: () => { }
};

describe('Dialog Component', () => {
  const { rerender } = render(<Dialog {...dialogProps} />);
  const dialogContent = document.getElementById('dialog-header-0');
  test('Dialog render success', () => {
    expect(dialogContent).toBeTruthy();
  });

  rerender(<Dialog {...newDialogProps} />);

  test('Dialog auto close success', () => {
    expect(document.getElementById('dialog-header-0')).not.toBeTruthy();
  });

  rerender(<Dialog {...dialogProps} />);
  let dialogDom = document.querySelector('.dialog-container');
  fireEvent.keyDown(dialogDom, { key: 'SoftLeft', code: 'cancel' });

  test('Dialog click SoftLeft Dialog closed', () => {
    expect(document.getElementById('dialog-header-0')).not.toBeTruthy();
  });

  rerender(<Dialog {...dialogProps} />);
  dialogDom = document.querySelector('.dialog-container');
  fireEvent.keyDown(dialogDom, { key: 'SoftRight', code: 'ok' });
  test('Dialog click OK, Dialog closed', () => {
    expect(document.getElementById('dialog-header-0')).not.toBeTruthy();
  });

  rerender(<Dialog {...dialogProps} />);
  dialogDom = document.querySelector('.dialog-container');
  fireEvent.keyDown(dialogDom, { key: 'Backspace', code: 'back' });
  test('Dialog click Backspace, Dialog closed', () => {
    expect(document.getElementById('dialog-header-0')).not.toBeTruthy();
  });
});

afterEach(cleanup);
