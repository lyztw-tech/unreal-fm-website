'use client';

/** 一個功能多張畫面：主圖 + 頁籤切換（因為一張圖說不完一個功能）。 */
import { useState } from 'react';
import { asset } from '@/lib/asset-path';
import { FitBox } from './fit-box';

export type ShotDef = {
  label: string;
  title: string;
  src?: string;
  /** 用網頁畫的介面（取代截圖） */
  node?: React.ReactNode;
  /** 外框不加內距（3D 場景要貼滿） */
  bare?: boolean;
  /** 這一張是桌面程式還是手機頁 */
  ratio?: 'web' | 'phone';
};

function Media({ s, ratio }: { s: ShotDef; ratio: 'web' | 'phone' }) {
  if (s.node) {
    if (ratio === 'phone') return <div className="phone phone-mock">{s.node}</div>;
    if (s.bare) return <div className="frame frame-mock bare">{s.node}</div>;
    return (
      <div className="frame frame-mock fit">
        <FitBox>{s.node}</FitBox>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  const img = <img src={asset(s.src ?? '')} alt={s.title} loading="lazy" />;
  if (ratio === 'phone') return <div className="phone">{img}</div>;
  return <div className="frame">{img}</div>;
}

export function Gallery({ shots, ratio = 'web' }: { shots: ShotDef[]; ratio?: 'web' | 'phone' }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  const active = shots[Math.min(i, shots.length - 1)];
  const activeRatio = active.ratio ?? ratio;
  const hasPhone = shots.some((s) => (s.ratio ?? ratio) === 'phone');
  return (
    <div className={`gal${hasPhone ? ' gal-phone' : ''}`}>
      {active.node ? (
        <div className="gal-stage" key={i}>
          <Media s={active} ratio={activeRatio} />
        </div>
      ) : (
        <div className="gal-stage zoomable" key={i} onClick={() => setZoom(true)}>
          <Media s={active} ratio={activeRatio} />
          <span className="gal-zoom">⤢ 點圖放大</span>
        </div>
      )}
      <p className="gal-cap">{active.title}</p>
      {shots.length > 1 && (
        <div className="gal-tabs" role="tablist">
          {shots.map((s, idx) => (
            <button
              key={s.label}
              type="button"
              role="tab"
              aria-selected={idx === i}
              className={`gtab${idx === i ? ' on' : ''}`}
              onClick={() => setI(idx)}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
      {zoom && active.src && (
        <div className="gal-lightbox" onClick={() => setZoom(false)} role="dialog" aria-modal="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset(active.src)} alt={active.title} onClick={(e) => e.stopPropagation()} />
          <button type="button" className="gal-lightbox-x" aria-label="關閉">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
