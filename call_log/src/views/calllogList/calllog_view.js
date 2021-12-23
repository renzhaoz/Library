import React from 'react';
import Service from 'service';
import SoftKeyStore from 'soft-key-store';

import activity from 'utils/activity';
import SimCardHelper from 'utils/sim_card_helper';
import StickyHeader from 'utils/sticky_header';

import dial_helper from 'utils/dial_helper/index';
import { closeNotificationIfNotHidden } from 'utils/calllog_utils';

import Tabs from 'components/Tab/index';
import CalllogList from './calllog_list';

import './calllog-view.scss';
import './snapshot.css';

const { get: _ } = window.api.l10n;

/**
 * @typedef {Object} CallOption - call option for react-option-menu
 * @property {string} label - option label
 * @property {function} callback - option callback
 */

/**
 * CalllogView is responsible for all UI rendering,
 * soft key update and key events.
 *
 */
class CalllogView extends React.PureComponent {
  constructor(props) {
    super(props);
    this.name = 'CalllogView';
    this.DEBUG = false;

    this.tabNames = [
      'all',
      'missed',
      'outgoing',
      'incoming'
    ];

    this.checkedCount = 0;
    this.focusSelector = '.list-item';
    this.timer = null;

    const { focusItem: cacheFocusItem, selectedTabIndex: cacheSelectIndex } = window.sessionStorage;
    const selectedTabIndex = (cacheSelectIndex ? Number.parseInt(cacheSelectIndex, 10) : 0);
    const focusItem = cacheFocusItem || 0;
    const curTabLogItems = this._filterCallTypeItems(props.logsStore, selectedTabIndex) || new Map();
    this.listedCount = curTabLogItems.size;

    this.state = {
      itemContacts: props.contactsStore,
      logItems: props.logsStore,
      curTabLogItems,
      timestamp: 0,
      focusItem,
      selectedTabIndex,
      isEditMode: false,
      itemId: -1,
      reRenderView: false
    };

    this.dialHelper = new dial_helper();
    this.config = {};
    this.stickyHeader = null;

    Service.register('focus', this);

    const { isSnapshot } = props;
    if (!isSnapshot) {
      TimeService.addEventListener('timeChange', this.updateList);
      window.addEventListener('timeformatchange', this.updateList);
      document.addEventListener('visibilitychange', this.updateList);
    }

  }

  updateList = (event) => {
    const { type = '' } = event || {};
    const { reRenderView, logItems } = this.state;
    switch (type) {
      case 'timeformatchange':
        if (Service.query('getBackupHour12') !== window.api.hour12) {
          this.setState({
            reRenderView: !reRenderView
          });
        }
        break;
      case 'visibilitychange':
        if (!document.hidden) {
          this.setState({
            reRenderView: !reRenderView
          });

          // Clean notice
          closeNotificationIfNotHidden();
        }
        break;
      default:

        // Time change
        this.setState({
          reRenderView: !reRenderView
        });
    }

    // Update cache view
    this.snapShotSoftKeyConfig = {};

    if (logItems.size > 0) {
      this.snapShotSoftKeyConfig = {
        center: 'call',
        left: 'contacts',
        right: 'options'
      }
    } else {
      this.snapShotSoftKeyConfig = {
        left: 'contacts',
      }
    }

    this.debounce(300);
  }

