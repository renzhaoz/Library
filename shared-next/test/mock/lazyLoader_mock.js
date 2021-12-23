const LazyLoader = (function lazyLoader() {
  // eslint-disable-next-line no-shadow
  function LazyLoader() {
    this._loaded = {};
    this._isLoading = {};
  }

  LazyLoader.prototype = {
    getJSON: jest.fn(),
    load: jest.fn(),
    loadPromise: () => {
      return Promise.resolve(null);
    }
  };

  return new LazyLoader();
})();

window.LazyLoader = LazyLoader;
