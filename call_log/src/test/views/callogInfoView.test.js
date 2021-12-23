import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import CalllogInfoView from 'views/calllogInfor/calllog_info_view';

const listProps = {
  calls: [],
  callType: '',
  date: Date.now(),
  emergency: false,
  id: 123,
  itemContact: new Map(),
  number: '119',
  radioTech: '898',
  simNum: 991,
  index: '1',
  checked: false,
  serviceId: 0,
  verStatus: '',
  isWifiLogo: 'true',
  changeView: () => { },
  showDialog: ({ options = {} }) => {
    if (options.onOk) {
      options.onOk()
    }
  }
};

const newListProps = {
  calls: [
    {
      date: 1880187851,
      duration: 0
    }, {
      date: 1880187852,
      duration: 0
    }, {
      date: 1880187853,
      duration: 0
    }, {
      date: 1880187854,
      duration: 0
    }, {
      date: 1880187855,
      duration: 0
    }
  ],
  callType: '',
  date: Date.now(),
  emergency: 'emergency number',
  id: 123,
  itemContact: {
    photoBlob: new Blob(),
    photoType: 'img',
    type: 'non',
    name: 'test'
  },
  number: '119',
  radioTech: 'ps',
  simNum: 0,
  index: '1',
  checked: false,
  serviceId: 0,
  verStatus: '',
  isWifiLogo: 'false',
  changeView: () => { },
  showDialog: ({ options = {} }) => {
    console.log(options);
    if (options.onOk) {
      options.onOk()
    }
    if (options.onCancel) {
      options.onCancel()
    }
  }
};

// mock dom addEventListener
// window.HTMLElement.prototype.addEventListener = () => { };
const { rerender, debug, unmount, queryAllByText } = render(<CalllogInfoView {...listProps} />);

describe('List Info view.', () => {
  const { queryAllByText } = render(<CalllogInfoView {...listProps} />);
  test('Render normal.', () => {
    expect(queryAllByText('119')).toBeTruthy();
  });

  rerender(<CalllogInfoView {...newListProps} />);
  let view = document.getElementById('info-view');
  fireEvent.keyDown(view, { key: 'ArrowUp', code: 'up' });
  let target = queryAllByText('119');
  test('Click up normal.', () => {
    expect(target).toBeTruthy();
  });

  fireEvent.keyDown(view, { key: 'ArrowDown', code: 'down' });
  target = queryAllByText('119');
  test('Click down normal.', () => {
    expect(target).toBeTruthy();
  });

  fireEvent.keyDown(view, { key: 'MicrophoneToggle', code: 'toggle' });
  target = queryAllByText('119');
  test('Click down normal.', () => {
    expect(target).toBeTruthy();
  });

  fireEvent.keyDown(view, { key: 'SoftRight', code: 'block' });
  target = queryAllByText('119');
  test('SoftRight click normal.', () => {
    expect(target).toBeTruthy();
  });

  fireEvent.keyDown(view, { key: 'SoftLeft', code: 'back' });
  target = queryAllByText('119');
  test('SoftLeft click normal.', () => {
    expect(target).toBeTruthy();
  });

  test('unmount normal', () => {
    unmount();
    view = document.getElementById('info-view');
    expect(view).not.toBeTruthy();
  });
});

afterEach(cleanup);
