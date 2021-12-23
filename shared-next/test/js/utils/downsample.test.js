describe('utils js <downsample> test', () => {
  beforeEach(done => {
    require('../../../js/utils/media/downsample');
    done();
  });

// Downsample test
  test('Downsample should be object', done => {
    expect(typeof Downsample).toBe('object');
    done();
  });

// SizeAtLeast test
  test('sizeAtLeast should be function', done => {
    expect(typeof Downsample.sizeAtLeast).toBe('function');
    done();
  });

// SizeAtLeast return value test
  test('sizeAtLeast return value test', done => {
    const value1 = Downsample.sizeAtLeast(1);
    expect(value1.areaScale).toBe(1);
    expect(value1.toString()).toBe('');
    expect(value1.scale(1)).toBe(1);
    const value2 = Downsample.sizeAtLeast(1 / 4);
    expect(value2.dimensionScale).toBe(0.25);
    expect(value2.areaScale).toBe(0.06);
    expect(value2.toString()).toBe('#-moz-samplesize=4');
    expect(value2.scale(1)).toBe(1);
    const value3 = Downsample.sizeAtLeast(-1);
    expect(value3.dimensionScale).toBe(0.13);
    expect(value3.areaScale).toBe(0.02);
    expect(value3.toString()).toBe('#-moz-samplesize=8');
    done();
  });

// SizeNoMoreThan test
  test('sizeNoMoreThan should be  function', done => {
    expect(typeof Downsample.sizeNoMoreThan).toBe('function');
    done();
  });

// SizeNoMoreThan  return value test
  test('sizeNoMoreThan  return value test', done => {
    const value1 = Downsample.sizeNoMoreThan(1 / 2);
    expect(value1.dimensionScale).toBe(0.5);
    const value2 = Downsample.sizeNoMoreThan(100);
    expect(value2.dimensionScale).toBe(1);
    done();
  });

// AreaAtLeast test
  test('areaAtLeast should be  function', done => {
    expect(typeof Downsample.areaAtLeast).toBe('function');
    done();
  });

// AreaAtLeast  return value test
  test('areaAtLeast  return value test', done => {
    const value1 = Downsample.areaAtLeast(1 / 2);
    expect(value1.dimensionScale).toBe(0.5);
    const value2 = Downsample.areaAtLeast(0);
    expect(value2.dimensionScale).toBe(0.13);
    done();
  });

// AreaNoMoreThan test
  test('areaNoMoreThan should be  function', done => {
    expect(typeof Downsample.areaNoMoreThan).toBe('function');
    done();
  });

// AreaNoMoreThan  return value test
  test('areaNoMoreThan  return value test', done => {
    const value1 = Downsample.areaNoMoreThan(1 / 2);
    expect(value1.dimensionScale).toBe(1);
    const value2 = Downsample.areaNoMoreThan(900);
    expect(value2.areaScale).toBe(1);
    done();
  });
});
