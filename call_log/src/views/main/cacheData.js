/**
 * @file Get & Set & update app data
 * @return { logsStore, contactsStore }
 *  @param { Map } contactsStore [number,{
 *     id, - contacts.id
 *     name, - contacts.name
 *     number, - contacts.tel[0].value
 *     atype, - contacts.tel[0].atype
 *     photoBlob - contacts.photoBlob
 *     photoType - blob img type
 *  }]
 *
 *  @param { Map } logsStore [6271995-057156198679-missed_lte-0, {
 *    ...contactsStore,
 *    callType: "missed_lte",
 *    date: 804242521292,
 *    direction: "incoming",
 *    duration: 0,
 *    emergency: false,
 *    groupKey: "6/27/1995",
 *    hangUpLocal: true,
 *    id: "6271995-057156198679-missed_lte-0",
 *    isRtt: false,
 *    isVt: false,
 *    number: "057156198679",
 *    radioTech: "ps",
 *    serviceId: 0
 * }]
 */

/**
 * @description Conditions Refresh logsStore & contactsStore:
 *    - Time Change
 *    - Call End
 *    - APP switches from background to foreground
 *    - Contact Change
 *    - Time Formatter Change
 *    - First Open APP
 */

/**
 * @description Cache Main Data
 *  @method cacheData - Cache data when refreshing when data changes
 *
 */

import React from 'react';
import Service from 'service';

import getAllContacts from 'utils/getAllContacts';

const CACHE_LOGS = new Map(JSON.parse(window.localStorage.logs || '[]'));
const CACHE_CONTACTS = new Map(
  JSON.parse(window.localStorage.contacts || '[]')
);

const SAVE_LOG = 'logs';
const SAVE_CONTACT = 'contacts';

