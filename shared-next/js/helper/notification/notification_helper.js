/* exported NotificationHelper */
(function notificationHelper(window) {
  window.NotificationHelper = {
    getIconURI: function getIconURI(app, entryPoint) {
      let { icons } = app.manifest;

      if (entryPoint) {
        ({ icons } = app.manifest.entry_points[entryPoint]);
      }

      if (!icons) {
        return null;
      }

      const sizes = Object.keys(icons).map(function parse(str) {
        return parseInt(str, 10);
      });
      sizes.sort(function sort(x, y) {
        return y - x;
      });

      const HVGA = document.documentElement.clientWidth < 480;
      const index = sizes[HVGA ? sizes.length - 1 : 0];
      return app.installOrigin + icons[index];
    },

    /*
     * TitleL10n and options.bodyL10n may be:
     * A string -> l10nId
     * an object -> {id: l10nId, args: l10nArgs}
     * an object -> {raw: string}
     */
    send: function send(titleL10n, options) {
      return new Promise(function promiseCallback(resolve) {
        window.api.l10n.once(function callback() {
          const title = getL10n(titleL10n);

          if (options.bodyL10n) {
            options.body = getL10n(options.bodyL10n);
          }

          options.dir = window.api.l10n.language.direction;
          options.lang = window.api.l10n.language.code;

          const notification = new window.Notification(title, options);

          if (options.closeOnClick !== false) {
            notification.addEventListener('click', function nh_click() {
              notification.removeEventListener('click', nh_click);
              notification.close();
            });
          }

          resolve(notification);
        });
      });
    }
  };

  function getL10n(l10nAttrs) {
    if (typeof l10nAttrs === 'string') {
      return window.api.l10n.get(l10nAttrs);
    }
    if (l10nAttrs.raw) {
      return l10nAttrs.raw;
    }
    return window.api.l10n.get(l10nAttrs.id, l10nAttrs.args);
  }
  // eslint-disable-next-line no-invalid-this
})(window);
