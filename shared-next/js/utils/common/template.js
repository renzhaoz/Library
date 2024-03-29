(function (exports) { // eslint-disable-line
  const priv = new WeakMap();
  const rmatcher = /\$\{([^}]+)\}/g;
  const rentity = /[&<>"']/g;
  const rentities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;'
  };

  function extractNode(node) {
    let nodeId = null;
    // Received an ID string? Find the appropriate node to continue
    if (typeof node === 'string') {
      nodeId = node;
      node = document.getElementById(node);
    } else if (node) {
      nodeId = node.id;
    }

    if (!node) {
      console.error('Can not find the node passed to Template', nodeId);
      return '';
    }

    // No firstChild means no comment node.
    if (!node.firstChild) {
      console.error(
        'Node passed to Template should have a comment node',
        nodeId
      );
      return '';
    }

    // Starting with the container node's firstChild...
    node = node.firstChild;

    do {
      // Check if it's the comment node that we're looking for...
      if (node.nodeType === Node.COMMENT_NODE) {
        return (node.nodeValue || '').trim();
      }
      /*
       * If the current child of the container node isn't
       * a comment node, it's likely a text node, so hop to
       * the nextSibling and repeat the operation.
       */
    } while ((node = node.nextSibling));

    console.error(
      'Nodes passed to Template should have a comment node',
      nodeId
    );
    return '';
  }

  /**
   * Template
   *
   * Initialize a template instance from a string or node
   *
   * @param {String} idOrNode id string of existing node.
   *        {Object} idOrNode existing node.
   *
   */
  function Template(idOrNode) {
    if (!(this instanceof Template)) {
      return new Template(idOrNode);
    }
    /*
     * Storing the extracted template string as a private
     * instance property prevents direct access to the
     * template once it's been initialized.
     */
    priv.set(this, {
      idOrNode
    });
  }

  Template.prototype.extract = function extract() {
    const members = priv.get(this);
    if (!members.tmpl) {
      members.tmpl = extractNode(members.idOrNode);
      delete members.idOrNode;
    }
    return members.tmpl;
  };

  /**
   * Template.toString()
   *
   * Safe, read-only access to the template string
   *
   */
  Template.prototype.toString = function toString() {
    // Return a copy of the stored template string.
    return this.extract().slice();
  };

  /**
   * Template.interpolate
   *
   * Interpolate template string with values provided by
   * data object. Optionally allow properties to retain
   * HTML that is known to be safe.
   *
   * @param {Object} data     properties correspond to substitution.
   *                          - identifiers in template string.
   * @param {Object} options  optional.
   *                          - safe, a list of properties that contain
   *                          HTML that is known and are
   *                          "known" to ignore.
   */
  Template.prototype.interpolate = function interpolate(data, options) {
    /*
     * This _should_ be rewritten to use Firefox's support for ES6
     * default parameters:
     * ... = function(data, options = { safe: [] }) {
     *
     */
    options = options || {};
    options.safe = options.safe || [];

    return this.extract().replace(rmatcher, (match, property) => {
      property = property.trim();
      /*
       * Options.safe is an array of properties that can be ignored
       * by the "suspicious" html strategy.
       */
      return options.safe.indexOf(property) === -1
        ? Template.escape(data[property])
        : data[property];
    });
  };

  /**
   * Prepares object that can provide either interpolated template string with
   * values provided by data object or ready DocumentFragment. Optionally allows
   * properties to retain HTML that is known to be safe.
   *
   * @param {Object} data Properties correspond to substitution i.e. identifiers
   * in the template string.
   * @param {Object} options Optional options object. Currently supported only
   * "safe" option - a list of properties that contain HTML that is known to be
   * safe and don't need to be additionally escaped.
   * @return {{ toString: function, toDocumentFragment: function }}
   */
  Template.prototype.prepare = function prepare(data, options) {
    return {
      toString: function toString() {
        return Template.interpolate(data, options);
      },

      toDocumentFragment: function toDocumentFragment() {
        const template = document.createElement('template');
        template.innerHTML = this.toString();
        return template.content.cloneNode(true);
      }
    };
  };

  Template.escape = function escape(str) {
    if (typeof str !== 'string') {
      return '';
    }
    return str.replace(rentity, s => {
      return rentities[s];
    });
  };

  exports.Template = Template;
})(window);
