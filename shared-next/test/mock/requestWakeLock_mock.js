function MockRequestWakeLock(key){
  return {
    topic: '',
    unlock: jest.fn()
  }
}

exports.MockRequestWakeLock = MockRequestWakeLock;
