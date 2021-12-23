import React from 'react';
import Service from 'service';
import ReactDialog from 'react-dialog';

class DialogRenderer extends React.PureComponent {
  constructor(props) {
    super(props);

    this.dialog = React.createRef();
  }

  componentDidUpdate() {
    const { openDialog, showDialog } = this.props;
    if (openDialog && this.dialog && this.dialog.on) {
      this.dialog.on('closed', () => {

        // Close Dialog
        showDialog({openDialog: false});

        // Dialog lose focus
        console.log('Dialog lose focus');
        Service.request('focus');
      });

      this.dialog.focus();
    }
  }

  onBack = () => {
    const { showDialog } = this.props;
    // Click backspace hide dialog.
    showDialog({openDialog: false});
  }

  render() {
    const { openDialog, dialogParams } = this.props;
    return (
      <div id="dialog-root">
        {openDialog && <ReactDialog onBack={this.onBack} ref={(dialog) => this.dialog = dialog} {...dialogParams} />}
      </div>
    );
  }
}

export default DialogRenderer;
