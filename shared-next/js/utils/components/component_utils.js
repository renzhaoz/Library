(function componentUtils(exports) {
  /**
   * ComponentUtils is a utility which allows us to use web components earlier
   * than we should be able to by polyfilling and fixing platform deficiencies.
   */
  exports.ComponentUtils = {
    /**
     * Injects a style.css into both the shadow root and outside the shadow
     * root so we can style projected content. Bug 992249.
     */
    style(baseUrl, dom) {
      const style = document.createElement('style');
      const url = `${baseUrl}style.css`;

      style.setAttribute('scoped', '');
      style.innerHTML = `@import url(${url});`;
      if (dom) {
        dom.appendChild(style);
        dom.style.visibility = 'hidden';
      } else {
        this.appendChild(style);
        this.style.visibility = 'hidden';
      }

      /*
       * Wait for the stylesheet to load before injecting
       * it into the shadow-dom. This is to work around
       * bug 1003294, let's review once landed.
       */
      style.addEventListener('load', () => {
        /*
         * Put a clone of the stylesheet into the shadow-dom.
         * We have to use two <style> nodes, to work around
         * the lack of `:host` (bug 992245) and `:content`
         * (bug 992249) selectors. Once we have those we
         * can do all our styling from a single style-sheet
         * within the shadow-dom.
         */
        if (dom) {
          if (dom.shadowRoot) {
            dom.shadowRoot.appendChild(style.cloneNode(true));
          }
          dom.style.visibility = '';
        } else {
          if (this.shadowRoot) {
            this.shadowRoot.appendChild(style.cloneNode(true));
          }
          this.style.visibility = '';
        }
      });
    }
  };
})(window);
