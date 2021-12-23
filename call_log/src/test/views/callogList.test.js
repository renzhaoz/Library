import React from 'react';
import { render } from '@testing-library/react';
import CalllogList from 'views/calllogList/calllog_list';

const logItems = {
  callType: 'outgoing_lte',
  calls: [],
  date: 448864340,
  direction: 'outgoing',
  duration: 0,
  emergency: false,
  groupKey: '1/6/1970',
  hangUpLocal: true,
  id: '161970-7797976479-outgoing_lte-0',
  isRtt: false,
  isVt: false,
  number: '7797976479',
  radioTech: 'ps',
  serviceId: 0,
  verStatus: 'none'
};

const listProps = {
  reRenderView: false,
  callType: 'missed',
  logItems: new Map([[logItems.id, logItems]]),
  focusItem: 0,
  itemContacts: new Map(),
  changeView: () => { },
  showOptionMenu: ({ options = [] }) => {
    options.forEach(item => {
      item.callback && item.callback();
    });
  },
  itemId: -1,
  timestamp: 0
}

describe('list container test!', () => {
  test('render normal!', () => {
    let callListDom = null;
    const { debug, getByText } = render(<CalllogList ref={ref => callListDom = ref} {...listProps} />);
    expect(getByText('7797976479')).toBeTruthy();

    // show options menu method work normal
    const selectIndex = 0;
    callListDom.showOptionMenu(logItems.id, listProps.focusItem, selectIndex);
    expect(getByText('7797976479')).toBeTruthy();
  });
});
