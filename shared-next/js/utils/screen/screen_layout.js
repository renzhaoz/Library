/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil -*- */
/* Vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

/**
 * This script can identify the size and watch change of mediaquery.
 *
 * You can get current layout by calling |gerCurrentLayout|,
 * it will only return matching type from defaultQueries.
 *
 * You can use |watch| and |unwatch| to start/stop watch on specific
 * mediaquery string, such as tiny/small/medium/large, you can also
 * define your own watcher. After start watcher, this script
 * will dispatch 'screenlayoutchange' event and pass name and status.
 */
// eslint-disable-next-line
let ScreenLayout = {
  /*
   *Refer to famous libraries, like Twitter Bootstrap and Foundation
   *we choose 768, 992, 1200 width as our breakpoints
   */
  defaultQueries: {
    tiny: '(max-width: 767px)',
    small: '(min-width: 768px) and (max-width: 991px)',
    medium: '(min-width: 992px) and (max-width: 1200px)',
    large: '(min-width: 1201px)',
    hardwareHomeButton: '(-moz-physical-home-button)'
  },

  init: function init() {
    /*
     * Loop defaultQueries and add window.matchMedia()
     * to this.queries object
     */
    this.queries = (function queries(qs) {
      const result = {};
      // eslint-disable-next-line
      for (let key in qs) {
        result[key] = window.matchMedia(qs[key]);
      }
      return result;
    })(this.defaultQueries);
  },

  _isOnRealDevice: undefined,

  isOnRealDevice: function isOnRealDevice() {
    if (typeof this._isOnRealDevice !== 'undefined') {
      return this._isOnRealDevice;
    }

    /*
     * XXX: A hack to know we're using real device or not
     * is to detect screen size.
     * The screen size of b2g running on real device
     * is the same as the size of system app.
     */
    if (window.innerWidth === screen.availWidth) {
      this._isOnRealDevice = true;
    } else {
      this._isOnRealDevice = false;
    }

    return this._isOnRealDevice;
  },

  /*
   * Name: |String|, ex: 'tiny', 'small', 'medium'
   *
   * tell user what type it is now
   * if type is undeined, it will return matching type from "defaultQueries"
   * if type is given, it will return boolean based on all watching queries
   */
  getCurrentLayout: function getCurrentLayout(type) {
    if (type === undefined) {
      // eslint-disable-next-line
      for (let name in this.defaultQueries) {
        if (this.queries[name] && this.queries[name].matches) {
          return name;
        }
      }
    }
    if (typeof this.queries[type] !== 'undefined') {
      return this.queries[type].matches;
    }
    return false;
  },

  /*
   * Name: |String|, ex: 'tiny', 'small', 'medium', 'large'
   * media: |String| optional, ex: '(max-width: 767px)'
   *
   * Start the |name| watcher
   * If |name| is not predefined in defaultQueries,
   * then |media| is required.
   *
   * If overwrite defaultQueries with new |media|,
   * |getCurrentLayout| will be also based on new config.
   */
  watch: function watch(name, media) {
    const mediaString = media || this.queries[name].media;
    if (!mediaString) {
      return;
    }
    this.unwatch(name);
    this.queries[name] = window.matchMedia(mediaString);
    this.boundHandleChange = this.handleChange.bind(this);
    this.queries[name].addListener(this.boundHandleChange);
  },

  unwatch: function unwatch(name) {
    if (this.queries[name]) {
      this.queries[name].removeListener(this.boundHandleChange);
    }
  },

  /*
   * Dispatch screenlayoutchange event, and pass mediaquery name and
   * status, which represent name of activating mediaquery and
   * activate status(boolean). ex: {name: 'small', status: true}
   */
  handleChange: function handleChange(evt) {
    // eslint-disable-next-line
    for (let key in this.queries) {
      if (this.queries[key].media === evt.media) {
        window.dispatchEvent(
          new CustomEvent('screenlayoutchange', {
            detail: {
              name: key,
              status: evt.matches
            }
          })
        );
      }
    }
  }
};

window.ScreenLayout = ScreenLayout;
ScreenLayout.init();
