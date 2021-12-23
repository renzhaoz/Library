/* exported ContactsManager */
/* global taskScheduler */

const ContactsManager = {
  connected: false,
  initFlag: false,
  eventListenerInfo: {},
  onContactChangeCallback: null,
  onSpeedDialChangeCallback: null,
  onContactGroupChangeCallback: null,
  onBlockedNumberChangeCallback: null,
  EventMap: {
    BLOCKED_NUMBER_CHANGE: 'blockChange',
    CONTACT_CHANGE: 'contactChange',
    GROUP_CHANGE: 'groupChange',
    SPEED_DIAL_CHANGE: 'speedDialChange',
    SIM_LOADED_EVENT: 'simLoadedEvent'
  },
  ChangeReason: {
    CREATE: 0,
    UPDATE: 1,
    REMOVE: 2
  },

  FilterByOption: {
    NAME: 0,
    GIVEN_NAME: 1,
    FAMILY_NAME: 2,
    TEL: 3,
    EMAIL: 4,
    CATEGORY: 5
  },

  FilterOption: {
    EQUALS: 0,
    CONTAINS: 1,
    MATCH: 2,
    STARTS_WITH: 3,
    FUZZY_MATCH: 4
  },

  Order: {
    ASCENDING: 0,
    DESCENDING: 1
  },

  SortOption: {
    GIVEN_NAME: 0,
    FAMILY_NAME: 1,
    NAME: 2
  },
  init() {
    if (!this.initFlag) {
      this.initFlag = true;
      window.addEventListener('session-disconnected', () => {
        this.connected = false;
      });
      window.addEventListener('services-load-observer', () => {
        if (!this.connected) {
          this.connected = true;
          const {
            BLOCKEDNUMBER_CHANGE_EVENT,
            CONTACTS_CHANGE_EVENT,
            GROUP_CHANGE_EVENT,
            SPEEDDIAL_CHANGE_EVENT,
            SIM_CONTACT_LOADED_EVENT
          } = window.api.contactsmanager;

          Object.assign(this.EventMap, {
            [this.EventMap.BLOCKED_NUMBER_CHANGE]: BLOCKEDNUMBER_CHANGE_EVENT,
            [this.EventMap.CONTACT_CHANGE]: CONTACTS_CHANGE_EVENT,
            [this.EventMap.GROUP_CHANGE]: GROUP_CHANGE_EVENT,
            [this.EventMap.SPEED_DIAL_CHANGE]: SPEEDDIAL_CHANGE_EVENT,
            [this.EventMap.SIM_LOADED_EVENT]: SIM_CONTACT_LOADED_EVENT
          });

          const {
            ChangeReason,
            FilterByOption,
            FilterOption,
            Order,
            SortOption
          } = window.lib_contacts;

          this.ChangeReason = ChangeReason;
          this.FilterByOption = FilterByOption;
          this.FilterOption = FilterOption;
          this.Order = Order;
          this.SortOption = SortOption;
        }

        this.recoverListener();
      });
    }
  },

  /**
   * @param ContactFindSortOptions = {
   *    sortBy：// ContactsManager.SortOption
   *    sortOrder// ContactsManager.Order
   *    sortLanguage: eg: navigator.language || 'de'
   *    filterValue: // e.g. "Tom" "123456"
   *    filterOption: // ContactsManager.FilterOption.xxx
   *    filterBy: // ContactsManager.FilterByOption.xxx
   *    onlyMainData: {bool} Only return the main data of a contact or not.
   *  }
   * @param numbers: only return numbers of contacts after every cursor.next()
   * @return dom cursor if done, must release the cursor by cursor.release().
   */
  find(...args) {
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: 'find',
      args
    });
  },

  /**
   * @param ContactSortOptions: {
   *        sortBy：// ContactsManager.SortOption
   *        sortOrder// ContactsManager.Order
   *        sortLanguage: eg: navigator.language || 'de'
   *      }
   * @param numbers: only return numbers of contacts after every cursor.next().
   * @param onlyMainData: only return main table data, would be faster but less info.
   * @return dom cursor, if done, must release the cursor by cursor.release().
   */
  getAll(...args) {
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: 'getAll',
      args
    });
  },

  /**
   * @param id: contact id
   * @param onlyMainData: only return main table data, would be faster but less info.
   * @return promise.
   */
  getContactByID(...args) {
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: 'get',
      args
    });
  },

  /**
   * @param args:
   *   contactIdsArray: array, the contacts ids you are going to remove from db.
   * @return promise
   */
  remove(...args) {
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: 'remove',
      args
    });
  },

  /**
   * @param args:
   *   bAdd: judge add or update.
   *   contactsArray: array
   */
  save(bAdd, ...args) {
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: bAdd ? 'add' : 'update',
      args
    });
  },

  /**
   * @param args:
   *   contactIdsArray: array
   *   copyOrMOve: {0|1}
   * @return promise
   */
  moveContactsToDevice(...args) {
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: 'moveContactsToDevice',
      args
    });
  },

  /**
   * @param args:
   *   contactIdsArray: array
   *   copyOrMOve: {0|1}
   * @return promise
   */
  moveContactsToSim(...args) {
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: 'moveContactsToSim',
      args
    });
  },

  /**
   * To clear all contacts and related data.
   */
  clear() {
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: 'clearContacts'
    });
  },

  /**
   * @return Contacts count: number
   */
  getCount() {
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: 'getCount'
    });
  },

  /**
   * @return SpeedDialInfo: object
   */
  getSpeedDials() {
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: 'getSpeedDials'
    });
  },

  /**
   * @param args:
   *   dialKey: str
   */
  removeSpeedDial(...args) {
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: 'removeSpeedDial',
      args
    });
  },

  /**
   * @param bAdd: boolean, add or update
   * @param args: {dialKey: str, tel: str, contactId: str}
   */
  setSpeedDial(bAdd, { dialKey, tel, contactId }) {
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: bAdd ? 'addSpeedDial' : 'updateSpeedDial',
      args: [dialKey, tel, contactId]
    });
  },

  /**
   * Get all ice, order by the position ascending. the position start with 1.
   * @return {Array<Object>} [IceInfo*] IceInfo: {position: number, contactId: sting}
   */
  getAllICE() {
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: 'getAllIce'
    });
  },

  /**
   * Remove ice by contact id.
   * @param args: contactId: string
   */
  removeICE(...args) {
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: 'removeIce',
      args
    });
  },

  /**
   * Add or Update ice.
   * @param args: contactId: str, position: number,
   */
  setICE(...args) {
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: 'setIce',
      args
    });
  },

  /**
   * @return promise: GroupInfo array
   */
  getAllGroups() {
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: 'getAllGroups'
    });
  },

  /**
   * @param bAdd: boolean, add or update
   * @param groupInfo:  {id: str, name: str}
   */
  saveGroup(bAdd, groupInfo) {
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: bAdd ? 'addGroup' : 'updateGroup',
      args: bAdd ? [groupInfo.name] : [groupInfo.id, groupInfo.name]
    });
  },

  /**
   * @param args:
   *   groupId: str
   * @return contactIds: array
   */
  getContactIdsFromGroup(...args) {
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: 'getContactidsFromGroup',
      args
    });
  },

  /**
   * @param args:
   *   groupId: str
   * @return
   */
  removeGroup(...args) {
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: 'removeGroup',
      args
    });
  },

  /**
   * @return promise: blocker numbers str array
   */
  getAllBlockedNumbers() {
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: 'getAllBlockedNumbers'
    });
  },

  /**
   * @param BlockedNumberFindOptions: {filterValue: str filterOption: FilterOption}
   * @return promise, result is an array of blocked number string
   */
  findBlockedNumbers(...args) {
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: 'findBlockedNumbers',
      args
    });
  },

  /**
   * To add a number as blocked number.
   * If adding number is already exists, event onblocknumberchange wouldn't be triggered.
   * User always get success if saving identical number multiple times.
   * @param args:
   *   number: The number to be blocked.
   */
  addBlockedNumber(...args) {
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: 'addBlockedNumber',
      args
    });
  },

  /**
   * @param args:
   *   number: The number to be removed.
   */
  removeBlockedNumber(...args) {
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: 'removeBlockedNumber',
      args
    });
  },
  addEventListener(event, callback) {
    if (!Object.values(this.EventMap).includes(event)) {
      return;
    }
    if (this.connected) {
      window.api.contactsmanager.addEventListener(
        this.EventMap[event],
        callback
      );
    }
    if (this.eventListenerInfo[event]) {
      this.eventListenerInfo[event].push(callback);
    } else {
      this.eventListenerInfo[event] = [callback];
    }
  },

  removeEventListener(event, callback) {
    if (!Object.values(this.EventMap).includes(event)) {
      return;
    }
    if (this.connected) {
      window.api.contactsmanager.removeEventListener(
        this.EventMap[event],
        callback
      );
    }
    if (this.eventListenerInfo[event]) {
      this.eventListenerInfo[event].forEach((listener, listenerIndex) => {
        if (listener === callback) {
          this.eventListenerInfo[event].splice(listenerIndex, 1);
        }
      });
    }
  },

  recoverListener() {
    for (const event in this.eventListenerInfo) {
      const listeners = this.eventListenerInfo[event];
      const evt = this.EventMap[event];
      if (evt) {
        listeners.forEach(listener => {
          window.api.contactsmanager.addEventListener(evt, listener);
        });
      }
    }

    this.onContactChange(this.onContactChangeCallback);
    this.onSpeedDialChange(this.onSpeedDialChangeCallback);
    this.onContactGroupChange(this.onContactGroupChangeCallback);
    this.onBlockedNumberChange(this.onBlockedNumberChangeCallback);
  },

  onContactChange(callback) {
    this.onContactChangeCallback = callback;
    if (this.connected) {
      window.api.contactsmanager.oncontactchange = callback;
    }
  },

  onSpeedDialChange(callback) {
    this.onSpeedDialChangeCallback = callback;
    if (this.connected) {
      window.api.contactsmanager.onspeeddialchange = callback;
    }
  },

  onContactGroupChange(callback) {
    this.onContactGroupChangeCallback = callback;
    if (this.connected) {
      window.api.contactsmanager.oncontactgroupchange = callback;
    }
  },

  onBlockedNumberChange(callback) {
    this.onBlockedNumberChangeCallback = callback;
    if (this.connected) {
      window.api.contactsmanager.onblockednumberchange = callback;
    }
  }
};

ContactsManager.init();
window.ContactsManager = ContactsManager;
