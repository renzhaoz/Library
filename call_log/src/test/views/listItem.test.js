import React from 'react';
import { render, cleanup } from '@testing-library/react';
import ListItem from 'views/calllogList/calllog_list_item';

const listProps = {
  calls: [],
  callType: 'missed_lte',
  date: 804242521292,
  emergency: false,
  id: '6271995-057156198679-missed_lte-0',
  itemContact: new Map(),
  number: '057156198679',
  radioTech: 'ps',
  simNum: 1,
  index: '1',
  checked: false,
  serviceId: 0,
  verStatus: '',
  isWifiLogo: 'true'
};

describe('list item!', () => {
  it('default render normal!', () => {
    const { getByText } = render(<ListItem {...listProps} />)
    const numberInfo = getByText('057156198679');
    expect(numberInfo).toBeTruthy();
  });

  it('has sdnContacts info！', async () => {
    global.sdnContacts = {
      get: () => ([new Map([['057156198679', 'rush']])])
    };
    const { getByText } = render(<ListItem {...listProps} />);
    const numberInfo = getByText('rush');
    expect(numberInfo).toBeTruthy();
  });

  it('has contacts info！', () => {
    // reset
    global.sdnContacts = {
      get: () => []
    };
    const newProps = Object.assign(
      {},
      listProps,
      {
        itemContact: {
          name: 'big',
          type: 'png',
          photoBlob: 'base64'
        }
      }
    );
    const { getByText } = render(<ListItem {...newProps} />);
    const numberInfo = getByText('big');
    expect(numberInfo).toBeTruthy();
  });

  it('withheld-number', () => {
    const newProps = Object.assign({}, listProps, { number: null });
    const { getByText } = render(<ListItem {...newProps} />);
    const numberInfo = getByText('withheld-number');
    expect(numberInfo).toBeTruthy();
  });

  it('Multiple calls.', () => {
    const newProps = Object.assign(
      {},
      listProps,
      {
        calls: [1, 2],
        verStatus: 'pass',
        emergency: 'drop'
      }
    );
    const { getByText } = render(<ListItem {...newProps} />);
    const numberInfo = getByText('emergencyNumber');
    expect(numberInfo).toBeTruthy();
  });
});

afterEach(cleanup);
