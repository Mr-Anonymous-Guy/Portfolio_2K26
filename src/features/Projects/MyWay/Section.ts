import Emitter from "@/utils/Emitter";
import Ticker from "@/utils/Ticker";
import { observeElement, unobserveElement } from "@/lib/observerBridge";
import { useUI } from "@/store/ui";

export class Section {
  el: HTMLElement;
  svg: HTMLElement;
  objectsWrapper: HTMLElement;
  ruler: HTMLElement;

  objects: Object[];
  canThrow: boolean;
  lastThrow: number;
  throwDelay: number;
  thrownObjects: Object[];
  draggedObject: Object | null;
  currentTime: number;

  smiley: {
    el: HTMLElement;
    bounding: DOMRect | null;
    rel: {
      x: number;
      y: number;
    };
  };

  lines: {
    circularPath: HTMLElement;
    lines: any[];
  };

  bounding!: {
    left: number;
    top: number;
    width: number;
    height: number;
  };

  scroll!: {
    start: number;
    end: number;
    p: number;
    sp: number;
  };

  mouse: {
    x: number;
    y: number;
    oy: number;
    sx: number;
    sy: number;
    d: number;
    set: boolean;
  };

  lastTouch: number;
  isPaused: boolean;
  destroyed: boolean;

  objectDragStartBound: any;
  objectDragEndBound: any;
  onTouchMoveBound: any;
  onIntersectBound: any;
  onResizeBound: any;
  layoutTimeouts: any[] = [];

  /**
   * Constructor
   */
  constructor(el?: HTMLElement) {
    // Elements
    this.el = el || (document.querySelector(".s-my-way") as HTMLElement);
    this.svg = this.el.querySelector(".js-svg") as HTMLElement;
    this.objectsWrapper = this.el.querySelector(".js-objects") as HTMLElement;
    this.ruler = this.el.querySelector(".js-ruler") as HTMLElement;

    // Properties
    this.objects = [];
    Array.from(this.objectsWrapper.children).forEach((child) => {
      this.objects.push(new Object(child as HTMLElement, this));
    });

    this.canThrow = false;
    this.lastThrow = 0;
    this.throwDelay = 2000;
    this.thrownObjects = [];
    this.draggedObject = null;
    this.currentTime = 0;

    this.smiley = {
      el: this.el.querySelector(".js-smiley") as HTMLElement,
      bounding: null,
      rel: {
        x: 0,
        y: 0,
      },
    };

    this.lines = {
      circularPath: this.el.querySelector(".js-lines-circular-path") as HTMLElement,
      lines: [],
    };

    this.mouse = {
      x: 0,
      y: 0,
      oy: 0,
      sx: 0,
      sy: 0,
      d: 0,
      set: false,
    };

    this.isPaused = true;
    this.destroyed = false;
    this.lastTouch = 0;

    this.objectDragStartBound = this.objectDragStart.bind(this);
    this.objectDragEndBound = this.objectDragEnd.bind(this);
    this.onTouchMoveBound = this.onTouchMove.bind(this);
    this.onIntersectBound = this.onIntersect.bind(this);
    this.onResizeBound = this.onResize.bind(this);

    Ticker.nextTick(this.init, this);
  }

  /**
   * Init
   */
  init() {
    if (this.destroyed) return;

    // Refresh viewport globals before measuring
    Emitter.emit("updateViewport");

    this.setSize();
    this.setScroll();
    this.setLines();

    this.bindEvents();

    this.firstObjects();
  }

  /**
   * Bind events
   */
  bindEvents() {
    Emitter.on("mousemove", this.onMouseMove, this);
    Emitter.on("resize", this.onResize, this);
    Emitter.on("scroll", this.onScroll, this);
    Emitter.on("tick", this.tick, this);

    this.objects.forEach((object) => {
      object.el.addEventListener("mousedown", this.objectDragStartBound);
      object.el.addEventListener("touchstart", this.objectDragStartBound);
    });
    this.el.addEventListener("mouseup", this.objectDragEndBound);
    this.el.addEventListener("touchend", this.objectDragEndBound);

    this.objectsWrapper.addEventListener("touchmove", this.onTouchMoveBound);

    this.el.addEventListener("intersect", this.onIntersectBound, {
      passive: true,
    });

    window.addEventListener("loaderComplete", this.onResizeBound);
    
    // Set up delayed resize checks to handle page layout settling
    this.layoutTimeouts = [
      setTimeout(() => this.onResize(), 100),
      setTimeout(() => this.onResize(), 500),
      setTimeout(() => this.onResize(), 1000),
      setTimeout(() => this.onResize(), 2000),
    ];

    // Force a fresh intersection check. The bridge's observer already observed
    // this element during initObserverBridge() and fired the initial event
    // BEFORE this listener existed. IntersectionObserver.observe() on an
    // already-observed element is a no-op, so we must unobserve first to
    // force a new callback delivery after our listener is attached.
    unobserveElement(this.el);
    observeElement(this.el);
  }

