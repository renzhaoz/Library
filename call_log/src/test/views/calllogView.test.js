import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import CallogView from 'views/calllogList/calllog_view';

const defaultProps = {
  isSnapshot: false,
  logsStore: new Map([
    ['131970-911-outgoing_lte-0', {
      callType: 'outgoing_lte',
      date: 234264058,
      direction: 'outgoing',
      duration: 0,
      emergency: true,
      groupKey: '1/3/1970',
      hangUpLocal: true,
      id: '131970-911-outgoing_lte-0',
      isRtt: false,
      isVt: false,
      number: '911',
      radioTech: 'ps',
      serviceId: 0,
      verStatus: 'none'
    }],
    ['131970-9111-outgoing_lte-0', {
      callType: 'outgoing_lte',
      date: 234264058,
      direction: 'outgoing',
      duration: 0,
      emergency: false,
      groupKey: '3/3/1970',
      hangUpLocal: true,
      id: '131970-9111-outgoing_lte-0',
      isRtt: false,
      isVt: false,
      number: '9111',
      radioTech: 'ps',
      serviceId: 0,
      verStatus: 'none'
    }],
    ['131970-111-outgoing_lte-0', {
      callType: 'outgoing_lte',
      date: 232264058,
      direction: 'outgoing',
      duration: 0,
      emergency: false,
      groupKey: '3/5/1970',
      hangUpLocal: true,
      id: '131970-111-outgoing_lte-0',
      isRtt: false,
      isVt: false,
      number: '111',
      radioTech: 'ps',
      serviceId: 0,
      verStatus: 'none'
    }],
    ['131970-222-outgoing_lte-0', {
      callType: 'outgoing_lte',
      date: 232265058,
      direction: 'outgoing',
      duration: 0,
      emergency: false,
      groupKey: '3/6/1970',
      hangUpLocal: true,
      id: '131970-222-outgoing_lte-0',
      isRtt: false,
      isVt: false,
      number: '222',
      radioTech: 'ps',
      serviceId: 0,
      verStatus: 'none'
    }],
  ]),
  contactsStore: new Map([
    ['131970-9111-outgoing_lte-0', {
      id: '131970-9111-outgoing_lte-0',
      name: 'test',
      number: 9111,
      type: '',
      photoBlob: new ArrayBuffer(),
      photoType: 'jpeg'
    }]
  ]),
  openOptionMenu: () => { },
  showOptionMenu: () => { },
  deleteLogs: () => { },
  changeView: () => { },
  showDialog: () => { },
  openDialog: () => { }
}

const keepAlive = () => new Promise((resolve, reject) => {
  setTimeout(() => { resolve() }, 7000);
});

