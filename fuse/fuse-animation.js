const fuseRoute = `M450 9.45
  A445 445 0 0 1 831.5275 670.275
  A445 445 0 0 1 68.4725 670.275
  A445 445 0 0 1 450 9.45
  L548.3474 179.7927 L831.5275 670.275
  L634.8327 670.275 L68.4725 670.275
  L166.8199 499.9323 L514.1917 626.3653
  L634.8327 670.275 L570.641 306.2257
  L548.3474 179.7927 L265.1673 417.409
  L343.9101 388.749 L570.641 306.2257
  L556.0899 388.749 L514.1917 626.3653
  L450 572.502 L556.0899 388.749
  L343.9101 388.749 L450 572.502
  L265.1673 417.409 L166.8199 499.9323 L450 9.45`;

const fuseTemplate = document.createElement("template");
fuseTemplate.innerHTML = `
  <style>
    :host { display: block; width: 100%; }
    svg { display: block; width: 100%; height: auto; overflow: visible; }
    .guide { fill: none; stroke: var(--fuse-guide, #b9c5ba); stroke-width: 10; stroke-linecap: round; stroke-linejoin: round; opacity: .32; }
    .burned { fill: none; stroke: var(--fuse-burned, #59635d); stroke-width: 10; stroke-linecap: round; stroke-linejoin: round; opacity: .5; }
    .active { fill: none; stroke: var(--fuse-active, #8b0000); stroke-width: 12; stroke-linecap: round; stroke-linejoin: round; }
    .halo { fill: none; stroke: var(--fuse-active, #8b0000); stroke-width: 3; opacity: 0; }
    .ember { fill: var(--fuse-spark, #fff1dc); stroke: var(--fuse-active, #8b0000); stroke-width: 6; opacity: 0; }
    .feed { fill: none; stroke: var(--fuse-active, #8b0000); stroke-width: 12; stroke-linecap: round; opacity: 0; }
  </style>
  <svg viewBox="0 0 900 900" role="img" aria-label="Fuse route animation">
    <path class="guide" d="M450 9.45 L831.5275 670.275 L68.4725 670.275 Z" />
    <path class="guide" d="M548.3474 179.7927 L634.8327 670.275 L166.8199 499.9323 Z" />
    <path class="guide" d="M570.641 306.2257 L514.1917 626.3653 L265.1673 417.409 Z" />
    <path class="guide" d="M556.0899 388.749 L450 572.502 L343.9101 388.749 Z" />
    <path class="burned"></path>
    <path class="active"></path>
    <path class="feed" d="M0 450 L450 450" />
    <circle class="halo" cx="450" cy="9.45" r="22" />
    <circle class="ember" cx="450" cy="9.45" r="8" />
  </svg>
`;

class LeFuseAnimation extends HTMLElement {
  static get observedAttributes() { return ["progress", "show-ember", "active-color", "burned-color", "guide-color", "spark-color"]; }

  constructor() {
    super();
    this.attachShadow({ mode: "open" }).appendChild(fuseTemplate.content.cloneNode(true));
    this.activePath = this.shadowRoot.querySelector(".active");
    this.burnedPath = this.shadowRoot.querySelector(".burned");
    this.ember = this.shadowRoot.querySelector(".ember");
    this.halo = this.shadowRoot.querySelector(".halo");
    this.feed = this.shadowRoot.querySelector(".feed");
    this.progressValue = 0;
  }

  connectedCallback() {
    this.activePath.setAttribute("d", fuseRoute);
    this.burnedPath.setAttribute("d", fuseRoute);
    this.length = this.activePath.getTotalLength();
    this.activePath.style.strokeDasharray = this.length;
    this.setProgress(Number(this.getAttribute("progress") || 0), false);
    this.applyColors();
    this.updateEmber();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this.isConnected) return;
    if (name === "progress") this.setProgress(Number(newValue), false);
    else if (name === "show-ember") this.updateEmber();
    else this.applyColors();
  }

  applyColors() {
    const colors = { active: "active-color", burned: "burned-color", guide: "guide-color", spark: "spark-color" };
    Object.entries(colors).forEach(([property, attribute]) => {
      const value = this.getAttribute(attribute);
      if (value) this.style.setProperty(`--fuse-${property}`, value);
    });
  }

  updateEmber() {
    const visible = this.hasAttribute("show-ember");
    this.ember.style.opacity = visible && this.progressValue > 0 && this.progressValue < 1 ? "1" : "0";
    this.halo.style.opacity = visible && this.progressValue > 0 && this.progressValue < 1 ? "1" : "0";
  }

  setProgress(value, emit = true) {
    this.progressValue = Math.max(0, Math.min(1, value));
    if (!this.length) return;
    this.activePath.style.strokeDashoffset = this.length * (1 - this.progressValue);
    const point = this.activePath.getPointAtLength(this.length * this.progressValue);
    this.ember.setAttribute("cx", point.x);
    this.ember.setAttribute("cy", point.y);
    this.halo.setAttribute("cx", point.x);
    this.halo.setAttribute("cy", point.y);
    this.updateEmber();
    if (emit) this.dispatchEvent(new CustomEvent("fuse-progress", { detail: { progress: this.progressValue } }));
  }

  animateTo(value, options = {}) {
    const target = Math.max(0, Math.min(1, value));
    const duration = options.duration ?? 1;
    if (window.gsap) {
      const state = { progress: this.progressValue };
      return window.gsap.to(state, { progress: target, duration, ease: options.ease || "none", onUpdate: () => this.setProgress(state.progress), onComplete: () => this.dispatchEvent(new Event("fuse-complete")) });
    }
    this.setProgress(target);
    return null;
  }

  animateFold(options = {}) {
    const duration = options.duration ?? 1;
    this.setProgress(0);
    this.feed.style.strokeDasharray = 450;
    this.feed.style.strokeDashoffset = 450;
    this.feed.style.opacity = "1";
    const state = { feed: 0, progress: 0 };
    const timeline = window.gsap.timeline({
      onComplete: () => {
        this.feed.style.opacity = "0";
        this.dispatchEvent(new Event("fuse-complete"));
      },
    });
    timeline.to(state, { feed: 1, duration: duration * .22, ease: "power2.inOut", onUpdate: () => { this.feed.style.strokeDashoffset = 450 * (1 - state.feed); } });
    timeline.to(state, { progress: 1, duration: duration * .78, ease: options.ease || "none", onUpdate: () => this.setProgress(state.progress) });
    return timeline;
  }

  setColors(colors = {}) {
    Object.entries(colors).forEach(([name, value]) => {
      if (["active", "burned", "guide", "spark"].includes(name)) this.setAttribute(`${name}-color`, value);
    });
  }
}

customElements.define("le-fuse-animation", LeFuseAnimation);
