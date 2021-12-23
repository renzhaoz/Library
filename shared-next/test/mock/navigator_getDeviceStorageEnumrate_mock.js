const MockGetDeviceStorageEnumerate = function() {
  return {
    enumerate(){
      return {
        [Symbol.asyncIterator]() {
          return {
            i: 0,
            next() {
              if (this.i < 3) {
                this.i++;
                return Promise.resolve({ value: 'xxx.txt', done: false });
              }
              return Promise.resolve({ done: true });
            }
          };
        }
      }
    }
  };
};
window.MockGetDeviceStorageEnumerate = MockGetDeviceStorageEnumerate;
