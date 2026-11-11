'use client';

/** 進場 reveal：共用一個 IntersectionObserver，元素進視口加 .in（一次性）。 */
import { useCallback } from 'react';

let io: IntersectionObserver | null = null;
function getIO() {
  if (!io) {
    io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io?.unobserve(e.target);
          }
        }
      },
      { threshold: 0.16, rootMargin: '0px 0px -6% 0px' },
    );
  }
  return io;
}

export function Rv({
  as: Tag = 'div',
  className = '',
  delay = 0,
  children,
}: {
  as?: 'div' | 'section' | 'h2' | 'h3' | 'p' | 'figure' | 'li' | 'span' | 'ul';
  className?: string;
  delay?: 0 | 1 | 2 | 3;
  children: React.ReactNode;
}) {
  // 用 callback ref（型別寬鬆用 Element）避免 as 為多種標籤時 ref 型別交集衝突；
  // 回傳 cleanup 走 React 19 ref cleanup，元素卸載時 unobserve。
  const setRef = useCallback((el: Element | null) => {
    if (!el) return;
    const obs = getIO();
    obs.observe(el);
    return () => obs.unobserve(el);
  }, []);
  const d = delay ? ` d${delay}` : '';
  const El: React.ElementType = Tag;
  return (
    <El ref={setRef} className={`rv${d} ${className}`.trim()}>
      {children}
    </El>
  );
}
