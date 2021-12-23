describe('utils js <get_video_rotation> test', () => {
  const oldFileReader = window.FileReader;

  beforeEach(done => {
    const { mockFileReader } = require('../../mock/fileReader_mock');
    window.FileReader = mockFileReader;
    require('../../../js/utils/blob/blobview');
    require('../../../js/utils/media/get_video_rotation');
    done();
  });

  // Test getVideoRotation
  test('getVideoRotation should be function', done => {
    expect(typeof getVideoRotation).toBe('function');
    done();
  });

  // Test getVideoRotation run
  const rotationCallback = jest.fn();
  describe("< data.byteLength <= 8 || data.getASCIIText(4, 4) !== 'ftyp'> test", () => {
    test('not MP4 file test', done => {
      const blob = new Blob(['test,test'], { type: 'text/plain' });
      getVideoRotation(blob, rotationCallback);
      expect(rotationCallback).toBeCalledTimes(1);
      done();
    });
  });

  describe("< data.readUnsignedInt()===0 data.readASCIIText(4)===''> test", () => {
    test('<handler===skip> test', done => {
      const spy = jest
        .spyOn(String, 'fromCharCode')
        .mockReturnValueOnce('ftyp')
        .mockReturnValueOnce('ftyp');

      const data = new Uint8Array([71, 13, 10, 26, 10, 0, 0, 0, 13]);
      const blob = new Blob(data, { type: 'video/mpeg' });
      getVideoRotation(blob, rotationCallback);

      expect(spy).toBeCalledTimes(2);
      expect(rotationCallback).toBeCalledTimes(2);
      spy.mockRestore();
      done();
    });

    test('<handler===children || type is function> test', done => {
      const oldDataView = window.DataView;
      function DataView() {}
      DataView.prototype = {
        getUint32: x => {
          return x;
        }
      };
      window.DataView = DataView;

      const spy = jest
        .spyOn(String, 'fromCharCode')
        .mockReturnValueOnce('ftyp')
        .mockReturnValueOnce('moov')
        .mockReturnValueOnce('ftyp')
        .mockReturnValueOnce('ftyp')
        .mockReturnValueOnce('tkhd');

      const data = new Int8Array([0, 0, 0, 1, 1, 0, 0, 0, 0]);
      const blob = new Blob(data, { type: 'video/mpeg' });
      getVideoRotation(blob, rotationCallback);
      expect(() => {
        getVideoRotation(blob, rotationCallback);
      }).toThrow();

      expect(spy).toBeCalledTimes(5);
      expect(rotationCallback).toBeCalledTimes(3);
      spy.mockRestore();
      window.DataView = oldDataView;
      done();
    });
  });

  // Size ===1
  describe('<data.readUnsignedInt() === 1> test', () => {
    test('data.readUnsignedInt() === 1', done => {
      const oldDataView = window.DataView;
      function DataView() {}
      DataView.prototype = {
        getUint32: x => {
          return 1;
        }
      };
      window.DataView = DataView;
      const spy = jest
        .spyOn(String, 'fromCharCode')
        .mockReturnValueOnce('ftyp');

      const data = new Int8Array([0, 0, 0, 1, 1, 0, 0, 0, 0]);
      const blob = new Blob(data, { type: 'video/mpeg' });
      getVideoRotation(blob, rotationCallback);

      expect(spy).toBeCalledTimes(2);
      expect(rotationCallback).toBeCalledTimes(4);
      spy.mockRestore();
      window.DataView = oldDataView;
      done();
    });
  });

  afterEach(() => {
    window.FileReader = oldFileReader;
  });
});
