/* global SoftkeyPanel*/
/* eslint-disable no-undef, no-unused-expressions */

(function optionMenuHelper(exports) {
  const buttonState = {
      leftKeyState: '',
      _cacheParams: null
    },
    firtsUpper = function firtsUpper(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    };
  const OptionHelper = function OptionHelper() {
    this.option = {};
    this.optionParams = Object.create(null);
    this.softkeyPanel = undefined;
    this.optionsCallback = undefined;
    this.lastParamName = undefined;
  };
  OptionHelper.prototype.stopKeyEvents = function stopKeyEvents() {
    this.softkeyPanel.stopListener();
  };
  OptionHelper.prototype.startKeyEvents = function startKeyEvents() {
    this.softkeyPanel.startListener();
  };
  OptionHelper.prototype.setOptionMenuCallBack = function setOptionMenuCallBack(
    callback
  ) {
    this.optionsCallback = callback;
  };
  OptionHelper.prototype._initSoftKeyPanel = function _initSoftKeyPanel() {
    if (!this.softkeyPanel) {
      console.log('Option helper, _initSoftKeyPanel');
      if (typeof SoftkeyHelper !== 'undefined') {
        // If we have SoftkeyHelper we don't need to implement new softkeypanel
        SoftkeyHelper.init(this._params, this.optionsCallback);
        this.softkeyPanel = SoftkeyHelper.getSoftkey();
      } else {
        this.softkeyPanel = new SoftkeyPanel(
          this._params,
          this.optionsCallback
        );
      }
      this.softkeyPanel.show();
      return;
    }
    this.softkeyPanel.initSoftKeyPanel(this._params);
  };
  OptionHelper.prototype.show = function show(paramName) {
    this.lastParamName = paramName;
    console.log(`Option helper, show paramName: ${paramName}`);
    if (this.softkeyPanel && !this.softkeyPanel.softKeyVisible) {
      this.softkeyPanel.show();
    }
    try {
      if (this.optionParams[paramName]) {
        this._params = this.getValidParams(paramName);
        window.api.l10n.once(this._initSoftKeyPanel.bind(this));
      } else {
        console.log(`Param <${paramName}> not found`);
      }
    } catch (e) {
      console.log(e);
    }
  };
  OptionHelper.prototype.getValidParams = function getValidParams(paramName) {
    const params = this.optionParams[paramName];
    if (typeof params.items === 'undefined') {
      return params;
    }

    const validParams = {};
    const validItems = [];
    for (const p in params) {
      validParams[p] = params[p];
    }
    for (let i = 0; i < validParams.items.length; i++) {
      const item = validParams.items[i];
      if (item.l10nId || (item.name && item.name.length) || item.icon) {
        validItems.push(item);
      }
    }
    validParams.items = validItems;
    return validParams;
  };
  OptionHelper.prototype.popAndRemoveElement = function popAndRemoveElement(
    arr,
    paramName
  ) {
    // eslint-disable-next-line init-declarations
    let item;
    arr.forEach(params => {
      if (params.name === paramName) {
        const index = arr.indexOf(params);
        if (index >= 0) {
          item = arr.splice(index, 1);
        }
      }
    });
    /*
     * If (item == undefined) {
     * return item;
     *}
     */
    return (item && item[0]) || undefined;
  };
  OptionHelper.prototype.getParams = function getParams(paramName) {
    return this.optionParams[paramName];
  };
  OptionHelper.prototype.getLastParamName = function getLastParamName() {
    return this.lastParamName;
  };
  OptionHelper.prototype.compare = function compare(a, b) {
    return a.priority - b.priority;
  };

  // eslint-disable-next-line max-params
  OptionHelper.prototype.swapParams = function swapParams(
    paramsName,
    oldName,
    newName,
    render
  ) {
    const thisParms = this.getParams(paramsName);
    const itemToHide = this.popAndRemoveElement(thisParms.items, oldName);
    if (itemToHide) {
      thisParms.hidenItems.push(itemToHide);
      thisParms.items.push(
        this.popAndRemoveElement(thisParms.hidenItems, newName)
      );
      thisParms.items.sort(this.compare);
      if (render) {
        this.show(paramsName);
      }
    }
  };

  OptionHelper.prototype.showParams = function showParams(
    paramsName,
    name,
    render
  ) {
    const thisParms = this.getParams(paramsName);
    const itemToShow = this.popAndRemoveElement(thisParms.hidenItems, name);
    if (itemToShow) {
      thisParms.items.push(itemToShow);
    }
    thisParms.items.sort(this.compare);
    if (render) {
      this.show(paramsName);
    }
  };
  OptionHelper.prototype.hideParams = function hideParams(
    paramsName,
    name,
    render
  ) {
    const thisParms = this.getParams(paramsName);
    const itemToHide = this.popAndRemoveElement(thisParms.items, name);
    // Condition added to prevent adding unncessary "undefined" into array
    if (itemToHide) {
      thisParms.hidenItems.push(itemToHide);
    }
    thisParms.items.sort(this.compare);
    if (render) {
      this.show(paramsName);
    }
  };
  OptionHelper.prototype.hideMenu = function hideMenu() {
    this.softkeyPanel && this.softkeyPanel.hide();
    this.softkeyPanel.stopListener();
  };
  OptionHelper.prototype.showMenu = function showMenu() {
    this.softkeyPanel && this.softkeyPanel.show();
    this.softkeyPanel.startListener();
  };
  OptionHelper.prototype.saveContext = function saveContext() {
    if (this.softkeyPanel) {
      const leftKey = this.softkeyPanel.getLeftKey();
      buttonState.leftKeyState = leftKey.classList.contains('hide');
      leftKey.classList.remove('hide');
      buttonState._cacheParams = this.getLastParamName();
    }
  };
  OptionHelper.prototype.returnContext = function returnContext() {
    if (this.softkeyPanel) {
      this.show(buttonState._cacheParams);
      buttonState.leftKeyState &&
        this.softkeyPanel.getLeftKey().classList.add('hide');
    }
  };
  OptionHelper.prototype.getLeftKey = function getLeftKey() {
    return this.softkeyPanel.getLeftKey();
  };
  OptionHelper.prototype.setLast = function setLast(selector) {
    buttonState._cacheParams = selector;
  };
  OptionHelper.prototype.getSoftKeyByName = function getSoftKeyByName(key) {
    // eslint-disable-next-line init-declarations
    let button;
    try {
      button = this.softkeyPanel[`get${firtsUpper(key)}Key`]();
    } catch (err) {
      // If some st dev try to get not being existed button
      console.error(err);
      return null;
    }
    return button;
  };
  /*
   * Get softkey button [left, center, right] and if it exists check visibility state if it does not hide return true
   * @param String one of [left, center, right] default value is left
   * @return Boolean
   */
  OptionHelper.prototype.isAvailable = function isAvailable(key) {
    let result = false;
    const button = this.getSoftKeyByName(key || (key = 'left'));
    button && (result = !button.classList.contains('hide'));
    return result;
  };
  /*
   * Do softkey btns visible or invisible
   * @param btn String one of [left, center, right] default value is left
   * @param state String one of [show, hide] default value is show
   * @void
   */
  OptionHelper.prototype.changeBtnState = function changeBtnState(btn, state) {
    const button = this.getSoftKeyByName(btn || (btn = 'left'));
    try {
      button && this[`do${firtsUpper(state || (state = 'show'))}Btn`](button);
    } catch (err) {
      // If the same as first dev try to change not existed state
      console.error(err);
    }
  };

  OptionHelper.prototype.doShowBtn = function doShowBtn(button) {
    button.classList.remove('hide');
  };

  OptionHelper.prototype.doHideBtn = function doHideBtn(button) {
    button.classList.add('hide');
  };

  exports.OptionHelper = new OptionHelper();
})(window);
