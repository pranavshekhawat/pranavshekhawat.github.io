// lightweight, dependency-free horizontal scroller (no npm install required)
export default class HorizontalScroll {
  constructor(opts = {}) {
    this.options = Object.assign({
      container: null, // DOM element
      blocks: null,    // NodeList or array of blocks
      isAnimated: false,
      spring: 0.1,
      // increase reducer and lower limit to make skew much more subtle
      skewReducer: 30,
      skewLimit: 6,
    }, opts);

    this.vars = {
      scrollValue: 0,
      scrollTarget: 0,
      scrollLeft: 0,
      scrollRight: 0,
      spring: this.options.spring,
      direction: 0,
      speed: 0,
    };

    this.container = this.options.container;
    this.blocks = this.options.blocks;
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'horizontal-scroll';

    this._bind();
    this._setUI();
    this._addEvents();
    this.onResize();
    this._rafId = requestAnimationFrame(this._update);
  }

  _bind() {
    this._onWheel = this._onWheel.bind(this);
    this._update = this._update.bind(this);
    this.onResize = this.onResize.bind(this);
    this.scrollTo = this.scrollTo.bind(this);
    this.scrollToElement = this.scrollToElement.bind(this);
  }

  _setUI() {
    Object.assign(this.wrapper.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      backfaceVisibility: 'hidden',
      willChange: 'transform',
      height: '100%',
    });

    if (!this.container) return;

    Object.assign(this.container.style, {
      whiteSpace: 'nowrap',
      position: 'relative',
      height: '100%',
      overflow: 'hidden',
    });

    // move blocks into wrapper preserving order
    Array.prototype.forEach.call(this.blocks, (block) => {
      block.style.display = 'inline-block';
      this.container.replaceChild(this.wrapper, block);
      this.wrapper.appendChild(block);
    });

    // ensure wrapper appended
    if (!this.container.contains(this.wrapper)) {
      this.container.appendChild(this.wrapper);
    }
  }

  _addEvents() {
    window.addEventListener('wheel', this._onWheel, { passive: false });
    window.addEventListener('resize', this.onResize);
  }

  _removeEvents() {
    window.removeEventListener('wheel', this._onWheel);
    window.removeEventListener('resize', this.onResize);
    if (this._rafId) cancelAnimationFrame(this._rafId);
  }

  _onWheel(e) {
    // prevent vertical page scroll when inside container
    if (!this.container) return;
    if (!this.container.contains(e.target)) return;

    e.preventDefault();
    const delta = e.deltaY || e.wheelDelta || -e.detail;
    this.vars.direction = delta > 0 ? 1 : -1;
    this.vars.scrollTarget += delta * -1;
    this.vars.scrollTarget = Math.round(
      Math.max(this.vars.scrollLeft, Math.min(this.vars.scrollTarget, this.vars.scrollRight))
    );
  }

  _update() {
    // spring lerp
    this.vars.scrollValue += (this.vars.scrollTarget - this.vars.scrollValue) * this.vars.spring;

    const delta = this.vars.scrollTarget - this.vars.scrollValue;
    const skew = delta / this.options.skewReducer;
    this.vars.speed = Math.max(Math.min(-skew, this.options.skewLimit), -this.options.skewLimit);

    const transform = this.options.isAnimated
      ? `translate3d(-${this.vars.scrollValue}px,0,0) skewX(${this.vars.speed}deg)`
      : `translate3d(-${this.vars.scrollValue}px,0,0)`;

    if (this.wrapper && this.wrapper.style) {
      this.wrapper.style.transform = transform;
    }

    this._rafId = requestAnimationFrame(this._update);
  }

  // Public API: animate to a target position (keeps animation) or set instantly when instant=true
  scrollTo(value, opts = {}) {
    if (typeof value !== 'number') return;
    const v = this._clamp(Math.round(value), this.vars.scrollLeft, this.vars.scrollRight);
    const instant = opts.instant === true;

    // cancel any in-progress programmatic tween
    if (this._scrollTweenId) {
      cancelAnimationFrame(this._scrollTweenId);
      this._scrollTweenId = null;
    }

    if (instant || !opts.duration) {
      // simple usage: set as target (animated by RAF loop) or set instantly
      this.vars.scrollTarget = v;
      if (instant) {
        this.vars.scrollValue = v;
        if (this.wrapper && this.wrapper.style) {
          const transform = this.options.isAnimated
            ? `translate3d(-${this.vars.scrollValue}px,0,0) skewX(${this.vars.speed}deg)`
            : `translate3d(-${this.vars.scrollValue}px,0,0)`;
          this.wrapper.style.transform = transform;
        }
      }
      return;
    }

    // If a duration is provided, tween the scrollTarget itself so the RAF update produces a smooth, controllable animation
    const duration = Math.max(0, Number(opts.duration) || 0);
    const start = this.vars.scrollTarget || this.vars.scrollValue || 0;
    const change = v - start;
    const startTimeRef = { val: null };

    const ease = (t) => 0.5 - Math.cos(Math.PI * t) / 2; // smooth ease-in-out

    const step = (timestamp) => {
      if (!startTimeRef.val) startTimeRef.val = timestamp;
      const elapsed = timestamp - startTimeRef.val;
      const t = Math.min(1, elapsed / duration);
      this.vars.scrollTarget = Math.round(start + change * ease(t));
      if (t < 1) {
        this._scrollTweenId = requestAnimationFrame(step);
      } else {
        this._scrollTweenId = null;
      }
    };

    this._scrollTweenId = requestAnimationFrame(step);
  }

  // Public API: center a DOM element in the viewport (or container) and animate or set instantly
  scrollToElement(el, opts = {}) {
    if (!el || !this.wrapper) return;
    // el.offsetLeft is relative to wrapper because blocks were appended to wrapper
    const elCenter = (el.offsetLeft || 0) + (el.offsetWidth || el.clientWidth) / 2;
    const desired = Math.round(elCenter - (window.innerWidth / 2));
    this.scrollTo(desired, opts);
  }

  _clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
  }

  onResize() {
    if (!this.wrapper) return;
    this.vars.scrollLeft = 0;
    const w = this.wrapper.getBoundingClientRect ? this.wrapper.getBoundingClientRect().width : this.wrapper.offsetWidth;
    this.vars.scrollRight = Math.max(0, w - window.innerWidth);
    // ensure target/value within bounds after resize
    this.vars.scrollTarget = Math.max(this.vars.scrollLeft, Math.min(this.vars.scrollTarget, this.vars.scrollRight));
    this.vars.scrollValue = Math.max(this.vars.scrollLeft, Math.min(this.vars.scrollValue, this.vars.scrollRight));
  }

  destroy() {
    this._removeEvents();
    // move blocks back out (best-effort)
    if (this.wrapper && this.container) {
      while (this.wrapper.firstChild) {
        this.container.insertBefore(this.wrapper.firstChild, this.wrapper);
      }
      if (this.wrapper.parentNode) this.wrapper.parentNode.removeChild(this.wrapper);
    }
  }
}