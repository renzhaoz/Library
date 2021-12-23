/* exported enumerateAll */

/*
 * With the removal of composite storage, this function emulates
 * the composite storage enumeration (i.e. return files from
 * all of the storage areas).
 */
// eslint-disable-next-line
async function enumerateAll(storages) {
  async function getAllFiles() {
    const files = [];
    try {
      let iterable = null;
      for (let i = 0; i < storages.length; i++) {
        iterable = storages[i].enumerate();
        // eslint-disable-next-line
        for await (let file of iterable) {
          files.push(file);
        }
      }
      return files;
    } catch (e) {
      console.log(`getAllFiles Error${JSON.stringify(e)}`);
      return files;
    }
  }

  const filelists = await getAllFiles();
  return filelists;
}

window.enumerateAll = enumerateAll;
