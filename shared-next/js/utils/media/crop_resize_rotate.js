/* exported cropResizeRotate */
/* global getImageSize, Downsample*/

/*
 *
 * Given a blob that represents an encoded image, decode the image, crop it,
 * rotate it, resize it, encode it again and pass the encoded blob to the
 * callback.
 *
 * If the image includes EXIF orientation information, it will be
 * rotated and/or mirrored so that the proper side is up and EXIF
 * orientation information will not be needed in the output blob. The
 * blob will not include any EXIF data.
 *
 * The cropRegion argument is optional. If specfied, it should be an
 * object with left, top, width and height properties that specify the
 * region of interest in the image. These coordinates should be
 * specified as if the image has already been rotated and mirrored. If
 * this argument is not specified, then no cropping is done and the
 * entire image is returned.
 *
 * The outputSize argument specifies the desired size of the output
 * image.  If not specified, then the image is returned full-size. If
 * this argument is specified, then it should be an object with width
 * and height properties or a single number.  If outputSize is an
 * object, then the returned image will have the specified size or
 * smaller. If the aspect ratio of the output size does not match the
 * aspect ratio of the original image or of the crop region, then the
 * largest area of the input region that fits the output size without
 * letterboxing will be used. If the output size is larger than the
 * crop region, then the output size is reduced to match the crop
 * region.
 *
 * If outputSize is a number, then the #-moz-samplesize media fragment
 * will be used, if necessary, to ensure that the input image is
 * decoded at the specified size or smaller. Note that this media
 * fragment gives only coarse control over image size, so passing a
 * number for this argument can result in the image being decoded at a
 * size substantially smaller than the specified value. If outputSize
 * is a number and a crop region is specified, the image will
 * typically be downsampled and then cropped, further reducing the
 * size of the resulting image. On the other hand, if the crop region
 * is small enough, then the function may be able to use the #xywh=
 * media fragment to extract just the desired region of the rectangle
 * without downsampling. Whichever approach requires less image memory
 * is used.
 *
 * The outputType argument specifies the type of the output image. Legal
 * values are "image/jpeg" and "image/png". If not specified, and if the
 * input image does not need to be cropped resized or rotated, then it
 * will be returned unchanged regardless of the type. If no output type
 * is specified and a new blob needs to be created then "image/jpeg" will
 * be used. If a type is explicitly specified, and does not match the type
 * of the input image, then a new blob will be created even if no other
 * changes to the image are necessary.
 *
 * The optional metadata argument provides a way to pass in image size and
 * rotation metadata if you already have it. If this argument is omitted
 * or null, getImageSize() will be used to compute the metadata. But if you
 * have already called getImageSize() on the blob, you can provide the
 * metadata you have and avoid having to reparse the blob.
 *
 * The callback argument should be a function that expects two arguments.
 * If the image is successfully processed, the first argument will be null
 * and the second will be a blob.  If there was an error, the first argument
 * will be an error message and the second argument will be undefined.
 *
 * If no cropRegion and no outputSize are specified, if the type of the
 * input blob matches the requested outputType, and if the image does not
 * require any rotation, then this function will not do any work and will
 * simply pass the input blob to the callback.
 *
 * This function requires other shared JS files:
 *
 *    shared/js/blobview.js
 *    shared/js/media/image_size.js
 *    shared/js/media/jpeg_metadata_parser.js
 *    shared/js/media/downsample.js
 *
 */
