'use client';

import { useEffect, useRef } from 'react';

/**
 * Hook to safely use GSAP with React.
 * Dynamically imports from @/lib/gsap (which registers plugins once).
 * Cleans up all GSAP instances on unmount via gsap.context().revert().
 */
export function useGSAPContext(
  callback: (ctx: { gsap: typeof import('gsap').gsap; ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger }) => void,
  deps: React.DependencyList = []
) {
  const ctxRef = useRef<gsap.Context | null>(null);
  const activeRef = useRef(true);

  useEffect(() => {
    activeRef.current = true;
    let localCtx: gsap.Context | null = null;

    const init = async () => {
      const { gsap, ScrollTrigger } = await import('@/lib/gsap');
      if (!activeRef.current) return;

      localCtx = gsap.context(() => {
        callback({ gsap, ScrollTrigger });
      });
      ctxRef.current = localCtx;
    };

    init();

    return () => {
      activeRef.current = false;
      ctxRef.current?.revert();
      localCtx?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ctxRef;
}
