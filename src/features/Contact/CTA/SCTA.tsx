import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Emitter from '@/utils/Emitter';
import Ticker from '@/utils/Ticker';
import { audioManager } from '@/services/audio/audioManager';
import './SCTA.scss';

gsap.registerPlugin(ScrollTrigger);

const lines = [
  ['L', 'e', "t<span class='sup'>'</span>", 's'],
  ['R', 'o', 'c', 'k'],
];

class Section {
  el: HTMLElement;
  container: HTMLElement;
  hover: HTMLElement;
  button: HTMLElement;
  cta: HTMLElement;
  bounding!: DOMRect;
  ctaMaxSize!: number;

  grid: {
    bounding: DOMRect;
    width: number;
    height: number;
    vLines: number;
    hLines: number;
    gapX: number;
    gapY: number;
    points: any[];
    el: HTMLElement;
    svg: HTMLElement;
    path: HTMLElement;
  };

  wave: {
    progress: number;
    op: number;
    speed: number;
    strength: number;
    state: string;
    timeout: number;
  };

  buttonIsHovered: boolean;
  isPaused: boolean;
  tl!: gsap.core.Timeline;
  observer: IntersectionObserver | null = null;
  onHoverBound: ((e: Event) => void) | null = null;
  onOutBound: ((e: Event) => void) | null = null;

  constructor(el: HTMLElement) {
    this.el = el;
    this.container = this.el.querySelector('.js-container') as HTMLElement;
    this.hover = this.el.querySelector('.js-hover') as HTMLElement;
    this.button = this.el.querySelector('.js-button') as HTMLElement;
    this.cta = this.el.querySelector('.js-cta') as HTMLElement;

    this.grid = {
      bounding: new DOMRect(),
      width: 0,
      height: 0,
      vLines: 0,
      hLines: 0,
      gapX: 0,
      gapY: 0,
      points: [],
      el: this.el.querySelector('.js-grid') as HTMLElement,
      svg: this.el.querySelector('.js-grid-svg') as HTMLElement,
      path: this.el.querySelector('.js-grid-path') as HTMLElement,
    };

    // Use window.safeWidth/safeHeight or fall back to innerWidth/innerHeight
    const safeWidth = (window as any).safeWidth || window.innerWidth;

    this.wave = {
      progress: 0,
      op: 0,
      speed: safeWidth > 767 ? 15 : 10,
      strength: safeWidth > 767 ? 1 : 0.35,
      state: 'paused',
      timeout: 0,
    };

    this.buttonIsHovered = false;
    this.isPaused = true;

    // Force init immediately since React component is already mounted
    this.init();
  }

  init() {
    this.setSize();
    this.setGrid();
    this.createPulseTimeline();
    this.bindEvents();

    // Start ticking immediately if it's visible, otherwise wait for intersection
    // Assuming visible for now since intersection observer triggers shortly
    Emitter.on('tick', this.tick, this);
  }