  debounce = (delay) => {
    clearTimeout(window.timer);
    window.timer = setTimeout(() => {
      Service.request('backupScreen', this.snapShotSoftKeyConfig);
    }, delay);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props !== nextProps) {
      const { selectedTabIndex } = this.state;
      this.setState({
        curTabLogItems: this._filterCallTypeItems(
          nextProps.logsStore,
          selectedTabIndex
        ),
        logItems: nextProps.logsStore,
        itemContacts: nextProps.contactsStore
      });
    }
  }

  componentDidMount() {
    const { isSnapshot } = this.props;

    if (!isSnapshot) {
      closeNotificationIfNotHidden();

      // Call log render complete
      window.dispatchEvent(new CustomEvent('calllogRenderComplete'));
    }

    // First render set default focus item
    this._focusItem();

    // expose edit mode for CalllogList
    Service.register('setEditMode', this);

    this.dialHelper.on('update', this._updateSoftKeys.bind(this));
    SimCardHelper.on('update', this._updateSoftKeys.bind(this));

    this.element.dataset.hasListedItems = this.listedCount !== 0;

    this._updateSoftKeys();

    window.performance.mark('navigationInteractive');
    window.performance.mark('contentInteractive');

    window.dispatchEvent(new CustomEvent('renderEnd'));

    // Close Snap Shot view & start render snapshot
    let snapshot = document.getElementById('snapshot') || null;
    if (snapshot) {
      document.body.removeChild(snapshot);
      snapshot = null;
    }

    const scrollable = this.element.querySelector('.body .list');
    const sticky = this.element.querySelector('.sticky');
    this.stickyHeader = new StickyHeader({ scrollable, sticky });
  }

  componentWillUnmount() {
    TimeService.removeEventListener('timeChange', this.updateList);
    window.removeEventListener('timeformatchange', this.updateList);
    document.removeEventListener('visibilitychange', this.updateList);

    // Clear Service
    Service.unregister('focus', this);
    Service.unregister('setEditMode', this);
  }

  _updateItems(items) {
    const { selectedTabIndex } = this.state;

    this.setState({
      logItems: items,
      curTabLogItems: this._filterCallTypeItems(items, selectedTabIndex)
    });
  }

  getSoftKeyConfig = () => {
    const { isEditMode } = this.state;
    let config = {};

    // activity view
    if (window.location.hash === '#pick') {
      if (this.listedCount === 0) {
        config = {
          'left': 'cancel'
        };
      } else {
        config = {
          'center': 'select',
          'left': 'cancel'
        };
      }

      return config;
    }

    // select view
    if (isEditMode) {
      if (this.listedCount) {
        config = {
          'left': 'calllog-all',
          'center': 'select'
        };

        if (this.checkedCount > 0) {
          config.right = 'delete';
        }
        const box = document.activeElement.querySelector('.box');
        if (box && box.dataset.icon === 'check-on') {
          config.center = 'deselect';
        }

        if (this.checkedCount === this.listedCount) {
          config.left = 'calllog-none';
        }
      }

      return config;
    }

    // default view
    if (this.listedCount) {
      config = {
        'left': 'contacts',
        'center': {
          text: 'call',
          icon: ''
        },
        'right': 'options'
      };
      if (this.dialHelper.showRttCall()) {
        config.center.text = 'rtt-call';
      }
      if (SimCardHelper.showSimIndicator()) {
        config.center.icon = `sim-${SimCardHelper.cardIndex + 1}`;
      }

      return config;
    }

    return { 'left': 'contacts' };
  }

  _updateSoftKeys() {
    const { isSnapshot } = this.props;
    const config = this.getSoftKeyConfig();

    SoftKeyStore.register(config, this.element);
    this.config = config;
  }

  componentDidUpdate(prevProps, prevState) {
    const { isSnapshot, logsStore } = this.props;
    const { isEditMode, selectedTabIndex, curTabLogItems } = this.state;

    this.listedCount = curTabLogItems.size;
    // this will update UI after items rendered
    this.element.dataset.hasListedItems = this.listedCount !== 0;

    // Keep focus dom
    if (
      !this.listedCount
      && !isSnapshot
    ) {
      this.element.focus();
    }

    if (isEditMode) {
      this._setCheckedCount();
    }

    if (selectedTabIndex !== prevState.selectedTabIndex) {
      this._updateListNavigator();
    }
    this._focusItem();
    this._updateSoftKeys();

    this.stickyHeader.refresh();
  }

  _focusElement(element) {
    const { openDialog, openOptionMenu, isSnapshot } = this.props;

    if (
      element !== document.activeElement
      && !isSnapshot
      && !document.activeElement.classList.contains('menu-item')
      && !openDialog
      && !openOptionMenu
    ) {
      element.focus();
    }
  }

  _focusItem() {
    const { openDialog, openOptionMenu } = this.props;
    const { focusItem } = this.state;
    // Dialog & optionMenu not exist
    if (!openDialog || !openOptionMenu) {
      if (this.element) {
        const focusItemDom = this.element.querySelector(`#li-${focusItem}`);
        if (focusItemDom) {
          this._focusElement(focusItemDom);
        } else {
          const empty = this.element.querySelector('.no-result');
          this._focusElement(empty);
        }
      }
    }
  }

  onKeyDown(evt) {
    const { isEditMode } = this.state;

    if (evt.key === 'MicrophoneToggle') {
      evt.preventDefault();
      evt.stopPropagation();
      return;
    }

    // avtivity is on going, nothing can run now.
    if (window.activityIsWorking) { return false; }

    this.onTabKeyDown(evt);
    this.onListKeyDown(evt);

    if (window.location.hash === '#pick') {
      this.onActivityKeyDown(evt);
      return;
    }
    if (isEditMode) {
      this.onEditModeKeyDown(evt);
    } else {
      this.onItemKeyDown(evt);
    }
  }

  onActivityKeyDown(evt) {
    if (navigator.serviceWorker.controller) {
      switch (evt.key) {
        case 'SoftLeft':
        case 'Backspace':
        case 'EndCall':
          navigator.serviceWorker.controller.postMessage({
            name: 'addCall',
            value: null
          });
          window.close();
          break;
        case 'Call':
        case 'Enter':
          if (this.listedCount) {
            const tel = [{ value: evt.target.dataset.number }];
            navigator.serviceWorker.controller.postMessage({
              name: 'addCall',
              value: { tel }
            });
            window.close();
          }
          break;
        default:
          break;
      }
    }
  }

  onListKeyDown(evt) {
    switch (evt.key) {
      case 'ArrowUp':
      case 'ArrowDown':
        evt.preventDefault();
        evt.stopPropagation();
        this._changeFocus(evt.key);
        break;
    }
  }

  onTabKeyDown(evt) {
    const { selectedTabIndex } = this.state;
    let nextIndex;
    const isLtr = document.documentElement.dir !== 'rtl';
    if (isLtr) {
      switch (evt.key) {
        case 'ArrowRight':
          nextIndex = selectedTabIndex + 1;
          if (nextIndex <= this.tabNames.length - 1) {
            this.setSelectedTabIndex(nextIndex);
          }
          break;
        case 'ArrowLeft':
          nextIndex = selectedTabIndex - 1;
          if (nextIndex >= 0) {
            this.setSelectedTabIndex(nextIndex);
          }
          break;
      }
    } else {
      switch (evt.key) {
        case 'ArrowRight':
          nextIndex = selectedTabIndex - 1;
          if (nextIndex >= 0) {
            this.setSelectedTabIndex(nextIndex);
          }
          break;
        case 'ArrowLeft':
          nextIndex = selectedTabIndex + 1;
          if (nextIndex <= this.tabNames.length - 1) {
            this.setSelectedTabIndex(nextIndex);
          }
          break;
      }
    }
  }

  _filterCallTypeItems(logItems, index) {
    const { isSnapshot } = this.props;

    const callType = this.tabNames[index];
    if (isSnapshot) {
      let number = Service.query('snapshotItemNumber');
      if (logItems.size > number) {
        return new Map([...logItems.entries()].slice(logItems.size - number));
      }
    }
    return new Map([...logItems.entries()].filter(item =>
      callType === 'all' || callType === item[1].callType.split('_')[0]));
  }

  _changeFocus(eventKey) {
    let { focusItem } = this.state;
    const { curTabLogItems } = this.state;
    if (eventKey === 'ArrowUp') {
      focusItem--;
    } else {
      focusItem++;
    }
    if (focusItem < 0) {
      focusItem = curTabLogItems.size - 1;
    } else if (focusItem >= curTabLogItems.size) {
      focusItem = 0;
    }
    this.setState({
      focusItem: focusItem
    });
  }

  async onItemKeyDown(evt) {
    const { id, number, contact } = evt.target.dataset;

    switch (evt.key) {
      case 'Call':
      case 'Enter':
        try {
          id && this.dialHelper.call(number, contact);
        } catch (err) {
          console.error(err);
          return;
        }
        break;
      case 'SoftLeft':
        activity({
          name: 'launch',
          data: {
            type: 'app/contacts'
          }
        });
        break;
      case 'SoftRight':
        // show options menu view
        const { focusItem, selectedTabIndex } = this.state;
        id && this.list.showOptionMenu(id, focusItem, selectedTabIndex);
        break;
      default:
        break;
    }
  }

  onEditModeKeyDown(evt) {
    const { contactsStore } = this.props;

    const id = evt.target.dataset.id;
    switch (evt.key) {
      case 'Backspace':
        evt.stopPropagation();
        evt.preventDefault();

        this.toggleAll('off', 'allItems');
        this.setState({
          isEditMode: false
        });
        break;
      case 'Enter':
        this.toggleCheckbox(id);
        break;
      case 'SoftLeft':
        // select or deselect all
        if (this.checkedCount !== this.listedCount) {
          this.toggleAll('on');
        } else {
          this.toggleAll('off');
        }
        break;
      case 'SoftRight':
        // delete
        if (this.checkedCount === 1) {
          const boxNodes = this._boxNodes('on');
          const number = boxNodes[0].parentNode.dataset.number;
          let name = number || _('withheld-number');
          const itemContact = contactsStore.get(number);
          if (itemContact && itemContact.name) {
            name = itemContact.name;
          }
          this._showDeleteDialog(_('delete-single-log', { name: name }));
        } else if (this.checkedCount > 0) {
          this._showDeleteDialog(_('deleteLog'));
        }
        break;
    }
  }

  setEditMode() {
    this.toggleAll('off', 'allItems');
    this.setState({
      isEditMode: true
    });
  }

  /**
   * Switch to the tab
   */
  setSelectedTabIndex(index) {
    const { logItems } = this.state;
    this.setState({
      focusItem: 0,
      selectedTabIndex: index,
      curTabLogItems: this._filterCallTypeItems(logItems, index)
    });
  }

  toggleCheckbox(id) {
    const { curTabLogItems } = this.state;
    const box = this.element.querySelector(`.list-item[data-id='${id}'] [data-icon^=check-]`);
    if (box && box.dataset && box.dataset.icon) {
      box.dataset.icon = box.dataset.icon === 'check-off' ? 'check-on' : 'check-off';
      curTabLogItems.get(id).checked = box.dataset.icon !== 'check-off';
      this._setCheckedCount();
    }
  }

  // select or deselect all
  toggleAll(onOff, allItems) {
    const { logItems, curTabLogItems } = this.state;
    const boxNodes = this._boxNodes();
    Array.from(boxNodes).forEach(box => {
      box.dataset.icon = 'check-' + onOff;
    });
    let checked = onOff !== 'off';
    if (allItems) {
      logItems.forEach(item => item.checked = checked);
    } else {
      curTabLogItems.forEach(item => item.checked = checked);
    }
    this._setCheckedCount();
  }

  _doDeletion = () => {
    const { curTabLogItems, logItems, selectedTabIndex, focusItem } = this.state;
    const { deleteLogs } = this.props;

    window.performance.mark('delete-start');

    let selectedIds = [];
    curTabLogItems.forEach(item => {
      if (item.checked) {
        selectedIds.push(item.id);
      }
    });

    const toastOptions = {
      messageL10nId: 'deletedNotification-1',
      messageL10nArgs: {
        n: this.checkedCount
      }
    };

    // response to UI first
    this._showToast(toastOptions);
    const newItems = new Map([...logItems.entries()].filter(item => !selectedIds.includes(item[0])));
    const newCurTabLogItems = this._filterCallTypeItems(newItems, selectedTabIndex);
    let newFocusItem = Math.min(newCurTabLogItems.size - 1, focusItem);
    newFocusItem = Math.max(newFocusItem, 0);
    this.toggleAll('off', 'allItems');
    this.setState({
      logItems: newItems,
      curTabLogItems: newCurTabLogItems,
      focusItem: newFocusItem,
      isEditMode: false
    });

    // Update List first
    deleteLogs(selectedIds);

    // actually delete
    window.performance.mark('delete-start');
    setTimeout(() => {
      new DB()
        .deleteData(selectedIds)
        .then(() => {
          console.log('Delete call log items success!');

          // Set focus item
          this._focusElement(this.element);

          // Add mark
          window.performance.mark('delete-end');
          window.performance.measure(
            'performance-calllog-delete',
            'delete-start',
            'delete-end'
          );

          // Clear mark & measure
          window.performance.clearMarks('delete-start');
          window.performance.clearMarks('delete-end');
          window.performance.clearMeasures('performance-calllog-delete');
        })
        .catch(err => {
          this._showToast({
            message: 'Something wrong',
          });

          // Clear mark & measure
          window.performance.clearMarks('delete-start');
          window.performance.clearMarks('delete-end');
          window.performance.clearMeasures('performance-calllog-delete');
          console.error('Error deleting selected items:', err);
        })
    }, 300);
  }

  _showDeleteDialog(message) {
    const { showDialog } = this.props;
    showDialog({
      openDialog: true,
      options: {
        header: _('confirmation'),
        type: 'confirm',
        ok: 'delete',
        content: message,
        translated: true,
        onOk: () => {
          // Hidden dialog
          showDialog({ openDialog: false });

          this._doDeletion();
        },
        onCancel: () => {
          showDialog({ openDialog: false })
        }
      }
    });
  }

  /**
   * Get checked item count under current selected tab
   */
  _setCheckedCount() {
    this.checkedCount = this._getCheckedCount();
    this.header.dataset.checkedCount = this.checkedCount;
    this._updateSoftKeys();
  }

  _getCheckedCount() {
    const { curTabLogItems } = this.state;
    let count = 0;
    curTabLogItems.forEach(item => {
      if (item.checked) {
        count++;
      }
    })
    return count;
  }

  /**
   * Get edit mode chechbox nodes
   * @params {string} onOff Checkbox type. If set, should be 'on' or 'off'
   */
  _boxNodes(onOff) {
    if (!onOff) {
      onOff = '';
    }

    const selector = `${this.focusSelector} [data-icon^=check-${onOff}]`;
    return this.element.querySelectorAll(selector);
  }

  /**
   * Due to the list items' visibility change when switching tabs,
   * we need to update(rebuild) list navigator
   */
  _updateListNavigator() {
    const { isSnapshot } = this.props;
    if (!isSnapshot) {
      this.element.focus();
    }
  }

  /**
   * Store css selector of navigation items under current selected tab
   */
  _setFocusSelector() {
    const { selectedTabIndex } = this.state;
    const callType = this.tabNames[selectedTabIndex];
    const callTypeSelector = callType === 'all' ? '' : `[data-call-type='${callType}']`;
    this.focusSelector = `.list-item${callTypeSelector}`;
  }

  _showToast(options) {
    Toaster.showToast(options);
  }

  focus = () => {
    this._focusItem();
  }

  render() {
    const {
      isEditMode,
      selectedTabIndex,
      itemId,
      curTabLogItems,
      itemContacts,
      timestamp,
      focusItem,
      reRenderView
    } = this.state;

    const {
      isSnapshot,
      changeView,
      showOptionMenu
    } = this.props;

    const listProps = {
      itemId,
      changeView,
      logItems: curTabLogItems,
      itemContacts,
      callType: this.tabNames[selectedTabIndex],
      timestamp,
      focusItem,
      showOptionMenu,
      reRenderView
    }

    this._setFocusSelector();
    const headerL10n = isEditMode ? 'checkedCount' : 'callLog';
    const selectedTabName = this.tabNames[selectedTabIndex];
    const headerLabel = 'calllog ' + selectedTabName;

    return (
      <div
        id='calllog-view'
        tabIndex={-1}
        ref={(element) => this.element = element}
        role="heading"
        aria-labelledby={headerLabel}
        data-view-call-type={selectedTabName}
        data-is-edit-mode={isEditMode}
        onKeyDown={isSnapshot ? (e) => { } : (e) => this.onKeyDown(e)}
        onFocus={(e) => this.focus()}
      >
        <div
          ref={header => this.header = header}
          className="header h1"
          id="calllog"
        >
          {_(headerL10n)}
        </div>
        <Tabs
          tabNames={this.tabNames}
          selectedIndex={selectedTabIndex}
        />
        <div className='body'>
          <div
            className="no-result primary"
            tabIndex={-1}
            role="textbox"
            style={{ display: curTabLogItems.size > 0 ? 'none' : '' }}
          >
            <div>
              {_('no-logs-msg-1')}
            </div>
            <div
              className={window.location.hash === '#pick' ? 'hide' : ''}
            >
              {_('no-logs-msg-2')}
            </div>
          </div>
          <CalllogList ref={list => this.list = list} {...listProps} />
          <div className="sticky"></div>
        </div>
      </div>
    );
  }
}

export default CalllogView;
