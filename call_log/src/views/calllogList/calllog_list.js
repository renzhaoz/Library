/* global DeviceCapabilityManager */

import React from 'react';
import Service from 'service';

import activity from 'utils/activity';
import { headerDate } from 'utils/calllog_utils';

import CalllogListItem from './calllog_list_item';

class CalllogList extends React.Component {
  constructor(props) {
    super(props);
    this.name = 'CalllogList';
    this.DEBUG = false;
    this.ITEM_HEIGHT = 62;
    this.GROUNPHEADHEIGHT = 22;
    this.CACHE_NUMBER = 5;
    this.listItemIndex = {};
    this.calllogStore = props.calllogStore;
    this.renderNumbers = new Map();
    this.state = {
      isWifiLogo: false
    }
  }

  componentDidMount() {
    // get wifi logo, wifi or wlan
    const params = 'device.wifi.certified';
    DeviceCapabilityManager
      .get(params)
      .then((isWifiLogo) => {
        this.setState({ isWifiLogo: !!isWifiLogo });
      });
  }

  scrollFocusItemIntoView(focusItem) {
    const focusElement = document.querySelector(`#root #li-${focusItem}`);
    const list = this.element;
    let listTop = list.offsetTop;
    const header = list.querySelector('.group-header');
    if (header) {
      listTop = list.offsetTop + header.offsetHeight;
    }
    if (focusElement) {
      if (list.scrollTop + listTop > focusElement.offsetTop) {
        list.scrollTop = focusElement.offsetTop - listTop;
      } else if (list.scrollTop + list.offsetTop + list.clientHeight
        < focusElement.offsetTop + focusElement.clientHeight) {
        list.scrollTop = focusElement.offsetTop - list.offsetTop
          - list.clientHeight + focusElement.clientHeight;
      }
      list.stickyHiddenGap = focusElement.offsetHeight;
    }
  }

  componentDidUpdate() {
    const { focusItem } = this.props;
    this.scrollFocusItemIntoView(focusItem);
  }

  showOptionMenu = (id, focusItem, selectedTabIndex) => {
    const { showOptionMenu } = this.props;
    window.sessionStorage.focusItem = focusItem;
    window.sessionStorage.selectedTabIndex = selectedTabIndex;
    const item = this.listItemIndex[id].props;

    const shouldDebounce = (name) => [
      'sendSms', 'createNewContact', 'addToExistingContact'
    ].includes(name);

    let options = [
      'callInformation',
      'sendSms',
      'editCalllog'
    ];

    if (!item.itemContact) {
      const contactOptions = [
        'createNewContact',
        'addToExistingContact'
      ];

      options.splice(2, 0, ...contactOptions);
    }

    options = options.map(name => {
      const currentOption = {
        id: name,
        callback: () => {
          // Close option menu & run callback
          showOptionMenu({ openOptionMenu: false });
          this[`_option_${name}`](item);
        }
      };

      return shouldDebounce(name)
        ? { ...currentOption, debounce: 500 }
        : currentOption;
    });

    showOptionMenu({
      openOptionMenu: true,
      options
    });
  }

  _option_callInformation(item) {
    const { isWifiLogo } = this.state;
    const { changeView } = this.props;
    changeView({
      currentView: 'listInfoView',
      params: { ...item, isWifiLogo }
    });
  }

  _option_sendSms(item) {
    activity({
      name: 'new',
      data: {
        type: 'websms/sms',
        number: item.number
      }
    });
  }

  _option_createNewContact(item) {
    activity({
      name: 'new',
      data: {
        type: 'webcontacts/contact',
        caller: 'Call',
        params: {
          'tel': item.number
        }
      }
    });
  }

  _option_addToExistingContact(item) {
    activity({
      name: 'update',
      data: {
        type: 'webcontacts/contact',
        params: {
          'tel': item.number
        }
      }
    });
  }

  _option_editCalllog(item) {
    Service.request('setEditMode');
  }

  _skipRender(index) {
    const { focusItem } = this.props;
    if (
      index + this.CACHE_NUMBER < focusItem
      || focusItem + this.CACHE_NUMBER < index
    ) {
      return true;
    }

    return false;
  }

  _generateGroupDom() {
    const { isWifiLogo } = this.state;
    const { logItems, itemContacts, focusItem } = this.props;
    // logItems is in ASC order
    // and we create group dom in DSC order
    // that is, latest first

    // set group items by groupKey
    let groupMap = new Map();
    logItems.forEach((item, id) => {
      const groupKey = item.groupKey;
      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, []);
      }
      // set group children in DSC
      groupMap.get(groupKey).unshift(item);
    });

    // generate dom
    let dom = [];
    let index = logItems.size - 1;
    let topEdgeHeight = 0;
    let bottomEdgeHeight = 0;
    this.renderNumbers.clear();
    groupMap.forEach((groupItems, groupKey) => {
      const dateString = new Date(groupItems[0].date || 0);
      const localDate = dateString.toLocaleString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      });

      let items = [];
      let skipGroup = true;
      let adjustedIndex = index - (groupItems.length - 1);
      groupItems.forEach(item => {
        const itemContact = itemContacts.get(item.number);
        if (this._skipRender(adjustedIndex)) {
          if (adjustedIndex < focusItem) {
            topEdgeHeight += this.ITEM_HEIGHT;
          } else {
            bottomEdgeHeight += this.ITEM_HEIGHT;
          }
        } else {
          skipGroup = false;
          this.renderNumbers.set(item.number, {
            number: item.number
          });
          items.push(
            <CalllogListItem
              {...item}
              isWifiLogo={isWifiLogo}
              index={adjustedIndex}
              key={item.id}
              itemContact={itemContact}
              ref={listItem => this.listItemIndex[item.id] = listItem}
            />
          );
        }
        adjustedIndex++;
        index--;
      });

      if (skipGroup) {
        if (adjustedIndex < focusItem) {
          topEdgeHeight += this.GROUNPHEADHEIGHT;
        } else {
          bottomEdgeHeight += this.GROUNPHEADHEIGHT;
        }
      } else {
        const headerId = 'header-' + new Date(groupKey).getTime();
        // set group dom in DSC
        dom.unshift(
          <div
            className='group-container'
            key={groupKey}
          >
            <p
              className='group-header'
              id={headerId}
            >
              {headerDate(localDate)}
            </p>
            {items}
          </div>
        );
      }
    });
    const topEdgeStyle = {
      height: topEdgeHeight
    };
    const bottomEdgeStyle = {
      height: bottomEdgeHeight
    };
    if (topEdgeHeight || bottomEdgeHeight) {
      dom.unshift(
        <div
          id='top-edge'
          style={{ ...topEdgeStyle }}
          ref={(element) => this.topEdge = element}
        />
      );
      dom.push(
        <div
          id='bottom-edge'
          style={{ ...bottomEdgeStyle }}
          ref={(element) => this.bottomEdge = element}
        />
      );
    }
    return dom;
  }

  render() {
    const dom = this._generateGroupDom();
    return (
      <div
        className='list'
        tabIndex={-1}
        ref={(element) => this.element = element}
      >
        {dom}
      </div>
    );
  }
}

export default CalllogList;
