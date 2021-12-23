const MockGetDeviceStorage = function() {
  return {
    get(filepath) {
      return {
        set onsuccess(cb) {
          cb.call(this);
        },
        set onerror(cb) {
          cb.call(this);
        },
        get result() {
          const file = {
            name: filepath,
            size: 1
          };
          return file;
        }
      };
    },
    addNamed(contact, filename) {
      const response = {
        target: {
          result: filename
        }
      };
      return {
        set onsuccess(cb) {
          cb(response);
        },
        set onerror(cb) {
          cb.call(this);
        }
      };
    },
    addEventListener() {
      // Do nothing
    },
    available() {
      return {
        set onsuccess(cb) {
          cb({ target: { result: 'shared' } });
          cb({ target: { result: 'available' } });
        },
        get result() {
          return 'available';
        }
      };
    },
    freeSpace() {
      return {
        set onsuccess(cb) {
          cb({ target: { result: 20 } });
          cb({ target: { result: 89 } });
        },
        get result() {
          return 'available';
        }
      };
    },
    enumerate() {
      const req = {
        set onsuccess(cb) {
          cb({ target: { result: null } });
        },
        set onerror(cb) {
          cb({ target: { error: new Error('error') } });
        }
      };
      const storage = {
        entries: [
          { name: 'mock1' },
          { name: 'mock2' },
          { name: 'mock3' },
          { name: 'mock4' }
        ]
      };
      var cursor = {
        index: -1,
        done: false,
        continue() {
          this.index += 1;
          if (this.index < storage.entries.length) {
            this.result = storage.entries[this.index];
          } else {
            this.result = null;
            this.done = true;
          }
          setTimeout(function() {
            if (req.onsuccess) {
              req.onsuccess.call(cursor);
            }
          });
        },
        result: null
      };
      const cursors = [];
      cursors.push(cursor);
      cursor.continue();
      return req;
    },
    delete(name) {
      return {
        set onsuccess(cb) {
          cb.call(this);
        },
        get result() {
          return name;
        }
      };
    },
    appendNamed(file, filename) {
      return {
        set onsuccess(cb) {
          cb.call(this);
        },
        set onerror(cb) {
          cb.call(this);
        }
      };
    },
    0: {
      storageName: 'sdcard',
      available: jest.fn(() => {
        return {
          set onerror(cb) {
            cb.call(this);
          },
          set onsuccess(cb) {
            cb.call(this);
          },
          result: 'storageName0'
        };
      }),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    },
    length: 1,
    storageName: 'sdcard'
  };
};
window.MockGetDeviceStorage = MockGetDeviceStorage;
