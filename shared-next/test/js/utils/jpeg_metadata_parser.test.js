describe('utils js <jpeg_metadata_parse> test', () => {
  const oldFileReader = window.FileReader;
  beforeAll(done => {
    const { mockFileReader } = require('../../mock/fileReader_mock');
    window.FileReader = mockFileReader;
    require('../../../js/utils/blob/blobview');
    require('../../../js/utils/media/jpeg_metadata_parser');
    done();
  });

  // Test parseJPEGMetadata
  test('parseJPEGMetadata should be function', done => {
    expect(typeof parseJPEGMetadata).toBe('function');
    done();
  });

  // Test parseJPEGMetadata run
  test('not a JPEG file test', done => {
    const metadataCallback = jest.fn();
    const metadataError = jest.fn();
    const blob = new Blob(['123'], { type: 'text/plain' });
    parseJPEGMetadata(blob, metadataCallback, metadataError);

    expect(metadataCallback).toBeCalledTimes(0);
    expect(metadataError).toBeCalledTimes(1);
    done();
  });

  // JPEG file test  & header !== 0xff
  test('JPEG file test & header !== 0xff', done => {
    const oldDataView = window.DataView;
    function DataView() {}
    DataView.prototype = {
      getUint8: jest.fn()
    };

    DataView.prototype.getUint8
      .mockReturnValueOnce(255) // 0xff
      .mockReturnValueOnce(216); // 0xd8
    window.DataView = DataView;
    const metadataCallback = jest.fn();
    const metadataError = jest.fn();
    const data = new Uint8Array([71, 13, 10, 26, 10, 0, 0, 0, 13]);
    const blob = new Blob(data, { type: 'image/jpeg' });
    parseJPEGMetadata(blob, metadataCallback, metadataError);
    expect(metadataCallback).toBeCalledTimes(0);
    expect(metadataError).toBeCalledTimes(1);
    expect(metadataError.mock.calls[0][0]).toBe(
      'Malformed JPEG file: bad segment header'
    );
    window.DataView = oldDataView;
    done();
  });

  // 1,JPEG file test  & header === 0xff
  test('1,JPEG file test & header !== 0xff', done => {
    const oldDataView = window.DataView;
    function DataView() {}
    DataView.prototype = {
      getUint8: jest.fn(),
      getUint16: jest.fn(),
      getUint32: jest.fn()
    };

    DataView.prototype.getUint8
      // 1,type === 0xc0
      .mockReturnValueOnce(255) // 0xff
      .mockReturnValueOnce(216) // 0xd8
      .mockReturnValueOnce(255) // 0xff
      .mockReturnValueOnce(192) // 0xc0
      // 2,type === 0xc2
      .mockReturnValueOnce(255) // 0xff
      .mockReturnValueOnce(216) // 0xd8
      .mockReturnValueOnce(255) // 0xff
      .mockReturnValueOnce(194) // 0xc2
      // 3,type === 0xe1
      .mockReturnValueOnce(255) // 0xff
      .mockReturnValueOnce(216) // 0xd8
      .mockReturnValueOnce(255) // 0xff
      .mockReturnValueOnce(225) // 0xe1
      .mockReturnValueOnce(73); // 0x49

    DataView.prototype.getUint16
      .mockReturnValueOnce(6) // 1,type === 0xc0
      .mockReturnValueOnce(6)
      .mockReturnValueOnce(6)
      .mockReturnValueOnce(6) // 2,type === 0xc2
      .mockReturnValueOnce(6)
      .mockReturnValueOnce(6)
      .mockReturnValueOnce(6) // 3,type === 0xe1
      .mockReturnValueOnce(42) // Data.getUint16(12, byteorder) !== 42
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(1);

    DataView.prototype.getUint32
      .mockReturnValueOnce(1165519206) // 0x45786966
      .mockReturnValueOnce(10);
    window.DataView = DataView;
    const metadataCallback = jest.fn();
    const metadataError = jest.fn();
    const data = new Uint8Array([71, 13, 10, 26, 10, 0, 0, 0, 13]);
    const blob = new Blob(data, { type: 'image/jpeg' });
    parseJPEGMetadata(blob, metadataCallback, metadataError);
    parseJPEGMetadata(blob, metadataCallback, metadataError);
    parseJPEGMetadata(blob, metadataCallback, metadataError);
    expect(metadataCallback).toBeCalledTimes(2);
    expect(metadataError).toBeCalledTimes(1);
    window.DataView = oldDataView;
    done();
  });

  // 2,JPEG file test  & header === 0xff  --parseEntry
  test('2,JPEG file test & header !== 0xff', done => {
    const oldDataView = window.DataView;
    function DataView() {}
    DataView.prototype = {
      getUint8: jest.fn(),
      getUint16: jest.fn(),
      getUint32: jest.fn()
    };

    DataView.prototype.getUint8
      // 3,type === 0xe1
      .mockReturnValueOnce(255) // 0xff
      .mockReturnValueOnce(216) // 0xd8
      .mockReturnValueOnce(255) // 0xff
      .mockReturnValueOnce(225) // 0xe1
      .mockReturnValueOnce(77); // 0x4d

    DataView.prototype.getUint16
      .mockReturnValueOnce(6) // 3,type === 0xe1
      .mockReturnValueOnce(42) // Data.getUint16(12, byteorder) !== 42
      .mockReturnValueOnce(1) //
      .mockReturnValueOnce('274'); //

    DataView.prototype.getUint32
      .mockReturnValueOnce(1165519206) // 0x45786966
      .mockReturnValueOnce(10);

    window.DataView = DataView;
    const metadataCallback = jest.fn();
    const metadataError = jest.fn();
    const data = new Uint8Array([71, 13, 10, 26, 10, 0, 0, 0, 13]);
    const blob = new Blob(data, { type: 'image/jpeg' });
    parseJPEGMetadata(blob, metadataCallback, metadataError);
    expect(metadataCallback).toBeCalledTimes(0);
    expect(metadataError).toBeCalledTimes(1);
    window.DataView = oldDataView;
    done();
  });

  afterAll(() => {
    window.FileReader = oldFileReader;
  });
});
