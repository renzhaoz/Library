/* jshint -W083 */

(function fontSizeUtils(exports) {
  /**
   * Allowable font sizes for header elements.
   */
  const HEADER_SIZES = [16, 17, 18, 19, 20, 21, 22, 23];

  /**
   * Utility functions for measuring and manipulating font sizes
   */
  const FontSizeUtils = {
    /**
     * Keep a cache of canvas contexts with a given font.
     * We do this because it is faster to create new canvases
     * than to re-set the font on existing contexts repeatedly.
     */
    _cachedContexts: {},

    /**
     * Grab or create a cached canvas context for a given fontSize/family pair.
     * @todo Add font-weight as a new dimension for caching.
     *
     * @param {Integer} fontSize The font size of the canvas we want.
     * @param {String} fontFamily The font family of the canvas we want.
     * @param {String} fontStyle The style of the font (default to italic).
     * @return {CanvasRenderingContext2D} A context with the specified font.
     */
    _getCachedContext(fontSize, fontFamily, fontStyle) {
      /*
       * Default to italic style since this code is only ever used
       * by headers right now and header text is always italic.
       */
      fontStyle = fontStyle || 'italic';

      const cache = this._cachedContexts;
      let ctx =
        cache[fontSize] &&
        cache[fontSize][fontFamily] &&
        cache[fontSize][fontFamily][fontStyle];

      if (!ctx) {
        const canvas = document.createElement('canvas');
        canvas.setAttribute('moz-opaque', 'true');
        canvas.setAttribute('width', '1');
        canvas.setAttribute('height', '1');

        ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.font = `${fontStyle} ${fontSize}px ${fontFamily}`;

        // Populate the contexts cache.
        if (!cache[fontSize]) {
          cache[fontSize] = {};
        }
        if (!cache[fontSize][fontFamily]) {
          cache[fontSize][fontFamily] = {};
        }
        cache[fontSize][fontFamily][fontStyle] = ctx;
      }

      return ctx;
    },

    /**
     * Clear any current canvas contexts from the cache.
     */
    resetCache() {
      this._cachedContexts = {};
    },

    /**
     * Use a single observer for all text changes we are interested in.
     */
    _textChangeObserver: null,

    /**
     * Auto resize all text changes.
     * @param {Array} mutations A MutationRecord list.
     */
    _handleTextChanges(mutations) {
      for (let i = 0; i < mutations.length; i++) {
        this._reformatHeaderText(mutations[i].target);
      }
    },

    /**
     * Singleton-like interface for getting our text change observer.
     * By reusing the observer, we make sure we only ever attach a
     * single observer to any given element we are interested in.
     */
    _getTextChangeObserver() {
      if (!this._textChangeObserver) {
        this._textChangeObserver = new MutationObserver(
          this._handleTextChanges.bind(this)
        );
      }
      return this._textChangeObserver;
    },

    /**
     * Perform auto-resize when textContent changes on element.
     *
     * @param {HTMLElement} element The element to observer for changes
     */
    _observeHeaderChanges(element) {
      const observer = this._getTextChangeObserver();
      // Listen for any changes in the child nodes of the header.
      observer.observe(element, { childList: true });
    },

    /**
     * Resize and reposition the header text based on string length and
     * container position.
     *
     * @param {HTMLElement} header h1 text inside header to reformat.
     */
    _reformatHeaderText(header) {
      // Skip resize logic if header has no content, ie before localization.
      if (header.textContent.trim() === '') {
        return;
      }

      // Reset our centering styles.
      this.resetCentering(header);

      // Cache the element style properites to avoid reflows.
      const style = this.getStyleProperties(header);

      // Perform auto-resize and center.
      style.textWidth = this.autoResizeElement(header, style);
      this.centerTextToScreen(header, style);
    },

    /**
     * Reformat all the headers located inside a DOM node, and add mutation
     * observer to reformat when any changes are made.
     *
     * @param {HTMLElement} domNode
     */
    _registerHeadersInSubtree(domNode) {
      if (!domNode) {
        return;
      }

      const headers = domNode.querySelectorAll('header > h1');
      /* eslint-disable */
      for (var i = 0; i < headers.length; i++) {
        // On some apps wrapping inside a requestAnimationFrame reduces the
        // number of calls to _reformatHeaderText().
        window.requestAnimationFrame(function(header) {
          this._reformatHeaderText(header);
          this._observeHeaderChanges(header);
        }.bind(this, headers[i]));
      }
      /* eslint-enable */
    },

    /**
     * Get the width of a string in pixels, given its fontSize and fontFamily.
     *
     * @param {String} string The string we are measuring.
     * @param {Integer} fontSize The size of the font to measure against.
     * @param {String} fontFamily The font family to measure against.
     * @param {String} fontStyle The style of the font (default to italic).
     * @return {Integer} The pixel width of the string with the given font.
     */
    // eslint-disable-next-line
    getFontWidth(string, fontSize, fontFamily, fontStyle) {
      const ctx = this._getCachedContext(fontSize, fontFamily, fontStyle);
      return ctx.measureText(string).width;
    },

    /**
     * Get the maximum allowable fontSize for a string such that it will
     * not overflow past a maximum width.
     *
     * @param {String} string The string for which to check max font size.
     * @param {Array} allowedSizes A list of fontSizes allowed.
     * @param {String} fontFamily The font family of the string we're measuring.
     * @param {Integer} maxWidth The maximum number of pixels before overflow.
     * @return {Object} Dict containing fontSize, overflow and textWidth.
     */
    // eslint-disable-next-line
    getMaxFontSizeInfo(string, allowedSizes, fontFamily, maxWidth) {
      let fontSize = null;
      let resultWidth = null;
      let i = allowedSizes.length - 1;

      do {
        fontSize = allowedSizes[i];
        resultWidth = this.getFontWidth(string, fontSize, fontFamily);
        i--;
      } while (resultWidth > maxWidth && i >= 0);

      return {
        fontSize,
        overflow: resultWidth > maxWidth,
        textWidth: resultWidth
      };
    },

    /**
     * Get the amount of characters truncated from overflow ellipses.
     *
     * @param {String} string The string for which to check max font size.
     * @param {Integer} fontSize The font size of the string we are measuring.
     * @param {String} fontFamily The font family of the string we're measuring.
     * @param {Integer} maxWidth The maximum number of pixels before overflow.
     */
    // eslint-disable-next-line
    getOverflowCount(string, fontSize, fontFamily, maxWidth) {
      let substring = null;
      let resultWidth = null;
      let overflowCount = -1;

      do {
        overflowCount++;
        substring = string.substr(0, string.length - overflowCount);
        resultWidth = this.getFontWidth(substring, fontSize, fontFamily);
      } while (substring.length > 0 && resultWidth > maxWidth);

      return overflowCount;
    },

    /**
     * Get an array of allowed font sizes for an element
     *
     * @param {HTMLElement} element The element to get allowed sizes for.
     * @return {Array} An array containing pizels values of allowed sizes.
     */
    getAllowedSizes(element) {
      if (element.tagName === 'H1' && element.parentNode.tagName === 'HEADER') {
        return HEADER_SIZES;
      }
      // No allowed sizes for this element, so return empty array.
      return [];
    },

    /**
     * Get an element's content width disregarding its box model sizing.
     *
     * @param {HTMLElement|Object} HTML element, or style object.
     * @returns {Number} width in pixels of elements content.
     */
    getContentWidth(style) {
      let width = parseInt(style.width, 10);
      if (style.boxSizing === 'border-box') {
        width -=
          parseInt(style.paddingRight, 10) + parseInt(style.paddingLeft, 10);
      }
      return width;
    },

    /**
     * Get an element's style properies.
     *
     * @param {HTMLElement} element The element from which to fetch style.
     * @return {Object} A dictionary containing element's style properties.
     */
    getStyleProperties(element) {
      const style = window.getComputedStyle(element);
      let contentWidth = this.getContentWidth(style);
      if (isNaN(contentWidth)) {
        contentWidth = 0;
      }

      return {
        fontFamily: style.fontFamily,
        contentWidth,
        paddingRight: parseInt(style.paddingRight, 10),
        paddingLeft: parseInt(style.paddingLeft, 10),
        offsetLeft: element.offsetLeft
      };
    },

    /**
     * Auto resize element's font to fit its content width.
     *
     * @param {HTMLElement} element The element to perform auto-resize on.
     * @param {Object} styleOptions Dictionary containing cached style props,
     *                 to avoid reflows caused by grabbing style properties.
     * @return {Integer} The pixel width of the resized text.
     */
    autoResizeElement(element, styleOptions) {
      const allowedSizes = this.getAllowedSizes(element);
      if (allowedSizes.length === 0) {
        return 0;
      }

      const contentWidth =
        styleOptions.contentWidth || this.getContentWidth(element);

      const fontFamily =
        styleOptions.fontFamily || getComputedStyle(element).fontFamily;

      const info = this.getMaxFontSizeInfo(
        element.textContent.trim(),
        allowedSizes,
        fontFamily,
        contentWidth
      );

      element.style.fontSize = `${info.fontSize}px`;

      return info.textWidth;
    },

    /**
     * Reset the auto-centering styling on an element.
     *
     * @param {HTMLElement} element The element to reset.
     */
    resetCentering(element) {
      /*
       * We need to set the lateral margins to 0 to be able to measure the
       * element width properly. All previously set values are ignored.
       */
      element.style.marginLeft = '0';
      element.style.marginRight = '0';
    },

    /**
     * Center an elements text based on screen position rather than container.
     *
     * @param {HTMLElement} element The element whose text we want to center.
     * @param {Object} styleOptions Dictionary containing cached style props,
     *                 avoids reflows caused by caching style properties.
     */
    centerTextToScreen(element, styleOptions) {
      /*
       * Calculate the minimum amount of space needed for the header text
       * to be displayed without overflowing its content box.
       */
      const minHeaderWidth =
        styleOptions.textWidth +
        styleOptions.paddingRight +
        styleOptions.paddingLeft;

      // Get the amount of space on each side of the header text element.
      const sideSpaceLeft = styleOptions.offsetLeft;
      const sideSpaceRight =
        this.getWindowWidth() -
        sideSpaceLeft -
        styleOptions.contentWidth -
        styleOptions.paddingRight -
        styleOptions.paddingLeft;

      // If both margins have the same width, the header is already centered.
      if (sideSpaceLeft === sideSpaceRight) {
        return;
      }

      /*
       * To center, we need to make sure the space to the left of the header
       * is the same as the space to the right, so take the largest of the two.
       */
      const margin = Math.max(sideSpaceLeft, sideSpaceRight);

      /*
       * If the minimum amount of space our header needs plus the max margins
       * fits inside the width of the window, we can center this header.
       * We subtract 1 pixels to wrap text like Gecko.
       * See https://bugzil.la/1026955
       */
      if (minHeaderWidth + margin * 2 < this.getWindowWidth() - 1) {
        element.style.marginLeft = `${margin}px`;
        element.style.marginRight = `${margin}px`;
      }
    },

    _initHeaderFormatting() {
      if (window.api.l10n) {
        // When l10n is ready, register all displayed headers for formatting.
        window.api.l10n.once(() => {
          this._registerHeadersInSubtree(document.body);
        });
      } else {
        this._registerHeadersInSubtree(document.body);
      }
    },

    /**
     * Initialize the FontSizeUtils, add overflow handler and perform
     * auto resize once strings have been localized.
     */
    init() {
      // Listen for lazy loaded DOM to register new headers.
      window.addEventListener('lazyload', evt => {
        this._registerHeadersInSubtree(evt.detail);
      });

      // Once document is ready, format any headers already in the DOM.
      if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', () => {
          this._initHeaderFormatting();
        });
      } else {
        this._initHeaderFormatting();
      }
    },

    /**
     * Cache and return the width of the inner window.
     *
     * @return {Integer} The width of the inner window in pixels.
     */
    getWindowWidth() {
      return window.innerWidth;
    }
  };

  FontSizeUtils.init();

  exports.FontSizeUtils = FontSizeUtils;
})(window);
