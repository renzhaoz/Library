/* exported AccountManager */
/* global LazyLoader, AccountCryptoHelper, WebActivity, taskScheduler,
   lib_accounts */

const AccountManager = {
  _observers: [],
  _observersArray: [],
  initFlag: false,
  restoreObserves: false,
  state: {
    LOGGED_IN: 0,
    LOGGED_OUT: 1,
    REFRESHED: 2
  },

  init() {
    if (!this.initFlag) {
      this.initFlag = true;

      window.addEventListener('session-disconnected', () => {
        const { accountmanager } = window.api;
        if (accountmanager) {
          this._observers.forEach(observer => {
            const { authenticatorId } = observer;

            accountmanager.removeObserver(authenticatorId, this.observer);
          });
        }

        this.connected = false;
        this._observers = [];
        delete this.observer;
      });

      window.addEventListener('services-load-complete', () => {
        this.createObserver();
        this.processPendingRequest();
      });
    }
  },

  createObserver() {
    const { accountmanager } = window.api;
    class AccountObserver extends lib_accounts.AccountObserverBase {
      constructor(service, session) {
        super(service.id, session);
      }

      display() {
        return 'Account observer';
      }

      callback(accountInfo) {
        AccountManager._observers.forEach(result => {
          if (result.authenticatorId === accountInfo.accountType) {
            const data = { ...accountInfo };
            const params = [data, 'accountType', 'authenticatorId'];

            AccountManager.replaceObjectKey(...params);
            result.callback(data);
          }
        });
        return Promise.resolve();
      }
    }

    this.observer = new AccountObserver(accountmanager, window.api.session);
  },

  addObserver(...args) {
    return taskScheduler.request({
      serverName: taskScheduler.ACCOUNTS,
      funcName: 'addObserver',
      args
    });
  },

  removeObserver(...args) {
    return taskScheduler.request({
      serverName: taskScheduler.ACCOUNTS,
      funcName: 'removeObserver',
      args
    });
  },

  notify(...args) {
    this.replaceObjectKey(args[0], 'authenticatorId', 'accountType');
    return taskScheduler.request({
      serverName: taskScheduler.ACCOUNTS,
      funcName: 'notify',
      args
    });
  },

  async observe(authenticatorId, callbackHandle, observeOnly = false) {
    const isKaiAccount = () => authenticatorId === 'kaiaccount';

    if (this.observer) {
      const observed = this._observers.find(observer => {
        return observer.authenticatorId === authenticatorId;
      });

      if (!observed) {
        const { accountmanager } = window.api;
        accountmanager.addObserver(authenticatorId, this.observer);
      }

      this._observers.push({
        authenticatorId,
        callback: callbackHandle
      });
    }
    if (!this.restoreObserves) {
      this._observersArray.push({
        authenticatorId,
        callbackHandle
      });
    }

    if (isKaiAccount() && !observeOnly) {
      const loadJS = '%SHARED_APP_ORIGIN%/js/helper/account/crypto_helper.js';

      await LazyLoader.load(loadJS);

      const publicKey = await AccountCryptoHelper.getKey();
      const getAccountActivityData = {
        name: 'account-manager',
        data: {
          action: 'getAccounts',
          publicKey
        }
      };
      let loggedIn = false;

      try {
        const encodeResult = await new WebActivity(
          getAccountActivityData.name,
          getAccountActivityData.data
        ).start();
        const accounts = await AccountCryptoHelper.unwrapKey(encodeResult);

        loggedIn = accounts.find(item => {
          return item.authenticatorId === authenticatorId;
        });

        callbackHandle({
          authenticatorId,
          accountId: loggedIn ? loggedIn.accountId : '',
          state: loggedIn ? this.state.LOGGED_IN : this.state.LOGGED_OUT
        });
      } catch (error) {
        console.error(`Cannot getAccounts from account-manager: ${error}`);
        callbackHandle({
          authenticatorId,
          accountId: '',
          state: this.state.LOGGED_OUT
        });
      }
    }
  },

  unobserve(authenticatorId, callback) {
    const { accountmanager } = window.api;
    if (accountmanager) {
      let observedSum = 0;
      let removeFlag = false;
      this._observers.forEach((observer, index) => {
        if (observer.authenticatorId === authenticatorId) {
          if (!removeFlag && observer.callback === callback) {
            this._observers.splice(index, 1);
            removeFlag = true;
          }
          observedSum++;
        }
      });
      if (observedSum === 1) {
        accountmanager.removeObserver(authenticatorId, this.observer);
      }
    }
  },

  processPendingRequest() {
    this.restoreObserves = true;
    this._observersArray.forEach(obj => {
      const { authenticatorId, callbackHandle } = obj;
      this.observe(authenticatorId, callbackHandle);
    });
    this.restoreObserves = false;
  },

  replaceObjectKey(obj, oldKey, newKey) {
    delete Object.assign(obj, {
      [newKey]: obj[oldKey]
    })[oldKey];
  }
};

AccountManager.init();
window.AccountManager = AccountManager;
