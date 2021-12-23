/* eslint-disable no-undef, global-require */
describe('helper js <format> test', () => {
  beforeAll(done => {
    require('../../../js/helper/search_provider/format');
    done();
  });

  // Format test
  test('Format should be object', done => {
    expect(typeof window.Format).toBe('object');
    done();
  });

  // Format test
  test('Format should be pad with @ successfully', done => {
    const input = 'input';
    const res = window.Format.padLeft(input, 10, '@');
    expect(res).toBe('@@@@@input');
    done();
  });

  // Format test
  test('Format should be pad with space successfully', done => {
    const input = 'input';
    const res = window.Format.padLeft(input, 10);
    expect(res).toBe('     input');
    done();
  });
});
