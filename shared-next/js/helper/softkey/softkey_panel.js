/* global NavigationMap, LazyLoader, OptionMenu */

/* eslint no-invalid-this: "off" */
const FORM_ID = 'softkeyPanel';
const SoftkeyPanel = function SoftkeyPanel(actions, optionMenuCallback, area) {
  if (!actions || !actions.items || actions.items.length === 0) {
    return;
  }
  this.softKeyArea = area || document.body;
  this.subMenuNeedHide = false;

  this.initSoftKeyPanel = function initSoftKeyPanel(actionlList) {
    if (this.handleDelay) {
      this.pause = true;
    }
    if (actionlList && actionlList.items && actionlList.items.length > 0) {
      if (this.actions && this.actions.items && this.actions.items.length > 0) {
        this.actions.clear();
      }
      this.actions = actionlList.items;
      this.header = actionlList.header || 'header';
      this.handlers.clear();

      /*
       * It is necessary to change softkey bar executing order by restart
       * the listener if the other softkey instance initialized (mainly
       * for CustomDialog)
       */
      this.stopListener();
      initSoftkeys.call(this);
      setSoftkeys.call(this);
      this.startListener();
    }
    if (this.handleDelay) {
      setTimeout(() => {
        this.pause = false;
      }, 200);
    }
  };

  this.startListener = function startListener() {
    window.addEventListener('keydown', this.keyDownHandler, true);
    window.addEventListener('menuChangeEvent', this.keyDownHandler);
  };

  this.stopListener = function stopListener() {
    window.removeEventListener('keydown', this.keyDownHandler, true);
    window.removeEventListener('menuChangeEvent', this.keyDownHandler);
  };

  this.keyDownHandler = function keyDownHandler(e) {
    if (!this.form) {
      return;
    }
    if (!this.form.classList.contains('visible') && !this.menuVisible) {
      return;
    }
    if (
      (e.key === 'Enter' || e.key === 'Accept') &&
      this.menuVisible &&
      this.menu
    ) {
      const focusedButton = this.menu.form.querySelector('.focus');
      let isSubMenu = false;
      if (focusedButton !== null) {
        isSubMenu = focusedButton.dataset.hasmenu || false;
      }
      if (this.menu && !isSubMenu) {
        closeMenu.call(this);
      }
      return;
    }
    if (this.pause) {
      return;
    }
    if (
      typeof NavigationMap !== 'undefined' &&
      NavigationMap.currentActivatedLength > 0
    ) {
      return;
    }
    switch (e.key) {
      case 'BrowserSearch':
      case 'F2': // Device key
      case 'SoftRight': // Emulator key
        if (this.menuVisible || !this.softKeyVisible) {
          break;
        }
        if (this.menuStartIndex === -1) {
          callMethod.call(this, this.buttonRsk);
        } else {
          openMenu.call(this);
        }
        e.preventDefault();
        e.stopPropagation();
        break;
      case 'ContextMenu':
      case 'F1': // Device key
      case 'SoftLeft': // Emulator key
        if (!this.menuVisible && this.softKeyVisible) {
          callMethod.call(this, this.buttonLsk);
          e.preventDefault();
        }
        break;

      /*
       * Case "End": //keybord key
       * case "ContextMenu": //emulator key
       * console.log("RSK relized", this.buttonLsk);
       * callMethod.call(this, this.buttonLsk);
       * break;
       */
      case 'Enter': // Keyboard key
      case 'Accept': // Emulator key
        if (this.menuVisible) {
          closeMenu.call(this);
        } else {
          if (!this.softKeyVisible) {
            break;
          }
          callMethod.call(this, this.buttonCsk);
        }
        break;
      case 'BrowserBack': // Emulator key
      case 'Backspace':
        if (this.menuVisible) {
          e.preventDefault();
        }
        if (this.menu && this.menu.subMenuDisplayed) {
          this.subMenuNeedHide = true;
        }
        closeMenu.call(this);
        break;
      default:
        break;
    }
    if (e.detail !== null) {
      switch (e.detail.action) {
        case 'closeMenu':
          closeMenu.call(this);
          break;
        default:
          break;
      }
    }
  }.bind(this);

  function createForm(formId) {
    const form = document.createElement('form');
    form.id = formId;
    form.dataset.type = this.actions.type || 'action';
    form.className = 'skbar';
    form.classList.add('none-paddings');
    form.setAttribute('data-z-index-level', 'softkeyPanel');
    form.addEventListener('updateKeyInfo', () => {
      modifyAllString.call(this);
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
    });

    // Add/remove
    form.addEventListener('transitionend', event => {
      if (event.target !== form) {
        return;
      }
      if (!form.classList.contains('visible') && form.parentNode) {
        if (this.softKeyArea) {
          this.softKeyArea.removeChild(form);
        } else {
          document.body.removeChild(form);
        }
      }
    });
    return form;
  }

  this.createPanel = function createPanel(form) {
    const lskDiv = document.createElement('div');
    const cskDiv = document.createElement('div');
    const rskDiv = document.createElement('div');

    this.buttonLsk = document.createElement('button');
    this.buttonLsk.className = 'sk-button';
    this.buttonLsk.setAttribute('id', 'software-keys-left');

    this.buttonCsk = document.createElement('button');
    this.buttonCsk.className = 'sk-button';
    this.buttonCsk.setAttribute('id', 'software-keys-center');

    this.buttonRsk = document.createElement('button');
    this.buttonRsk.className = 'sk-button';
    this.buttonRsk.setAttribute('id', 'software-keys-right');

    form.appendChild(lskDiv);
    form.appendChild(cskDiv);
    form.appendChild(rskDiv);

    lskDiv.appendChild(this.buttonLsk);
    cskDiv.appendChild(this.buttonCsk);
    rskDiv.appendChild(this.buttonRsk);

    initSoftkeys.call(this);
    setSoftkeys.call(this);
    this.startListener();
  };

  function initSoftkeys() {
    let lskReady = false;
    let cskReady = false;
    let rskReady = false;
    // Reset indexes
    this.menuStartIndex = -1;
    this.lskIndex = -1;
    this.cskIndex = -1;
    this.rskIndex = -1;

    for (let i = 0; i < this.actions.length; i++) {
      const curPriority = this.actions[i].priority;
      if (curPriority < this.menuActionsPriority) {
        // Trying to initialize softkeys, if they are not initialized yet
        if (!lskReady && curPriority === this.lskPriority) {
          this.lskIndex = i;
          lskReady = true;
        } else if (!cskReady && curPriority === this.cskPriority) {
          this.cskIndex = i;
          cskReady = true;
        } else if (!rskReady) { //eslint-disable-line
          if (i === this.actions.length - 1) {
            this.rskIndex = i;
          } else {
            /*
             * There are > 1 items in the actions list left:
             * - assign 'Options' to RSK and move tail to menu actions.
             */
            this.menuStartIndex = i;
          }
          rskReady = true;
          break;
        } else {
          console.warn('no SK for set actions');
        }
      } else if (!rskReady) {
        /*
         * There are no more actions with sufficient priorities in list
         * - assign 'Options' to RSK and move tail to menu actions.
         */
        this.menuStartIndex = i;
        rskReady = true;
        break;
      }
    }
  }

  function setSoftkeys() {
    function getSkHtml(item) {
      const name = item.l10nId ? window.api.l10n.get(item.l10nId) : item.name;
      const nameWithIcon = item.iconMixedText ? name : '';
      const innerContent = item.iconReverse
        ? `<span data-icon="${item.icon}"></span>
           <span data-name="${name}" class="with-icon-right">${nameWithIcon}</span>`
        : `<span data-name="${name}" class="with-icon-left">${nameWithIcon}</span>
           <span data-icon="${item.icon}"></span>`;
      return item.icon ? innerContent : name;
    }
    let needDisable = false;

    // eslint-disable-next-line
    function updateSoftKeys(actionList, handlers, button, index) {
      const item = actionList[index];
      handlers.set(button, item);
      button.innerHTML = getSkHtml(item);
      if (typeof item.l10nId === 'undefined') {
        if (item.icon) {
          button.firstChild.removeAttribute('data-l10n-id');
        } else {
          button.removeAttribute('data-l10n-id');
        }
      } else if (item.icon) {
        if (item.iconReverse) {
          button.lastChild.setAttribute('data-l10n-id', item.l10nId);
        } else {
          button.firstChild.setAttribute('data-l10n-id', item.l10nId);
        }
      } else {
        button.setAttribute('data-l10n-id', item.l10nId);
      }
      needDisable = item.disabled;
    }

    // Update LSK
    if (this.lskIndex !== -1) { // eslint-disable-line
      updateSoftKeys(
        this.actions,
        this.handlers,
        this.buttonLsk,
        this.lskIndex
      );
    } else {
      this.buttonLsk.innerHTML = '';
      this.buttonLsk.removeAttribute('data-l10n-id');
      needDisable = true;
    }
    disableSk(this.buttonLsk, needDisable);

    // Update CSK
    if (this.cskIndex !== -1) { // eslint-disable-line
      updateSoftKeys(
        this.actions,
        this.handlers,
        this.buttonCsk,
        this.cskIndex
      );
    } else {
      this.buttonCsk.innerHTML = '';
      this.buttonCsk.removeAttribute('data-l10n-id');
      needDisable = true;
    }
    disableSk(this.buttonCsk, needDisable);

    // Update RSK
    if (this.rskIndex !== -1) {
      updateSoftKeys(
        this.actions,
        this.handlers,
        this.buttonRsk,
        this.rskIndex
      );
    } else if (this.menuStartIndex != -1) { // eslint-disable-line
      this.buttonRsk.setAttribute('data-l10n-id', 'softkey-options');
      this.buttonRsk.innerHTML =
        window.api.l10n.get('softkey-options') || 'Options';
      needDisable = false;
    } else {
      this.buttonRsk.innerHTML = '';
      this.buttonRsk.removeAttribute('data-l10n-id');
      needDisable = true;
    }
    disableSk(this.buttonRsk, needDisable);
    modifyAllString.call(this);
  }

  function callMethod(button) {
    const action = this.handlers.get(button);

    if (typeof action !== 'undefined') {
      /* eslint-disable */
      const method = action.method || function () {};

      method.apply(null, action.params || []);

      if (typeof this.actions.complete === 'function' && !action.incomplete) {
        this.actions.complete();
      }
      /* eslint-enable */
    }
  }

  function closeMenu() {
    if (this.menu) {
      const promise = this.menu.hide();
      if (!promise) {
        return;
      }
      promise.then(() => {
        if (this.menu.subMenuDisplayed || this.subMenuNeedHide) {
          this.subMenuNeedHide = false;
          secondCall = false; // eslint-disable-line
        } else {
          this.menuVisible = false;
          setSoftkeys.call(this);
          document.dispatchEvent(this.menuHideEvent);
          window.dispatchEvent(this.menuHideEvent);
        }
      });
    }
  }
  this.hideMenu = function hideMenu() {
    closeMenu.call(this);
  };

  function openMenu() {
    if (document.querySelector('gaia-confirm')) {
      return;
    }
    setOptionMenuSk.call(this);

    let promise = null;
    const omParams = {
      header: this.header,
      items: this.actions
        .slice(this.menuStartIndex)
        .sort((a, b) => a.priority - b.priority),
      classes: ['group-menu', 'softkey'],
      menuClassName: this.menuClassName
    };
    if (typeof OptionMenu === 'undefined') {
      const lazyLoadFiles = [
        '%SHARED_APP_ORIGIN%/style/commons/action_menu.css',
        '%SHARED_APP_ORIGIN%/style/commons/option_menu.css'
      ];
      if (!window.OptionMenu) {
        lazyLoadFiles.push(
          '%SHARED_APP_ORIGIN%/js/helper/option_menu/option_menu.js'
        );
      }
      LazyLoader.load(lazyLoadFiles, () => {
        this.menu = new OptionMenu(omParams, this.optionMenuCallback);
        promise = this.menu.show();
        /* eslint-disable */
        promise && promise.then(() => {
            setOptionMenuSk.call(this);
            modifyAllString.call(this);
            document.dispatchEvent(this.menuShowEvent);
            window.dispatchEvent(this.menuShowEvent);
          });
          /* eslint-enable */
      });
    } else {
      // If(!this.menu)
      secondCall = false; // eslint-disable-line
      this.menu = new OptionMenu(omParams, this.optionMenuCallback);
      promise = this.menu.show();
      /* eslint-disable */
      promise && promise.then(() => { //eslint-disable-line
        setOptionMenuSk.call(this);
        modifyAllString.call(this);
        document.dispatchEvent(this.menuShowEvent);
        window.dispatchEvent(this.menuShowEvent);
      });
      /* eslint-enable */
    }
    this.menuVisible = true;
  }

  function setOptionMenuSk() {
    this.buttonLsk.innerHTML = '';
    disableSk(this.buttonLsk, true);
    this.buttonCsk.innerHTML = window.api.l10n.get('select');
    disableSk(this.buttonCsk, false);
    this.buttonRsk.innerHTML = '';
    disableSk(this.buttonRsk, true);
  }

  function disableSk(skBtn, isDisabled) {
    const alreadyDisabled = skBtn.hasAttribute('disabled');
    if (isDisabled && !alreadyDisabled) {
      skBtn.setAttribute('disabled', 'disabled');
    } else if (!isDisabled && alreadyDisabled) {
      skBtn.removeAttribute('disabled');
    }
  }
  this.handlers = new Map();
  this.menuActionsPriority = 4;
  this.actions = actions.items;
  this.header = actions.header || 'header';
  this.optionMenuCallback = optionMenuCallback;
  this.handleDelay = !!actions.handleDelay;
  this.pause = false;
  this.menuClassName = actions.menuClassName;
  if (typeof this.menuClassName === 'undefined') {
    this.menuClassName = 'menu-button';
  }
  this.menu = null;
  this.menuShowEvent = new CustomEvent('menuEvent', {
    detail: {
      softkeyPanel: this,
      menuName: this.menuClassName,
      menuVisible: true
    }
  });
  this.menuHideEvent = new CustomEvent('menuEvent', {
    detail: {
      softkeyPanel: this,
      menuName: this.menuClassName,
      menuVisible: false
    }
  });
  this.menuVisible = false;
  this.softKeyVisible = false;
  this.lskPriority = 1;
  this.cskPriority = 2;
  this.form = createForm.call(this, FORM_ID);

  this.createPanel(this.form);
  this.getLeftKey = function getLeftKey() {
    return this.buttonLsk;
  };
  this.getRightKey = function getRightKey() {
    return this.buttonRsk;
  };
  this.getCenterKey = function getCenterKey() {
    return this.buttonCsk;
  };
};

