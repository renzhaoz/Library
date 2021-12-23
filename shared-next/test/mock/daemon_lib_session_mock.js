(function Session(exports) {
  const Session = function Session() {
    jest.fn();
  };

  Session.prototype = {
    open: (protocal, domain, token, sessionState, state) => {
      sessionState.onsessionconnected();
    }
  };
  exports.Session = Session;
})(window);
