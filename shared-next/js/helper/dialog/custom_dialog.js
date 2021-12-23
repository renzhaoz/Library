/* exported CustomDialog */
// XXXX: Waiting for the window.showModalDialog support in B2G
/* eslint-disable no-undef */

const CustomDialog = (function customDialog() {
  let container = null;
  let screen = null;
  let dialog = null;
  let header = null;
  let message = null;
  let input = null;
  let yes = null;
  let no = null;
  let backkeyCallback = null;
  let visibility = false;
  const callbacks = {
    cancel: null,
    confirm: null,
    accept: null,
    run: function run(type) {
      // eslint-disable-next-line no-unused-expressions
      this[type] && this[type].callback();
    }
  };
  const initSKs = function initSKs(actions) {
    if (CustomDialog.__version === 1) {
      if (typeof SoftkeyPanel === 'undefined') {
        LazyLoader.load(
          !window.SoftkeyPanel
            ? '%SHARED_APP_ORIGIN%/js/helper/softkey/softkey_panel.js'
            : [],
          function lazyLoaderCallback() {
            SoftkeyHelper.init(actions, function initCallback() {
              if (backkeyCallback !== null) {
                SoftkeyHelper.hide();
                backkeyCallback();
              }
            });
          }
        );
      } else {
        SoftkeyHelper.init(actions, function initCallback() {
          if (backkeyCallback !== null) {
            SoftkeyHelper.hide();
            backkeyCallback();
          }
        });
      }
    } else if (CustomDialog.__version === 2) {
      if (OptionHelper.softkeyPanel && OptionHelper.softkeyPanel.menuVisible) {
        OptionHelper.softkeyPanel.hideMenu();
      }
      OptionHelper.saveContext();
      OptionHelper.optionParams._for_custom_dialog = actions;
      OptionHelper.show('_for_custom_dialog');
    } else if (CustomDialog.__version === 3) {
      if (CustomDialog.softkeyPanel) {
        CustomDialog.softkeyPanel.initSoftKeyPanel(actions);
      }
    }
  };
  return {
    hide: function hide() {
      if (screen === null) {
        return;
      }

      if (!container) {
        container = document.body;
      }

      container.removeChild(screen);
      screen = null;
      dialog = null;
      header = null;
      message = null;
      yes = null;
      no = null;
      if (CustomDialog.__version === 2) {
        OptionHelper.returnContext();
      } else if (CustomDialog.__version === 1) {
        SoftkeyHelper.hide();
      }
      visibility = false;
      window.dispatchEvent(
        new CustomEvent('customDialogEvent', {
          detail: {
            visibility: false
          }
        })
      );
    },

    /**
     * Method that shows the dialog
     * @param  {Object} title the l10n id for the title of the dialog. null or
     *                  empty for no title. or you can give a object with more
     *                  options like {icon: path or empty string,
     *                  id: an l10n-id, args: an object of arguments that
     *                  parameterise the 'id' field}.
     * @param  {String} msg message for the dialog. give a object like the
     *                  title to enable more options.
     * @param  {Object} cancel {title, callback} object when confirm.
     * @param  {Object} confirm {title, callback} object when cancel.
     * @param  {Element} [containerElement] an optional element for which the
     *                   dialog will be injected
     */
    // eslint-disable-next-line max-params
    show: function show(
      title,
      msg,
      cancelAndBack,
      confirm,
      containerElement,
      center,
      inputType
    ) {
      const params = {
        menuClassName: 'menu-button',
        header: { l10nId: '' },
        items: []
      };
      container = containerElement || document.body;
      callbacks.confirm = confirm;
      callbacks.cancel = cancelAndBack;
      callbacks.accept = center;
      if (cancelAndBack) {
        if (cancelAndBack.backkeyCallback !== undefined) {
          ({ backkeyCallback } = cancelAndBack);
        }
        params.items.push({
          name: 'Cancel',
          l10nId: cancelAndBack.title,
          priority: 1,
          method() {
            if (CustomDialog.__version === 1) {
              SoftkeyHelper.hide();
            }
            cancelAndBack.callback();
          }
        });
      }
      if (center) {
        params.items.push({
          name: '',
          l10nId: center.title,
          priority: 2,
          method() {
            if (CustomDialog.__version === 1) {
              SoftkeyHelper.hide();
            }
            center.callback();
          }
        });
      }
      if (confirm) {
        params.items.push({
          name: 'Delete',
          l10nId: confirm.title,
          priority: 3,
          method() {
            if (CustomDialog.__version === 1) {
              SoftkeyHelper.hide();
            }
            if (input) {
              confirm.callback(input);
            } else {
              confirm.callback();
            }
          }
        });
      }
      initSKs(params);
      if (screen === null) {
        screen = document.createElement('form');
        screen.setAttribute('role', 'dialog');
        screen.setAttribute('data-type', 'confirm');
        screen.id = 'dialog-screen';

        dialog = document.createElement('section');
        screen.appendChild(dialog);

        /*
         * Create a reusable function to decorate elements with all
         * possible options, instead of scattering similar code about
         * everywhere.
         *
         * It's also possible to be extended with more usable decorating
         * options and elements.
         *
         * 'title'|'message' -> Object|String -> the element -> dialog
         * -> the decorated element
         */
        // eslint-disable-next-line max-params
        const decorateWithOptions = function decorateWithOptions(
          type,
          options,
          elm,
          // eslint-disable-next-line no-unused-vars,no-shadow
          dialog
        ) {
          if ('string' === typeof options) {
            elm.setAttribute('data-l10n-id', options);
            return elm;
          }

          const { icon } = options;

          let textElm = elm;

          if (icon && '' !== icon) {
            /*
             * We can't localize elements with child nodes
             * so if there's going to be an icon, we need to create a separate
             * node for text. See bug 1053629 for details
             */
            textElm = document.createElement('span');
            const iconImg = new Image();
            iconImg.src = icon;
            iconImg.classList.add(`custom-dialog-${type}-icon`);

            // Icons usually insert as the first element.
            elm.insertBefore(iconImg, elm.firstChild);
            elm.appendChild(textElm);
          }
          // More decorating options goes here.

          if (options.id) {
            window.api.l10n.setAttributes(textElm, options.id, options.args);
          } else {
            const text = options[type];
            textElm.textContent = text;
          }

          return elm;
        };

        const setElementText = function setElementText(element, options) {
          if ('string' === typeof options) {
            element.setAttribute('data-l10n-id', options);
          }

          if (options.id) {
            window.api.l10n.setAttributes(element, options.id, options.args);
          }
        };

        header = document.createElement('h1');
        header.id = 'dialog-title';
        if (title && title !== '') {
          header = decorateWithOptions('title', title, header, dialog);
        }
        dialog.appendChild(header);

        message = document.createElement('p');
        message.id = 'dialog-message';
        message = decorateWithOptions('message', msg, message, dialog);
        dialog.appendChild(message);

        if (inputType) {
          input = document.createElement('input');
          input.setAttribute('type', inputType);
          input.setAttribute('id', 'custom-input');
          confirm.input = input;
          dialog.appendChild(input);
        }

        if (cancelAndBack) {
          const menu = document.createElement('menu');
          menu.dataset.items = 1;

          no = document.createElement('button');

          /*
           * The default type of the button element is "Submit",
           * and form submit in system app would make system app reload.
           */
          no.type = 'button';

          setElementText(no, cancelAndBack.title);
          no.id = 'dialog-no';
          no.addEventListener('click', clickHandler);
          menu.appendChild(no);

          if (confirm) {
            menu.dataset.items = 2;
            yes = document.createElement('button');

            /*
             * The default type of button element is "Submit",
             * and form submit in system app would make system app reload.
             */
            yes.type = 'button';

            setElementText(yes, confirm.title);
            yes.id = 'dialog-yes';

            /*
             *Confirm can be with class "danger" or "recommend"
             *the default is "danger"
             */
            yes.className = confirm.recommend ? 'recommend' : 'danger';

            yes.addEventListener('click', clickHandler);
            menu.appendChild(yes);
          } else {
            // 1 button, should be full.
            no.classList.add('full');
          }
        }

        container.appendChild(screen);
      }

      // Make the screen visible
      screen.classList.add('visible');
      visibility = true;
      window.dispatchEvent(
        new CustomEvent('customDialogEvent', {
          detail: {
            visibility: true
          }
        })
      );

      // This is the event listener function for the buttons
      function clickHandler(evt) {
        // Hide the dialog
        screen.classList.remove('visible');

        // Call the appropriate callback, if it is defined
        if (evt.target === yes && confirm.callback) {
          confirm.callback();
        } else if (evt.target === no && cancel.callback) {
          cancel.callback();
        }
      }
      if (inputType) {
        input.focus();
      }
      return screen;
    },
    runConfirm() {
      callbacks.run('confirm');
    },
    runCancel() {
      callbacks.cancel ? callbacks.run('cancel') : callbacks.run('accept');
    },
    __version: 1,
    setVersion(version) {
      this.__version = version;
    },
    setSoftkeyPanel(softkeyPanel) {
      this.softkeyPanel = softkeyPanel;
    },
    get isVisible() {
      return visibility;
    }
  };
})();

window.CustomDialog = CustomDialog;
