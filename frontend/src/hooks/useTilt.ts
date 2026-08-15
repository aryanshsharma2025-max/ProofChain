import { useCallback, useRef } from 'react';

/**
 * Subtle perspective tilt on mouse move for desktop.
 * Max ~2 degrees. Uses transform for GPU acceleration.
 * Disabled on mobile / touch and when reduced-motion is preferred.
 */
export function useTilt(maxDeg = 2) {
  const ref = useRef<HTMLDivElement>(null);
  const rafId = useRef<number>(0);

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (window.matchMedia('(pointer: coarse)').matches) return;

      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.transform = `perspective(600px) rotateX(${-y * maxDeg}deg) rotateY(${x * maxDeg}deg) translateZ(0)`;
      });
    },
    [maxDeg],
  );

  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(rafId.current);
    el.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) translateZ(0)';
  }, []);

  return { ref, onMouseMove: handleMove, onMouseLeave: handleLeave };
}
