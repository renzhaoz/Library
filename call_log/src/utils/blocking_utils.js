/**
 * @returns {boolean}
 */
const hasBlockingFeature = () => !!(ContactsManager && ContactsManager.findBlockedNumbers);

/**
 * @param {string} number
 * @returns {Promise<string>}
 */
const blockNumber = (number) => {
  if (!number) {
    return Promise.reject(new TypeError('Invalid number'));
  }

  return ContactsManager.addBlockedNumber(number);
};

/**
 * @param {string} number
 * @returns {Promise<string>}
 */
const unblockNumber = (number) => {
  if (!number) {
    return Promise.reject(new TypeError('Invalid number'));
  }

  return ContactsManager.removeBlockedNumber(number);
};

/**
 * The minimum digits apply to 'fuzzyMatch' is defined by:
 *   "dom.phonenumber.substringmatching". (default is 7)
 * @param {string}number
 * @returns {Promise<string[]>}
 */
const isBlocked = (number) => {
  const options = {
    filterValue: number,
    filterOption: ContactsManager.FilterOption.MATCH
  };
  return ContactsManager.findBlockedNumbers(options)
    .then(contacts => !!(contacts && contacts.length));
};

export {
  hasBlockingFeature, blockNumber, unblockNumber, isBlocked
};
