const { get: _ } = window.api.l10n;

/**
 * @param {Object} errorCase
 * @param {string} number - a valid number. e.g.: '0912345678'
 */
const transformErrorCase = (errorCase, number) => {
  if (!errorCase.containNumber) {
    return errorCase;
  }
  return {
    header: _(errorCase.header, { number }),
    content: _(errorCase.content, { number }),
    containNumber: true,
    translated: true
  };
};

/**
 * @param {Object} errorCase
 * @param {string} number - a valid number. e.g.: '0912345678'
 * @returns {Object}
 */
const getDialogOptions = (errorCase, number) => {
  const newErrorCase = transformErrorCase(errorCase, number);
  return {
    type: 'alert',
    noClose: false,
    ...newErrorCase
  };
};

export { getDialogOptions };
