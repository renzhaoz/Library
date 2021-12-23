describe('utils js <blobview> test', () => {
  const oldFileReader = window.FileReader;

  beforeEach(done => {
    const { mockFileReader } = require('../../mock/fileReader_mock');
    window.FileReader = mockFileReader;
    require('../../../js/utils/blob/blobview');
    done();
  });

  // BlobView test
  test(' BlobView should be object', done => {
    expect(typeof BlobView).toBe('object');
    done();
  });

  // BlobView.get test
  test(' BlobView.get should be function', done => {
    expect(typeof BlobView.get).toBe('function');
    done();
  });

  // BlobView.get return value test
  test(' BlobView.get  return value test', done => {
    const callback = jest.fn();
    const blob = new Blob(['he'], { type: 'text/plain' });

    expect(() => {
      BlobView.get(1, -1);
    }).toThrowError('negative offset');

    expect(() => {
      BlobView.get(1, 1, -1);
    }).toThrowError('negative length');

    expect(() => {
      BlobView.get(blob, 9);
    }).toThrowError('offset larger than blob size');

    const value4 = BlobView.get(blob, 1, 1, callback);
    expect(value4).toBeUndefined();

    const value5 = BlobView.get(blob, 1, 2, callback);
    expect(value5).toBeUndefined();
    done();
  });

  // BlobView.getFromArrayBuffer test
  test(' BlobView.getFromArrayBuffer should be function', done => {
    expect(typeof BlobView.getFromArrayBuffer).toBe('function');
    done();
  });

  // BlobView.getFromArrayBuffer  return value test
  test(' getFromArrayBuffer  return value test', done => {
    const buffer = new ArrayBuffer(6);
    const value = new BlobView.getFromArrayBuffer(buffer, 2, 3, 4);
    expect(typeof value).toBe('object');
    expect(() => {
      value.getMore(1, 2);
    }).toThrowError('no blob backing this BlobView');
    done();
  });

  // BlobView.prototype test
  test(' BlobView.prototype test ', done => {
    const buffer = new ArrayBuffer(66);
    const value = new BlobView.getFromArrayBuffer(buffer, 0, 65, 1);
    expect(value.getUint8(2)).toBe(0);
    expect(value.getInt8(2.9)).toBe(0);
    expect(value.getUint16(1)).toBe(0);
    expect(value.getInt16(1)).toBe(0);
    expect(value.getUint32(1)).toBe(0);
    expect(value.getInt32(1)).toBe(0);
    expect(value.getFloat32(1.2)).toBe(0);
    expect(value.getFloat64(2.9)).toBe(0);
    expect(value.readByte()).toBe(0);
    expect(value.readUnsignedByte()).toBe(0);
    expect(value.readShort(1)).toBe(0);
    expect(value.readUnsignedShort()).toBe(0);
    expect(value.readInt(0)).toBe(0);
    expect(value.readUnsignedInt(2)).toBe(0);
    expect(value.readFloat()).toBe(0);
    expect(value.readDouble(0.9)).toBe(0);
    expect(value.tell()).toBe(26);
    expect(value.remaining()).toBe(39);
    expect(() => {
      value.seek(-9);
    }).toThrowError('negative index');
    expect(() => {
      value.seek(73);
    }).toThrowError('index greater than buffer size');
    expect(value.seek(53)).toBeUndefined();
    expect(() => {
      value.advance(13);
    }).toThrowError('advance past end of buffer');
    expect(() => {
      value.advance(-70);
    }).toThrowError('advance past beginning of buffer');
    expect(value.advance(0)).toBeUndefined();
    expect(value.getUnsignedByteArray(1, 2).includes(0)).toBeTruthy();
    expect(value.readUnsignedByteArray(1)[0]).toBe(0);

    expect(value.getBit(2, 5)).toBe(false);
    expect(value.getUint24(2, 1)).toBe(0);
    expect(value.readUint24(0)).toBe(0);
    expect(typeof value.getASCIIText(12, 1)).toBe('string');
    expect(value.readASCIIText(2, 0)).toMatch('');
    expect(value.getUTF8Text(10, 1)).toMatch('');
    expect(value.readUTF8Text(2)).toMatch('');
    expect(() => {
      value.getUTF16Text(3, 3, 1);
    }).toThrowError('len must be a multiple of two');
    expect(value.getUTF16Text(3, 4)).toMatch('');
    expect(value.readUTF16Text(2, 1)).toMatch('');
    expect(value.getID3Uint28BE(3, 4)).toBe(0);
    expect(value.readNullTerminatedUTF8Text(0)).toBe('');
    expect(() => {
      value.readNullTerminatedUTF16Text(3);
    }).toThrowError('size must be a multiple of two');
    expect(value.readNullTerminatedUTF16Text(2)).toMatch('');
    expect(value.readNullTerminatedUTF16Text(0, 0)).toMatch('');
    expect(() => {
      value.getGBKText(3, 3);
    }).toThrowError('size must be a multiple of two');
    expect(() => {
      value.readGBKText(7);
    }).toThrowError('size must be a multiple of two');

    // Test  bigEndian & bigEndian
    expect(value.littleEndian).toBeTruthy();

    value.bigEndian();
    expect(value.littleEndian).toBeFalsy();
    done();
  });

  afterEach(() => {
    window.FileReader = oldFileReader;
  });
});
