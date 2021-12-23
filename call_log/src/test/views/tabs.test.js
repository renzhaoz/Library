import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Tabs from 'components/Tab';

const TabProps = {
  tabNames: ['All', 'Missed', 'Dialed', 'Received'],
  selectedIndex: 0
};

document.documentElement.dir = 'ltr';
const { container, rerender, queryByText, findByText, getByText, debug } = render(<Tabs {...TabProps} />);

describe('Tab Component', () => {

  test('Render success', () => {
    expect(getByText('All')).toBeTruthy();
    expect(getByText('Missed')).toBeTruthy();
    expect(getByText('Dialed')).toBeTruthy();
    expect(getByText('Received')).toBeTruthy();
  });

  rerender(<Tabs {...Object.assign(TabProps, { selectedIndex: 3 })} />);
  const value = getByText('Received').getAttribute('aria-selected');
  test('Change select to Dialed', () => {
    expect(value).toEqual('true')
  })

  rerender(<Tabs {...TabProps} />);
  rerender(<Tabs {...Object.assign(TabProps, { selectedIndex: 1 })} />);
  rerender(<Tabs {...Object.assign(TabProps, { selectedIndex: 2 })} />);
  rerender(<Tabs {...Object.assign(TabProps, { selectedIndex: 3 })} />);
  document.documentElement.dir = 'rtl';

  rerender(<Tabs {...Object.assign(TabProps, { selectedIndex: 2 })} />);
  rerender(<Tabs {...Object.assign(TabProps, { selectedIndex: 1 })} />);
  rerender(<Tabs {...Object.assign(TabProps, { selectedIndex: 0 })} />);

  const tabItem = getByText('All').getAttribute('aria-selected');
  test('Change documentElement.dir, Tab change normal.', () => {
    expect(tabItem).toEqual('true');
  })
});

afterEach(cleanup);
