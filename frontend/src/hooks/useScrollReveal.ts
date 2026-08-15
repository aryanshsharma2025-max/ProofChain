import { useEffect, useRef } from 'react';

/**
 * IntersectionObserver-based scroll reveal.
 * Adds 'visible' class to the element when it enters the viewport.
 */
export function useScrollReveal<T extends HTMLElement>(
  threshold = 0.1,
  rootMargin = '0px 0px -40px 0px',
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect prefers-reduced-motion
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      el.classList.add('visible');
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return ref;
}
