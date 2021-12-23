import { getCallIcon } from 'utils/calllog_utils';


const removeAllSIM = () => {
  window.navigator.b2g = {
    iccManager: {
      iccIds: []
    }
  };
};

const insertOneSIM = () => {
  window.navigator.b2g = {
    iccManager: {
      iccIds: ['89886920041603053726']
    }
  };
};

const insertDualSIM = () => {
  window.navigator.b2g = {
    iccManager: {
      iccIds: ['89886920041603053726', '89886920041603053727']
    }
  };
};

describe('obtains regular call icon', () => {
  const incomingCall = {
    callType: 'incoming',
    simNum: '-sim2'
  };

  const outgoingCall = {
    callType: 'outgoing',
    simNum: '-sim1'
  };

  test('no SIM inserted', () => {
    removeAllSIM();
    expect(getCallIcon(incomingCall)).toBe('call-incoming');
    expect(getCallIcon(outgoingCall)).toBe('call-outgoing');
  });

  test('1 SIM inserted', () => {
    insertOneSIM();
    expect(getCallIcon(incomingCall)).toBe('call-incoming');
    expect(getCallIcon(outgoingCall)).toBe('call-outgoing');
  });

  test('2 SIMs inserted', () => {
    insertDualSIM();
    expect(getCallIcon(incomingCall)).toBe('call-incoming-sim2');
    expect(getCallIcon(outgoingCall)).toBe('call-outgoing-sim1');
  });
});

describe('obtains video call icon', () => {
  const incomingVideoCall = {
    callType: 'incoming_videoCall',
    simNum: '-sim2'
  };

  const outgoingVideoCall = {
    callType: 'outgoing_videoCall',
    isVt: true,
    isRtt: false,
    simNum: '-sim1'
  };

  test('no SIM inserted', () => {
    removeAllSIM();
    expect(getCallIcon(incomingVideoCall)).toBe('video-call-incoming');
    expect(getCallIcon(outgoingVideoCall)).toBe('video-call-outgoing');
  });

  test('1 SIM inserted', () => {
    insertOneSIM();
    expect(getCallIcon(incomingVideoCall)).toBe('video-call-incoming');
    expect(getCallIcon(outgoingVideoCall)).toBe('video-call-outgoing');
  });

  test('2 SIMs inserted', () => {
    insertDualSIM();
    expect(getCallIcon(incomingVideoCall)).toBe('video-call-incoming-sim2');
    expect(getCallIcon(outgoingVideoCall)).toBe('video-call-outgoing-sim1');
  });
});
