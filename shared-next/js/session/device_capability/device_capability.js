/* exported DeviceCapabilityManager */
/* global taskScheduler */

const DeviceCapabilityManager = {
  /**
   * @param feature
   */
  get(...args) {
    return new Promise(resolve => {
      taskScheduler
        .request({
          serverName: taskScheduler.DEVICE_CAPABILITY,
          funcName: 'get',
          args
        })
        .then(
          value => {
            resolve(value);
          },
          () => {
            resolve(undefined);
          }
        );
    });
  }
};

window.DeviceCapabilityManager = DeviceCapabilityManager;
