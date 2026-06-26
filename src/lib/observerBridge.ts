import Emitter from "@/utils/Emitter";
import Ticker from "@/utils/Ticker";

let isBound = false;
let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
let windowWidth = 0;
let windowHeight = 0;
let observer: IntersectionObserver | null = null;

const setScrollProgress = () => {
  (window as any).scrollProgress = window.scrollY / (window as any).maxScrollTop;
};

const onResize = () => {
  const newWidth = window.innerWidth;
  let widthChanged = false;
  if (windowWidth !== newWidth) {
    if (windowWidth !== 0) {
      widthChanged = true;
    }
    windowWidth = newWidth;
  }

  const newHeight = window.innerHeight;
  let heightChanged = false;
  if (windowHeight !== newHeight) {
    if (windowHeight !== 0) {
      heightChanged = true;
    }
    windowHeight = newHeight;
  }

  (window as any).safeWidth = newWidth;
  (window as any).safeHeight = newHeight;
  (window as any).maxScrollTop = document.body.scrollHeight - newHeight;

  setScrollProgress();
  Emitter.emit("resize", widthChanged, heightChanged);
};

const onScroll = () => {
  setScrollProgress();

  Ticker.nextTick(() => {
    Emitter.emit("scroll", window.scrollY);
  }, null);
};

const onMouseMove = (e: MouseEvent) => {
  Emitter.emit("mousemove", e.clientX, e.clientY);
};

const onSiteLoaded = () => {
  document.documentElement.classList.add("is-loaded");
  Emitter.emit("siteLoaded");
};

const resizeThrottle = () => {
  if (resizeTimeout) clearTimeout(resizeTimeout);

  resizeTimeout = setTimeout(() => {
    Ticker.nextTick(onResize, null);
  }, 200);
};

export const initObserverBridge = () => {
  if (typeof window === "undefined" || isBound) return;

  isBound = true;
  Ticker.init();

  // OS class
  let os = "unknown";
  if (navigator.userAgent.indexOf("Win") !== -1) {
    os = "windows";
  } else if (navigator.userAgent.indexOf("Android") !== -1) {
    os = "android";
  } else if (navigator.userAgent.indexOf("Mac") !== -1) {
    os = "mac";
  } else if (navigator.userAgent.indexOf("Linux") !== -1) {
    os = "linux";
  }
  document.documentElement.classList.add(`is-${os}`);

  // Browser class
  let browser = "unknown";
  if (navigator.userAgent.indexOf("Firefox") !== -1) {
    browser = "firefox";
  } else if (navigator.userAgent.indexOf("Chrome") !== -1) {
    browser = "chrome";
  } else if (navigator.userAgent.indexOf("Safari") !== -1) {
    browser = "safari";
  }
  document.documentElement.classList.add(`is-${browser}`);

  window.addEventListener("resize", resizeThrottle);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("mousemove", onMouseMove, { passive: true });

  Emitter.on("updateViewport", onResize, null, false);

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.dispatchEvent(
          new CustomEvent("intersect", {
            detail: { isIntersecting: entry.isIntersecting },
          }),
        );

        if (entry.isIntersecting) {
          entry.target.classList.add("is-in-view");
          entry.target.classList.remove(
            "is-out-of-view",
            "is-out-of-view-top",
            "is-out-of-view-bottom",
          );
        } else {
          entry.target.classList.remove("is-in-view");
          entry.target.classList.add("is-out-of-view");

          entry.target.classList.toggle("is-out-of-view-top", entry.boundingClientRect.top < 0);
          entry.target.classList.toggle("is-out-of-view-bottom", entry.boundingClientRect.top > 0);
        }
      });
    },
    { threshold: 0 },
  );

  document.querySelectorAll("[data-intersect]").forEach((el) => {
    observer?.observe(el);
  });

  onResize();
  onScroll();

  if (document.readyState === "complete") {
    onSiteLoaded();
  } else {
    window.addEventListener("load", onSiteLoaded, { once: true });
  }
};

export const observeElement = (el: HTMLElement) => {
  observer?.observe(el);
};

export const unobserveElement = (el: HTMLElement) => {
  observer?.unobserve(el);
};

export const destroyObserverBridge = () => {
  if (typeof window === "undefined" || !isBound) return;

  isBound = false;

  window.removeEventListener("resize", resizeThrottle);
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("load", onSiteLoaded);

  if (resizeTimeout) clearTimeout(resizeTimeout);
  resizeTimeout = null;

  Emitter.off("updateViewport", onResize, null);

  if (observer) {
    document.querySelectorAll("[data-intersect]").forEach((el) => {
      observer?.unobserve(el);
    });
    observer.disconnect();
    observer = null;
  }

  Ticker.destroy();
};
