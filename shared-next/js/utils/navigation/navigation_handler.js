/* global NavigationMap LazyLoader */
(function navigationHandler() {
  const loader = LazyLoader;
  // App should hold this file in /js folder
  loader.load('js/navigation_map.js', () => {
    NavigationMap.init();
  });
  window.addEventListener('keydown', evt => {
    handleKeydown(evt);
  });

  window.addEventListener('menuEvent', event => {
    if (NavigationMap) {
      NavigationMap.optionMenuVisible = event.detail.menuVisible;
    }
  });

  function handleKeydown(evt) {
    let el = evt.target;
    let bestElementToFocus = null;
    if (
      NavigationMap &&
      (NavigationMap.currentActivatedLength > 0 || NavigationMap.lockNavigation)
    ) {
      return;
    }
    if (
      document.activeElement.type === 'select-one' ||
      document.activeElement.type === 'date'
    ) {
      return;
    }
    if (evt.key === 'Enter' || evt.key === 'Accept') {
      handleClick(evt);
    } else {
      if (!evt.target.classList) {
        return;
      }
      if (!evt.target.classList.contains('focus')) {
        el = document.querySelector('.focus');
      }
      bestElementToFocus = findElementFromNavProp(el, evt);
      if (bestElementToFocus !== null) {
        if (
          evt.key === 'ArrowDown' &&
          evt.repeat &&
          bestElementToFocus.offsetTop < el.offsetTop
        ) {
          evt.preventDefault();
          return;
        }
        if (
          evt.key === 'ArrowUp' &&
          evt.repeat &&
          bestElementToFocus.offsetTop > el.offsetTop
        ) {
          evt.preventDefault();
          return;
        }
        const prevFocused = document.querySelectorAll('.focus');
        if (bestElementToFocus === prevFocused[0]) {
          return;
        }
        if (prevFocused.length > 0) {
          prevFocused[0].classList.remove('focus');
        }
        if (NavigationMap.scrollToElement === undefined) {
          bestElementToFocus.scrollIntoView(false);
        } else {
          NavigationMap.scrollToElement(bestElementToFocus, evt);
        }
        bestElementToFocus.classList.add('focus');
        if (NavigationMap.ignoreFocus === null || !NavigationMap.ignoreFocus) {
          bestElementToFocus.focus();
          /*
           * App make decision to focus on next element.
           * Then, we have to prevent default here.
           */
          evt.preventDefault();
        }
        document.dispatchEvent(
          new CustomEvent('focusChanged', {
            detail: {
              focusedElement: bestElementToFocus
            }
          })
        );
      }
    }
  }

  function findElementFromNavProp(currentlyFocused, evt) {
    let elementID = null;
    if (currentlyFocused === null) {
      return null;
    }
    if (
      NavigationMap !== undefined &&
      NavigationMap.disableNav !== undefined &&
      NavigationMap.disableNav
    )
      return null;
    const elmStyle = currentlyFocused.style;
    const isRtl = document.dir === 'rtl';
    let { key } = evt;
    const keyMap = {
      ArrowLeft: '--nav-left',
      ArrowRight: '--nav-right',
      ArrowUp: '--nav-up',
      ArrowDown: '--nav-down',
      Home: '--nav-home',
      MozHomeScreen: '--nav-home'
    };

    switch (key) {
      case 'ArrowLeft':
      case 'ArrowRight':
        if (isRtl) {
          key = key === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft';
        }
        elementID = elmStyle.getPropertyValue(keyMap[key]);
        break;
      case 'ArrowUp':
      case 'ArrowDown':
      case 'Home':
      case 'MozHomeScreen':
        elementID = elmStyle.getPropertyValue(keyMap[key]);
        break;
      default:
        break;
    }

    if (!elementID) {
      return null;
    }
    const selector = `[data-nav-id="${elementID}"]`;
    return document.querySelector(selector);
  }

  function handleClick(evt) {
    const el = document.querySelector('.focus');
    if (el) {
      el.focus();
    }

    if (
      NavigationMap &&
      NavigationMap.optionMenuVisible &&
      !evt.target.classList.contains('menu-button')
    ) {
      // Workaround for case of quick click just right after option menu opening start
      const selectedMenuElement = document.querySelector(
        'menu button.menu-button'
      );
      if (selectedMenuElement && selectedMenuElement.click) {
        selectedMenuElement.click();
      }
    } else if (NavigationMap && NavigationMap.handleClick) {
      // Custimization of click action.
      NavigationMap.handleClick(evt);
    } else {
      evt.target.click();
      for (let i = 0; i < evt.target.children.length; i++) {
        evt.target.children[i].click();
      }
    }
  }
})();