  bindEvents() {
    Emitter.on('resize', this.onResize, this);

    this.onHoverBound = this.onHover.bind(this);
    this.onOutBound = this.onOut.bind(this);

    this.hover.addEventListener('mouseenter', this.onHoverBound);
    this.hover.addEventListener('touchstart', this.onHoverBound);

    this.hover.addEventListener('mouseleave', this.onOutBound, {
      passive: true,
    });
    this.el.addEventListener('touchstart', this.onOutBound, {
      passive: true,
    });

    // Custom intersection event if you use it, or fallback to standard IntersectionObserver
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.onIntersect({ detail: { isIntersecting: entry.isIntersecting } });
      });
    });
    this.observer.observe(this.el);
  }

  onResize() {
    this.setSize();
    this.setGrid();
  }

  onIntersect(e: any) {
    this.isPaused = !e.detail.isIntersecting;

    if (this.isPaused) {
      // Pause animations if desired
    } else {
      // Resume
    }
  }

  onHover(e: Event) {
    if (this.buttonIsHovered) return;

    this.buttonIsHovered = true;
    this.hover.classList.add('is-active');

    // Play hover sound
    audioManager.play('hover');

    this.tl.pause();

    clearTimeout(this.wave.timeout);
    this.wave.timeout = window.setTimeout(() => {
      this.waveShock();
    }, 600);

    gsap.to(this.wave, {
      op: 1,
      delay: 0.3,
      duration: 1.2,
      ease: 'expo.inOut',
      overwrite: true,
    });

    e.stopPropagation();
  }

  onOut(e: Event) {
    const target = e.target as HTMLAnchorElement;

    if (target.tagName === 'A') {
      // Don't intercept clicks on the mailto link
      return;
    }

    if (!this.buttonIsHovered) return;

    clearTimeout(this.wave.timeout);

    this.buttonIsHovered = false;
    this.hover.classList.remove('is-active');

    this.tl.play(0);

    gsap.to(this.wave, {
      op: 0,
      duration: 0.7,
      ease: 'expo.inOut',
      overwrite: true,
    });
  }

  setSize() {
    this.grid.bounding = this.grid.el.getBoundingClientRect();
    this.bounding = this.container.getBoundingClientRect();

    this.ctaMaxSize = Math.min(this.bounding.width, this.bounding.height) - 32;
    this.cta.style.setProperty('--size', this.ctaMaxSize + 'px');
  }

  setGrid() {
    const { grid } = this;
    const width = this.grid.bounding.width;
    const height = this.grid.bounding.height;

    grid.width = width;
    grid.height = height;
    grid.svg.style.width = width + 'px';
    grid.svg.style.height = height + 'px';

    grid.points = [];

    const safeWidth = (window as any).safeWidth || window.innerWidth;
    grid.vLines = safeWidth > 767 ? 12 : 8;
    grid.gapX = width / grid.vLines;
    grid.gapY = this.bounding.height / 8;
    grid.hLines = Math.floor(height / grid.gapY);

    const offsetY = height - grid.gapY * grid.hLines;
    const center = {
      x: width / 2,
      y: height - this.bounding.height / 2,
    };

    for (let i = 0; i <= grid.vLines; i++) {
      const row = [];

      for (let j = 0; j <= grid.hLines; j++) {
        const point = {
          x: grid.gapX * i,
          y: grid.gapY * j + (j !== 0 ? offsetY : 0),
          ax: 0, ay: 0, vx: 0, vy: 0, wx: 0, wy: 0,
          mx: 0, my: 0, ox: 0, oy: 0, dx: 0, dy: 0, dist: 0,
        };

        const dx = point.x - center.x;
        const dy = point.y - center.y;
        const angle = Math.atan2(dy, dx);

        point.dist = Math.hypot(dx, dy);
        if (point.dist === 0) {
          point.dx = 0;
          point.dy = 0;
        } else {
          point.dx = Math.cos(angle) * (width / 2 / point.dist) * 5;
          point.dy = Math.sin(angle) * (width / 2 / point.dist) * 5;
        }

        row.push(point);
      }
      grid.points.push(row);
    }
  }

  createPulseTimeline() {
    const text = this.container.querySelector('.js-button-text');

    this.tl = gsap.timeline({
      repeat: -1,
      repeatDelay: 0.5,
    });

    this.tl.call(() => {
      this.wave.state = 'pulse';
    });

    this.tl.fromTo(
      text,
      { scale: 0.85 },
      { scale: 1.05, duration: 2.7, ease: 'power2.in' }
    );

    this.tl.call(this.wavePulse.bind(this), []);

    this.tl.to(text, {
      scale: 0.85,
      duration: 0.15,
      ease: 'power4.out',
    });
  }

  movePoints(time: number) {
    const { grid, wave } = this;
    const safeHeight = (window as any).safeHeight || window.innerHeight;
    const safeWidth = (window as any).safeWidth || window.innerWidth;

    grid.points.forEach((col) => {
      col.forEach((point: any, y: number) => {
        if (y === 0 || point.dist === 0) return;

        const d = Math.abs(point.dist - wave.progress);
        const l = 30;

        if (d < l) {
          const s = 1 - d / l;
          const a = Math.atan2(point.dy, point.dx);
          const f = Math.cos(d * 0.01) * s;

          point.vx += Math.cos(a) * f * l * 0.5 * wave.strength;
          point.vy += Math.sin(a) * f * l * 0.5 * wave.strength;
        }

        point.vx += (0 - point.wx) * 0.001;
        point.vy += (0 - point.wy) * 0.001;
        point.vx *= 0.9;
        point.vy *= 0.9;
        point.wx += point.vx * 3;
        point.wy += point.vy * 3;
        point.wx *= 0.9;
        point.wy *= 0.9;
        point.mx = point.wx * 0.1;
        point.my = point.wy * 0.1;

        point.ox = point.dx / Math.hypot(safeHeight, safeWidth);
        point.oy = point.dy / Math.hypot(safeHeight, safeWidth);

        point.ox = this.easeOut(point.ox);
        point.oy = this.easeOut(point.oy);

        point.ox *= grid.gapX * 75 * (point.dist / this.ctaMaxSize);
        point.oy *= grid.gapY * 75 * (point.dist / this.ctaMaxSize);
      });
    });
  }

  easeOut(t: number) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  drawLines() {
    const { grid } = this;
    let d = '';

    grid.points.forEach((col) => {
      col.forEach((point: any, i: number) => {
        const p = this.movedPoint(point);
        if (i === 0) d += `M ${p.x} ${p.y} `;
        else d += `L ${p.x} ${p.y} `;
      });
    });

    for (let y = 0; y < grid.hLines; y++) {
      grid.points.forEach((col, x) => {
        const point = col[y];
        const p = this.movedPoint(point);
        if (x === 0) d += `M ${p.x} ${p.y} `;
        else d += `L ${p.x} ${p.y} `;
      });
    }

    grid.path.setAttribute('d', d);
  }

  movedPoint(point: any) {
    return {
      x: point.x + point.mx + point.ox * this.wave.op,
      y: point.y + point.my + point.oy * this.wave.op,
    };
  }

  wavePulse() {
    if (this.buttonIsHovered) return;
    const { wave } = this;
    const safeWidth = (window as any).safeWidth || window.innerWidth;
    wave.progress = 0;
    wave.state = 'pulse';
    wave.speed = safeWidth > 767 ? 15 : 10;
    wave.strength = safeWidth > 767 ? 1 : 0.35;
  }

  waveShock() {
    const { wave } = this;
    if (!this.buttonIsHovered || wave.state === 'shock') return;
    wave.progress = 0;
    wave.state = 'shock';
    wave.speed = 30;
    wave.strength = 5;
  }

  tick(time: number) {
    const { wave } = this;
    if (wave.progress < this.grid.height) {
      if (wave.state !== 'paused') {
        wave.progress += wave.speed;
      }
    }
    this.movePoints(time);
    this.drawLines();
  }

  destroy() {
    if (this.tl) this.tl.kill();
    clearTimeout(this.wave.timeout);
    Emitter.off('tick', this.tick, this);
    Emitter.off('resize', this.onResize, this);

    if (this.onHoverBound) {
      this.hover.removeEventListener('mouseenter', this.onHoverBound);
      this.hover.removeEventListener('touchstart', this.onHoverBound);
    }
    if (this.onOutBound) {
      this.hover.removeEventListener('mouseleave', this.onOutBound);
      this.el.removeEventListener('touchstart', this.onOutBound);
    }
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

export default function SCTA() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const sectionInstance = new Section(sectionRef.current);

    return () => {
      sectionInstance.destroy();
    };
  }, []);

  return (
    <section className="s-cta" ref={sectionRef}>
      <div id="contact" className="s__inner js-container">
        <div className="s__hover js-hover">
          <div className="s__button js-button">
            <div className="s__button__inner">
              <div className="s__button__text js-button-text">GO</div>
            </div>
          </div>

          <div className="s__cta js-cta">
            {lines.map((line, i) => (
              <div
                key={i}
                className={`s__cta__line s__cta__line--${i === 0 ? 'top' : 'bottom'}`}
              >
                <div className="s__cta__text">
                  {line.map((char, j) => (
                    <span key={j} className="s__cta__char">
                      {['', '', '', ''].map((_, k) => (
                        <span
                          key={k}
                          className="s__cta__char__slice"
                          dangerouslySetInnerHTML={{ __html: char }}
                        />
                      ))}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <a href="mailto:mr.anonymous071105@gmail.com" className="s__cta__link" onClick={() => audioManager.play('transition')}>
              mr.anonymous071105@gmail.com
            </a>

            <div className="s__cta__stars">
              <svg className="s__cta__star" width="49" height="49" viewBox="0 0 49 49" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="m24.5 0 3.3 21.2L49 24.5l-21.2 3.3L24.5 49l-3.3-21.2L0 24.5l21.2-3.3L24.5 0z" />
              </svg>
              <svg className="s__cta__star" width="49" height="49" viewBox="0 0 49 49" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="m24.5 0 3.3 21.2L49 24.5l-21.2 3.3L24.5 49l-3.3-21.2L0 24.5l21.2-3.3L24.5 0z" />
              </svg>
              <svg className="s__cta__star" width="49" height="49" viewBox="0 0 49 49" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="m24.5 0 3.3 21.2L49 24.5l-21.2 3.3L24.5 49l-3.3-21.2L0 24.5l21.2-3.3L24.5 0z" />
              </svg>
              <svg className="s__cta__star" width="49" height="49" viewBox="0 0 49 49" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="m24.5 0 3.3 21.2L49 24.5l-21.2 3.3L24.5 49l-3.3-21.2L0 24.5l21.2-3.3L24.5 0z" />
              </svg>
            </div>

            <div className="a-dots"></div>
          </div>
        </div>
      </div>

      <div className="s__grid js-grid">
        <svg className="s__grid__svg js-grid-svg">
          <path className="s__grid__path js-grid-path" d=""></path>
        </svg>
      </div>
    </section>
  );
}
