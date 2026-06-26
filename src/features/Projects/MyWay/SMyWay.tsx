import { useEffect, useRef } from 'react';
import './SMyWay.scss';
import { Section } from './Section';

const frames = [
  { caption: 'Generative art poster concept',    src: '/images/frames/art-1987.jpg' },
  { caption: 'Generative art poster concept',    src: '/images/frames/art-dtyw.jpg' },
  { caption: 'Generative art poster concept',    src: '/images/frames/art-lines.jpg' },
  { caption: 'My first FOTD on FWA  ♥ (2012)',  src: '/images/frames/first-fwa.jpg' },
  { caption: 'Roaaaar!',                         src: '/images/frames/roar.jpg' },
  { caption: 'Early age (2006) desk setup ',     src: '/images/frames/setup-2006.jpg' },
  { caption: '2016 desk setup',                  src: '/images/frames/setup-2016.jpg' },
  { caption: '2020 desk setup',                  src: '/images/frames/setup-2020.jpg' },
  { caption: 'Waaark Creative Robots',           src: '/images/frames/waaark.png' },
  { caption: '2011 portfolio',                   src: '/images/frames/portfolio-2011.jpg' },
  { caption: '2014 portfolio',                   src: '/images/frames/portfolio-2014.jpg' },
  { caption: '2017 portfolio (never released)',  src: '/images/frames/portfolio-2017.jpg' },
  { caption: '2021 portfolio',                   src: '/images/frames/portfolio-2021.jpg' },
  { caption: 'Legos ♥',                         src: '/images/frames/legos.jpg' },
];

export function SMyWay() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const section = new Section(containerRef.current);

    return () => {
      section.destroy();
    };
  }, []);

  return (
    <section ref={containerRef} className="s-my-way" data-intersect="true">

      {/* ── Smiley SVG (inline, exact from SMyWay.astro) ── */}
      <svg
        className="s__smiley js-smiley"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 77.8 77.8"
        xmlSpace="preserve"
      >
        <circle cx="38.9" cy="38.9" r="38.9" />
        <path d="M38.9 77.8c-2 0-4.1-.2-6.2-.5C11.6 73.9-2.9 53.9.5 32.8 2.1 22.5 7.7 13.5 16.1 7.4c8.4-6.1 18.7-8.5 29-6.9 10.3 1.6 19.3 7.2 25.4 15.6 6.1 8.4 8.5 18.7 6.9 29-3.1 19.1-19.7 32.7-38.5 32.7zM38.8 1c-7.9 0-15.6 2.5-22.1 7.2C8.5 14.1 3.1 22.9 1.5 32.9-1.8 53.5 12.3 73 32.9 76.3 53.5 79.6 73 65.5 76.3 44.9l.5.1-.5-.1c1.6-10-.8-20-6.7-28.2S54.9 3.1 44.9 1.5c-2-.3-4.1-.5-6.1-.5zM25.5 23.1c-1.9 0-3.5 2-4.1 5.1l-.1.3 3 2.2-2.9 2.2.1.3c.6 2.5 1.5 5.1 4.1 5.1 2.4 0 4.2-3.3 4.2-7.6s-2.4-7.6-4.3-7.6zm26.6 0c-1.9 0-3.5 2-4.1 5.1v.3l3 2.2-3 2.2.1.3c.6 2.5 1.5 5.1 4.1 5.1 2.4 0 4.2-3.3 4.2-7.6s-2.3-7.6-4.3-7.6zM62 39c0-.3-.2-.5-.5-.5s-.5.2-.5.5c0 12.2-9.9 22.1-22.1 22.1-12.2 0-22.1-9.9-22.1-22.1 0-.3-.2-.5-.5-.5s-.5.2-.5.5c0 12.7 10.4 23.1 23.1 23.1S62 51.7 62 39z" />
      </svg>

      {/* ── Objects wrapper — frames + stars + ruler ── */}
      <div className="s__objects js-objects">
        {frames.map((frame, i) => (
          <div className="a-object a-object--frame" key={`frame-${i}`}>
            <figure className="a__inner">
              <img
                loading="lazy"
                className="a__img"
                src={frame.src}
                alt={frame.caption}
              />
              <figcaption
                className="a__caption"
                dangerouslySetInnerHTML={{ __html: frame.caption }}
              />
            </figure>
            <div className="a__side a__side--vertical" />
            <div className="a__side a__side--horizontal" />
          </div>
        ))}

        {Array(10).fill(0).map((_, i) => (
          <div className="a-object a-object--star" key={`star-${i}`}>
            <div className="a__side a__side--top-left" />
            <div className="a__side a__side--top-right" />
            <div className="a__side a__side--bottom-left" />
            <div className="a__side a__side--bottom-right" />
          </div>
        ))}

        {/* Ruler — used by Section.setSize() for perspective origin calculation */}
        <div className="s__ruler js-ruler" />
      </div>

      {/* ── Catcher text (distorted + normal layers) ── */}
      <div className="s__catcher">
        <div className="s__catcher__distorted-wrapper">
          <div className="s__catcher__distorted">
            <div className="s__catcher__text s__catcher__text--distorted">
              Think <br />
              build <br />
              ship <br />
              repeat
            </div>
          </div>
        </div>

        <div className="s__catcher__normal-wrapper">
          <div className="s__catcher__normal">
            <div className="s__catcher__text s__catcher__text--normal">
              Think <br />
              build <br />
              ship <br />
              repeat
            </div>
          </div>
        </div>
      </div>

      {/* ── SVG canvas for ray lines ── */}
      <svg className="s__svg js-svg">
        <path className="s__svg__circular-path js-lines-circular-path" d="" />
      </svg>

    </section>
  );
}

export default SMyWay;
