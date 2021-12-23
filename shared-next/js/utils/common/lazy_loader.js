/* exported LazyLoader */
/* globals HtmlImports */

/**
 * This contains a simple LazyLoader implementation
 * To use:
 *
 *   LazyLoader.load(
 *    ['/path/to/file.js', '/path/to/file.css', 'domNode'], callback
 *   );
 */
// eslint-disable-next-line no-unused-vars
const LazyLoader = (function lazyLoader() {
  // eslint-disable-next-line no-shadow
  function LazyLoader() {
    this._loaded = {};
    this._isLoading = {};
  }

  LazyLoader.prototype = {
    _errorCallback() {
      const file = this.src;
      if (file.startsWith('%API_DAEMON_URI%/api/v1/')) {
        console.error(`[Lazyloader] Reload file in API_DAEMON: ${file}`);
        window.setTimeout(() => {
          window.location.reload();
        });
      } else {
        console.error(`[Lazyloader] Load file error: ${file}`);
      }
    },

    _js(file, type, callback) {
      const script = document.createElement('script');
      script.src = file;
      /*
       * Until bug 916255 lands async is the default so
       * we must disable it so scripts load in the order they where
       * required.
       */
      script.async = false;
      script.type = type ? type : 'text/javascript';
      script.callback = callback;
      script.errorCallback = this._errorCallback.bind(script);
      script.addEventListener(
        'load',
        () => {
          script.removeEventListener('error', script.errorCallback, {
            once: true
          });
          callback();
        },
        { once: true }
      );

      script.addEventListener('error', script.errorCallback, { once: true });

      document.head.appendChild(script);
      this._isLoading[file] = script;
    },

    _css(file, type, callback) {
      const style = document.createElement('link');
      style.type = type ? type : 'text/css';
      style.rel = 'stylesheet';
      style.href = file;
      document.head.appendChild(style);
      callback();
    },

    _html(domNode, callback) {
      // The next few lines are for loading html imports in DEBUG mode
      if (domNode.getAttribute('is')) {
        this.load(['/shared/js/html_imports.js'], () => {
          HtmlImports.populate(callback);
        });
        return;
      }

      for (let i = 0; i < domNode.childNodes.length; i++) {
        if (domNode.childNodes[i].nodeType === document.COMMENT_NODE) {
          domNode.innerHTML = domNode.childNodes[i].nodeValue;
          break;
        }
      }

      window.dispatchEvent(
        new CustomEvent('lazyload', {
          detail: domNode
        })
      );

      callback();
    },

    /**
     * Retrieves content of JSON file.
     *
     * @param {String} file Path to JSON file
     * @param {Boolean} mozSystem If xhr should use mozSystem permissions
     * @return {Promise} A promise that resolves to the JSON content
     * or null in case of invalid path. Rejects if an error occurs.
     */
    getJSON(file, mozSystem) {
      return new Promise((resolve, reject) => {
        let xhr = {};
        if (mozSystem) {
          xhr = new XMLHttpRequest({ mozSystem: true });
        } else {
          xhr = new XMLHttpRequest();
        }
        xhr.open('GET', file, true);
        xhr.responseType = 'json';

        xhr.onerror = error => {
          reject(error);
        };
        xhr.onload = () => {
          if (xhr.response !== null) {
            resolve(xhr.response);
          } else {
            reject(
              new Error(
                `No valid JSON object was found (${xhr.status} ${xhr.statusText})`
              )
            );
          }
        };

        xhr.send();
      });
    },

    load(files, callback) {
      const deferred = {};
      deferred.promise = new Promise(resolve => {
        deferred.resolve = resolve;
      });

      if (!Array.isArray(files)) {
        files = [files];
      }

      let loadsRemaining = files.length;
      const self = this;
      function perFileCallback(file, inLoadingCallBack) {
        if (inLoadingCallBack) {
          window.setTimeout(() => {
            if (self._isLoading[file]) {
              delete self._isLoading[file];
            }
          }, 100);
        }
        self._loaded[file] = true;
        if (--loadsRemaining === 0) {
          deferred.resolve();
          if (callback) {
            // eslint-disable-next-line callback-return
            callback();
          }
        }
      }

      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        let fType = '';
        if (typeof file === 'object' && file.type) {
          fType = file.type;
          file = file.path;
        }

        if (this._loaded[file.id || file]) {
          perFileCallback(file);
        } else if (this._isLoading[file]) {
          this._isLoading[file].addEventListener(
            'load',
            perFileCallback.bind(null, file, true),
            { once: true }
          );
        } else {
          let idx = '';
          let method = '';
          if (typeof file === 'string') {
            [, method] = file.match(/\.([^.]+)$/);
            idx = file;
            this[`_${method}`](
              file,
              fType,
              perFileCallback.bind(null, idx, false)
            );
          } else {
            idx = file.id;
            this._html(file, perFileCallback.bind(null, idx, false));
          }
        }
      }

      return deferred.promise;
    }
  };

  return new LazyLoader();
})();

window.LazyLoader = LazyLoader;
