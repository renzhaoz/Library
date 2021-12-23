import React from 'react';

import Badge from './Badge';

const CallIcon = ({ isWifiLogo, iconData, radioTech }) => {
  const style = {
    display: 'flex',
    flexDirection: 'column',
    flexShrink: '0',
    alignItems: 'center'
  };

  return (
    <div style={style}>
      <i className="icon" data-icon={iconData} role="presentation" />
      <Badge isWifiLogo={isWifiLogo} radioTech={radioTech} />
    </div>
  );
};

export default CallIcon;