SoftkeyPanel.prototype.show = function show() {
  if (!this.form.parentNode) {
    if (this.softKeyArea) {
      this.softKeyArea.appendChild(this.form);
    } else {
      document.body.appendChild(this.form);
    }
  }
  this.form.classList.remove('inactive');
  this.form.classList.add('visible', 'focused');

  this.softKeyVisible = true;
  this.form.focus();
  modifyAllString.call(this);
};

function updateNextSoftkeyPanelKeysInfo() {
  const softkeyPanels = document.querySelectorAll(
    '#softkeyPanel.visible.focused'
  );
  if (softkeyPanels.length) {
    const nextSofkeyPanel = softkeyPanels[softkeyPanels.length - 1];
    nextSofkeyPanel.dispatchEvent(new CustomEvent('updateKeyInfo'));
  }
}

function modifyAllString() {
  const keysInfo = [];

  if (this.buttonLsk.innerHTML.length > 0) {
    // Get string from button before modifyString.
    keysInfo.push(getInfoFromButton(this.buttonLsk, this));
  }

  if (this.buttonCsk.innerHTML.length > 0) {
    // Get string from button before modifyString.
    keysInfo.push(getInfoFromButton(this.buttonCsk, this));
  }

  if (this.buttonRsk.innerHTML.length > 0) {
    // Get string from button before modifyString.
    keysInfo.push(getInfoFromButton(this.buttonRsk, this));
  }

  const softkeyPanels = document.querySelectorAll(
    '#softkeyPanel.visible.focused'
  );
  if (
    softkeyPanels.length &&
    softkeyPanels[softkeyPanels.length - 1] === this.form
  ) {
    if (window.registerSoftkeys) {
      window.registerSoftkeys(keysInfo);
    }
  }
}