  /**
   * Destroy
   */
  destroy() {
    this.destroyed = true;
    Emitter.off("siteLoaded", this.init, this);
    Emitter.off("mousemove", this.onMouseMove, this);
    Emitter.off("resize", this.onResize, this);
    Emitter.off("scroll", this.onScroll, this);
    Emitter.off("tick", this.tick, this);

    this.objects.forEach((object) => {
      object.el.removeEventListener("mousedown", this.objectDragStartBound);
      object.el.removeEventListener("touchstart", this.objectDragStartBound);
    });
    this.thrownObjects.forEach((object) => {
      object.el.removeEventListener("mousedown", this.objectDragStartBound);
      object.el.removeEventListener("touchstart", this.objectDragStartBound);
    });
    this.el.removeEventListener("mouseup", this.objectDragEndBound);
    this.el.removeEventListener("touchend", this.objectDragEndBound);

    this.objectsWrapper.removeEventListener("touchmove", this.onTouchMoveBound);
    this.el.removeEventListener("intersect", this.onIntersectBound);

    window.removeEventListener("loaderComplete", this.onResizeBound);
    if (this.layoutTimeouts) {
      this.layoutTimeouts.forEach((t) => clearTimeout(t));
    }

    unobserveElement(this.el);
  }

  /**
   * Intersect handler
   */
  onIntersect(e: any) {
    this.isPaused = !e.detail.isIntersecting;
    this.canThrow = e.detail.isIntersecting;

    if (!this.isPaused) {
      this.thrownObjects.forEach((object) => {
        object.isWaiting = false;
      });
    }
  }

  /**
   * Mouse handler
   */
  onMouseMove(x: number, y: number) {
    this.updateMousePosition(x, y);
  }

  /**
   * Touch handler
   */
  onTouchMove(e: TouchEvent) {
    e.preventDefault();

    const delta = performance.now() - this.lastTouch;
    if (delta < Ticker.delta) return;

    const touch = e.touches[0];
    this.updateMousePosition(touch.clientX, touch.clientY);

    this.lastTouch = performance.now();
  }

  /**
   * Update mouse position
   */
  updateMousePosition(x: number, y: number) {
    const { mouse } = this;

    mouse.x = x - this.bounding.left;
    mouse.y = y - mouse.oy + window.scrollY;

    if (!mouse.set) {
      mouse.sx = mouse.x;
      mouse.sy = mouse.y;

      mouse.set = true;
    }
  }

  /**
   * Resize handler
   */
  onResize() {
    this.setSize();
    this.setScroll();
    this.setLines();
  }

  /**
   * Scroll handler
   */
  onScroll(scrollY: number) {
    const { scroll } = this;

    const trigger = scrollY + (window as any).safeHeight;

    if (trigger < scroll.start) {
      scroll.p = 0;
    } else if (trigger > scroll.end) {
      scroll.p = 1;
    } else {
      scroll.p = (trigger - scroll.start) / (scroll.end - scroll.start);
    }
  }

  /**
   * Set size
   */
  setSize() {
    const bounding = this.el.getBoundingClientRect();

    this.bounding = {
      left: bounding.left,
      top: bounding.top,
      width: bounding.width,
      height: bounding.height,
    };

    this.svg.style.width = this.bounding.width + "px";
    this.svg.style.height = this.bounding.height + "px";

    this.smiley.bounding = this.smiley.el.getBoundingClientRect();
    this.smiley.rel.x =
      this.smiley.bounding.left - this.bounding.left + this.smiley.bounding.width / 2;
    this.smiley.rel.y =
      this.smiley.bounding.top - this.bounding.top + this.smiley.bounding.height / 2;

    this.mouse.oy = this.bounding.top + window.scrollY;

    // Safari hack :(
    const pOriginY = this.ruler.clientHeight;
    this.objectsWrapper.style.perspectiveOrigin = `50% ${pOriginY}px `;
  }

  /**
   * Set scroll
   */
  setScroll() {
    const { bounding } = this;

    this.scroll = {
      start: bounding.top + window.scrollY,
      end: bounding.top + window.scrollY + bounding.height + (window as any).safeHeight,
      p: 0,
      sp: 0,
    };

    this.onScroll(window.scrollY);
    this.scroll.sp = this.scroll.p;
  }

