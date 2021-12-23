const DIR = Object.freeze({
  LEFT: 0,
  RIGHT: 1,
  UP: 2,
  DOWN: 3
});

(function navigationHelper(exports) {
  const NavigationHelper = {
    controls: null,

    resetMenu() {
      const selector = 'form[data-subtype=menu]';
      const postfix = '>button.menu-button';
      const menuform = document.querySelector(selector);
      for (let i = 1; i < menuform.children.length; i++) {
        const subid = menuform.children[i].id;
        if (subid && subid.indexOf('submenu_') === 0) {
          this.reset(
            // eslint-disable-next-line no-use-before-define
            VerticalNavigator,
            () => {
              return document.querySelectorAll(`#${subid}${postfix}`);
            },
            0,
            subid
          );
        }
      }
      return this.reset(
        // eslint-disable-next-line no-use-before-define
        VerticalNavigator,
        () => {
          return document.querySelectorAll(`#mainmenu${postfix}`);
        },
        0,
        'mainmenu'
      );
    },

    // eslint-disable-next-line max-params
    reset(navigator, getControls, getFocusIndex, navPrefix, notSetFocus) {
      if (!navigator) {
        return null;
      }
      if (typeof getControls !== 'function') {
        return null;
      }
      this.controls = getControls();
      if (!this.controls || this.controls.length === 0) {
        return null;
      }
      navigator.count = this.controls.length;
      this.updateNav(navigator, navPrefix);

      const focusIndex =
        typeof getFocusIndex === 'function' ? getFocusIndex() : 0;
      const focusedElement = this.controls[focusIndex];
      if (!notSetFocus) this.setFocus(focusedElement);
      return focusedElement;
    },

    setFocus(element) {
      if (!element) return;
      const focused = document.querySelectorAll('.focus');
      if (focused.length > 0) {
        focused[0].classList.remove('focus');
      }
      element.setAttribute('tabindex', 1);
      element.classList.add('focus');
      if ('undefined' !== typeof inputHandler)
        // eslint-disable-next-line no-undef
        inputHandler.focusChanged(element);
      else element.focus();
    },

    updateNav(navigator, navPrefix) {
      for (let i = 0; i < this.controls.length; i++) {
        const control = this.controls[i];
        control.setAttribute('data-nav-id', str(i));
        control.style.setProperty('--nav-left', str(navigator.left(i)));
        control.style.setProperty('--nav-right', str(navigator.right(i)));
        control.style.setProperty('--nav-up', str(navigator.up(i)));
        control.style.setProperty('--nav-down', str(navigator.down(i)));
        control.setAttribute('tabindex', 0);
      }
      function str(navIndex) {
        if (navPrefix === undefined) navPrefix = '';
        return navPrefix + navIndex;
      }
    },

    elementIsVisible(element, top, bottom) {
      let visible = true;
      if (element.offsetWidth === 0 || element.offsetHeight === 0)
        return visible;
      const rects = element.getClientRects();
      for (const rect of rects) {
        if (rect.bottom + bottom > window.innerHeight || rect.top < top) {
          visible = false;
          break;
        }
      }
      return visible;
    },

    // Gaia-header: 50px, softkey: 40px, (ignore statusbar: 30px)
    // eslint-disable-next-line max-params
    scrollToElement(element, event, top, bottom) {
      if (!this.elementIsVisible(element, top, bottom)) {
        if (event) {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp')
            element.scrollIntoView(false);
        } else {
          element.scrollIntoView(false);
        }
      }
    },

    Key2Dir(key) {
      // eslint-disable-next-line init-declarations
      let dir;
      switch (key) {
        case 'ArrowLeft':
          dir = DIR.LEFT;
          break;
        case 'ArrowRight':
          dir = DIR.RIGHT;
          break;
        case 'ArrowUp':
          dir = DIR.UP;
          break;
        case 'ArrowDown':
          dir = DIR.DOWN;
          break;
        default:
          break;
      }
      return dir;
    }
  };

  // Horizontal Navigator
  const HorizontalNavigator = {
    count: 0,
    left(navIndex) {
      return 0 === navIndex ? this.count - 1 : navIndex - 1;
    },
    right(navIndex) {
      return this.count - 1 === navIndex ? 0 : navIndex + 1;
    },
    up(navIndex) {
      return navIndex;
    },
    down(navIndex) {
      return navIndex;
    }
  };

  // Vertical Navigator
  const VerticalNavigator = {
    count: 0,
    left(navIndex) {
      return navIndex;
    },
    right(navIndex) {
      return navIndex;
    },
    up(navIndex) {
      return 0 === navIndex ? this.count - 1 : navIndex - 1;
    },
    down(navIndex) {
      return this.count - 1 === navIndex ? 0 : navIndex + 1;
    }
  };

  // Box Navigator
  const BoxNavigator = {
    count: 0,
    columnCount: 2,
    left(navIndex) {
      return navIndex > 0 && navIndex < this.count
        ? --navIndex
        : this.count - 1;
    },
    right(navIndex) {
      return navIndex >= 0 && navIndex < this.count - 1 ? ++navIndex : 0;
    },
    up(navIndex) {
      navIndex -= this.columnCount;
      if (navIndex < 0) {
        navIndex += this.columnCount * Math.ceil(this.count / this.columnCount);
        const remainder = this.count % this.columnCount;
        if (
          (navIndex === this.count ||
            (navIndex === this.count + 1 && remainder === 1)) &&
          remainder !== 0
        )
          navIndex = this.count - 1;
        if (navIndex > this.count) navIndex -= this.columnCount;
      }
      return navIndex;
    },
    down(navIndex) {
      navIndex += this.columnCount;
      const remainder = this.count % this.columnCount;
      if (
        (navIndex === this.count ||
          (navIndex === this.count + 1 && remainder === 1)) &&
        remainder !== 0
      )
        navIndex = this.count - 1;
      if (navIndex > this.count || (navIndex === this.count && remainder === 0))
        navIndex %= this.columnCount;
      return navIndex;
    }
  };

  // Group Navigator
  const GroupNavigator = {
    count: 0,
    columnCount: 3,
    getGroupInfo: null,
    left(navIndex) {
      return navIndex > 0 && navIndex < this.count
        ? --navIndex
        : this.count - 1;
    },
    right(navIndex) {
      return navIndex >= 0 && navIndex < this.count - 1 ? ++navIndex : 0;
    },
    up(navIndex) {
      let index = -1;
      if (typeof this.getGroupInfo !== 'function') {
        return index;
      }
      const groupInfo = this.getGroupInfo(navIndex, true);
      const curIdx = groupInfo.curGroupIndex;
      const destLen = groupInfo.destGroupLen;
      if (curIdx >= this.columnCount) {
        // In the current group
        index = navIndex - this.columnCount;
      } else {
        // In the destination group
        index = navIndex - curIdx;
        if (0 === index) index = this.count;
        let lastRowCount = destLen % this.columnCount;
        if (0 === lastRowCount) lastRowCount = this.columnCount;
        index -= lastRowCount;
        const pos = curIdx % this.columnCount;
        if (pos < lastRowCount) {
          index += pos;
        } else if (destLen > this.columnCount) {
          // More than 1 row
          index = index - this.columnCount + pos;
        } else {
          index += lastRowCount - 1;
        }
      }
      return index;
    },

    down(navIndex) {
      let index = -1;
      const groupInfo = this.getGroupInfo(navIndex, false);
      const curIdx = groupInfo.curGroupIndex;
      const curLen = groupInfo.curGroupLen;
      if (curIdx + this.columnCount < curLen) {
        // In the current group
        index = navIndex + this.columnCount;
      } else {
        // In the destination group
        index = navIndex + (curLen - curIdx);
        if (this.count === index) index = 0;
        const pos = curIdx % this.columnCount;
        index += Math.min(pos, groupInfo.destGroupLen - 1);
      }
      return index;
    }
  };

  exports.NavigationHelper = NavigationHelper;
  exports.HorizontalNavigator = HorizontalNavigator;
  exports.VerticalNavigator = VerticalNavigator;
  exports.BoxNavigator = BoxNavigator;
  exports.GroupNavigator = GroupNavigator;
})(window);
