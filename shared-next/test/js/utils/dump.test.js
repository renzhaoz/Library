describe('utils js <dump> test', () => {
  beforeEach(done => {
    require('../../mock/settings_observer_mock');
    require('../../../js/utils/common/dump');
    done();
  });

//  Dump_off test
  test('DUMP should be function', done => {
    expect(typeof window.DUMP).toBe('function');
    done();
  });

//  Dump_on test
  test('DumpOn should be function', done => {
    expect(typeof window.DumpOn).toBe('function');
    done();
  });

//  DUMP return value test
  test('DUMP should return undefined', done => {
    expect(window.DUMP()).toBe(undefined);
    done();
  });

// OptionalObject branch test
  test(' if optionalObject is true JSON.stringify should be called 1 time', done => {
    const log = jest.spyOn(console, 'log').mockImplementationOnce(() => {
    });
    const jsonStr = jest
      .spyOn(JSON, 'stringify')
      .mockImplementationOnce(() => {
      });
    const msg = 'hello';
    const optionalObject = { age: '18' };
    window.DumpOn(msg, optionalObject);
    expect(jsonStr.mock.calls.length).toBe(1);
    jsonStr.mockRestore();
    log.mockRestore();
    done();
  });

  test(' if optionalObject is false JSON.stringify should not be called', done => {
    const log = jest.spyOn(console, 'log').mockImplementationOnce(() => {
    });
    const jsonStr = jest
      .spyOn(JSON, 'stringify')
      .mockImplementationOnce(() => {
      });
    const msg = 'hello';
    const optionalObject = false;
    window.DumpOn(msg, optionalObject);
    expect(jsonStr.mock.calls.length).toBe(0);
    jsonStr.mockRestore();
    log.mockRestore();
    done();
  });
});