  /**
   * Set lines
   */
  setLines() {
    const { lines, smiley, bounding } = this;

    // Lines
    lines.lines = [];

    const vLines = (window as any).safeWidth > 767 ? 12 : 8;
    const gapX = bounding.width / vLines;

    for (let i = 0; i <= vLines; i++) {
      // Top lines
      lines.lines.push({
        p1: { x: gapX * i, y: 0 },
        p2: { x: smiley.rel.x, y: smiley.rel.y },
      });

      // Bottom lines
      lines.lines.push({
        p1: { x: gapX * i, y: bounding.height },
        p2: { x: smiley.rel.x, y: smiley.rel.y },
      });
    }

    // Calculate angle
    const dx = bounding.width;
    const dy = (bounding.height - smiley.rel.y) / 2;

    this.el.style.setProperty("--distortion", String(Math.hypot(dx, dy) * 0.14));

    // Side lines
    const hLines = vLines;
    const gapY = bounding.height / hLines;
    const offsetY = (bounding.height - gapY * hLines) / 2;

    for (let i = 1; i < hLines; i++) {
      // Left lines
      lines.lines.push({
        p1: { x: 0, y: offsetY + gapY * i },
        p2: { x: smiley.rel.x, y: smiley.rel.y },
      });

      // Right lines
      lines.lines.push({
        p1: { x: bounding.width, y: offsetY + gapY * i },
        p2: { x: smiley.rel.x, y: smiley.rel.y },
      });
    }

    this.drawLines();
  }

  /**
   * Draw lines
   */
  drawLines() {
    const { lines, bounding } = this;

    let d = `M 0 ${bounding.height} L ${bounding.width} ${bounding.height}`;

    lines.lines.forEach((line) => {
      d += `M ${line.p1.x} ${line.p1.y} L ${line.p2.x} ${line.p2.y} `;
    });

    lines.circularPath.setAttribute("d", d);
  }

  /**
   * Throw object
   */
  throwObject() {
    if (this.objects.length > 0) {
      const object = this.objects.splice(Math.floor(Math.random() * this.objects.length), 1)[0];

      object.set();

      this.thrownObjects.push(object);
    }

    this.lastThrow = performance.now();

    const rate = (window as any).safeWidth > 767 ? 1 : 2;
    this.throwDelay = (500 + Math.random() * 500) * rate;
  }

  /**
   * Initial objects
   */
  firstObjects() {
    const totalObjects = Math.max(Math.min(Math.round((window as any).safeWidth * 0.025), 5), 2);

    for (let i = 0; i < totalObjects; i++) {
      const object = this.objects.splice(Math.floor(Math.random() * this.objects.length), 1)[0];

      object.set(false);

      this.thrownObjects.push(object);
    }
  }

  /**
   * Object move end
   */
  objectMoveEnd(object: Object) {
    this.thrownObjects.splice(this.thrownObjects.indexOf(object), 1);
    this.objects.push(object);
  }

  /**
   * Object drag start
   */
  objectDragStart(e: any) {
    e.preventDefault();

    this.lastTouch = performance.now();

    if (e instanceof MouseEvent === false) {
      this.onTouchMove(e);
    }

    const el = e.currentTarget;
    const object = this.thrownObjects.find((o) => o.el === el);

    if (!object) return;
    if (object.isDragging || object.isVanishing) return;

    this.draggedObject = object;
    object.isDragging = true;
    el.classList.add("is-dragging");
  }

  /**
   * Object drag end
   */
  objectDragEnd(e: any) {
    e.preventDefault();

    const object = this.draggedObject;

    if (object) {
      object.isDragging = false;
      object.el.classList.remove("is-dragging");

      object.isVanishing = true;
      object.el.classList.add("is-vanishing");

      object.vanishStart = performance.now();
      this.draggedObject = null;
    }
  }

  /**
   * Tick
   */
  tick(time: number) {
    const { scroll, el, mouse } = this;

    // Smooth mouse movement
    mouse.sx += (mouse.x - mouse.sx) * 0.1;
    mouse.sy += (mouse.y - mouse.sy) * 0.1;

    const dx = mouse.x - mouse.sx;
    const dy = mouse.y - mouse.sy;
    mouse.d = Math.hypot(dx, dy);

    // Smooth scroll
    scroll.sp += (scroll.p - scroll.sp) * 0.1;

    el.style.setProperty("--scroll-progress", String(scroll.sp));

    // Move objects
    this.thrownObjects.forEach((object) => {
      object.move(time);
    });

    if (this.isPaused) return;

    if (this.canThrow && time - this.lastThrow > this.throwDelay) {
      this.throwObject();
    }
  }
}

export class Object {
  el: HTMLElement;
  parent: Section;

