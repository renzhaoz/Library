const createMockXHR = responseJSON => {
  return {
    open: jest.fn(),
    send: jest.fn(() => {
      return {
        onload: jest.fn(),
        onerror: jest.fn()
      };
    }),
    readyState: 4,
    onreadystatechange: jest.fn(),
    status: 200,
    statusText: '',
    response: jest.fn(() => {})
  };
};

exports.createMockXHR = createMockXHR;
