import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import BlockIcon from 'components/BlockIcon';

describe('BlockIcon Component', () => {
  const { debug, getByAltText } = render(<BlockIcon />);
  test('Render normal', () => {
    expect(getByAltText('block')).toBeTruthy();
  });
});

afterEach(cleanup);
