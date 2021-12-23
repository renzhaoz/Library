class GaiaProgress extends HTMLElement {
  constructor() {
    super();
    const shadowRoot = this.attachShadow({
      mode: 'open'
    });
    shadowRoot.innerHTML = `
    <div class="inner">
      <div class="bar"></div>
    </div>
    <style>
      :host {
        display: block;
        overflow: hidden;
        height: 0.6rem;
        border-radius: 0.3rem;
        width: 100%;
      }
      .inner {
        height: 100%;
        background: var(--color-gs45, #aaa)
      }
      .bar {
        position: relative;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: var(--highlight-color);
        transition: transform 0ms linear;
      }
      .bar:after {
        position: absolute;
        left: 100%;
        display: block;
        content: '';
        width: 0;
        height: 0;
        border-top: 0.6rem solid var(--color-gs00, #fff);
        border-left: 0.3rem solid var(--color-gs00, #fff);
      }
      .focus.bar {
        background-color: var(--color-gs00);
      }
      .focus.bar::after {
        border-top: 0.6rem solid var(--highlight-color);
        border-left: 0.3rem solid var(--highlight-color);
      }
      .bar:before {
        position: absolute;
        left: -0.3rem;
        display: block;
        content: '';
        width: 0;
        height: 0;
        border-top: 0.6rem solid var(--color-gs00, #fff);
        border-left: 0.3rem solid var(--color-gs00, #fff);
      }
      .no-value .bar {
        left: 0;
        width: 100%;
      }
      .no-value.increasing  .bar {
        animation: moving-in 1520ms cubic-bezier(0.3, 0, 0.4, 1);
      }
      .no-value.decreasing  .bar {
        animation: moving-out 1520ms cubic-bezier(0.6, 0, 0.3, 1);
      }
      :dir(rtl) {
        transform: rotateY(180deg);
      }

      @keyframes moving-in {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(0%); }
      }

      @keyframes moving-out {
        0% { transform: translateX(0%); }
        100% { transform: translateX(100%); }
      }
    </style>
  `;
  }

  connectedCallback() {
    this.els = {
      inner: this.shadowRoot.querySelector('.inner'),
      bar: this.shadowRoot.querySelector('.bar')
    };
    this.els.inner.setAttribute('role', 'progressbar');
    this.els.inner.setAttribute('aria-valuemin', '0');
    this.els.inner.setAttribute('aria-valuemax', '100');

    this.els.bar.classList.toggle(
      'focus',
      this.getAttribute('selected') === 'true'
    );
    this.value = this.getAttribute('value') || 0;
    this.handleAnimationEnd = () => {
      const { classList } = this.els.inner;
      if (classList.contains('no-value')) {
        if (classList.contains('increasing')) {
          classList.remove('increasing');
          classList.add('decreasing');
        } else {
          classList.remove('decreasing');
          classList.add('increasing');
        }
      }
    };
    this.els.inner.addEventListener('animationend', this.handleAnimationEnd);
  }

  disconnectedCallback() {
    this.els.inner.removeEventListener('animationend', this.handleAnimationEnd);
  }

  get value() {
    return this._value || 0;
  }

  set value(value) {
    value = Math.min(100, Math.max(0, Number(value)));
    const fillTime = 2000;
    if (value) {
      const delta = Math.abs(this.value - value);
      const duration = (delta / 100) * fillTime;
      this.els.bar.style.transform = `translateX(${value}%)`;
      this.els.bar.style.transitionDuration = `${duration}ms`;
      this.els.inner.setAttribute('aria-valuenow', value);
    } else {
      this.els.inner.removeAttribute('aria-valuenow');
    }

    this.els.inner.classList.toggle('no-value', !value);
    this.els.inner.classList.toggle('increasing', !value);
    this._value = value;
  }

  get selected() {
    return this._selected || 0;
  }

  set selected(value) {
    this.els.bar.classList.toggle('focus', value === 'true');
    this._selected = value;
  }
}

customElements.define('gaia-progress', GaiaProgress);
