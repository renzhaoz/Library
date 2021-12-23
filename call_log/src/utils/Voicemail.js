/**
 * This Voicemail module provides an easy way to identify if any given number
 * is voicemail number or not. Voicemail number could be stored in mozSettings
 * under key of 'ril.iccInfo.mbdn' or in navigator.mozVoicemail. User of this
 * module don't need to know where voicemail number stores, just query
 * voicemail number by invoking Voicemail.check()
 *
 * @example
 * Voicemail.check('123', cardIndex).then(function(isVoicemailNumber) {
 *   // do something based on value of isVoicemailNumber
 * });
 *
 */
const Voicemail = {
  voicemailNumbers: '',
  init: function vm_init() {
    SettingsObserver.observe('ril.iccInfo.mbdn', '', (numbers) => {
      this.voicemailNumbers = numbers;
      window.calllogStore && window.calllogStore.emit('update');
    });
  },

  /**
   * Query if a number is voicemail number or not
   *
   * @param {String} number - Number in query
   * @returns {boolean} - true or false
   */
  check: function vm_check(number, cardIndex) {
    if (!number) {
      return false;
    }
    // check the voicemail number if the number is in the sim card
    let { voicemail } = window.navigator.b2g;
    if (voicemail) {
      const voicemailNumber = voicemail.getNumber(cardIndex);
      if (voicemailNumber === number) {
        return true;
      }
    }

    // check the voicemail number with the mozSetting value
    // based on /shared/resources/apn.json
    if (typeof this.voicemailNumbers === 'string') {
      return (this.voicemailNumbers === number);
    } else if (this.voicemailNumbers) {
      return this.voicemailNumbers[cardIndex] === number;
    }
    return false;
  }
};
Voicemail.init();
export default Voicemail;
