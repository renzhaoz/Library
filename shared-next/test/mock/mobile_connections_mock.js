const MockMobileConnections = [
  {
    voice: {
      network: { mcc: '232', mnc: 'mnc', shortName: 'kaios' },
      cell: { gsmCellId: 33, gsmLocationAreaCode: 19 },
      connected: true,
      state: 'registered'
    },
    iccId: 'iccId',
    getDeviceIdentities: jest.fn()
  },
  {
    voice: {
      network: {},
      cell: {},
      connected: false,
      state: 'searching'
    },
    iccId: 'iccId',
    getDeviceIdentities: jest.fn()
  }
];

exports.MockMobileConnections = MockMobileConnections;
