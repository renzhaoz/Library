/* exported MediaDB */

/**
 * MediaDB.js: a simple interface to DeviceStorage and IndexedDB that serves
 *             as a model of the filesystem and provides easy access to the
 *             user's media files and their metadata.
 *
 * Gaia's media apps (Gallery, Music, Videos) read media files from the phone
 * using the DeviceStorage API. They need to keep track of the complete list of
 * media files, as well as the metadata (image thumbnails, song titles, etc.)
 * they have extracted from those files. It would be much too slow to scan the
 * filesystem and read all the metadata from all files each time the apps starts
 * up, so the apps need to store the list of files and metadata in an IndexedDB
 * database. This library integrates both DeviceStorage and IndexedDB into a
 * single API. It keeps the database in sync with the filesystem and provides
 * notifications when files are added or deleted.
 *
 * CONSTRUCTOR
 *
 * Create a MediaDB object with the MediaDB() constructor. It takes three
 * arguments:
 *
 *   mediaType:
 *     one of the DeviceStorage media types: "pictures", "movies" or "music".
 *
 *   metadataParser:
 *     your metadata parser function. This function should expect three
 *     arguments. It will be called with a file to parse and two callback
 *     functions. It should read metadata from the file and then pass an object
 *     of metadata to the first callback. If parsing fails it should pass an
 *     Error object or error message to the second callback. If you omit this
 *     argument or pass null, a dummy parser that invokes the callback with an
 *     empty object will be used instead.
 *
 *   options:
 *     An optional object containing additional MediaDB options.
 *     Supported options are:
 *
 *       mimeTypes:
 *          an array of MIME types that specifies the kind of files you are
 *          interested in and that your metadata parser function knows how to
 *          handle. DeviceStorage infers MIME type from filename extension and
 *          filters the files it returns based on their extension. Use this
 *          property if you want to restrict the set of mime types further.
 *
 *       indexes:
 *          an array of IndexedDB key path specifications that specify which
 *          properties of each media record should be indexed. If you want to
 *          search or sort on anything other than the file name and date you
 *          should set this property. "size", and "type" are valid keypaths as
 *          is "metadata.x" where x is any metadata property returned by your
 *          metadata parser.
 *
 *       version:
 *          The version of your IndexedDB database. The default value is 1
 *          Setting it to a larger value will delete all data in the database
 *          and rebuild it from scratch. If you ever change your metadata parser
 *          function or alter the array of indexes.
 *
 *       autoscan:
 *          Whether MediaDB should automatically scan every time it becomes
 *          ready. The default is true. If you set this to false you are
 *          responsible for calling scan() in response to the 'ready' event.
 *
 *       batchHoldTime:
 *          How long (in ms) to wait after finding a new file during a scan
 *          before reporting it. Longer hold times allow more batching of
 *          changes. The default is 100ms.
 *
 *       batchSize:
 *          When batching changes, don't allow the batches to exceed this
 *          amount. The default is 0 which means no maximum batch size.
 *
 *       updateRecord:
 *          When upgrading database, MediaDB uses this function to ask client
 *          app to update the metadata record of specified file. The return
 *          value of this function is the updated metadata. If client app does
 *          not update any metadata, client app still needs to return
 *          file.metadata. The client may also set file.needsReparse to indicate
 *          that the source file should be reparsed.
 *
 *       reparsedRecord:
 *          If in updateRecord, a record has been marked with file.needsReparse,
 *          this function is called after the file has been reparsed to allow
 *          the client app to merge any old metadata (e.g. metadata set by the
 *          user). This function takes two arguments: the old metadata and the
 *          new metadata, and should return the merged metadata.
 *
 *       excludeFilter:
 *          excludeFilter is used when client app wants MediaDB to filter out
 *          additional media files. It must be a regular expression object. The
 *          matched files are filtered out. The original filtering behavior of
 *          MediaDB will not be change even if excludeFilter is supplied.
 *
 * MediaDB STATE
 *
 * A MediaDB object must asynchronously open a connection to its database, and
 * asynchronously check on the availability of device storage, which means that
 * it is not ready for use when first created. After calling the MediaDB()
 * constructor, register an event listener for 'ready' events with
 * addEventListener() or by setting the onready property. You must not use
 * the MediaDB object until the ready event has been delivered or until
 * the state property is set to MediaDB.READY.
 *
 * The DeviceStorage API is not always available, and MediaDB is not usable if
 * DeviceStorage is not usable. If the user removes the SD card from their
 * phone, then DeviceStorage will not be able to read or write files,
 * obviously.  Also, when a USB Mass Storage session is in progress,
 * DeviceStorage is not available either. If DeviceStorage is not available
 * when a MediaDB object is created, an 'unavailable' event will be fired
 * instead of a 'ready' event. Subsequently, a 'ready' event will be fired
 * whenever DeviceStorage becomes available, and 'unavailable' will be fired
 * whenever DeviceStorage becomes unavailable. Media apps can handle the
 * unavailable case by displaying an informative message in an overlay that
 * prevents all user interaction with the app.
 *
 * The 'ready' and 'unavailable' events signal changes to the state of a
 * MediaDB object. The state is also available in the state property of the
 * object.  The possible values of this property are the following:
 *
 *   Value        Constant           Meaning
 *   ----------------------------------------------------------------------
 *   'opening'    MediaDB.OPENING    MediaDB is initializing itself
 *   'upgrading'  MediaDB.UPGRADING  MediaDB is upgrading database
 *   'enumerable' MediaDB.ENUMERABLE Not fully ready but can be enumerated
 *   'ready'      MediaDB.READY      MediaDB is available and ready for use
 *   'nocard'     MediaDB.NOCARD     Unavailable because there is no sd card
 *   'unmounted'  MediaDB.UNMOUNTED  Unavailable because the card is unmounted
 *   'closed'     MediaDB.CLOSED     Unavailable because close() was called
 *
 * When an 'unavailable' event is fired, the detail property of the event
 * object specifies the reason that the MediaDB is unavailable. It is one of
 * the state values 'nocard', 'unmounted' or 'closed'.
 *
 * The 'nocard' state occurs when device storage is not available because
 * there is no SD card in the device. This is typically a permanent failure
 * state, and media apps cannot run without an SD card. It can occur
 * transiently, however, if the user is swapping SD cards while a media app is
 * open.
 *
 * The 'unmounted' state occurs when the device's SD card is unmounted. This
 * is generally a temporary condition that occurs when the user starts a USB
 * Mass Storage transfer session by plugging their device into a computer.  In
 * this case, MediaDB will become available again as soon as the device is
 * unplugged (it may have different files on it, though: see the SCANNING
 * section below).
 *
 * DATABASE RECORDS
 *
 * MediaDB stores a record in its IndexedDB database for each DeviceStorage
 * file of the appropriate media type and mime type. The records
 * are objects of this form:
 *
 *   {
 *     name:     // the filename (relative to the DeviceStorage root)
 *     type:     // the file MIME type (extension-based, from DeviceStorage)
 *     size:     // the file size in bytes
 *     date:     // file modification time (as ms since the epoch)
 *     metadata: // whatever object the metadata parser returned
 *   }
 *
 * Note that the database records do not include the file itself, but only its
 * name. Use the getFile() method to get a File object (a Blob) by name.
 *
 * ENUMERATING FILES
 *
 * Typically, the first thing an app will do with a MediaDB object after the
 * ready event is triggered is call the enumerate() method to obtain the list
 * of files that MediaDB already knows about from previous app invocations.
 * enumerate() gets records from the database and passes them to the specified
 * callback. Each record that is passed to the callback is an object in the
 * form shown above.
 *
 * If you pass only a callback to enumerate(), it calls the callback once for
 * each entry in the database and then calls the callback with an argument of
 * null to indicate that it is done.
 *
 * By default, entries are returned in alphabetical order by filename and all
 * entries in the database are returned. You can specify other arguments to
 * enumerate() to change the set of entries that are returned and the order that
 * they are enumerated in. The full set of arguments are:
 *
 *   key:
 *     A keypath specification that specifies what field to sort on.  If you
 *     specify this argument, it must be 'name', 'date', or one of the values
 *     in the options.indexes array passed to the MediaDB() constructor.  This
 *     argument is optional. If omitted, the default is to use the file name
 *     as the key.
 *
 *   range:
 *     An IDBKeyRange object that optionally specifies upper and lower bounds on
 *     the specified key. This argument is optional. If omitted, all entries in
 *     the database are enumerated. See IndexedDB documentation for more on
 *     key ranges.
 *
 *   direction:
 *     One of the IndexedDB direction string "next", "nextunique", "prev" or
 *     "prevunique". This argument is optional. If omitted, the default is
 *     "next", which enumerates entries in ascending order.
 *
 *   callback:
 *     The function that database entries should be passed to. This argument is
 *     not optional, and is always passed as the last argument to enumerate().
 *
 * The enumerate() method returns database entries. These include file names,
 * but not the files themselves. enumerate() interacts solely with the
 * IndexedDB; it does not use DeviceStorage. If you want to use a media file
 * (to play a song or display a photo, for example) call the getFile() method.
 *
 * enumerate() returns an object with a 'state' property that starts out as
 * 'enumerating' and switches to 'complete' when the enumeration is done. You
 * can cancel a pending enumeration by passing this object to the
 * cancelEnumeration() method. This switches the state to 'cancelling' and then
 * it switches to 'cancelled' when the cancellation is complete. If you call
 * cancelEnumeration(), the callback function you passed to enumerate() is
 * guaranteed not to be called again.
 *
 * In addition to enumerate(), there are two other methods you can use
 * to enumerate database entries:
 *
 * enumerateAll() takes the same arguments and returns the same values
 * as enumerate(), but it batches the results and passes them in an
 * array to the callback function.
 *
 * getAll() takes a callback argument and passes it an array of all
 * entries in the database, sorted by filename. It does not allow you
 * to specify a key, range, or direction, but if you need all entries
 * from the database, this method is is much faster than enumerating
 * entries individually.
 *
 * FILESYSTEM CHANGES
 *
 * When media files are added or removed, MediaDB reports this by triggering
 * 'created' and 'deleted' events.
 *
 * When a 'created' event is fired, the detail property of the event is an
 * array of database record objects. When a single file is created (for
 * example when the user takes a picture with the Camera app) this array has
 * only a single element. But when MediaDB scans for new files (see SCANNING
 * below) it may batch multiple records into a single created event. If a
 * 'created' event has many records, apps may choose to simply rebuild their
 * UI from scratch with a new call to enumerate() instead of handling the new
 * files one at a time.
 *
 * When a 'deleted' event is fired, the detail property of the event is an
 * array of the names of the files that have been deleted. As with 'created'
 * events, the array may have a single element or may have many batched
 * elements.
 *
 * If MediaDB detects that a file has been modified in place (because its
 * size or date changes) it treats this as a deletion of the old version and
 * the creation of a new version, and will fire a deleted event followed by
 * a created event.
 *
 * The created and deleted events are not triggered until the corresponding
 * files have actually been created and deleted and their database records
 * have been updated.
 *
 * SCANNING
 *
 * MediaDB automatically scans for new and deleted files every time it enters
 * the MediaDB.READY state. This happens when the MediaDB object is first
 * created, and also when an SD card is removed and reinserted or when the
 * user finishes a USB Mass Storage session. If the scan finds new files, it
 * reports them with one or more 'created' events. If the scan finds that
 * files have been deleted, it reports them with one or more 'deleted' events.
 *
 * MediaDB fires a 'scanstart' event when a scan begins and fires a 'scanend'
 * event when the scan is complete. Apps can use these events to let the user
 * know that a scan is in progress.
 *
 * The scan algorithm attempts to quickly look for new files and reports those
 * first. It then begins a slower full scan phase where it checks that each of
 * the files it already knows about is still present.
 *
 * EVENTS
 *
 * As described above, MediaDB sends events to communicate with the apps
 * that use it. The event types and their meanings are:
 *
 *   Event         Meaning
 *  --------------------------------------------------------------------------
 *   ready         MediaDB is ready for use. Also fired when new volumes added.
 *   enumerable    Fired when DB can be enumerated but before fully ready
 *   unavailable   MediaDB is unavailable (often because of USB file transfer)
 *   created       One or more files were created
 *   deleted       One or more files were deleted
 *   scanstart     MediaDB is scanning
 *   scanend       MediaDB has finished scanning
 *   cardremoved   A volume became permanently unavailable.
 *                 Only fired on devices that have internal storage and a card
 *
 * Because MediaDB is a JavaScript library, these are not real DOM events, but
 * simulations.
 *
 * MediaDB defines two-argument versions of addEventListener() and
 * removeEventListener() and also allows you to define event handlers by
 * setting 'on' properties like 'onready' and 'onscanstart'.
 *
 * The objects passed on MediaDB event handlers are not true Event objects but
 * simulate a CustomEvent by defining type, target, currentTarget, timestamp
 * and detail properties.  For MediaDB events, it is the detail property that
 * always holds the useful information. These simulated event objects do not
 * have preventDefault(), stopPropagation() or stopImmediatePropagation()
 * methods.
 *
 * MediaDB events do not bubble and cannot be captured.
 *
 * INTERNAL AND EXTERNAL STORAGE
 *
 * Some devices have internal storage and also external (sdcard) storage.
 * MediaDB hides this from apps, for the most part. There are some
 * idiosyncracies to be aware of, however. With more than one device storage
 * area available, MediaDB can remain available even when an sdcard is
 * removed. When this happens we send a 'cardremoved' event instead of
 * an 'unavailable' event. And if there were files on that card, the
 * cardremoved event is followed by a series of deleted events for all of
 * the files.
 *
 * If a card is inserted, we just send a 'ready' event, and start a new scan,
 * even if we were already in the MediaDB.READY state.
 *
 * The situation is slightly different when one of the two storage areas is
 * unmounted so it can be shared by USB, however. In this case, the files
 * are only temporarily unavailable, and it doesn't make sense to delete
 * them and then rescan everything when the volume is mounted again. So instead,
 * when either of the storage areas is shared via USB, MediaDB sends its
 * 'unavailable' event.
 *
 * METHODS
 *
 * MediaDB defines the following methods:
 *
 * - addEventListener(): register a function to call when an event is fired
 *
 * - removeEventListener(): unregister an event listener function
 *
 * - enumerate(): for each file that MediaDB knows about, pass its database
 *     record object to the specified callback. By default, records are returned
 *     in alphabetical order by name, but optional arguments allow you to
 *     specify a database index, a key range, and a sort direction.
 *
 * - cancelEnumeration(): stops an enumeration in progress. Pass the object
 *     returned by enumerate().
 *
 * - getFile(): given a filename and a callback, this method looks up the
 *     named file in DeviceStorage and passes it (a Blob) to the callback.
 *     An error callback is available as an optional third argument.
 *
 * - getFileInfo(): given a filename and a callback, this method looks up
 *     the database record for that file and passes it to the callback. If
 *     no such record exists and an error callback was passed as the 3rd
 *     argument, then an error message is passed to that error callback.
 *     Note that unlike getFile() this method does not return file content.
 *
 * - count(): count the number of records in the database and pass the value
 *     to the specified callback. Like enumerate(), this method allows you
 *     to specify the name of an index and a key range if you only want to
 *     count some of the records.
 *
 * - updateMetadata(): updates the metadata associated with a named file
 *
 * - addFile(): given a filename and a blob this method saves the blob as a
 *     named file to device storage.
 *
 * - deleteFile(): deletes the named file from device storage and the database
 *
 * - close(): closes the IndexedDB connections and stops listening to
 *     DeviceStorage events. This permanently puts the MediaDB object into
 *     the MediaDB.CLOSED state in which it is unusable.
 *
 * - freeSpace(): call the DeviceStorage freeSpace() method and pass the
 *     result to the specified callback
 */
