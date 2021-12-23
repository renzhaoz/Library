import React from 'react';
import ReactSoftKey from 'react-soft-key';
import ReactSimChooser from 'react-sim-chooser';
import OptionMenuRenderer from 'components/OptionMenu/index';

import bluetooth_handler from 'utils/bluetooth_handler';

import DialogRenderer from 'components/Dialog/index';
import router from 'router/index';
import cacheData from './cacheData';

import './App.scss';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentView: 'listView',
      params: {},
      openDialog: false,
      dialogParams: {},
      openOptionMenu: false,
      optionMenuParams: []
    }

    new bluetooth_handler(this.showDialog);

    window.addEventListener('showDialDialog', this.showDialDialog);
    window.addEventListener('showDialOptionMenu', this.showDialOptionMenu);
  }

  // Operate dial error dialog.
  showDialDialog = event => {
    const dialogParams = event.detail.data;
    this.setState({
      openDialog: true,
      dialogParams
    });
  }

  showDialOptionMenu = event => {
    const options = event.detail.data;
    this.setState({
      openOptionMenu: true,
      optionMenuParams: options
    });
  }

  changeView = info => {
    const { currentView, params } = info;
    if (router[currentView]) {
      this.setState({
        currentView,
        params
      });
    }
  }

  // Operate Dialog
  showDialog = ({ openDialog, options }) => {
    this.setState({ openDialog, dialogParams: options });
  }

  // Operate OptionMenu
  showOptionMenu = ({openOptionMenu, options}) => {
    this.setState({openOptionMenu, optionMenuParams: { options }});
  }

  render() {
    const {
      currentView,
      params,
      openDialog,
      dialogParams,
      openOptionMenu,
      optionMenuParams
    } = this.state;

    const { deleteLogs } = this.props;

    const dialogProps = {
      openDialog,
      dialogParams,
      showDialog: this.showDialog
    };
    const optionMenuProps = {
      openOptionMenu,
      optionMenuParams,
      showOptionMenu: this.showOptionMenu
    };
    let defaultProps = params;

    if (currentView === 'listView') {
      const { isSnapshot, logsStore, contactsStore } = this.props;

      defaultProps = {
        isSnapshot,
        logsStore,
        contactsStore,
        openOptionMenu,
        showOptionMenu: this.showOptionMenu,
        deleteLogs: deleteLogs
      };

      if (isSnapshot) {
        const cacheLogs = new Map(JSON.parse(localStorage.logs || '[]'));
        const cacheContacts = new Map(JSON.parse(localStorage.contacts || '[]'));
        defaultProps.logsStore = new Map([...cacheLogs.entries()].sort(
          (a, b) => a[1].date - b[1].date)
        );

        defaultProps.contactsStore = new Map([...cacheContacts.entries()]);
      }
    }

    return (
      <div id="app" tabIndex={-1}>
        {React.createElement(
          router[currentView].component,
          {
            ...defaultProps,
            changeView: this.changeView,
            showDialog: this.showDialog,
            openDialog
          }
        )}
        <ReactSoftKey />
        <DialogRenderer {...dialogProps} />
        <OptionMenuRenderer {...optionMenuProps} />
        <ReactSimChooser />
      </div>
    )
  }
}

export default cacheData(App);
