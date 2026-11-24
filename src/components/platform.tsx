'use client';

/** 頂部「應用程式／網頁」切換：全頁共用一個狀態，功能段落依它換畫面與少數文字。 */
import { createContext, useContext, useEffect, useState } from 'react';

export type Platform = 'app' | 'web';

const Ctx = createContext<{ p: Platform; set: (p: Platform) => void }>({ p: 'app', set: () => {} });
export const usePlatform = () => useContext(Ctx);

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const [p, setP] = useState<Platform>('app');
  useEffect(() => {
    // SSR 一律先渲染應用程式，掛載後才讀上次的選擇
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (localStorage.getItem('fm-platform') === 'web') setP('web');
    } catch {}
  }, []);
  function set(next: Platform) {
    setP(next);
    try {
      localStorage.setItem('fm-platform', next);
    } catch {}
  }
  return <Ctx.Provider value={{ p, set }}>{children}</Ctx.Provider>;
}

const OPTIONS: [Platform, string][] = [
  ['app', '應用程式'],
  ['web', '網頁'],
];

export function PlatformSwitch() {
  const { p, set } = usePlatform();
  return (
    <div className="pf-switch" role="group" aria-label="切換展示的版本">
      {OPTIONS.map(([k, label]) => (
        <button key={k} type="button" className={p === k ? 'on' : ''} aria-pressed={p === k} onClick={() => set(k)}>
          {label}
        </button>
      ))}
    </div>
  );
}
