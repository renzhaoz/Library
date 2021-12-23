const MockSoftkeyHelper = {
  init: jest.fn(),
  hide: jest.fn(),
  getSoftkey: () => {
    return {
      initSoftKeyPanel: jest.fn(),
      show: jest.fn(),
      hide: jest.fn(),
      stopListener: jest.fn(),
      startListener: jest.fn(),
      getLeftKey: jest.fn()
    }
  },

};

exports.MockSoftkeyHelper = MockSoftkeyHelper;
