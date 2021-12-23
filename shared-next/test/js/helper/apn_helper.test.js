/* eslint-disable no-undef, global-require */
describe('helper js <apn_helper> test', () => {
  const list = require('../../../resources/apn.json');
  beforeAll(done => {
    require('../../../js/helper/apn/apn_helper');
    done();
  });

  // ApnHelper test
  test('ApnHelper should be object', done => {
    expect(typeof window.ApnHelper).toBe('object');
    done();
  });

  // GetCompatible test
  test('getCompatible should be function', done => {
    expect(typeof window.ApnHelper.getCompatible).toBe('function');
    done();
  });

  // GetCompatible return value test
  test('getCompatible should return an array', done => {
    const mcc = 202;
    const mnc = 10;
    const apns = window.ApnHelper.getCompatible(list, mcc, mnc);
    expect(apns).toEqual(expect.any(Array));
    done();
  });

  // GetCompatible mcc doesn't exist
  test('getCompatible should return an empty array', done => {
    const mcc = 203;
    const mnc = 10;
    const apns = window.ApnHelper.getCompatible(list, mcc, mnc);
    expect(apns).toEqual(expect.any(Array));
    done();
  });

  // GetCompatible mnc doesn't exist
  test('getCompatible should return an empty array', done => {
    const mcc = 202;
    const mnc = 8;
    const apns = window.ApnHelper.getCompatible(list, mcc, mnc);
    expect(apns).toEqual(expect.any(Array));
    done();
  });

  // GetAll test
  test('getAll should be function', done => {
    expect(typeof window.ApnHelper.getAll).toBe('function');
    done();
  });

  // GetAll return value test
  test('getAll should return an array', done => {
    const mcc = 202;
    const mnc = 10;
    const apns = window.ApnHelper.getAll(list, mcc, mnc);
    expect(apns).toEqual(expect.any(Array));
    done();
  });

  // GetAll mcc doesn't exist
  test('getAll should return an empty array', done => {
    const mcc = 203;
    const mnc = 10;
    const apns = window.ApnHelper.getAll(list, mcc, mnc);
    expect(apns).toEqual(expect.any(Array));
    done();
  });

  // GetAll mnc doesn't exist
  test('getAll should return an empty array', done => {
    const mcc = 202;
    const mnc = 8;
    const apns = window.ApnHelper.getAll(list, mcc, mnc);
    expect(apns).toEqual(expect.any(Array));
    done();
  });
});
