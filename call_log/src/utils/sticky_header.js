/* exported StickyHeader */

import BaseModule from 'base-module';

class StickyHeader extends BaseModule {
  constructor({ scrollable, sticky }) {
    super();
    this.scrollable = scrollable;
    this.sticky = sticky;
    this.DEBUG = false;
    this.stickyStyle = sticky.style;
    this.throttle = null;
  }

  throttledRefresh() {
    let display = false;
    if (this.stickyPosition === undefined) {
      this.stickyPosition = this.sticky.offsetHeight + this.sticky.offsetTop;
    }
    const headers = this.scrollable.querySelectorAll('.group-header');
    const len = headers.length;
    for (let i = 1; i <= len; i++) {
      if (
        i === len
        || (
          (headers[i].offsetTop - this.scrollable.scrollTop)
          > (this.scrollable.stickyHiddenGap || this.stickyPosition)
        )
      ) {
        // While reflecting a header, make sure to not reflect a header
        // that is not displayed.
        let lookupIndex = 1;
        let header = headers[i - lookupIndex];
        while (header && header.offsetHeight === 0) {
          lookupIndex += 1;
          header = headers[i - lookupIndex];
        }
        if (header) {
          this.stickyStyle.backgroundImage = '-moz-element(#' + header.id + ')';
          display = true;
        }
        break;
      } else if (headers[i].offsetTop - this.scrollable.scrollTop > 0) {
        break;
      }
    }

    this.sticky.classList.toggle('has-content', display);
    this.throttle = null;
  }

  refresh() {
    if (!this.throttle) {
      this.throttle = setTimeout(() => {
        this.throttledRefresh();
      }, 0);
    }
  }
}
export default StickyHeader;
