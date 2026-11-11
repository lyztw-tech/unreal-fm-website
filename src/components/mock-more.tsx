'use client';

/**
 * 用網頁畫的系統畫面（取代截圖）：首頁、監視牆、報修工單、手機出勤、用電、用水、碳排、環境監測，
 * 以及嵌入式 3D 小場景（透視監視器、樓層熱力圖，沿用開頭的 three.js 示意大樓）。
 * 欄位與文字照 UE 系統；數字是示範資料（能源、環境本來就是示意資料）。
 */
import { useEffect, useRef, useState } from 'react';

/* ───────── 共用小元件 ───────── */

function Card({ title, right, children, className = '' }: { title?: string; right?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`mk-panel ${className}`}>
      {title && (
        <div className="mk-head">
          <b>{title}</b>
          {right && <span>{right}</span>}
        </div>
      )}
      {children}
    </div>
  );
}

function Stat({ v, l, tone }: { v: React.ReactNode; l: string; tone?: 'g' | 'y' | 'r' | 'b' }) {
  return (
    <div className={`mk-stat${tone ? ' ' + tone : ''}`}>
      <b>{v}</b>
      <span>{l}</span>
    </div>
  );
}

function Kpi({ label, value, unit, sub, tone }: { label: string; value: string; unit?: string; sub?: string; tone?: 'g' | 'y' | 'r' }) {
  return (
    <div className="mk-panel mk-kpi">
      <span className="mk-kpi-l">{label}</span>
      <b className={tone ? 'mk-' + tone : ''}>
        {value}
        {unit && <em>{unit}</em>}
      </b>
      {sub && <small>{sub}</small>}
    </div>
  );
}

/** 折線＋正常區間帶（0–24 時），values / band 皆為 0–1 */
function LineBand({ values, count, lo, hi, now, h = 120, color = '#7fd0ee', marks }: { values: number[]; count?: number; lo?: number[]; hi?: number[]; now?: number; h?: number; color?: string; marks?: { y: number; c: string }[] }) {
  const W = 400;
  const x = (i: number, n: number) => (i / (n - 1)) * W;
  const y = (v: number) => h - v * (h - 6) - 3;
  // values 可以比 count 短（資料只到現在）
  const n = count ?? values.length;
  const line = values.map((v, i) => `${i ? 'L' : 'M'}${x(i, n).toFixed(1)},${y(v).toFixed(1)}`).join('');
  let band = '';
  if (lo && hi) {
    band =
      hi.map((v, i) => `${i ? 'L' : 'M'}${x(i, hi.length).toFixed(1)},${y(v).toFixed(1)}`).join('') +
      lo
        .map((v, i) => [i, v] as const)
        .reverse()
        .map(([i, v]) => `L${x(i, lo.length).toFixed(1)},${y(v).toFixed(1)}`)
        .join('') +
      'Z';
  }
  return (
    <svg className="mk-chart" viewBox={`0 0 ${W} ${h}`} preserveAspectRatio="none" style={{ height: h }}>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1="0" x2={W} y1={y(g)} y2={y(g)} stroke="rgba(255,255,255,0.06)" />
      ))}
      {marks?.map((m) => (
        <line key={m.y} x1="0" x2={W} y1={y(m.y)} y2={y(m.y)} stroke={m.c} strokeDasharray="4 4" strokeWidth="1" />
      ))}
      {band && <path d={band} fill="rgba(122,147,184,0.28)" />}
      <path d={line} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      {now !== undefined && <line x1={now * W} x2={now * W} y1="0" y2={h} stroke="rgba(255,255,255,0.35)" strokeDasharray="3 3" />}
    </svg>
  );
}

