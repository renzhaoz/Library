function FileReader() {}
FileReader.prototype = {
  readAsArrayBuffer: x => {
    return x;
  },
  readAsText: param => {
    return param;
  },
  set onloadend(cb) {
    cb.call(this);
  },
  set onload(cb) {
    cb({target: {result: 'onload|test'}})
  },
  get result() {
    return new ArrayBuffer(16);
  }
};

exports.mockFileReader = FileReader;
