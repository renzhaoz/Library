import BaseModule from 'base-module';
import Service from 'service';

import { debounce, isParentalControl } from 'utils/calllog_utils';
import SimCardHelper from 'utils/sim_card_helper';
import { isBlocked } from 'utils/blocking_utils';

import ERROR_CASES from './error_cases';
import { getDialogOptions } from './utils';

const CALL_TYPE = {
  VOICE_N_VIDEO: 1,
  VT: 4
};

const { get: _ } = window.api.l10n;

class DialHelper extends BaseModule {
  constructor() {
    super();
    this.name = 'DialHelper';
    this.DEBUG = false;

    this.isDialing = false;
    const { telephony } = window.navigator.b2g; // Object
    this.telephony = telephony;
    this.call = debounce(1000, this.call.bind(this));
    this.isRtt = false;
    this.rttPref = 'always-visible-automatic';
    this.hasVideo = false;
    SettingsObserver.observe('ril.rtt.enabled', this.isRtt, (result) => {
      this.isRtt = result;
      this.emit('update');
    });
    SettingsObserver.observe('ril.rtt.preferredSettings', 'always-visible-automatic', (result) => {
      this.rttPref = result;
      this.emit('update');
    });
    // this.getVilte(); //todo
    this.isParentalControl = false;
    isParentalControl().then((parentalControl) => {
      this.isParentalControl = parentalControl;
    });
  }

  /**
   * Dials a voice call
   * @param {string} number - Number in query
   * @param {0 | 1} serviceId - Number in query
   * @returns {Promise}
   */
  async dialVoice(number, serviceId) {
    return this.dial(number, { serviceId, isRtt: false, isVideo: false });
  }

  /**
   * Dials an RTT call
   * @param {string} number - Number in query
   * @param {0 | 1} serviceId - Number in query
   * @returns {Promise}
   */
  async dialRtt(number, serviceId) {
    return this.dial(number, { serviceId, isRtt: true, isVideo: false });
  }

  /**
   * Dials a video call
   * @param {string} number - Number in query
   * @param {0 | 1} serviceId - Number in query
   * @returns {Promise}
   */
  async dialVideo(number, serviceId) {
    return this.dial(number, { serviceId, isRtt: false, isVideo: true });
  }

  /**
   * @param {string} number - Number in query
   * @param {Object} [options] - dialing options
   * @returns {Promise}
   */
  async dial(number, options = { serviceId: 0, isRtt: false, isVideo: false }) {
    const { serviceId, isRtt, isVideo } = options;

    if (this.isDialing) {
      return;
    }

    this.debug(`Trying to dial: ${JSON.stringify({ number, ...options })}`);

    const changedOnce = () => {
      this.isDialing = false;
      document.removeEventListener('visibilitychange', changedOnce);
    };
    document.addEventListener('visibilitychange', changedOnce);

    this.isDialing = true;
    const conn = this.getConnection(serviceId);
    const emergencyOnly = this.isEmergencyOnly(conn);
    let callPromise;
    try {
      if (emergencyOnly) {
        this.debug('Dialing an emergency call...');
        callPromise = this.telephony.dialEmergency(
          number, isRtt, serviceId
        );
      } else if (isRtt) {
        this.debug('Dialing an RTT call...');
        callPromise = this.telephony.dial(
          number, CALL_TYPE.VOICE_N_VIDEO, true, serviceId
        );
      } else if (isVideo) {
        this.debug('Dialing a video call...');
        callPromise = this.telephony.dial(
          number, CALL_TYPE.VT, false, serviceId
        );
      } else {
        this.debug('Dialing a voice call...');
        callPromise = this.telephony.dial(
          number, CALL_TYPE.VOICE_N_VIDEO, false, serviceId
        );
      }
      callPromise.then(() => {
      }).catch((errorName) => {
        this.showErrorDialog(errorName, number, emergencyOnly);
      });
    } catch (err) {
      this.isDialing = false;
      throw err;
    }
  }

  /**
   * @returns {Promise<number>}
   */
  async chooseSim() {
    let id = 0;
    try {
      id = await Service.request('chooseSim', 'call');
    } catch (err) {
      // cancel SIM card choosing
      throw err;
    }

    this.debug(`The SIM card ${id} is selected.`);
    return id;
  }

  /**
   * @param {string} number
   * @param {0 | 1} [serviceId]
   * @returns {Promise<boolean>}
   */
  async isEmergencyNumber(number, serviceId = 0) {
    let eccList;
    try {
      eccList = await this.telephony.getEccList(serviceId);
    } catch (err) {
      throw err;
    }

    eccList = eccList.split(',');
    return eccList.includes(number);
  }

  /**
   * @param {string} number
   * @param {string} contact
   * @param {0 | 1} [serviceId]
   * @returns {Promise<boolean>}
   */
  async isNumberAllowed(number, contact, serviceId) {
    const isEmergency = await this.isEmergencyNumber(number, serviceId);
    if (isEmergency) {
      return true;
    }
    const blocked = await isBlocked(number);
    return contact === 'true' && !blocked;
  }

  /**
   * @returns {Promise<boolean>}
   */
  async getVilte() {
    const key = 'device.vilte';
    try {
      this.hasVideo = await DeviceCapabilityManager.get(key);
    } catch (err) {
      throw err;
    }
  }

