/*
  global BlobView
*/

/*
 *
 * Given an MP4/Quicktime based video file as a blob, read through its
 * atoms to find the track header "tkhd" atom and extract the rotation
 * matrix from it. Convert the matrix value to rotation in degrees and
 * pass that number to the specified callback function. If no value is
 * found but the video file is valid, pass null to the callback. If
 * any errors occur, pass an error message (a string) callback.
 *
 * See also:
 * http://androidxref.com/4.0.4/xref/frameworks/base/media/libstagefright/MPEG4Writer.cpp
 * https://developer.apple.com/library/mac/#documentation/QuickTime/QTFF/QTFFChap2/qtff2.html
 *
 */
(function (exports) { // eslint-disable-line
  function getVideoRotation(videoBlob, rotationCallback) {
    // A utility for traversing the tree of atoms in an MP4 file
    function mp4Parser(blob, handlers) {
      // Start off with a 1024 chunk from the start of the blob.
      BlobView.get(blob, 0, Math.min(1024, blob.size), data => {
        // Make sure that the blob is, in fact, some kind of MP4 file
        if (data.byteLength <= 8 || data.getASCIIText(4, 4) !== 'ftyp') {
          handlers.errorHandler('not an MP4 file');
          return;
        }
        parseAtom(data);
      });

      /*
       * Call this with a BlobView object that includes the first 16 bytes of
       * an atom. It doesn't matter whether the body of the atom is included.
       */
      function parseAtom(data) {
        const offset = data.sliceOffset + data.viewOffset; // Atom position in blob
        let size = data.readUnsignedInt(); // Atom length
        const type = data.readASCIIText(4); // Atom type
        let contentOffset = 8; // Position of content

        if (size === 0) {
          // Zero size means the rest of the file
          size = blob.size - offset;
        } else if (size === 1) {
          // A size of 1 means the size is in bytes 8-15
          size = data.readUnsignedInt() * 4294967296 + data.readUnsignedInt();
          contentOffset = 16;
        }

        const handler = handlers[type] || handlers.defaultHandler;
        if (typeof handler === 'function') {
          /*
           * If the handler is a function, pass that function a
           * DataView object that contains the entire atom
           * including size and type.  Then use the return value
           * of the function as instructions on what to do next.
           */
          data.getMore(data.sliceOffset + data.viewOffset, size, atom => {
            // Pass the entire atom to the handler function
            const rv = handler(atom);

            /*
             * If the return value is 'done', stop parsing.
             * Otherwise, continue with the next atom.
             * XXX: For more general parsing we need a way to pop some
             * stack levels.  A return value that is an atom name should mean
             * pop back up to this atom type and go on to the next atom
             * after that.
             */
            if (rv !== 'done') {
              parseAtomAt(data, offset + size);
            }
          });
        } else if (handler === 'children') {
          /*
           * If the handler is this string, then assume that the atom is
           * a container atom and do its next child atom next
           */
          const skip = type === 'meta' ? 4 : 0; // Special case for meta atoms
          parseAtomAt(data, offset + contentOffset + skip);
        } else if (handler === 'skip' || !handler) {
          /*
           * Skip the atom entirely and go on to the next one.
           * If there is no next one, call the eofHandler or just return
           */
          parseAtomAt(data, offset + size);
        } else if (handler === 'done') {
          // Stop parsing
        }
      }

      function parseAtomAt(data, offset) {
        if (offset >= blob.size) {
          if (handlers.eofHandler) handlers.eofHandler();
        } else {
          data.getMore(offset, 16, parseAtom);
        }
      }
    }

    /*
     * We want to loop through the top-level atoms until we find the 'moov'
     * atom. Then, within this atom, there are one or more 'trak' atoms.
     * Each 'trak' should begin with a 'tkhd' atom. The tkhd atom has
     * a transformation matrix at byte 48.  The matrix is 9 32 bit integers.
     * We'll interpret those numbers as a rotation of 0, 90, 180 or 270.
     * If the video has more than one track, we expect all of them to have
     * the same rotation, so we'll only look at the first 'trak' atom that
     * we find.
     */
    mp4Parser(videoBlob, {
      errorHandler(msg) {
        rotationCallback(msg);
      },
      eofHandler() {
        rotationCallback(null);
      },
      defaultHandler: 'skip', // Skip all atoms other than those listed below
      moov: 'children', // Enumerate children of the moov atom
      trak: 'children', // Enumerate children of the trak atom
      tkhd(data) {
        /*
         * Pass the tkhd atom to this function
         * The matrix begins at byte 48
         */
        data.advance(48);

        const a = data.readUnsignedInt();
        const b = data.readUnsignedInt();
        data.advance(4); // We don't care about this number
        const c = data.readUnsignedInt();
        const d = data.readUnsignedInt();

        if (a === 0 && d === 0) {
          // 90 or 270 degrees
          if (b === 0x00010000 && c === 0xffff0000) rotationCallback(90);
          else if (b === 0xffff0000 && c === 0x00010000) rotationCallback(270);
          else rotationCallback('unexpected rotation matrix');
        } else if (b === 0 && c === 0) {
          // 0 or 180 degrees
          if (a === 0x00010000 && d === 0x00010000) rotationCallback(0);
          else if (a === 0xffff0000 && d === 0xffff0000) rotationCallback(180);
          else rotationCallback('unexpected rotation matrix');
        } else {
          rotationCallback('unexpected rotation matrix');
        }
        return 'done';
      }
    });
  }
  exports.getVideoRotation = getVideoRotation;
})(window);
