import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useUI } from "@/store/ui";
import Emitter from "@/utils/Emitter";
import { audioManager } from "@/services/audio/audioManager";
import { QuoteBanner } from "../../Navbar/QuoteBanner";
import { PalettePicker } from "../../Navbar/PalettePicker";
import { type ColorPalette, getPaletteById } from "@/data/palettes";
import "./Nav.scss";

const menu = [
  { id: "about", text: "About" },
  { id: "work", text: "Work" },
  { id: "contact", text: "Contact" },
];

export function Nav() {
  const headerRef = useRef<HTMLElement>(null);
  
  const isContrast = useUI((s) => s.isContrast);
  const setTheme = useUI((s) => s.setTheme);
  const activePaletteId = useUI((s) => s.activePalette);
  const setPalette = useUI((s) => s.setPalette);

  // Sync data-palette attribute on HTML tag whenever activePalette changes
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-palette", activePaletteId);
    }
  }, [activePaletteId]);

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

  const contrastTlRef = useRef<gsap.core.Timeline | null>(null);

  // Palette Change Transition
  const handleSelectPalette = (palette: ColorPalette) => {
    const mask = document.querySelector(".js-contrast-mask") as HTMLElement;
    if (!mask) {
      setPalette(palette.id);
      document.documentElement.setAttribute("data-palette", palette.id);
      Emitter.emit("contrastchange", isContrast ? "contrasted" : "default");
      return;
    }

    if (contrastTlRef.current) {
      contrastTlRef.current.kill();
      contrastTlRef.current = null;
    }

    const targetColor = isContrast ? palette.contrastedHex : palette.rootHex;

    const tl = gsap.timeline({
      onInterrupt: () => {
        gsap.set(mask, { x: "-100%" });
      },
    });
    contrastTlRef.current = tl;

    gsap.set(mask, {
      background: targetColor,
      borderColor: "rgba(13, 0, 4, 0.25)",
      x: "-100%",
    });

    tl.to(mask, {
      x: "0%",
      duration: 0.6,
      ease: "expo.inOut",
    });

    tl.call(() => {
      setPalette(palette.id);
      document.documentElement.setAttribute("data-palette", palette.id);
    });

    tl.to(mask, {
      x: "100%",
      duration: 0.6,
      ease: "expo.inOut",
    });

    tl.call(() => {
      gsap.set(mask, { x: "-100%" });
      contrastTlRef.current = null;
      Emitter.emit("contrastchange", isContrast ? "contrasted" : "default");
    });
  };

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

    // Kill any ongoing contrast animation to avoid stuck mask state
    if (contrastTlRef.current) {
      contrastTlRef.current.kill();
      contrastTlRef.current = null;
    }

    const currentPalette = getPaletteById(activePaletteId);
    const isCurrentlyContrast = isContrast;
    const targetPaper = !isCurrentlyContrast ? currentPalette.contrastedHex : currentPalette.rootHex;
    const targetBorder = !isCurrentlyContrast ? "rgba(13, 0, 4, 0.25)" : "rgba(13, 0, 4, 0.15)";

    const tl = gsap.timeline({
      onInterrupt: () => {
        gsap.set(mask, { x: "-100%" });
      },
    });
    contrastTlRef.current = tl;

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
      contrastTlRef.current = null;
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

        <QuoteBanner />

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

        <PalettePicker onSelectPalette={handleSelectPalette} />

        <button className="sb-contrast js-contrast" type="button" onMouseEnter={() => audioManager.play('hover')} onClick={() => { audioManager.play('transition'); toggleContrast(); }}>
          <span
            className="sb__icon"
            style={{ "--path": "path('M10.0996 20C8.71628 20 7.41628 19.7373 6.19961 19.212C4.98294 18.6867 3.92461 17.9743 3.02461 17.075C2.12461 16.1757 1.41228 15.1173 0.887611 13.9C0.362944 12.6827 0.100277 11.3827 0.0996106 10C0.098944 8.61733 0.361611 7.31733 0.887611 6.1C1.41361 4.88267 2.12594 3.82433 3.02461 2.925C3.92328 2.02567 4.98161 1.31333 6.19961 0.788C7.41761 0.262667 8.71761 0 10.0996 0C11.4816 0 12.7816 0.262667 17.1746 2.925C18.0733 3.82433 18.7859 4.88267 19.3126 6.1C19.8393 7.31733 20.1016 8.61733 20.0996 10C20.0976 11.3827 19.8349 12.6827 19.3116 13.9C18.7883 15.1173 18.0759 16.1757 17.1746 17.075C16.2733 17.9743 15.2149 18.687 13.9996 19.213C12.7843 19.739 11.4843 20.0013 10.0996 20ZM11.0996 17.925C13.0829 17.675 14.7456 16.804 16.0876 15.312C17.4296 13.82 18.1003 12.0493 18.0996 10C18.0989 7.95067 17.4279 6.18 16.0866 4.688C14.7453 3.196 13.0829 2.325 11.0996 2.075V17.925Z')" } as any}
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
      </div>
    </header>
  );
}
