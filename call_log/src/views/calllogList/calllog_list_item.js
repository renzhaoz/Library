import React from 'react';
import Service from 'service';

import CallIcon from 'components/CallIcon/index';
import Voicemail from 'utils/Voicemail';

import { getCallIcon, isLowMemoryDevice } from 'utils/calllog_utils';

const { get: _ } = window.api.l10n;

class CalllogListItem extends React.Component {
  constructor(props) {
    super(props);
    this.name = 'CalllogListItem';
    this.DEBUG = false;
    this.showContactIcon = !isLowMemoryDevice();
  }

  render() {
    const {
      calls,
      callType,
      date,
      emergency,
      id,
      itemContact = null,
      number,
      radioTech,
      simNum,
      index,
      checked,
      serviceId,
      verStatus,
      isWifiLogo
    } = this.props;

    const iconData = getCallIcon({ callType, simNum });

    let primaryInfo = '';
    let primaryInfoL10nId = '';
    const voicemail = Voicemail.check(number, serviceId);
    const hasContact = itemContact !== null;
    primaryInfoL10nId = emergency
      ? 'emergencyNumber'
      : voicemail
        ? 'voicemail'
        : '';
    const sdnContacts = window.sdnContacts.get();
    let isSdnContact = false;
    if (!primaryInfoL10nId) {
      const contacts = sdnContacts[serviceId];
      if (contacts && contacts.get(number)) {
        primaryInfo = contacts.get(number);
        isSdnContact = true;
      } else if (itemContact && itemContact.name) {
        primaryInfo = itemContact.name;
      } else {
        primaryInfo = number;
      }
      if (!primaryInfo) {
        primaryInfoL10nId = 'withheld-number';
      }
    }
    if (primaryInfoL10nId && !primaryInfo) {
      primaryInfo = _(primaryInfoL10nId);
    }

    let retryCountDom = null;
    if (calls && calls.length > 1) {
      retryCountDom = (
        <span className="retry-count" aria-hidden="true">
          ({calls.length})
        </span>
      );
    }
    let stirDom = null;
    if (verStatus === 'pass') {
      stirDom = <div className="stir-checked" aria-hidden="true" />;
    }
    let hour12Value = window.api.hour12;
    if (hour12Value === null) {
      const backupHour12 = Service.query('getBackupHour12');
      if (backupHour12 !== null) {
        hour12Value = backupHour12;
      }
    }
    const callDate = new Date(date);
    const timeInfo = callDate.toLocaleString(navigator.language, {
      hour: 'numeric',
      minute: 'numeric',
      hour12: hour12Value
    });

    let secondaryInfo = timeInfo;
    let additionalInfoDom = null;
    let additionalInfoL10n = '';
    let additionalInfo = '';
    if (!isSdnContact && itemContact && itemContact.type) {
      additionalInfoL10n = itemContact.type;
    }
    if (emergency || voicemail) {
      additionalInfo = timeInfo;
      additionalInfoL10n = '';
      secondaryInfo = number;
    }
    if (additionalInfoL10n || additionalInfo) {
      if (!additionalInfo) {
        additionalInfo = _(additionalInfoL10n);
      }
      additionalInfoDom = (
        <div className="additional-info">
          <span data-l10n-id={additionalInfoL10n}>{additionalInfo}</span>
        </div>
      );
    }

    // head box or thumb will be shown/hidden by css without re-rendering
    const dataIcon = checked ? 'check-on' : 'check-off';

    const boxDom = (
      <i
        className="icon box"
        data-icon={dataIcon}
        data-id={id}
        role="presentation"
      />
    );

    let thumbDom = '';

    if (
      this.showContactIcon
      && !emergency
      && !voicemail
      && !isSdnContact
      && itemContact
      && itemContact.photoBlob
    ) {
      thumbDom = (
        <i
          className="icon thumb"
          style={{
            backgroundImage: `url(
              data:${itemContact.photoType};base64,${itemContact.photoBlob}
            )`
          }}
          role="presentation"
          aria-hidden="true"
        />
      );
    } else {
      thumbDom = (
        <i
          className="icon thumb"
          data-icon="contacts"
          role="presentation"
          aria-hidden="true"
        />
      );
    }

    return (
      <div
        className="list-item"
        tabIndex={-1}
        ref={element => (this.element = element)}
        id={`li-${index}`}
        data-id={id}
        data-call-type={callType.split('_')[0]}
        data-number={number}
        data-contact={hasContact}
      >
        {boxDom}
        {thumbDom}
        <div className="content" role="textbox">
          <div className="primary-info">
            <span data-l10n-id={primaryInfoL10nId}>{primaryInfo}</span>
            {retryCountDom}
            {stirDom}
          </div>
          <div className="secondary-info">
            <span>{secondaryInfo}</span>
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
  }
}

export default CalllogListItem;
