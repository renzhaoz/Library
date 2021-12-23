/* global SIMSlot, SIMSlotManager */

(function simSlotManager(window) {
  const IccManager = navigator.b2g.iccManager;

  /**
   * SIMSlotManager creates/manages the current SIM slot on the device.
   * @type {Object}
   */
  window.SIMSlotManager = {
    /**
     * The number of SIM slots.
     * @type {Number}
     */
    length: 0,
    instances: [],

    /**
     * The timeout to wait for the second SIM
     * @type {Number}
     */
    TIMEOUT_FOR_SIM2: 2000,

    /**
     * Timer used to wait for the second SIM
     * @type {Number} timeoutId
     */
    timerForSIM2: null,

    /**
     * This property is used to make sure sim_lock won't get inited
     * before we receive iccdetected when bootup.
     * @type {Boolean}
     */
    ready: false,

    init: function init() {
      if (!IccManager) {
        return;
      }

      this.conns = Array.prototype.slice.call(navigator.b2g.mobileConnections);
      this.length = this.conns.length;

      if (this.conns.length === 0) {
        return;
      }

      this.conns.forEach(function iterator(conn, index) {
        this.instances.push(
          new SIMSlot(conn, index, IccManager.getIccById(conn.iccId))
        );
      }, this);

      IccManager.addEventListener('iccdetected', this);

      this.publishSIMSlotIfReady();
    },

    /**
     * We support multiSIM or not.
     * @return {Boolean} MultiSIM is available or not.
     */
    isMultiSIM() {
      return this.length > 1;
    },

    /**
     * Check there is sim card on slot#index or not.
     * @param  {Number}  index The slot number.
     * @return {Boolean}       sim card is absent or not.
     */
    isSIMCardAbsent: function isSIMCardAbsent(index) {
      const slot = this.get(index);
      if (slot) {
        return slot.isAbsent();
      }
      return true;
    },

    /**
     * Make sure we really have one simcard information
     * @return {Boolean} we already have one simcard.
     * TODO This only consider 2 slot case.
     *      Should extend it for multi-sim case.
     */
    hasOnlyOneSIMCardDetected() {
      const sim0Absent = this.isSIMCardAbsent(0);
      const sim1Absent = this.isSIMCardAbsent(1);
      const hasOneSim =
        (sim0Absent && !sim1Absent) || (!sim0Absent && sim1Absent);
      return hasOneSim;
    },

    /**
     * Check there is no any sim card on device or not.
     * @return {Boolean} There is no sim card.
     */
    noSIMCardOnDevice: function noSIMCardOnDevice() {
      if (!IccManager || !IccManager.iccIds) {
        return true;
      }
      return IccManager.iccIds.length === 0;
    },

    noSIMCardConnectedToNetwork: function noSIMCardConnectedToNetwork() {
      if (!IccManager || !IccManager.iccIds) {
        return true;
      }
      return this.instances.every(
        instance =>
          instance.conn.voice && instance.conn.voice.emergencyCallsOnly
      );
    },

    /**
     * Get specific SIM slot instance.
     * @param {Number} index The slot number.
     * @return {Object} The SIMSlot instance.
     */
    get: function get(index) {
      if (index > this.length - 1) {
        return null;
      }

      return this.instances[index];
    },

    /**
     * Get specific mobileConnection object.
     * @param {Number} index The slot number.
     * @return {Object} The mobile connection object.
     */
    getMobileConnection: function getMobileConnection(index) {
      if (index > this.length - 1) {
        return null;
      }

      return this.instances[index].conn;
    },

    /**
     * Get all sim slot instances
     * @return {Array} The array of sim slot instances.
     */
    getSlots: function getSlots() {
      return this.instances;
    },

    /**
     * Get specified simslot by iccId
     * @return {Object} The SIMSlot instance.
     */
    getSlotByIccId: function getSlotByIccId(iccId) {
      let found = null;
      this.instances.some(slot => {
        if (slot.conn.iccId && slot.conn.iccId === iccId) {
          found = slot;
          return true;
        }
        return false;
      }, this);
      return found;
    },

    /**
     * This method is used to make sure if we can't receive the 2nd
     * `iccdetected` event during the timeout, we would treat this
     * situation as DSDS device with only one simcard inserted.
     */
    waitForSecondSIM() {
      this.timerForSIM2 = setTimeout(() => {
        clearTimeout(this.timerForSIM2);
        this.publishSIMSlotIsReady();
      }, this.TIMEOUT_FOR_SIM2);
    },

    /**
     * We have to make sure our simcards are ready and emit
     * this event out to notify sim_settings_helper & sim_lock
     * do related operations.
     */
    publishSIMSlotIsReady() {
      if (!this.ready) {
        this.ready = true;
        window.dispatchEvent(new CustomEvent('simslotready'));
      }
    },

    handleEvent: function handleEvent(evt) {
      switch (evt.type) {
        case 'iccdetected':
          {
            const slot = this.getSlotByIccId(evt.iccId);

            if (slot) {
              slot.update(IccManager.getIccById(evt.iccId));

              if (this.isMultiSIM()) {
                /*
                 * We are now in DSDS device
                 * if we have one simcard already
                 */
                if (this.hasOnlyOneSIMCardDetected()) {
                  this.waitForSecondSIM();
                } else {
                  // We have two simcards already
                  clearTimeout(this.timerForSIM2);
                  this.publishSIMSlotIsReady();
                }
              } else {
                this.publishSIMSlotIsReady();
              }
            }
          }
          break;
        default:
          break;
      }
    },

    publishSIMSlotIfReady() {
      let numDetected = 0;
      this.instances.forEach(slot => {
        if (!slot.isAbsent()) {
          numDetected++;
        }
      }, this);

      if (numDetected === this.instances.length) {
        this.publishSIMSlotIsReady();
        return;
      }

      if (
        !this.timerForSIM2 &&
        this.isMultiSIM() &&
        this.hasOnlyOneSIMCardDetected()
      ) {
        this.waitForSecondSIM();
      }
    }
  };

  SIMSlotManager.init();
})(window);
