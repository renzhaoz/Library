/* exported getImageSize */
/* global BlobView, parseJPEGMetadata */

/*
 * Determine the pixel dimensions of an image without actually
 * decoding the image. Passes an object of metadata to the callback
 * function on success or an error message to the error function on
 * failure. The metadata object will include type, width and height
 * properties. Supported image types are GIF, PNG and JPEG. JPEG
 * metadata may also include information about an EXIF preview image.
 *
 * Because of shortcomings in the way Gecko handles images, the
 * Gallery app will crash with an OOM error if it attempts to decode
 * and display an image that is too big. Images require 4 bytes per
 * pixel, so a 10 megapixel photograph requires 40 megabytes of image
 * memory. This function gives the gallery app a way to reject images
 * that are too large.
 *
 * Requires the BlobView class from shared/js/blobview.js and the
 * parseJPEGMetadata() function from shared/js/media/jpeg_metadata_parser.js
 */
function getImageSize(blob, successHandle, errorHandle) { // eslint-disable-line
  BlobView.get(blob, 0, Math.min(1024, blob.size), data => {
    // Make sure we are at least 8 bytes long before reading the first 8 bytes
    if (data.byteLength <= 8) {
      errorHandle('corrupt image file');
      return;
    }
    const magic = data.getASCIIText(0, 8);
    if (magic.substring(0, 4) === 'GIF8') {
      try {
        successHandle({
          type: 'gif',
          width: data.getUint16(6, true),
          height: data.getUint16(8, true)
        });
      } catch (e) {
        errorHandle(e.toString());
      }
    } else if (magic.substring(0, 8) === '\x89PNG\r\n\x1A\n') {
      try {
        successHandle({
          type: 'png',
          width: data.getUint32(16, false),
          height: data.getUint32(20, false)
        });
      } catch (e) {
        errorHandle(e.toString());
      }
    } else if (
      magic.substring(0, 2) === 'BM' &&
      data.getUint32(2, true) === blob.size
    ) {
      // This is a BMP file
      try {
        let width = data.getUint32(18, true); // 32-bit little endian width
        let height = data.getUint32(22, true); // 32-bit little endian height
        if (data.getUint16(14, true) === 12) {
          width = data.getUint16(18, true); // 16-bit little endian width
          height = data.getUint16(20, true); // 16-bit little endian height
        }
        successHandle({
          type: 'bmp',
          width,
          height
        });
      } catch (e) {
        errorHandle(e.toString());
      }
    } else if (magic.substring(0, 2) === '\xFF\xD8') {
      parseJPEGMetadata(
        blob,
        metadata => {
          if (metadata.progressive) {
            /*
             * If the jpeg parser tells us that this is
             * a progressive jpeg, then treat that as a
             * distinct image type because pjpegs have
             * such different memory requirements than
             * regular jpegs.
             */
            delete metadata.progressive;
            metadata.type = 'pjpeg';
          } else {
            metadata.type = 'jpeg';
          }
          successHandle(metadata);
        },
        errorHandle
      );
    } else {
      errorHandle('unknown image type');
    }
  });
}

window.getImageSize = getImageSize;
