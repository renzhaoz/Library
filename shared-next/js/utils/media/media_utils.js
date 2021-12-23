/**
 * Define a MediaUtils object for helper
 * function used across Media Apps
 *
 */
// eslint-disable-next-line
const MediaUtils = {
  _: window.api.l10n.get,

  // Format Date
  formatDate(timestamp) {
    if (timestamp && !isNaN(timestamp)) {
      const dtf = new window.api.l10n.DateTimeFormat();
      return dtf.localeFormat(new Date(timestamp), this._('dateTimeFormat_%x'));
    }
    return null;
  },

  // Format Size
  formatSize(size) {
    if (!size || size === undefined || isNaN(size)) {
      return null;
    }
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let i = 0;
    while (size >= 1024 && i < units.length - 1) {
      size /= 1024;
      ++i;
    }
    const sizeDecimal = i < 2 ? Math.round(size) : Math.round(size * 10) / 10;
    const sizeDecimalsString = sizeDecimal.toLocaleString(navigator.language);
    const byteUnit = this._(`byteUnit-${units[i]}`);
    return `${sizeDecimalsString} ${byteUnit}`;
  },

  // Format Duration
  formatDuration(duration) {
    function padLeft(num, length) {
      let r = String(num);
      while (r.length < length) {
        r = `0${r}`;
      }
      return r;
    }

    duration = Math.round(duration);
    let minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    if (minutes < 60) {
      return `${padLeft(minutes, 2)}:${padLeft(seconds, 2)}`;
    }
    const hours = Math.floor(minutes / 60);
    minutes = Math.floor(minutes % 60);
    return `${hours}:${padLeft(minutes, 2)}:${padLeft(seconds, 2)}`;
  },

  /*
   * Each media app has a static info overlay view, hidden by default.
   * populateMediaInfo takes a data object and fills in the field of
   * info overlay view. Format of data object is
   * {
   *   id: 'value',
   *    ...
   * }
   * where each property is the id of an element that is statically defined
   * in the index.html file.
   * If data object has properties that do not match an element,
   * then ignore them.
   */
  populateMediaInfo(data) {
    for (const id in data) {
      const hasProperty = Object.prototype.hasOwnProperty.call(data, id);
      if (hasProperty) {
        const element = document.getElementById(data[id]);
        if (element) {
          element.textContent = data[id];
        }
      }
    }
  },

  /*
   * Assuming that array is sorted according to comparator, return the
   * array index at which element should be inserted to maintain sort order
   */
  binarySearch(array, element, comparator, from, to) { // eslint-disable-line
    if (comparator === undefined) {
      comparator = (a, b) => {
        return a - b;
      };
    }
    if (from === undefined) {
      return MediaUtils.binarySearch(
        array,
        element,
        comparator,
        0,
        array.length
      );
    }
    if (from === to) {
      return from;
    }
    const mid = Math.floor((from + to) / 2);
    const result = comparator(element, array[mid]);
    if (result < 0) {
      return MediaUtils.binarySearch(array, element, comparator, from, mid);
    }
    return MediaUtils.binarySearch(array, element, comparator, mid + 1, to);
  }
};

window.MediaUtils = MediaUtils;
