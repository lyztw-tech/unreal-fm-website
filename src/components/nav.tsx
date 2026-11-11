'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mark } from './mark';

const LINKS = [
  { href: '/#features', label: '功能' },
  { href: '/#mobile', label: '行動端' },
  { href: '/#deploy', label: '現場部署' },
  { href: '/#vision', label: '藍圖' },
];

export function Nav() {
  const [on, setOn] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  useEffect(() => {
    const f = () => setOn(window.scrollY > 8);
    f();
    window.addEventListener('scroll', f, { passive: true });
    // SSR 一律先渲染淺色，掛載後才讀 boot script 寫入的主題（只影響按鈕字樣）
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
    return () => window.removeEventListener('scroll', f);
  }, []);
  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    if (next === 'dark') document.documentElement.dataset.theme = 'dark';
    else delete document.documentElement.dataset.theme;
    try {
      localStorage.setItem('fm-theme', next);
    } catch {}
    setTheme(next);
  }
  return (
    <nav className={`nav${on ? ' on' : ''}`}>
      <div className="wrap nav-in">
        <Link className="brand" href="/#top">
          <Mark />
          智慧建築維運平台
        </Link>
        <div className="nav-links">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
          <button
            type="button"
            className="theme-btn"
            onClick={toggleTheme}
            aria-label="切換深淺色主題"
          >
            {theme === 'dark' ? '☀ 淺色' : '☾ 深色'}
          </button>
          <Link className="btn btn-primary" href="/#contact">
            預約展示
          </Link>
        </div>
      </div>
    </nav>
  );
}
