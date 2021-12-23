/*
  global BlobView
*/

/*
 *
 * This file defines a single function that asynchronously reads a
 * JPEG file (or blob) to determine its width and height and find the
 * location and size of the embedded preview image, if it has one. If
 * it succeeds, it passes an object containing this data to the
 * specified callback function. If it fails, it passes an error message
 * to the specified error function instead.
 *
 * This function is capable of parsing and returning EXIF data for a
 * JPEG file, but for speed, it ignores all EXIF data except the embedded
 * preview image and the image orientation.
 *
 * This function requires the BlobView utility class
 *
 */
function parseJPEGMetadata(file, metadataCallback, metadataError) { // eslint-disable-line
  // This is the object we'll pass to metadataCallback
  const metadata = {};
  const exif = {};
  /*
   * Start off reading a 16kb slice of the JPEG file.
   * Hopefully, this will be all we need and everything else will
   * be synchronous
   */
  BlobView.get(file, 0, Math.min(16 * 1024, file.size), data => {
    if (
      data.byteLength < 2 ||
      data.getUint8(0) !== 0xff ||
      data.getUint8(1) !== 0xd8
    ) {
      metadataError('Not a JPEG file');
      return;
    }
    /*
     * Now start reading JPEG segments
     * getSegment() and segmentHandler() are defined below.
     */
    getSegment(data, 2, segmentHandler);
  });

  /*
   * Read the JPEG segment at the specified offset and
   * pass it to the callback function.
   * Offset is relative to the current data offsets.
   * We assume that data has enough data in it that we can
   * can determine the size of the segment, and we guarantee that
   * we read extra bytes so the next call works
   */
  function getSegment(data, offset, getSegmentSuccess) {
    try {
      const header = data.getUint8(offset);
      if (header !== 0xff) {
        metadataError('Malformed JPEG file: bad segment header');
        return;
      }
      const type = data.getUint8(offset + 1);
      const size = data.getUint16(offset + 2) + 2;
      // The absolute position of the segment
      const start = data.sliceOffset + data.viewOffset + offset;
      /*
       * If this isn't the last segment in the file, add 4 bytes
       * so we can read the size of the next segment
       */
      const isLast = start + size >= file.size;
      const length = isLast ? size : size + 4;
      data.getMore(start, length, newData => {
        getSegmentSuccess(type, size, newData, isLast);
      });
    } catch (e) {
      metadataError(`${e.toString()}\n${e.stack}`);
    }
  }

  /*
   * This is a callback function for getNextSegment that handles the
   * various types of segments we expect to see in a jpeg file
   */
  function segmentHandler(type, size, data, isLastSegment) { // eslint-disable-line
    try {
      switch (type) {
        case 0xc0: // Some actual image data, including image dimensions
        case 0xc1:
        case 0xc2:
        case 0xc3:
          // Get image dimensions
          metadata.height = data.getUint16(5);
          metadata.width = data.getUint16(7);
          if (type === 0xc2) {
            /*
             * Pjpeg files can't be efficiently downsampled while decoded
             * so we need to distinguish them from regular jpegs
             */
            metadata.progressive = true;
          }
          /*
           * We're done. All the EXIF data will come before this segment
           * So call the callback
           */
          metadataCallback(metadata);
          break;
        case 0xe1: // APP1 segment. Probably holds EXIF metadata
          parseAPP1(data);
          if (isLastSegment) {
            metadataError('unexpected end of JPEG file');
          } else {
            getSegment(data, size, segmentHandler);
          }
          break;
        default:
          // A segment we don't care about, so just go on and read the next one
          if (isLastSegment) {
            metadataError('unexpected end of JPEG file');
          } else {
            getSegment(data, size, segmentHandler);
          }
          break;
      }
    } catch (e) {
      metadataError(`${e.toString()}\n${e.stack}`);
    }
  }

  function parseAPP1(data) {
    if (data.getUint32(4, false) === 0x45786966) {
      parseEXIFData(data);
      if (exif.THUMBNAIL && exif.THUMBNAILLENGTH) {
        const start = data.sliceOffset + data.viewOffset + 10 + exif.THUMBNAIL;
        metadata.preview = {
          start,
          end: start + exif.THUMBNAILLENGTH
        };
      }
      // Map exif orientation flags for easy transforms
      switch (exif.ORIENTATION) {
        case 1:
          metadata.rotation = 0;
          metadata.mirrored = false;
          break;
        case 2:
          metadata.rotation = 0;
          metadata.mirrored = true;
          break;
        case 3:
          metadata.rotation = 180;
          metadata.mirrored = false;
          break;
        case 4:
          metadata.rotation = 180;
          metadata.mirrored = true;
          break;
        case 5:
          metadata.rotation = 90;
          metadata.mirrored = true;
          break;
        case 6:
          metadata.rotation = 90;
          metadata.mirrored = false;
          break;
        case 7:
          metadata.rotation = 270;
          metadata.mirrored = true;
          break;
        case 8:
          metadata.rotation = 270;
          metadata.mirrored = false;
          break;
        default:
          /*
           * This is the default orientation. If it is properly encoded
           * we will get 1 here. But sometimes it is undefined and some
           * files have a 0 here as well.
           */
          metadata.rotation = 0;
          metadata.mirrored = false;
          break;
      }
    }
  }

  /*
   * Parse an EXIF segment from a JPEG file and return an object
   * of metadata attributes. The argument must be a DataView object
   */
  function parseEXIFData(data) {
    let byteorder = data.getUint8(10);
    if (byteorder === 0x4d) {
      // Big endian
      byteorder = false;
    } else if (byteorder === 0x49) {
      // Little endian
      byteorder = true;
    } else {
      throw Error('invalid byteorder in EXIF segment');
    }
    if (data.getUint16(12, byteorder) !== 42) {
      // Magic number
      throw Error('bad magic number in EXIF segment');
    }
    const offset = data.getUint32(14, byteorder);
    /*
     * This is how we would parse all EXIF metadata more generally.
     * Especially need for iamge orientation
     */
    parseIFD(data, offset + 10, byteorder, true);
    /*
     * I'm leaving this code in as a comment in case we need other EXIF
     * data in the future.
     * if (exif.EXIFIFD) {
     *   parseIFD(data, exif.EXIFIFD + 10, byteorder);
     *   delete exif.EXIFIFD;
     * }
     */

    /*
     * If (exif.GPSIFD) {
     *   parseIFD(data, exif.GPSIFD + 10, byteorder);
     *   delete exif.GPSIFD;
     * }
     */

    /*
     * Instead of a general purpose EXIF parse, we're going to drill
     * down directly to the thumbnail image.
     * We're in IFD0 here. We want the offset of IFD1
     */
    const ifd0entries = data.getUint16(offset + 10, byteorder);
    const ifd1 = data.getUint32(offset + 12 + 12 * ifd0entries, byteorder);
    // If there is an offset for IFD1, parse that
    if (ifd1 !== 0) {
      parseIFD(data, ifd1 + 10, byteorder, true);
    }
  }

  function parseIFD(data, offset, byteorder, onlyParseOne) { // eslint-disable-line
    const numentries = data.getUint16(offset, byteorder);
    for (let i = 0; i < numentries; i++) {
      parseEntry(data, offset + 2 + 12 * i, byteorder);
    }
    if (onlyParseOne) {
      return;
    }
    const next = data.getUint32(offset + 2 + 12 * numentries, byteorder);
    if (next !== 0 && next < file.size) {
      parseIFD(data, next + 10, byteorder);
    }
  }

  // Size, in bytes, of each TIFF data type
  const typesize = [
    0, // Unused
    1, // BYTE
    1, // ASCII
    2, // SHORT
    4, // LONG
    8, // RATIONAL
    1, // SBYTE
    1, // UNDEFINED
    2, // SSHORT
    4, // SLONG
    8, // SRATIONAL
    4, // FLOAT
    8 // DOUBLE
  ];

  /*
   * This object maps EXIF tag numbers to their names.
   * Only list the ones we want to bother parsing and returning.
   * All others will be ignored.
   */
  const tagnames = {
    /*
     * We don't currently use any of these EXIF tags for anything.
     *
     *
     * '256': 'ImageWidth',
     * '257': 'ImageHeight',
     * '40962': 'PixelXDimension',
     * '40963': 'PixelYDimension',
     * '306': 'DateTime',
     * '315': 'Artist',
     * '33432': 'Copyright',
     * '36867': 'DateTimeOriginal',
     * '33434': 'ExposureTime',
     * '33437': 'FNumber',
     * '34850': 'ExposureProgram',
     * '34867': 'ISOSpeed',
     * '37377': 'ShutterSpeedValue',
     * '37378': 'ApertureValue',
     * '37379': 'BrightnessValue',
     * '37380': 'ExposureBiasValue',
     * '37382': 'SubjectDistance',
     * '37383': 'MeteringMode',
     * '37384': 'LightSource',
     * '37385': 'Flash',
     * '37386': 'FocalLength',
     * '41986': 'ExposureMode',
     * '41987': 'WhiteBalance',
     * '41991': 'GainControl',
     * '41992': 'Contrast',
     * '41993': 'Saturation',
     * '41994': 'Sharpness',
     * // These are special tags that we handle internally
     * '34665': 'EXIFIFD',         // Offset of EXIF data
     * '34853': 'GPSIFD',          // Offset of GPS data
     */
    '274': 'ORIENTATION',
    '513': 'THUMBNAIL', // Offset of thumbnail
    '514': 'THUMBNAILLENGTH' // Length of thumbnail
  };

  function parseEntry(data, offset, byteorder) { // eslint-disable-line
    const tag = data.getUint16(offset, byteorder);
    const tagname = tagnames[tag];
    // If we don't know about this tag type or already processed it, skip it
    if (!tagname || exif[tagname]) {
      return;
    }
    const type = data.getUint16(offset + 2, byteorder);
    const count = data.getUint32(offset + 4, byteorder);
    const total = count * typesize[type];
    const valueOffset =
      total <= 4 ? offset + 8 : data.getUint32(offset + 8, byteorder);
    exif[tagname] = parseValue(data, valueOffset, type, count, byteorder);
  }

  function parseValue(data, offset, type, count, byteorder) { // eslint-disable-line
    if (type === 2) {
      const codes = [];
      for (let i = 0; i < count - 1; i++) {
        codes[i] = data.getUint8(offset + i);
      }
      return String.fromCharCode.apply(String, codes); // eslint-disable-line
    }
    if (count === 1) {
      return parseOneValue(data, offset, type, byteorder);
    }
    const values = [];
    const size = typesize[type];
    for (let i = 0; i < count; i++) {
      values[i] = parseOneValue(data, offset + size * i, type, byteorder);
    }
    return values;
  }

  function parseOneValue(data, offset, type, byteorder) { // eslint-disable-line
    switch (type) {
      case 1: // BYTE
      case 7: // UNDEFINED
        return data.getUint8(offset);
      case 2: // ASCII
        // This case is handed in parseValue
        return null;
      case 3: // SHORT
        return data.getUint16(offset, byteorder);
      case 4: // LONG
        return data.getUint32(offset, byteorder);
      case 5: // RATIONAL
        return (
          data.getUint32(offset, byteorder) /
          data.getUint32(offset + 4, byteorder)
        );
      case 6: // SBYTE
        return data.getInt8(offset);
      case 8: // SSHORT
        return data.getInt16(offset, byteorder);
      case 9: // SLONG
        return data.getInt32(offset, byteorder);
      case 10: // SRATIONAL
        return (
          data.getInt32(offset, byteorder) /
          data.getInt32(offset + 4, byteorder)
        );
      case 11: // FLOAT
        return data.getFloat32(offset, byteorder);
      case 12: // DOUBLE
        return data.getFloat64(offset, byteorder);
      default:
        break;
    }
    return null;
  }
}

window.parseJPEGMetadata = parseJPEGMetadata;