(function (exports) { // eslint-disable-line
  function MediaDB(mediaType, metadataParser, options) {
    this.mediaType = mediaType;
    this.metadataParser = metadataParser;
    if (!options) {
      options = {};
    }
    this.indexes = options.indexes || [];
    this.version = options.version || 1;
    this.mimeTypes = options.mimeTypes;
    this.autoscan = options.autoscan !== undefined ? options.autoscan : true;
    this.state = MediaDB.OPENING;
    this.scanning = false; // Becomes true while scanning
    this.parsingBigFiles = false;
    this.errorLength = 0;
    this.filesLength = 0;
    this.stopScanning = false;
    // These are for data upgrade from the client.
    this.updateRecord = options.updateRecord;
    this.reparsedRecord = options.reparsedRecord;
    if (options.excludeFilter && options.excludeFilter instanceof RegExp) {
      // Only regular expression object is accepted.
      this.clientExcludeFilter = options.excludeFilter;
    }
    /**
     * While scanning, we attempt to send change events in batches.
     * After finding a new or deleted file, we 'll wait this long before
     * sending events in case we find another new or deleted file right away.
     */

    this.batchHoldTime = options.batchHoldTime || 100;
    /**
     * But we'll send a batch of changes right away if it gets this big
     * A batch size of 0 means no maximum batch size
     */
    this.batchSize = options.batchSize || 0;
    this.dbname = `MediaDB/${this.mediaType}/`;
    // Private implementation details in this object
    this.details = {
      eventListeners: {},
      pendingInsertions: [], // Array of filenames to insert
      pendingDeletions: [], // Array of filenames to remove
      whenDoneProcessing: [], // Functions to run when queue is empty
      pendingCreateNotifications: [], // Array of fileinfo objects
      pendingDeleteNotifications: [], // Ditto
      pendingNotificationTimer: null,
      newestFileModTime: 0
    };
    const media = this;
    // Define a dummy metadata parser if we're not given one
    if (!this.metadataParser) {
      this.metadataParser = (file, handle) => {
        setTimeout(() => {
          handle({});
        }, 0);
      };
    }
    /**
     * Open the database
     * Note that the user can upgrade the version and we can upgrade the version
     * DB Version is a 32bits unsigned short: upper 16bits is client app db
     * number, lower 16bits is MediaDB version number.
     */
    const dbVersion = (0xFFFF & this.version) << 16 | (0xFFFF & MediaDB.VERSION); // eslint-disable-line
    const openRequest = indexedDB.open(this.dbname, dbVersion);
    // This should never happen for Gaia apps
    openRequest.onerror = () => {
      dispatchEvent(this, 'openMediaDBFail');
      console.error('MediaDB():', openRequest.error.name);
    };
    // This should never happen for Gaia apps
    openRequest.onblocked = () => {
      console.error('indexedDB.open() is blocked in MediaDB()');
    };
    // This is where we create (or delete and recreate) the database
    openRequest.onupgradeneeded = e => {
      const db = openRequest.result;
      // Read transaction from event for data manipulation (read/write).
      const { transaction } = e.target;
      const { oldVersion } = e;
      // Translate to db version and client version.
      let oldDbVersion = 0xFFFF & oldVersion; // eslint-disable-line
      let oldClientVersion = 0xFFFF & (oldVersion >> 16); // eslint-disable-line
      /*
       * If client version is 0, oldVersion is the version number prior to
       * bug 891797. The MediaDB.VERSION may be 2, and other parts is client
       * version.
       */
      if (oldClientVersion === 0) {
        oldDbVersion = 2;
        oldClientVersion = oldVersion / oldDbVersion;
      }
      if (0 === db.objectStoreNames.length) {
        /*
         * No objectstore found. It is the first time use MediaDB, we need to
         * create it.
         */
        createObjectStores(db);
      } else {
        /*
         * ObjectStore found, we need to upgrade data for both client upgrade
         * and mediadb upgrade.
         */
        handleUpgrade(db, transaction, oldDbVersion, oldClientVersion);
      }
    };

    // This is called when we've got the database open and ready.
    openRequest.onsuccess = () => {
      media.db = openRequest.result;
      // Log any errors that propagate up to here
      media.db.onerror = event => {
        console.error(
          'MediaDB: ',
          event.target.error && event.target.error.name
        );
      };
      /*
       * At this point, the db is open and can be queried. We have not
       * checked device storage yet, so we are not fully ready, but apps
       * that need to enumerate existing files before scanning for new files
       * can start that enumeration now.
       */
      changeState(media, MediaDB.ENUMERABLE);
      // Query the db to find the modification time of the newest file
      const cursorRequest = media.db
        .transaction('files', 'readonly')
        .objectStore('files')
        .index('date')
        .openCursor(null, 'prev');
      cursorRequest.onerror = () => {
        /*
         * If anything goes wrong just display an error.
         * If this fails, don't even attempt error recovery
         */
        console.error('MediaDB initialization error', cursorRequest.error);
      };
      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (cursor) {
          media.details.newestFileModTime = cursor.value.date;
        } else {
          // No files in the db yet, so use a really old time
          media.details.newestFileModTime = 0;
        }
        /*
         * The DB is initialized, and we've got our mod time
         * so move on and initialize device storage
         */
        initDeviceStorage();
      };
    };

    // Helper function to create all indexes
    function createObjectStores(db) {
      // Now build the database
      const filestore = db.createObjectStore('files', {
        keyPath: 'name'
      });
      // Always index the files by modification date
      filestore.createIndex('date', 'date');
      /*
       * And index them by any other file properties or metadata properties
       * passed to the constructor
       */
      media.indexes.forEach(indexName => {
        // Don't recreate indexes we've already got
        if (indexName === 'name' || indexName === 'date') {
          return;
        }
        // The index name is also the keypath
        filestore.createIndex(indexName, indexName);
      });
    }

    /*
     * Helper function to list all files and invoke callback with db, trans,
     * dbFiles, db version, client version as arguments.
     */
    function enumerateOldFiles(store, enumerateDone) {
      const openCursorReq = store.openCursor();
      openCursorReq.onsuccess = () => {
        const cursor = openCursorReq.result;
        if (cursor) {
          enumerateDone(cursor.value);
          cursor.continue();
        }
      };
    }

    function handleUpgrade(db, trans, oldDbVersion, oldClientVersion) { // eslint-disable-line
      // Change state to upgrading that client apps may use it.
      media.state = MediaDB.UPGRADING;
      const evtDetail = {
        oldMediaDBVersion: oldDbVersion,
        oldClientVersion,
        newMediaDBVersion: MediaDB.VERSION,
        newClientVersion: media.version
      };
      // Send upgrading event
      dispatchEvent(media, 'upgrading', evtDetail);
      // The upgrade contains upgrading indexes and upgrading data.
      const store = trans.objectStore('files');
      // Part 1: upgrading indexes
      if (media.version !== oldClientVersion) {
        // Upgrade indexes changes from client app.
        upgradeIndexesChanges(store);
      }
      const clientUpgradeNeeded =
        media.version !== oldClientVersion && media.updateRecord;
      /*
       * Checking if we need to enumerate all files. This may improve the
       * performance of only changing indexes. If client app changes indexes,
       * they may not need to update records. In this case, we don't need to
       * enumerate all files.
       */
      if (
        (2 !== oldDbVersion || 3 !== MediaDB.VERSION) &&
        !clientUpgradeNeeded
      ) {
        return;
      }
      // Part 2: upgrading data
      enumerateOldFiles(store, dbFile => {
        // Handle mediadb upgrade from 2 to 3
        if (2 === oldDbVersion && 3 === MediaDB.VERSION) {
          upgradeDBVer2to3(store, dbFile);
        }
        // Handle client upgrade
        if (clientUpgradeNeeded) {
          handleClientUpgrade(store, dbFile, oldClientVersion);
        }
      });
    }

    function upgradeIndexesChanges(store) {
      const dbIndexes = store.indexNames; // Note: it is DOMStringList not array.
      const clientIndexes = media.indexes;
      for (let i = 0; i < dbIndexes.length; i++) {
        // Indexes provided by mediadb, can't remove it.
        if ('name' === dbIndexes[i] || 'date' === dbIndexes[i]) {
          continue; // eslint-disable-line
        }
        if (clientIndexes.indexOf(dbIndexes[i]) < 0) {
          store.deleteIndex(dbIndexes[i]);
        }
      }
      for (let i = 0; i < clientIndexes.length; i++) {
        if (!dbIndexes.contains(clientIndexes[i])) {
          store.createIndex(clientIndexes[i], clientIndexes[i]);
        }
      }
    }

    function upgradeDBVer2to3(store, dbFile) {
      // If record is already starting with '/', don't update them.
      if (dbFile.name[0] === '/') {
        return;
      }
      store.delete(dbFile.name);
      dbFile.name = `/sdcard/${dbFile.name}`;
      store.add(dbFile);
    }

    function handleClientUpgrade(store, dbFile, oldClientVersion) {
      try {
        dbFile.metadata = media.updateRecord(
          dbFile,
          oldClientVersion,
          media.version
        );
        if (dbFile.needsReparse && !media.reparsedRecord) {
          console.warn(
            'client app requested reparse, but no reparsedRecord was set'
          );
          delete dbFile.needsReparse;
        }
        store.put(dbFile);
      } catch (ex) {
        // Discard client upgrade error, client app should handle it.
        console.warn(
          `client app updates record, ${dbFile.name}, failed: ${ex.message}`
        );
      }
    }

    function initDeviceStorage() {
      const { details } = media;
      /*
       * Get the individual device storage objects, so that we can listen
       * for events on the different volumes separately.
       */
      details.storages = navigator.b2g.getDeviceStorages(mediaType);
      details.availability = {};
      /*
       * Start off by getting the initial availablility of the storage areas
       * This is an async function that will call the next initialization
       * step when it is done.
       */
      getStorageAvailability();

      // This is an asynchronous step in the db initialization process
      function getStorageAvailability() {
        let next = 0;
        getNextAvailability();

        function getNextAvailability() {
          if (next >= details.storages.length) {
            /*
             * We've gotten the availability of all storage areas, so
             * move on to the next step.
             */
            setupHandlers();
            return;
          }
          const s = details.storages[next++];
          const name = s.storageName;
          const req = s.available();
          req.onsuccess = () => {
            details.availability[name] = req.result;
            getNextAvailability();
          };
          req.onerror = () => {
            details.availability[name] = 'unavailable';
            getNextAvailability();
          };
        }
      }

      function setupHandlers() {
        /*
         * Now that we know the state of all of the storage areas, register
         * an event listener to monitor changes to that state.
         */
        for (let i = 0; i < details.storages.length; i++) {
          details.storages[i].addEventListener('change', changeHandler);
        }
        // Remember the listener so we can remove it in stop()
        details.dsEventListener = changeHandler;
        // Move on to the next step
        sendInitialEvent();
      }

      function sendInitialEvent() {
        // Get our current state based on the device storage availability
        const state = getState(details.availability);
        // Switch to that state and send an appropriate event
        changeState(media, state);
        // If the state is ready, and we're auto scanning then start a scan
        if (media.autoscan) {
          scanFiles(media);
        }
      }

      /*
       * Given a storage name -> availability map figure out what state
       * the mediadb object should be in
       */
      function getState(availability) {
        let n = 0; // Total number of storages
        let u = 0; // # that are unavailable
        let s = 0; // # that are shared
        for (let name in availability) { // eslint-disable-line
          n++;
          switch (availability[name]) {
            case 'unavailable':
              u++;
              break;
            case 'shared':
              s++;
              break;
            default:
              break;
          }
        }
        /*
         * If any volume is shared, then behave as if they are all shared
         * and make the entire MediaDB shared. This is because shared volumes
         * are generally shared transiently and most files on the volume will
         * probably still be there when the volume comes back. If we want to
         * keep the MediaDB available while one volume is shared we have to
         * rescan and discard all the files on the shared volume, which means
         * it will take much longer to recover when the volume comes back. So
         * it is better to just act as if all volumes are shared together
         */
        if (s > 0) {
          return MediaDB.UNMOUNTED;
        }
        // If all volumes are unavailable, then MediaDB is unavailable
        if (u === n) {
          return MediaDB.NOCARD;
        }
        /*
         * Otherwise, there is at least one available volume, so MediaDB
         * is available.
         */
        return MediaDB.READY;
      }

      function changeHandler(e) {
        switch (e.reason) {
          case 'modified':
          case 'deleted':
            fileChangeHandler(e);
            break;
          case 'available':
          case 'unavailable':
          case 'shared':
            volumeChangeHandler(e);
            break;
          default:
            break;
        }
      }

      function volumeChangeHandler(e) {
        const { storageName } = e.target;
        // If nothing changed, ignore this event
        if (details.availability[storageName] === e.reason) {
          return;
        }
        const oldState = media.state;
        // Record the new availability of the volume that changed.
        details.availability[storageName] = e.reason;
        // And figure out what our new state is
        const newState = getState(details.availability);
        // If the state changed, send out an event about it
        if (newState !== oldState) {
          changeState(media, newState);
          // Start scanning if we're available, and cancel scanning otherwise
          if (newState === MediaDB.READY) {
            if (media.autoscan) {
              scanFiles(media);
            }
          } else {
            endscan(media);
          }
        } else if (newState === MediaDB.READY) {
          if (e.reason === 'available') {
            dispatchEvent(media, 'ready');
            if (media.autoscan) {
              scanFiles(media);
            }
          } else if (e.reason === 'unavailable') {
            dispatchEvent(media, 'cardremoved');
            deleteAllFiles(storageName);
          }
        }
      }

      function fileChangeHandler(e) {
        const filename = e.path;
        if (ignoreName(media, filename)) {
          return;
        }
        /*
         * InsertRecord and deleteRecord will send events to the client once
         * the db has been updated.
         */
        if (e.reason === 'modified') {
          insertRecord(media, filename);
        } else {
          deleteRecord(media, filename);
        }
      }

      /*
       * Enumerate all entries in the DB and call deleteRecord for any whose
       * filename begins with the specified storageName
       */
      function deleteAllFiles(storageName) {
        const storagePrefix = storageName ? `/${storageName}/` : '';
        const store = media.db.transaction('files').objectStore('files');
        const cursorRequest = store.openCursor();
        cursorRequest.onsuccess = () => {
          const cursor = cursorRequest.result;
          if (cursor) {
            if (cursor.value.name.startsWith(storagePrefix)) {
              deleteRecord(media, cursor.value.name);
            }
            cursor.continue();
          }
        };
      }
    }
  }

  MediaDB.prototype = {
    close: function close() {
      this.db.close();
      for (let i = 0; i < this.details.storages.length; i++) {
        const s = this.details.storages[i];
        s.removeEventListener('change', this.details.dsEventListener);
      }
      changeState(this, MediaDB.CLOSED);
    },

    addEventListener: function addEventListener(type, listener) {
      const hasProperty = Object.prototype.hasOwnProperty.call(
        this.details.eventListeners,
        type
      );
      if (!hasProperty) {
        this.details.eventListeners[type] = [];
      }
      const listeners = this.details.eventListeners[type];
      if (listeners.indexOf(listener) !== -1) {
        return;
      }
      listeners.push(listener);
    },

    removeEventListener: function removeEventListener(type, listener) {
      const hasProperty = Object.prototype.hasOwnProperty.call(
        this.details.eventListeners,
        type
      );
      if (!hasProperty) {
        return;
      }
      const listeners = this.details.eventListeners[type];
      const position = listeners.indexOf(listener);
      if (position === -1) {
        return;
      }
      listeners.splice(position, 1);
    },

    /*
     * Look up the database record for the specfied filename and pass it
     * to the specified callback.
     */
    getFileInfo: function getFileInfo(filename, getSuccess, getError) {
      if (this.state === MediaDB.OPENING) {
        throw Error(`MediaDB is not ready. State: ${this.state}`);
      }
      // First, look up the fileinfo record in the db
      const read = this.db
        .transaction('files', 'readonly')
        .objectStore('files')
        .get(filename);
      read.onerror = () => {
        const msg = `MediaDB.getFileInfo: unknown filename: ${filename}`;
        if (getError) {
          getError(msg);
        } else {
          console.error(msg);
        }
      };
      read.onsuccess = () => {
        if (getSuccess) {
          getSuccess(read.result);
        }
      };
    },

    /*
     * Look up the specified filename in DeviceStorage and pass the
     * resulting File object to the specified callback.
     */
    getFile: function getFile(filename, getSuccess, getError) {
      if (this.state !== MediaDB.READY && this.state !== MediaDB.ENUMERABLE) {
        throw Error(`MediaDB is not ready. State: ${this.state}`);
      }
      const storage = navigator.b2g.getDeviceStorage(this.mediaType);
      const getRequest = storage.get(filename);
      getRequest.onsuccess = () => {
        getSuccess(getRequest.result);
      };
      getRequest.onerror = () => {
        const errmsg = getRequest.error && getRequest.error.name;
        if (getError) {
          getError(errmsg);
        } else {
          console.error('MediaDB.getFile:', errmsg);
        }
      };
    },

    /*
     * Delete the named file from device storage.
     * This will cause a device storage change event, which will cause
     * mediadb to remove the file from the database and send out a
     * mediadb change event, which will notify the application UI.
     */
    deleteFile: function deleteFile(filename, deleteSuccess) {
      if (this.state !== MediaDB.READY) {
        throw Error(`MediaDB is not ready. State: ${this.state}`);
      }
      const storage = navigator.b2g.getDeviceStorage(this.mediaType);
      const req = storage.delete(filename);
      req.onerror = e => {
        console.error(
          'MediaDB.deleteFile(): Failed to delete',
          filename,
          'from DeviceStorage:',
          e.target.error
        );
      };
      req.onsuccess = () => {
        if (deleteSuccess) {
          deleteSuccess();
        }
      };
    },

    /*
     *
     * Save the specified blob to device storage, using the specified filename.
     * This will cause device storage to send us an event, and that event
     * will cause mediadb to add the file to its database, and that will
     * send out a mediadb event to the application UI.
     *
     */
    addFile: function addFile( // eslint-disable-line
      filename,
      file,
      addSuccess,
      addError
    ) {
      if (this.state !== MediaDB.READY) {
        throw Error(`MediaDB is not ready. State: ${this.state}`);
      }
      const storage = navigator.b2g.getDeviceStorage(this.mediaType);
      const deletereq = storage.delete(filename);
      deletereq.onsuccess = save;
      deletereq.onerror = save;

      function save() {
        const request = storage.addNamed(file, filename);
        request.onsuccess = () => {
          if (addSuccess) {
            addSuccess();
          }
        };
        request.onerror = () => {
          if (addError) {
            addError();
          }
          console.error(
            'MediaDB: Failed to store',
            filename,
            'in DeviceStorage:',
            request.error
          );
        };
      }
    },

    /*
     *
     * Append the blob to device storage, using the specified filename.
     * This will cause device storage to send us an event, and that event
     * will cause mediadb to add the file to its database, and that will
     * send out a mediadb event to the application UI.
     *
     */
    appendFile: function appendFile( // eslint-disable-line
      filename,
      file,
      appendSuccess,
      appendError
    ) {
      if (this.state !== MediaDB.READY) {
        throw Error(`MediaDB is not ready. State: ${this.state}`);
      }
      const storage = navigator.b2g.getDeviceStorage(this.mediaType);
      const request = storage.appendNamed(file, filename);
      request.onsuccess = () => {
        if (appendSuccess) {
          appendSuccess();
        }
      };
      request.onerror = () => {
        if (appendError) {
          appendError();
        }
        console.error(
          'MediaDB: Failed to store',
          filename,
          'in DeviceStorage:',
          request.error
        );
      };
    },

    /*
     * Look up the database record for the named file, and copy the properties
     * of the metadata object into the file's metadata, and then write the
     * updated record back to the database. The third argument is optional. If
     * you pass a function, it will be called when the metadata is written.
     */
    updateMetadata: function updateMetadata(filename, metadata, updateSuccess) {
      if (this.state === MediaDB.OPENING) {
        throw Error(`MediaDB is not ready. State: ${this.state}`);
      }
      // First, look up the fileinfo record in the db
      const read = this.db
        .transaction('files', 'readonly')
        .objectStore('files')
        .get(filename);
      read.onerror = () => {
        console.error('MediaDB.updateMetadata called with unknown filename');
      };
      read.onsuccess = () => {
        let fileinfo = {};
        if (read.result) {
          fileinfo = read.result;
        } else {
          fileinfo.metadata = {};
        }
        Object.keys(metadata).forEach(key => {
          fileinfo.metadata[key] = metadata[key];
        });
        const write = this.db
          .transaction('files', 'readwrite')
          .objectStore('files')
          .put(fileinfo);
        write.onerror = () => {
          console.error(
            'MediaDB.updateMetadata: database write failed',
            write.error && write.error.name
          );
        };
        write.onsuccess = () => {
          if (updateSuccess) {
            updateSuccess();
          }
        };
      };
    },

    /*
     * Count the number of records in the database and pass that number to the
     * specified callback. key is 'name', 'date' or one of the index names
     * passed to the constructor. range is be an IDBKeyRange that defines a
     * the range of key values to count.  key and range are optional
     * arguments.  If one argument is passed, it is the callback. If two
     * arguments are passed, they are assumed to be the range and callback.
     */
    count: function count(key, range, countSuccess) {
      if (this.state !== MediaDB.READY && this.state !== MediaDB.ENUMERABLE) {
        throw Error(`MediaDB is not ready or enumerable. State: ${this.state}`);
      }
      if (arguments.length === 1) {
        countSuccess = key;
        range = undefined;
        key = undefined;
      } else if (arguments.length === 2) {
        countSuccess = range;
        range = key;
        key = undefined;
      }
      let store = this.db.transaction('files').objectStore('files');
      if (key && key !== 'name') {
        store = store.index(key);
      }
      const countRequest = store.count(range || null);
      countRequest.onerror = () => {
        console.error('MediaDB.count() failed with', countRequest.error);
      };
      countRequest.onsuccess = e => {
        countSuccess(e.target.result);
      };
    },

    /*
     * Enumerate all files in the filesystem, sorting by the specified
     * property (which must be one of the indexes, or null for the filename).
     * Direction is ascending or descending. Use whatever string
     * constant IndexedDB uses.  f is the function to pass each record to.
     *
     * Each record is an object like this:
     *
     * {
     *    // The basic fields are all from the File object
     *    name: // the filename
     *    type: // the file type
     *    size: // the file size
     *    date: // file mod time
     *    metadata: // whatever object the metadata parser returns
     * }
     *
     * This method returns an object that you can pass to cancelEnumeration()
     * to cancel an enumeration in progress. You can use the state property
     * of the returned object to find out the state of the enumeration. It
     * should be one of the strings 'enumerating', 'complete', 'cancelling'
     * 'cancelled', or 'error'
     *
     */
    enumerate: function enumerate( // eslint-disable-line
      key,
      range,
      direction,
      enumerateDone
    ) {
      if (this.state !== MediaDB.READY && this.state !== MediaDB.ENUMERABLE) {
        throw Error(`MediaDB is not ready or enumerable. State: ${this.state}`);
      }
      const handle = {
        state: 'enumerating'
      };
      if (arguments.length === 1) {
        enumerateDone = key;
        key = undefined;
      } else if (arguments.length === 2) {
        enumerateDone = range;
        range = undefined;
      } else if (arguments.length === 3) {
        enumerateDone = direction;
        direction = undefined;
      }
      let store = this.db.transaction('files').objectStore('files');
      if (key && key !== 'name') {
        store = store.index(key);
      }
      const cursorRequest = store.openCursor(
        range || null,
        direction || 'next'
      );
      cursorRequest.onerror = () => {
        console.error('MediaDB.enumerate() failed with', cursorRequest.error);
        handle.state = 'error';
      };
      cursorRequest.onsuccess = () => {
        if (handle.state === 'cancelling') {
          handle.state = 'cancelled';
          return;
        }
        const cursor = cursorRequest.result;
        if (cursor) {
          try {
            const fileinfo = cursor.value;
            if (!fileinfo.fail) {
              enumerateDone(fileinfo);
            }
          } catch (e) {
            console.warn('MediaDB.enumerate(): callback threw', e, e.stack);
          }
          cursor.continue();
        } else {
          handle.state = 'complete';
          enumerateDone(null);
        }
      };
      return handle;
    },

    /*
     * Basically this function is a variation of enumerate(), since retrieving
     * a large number of records from indexedDB takes some time and if the
     * enumeration is cancelled, people can use this function to resume getting
     * the rest records by providing an index where it was stopped.
     * Also, if you want to get just one record, just give the target index and
     * the first returned record is the record you want, remember to call
     * cancelEnumeration() immediately after you got the record.
     * All the arguments are required because this function is for advancing
     * enumeration, people who use this function should already have all the
     * arguments, and pass them again to get the target records from the index.
     */
    advancedEnumerate: function advancedEnumerate( // eslint-disable-line
      key,
      range,
      direction,
      index,
      enumerateDone
    ) {
      if (this.state !== MediaDB.READY) {
        throw Error(`MediaDB is not ready. State: ${this.state}`);
      }
      const handle = {
        state: 'enumerating'
      };
      let store = this.db.transaction('files').objectStore('files');
      if (key && key !== 'name') {
        store = store.index(key);
      }
      const cursorRequest = store.openCursor(
        range || null,
        direction || 'next'
      );
      let isTarget = false;
      cursorRequest.onerror = () => {
        console.error('MediaDB.enumerate() failed with', cursorRequest.error);
        handle.state = 'error';
      };
      cursorRequest.onsuccess = () => {
        if (handle.state === 'cancelling') {
          handle.state = 'cancelled';
          return;
        }
        const cursor = cursorRequest.result;
        if (cursor) {
          try {
            if (index === 0) {
              isTarget = true;
            }
            const fileinfo = cursor.value;
            if (!fileinfo.fail && isTarget) {
              enumerateDone(cursor.value);
              cursor.continue();
            } else {
              cursor.advance(index);
              isTarget = true;
            }
          } catch (e) {
            console.warn('MediaDB.enumerate(): callback threw', e, e.stack);
          }
        } else {
          handle.state = 'complete';
          enumerateDone(null);
        }
      };
      return handle;
    },

    /*
     * This method takes the same arguments as enumerate(), but batches
     * the results into an array and passes them to the callback all at
     * once when the enumeration is complete. It uses enumerate() so it
     * is no faster than that method, but may be more convenient.
     */
    enumerateAll: function enumerateAll( // eslint-disable-line
      key,
      range,
      direction,
      enumerateDone
    ) {
      const batch = [];
      if (arguments.length === 1) {
        enumerateDone = key;
        key = undefined;
      } else if (arguments.length === 2) {
        enumerateDone = range;
        range = undefined;
      } else if (arguments.length === 3) {
        enumerateDone = direction;
        direction = undefined;
      }
      return this.enumerate(key, range, direction, fileinfo => {
        if (fileinfo) {
          batch.push(fileinfo);
        } else {
          enumerateDone(batch);
        }
      });
    },

    /*
     * Cancel a pending enumeration. After calling this the callback for
     * the specified enumeration will not be invoked again.
     */
    cancelEnumeration: function cancelEnumeration(handle) {
      if (handle.state === 'enumerating') {
        handle.state = 'cancelling';
      }
    },

    /*
     * Use the non-standard mozGetAll() function to return all of the
     * records in the database in one big batch. The records will be
     * sorted by filename
     */
    getAll: function getAll(getAllDone) {
      if (this.state !== MediaDB.READY && this.state !== MediaDB.ENUMERABLE) {
        throw Error(`MediaDB is not ready or enumerable. State: ${this.state}`);
      }
      const store = this.db.transaction('files').objectStore('files');
      const request = store.mozGetAll();
      request.onerror = () => {
        console.error('MediaDB.getAll() failed with', request.error);
      };
      request.onsuccess = () => {
        const all = request.result;
        const good = all.filter(fileinfo => {
          return !fileinfo.fail;
        });
        getAllDone(good);
      };
    },

    /*
     * Scan for new or deleted files.
     * This is only necessary if you have explicitly disabled automatic
     * scanning by setting autoscan:false in the options object.
     */
    scan: function scan() {
      scanFiles(this);
    },

    stopScan: function stopScan() {
      if (this.scanning) {
        this.stopScanning = true;
      }
    },

    /*
     * Use the device storage freeSpace() method and pass the returned
     * value to the callback.
     */
    freeSpace: function freeSpace(freeSpaceHandle) {
      if (this.state !== MediaDB.READY) {
        throw Error(`MediaDB is not ready. State: ${this.state}`);
      }
      const storage = navigator.b2g.getDeviceStorage(this.mediaType);
      const freeReq = storage.freeSpace();
      freeReq.onsuccess = () => {
        freeSpaceHandle(freeReq.result);
      };
    }
  };

  /*
   * This is the version number of the MediaDB schema. If we change this
   * number it will cause existing data stores to be deleted and rebuilt,
   * which is useful when the schema changes. Note that the user can also
   * upgrade the version number with an option to the MediaDB constructor.
   * The final indexedDB version number we use is the product of our version
   * and the user's version.
   * Version 2: We modified the default schema to include an index for file
   *            modification date.
   * Version 3: DeviceStorage had changed the file path from relative path(v1)
   *            to full qualified name(v1.1). We changed the code to handle the
   *            full qualified name and the upgrade from relative path to full
   *            qualified name.
   */
  MediaDB.VERSION = 3;

  /*
   * These are the values of the state property of a MediaDB object
   * The NOCARD, UNMOUNTED, and CLOSED values are also used as the detail
   * property of 'unavailable' events
   */
  MediaDB.OPENING = 'opening'; // MediaDB is initializing itself
  MediaDB.UPGRADING = 'upgrading'; // MediaDB is upgrading database
  MediaDB.ENUMERABLE = 'enumerable'; // Not fully ready, but can be enumerated
  MediaDB.READY = 'ready'; // MediaDB is available and ready for use
  MediaDB.NOCARD = 'nocard'; // Unavailable because there is no sd card
  MediaDB.UNMOUNTED = 'unmounted'; // Unavailable because card unmounted
  MediaDB.CLOSED = 'closed'; // Unavailable because MediaDB has closed

  /* Details of helper functions follow */

  /*
   *
   * Return true if media db should ignore this file.
   *
   * If any components of the path begin with a . we'll ignore the file.
   * The '.' prefix indicates hidden files and directories on Unix and
   * when files are "moved to trash" during a USB Mass Storage session they
   * are sometimes not actually deleted, but moved to a hidden directory.
   *
   * If an array of media types was specified when the MediaDB was created
   * and the type of this file is not a member of that list, then ignore it.
   *
   */
  function ignore(media, file) {
    if (ignoreName(media, file.name)) {
      return true;
    }
    if (media.mimeTypes && media.mimeTypes.indexOf(file.type) === -1) {
      return true;
    }
    return false;
  }

  /*
   * Test whether this filename is one we ignore.
   * This is a separate function because device storage change events
   * give us a name only, not the file object.
   * Ignore files having directories beginning with .
   * Bug https://bugzilla.mozilla.org/show_bug.cgi?id=838179
   */
  function ignoreName(media, filename) {
    if (
      media.clientExcludeFilter &&
      !media.clientExcludeFilter.test(filename)
    ) {
      return true;
    }
    const path = filename.substring(0, filename.lastIndexOf('/') + 1);
    return path[0] === '.' || path.indexOf('/.') !== -1;
  }

  /*
   * Tell the db to start a manual scan. I think we don't do
   * this automatically from the constructor, but most apps will start
   * a scan right after calling the constructor and then will proceed to
   * enumerate what is already in the db. If scan performance is bad
   * for large media collections, apps can just have the user specify
   * when to rescan rather than doing it automatically. Until we have
   * change event notifications, gaia apps might want to do a scan
   * every time they are made visible.
   *
   * Filesystem changes discovered by a scan are generally
   * batched. If a scan discovers 10 new files, the information
   * about those files will generally be passed as an array to a the
   * onchange handler rather than calling that handler once for each
   * newly discovered file.  Apps can decide whether to handle
   * batches by processing each element individually or by just starting
   * fresh with a new call to enumerate().
   *
   * Scan details are not tightly specified, but the goal is to be
   * as efficient as possible.  We'll try to do a quick date-based
   * scan to look for new files and report those first. Following
   * that, a full scan will be compared with a full dump of the DB
   * to see if any files have been deleted.
   *
   */
  function scanFiles(media) {
    /*
     * In case phone does not have its own storage
     * end scan and dispatch a nocard event
     */
    if (media.details.storages.length < 1) {
      console.warn('MediaDB: No media storage, quit scanning');
      dispatchEvent(media, 'nomediastorage');
      return;
    }
    media.scanning = true;
    dispatchEvent(media, 'scanstart');
    /*
     * First, scan for new files since the last scan, if there was one
     * When the quickScan is done it will begin a full scan.  If we don't
     * have a last scan date, then the database is empty and we don't
     * have to do a full scan, since there will be no changes or deletions.
     */
    quickScan(media.details.newestFileModTime);
    // Do a quick scan and then follow with a full scan
    function quickScan(timestamp) {
      let options = null;
      media.details.containsData = false;
      if (timestamp > 0) {
        media.details.firstscan = false;
        options = {
          since: new Date(timestamp + 1) // Add 1 so we don't find the same newest file again
        };
      } else {
        /*
         * If there is no timestamp then this is the first time we've
         * scanned and we don't have any files in the database, which
         * allows important optimizations during the scanning process
         */
        media.details.firstscan = true;
        media.details.records = [];
        options = {};
      }
      scanDS(media.details.storages, null, options)
        .then(processFiles)
        .catch(handleScanError);

      function processFiles(files) {
        if (!media.scanning) {
          return;
        }
        files = files.sort((a, b) => {
          return b.lastModified - a.lastModified;
        });
        media.filesLength = files.length;
        for (let i = 0; i < files.length; i++) {
          insertRecord(media, files[i]);
        }
        whenDoneProcessing(media, () => {
          sendNotifications(media);
          if (media.details.firstscan) {
            endscan(media); // If this was the first scan, then we're done
          } else {
            fullScan();
          }
        });
      }

      function handleScanError(error) {
        console.warn('Error while scanning', error);
        endscan(media);
      }
    }

    /*
     * Get a complete list of files from DeviceStorage
     * Get a complete list of files from IndexedDB.
     * Sort them both (the indexedDB list will already be sorted)
     * Step through the lists noting deleted files and created files.
     * Pay attention to files whose size or date has changed and
     * treat those as deletions followed by insertions.
     * Sync up the database while stepping through the lists.
     */
    function fullScan() {
      if (media.state !== MediaDB.READY) {
        endscan(media);
        return;
      }
      scanDS(media.details.storages)
        .then(files => getDBFiles(files))
        .catch(error => {
          console.warn('Error while scanning', error);
          endscan(media);
        });

      function getDBFiles(dsFiles) {
        const store = media.db.transaction('files').objectStore('files');
        const getAllRequest = store.mozGetAll();
        getAllRequest.onsuccess = () => {
          if (media.scanning) {
            compareLists(getAllRequest.result, dsFiles);
          }
        };
      }

      function compareLists(dbFiles, dsFiles) {
        dsFiles.sort((a, b) => {
          if (a.name < b.name) {
            return -1;
          }
          return 1;
        });
        // Loop through both the dsFiles and dbFiles lists
        let dsIndex = 0;
        let dbIndex = 0;
        while (true) { // eslint-disable-line
          // Get the next DeviceStorage file or null
          let dsFile = null;
          if (dsIndex < dsFiles.length) {
            dsFile = dsFiles[dsIndex];
          } else {
            dsFile = null;
          }
          // Get the next DB file or null
          let dbFile = null;
          if (dbIndex < dbFiles.length) {
            dbFile = dbFiles[dbIndex];
          } else {
            dbFile = null;
          }
          // Case 1: both files are null.  If so, we're done.
          if (!dsFile && !dbFile) {
            break;
          }
          /*
           * Case 2: no more files in the db.  This means that
           * the file from ds is a new one
           */
          if (!dbFile) {
            insertRecord(media, dsFile);
            dsIndex++;
            continue; // eslint-disable-line
          }
          /*
           * Case 3: no more files in ds. This means that the db file
           * has been deleted
           */
          if (!dsFile) {
            deleteRecord(media, dbFile.name);
            dbIndex++;
            continue; // eslint-disable-line
          }
          /*
           * Case 4: two files with the same name.
           * 4a: date or size has changed: it is both a deletion and a creation
           * 4b: dbFile needs reparse: it is both a deletion and an update
           * 4c: date and size are the same for both, and no reparse needed:
           *     do nothing
           */
          if (dsFile.name === dbFile.name) {
            /*
             * In release 1.3 and before files reported local times, and in 1.4
             * and later they report UTC times. If the user has upgraded from
             * 1.3 to 1.4 they may have files in the db whose times are in a
             * local timezone. We want to recognize those files as matching
             * existing files so we consider two files to have the same time if
             * they are within +/- 12 hours of each other and if the difference
             * in times is an exactly multiple of 10 minutes. (This assumes all
             * world timezones are exact multiples of 10 minutes.)
             */
            const { lastModified } = dsFile;
            const timeDifference = lastModified - dbFile.date;
            const sameTime =
              timeDifference === 0 ||
              (Math.abs(timeDifference) <= 12 * 60 * 60 * 1000 &&
                (timeDifference % 10) * 60 * 1000 === 0);
            const sameSize = dsFile.size === dbFile.size;
            if (!sameTime || !sameSize) {
              deleteRecord(media, dbFile.name);
              insertRecord(media, dsFile);
            } else if (dbFile.needsReparse) {
              deleteRecord(media, dbFile.name);
              insertRecord(media, dsFile, dbFile.metadata);
            }
            dsIndex++;
            dbIndex++;
            continue; // eslint-disable-line
          }
          /*
           * Case 5: the dsFile name is less than the dbFile name.
           * This means that the dsFile is new.  Like case 2
           */
          if (dsFile.name < dbFile.name) {
            insertRecord(media, dsFile);
            dsIndex++;
            continue; // eslint-disable-line
          }
          /*
           * Case 6: the dsFile name is greater than the dbFile name.
           * this means that the dbFile no longer exists on disk
           */
          if (dsFile.name > dbFile.name) {
            deleteRecord(media, dbFile.name);
            dbIndex++;
            continue; // eslint-disable-line
          }
          console.error('Assertion failed');
        }
        insertRecord(media, null);
      }
    }

    /*
     * A utility function that returns a Promise that resolves to an array
     * of non-ignored File objects on the specified DeviceStorage.
     */
    function scanDS(storage, directory, options) {
      if (Array.isArray(storage)) {
        return Promise.all(
          storage.map(s => scanDS(s, directory, options))
        ).then(arrays => {
          return Array.prototype.concat.apply([], arrays);
        });
      }
      return new Promise((resolve, reject) => {
        const files = [];
        const iterable = storage.enumerate(directory || '', options || {});
        const results = iterable.values();
        async function getAllFiles() {
          for await (let file of results) { // eslint-disable-line
            if (media.stopScanning) {
              media.scanning = false;
              media.stopScanning = false;
              resolve(files);
            }

            if (!ignore(media, file)) {
              files.push(file);
            }
          }
          resolve(files);
        }
        getAllFiles()
          .then(() => console.log('Get All Files'))
          .catch(err => {
            if (err.name === 'NotFoundError') {
              resolve(files);
            } else {
              console.log(`get all files failed: ${err}`);
              reject(err);
            }
          });
      });
    }
  }

  /*
   * Called to send out a scanend event when scanning is done.
   * This event is sent on normal scan termination and also
   * when something goes wrong, such as the device storage being
   * unmounted during a scan.
   */
  function endscan(media) {
    if (media.scanning) {
      media.scanning = false;
      media.parsingBigFiles = false;
      if (media.filesLength > media.errorLength) {
        media.details.containsData = true;
      }
      dispatchEvent(media, 'scanend', {
        containsData: media.details.containsData,
        firstscan: media.details.firstscan
      });
    }
  }

  /*
   * Pass in a file, or a filename.  The function queues it up for
   * metadata parsing and insertion into the database, and will send a
   * mediadb change event (possibly batched with other changes).
   * Ensures that only one file is being parsed at a time, but tries
   * to make as many db changes in one transaction as possible.  The
   * special value null indicates that scanning is complete.
   */
  function insertRecord(media, fileOrName, oldMetadata) {
    const { details } = media;
    // Add this file to the queue of files to process
    details.pendingInsertions.push([fileOrName, oldMetadata]);
    // If the queue is already being processed, just return
    if (details.processingQueue) {
      return;
    }
    // Otherwise, start processing the queue.
    processQueue(media);
  }

  // Delete the database record associated with filename.
  function deleteRecord(media, filename) {
    const { details } = media;
    // Add this file to the queue of files to process
    details.pendingDeletions.push(filename);
    // If there is already a transaction in progress return now.
    if (details.processingQueue) {
      return;
    }
    // Otherwise, start processing the queue
    processQueue(media);
  }

  function whenDoneProcessing(media, f) {
    const { details } = media;
    if (details.processingQueue) {
      details.whenDoneProcessing.push(f);
    } else {
      f();
    }
  }

  function processQueue(media) {
    const { details } = media;
    details.processingQueue = true;
    // Now get one filename off a queue and store it
    startNext();
    /*
     * Take an item from a queue and process it.
     * Deletions are always processed before insertions because we want
     * to clear away non-functional parts of the UI ASAP.
     */
    function startNext() {
      if (details.pendingDeletions.length > 0) {
        deleteFiles();
      } else if (details.pendingInsertions.length > 0) {
        insertFile(...details.pendingInsertions.shift());
      } else {
        details.processingQueue = false;
        if (details.whenDoneProcessing.length > 0) {
          const functions = details.whenDoneProcessing;
          details.whenDoneProcessing = [];
          functions.forEach(f => {
            f();
          });
        }
      }
    }

    // Delete all of the pending files in a single transaction
    function deleteFiles() {
      const transaction = media.db.transaction('files', 'readwrite');
      const store = transaction.objectStore('files');
      deleteNextFile();

      function deleteNextFile() {
        if (details.pendingDeletions.length === 0) {
          startNext();
          return;
        }
        const filename = details.pendingDeletions.shift();
        const request = store.delete(filename);
        request.onerror = () => {
          console.warn(
            'MediaDB: Unknown file in deleteRecord:',
            filename,
            request.error
          );
          deleteNextFile();
        };
        request.onsuccess = () => {
          // We succeeded, so remember to send out an event about it.
          queueDeleteNotification(media, filename);
          deleteNextFile();
        };
      }
    }

    /*
     * Insert a file into the db. One transaction per insertion.
     * The argument f might be a filename or a File object.
     * oldMetadata is the metadata of this file before it was reparsed (or
     * undefined).
     */
    function insertFile(f, oldMetadata) {
      /*
       * Null is a special value pushed on to the queue when a scan()
       * is complete.  We use it to trigger a scanend event
       * after all the change events from the scan are delivered
       */
      if (f === null) {
        sendNotifications(media);
        endscan(media);
        startNext();
        return;
      }

      // If we got a filename, look up the file in device storage
      if (typeof f === 'string') {
        /*
         * Note: Even though we're using the default storage area, if the
         *       filename is fully qualified, it will get redirected to the
         *       appropriate storage area.
         */
        const storage = navigator.b2g.getDeviceStorage(media.mediaType);
        const getReq = storage.get(f);
        getReq.onerror = () => {
          console.warn(
            'MediaDB: Unknown file in insertRecord',
            f,
            getReq.error
          );
          startNext();
        };
        getReq.onsuccess = () => {
          /*
           * We got the filename from a device storage change event and
           * verified that the filename was not one that we wanted to ignore.
           * But until now, we haven't had the file and its type to check
           * against the mimeTypes array. So if necessary we check again.
           * If the file is not one of the types we're interested in we skip
           * it. Otherwise, parse its metadata.
           */
          if (media.mimeTypes && ignore(media, getReq.result)) {
            startNext();
          } else {
            parseMetadata(getReq.result, f, oldMetadata);
          }
        };
      } else {
        parseMetadata(f, f.name, oldMetadata); // Otherwise f is the file we want
      }
    }

    function parseMetadata(file, filename, oldMetadata) {
      if (!file.lastModified) {
        console.warn(
          'MediaDB: parseMetadata: no lastModified for',
          filename,
          'using Date.now() until #793955 is fixed'
        );
      }
      const fileinfo = {
        name: filename, // We can't trust file.name
        type: file.type,
        size: file.size,
        date: file.lastModified ? file.lastModified : Date.now(),
        firstParseTime: file.firstParseTime ? file.firstParseTime : Date.now()
      };
      if (fileinfo.date > details.newestFileModTime) {
        details.newestFileModTime = fileinfo.date;
      }
      // Get metadata about the file
      media.metadataParser(file, gotMetadata, metadataError, parsingBigFile);

      function parsingBigFile() {
        media.parsingBigFiles = true;
      }

      function metadataError(e) {
        media.errorLength += 1;
        console.warn('MediaDB: error parsing metadata for', filename, ':', e);
        /*
         * If we get an error parsing the metadata, assume it is invalid
         * and make a note in the fileinfo record that we store in the database
         * If we don't store it in the database, we'll keep finding it
         * on every scan. But we make sure never to return the invalid file
         * on an enumerate call.
         */
        fileinfo.fail = true;
        storeRecord(fileinfo);
      }

      function gotMetadata(metadata) {
        fileinfo.metadata = metadata;
        if (oldMetadata && media.reparsedRecord) {
          fileinfo.metadata = media.reparsedRecord(oldMetadata, metadata);
        }
        storeRecord(fileinfo);
        if (!media.scanning) {
          media.parsingBigFiles = false;
        }
      }
    }

    function storeRecord(fileinfo) {
      if (media.details.firstscan) {
        /*
         * If this is the first scan then we know this is a new file and
         * we can assume that adding it to the db will succeed.
         * So we can just queue a notification about the new file without
         * waiting for a db operation.
         */
        media.details.records.push(fileinfo);
        if (!fileinfo.fail) {
          queueCreateNotification(media, fileinfo);
        }
        startNext();
      } else {
        /*
         * If this is not the first scan, then we may already have a db
         * record for this new file. In that case, the call to add() above
         * is going to fail. We need to handle that case, so we can't send
         * out the new file notification until we get a response to the add().
         */
        const transaction = media.db.transaction('files', 'readwrite');
        const store = transaction.objectStore('files');
        const request = store.add(fileinfo);
        request.onsuccess = () => {
          if (!fileinfo.fail) {
            queueCreateNotification(media, fileinfo);
          }
          startNext();
        };
        request.onerror = event => {
          /**
           * If the error name is 'ConstraintError' , it means that the
           * file already exists in the database. So try again, using put()
           * instead of add(). If that succeeds, then queue a delete
           * notification along with the insert notification.  If the
           * second try fails, or if the error was something different
           * then issue a warning and continue with the next.
           */
          if (request.error.name === 'ConstraintError') {
            // Don't let the higher-level DB error handler report the error
            event.stopPropagation();
            // And don't spew a default error message to the console either
            event.preventDefault();
            const putRequest = store.put(fileinfo);
            putRequest.onsuccess = () => {
              queueDeleteNotification(media, fileinfo.name);
              if (!fileinfo.fail) {
                queueCreateNotification(media, fileinfo);
              }
              startNext();
            };
            putRequest.onerror = () => {
              // Report and move on
              console.error(
                'MediaDB: unexpected ConstraintError',
                'in insertRecord for file:',
                fileinfo.name
              );
              startNext();
            };
          } else if (request.error.name === 'QuotaExceededError') {
            /**
             * Media.db is no longer useable after QuotaExceededError, so reclaim
             * media.db for further action like deletion.
             */
            const dbVersion =
              (0xFFFF & media.version) << 16 | (0xFFFF & MediaDB.VERSION); // eslint-disable-line
            const reopenRequest = indexedDB.open(media.dbname, dbVersion);
            reopenRequest.onsuccess = () => {
              media.db = reopenRequest.result;
              startNext();
            };
            reopenRequest.onerror = () => {
              console.error(
                'MediaDB reopenRequest error:',
                reopenRequest.error.name
              );
              startNext();
            };
            reopenRequest.onblocked = () => {
              console.error(`MediaDB is blocked. ${media.dbname}`);
              startNext();
            };
          } else {
            console.error(
              'MediaDB: unexpected error in insertRecord:',
              request.error,
              'for file:',
              fileinfo.name
            );
            startNext();
          }
        };
      }
    }
  }

  /**
   * Don 't send out notification events right away. Wait a short time to
   * see if others arrive that we can batch up.  This is common for scanning
   */
  function queueCreateNotification(media, fileinfo) {
    const creates = media.details.pendingCreateNotifications;
    creates.push(fileinfo);
    if (media.batchSize && creates.length >= media.batchSize) {
      sendNotifications(media);
    } else {
      resetNotificationTimer(media);
    }
  }

  function queueDeleteNotification(media, filename) {
    const deletes = media.details.pendingDeleteNotifications;
    deletes.push(filename);
    if (media.batchSize && deletes.length >= media.batchSize) {
      sendNotifications(media);
    } else {
      resetNotificationTimer(media);
    }
  }

  function resetNotificationTimer(media) {
    const { details } = media;
    if (details.pendingNotificationTimer) {
      clearTimeout(details.pendingNotificationTimer);
    }
    details.pendingNotificationTimer = setTimeout(
      () => {
        sendNotifications(media);
      },
      media.scanning ? media.batchHoldTime : 100
    );
  }

  // Send out notifications for creations and deletions
  function sendNotifications(media) {
    const { details } = media;
    if (details.pendingNotificationTimer) {
      clearTimeout(details.pendingNotificationTimer);
      details.pendingNotificationTimer = null;
    }
    if (details.pendingDeleteNotifications.length > 0) {
      const deletions = details.pendingDeleteNotifications;
      details.pendingDeleteNotifications = [];
      dispatchEvent(media, 'deleted', deletions);
    }
    // If no data currently triggers an empty event
    if (details.pendingCreateNotifications.length === 0) {
      if (details.firstscan && details.records.length === 0) {
        dispatchEvent(media, 'empty', []);
      }
    }
    if (details.pendingCreateNotifications.length > 0) {
      const creations = details.pendingCreateNotifications;
      details.pendingCreateNotifications = [];
      if (details.firstscan && details.records.length > 0) {
        const transaction = media.db.transaction('files', 'readwrite');
        const store = transaction.objectStore('files');
        for (let i = 0; i < details.records.length; i++) {
          store.add(details.records[i]);
        }
        details.records.length = 0;
        /**
         * One of the original points of this firstscan optimization was that
         * we could dispatch the created events without waiting for the
         * database writes to complete.It turns out(see bug 963917) that
         * we can 't do that because the Gallery app needs to read records
         * from the db in order to be sure it is holding file - based blobs
         * instead of memory - based blobs.So we wait for the transaction to
         * complete before sending the notifications.
         */
        transaction.oncomplete = () => {
          dispatchEvent(media, 'created', creations);
        };
      } else {
        dispatchEvent(media, 'created', creations);
      }
    }
  }

  function dispatchEvent(media, type, detail) {
    const handler = media[`on${type}`];
    const listeners = media.details.eventListeners[type];
    if (!handler && (!listeners || listeners.length === 0)) {
      return;
    }
    const event = {
      type,
      target: media,
      currentTarget: media,
      timestamp: Date.now(),
      detail
    };
    if (typeof handler === 'function') {
      try {
        handler.call(media, event);
      } catch (e) {
        console.warn(
          'MediaDB: ',
          `on${type}`,
          'event handler threw',
          e,
          e.stack
        );
      }
    }

    // Now call the listeners if there are any
    if (!listeners) {
      return;
    }
    for (let i = 0; i < listeners.length; i++) {
      try {
        const listener = listeners[i];
        if (typeof listener === 'function') {
          listener.call(media, event);
        } else {
          listener.handleEvent(event);
        }
      } catch (e) {
        console.warn('MediaDB: ', type, 'event listener threw', e, e.stack);
      }
    }
  }

  function changeState(media, state) {
    if (media.state !== state) {
      media.state = state;
      switch (state) {
        case MediaDB.READY:
        case MediaDB.ENUMERABLE:
          dispatchEvent(media, state);
          break;
        default:
          dispatchEvent(media, 'unavailable', state);
          break;
      }
    }
  }
  exports.MediaDB = MediaDB;
})(window);
