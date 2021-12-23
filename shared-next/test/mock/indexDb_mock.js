window.indexedDB = {
  open: jest.fn(() => {
    return {
      error: { name: 'error' },
      set onsuccess(cb) {
        cb.call(this);
      },
      set onerror(cb) {
        cb.call(this);
      },
      set onblocked(cb) {
        cb.call(this);
      },
      set onupgradeneeded(cb) {
        cb({
          target: {
            transaction: {
              objectStore: x => {
                return {
                  indexNames: ['file1', 'file2'],
                  deleteIndex: jest.fn(),
                  delete: jest.fn(),
                  add: jest.fn(),
                  openCursor: jest.fn(() => {
                    return {
                      error: { name: 'openCursor' },
                      set onerror(cb) {
                        cb.call(this);
                      },
                      set onsuccess(cb) {
                        cb.call(this);
                      },
                      get result() {
                        return {
                          value: { name: ['file1', 'file2'] },
                          continue: jest.fn(),
                          advance: jest.fn()
                        };
                      }
                    };
                  })
                };
              }
            }
          }
        });
      },
      get result() {
        return {
          createObjectStore: jest.fn(),
          objectStoreNames: {
            contains: jest.fn(() => {
              return true;
            })
          },

          transaction: jest.fn(() => {
            return {
              objectStore: jest.fn(() => {
                return {
                  get: jest.fn(() => {
                    return {
                      error: { name: 'get' },
                      set onerror(cb) {
                        cb.call(this);
                      },
                      set onsuccess(cb) {
                        cb.call(this);
                      }
                    };
                  }),
                  put: jest.fn(() => {
                    return {
                      error: { name: 'put' },
                      set onerror(cb) {
                        cb.call(this);
                      },
                      set onsuccess(cb) {
                        cb.call(this);
                      }
                    };
                  }),
                  delete: jest.fn(() => {
                    return {
                      error: { name: 'delete' },
                      set onerror(cb) {
                        cb.call(this);
                      }
                    };
                  }),
                  clear: jest.fn(() => {
                    return {
                      error: { name: 'clear' },
                      set onerror(cb) {
                        cb.call(this);
                      }
                    };
                  }),
                  count: jest.fn(() => {
                    return {
                      error: { name: 'count' },
                      set onerror(cb) {
                        cb.call(this);
                      }
                    };
                  }),
                  openCursor: jest.fn(() => {
                    return {
                      error: { name: 'openCursor' },
                      set onerror(cb) {
                        cb.call(this);
                      },
                      set onsuccess(cb) {
                        cb.call(this);
                      },
                      get result() {
                        return {
                          advance: jest.fn(),
                          continue: jest.fn()
                        };
                      }
                    };
                  }),
                  index: jest.fn(() => {
                    return {
                      openCursor: jest.fn(() => {
                        return {
                          set onerror(cb) {
                            cb.call(this);
                          },
                          set onsuccess(cb) {
                            cb.call(this);
                          }
                        };
                      }),
                      count: jest.fn(() => {
                        return {
                          set onerror(cb) {
                            cb.call(this);
                          },
                          set onsuccess(cb) {
                            cb({ target: { result: 'sucess' } });
                          }
                        };
                      })
                    };
                  }),
                  mozGetAll: jest.fn(() => {
                    return {
                      set onerror(cb) {
                        cb.call(this);
                      },
                      set onsuccess(cb) {
                        cb.call(this);
                      },
                      get result() {
                        return {
                          filter: jest.fn()
                        };
                      }
                    };
                  })
                };
              })
            };
          }),
          close: jest.fn()
        };
      }
    };
  })
};
