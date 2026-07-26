import React, { useEffect, useState, useRef } from 'react';
import './AWork.scss';

interface AWorkProps {
  title: string;
  subtitle: string;
  cssClass: string;
  index: string;
  externalUrl: string;
  src: string;
  total: string;
}

export const AWork: React.FC<AWorkProps> = ({ title, subtitle, cssClass, index, externalUrl, src, total }) => {
  const [key] = useState(() => Math.random().toString(36).slice(2, 6) + '-' + index + '/' + total);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    
    videoEl.defaultMuted = true;
    
    let observer: IntersectionObserver;
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Load the source only when entering viewport the first time
            if (!videoEl.getAttribute('src')) {
              videoEl.src = videoEl.getAttribute('data-src') || '';
              videoEl.load();
            }
            const playPromise = videoEl.play();
            if (playPromise !== undefined) {
              playPromise.catch((error) => {
                console.warn('Autoplay prevented:', error);
                // Fallback: If autoplay fails, force rendering the first frame
                videoEl.currentTime = 0.1;
                
                // Retry playback on next visibility change or interaction
                const retryPlay = () => {
                  videoEl.play().catch(() => {});
                  document.removeEventListener('click', retryPlay);
                };
                document.addEventListener('click', retryPlay, { once: true });
              });
            }
          } else {
            videoEl.pause();
          }
        });
      }, { rootMargin: '200px' });
      
      observer.observe(videoEl);
    }
    
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && !customElements.get('a-work')) {
      class AWorkElement extends HTMLElement {
        static observedAttributes = ['progress'];
        
        attributeChangedCallback(name: string, oldValue: string, newValue: string) {
          if (name === 'progress') {
            this.style.setProperty('--progress', newValue);
            if (newValue === '1' || newValue === '-1') {
              this.classList.remove('is-inview');
            } else {
              this.classList.add('is-inview');
            }
          }
        }
      }

      customElements.define('a-work', AWorkElement);
    }
  }, []);

  const videoFileName = (src || '').split('/').pop()?.replace(/\.[^/.]+$/, '') || '';
  const CUSTOM_LIVE_URLS: Record<string, string> = {
    'Fhir-Tech': 'https://fhir-tech.vercel.app/',
    'Simple-Wether': 'https://simplewether.vercel.app/',
    'To_Do_APP': 'https://taskflow-iota-puce.vercel.app/',
    'ECommerce_Store': 'https://nextgen-delta-orpin.vercel.app/',
    'ECommerse_Store': 'https://nextgen-delta-orpin.vercel.app/',
    'Calculator(Web)': 'https://apexcompute.vercel.app/',
    'Healthcare_AI_Prototype': 'https://healthcare-ai-nu.vercel.app/',
    'Portfolio': 'https://portfolio2k26.vercel.app/',
  };

  const fallbackUrl = CUSTOM_LIVE_URLS[videoFileName] || (videoFileName ? `https://github.com/Mr-Anonymous-Guy/${videoFileName}` : 'https://github.com/Mr-Anonymous-Guy');

  const repoUrl = (externalUrl && externalUrl !== 'https://github.com/Mr-Anonymous-Guy' && externalUrl !== 'https://github.com/Mr-Anonymous-Guy/')
    ? externalUrl
    : fallbackUrl;

  return React.createElement(
    'a-work',
    { class: cssClass },
    <div className="a__inner">
      <a href={repoUrl} target="_blank" rel="noopener noreferrer">
        <video
          ref={videoRef}
          data-src={src}
          className="a__video js-video"
          loop
          muted
          playsInline
          preload="metadata"
        ></video>

        <div className="a__caption">
          <div className="a__caption__text">
            <div>{title}</div>
            <div style={{ fontSize: '9px', opacity: 0.7, marginTop: '4px' }}>{subtitle}</div>
          </div>
          <div className="a__caption__key">#{key}</div>
        </div>
      </a>
    </div>
  );
};
