import React, { useEffect, useRef, useState } from 'react';
import { AWork } from './AWork';
import './SWork.scss';

import Emitter from '@/utils/Emitter';
import Ticker from '@/utils/Ticker';

import { gsap } from 'gsap';
import { SlowMo } from 'gsap/EasePack';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { workManifest } from '@/data/workManifest';

gsap.registerPlugin(ScrollTrigger, SlowMo);

export const SWork: React.FC = () => {
  const rootRef = useRef<HTMLElement>(null);
  const [works, setWorks] = useState<any[]>([]);

  useEffect(() => {
    // We shuffle the dynamically loaded manifest array
    // Filter out any explicitly hidden items
    let visibleWorks = workManifest.filter(work => work.status !== 'Archived' && work.status !== 'Private');

    // Optionally sort by displayOrder if we wanted to enforce order, but random shuffling keeps it fresh
    function shuffle(array: any[]) {
      let currentIndex = array.length;
      while (currentIndex !== 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
      }
    }
    shuffle(visibleWorks);
    setWorks(visibleWorks);
  }, []);

  useEffect(() => {
    if (works.length === 0 || !rootRef.current) return;

    class Section {
      el: HTMLElement;
      container: HTMLElement;
      ruler: HTMLElement;
      scene: HTMLElement;
      canvas: HTMLCanvasElement;
      ctx: CanvasRenderingContext2D;
      title: HTMLElement;
      videos: NodeListOf<HTMLVideoElement>;

      mask: {
        width: number;
        height: number;
        maxScale: number;
        lines: any[];
        el: HTMLElement;
        svg: HTMLElement;
        pathOuter: HTMLElement;
        pathInner: HTMLElement;
        pathLines: HTMLElement;
      };

      bounding: { left: number; top: number; width: number; height: number };
      letters: any[];
      worksArr: any[];
      points: any[];
      observer: IntersectionObserver | null = null;

      tl!: gsap.core.Timeline;
      animationProgress: number = 0;
      pointsProgress: number = 0;
      last: { animationProgress: number; pointsProgress: number } = { animationProgress: 0, pointsProgress: 0 };
      scrollProgress: number = 0;
      smoothScrollProgress: number = 0;
      state: number = 0;
      speed: number = 0;
      isPaused: boolean = true;

      constructor(rootEl: HTMLElement) {
        this.el = rootEl;
        this.container = this.el.querySelector('.js-container') as HTMLElement;
        this.ruler = this.el.querySelector('.js-ruler') as HTMLElement;
        this.scene = this.container.querySelector('.js-scene') as HTMLElement;
        this.canvas = this.container.querySelector('.js-canvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.title = this.container.querySelector('.js-title') as HTMLElement;
        this.videos = this.container.querySelectorAll('video');

        this.mask = {
          width: 0, height: 0, maxScale: 1, lines: [],
          el: this.el.querySelector('.js-mask') as HTMLElement,
          svg: this.el.querySelector('.js-mask-svg') as HTMLElement,
          pathOuter: this.el.querySelector('.js-mask-path-outer') as HTMLElement,
          pathInner: this.el.querySelector('.js-mask-path-inner') as HTMLElement,
          pathLines: this.el.querySelector('.js-mask-path-lines') as HTMLElement,
        };

        this.bounding = { left: 0, top: 0, width: 0, height: 0 };
        this.letters = [];
        this.title.querySelectorAll('.js-letter').forEach((_letter) => {
          this.letters.push({ el: _letter as HTMLElement, ghosts: [] });
        });

        this.worksArr = [];
        this.container.querySelectorAll('.js-work').forEach((_work) => {
          this.worksArr.push({ el: _work as HTMLElement });
        });

        this.points = [];

        Ticker.nextTick(this.init, this);
      }

      get safeWidth() {
        return (window as any).safeWidth || window.innerWidth;
      }
      get safeHeight() {
        return (window as any).safeHeight || window.innerHeight;
      }

      init() {
        this.setCtxStyle();
        this.setSize();
        this.setMask();
        this.setPoints();
        this.setLetters();
        this.setWorks();
        this.setTimeline();

        this.bindEvents();
      }

      bindEvents() {
        Emitter.on('contrastchange', this.setCtxStyle, this);
        Emitter.on('resize', this.onResize, this);

        // Custom event for intersect, we can use IntersectionObserver directly since React doesn't have an 'intersect' event naturally
        this.observer = new IntersectionObserver((entries) => {
          const entry = entries[0];
          this.isPaused = !entry.isIntersecting;
          if (this.isPaused) {
            Emitter.off('tick', this.tick, this);
          } else {
            Emitter.on('tick', this.tick, this);
          }
        });
        this.observer.observe(this.el);
      }

      onResize(widthChanged: boolean) {
        if (widthChanged) {
          this.setCtxStyle();
          this.setSize();
          this.setMask();
          this.setPoints();
          this.setLetters();
          this.setWorks();
          this.setTimeline();
        }
      }

      setCtxStyle() {
        const color = getComputedStyle(this.el).getPropertyValue('--ink');
        Ticker.nextTick(() => {
          this.ctx.strokeStyle = color;
        }, this);
      }

      setSize() {
        this.el.style.setProperty('--height', this.worksArr.length * 50 + 'lvh');
        const bounding = this.container.getBoundingClientRect();
        this.bounding = { left: bounding.left, top: bounding.top, width: this.safeWidth, height: this.safeHeight };
        this.canvas.width = this.bounding.width;
        this.canvas.height = this.bounding.height;
        this.speed = Math.hypot(this.bounding.width, this.bounding.height) * 4;
      }

      setMask() {
        const { mask } = this;
        const width = mask.el.clientWidth;
        const height = mask.el.clientHeight;
        mask.width = width; mask.height = height;
        mask.svg.style.width = mask.width + 'px';
        mask.svg.style.height = mask.height + 'px';

        const elBounding = this.el.getBoundingClientRect();
        const rulerBounding = this.ruler.getBoundingClientRect();
        const rulerWidth = rulerBounding.width;
        const rulerHeight = rulerBounding.height;
        const offsetX = rulerBounding.left - elBounding.left;
        const offsetY = rulerBounding.top - elBounding.top;

        const dOuter = `M -1 0 L ${width + 2} 0 L ${width + 2} ${height} L -1 ${height} Z`;
        const corners = {
          tl: { x: offsetX, y: offsetY },
          tr: { x: offsetX + rulerWidth, y: offsetY },
          br: { x: offsetX + rulerWidth, y: offsetY + rulerHeight },
          bl: { x: offsetX, y: offsetY + rulerHeight },
        };

        let size = (corners.tr.x - corners.tl.x) / 2;
        mask.maxScale = this.safeWidth / size;

        let dInner = `M ${corners.tl.x} ${corners.tl.y + size} A ${size} ${size} 0 0 1 ${corners.tr.x} ${corners.tr.y + size} L ${corners.br.x} ${corners.br.y - size} A ${size} ${size} 0 0 1 ${corners.bl.x} ${corners.bl.y - size} Z`;
        const linesClip = `${dOuter} ${dInner}`;
        mask.pathOuter.setAttribute('d', `${dOuter} ${dInner}`);

        const thickness = this.safeWidth > 767 ? 16 : 8;
        corners.tl.x += thickness; corners.tl.y += thickness;
        corners.tr.x -= thickness; corners.tr.y += thickness;
        corners.br.x -= thickness; corners.br.y -= thickness;
        corners.bl.x += thickness; corners.bl.y -= thickness;
        size = (corners.tr.x - corners.tl.x) / 2;

        dInner = `M ${corners.tl.x} ${corners.tl.y + size} A ${size} ${size} 0 0 1 ${corners.tr.x} ${corners.tr.y + size} L ${corners.br.x} ${corners.br.y - size} A ${size} ${size} 0 0 1 ${corners.bl.x} ${corners.bl.y - size} Z`;
        mask.pathInner.setAttribute('d', `${dOuter} ${dInner}`);

        mask.lines = [];
        const vLines = this.safeWidth > 767 ? 12 : 8;
        const gapX = width / vLines;
        const gapY = height * 0.1;
        const hLines = Math.ceil(height / gapY);

        for (let i = 1; i < vLines; i++) {
          const x = gapX * i;
          mask.lines.push({ p1: { x, y: 0 }, p2: { x, y: height } });
        }
        for (let i = 0; i < hLines; i++) {
          const y = gapY * i;
          mask.lines.push({ p1: { x: 0, y }, p2: { x: width, y } });
        }

        let dLines = '';
        mask.lines.forEach((line) => {
          dLines += `M ${line.p1.x} ${line.p1.y} L ${line.p2.x} ${line.p2.y} `;
        });
        mask.pathLines.setAttribute('d', dLines);
        mask.pathLines.style.clipPath = `path(evenodd, '${linesClip}')`;
      }

      setLetters() {
        const { letters, scene } = this;
        letters.forEach((letter: any, j: number) => {
          letter.ghosts.forEach((ghost: any) => ghost.el.remove());
          letter.ghosts = [];
          const bounding = letter.el.getBoundingClientRect();
          letter.width = bounding.width;
          letter.height = bounding.height;
          letter.top = bounding.top - this.bounding.top;
          letter.left = bounding.left;
          letter.freq = 1 + Math.random();

          const multiplier = this.safeWidth > 767 ? 0.75 : 0.5;
          letter.total = Math.round((this.bounding.width / letter.width) * multiplier) + 2;

          for (let i = 0; i < letter.total; i++) {
            const el = document.createElement('span');
            el.classList.add('s__scene__letter', 'js-letter');
            el.innerText = letter.el.innerText;
            el.dataset.letter = letter.el.innerText;
            scene.appendChild(el);

            const ghost = {
              el,
              x: letter.left, y: letter.top, z: Math.random() * 100,
              i: i - letter.total * 0.5, p: (i / letter.total - 0.5) * 2,
              ap: Math.abs(i / letter.total - 0.5) * 2, mx: 0, my: 0,
            };

            el.style.top = ghost.y + 'px';
            el.style.left = ghost.x + 'px';
            el.style.zIndex = String(j !== 1 && j !== 2 && (j + letters.length + i) % 5 === 0 ? 3 : 1);
            el.style.setProperty('--ix', String(ghost.i));
            el.style.setProperty('--iy', String(((j + 1) / (letters.length + 1) - 0.5) * 2));
            el.style.setProperty('--ap', String(ghost.ap));
            el.style.setProperty('--p', String(ghost.p));
            letter.ghosts.push(ghost);
          }
        });
      }

      setWorks() {
        this.worksArr.forEach((work, i) => {
          const el = work.el;
          el.style.setProperty('--size', String(0.5 + Math.random() * 0.5));
          el.style.setProperty('--y', String((0.5 + Math.random() * 0.5) * (i % 2 ? -1 : 1)));
        });
      }

      setTimeline() {
        const { el, container, worksArr, scene, mask } = this;
        const worksEl = worksArr.map((work) => work.el);

        if (this.tl) this.tl.kill();

        this.tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top 25%',
            end: 'bottom 75%',
            scrub: 1,
          },
          onUpdate: () => {
            scene.style.setProperty('--state', String(this.state));
          },
        });

        this.tl.fromTo(mask.el, { scale: 1 }, { scale: mask.maxScale, duration: 0.75, ease: 'power4.in' }, 0);
        this.tl.fromTo(scene, { scale: 0.75 }, { scale: 1, duration: 0.75, ease: 'power3.in' }, 0);
        this.tl.fromTo(container, { clipPath: 'inset(0 1rem)' }, { clipPath: 'inset(0 0rem)', duration: 0.75, ease: 'power3.in' }, 0);
        this.tl.fromTo(this, { pointsProgress: 0 }, { pointsProgress: 1, duration: 1, ease: 'power4.inOut' }, 0);
        this.tl.fromTo(this, { state: 0 }, { state: 1, duration: 0.75, ease: 'power4.in' }, 0);
        this.tl.fromTo(worksEl, { attr: { progress: 1 } }, { attr: { progress: -1 }, ease: 'slow(0.15, 0.6)', stagger: 0.25 }, 0.75);
        this.tl.fromTo(this, { animationProgress: 0 }, { animationProgress: 10000, duration: this.tl.totalDuration(), ease: 'power1.out' }, 0.75);
        this.tl.fromTo(this, { state: 1 }, { state: 0, duration: 0.75, ease: 'power4.inOut', immediateRender: false }, '-=1');
        this.tl.fromTo(mask.el, { scale: mask.maxScale }, { scale: 1, duration: 0.75, ease: 'power4.inOut', immediateRender: false }, '-=1');
        this.tl.fromTo(scene, { scale: 1 }, { scale: 0.75, duration: 0.75, ease: 'power3.inOut', immediateRender: false }, '-=1');
        this.tl.fromTo(container, { clipPath: 'inset(0 0rem)' }, { clipPath: 'inset(0 1rem)', duration: 0.75, ease: 'power3.inOut', immediateRender: false }, '-=1');
        this.tl.fromTo(this, { pointsProgress: 1 }, { pointsProgress: 0, duration: 1, ease: 'power4.inOut' }, '-=1');
      }

      moveLetters() {
        const { speed, letters, animationProgress } = this;
        letters.forEach((letter: any, i: number) => {
          const letterSpeed = speed * letter.freq;
          letter.ghosts.forEach((ghost: any, index: number) => {
            let progress = (((animationProgress % letterSpeed) / letterSpeed + index / letter.total) % 1) / 0.7 - 0.15;
            ghost.el.style.setProperty('--progress', String(progress));
          });
        });
      }

      setPoints() {
        const { bounding } = this;
        this.points = [];
        const gap = 24;
        const cols = Math.ceil((bounding.width * 1.2) / gap);
        const rows = Math.ceil((bounding.height * 1.2) / gap);
        const offsetX = (bounding.width - cols * gap) * 0.5;
        const offsetY = (bounding.height - rows * gap) * 0.5;
        const hWidth = bounding.width * 0.5;
        const hHeight = bounding.height * 0.5;

        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            const x = i * gap + offsetX;
            const y = j * gap + offsetY;
            const dx = hWidth - x;
            const dy = hHeight - y;
            this.points.push({ x, y, dx, dy, m: Math.random(), flowX: 0 });
          }
        }
      }

      movePoints() {
        const { points, animationProgress } = this;
        points.forEach((p) => {
          p.flowX = (animationProgress * -0.05) % 24;
        });
      }

      drawPoints() {
        const { bounding, ctx, points, animationProgress, pointsProgress, last } = this;
        const rAnimationProgress = Math.round(animationProgress * 100) / 100;
        const rPointsProgress = Math.round(pointsProgress * 100) / 100;

        if (rPointsProgress === last.pointsProgress && rAnimationProgress === last.animationProgress) return;

        ctx.clearRect(0, 0, bounding.width, bounding.height);
        ctx.beginPath();
        points.forEach((point) => {
          const x = point.x + point.dx * (1 - pointsProgress) * 0.2 + point.flowX;
          const y = point.y + point.dy * (1 - pointsProgress) * 0.2;
          ctx.rect(x, y, 0.5, 0.5);
        });
        ctx.stroke();

        last.pointsProgress = rPointsProgress;
        last.animationProgress = rAnimationProgress;
      }

      tick() {
        this.scrollProgress = Math.max(Math.min(1, ScrollTrigger.positionInViewport(this.el, 'top')), 0) * -1 +
          (1 - Math.max(Math.min(1, ScrollTrigger.positionInViewport(this.el, 'bottom')), 0));
        this.smoothScrollProgress += (this.scrollProgress - this.smoothScrollProgress) * 0.1;

        this.el.style.setProperty('--scroll-progress', String(this.scrollProgress));

        this.movePoints();
        this.moveLetters();
        this.drawPoints();
      }
    }

    const section = new Section(rootRef.current);
    
    return () => {
      if (section.tl) section.tl.kill();
      Emitter.off('resize', section.onResize, section);
      Emitter.off('tick', section.tick, section);
      Emitter.off('contrastchange', section.setCtxStyle, section);
      if (section.observer) {
        section.observer.disconnect();
      }
    };
  }, [works]);

  return (
    <section ref={rootRef} id="work" className="s-work" data-intersect>
      <div className="s__outer">
        <div className="s__inner js-container">
          <h2 className="s__title">
            <span className="s__title__inner js-title">
              <span className="s__title__letter js-letter">W</span>
              <span className="s__title__letter js-letter">O</span>
              <span className="s__title__letter js-letter">R</span>
              <span className="s__title__letter js-letter">K</span>
            </span>
          </h2>

          <div className="s__scene js-scene">
            {works.map((work, index) => (
              <AWork
                key={work.id || index}
                cssClass="s__scene__work s__scene__work--video js-work"
                title={work.title}
                subtitle={work.category}
                externalUrl={work.externalUrl}
                src={work.video}
                index={String(index).padStart(4, '0')}
                total={String(works.length).padStart(2, '0')}
              />
            ))}
          </div>

          <canvas className="s__canvas js-canvas"></canvas>
        </div>

        <div className="s__mask-outer">
          <div className="s__mask js-mask">
            <svg className="s__mask__svg js-mask-svg">
              <path className="s__mask__path-inner js-mask-path-inner" d=""></path>
              <path className="s__mask__path-outer js-mask-path-outer" d=""></path>
              <path className="s__mask__path-lines js-mask-path-lines" d=""></path>
            </svg>
          </div>
        </div>

        <div className="s__ruler js-ruler"></div>
      </div>
    </section>
  );
};
