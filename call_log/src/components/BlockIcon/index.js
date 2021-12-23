import React from 'react';

import blockImg from './ic_block.png';
import './index.css';

const BlockIcon = () => {
  return (
    <div className='blockImg'>
      <img
        src={blockImg}
        width={32}
        height={32}
        className='img'
        alt="block"
      />
    </div>
  );
};

export default BlockIcon;
