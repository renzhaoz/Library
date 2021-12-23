/*
 * This shared module defines a single ImageUtils object in the global scope.
 *
 * ImageUtils.getSizeAndType() takes a Blob as its argument and
 * returns a Promise. If the promise resolves, the resolve method is
 * passed an object with width, height, and type properties. Width and
 * height specify the width and height of the image in pixels. Type
 * specifies the MIME type of the image. If the promise is rejected,
 * the reject method will be passed a string error message.
 *
 * Supported image types are JPEG, PNG, GIF and BMP. The MIME type
 * strings returned when a promise resolves are "image/jpeg",
 * "image/png", "image/gif", and "image/bmp".
 *
 * If you pass a blob that holds an image of some other type (or a
 * blob that is not an image at all) then promise will be rejected.
 *
 * getSizeAndType() does not decode the image to determine its size
 * because can require large amounts of memory. Instead, it parses the
 * image file to determine its size and typically only needs to read a
 * prefix of the file into memory.
 *
 * getSizeAndType() differs from the getImageSize() function defined
 * in shared/js/media/immage_size.js. That function is similar but
 * also parses EXIF metadata for JPEG images and is only suitable if
 * you need to access EXIF data.
 */
// Define constants for the MIME types we use
import Downsample from './downsample';

const JPEG = 'image/jpeg';
const PNG = 'image/png';
const GIF = 'image/gif';
const BMP = 'image/bmp';

