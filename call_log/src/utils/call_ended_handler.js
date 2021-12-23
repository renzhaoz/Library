import { isParentalControl } from 'utils/calllog_utils';
import { isBlocked } from 'utils/blocking_utils';

class CallEndedHandler {
  constructor({ calllogStore, contactCache }) {
    this.DEBUG = false;
    this.calllogStore = calllogStore;
    this.contactCache = contactCache;

    window.addEventListener('telephony-call-ended', this.callEnded.bind(this));
    this.isParentalControl = false;
    isParentalControl().then((parentalControl) => {
      this.isParentalControl = parentalControl;
    });
  }

  /**
   * Create one log and send a notification when call ended
   */
  async callEnded(evt) {
    console.log('callEnded: logItem:', JSON.stringify(logItem));
    const logItem = evt.detail.data;
    const number = logItem.number;

    // do nothing if invalid number
    if (!this._validateNumber(number)) {
      console.warn('callEnded: invalid number:', number);
      return;
    }

    const inList = await this.isNumberInHotlineList(logItem.serviceId, number);
    if (inList) {
      return;
    }
    // send notification if is a allowed missed call
    if (logItem.direction == 'incoming' && logItem.duration <= 0) {
      const blocked = await isBlocked(number);
      if (!logItem.emergency && blocked) {
        console.log(`Do nothing since the number "${number}" has been blocked.`);
        return;
      }
      if (!logItem.emergency && this.isParentalControl) {
        const contact = await this.contactCache.getByNumber(number);
        if (!contact) {
          console.log('callEnded: this call number is not allowed');
          return;
        }
      }
    }

    const wakeLock = window.navigator.b2g.requestWakeLock('high-priority');
    this.calllogStore.create(logItem);
    // A CDMA call can contain two calls.
    // check second cdma call
    if (logItem.secondNumber) {
      const secondLogItem = Object.assign({}, logItem, {
        number: logItem.secondNumber
      });
      this.calllogStore.create(secondLogItem);
    }
    wakeLock.unlock();
  }

  async isNumberInHotlineList(serviceId, number) {
    if (!number) {
      return false;
    }

    const HOTLINE_LIST = 'hotline.hidden.list';
    const list = await SettingsObserver.getValue(HOTLINE_LIST);
    if (!list) {
      return false;
    }
    const mobileConnections = window.navigator.b2g.mobileConnections;
    const conn = mobileConnections[serviceId];
    if (conn && conn.voice && conn.voice.network) {
      const mcc = conn.voice.network.mcc;
      if (mcc in list) {
        const numberList = list[mcc];
        if (numberList.indexOf(number) !== -1) {
          return true;
        }
      }
    }
    return false;
  }

  // valid number including 0-9#+*, and null
  _validateNumber(number) {
    const validExp = /^(?!,)([0-9#+*,]){0,50}$/;
    const sanitizedNumber = number.replace(/(\s|-|\.|\(|\))/g, '');
    return validExp.test(sanitizedNumber);
  }
}

export default CallEndedHandler;
