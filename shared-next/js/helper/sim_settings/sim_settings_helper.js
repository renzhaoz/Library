/**
 * SimSettingsHelper is a helper to provide semantic ways set / get Settings.
 */
/* global SettingsObserver */
const SimSettingsHelper = {
  ALWAYS_ASK_OPTION_VALUE: -1,
  callbacks: {
    outgoingCall: [],
    outgoingMessages: [],
    outgoingData: []
  },
  observe(serviceName, callback) {
    const serviceCallbacks = this.callbacks[serviceName];
    if (serviceCallbacks) {
      serviceCallbacks.push(callback);
    }
  },
  unobserve(serviceName, callback) {
    const serviceCallbacks = this.callbacks[serviceName];
    if (serviceCallbacks) {
      const index = serviceCallbacks.indexOf(callback);
      if (index > -1) {
        serviceCallbacks.splice(index, 1);
      }
    }
  },
  getCardIndexFrom(serviceName) {
    const serviceMap = {
      outgoingCall: 'ril.telephony.defaultServiceId',
      outgoingMessages: 'ril.sms.defaultServiceId',
      outgoingData: 'ril.data.defaultServiceId'
    };
    const settingsKey = serviceMap[serviceName];
    return SettingsObserver.getValue(settingsKey);
  },
  setServiceOnCard(serviceName, cardIndex) {
    let settings = [];
    switch (serviceName) {
      case 'outgoingCall':
        settings = [
          {
            name: 'ril.telephony.defaultServiceId',
            value: cardIndex
          },
          {
            name: 'ril.voicemail.defaultServiceId',
            value: cardIndex
          }
        ];
        break;
      case 'outgoingMessages':
        settings = [
          {
            name: 'ril.mms.defaultServiceId',
            value: cardIndex
          },
          {
            name: 'ril.sms.defaultServiceId',
            value: cardIndex
          }
        ];
        break;
      case 'outgoingData':
        settings = [
          {
            name: 'ril.data.defaultServiceId',
            value: cardIndex
          }
        ];
        break;
      default:
        break;
    }
    if (settings.length) {
      SettingsObserver.setValue(settings);
    }
  },
  addSettingsObservers() {
    SettingsObserver.observe(
      'ril.telephony.defaultServiceId',
      this.ALWAYS_ASK_OPTION_VALUE,
      value => {
        this.callbacks.outgoingCall.forEach(cb => {
          cb(value);
        });
      }
    );
    SettingsObserver.observe(
      'ril.sms.defaultServiceId',
      this.ALWAYS_ASK_OPTION_VALUE,
      value => {
        this.callbacks.outgoingMessages.forEach(cb => {
          cb(value);
        });
      }
    );
    SettingsObserver.observe('ril.data.defaultServiceId', 0, value => {
      this.callbacks.outgoingData.forEach(cb => {
        cb(value);
      });
    });
  }
};
SimSettingsHelper.addSettingsObservers();
window.SimSettingsHelper = SimSettingsHelper;
