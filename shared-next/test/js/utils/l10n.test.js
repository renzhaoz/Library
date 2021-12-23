describe('utils js <l10n> test', () => {
  const warnMock = jest.spyOn(console, 'warn').mockImplementation();
  beforeAll(done => {
    require('../../../js/utils/l10n/l10n');
    done();
  });

  // Test window.api.l10n
  test('window.api should be object', done => {
    expect(typeof window.api.l10n).toBe('object');
    done();
  });

  // Test window.api.l10n.get
  test('test window.api.l10n.get', done => {
    expect.assertions(1);
    const { get, ctx } = window.api.l10n;
    const data = get('id', 'ctxdata');
    ctx.getEntity('id', 'arg');
    expect(data).toBe('');
    done();
  });

  // Test window.api.l10n.readyState
  test('test window.api.l10n.readyState', done => {
    // 1,window.api.l10n.ctx.isReady === false;
    window.api.l10n.ctx.isReady = false;
    expect(window.api.l10n.readyState).toBe('loading');

    // 2,window.api.l10n.ctx.isReady === true;
    window.api.l10n.ctx.isReady = true;
    expect(window.api.l10n.readyState).toBe('complete');
    done();
  });

  // Test window.api.l10n.language.code & direction
  test('test window.api.l10n.language.code & direction', done => {
    const { language } = window.api.l10n;
    // Test set code
    language.code = 'en-US';
    // Test get code
    expect(language.code).toBe('en-US');
    // Test get direction
    expect(language.direction).toBe('ltr');

    done();
  });

  // Test window.api.l10n._getInternalAPI
  test('test window.api.l10n._getInternalAPI', done => {
    const { _getInternalAPI } = window.api.l10n;
    const internalApis = _getInternalAPI();
    expect(typeof internalApis).toBe('object');

    const {
      Error,
      Context,
      Locale,
      Resolver,
      getPluralRule,
      rePlaceables,
      translateDocument,
      onMetaInjected,
      PropertiesParser,
      walkContent,
      buildLocaleList
    } = internalApis;

    expect(typeof Error).toBe('function');
    expect(typeof Context).toBe('function');
    expect(typeof Locale).toBe('function');
    expect(typeof Resolver).toBe('object');
    expect(typeof getPluralRule).toBe('function');
    expect(typeof rePlaceables).toBe('object');
    expect(typeof translateDocument).toBe('function');
    expect(typeof onMetaInjected).toBe('function');
    expect(typeof PropertiesParser).toBe('object');
    expect(typeof walkContent).toBe('function');
    expect(typeof buildLocaleList).toBe('function');

    // 1, test buildLocaleList
    const meta = {
      defaultLocale: 'en-US',
      availableLanguages: ['en-US', 'es-ES']
    };

    const value1 = buildLocaleList(meta);
    expect(value1).toEqual([
      'en-US',
      { '0': 'app', '1': 'app', 'en-US': 'app' }
    ]);

    // 2,test walkContent
    const fn = x => {
      return x;
    };
    const value2 = walkContent('string', fn);
    expect(value2).toBe('string');

    const value3 = walkContent({ t: 'idOrVar' }, fn);
    expect(value3).toStrictEqual({ t: 'idOrVar' });

    const value4 = walkContent({ $0: 'test1', $x: 'test2' }, fn);
    expect(value4).toStrictEqual({ $0: 'test1', $x: 'test2' });

    // 3, test  PropertiesParser

    // Test PropertiesParser.parse, PropertiesParser.init
    const value5 = PropertiesParser.parse('ctx', ' ');
    expect(value5).toStrictEqual([]);

    const value6 = PropertiesParser.parse('ctx', 'test1 = 1  \r  test2\\\\');
    expect(value6).toStrictEqual([
      {
        $i: 'test1',
        $v: '1  '
      }
    ]);

    // Test PropertiesParser.parseIndex
    const value7 = PropertiesParser.parseIndex('{[test1(a)]}');
    expect(value7).toStrictEqual([
      {
        t: 'idOrVar',
        v: 'test1'
      },
      'a'
    ]);
    const value8 = PropertiesParser.parseIndex('{[test2()]}');
    expect(value8).toStrictEqual([
      {
        t: 'idOrVar',
        v: 'test2'
      }
    ]);

    expect(() => {
      PropertiesParser.parseIndex('test');
    }).toThrow();

    // Test PropertiesParser.unescapeString
    const value9 = PropertiesParser.unescapeString('test');
    expect(value9).toBe('test');

    const value10 = PropertiesParser.unescapeString('test\\\\');
    expect(value10).toBe('test\\');

    // Test PropertiesParser.parseString
    const value11 = PropertiesParser.parseString('{{ test }}');
    expect(value11).toStrictEqual([{ t: 'idOrVar', v: 'test' }]);

    // Test PropertiesParser.setEntityValue
    const setEntityValue1 = PropertiesParser.setEntityValue(
      'id1',
      'attr',
      'key',
      'rawValue',
      []
    );
    const setEntityValue2 = PropertiesParser.setEntityValue(
      'id2',
      '',
      'key',
      'rawValue',
      []
    );
    PropertiesParser.setEntityValue('id2', '', 'key', '{{ <html> }}', [
      { $v: '{[test()]}' }
    ]);
    PropertiesParser.setEntityValue('id1', 'attr', '', 'rawValue', [
      { attr: 'test' }
    ]);
    PropertiesParser.setEntityValue('id3', 'attr', '', 'rawValue', [
      { attr: 'test' }
    ]);
    const setEntityValue3 = PropertiesParser.setEntityValue(
      'id3',
      'attr',
      'key',
      'rawValue',
      [{ attr: 'test1' }, { attr: '{[test2()]}' }]
    );
    expect(setEntityValue3).toBeUndefined();

    // Test PropertiesParser.parseEntity
    const parseEntityVal1 = PropertiesParser.parseEntity(
      " headerId.title ['header']",
      'clock header',
      []
    );
    expect(parseEntityVal1).toBeUndefined();

    expect(() => {
      PropertiesParser.parseEntity(
        " input.title.value ['input']",
        'input number',
        []
      );
    }).toThrow();

    expect(() => {
      PropertiesParser.parseEntity(
        " headerId.$title ['header']",
        'clock header',
        []
      );
    }).toThrow();

    // Test  onMetaInjected
    const metaNode1 = document.createElement('meta');
    const metaObj1 = { availableLanguages: '' };
    metaNode1.name = 'availableLanguages';
    metaNode1.content = 'ar, ar-SA, de-DE, en-US, es-ES';
    onMetaInjected(metaNode1, metaObj1);
    expect(metaObj1).toStrictEqual({
      availableLanguages: {
        ar: NaN,
        'ar-SA': NaN,
        'de-DE': NaN,
        'en-US': NaN,
        'es-ES': NaN
      }
    });

    const metaNode2 = document.createElement('meta');
    const metaObj2 = { defaultLanguage: '' };
    metaNode2.name = 'defaultLanguage';
    metaNode2.content = 'en-US';
    onMetaInjected(metaNode2, metaObj2);
    expect(metaObj2).toStrictEqual({
      defaultLanguage: 'en-US'
    });

    const metaNode3 = document.createElement('meta');
    metaNode3.name = 'appVersion';
    metaNode3.content = 'todo 1.1.0';
    onMetaInjected(metaNode3, { defaultLanguage: '' });
    done();
  });

  // Test window.api.l10n.once
  test('test window.api.l10n.once', done => {
    const cb = jest.fn();
    window.api.l10n.once(cb());
    expect(cb.mock.calls.length).toBe(1);
    done();
  });

  // Test window.api.l10n.change
  test('test window.api.l10n.change', done => {
    const cb = jest.fn();
    window.api.l10n.change(cb());
    expect(cb.mock.calls.length).toBe(1);
    done();
  });

  // Test window.api.l10n.formatValue
  test('test window.api.l10n.formatValue', async done => {
    expect.assertions(1);
    const data = await window.api.l10n.formatValue('id', 'ctxdata');
    expect(data).toEqual('id');
    done();
  });

  // Test window.api.l10n.formatEntity
  test('test window.api.l10n.formatEntity', async done => {
    const data = await window.api.l10n.formatEntity('id', 'ctxdata');
    expect(data).toEqual('id');
    done();
  });

  // Test window.api.l10n.translateFragment, getL10nAttributes, setL10nAttributes
  test('test window.api.l10n.translateFragment', done => {
    const fragment = document.createElement('div');
    const header = document.createElement('h2');
    const span = document.createElement('span');
    header.setAttribute('data-l10n-id', 'title');
    fragment.setAttribute('data-l10n-id', 'empty');
    fragment.appendChild(header);
    fragment.appendChild(span);
    window.api.l10n.translateFragment(fragment);

    const getValue = window.api.l10n.getAttributes(fragment);
    expect(getValue).toStrictEqual({ args: null, id: 'empty' });

    window.api.l10n.setAttributes(span, 'name');
    expect(span.hasAttribute('data-l10n-id')).toBeTruthy();

    window.api.l10n.setAttributes(span, 'name', { test: 'test set attribute' });
    expect(span.hasAttribute('data-l10n-args')).toBeTruthy();
    done();
  });

  afterAll(() => {
    warnMock.mockRestore();
  });
});
