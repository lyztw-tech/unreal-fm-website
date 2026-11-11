'use client';

/**
 * 開頭的建築飛行：捲動驅動 three.js 場景（components/fly-scene.ts，程式生成的示意大樓）。
 * 鏡頭沿路線連續飛，停在每一段時場景切到該段主題，左側（手機為下方）淡入介紹卡。
 * 場景程式動態載入，不擋首屏；WebGL 不能用時只顯示黑底與文字。
 */
import { useEffect, useRef } from 'react';
import { asset } from '@/lib/asset-path';

/** 與 fly-scene.ts 的 STOPS 相同（這裡寫死，避免為了常數提前載入 three.js） */
const STOPS = [0, 0.22, 0.4, 0.58, 0.76, 0.94];

type Chapter = {
  eyebrow: string;
  title: React.ReactNode;
  text: string;
  phone?: string;
  hero?: boolean;
};

const CHAPTERS: Chapter[] = [
  {
    hero: true,
    eyebrow: 'SMART BUILDING OPERATIONS',
    title: (
      <>
        整棟大樓的設備與維運，
        <br />
        都在同一個 3D 模型裡。
      </>
    ),
    text: '資產、告警、影像、工單、能源與環境——以 BIM 模型為底，一眼看到在哪裡、發生什麼事。',
  },
  {
    eyebrow: '資產管理',
    title: <>點一下設備，鏡頭就飛過去。</>,
    text: '設備在模型上亮起來，面板即時顯示運轉、健康、通訊與服務狀態。',
  },
  {
    eyebrow: '影像監控',
    title: <>監視器拍哪裡，一目了然。</>,
    text: '透視整棟大樓，每支監視器的位置與拍攝範圍直接畫在模型上。',
  },
  {
    eyebrow: '能源永續',
    title: <>哪層最耗電，直接畫在大樓上。</>,
    text: '樓層用電強度以 3D 熱力圖呈現，滑過排行就強調那一層。',
  },
  {
    eyebrow: '維運作業',
    title: <>每張工單，都對得到現場位置。</>,
    text: '工單綁定設備，處理過程依時間軸記錄；現場人員用手機開出勤單、看位置圖、回報結果。',
  },
  {
    eyebrow: '現場部署',
    title: <>系統在大樓裡，資料不出大樓。</>,
    text: '桌面程式、後端與資料庫都部署在案場自己的主機與內網，資料所有權在業主。',
  },
];

/** 第 k 段文字的可見度 */
function fade(p: number, k: number) {
  if (k === 0) return Math.max(0, Math.min(1, (0.09 - p) / 0.04));
  const c = STOPS[k];
  if (k === STOPS.length - 1) return Math.max(0, Math.min(1, (p - (c - 0.075)) / 0.03));
  const half = 0.075;
  const d = Math.abs(p - c);
  if (d > half) return 0;
  return Math.min(1, (half - d) / 0.03);
}

type Scene = {
  setProgress(p: number): void;
  setRunning(on: boolean): void;
  resize(): void;
  dispose(): void;
};

export function FlyIntro() {
  const secRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chRefs = useRef<(HTMLDivElement | null)[]>([]);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sec = secRef.current;
    const canvas = canvasRef.current;
    if (!sec || !canvas) return;
    let scene: Scene | null = null;
    let alive = true;
    let raf = 0;

    const progress = () => {
      const r = sec.getBoundingClientRect();
      const span = sec.offsetHeight - window.innerHeight;
      return span > 0 ? Math.max(0, Math.min(1, -r.top / span)) : 0;
    };

    const tick = () => {
      raf = 0;
      const p = progress();
      scene?.setProgress(p);
      chRefs.current.forEach((el, k) => {
        if (!el) return;
        const o = fade(p, k);
        el.style.opacity = String(o);
        el.style.transform = `translateY(${(1 - o) * 14}px)`;
        el.style.pointerEvents = o > 0.5 ? 'auto' : 'none';
      });
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      // 頂部選單在飛行區上方時用深色，離開後回到一般樣式
      const r = sec.getBoundingClientRect();
      document.documentElement.classList.toggle('nav-dark', r.bottom > 62);
      scene?.setRunning(r.bottom > 0 && r.top < window.innerHeight);
    };
    function onScroll() {
      if (!raf) raf = requestAnimationFrame(tick);
    }
    const onResize = () => {
      scene?.resize();
      onScroll();
    };

    import('./fly-scene')
      .then(({ createFlyScene }) => {
        if (!alive) return;
        try {
          scene = createFlyScene(canvas);
          onScroll();
        } catch {
          // WebGL 不可用：維持黑底＋文字
        }
      })
      .catch(() => {});

    tick();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      alive = false;
      document.documentElement.classList.remove('nav-dark');
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (raf) cancelAnimationFrame(raf);
      scene?.dispose();
    };
  }, []);

  return (
    <section className="fly" ref={secRef} id="top" aria-label="建築飛行導覽">
      <div className="fly-stage">
        <canvas ref={canvasRef} className="fly-canvas" />
        <div className="fly-shade" />
        {CHAPTERS.map((c, k) => (
          <div
            key={k}
            ref={(el) => {
              chRefs.current[k] = el;
            }}
            className={`fly-ch${c.hero ? ' fly-hero' : ''}`}
            style={{ opacity: k === 0 ? 1 : 0 }}
          >
            <span className="fly-eyebrow">{c.eyebrow}</span>
            {c.hero ? <h1>{c.title}</h1> : <h2>{c.title}</h2>}
            <p>{c.text}</p>
            {c.hero && (
              <>
                <div className="hero-ctas fly-ctas">
                  <a className="btn btn-primary" href="#contact">
                    預約展示
                  </a>
                  <a className="tlink" href="#features">
                    看它怎麼運作 ›
                  </a>
                </div>
                <p className="fly-note">現場部署 · 大樓內網運作 · 資料留在業主自己的主機</p>
                <span className="fly-hint">往下捲動，飛進大樓 ↓</span>
              </>
            )}
            {c.phone && (
              <div className="fly-shot phone-shot">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset(c.phone)} alt="" loading="lazy" />
              </div>
            )}
          </div>
        ))}
        <div className="fly-bar">
          <div ref={barRef} />
        </div>
      </div>
    </section>
  );
}
