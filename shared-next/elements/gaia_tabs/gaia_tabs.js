class GaiaTabs extends HTMLElement {
  constructor() {
    super();
    const shadowRoot = this.attachShadow({
      mode: 'open'
    });
    shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          position: relative;
          bottom: 0;
          width: 100%;
          margin: 0;
          padding: 0;
          z-index: 0;
          background: var(--color-gs00);
        }
        :host([position="top"]) {
          top: 0;
          bottom: auto;
          height: 3rem;
        }
        :host([skin="dark"]) {
          border-color: rgba(189,189,189, 0.1);
        }
        ::slotted(*) {
          box-sizing: content-box;
          position: relative;
          margin: 0;
          padding: 0 0.5rem 0 1rem;
          height: 3rem;
          border: 0;
          flex: 1 1 0;
          line-height: 3rem;
          text-align: center;
          font-family: sans-serif;
          text-decoration: none;
          color: var(--color-gs45);
          background-color: transparent;
          cursor: pointer;
          list-style: none;
          white-space: nowrap;
        }
        ::slotted(a),
        ::slotted(div),
        ::slotted(button) {
          background-repeat: no-repeat;
          background-position: top center;
        }
        ::slotted(a) {
          text-decoration: none;
          display: block;
        }
        ::slotted([position="top"] > *) {
          height: 3rem;
        }
        :host([skin="dark"]) ::slotted(*) {
          background-color: #000;
          color: #fff;
        }
        ::slotted(*):active {
          border-radius: 0;
          background-color: #b2f2ff;
        }
        ::slotted(.selected) {
          color: var(--color-gs90);
          font-weight: 700;
        }
        :host([skin="dark"]) ::slotted(.selected) {
          color: #00aacc;
        }
        ::slotted([disabled]) {
          color: #333;
          opacity: 0.25;
          pointer-events: none;
        }
        :host([skin="dark"]) ::slotted([disabled]) {
          color: rgba(255,255,255,0.4);
          opacity: 1;
        }
        :host ::slotted(.selected):after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          border-bottom: 0.3rem solid #00aacc;
        }
      </style>
      <slot id="tabsSlot" name="tab"></slot>
    `;
  }

  connectedCallback() {
    this.setAttribute('role', 'tablist');
    const slot = this.shadowRoot.querySelector('slot');
    slot.addEventListener('slotchange', event => {
      this.tabs = event.target.assignedElements({ flatten: true });
      for (const [, tab] of this.tabs.entries()) {
        tab.setAttribute('role', 'tab');
      }
    });
    this.addEventListener('click', this.onClick);
    setTimeout(() => {
      this.select(this.getAttribute('selected'));
    });

    window.addEventListener('largetextenabledchanged', () => {
      setTimeout(() => {
        this._updateIndicator(this.selected ? this.selected : 0);
      });
    });
  }

  attributeChangedCallback(attr, oldVal, newVal) {
    if (attr === 'selected') {
      this.select(newVal);
    }
  }

  // eslint-disable-next-line consistent-return
  onClick(e) {
    let el = e.target;
    let i = -1;
    const { indexOf } = [];
    while (el) {
      i = indexOf.call(this.children, el);
      if (i > -1) {
        return this.select(i);
      }
      el = el.parentNode;
    }
  }

  select(index) {
    if (index === null) {
      return;
    }
    index = Number(index);
    const el = this.children[index];
    this.deselect(this.selected);
    this.selected = index;

    el.classList.add('selected');

    const e = new CustomEvent('change');
    setTimeout(this.dispatchEvent.bind(this, e));

    this._updateIndicator(index);
  }

  addItem(child, index) {
    const len = this.children.length;
    if (!index) {
      index = len - 1;
    }
    if (index < 0 || index > len - 1 || !child) {
      return;
    }
    this.insertBefore(child, this.children[index]);
  }

  removeItem(id) {
    const child = document.getElementById(id);
    if (child) {
      this.removeChild(child);
    }
  }

  _updateIndicator(index) {
    const isRtl = document.documentElement.dir === 'rtl';
    let offset = 0;
    const tabs = this.children;
    const tabsWidth = this.offsetWidth;

    const currTabLeft = tabs[index].offsetLeft;
    const currTabWidth = tabs[index].offsetWidth;
    const currTabRight = tabsWidth - (currTabLeft + currTabWidth);

    const lastTabLeft = tabs[tabs.length - 1].offsetLeft;
    const lastTabWidth = tabs[tabs.length - 1].offsetWidth;
    const lastTabRight = tabsWidth - (lastTabLeft + lastTabWidth);

    if (index === 0) {
      offset = 0;
    } else if (index === tabs.length - 1) {
      if (isRtl) {
        offset = Math.abs(lastTabLeft);
      } else if (lastTabRight > 0) {
        offset = 0;
      } else {
        offset = lastTabRight;
      }
    } else {
      const targetTabLeft = (currTabLeft + currTabRight) / 2;
      let targetOffset = targetTabLeft - currTabLeft;
      if (isRtl) {
        const currAmount = currTabRight + currTabWidth;
        if (currAmount > tabsWidth) {
          if (currAmount < lastTabRight) {
            targetOffset = Math.abs(targetTabLeft) - currTabLeft;
            offset = Math.abs(targetOffset);
          } else {
            offset = Math.abs(lastTabLeft);
          }
        }
      } else if (targetOffset > 0 || lastTabRight > 0) {
        offset = 0;
      } else if (targetOffset < 0 && targetOffset > lastTabRight) {
        offset = targetOffset;
      } else if (targetOffset < 0 && targetOffset < lastTabRight) {
        offset = lastTabRight;
      }
    }
    this.style.transform = `translateX(${offset}px)`;
  }

  deselect(index) {
    const el = this.children[index];
    if (!el) {
      return;
    }
    el.classList.remove('selected');
    if (this.current === el) {
      this.selected = null;
    }
  }
}

customElements.define('gaia-tabs', GaiaTabs);
