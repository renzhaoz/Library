/* exported MimeMapper */

/**
 * MimeMapper helps gaia apps to decide the mapping of mimetype and extension.
 * The use cases often happen when apps need to know about the exact
 * mimetypes or extensions, such as to delegate the open web activity, we must
 * have suitable mimetypes or extensions to request the right activity
 *
 * The mapping is basically created according to:
 * http://en.wikipedia.org/wiki/Internet_media_type
 *
 * The supported formats are considered base on the deviceStorage properties:
 * http://dxr.mozilla.org/mozilla-central/toolkit/content/
 * devicestorage.properties
 *
 */

// eslint-disable-next-line no-unused-vars
const MimeMapper = {
  /*
   * This list only contains the extensions we currently supported
   * We should make it more complete for further usages
   */
  _typeToExtensionMap: {
    // Image
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/bmp': 'bmp',
    // Audio
    'audio/mpeg': 'mp3',
    'audio/mp4': 'm4a',
    'audio/ogg': 'ogg',
    'audio/webm': 'webm',
    'audio/3gpp': '3gp',
    'audio/amr': 'amr',
    'audio/x-wav': 'wav',
    'audio/x-midi': 'mid',
    'audio/acc': 'acc',
    // Video
    'video/mp4': 'mp4',
    'video/mpeg': 'mpg',
    'video/ogg': 'ogg',
    'video/webm': 'webm',
    'video/3gpp': '3gp',
    'video/3gpp2': '3g2',
    /*
     * Application
     * If we want to support some types, like pdf, just add
     * 'application/pdf': 'pdf'
     */
    'application/vcard': 'vcf',
    // Text
    'text/vcard': 'vcf',
    'text/x-vcard': 'vcf',
    'text/plain': 'txt',
    'text/kai_plain': 'note'
  },

  /*
   * This list only contains the mimetypes we currently supported
   * We should make it more complete for further usages
   */
  _extensionToTypeMap: {
    // Image
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    jpe: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    bmp: 'image/bmp',
    // Audio
    mp3: 'audio/mpeg',
    m4a: 'audio/mp4',
    m4b: 'audio/mp4',
    m4p: 'audio/mp4',
    m4r: 'audio/mp4',
    aac: 'audio/aac',
    opus: 'audio/ogg',
    amr: 'audio/amr',
    awb: 'audio/amr-wb',
    wav: 'audio/x-wav',
    mid: 'audio/x-midi',
    // Video
    mp4: 'video/mp4',
    mpeg: 'video/mpeg',
    mpg: 'video/mpeg',
    ogv: 'video/ogg',
    ogx: 'video/ogg',
    webm: 'video/webm',
    '3gp': 'video/3gpp',
    '3g2': 'video/3gpp2',
    ogg: 'video/ogg',
    /*
     * Application
     * If we want to support some extensions, like pdf, just add
     * 'pdf': 'application/pdf'
     */
    apk: 'application/vnd.android.package-archive',
    zip: 'application/zip',
    // Text
    vcf: 'text/vcard',
    txt: 'text/plain',
    note: 'text/kai_plain'
  },
  _parseExtension(filename) {
    const array = filename.split('.');
    return array.length > 1 ? array.pop() : '';
  },

  isSupportedType(mimetype) {
    return mimetype in this._typeToExtensionMap;
  },

  isSupportedExtension(extension) {
    return extension in this._extensionToTypeMap;
  },

  isFilenameMatchesType(filename, mimetype) {
    const extension = this._parseExtension(filename);
    const guessedType = this.guessTypeFromExtension(extension);
    return guessedType === mimetype;
  },

  guessExtensionFromType(mimetype) {
    return this._typeToExtensionMap[mimetype];
  },

  guessTypeFromExtension(extension) {
    return this._extensionToTypeMap[extension];
  },

  /*
   * If mimetype is not in the supported list, we will try to
   * predict the possible valid mimetype based on extension.
   */
  guessTypeFromFileProperties(filename, mimetype) {
    const extension = this._parseExtension(filename);
    const type = this.isSupportedType(mimetype)
      ? mimetype
      : this.guessTypeFromExtension(extension);
    return type || '';
  },

  /*
   * If mimetype is not supported, preserve the original extension
   * and add the predict result as new extension.
   * If both filename and mimetype are not supported, return the original
   * filename.
   */
  ensureFilenameMatchesType(filename, mimetype) {
    if (!this.isFilenameMatchesType(filename, mimetype)) {
      const guessedExt = this.guessExtensionFromType(mimetype);
      if (guessedExt) {
        // We should not add the repeat extension name.
        if (this._parseExtension(filename) !== guessedExt) {
          filename += `.${guessedExt}`;
        }
      }
    }
    return filename;
  }
};

window.MimeMapper = MimeMapper;
