/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil -*- */
/* Vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

/**
 * This lib relies on `l10n.js' to implement localizable date/time strings.
 *
 * The proposed `DateTimeFormat' object should provide all the features that are
 * planned for the `Intl.DateTimeFormat' constructor, but the API does not match
 * exactly the ES-i18n draft.
 *   - https://bugzilla.mozilla.org/show_bug.cgi?id=769872
 *   - http://wiki.ecmascript.org/doku.php?id=globalization:specification_drafts
 *
 * Besides, this `DateTimeFormat' object provides two features that aren't
 * planned in the ES-i18n spec:
 *   - a `toLocaleFormat()' that really works (i.e. fully translated);
 *   - a `fromNow()' method to handle relative dates ("pretty dates").
 *
 * WARNING: this library relies on the non-standard `toLocaleFormat()' method,
 * which is specific to Firefox -- no other browser is supported.
 */

// eslint-disable-next-line no-unused-vars
window.api.l10n.DateTimeFormat = function DateTimeFormat() {
  const _ = window.api.l10n.get;

  // https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/toLocaleFormat
  function localeFormat(d, format) {
    // eslint-disable-next-line
    const tokens = format.match(/(%[E|O|-]?.)/gu);
    if (!tokens) {
      return format;
    }

    for (let i = 0; i < tokens.length; i++) {
      let value = '';

      // http://pubs.opengroup.org/onlinepubs/007908799/xsh/strftime.html
      switch (tokens[i]) {
        // Localized day/month names
        case '%a':
          value = _(`weekday-${d.getDay()}-short`);
          break;
        case '%A':
          value = _(`weekday-${d.getDay()}-long`);
          break;
        case '%b':
        case '%h':
          value = _(`month-${d.getMonth()}-short`);
          break;
        case '%B':
          value = _(`month-${d.getMonth()}-long`);
          break;
        case '%Eb':
          value = _(`month-${d.getMonth()}-genitive`);
          break;

        // Month without leading zero
        case '%-m':
          value = d.getMonth() + 1;
          break;

        // Like %H, but in 12-hour format and without any leading zero
        case '%I':
          value = d.getHours() % 12 || 12;
          break;

        // Like %d, without any leading zero
        case '%e':
          value = d.getDate();
          break;

        // %p: 12 hours format (AM/PM)
        case '%p':
          value = d.getHours() < 12 ? _('time_am') : _('time_pm');
          break;

        // Localized date/time strings
        case '%c':
        case '%x':
        case '%X':
          {
            // Ensure the localized format string doesn't contain any %c|%x|%X
            const tmp = _(`dateTimeFormat_${tokens[i]}`);
            if (tmp) {
              // eslint-disable-next-line
              if (!/(%c|%x|%X)/u.test(tmp)) {
                value = localeFormat(d, tmp);
              }
            }
          }
          break;
        case '%H':
          value = d.getHours();
          break;
        case '%M':
          value = d.getMinutes();
          if (value < 10) {
            value = `0${value}`;
          }
          break;
        case '%Y':
          value = d.getFullYear();
          break;
        case '%m':
          value = d.getMonth() + 1;
          if (value < 10) {
            value = `0${value}`;
          }
          break;
        case '%d':
          value = d.getDate();
          if (value < 10) {
            value = `0${value}`;
          }
          break;
        case '%T': // Equivalent to %H:%M:%S
          value = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
          break;
        default:
          break;
        // Other tokens don't require any localization
      }

      if (value === undefined) {
        console.error(`localeFormat: token is ${tokens[i]} - full: ${format}`);
      }

      format = format.replace(tokens[i], value);
    }
    return format;
  }

  /**
   * Returns the parts of a number of seconds
   */
  function relativeParts(seconds) {
    seconds = Math.abs(seconds);
    const descriptors = {};
    const units = [
      'years',
      86400 * 365,
      'months',
      86400 * 30,
      'weeks',
      86400 * 7,
      'days',
      86400,
      'hours',
      3600,
      'minutes',
      60
    ];

    if (seconds < 60) {
      return {
        minutes: Math.round(seconds / 60)
      };
    }

    for (let i = 0, uLen = units.length; i < uLen; i += 2) {
      const value = units[i + 1];
      if (seconds >= value) {
        descriptors[units[i]] = Math.floor(seconds / value);
        seconds -= descriptors[units[i]] * value;
      }
    }
    return descriptors;
  }

  /**
   * Returns a translated string which respresents the
   * relative time before or after a date.
   * @param {String|Date} time before/after the currentDate.
   * @param {String} useCompactFormat whether to use a compact display format.
   * @param {Number} maxDiff returns a formatted date if the diff is greater.
   */
  function prettyDate(time, useCompactFormat) {
    switch (time.constructor) {
      case String: // Timestamp
        time = parseInt(time, 10);
        break;
      case Date:
        time = time.getTime();
        break;
      default:
        break;
    }

    const now = Date.now();
    let secDiff = (now - time) / 1000;
    if (isNaN(secDiff)) {
      return _('incorrectDate');
    }

    if (Math.abs(secDiff) > 60) {
      /*
       * Round milliseconds up if difference is over 1 minute so the result is
       * closer to what the user would expect (1h59m59s300ms diff should return
       * "in 2 hours" instead of "in an hour")
       */
      secDiff = secDiff > 0 ? Math.ceil(secDiff) : Math.floor(secDiff);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMidnight = today.getTime();
    const yesterdayMidnight = todayMidnight - 86400 * 1000;

    const thisyearTimestamp = new Date(
      today.getFullYear().toString()
    ).getTime();
    // Ex. 11:59 PM or 23:59
    const timeFormat = window.api.hour12 ? '%I:%M %p' : '%H:%M';

    if (time < thisyearTimestamp) {
      // Before this year, ex. December 31, 2015 11:59 PM
      return localeFormat(new Date(time), `%B %e, %Y ${timeFormat}`);
    } else if (time < yesterdayMidnight) {
      // Before yesterday and in this year, ex. August 31, 11:59 PM
      return localeFormat(new Date(time), `%B %e, ${timeFormat}`);
    } else if (time < todayMidnight) {
      // Yesterday
      return `${_('days-ago-long', { value: 1 })}, ${localeFormat(
        new Date(time),
        timeFormat
      )}`;
    } else if (secDiff > 3600 * 4) {
      // Today and before 4 hours
      return `${_('days-ago-long', { value: 0 })}, ${localeFormat(
        new Date(time),
        timeFormat
      )}`;
    }
    // In 4 hours
    const f = useCompactFormat ? '-short' : '-long';
    const parts = relativeParts(secDiff);

    const affix = secDiff >= 0 ? '-ago' : '-until';
    // eslint-disable-next-line
    for (let i in parts) {
      return _(i + affix + f, { value: parts[i] });
    }
    return _('incorrectDate');
  }

  // API
  return {
    localeDateString: function localeDateString(d) {
      return localeFormat(d, '%x');
    },
    localeTimeString: function localeTimeString(d) {
      return localeFormat(d, '%X');
    },
    localeString: function localeString(d) {
      return localeFormat(d, '%c');
    },
    localeFormat,
    fromNow: prettyDate,
    relativeParts
  };
};
