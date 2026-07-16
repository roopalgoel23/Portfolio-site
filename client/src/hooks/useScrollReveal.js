import { useEffect, useRef } from 'react';

/**
 * Global Intersection Observer hook that adds the `is-visible` class
 * to every `.reveal` element when it enters the viewport.
 * Respects prefers-reduced-motion via CSS (no transitions).
 * Uses a MutationObserver to catch dynamically added `.reveal` elements.
 */
export default function useScrollReveal() {
  const observerRef = useRef(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const observeEls = (root) => {
      const els = Array.from((root || document).querySelectorAll('.reveal'));
      els.forEach((el) => {
        if (prefersReduced) {
          el.classList.add('is-visible');
        } else {
          observerRef.current?.observe(el);
        }
      });
    };

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observerRef.current.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    observeEls();

    // Watch for dynamically added .reveal elements (e.g. after async data loads)
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) observeEls(node);
        });
      });
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
}