function getInfoFromButton(targetElement, self) {
  const info = {};
  switch (targetElement) {
    case self.buttonLsk:
      info.code = 'SoftLeft';
      break;
    case self.buttonCsk:
      info.code = 'Enter';
      break;
    case self.buttonRsk:
      info.code = 'SoftRight';
      break;
    default:
      break;
  }

  const childElement = targetElement.querySelector('span');
  if (childElement) {
    const elementName = childElement.dataset.name;
    info.options = {
      name: elementName ? elementName : '',
      icon: childElement.dataset.icon
    };
  } else {
    info.options = {
      name: targetElement.textContent,
      icon: ''
    };
  }

  return info;
}

// To do Method doesn't work
SoftkeyPanel.prototype.hide = function hide() {
  this.form.classList.remove('visible', 'focused');
  this.softKeyVisible = false;
  if (window.registerSoftkeys) {
    window.registerSoftkeys([]);
  }
  updateNextSoftkeyPanelKeysInfo();
};

SoftkeyPanel.prototype.destroy = function destroy() {
  if (this.softKeyArea) {
    this.softKeyArea.removeChild(this.form);
  } else {
    document.body.removeChild(this.form);
  }
  this.form = null;
  this.stopListener();
  this.softKeyVisible = false;
  this.menuVisible = false;
};
if (!window.registerSoftkeys) {
  LazyLoader.load('%SHARED_APP_ORIGIN%/js/helper/softkey/softkey_register.js');
}

window.SoftkeyPanel = SoftkeyPanel;
