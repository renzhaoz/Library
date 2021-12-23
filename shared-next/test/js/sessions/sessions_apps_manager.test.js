describe('session js <apps_manager> test', () => {
  const common = require('../../common');
  const dispatchEvent = common.dispatchEvent;

  beforeEach((done) => {
    require('../../mock/window_api_mock');
    require('../../../js/session/apps_manager/apps_manager');
    done();
  });

// services-load-complete event should be monitored
  test('services-load-complete', done => {
    dispatchEvent('services-load-observer');
    expect(AppsManager.connected).toBe(true);
    done();
  });

// session-disconnected event should be monitored
  test('session-disconnected', done => {
    dispatchEvent('session-disconnected');
    expect(AppsManager.connected).toBe(false);
    done();
  });

  test('apps_manager member functions called correct', done => {
    require('../../mock/daemon_task_scheduler_mock');
    AppsManager.getAll();
    AppsManager.getApp();
    AppsManager.getState();
    AppsManager.installPackage();
    AppsManager.uninstall();
    AppsManager.update();
    AppsManager.checkForUpdate();
    AppsManager.installPwa();
    AppsManager.setEnabled();
    AppsManager.clear();
    AppsManager.setUpdatePolicy();
    AppsManager.initDefaultConsts();
    AppsManager.updateDefaultConsts();
    AppsManager.getServiceEventList();
    done();
  });

  test('addEventListener', done => {
    window.api.appsmanager = {
      func: () => {
        return Promise.resolve(null);
      },
      addEventListener: () => {
      },
      removeEventListener: () => {
      }
    },
      dispatchEvent('services-load-observer');
    AppsManager.addEventListener('install', () => {});
    AppsManager.addEventListener('uninstall', () => {});
    AppsManager.addEventListener('update', () => {});
    dispatchEvent('session-disconnected');
    expect(AppsManager.connected).toBe(false);
    dispatchEvent('services-load-observer');
    expect(AppsManager.connected).toBe(true);
    AppsManager.removeEventListener('install', () => {});
    AppsManager.removeEventListener('uninstall', () => {});
    AppsManager.removeEventListener('update', () => {});
    done();
  });
});
