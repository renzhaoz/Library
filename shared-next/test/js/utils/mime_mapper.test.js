describe('utils js <mime_mapper> test', () => {
  beforeEach((done) => {
    require('../../../js/utils/common/mime_mapper');
    done();
  });

//  MimeMapper test
  test('MimeMapper should be object', (done) => {
    expect(typeof MimeMapper).toBe('object');
    done();
  });

// _typeToExtensionMap test
  test('_typeToExtensionMap should be object', (done) => {
    expect(typeof MimeMapper._typeToExtensionMap).toBe('object');
    done();
  });

// _extensionToTypeMap test
  test('_extensionToTypeMap should be object', (done) => {
    expect(typeof MimeMapper._extensionToTypeMap).toBe('object');
    done();
  });

// _parseExtension test
  test('_parseExtension should be function', (done) => {
    expect(typeof MimeMapper._parseExtension).toBe('function');
    done();
  });

// _parseExtension return value test
  test("value1 should be 'pdf', value2 should be ''", (done) => {
    const filename1 = 'help.pdf';
    const value1 = MimeMapper._parseExtension(filename1);
    const filename2 = 'mp3';
    const value2 = MimeMapper._parseExtension(filename2);
    expect(value1).toBe('pdf');
    expect(value2).toBe('');
    done();
  });

// isSupportedType test
  test('isSupportedType should be function', (done) => {
    expect(typeof MimeMapper.isSupportedType).toBe('function');
    done();
  });

// isSupportedType return value test
  test('isSupportedType should return true', (done) => {
    const mimetype = 'image/jpeg';
    expect(MimeMapper.isSupportedType(mimetype)).toBe(true);
    done();
  });

// isSupportedExtension test
  test('isSupportedExtension should be function', (done) => {
    expect(typeof MimeMapper.isSupportedExtension).toBe('function');
    done();
  });

  // isSupportedExtension return value test
  test('isSupportedExtension should return true', (done) => {
    const extension = 'm4b';
    expect(MimeMapper.isSupportedExtension(extension)).toBe(true);
    done();
  });

// isFilenameMatchesType test
  test('isFilenameMatchesType should be function', (done) => {
    expect(typeof MimeMapper.isFilenameMatchesType).toBe('function');
    done();
  });

  // isFilenameMatchesType return value test
  test('isFilenameMatchesType should return false', (done) => {
    const filename = 'a.mp4';
    const mimetype = 'image/jpeg';
    expect(MimeMapper.isFilenameMatchesType(filename, mimetype)).toBe(false);
    done();
  });

// guessExtensionFromType test
  test('guessExtensionFromType should be function', (done) => {
    expect(typeof MimeMapper.guessExtensionFromType).toBe('function');
    done();
  });

  // guessExtensionFromType return value test
  test('guessExtensionFromType should return mp4', (done) => {
    const mimetype = 'video/mp4';
    expect(MimeMapper.guessExtensionFromType(mimetype)).toBe('mp4');
    done();
  });

// guessTypeFromExtension test
  test('guessTypeFromExtension should be function', (done) => {
    expect(typeof MimeMapper.guessTypeFromExtension).toBe('function');
    done();
  });

  // guessTypeFromExtension return value test
  test('guessTypeFromExtension should return image/png', (done) => {
    const extension = 'png';
    expect(MimeMapper.guessTypeFromExtension(extension)).toBe('image/png');
    done();
  });

// guessTypeFromFileProperties test
  test('guessTypeFromFileProperties should be function', (done) => {
    expect(typeof MimeMapper.guessTypeFromFileProperties).toBe('function');
    done();
  });

  // guessTypeFromFileProperties return value test
  test("value1 should be '',value2 should be 'video/mp4'", (done) => {
    const filename1 = '1.pdf';
    const mimetype1 = 'text/pdf';
    const value1 = MimeMapper.guessTypeFromFileProperties(filename1, mimetype1);
    expect(value1).toBe('');
    const filename2 = '2.mp4';
    const mimetype2 = 'video/mp4';
    const value2 = MimeMapper.guessTypeFromFileProperties(filename2, mimetype2);
    expect(value2).toBe('video/mp4');
    done();
  });

// ensureFilenameMatchesType test
  test('ensureFilenameMatchesType should be function', (done) => {
    expect(typeof MimeMapper.ensureFilenameMatchesType).toBe('function');
    done();
  });

  // ensureFilenameMatchesType return value test
  test("value1 should be '1.pdf',value2 should be '2.mp4',value3 should be '3.pdf.note'", (done) => {
    const filename1 = '1.pdf';
    const mimetype1 = 'text/pdf';
    const value1 = MimeMapper.ensureFilenameMatchesType(filename1, mimetype1);
    expect(value1).toBe('1.pdf');
    const filename2 = '2.mp4';
    const mimetype2 = 'video/mp4';
    const value2 = MimeMapper.ensureFilenameMatchesType(filename2, mimetype2);
    expect(value2).toBe('2.mp4');
    const filename3 = '3.pdf';
    const mimetype3 = 'text/kai_plain';
    const value3 = MimeMapper.ensureFilenameMatchesType(filename3, mimetype3);
    expect(value3).toBe('3.pdf.note');
    done();
  });
});
