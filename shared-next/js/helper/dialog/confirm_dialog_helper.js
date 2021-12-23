/* global LazyLoader */
/* eslint-disable no-unused-vars, no-undef, no-unused-expressions, no-empty-function*/
(function confirmDialogHelper() {
  const resources = [
    '%SHARED_APP_ORIGIN%/elements/gaia_confirm/gaia_confirm.js'
  ];
  if (!window.ComponentUtils) {
    resources.push(
      '%SHARED_APP_ORIGIN%/js/utils/components/component_utils.js'
    );
  }

  let dialogHelperElement = null;
  const confirmSoftkey = new SoftkeyPanel({
    menuClassName: 'menu-button',
    items: [
      {
        name: '',
        priority: 1,
        method() {
          console.log('confirmSoftkey created');
        }
      }
    ]
  });
  confirmSoftkey.hide();

  /**
   * Generic dialog helper this _depends_ on <gaia-confirm> but is not required
   * to be loaded as part of the main gaia-confirm script.
   */
  function ConfirmDialogHelper(config) {
    this.config = config;
  }

  ConfirmDialogHelper.prototype = {
    activeElement: null,
    deltaTop: 100,
    Softkey: confirmSoftkey,
    isShown: false,
    show(parent) {
      LazyLoader.load(resources, this._show.bind(this, parent));
    },

    _show(parent) {
      const { config } = this;
      const self = this;

      if (NavigationMap && NavigationMap.currentActivatedLength > -1) {
        if (!NavigationMap.currentActivatedLength) {
          NavigationMap.currentActivatedLength = 1;
        } else {
          setTimeout(() => {
            self.show(parent);
          }, 600);
          return;
        }
      }
      self.parent = parent;
      self.activeElement = document.activeElement;
      const wrapper = document.createElement('div');

      // Only include a cancel button if the config was given...
      const cancelButton = config.cancel
        ? '<button class="cancel" type="button"></button>'
        : '';
      const confirmClass = config.system ? 'insystem' : '';
      const extraClass = config.extraClass ? config.extraClass : '';
      // This is a hack set role="menuitem" in order to readout all components content.
      const contentStyle =
        'font-weight: normal;' +
        'word-wrap: break-word;' +
        'margin: 0;' +
        'padding: 1rem;' +
        'line-height: 2.4rem;' +
        'color: var(--color-gs90);' +
        'background: var(--color-gs10);';
      wrapper.innerHTML =
        `<gaia-confirm role="menuitem" tabindex="-1" class=${confirmClass} ${extraClass}>` +
        `<h1 slot="title" style="text-align:center;"></h1>` +
        `<div slot="content" class="content"><div>` +
        `<p style="${contentStyle}"></p>` +
        `<p class="noborder" style="${contentStyle}" hidden></p>` +
        `</div></div>` +
        `</gaia-confirm>`;

      const element = wrapper.firstElementChild;

      this.element = element;
      dialogHelperElement = element;

      element.dataset.type = config.type;
      element.addEventListener('confirm', this);
      element.addEventListener('cancel', this);
      element.addEventListener('accept', this);
      window.addEventListener('keydown', this);

      /*
       * XXX: Primarily here for pressing the home screen button.
       * The home button triggers a hashchange of the homescreen.
       */
      window.addEventListener('hashchange', this);
      // TO DO: Add visibility change handling...

      const plist = element.querySelectorAll('p');
      const title = element.querySelector('h1');
      const [body, desc] = plist;

      /*
       *Var cancel = element.querySelector('.cancel');
       *var confirm = element.querySelector('.confirm');
       */

      const setL10nAttributes = function setL10nAttributes(ele, options) {
        if ('string' === typeof options) {
          window.api.l10n.setAttributes(ele, options);
        }

        if (options.id) {
          window.api.l10n.setAttributes(ele, options.id, options.args);
        } else if (options.text) {
          ele.textContent = options.text;
        }
      };

      setL10nAttributes(title, config.title);
      setL10nAttributes(body, config.body);

      if (config.body.html) {
        body.innerHTML = config.body.html;
      }

      if (!config.title.id && !config.title.text) {
        element.querySelector('h1').hidden = true;
      }

      if (config.desc || (config.desc && config.desc !== '')) {
        desc.hidden = false;
        setL10nAttributes(desc, config.desc);
      } else {
        desc.hidden = true;
      }

      element.setAttribute('hidden', '');
      parent.appendChild(element);
      self.activeElement.blur();

      /*
       * This nested requestAnimationFrame is to work around the coalescing
       * of the style changes associated with removing of the 'hidden'
       * attribute with the creation of the element.
       * For whatever reason, flushing the style with the usual trick of
       * accessing clientTop doesn't work, and a setTimeout requires an
       * unreasonably lengthy timeout (>50ms) to work, and that may not be
       * a reliable solution.
       * This work-around, though gross, appears to work consistently without
       * introducing too much lag or extra work.
       */
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          element.removeAttribute('hidden');
          // Call scrollContext here to get correct maxHeight of the content.
          self.scrollContext('ArrowUp');
          self.element.addEventListener('transitionend', function udInput() {
            if (self.input) {
              const len = self.input.value.length;
              self.input.focus();
              self.input.setSelectionRange(len, len);
              self.input.oninput = () => {
                self.updateSoftkey();
              };
            }
            self.element.removeEventListener('transitionend', udInput);
            self.isShown = true;
          });
          window.dispatchEvent(new CustomEvent('gaia-confirm-open'));
        });
      });

      // Init softkey
      this.input = element.querySelector('input');
      this.updateSoftkey();
    },

    updateSoftkey() {
      const softkeyParams = {
        menuClassName: 'menu-button',
        header: {},
        items: []
      };
      const bShowRSK = !this.input || this.input.value.trim().length > 0;
      if (this.config.cancel) {
        softkeyParams.items.push({
          name: '',
          priority: 1,
          l10nId: this.config.cancel.l10nId,
          method() {}
        });
      }
      if (this.config.accept) {
        softkeyParams.items.push({
          name: '',
          priority: 2,
          l10nId: this.config.accept.l10nId,
          icon: this.config.accept.icon || null,
          method() {}
        });
      }
      if (this.config.confirm && bShowRSK) {
        softkeyParams.items.push({
          name: '',
          priority: 3,
          l10nId: this.config.confirm.l10nId,
          method() {}
        });
      }
      confirmSoftkey.initSoftKeyPanel(softkeyParams);
      confirmSoftkey.show();
    },

    close() {
      this.destroy();
      confirmSoftkey.hide();
    },

    destroy() {
      if (!this.element || !this.isShown) {
        return;
      }
      if (NavigationMap && NavigationMap.currentActivatedLength > -1) {
        NavigationMap.currentActivatedLength = 0;
      }
      this.activeElement.focus();
      // Ensure cleanup of our hacks!
      window.removeEventListener('hashchange', this);
      window.removeEventListener('keydown', this);

      this.element.addEventListener('transitionend', e => {
        if (e.target !== this.element) {
          return;
        }

        this.element.parentNode.removeChild(this.element);
        this.element = null;
        this.isShown = false;
        window.dispatchEvent(new CustomEvent('gaia-confirm-close'));
      });

      this.element.setAttribute('hidden', '');
    },

    // Scroll to up/down
    scrollContext(key) {
      const dialogContainer = this.parent.querySelector('div.content');
      const headerHeight = this.parent.querySelector('h1').clientHeight;
      const containerHeight =
        document.body.clientHeight -
        this.getSoftkeyHeight() -
        this.getStatusBarHeight() -
        headerHeight;
      dialogContainer.style.maxHeight = `${containerHeight}px`;
      // If dialog shows all texts , no need to scroll it
      if (dialogContainer.clientHeight < containerHeight) {
        this.scroll = false;
        return;
      }

      dialogContainer.scrollTop =
        key === 'ArrowUp'
          ? dialogContainer.scrollTop - this.deltaTop
          : dialogContainer.scrollTop + this.deltaTop;
    },

    getSoftkeyHeight() {
      let height = 0;
      const softKeyPanel = document.querySelector(`#${FORM_ID}`);
      if (softKeyPanel && softKeyPanel.classList.contains('visible')) {
        height = softKeyPanel.clientHeight;
      }
      return height;
    },

    getStatusBarHeight() {
      const style = getComputedStyle(document.body);
      const fontSize = parseFloat(style.fontSize);
      // 2 is 2rem from visual spec for the margin between statusbar and dialog.
      const rem = parseFloat(style.getPropertyValue('--statusbar-height')) + 2;
      return fontSize * rem;
    },

    handleEvent(e) {
      // Ensure we hide the dialog in the face of other errors.

      switch (e.type) {
        case 'hashchange':
          // Hashchange is only here to trigger this to call destroy.
          break;
        case 'confirm': {
          const confirm = this.config.confirm.callback;
          let cValue = null;
          if (this.input) {
            cValue = this.input.value.trim();
          }
          this.destroy();
          confirm && confirm(cValue);
          break;
        }
        case 'cancel': {
          this.destroy();
          const cancel = this.config.cancel.callback;
          cancel && cancel();
          break;
        }
        case 'accept': {
          this.destroy();
          const accept = this.config.accept.callback;
          accept && accept();
          break;
        }
        default:
          break;
      }
      // Handle back key
      switch (e.key) {
        case 'BrowserBack':
        case 'KanjiMode':
        case 'Backspace': {
          confirmSoftkey.hide();
          this.destroy();
          const back = this.config.backcallback;
          back && back();
          e.preventDefault();
          e.stopPropagation();
          break;
        }
        case 'Enter':
        case 'Accept':
          if (this.config.accept) {
            confirmSoftkey.hide();
            this.element.dispatchEvent(new CustomEvent('accept'));
          }
          break;
        case 'ContextMenu':
        case 'SoftLeft':
        case 'F1':
          if (this.config.cancel && this.isShown) {
            confirmSoftkey.hide();
            this.element.dispatchEvent(new CustomEvent('cancel'));
          }
          break;
        case 'ArrowUp':
        case 'ArrowDown':
          this.scrollContext(e.key);
          e.preventDefault();
          e.stopPropagation();
          break;
        case 'BrowserSearch':
        case 'SoftRight':
        case 'F2':
          if (this.input && this.input.value.trim().length < 1) {
            break;
          }
          if (this.config.confirm && this.isShown) {
            confirmSoftkey.hide();
            this.element.dispatchEvent(new CustomEvent('confirm'));
          }
          break;
        default:
          break;
      }
    }
  };

  // This name is intentionally verbose.
  window.ConfirmDialogHelper = ConfirmDialogHelper;
})(window);
