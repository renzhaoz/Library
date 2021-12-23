/*
 * This function is used for send softkey content to system app for readout
 * keysInfo format:[
 *   { 'code': 'SoftLeft', // 'SoftLeft', 'Enter', 'SoftRight',
 *     'name': 'cancle'
 *   },
 *   {...},
 *   ...
 *  ]
 */
function registerSoftkeys(keysInfo) {
  // RegisterKeys via softkeyManager
  if (keysInfo) {
    const metaName = 'og:kaios:softkeyinfo';
    const softKeys = [];
    let softkeyInfoMeta = document.head.querySelector(
      `meta[name="${metaName}"]`
    );
    if (!softkeyInfoMeta) {
      softkeyInfoMeta = document.createElement('meta');
      softkeyInfoMeta.name = metaName;
      document.head.appendChild(softkeyInfoMeta);
    }
    keysInfo.forEach(key => {
      if (key.options.name) {
        if (typeof key.options.name === 'object') {
          if (key.options.name.text) {
            softKeys.push(`${key.code}: ${key.options.name.text}`);
          }
        } else {
          softKeys.push(`${key.code}: ${key.options.name}`);
        }
      }
    });
    softkeyInfoMeta.setAttribute('content', softKeys.join(', '));
  }
}

window.registerSoftkeys = registerSoftkeys;
