import Service from 'service';

const toPromise = req => new Promise((resolve, reject) => {
  req.onsuccess = () => {
    resolve(req.result);
  };
  req.onerror = () => {
    reject(req.error);
  };
});

const debounce = (ms, fn) => {
  let timeout;

  return (...args) => {
    const later = () => { timeout = null; };
    const callNow = !timeout;

    window.clearTimeout(timeout);
    timeout = window.setTimeout(later, ms);

    if (callNow) {
      fn(...args);
    }

    return timeout;
  };
};

/**
 * @returns {boolean}
 */
const hasMultipleSIM = () => {
  const { iccManager } = /** @type {Object} */ (window.navigator.b2g);
  return iccManager && iccManager.iccIds.length > 1;
};

/**
 * @param {{callType: string, isVt: boolean, simNum: string}} options
 * @returns {string}
 */
const getCallIcon = ({ callType, simNum }) => {
  let prefix = 'call';
  if (callType.indexOf('rttCall') !== -1) {
    prefix = 'call-rtt';
  } else if (callType.indexOf('videoCall') !== -1) {
    prefix = 'video-call';
  }
  const postfix = hasMultipleSIM() ? simNum : '';
  return `${prefix}-${callType.split('_')[0]}${postfix}`;
};

/**
 * @param {Object} options
 */
const showDialog = (options) => {
  Service.request('showDialog', options);
};

const getDayDate = (timestamp) => {
  const date = new Date(timestamp);
  const startDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  return startDate.getTime();
};

const headerDate = (time) => {
  const { get: _ } = window.api.l10n;
  const diff = (getDayDate(Date.now()) - getDayDate(time)) / 1000;
  const dayDiff = Math.floor(diff / 86400);
  const date = new Date(time);
  const isThisYear = new Date().getFullYear() === date.getFullYear();
  const dateLanguage = navigator.language;
  let formattedTime;
  const option = {
    thisWeek: { weekday: 'long' },
    thisYear: { weekday: 'short', month: 'long', day: 'numeric' },
    others: {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    }
  };
  if (dayDiff === 0) {
    formattedTime = _('today');
  } else if (dayDiff === 1) {
    formattedTime = _('yesterday');
  } else if (dayDiff < 7 && dayDiff > 1) {
    formattedTime = date.toLocaleString(dateLanguage, option.thisWeek);
  } else if (isThisYear) {
    formattedTime = date.toLocaleString(dateLanguage, option.thisYear);
  } else {
    formattedTime = date.toLocaleString(dateLanguage, option.others);
  }
  return formattedTime;
};

const isLowMemoryDevice = () => {
  const isLowMemory = document.body.classList.contains('low-memory-device');
  return isLowMemory;
};


const isParentalControl = () => {
  const key = 'device.parental-control';
  return DeviceCapabilityManager.get(key).then((result) => {
    const parentalControl = !!result;
    return parentalControl;
  });
};

const closeNotificationIfNotHidden = () => {
  if (document.hidden) { return }

  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ name: 'clearNotices' });
  }
};

export {
  toPromise, debounce, getCallIcon, showDialog, headerDate,
  isLowMemoryDevice, isParentalControl, closeNotificationIfNotHidden
};
