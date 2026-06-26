import React, { useEffect, useRef } from 'react';
import Emitter from '@/utils/Emitter';
import Ticker from '@/utils/Ticker';
import Noise from '@/utils/Noise';
import './AWaves.scss';

export default function AWaves() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg) return;

    let bounding = {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    };

    const mouse = {
      x: -10,
      y: 0,
      lx: 0,
      ly: 0,
      sx: 0,
      sy: 0,
      v: 0,
      vs: 0,
      a: 0,
      set: false,
    };

    let lines: any[] = [];
    let paths: SVGPathElement[] = [];
    const noise = new Noise(Math.random());

    let isInteractive = true;
    let isPaused = true;

    const setSize = () => {
      const rect = container.getBoundingClientRect();

      svg.style.width = '';
      svg.style.height = '';

      bounding = {
        left: rect.left,
        top: rect.top + window.scrollY,
        width: container.clientWidth,
        height: container.clientHeight,
      };

      svg.style.width = `${bounding.width}px`;
      svg.style.height = `${bounding.height}px`;
    };

    const setLines = () => {
      const { width, height } = bounding;

      lines = [];
      paths.forEach((path) => {
        path.remove();
      });
      paths = [];

      const xGap = 10;
      const yGap = 32;

      const oWidth = width + 200;
      const oHeight = height + 30;

      const totalLines = Math.ceil(oWidth / xGap);
      const totalPoints = Math.ceil(oHeight / yGap);

      const xStart = (width - xGap * totalLines) / 2;
      const yStart = (height - yGap * totalPoints) / 2;

      for (let i = 0; i <= totalLines; i++) {
        const points: any[] = [];

        for (let j = 0; j <= totalPoints; j++) {
          const point = {
            x: xStart + xGap * i,
            y: yStart + yGap * j,
            wave: { x: 0, y: 0 },
            cursor: { x: 0, y: 0, vx: 0, vy: 0 },
          };

          points.push(point);
        }

        // Create path
        const path = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'path'
        ) as SVGPathElement;
        path.classList.add('a__line');
        path.classList.add('js-line');

        svg.appendChild(path);
        paths.push(path);

        // Add points
        lines.push(points);
      }

      if (isPaused) {
        drawLines();
      }
    };

    const movePoints = (time: number) => {
      lines.forEach((points) => {
        points.forEach((p: any) => {
          // Wave movement
          const move =
            noise.perlin2(
              (p.x + time * 0.0125) * 0.002,
              (p.y + time * 0.005) * 0.0015
            ) * 12;
          p.wave.x = Math.cos(move) * 32;
          p.wave.y = Math.sin(move) * 16;

          // Mouse effect
          if (isInteractive) {
            const dx = p.x - mouse.sx;
            const dy = p.y - mouse.sy;
            const d = Math.hypot(dx, dy);
            const l = Math.max(175, mouse.vs);

            if (d < l) {
              const s = 1 - d / l;
              const f = Math.cos(d * 0.001) * s;

              p.cursor.vx += Math.cos(mouse.a) * f * l * mouse.vs * 0.00065;
              p.cursor.vy += Math.sin(mouse.a) * f * l * mouse.vs * 0.00065;
            }

            p.cursor.vx += (0 - p.cursor.x) * 0.005; // String tension
            p.cursor.vy += (0 - p.cursor.y) * 0.005;

            p.cursor.vx *= 0.925; // Friction/duration
            p.cursor.vy *= 0.925;

            p.cursor.x += p.cursor.vx * 2; // Strength
            p.cursor.y += p.cursor.vy * 2;

            p.cursor.x = Math.min(100, Math.max(-100, p.cursor.x)); // Clamp movement
            p.cursor.y = Math.min(100, Math.max(-100, p.cursor.y));
          }
        });
      });
    };

    const moved = (point: any, withCursorForce = true) => {
      const coords = {
        x: point.x + point.wave.x + (withCursorForce ? point.cursor.x : 0),
        y: point.y + point.wave.y + (withCursorForce ? point.cursor.y : 0),
      };

      // Round to 2 decimals
      coords.x = Math.round(coords.x * 10) / 10;
      coords.y = Math.round(coords.y * 10) / 10;

      return coords;
    };

    const drawLines = () => {
      lines.forEach((points, lIndex) => {
        if (!paths[lIndex]) return;
        const p1 = moved(points[0], false);

        let d = `M ${p1.x} ${p1.y}`;

        points.forEach((p1Point: any, pIndex: number) => {
          const isLast = pIndex === points.length - 1;

          const p1Moved = moved(p1Point, !isLast);

          d += `L ${p1Moved.x} ${p1Moved.y}`;
        });

        paths[lIndex].setAttribute('d', d);
      });
    };

    const updateMousePosition = (x: number, y: number) => {
      mouse.x = x - bounding.left;
      mouse.y = y - bounding.top + window.scrollY;

      if (!mouse.set) {
        mouse.sx = mouse.x;
        mouse.sy = mouse.y;
        mouse.lx = mouse.x;
        mouse.ly = mouse.y;

        mouse.set = true;
      }
    };

    const onMouseMove = (x: number, y: number) => {
      updateMousePosition(x, y);
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();

      const touch = e.touches[0];
      updateMousePosition(touch.clientX, touch.clientY);
    };

    const onResize = () => {
      setSize();
      setLines();
    };

    const tick = (time: number) => {
      // Smooth mouse movement
      mouse.sx += (mouse.x - mouse.sx) * 0.1;
      mouse.sy += (mouse.y - mouse.sy) * 0.1;

      // Mouse velocity
      const dx = mouse.x - mouse.lx;
      const dy = mouse.y - mouse.ly;
      const d = Math.hypot(dx, dy);

      mouse.v = d;
      mouse.vs += (d - mouse.vs) * 0.1;
      mouse.vs = Math.min(100, mouse.vs);

      // Mouse last position
      mouse.lx = mouse.x;
      mouse.ly = mouse.y;

      // Mouse angle
      mouse.a = Math.atan2(dy, dx);

      // Animation styles
      container.style.setProperty('--x', `${mouse.sx}px`);
      container.style.setProperty('--y', `${mouse.sy}px`);

      movePoints(time);
      drawLines();
    };

    // Listeners
    Emitter.on('mousemove', onMouseMove, null);
    Emitter.on('resize', onResize, null);
    container.addEventListener('touchmove', onTouchMove, { passive: false });

    // Intersection observer
    const onIntersect = (isIntersecting: boolean) => {
      isPaused = !isIntersecting;

      if (isPaused) {
        Emitter.off('tick', tick, null);
      } else {
        Emitter.on('tick', tick, null);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          onIntersect(entry.isIntersecting);
        });
      },
      { threshold: 0 }
    );
    observer.observe(container);

    // Initial setup
    setSize();
    setLines();

    return () => {
      Emitter.off('mousemove', onMouseMove, null);
      Emitter.off('resize', onResize, null);
      Emitter.off('tick', tick, null);
      container.removeEventListener('touchmove', onTouchMove);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="a-waves" ref={containerRef}>
      <svg className="js-svg" ref={svgRef}></svg>
    </div>
  );
}
