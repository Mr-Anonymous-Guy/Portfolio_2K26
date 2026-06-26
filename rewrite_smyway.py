import re
import os

astro_path = r'c:\Mr-Anonymous-Guy\04_JS_WebDev\Portfolio\tutun-mahapatra-code-vision\aw2025\src\components\SMyWay.astro'
scss_out = r'c:\Mr-Anonymous-Guy\04_JS_WebDev\Portfolio\tutun-mahapatra-code-vision\src\components\MyWay\SMyWay.scss'
tsx_out = r'c:\Mr-Anonymous-Guy\04_JS_WebDev\Portfolio\tutun-mahapatra-code-vision\src\components\MyWay\SMyWay.tsx'

with open(astro_path, 'r', encoding='utf-8') as f:
    content = f.read()

# SCSS
style_match = re.search(r'<style lang="scss">([\s\S]*?)<\/style>', content)
if style_match:
    style_content = style_match.group(1).strip()
    # Add imports required for NextJS global scss format
    style_content = '@use "sass:math";\n@use "sass:map";\n@use "sass:color";\n@import "../../styles/aw_styles/import";\n\n' + style_content
    with open(scss_out, 'w', encoding='utf-8') as f:
        f.write(style_content)
    print("Wrote SCSS")

# Script
script_match = re.search(r'<script>([\s\S]*?)<\/script>', content)
if script_match:
    script_content = script_match.group(1).strip()
    
    # Strip the import lines as we'll provide our own
    script_content = re.sub(r'import .*?\n', '', script_content)
    
    # Remove new Section() at the end
    script_content = script_content.replace('new Section()', '')

    tsx_code = f"""import React, {{ useEffect, useRef }} from 'react';
import './SMyWay.scss';
import Emitter from '@/utils/Emitter';
import Ticker from '@/utils/Ticker';
import projectArogya from '@/assets/project-arogya.jpg';
import projectFinsmart from '@/assets/project-finsmart.jpg';

const frames = [
  {{ caption: 'ArogyaAI', src: projectArogya }},
  {{ caption: 'Fin Smart', src: projectFinsmart }},
  {{ caption: 'React', src: null }},
  {{ caption: 'Next.js', src: null }},
  {{ caption: 'TypeScript', src: null }},
  {{ caption: 'Tailwind CSS', src: null }},
  {{ caption: 'Node.js', src: null }},
  {{ caption: 'Express', src: null }},
  {{ caption: 'MongoDB', src: null }},
  {{ caption: 'PostgreSQL', src: null }},
  {{ caption: 'Figma', src: null }},
  {{ caption: 'Git', src: null }},
  {{ caption: 'Docker', src: null }},
  {{ caption: 'AWS', src: null }},
  {{ caption: 'Vercel', src: null }},
  {{ caption: 'Linux', src: null }},
  {{ caption: 'C++', src: null }},
  {{ caption: 'Python', src: null }},
];

export function SMyWay() {{
  const sectionRef = useRef<HTMLElement>(null);
  const objectsWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {{
    if (!sectionRef.current) return;

{script_content}

    const instance = new Section();
    
    return () => {{
      if (instance && typeof instance.destroy === 'function') {{
        instance.destroy();
      }}
    }};
  }}, []);

  return (
    <section className="s-my-way" data-intersect ref={{sectionRef}}>
      <svg
        className="s__smiley js-smiley"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 77.8 77.8"
        xmlSpace="preserve"
      >
        <circle cx="38.9" cy="38.9" r="38.9"></circle>

        <path
          d="M38.9 77.8c-2 0-4.1-.2-6.2-.5C11.6 73.9-2.9 53.9.5 32.8 2.1 22.5 7.7 13.5 16.1 7.4c8.4-6.1 18.7-8.5 29-6.9 10.3 1.6 19.3 7.2 25.4 15.6 6.1 8.4 8.5 18.7 6.9 29-3.1 19.1-19.7 32.7-38.5 32.7zM38.8 1c-7.9 0-15.6 2.5-22.1 7.2C8.5 14.1 3.1 22.9 1.5 32.9-1.8 53.5 12.3 73 32.9 76.3 53.5 79.6 73 65.5 76.3 44.9l.5.1-.5-.1c1.6-10-.8-20-6.7-28.2S54.9 3.1 44.9 1.5c-2-.3-4.1-.5-6.1-.5zM25.5 23.1c-1.9 0-3.5 2-4.1 5.1l-.1.3 3 2.2-2.9 2.2.1.3c.6 2.5 1.5 5.1 4.1 5.1 2.4 0 4.2-3.3 4.2-7.6s-2.4-7.6-4.3-7.6zm26.6 0c-1.9 0-3.5 2-4.1 5.1v.3l3 2.2-3 2.2.1.3c.6 2.5 1.5 5.1 4.1 5.1 2.4 0 4.2-3.3 4.2-7.6s-2.3-7.6-4.3-7.6zM62 39c0-.3-.2-.5-.5-.5s-.5.2-.5.5c0 12.2-9.9 22.1-22.1 22.1-12.2 0-22.1-9.9-22.1-22.1 0-.3-.2-.5-.5-.5s-.5.2-.5.5c0 12.7 10.4 23.1 23.1 23.1S62 51.7 62 39z"
        >
        </path>
      </svg>

      <div className="s__objects js-objects" ref={{objectsWrapperRef}}>
        {{frames.map((frame, index) => (
          <div className="a-object a-object--frame" key={{index}}>
            <figure className="a__inner">
              {{frame.src ? (
                <img src={{frame.src.src}} alt={{frame.caption}} className="a__img" />
              ) : (
                <div className="a__title">{{frame.caption}}</div>
              )}}
              <figcaption
                className="a__caption"
                dangerouslySetInnerHTML={{{{ __html: frame.caption }}}}
              />
            </figure>
            <div className="a__side a__side--vertical" />
            <div className="a__side a__side--horizontal" />
          </div>
        ))}}

        {{Array(10)
          .fill(0)
          .map((_, index) => (
            <div className="a-object a-object--star" key={{`star-${{index}}`}}>
              <div className="a__side a__side--top-left" />
              <div className="a__side a__side--top-right" />
              <div className="a__side a__side--bottom-left" />
              <div className="a__side a__side--bottom-right" />
            </div>
          ))}}

        <div className="s__ruler js-ruler"></div>
      </div>

      <div className="s__catcher">
        <div className="s__catcher__distorted-wrapper">
          <div className="s__catcher__distorted">
            <div className="s__catcher__text s__catcher__text--distorted">
              THINK <br />
              BUILD <br />
              SHIP <br />
              REPEAT
            </div>
          </div>
        </div>

        <div className="s__catcher__normal-wrapper">
          <div className="s__catcher__normal">
            <div className="s__catcher__text s__catcher__text--normal">
              THINK <br />
              BUILD <br />
              SHIP <br />
              REPEAT
            </div>
          </div>
        </div>
      </div>

      <svg className="s__svg js-svg">
        <path
          className="s__svg__circular-path js-lines-circular-path"
          d=""
        ></path>
      </svg>
    </section>
  );
}}
"""
    with open(tsx_out, 'w', encoding='utf-8') as f:
        f.write(tsx_code)
    print("Wrote TSX")
