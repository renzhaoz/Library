/* eslint-disable no-undef, no-invalid-this */
/*
 * Generic action menu. Options should have the following structure:
 * //The priority is the show how to order menu items.
 * //Priority "1" is the left button, "2" is the second button, rest of all items are groupped and ordered by priority in the right "Options" menu.
 *
 * new OptionMenu(options);
 *
 * options {
 *
 * items: An array of menu options to render
 * eg.
 * [
 * {
 * name: 'Lorem ipsum',
 * l10nId: 'lorem',
 * l10nArgs: 'ipsum',
 * method: function optionMethod(param1, param2) {
 * // Method and params if needed
 * },
 * params: ['param1', '123123123'],
 * priority: 1 //
 * },
 * ....
 * ,
 *
 *
 * Last option has a different UI compared with the previous one.
 * This is because it's recommended to use as a 'Cancel' option
 * {
 * name: 'Cancel',
 * l10nId: 'Cancel'
 * method: function optionMethod(param) {
 * // Method and param if needed
 * },
 * params: ['Optional params'],
 *
 * // Optional boolean flag to tell the
 * // menu button handlers that this option
 * // will not execute the "complete" callback.
 * // Defaults to "false"
 *
 * incomplete: false [true]
 * }
 * ],
 *
 * // Optional header text or node
 * header: ...,
 *
 * // additional classes on the dialog, as an array of strings
 * classes: ...
 *
 * // Optional section text or node
 * section: ...
 *
 * // Optional data-type: confirm or action
 * type: 'confirm'
 *
 * // Optional callback to be invoked when a
 * // button in the menu is pressed. Can be
 * // overridden by an "incomplete: true" set
 * // on the menu item in the items array.
 * complete: function() {...}
 * }
 */