const cacheData = Cpt => {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        logsStore: CACHE_LOGS,
        contactsStore: CACHE_CONTACTS
      };

      if (!props.isSnapshot) {
        // Watch contact change event
        ContactsManager.addEventListener(
          ContactsManager.EventMap.CONTACT_CHANGE,
          this.contactChange
        );

        window.addEventListener('telephony-call-ended', event => {
          this.updateList({ event, name: 'telephony-call-ended' });
        });
      }
    }

    componentDidMount() {
      const { isSnapshot } = this.props;
      if (!isSnapshot) {
        this.fetchData();
      }
    }

    componentWillUnmount() {
      const { isSnapshot } = this.props;
      if (!isSnapshot) {
        window.removeEventListener('telephony-call-ended', event => {
          this.updateList({ event, name: 'telephony-call-ended' });
        });

        ContactsManager.removeEventListener(
          ContactsManager.EventMap.CONTACT_CHANGE,
          this.contactChange
        );
      }
    }

    // Sort & Delete data that exceeds the limit
    processingListData = logsStore => {
      // sort
      let sortedDataArr = [...logsStore.entries()].sort((a, b) => a[1].date - b[1].date);

      // Delete old data that exceeds the limit
      const limitNum = window.MAX_LIST_LENGTH
      if (sortedDataArr.length > limitNum) {
        sortedDataArr = sortedDataArr.slice(-limitNum);
      }

      return new Map(sortedDataArr);
    }

    cacheData = name => {
      const { logsStore, contactsStore } = this.state;
      let snapShotSoftKeyConfig = {};

      if (name === 'logs') {
        // Cache new logsStore
        window.localStorage.logs = JSON.stringify([...logsStore]);
      } else {
        // Cache new contactsStore
        window.localStorage.contacts = JSON.stringify([...contactsStore]);
      }

      // Update cache view
      if (logsStore.size > 0) {
        snapShotSoftKeyConfig = {
          center: 'call',
          left: 'contacts',
          right: 'options'
        };
      } else {
        snapShotSoftKeyConfig = {
          left: 'contacts',
        };
      }

      Service.request('backupScreen', snapShotSoftKeyConfig);
    };

    updateList = ({ event, name }) => {
      const { logsStore, contactsStore } = this.state;
      const { data = {} } = event.detail || {};
      switch (name) {
        case 'telephony-call-ended':
          console.log('New log:', data);

          // Add logs
          this.setState({
            logsStore: this.processingListData(logsStore.set(data.id, data))
          }, () => {

            // Cache new Data
            this.cacheData(SAVE_LOG);
          });

          // Match contacts
          if (contactsStore.size > 0 && !contactsStore.has(data.number)) {
            MatchContact([data.number]).then(matchResult => {
              if (matchResult.size > 0) {
                this.setState({
                  contactsStore: new Map([
                    ...contactsStore,
                    ...matchResult
                  ])
                }, () => {

                  // Cache new Data
                  this.cacheData(SAVE_CONTACT);
                });
              }
            });
          }
          break;
        default:
        // nothing todo
      }
    };

    contactChange = evt => {
      const { contactsStore } = this.state;

      switch (evt.reason) {
        case ContactsManager.ChangeReason.REMOVE:
          if (evt.contacts.length > 1) {
            // All contacts deleted
            this.setState({ contactsStore: new Map() }, () => {
              this.cacheData(SAVE_CONTACT);
            });
          } else {
            // Some one contact delete
            contactsStore.forEach((value, key) => {
              if (value.id === evt.contacts[0].id) {
                contactsStore.delete(key);
              }
            });

            this.setState({ contactsStore }, () => {
              this.cacheData(SAVE_CONTACT);
            });
          }

          break;
        case ContactsManager.ChangeReason.CREATE:
        case ContactsManager.ChangeReason.UPDATE:
          // Create & Update need reMatch all number
          this.fetchData();
          break;
      }
    };

    fetchData = () => {
      let numArr = [];

      // Fetch logs
      const fetchLogs = new DB().getAllData();

      // Fetch contacts
      const fetchContacts = getAllContacts();

      Promise.all([fetchLogs, fetchContacts]).then(result => {
        const [logsArr, contactsMap] = result;
        let logsStore = new Map();
        logsArr.forEach(item => {
          logsStore.set(item.id, item);
        });

        // Set logsStore & contactsStore(first full match result)
        this.setState({
          logsStore: this.processingListData(logsStore),
          contactsStore: contactsMap
        }, () => {
          this.cacheData(SAVE_CONTACT);
          this.cacheData(SAVE_LOG);
        });

        /**
         * @param { Promise } MatchContact Second match other number
         *  # Minus log number.length < 7
         *  # Minus witch log number matched
         *  # Loop search and contact with log numbers
         *  # De-duplication
         */

        logsStore.forEach(value => {
          // Minus witch log number matched
          // Minus log number.length <= 7
          if (!contactsMap.has(value.number) && value.number.length >= 7) {
            numArr.push(value.number);
          }
        });

        // Start match & De-duplication
        if (numArr.length > 0 && contactsMap.size > 0) {
          MatchContact([...new Set(numArr)]).then(matchResultMap => {
            if (matchResultMap.size > 0) {
              this.setState(
                {
                  contactsStore: new Map([...contactsMap, ...matchResultMap])
                },
                () => {

                  // Cache contacts(match result & full match result)
                  this.cacheData(SAVE_CONTACT);
                }
              );
            }
          });
        }
      });
    };

    // Delete logs & update cache data & update snapshot
    deleteLogs = (selectedIds) => {

      const { logsStore } = this.state;
      selectedIds.forEach(id => {
        logsStore.delete(id);
      });

      this.setState({ logsStore }, () => {
        this.cacheData(SAVE_LOG);
      });
    };

    render() {
      const { logsStore, contactsStore } = this.state;

      const props = {
        logsStore,
        contactsStore,
        deleteLogs: this.deleteLogs,
        ...this.props
      };

      return <Cpt {...props} />;
    }
  };
};

export default cacheData;
