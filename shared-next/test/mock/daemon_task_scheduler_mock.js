window.taskScheduler = {
  serversName: [
    'settings',
    'power',
    'usb',
    'accounts',
    'apps',
    'tcp_socket',
    'telephony',
    'device_capability',
    'contacts',
    'audio_volume',
    'process',
    'time_service'
  ],
  request: ({ serverName, funcName, args }) => {
    if (serverName === 'settings') {
      if (funcName === 'getBatch') {
        return Promise.resolve([]);
      }
    } else {
      return Promise.resolve();
    }
  },
  setServersNameConst() {
    this.serversName.forEach(serverName => {
      this[serverName.toUpperCase()] = serverName;
    });
  }
};

window.taskScheduler.setServersNameConst();
