import React from 'react';

import './tabs.scss';

const { get: _ } = window.api.l10n;

class Tabs extends React.PureComponent {
  constructor(props) {
    super(props);
    this.DEBUG = false;
  }

  componentDidMount() {
    const { isSnapshot } = this.props;
    if (!isSnapshot) {
      window.performance.mark('navigationLoaded');
    }
  }

  componentDidUpdate() {
    this.updateIndicator();
  }

  updateIndicator() {
    const { selectedIndex: index } = this.props;
    const isRtl = document.documentElement.dir === 'rtl';
    let offset = 0;

    const tabs = this.element.children;
    const tabsWidth = this.element.offsetWidth;
    const currTabLeft = tabs[index].offsetLeft;
    const currTabWidth = tabs[index].offsetWidth;
    const currTabRight = tabsWidth - (currTabLeft + currTabWidth);
    const lastTabLeft = tabs[tabs.length - 1].offsetLeft;
    const lastTabWidth = tabs[tabs.length - 1].offsetWidth;
    const lastTabRight = tabsWidth - (lastTabLeft + lastTabWidth);

    if (index === 0) {
      offset = 0;
    } else if (index === tabs.length - 1) {
      if (!isRtl) {
        // LastTab, offset is 0 if tabs stay in one screen, or
        // LastTabRight if longer.
        if (lastTabRight > 0) {
          offset = 0;
        } else {
          offset = lastTabRight;
        }
      } else {
        offset = Math.abs(lastTabLeft);
      }
    } else {
      // Tab in the middle of somewhere

      // Calcuate the average of current tab's offsetLeft and offsetRight
      // as targetOffset and set translateX to put tab at the center.
      const targetTabLeft = (currTabLeft + currTabRight) / 2;
      let targetOffset = targetTabLeft - currTabLeft;
      if (!isRtl) {
        if (targetOffset > 0 || lastTabRight > 0) {
          // Offset greater than 0, possibily at the first one or two tabs,
          // or last tab is fully visible, so there's no need move.
          offset = 0;
        } else if (targetOffset < 0 && targetOffset > lastTabRight) {
          // Normal case, simply set offset to targetOffset.
          offset = targetOffset;
        } else if (targetOffset < 0 && targetOffset < lastTabRight) {
          // Offset less than lastTabRight, possibily at the last one or two
          // tabs and can't move more than lastTabRight.
          offset = lastTabRight;
        }
      } else {
        const currAmount = currTabRight + currTabWidth;
        if (currAmount > tabsWidth) {
          if (currAmount < lastTabRight) {
            targetOffset = Math.abs(targetTabLeft) - currTabLeft;
            offset = Math.abs(targetOffset);
          } else {
            offset = Math.abs(lastTabLeft);
          }
        }
      }
    }
    this.element.style.transform = 'translateX(' + offset + 'px)';
  }

  render() {
    const { tabNames = [], selectedIndex } = this.props;
    const tabs = tabNames.map((tabName, index) => {
      const isSelected = selectedIndex === index ? 'selected' : '';
      return (
        <div
          className={isSelected}
          key={tabName}
          slot='tab'
        >
          <span
            aria-selected={!!isSelected}
            id={tabName}
          >
            {_(tabName)}
          </span>
        </div>
      );
    });

    return (
      <gaia-tabs
        class="h3"
        underline="child"
        position="top"
        ref={element => (this.element = element)}
      >
        {tabs}
      </gaia-tabs>
    );
  }
}

Tabs.defaultProps = {
  tabNames: [],
  selectedIndex: 0
};

export default Tabs;
