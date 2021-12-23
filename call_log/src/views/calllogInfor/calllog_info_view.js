import React from 'react';
import Service from 'service';
import SoftKeyStore from 'soft-key-store';
import Voicemail from 'utils/Voicemail';
import BlockIcon from 'components/BlockIcon/index';
import CallIcon from 'components/CallIcon/index';

import {
  getCallIcon,
  headerDate,
  isLowMemoryDevice
} from 'utils/calllog_utils';

import {
  hasBlockingFeature,
  isBlocked,
  blockNumber,
  unblockNumber
} from 'utils/blocking_utils';

import './info.scss';

const { get: _ } = window.api.l10n;

class CalllogInfoView extends React.PureComponent {
  constructor(props) {
    super(props);
    this.name = 'CalllogInfoView';

    this.SCROLL_STEP = 40;
    this.currentScrollPosition = 0;
    this.state = {
      isBlocked: undefined
    };
    this.showContactIcon = !isLowMemoryDevice();
    Service.register('focus', this);
  }

  componentDidMount() {
    const { number } = this.props;
    this.updateSoftKeys();
    this.element.focus();
    if (hasBlockingFeature()) {
      isBlocked(number).then(blocked => {
        this.setState({ isBlocked: blocked });
        this.updateSoftKeys();
      });
    }
  }

  componentDidUpdate() {
    // Keep focus
    this.focus();
  }

  componentWillUnmount() {
    Service.unregister('focus', this);
  }

  onKeyDown(evt) {
    const { changeView } = this.props;
    const { isBlocked } = this.state;
    switch (evt.key) {
      case 'MicrophoneToggle':
        evt.preventDefault();
        evt.stopPropagation();
        break;
      case 'Backspace':
      case 'SoftLeft':
        evt.preventDefault();
        evt.stopPropagation();
        changeView({ currentView: 'listView' });
        break;
      case 'SoftRight':
        const { number } = this.props;
        if (!number) {
          break;
        }
        isBlocked ? this.unblock(number) : this.block(number);
        break;
      case 'ArrowUp':
        evt.preventDefault();
        evt.stopPropagation();

        this._scrollUp();
        break;
      case 'ArrowDown':
        evt.preventDefault();
        evt.stopPropagation();

        this._scrollDown();
        break;
    }
  }

  focus = () => {
    const { openDialog } = this.props;
    if (!openDialog && this.element && document.activeElement !== this.element) {
      this.element.focus();
    }
  };

  _scrollUp() {
    const scrollList = this.element.querySelector('.call-duration-list');
    if (this.currentScrollPosition > 0) {
      this.currentScrollPosition -= this.SCROLL_STEP;
      scrollList.scrollTop = this.currentScrollPosition;
    }
  }
  _scrollDown() {
    const scrollList = this.element.querySelector('.call-duration-list');
    const style = window.getComputedStyle(scrollList, null);
    const height = parseInt(
      style.getPropertyValue('height').replace(/[^0-9.]+/g, '')
    );
    if (
      scrollList.scrollHeight > 0
      && (this.currentScrollPosition + height <= scrollList.scrollHeight)
    ) {
      this.currentScrollPosition += this.SCROLL_STEP;
      scrollList.scrollTop = this.currentScrollPosition;
    }
  }

  unblock(number) {
    if (!hasBlockingFeature()) {
      return;
    }

    unblockNumber(number)
      .then(_ => {
        this.setState({ isBlocked: false });
        this.updateSoftKeys();
      })
      .catch(err => {
        console.error(err);
      });
  }

  block(number) {
    const { showDialog } = this.props;
    if (!hasBlockingFeature()) {
      return;
    }

    showDialog({
      openDialog: true,
      options: {
        header: 'confirmation',
        type: 'confirm',
        ok: 'block',
        content: 'blockContact',
        onOk: () => {
          showDialog({ openDialog: false });
          blockNumber(number)
            .then(_ => {
              this.setState({ isBlocked: true });
              this.updateSoftKeys();
            })
            .catch(err => {
              console.log(err);
            });
        },
        onCancel: () => {
          showDialog({ openDialog: false });
        }
      }
    });
  }

  updateSoftKeys() {
    const { number } = this.props;
    const { isBlocked } = this.state;

    if (number && hasBlockingFeature()) {
      SoftKeyStore.register(
        {
          left: 'cancel',
          right: isBlocked === undefined
            ? ''
            : (isBlocked ? 'unblock' : 'block')
        },
        this.element
      );
    } else {
      SoftKeyStore.register(
        {
          left: 'cancel'
        },
        this.element
      );
    }
  }

