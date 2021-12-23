window.api = {
  powermanager: {
    func: () => {
      return Promise.resolve(null);
    },
    powerOff: () => {},
    reboot: () => {}
  },
  settingsmanager: {
    func: () => {
      return Promise.resolve(null);
    },
    addObserver: () => {},
    removeObserver: () => {}
  },
  timeservice: {
    func: () => {
      return Promise.resolve(null);
    },
    addObserver: () => {
    },
    removeObserver: () => {
    }
  },
  usbmanager: {
    func: () => {
      return Promise.resolve(null);
    }
  },
  accountmanager: {
    func: () => {
      return Promise.resolve(null);
    },
    addObserver: () => {
    },
    removeObserver: () => {
    }
  },
  appsmanager: {
    func: () => {
      return Promise.resolve(null);
    }
  },
  tcpsocketmanager: {
    func: () => {
      return Promise.resolve(null);
    }
  },
  telephonymanager: {
    func: () => {
      return Promise.resolve(null);
    },
    addEventListener: () => {},
    removeEventListener: () => {}
  },
  devicecapabilitymanager: {
    func: () => {
      return Promise.resolve(null);
    }
  },
  contactsmanager: {
    func: () => {
      return Promise.resolve(null);
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    BLOCKEDNUMBER_CHANGE_EVENT: 0,
    CONTACTS_CHANGE_EVENT: 1,
    GROUP_CHANGE_EVENT: 2,
    SPEEDDIAL_CHANGE_EVENT: 3
  },
  audiovolumemanager: {
    func: () => {
      return Promise.resolve(null);
    },
    addEventListener: () => {},
    removeEventListener: () => {}
  },
  procmanager: {
    func: () => {
      return Promise.resolve(null);
    }
  }
};
