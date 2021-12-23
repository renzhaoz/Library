import React from 'react';
import Service from 'service';
import OptionMenu from 'react-option-menu';

class OptionMenuRenderer extends React.PureComponent {
  constructor(props) {
    super(props);

    this.menu = React.createRef();
  }

  componentDidUpdate() {
    const { optionMenuParams = {}, showOptionMenu, openOptionMenu } = this.props;

    // Set focus & Listener close event & Show menus
    if (openOptionMenu && this.menu && this.menu.on) {
      if (document.activeElement !== this.menu) {
        this.menu.focus();
      }

      this.menu.show(optionMenuParams);
      this.menu.on('closed', () => {

        // Close optionMenu
        showOptionMenu({ openOptionMenu: false });

        // OptionsMenu lose focus
        console.log('OptionsMenu lose focus!');
        Service.request('focus');
      });
    }
  }

  render() {
    const { openOptionMenu } = this.props;
    return (
      <div id="menu-root">
        {openOptionMenu && <OptionMenu ref={(element) => { this.menu = element; }} />}
      </div>
    );
  }
}

export default OptionMenuRenderer;
