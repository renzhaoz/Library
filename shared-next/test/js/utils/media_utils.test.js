describe('utils js <media_utils> test', () => {
  const common = require('../../common');
  const { insertDomToBody } = common;
  beforeEach(done => {
    require('../../mock/l10n_mock');
    require('../../../js/utils/l10n/l10n_date');
    require('../../../js/utils/media/media_utils');
    done();
  });

// MediaUtils test
  test('MediaUtils should be object', done => {
    expect(typeof MediaUtils).toBe('object');
    done();
  });

// FormatSize test
  test('formatSize should be function', done => {
    expect(typeof MediaUtils.formatSize).toBe('function');
    done();
  });

// FormatSize return value test
  test('formatSize return value test', done => {
    const value1 = MediaUtils.formatSize();
    const value2 = MediaUtils.formatSize(99887878);
    const value3 = MediaUtils.formatSize(1024);
    const value4 = MediaUtils.formatSize(69);
    expect(value1).toBe(null);
    expect(value2).toBe('95.3 byteUnit-MB');
    expect(value3).toBe('1 byteUnit-KB');
    expect(value4).toBe('69 byteUnit-B');
    done();
  });

// FormatDate test
  test('formatDate should be function', done => {
    expect(typeof MediaUtils.formatDate).toBe('function');
    done();
  });

// FormatDate  return value test
  test('formatDate return value test', done => {
    const value1 = MediaUtils.formatDate();
    const value2 = MediaUtils.formatDate(3849594594885);
    expect(value1).toBe(null);
    expect(value2).toBe('dateTimeFormat_');
    done();
  });

// FormatDuration test
  test('formatDuration should be function', done => {
    expect(typeof MediaUtils.formatDuration).toBe('function');
    done();
  });

// FormatDuration return value test
  test('formatDuration return value test', done => {
    const value1 = MediaUtils.formatDuration(300);
    const value2 = MediaUtils.formatDuration(8907);
    expect(value1).toBe('05:00');
    expect(value2).toBe('2:28:27');
    done();
  });

// PopulateMediaInfo test
  test('populateMediaInfo should be function', done => {
    expect(typeof MediaUtils.populateMediaInfo).toBe('function');
    done();
  });

// PopulateMediaInfo run test
  test('populateMediaInfo run test', done => {
    const div = document.createElement('div');
    div.id = 'cgb';
    insertDomToBody(document, div);
    const data1 = { id: 'cgb' };
    MediaUtils.populateMediaInfo(data1);
    expect(div.textContent).toBe('cgb');
    done();
  });

// BinarySearch test
  test('binarySearch should be function', done => {
    expect(typeof MediaUtils.binarySearch).toBe('function');
    done();
  });

// BinarySearch return value test
  test('binarySearch return value', done => {
    const array = [8, 2, 9, 10];
    const index = MediaUtils.binarySearch(array, 4, undefined, 0, 3);
    expect(index).toBe(2);
    done();
  });
});
