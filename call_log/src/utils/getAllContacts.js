/**
  * @file - get all contacts data
  *
  * @return { Map } - contactsMap [
  *   key: number,
  *   value: {
  *     nameValue, - contacts.name
  *     id, - contacts.id
  *     number, - tel number
  *     atype, - call type
  *     photoBlob - contacts.photoBlob
  *   }
  * ]
  */

const options = {
  sortBy: ContactsManager.SortOption.FAMILY_NAME,
  sortOrder: ContactsManager.Order.ASCENDING,
  sortLanguage: navigator.language || 'de'
};

const getAll = async () => {
  const contactsMap = new Map();
  const cursor = await ContactsManager.getAll(options, 2000, true);
  let contacts = [];

  try {
    let contactsCursor = await cursor.next();
    while (contactsCursor.length) {
      contacts = contacts.concat(contactsCursor);
      contactsCursor = await cursor.next();
    }
  } catch (e) {
    console.error('Error');
  }

  cursor.release();

  contacts.forEach(item => {
    const { id, tel = [], email = [], photoBlob, photoType } = item;
    const emailName = email.length > 0 ? email[0].value : '';
    tel.forEach(i => {
      contactsMap.set(
        i.value,
        {
          id: id,
          number: i.value,
          photoBlob: photoBlob.byteLength > 0 ? window.btoa(String.fromCharCode(...photoBlob)) : null,
          type: i.atype,
          name: item.name ? item.name : (emailName || i.value),
          photoType
        }
      );
    });
  });

  return contactsMap;
};

export default getAll;
