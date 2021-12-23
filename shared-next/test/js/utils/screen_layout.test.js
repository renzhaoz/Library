describe('utils js <screen_layout> test', () => {
  beforeEach(done => {
    window.matchMedia =
      window.matchMedia ||
      jest.fn(() => {
        return {
          matches: false,
          addListener() {
          },
          removeListener() {
          }
        };
      });
    require('../../../js/utils/screen/screen_layout');
    done();
  });

//  ScreenLayout test
  test(' ScreenLayout should be object', done => {
    expect(typeof ScreenLayout).toBe('object');
    done();
  });

// IsOnRealDevice test
  test(' isOnRealDevice should be function', done => {
    expect(typeof ScreenLayout.isOnRealDevice).toBe('function');
    done();
  });

// IsOnRealDevice return value test
  test(' isOnRealDevice return value test', done => {
    const value = ScreenLayout.isOnRealDevice();
    expect(value).toBe(false);
    done();
  });

// GetCurrentLayout test
  test('getCurrentLayout should be function', done => {
    expect(typeof ScreenLayout.getCurrentLayout).toBe('function');
    done();
  });

// GetCurrentLayout  return value test
  test('getCurrentLayout return value test', done => {
    const value = ScreenLayout.getCurrentLayout();
    expect(value).toBe(false);
    done();
  });

// Watch test
  test('watch should be function', done => {
    expect(typeof ScreenLayout.watch).toBe('function');
    done();
  });

// Watch  & unwatch run test
  test('watch & unwatch run test', done => {
    ScreenLayout.watch('tiny', '(max-width: 767px)');
    expect(window.matchMedia.mock.calls.length).toBe(6);
    done();
  });

// HandleChange test
  test('handleChange should be function', done => {
    expect(typeof ScreenLayout.handleChange).toBe('function');
    done();
  });

// HandleChange  run test
  test('handleChange run test', done => {
    window.dispatchEvent = jest.fn();
    ScreenLayout.handleChange('screenlayoutchange');
    expect(window.dispatchEvent.mock.calls.length).toBe(5);
    done();
  });
});
