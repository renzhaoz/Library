/* This file is used for get l10n in serviceworker
 * 1. Add
 *   importScripts('%SHARED_APP_ORIGIN%/js/utils/l10n/l10n_sw.js'); in sw.js
 * 2. l10n.once(() => {
 *      let textContent = l10n.get(l10n_id, args);
 *    });
 */
function L10nError(message, id, loc) {
  this.name = 'L10nError';
  this.message = message;
  this.id = id;
  this.loc = loc;
}
L10nError.prototype = Object.create(Error.prototype);
L10nError.prototype.constructor = L10nError;

/* jshint browser:true */

var io = {
  _load(type, url, callback) {
    fetch(url)
      .then(response => response.json())
      .then(data =>  callback(null, data))
      .catch((error) => callback(new L10nError('Load data error: ' + url + error)));
  },

  load(url, callback) {
    return io._load('text/plain', url, callback);
  },

  loadJSON(url, callback) {
    return io._load('application/json', url, callback);
  }
};

function getPluralRule(lang) {
  var locales2rules = {
    'af': 3,
    'ak': 4,
    'am': 4,
    'ar': 1,
    'asa': 3,
    'az': 0,
    'be': 11,
    'bem': 3,
    'bez': 3,
    'bg': 3,
    'bh': 4,
    'bm': 0,
    'bn': 3,
    'bo': 0,
    'br': 20,
    'brx': 3,
    'bs': 11,
    'ca': 3,
    'cgg': 3,
    'chr': 3,
    'cs': 12,
    'cy': 17,
    'da': 3,
    'de': 3,
    'dv': 3,
    'dz': 0,
    'ee': 3,
    'el': 3,
    'en': 3,
    'eo': 3,
    'es': 3,
    'et': 3,
    'eu': 3,
    'fa': 0,
    'ff': 5,
    'fi': 3,
    'fil': 4,
    'fo': 3,
    'fr': 5,
    'fur': 3,
    'fy': 3,
    'ga': 8,
    'gd': 24,
    'gl': 3,
    'gsw': 3,
    'gu': 3,
    'guw': 4,
    'gv': 23,
    'ha': 3,
    'haw': 3,
    'he': 2,
    'hi': 4,
    'hr': 11,
    'hu': 0,
    'id': 0,
    'ig': 0,
    'ii': 0,
    'is': 3,
    'it': 3,
    'iu': 7,
    'ja': 0,
    'jmc': 3,
    'jv': 0,
    'ka': 0,
    'kab': 5,
    'kaj': 3,
    'kcg': 3,
    'kde': 0,
    'kea': 0,
    'kk': 3,
    'kl': 3,
    'km': 0,
    'kn': 0,
    'ko': 0,
    'ksb': 3,
    'ksh': 21,
    'ku': 3,
    'kw': 7,
    'lag': 18,
    'lb': 3,
    'lg': 3,
    'ln': 4,
    'lo': 0,
    'lt': 10,
    'lv': 6,
    'mas': 3,
    'mg': 4,
    'mk': 16,
    'ml': 3,
    'mn': 3,
    'mo': 9,
    'mr': 3,
    'ms': 0,
    'mt': 15,
    'my': 0,
    'nah': 3,
    'naq': 7,
    'nb': 3,
    'nd': 3,
    'ne': 3,
    'nl': 3,
    'nn': 3,
    'no': 3,
    'nr': 3,
    'nso': 4,
    'ny': 3,
    'nyn': 3,
    'om': 3,
    'or': 3,
    'pa': 3,
    'pap': 3,
    'pl': 13,
    'ps': 3,
    'pt': 3,
    'rm': 3,
    'ro': 9,
    'rof': 3,
    'ru': 11,
    'rwk': 3,
    'sah': 0,
    'saq': 3,
    'se': 7,
    'seh': 3,
    'ses': 0,
    'sg': 0,
    'sh': 11,
    'shi': 19,
    'sk': 12,
    'sl': 14,
    'sma': 7,
    'smi': 7,
    'smj': 7,
    'smn': 7,
    'sms': 7,
    'sn': 3,
    'so': 3,
    'sq': 3,
    'sr': 11,
    'ss': 3,
    'ssy': 3,
    'st': 3,
    'sv': 3,
    'sw': 3,
    'syr': 3,
    'ta': 3,
    'te': 3,
    'teo': 3,
    'th': 0,
    'ti': 4,
    'tig': 3,
    'tk': 3,
    'tl': 4,
    'tn': 3,
    'to': 0,
    'tr': 0,
    'ts': 3,
    'tzm': 22,
    'uk': 11,
    'ur': 3,
    've': 3,
    'vi': 0,
    'vun': 3,
    'wa': 4,
    'wae': 3,
    'wo': 0,
    'xh': 3,
    'xog': 3,
    'yo': 0,
    'zh': 0,
    'zu': 3
  };

  // utility functions for plural rules methods
  function isIn(n, list) {
    return list.indexOf(n) !== -1;
  }
  function isBetween(n, start, end) {
    return typeof n === typeof start && start <= n && n <= end;
  }

  // list of all plural rules methods:
  // map an integer to the plural form name to use
  var pluralRules = {
    '0': function() {
      return 'other';
    },
    '1': function(n) {
      if ((isBetween((n % 100), 3, 10))) {
        return 'few';
      }
      if (n === 0) {
        return 'zero';
      }
      if ((isBetween((n % 100), 11, 99))) {
        return 'many';
      }
      if (n === 2) {
        return 'two';
      }
      if (n === 1) {
        return 'one';
      }
      return 'other';
    },
    '2': function(n) {
      if (n !== 0 && (n % 10) === 0) {
        return 'many';
      }
      if (n === 2) {
        return 'two';
      }
      if (n === 1) {
        return 'one';
      }
      return 'other';
    },
    '3': function(n) {
      if (n === 1) {
        return 'one';
      }
      return 'other';
    },
    '4': function(n) {
      if ((isBetween(n, 0, 1))) {
        return 'one';
      }
      return 'other';
    },
    '5': function(n) {
      if ((isBetween(n, 0, 2)) && n !== 2) {
        return 'one';
      }
      return 'other';
    },
    '6': function(n) {
      if (n === 0) {
        return 'zero';
      }
      if ((n % 10) === 1 && (n % 100) !== 11) {
        return 'one';
      }
      return 'other';
    },
    '7': function(n) {
      if (n === 2) {
        return 'two';
      }
      if (n === 1) {
        return 'one';
      }
      return 'other';
    },
    '8': function(n) {
      if ((isBetween(n, 3, 6))) {
        return 'few';
      }
      if ((isBetween(n, 7, 10))) {
        return 'many';
      }
      if (n === 2) {
        return 'two';
      }
      if (n === 1) {
        return 'one';
      }
      return 'other';
    },
    '9': function(n) {
      if (n === 0 || n !== 1 && (isBetween((n % 100), 1, 19))) {
        return 'few';
      }
      if (n === 1) {
        return 'one';
      }
      return 'other';
    },
    '10': function(n) {
      if ((isBetween((n % 10), 2, 9)) && !(isBetween((n % 100), 11, 19))) {
        return 'few';
      }
      if ((n % 10) === 1 && !(isBetween((n % 100), 11, 19))) {
        return 'one';
      }
      return 'other';
    },
    '11': function(n) {
      if ((isBetween((n % 10), 2, 4)) && !(isBetween((n % 100), 12, 14))) {
        return 'few';
      }
      if ((n % 10) === 0 ||
        (isBetween((n % 10), 5, 9)) ||
        (isBetween((n % 100), 11, 14))) {
        return 'many';
      }
      if ((n % 10) === 1 && (n % 100) !== 11) {
        return 'one';
      }
      return 'other';
    },
    '12': function(n) {
      if ((isBetween(n, 2, 4))) {
        return 'few';
      }
      if (n === 1) {
        return 'one';
      }
      return 'other';
    },
    '13': function(n) {
      if ((isBetween((n % 10), 2, 4)) && !(isBetween((n % 100), 12, 14))) {
        return 'few';
      }
      if (n !== 1 && (isBetween((n % 10), 0, 1)) ||
        (isBetween((n % 10), 5, 9)) ||
        (isBetween((n % 100), 12, 14))) {
        return 'many';
      }
      if (n === 1) {
        return 'one';
      }
      return 'other';
    },
    '14': function(n) {
      if ((isBetween((n % 100), 3, 4))) {
        return 'few';
      }
      if ((n % 100) === 2) {
        return 'two';
      }
      if ((n % 100) === 1) {
        return 'one';
      }
      return 'other';
    },
    '15': function(n) {
      if (n === 0 || (isBetween((n % 100), 2, 10))) {
        return 'few';
      }
      if ((isBetween((n % 100), 11, 19))) {
        return 'many';
      }
      if (n === 1) {
        return 'one';
      }
      return 'other';
    },
    '16': function(n) {
      if ((n % 10) === 1 && n !== 11) {
        return 'one';
      }
      return 'other';
    },
    '17': function(n) {
      if (n === 3) {
        return 'few';
      }
      if (n === 0) {
        return 'zero';
      }
      if (n === 6) {
        return 'many';
      }
      if (n === 2) {
        return 'two';
      }
      if (n === 1) {
        return 'one';
      }
      return 'other';
    },
    '18': function(n) {
      if (n === 0) {
        return 'zero';
      }
      if ((isBetween(n, 0, 2)) && n !== 0 && n !== 2) {
        return 'one';
      }
      return 'other';
    },
    '19': function(n) {
      if ((isBetween(n, 2, 10))) {
        return 'few';
      }
      if ((isBetween(n, 0, 1))) {
        return 'one';
      }
      return 'other';
    },
    '20': function(n) {
      if ((isBetween((n % 10), 3, 4) || ((n % 10) === 9)) && !(
        isBetween((n % 100), 10, 19) ||
        isBetween((n % 100), 70, 79) ||
        isBetween((n % 100), 90, 99)
      )) {
        return 'few';
      }
      if ((n % 1000000) === 0 && n !== 0) {
        return 'many';
      }
      if ((n % 10) === 2 && !isIn((n % 100), [12, 72, 92])) {
        return 'two';
      }
      if ((n % 10) === 1 && !isIn((n % 100), [11, 71, 91])) {
        return 'one';
      }
      return 'other';
    },
    '21': function(n) {
      if (n === 0) {
        return 'zero';
      }
      if (n === 1) {
        return 'one';
      }
      return 'other';
    },
    '22': function(n) {
      if ((isBetween(n, 0, 1)) || (isBetween(n, 11, 99))) {
        return 'one';
      }
      return 'other';
    },
    '23': function(n) {
      if ((isBetween((n % 10), 1, 2)) || (n % 20) === 0) {
        return 'one';
      }
      return 'other';
    },
    '24': function(n) {
      if ((isBetween(n, 3, 10) || isBetween(n, 13, 19))) {
        return 'few';
      }
      if (isIn(n, [2, 12])) {
        return 'two';
      }
      if (isIn(n, [1, 11])) {
        return 'one';
      }
      return 'other';
    }
  };

  // return a function that gives the plural form name for a given integer
  var index = locales2rules[lang.replace(/-.*$/, '')];
  if (!(index in pluralRules)) {
    return function() { return 'other'; };
  }
  return pluralRules[index];
}




