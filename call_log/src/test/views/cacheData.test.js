import React from 'react';
import { render, cleanup } from '@testing-library/react';
import cacheData from 'views/main/cacheData';

let appData = null;
const callEndData = {
  callType: 'missed_lte',
  date: 804242521292,
  direction: 'incoming',
  duration: 0,
  emergency: false,
  groupKey: '6/27/1995',
  hangUpLocal: true,
  id: '6271995-057156198679-missed_lte-0',
  isRtt: false,
  isVt: false,
  number: 1191,
  radioTech: 'ps',
  serviceId: 0
};

let myEvent = new CustomEvent('CONTACT_CHANGE', {});
class TestComponent extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
    setTimeout(() => {
      props.deleteLogs(['1'])
    }, 1000);
  }

  static getDerivedStateFromProps(props, state) {
    appData = props;
    return null;
  }

  render() {
    return (<div></div>);
  }
}

const keepAlive = () => new Promise((resolve, reject) => {
  setTimeout(() => { resolve() }, 4000);
});

const Component = cacheData(TestComponent);
const { debug } = render(<Component />);

describe('CacheData Test', () => {
  it('Processing data normal!', async (done) => {
    // wait db run end.
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('telephony-call-ended', {
        detail: { data: callEndData }
      }));
      const { logsStore, contactsStore } = appData;
      expect(logsStore.size).toBe(1);
      expect(contactsStore.size).toBe(2);

      // delete one contacts
      myEvent.reason = 1;
      myEvent.contacts = [{ id: 1 }];
      window.dispatchEvent(myEvent);
      expect(appData.contactsStore.size).toBe(1);

      // delete all contacts
      myEvent.reason = 1;
      myEvent.contacts = [{}, {}];
      window.dispatchEvent(myEvent);
      expect(appData.contactsStore.size).toBe(0);
    }, 2000);

    keepAlive().then(() => {
      done();
    })
  })
});

afterEach(cleanup);
