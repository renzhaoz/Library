describe('utils js <text_normalizer> test', () => {
  beforeEach(done => {
    require('../../../js/utils/common/text_normalizer');
    done();
  });

// Normalizer test
  test('Normalizer should be object', done => {
    expect(typeof Normalizer).toBe('object');
    done();
  });

// InitAsciiNormalizer test
  test('initAsciiNormalizer should be function', done => {
    expect(typeof Normalizer.initAsciiNormalizer).toBe('function');
    done();
  });

// ToAscii test
  test('toAscii should be function', done => {
    expect(typeof Normalizer.toAscii).toBe('function');
    done();
  });

// ToAscii  return value test
  test('toAscii return value test', done => {
    const value1 = Normalizer.toAscii('text');
    expect(value1).toBe('text');
    const value2 = Normalizer.toAscii('');
    expect(value2).toBe('');
    done();
  });

// _toAsciiForm test
  test('Normalizer._toAsciiForm should be object', done => {
    Normalizer.initAsciiNormalizer();
    expect(typeof Normalizer._toAsciiForm).toBe('object');
    done();
  });

// EscapeHTML test
  test('escapeHTML should be function', done => {
    expect(typeof Normalizer.escapeHTML).toBe('function');
    done();
  });

// EscapeHTML  return value test
  test('escapeHTML return value test', done => {
    const value1 = Normalizer.escapeHTML('<a>', false);
    expect(value1).toBe('&lt;a&gt;');
    const value2 = Normalizer.escapeHTML('');
    expect(value2).toBe('');
    const value3 = Normalizer.escapeHTML("'<a>'", true);
    expect(value3).toBe('&#x27;&lt;a&gt;&#x27;');
    const value4 = Normalizer.escapeHTML(['div']);
    expect(value4).toBe('div');
    done();
  });

// EscapeRegExp test
  test('escapeRegExp should be function', done => {
    expect(typeof Normalizer.escapeRegExp).toBe('function');
    done();
  });

// EscapeRegExp return value test
  test('escapeRegExp return value test', done => {
    const value = Normalizer.escapeRegExp('ha');
    expect(value).toBe('ha');
    done();
  });
});
