/* global WebActivity */
// eslint-disable-next-line no-unused-vars
const Toaster = (function toaster() {
  function showToast(options) {
    /*
     * COS IAC will be abandon in Next. Just console until the IAC
     * replacement solution
     */
    const _ = window.api.l10n.get;
    if (options.messageL10nId && !options.message) {
      options.message = _(options.messageL10nId, options.messageL10nArgs);
      options.messageL10nId = null;
      options.messageL10nArgs = null;
    }
    if (options.titleL10nId && !options.title) {
      options.title = _(options.titleL10nId, options.titleL10nArgs);
      options.titleL10nId = null;
      options.titleL10nArgs = null;
    }
    try {
      const activity = new WebActivity(`show-toast`, {
        title: options.title,
        gaiaIcon: options.gaiaIcon,
        text: options.message,
        timeout: options.latency
      });
      activity.start();
    } catch (e) {
      console.error(`Toast error: ${e.name}`);
    }
  }
  return {
    showToast
  };
})();

window.Toaster = Toaster;
