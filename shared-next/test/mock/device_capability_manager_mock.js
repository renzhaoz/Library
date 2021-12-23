window.DeviceCapabilityManager = {
  get: (capability) => {
    return new Promise( (resolve,reject) => {
      resolve(capability);
    });
  }
};
