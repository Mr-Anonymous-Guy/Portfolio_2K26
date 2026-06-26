import React, { useEffect, useState } from 'react';
import './AWork.scss';

interface AWorkProps {
  caption: string;
  cssClass: string;
  index: string;
  site: string;
  src: string;
  total: string;
}

export const AWork: React.FC<AWorkProps> = ({ caption, cssClass, index, site, src, total }) => {
  const [key] = useState(() => Math.random().toString(36).slice(2, 6) + '-' + index + '/' + total);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && !customElements.get('a-work')) {
      class AWorkElement extends HTMLElement {
        static observedAttributes = ['progress'];

        link: HTMLAnchorElement | null = null;
        video: HTMLVideoElement | null = null;
        isPlaying: boolean = false;

        connectedCallback() {
          this.video = this.querySelector('.js-video');
          this.link = this.querySelector('a');
          this.isPlaying = false;
          if (this.link) {
            this.link.addEventListener('click', this.onClick.bind(this));
          }
        }

        attributeChangedCallback(name: string, oldValue: string, newValue: string) {
          if (name === 'progress') {
            this.style.setProperty('--progress', newValue);
            if (newValue === '1' || newValue === '-1') {
              if (this.isPlaying) {
                this.outView();
              }
            } else {
              if (!this.isPlaying) {
                this.inView();
              }
            }
          }
        }

        inView() {
          if (this.video) this.video.play();
          this.isPlaying = true;
          this.classList.add('is-inview');
        }

        outView() {
          if (this.video) this.video.pause();
          this.isPlaying = false;
          this.classList.remove('is-inview');
        }

        onClick(event: MouseEvent) {
          if (this.link && this.link.href.includes('#')) {
            event.preventDefault();
            return false;
          }
        }
      }

      customElements.define('a-work', AWorkElement);
    }
  }, []);

  return React.createElement(
    'a-work',
    { class: cssClass },
    <div className="a__inner">
      <a href={site} target="_blank" rel="noreferrer">
        <video
          data-src={src}
          className="a__video js-video"
          loop
          muted
          playsInline
          width="1082"
          height="636"
        ></video>

        <div className="a__caption">
          <div className="a__caption__text">{caption}</div>
          <div className="a__caption__key">#{key}</div>
        </div>
      </a>
    </div>
  );
};
