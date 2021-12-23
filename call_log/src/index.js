import React from 'react';
import { render } from 'react-dom';
import ReactDOMServer from 'react-dom/server';

import 'common-scss';

import SdnContacts from 'utils/sdn_contacts';

import Main from 'views/main/index';

window.MAX_LIST_LENGTH = 100;

function start() {
  window.sdnContacts = new SdnContacts();

  window.renderToString = renderToString;
  window.addEventListener('renderDomToString', () => {
    renderToString();
  });
}

const renderToString = () => {
  console.log('current logs:', JSON.parse(localStorage.logs));
  const stringDom = ReactDOMServer.renderToStaticMarkup(
    <Root isSnapshot />
  );

  window.domString = stringDom;
}

class Root extends React.Component {
  constructor(props) {
    super(props);

    if (!props.isSnapshot) {
      const servicesArray = [
        'settingsService',
        'devicecapabilityService',
        'contactsService',
        'timeService'
      ];
      window.libSession.initService(servicesArray).then(() => {
        SettingsObserver.init();
      });

      DeviceCapabilityManager.get('hardware.memory').then((memOnDevice) => {
        localStorage.setItem('hardware-memory', memOnDevice);
        if (memOnDevice === 256) {
          document.body.classList.add('low-memory-device');
          window.MAX_LIST_LENGTH = 50;
        }
      });
    }
  }

  componentDidMount() {
    const { isSnapshot } = this.props;

    if (!isSnapshot) {
      // Add mark
      window.performance.mark('fullyLoaded');

      // Snapshot view
      import('utils/snapshot.js').then(() => {
        console.log('View is ready to cache！');
      });
    }
  }

  render() {
    const { isSnapshot } = this.props;
    return (
      <Main isSnapshot={isSnapshot} />
    );
  }
}

start();

window.api.l10n.once(() => {
  render(
    <Root isSnapshot={false} />,
    document.getElementById('root')
  );
});

export default Root;
