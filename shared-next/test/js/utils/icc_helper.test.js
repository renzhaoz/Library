describe('utils js <icc_helper> test', () => {
  const { mockB2gNavigator } = require('../../mock/b2g_navigator_mock');
  const obj = jest.spyOn(Object, 'defineProperty').mockImplementation(() => {});

  beforeEach(done => {
    const mockIccManager = {
      iccIds: [12333332, 65654433, 98877655],
      getIccById: jest.fn(() => {
        return {
          iccInfo: jest.fn(() => {
            return {
              set apply(cb) {
                cb.call(this);
              },
              isDisplaySpnRequired: true,
              spn: 'CMCC',
              isDisplayNetworkNameRequired: true
            };
          }),
          addEventListener: jest.fn()
        };
      })
    };
    window.navigator.b2g = {};
    mockB2gNavigator(window, 'iccManager', mockIccManager);
    require('../../../js/utils/phone/icc_helper');
    done();
  });

  // 'iccHelper run test
  test('iccHelper run test', done => {
    expect(obj.mock.calls.length).toBe(7);
    expect(obj.mock.calls[0][1]).toBe('IccHelper');
    expect(obj.mock.calls[0][2].configurable).toBeTruthy();
    expect(obj.mock.calls[1][1]).toBe('iccInfo');
    expect(obj.mock.calls[2][1]).toBe('cardState');
    expect(typeof obj.mock.calls[2][2].get).toBe('function');
    expect(obj.mock.calls[3][1]).toBe('oncardstatechange');
    expect(obj.mock.calls[4][1]).toBe('oniccinfochange');
    done();
  });

  afterEach(() => {
    obj.mockRestore();
  });
});
