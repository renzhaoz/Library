/* eslint-disable no-undef, global-require */
describe('helper js <performance_testing_helper> test', () => {
  beforeAll(done => {
    require('../../../js/helper/common/performance_testing_helper');
    done();
  });

  // PerformanceTestingHelper test
  test('PerformanceTestingHelper should be object', done => {
    expect(typeof window.PerformanceTestingHelper).toBe('object');
    done();
  });

  // PerformanceTestingHelper return value test
  test('PerformanceTestingHelper should return undefined', done => {
    const name = 'startup';
    const obj = window.PerformanceTestingHelper.dispatch(name);
    expect(obj).toBeUndefined();
    done();
  });

  // PerformanceTestingHelper dispatch test
  test('PerformanceTestingHelper should dispatch x-moz-perf', done => {
    const name = 'moz-chrome-dom-loaded';
    const callback = jest.fn(e => {
      expect(e.detail.name).toBe(name);
    });
    jest.useFakeTimers();
    window.mozPerfHasListener = true;
    window.addEventListener('x-moz-perf', callback);
    const event = new window.CustomEvent(name);
    window.dispatchEvent(event);
    jest.runAllTimers();
    expect(setTimeout.mock.calls.length).toBe(1);
    expect(callback.mock.calls.length).toBe(1);
    window.removeEventListener('x-moz-perf', callback);
    done();
  });
});
