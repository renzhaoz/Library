/* global NavigationMap */
(function navigationManager(exports) {
  let _focusedEl = null; // For saving current focus element
  const isFunction = function isFunction(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
  };

  const NavigationManager = function NavigationManager() {
    this.context = {};
    this.currentSelector = undefined;
    this.nextId = this.generatorId(0);

    /*
     * For backward compatibility
     * some applications do not invoke init method and still use navigation_handler.js
     * TODO: move to init once navigation_handler.js has removed from Dialer and CallScreen
     */
    document.addEventListener(
      'focusChanged',
      this.focusChandedHandler.bind(this)
    );
  };

  NavigationManager.prototype.CLASS_NAME = 'NavigationManager';
  NavigationManager.prototype.DEBUG = false;

  NavigationManager.prototype.init = function init(config) {
    this.config = config || {
      clickHandler: undefined
    };

    window.addEventListener('keydown', this.keyHandler.bind(this));
  };

  NavigationManager.prototype.keyHandler = function keyHandler(evt) {
    let el = evt.target;
    let focusElement = null;
    let prevFocused = null;

    this.debug(`key ${evt.key}`);
    if (
      NavigationMap &&
      NavigationMap.currentActivatedLength &&
      NavigationMap.currentActivatedLength > 0
    ) {
      return;
    }
    if (!el) {
      return;
    }

    if (evt.key === 'Enter' || evt.key === 'Accept') {
      this.click(el);
      this.dispatchEvent('accepted', {
        acceptedEl: el
      });
    } else {
      if (!el.classList) {
        return;
      }
      if (!el.classList.contains('focus')) {
        this.debug('event target does not have focus');
        el = document.querySelector('.focus');
      }

      focusElement = this.findElementFromNavProp(el, evt);
      if (focusElement) {
        prevFocused = document.querySelectorAll('.focus');
        if (focusElement === prevFocused[0]) {
          return;
        }
        if (prevFocused.length) {
          prevFocused[0].classList.remove('focus');
        }
        if (isFunction(this.scrollToElement)) {
          this.scrollToElement(focusElement, evt);
        } else {
          focusElement.scrollIntoView(false);
        }
        focusElement.classList.add('focus');
        _focusedEl = focusElement;
        const inPutForT9 = focusElement.querySelector('input[type="text"]');

        if (inPutForT9) {
          inPutForT9.focus();
        } else {
          focusElement.focus();
        }
        this.dispatchEvent('focusChanged', {
          focusedElement: focusElement
        });
      }
    }
  };

  NavigationManager.prototype.findElementFromNavProp = function findElementFromNavProp(
    currentlyFocused,
    evt
  ) {
    if (!currentlyFocused) {
      return null;
    }

    let elementID = null;
    const elmStyle = currentlyFocused.style;
    let handled = true;

    switch (evt.key) {
      case 'ArrowLeft':
        elementID = elmStyle.getPropertyValue('--nav-left');
        break;
      case 'ArrowRight':
        elementID = elmStyle.getPropertyValue('--nav-right');
        break;
      case 'ArrowUp':
        elementID = elmStyle.getPropertyValue('--nav-up');
        break;
      case 'ArrowDown':
        elementID = elmStyle.getPropertyValue('--nav-down');
        break;
      case 'Home':
      case 'MozHomeScreen':
        elementID = elmStyle.getPropertyValue('--nav-home');
        break;
      default:
        handled = false;
    }
    if (!elementID) {
      return null;
    }
    if (handled) {
      evt.preventDefault();
    }
    const selector = `[data-nav-id="${elementID}"]`;
    return document.querySelector(selector);
  };

  NavigationManager.prototype.click = function click(el) {
    if (this.config.clickHandler) {
      this.config.clickHandler(el);
    } else {
      el.click();
    }
  };

  NavigationManager.prototype.dispatchEvent = function dispatchEvent(
    event,
    data
  ) {
    const dataTemp =
      (data && {
        detail: data
      }) ||
      {};
    document.dispatchEvent(new CustomEvent(event, dataTemp));
  };

  NavigationManager.prototype.focusChandedHandler = function focusChandedHandler(
    e
  ) {
    const focusElement = e.detail.focusedElement,
      id = focusElement && focusElement.getAttribute('data-nav-id');

    if (!focusElement) return;

    if (this.currentSelector) {
      this.context[this.currentSelector] = id;
    }
  };

  NavigationManager.prototype.generatorId = function generatorId(base) {
    let localId = base;
    return function() {// eslint-disable-line
      return localId++;
    };
  };

  NavigationManager.prototype.delNavId = function delNavId(selector) {
    const items = document.querySelectorAll(selector);
    if (!items.length) {
      return;
    }

    Array.prototype.forEach.call(items, item =>
      item.removeAttribute('data-nav-id')
    );
  };

  NavigationManager.prototype.initNavId = function initNavId(items) {
    Array.prototype.forEach.call(items, item => {
      const navId = item.getAttribute('data-nav-id');
      if (!navId) {
        item.setAttribute('data-nav-id', this.nextId());
      }
    });
  };

  NavigationManager.prototype.prepareElements = function prepareElements(
    selector
  ) {
    if (!selector) {
      throw Error('selector is undefined');
    }

    const items = document.querySelectorAll(selector);
    const focused = Array.prototype.slice.call(
      document.querySelectorAll('.focus')
    );
    const focusedLength = focused.length;

    this.currentSelector = selector;
    this.debug(`items.length ${items.length}`);
    if (!items.length) {
      this.dispatchEvent('focusChanged', {
        focusChanged: null
      });
      return null;
    }
    if (focusedLength) {
      for (let j = 0; j < focusedLength; j++) {
        focused[j].classList.remove('focus');
      }
    }

    this.initNavId(items);
    return items;
  };

  // eslint-disable-next-line
  NavigationManager.prototype.reset = function reset(
    selector,
    navId,
    direction,
    withoutUpdate
  ) {
    const items = this.prepareElements(selector);
    _focusedEl = null; // Clear current focused cache
    if (items) {
      let [item] = items;
      let el = null;
      if (navId) {
        el = document.querySelector(`[data-nav-id="${navId}"]`);
        if (el) {
          item = el;
        }
      }
      this.context[selector] = item.dataset.navId;
      this.setFocus(item);
      if (!withoutUpdate) {
        this.update(selector, direction);
      }
    }
  };

  NavigationManager.prototype.unfocus = function unfocus() {
    const el = Array.prototype.slice.call(document.querySelectorAll('.focus'));
    el.forEach(item => {
      item.classList.remove('focus');
    });
  };
  NavigationManager.prototype.resetByNode = function resetByNode(
    selector,
    node,
    direction
  ) {
    const items = this.prepareElements(selector);
    _focusedEl = null;
    if (items) {
      let [item] = items;
      let arrElements = null;
      let checkNodeInSelector = null;
      if (node) {
        arrElements = Array.prototype.slice.call(
          document.querySelectorAll(selector)
        );
        checkNodeInSelector = arrElements.some(function check(elem) {
          return elem === node;
        });
        if (!checkNodeInSelector) {
          console.error('node is not exist in selector');
          return;
        }
        item = node;
      }
      this.context[selector] = item.dataset.navId;
      this.setFocus(item);
      this.update(selector, direction);
    }
  };

  /*
   * TODO: this code is specific. Further clients should implement update logic and
   * pass it to Navigation Manager
   */
  NavigationManager.prototype.update = function update(selector, direction) {
    let item = null;
    let j = 0;
    let nextItem = null;
    let prevItem = null;

    if (!document.querySelectorAll('.focus').length) {
      this.reset(selector);
      return;
    }
    if (!selector) {
      throw Error('selector is undefined');
    }

    const items = document.querySelectorAll(selector);

    this.debug(`items.length ${items.length}`);
    this.initNavId(items);

    if (items.length <= 1) {
      const index = 0;
      if ((item = items[index])) {
        item.style.removeProperty('--nav-down');
        item.style.removeProperty('--nav-up');
      }
      return;
    }
    this.debug(`${selector}.length = ${items.length}`);
    if (!direction) {
      direction = 'vertical';
    }

    if (typeof this.doUpdateCb === 'function') {
      this.doUpdateCb(items);
      return;
    }

    switch (direction) {
      case 'vertical':
        for (j = 0; j < items.length; j++) {
          item = items[j];
          prevItem = items[j - 1] || items[items.length - 1];
          nextItem = items[j + 1] || items[0];

          item.style.setProperty(
            '--nav-down',
            nextItem.getAttribute('data-nav-id')
          );
          item.style.setProperty(
            '--nav-up',
            prevItem.getAttribute('data-nav-id')
          );
        }
        break;
      case 'horizontal':
        for (j = 0; j < items.length; j++) {
          item = items[j];
          prevItem = items[j - 1] || items[items.length - 1];
          nextItem = items[j + 1] || items[0];

          item.style.setProperty(
            '--nav-right',
            nextItem.getAttribute('data-nav-id')
          );
          item.style.setProperty(
            '--nav-left',
            prevItem.getAttribute('data-nav-id')
          );
        }
        break;
      default:
        break;
    }
  };

  NavigationManager.prototype._linkToUp = function _linkToUp(from, to) {
    from.style.setProperty('--nav-up', to.getAttribute('data-nav-id'));
  };

  NavigationManager.prototype._linkToDown = function _linkToDown(from, to) {
    from.style.setProperty('--nav-down', to.getAttribute('data-nav-id'));
  };

  NavigationManager.prototype._linkToLeft = function _linkToLeft(from, to) {
    from.style.setProperty('--nav-left', to.getAttribute('data-nav-id'));
  };

  NavigationManager.prototype._linkToRight = function _linkToRight(from, to) {
    from.style.setProperty('--nav-right', to.getAttribute('data-nav-id'));
  };

  NavigationManager.prototype.appendToList = function appendToList(
    listContainer,
    items,
    direction
  ) {
    const len = listContainer.children.length;
    const itemsLen = items.length;

    items.forEach(item => {
      listContainer.appendChild(item);
      item.setAttribute('data-nav-id', this.nextId());
    });

    let linkToNxt = null;
    let linkToPrv = null;
    direction = direction || 'vertical';

    switch (direction) {
      case 'vertical':
        linkToPrv = this._linkToUp;
        linkToNxt = this._linkToDown;
        break;

      case 'horizontal':
        linkToPrv = this._linkToLeft;
        linkToNxt = this._linkToRight;
        break;
      default:
        break;
    }

    if (len) {
      linkToPrv(items[0], listContainer.children[len - 1]);
      linkToNxt(items[itemsLen - 1], listContainer.children[0]);

      linkToNxt(listContainer.children[len - 1], items[0]);
      linkToPrv(listContainer.children[0], items[itemsLen - 1]);
    } else {
      linkToPrv(items[0], items[itemsLen - 1]);
      linkToNxt(items[itemsLen - 1], items[0]);
    }

    if (itemsLen > 1) {
      linkToNxt(items[0], items[1]);
      linkToPrv(items[itemsLen - 1], items[itemsLen - 2]);

      for (let i = 1; i < itemsLen - 2; i++) {
        linkToPrv(items[i], items[i - 1]);
        linkToNxt(items[i], items[i + 1]);
      }
    }
  };

  NavigationManager.prototype.setFocus = function setFocus(item) {
    item.classList.add('focus');
    item.focus();
    _focusedEl = item;
    this.dispatchEvent('focusChanged', {
      focusedElement: item
    });
  };

  NavigationManager.prototype.getElementByNavId = function getElementByNavId(
    navId
  ) {
    return document.querySelector(`[data-nav-id="${navId}"]`);
  };

  NavigationManager.prototype.switchContext = function switchContext(
    selector,
    id,
    direction
  ) {
    if (!selector) {
      throw Error('selector is undefined');
    }

    const selected = id ? id : this.context[selector];
    this.reset(selector, selected, direction);
  };

  NavigationManager.prototype.debug = function debug(message) {
    if (this.DEBUG) {
      console.log(`${this.CLASS_NAME}: ${message}`);
    }
  };

  NavigationManager.prototype.getFocusedEl = function getFocusedEl() {
    return _focusedEl;
  };

  exports.NavigationManager = new NavigationManager();
})(window);