const SUB_MENU_PREFIX = 'submenu_';
let secondCall = false;
const OptionMenu = function OptionMenu(options, optionMenuCallback) {
  if (!options || !options.items || options.items.length === 0) {
    return;
  }
  // eslint-disable-next-line no-invalid-this
  this.optionMenuCallback = optionMenuCallback;
  /*
   * Create a private, weakly held entry for
   * this instances DOM object references
   * More info:
   * https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/WeakMap
   */
  const handlers = new WeakMap();
  // Retrieve items to be rendered
  const mainItems = [];
  const subItemsMap = {};
  let { menuClassName } = options;
  if (!menuClassName) {
    menuClassName = 'menu-button';
  }
  const self = this;
  const menuPre = document.getElementById('option-menu');
  if (menuPre && menuPre.parentNode) {
    menuPre.remove();
  }
  let header = null;
  // Create the structure
  this.form = document.createElement('form');
  this.form.id = 'option-menu';
  this.form.dataset.type = options.type || 'action';
  this.form.dataset.subtype = 'menu';
  this.form.setAttribute('role', 'dialog');
  this.form.tabIndex = -1;
  this.subMenuDisplayed = false;

  const { classList } = this.form;

  if (options.classes) {
    // eslint-disable-next-line prefer-spread
    classList.add.apply(classList, options.classes);
  }

  if (options.section) {
    const section = document.createElement('section');

    if (typeof options.section === 'string') {
      section.textContent = options.section || '';
    } else {
      section.appendChild(options.section);
    }

    this.form.appendChild(section);
  }

  getMenuItems(options.items);

  // We append a menu with the list of options
  const menu = document.createElement('menu');
  menu.id = 'mainmenu';
  menu.dataset.items = mainItems.length;

  // We append title if needed
  if (options.header) {
    header = document.createElement('h1');
    if (typeof options.header === 'string') {
      header.textContent = options.header || '';
    } else if (options.header.l10nId) {
      header.setAttribute('data-l10n-id', options.header.l10nId);
    } else {
      header.appendChild(options.header);
    }

    this.form.appendChild(header);
  }

  // eslint-disable-next-line init-declarations
  let firstItemId;
  // For each option, we append the item and listener
  mainItems.forEach(function renderOption(item) {
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add(menuClassName);
    button.classList.add('p-pri');
    if (item.id) button.id = item.id;
    if (item.l10nId) {
      window.api.l10n.setAttributes(button, item.l10nId, item.l10nArgs);
      if (button.textContent === '') {
        button.textContent = item.name || '';
      }
    } else if (item.name && item.name.length) {
      button.textContent = item.name || '';
    } else {
      // No l10n or name, just empty item, don't add to the menu
      return;
    }
    if (item.disable) {
      button.classList.add('disabled');
    }
    menu.appendChild(button);
    if (!firstItemId) {
      if (!button.id) {
        button.id = 'option-menu-first-item';
      }
      firstItemId = button.id;
    }
    /*
     * Add a mapping from the button object
     * directly to its options item.
     */
    item.incomplete = item.incomplete || false;

    handlers.set(button, item);
  });

  this.form.addEventListener('submit', function submitFunc(event) {
    event.preventDefault();
  });

  this.form.addEventListener(
    'transitionend',
    function transitionend(event) {
      if (event.target !== this.form) {
        return;
      }

      if (!this.form.classList.contains('visible')) {
        if (this.form.parentNode) {
          this.form.remove();
        }
      } else {
        this.form.focus();
      }

      document.body.classList.remove('dialog-animating');
      if (window.NavigationMap) {
        NavigationMap.lockNavigation = false;
      }
    }.bind(this)
  );

  menu.addEventListener('click', menuHandler);

  // Appending the action menu to the form
  this.form.appendChild(menu);
  if (header) {
    header.setAttribute('role', 'heading');
    header.setAttribute('aria-labelledby', firstItemId);
  }
  genSubMenus.call(this);

  function menuHandler(event) {
    if (secondCall) return;
    secondCall = true;

    const { target } = event;
    if ('true' === target.dataset.hasmenu) {
      self.subMenuDisplayed = true;
      menuOwnerHandler(target);
      secondCall = false;
      return;
    }

    let action = handlers.get(target);
    // eslint-disable-next-line init-declarations
    let method;
    if (!action && target.tagName.toLowerCase() === 'menu') {
      const focusItem = target.querySelector('.focus');
      if (focusItem) {
        focusItem.focus();
        action = handlers.get(focusItem);
      }
    }
    /*
     * Delegate operation to target method. This allows
     * for a custom "Cancel" to be provided by calling program.
     *
     * Further operations should only be processed if
     * an actual button was pressed.
     */
    if (typeof action !== 'undefined') {
      // eslint-disable-next-line no-empty-function
      method = action.method || function func() {};

      // eslint-disable-next-line prefer-spread
      method.apply(null, action.params || []);

      // Hide action menu when click is received
      self.hide();

      if (typeof options.complete === 'function' && !action.incomplete) {
        options.complete();
      }
    }
  }

  function menuOwnerHandler(owner) {
    const subid = SUB_MENU_PREFIX + owner.id;
    const submenu = getSubMenu(subid);
    if (submenu) {
      // Submenu.style.bottom = Math.max(window.innerHeight - target.offsetTop - target.offsetHeight - submenu.offsetHeight, 0) + 'px';
      setTimeout(() => {
        self.toggleMainMenu(false);
        menu.classList.add('submenu-displayed');
        owner.classList.add('submenu-owner');
        submenu.classList.remove('hidden');
        self._setFocus(submenu.children[1]);
      }, 400);
    }

    function getSubMenu(id) {
      for (let i = 1; i < self.form.children.length; i++) {
        const item = self.form.children[i];
        if (item.id === id) return item;
      }
      return null;
    }
  }

  // Used for getting the items of both mainmenu and submenu
  function getMenuItems(items) {
    for (const item of items) {
      const { fid } = item;
      if (fid) {
        if (subItemsMap[fid]) subItemsMap[fid].push(item);
        else subItemsMap[fid] = [item];
      } else {
        mainItems.push(item);
      }
    }
  }

  // Used for generating submenu
  function genSubMenus() {
    for (const fid in subItemsMap) {
      const subItems = subItemsMap[fid];
      // eslint-disable-next-line no-continue
      if (!Array.isArray(subItems) || subItems.length === 0) continue;
      console.log('genSubMenus', fid, subItems);
      const submenu = document.createElement('menu');
      submenu.id = SUB_MENU_PREFIX + fid;
      submenu.setAttribute('fid', fid);
      submenu.dataset.subtype = 'submenu';
      submenu.dataset.items = subItems.length;
      submenu.classList.add('hidden');
      submenu.setAttribute('role', 'heading');
      submenu.setAttribute('aria-labelledby', 'sub-menu-header');
      genSubHeader(submenu, fid);
      for (const item of subItems) {
        const button = document.createElement('button');
        button.type = 'button';
        button.classList.add(menuClassName);
        button.classList.add('p-pri');
        if (item.id) button.id = item.id;
        if (item.l10nId)
          window.api.l10n.setAttributes(button, item.l10nId, item.l10nArgs);
        else button.textContent = item.name;
        item.incomplete = item.incomplete || false;
        handlers.set(button, item);
        submenu.appendChild(button);
      } // For
      submenu.addEventListener(
        'click',
        function click(event) {
          this.subMenuDisplayed = false;
          menuHandler(event);
          // eslint-disable-next-line no-invalid-this
        }.bind(this)
      );
      this.form[fid].dataset.hasmenu = 'true';
      this.form.appendChild(submenu);
    } // For

    function genSubHeader(submenu, fid) {
      const item = mainItems.find(i => i.id === fid);
      if (item) {
        const subHeader = document.createElement('header');
        subHeader.id = 'sub-menu-header';
        subHeader.setAttribute('role', 'heading');
        if (item.l10nId) {
          window.api.l10n.setAttributes(subHeader, item.l10nId, item.l10nArgs);
        } else {
          subHeader.textContent = item.name;
        }
        submenu.appendChild(subHeader);
      }
    }
  } // GenSubMenus
};

