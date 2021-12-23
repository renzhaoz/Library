window.lib_settings = {
  SettingsManager: {
    get: () => {
      return Promise.resolve('libSettings');
    }
  },
  SettingObserverBase: function SettingObserverBase() {
  }
};

window.lib_time = {
  CallbackReason: {
    TIME_CHANGED: 1
  },
  TimeObserverBase: function TimeObserverBase() {
  }
};

window.lib_powermanager = {
  PowermanagerService: {
    get: () => {
      return Promise.resolve('powerManager');
    }
  }
};

window.lib_usbmanager = {
  UsbmanagerService: {
    get: () => {
      return Promise.resolve('usbManager');
    }
  }
};

window.lib_accounts = {
  AccountManager: {
    get: () => {
      return Promise.resolve('accountManager');
    }
  },
  State: {
    LOGGED_IN: 0,
    LOGGED_OUT: 1,
    REFRESHED: 2
  },
  AccountObserverBase: function AccountObserverBase() {
  }
};

window.lib_apps = {
  AppsManager: {
    get: () => {
      return Promise.resolve('appManager');
    }
  }
};

window.lib_tcpsocket = {
  TcpSocketManager: {
    get: () => {
      return Promise.resolve('tcpSocketManager');
    }
  }
};

window.lib_telephony = {
  Telephony: {
    get: () => {
      return Promise.resolve('telephonyManager');
    }
  }
};

window.lib_devicecapability = {
  DeviceCapabilityManager: {
    get: () => {
      return Promise.resolve('devicecapabilityManager');
    }
  }
};

window.lib_contacts = {
  ContactsManager: {
    get: () => {
      return Promise.resolve('contactsManager');
    }
  }
};

window.lib_audiovolume = {
  AudioVolumeManager: {
    get: () => {
      return Promise.resolve('audiovolumeManager');
    }
  }
};

window.lib_procmanager = {
  ProcManager: {
    get: () => {
      return Promise.resolve('procManager');
    }
  }
};
