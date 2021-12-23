import BaseModule from 'base-module';

class SimCardHelper extends BaseModule {
  constructor() {
    super();
    this.iccManager = window.navigator.b2g.iccManager;
    this.multipleSIMs = this.iccManager && this.iccManager.iccIds.length > 1;
    this.cardIndex = -1;
    this.getCardIndex();
  }

  getCardIndex() {
    const key = 'ril.telephony.defaultServiceId';
    SettingsObserver.observe(key, -1, (index) => {
      this.cardIndex = index;
      this.emit('update');
    });
  }

  showSimIndicator() {
    return (this.multipleSIMs && this.cardIndex >= 0);
  }

  getSimCardIndex = () => {
    return this.cardIndex;
  };

  getDefaultSimCardIndex = () => {
    let serviceId = this.cardIndex;
    if (serviceId === -1) {
      serviceId = 0;
      if (this.hasOnlyOneSIMCardDetected()) {
        serviceId = this.isSIMCardAbsent(0) ? 1 : 0;
      }
    }

    return serviceId;
  };

  isSIMCardAbsent = index => {
    const conn = navigator.b2g.mobileConnections[index];
    if (!this.iccManager || !conn) {
      return true;
    }
    const simCard = this.iccManager.getIccById(conn.iccId);

    return (
      !simCard
      || simCard
      && simCard.iccInfo
      && simCard.iccInfo.iccid === null
    );
  }

  hasOnlyOneSIMCardDetected = () => {
    const sim0Absent = this.isSIMCardAbsent(0);
    const sim1Absent = this.isSIMCardAbsent(1);
    const hasOneSim = sim0Absent ^ sim1Absent; // XOR operator
    return hasOneSim;
  }
}

export default (new SimCardHelper());
