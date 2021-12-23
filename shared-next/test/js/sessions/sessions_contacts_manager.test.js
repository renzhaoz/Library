describe('session js <contacts_manager> test', () => {
  const common = require('../../common');
  const dispatchEvent = common.dispatchEvent;
  global.lib_contacts = {
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
    }
  };

  beforeEach(done => {
    require('../../mock/window_api_mock');
    import('../../../js/session/contacts_manager/contacts_manager');
    done();
  });

  // services-load-complete event should be monitored
  test('services-load-complete', done => {
    dispatchEvent('services-load-observer');
    expect(ContactsManager.connected).toBe(true);
    done();
  });

  // session-disconnected event should be monitored
  test('session-disconnected', done => {
    dispatchEvent('session-disconnected');
    expect(ContactsManager.connected).toBe(false);
    done();
  });

  test('contacts_manager member functions called correct', async done => {
    require('../../mock/daemon_task_scheduler_mock');
    await ContactsManager.find([]);
    await ContactsManager.getAll({}, '');
    await ContactsManager.getContactByID('id', true);
    await ContactsManager.remove([]);
    await ContactsManager.save([], []);
    await ContactsManager.moveContactsToDevice([]);
    await ContactsManager.moveContactsToSim([]);
    await ContactsManager.clear([]);
    await ContactsManager.getCount();
    await ContactsManager.getSpeedDials();
    await ContactsManager.removeSpeedDial([]);
    await ContactsManager.setSpeedDial(true, []);
    await ContactsManager.getAllICE();
    await ContactsManager.removeICE('id');
    await ContactsManager.setICE([]);
    await ContactsManager.getAllGroups();
    await ContactsManager.saveGroup(true, []);
    await ContactsManager.getContactIdsFromGroup([]);
    await ContactsManager.removeGroup([]);
    await ContactsManager.getAllBlockedNumbers();
    await ContactsManager.findBlockedNumbers([]);
    await ContactsManager.addBlockedNumber([]);
    await ContactsManager.removeBlockedNumber([]);
    done();
  });

  test('addEventListener and removeEventListener', done => {
    const observerFunc = jest.fn();
    ContactsManager.addEventListener(
      ContactsManager.EventMap.CONTACT_CHANGE,
      observerFunc
    );
    expect(
      ContactsManager.eventListenerInfo[ContactsManager.EventMap.CONTACT_CHANGE]
        .length
    ).toBe(1);
    dispatchEvent('session-disconnected');
    dispatchEvent('services-load-complete');
    ContactsManager.removeEventListener(
      ContactsManager.EventMap.CONTACT_CHANGE,
      observerFunc
    );
    expect(
      ContactsManager.eventListenerInfo[ContactsManager.EventMap.CONTACT_CHANGE]
        .length
    ).toBe(0);
    done();
  });

  test('onContactChange should bind callback', done => {
    ContactsManager.connected = true;
    const callBack = jest.fn();
    ContactsManager.onContactChange(callBack);
    expect(ContactsManager.onContactChangeCallback).toEqual(callBack);
    expect(window.api.contactsmanager.oncontactchange).toEqual(callBack);
    done();
  });

  test('onSpeedDialChange should bind callback', done => {
    ContactsManager.connected = true;
    const callBack = jest.fn();
    ContactsManager.onSpeedDialChange(callBack);
    expect(ContactsManager.onSpeedDialChangeCallback).toEqual(callBack);
    expect(window.api.contactsmanager.onspeeddialchange).toEqual(callBack);
    done();
  });

  test('onContactGroupChange should bind callback', done => {
    ContactsManager.connected = true;
    const callBack = jest.fn();
    ContactsManager.onContactGroupChange(callBack);
    expect(ContactsManager.onContactGroupChangeCallback).toEqual(callBack);
    expect(window.api.contactsmanager.oncontactgroupchange).toEqual(callBack);
    done();
  });

  test('onBlockedNumberChange should bind callback', done => {
    ContactsManager.connected = true;
    const callBack = jest.fn();
    ContactsManager.onBlockedNumberChange(callBack);
    expect(ContactsManager.onBlockedNumberChangeCallback).toEqual(callBack);
    expect(window.api.contactsmanager.onblockednumberchange).toEqual(callBack);
    done();
  });
});
