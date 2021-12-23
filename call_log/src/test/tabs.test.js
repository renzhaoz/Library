import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

import Tabs from 'components/Tab/index';

it('renders Tabs without crashing', () => {
  const div = document.createElement('div');
  const tabNames = ['All', 'Missed', 'Dialed', 'Received'];
  render(<Tabs tabNames={tabNames} selectedIndex={0} />, div);
  unmountComponentAtNode(div);
});
