import BaseModule from 'base-module';

class SdnContacts extends BaseModule {
  constructor() {
    super();
    this.name = 'SdnContacts';
    this.conns = window.navigator.b2g.mobileConnections;
    this.sdnContacts = [];
    this.fetchSDN();
  }

  get() {
    return this.sdnContacts;
  }

  fetchSDN() {
    if (!this.conns) {
      return;
    }
    for (let index = 0; index < this.conns.length; index++) {
      const { iccId } = this.conns[index];
      this.sdnContacts[index] = new Map();
      if (iccId) {
        const icc = navigator.b2g.iccManager.getIccById(iccId);
        if (icc) {
          const request = icc.readContacts('sdn');
          request.onsuccess = () => {
            const { result } = request;
            for (let i = 0; i < result.length; i++) {
              const number = result[i].number;
              if (number) {
                this.sdnContacts[index].set(number, result[i].name || '');
              }
            }
          };
        }
      }
    }
  }
}

export default SdnContacts;
