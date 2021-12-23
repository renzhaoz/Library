class BluetoothHandler {
  constructor(showDialog) {
    window.addEventListener('bluetooth-dialer-command', this.btCommandHandler);
    this.showDialog = showDialog;
  }

  getDialingNumberAtPosition = async (position) => {
    // Get data
    const logsStoreArr = await new DB().getAllData();
    let logsStoreMap = new Map();
    if (logsStoreArr && logsStoreArr.length > 0) {
      // Create
      logsStoreArr.forEach(item => {
        logsStoreMap.set(item.id, item);
      });

      // Sort
      logsStoreMap = new Map([...logsStoreMap.entries()].sort(
        (a, b) => a[1].date - b[1].date)
      );
    }

    if (logsStoreMap && logsStoreMap.size) {
      const mapSize = logsStoreMap.size;
      let matchNumber = 0;
      for (let i = mapSize - 1; i >= 0; i--) {
        const group = [...logsStoreMap][i][1];
        if (group.callType.includes('outgoing')) {
          matchNumber += 1;
        }
        if (matchNumber === position) {
          return group.number;
        }
      }
    }
    return null;
  }

  btCommandHandler = evt => {
    const { command } = evt.detail.data;
    const isAtd = command.startsWith('ATD');
    // Not a dialing request
    if (command !== 'BLDN' && !isAtd) {
      return;
    }

    import('./dial_helper/index.js').then(DialHelper => {
      const dialHelper = new DialHelper.default();
      // Dialing a specific number
      if (isAtd && command[3] !== '>') {
        const phoneNumber = command.substring(3);
        dialHelper.dialForcely(phoneNumber);
        return;
      }

      // Dialing from the call log
      // ATD>3 means we have to call the 3rd recent number.
      const position = isAtd ? parseInt(command.substring(4), 10) : 1;

      this.getDialingNumberAtPosition(position).then(number => {
        if (number !== null) {
          dialHelper.dialForcely(number);
        } else {
          this.showDialog({
            openDialog: true,
            options: {
              header: 'confirmation',
              content: 'no-recent-numbers',
              type: 'alert',
              noClose: false,
              translated: false
            }
          });
        }
      })
    })
  };
}

export default BluetoothHandler;
