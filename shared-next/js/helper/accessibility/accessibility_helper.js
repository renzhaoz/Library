(function accessibilityHelper(exports) {
  const AccessibilityHelper = {
    /**
     * For a set of tab elements, set aria-selected attribute in accordance with
     * the current selection.
     * @param {Object} selectedTab a tab to select object.
     * @param {Array} tabs an array of tabs.
     */
    setAriaSelected: function setAriaSelected(selectedTab, tabs) {
      // In case tabs is a NodeList, that does not have forEach.
      Array.prototype.forEach.call(tabs, tab => {
        tab.setAttribute(
          'aria-selected',
          tab === selectedTab ? 'true' : 'false'
        );
      });
    }
  };

  exports.AccessibilityHelper = AccessibilityHelper;
})(window);