var MAX_PLACEABLES = 100;


var PropertiesParser = {
  patterns: null,
  entryIds: null,

  init: function() {
    this.patterns = {
      comment: /^\s*#|^\s*$/,
      entity: /^([^=\s]+)\s*=\s*(.*)$/,
      multiline: /[^\\]\\$/,
      index: /\{\[\s*(\w+)(?:\(([^\)]*)\))?\s*\]\}/i,
      unicode: /\\u([0-9a-fA-F]{1,4})/g,
      entries: /[^\r\n]+/g,
      controlChars: /\\([\\\n\r\t\b\f\{\}\"\'])/g,
      placeables: /\{\{\s*([^\s]*?)\s*\}\}/,
    };
  },

  parse: function(ctx, source) {
    if (!this.patterns) {
      this.init();
    }

    var ast = [];
    this.entryIds = Object.create(null);

    var entries = source.match(this.patterns.entries);
    if (!entries) {
      return ast;
    }
    for (var i = 0; i < entries.length; i++) {
      var line = entries[i];

      if (this.patterns.comment.test(line)) {
        continue;
      }

      while (this.patterns.multiline.test(line) && i < entries.length) {
        line = line.slice(0, -1) + entries[++i].trim();
      }

      var entityMatch = line.match(this.patterns.entity);
      if (entityMatch) {
        try {
          this.parseEntity(entityMatch[1], entityMatch[2], ast);
        } catch (e) {
          if (ctx) {
            ctx._emitter.emit('parseerror', e);
          } else {
            throw e;
          }
        }
      }
    }
    return ast;
  },

  parseEntity: function(id, value, ast) {
    var name, key;

    var pos = id.indexOf('[');
    if (pos !== -1) {
      name = id.substr(0, pos);
      key = id.substring(pos + 1, id.length - 1);
    } else {
      name = id;
      key = null;
    }

    var nameElements = name.split('.');

    if (nameElements.length > 2) {
      throw new L10nError('Error in ID: "' + name + '".' +
        ' Nested attributes are not supported.');
    }

    var attr;
    if (nameElements.length > 1) {
      name = nameElements[0];
      attr = nameElements[1];

      if (attr[0] === '$') {
        throw new L10nError('Attribute can\'t start with "$"', id);
      }
    } else {
      attr = null;
    }

    this.setEntityValue(name, attr, key, this.unescapeString(value), ast);
  },

  setEntityValue: function(id, attr, key, rawValue, ast) {
    var pos, v;

    var value = rawValue.indexOf('{{') > -1 ?
      this.parseString(rawValue) : rawValue;

    if (rawValue.indexOf('<') > -1 || rawValue.indexOf('&') > -1) {
      value = { $o: value };
    }

    if (attr) {
      pos = this.entryIds[id];
      if (pos === undefined) {
        v = {$i: id};
        if (key) {
          v[attr] = {};
          v[attr][key] = value;
        } else {
          v[attr] = value;
        }
        ast.push(v);
        this.entryIds[id] = ast.length - 1;
        return;
      }
      if (key) {
        if (typeof(ast[pos][attr]) === 'string') {
          ast[pos][attr] = {
            $x: this.parseIndex(ast[pos][attr]),
            $v: {}
          };
        }
        ast[pos][attr].$v[key] = value;
        return;
      }
      ast[pos][attr] = value;
      return;
    }

    // Hash value
    if (key) {
      pos = this.entryIds[id];
      if (pos === undefined) {
        v = {};
        v[key] = value;
        ast.push({$i: id, $v: v});
        this.entryIds[id] = ast.length - 1;
        return;
      }
      if (typeof(ast[pos].$v) === 'string') {
        ast[pos].$x = this.parseIndex(ast[pos].$v);
        ast[pos].$v = {};
      }
      ast[pos].$v[key] = value;
      return;
    }

    // simple value
    ast.push({$i: id, $v: value});
    this.entryIds[id] = ast.length - 1;
  },

  parseString: function(str) {
    var chunks = str.split(this.patterns.placeables);
    var complexStr = [];

    var len = chunks.length;
    var placeablesCount = (len - 1) / 2;

    if (placeablesCount >= MAX_PLACEABLES) {
      throw new L10nError('Too many placeables (' + placeablesCount +
        ', max allowed is ' + MAX_PLACEABLES + ')');
    }

    for (var i = 0; i < chunks.length; i++) {
      if (chunks[i].length === 0) {
        continue;
      }
      if (i % 2 === 1) {
        complexStr.push({t: 'idOrVar', v: chunks[i]});
      } else {
        complexStr.push(chunks[i]);
      }
    }
    return complexStr;
  },

  unescapeString: function(str) {
    if (str.lastIndexOf('\\') !== -1) {
      str = str.replace(this.patterns.controlChars, '$1');
    }
    return str.replace(this.patterns.unicode, function(match, token) {
      return unescape('%u' + '0000'.slice(token.length) + token);
    });
  },

  parseIndex: function(str) {
    var match = str.match(this.patterns.index);
    if (!match) {
      throw new L10nError('Malformed index');
    }
    if (match[2]) {
      return [{t: 'idOrVar', v: match[1]}, match[2]];
    } else {
      return [{t: 'idOrVar', v: match[1]}];
    }
  }
};



var KNOWN_MACROS = ['plural'];

var MAX_PLACEABLE_LENGTH = 2500;
var rePlaceables = /\{\{\s*(.+?)\s*\}\}/g;

// Matches characters outside of the Latin-1 character set
var nonLatin1 = /[^\x01-\xFF]/;

// Unicode bidi isolation characters
var FSI = '\u2068';
var PDI = '\u2069';

function createEntry(node, env) {
  var keys = Object.keys(node);

  // the most common scenario: a simple string with no arguments
  if (typeof node.$v === 'string' && keys.length === 2) {
    return node.$v;
  }

  var attrs;

  /* jshint -W084 */
  for (var i = 0, key; key = keys[i]; i++) {
    if (key[0] === '$') {
      continue;
    }

    if (!attrs) {
      attrs = Object.create(null);
    }
    attrs[key] = createAttribute(node[key], env, node.$i + '.' + key);
  }

  return {
    id: node.$i,
    value: node.$v !== undefined ? node.$v : null,
    index: node.$x || null,
    attrs: attrs || null,
    env: env,
    // the dirty guard prevents cyclic or recursive references
    dirty: false
  };
}

function createAttribute(node, env, id) {
  if (typeof node === 'string') {
    return node;
  }

  return {
    id: id,
    value: node.$v || (node !== undefined ? node : null),
    index: node.$x || null,
    env: env,
    dirty: false
  };
}


function format(args, entity) {
  var locals = {
    overlay: false
  };

  if (typeof entity === 'string') {
    return [locals, entity];
  }

  if (entity.dirty) {
    throw new L10nError('Cyclic reference detected: ' + entity.id);
  }

  entity.dirty = true;

  var rv;

  // if format fails, we want the exception to bubble up and stop the whole
  // resolving process;  however, we still need to clean up the dirty flag
  try {
    rv = resolveValue(locals, args, entity.env, entity.value, entity.index);
  } finally {
    entity.dirty = false;
  }
  return rv;
}

function resolveIdentifier(args, env, id) {
  if (KNOWN_MACROS.indexOf(id) > -1) {
    return [{}, env['__' + id]];
  }

  if (args && args.hasOwnProperty(id)) {
    if (typeof args[id] === 'string' || (typeof args[id] === 'number' &&
      !isNaN(args[id]))) {
      return [{}, args[id]];
    } else {
      throw new L10nError('Arg must be a string or a number: ' + id);
    }
  }

  // XXX: special case for Node.js where still:
  // '__proto__' in Object.create(null) => true
  if (id in env && id !== '__proto__') {
    return format(args, env[id]);
  }

  throw new L10nError('Unknown reference: ' + id);
}

function subPlaceable(locals, args, env, id) {
  var res;

  try {
    res = resolveIdentifier(args, env, id);
  } catch (err) {
    return [{ error: err }, '{{ ' + id + ' }}'];
  }

  var value = res[1];

  if (typeof value === 'number') {
    return res;
  }

  if (typeof value === 'string') {
    // prevent Billion Laughs attacks
    if (value.length >= MAX_PLACEABLE_LENGTH) {
      throw new L10nError('Too many characters in placeable (' +
        value.length + ', max allowed is ' +
        MAX_PLACEABLE_LENGTH + ')');
    }

    if (locals.contextIsNonLatin1 || value.match(nonLatin1)) {
      // When dealing with non-Latin-1 text
      // we wrap substitutions in bidi isolate characters
      // to avoid bidi issues.
      res[1] = FSI + value + PDI;
    }

    return res;
  }

  return [{}, '{{ ' + id + ' }}'];
}

function interpolate(locals, args, env, arr) {
  return arr.reduce(function(prev, cur) {
    if (typeof cur === 'string') {
      return [prev[0], prev[1] + cur];
    } else if (cur.t === 'idOrVar'){
      var placeable = subPlaceable(locals, args, env, cur.v);
      if (placeable[0].overlay) {
        prev[0].overlay = true;
      }
      return [prev[0], prev[1] + placeable[1]];
    }
  }, [locals, '']);
}

function resolveSelector(args, env, expr, index) {
  var selectorName = index[0].v;
  var selector = resolveIdentifier(args, env, selectorName)[1];

  if (typeof selector !== 'function') {
    // selector is a simple reference to an entity or args
    return selector;
  }

  var argValue = index[1] ?
    resolveIdentifier(args, env, index[1])[1] : undefined;

  if (selector === env.__plural) {
    // special cases for zero, one, two if they are defined on the hash
    if (argValue === 0 && 'zero' in expr) {
      return 'zero';
    }
    if (argValue === 1 && 'one' in expr) {
      return 'one';
    }
    if (argValue === 2 && 'two' in expr) {
      return 'two';
    }
  }

  return selector(argValue);
}

function resolveValue(locals, args, env, expr, index) {
  if (!expr) {
    return [locals, expr];
  }

  if (expr.$o) {
    expr = expr.$o;
    locals.overlay = true;
  }

  if (typeof expr === 'string' ||
    typeof expr === 'boolean' ||
    typeof expr === 'number') {
    return [locals, expr];
  }

  if (Array.isArray(expr)) {
    locals.contextIsNonLatin1 = expr.some(function($_) {
      return typeof($_) === 'string' && $_.match(nonLatin1);
    });
    return interpolate(locals, args, env, expr);
  }

  // otherwise, it's a dict
  if (index) {
    // try to use the index in order to select the right dict member
    var selector = resolveSelector(args, env, expr, index);
    if (expr.hasOwnProperty(selector)) {
      return resolveValue(locals, args, env, expr[selector]);
    }
  }

  // if there was no index or no selector was found, try 'other'
  if ('other' in expr) {
    return resolveValue(locals, args, env, expr.other);
  }

  // XXX Specify entity id
  throw new L10nError('Unresolvable value');
}

var Resolver = {
  createEntry: createEntry,
  format: format,
  rePlaceables: rePlaceables
};

/* Utility functions */
function Locale(lang, ctx) {
  this.id = lang;
  this.ctx = ctx;
  this.isReady = false;
  this.entries = Object.create(null);
  this.entries.__plural = getPluralRule(lang);
}

Locale.prototype.build = function L_build() {
  return new Promise((resolve, reject) => {
    const { ctx } = this;
    const onL10nLoaded = (err) => {
      if (err) {
        reject('fetcherror');
      }
      this.isReady = true;
      resolve();
    };

    const onJSONLoaded = (err, json) => {
      if (!err && json) {
        this.addAST(json);
      }
      onL10nLoaded(err);
    }

    const onPropLoaded = (err, source) => {
      if (!err && source) {
        var ast = PropertiesParser.parse(ctx, source);
        this.addAST(ast);
      }
      onL10nLoaded(err);
    }

    const path = ctx.resLink.replace('{locale}', this.id);
    const type = path.substr(path.lastIndexOf('.') + 1);

    switch (type) {
      case 'json':
        io.loadJSON(path, onJSONLoaded);
        break;
      case 'properties':
        io.load(path, onPropLoaded);
        break;
      default:
        reject('type error' + type);
        break;
    }
  });
};


Locale.prototype.addAST = function(ast) {
  /* jshint -W084 */

  var createEntry = Resolver.createEntry;

  for (var i = 0; i < ast.length; i++) {
    this.entries[ast[i].$i] = createEntry(ast[i], this.entries);
  }
};

function Context(id) {
  this.id = id;
  this.defaultLocale = 'en-US';

  this.resLink = '/locales-obj/{locale}.json';
  this.locales = {};
}

Context.prototype.getWithFallback = function(id) {
  const locale = this.getLocale(navigator.language);
  if (locale.isReady) {
    return locale.entries[id];
  } else {
    return null;
  }
}

Context.prototype.formatTuple = function(args, entity) {
  try {
    return Resolver.format(args, entity);
  } catch (err) {
    var locals = {
      error: err
    };
    return [locals, entity.id];
  }
};

Context.prototype.legacyGet = function(id, args) {
  try {
    const entry = this.getWithFallback(id);
    if (entry) {
      return this.formatTuple(args, entry)[1];
    } else {
      return id;
    }
  } catch (err) {
    return id;
  }
};

Context.prototype.once = function(callback) {
  const locale = this.getLocale(navigator.language, true);
  if (!locale.isReady) {
    // build without callback, synchronously
    locale.build().then(callback, () => {
      const loc = this.getLocale(this.defaultLocale);
      if (!loc.isReady) {
        loc.build().then(callback, (err) => {
          console.error('l10n build error ' + err);
        });
      } else {
        callback();
      }
    });
  } else {
    callback();
  }
};

Context.prototype.get = function(id, args) {
  return this.legacyGet(id, args);
};

Context.prototype.getLocale = function getLocale(lang, add) {
  /* jshint -W093 */
  var locales = this.locales;
  var locale = locales[lang];
  if (locale && (lang === this.defaultLocale || locale.isReady || add)) {
    return locales[lang];
  }
  if (add || lang === this.defaultLocale) {
    return locales[lang] = new Locale(lang, this);
  } else {
    return locales[this.defaultLocale];
  }
};

const l10n = {
  ctx: new Context(),
  setResLink: (link) => {
    l10n.ctx.resLink = link;
  },
  once: (callback) => {
    return l10n.ctx.once(callback);
  },
  get: (id, ctxdata) => {
    return l10n.ctx.get(id, ctxdata);
  }
};

