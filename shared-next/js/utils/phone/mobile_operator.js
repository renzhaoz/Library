/* global SettingsObserver */

let SimCardsName = {};
const MobileInfo = {
  brazil: {
    carriers: {
      '00': 'NEXTEL',
      '02': 'TIM',
      '03': 'TIM',
      '04': 'TIM',
      '05': 'CLARO',
      '06': 'VIVO',
      '07': 'CTBC',
      '08': 'TIM',
      '10': 'VIVO',
      '11': 'VIVO',
      '15': 'SERCOMTEL',
      '16': 'OI',
      '23': 'VIVO',
      '24': 'OI',
      '31': 'OI',
      '32': 'CTBC',
      '33': 'CTBC',
      '34': 'CTBC',
      '37': 'AEIOU'
    },
    regions: {
      '11': 'SP',
      '12': 'SP',
      '13': 'SP',
      '14': 'SP',
      '15': 'SP',
      '16': 'SP',
      '17': 'SP',
      '18': 'SP',
      '19': 'SP',
      '21': 'RJ',
      '22': 'RJ',
      '24': 'RJ',
      '27': 'ES',
      '28': 'ES',
      '31': 'MG',
      '32': 'MG',
      '33': 'MG',
      '34': 'MG',
      '35': 'MG',
      '37': 'MG',
      '38': 'MG',
      '41': 'PR',
      '42': 'PR',
      '43': 'PR',
      '44': 'PR',
      '45': 'PR',
      '46': 'PR',
      '47': 'SC',
      '48': 'SC',
      '49': 'SC',
      '51': 'RS',
      '53': 'RS',
      '54': 'RS',
      '55': 'RS',
      '61': 'DF',
      '62': 'GO',
      '63': 'TO',
      '64': 'GO',
      '65': 'MT',
      '66': 'MT',
      '67': 'MS',
      '68': 'AC',
      '69': 'RO',
      '71': 'BA',
      '73': 'BA',
      '74': 'BA',
      '75': 'BA',
      '77': 'BA',
      '79': 'SE',
      '81': 'PE',
      '82': 'AL',
      '83': 'PB',
      '84': 'RN',
      '85': 'CE',
      '86': 'PI',
      '87': 'PE',
      '88': 'CE',
      '89': 'PI',
      '91': 'PA',
      '92': 'AM',
      '93': 'PA',
      '94': 'PA',
      '95': 'RR',
      '96': 'AP',
      '97': 'AM',
      '98': 'MA',
      '99': 'MA'
    }
  }
};

// eslint-disable-next-line
const MobileOperator = {
  BRAZIL_MCC: '724',
  BRAZIL_CELLBROADCAST_CHANNEL: 50,

  userFacingInfo: function userFacingInfo(mobileConnection) {
    let network = null;
    let cell = null;
    if (mobileConnection.voice && mobileConnection.voice.connected) {
      // eslint-disable-next-line
      network = mobileConnection.voice.network;
      // eslint-disable-next-line
      cell = mobileConnection.voice.cell;
    } else if (
      mobileConnection.data &&
      mobileConnection.data.state === 'registered'
    ) {
      // eslint-disable-next-line
      network = mobileConnection.data.network;
      // eslint-disable-next-line
      cell = mobileConnection.data.cell;
    }
    const iccid = mobileConnection.iccId;
    const iccObj = navigator.b2g.iccManager.getIccById(iccid);
    const iccInfo = iccObj ? iccObj.iccInfo : null;
    let operator = network ? network.shortName || network.longName : null;
    if (operator && iccInfo && iccInfo.isDisplaySpnRequired && iccInfo.spn) {
      if (iccInfo.isDisplayNetworkNameRequired && operator !== iccInfo.spn) {
        operator = `${operator} ${iccInfo.spn}`;
      } else {
        operator = iccInfo.spn;
      }
    }

    let carrier = null;
    let region = null;
    if (this.isBrazil(mobileConnection, cell, network)) {
      /*
       * We are in Brazil, It is legally required to show local info
       * about current registered GSM network in a legally specified way.
       */
      const lac = cell.gsmLocationAreaCode % 100;
      const { carriers } = MobileInfo.brazil;
      const { regions } = MobileInfo.brazil;

      carrier = network
        ? carriers[network.mnc] || this.BRAZIL_MCC + network.mnc
        : null;
      region = regions[lac] ? `${regions[lac]} ${lac}` : '';
    }

    const imsRegHandler = mobileConnection.imsHandler;
    if (imsRegHandler) {
      const shown =
        imsRegHandler.capability === 'voice-over-wifi' ||
        imsRegHandler.capability === 'video-over-wifi';
      if (shown && iccInfo && iccInfo.isDisplaySpnRequired && iccInfo.spn) {
        operator = iccInfo.spn;
      }
    }
    if (SimCardsName && SimCardsName[iccid]) {
      operator = SimCardsName[iccid];
    }

    return {
      operator,
      carrier,
      region
    };
  },

  isBrazil: function isBrazil(mobileConnection, cell, network) {
    return network
      ? network.mcc === this.BRAZIL_MCC && cell && cell.gsmLocationAreaCode
      : null;
  }
};

if (SettingsObserver) {
  SettingsObserver.observe('custom.simcards.name', {}, value => {
    SimCardsName = value;
  });
}

window.MobileInfo = MobileInfo;
window.MobileOperator = MobileOperator;