function cropResizeRotate( // eslint-disable-line
  blob,
  cropRegion,
  outputSize,
  outputType,
  metaData,
  handleDone
) {
  const JPEG = 'image/jpeg';
  const PNG = 'image/png';
  /*
   * The 2nd, 3rd, 4th and 5th arguments are optional, so fix things up if we're
   * called with fewer than 6 args. The last argument is always the callback.
   */
  switch (arguments.length) {
    case 2:
      handleDone = cropRegion;
      cropRegion = null;
      outputSize = null;
      outputType = null;
      metaData = null;
      break;
    case 3:
      handleDone = outputSize;
      outputSize = null;
      outputType = null;
      metaData = null;
      break;
    case 4:
      handleDone = outputType;
      outputType = null;
      metaData = null;
      break;
    case 5:
      handleDone = metaData;
      metaData = null;
      break;
    case 6:
      break;
    default:
      throw new Error(`wrong number of arguments: ${arguments.length}`);
  }
  if (cropRegion) {
    // Make a private copy
    cropRegion = {
      left: cropRegion.left,
      top: cropRegion.top,
      width: cropRegion.width,
      height: cropRegion.height
    };
  }
  if (outputSize && typeof outputSize === 'object') {
    // Make a private copy
    outputSize = {
      width: outputSize.width,
      height: outputSize.height
    };
  }
  /*
   * If we were passed a metadata object, pass it to gotSize. Otherwise,
   * find the metadata object first and then pass it.
   */
  if (metaData) {
    gotSize(metaData);
  } else {
    getImageSize(blob, gotSize, msg => {
      handleDone(msg);
    });
  }

  function gotSize(metadata) {
    // This is the full size of the image in the input coordiate system
    const rawImageWidth = metadata.width;
    const rawImageHeight = metadata.height;
    const fullSize = rawImageWidth * rawImageHeight;
    const rotation = metadata.rotation || 0;
    const mirrored = metadata.mirrored || false;
    /*
     * Compute the full size of the image in the output coordinate system
     * I.e. if the image is sideways, swap the width and height
     */
    let rotatedImageWidth = rawImageHeight;
    let rotatedImageHeight = rawImageWidth;
    if (rotation === 0 || rotation === 180) {
      rotatedImageWidth = rawImageWidth;
      rotatedImageHeight = rawImageHeight;
    }
    /*
     * If there is no crop region, use the full, rotated image.
     * If there is a crop region, make sure it fits inside the image.
     */
    if (!cropRegion) {
      cropRegion = {
        left: 0,
        top: 0,
        width: rotatedImageWidth,
        height: rotatedImageHeight
      };
    } else if (
      cropRegion.left < 0 ||
      cropRegion.top < 0 ||
      cropRegion.left + cropRegion.width > rotatedImageWidth ||
      cropRegion.top + cropRegion.height > rotatedImageHeight
    ) {
      handleDone('crop region does not fit inside image');
      return;
    }
    /*
     * If there is no output size, use the size of the crop region.
     * If there is an output size make sure it is smaller than the crop region
     * and then adjust the crop region as needed so that the aspect ratios
     * match
     */
    if (outputSize === null || outputSize === undefined) {
      outputSize = {
        width: cropRegion.width,
        height: cropRegion.height
      };
    } else if (typeof outputSize === 'number') {
      if (outputSize <= 0) {
        handleDone('outputSize must be positive');
        return;
      }
      if (fullSize < outputSize) {
        /*
         * If the full size of the image is less than the image decode size
         * limit, then we can decode the image at full size and use the full
         * crop region dimensions as the output size. Note that we can't just
         * compare the size of the crop region to the output size, because
         * even if we use the #xywh media fragment when decoding the image,
         * gecko still requires memory to decode the full image.
         */
        outputSize = {
          width: cropRegion.width,
          height: cropRegion.height
        };
      } else {
        /*
         * In this case we need to specify an output size that is small
         * enough that we will be forced below to use #-moz-samplesize
         * to downsample the image while decoding it.
         * Note that we base this samplesize computation on the full size
         * of the image, because we can't use the #-moz-samplesize media
         * fragment along with the #xywh media fragment, so if we're using
         * samplesize we're going to have to decode the full image.
         */
        const ds = Downsample.areaAtLeast(outputSize / fullSize);
        /*
         * Now that we've figured out how much the full image will be
         * downsampled, scale the crop region to match.
         */
        outputSize = {
          width: ds.scale(cropRegion.width),
          height: ds.scale(cropRegion.height)
        };
      }
    }
    if (!(outputSize.width > 0 && outputSize.height > 0)) {
      handleDone('outputSize width and height must be positive');
      return;
    }
    /*
     * If the outputSize is bigger than the crop region, just adjust
     * the output size to match.
     */
    if (outputSize.width > cropRegion.width) {
      outputSize.width = cropRegion.width;
    }
    if (outputSize.height > cropRegion.height) {
      outputSize.height = cropRegion.height;
    }
    /*
     * How much do we have to scale the crop region in X and Y dimensions
     * to match the output size?
     */
    const scaleX = outputSize.width / cropRegion.width;
    const scaleY = outputSize.height / cropRegion.height;
    /*
     * We now adjust the crop region to match the output size. For
     * example if the outputSize is 200x200 and the cropRegion is
     * 600x400, then scaleX is .33 and scaleY is .5. In this case we can
     * leave the height of the crop region alone, but we need to reduce
     * the width of the crop region and adjust the left of the crop region
     */
    if (scaleY > scaleX) {
      // Adjust width of crop region
      const oldCropWidth = cropRegion.width;
      cropRegion.width = Math.round(outputSize.width / scaleY);
      cropRegion.left += (oldCropWidth - cropRegion.width) >> 1;
    } else if (scaleX > scaleY) {
      // Adjust height of crop region
      const oldCropHeight = cropRegion.height;
      cropRegion.height = Math.round(outputSize.height / scaleX);
      cropRegion.top += (oldCropHeight - cropRegion.height) >> 1;
    }
    // Make sure the outputType is valid, if one was specified
    if (outputType && outputType !== JPEG && outputType !== PNG) {
      handleDone(`unsupported outputType: ${outputType}`);
      return;
    }
    /*
     * Now that we've done these computations, we can pause for a moment
     * to see if there is actually any work that needs doing here. If not
     * we can just pass the input blob unchanged through to the callback
     */
    if (
      rotation === 0 && // No need to rotate
      !mirrored && // Or to mirror the image.
      (!outputType || // Don't care about output type
        blob.type === outputType) && // Or type is unchanged.
      outputSize.width === rotatedImageWidth && // Doesn't need crop or resize.
      outputSize.height === rotatedImageHeight
    ) {
      handleDone(null, blob);
      return;
    }
    const inputCropRegion = {
      left: cropRegion.left,
      top: cropRegion.top,
      width: cropRegion.width,
      height: cropRegion.height
    };
    // In order to decode the image, we create a blob:// URL for it
    const baseURL = URL.createObjectURL(blob);
    /*
     * Decoding an image takes a lot of memory and we want to minimize that.
     * Gecko allows us to use media fragments with our image URL to specify
     * that we do not want it to decode all of the pixels in the image. The
     * #-moz-samplesize= fragment allows us to specify that JPEG images
     * should be downsampled while being decoded, and this can save a lot of
     * memory. If we are not going to downsample the image, but are going to
     * crop it, then the #xywh= media fragment can help us do the cropping
     * more efficiently. If we use #xywh, Gecko still has to decode the image
     * at full size, so peak memory usage is not reduced. But Gecko can then
     * crop the image and free memory more quickly that it would otherwise.
     */
    const croppedsize = cropRegion.width * cropRegion.height;
    let downsample = Downsample.NONE;
    let sampledsize = fullSize;
    /*
     * If we decode the image with a #-moz-samplesize media fragment, both
     * the x and y dimensions are reduced by the sample size, so the total
     * number of pixels is reduced by the square of the sample size.
     */
    if (blob.type === JPEG) {
      /*
       * What media fragment can we use to downsample the crop region
       * so that it is as small as possible without being smaller than
       * the output size? We know that the output size and crop
       * region have the same aspect ratio now, so we only have to
       * consider one dimension. If we passed in a single number outputSize
       * up above then we Downsample.areaAtLeast() to compute the outputSize.
       * We should now get the same media fragment value here.
       */
      downsample = Downsample.sizeNoMoreThan(
        outputSize.width / cropRegion.width
      );
      /*
       * And if apply that media fragment to the entire image, how big is
       * the result?
       */
      sampledsize =
        downsample.scale(rawImageWidth) * downsample.scale(rawImageHeight);
    }
    // Now add the appropriate media fragments to the url
    let url = null;
    let croppedWithMediaFragment = false,
      resizedWithMediaFragment = false;
    if (sampledsize < fullSize) {
      // Use a #-moz-samplesize media fragment to downsample while decoding
      url = baseURL + downsample;
      resizedWithMediaFragment = true;
    } else if (croppedsize < fullSize) {
      /*
       * Use a #xywh media fragment to crop while decoding.
       * This conveniently does the cropping for us, but doesn't actually
       * save any memory because gecko still decodes the image at fullSize
       * before cropping it internally. So we only use this media fragment
       * if we were not going to do any downsampling.
       */
      url = `${baseURL}#xywh=${inputCropRegion.left},${inputCropRegion.top},${inputCropRegion.width},${inputCropRegion.height}`;

      croppedWithMediaFragment = true;
    } else {
      // No media fragments in this case
      url = baseURL;
    }
    // Now we've done our calculations and we have an image URL to decode
    const offscreenImage = new Image();
    offscreenImage.onerror = () => {
      cleanupImage();
      handleDone(`error decoding image: ${url}`);
    };
    offscreenImage.onload = gotImage;
    offscreenImage.src = url;
    // Called when the image has loaded
    function gotImage() {
      /*
       * If we used a media fragment on the image url, we can now
       * check whether the image we got has the expected size. And if it
       * does, we need to adjust the crop region to match the cropped or
       * resized image.
       */
      if (croppedWithMediaFragment) {
        if (
          offscreenImage.width === inputCropRegion.width &&
          offscreenImage.height === inputCropRegion.height
        ) {
          /*
           * We got the cropped size we asked for, so adjust the inputCropRegion
           * so that we don't crop again
           */
          inputCropRegion.left = 0;
          inputCropRegion.top = 0;
        }
      } else if (resizedWithMediaFragment) {
        if (
          offscreenImage.width < rotatedImageWidth ||
          offscreenImage.height < rotatedImageHeight
        ) {
          /*
           * If we got an image that is smaller than full size, then the image
           * was downsampled while decoding, but it may still need cropping.
           * We reduce the crop region proportionally to the downsampling.
           */
          const sampleSizeX = rotatedImageWidth / offscreenImage.width;
          const sampleSizeY = rotatedImageHeight / offscreenImage.height;
          inputCropRegion.left = Math.round(inputCropRegion.left / sampleSizeX);
          inputCropRegion.top = Math.round(inputCropRegion.top / sampleSizeY);
          inputCropRegion.width = Math.round(
            inputCropRegion.width / sampleSizeX
          );
          inputCropRegion.height = Math.round(
            inputCropRegion.height / sampleSizeY
          );
        }
      }
      // We've decoded the image now, so create a canvas we can copy it into
      let canvas = document.createElement('canvas');
      canvas.width = outputSize.width;
      canvas.height = outputSize.height;
      /*
       * Since we're only using the canvas as a way to encode the image
       * we set this willReadFrequently flag as a hint so that we avoid
       * copying the image data to and from the GPU since we don't do any
       * GPU operations on it
       */
      let context = canvas.getContext('2d', { willReadFrequently: true });
      try {
        /*
         * Now we copy the image into the canvas.
         * The image has been loaded, but not decoded yet. If the image file
         * appears to be valid and has valid width and height metadata, then
         * the onload event handler will fire. But if the image is corrupt
         * or too big for gecko to decode with the amount of available
         * memory, then this drawImage() call can fail with an exception.
         */
        context.drawImage(
          offscreenImage,
          inputCropRegion.left,
          inputCropRegion.top,
          inputCropRegion.width,
          inputCropRegion.height,
          0,
          0,
          outputSize.width,
          outputSize.height
        );
      } catch (e) {
        handleDone(
          `${'Failed to decode image in cropResizeRotate; ' +
            'image may be corrupt or too large: '}${e}`
        );
        return;
      } finally {
        /*
         * Once the image has been copied, we can release the decoded image
         * memory and the blob URL.
         */
        cleanupImage();
      }
      // Finally, encode the image into a blob
      canvas.toBlob(newBlob => {
        /*
         * We have the encoded image but before we pass it to the callback
         * we need to free the canvas.
         */
        canvas.width = 0;
        canvas.height = 0;
        canvas = null;
        context = null;
        handleDone(null, newBlob);
      }, outputType || JPEG);
    }

    function cleanupImage() {
      offscreenImage.onerror = '';
      offscreenImage.onload = '';
      offscreenImage.src = '';
      URL.revokeObjectURL(url);
    }
  }
}

window.cropResizeRotate = cropResizeRotate;
