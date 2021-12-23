const MockMobileMessage = {
  getSmscAddress: function(done){
    return {
      set onsuccess(cb) {
        cb.call(this);
      },
      set onerror(cb) {
        cb.call(this);
      },
      get result() {
        return 'res,ult';
      }
    }
  }
}

exports.MockMobileMessage = MockMobileMessage;
