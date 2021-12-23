/* eslint-disable no-unused-expressions */

(function softkeyPanelHelper(exports) {
  let softkey = null;
  let backCallBack = [];
  let softkey_enabled = false;
  const HelperEvent = function HelperEvent(e) {
    switch (e.type) {
      case 'screenchange':
        if (!e.detail.screenEnabled) {
          softkey && softkey.hide();
        }
        break;
      case 'lockscreen-appopened':
        softkey && softkey.hide();
        break;
      case 'lockscreen-appclosed':
      case 'wake':
        if (softkey_enabled) {
          softkey && softkey.show();
        }
        break;
      case 'keydown':
        if (e.key === 'Backspace' || e.key === 'BrowserBack') {
          if (softkey_enabled) {
            // eslint-disable-next-line no-useless-call
            backCallBack.apply(null, []);
            e.preventDefault();
          }
        }
        break;
      default:
        break;
    }
  };

  window.addEventListener('keydown', HelperEvent);
  window.addEventListener('lockscreen-appopened', HelperEvent);
  window.addEventListener('lockscreen-appclosed', HelperEvent);
  window.addEventListener('screenchange', HelperEvent);
  window.addEventListener('wake', HelperEvent);

  const SoftkeyHelper = {
    applist: [],
    init(params, callback) {
      if (!softkey) {
        // eslint-disable-next-line no-undef
        softkey = new SoftkeyPanel({
          menuClassName: 'menu-button',
          items: [
            {
              name: 'create',
              priority: 1,
              // eslint-disable-next-line no-empty-function
              method() {}
            }
          ]
        });
      }
      softkey.initSoftKeyPanel(params);
      softkey.show();
      // eslint-disable-next-line no-empty-function
      backCallBack = callback || function nc() {};
      softkey_enabled = true;
    },
    updateSoftkey(params, keyStyle, name) {
      switch (keyStyle) {
        case '1':
          params.items[0].l10nId = name;
          break;
        case '3':
          params.items[1].l10nId = name;
          break;
        default:
          break;
      }
      softkey && softkey.initSoftKeyPanel(params);
    },

    show() {
      softkey && softkey.show();
    },

    onlyHide() {
      softkey && softkey.hide();
    },

    hide(name) {
      softkey && softkey.hide();
      // eslint-disable-next-line no-empty-function,func-names
      backCallBack = function() {};
      softkey_enabled = false;
      for (let i = 0; i < this.applist.length; i++) {
        if (this.applist[i].name === name) {
          this.applist.splice(i, 1);
          if (
            i === 0 &&
            this.applist.length > 0 &&
            this.applist[0].appliacation.front !== undefined
          ) {
            this.applist[0].appliacation.front();
          }
          break;
        }
      }
    },
    getSoftkey() {
      return softkey;
    },
    register(app, name) {
      for (let i = 0; i < this.applist.length; i++) {
        if (this.applist[i].name === name) {
          return;
        }
      }
      const applicationData = {
        appliacation: app,
        name
      };
      if (
        this.applist.length > 0 &&
        this.applist[0].appliacation.back !== undefined
      ) {
        this.applist[0].appliacation.back();
      }
      this.applist.unshift(applicationData);
    }
  };

  exports.SoftkeyHelper = SoftkeyHelper;
  // eslint-disable-next-line no-invalid-this
})(window);
