import BaseModule from 'base-module';
import Service from 'service';

class Snapshot extends BaseModule {
  snapshotItemNumber() {
    return 3;
  }

  start() {
    this.name = 'Snapshot';
    this.HTML_CACHE_VERSION = '1.0.1';
    this._ = window.api.l10n.get;
    Service.register('backupScreen', this);
    Service.registerState('snapshotItemNumber', this);
    Service.registerState('getBackupHour12', this);
  }


  backupScreen(config) {
    // Get string dom
    window.dispatchEvent(new CustomEvent('renderDomToString'));

    if (!window.domString) {
      return;
    }

    const cacheSnapshot = document.createElement('div');
    cacheSnapshot.innerHTML = window.domString;
    window.domString = null;

    this.backupSoftkey(cacheSnapshot, config);
    const language = navigator.language;
    const hour12 = window.api.hour12;
    const html = this.HTML_CACHE_VERSION + ',' + language + ',' + hour12 + ',:'
      + cacheSnapshot.innerHTML;
    localStorage.setItem('snapshot', html);
  }

  backupSoftkey(cacheSnapshot, config) {
    let left = cacheSnapshot.querySelector('#software-keys-left');
    let right = cacheSnapshot.querySelector('#software-keys-right');
    let center = cacheSnapshot.querySelector('#software-keys-center');
    left.textContent = config.left !== undefined ? this._(config.left) : '';
    right.textContent = config.right !== undefined ? this._(config.right) : '';
    center.textContent = config.center !== undefined ? this._(config.center) : '';
    if (config.center !== undefined && config.center.icon) {
      center.dataset.icon = config.center.icon;
    }
  }

  getBackupHour12() {
    const snapshotCache = window.localStorage.getItem('snapshot');
    if (snapshotCache) {
      const value = snapshotCache.split(',');
      if (value[2]) {
        return value[2] === 'true';
      }
    }
    return null;
  }
}

const instance = new Snapshot();
instance.start();
export default instance;