function Donut({ parts, center, sub }: { parts: { v: number; c: string }[]; center: string; sub: string }) {
  const R = 42;
  const C = 2 * Math.PI * R;
  const lens = parts.map((p) => (p.v / 100) * C);
  const starts = lens.map((_, i) => lens.slice(0, i).reduce((a, b) => a + b, 0));
  return (
    <div className="mk-donut">
      <svg viewBox="0 0 110 110">
        {parts.map((p, i) => (
          <circle
            key={i}
            cx="55"
            cy="55"
            r={R}
            fill="none"
            stroke={p.c}
            strokeWidth="13"
            strokeDasharray={`${lens[i] - 1.5} ${C - lens[i] + 1.5}`}
            strokeDashoffset={-starts[i]}
            transform="rotate(-90 55 55)"
          />
        ))}
      </svg>
      <div>
        <b>{center}</b>
        <span>{sub}</span>
      </div>
    </div>
  );
}

function Bar({ label, v, max, tail, color }: { label: string; v: number; max: number; tail?: string; color: string }) {
  return (
    <div className="mk-bar-row">
      <span className="mk-bar-l">{label}</span>
      <span className="mk-bar-t">
        <i style={{ width: `${(v / max) * 100}%`, background: color }} />
      </span>
      <span className="mk-bar-v">{tail ?? v}</span>
    </div>
  );
}

function heat(h: number) {
  // 綠 → 黃 → 紅
  const a = h < 0.5 ? [60, 207, 145] : [242, 201, 76];
  const b = h < 0.5 ? [242, 201, 76] : [239, 90, 90];
  const t = h < 0.5 ? h / 0.5 : (h - 0.5) / 0.5;
  return `rgb(${a.map((x, i) => Math.round(x + (b[i] - x) * t)).join(',')})`;
}

/** 平滑的示意曲線 */
function curve(n: number, f: (t: number) => number) {
  return Array.from({ length: n }, (_, i) => f(i / (n - 1)));
}

/* ───────── 首頁 ───────── */

