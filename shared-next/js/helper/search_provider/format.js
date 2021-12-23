/* exported Format */

/**
 * Format.js: simple formatters and string utilities.
 */

window.Format = {
  /**
   * Pads a string to the number of characters specified.
   * @param {String} input value to add padding to.
   * @param {Integer} len length to pad to.
   * @param {String} padWith char to pad with (defaults to " ").
   */
  padLeft(input, len, padWith) {
    padWith = padWith || ' ';

    let pad = len - `${input}`.length;
    while (--pad > -1) {
      input = padWith + input;
    }
    return input;
  }
};