const ImageUtils = {
  getSizeAndType: function getSizeAndType(imageBlob) {
    if (!(imageBlob instanceof Blob)) {
      return Promise.reject(new TypeError('argument is not a Blob'));
    }

    return new Promise((resolve, reject) => {
      if (imageBlob.size <= 16) {
        reject(new TypeError('corrupt image file'));
        return;
      }

      // Start off assuming that we'll read the first 32kb of the file
      let bytesToRead = 32 * 1024;

      // But if the blob indicates that this is a PNG, GIF, or BMP, then
      // we can read less since the size information is always close to the
      // start of the file for those formats.
      if (imageBlob.type === PNG
        || imageBlob.type === GIF
        || imageBlob.type === BMP) {
        bytesToRead = 512;
      }


      // If we got the size and type data, resolve the promise
      function success(data) {
        resolve(data);
      }

      // If we didn't find the data even after a second attempt then reject.
      function failure(data) {
        reject(data.error);
      }

      // If we didn't find it, try again for JPEG files
      function tryagain(data) {
        // If we were able to verify that this blob is a jpeg file
        // then we will try again because in JPEG files, the size
        // comes after the EXIF data so if there is a large preview image,
        // the size might be more than 32kb into the file
        if (data.type === JPEG) {
          this.findSizeAndType(imageBlob, imageBlob.size, success, failure);
        } else {
          // For all other known image types the type and size data is
          // near the start of the file, if we didn't find it on this first
          // try we need to give up now.
          reject(data.error);
        }
      }

      // Try to find the information we want in the first bytes of the file
      this.findSizeAndType(imageBlob, bytesToRead, success, tryagain);
    });
  },

  // This is the internal helper function that actually reads the blob
  // and finds type and size information.
  findSizeAndType: function fst(imageBlob, amountToRead, success, failure) {
    const slice = imageBlob.slice(0, Math.min(amountToRead, imageBlob.size));
    const reader = new FileReader();
    reader.readAsArrayBuffer(slice);
    reader.onloadend = () => {
      this.parseImageData(imageBlob, reader.result, success, failure);
    };
  },

  parseImageData: function pid(imageBlob, buffer, success, failure) {
    const header = new Uint8Array(buffer, 0, 16);
    const view = new DataView(buffer);

    if (0x89 === header[0]
      && 0x50 === header[1] /* P */
      && 0x4e === header[2] /* N */
      && 0x47 === header[3] /* G */
      && 0x0d === header[4] /* \r */
      && 0x0a === header[5] /* \n */
      && 0x1A === header[6]
      && 0x0a === header[7]
      && 0x49 === header[12] /* I */
      && 0x48 === header[13] /* H */
      && 0x44 === header[14] /* D */
      && 0x52 === header[15]) { /* R */
      // This is a PNG file
      try {
        success({
          type: PNG,
          width: view.getUint32(16, false), // 32 bit big endian width
          height: view.getUint32(20, false) // 32 bit big endian height
        });
      } catch (ex) {
        failure({ error: ex.toString() });
      }
    } else if (0x47 === header[0] /* G */
            && 0x49 === header[1] /* I */
            && 0x46 === header[2] /* F */
            && 0x38 === header[3] /* 8 */
            && (0x37 === header[4] /* 7 */
            || 0x39 === header[4]) /* or 9 */
            && 0x61 === header[5]) { /* a */
      // This is a GIF file
      try {
        success({
          type: GIF,
          width: view.getUint16(6, true), // 16-bit little endian width
          height: view.getUint16(8, true) // 16-big little endian height
        });
      } catch (ex) {
        failure({ error: ex.toString() });
      }
    } else if (0x42 === header[0] /* B */
            && 0x4D === header[1] /* M */
            && view.getUint32(2, true) === imageBlob.size) {
      // This is a BMP file
      try {
        let viewWidth;
        let viewHeight;

        if (12 === view.getUint16(14, true)) { // check format version
          viewWidth = view.getUint16(18, true); // 16-bit little endian width
          viewHeight = view.getUint16(20, true); // 16-bit little endian height
        } else { // newer versions of the format use 32-bit ints
          viewWidth = view.getUint32(18, true); // 32-bit little endian width
          viewHeight = view.getUint32(22, true); // 32-bit little endian height
        }

        success({
          type: BMP,
          width: viewWidth,
          height: viewHeight
        });
      } catch (ex) {
        failure({ error: ex.toString() });
      }
    } else if (0xFF === header[0]
             && 0xD8 === header[1]) {
      const value = {
        type: JPEG
      };

      // This is a JPEG file. To find its width and height we need
      // to skip past the EXIF data and find the start of image data.
      try {
        let offset = 2;

        // Loop through the segments of the file until we find an SOF
        // segment with image size or until we reach the end of our data.
        for (;;) {
          // The byte at the current offset should be 0xFF marking
          // the start of a new segment.
          if (view.getUint8(offset) !== 0xFF) {
            failure({ error: 'corrupt JPEG file' });
          }
          const segmentType = view.getUint8(offset + 1);
          const segmentSize = view.getUint16(offset + 2) + 2;

          // If we found an SOF "Start of Frame" segment, we can get
          // the image size from it.
          if ((segmentType >= 0xC0 && segmentType <= 0xC3)
           || (segmentType >= 0xC5 && segmentType <= 0xC7)
           || (segmentType >= 0xC9 && segmentType <= 0xCB)
           || (segmentType >= 0xCD && segmentType <= 0xCF)) {
            // 16-bit big-endian dimensions, height first
            value.height = view.getUint16(offset + 5, false);
            value.width = view.getUint16(offset + 7, false);
            success(value);
            break;
          }

          // Otherwise, move on to the next segment
          offset += segmentSize;

          // We may not have read the entire file into our array buffer
          // so we have to make sure we have not gone past the end of
          // the buffer before looping again. Note that in this case
          // the object we pass to the failure callback includes the
          // image type. This is a signal to getSizeAndType that it
          // should try again with a larger ArrayBuffer.
          if (offset + 9 > view.byteLength) {
            value.error = 'corrupt JPEG file';
            failure(value);
            break;
          }
        }
      } catch (ex) {
        failure({ error: ex.toString() });
      }
    } else {
      failure({ error: 'unknown image type' });
    }
  },

  //
  // Given a blob containing an image file, this function returns a
  // Promise that will resolve to a blob for an image file that has
  // the specified width and height. If the blob already has that
  // size, it is returned unchanged. If the image is bigger than the
  // specified size, then it will be shrunk and cropped as necessary
  // to fit the specified dimensions.  If the image is smaller than
  // the specified size, it will be enlarged and cropped to fit. The
  // cropping is done in the same way as with the CSS
  // background-size:cover attribute.
  //
  // If the image is resized and outputType is "image/jpeg" or
  // "image/png" then that type will be used for the resized image. If
  // a JPEG or PNG image is resized and outputType is not specified,
  // then the output image will have the same type as the input image.
  // In all other cases, a resized image will be encoded as a PNG image.
  // Note that when an image does not need to be resized its type is not
  // changed, even if outputType is specified.
  // 'encoderOptions' is passed 'as is' to the 'toBlob' method of canvas:
  //    A Number between 0 and 1 indicating image quality if the requested type
  //    is image/jpeg or image/webp. If this argument is anything else,
  //    the default value for image quality is used.
  resizeAndCropToCover: function ract(inputImageBlob, outputWidth, outputHeight,
    outputType, encoderOptions) {
    if (!outputWidth || outputWidth <= 0 || !outputHeight || outputHeight <= 0) {
      return Promise.reject(new TypeError('invalid output dimensions'));
    }

    // Decode the image in an <img> element, resize and/or crop it into a
    // <canvas> and the re-encode it to a blob again. Returns a Promise
    // that resolves to the encoded blob.
    function resize(data) {
      const inputType = data.type;
      const inputWidth = data.width;
      const inputHeight = data.height;
      let newOutputType = outputType;
      // Ignore invalid outputType parameters
      if (outputType && outputType !== JPEG && outputType !== PNG) {
        newOutputType = undefined;
      }

      // Determine the output type if none was specified.
      if (!outputType) {
        if (inputType === JPEG || inputType === PNG) {
          newOutputType = inputType;
        } else {
          newOutputType = PNG;
        }
      }

      // Get a URL for the image blob so we can ask gecko to decode it.
      const url = URL.createObjectURL(inputImageBlob);

      // If we can downsample the image while decoding it, then add a
      // #-moz-samplesize media fragment to the URL. For large JPEG inputs
      // this can save megabytes of memory.
      let mediaFragment;
      if (inputType === JPEG
        && inputWidth > outputWidth && inputHeight > outputHeight) {
        // How much would we like to scale the image by while decoding?
        const reduction = Math.max(outputWidth / inputWidth,
          outputHeight / inputHeight);
        // Get a media fragment that will downsample the image by up to
        // this amount.
        mediaFragment = Downsample.sizeNoMoreThan(reduction);
      } else {
        mediaFragment = '';
      }

      // The next step is to decode (while possibly downsampling) the
      // image, but that is asynchronous, so we'll have to return a
      // Promise to handle that
      return new Promise((resolve, reject) => {
        const offscreenImage = new Image();
        offscreenImage.src = url + mediaFragment;

        function cleanupImage() {
          offscreenImage.onerror = '';
          offscreenImage.onload = '';
          offscreenImage.src = '';
          URL.revokeObjectURL(url);
        }

        offscreenImage.onerror = () => {
          cleanupImage();
          reject(new TypeError('failed to decode image'));
        };

        offscreenImage.onload = () => {
          // The image has been decoded now, so we know its actual size.
          // If getSizeAndType failed, or if we used a media fragment then
          // this may be different than the inputWidth and inputHeight
          // values we used previously.
          const actualWidth = offscreenImage.width;
          const actualHeight = offscreenImage.height;

          // Now figure how much we have to scale the decoded image down
          // (or up) so that it covers the specified output dimensions.
          const widthScale = outputWidth / actualWidth;
          const heightScale = outputHeight / actualHeight;
          const scale = Math.max(widthScale, heightScale);

          // Scaling the output dimensions by this much tells us the
          // dimensions of the crop area on the decoded image
          const cropWidth = Math.round(outputWidth / scale);
          const cropHeight = Math.round(outputHeight / scale);

          // Now center that crop region within the decoded image
          const cropLeft = Math.floor((actualWidth - cropWidth) / 2);
          const cropTop = Math.floor((actualHeight - cropHeight) / 2);

          // Set up the canvas we need to copy the crop region into
          const canvas = document.createElement('canvas');
          canvas.width = outputWidth;
          canvas.height = outputHeight;
          const canvasContext = canvas.getContext('2d', { willReadFrequently: true });

          // Copy the image into the canvas
          canvasContext.drawImage(offscreenImage,
            cropLeft, cropTop, cropWidth, cropHeight,
            0, 0, outputWidth, outputHeight);

          // We're done with the image now: try to release the decoded
          // image memory as fast as we can
          cleanupImage();

          // Now encode the pixels in the canvas as an image blob
          canvas.toBlob((blob) => {
            // We've got the encoded image in the blob, so we don't need
            // the pixels in the canvas anymore. Try to release that memory
            // right away, too.
            canvas.width = 0;
            resolve(blob);
          }, newOutputType, encoderOptions);
        };
      });
    }

    return this.getSizeAndType(inputImageBlob).then(
      (data) => {
        const inputWidth = data.width;
        const inputHeight = data.height;

        // If the image already has the desired size, just return it unchanged
        if (inputWidth === Math.round(outputWidth) && inputHeight === Math.round(outputHeight)) {
          return inputImageBlob;
        }

        // Otherwise, return a promise for the resized image
        return resize(data);
      }, () => resize(inputImageBlob, {})
    );
  }
};

export default ImageUtils;
