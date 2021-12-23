describe('utils js <utilities> test', () => {
  const common = require('../../common');
  const { insertDomToBody } = common;
  beforeEach(done => {
    require('../../../js/utils/common/utilities');
    done();
  });

// StringHelper test
  test('StringHelper should be object', done => {
    expect(typeof StringHelper).toBe('object');
    done();
  });

// CamelCase test
  test('camelCase should be function', done => {
    expect(typeof StringHelper.camelCase).toBe('function');
    done();
  });

// CamelCase return value test
  test('camelCase return value test', done => {
    StringHelper.camelCase = jest.fn(str => {
      const rdashes = /-(.)/g;
      return str.replace(rdashes, str.toUpperCase());
    });
    const str = 'red-(red)';
    const value = StringHelper.camelCase(str);
    expect(value).toBe('redRED-(RED)red)');
    done();
  });

// FromUTF8 test
  test('fromUTF8 should be function', done => {
    expect(typeof StringHelper.fromUTF8).toBe('function');
    done();
  });

// FromUTF8 return value test
  test('fromUTF8 return value test', done => {
    const str = 'your';
    const value = StringHelper.fromUTF8(str);
    expect(Array.from(value)[0]).toBe(121);
    done();
  });

// DateHelper test
  test('DateHelper should be object', done => {
    expect(typeof DateHelper).toBe('object');
    done();
  });

// TodayStarted test
  test('todayStarted should be function', done => {
    expect(typeof DateHelper.todayStarted).toBe('function');
    done();
  });

// YesterdayStarted test
  test('yesterdayStarted should be function', done => {
    expect(typeof DateHelper.yesterdayStarted).toBe('function');
    done();
  });

// ThisWeekStarted test
  test('thisWeekStarted should be function', done => {
    expect(typeof DateHelper.thisWeekStarted).toBe('function');
    done();
  });

// ThisMonthStarted test
  test('thisMonthStarted should be function', done => {
    expect(typeof DateHelper.thisMonthStarted).toBe('function');
    done();
  });

// LastSixMonthsStarted test
  test('lastSixMonthsStarted should be function', done => {
    expect(typeof DateHelper.lastSixMonthsStarted).toBe('function');
    done();
  });
// ThisYearStarted test
  test('thisYearStarted should be function', done => {
    expect(typeof DateHelper.thisYearStarted).toBe('function');
    done();
  });

// GetMidnight test
  test('getMidnight should be function', done => {
    expect(typeof DateHelper.getMidnight).toBe('function');
    done();
  });

// Test the return value of all functions in the DateHelper object
  test('Test the return value of all functions in the DateHelper object.', done => {
    const value1 = DateHelper.todayStarted();
    const value2 = DateHelper.yesterdayStarted();
    const value3 = DateHelper.thisWeekStarted();
    const value4 = DateHelper.thisMonthStarted();
    const value5 = DateHelper.lastSixMonthsStarted();
    const value6 = DateHelper.thisYearStarted();
    expect(value1).not.toBeNaN();
    expect(value2).toEqual(expect.any(Number));
    expect(value3).toEqual(expect.any(Number));
    expect(value4).toEqual(expect.any(Number));
    expect(value5).toEqual(expect.any(Number));
    expect(value6).toEqual(expect.any(Number));
    done();
  });

// NumberHelper test
  test('NumberHelper should be object', done => {
    expect(typeof NumberHelper).toBe('object');
    done();
  });

// Zfill test
  test('zfill should be function', done => {
    expect(typeof NumberHelper.zfill).toBe('function');
    done();
  });

// Zfill  return value test
  test('zfill return value test', done => {
    const value = NumberHelper.zfill('js', 5);
    expect(value).toBe('000js');
    done();
  });

// HtmlHelper test
  test('HtmlHelper should be object', done => {
    expect(typeof HtmlHelper).toBe('object');
    done();
  });

// CreateHighlightHTML test
  test('createHighlightHTML should be function', done => {
    expect(typeof HtmlHelper.createHighlightHTML).toBe('function');
    done();
  });

// CreateHighlightHTML return value test
  test('createHighlightHTML return value test', done => {
    const text1 = 'there is an apple here';
    const text2 = 'hello';
    const searchRegExp1 = /e/;
    const searchRegExp2 = /js/;
    const value1 = HtmlHelper.createHighlightHTML(text1);
    const value2 = HtmlHelper.createHighlightHTML(text1, searchRegExp1);
    const value3 = HtmlHelper.createHighlightHTML(text2, searchRegExp2);
    expect(value1).toBe('there&nbsp;is&nbsp;an&nbsp;apple&nbsp;here');
    expect(value2.includes('highlight')).toBe(true);
    expect(value3).toBe('hello');
    done();
  });

// EscapeHTML test
  test('escapeHTML should be function', done => {
    expect(typeof HtmlHelper.escapeHTML).toBe('function');
    done();
  });

//  EscapeHTML return value test
  test(' escapeHTML return value test', done => {
    const value = HtmlHelper.escapeHTML('java js', 'a');
    expect(value).toBe('java&nbsp;js');
    done();
  });

// ImportElements test
  test('importElements should be function', done => {
    expect(typeof HtmlHelper.importElements).toBe('function');
    done();
  });

// ImportElements return value test
  test('importElements return value test', done => {
    const span = document.createElement('span');
    span.id = 'a';
    const div = document.createElement('div');
    div.id = 'b';
    insertDomToBody(document, span);
    insertDomToBody(document, div);
    const context = [];
    HtmlHelper.importElements(context, 'a', 'b');
    expect(context.a.nodeType).toBe(1);
    done();
  });
});
