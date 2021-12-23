'use strict';

var NavigationMap = {
  currentActivatedLength: 0,
  init: function() {
    document.addEventListener("menuEvent", function(e) {
      NavigationMap.menuIsActive = e.detail.menuVisible;
      if (e.detail.menuVisible) {
        NavigationManager.reset('.menu-button');
      }
    });
  },
  scrollToElement:jest.fn(),
  handleClick:jest.fn()
};

window.NavigationMap = NavigationMap;
