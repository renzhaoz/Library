/**
 * Text_normalizer.js: a basic string normalizer library that provides various
 *                     methods to normalize strings of characters
 *
 * The following methods are available:
 *    toAscii(string): convert strings containing accented-form characters to
 *                     their ASCII equivalent
 *
 *    escapeHTML(string, boolean): escape HTML tags
 *    escapeRegExp(string): escape regular expressions
 */
// eslint-disable-next-line
let Normalizer = {
  /**
   * Initialize the ASCII normalizer
   */
  initAsciiNormalizer: function initAsciiNormalizer() {
    // Map from lowercase ASCII to all known accented forms of the letter
    const equivalentChars = {
      a: 'áăǎâäȧạȁàảȃāąåḁⱥãǽǣæ',
      A: 'ÁĂǍÂÄȦẠȀÀẢȂĀĄÅḀȺÃǼǢÆ',
      b: 'ḃḅɓḇƀƃ',
      B: 'ḂḄƁḆɃƂ',
      c: 'ćčçĉċƈȼ',
      C: 'ĆČÇĈĊƇȻ',
      d: 'ďḑḓḋḍɗḏđƌð',
      D: 'ĎḐḒḊḌƊḎĐƋ',
      e: 'éĕěȩêḙëėẹȅèẻȇēę',
      E: 'ÉĔĚȨÊḘËĖẸȄÈẺȆĒĘ',
      f: 'ḟƒ',
      F: 'ḞƑ',
      g: 'ǵğǧģĝġɠḡǥ',
      G: 'ǴĞǦĢĜĠƓḠǤ',
      h: 'ḫȟḩĥⱨḧḣḥħ',
      H: 'ḪȞḨĤⱧḦḢḤĦ',
      i: 'íĭǐîïịȉìỉȋīįɨĩḭı',
      I: 'ÍĬǏÎÏỊȈÌỈȊĪĮƗĨḬ',
      j: 'ĵɉ',
      J: 'ĴɈ',
      k: 'ḱǩķⱪꝃḳƙḵꝁ',
      K: 'ḰǨĶⱩꝂḲƘḴꝀ',
      l: 'ĺƚľļḽḷⱡꝉḻŀɫł',
      L: 'ĹȽĽĻḼḶⱠꝈḺĿⱢŁ',
      m: 'ḿṁṃɱ',
      M: 'ḾṀṂⱮ',
      n: 'ńňņṋṅṇǹɲṉƞñ',
      N: 'ŃŇŅṊṄṆǸƝṈȠÑ',
      o: 'óŏǒôöȯọőȍòỏơȏꝋꝍōǫøõœ',
      O: 'ÓŎǑÔÖȮỌŐȌÒỎƠȎꝊꝌŌǪØÕŒ',
      p: 'ṕṗꝓƥᵽꝑ',
      P: 'ṔṖꝒƤⱣꝐ',
      q: 'ꝗ',
      Q: 'Ꝗ',
      r: 'ŕřŗṙṛȑȓṟɍɽ',
      R: 'ŔŘŖṘṚȐȒṞɌⱤ',
      s: 'śšşŝșṡṣß$',
      S: 'ŚŠŞŜȘṠṢ',
      t: 'ťţṱțⱦṫṭƭṯʈŧ',
      T: 'ŤŢṰȚȾṪṬƬṮƮŦ',
      u: 'úŭǔûṷüṳụűȕùủưȗūųůũṵ',
      U: 'ÚŬǓÛṶÜṲỤŰȔÙỦƯȖŪŲŮŨṴ',
      v: 'ṿʋṽ',
      V: 'ṾƲṼ',
      w: 'ẃŵẅẇẉẁⱳ',
      W: 'ẂŴẄẆẈẀⱲ',
      x: 'ẍẋ',
      X: 'ẌẊ',
      y: 'ýŷÿẏỵỳƴỷỿȳɏỹ',
      Y: 'ÝŶŸẎỴỲƳỶỾȲɎỸ',
      z: 'źžẑⱬżẓȥẕƶ',
      Z: 'ŹŽẐⱫŻẒȤẔƵ'
    };
    /*
     * Create the reverse map (i.e. the accented chars to their ASCII
     * equivalent) and build the regexp string
     */
    this._toAsciiForm = {};
    for (const letter in equivalentChars) {
      const accentedForms = equivalentChars[letter];
      for (let i = accentedForms.length - 1; i >= 0; i--) {
        this._toAsciiForm[accentedForms[i]] = letter;
      }
    }
  },

  /**
   * Convert a string of characters to its ASCII equivalent
   * @param {string} str a string of characters.
   * @return {string} the normalized (ASCII) string in lower case.
   */
  toAscii: function toAscii(str) {
    if (!str || typeof str !== 'string') {
      return '';
    }

    if (!this._toAsciiForm) {
      Normalizer.initAsciiNormalizer();
    }

    // Convert accented form to ASCII equivalent
    let result = '';
    for (let i = 0, len = str.length; i < len; i++) {
      result += this._toAsciiForm[str.charAt(i)] || str.charAt(i);
    }

    return result;
  },

  /**
   * Escape HTML tags in a string of characters
   * @param {string} str a string of characters.
   * @param {boolean} escapeQuotes (optional) escape quotes.
   * @return {string} the HTML-escaped string.
   */
  escapeHTML: function escapeHTML(str, escapeQuotes) {
    if (Array.isArray(str)) {
      return Normalizer.escapeHTML(str.join(' '), escapeQuotes);
    }

    if (!str || typeof str !== 'string') {
      return '';
    }

    const escaped = str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    if (escapeQuotes) {
      return escaped.replace(/"/u, '&quot;').replace(/'/g, '&#x27;');
    }
    return escaped;
  },

  /**
   * Escape regular expressions in a string of characters
   * @param {string} str a string of characters.
   * @return {string} the regexp-escaped string.
   */
  escapeRegExp: function escapeRegExp(str) {
    // eslint-disable-next-line no-useless-escape
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
  }
};

window.Normalizer = Normalizer;
