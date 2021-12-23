/* exported ProcManager */
/* global taskScheduler */

const ProcManager = {
  abort() {
    return taskScheduler.request({
      serverName: taskScheduler.PROCESS,
      funcName: 'abort'
    });
  },

  add(...args) {
    return taskScheduler.request({
      serverName: taskScheduler.PROCESS,
      funcName: 'add',
      args
    });
  },

  begin(...args) {
    return taskScheduler.request({
      serverName: taskScheduler.PROCESS,
      funcName: 'begin',
      args
    });
  },

  commit() {
    return taskScheduler.request({
      serverName: taskScheduler.PROCESS,
      funcName: 'commit'
    });
  },

  pending() {
    return taskScheduler.request({
      serverName: taskScheduler.PROCESS,
      funcName: 'pending'
    });
  },

  remove(...args) {
    return taskScheduler.request({
      serverName: taskScheduler.PROCESS,
      funcName: 'remove',
      args
    });
  },

  reset() {
    return taskScheduler.request({
      serverName: taskScheduler.PROCESS,
      funcName: 'reset'
    });
  }
};

window.ProcManager = ProcManager;
