import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useUI } from "@/store/ui";
import Emitter from "@/utils/Emitter";
import { audioManager } from "@/services/audio/audioManager";
import "./Nav.scss";

const menu = [
  { id: "about", text: "About" },
  { id: "work", text: "Work" },
  { id: "contact", text: "Contact" },
];

const consoleMessages = [
  "Preparing for inevitable debugging",
  "Optimizing for 60fps... maybe 30",
  "Compiling React into a million chunks...",
  "Deleting node_modules...",
  "Centering the div... wait...",
  "Writing spaghetti code...",
  "Asking StackOverflow...",
  "Pretending to know what I'm doing...",
  "Re-routing your expectations… expect delays",
  "Trying to animate enthusiasm… it’s not going well",
  "Stuck in an infinite loop",
  "Simulating progress… sort of",
  "This will probably break soon",
  "Simulating something useful",
  "Calculating failure probabilities",
];

export function Nav() {
  const headerRef = useRef<HTMLElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);
  
  const isContrast = useUI((s) => s.isContrast);
  const setTheme = useUI((s) => s.setTheme);

  // Intro Animation
  useEffect(() => {
    if (!headerRef.current) return;
    
    const logo = headerRef.current.querySelector(".js-logo");
    const menuItems = headerRef.current.querySelectorAll(".js-menu-item");
    const qrCode = headerRef.current.querySelector(".js-qr-code");

    const items = [logo, ...Array.from(menuItems)];

    const tl = gsap.timeline();

    tl.set(headerRef.current, {
      opacity: 1,
    });

    // Slide the header in from above
    tl.from(headerRef.current, {
      y: "-100%",
      duration: 1.5,
      ease: "expo.inOut",
    }, 1);

    tl.from(items, {
      y: "-100%",
      duration: 1.5,
      ease: "expo.out",
      stagger: 0.1,
    }, 1.5);

    if (qrCode) {
      tl.fromTo(qrCode, {
        "--bg-p": "0%",
      }, {
        "--bg-p": "100%",
        duration: 1.5,
        ease: "expo.out",
      }, 1.75);
    }
  }, []);

  // Typewriter effect
  useEffect(() => {
    let message = "";
    let messageLineBreak = false;
    let lastMessage = "";
    let writeDelay = 0;
    let lastTypeTime = 0;
    let animationFrameId: number;

    const getRandomMessage = () => {
      let msg = consoleMessages[Math.floor(Math.random() * consoleMessages.length)];
      while (msg === lastMessage) {
        msg = consoleMessages[Math.floor(Math.random() * consoleMessages.length)];
      }
      lastMessage = msg;
      return msg;
    };

    const updateConsole = (time: number) => {
      animationFrameId = requestAnimationFrame(updateConsole);

      if (time - lastTypeTime < writeDelay) {
        return;
      }

      if (!consoleRef.current) return;

      if (message === "") {
        message = getRandomMessage();
        writeDelay = 2000;
      } else {
        if (message === lastMessage || messageLineBreak) {
          consoleRef.current.textContent += "\n";
        }

        const char = message.charAt(0);
        message = message.substring(1);

        if (char === ",") {
          writeDelay = 100;
        } else if (char === " ") {
          writeDelay = 100;
        } else if (char === "") {
          writeDelay = 200;
        } else if (char === "…") {
          writeDelay = 400;
        } else if (char === ".") {
          writeDelay = 400;
        } else {
          writeDelay = 20;
        }

        consoleRef.current.textContent += char;
        messageLineBreak = char === "…";
      }

      consoleRef.current.textContent = consoleRef.current.textContent!
        .split("\n")
        .slice(-5)
        .join("\n");

      lastTypeTime = time;
    };

    animationFrameId = requestAnimationFrame(updateConsole);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Theme Toggle
  const toggleContrast = () => {
    const mask = document.querySelector(".js-contrast-mask") as HTMLElement;
    if (!mask) {
      const isCurrentlyContrast = isContrast;
      setTheme(isCurrentlyContrast ? "normal" : "contrast");
      Emitter.emit(
        "contrastchange",
        !isCurrentlyContrast ? "contrasted" : "default"
      );
      return;
    }

    const isCurrentlyContrast = isContrast;
    const targetPaper = !isCurrentlyContrast ? "#ff004d" : "#ffffff";
    const targetBorder = !isCurrentlyContrast ? "rgba(13, 0, 4, 0.25)" : "rgba(13, 0, 4, 0.15)";

    const tl = gsap.timeline();

    gsap.set(mask, {
      background: targetPaper,
      borderColor: targetBorder,
      x: "-100%",
    });

    tl.to(mask, {
      x: "0%",
      duration: 0.6,
      ease: "expo.inOut",
    });

    tl.call(() => {
      setTheme(isCurrentlyContrast ? "normal" : "contrast");
    });

    tl.to(mask, {
      x: "100%",
      duration: 0.6,
      ease: "expo.inOut",
    });

    tl.call(() => {
      gsap.set(mask, { x: "-100%" });
      Emitter.emit(
        "contrastchange",
        !isCurrentlyContrast ? "contrasted" : "default"
      );
    });
  };

  const moveToSection = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    audioManager.play('transition');
    const id = e.currentTarget.getAttribute("href");
    if (!id) return;
    
    if ((window as any).lenis) {
      (window as any).lenis.scrollTo(id, {
        duration: 1.5,
        easing: (t: number) =>
          t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t,
      });
    } else {
      const target = document.querySelector(id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header ref={headerRef} className="site-head">
      <div className="site-head__container">
        <div className="sb-logo js-logo">
          <a href="#top" className="header__logo">
            <img src="/logo.svg" alt="Logo" className="header__logo-svg" />
          </a>
        </div>

        <div className="sb-console" role="presentation">
          <div className="sb-console__inner js-console" ref={consoleRef}>
          </div>
        </div>

        <nav className="sb-menu">
          <ul className="sb__list">
            {menu.map((item) => (
              <li key={item.id} className="sb__item js-menu-item">
              <a href={"#" + item.id} className="js-menu-link" onClick={moveToSection} onMouseEnter={() => audioManager.play('hover')}>
                  <span className="sb__text">{item.text}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <ul className="sb-socials">
          <li className="sb__item">
            <a href="https://github.com/Mr-Anonymous-Guy" target="_blank" rel="noopener noreferrer" title="GitHub" onMouseEnter={() => audioManager.play('hover')} onClick={() => audioManager.play('transition')}>
              {/* GitHub Path */}
              <span
                className="sb__icon sb__icon--github"
                style={{ "--path": "path('M9.5 0C4.25 0 0 4.34 0 9.7c0 4.28 2.72 7.91 6.49 9.2.48.09.65-.21.65-.47v-1.8c-2.64.58-3.2-1.14-3.2-1.14-.43-1.12-1.05-1.42-1.05-1.42-.86-.6.07-.59.07-.59.96.07 1.46.99 1.46.99.85 1.48 2.23 1.05 2.78.8.08-.63.33-1.05.61-1.3-2.11-.24-4.33-1.08-4.33-4.79 0-1.06.37-1.92.98-2.6-.1-.24-.43-1.23.09-2.56 0 0 .8-.26 2.62 1A8.93 8.93 0 0 1 9.5 4.67c.86 0 1.73.12 2.38.33 1.82-1.26 2.62-1 2.62-1 .52 1.33.19 2.32.09 2.56.61.68.98 1.54.98 2.6 0 3.72-2.22 4.55-4.34 4.79.34.3.65.89.65 1.79v2.66c0 .26.17.56.66.47A9.71 9.71 0 0 0 19 9.7C19 4.34 14.75 0 9.5 0z')" } as any}
              >
              </span>
              <span className="sr-only">GitHub</span>
            </a>
          </li>

          <li className="sb__item">
            <a
              href="https://www.linkedin.com/in/mr-anonymous-guy/"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn"
              onMouseEnter={() => audioManager.play('hover')}
              onClick={() => audioManager.play('transition')}
            >
              <span
                className="sb__icon sb__icon--linkedin"
                style={{ "--path": "path('M1.13025 14.9839H3.93671V4.6H1.13025V14.9839ZM2.53348 0.0161285C1.598 0.0161285 0.849609 0.764516 0.849609 1.7C0.849609 2.63548 1.598 3.38387 2.53348 3.38387C3.46896 3.38387 4.21735 2.63548 4.21735 1.7C4.21735 0.764516 3.46896 0.0161285 2.53348 0.0161285ZM8.70767 6.19032V4.6H5.90122V14.9839H8.70767V9.65161C8.70767 6.65806 12.5432 6.47097 12.5432 9.65161V14.9839H15.3496V8.62258C15.3496 3.57097 10.0174 3.75806 8.70767 6.19032Z')" } as any}
              >
              </span>
              <span className="sr-only">LinkedIn</span>
            </a>
          </li>
        </ul>

        <button className="sb-contrast js-contrast" type="button" onMouseEnter={() => audioManager.play('hover')} onClick={() => { audioManager.play('transition'); toggleContrast(); }}>
          <span
            className="sb__icon"
            style={{ "--path": "path('M10.0996 20C8.71628 20 7.41628 19.7373 6.19961 19.212C4.98294 18.6867 3.92461 17.9743 3.02461 17.075C2.12461 16.1757 1.41228 15.1173 0.887611 13.9C0.362944 12.6827 0.100277 11.3827 0.0996106 10C0.098944 8.61733 0.361611 7.31733 0.887611 6.1C1.41361 4.88267 2.12594 3.82433 3.02461 2.925C3.92328 2.02567 4.98161 1.31333 6.19961 0.788C7.41761 0.262667 8.71761 0 10.0996 0C11.4816 0 12.7816 0.262667 13.9996 0.788C15.2176 1.31333 16.2759 2.02567 17.1746 2.925C18.0733 3.82433 18.7859 4.88267 19.3126 6.1C19.8393 7.31733 20.1016 8.61733 20.0996 10C20.0976 11.3827 19.8349 12.6827 19.3116 13.9C18.7883 15.1173 18.0759 16.1757 17.1746 17.075C16.2733 17.9743 15.2149 18.687 13.9996 19.213C12.7843 19.739 11.4843 20.0013 10.0996 20ZM11.0996 17.925C13.0829 17.675 14.7456 16.804 16.0876 15.312C17.4296 13.82 18.1003 12.0493 18.0996 10C18.0989 7.95067 17.4279 6.18 16.0866 4.688C14.7453 3.196 13.0829 2.325 11.0996 2.075V17.925Z')" } as any}
          >
          </span>
          <span className="sr-only">Change contrast</span>
        </button>

        <aside className="sb-availability">
          <p>
            <span className="sb__line">
              <span className="sb__text">Coding globally from India.</span>
            </span>

            <span className="sb__line">
              <span className="sb__text">Available for freelance work → </span>
              <a href="mailto:mr.anonymous071105@gmail.com?subject=Project%20Inquiry" className="sb__link">Hire me</a>
            </span>
          </p>
        </aside>

        <a
          href="mailto:mr.anonymous071105@gmail.com?subject=Project%20Inquiry"
          className="sb-qr-code js-qr-code"
          title="Contact me!"
        >
          <img src="/images/qr-code.svg" alt="QR Code" width="72" height="72" />
        </a>
      </div>
    </header>
  );
}
