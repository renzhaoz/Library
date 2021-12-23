function TaskScheduler() {
  this.connected = false;
  this.taskId = 0;
  this.taskQueue = new Map();
  this.serversName = [
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
  ];
  this.setServersNameConst();
  window.addEventListener('services-load-complete', () => {
    this.connected = true;
    this.taskQueue.forEach(task => {
      this.doTask(task);
    });
    this.taskQueue.clear();
    this.taskId = 0;
  });
  window.addEventListener('session-disconnected', () => {
    this.connected = false;
  });
}

TaskScheduler.prototype.setServersNameConst = function setServersNameConst() {
  this.serversName.forEach(serverName => {
    this[serverName.toUpperCase()] = serverName;
  });
};

TaskScheduler.prototype.getServer = function getServer(serverName) {
  let server = null;
  switch (serverName) {
    case this.SETTINGS:
      server = window.api.settingsmanager;
      break;
    case this.POWER:
      server = window.api.powermanager;
      break;
    case this.USB:
      server = window.api.usbmanager;
      break;
    case this.ACCOUNTS:
      server = window.api.accountmanager;
      break;
    case this.APPS:
      server = window.api.appsmanager;
      break;
    case this.TCP_SOCKET:
      server = window.api.tcpsocketmanager;
      break;
    case this.TELEPHONY:
      server = window.api.telephonymanager;
      break;
    case this.DEVICE_CAPABILITY:
      server = window.api.devicecapabilitymanager;
      break;
    case this.CONTACTS:
      server = window.api.contactsmanager;
      break;
    case this.AUDIO_VOLUME:
      server = window.api.audiovolumemanager;
      break;
    case this.PROCESS:
      server = window.api.procmanager;
      break;
    case this.TIME_SERVICE:
      server = window.api.timeservice;
      break;
    default:
      break;
  }
  return server;
};

TaskScheduler.prototype.enqueue = function enqueue(object) {
  this.taskId++;
  if (!this.taskQueue.has(this.taskId)) {
    this.taskQueue.set(this.taskId, object);
  } else {
    console.error(
      `Task scheduler error(duplicate) ${object.funcName} ${object.args}`
    );
  }
  return this.taskId;
};

/* eslint-disable */
  TaskScheduler.prototype.request = function request(object) {
    return new Promise((resolve, reject) => {
      const resolveFunc = result => {
        taskScheduler.dequeue(taskId);
        resolve(result);
      };
      const rejectFunc = err => {
        if (!(err && err.reason === 'session_closed')) {
          taskScheduler.dequeue(taskId);
          reject(err);
        }
      };

      const { serverName, funcName, args } = object;
      const task = {
        serverName,
        funcName,
        args,
        resolve: resolveFunc,
        reject: rejectFunc
      };
      const taskId = this.enqueue(task);
      this.doTask(task);
    });
  };
  /* eslint-enable */

TaskScheduler.prototype.doTask = function doTask(task) {
  if (!this.connected) {
    return;
  }
  const { serverName, funcName, args, resolve, reject } = task;
  const server = this.getServer(serverName);
  if (server) {
    let func = null;
    if (typeof funcName === 'function') {
      func = funcName;
    } else {
      func = server[funcName];
    }
    func.apply(server, args).then(resolve, reject);
  }
};

TaskScheduler.prototype.dequeue = function dequeue(taskId) {
  this.taskQueue.delete(taskId);
};

TaskScheduler.prototype.clearLastTask = function clearLastTask() {
  if (this.taskId) {
    this.taskQueue.delete(this.taskId);
    this.taskId--;
  }
};

window.taskScheduler = new TaskScheduler();
const { taskScheduler } = window;