  render() {
    const {
      calls,
      callType,
      emergency,
      date = 0,
      itemContact = {},
      number,
      radioTech,
      simNum,
      serviceId,
      isWifiLogo
    } = this.props;
    const { isBlocked } = this.state;

    const localDate = new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });

    let primaryInfo = number;
    let isSdnContact = false;
    const contacts = window.sdnContacts.get()[serviceId];

    if (contacts && contacts.get(number)) {
      primaryInfo = contacts.get(number);
      isSdnContact = true;
    } else if (itemContact.name) {
      primaryInfo = itemContact.name;
    }

    let primaryInfoL10n = primaryInfo ? '' : 'withheld-number';

    let headIcon = '';
    if (this.showContactIcon) {
      headIcon = (
        <i className="icon" data-icon="contacts" role="presentation" />
      );
    }

    let additionalInfoL10n = itemContact.type || 'unknown';

    const voicemail = Voicemail.check(number, serviceId);

    if (voicemail || emergency || isSdnContact) {
      primaryInfoL10n = emergency
        ? 'emergencyNumber'
        : voicemail
          ? 'voicemail'
          : '';

      additionalInfoL10n = '';
    } else if (
      this.showContactIcon
      && !isSdnContact
      && itemContact.photoBlob
    ) {
      const style = {
        backgroundImage: `url(
          data:${itemContact.photoType};base64,${itemContact.photoBlob}
        )`
      };
      headIcon = <i className="icon" style={style} role="presentation" />;
    }

    /**
     * How to show number info?
     * 1. emergency Number
     *  Number
     * 2. contact Number
     *  NumberType, number
     * 3. Other number
     *  Unknown
     */

    let additionalInfo = '';
    if (!additionalInfoL10n) {
      additionalInfo = number;
    } else if (itemContact.type) {
      additionalInfo = ', ' + number;
    } else {
      additionalInfo = '';
    }

    const blockIcon = hasBlockingFeature() && isBlocked ? <BlockIcon /> : null;

    const iconData = getCallIcon({ callType, simNum });
    const callsDom = (calls || [this.props]).map(call => {
      const callDate = new Date(call.date);
      const timeInfo = callDate.toLocaleString(navigator.language, {
        hour: 'numeric',
        minute: 'numeric',
        hour12: window.api.hour12
      });

      const additionalInfoDom = callType.split('_')[0] === 'missed' ? null : (
        <div className="additional-info">
          <span>{CalllogInfoView._prettyDuration(call.duration)}</span>
        </div>
      );

      return (
        <div className="list-item" key={call.date}>
          <div className="content">
            <div className="primary-info">
              <span>{timeInfo}</span>
            </div>
            <div className="secondary-info">
              <span data-l10n-id={`${callType.split('_')[0]}Call`} />
            </div>
            {additionalInfoDom}
          </div>
          <CallIcon
            isWifiLogo={isWifiLogo}
            iconData={iconData}
            radioTech={radioTech}
          />
        </div>
      );
    });

    return (
      <div
        id="info-view"
        tabIndex={-1}
        ref={element => (this.element = element)}
        onKeyDown={e => this.onKeyDown(e)}
      >
        <div
          className="header h1"
          id="calllog-info"
          data-l10n-id="callInformation"
        />
        <div className="list">
          <div className="list-item">
            {headIcon}
            <div className="content">
              <div className="primary-info">
                <span data-l10n-id={primaryInfoL10n}>{primaryInfo}</span>
              </div>
              <div className="additional-info">
                <span data-l10n-id={additionalInfoL10n} />
                <span>{additionalInfo}</span>
              </div>
            </div>
            {blockIcon}
          </div>
          <p className="group-header">{headerDate(localDate)}</p>
          <div className="call-duration-list">{callsDom}</div>
        </div>
      </div>
    );
  }
}

CalllogInfoView._prettyDuration = function (d) {
  const h = parseInt(d / 3600000);
  const m = parseInt((d % 3600000) / 60000);
  const s = parseInt((d % 60000) / 1000);

  let ret = [];
  if (h !== 0) {
    ret.push(_('durationHours', { value: h }));
  }
  if (m !== 0) {
    ret.push(_('durationMinutes', { value: m }));
  }
  if (s !== 0) {
    ret.push(_('durationSeconds', { value: s }));
  }
  return ret.join(' ');
};

export default CalllogInfoView;
