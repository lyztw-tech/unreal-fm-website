'use client';

/**
 * 固定比例的框：裡面的內容先用固定設計寬度排版，再等比縮放塞進框裡（太高就縮、太矮就置中）。
 * 讓圖庫裡每個網頁畫的畫面大小一致。
 */
import { useLayoutEffect, useRef } from 'react';

const DESIGN_W = 600;

export function FitBox({ children, ratio = 4 / 3 }: { children: React.ReactNode; ratio?: number }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const fit = () => {
      const ow = o.clientWidth;
      // 窄螢幕（手機）：不縮放，回到一般響應式排版，字才看得清楚
      if (ow < 480) {
        o.classList.add('natural');
        i.style.transform = '';
        return;
      }
      o.classList.remove('natural');
      const oh = o.clientHeight;
      const ih = i.scrollHeight;
      const s = Math.min(ow / DESIGN_W, oh / ih);
      const x = (ow - DESIGN_W * s) / 2;
      const y = Math.max(0, (oh - ih * s) / 2);
      i.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={outer} className="fitbox" style={{ aspectRatio: String(ratio) }}>
      <div ref={inner} className="fitbox-in" style={{ width: DESIGN_W }}>
        {children}
      </div>
    </div>
  );
}