OptionMenu.prototype._setFocus = function _setFocus(element) {
  const focused = document.querySelector('.focus');
  if (focused) focused.classList.remove('focus');
  element.setAttribute('tabindex', 1);
  element.classList.add('focus');
  element.focus();
};

// We prototype functions to show/hide the UI of action-menu
OptionMenu.prototype.show = function show() {
  if (window.NavigationMap) {
    NavigationMap.lockNavigation = true;
  }
  // Remove the focus to hide the keyboard asap
  // eslint-disable-next-line no-unused-expressions
  document.activeElement && document.activeElement.blur();

  if (!this.form.parentNode) {
    document.body.appendChild(this.form);

    /*
     * Flush style on form so that the show transition plays once we add
     * the visible class.
     */
    // eslint-disable-next-line no-unused-expressions
    this.form.clientTop;
  }
  this.form.classList.add('visible');
  document.body.classList.add('dialog-animating', 'show-option');
  if (this.optionMenuCallback) {
    this.optionMenuCallback(true);
  }

  const menu = document.getElementById('mainmenu');
  const header = this.form.querySelector('h1');
  if (menu && header) {
    // The setTimeout can to avoid getting menu.offsetHeight when pop animation is showing
    setTimeout(() => {
      header.setAttribute('style', `bottom:${menu.offsetHeight}px`);
    });
  }

  return Promise.resolve();
};

OptionMenu.prototype.toggleMainMenu = function toggleMainMenu(display) {
  const header = this.form.querySelector('h1');
  const mainmenu = this.form.querySelector('#mainmenu');
  if (display) {
    mainmenu.classList.remove('hidden');
    header.classList.remove('hidden');
  } else {
    mainmenu.classList.add('hidden');
    header.classList.add('hidden');
  }
};

OptionMenu.prototype.hide = function hide() {
  if (!this.form.classList.contains('visible')) {
    return;
  }

  if (this.subMenuDisplayed) {
    const selector = 'form[data-subtype=menu] > menu > button.submenu-owner';
    const owner = document.querySelector(selector);
    if (owner) {
      const submenu = document.getElementById(SUB_MENU_PREFIX + owner.id);
      if (submenu) {
        submenu.classList.add('hidden');
        owner.classList.remove('submenu-owner');
        owner.parentElement.classList.remove('submenu-displayed');
        this.subMenuDisplayed = false;
        this.toggleMainMenu(true);
        this._setFocus(owner);
        secondCall = false;
        // eslint-disable-next-line consistent-return
        return new Promise(resolve => {
          resolve();
        });
      }
    }
  }
  this.form.setAttribute('aria-hidden', 'true');
  this.form.classList.remove('visible');
  if (this.optionMenuCallback) {
    this.optionMenuCallback(false);
  }

  setTimeout(() => {
    document.body.classList.remove('show-option');
  }, 10);

  // eslint-disable-next-line consistent-return
  return new Promise(resolve => {
    const timer = setTimeout(() => {
      resolve();
    }, 300);

    this.form.addEventListener('transitionend', () => {
      if (timer) {
        clearTimeout(timer);
      }
      resolve();
    });
  });
};

window.OptionMenu = OptionMenu;
