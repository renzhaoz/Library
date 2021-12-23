/* eslint-disable no-empty-function, no-invalid-this */
/*
 *     Node-uuid/uuid.js
 *
 *     Copyright (c) 2010 Robert Kieffer
 *     Dual licensed under the MIT and GPL licenses.
 *     Documentation and details at https://github.com/broofa/node-uuid
 */
(function uuidV4() {
  const _global = this;

  /*
   * Unique ID creation requires a high quality random # generator, but
   * Math.random() does not guarantee "cryptographic quality".  So we feature
   * detect for more robust APIs, normalizing each method to return 128-bits
   * (16 bytes) of random data.
   */
  let nodeRNG = () => {};
  const whatwgRNG = () => {};

  // Math.random()-based RNG.  All platforms, very fast, unknown quality
  const _rndBytes = new Array(16);
  const mathRNG = () => {
    let r = 0;
    const b = _rndBytes;
    let i = 0;

    for (i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      b[i] = (r >>> ((i & 0x03) << 3)) & 0xff;
    }

    return b;
  };

  /*
   * Node.js crypto-based RNG - http://nodejs.org/docs/v0.6.2/api/crypto.html
   * Node.js only, moderately fast, high quality
   */
  try {
    // eslint-disable-next-line global-require
    const _rb = require('crypto').randomBytes;
    nodeRNG =
      _rb &&
      function rb() {
        return _rb(16);
      };
  } catch (e) {
    console.error('uuid error!');
  }

  // Select RNG with best quality
  const _rng = mathRNG || nodeRNG || whatwgRNG;

  // Buffer class to use
  // eslint-disable-next-line no-undef
  const BufferClass = typeof Buffer === 'function' ? Buffer : Array;

  // Maps for number <-> hex string conversion
  const _byteToHex = [];
  const _hexToByte = {};
  for (let i = 0; i < 256; i++) {
    _byteToHex[i] = (i + 0x100).toString(16).substr(1);
    _hexToByte[_byteToHex[i]] = i;
  }

  // **`parse()` - Parse a UUID into it's component bytes**
  function parse(s, buf, offset) {
    const i = (buf && offset) || 0;
    let ii = 0;

    buf = buf || [];
    s.toLowerCase().replace(/[0-9a-f]{2}/u, oct => {
      if (ii < 16) {
        // Don't overflow!
        buf[i + ii++] = _hexToByte[oct];
      }
    });

    // Zero out remaining bytes if string was short
    while (ii < 16) {
      buf[i + ii++] = 0;
    }

    return buf;
  }

  // **`unparse()` - Convert UUID byte array (ala parse()) into a string**
  function unparse(buf, offset) {
    let i = offset || 0;
    const bth = _byteToHex;
    return `${bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]]}-${
      bth[buf[i++]]
    }${bth[buf[i++]]}-${bth[buf[i++]]}${bth[buf[i++]]}-${bth[buf[i++]]}${
      bth[buf[i++]]
    }-${bth[buf[i++]]}${bth[buf[i++]]}${bth[buf[i++]]}${bth[buf[i++]]}${
      bth[buf[i++]]
    }${bth[buf[i++]]}`;
  }

  /*
   * **`v1()` - Generate time-based UUID**
   *
   * Inspired by https://github.com/LiosK/UUID.js
   * and http://docs.python.org/library/uuid.html
   */

  // Random #'s we need to init node and clockseq
  const _seedBytes = _rng();

  // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
  const _nodeId = [
    _seedBytes[0] | 0x01,
    _seedBytes[1],
    _seedBytes[2],
    _seedBytes[3],
    _seedBytes[4],
    _seedBytes[5]
  ];

  // Per 4.2.2, randomize (14 bit) clockseq
  let _clockseq = ((_seedBytes[6] << 8) | _seedBytes[7]) & 0x3fff;

  // Previous uuid creation time
  let _lastMSecs = 0,
    _lastNSecs = 0;

  // See https://github.com/broofa/node-uuid for API details
  function v1(options, buf, offset) {
    let i = (buf && offset) || 0;
    const b = buf || [];

    options = options || {};

    let clockseq = options.clockseq !== null ? options.clockseq : _clockseq;

    /*
     * UUID timestamps are 100 nano-second units since the Gregorian epoch,
     * (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
     * time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
     * (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
     */
    let msecs = options.msecs !== null ? options.msecs : new Date().getTime();

    /*
     * Per 4.2.1.2, use count of uuid's generated during the current clock
     * cycle to simulate higher resolution clock
     */
    let nsecs = options.nsecs !== null ? options.nsecs : _lastNSecs + 1;

    // Time since last uuid creation (in msecs)
    const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000;

    // Per 4.2.1.2, Bump clockseq on clock regression
    if (dt < 0 && options.clockseq === null) {
      clockseq = (clockseq + 1) & 0x3fff;
    }

    /*
     * Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
     * time interval
     */
    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === null) {
      nsecs = 0;
    }

    // Per 4.2.1.2 Throw error if too many uuids are requested
    if (nsecs >= 10000) {
      throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
    }

    _lastMSecs = msecs;
    _lastNSecs = nsecs;
    _clockseq = clockseq;

    // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
    msecs += 12219292800000;

    // `time_low`
    const tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
    b[i++] = (tl >>> 24) & 0xff;
    b[i++] = (tl >>> 16) & 0xff;
    b[i++] = (tl >>> 8) & 0xff;
    b[i++] = tl & 0xff;

    // `time_mid`
    const tmh = ((msecs / 0x100000000) * 10000) & 0xfffffff;
    b[i++] = (tmh >>> 8) & 0xff;
    b[i++] = tmh & 0xff;

    // `time_high_and_version`
    b[i++] = ((tmh >>> 24) & 0xf) | 0x10; // Include version
    b[i++] = (tmh >>> 16) & 0xff;

    // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
    b[i++] = (clockseq >>> 8) | 0x80;

    // `clock_seq_low`
    b[i++] = clockseq & 0xff;

    // `node`
    const node = options.node || _nodeId;
    for (let n = 0; n < 6; n++) {
      b[i + n] = node[n];
    }

    return buf ? buf : unparse(b);
  }

  // **`v4()` - Generate random UUID**

  // See https://github.com/broofa/node-uuid for API details
  function v4(options, buf, offset) {
    // Deprecated - 'format' argument, as supported in v1.2
    const i = (buf && offset) || 0;

    if (typeof options === 'string') {
      buf = options === 'binary' ? new BufferClass(16) : null;
      options = null;
    }
    options = options || {};

    const rnds = options.random || (options.rng || _rng)();

    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;

    // Copy bytes to buffer, if provided
    if (buf) {
      for (let ii = 0; ii < 16; ii++) {
        buf[i + ii] = rnds[ii];
      }
    }

    return buf || unparse(rnds);
  }

  // Export public API
  const uuid = v4;
  uuid.v1 = v1;
  uuid.v4 = v4;
  uuid.parse = parse;
  uuid.unparse = unparse;
  uuid.BufferClass = BufferClass;

  // Export RNG options
  uuid.mathRNG = mathRNG;
  uuid.nodeRNG = nodeRNG;
  uuid.whatwgRNG = whatwgRNG;

  if (typeof module !== 'undefined') {
    // Play nice with node.js
    module.exports = uuid;
  } else {
    // Play nice with browsers
    const _previousRoot = _global.uuid;

    // **`noConflict()` - (browser only) to reset global 'uuid' var**
    uuid.noConflict = function noConflict() {
      _global.uuid = _previousRoot;
      return uuid;
    };
    _global.uuid = uuid;
  }
  window.uuid = uuid;
})();
