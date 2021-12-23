describe('utils js <simple_phone_matcher> test', () => {
  beforeEach(done => {
    require('../../../js/utils/phone/simple_phone_matcher');
    done();
  });

  // SimplePhoneMatcher test for all return value
  test('SimplePhoneMatcher test for all return value ', done => {
    const {
      mcc,
      sanitizedNumber,
      generateVariants,
      bestMatch,
      _formattingChars,
      _mccWith00Prefix,
      _mccWith011Prefix,
      _countryPrefixes,
      _trunkCodes,
      _areaCodeSwipe,
      _internationalPrefixes,
      _trunkPrefixes,
      _areaPrefixes,
      _carrierPrefixes
    } = SimplePhoneMatcher;

    expect(typeof SimplePhoneMatcher).toBe('object');
    expect(typeof mcc).toBe('string');
    expect(typeof sanitizedNumber).toBe('function');
    expect(typeof generateVariants).toBe('function');
    expect(typeof bestMatch).toBe('function');
    expect(Array.isArray(_formattingChars)).toBeTruthy();
    expect(_formattingChars.length).toBe(5);
    expect(Array.isArray(_mccWith00Prefix)).toBeTruthy();
    expect(_mccWith00Prefix.length).toBe(5);
    expect(Array.isArray(_mccWith011Prefix)).toBeTruthy();
    expect(_mccWith011Prefix.length).toBe(7);
    expect(Array.isArray(_countryPrefixes)).toBeTruthy();
    expect(_countryPrefixes.length).toBe(310);
    expect(_trunkCodes[0]).toBe('0');
    expect(typeof _areaCodeSwipe).toBe('object');
    expect(typeof _internationalPrefixes).toBe('function');
    expect(typeof _trunkPrefixes).toBe('function');
    expect(typeof _areaPrefixes).toBe('function');
    expect(typeof _carrierPrefixes).toBe('function');
    done();
  });

  // SanitizedNumber return value test
  test('sanitizedNumber return value test', done => {
    const value = SimplePhoneMatcher.sanitizedNumber('(029)-153-8776-6554');
    expect(value).toBe('02915387766554');
    done();
  });

  // GenerateVariants return value test
  test('generateVariants return value test', done => {
    const value = SimplePhoneMatcher.generateVariants('(029)-8234567');
    expect(value).toEqual(['0298234567', '298234567']);
    done();
  });

  //  BestMatch return value test
  test('bestMatch return value test', done => {
    const variants1 = ['(029)-8234567', '+0086057487'];
    const matches1 = [
      ['029-21345678', '(029)12345678'],
      ['+0086-0574-87777777', '+1(206)555-2345-206']
    ];
    const variants2 = [' +86 (10) 6581 3939'];
    const matches2 = [['']];
    const value1 = SimplePhoneMatcher.bestMatch(variants1, matches1);
    const value2 = SimplePhoneMatcher.bestMatch(variants2, matches2);
    expect(value1).toEqual({
      totalMatchNum: 2,
      allMatches: [[0], [0]],
      bestMatchIndex: 1,
      localIndex: 0
    });
    expect(value2).toEqual({
      totalMatchNum: 1,
      allMatches: [[0]],
      bestMatchIndex: 0,
      localIndex: 0
    });
    done();
  });

  // _internationalPrefixes return value test
  test('_internationalPrefixes return value test', done => {
    const value1 = SimplePhoneMatcher._internationalPrefixes(
      '+55(11) 912341234'
    );
    expect(value1).toEqual(['+55(11) 912341234', '0055(11) 912341234']);
    const value2 = SimplePhoneMatcher._internationalPrefixes('000-12345');
    expect(value2).toEqual(['000-12345', '+0-12345']);
    done();
  });

  // _trunkPrefixes return value test
  test('_trunkPrefixes return value test', done => {
    const value = SimplePhoneMatcher._trunkPrefixes('+55(11) 912341234');
    expect(value).toEqual(['0(11) 912341234', '(11) 912341234']);
    done();
  });

  // _carrierPrefixes return value test
  test('_carrierPrefixes return value test', done => {
    const value = SimplePhoneMatcher._carrierPrefixes('0086-2134567890');
    expect(value).toEqual(['6-2134567890']);
    done();
  });
});
