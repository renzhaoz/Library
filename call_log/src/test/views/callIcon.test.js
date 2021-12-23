import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import CallIcon from 'components/CallIcon';

const defultProps = {
  isWifiLogo: true,
  iconData: '',
  radioTech: 'ps' // 'wifi'
}

describe('CallIcon Component', () => {
  const { debug, getByAltText, getByText, rerender, getByTestId } = render(<CallIcon {...defultProps} />);
  let svg = getByText('ic_lte_badge')
  test('Render ic_lte_badge svg', () => {
    expect(svg).toBeTruthy();
  });

  const wifiProps = {
    isWifiLogo: true,
    iconData: '',
    radioTech: 'wifi'
  }

  rerender(<CallIcon {...wifiProps} />);
  svg = getByText('ic_wifi_badge');
  test('Render ic_wifi_badge svg', () => {
    expect(svg).toBeTruthy();
  });

  const wlanProps = {
    isWifiLogo: false,
    iconData: '',
    radioTech: 'wifi'
  }

  rerender(<CallIcon {...wlanProps} />);
  svg = getByText('ic_wlan_badge');
  test('Render ic_wlan_badge svg', () => {
    expect(svg).toBeTruthy();
  });
});

afterEach(cleanup);