  /**
   * @param {0 | 1} serviceId
   */
  getConnection(serviceId) {
    const { mobileConnections } = /** @type {Object} */ (window.navigator.b2g);
    const conn = mobileConnections && mobileConnections[serviceId];
    return conn;
  }

  /**
   * @param {*} conn - a MozMobileConnection
   * @returns {boolean}
   */
  isEmergencyOnly(conn) {

    /** @type {boolean} */
    const imsCapability = conn.imsHandler && conn.imsHandler.capability;

    /** @type {boolean} */
    const emergencyOnly = !imsCapability && conn.voice.emergencyCallsOnly;
    return emergencyOnly;
  }

  /**
   * @param {*} conn - a MozMobileConnection
   * @returns {boolean}
   */
  hasNetwork(conn) {
    const hasConnection = conn && conn.voice;
    const emergencyOnly = this.isEmergencyOnly(conn);
    const canDial = hasConnection && (emergencyOnly || conn.iccId);
    this.debug(`hasNetwork: ${canDial}`);
    return canDial;
  }

  /**
   * @param {string} errorName
   * @param {string} [number='']
   */
  showErrorDialog(errorName, number = '', isEmergencyOnly) {
    this.isDialing = false;
    let error = errorName;
    if (error === 'BadNumber') {
      error = isEmergencyOnly ? 'NoNetwork' : 'EmergencyCallOnly';
    }
    const errorCase = ERROR_CASES[error] || ERROR_CASES.Default;
    const dialogOptions = getDialogOptions(errorCase, number);

    // show error dialog
    const event = new CustomEvent('showDialDialog', {
      detail: { data: dialogOptions }
    });

    window.dispatchEvent(event);
    console.log(
      `[showErrorDialog] ${dialogOptions.header}: ${dialogOptions.content}`
    );
  }

  /**
   * @param {string} number
   * @param {boolen} contact
   * @returns {Promise}
   */
  async call(number, contact) {
    const sanitizedNumber = number.replace(/(\s|-|\.|\(|\))/g, '');
    // Invalid phone number
    if (!this.isValid(sanitizedNumber)) {
      this.showErrorDialog('InvalidNumber');
      return;
    }
    // No telephony
    if (!this.telephony) {
      this.showErrorDialog('DeviceNotAccepted', sanitizedNumber);
      return;
    }

    /** @type {0 | 1 | -1} */
    let serviceId = SimCardHelper.getSimCardIndex();
    if (serviceId === -1) {
      try {
        serviceId = await this.chooseSim();
      } catch (err) {
        throw err;
      }
    }
    if (this.isParentalControl) {
      const canDial = await this.isNumberAllowed(sanitizedNumber, contact,
        serviceId);
      if (!canDial) {
        this.showErrorDialog('NumberBlocked');
        return;
      }
    }

    const conn = this.getConnection(serviceId);
    // No voice connection, the call won't make it
    if (!this.hasNetwork(conn)) {
      this.showErrorDialog('NoNetwork', sanitizedNumber);
      return;
    }

    let menuOptions = [];
    menuOptions = this.getCallOptions(sanitizedNumber, serviceId);

    if (menuOptions.length <= 0) {
      const err = new Error('No call options found.');
      throw err;
    }

    if (menuOptions.length >= 2) {
      this.showCallMenu(menuOptions);
    } else {
      menuOptions[0].callback();
    }
  }

  /**
   * @param {CallOption[]} options
   */
  showCallMenu(options) {
    const event = new CustomEvent('showDialOptionMenu', {
      detail: { data: { header: 'select', options }}
    });

    window.dispatchEvent(event);
  }

  /**
   * @param {string} number
   * @param {0 | 1} serviceId
   * @returns {CallOption[]}
   */
  getCallOptions(number, serviceId) {
    const voiceCall = {
      label: _('call'),
      callback: () => {
        this.dialVoice(number, serviceId);
      }
    };

    const rttCall = {
      label: _('rttCall'),
      callback: () => {
        this.dialRtt(number, serviceId);
      }
    };

    const videoCall = {
      label: _('videoCall'),
      callback: () => {
        this.dialVideo(number, serviceId);
      }
    };

    let callOptions = [];
    if (!this.isRtt) {
      callOptions = callOptions.concat([voiceCall]);
    } else {
      switch (this.rttPref) {
        case 'always-visible-manual':
          callOptions = callOptions.concat([voiceCall, rttCall]);
          break;
        case 'always-visible-automatic':
          callOptions = callOptions.concat([rttCall]);
          break;
        case 'visible-during-calls':
        default:
          callOptions = callOptions.concat([voiceCall]);
          break;
      }
    }
    if (this.hasVideo && !(this.isRtt && this.rttPref === 'always-visible-automatic')) {
      callOptions = callOptions.concat(videoCall);
    }
    return callOptions;
  }

  isValid(sanitizedNumber) {
    const validExp = /^(?!,)([0-9#+*,]){1,50}$/;
    return validExp.test(sanitizedNumber);
  }

  dialForcely(number) {
    let serviceId = SimCardHelper.getDefaultSimCardIndex();
    this.dialVoice(number, serviceId);
  }

  showRttCall() {
    return this.isRtt && (this.rttPref === 'always-visible-automatic');
  }
}

export default DialHelper;