  index: number;
  delay: number;
  throwTimeout: number;
  vanishStart: number;
  vanishDelay: number;

  s: number;
  x: number;
  y: number;
  z: number;

  rx: number;
  ry: number;
  rz: number;

  vx: number;
  vy: number;
  vz: number;
  vrx: number;
  vry: number;

  isPaused: boolean;
  isWaiting: boolean;
  isDragging: boolean;
  isVanishing: boolean;

  /**
   * Constructor
   */
  constructor(el: HTMLElement, parent: Section) {

    this.parent = parent;
    this.el = el;

    this.index = Array.from(this.el.parentNode!.children).indexOf(this.el);
    this.delay = 0;
    this.throwTimeout = 0;
    this.vanishStart = 0;
    this.vanishDelay = 1000;

    this.s = 0;
    this.x = 0;
    this.y = 0;
    this.z = 0;

    this.rx = 0;
    this.ry = 0;
    this.rz = 0;

    this.vx = 0;
    this.vy = 0;
    this.vz = 0;
    this.vrx = 0;
    this.vry = 0;

    this.isPaused = false;
    this.isWaiting = false;
    this.isDragging = false;
    this.isVanishing = false;
  }

  /**
   * Set position
   */
  set(fromScratch = true) {
    this.el.style.setProperty("--size", String(0.5 + Math.random() * 0.5));

    this.s = 0;

    this.x = 0;
    this.y = 0;
    this.z = -20000;

    this.rx = 90;
    this.ry = Math.random() * 2 - 1;
    this.rz = 0;

    this.vz = 40 + Math.random() * 10;
    this.vx = Math.random() * (window as any).safeWidth * 0.0025 * (this.index % 2 ? -1 : 1);
    this.vy = Math.random() * (window as any).safeHeight * 0.0025 * (this.index % 3 ? -1 : 1);
    this.vrx = 0.25 + Math.random() * 1;
    this.vry = 0.25 + Math.random() * 1;

    this.isWaiting = false;
    this.isDragging = false;
    this.isVanishing = false;

    this.el.classList.remove("is-waiting");
    this.el.classList.remove("is-dragging");
    this.el.classList.remove("is-vanishing");

    this.vanishStart = 0;
    this.vanishDelay = 1000;

    if (!fromScratch) {
      this.isWaiting = true;

      this.s = 1;

      this.x = this.vx * Math.random() * 200;
      this.y = this.vy * Math.random() * 200;

      this.rx = Math.random() * 360;
      this.ry = Math.random() * 360;

      this.z = Math.random() * -20000;
    }

    this.el.style.setProperty("--s", String(this.s));
  }

  /**
   * Tick
   */
  move(time: number) {
    if (this.isWaiting) return;

    if (this.isDragging) {
      const x = this.parent.mouse.x - this.parent.smiley.rel.x;
      const y = this.parent.mouse.y - this.parent.smiley.rel.y * 1.5;

      this.vx += (x - this.x) * 0.075;
      this.vy += (y - this.y) * 0.075;
      this.vz += (0 - this.z) * 0.3;

      this.ry = this.vx * 0.15;
      this.rx = this.vy * -0.15;
      this.rz = this.ry + this.rx;

      this.vx *= 0.9;
      this.vy *= 0.9;
      this.vz *= 0.75;

      this.x += this.vx * 0.5;
      this.y += this.vy * 0.5;
      this.z += this.vz * 0.25;

      this.z = Math.min(this.z, 500);

      this.s += (1 - this.s) * 0.5;
    } else if (this.isVanishing) {
      this.vy += 0.5;

      this.x += this.vx;
      this.y += this.vy;

      this.rx += this.vrx;
      this.ry += this.vry;

      if (time - this.vanishStart > this.vanishDelay) {
        this.isWaiting = true;
        this.el.classList.add("is-waiting");
        this.parent.objectMoveEnd(this);
      }
    } else {
      if (this.z > 1000) {
        this.isWaiting = true;
        this.el.classList.add("is-waiting");
        this.parent.objectMoveEnd(this);
      } else {
        this.s += 0.005;
        this.s = Math.min(this.s, 1);

        this.z += this.vz;
        this.x += this.vx;
        this.y += this.vy;

        this.rx += this.vrx;
        this.ry += this.vry;
      }
    }

    this.el.style.setProperty("--x", this.x + "px");
    this.el.style.setProperty("--y", this.y + "px");
    this.el.style.setProperty("--z", this.z + "px");

    this.el.style.setProperty("--rx", String(this.rx));
    this.el.style.setProperty("--ry", String(this.ry));
    this.el.style.setProperty("--rz", String(this.rz));

    this.el.style.setProperty("--s", String(this.s));
  }
}
