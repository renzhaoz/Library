describe('utils js <font_size_utils> test', () => {
  const { insertDomToBody } = require('../../common');
  const header = document.createElement('header');
  const style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(
    document.createTextNode(
      'header{font-family: Helvetica Neue, Helvetica, Arial;font-size: 14px;margin: 0;padding: 0;}'
    )
  );
  const head = document.getElementsByTagName('head')[0];
  head.appendChild(style);
  header.innerHTML = `
    <h1 class="title">title</h1>
    <div class="action-button" style="margin-left: 26px; margin-right: 18px">
        <button>search</button>
    </div>
    `;
  insertDomToBody(document, header);

  beforeAll(done => {
    require('../../mock/l10n_mock');
    require('../../../js/utils/font/font_size_utils');
    done();
  });

  // FontSizeUtils test for all return value types
  test('FontSizeUtils test for all return value types', done => {
    const {
      _cachedContexts,
      _getCachedContext,
      resetCache,
      _textChangeObserver,
      _handleTextChanges,
      _getTextChangeObserver,
      _observeHeaderChanges,
      _reformatHeaderText,
      _registerHeadersInSubtree,
      getFontWidth,
      getMaxFontSizeInfo,
      getOverflowCount,
      getAllowedSizes,
      getContentWidth,
      getStyleProperties,
      autoResizeElement,
      resetCentering,
      centerTextToScreen,
      _initHeaderFormatting,
      init,
      getWindowWidth
    } = FontSizeUtils;
    expect(typeof _cachedContexts).toBe('object');
    expect(typeof _getCachedContext).toBe('function');
    expect(typeof resetCache).toBe('function');
    expect(typeof _textChangeObserver).toBe('object');
    expect(typeof _handleTextChanges).toBe('function');
    expect(typeof _getTextChangeObserver).toBe('function');
    expect(typeof _observeHeaderChanges).toBe('function');
    expect(typeof _reformatHeaderText).toBe('function');
    expect(typeof _registerHeadersInSubtree).toBe('function');
    expect(typeof getFontWidth).toBe('function');
    expect(typeof getMaxFontSizeInfo).toBe('function');
    expect(typeof getOverflowCount).toBe('function');
    expect(typeof getAllowedSizes).toBe('function');
    expect(typeof getContentWidth).toBe('function');
    expect(typeof getStyleProperties).toBe('function');
    expect(typeof autoResizeElement).toBe('function');
    expect(typeof resetCentering).toBe('function');
    expect(typeof centerTextToScreen).toBe('function');
    expect(typeof _initHeaderFormatting).toBe('function');
    expect(typeof init).toBe('function');
    expect(typeof getWindowWidth).toBe('function');
    expect(typeof FontSizeUtils).toBe('object');
    done();
  });

  // Test getAllowedSizes
  test('test getAllowedSizes', done => {
    const div = document.querySelector('.action-button');
    const h1 = document.querySelector('.title');

    const value1 = FontSizeUtils.getAllowedSizes(div);
    const value2 = FontSizeUtils.getAllowedSizes(h1);

    expect(value1).toStrictEqual([]);
    expect(value2).toStrictEqual([16, 17, 18, 19, 20, 21, 22, 23]);
    done();
  });

  // Test _initHeaderFormatting & _registerHeadersInSubtree
  test('test _initHeaderFormatting & _registerHeadersInSubtree', done => {
    const spy = jest.spyOn(FontSizeUtils, '_registerHeadersInSubtree');
    window.dispatchEvent(new CustomEvent('lazyload'));
    expect(spy).toBeCalledTimes(1);
    spy.mockRestore();
    done();
  });

  // Test getWindowWidth
  test('test getWindowWidth', done => {
    window.innerWidth = 1024;
    const value = FontSizeUtils.getWindowWidth();
    expect(value).toBe(1024);
    done();
  });

  // Test getContentWidth
  test('test getContentWidth', done => {
    const style1 = {
      width: '20px',
      boxSizing: 'border-box',
      paddingRight: '8px',
      paddingLeft: '8px'
    };
    const style2 = {
      width: '20px',
      boxSizing: 'content-box',
      paddingRight: '8px',
      paddingLeft: '8px'
    };
    const value1 = FontSizeUtils.getContentWidth(style1);
    const value2 = FontSizeUtils.getContentWidth(style2);

    expect(value1).toBe(4);
    expect(value2).toBe(20);
    done();
  });

  // Test getStyleProperties
  test('test getStyleProperties', done => {
    const value = FontSizeUtils.getStyleProperties(header);
    expect(value).toStrictEqual({
      fontFamily: 'Helvetica Neue, Helvetica, Arial',
      contentWidth: 0,
      paddingRight: 0,
      paddingLeft: 0,
      offsetLeft: 0
    });
    done();
  });

  // Test getOverflowCount
  test('test getOverflowCount', done => {
    const value = FontSizeUtils.getOverflowCount(
      'The maximum number of pixels before overflow.',
      14,
      'Arial',
      20
    );
    expect(value).toBe(43);
    done();
  });

  // Test centerTextToScreen
  test('test centerTextToScreen', done => {
    const spy = jest
      .spyOn(FontSizeUtils, 'getWindowWidth')
      .mockReturnValue(180);
    const style1 = {
      textWidth: 160,
      paddingRight: 6,
      paddingLeft: 8,
      offsetLeft: 8,
      contentWidth: 150
    };
    const style2 = {
      textWidth: 160,
      paddingRight: 6,
      paddingLeft: 8,
      offsetLeft: 8,
      contentWidth: 130
    };
    const div = document.querySelector('.action-button');

    FontSizeUtils.centerTextToScreen(div, style1);
    FontSizeUtils.centerTextToScreen(div, style2);
    expect(spy).toBeCalledTimes(3);
    spy.mockRestore();
    done();
  });

  // Test _observeHeaderChanges &  _handleTextChanges
  test('test _observeHeaderChanges  &  _handleTextChanges', done => {
    const spy1 = jest.spyOn(FontSizeUtils, 'resetCentering');
    const spy2 = jest.spyOn(FontSizeUtils, 'autoResizeElement');
    const h1 = document.querySelector('.title');
    const mutations = [
      {
        target: header
      },
      {
        target: h1
      }
    ];
    FontSizeUtils._observeHeaderChanges(header);
    FontSizeUtils._handleTextChanges(mutations);
    expect(spy1).toBeCalledTimes(2);
    expect(spy2).toBeCalledTimes(2);
    spy1.mockRestore();
    spy2.mockRestore();
    done();
  });

  // Test getFontWidth & _getCachedContext
  test('test getFontWidth & _getCachedContext', done => {
    const value1 = FontSizeUtils.getFontWidth('hello', 14, 'Arial', 'normal');
    const value2 = FontSizeUtils.getFontWidth('morning', 14, 'Arial');

    expect(value1).toBe(30);
    expect(value2).toBe(52);
    done();
  });

  // Test getMaxFontSizeInfo
  test('test getMaxFontSizeInfo', done => {
    const allowedSizes = [4, 6, 8, 10, 12, 14, 16];
    const value = FontSizeUtils.getMaxFontSizeInfo(
      'kitty',
      allowedSizes,
      'Arial',
      16
    );

    expect(value.overflow).toBe(false);
    done();
  });

  // Test autoResizeElement
  test('test autoResizeElement', done => {
    const style = {
      width: 80,
      boxSizing: 'border-box'
    };
    const h1 = document.querySelector('.title');
    const value1 = FontSizeUtils.autoResizeElement(h1, style);
    const value2 = FontSizeUtils.autoResizeElement(header, style);

    // expect(value1).toBe(44);
    expect(value2).toBe(0);
    done();
  });

  // Test resetCentering
  test('test resetCentering', done => {
    const div = document.querySelector('.action-button');
    expect(div.style.getPropertyValue('margin-left')).toBe('26px');
    expect(div.style.getPropertyValue('margin-right')).toBe('18px');

    FontSizeUtils.resetCentering(div);

    expect(div.style.getPropertyValue('margin-left')).toBe('0px');
    expect(div.style.getPropertyValue('margin-right')).toBe('0px');
    done();
  });

  // Test _getTextChangeObserver
  test('test _getTextChangeObserver', done => {
    const value = FontSizeUtils._getTextChangeObserver();
    expect(typeof value).toBe('object');
    done();
  });

  // Test resetCache
  test('test resetCache', done => {
    FontSizeUtils.resetCache();
    expect(FontSizeUtils._cachedContexts).toStrictEqual({});
    done();
  });
});