describe('call log list view snopshot', () => {
  test('default render worker normal!', () => {
    const snapshotContent = document.createElement('div');
    snapshotContent.id = 'snapshot';
    document.body.appendChild(snapshotContent);
    const { debug, getAllByText } = render(<CallogView {...defaultProps} />);
    const focusDom = document.getElementById('calllog-view');

    // MicrophoneToggle nothing to do
    fireEvent.keyDown(focusDom, { key: 'MicrophoneToggle', code: 'MicrophoneToggle' });
    expect(getAllByText('222')).toBeTruthy();

    // Switch to the last
    fireEvent.keyDown(focusDom, { key: 'ArrowUp', code: 'ArrowUp' });
    expect(getAllByText('222')).toBeTruthy();

    // Switch to the first
    fireEvent.keyDown(focusDom, { key: 'ArrowDown', code: 'ArrowDown' });
    expect(getAllByText('emergencyNumber')).toBeTruthy();

    // Switch to the second
    fireEvent.keyDown(focusDom, { key: 'ArrowDown', code: 'ArrowDown' });
    expect(getAllByText('emergencyNumber')).toBeTruthy();

    // switch tab to left
    fireEvent.keyDown(focusDom, { key: 'ArrowLeft', code: 'ArrowLeft' });
    expect(getAllByText('emergencyNumber')).toBeTruthy();

    // switch tab to right missed
    fireEvent.keyDown(focusDom, { key: 'ArrowRight', code: 'ArrowRight' });
    expect(getAllByText('no-logs-msg-1')).toBeTruthy();

    // show options
    fireEvent.keyDown(focusDom, { key: 'ArrowLeft', code: 'ArrowLeft' });
    fireEvent.keyDown(focusDom, { key: 'SoftRight', code: 'SoftRight' });
    expect(getAllByText('111')).toBeTruthy();

    // call
    fireEvent.keyDown(focusDom, { key: 'Enter', code: 'Enter' });
    expect(getAllByText('111')).toBeTruthy();

    // launcher contact
    fireEvent.keyDown(focusDom, { key: 'SoftLeft', code: 'SoftLeft' });
    expect(getAllByText('111')).toBeTruthy();
  });

  test('isSnapshot is true!', () => {
    const { debug, getAllByText } = render(<CallogView isSnapshot='true' {...defaultProps} />);
    expect(getAllByText('222')).toBeTruthy();
  });

  test('pick entry view, work normal!', () => {
    window.location.hash = 'pick';
    window.close = () => { };
    const { debug, getAllByText } = render(<CallogView {...defaultProps} />);
    const focusDom = document.getElementById('calllog-view');

    // switch to next
    fireEvent.keyDown(focusDom, { key: 'ArrowDown', code: 'ArrowDown' });
    expect(getAllByText('emergencyNumber')).toBeTruthy();

    // select
    fireEvent.keyDown(focusDom, { key: 'Enter', code: 'Enter' });
    expect(getAllByText('222')).toBeTruthy();

    // cancel
    fireEvent.keyDown(focusDom, { key: 'Backspace', code: 'Backspace' });
    expect(getAllByText('111')).toBeTruthy();

    // reset
    window.location.hash = '';
  });

  test('ltr or rtl', () => {
    document.documentElement.dir = 'rtl';
    const { debug, getAllByText } = render(<CallogView {...defaultProps} />);
    const focusDom = document.getElementById('calllog-view');

    // switch tab to right
    fireEvent.keyDown(focusDom, { key: 'ArrowRight', code: 'ArrowRight' });
    expect(getAllByText('222')).toBeTruthy();

    fireEvent.keyDown(focusDom, { key: 'ArrowLeft', code: 'ArrowLeft' });
    expect(getAllByText('no-logs-msg-1')).toBeTruthy();

    // reset
    document.documentElement.dir = 'ltr';
  });

  test('dom event & static methods work normal.', async (done) => {
    let ReactInstance = null;
    const { getAllByText, getByIcon, debug } = render(<CallogView ref={ref => { ReactInstance = ref }} {...defaultProps} />);
    const focusDom = document.getElementById('calllog-view');

    // timeChange
    window.dispatchEvent(new CustomEvent('timeChange', {}));
    expect(getAllByText('222')).toBeTruthy();

    // time format change
    window.dispatchEvent(new CustomEvent('timeformatchange', {}));
    expect(getAllByText('222')).toBeTruthy();

    // entry delete view
    ReactInstance.setEditMode();
    expect(getAllByText('checkedCount')).toBeTruthy();

    // delete view switch item
    fireEvent.keyDown(focusDom, { key: 'ArrowDown', code: 'ArrowDown' });
    expect(getAllByText('222')).toBeTruthy();

    // delete view switch tab to next
    fireEvent.keyDown(focusDom, { key: 'ArrowRight', code: 'ArrowRight' });
    expect(getAllByText('no-logs-msg-1')).toBeTruthy();

    // delete view select
    fireEvent.keyDown(focusDom, { key: 'ArrowLeft', code: 'ArrowLeft' });
    fireEvent.keyDown(focusDom, { key: 'Enter', code: 'Enter' });
    fireEvent.keyDown(focusDom, { key: 'SoftLeft', code: 'SoftLeft' });
    expect(document.querySelector('[data-icon="check-on"]')).toBeTruthy();

    // show confirm dialog
    fireEvent.keyDown(focusDom, { key: 'SoftRight', code: 'SoftRight' });
    expect(document.querySelector('[data-icon="check-on"]')).toBeTruthy();

    // delete select log
    ReactInstance._doDeletion();

    // back main view
    fireEvent.keyDown(focusDom, { key: 'Backspace', code: 'Backspace' });
    expect(getAllByText('no-logs-msg-1')).toBeTruthy();

    keepAlive().then(() => {
      done();
    })
  }, 8000);

});

afterEach(cleanup);
