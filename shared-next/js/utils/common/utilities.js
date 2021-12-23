const StringHelper = {
  fromUTF8: function fromUTF8(str) {
    const buf = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      buf[i] = str.charCodeAt(i);
    }
    return buf;
  },

  camelCase: function camelCase(str) {
    const rdashes = /-(.)/g;
    return str.replace(rdashes, (string, p1) => {
      return p1.toUpperCase();
    });
  }
};

// eslint-disable-next-line no-unused-vars
const DateHelper = {
  todayStarted: function todayStarted() {
    const now = new Date().valueOf();
    return this.getMidnight(now);
  },

  yesterdayStarted: function yesterdayStarted() {
    const now = new Date().valueOf();
    const dayAgo = now - 86400000;
    return this.getMidnight(dayAgo);
  },

  thisWeekStarted: function thisWeekStarted() {
    const now = new Date();
    const dayOfTheWeek = now.getDay();
    const firstDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      /*
       *GetDay is zero based so if today
       *is the start of the week it will not
       *change the date. Also if we get
       *into negative days the date object
       *handles that too...
       */
      now.getDate() - dayOfTheWeek
    );
    return this.getMidnight(firstDay);
  },

  thisMonthStarted: function thisMonthStarted() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).valueOf();
    return firstDay;
  },

  lastSixMonthsStarted: function lastSixMonthsStarted() {
    const now = new Date().valueOf();
    const sixMonthsAgo = now - 2629743830 * 6;
    return sixMonthsAgo;
  },

  thisYearStarted: function thisYearStarted() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), 0).valueOf();
    return firstDay;
  },

  getMidnight: function getMidnight(timestamp) {
    const day = new Date(timestamp);
    const midnight = new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      0
    ).valueOf();
    return midnight;
  }
};

// eslint-disable-next-line no-unused-vars
const NumberHelper = {
  /**
   * Pad a string representaiton of an integer with leading zeros
   *
   * @param {String} string String to pad.
   * @param {Integer} len Desired length of output.
   * @return {String} Padded string.
   */
  zfill: function zfill(string, len) {
    let s = string;
    while (s.length < len) s = `0${s}`;
    return s;
  }
};

/*
 * Taken (and modified) from /apps/sms/js/searchUtils.js
 * and /apps/sms/js/utils.js
 */
// eslint-disable-next-line no-unused-vars
const HtmlHelper = {
  createHighlightHTML: function createHighlightHTML(text, searchRegExp) {
    if (!searchRegExp) {
      return this.escapeHTML(text);
    }
    searchRegExp = new RegExp(searchRegExp, 'gi');
    const sliceStrs = text.split(searchRegExp);
    const patterns = text.match(searchRegExp);
    if (!patterns) {
      return this.escapeHTML(text);
    }
    let str = '';
    for (let i = 0; i < patterns.length; i++) {
      str = `${str +
        this.escapeHTML(sliceStrs[i])}<span class="highlight">${this.escapeHTML(
        patterns[i]
      )}</span>`;
    }
    str += this.escapeHTML(sliceStrs.pop());
    return str;
  },

  escapeHTML: function escapeHTML(str, escapeQuotes) {
    const span = document.createElement('span');
    span.textContent = str;

    // Escape space for displaying multiple space in message.
    span.innerHTML = span.innerHTML.replace(/\s/g, '&nbsp;');

    if (escapeQuotes)
      return span.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#x27;'); // "
    return span.innerHTML;
  },

  /*
   * Import elements into context. The first argument
   * is the context to import into, each subsequent
   * argument is the id of an element to import.
   * Elements can be accessed using the camelCased id
   */
  importElements: function importElements(context, ...args) {
    const ids = [].slice.call(args, 0);
    ids.forEach(id => {
      context[StringHelper.camelCase(id)] = document.getElementById(id);
    });
  }
};

window.StringHelper = StringHelper;
window.DateHelper = DateHelper;
window.HtmlHelper = HtmlHelper;
window.NumberHelper = NumberHelper;
