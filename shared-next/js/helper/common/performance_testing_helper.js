(function performanceTestingHelper(window) {
  /*
   * Placeholder for storing statically generated performance timestamps,
   * similar to window.performance
   */
  window.mozPerformance = {
    timing: {}
  };

  function dispatch(name) {
    if (!window.mozPerfHasListener) {
      return;
    }

    const now = window.performance.now();
    const epoch = Date.now();

    setTimeout(() => {
      const detail = {
        name,
        timestamp: now,
        epoch
      };
      const event = new CustomEvent('x-moz-perf', { detail });

      window.dispatchEvent(event);
    });
  }

  [
    'moz-chrome-dom-loaded',
    'moz-chrome-interactive',
    'moz-app-visually-complete',
    'moz-content-interactive',
    'moz-app-loaded'
  ].forEach(eventName => {
    window.addEventListener(
      eventName,
      () => {
        dispatch(eventName);
      },
      false
    );
  });

  window.PerformanceTestingHelper = {
    dispatch
  };
})(window);
