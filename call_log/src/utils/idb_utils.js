// @ts-check
import { toPromise } from 'utils/calllog_utils';

const open = (dbName, version) => {
  const req = window.indexedDB.open(dbName, version);
  return toPromise(req);
};

const getAll = (db, storeName) => {
  const req = db.transaction(storeName, 'readonly')
    .objectStore(storeName)
    .getAll();
  return toPromise(req);
};

const drop = (dbName) => {
  const req = window.indexedDB.deleteDatabase(dbName);
  return toPromise(req);
};

export { open, getAll, drop };
