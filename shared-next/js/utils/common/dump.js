/* global dump */
(function dump_func() {
  // eslint-disable-next-line no-empty-function
  function dump_off() {}
  function dump_on(msg, optionalObject) {
    let output = msg;
    if (optionalObject) {
      output += JSON.stringify(optionalObject);
    }
    if (typeof dump === 'function') {
      const appName = document.location.hostname.replace(/\..*$/g, '');
      dump(`[${appName}] ${output}\n`);
    } else {
      console.log(output);
    }
  }

  window.DUMP = dump_off; // No traces by default
  window.DumpOn = dump_on;
  // eslint-disable-next-line no-undef
  if (SettingsObserver) {
    // Enable/disable DUMP according to the related setting
    // eslint-disable-next-line no-undef
    SettingsObserver.observe('debug.gaia.enabled', false, value => {
      window.DUMP = value ? dump_on : dump_off;
      dump_on(value ? 'Enabling DUMP' : 'Disabling DUMP');
    });
  }
})();
