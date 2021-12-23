/* eslint-disable no-undef, global-require */
describe('helper js <stk_helper> test', () => {
  beforeAll(done => {
    require('../../mock/l10n_mock');
    require('../../../js/helper/stk/stk_helper');
    done();
  });

  // Test STKHelper
  test('STKHelper should be object', done => {
    expect(typeof window.STKHelper).toBe('object');
    done();
  });

  // Test getIconCanvas
  test('getIconCanvas should be function', done => {
    expect(typeof window.STKHelper.getIconCanvas).toBe('function');
    done();
  });

  // Test getMessageText
  test('getMessageText should be function', done => {
    expect(typeof window.STKHelper.getMessageText).toBe('function');
    done();
  });

  // Test isIconSelfExplanatory
  test('isIconSelfExplanatory should be function', done => {
    expect(typeof window.STKHelper.isIconSelfExplanatory).toBe('function');
    done();
  });

  // Test getFirstIconRawData
  test('getFirstIconRawData should be function', done => {
    expect(typeof window.STKHelper.getFirstIconRawData).toBe('function');
    done();
  });

  // Test getIconCanvas1
  test('getIconCanvas should be return null', done => {
    const canvas = window.STKHelper.getIconCanvas();
    expect(canvas).toBeNull();
    done();
  });

  // Test getIconCanvas2
  test('getIconCanvas should be return null with error tips', done => {
    // eslint-disable-next-line no-empty-function
    const spy = jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    const mozStkIcon = {
      pixels: [4294967295, 4294967295],
      width: 5,
      height: 5
    };
    const canvas = window.STKHelper.getIconCanvas(mozStkIcon);
    expect(spy.mock.calls.length).toBe(1);
    expect(canvas).toBeNull();
    spy.mockRestore();
    done();
  });

  // Test getIconCanvas3
  test('getIconCanvas should be return canvas object', done => {
    const mozStkIcon = {
      pixels: [
        4294967295,
        4294967295,
        4294967295,
        4294967295,
        4294967295,
        255,
        255
      ],
      width: 2,
      height: 3
    };
    const canvas = window.STKHelper.getIconCanvas(mozStkIcon);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const imageData = ctx.getImageData(0, 0, 2, 3);
    expect(canvas.width).toBe(2);
    expect(canvas.height).toBe(3);
    expect(Object.prototype.toString.call(ctx)).toBe(
      '[object CanvasRenderingContext2D]'
    );
    expect(Object.prototype.toString.call(imageData)).toBe(
      '[object ImageData]'
    );
    done();
  });

  // Test getIconCanvas4
  test('getIconCanvas should be return canvas object 2', done => {
    const mozStkIcon = {
      pixels: [
        4294967295,
        4294967295,
        4294967295,
        4294967295,
        4294967295,
        255,
        255
      ],
      width: 2,
      height: 2,
      codingScheme: 'basic'
    };
    const canvas = window.STKHelper.getIconCanvas(mozStkIcon);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const imageData = ctx.getImageData(0, 0, 2, 2);
    expect(canvas.width).toBe(2);
    expect(canvas.height).toBe(2);
    expect(Object.prototype.toString.call(ctx)).toBe(
      '[object CanvasRenderingContext2D]'
    );
    expect(Object.prototype.toString.call(imageData)).toBe(
      '[object ImageData]'
    );
    done();
  });

  // Test getMessageText1
  test('getMessageText should be return string', done => {
    const stkMessage = 'string';
    const text = window.STKHelper.getMessageText(stkMessage);
    expect(typeof text).toBe('string');
    done();
  });

  // Test getMessageText2
  test('getMessageText should be return string 2', done => {
    const stkMessage = { text: 'text' };
    const text = window.STKHelper.getMessageText(stkMessage);
    expect(typeof text).toBe('string');
    done();
  });

  // Test getMessageText3
  test('getMessageText should be return string 3', done => {
    const stkMessage = undefined;
    const defaultMsgL10nId = 'textId';
    const defaultMsgL10nArgs = 'textArgs';
    const text = window.STKHelper.getMessageText(
      stkMessage,
      defaultMsgL10nId,
      defaultMsgL10nArgs
    );
    expect(typeof text).toBe('string');
    done();
  });

  // Test isIconSelfExplanatory
  test('isIconSelfExplanatory should be return boolean', done => {
    const stkMessage = {
      icons: [
        {
          width: 5,
          height: 5
        }
      ],
      iconSelfExplanatory: true
    };
    const bool = window.STKHelper.isIconSelfExplanatory(stkMessage);
    expect(typeof bool).toBe('boolean');
    done();
  });

  // Test getFirstIconRawData1
  test('getFirstIconRawData should be return null', done => {
    const stkMessage = {};
    const obj = window.STKHelper.getFirstIconRawData(stkMessage);
    expect(obj).toBeNull();
    done();
  });

  // Test getFirstIconRawData2
  test('getFirstIconRawData should be return first Icon', done => {
    const stkMessage = {
      icons: [
        {
          width: 1,
          height: 1
        },
        {
          width: 2,
          height: 2
        }
      ]
    };
    const obj = window.STKHelper.getFirstIconRawData(stkMessage);
    expect(obj).not.toBeNull();
    expect(obj.width).toBe(1);
    expect(obj.height).toBe(1);
    done();
  });
});
