const filesList = [
  '%SHARED_APP_ORIGIN%/elements/gaia_tabs/gaia_tabs.js',
  '%SHARED_APP_ORIGIN%/js/session/lib_session.js',
  '%SHARED_APP_ORIGIN%/js/session/task_scheduler.js',
  '%SHARED_APP_ORIGIN%/js/session/settings/settings_observer.js',
  '%SHARED_APP_ORIGIN%/js/session/device_capability/device_capability.js',
  'js/indexDB.js',
  'js/matchContact.js',
  '%SHARED_APP_ORIGIN%/js/utils/l10n/l10n.js',
  '%SHARED_APP_ORIGIN%/js/utils/l10n/l10n_date.js',
  '%SHARED_APP_ORIGIN%/js/helper/common/performance_testing_helper.js',
  '%SHARED_APP_ORIGIN%/js/utils/toaster/toaster.js',
  '%SHARED_APP_ORIGIN%/js/session/contacts_manager/contacts_manager.js',
  '%SHARED_APP_ORIGIN%/js/helper/date_time/date_time_helper.js',
  '%SHARED_APP_ORIGIN%/js/session/time_service/time_service.js',
  '%SHARED_APP_ORIGIN%/js/helper/softkey/softkey_register.js',
  'dist/vendors~app.js',
  'dist/styles.js',
  'dist/app.js'
];

window.onload = () => {
  window.LazyLoader.load(filesList);
};