export function HomeMock() {
  const sys: [string, number, number, string?][] = [
    ['電器裝置', 3, 100],
    ['監視器', 19, 100],
    ['水錶', 7, 100, '警告 1'],
    ['電表', 16, 100, '警告 1'],
    ['環境感測器', 16, 100, '警告 1'],
  ];
  return (
    <div className="mk mk-home">
      <div className="mk-col">
        <Card title="建築概況">
          <div className="mk-body-c">
            <div className="mk-kv"><span>樓層範圍</span><b>B3 – RF</b></div>
            <div className="mk-kv"><span>總樓地板面積</span><b>16,900 m²</b></div>
            <div className="mk-kv"><span>納管設備</span><b>72</b></div>
          </div>
        </Card>
        <Card title="資產管理" right="共 72 項設備">
          <div className="mk-sub">資產狀態</div>
          <div className="mk-stats5">
            <Stat v="69" l="正常" tone="g" />
            <Stat v="3" l="警告" tone="y" />
            <Stat v="0" l="異常" tone="r" />
            <Stat v="0" l="離線" />
            <Stat v="0" l="維護中" tone="b" />
          </div>
          <div className="mk-sub" style={{ marginTop: 10 }}>資產系統分項狀態</div>
          {sys.map(([n, c, p, note]) => (
            <div className="mk-sys" key={n}>
              <span>{n}</span>
              <i>
                <em style={{ width: `${p}%`, background: note ? 'linear-gradient(90deg,#2fbd83 88%,#f2c94c 88%)' : '#2fbd83' }} />
              </i>
              <small>
                {c} 台{note ? ` · ${note}` : ''}
              </small>
              <b>{p}%</b>
            </div>
          ))}
        </Card>
      </div>
      <div className="mk-col">
        <Card title="報修管理">
          <div className="mk-stats2">
            <Stat v="3" l="尚未處理" tone="r" />
            <Stat v="0" l="處理中" />
          </div>
          <div className="mk-link">前往 報修管理 ›</div>
        </Card>
        <Card title="預防保養">
          <div className="mk-stats3">
            <Stat v="0" l="處理中" />
            <Stat v="0" l="待複查" />
            <Stat v="31" l="保養到期" tone="r" />
          </div>
          <div className="mk-link">前往 預防保養 ›</div>
        </Card>
        <Card title="告警清單">
          {[
            ['5F 大會議室環境感測器', 'CO₂ 偏高'],
            ['10F 分電表', '非營業時間用電偏高'],
            ['1F 廁所茶水間水錶', '疑似持續漏水'],
          ].map(([n, t]) => (
            <div className="mk-alarm" key={n}>
              <span className="mk-tag">警告</span>
              <span className="mk-alarm-t">
                {n}
                <small>{t}</small>
              </span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

/* ───────── 嵌入式 3D 小場景 ───────── */

type MiniScene = { setProgress(p: number): void; setRunning(on: boolean): void; resize(): void; dispose(): void };

export function Scene3D({ stop }: { stop: 'cam' | 'heat' }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let scene: MiniScene | null = null;
    let alive = true;
    let io: IntersectionObserver | null = null;
    const onResize = () => scene?.resize();
    import('./fly-scene')
      .then(({ createFlyScene, STOPS }) => {
        if (!alive) return;
        try {
          scene = createFlyScene(canvas, {
            centered: true,
            view: stop === 'cam' ? { pos: [-62, 44, 76], tgt: [0, 11, 0] } : { pos: [16, 24, 92], tgt: [0, 15, 0] },
          });
          scene.setProgress(stop === 'cam' ? STOPS[2] : STOPS[3]);
          io = new IntersectionObserver(([e]) => scene?.setRunning(e.isIntersecting));
          io.observe(canvas);
          window.addEventListener('resize', onResize);
        } catch {
          // WebGL 不可用：留黑底
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
      io?.disconnect();
      window.removeEventListener('resize', onResize);
      scene?.dispose();
    };
  }, [stop]);
  return (
    <div className="mk-3d">
      <canvas ref={ref} />
      <span className="mk-3d-tag">{stop === 'cam' ? '透視模式 · 監視器位置與拍攝範圍' : '3D 樓層熱力圖 · 用電強度'}</span>
      <span className="mk-3d-note">示意模型</span>
    </div>
  );
}

/* ───────── 監視牆 ───────── */

function CamTile({ name, seed }: { name: string; seed: number }) {
  const vx = 10 + ((seed * 53) % 90);
  const hz = 38 + ((seed * 17) % 22);
  const dark = ['#1d2730', '#222c35', '#1a232b', '#252f38'][seed % 4];
  return (
    <div className="mk-cam">
      <svg viewBox="0 0 160 90" preserveAspectRatio="none">
        {/* 示意的停車場／走廊畫面：天花板燈、柱子、地面標線，每格消失點與高度不同 */}
        <rect width="160" height="90" fill={dark} />
        <rect y={hz} width="160" height={90 - hz} fill="#2c3740" />
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <line key={k} x1={vx} y1={hz} x2={-60 + k * 56} y2="90" stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
        ))}
        {[0, 1, 2].map((k) => (
          <line key={'c' + k} x1={vx} y1={hz - 6} x2={-40 + k * 120} y2="0" stroke="rgba(255,255,255,0.08)" />
        ))}
        {[0, 1, 2].map((k) => (
          <rect key={'l' + k} x={(vx + k * 46 + seed * 13) % 150} y={6 + k * 3} width={18 - k * 4} height="2.5" fill="rgba(255,255,255,0.5)" />
        ))}
        <rect x={(vx + 34) % 150} y={hz - 22} width="9" height="24" fill="#3a4651" />
        <rect x={(vx + 110) % 150} y={hz - 16} width="6" height="18" fill="#34404b" />
        {seed % 2 === 0 && <rect x={(vx + 60) % 140} y={hz + 8} width="22" height="10" rx="2" fill="#4a5866" />}
      </svg>
      <span className="mk-cam-n">{name}</span>
      <span className="mk-cam-live">● LIVE</span>
    </div>
  );
}

export function CamWallMock() {
  const names = ['攝影機_12', '攝影機_11', '攝影機_18', '攝影機_13', '攝影機_16', '攝影機_17', '攝影機_吸頂2', '攝影機_吸頂3', '攝影機_吸頂4'];
  return (
    <div className="mk">
      <div className="mk-wall">
        {names.map((n, i) => (
          <CamTile key={n} name={n} seed={i + 3} />
        ))}
      </div>
      <div className="mk-pager">
        <span className="mk-pill mk-pill-dd">‹ 上一頁</span>
        <span>第 1 / 2 頁 · 共 17 支</span>
        <span className="mk-pill mk-pill-dd">下一頁 ›</span>
        <span className="mk-pill">⧉ 獨立視窗</span>
      </div>
    </div>
  );
}

/* ───────── 報修工單 ───────── */

const ORDERS = [
  { name: '攝影機_12', floor: 'B2FL', reason: '異音', done: '09-17' },
  { name: '揚聲器', floor: '4FL', reason: '濾網更換', done: '09-21' },
  { name: '10F 分電表', floor: '10FL', reason: '跳脫', done: '10-07' },
  { name: '原液桶', floor: 'B3FL', reason: '液位偏低', done: '08-26' },
];
const EVENTS: [string, string, string, string][] = [
  ['建立工單', '系統管理者', '09-17 18:21', '異音'],
  ['派工', '系統管理者', '09-17 18:22', '通知廠商到場檢查'],
  ['開始處理', '王技師', '09-17 18:40', '雲台馬達磨損，更換中'],
  ['結案', '系統管理者', '09-17 19:10', '完工'],
];

export function RepairMock() {
  const [sel, setSel] = useState(0);
  const o = ORDERS[sel];
  return (
    <div className="mk mk-two">
      <div className="mk-panel">
        <div className="mk-head">
          <b>報修工單</b>
        </div>
        <div className="mk-tabs">
          <button type="button">處理中</button>
          <button type="button" className="on">
            已結案 (41)
          </button>
          <button type="button">已作廢</button>
        </div>
        <div className="mk-rows">
          {ORDERS.map((x, i) => (
            <button type="button" key={x.name} className={`mk-row${i === sel ? ' on' : ''}`} onClick={() => setSel(i)}>
              <i className="mk-bar" />
              <span className="mk-row-t">
                <b>{x.name}</b>
                <small>
                  {x.floor} · {x.reason}
                </small>
              </span>
              <span className="mk-time">結案 {x.done}</span>
            </button>
          ))}
        </div>
        <div className="mk-foot">共 41 張工單</div>
      </div>
      <div className="mk-panel">
        <div className="mk-head">
          <b>報修工單</b>
        </div>
        <div className="mk-dev">
          <b>{o.name}</b>
          <small>
            已結案 · 結案 2026-{o.done}
          </small>
        </div>
        <div className="mk-pill" style={{ alignSelf: 'flex-start', marginBottom: 10 }}>
          ▸ 綁定資產：{o.name}
        </div>
        <div className="mk-tl">
          {EVENTS.map(([t, who, time, text], k) => (
            <div className="mk-tl-i" key={k}>
              <i className={k === EVENTS.length - 1 ? 'g' : ''} />
              <div>
                <div className="mk-tl-h">
                  <b>{t}</b>
                  <span>{time}</span>
                </div>
                <small>{who}</small>
                <p>{k === 0 ? o.reason : text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────── 手機出勤 ───────── */

export function PhoneVisitMock() {
  return (
    <div className="mk mk-phone">
      <div className="mk-ph-top">
        <b>VIS-20261019-001</b>
        <span className="mk-ph-me">王技師</span>
      </div>
      <div className="mk-ph-card">
        <span>預計 2026-10-19 · 執行人 王技師</span>
        <span className="mk-chip">● 出勤中</span>
      </div>
      <div className="mk-ph-sec">
        <span>工單</span>
        <span>2 張</span>
      </div>
      {[
        ['10F 分電表', '10FL · 10F 電氣室', '分電表跳脫警報，檢查迴路'],
        ['發電機_1', 'B1FL · B1 發電室', '發電機啟動測試異常，需現場檢查'],
      ].map(([n, loc, t]) => (
        <div className="mk-ph-order" key={n}>
          <div>
            <span className="mk-ph-kind">報修</span> <b>{n}</b>
          </div>
          <small>{loc}</small>
          <p>{t}</p>
        </div>
      ))}
      <div className="mk-ph-sec">
        <span>問題回報</span>
      </div>
      <div className="mk-ph-card">
        <span>（無）</span>
      </div>
    </div>
  );
}

export function PhoneOrderMock() {
  return (
    <div className="mk mk-phone">
      <div className="mk-ph-top">
        <b>‹ 工單 #94</b>
        <span className="mk-ph-me">王技師</span>
      </div>
      <div className="mk-ph-order">
        <div>
          <span className="mk-ph-kind">報修</span> <b>發電機_1</b>
        </div>
        <p>發電機啟動測試異常，需現場檢查</p>
        <div className="mk-kv"><span>樓層</span><b>B1FL</b></div>
        <div className="mk-kv"><span>位置</span><b>B1 發電室</b></div>
        <div className="mk-kv"><span>類別</span><b>電器裝置</b></div>
      </div>
      <div className="mk-ph-sec">
        <span>設備位置</span>
        <span>點圖放大</span>
      </div>
      <div className="mk-ph-maps">
        <div>
          <svg viewBox="0 0 80 90">
            <rect width="80" height="90" fill="#0b1118" />
            <path d="M18 8h40l10 14v60H18z" fill="#2a3540" stroke="#56677a" />
            {[24, 38, 52, 66].map((y) => (
              <line key={y} x1="18" x2="68" y1={y} y2={y} stroke="#3c4a58" />
            ))}
            <line x1="40" x2="40" y1="8" y2="82" stroke="#3c4a58" />
            <path d="M33 62a6 6 0 1 1 12 0c0 5-6 10-6 10s-6-5-6-10z" fill="#ef5a5a" />
          </svg>
          <small>B1FL 樓層位置</small>
        </div>
        <div>
          <svg viewBox="0 0 80 90">
            <rect width="80" height="90" fill="#1a2027" />
            <path d="M0 60 L80 50 L80 90 L0 90z" fill="#3a434c" />
            <rect x="20" y="36" width="40" height="22" fill="#7fd0ee" opacity="0.85" />
            <rect x="20" y="36" width="12" height="22" fill="#4aa8cc" />
            <rect x="50" y="22" width="4" height="14" fill="#56677a" />
          </svg>
          <small>設備近景</small>
        </div>
      </div>
      <div className="mk-ph-sec">
        <span>維修紀錄</span>
        <span>3 筆</span>
      </div>
      {[
        ['建立工單', '10-08 12:08'],
        ['現場檢查', '10-14 15:37'],
        ['開始處理', '10-19 17:45'],
      ].map(([t, time]) => (
        <div className="mk-ph-ev" key={t}>
          <i />
          <b>{t}</b>
          <span>{time}</span>
        </div>
      ))}
    </div>
  );
}

/* ───────── 用電即時 ───────── */

const LOAD = curve(48, (t) => {
  const d = t * 24;
  const day = d > 7 && d < 19 ? Math.sin(((d - 7) / 12) * Math.PI) : 0;
  return 0.18 + 0.52 * day + 0.03 * Math.sin(t * 40);
});
const LOAD_LO = curve(48, (t) => {
  const d = t * 24;
  return 0.12 + 0.45 * (d > 7 && d < 19 ? Math.sin(((d - 7) / 12) * Math.PI) : 0);
});
const LOAD_HI = LOAD_LO.map((v) => v + 0.16);

export function PowerLiveMock() {
  return (
    <div className="mk mk-dash">
      <Card title="用電異常" right="1 個待處理">
        <div className="mk-anom">
          <i />
          <div>
            <b className="mk-red">非營業時間用電偏高 · 10F 分電表</b>
            <small>19:00–08:00 · 實際 266 kWh（+127%）· 歷史正常 117 kWh</small>
          </div>
          <span className="mk-tag">待處理</span>
        </div>
      </Card>
      <div className="mk-kpis">
        <div className="mk-panel mk-kpi">
          <span className="mk-kpi-l">需量（15 分鐘平均）</span>
          <b>
            289<em>kW / 契約 800</em>
          </b>
          <div className="mk-meter">
            <i style={{ width: '36.2%' }} />
          </div>
          <small>36.2% · 正常</small>
        </div>
        <Kpi label="今日用電" value="2,754" unit="kWh" sub="較歷史基準 -1.2%" tone="g" />
        <Kpi label="本月累計" value="36,940" unit="kWh" sub="約 NT$147,761" />
        <Kpi label="月底預估電費" value="NT$412,653" sub="較上月 -14.2%" tone="g" />
      </div>
      <Card title="今日負載 24 小時" right="實際負載 ／ 正常區間">
        <LineBand values={LOAD.slice(0, 30)} count={48} lo={LOAD_LO} hi={LOAD_HI} now={30 / 47} h={110} />
        <div className="mk-axis">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>24:00</span>
        </div>
      </Card>
    </div>
  );
}

/* ───────── 分項・樓層 ───────── */

export function PowerSplitMock() {
  const floors: [string, number][] = [
    ['10F 辦公 / 會議', 3.29], ['6F 辦公', 2.95], ['4F 辦公', 2.72], ['2F 辦公', 2.56], ['3F 辦公', 2.5],
    ['8F 辦公', 2.47], ['9F 辦公', 2.46], ['7F 辦公', 2.37], ['1F 大廳', 2.21], ['B1 機房 / 倉儲', 2.01], ['B3 停車場', 0.86],
  ];
  return (
    <div className="mk mk-two mk-split">
      <Card title="分項用電占比" right="2026 年 11 月">
        <Donut
          center="36,940"
          sub="本月 kWh"
          parts={[
            { v: 39, c: '#5bb8e8' },
            { v: 23.1, c: '#f2d36b' },
            { v: 20.2, c: '#6fd6b7' },
            { v: 7.2, c: '#c99bf0' },
            { v: 10.5, c: '#9aa7b8' },
          ]}
        />
        {[
          ['空調', '39.0%', '#5bb8e8'],
          ['照明', '23.1%', '#f2d36b'],
          ['插座動力', '20.2%', '#6fd6b7'],
          ['電梯輸送', '7.2%', '#c99bf0'],
          ['其他', '10.4%', '#9aa7b8'],
        ].map(([n, p, c]) => (
          <div className="mk-kv" key={n}>
            <span>
              <i className="mk-dot" style={{ background: c }} /> {n}
            </span>
            <b>{p}</b>
          </div>
        ))}
      </Card>
      <Card title="樓層用電強度排行" right="kWh/m²">
        {floors.map(([n, v]) => (
          <Bar key={n} label={n} v={v} max={3.4} tail={v.toFixed(2)} color={heat(Math.min(1, (v - 0.8) / 2.5))} />
        ))}
      </Card>
    </div>
  );
}

/* ───────── 用水 ───────── */

const FLOW = curve(48, (t) => {
  const d = t * 24;
  return 0.06 + 0.6 * (d > 6 && d < 21 ? Math.sin(((d - 6) / 15) * Math.PI) : 0) + 0.04 * Math.sin(t * 50);
});

export function WaterMock() {
  return (
    <div className="mk mk-dash">
      <Card title="用水異常" right="1 個待處理">
        <div className="mk-anom">
          <i />
          <div>
            <b className="mk-red">疑似持續漏水 · 1F 廁所茶水間水錶</b>
            <small>已持續 3 天 13 小時 · 目前 38.5 L/min · 夜間最小 6.8 L/min</small>
          </div>
          <span className="mk-tag">待處理</span>
        </div>
      </Card>
      <div className="mk-kpis">
        <Kpi label="目前流量（總錶）" value="143.0" unit="L/min" sub="正常區間 111–185" tone="g" />
        <Kpi label="今日用水" value="80.8" unit="m³" sub="較歷史基準 +1.2%" />
        <Kpi label="本月用水" value="1,017" unit="m³" sub="較上月同期 +1.0%" />
        <Kpi label="月底預估水費" value="NT$37,442" sub="較上月 -4.3%" tone="g" />
      </div>
      <Card title="今日 24 小時流量" right="實際 ／ 正常區間">
        <LineBand values={FLOW.slice(0, 30)} count={48} lo={FLOW.map((v) => Math.max(0, v - 0.08))} hi={FLOW.map((v) => v + 0.1)} now={30 / 47} h={110} />
        <div className="mk-axis">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>24:00</span>
        </div>
      </Card>
    </div>
  );
}

/* ───────── 營運碳排 ───────── */

export function CarbonMock() {
  const y25 = [42, 40, 45, 49, 54, 61, 66, 64, 58, 53, 47, 44];
  const y26 = [40, 38, 44, 47, 51, 58, 63, 61, 55, 50, 17.5, 0];
  return (
    <div className="mk mk-dash">
      <div className="mk-kpis">
        <Kpi label="本月營運碳排" value="17.5" unit="tCO₂e" sub="本月用電 × 排放係數" />
        <Kpi label="今年累計" value="560.7" unit="tCO₂e" sub="2026 年 1 月至今" />
        <Kpi label="較去年同期" value="-3.9" unit="%" sub="去年同期 583.7 tCO₂e" tone="g" />
        <Kpi label="排放係數" value="0.474" unit="kgCO₂e/kWh" sub="今年與去年皆用此係數" />
      </div>
      <Card title="月營運碳排比較" right="■ 2026 年 ■ 2025 年">
        <div className="mk-bars">
          {y26.map((v, i) => (
            <div key={i}>
              <span style={{ height: `${(v / 70) * 100}%` }} className="a" />
              <span style={{ height: `${(y25[i] / 70) * 100}%` }} className="b" />
              <small>{i + 1}月</small>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ───────── 環境監測 ───────── */

function MetricCard({ name, unit, avg, range, dist }: { name: string; unit: string; avg: string; range: string; dist: [number, number, number, number] }) {
  const total = dist.reduce((a, b) => a + b, 0);
  const cols = ['#2fbd83', '#f2c94c', '#f0954a', '#ef5a5a'];
  return (
    <div className="mk-panel mk-kpi">
      <span className="mk-kpi-l">
        {name} <em>{unit}</em>
      </span>
      <b>{avg}</b>
      <small>範圍 {range}</small>
      <div className="mk-dist">
        {dist.map((d, i) => (d ? <i key={i} style={{ flex: d / total, background: cols[i] }} /> : null))}
      </div>
      <small>
        A {dist[0]} · B {dist[1]} · C {dist[2]} · D {dist[3]}
      </small>
    </div>
  );
}

export function EnvOverviewMock() {
  const rows: [string, string, string, string, string, string][] = [
    ['5F 大會議室', '24.5', '52', '1417', '8', '異常'],
    ['10F 會議室', '24.4', '52', '833', '7', '注意'],
    ['1F 入口大廳', '24.0', '55', '605', '11', '正常'],
  ];
  return (
    <div className="mk mk-dash">
      <div className="mk-kpis">
        <Kpi label="監測位置" value="16" sub="溫度、濕度、CO₂、PM2.5" />
        <Kpi label="正常" value="15" sub="其中 3 個在注意範圍" tone="g" />
        <Kpi label="異常中" value="1" sub="持續超標、尚未恢復" tone="r" />
        <Kpi label="離線" value="0" sub="感測器沒有回報資料" />
      </div>
      <div className="mk-kpis">
        <MetricCard name="溫度" unit="°C" avg="24.4" range="24.0 – 25.8" dist={[16, 0, 0, 0]} />
        <MetricCard name="濕度" unit="%" avg="54" range="47 – 63" dist={[15, 1, 0, 0]} />
        <MetricCard name="CO₂" unit="ppm" avg="739" range="605 – 1417" dist={[13, 2, 1, 0]} />
        <MetricCard name="PM2.5" unit="μg/m³" avg="8" range="3 – 11" dist={[16, 0, 0, 0]} />
      </div>
      <Card title="即時數值" right="前 3 · 共 16 個監測位置">
        <div className="mk-table">
          <div className="mk-tr mk-th">
            <span>監測位置</span>
            <span>溫度</span>
            <span>濕度</span>
            <span>CO₂</span>
            <span>PM2.5</span>
            <span>狀態</span>
          </div>
          {rows.map((r) => (
            <div className="mk-tr" key={r[0]}>
              <span>{r[0]}</span>
              <span>{r[1]}</span>
              <span>{r[2]}</span>
              <span className={r[5] === '異常' ? 'mk-red' : r[5] === '注意' ? 'mk-y' : ''}>{r[3]}</span>
              <span>{r[4]}</span>
              <span className={r[5] === '異常' ? 'mk-red' : r[5] === '注意' ? 'mk-y' : 'mk-g'}>{r[5]}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/** ppm → 0–1（300–1600 ppm） */
const ppm = (v: number) => (v - 300) / 1300;
const CO2 = curve(96, (t) => {
  const h = 15 + t * 24; // 昨天 15:00（15）→ 今天 15:00（39）
  let v = 470 + 18 * Math.sin(t * 40);
  if (h < 18) v += 220 * (1 - (h - 15) / 3); // 昨天下午還有人
  if (h >= 33 && h < 37.5) v += 260 * Math.min(1, (h - 33) / 2.5); // 今天上班
  if (h >= 37.5) v += 260 + 730 * Math.min(1, (h - 37.5) / 0.3); // 13:30 起大會議室開會，超過門檻
  return ppm(v);
});

export function EnvTrendMock() {
  return (
    <div className="mk mk-two mk-trend">
      <Card title="5F 大會議室 · CO₂（ppm）" right="24 小時">
        <div className="mk-chips">
          <span>溫度</span>
          <span>濕度</span>
          <span className="on">CO₂</span>
          <span>PM2.5</span>
        </div>
        <div className="mk-trend-c">
          <div className="mk-redband" />
          <LineBand values={CO2} h={150} marks={[{ y: ppm(800), c: '#f2c94c' }, { y: ppm(1000), c: '#ef5a5a' }]} />
        </div>
        <div className="mk-axis">
          <span>昨 15:00</span>
          <span>21:00</span>
          <span>03:00</span>
          <span>09:00</span>
          <span>15:00</span>
        </div>
        <div className="mk-legend">
          <span className="y">--- 注意 800 ppm</span>
          <span className="r">--- 異常 1000 ppm</span>
          <span className="r">▇ 異常期間</span>
        </div>
      </Card>
      <Card title="期間統計">
        <div className="mk-kv"><span>最大</span><b className="mk-red">1463 ppm</b></div>
        <div className="mk-kv"><span>最小</span><b className="mk-g">453 ppm</b></div>
        <div className="mk-kv"><span>平均</span><b>617 ppm</b></div>
        <div className="mk-kv"><span>達標率（A 級）</span><b className="mk-y">82%</b></div>
        <div className="mk-kv"><span>期間異常</span><b className="mk-red">1 次</b></div>
        <p className="mk-note">分級門檻依 2024 年版智慧建築標章健康舒適指標建議值。</p>
      </Card>
    </div>
  );
}
