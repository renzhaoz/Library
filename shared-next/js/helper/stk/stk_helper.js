/* exported STKHelper */
/**
 * Stk_helper.js: SIM Toolkit utilities.
 */
// eslint-disable-next-line no-unused-vars
const STKHelper = {
  getIconCanvas: function getIconCanvas(mozStkIcon) {
    if (
      !mozStkIcon ||
      !mozStkIcon.pixels ||
      !mozStkIcon.width ||
      !mozStkIcon.height
    ) {
      return null;
    }

    if (mozStkIcon.pixels.length < mozStkIcon.width * mozStkIcon.height) {
      console.error(
        `Not enough pixels for the required dimension: ${mozStkIcon.width}x${mozStkIcon.height}`
      );
      return null;
    }

    if (!mozStkIcon.codingScheme) {
      mozStkIcon.codingScheme = 'basic';
    }

    const canvas = document.createElement('canvas');
    canvas.setAttribute('width', mozStkIcon.width);
    canvas.setAttribute('height', mozStkIcon.height);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const imageData = ctx.createImageData(mozStkIcon.width, mozStkIcon.height);
    let pixel = 0,
      pos = 0;
    const { data } = imageData;
    for (let y = 0; y < mozStkIcon.height; y++) {
      for (let x = 0; x < mozStkIcon.width; x++) {
        data[pos++] = (mozStkIcon.pixels[pixel] & 0xff000000) >>> 24; // Red
        data[pos++] = (mozStkIcon.pixels[pixel] & 0xff0000) >>> 16; // Green
        data[pos++] = (mozStkIcon.pixels[pixel] & 0xff00) >>> 8; // Blue
        data[pos++] = mozStkIcon.pixels[pixel] & 0xff; // Alpha

        pixel++;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    return canvas;
  },

  // Helper to retrieve text from MozStkTextMessage
  getMessageText(stkMessage, defaultMsgL10nId, defaultMsgL10nArgs) {
    // Stk Message could be a specific string
    // eslint-disable-next-line init-declarations
    let text;
    if (stkMessage === 'string' || stkMessage instanceof String) {
      text = stkMessage;
    } else {
      text = stkMessage ? stkMessage.text : '';
    }

    if (!text && defaultMsgL10nId) {
      const _ = window.api.l10n.get;
      text = _(defaultMsgL10nId, defaultMsgL10nArgs);
    }

    return text;
  },

  isIconSelfExplanatory(stkMessage) {
    return stkMessage && stkMessage.icons && stkMessage.iconSelfExplanatory;
  },

  getFirstIconRawData(stkItem) {
    return stkItem.icons && stkItem.icons.length > 0 ? stkItem.icons[0] : null;
  }
};

window.STKHelper = STKHelper;
