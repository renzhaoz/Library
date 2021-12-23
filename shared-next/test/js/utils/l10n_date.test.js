describe('utils js <l10n_date> test', () => {
  beforeEach(done => {
    require('../../mock/l10n_mock');
    require('../../../js/utils/l10n/l10n_date');
    done();
  });

// DateTimeFormat test for all return value types
  test('DateTimeFormat test for all return value types', done => {
    const dateTimeFormat = window.api.l10n.DateTimeFormat();
    const {
      localeDateString,
      localeTimeString,
      localeString,
      localeFormat,
      fromNow,
      relativeParts
    } = dateTimeFormat;
    expect(typeof localeDateString).toBe('function');
    expect(typeof localeTimeString).toBe('function');
    expect(typeof localeString).toBe('function');
    expect(typeof localeFormat).toBe('function');
    expect(typeof fromNow).toBe('function');
    expect(typeof relativeParts).toBe('function');
    expect(typeof localeDateString(new Date())).toBe('string');
    expect(typeof localeTimeString(new Date())).toBe('string');
    expect(typeof localeString(new Date())).toBe('string');
    done();
  });

// RelativeParts return value test
  test('relativeParts return value test', done => {
    const { relativeParts } = window.api.l10n.DateTimeFormat();
    const value1 = relativeParts(1000);
    const value2 = relativeParts(23);
    expect(value1.minutes).toBe(16);
    expect(value2.minutes).toBe(0);
    done();
  });

// LocaleFormat return value test
  test('localeFormat return value test', done => {
    const { localeFormat } = window.api.l10n.DateTimeFormat();
    const d = new Date();
    const format1 = '%a,%A,%b, %B,%Eb,%-m,%I, %e, %p,%c,%H,%M,%Y,%m,%d,%T';
    const value1 = localeFormat(d, format1);
    const value2 = localeFormat(d, ':');
    expect(value1.includes('short')).toBeTruthy();
    expect(value1.includes('weekday')).toBeTruthy();
    expect(value1.includes('month')).toBeTruthy();
    expect(value1.includes('time')).toBeTruthy();
    expect(value2).toBe(':');
    done();
  });

// FromNow return value test
  test('fromNow  return value test', done => {
    const { fromNow } = window.api.l10n.DateTimeFormat();
    const value1 = fromNow('1598064986101');
    const value2 = fromNow('898264986121');
    const value3 = fromNow('21181185859');
    const value4 = fromNow(343545454534);
    const value5 = fromNow(new Date());
    const value6 = fromNow('2771598064986101');
    expect(value5.includes('ago')).toBeTruthy();
    expect(value6.includes('until')).toBeTruthy();
    done();
  });
});
