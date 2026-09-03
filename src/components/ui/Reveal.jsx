import { useEffect, useRef, useState } from 'react';

/**
 * Reveal — scroll-entry animation using IntersectionObserver.
 * GPU-safe (transform + opacity + blur only). Respects prefers-reduced-motion.
 */
export function Reveal({
  children,
  as: Tag = 'div',
  className = '',
  delay = 0,
  y = 24,
  blur = 10,
  once = true,
  style,
  ...rest
}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            if (once) io.unobserve(entry.target);
          } else if (!once) {
            setShown(false);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  const vars = {
    '--reveal-delay': `${delay}ms`,
    '--reveal-y': `${y}px`,
    '--reveal-blur': `${blur}px`,
    ...style,
  };

  const cls = ['reveal', shown ? 'is-visible' : '', className].filter(Boolean).join(' ');

  return (
    <Tag ref={ref} className={cls} style={vars} {...rest}>
      {children}
    </Tag>
  );
}

export default Reveal;
