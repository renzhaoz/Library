const TIME = 1321644961388;
describe('utils js <uuid> test', () => {
  beforeEach(done => {
    require('../../../js/utils/common/uuid');
    done();
  });

  // Uuid type test
  test('uuid type test', done => {
    const {
      v1,
      v4,
      parse,
      unparse,
      BufferClass,
      mathRNG,
      nodeRNG,
      whatwgRNG
    } = uuid;
    expect(typeof uuid).toBe('function');
    expect(typeof v1).toBe('function');
    expect(typeof v4).toBe('function');
    expect(typeof parse).toBe('function');
    expect(typeof unparse).toBe('function');
    expect(typeof BufferClass).toBe('function');
    expect(typeof mathRNG).toBe('function');
    expect(typeof nodeRNG).toBe('function');
    expect(typeof whatwgRNG).toBe('function');
    done();
  });

  // Uuid/uuid.v4 return value test
  test('uuid/uuid.v4 return value test', done => {
    const buf = new Array(32);
    const value1 = uuid();
    const value2 = uuid('hello');
    const value3 = uuid('binary');
    const value4 = uuid(null, buf, 16);
    const value5 = uuid.v4({
      random: [
        0x10,
        0x91,
        0x56,
        0xbe,
        0xc4,
        0xfb,
        0xc1,
        0xea,
        0x71,
        0xb4,
        0xef,
        0xe1,
        0x67,
        0x1c,
        0x58,
        0x36
      ]
    });

    expect(typeof value1).toBe('string');
    expect(value2).toMatch('-');
    expect(typeof value3).toBe('object');
    expect(Array.isArray(value4)).toBeTruthy();
    expect(value4.length).toBe(32);
    expect(value5).toBe('109156be-c4fb-41ea-b1b4-efe1671c5836');
    done();
  });

  // Uuid.v1 return value test
  test('uuid.v1 return value test', done => {
    const arr = new Array(32);
    const value1 = uuid.v1({
      node: [0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
      clockseq: 0x1234,
      msecs: new Date('2011-11-01').getTime(),
      nsecs: 5678
    });
    const value2 = uuid.v1(null, arr, 0);
    const uidt = uuid.v1({ msecs: TIME, nsecs: 10 });
    const uidtb = uuid.v1({ msecs: TIME, nsecs: 9 });
    expect(
      parseInt(uidtb.split('-')[3], 16) - parseInt(uidt.split('-')[3], 16)
    ).toBe(0);
    expect(value1).toBe('710b962e-041c-11e1-9234-0123456789ab');
    expect(Array.isArray(value2)).toBeTruthy();
    expect(() => {
      uuid.v1({ msecs: TIME, nsecs: 10000 });
    }).toThrowError("uuid.v1(): Can't create more than 10M uuids/sec");
    done();
  });

  // Uuid.parse return value test
  test('uuid.parse return value test', done => {
    const value = uuid.parse('797ff043-11eb-11e1-80d6-510998755d10');
    expect(value).toEqual([121, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    done();
  });

  // Uuid.unparse return value test
  test('uuid.unparse return value test', done => {
    const value = uuid.unparse(
      uuid.parse('797ff043-11eb-11e1-80d6-510998755d10')
    );
    expect(value).toEqual('79000000-0000-0000-0000-000000000000');
    done();
  });
});
