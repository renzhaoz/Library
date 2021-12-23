/* exported TimeService */
/* global lib_time taskScheduler */

const TimeService = {
  eventList: ['timeChange', 'timeZoneChange'],
  timeObservers: [],
  restoreObserves: false,

  init() {
    window.addEventListener('session-disconnected', () => {
      const { timeservice } = window.api;
      if (timeservice) {
        timeservice.removeObserver(
          lib_time.CallbackReason.TIME_CHANGED,
          this.observer
        );
        timeservice.removeObserver(
          lib_time.CallbackReason.TIMEZONE_CHANGED,
          this.observer
        );
      }
      delete this.observer;
    });
    window.addEventListener('services-load-observer', () => {
      this.createObserver();
      this.processPendingRequest();
    });
  },

  createObserver() {
    class Observer extends lib_time.TimeObserverBase {
      constructor(service, session) {
        super(service.id, session);
      }

      display() {
        return 'Time observer';
      }

      callback() {
        TimeService.timeObservers.forEach(callback => {
          callback();
        });
        return Promise.resolve();
      }
    }
    const { timeservice } = window.api;
    this.observer = new Observer(timeservice, window.api.session);
  },

  processPendingRequest() {
    this.restoreObserves = true;
    if (TimeService.timeObservers.length > 0) {
      const { timeservice } = window.api;
      timeservice.addObserver(
        lib_time.CallbackReason.TIME_CHANGED,
        this.observer
      );
      timeservice.addObserver(
        lib_time.CallbackReason.TIMEZONE_CHANGED,
        this.observer
      );
    }
    this.restoreObserves = false;
  },

  set(...args) {
    return taskScheduler.request({
      serverName: taskScheduler.TIME_SERVICE,
      funcName: 'set',
      args
    });
  },

  get() {
    return taskScheduler.request({
      serverName: taskScheduler.TIME_SERVICE,
      funcName: 'get'
    });
  },

  // eslint-disable-next-line
  addEventListener(name, callback) {
    if (name === TimeService.eventList[0]) {
      if (TimeService.timeObservers.length > 0) {
        TimeService.timeObservers.push(callback);
      } else {
        const { timeservice } = window.api;
        if (timeservice) {
          timeservice.addObserver(
            lib_time.CallbackReason.TIME_CHANGED,
            this.observer
          );
          timeservice.addObserver(
            lib_time.CallbackReason.TIMEZONE_CHANGED,
            this.observer
          );
        }
        TimeService.timeObservers.push(callback);
      }
    }
  },

  removeEventListener(name, callback) {
    if (name === TimeService.eventList[0]) {
      if (TimeService.timeObservers.length > 1) {
        TimeService.timeObservers.forEach((value, index) => {
          if (value === callback) {
            TimeService.timeObservers.splice(index, 1);
          }
        });
      } else if (callback === TimeService.timeObservers[0]) {
        TimeService.timeObservers.splice(0, 1);
        const { timeservice } = window.api;
        timeservice.removeObserver(
          lib_time.CallbackReason.TIME_CHANGED,
          this.observer
        );
        timeservice.removeObserver(
          lib_time.CallbackReason.TIMEZONE_CHANGED,
          this.observer
        );
      }
    }
  }
};

TimeService.init();
window.TimeService = TimeService;
