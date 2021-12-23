/* exported getUnusedFilename */

/*
 * This utility function helps avoid overwriting existing files.
 * If no file with the specified name exists in the specified storage, pass
 * the name to the callback. Otherwise, add a version number to the name
 * and try again. Once a name is found that does not already exist, pass it
 * to the callback. If the initial name 'base.ext' does not exist, then new
 * names of the form 'base_n.ext', where n is a number are tried.
 */
// eslint-disable-next-line
function getUnusedFilename(storage, name, callback) {
  const getreq = storage.get(name);
  let onerrorNum = 0;
  getreq.onerror = () => {
    /*
     * We get this error if the file does not already exist, and that
     * Is what we want
     */
    // eslint-disable-next-line callback-return
    callback(name);
    onerrorNum++;
  };
  getreq.onsuccess = () => {
    let version = 0;
    let p = name.lastIndexOf('/');
    const dir = name.substring(0, p + 1);
    const file = name.substring(p + 1);
    p = file.lastIndexOf('.');
    if (p === -1) {
      p = file.length;
    }
    const ext = file.substring(p);
    let base = file.substring(0, p);
    const parts = base.match(/^(.*)_(\d{1,2})$/u);
    if (parts) {
      [, base] = parts;
      version = parseInt(parts[2], 10);
    }

    const newname = `${dir + base}_${version + 1}${ext}`;
    if (onerrorNum === 0) {
      getUnusedFilename(storage, newname, callback);
    }
  };
}

window.getUnusedFilename = getUnusedFilename;
