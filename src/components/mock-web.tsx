'use client';

/**
 * 網頁版的畫面（用網頁畫，不放截圖）：版面與欄位照 fm-platform 實際介面，數字是示範資料。
 * 左側模型是示意大樓，不是業主的真實模型。設計寬度 600（見 fit-box.tsx）。
 */
import { useState } from 'react';
import { Mark } from './mark';

/* ───────── 外框 ───────── */

const ICONS: [string, string][] = [
  ['今日總覽', 'M4 4h6v6H4zM14 4h6v4h-6zM14 12h6v8h-6zM4 14h6v6H4z'],
  ['報修管理', 'M8 4h8v3H8zM6 6H5v15h14V6h-1M9 12h6M9 16h6'],
  ['資產管理', 'M12 3l4 2.3v4.6L12 12 8 9.900V5.300zM7 12l4 2.300v4.600L7 21l-4-2.100v-4.600zM17 12l4 2.300v4.600L17 21l-4-2.100v-4.600z'],
  ['預防保養', 'M5 6h14v14H5zM5 10h14M9 3v4M15 3v4M9 15l2 2 4-4'],
  ['出勤', 'M6 5a2 2 0 110 4 2 2 0 010-4zM18 15a2 2 0 110 4 2 2 0 010-4zM8 7h7a3 3 0 010 6H9a3 3 0 000 6h7'],
  ['告警中心', 'M6 16V11a6 6 0 0112 0v5l2 2H4zM10 21h4'],
  ['影像監控', 'M3 7h12v10H3zM15 11l6-3v8l-6-3'],
  ['能源永續', 'M13 2L4 14h7l-1 8 9-12h-7z'],
  ['環境監測', 'M20 4C9 4 5 9 5 15c0 2 1 4 1 4M6 19c2-7 6-9 10-10M6 17c8 2 14-2 14-13'],
];

type Mod = '今日總覽' | '報修管理' | '資產管理' | '預防保養' | '告警中心' | '影像監控' | '能源永續' | '環境監測';

function Shell({ mod, sub, full, heat, pin, children }: { mod: Mod; sub?: string; full?: boolean; heat?: boolean; pin?: boolean; children: React.ReactNode }) {
  return (
    <div className="wb">
      <div className="wb-top">
        <Mark size={18} />
        <b>FMSync</b>
        <small>示範大樓</small>
        <span className="wb-search">搜尋設備、工單或位置</span>
        <span className="wb-btn on">＋ 報修</span>
      </div>
      <div className="wb-main">
        <div className="wb-rail" aria-hidden="true">
          {ICONS.map(([n, d]) => (
            <span key={n} className={n === mod ? 'on' : ''}>
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={d} />
              </svg>
            </span>
          ))}
        </div>
        <div className="wb-page">
          <div className="wb-title">
            <b>{mod}</b>
            <small>{sub ?? '設備與處理紀錄，在同一個工作空間'}</small>
          </div>
          {full ? (
            <div className="wb-full">{children}</div>
          ) : (
            <div className="wb-split">
              <div className="wb-model">
                <Tower heat={heat} pin={pin} />
                <span>示意模型</span>
              </div>
              <div className="wb-side">{children}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const HEAT = ['#7fd3ae', '#f08a80', '#f3b27a', '#f3c27a', '#f3c98a', '#efa27f', '#f2d58c', '#f0a07a', '#f3c98a', '#f2b47c', '#b5d9a0'];

/** 等角示意大樓 */
function Tower({ heat, pin }: { heat?: boolean; pin?: boolean }) {
  const fl = 11;
  const slab = (i: number, w: number, d: number, h: number, cx: number, y: number, fill?: string) => {
    const l = `${cx - w},${y - w / 2} ${cx},${y} ${cx},${y + h} ${cx - w},${y - w / 2 + h}`;
    const r = `${cx},${y} ${cx + d},${y - d / 2} ${cx + d},${y - d / 2 + h} ${cx},${y + h}`;
    return (
      <g key={i} stroke="#59636f" strokeWidth="0.7">
        <polygon points={l} fill={fill ?? '#aeb5bd'} fillOpacity={fill ? 0.85 : 1} />
        <polygon points={r} fill={fill ?? '#c9ced4'} fillOpacity={fill ? 0.65 : 1} />
      </g>
    );
  };
  const roof = (w: number, d: number, cx: number, y: number, fill: string) => (
    <polygon points={`${cx},${y} ${cx - w},${y - w / 2} ${cx - w + d},${y - w / 2 - d / 2} ${cx + d},${y - d / 2}`} fill={fill} stroke="#59636f" strokeWidth="0.7" />
  );
  return (
    <svg viewBox="0 0 200 260" className="wb-tower" aria-hidden="true">
      {roof(52, 86, 72, 176, '#d8dce1')}
      {slab(99, 52, 86, 42, 72, 176)}
      {Array.from({ length: fl }, (_, k) => slab(k, 40, 72, 11, 74, 56 + (fl - 1 - k) * 11, heat ? HEAT[fl - 1 - k] : undefined))}
      {roof(40, 72, 74, 56, heat ? '#a9dcc0' : '#dfe3e7')}
      {!heat &&
        Array.from({ length: fl }, (_, k) => (
          <line key={k} x1="78" y1={60 + k * 11 + 1} x2="142" y2={28 + k * 11 + 1} stroke="#7f8b98" strokeWidth="3" strokeDasharray="5 4" />
        ))}
      {pin && (
        <g>
          <polygon points="84,196 108,184 108,204 84,216" fill="#0ea08a" fillOpacity="0.85" stroke="#067a69" />
          <circle cx="96" cy="200" r="15" fill="none" stroke="#0ea08a" strokeWidth="1.6" />
        </g>
      )}
    </svg>
  );
}

const Pill = ({ t, c }: { t: string; c?: 'ok' | 'warn' | 'crit' | 'info' }) => <span className={`wb-pill ${c ?? ''}`}>{t}</span>;
const Head = ({ t, r }: { t: string; r?: React.ReactNode }) => (
  <div className="wb-h">
    <b>{t}</b>
    <span>{r}</span>
  </div>
);
const Field = ({ k, v }: { k: string; v: string }) => (
  <div className="wb-f">
    <small>{k}</small>
    <b>{v}</b>
  </div>
);

/* ───────── 首頁 ───────── */

const SYS: [string, number, string][] = [
  ['監視器', 100, '112 項'],
  ['機械設備', 100, '45 項'],
  ['造景設備', 100, '19 項'],
  ['環境感測器', 100, '16 項'],
  ['電表', 94, '16 項 · 警告 1'],
];

export function WebHomeMock() {
  return (
    <Shell mod="今日總覽" sub="先處理需要行動的工作，再查看設備與位置">
      <Head t="優先處理" />
      <div className="wb-nums">
        <div>
          <b>1</b>
          <small>待複查</small>
        </div>
        <div>
          <b>2</b>
          <small>處理中</small>
        </div>
      </div>
      <div className="wb-tabs">
        <span className="on">全部待辦</span>
        <span>待複查</span>
        <span>處理中</span>
      </div>
      <div className="wb-task">
        <Pill t="處理中" c="info" />
        <em>11/24</em>
        <b>濾網更換</b>
        <small>軸流風機 · AF-B1-01</small>
      </div>
      <Head
        t="資產系統分項狀態"
        r={
          <>
            可用率 <b className="wb-g">100.0%</b>
          </>
        }
      />
      {SYS.map(([n, v, s]) => (
        <div className="wb-sys" key={n}>
          <div>
            <b>{n}</b>
            <em>100.0%</em>
          </div>
          <i>
            <u style={{ width: `${v}%` }} />
          </i>
          <small>{s}</small>
        </div>
      ))}
    </Shell>
  );
}

/* ───────── 資產 ───────── */

const ASSETS: [string, string, string, string, string, string][] = [
  ['軸流風機', 'AF-B1-01', 'B2 發電機房', '機械設備', '正常', '2027-01-15'],
  ['發電機_1', 'GEN-B1-01', 'B1 發電室', '電器設備', '正常', '逾期 14 天'],
  ['誘導風機', 'IF-B1-01', 'B2 停車場', '機械設備', '正常', '2026-12-20'],
  ['10F 分電表', 'EM-10F-01', '10F 電氣室', '電表', '警告', '2027-03-02'],
  ['攝影機_吸頂', 'CAM-B3-02', 'B3 停車場', '監視器', '正常', '2027-02-11'],
  ['5F 大會議室', 'ENV-5F-02', '5F', '環境感測器', '正常', '—'],
];

export function WebAssetListMock() {
  const [i, setI] = useState(1);
  return (
    <Shell mod="資產管理" full>
      <div className="wb-table wb-assets">
        <div className="wb-tr wb-th">
          <span>設備</span>
          <span>位置</span>
          <span>類型</span>
          <span>狀態</span>
          <span>下次保養</span>
        </div>
        {ASSETS.map((a, k) => (
          <button type="button" key={a[1]} className={`wb-tr${k === i ? ' on' : ''}`} onClick={() => setI(k)}>
            <span>
              <b>{a[0]}</b>
              <small>{a[1]}</small>
            </span>
            <span>{a[2]}</span>
            <span>{a[3]}</span>
            <span>
              <Pill t={a[4]} c={a[4] === '正常' ? 'ok' : 'warn'} />
            </span>
            <span className={a[5].startsWith('逾期') ? 'wb-r' : ''}>{a[5]}</span>
          </button>
        ))}
      </div>
    </Shell>
  );
}

const HISTORY = [62, 2, 21, 1, 14];

export function WebAssetDetailMock() {
  return (
    <Shell mod="資產管理" pin>
      <div className="wb-crumb">← 返回　資產管理 › 發電機_1</div>
      <div className="wb-name">
        <div>
          <b>發電機_1</b>
          <small>GEN-B1-01 · 電器設備 · 發電室</small>
        </div>
        <Pill t="正常" c="ok" />
      </div>
      <div className="wb-tabs">
        <span className="on">報修</span>
        <span>建立保養單</span>
        <span>◎ 在模型上顯示</span>
      </div>
      <div className="wb-fs">
        <Field k="運轉" v="待機" />
        <Field k="通訊" v="在線" />
        <Field k="服務" v="服務中" />
        <Field k="啟用日" v="2024-01-01" />
        <Field k="保固到" v="2029-12-31" />
        <Field k="下次保養" v="逾期 14 天" />
      </div>
      <Head t="即時讀值" r="3 項" />
      <div className="wb-fs">
        <Field k="運轉狀態" v="待機" />
        <Field k="油位" v="85 %" />
        <Field k="啟動電池電壓" v="24.28 V" />
      </div>
      <Head t="狀態歷史 · 近 7 天" r="可用率 97.0%" />
      <div className="wb-hist">
        {HISTORY.map((v, k) => (
          <i key={k} className={k % 2 ? 'w' : ''} style={{ flex: v }} />
        ))}
      </div>
      <Head t="維修履歷" r="5 筆" />
      <div className="wb-li">
        <b>異音檢查</b>
        <small>已結案 · 結案 2026-09-18</small>
      </div>
    </Shell>
  );
}

/* ───────── 告警 ───────── */

const ALARMS: [string, string, string, string, 'crit' | 'warn'][] = [
  ['10F 分電表', 'EM-10F-01 · 電氣室 · 電表', '告警 3 筆 · 最新 11/24 16:25', '警告', 'warn'],
  ['1F 廁所茶水間水錶', 'WM-1FL-03 · 管道間 · 水錶', '告警 2 筆 · 最新 11/24 14:08', '警告', 'warn'],
  ['誘導風機', 'IF-B1-09 · B2 停車場 · 機械設備', '告警 1 筆 · 最新 11/24 09:41', '異常', 'crit'],
];

export function WebAlarmMock() {
  const [i, setI] = useState(0);
  const a = ALARMS[i];
  return (
    <Shell mod="告警中心" pin>
      {ALARMS.map((x, k) => (
        <button type="button" key={x[0]} className={`wb-row${k === i ? ' on' : ''}`} onClick={() => setI(k)}>
          <b>
            {x[0]} <Pill t={x[3]} c={x[4]} />
          </b>
          <small>{x[1]}</small>
          <small>{x[2]}</small>
        </button>
      ))}
      <Head t={`${a[0]} 的告警`} r={<span className="wb-btn on">報修</span>} />
      <div className="wb-li">
        <b>{i === 0 ? '非營業時間用電偏高' : i === 1 ? '疑似持續漏水' : '運轉電流偏高'}</b>
        <small>{a[2].split('最新 ')[1]}</small>
      </div>
    </Shell>
  );
}

/* ───────── 影像 ───────── */

const CAMS: [string, string][] = [
  ['紅外線網路攝影機', '10F'],
  ['吸頂半球型攝影機', '10F'],
  ['攝影機_壁掛9', 'B3'],
  ['攝影機_吸頂', 'B3'],
];

export function WebCamMock() {
  return (
    <Shell mod="影像監控" full>
      <div className="wb-cams">
        {CAMS.map(([n, f], k) => (
          <div className="wb-cam" key={n}>
            <svg viewBox="0 0 160 88" aria-hidden="true">
              <rect width="160" height="88" fill="#1a222c" />
              <polygon points={`0,88 ${58 + k * 10},34 ${96 + k * 6},34 160,88`} fill="#2c3845" />
              <polygon points={`0,0 ${58 + k * 10},26 ${96 + k * 6},26 160,0`} fill="#232d38" />
              {[0, 1, 2].map((t) => (
                <rect key={t} x={62 + k * 8 - t * 16} y={22 - t * 8} width={26 + t * 22} height={2 + t} fill="#dfe9f2" opacity={0.8 - t * 0.15} />
              ))}
              <line x1={76 + k * 8} y1="36" x2={60 + k * 14} y2="88" stroke="#e8d58a" strokeWidth="1.6" strokeDasharray="6 5" />
            </svg>
            <em>LIVE</em>
            <b>{n}</b>
            <small>{f}</small>
          </div>
        ))}
      </div>
    </Shell>
  );
}

export function WebCamDetailMock() {
  return (
    <Shell mod="影像監控" pin>
      <div className="wb-crumb">← 返回　影像監控 › 攝影機_吸頂</div>
      <div className="wb-cam big">
        <svg viewBox="0 0 160 88" aria-hidden="true">
          <rect width="160" height="88" fill="#1a222c" />
          <polygon points="0,88 70,34 100,34 160,88" fill="#2c3845" />
          <polygon points="0,0 70,26 100,26 160,0" fill="#232d38" />
          <rect x="72" y="20" width="26" height="2" fill="#dfe9f2" />
          <rect x="54" y="10" width="60" height="4" fill="#dfe9f2" opacity="0.7" />
          <line x1="84" y1="36" x2="72" y2="88" stroke="#e8d58a" strokeWidth="1.6" strokeDasharray="6 5" />
        </svg>
        <em>LIVE</em>
      </div>
      <div className="wb-name">
        <div>
          <b>攝影機_吸頂</b>
          <small>CAM-B3-02 · B3 停車場</small>
        </div>
      </div>
      <div className="wb-tabs">
        <span className="on">◎ 在模型上顯示</span>
      </div>
    </Shell>
  );
}

/* ───────── 報修・保養 ───────── */

const TL: [string, string, string, string][] = [
  ['建立工單', '王小明', '11/24 09:12', '運轉有異音'],
  ['狀態', '李大華', '11/24 10:30', '開始處理：軸承磨損，等待零件'],
  ['現場照片', '李大華', '11/24 10:34', '已上傳 2 張'],
];

export function WebRepairMock() {
  return (
    <Shell mod="報修管理" full>
      <div className="wb-two">
        <div>
          <Head t="待複查" r="1 筆" />
          <div className="wb-order">
            <b>燈具不亮</b> <Pill t="待複查" c="warn" />
            <small>#110 · 景觀高燈 · 1F</small>
          </div>
          <Head t="處理中" r="2 筆" />
          <div className="wb-order on">
            <b>運轉異音</b> <Pill t="處理中" c="info" />
            <small>#112 · 軸流風機 · B1</small>
            <small>出勤中 VIS-20261124-001</small>
          </div>
          <div className="wb-order">
            <b>濾網更換</b> <Pill t="處理中" c="info" />
            <small>#111 · 誘導風機 · B2</small>
          </div>
          <Head t="已結案" r="顯示已結案（31）" />
          <Head t="已作廢" r="顯示已作廢（24）" />
        </div>
        <div className="wb-detail">
          <div className="wb-name">
            <div>
              <b>運轉異音</b>
              <small>#112 · 報修 · 軸流風機</small>
            </div>
            <Pill t="處理中" c="info" />
          </div>
          <div className="wb-tabs">
            <span className="on">結案</span>
            <span>新增紀錄</span>
            <span>◎ 在模型上顯示</span>
          </div>
          <Head t="時間軸" r="3 筆" />
          {TL.map(([t, who, time, text]) => (
            <div className="wb-tl" key={t}>
              <div>
                <b>{t}</b>
                <em>{time}</em>
              </div>
              <small>{who}</small>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

export function WebPmMock() {
  const rows: [string, string, string][] = [
    ['GEN-B1-01', '每 365 天', '逾期 14 天'],
    ['CAM-B3-02', '每 365 天', '逾期 9 天'],
    ['WM-B1F-01', '每 180 天', '逾期 6 天'],
    ['EM-B1F-00', '每 180 天', '逾期 3 天'],
    ['IF-B1-01', '每 90 天', '逾期 1 天'],
  ];
  return (
    <Shell mod="預防保養" full>
      <div className="wb-tabs">
        <span className="on crit">已逾期</span>
        <span>處理中</span>
        <span>已結案</span>
        <span>已作廢</span>
        <span>計畫總覽</span>
      </div>
      <p className="wb-note">已過下期保養日的設備；保養單結案後就會離開這裡。</p>
      {rows.map(([c, d, n]) => (
        <div className="wb-pm" key={c}>
          <b>定期保養 · {c}</b>
          <span>
            {d} · 下期 {n}
          </span>
          <Pill t="已逾期" c="crit" />
        </div>
      ))}
    </Shell>
  );
}

/* ───────── 能源 ───────── */

function EnergyTabs({ on, sub }: { on: '用電' | '用水' | '營運碳排'; sub?: string[] }) {
  return (
    <>
      <div className="wb-seg">
        {['用電', '用水', '車用充電樁', '營運碳排'].map((t) => (
          <span key={t} className={t === on ? 'on' : ''}>
            {t}
          </span>
        ))}
      </div>
      {sub && (
        <div className="wb-tabs">
          {sub.map((t, k) => (
            <span key={t} className={t.startsWith('*') || (k === 0 && !sub.some((x) => x.startsWith('*'))) ? 'on' : ''}>
              {t.replace('*', '')}
            </span>
          ))}
        </div>
      )}
    </>
  );
}

function Anom({ kind, dev, sub, cells }: { kind: string; dev: string; sub: string; cells: [string, string][] }) {
  return (
    <div className="wb-anom">
      <div>
        <b>
          <em>{kind}</em> {dev}
        </b>
        <small>{sub}</small>
      </div>
      {cells.map(([k, v]) => (
        <div key={k}>
          <small>{k}</small>
          <b>{v}</b>
        </div>
      ))}
      <span className="wb-btn">◎ 3D 定位</span>
    </div>
  );
}

const K = ({ v, u, l, s, g }: { v: string; u?: string; l: string; s: string; g?: boolean }) => (
  <div className="wb-k">
    <b className={g ? 'wb-g' : ''}>
      {v}
      {u && <em>{u}</em>}
    </b>
    <span>{l}</span>
    <small>{s}</small>
  </div>
);

/** 折線＋正常區間：fn 回傳 0–1，now 之後不畫實線 */
function Chart({ fn, now = 1, marks, red, h = 96 }: { fn: (t: number) => number; now?: number; marks?: [number, string][]; red?: [number, number]; h?: number }) {
  const W = 520;
  const n = 96;
  const y = (v: number) => h - 4 - v * (h - 10);
  const pt = (k: number, d = 0) => `${((k / n) * W).toFixed(1)},${y(Math.max(0, fn(k / n) + d)).toFixed(1)}`;
  const idx = Array.from({ length: n + 1 }, (_, k) => k);
  return (
    <svg viewBox={`0 0 ${W} ${h}`} className="wb-chart" preserveAspectRatio="none" aria-hidden="true">
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1="0" x2={W} y1={y(g)} y2={y(g)} stroke="#e7ecf3" />
      ))}
      {red && <rect x={red[0] * W} width={(red[1] - red[0]) * W} y="0" height={h} fill="#d6453d" opacity="0.1" />}
      {!marks && <polygon points={[...idx.map((k) => pt(k, 0.1)), ...[...idx].reverse().map((k) => pt(k, -0.1))].join(' ')} fill="#cfeae4" />}
      {marks?.map(([v, c]) => (
        <line key={v} x1="0" x2={W} y1={y(v)} y2={y(v)} stroke={c} strokeDasharray="5 4" />
      ))}
      <polyline points={idx.filter((k) => k / n <= now).map((k) => pt(k, 0.02 * Math.sin(k * 1.7))).join(' ')} fill="none" stroke="#0ea08a" strokeWidth="2" />
      {now < 1 && <line x1={now * W} x2={now * W} y1="0" y2={h} stroke="#8593a6" strokeDasharray="3 3" />}
    </svg>
  );
}

const DAY = (t: number) => {
  const d = t * 24;
  return 0.2 + (d > 6 && d < 21 ? 0.5 * Math.sin(((d - 6) / 15) * Math.PI) : 0);
};
const Axis = ({ a }: { a: string[] }) => (
  <div className="wb-axis">
    {a.map((x) => (
      <span key={x}>{x}</span>
    ))}
  </div>
);
const HOURS = ['00:00', '06:00', '12:00', '18:00', '24:00'];

export function WebPowerMock() {
  return (
    <Shell mod="能源永續" sub="用電、用水、車用充電樁與營運碳排" full>
      <EnergyTabs on="用電" sub={['即時監控', '分項・樓層', '用量分析']} />
      <Anom kind="非營業時間用電偏高" dev="10F 分電表" sub="10F 辦公／會議 · 開始 11/22 19:00" cells={[['時段', '19:00–08:00'], ['實際耗電', '264 kWh（+138%）']]} />
      <div className="wb-ks">
        <K v="289" u="kW／契約 800" l="需量（15 分鐘平均）" s="36.1% · 正常" />
        <K v="2,754" u="kWh" l="今日用電" s="較歷史基準 -1.2%" />
        <K v="36,940" u="kWh" l="本月累計用電" s="約 NT$147,761" />
        <K v="約 NT$412,653" l="月底預估電費" s="較上月 -14.2%" g />
      </div>
      <Head t="今日負載 24 小時" r="實際負載／正常區間" />
      <Chart fn={DAY} now={0.66} />
      <Axis a={HOURS} />
    </Shell>
  );
}

const PARTS: [string, number, string][] = [
  ['空調', 39, '#8ecbf2'],
  ['照明', 23.1, '#f5dd8b'],
  ['插座動力', 20.2, '#8fe3cf'],
  ['電梯輸送', 7.2, '#dcb7ee'],
  ['其他', 10.5, '#b6bfc9'],
];
const FLOORS: [string, number, string][] = [
  ['10F 辦公／會議', 6.94, '+1%'],
  ['6F 辦公', 6.56, '-5%'],
  ['4F 辦公', 6.01, '-7%'],
  ['2F 辦公', 5.69, '-9%'],
  ['3F 辦公', 5.57, '-7%'],
];
const FCOL = ['#ee7f74', '#ef8f7a', '#f19f7f', '#f2a984', '#f3b38a'];

export function WebPowerSplitMock() {
  const C = 2 * Math.PI * 30;
  return (
    <Shell mod="能源永續" sub="用電、用水、車用充電樁與營運碳排" full>
      <EnergyTabs on="用電" sub={['即時監控', '*分項・樓層', '用量分析']} />
      <Head t="分項用電占比" r="2026 年 11 月" />
      <div className="wb-donut">
        <svg viewBox="0 0 84 84" aria-hidden="true">
          {PARTS.map(([n, v, c], k) => {
            const off = PARTS.slice(0, k).reduce((a, b) => a + b[1], 0);
            return <circle key={n} cx="42" cy="42" r="30" fill="none" stroke={c} strokeWidth="11" strokeDasharray={`${(v / 100) * C - 1.5} ${C}`} strokeDashoffset={-(off / 100) * C} transform="rotate(-90 42 42)" />;
          })}
          <text x="42" y="42" textAnchor="middle" fontSize="11" fontWeight="700" fill="#18222f">36,940</text>
          <text x="42" y="52" textAnchor="middle" fontSize="6.5" fill="#8593a6">本月 kWh</text>
        </svg>
        <div>
          {PARTS.map(([n, v, c]) => (
            <div className="wb-bar" key={n}>
              <span>{n}</span>
              <i>
                <u style={{ width: `${v}%`, background: c }} />
              </i>
              <b>{v.toFixed(1)}%</b>
            </div>
          ))}
        </div>
      </div>
      <Head t="樓層用電強度排行" r="kWh/m² · 本月" />
      {FLOORS.map(([n, v, d], k) => (
        <div className="wb-bar fl" key={n}>
          <span>{n}</span>
          <i>
            <u style={{ width: `${(v / 7.2) * 100}%`, background: FCOL[k] }} />
          </i>
          <b>{v.toFixed(2)}</b>
          <em>{d}</em>
        </div>
      ))}
    </Shell>
  );
}

export function WebHeatMock() {
  return (
    <Shell mod="能源永續" sub="用電、用水、車用充電樁與營運碳排" heat>
      <Head t="3D 樓層熱力圖" r={<span className="wb-btn on">← 回到分項・樓層</span>} />
      <div className="wb-grad">
        低 <i /> 高
      </div>
      <p className="wb-note">滑過樓層：模型上強調；點樓層：只看該層並展開明細</p>
      {[...FLOORS, ['9F 辦公', 5.52, '-3%'], ['1F 大廳', 4.91, '-7%'], ['B1 機房／倉儲', 4.45, '-6%']].map((f, k) => (
        <div className="wb-fr" key={String(f[0])}>
          <small>{k + 1}</small>
          <span>{f[0]}</span>
          <b>{(f[1] as number).toFixed(2)}</b>
          <em>{f[2]}</em>
        </div>
      ))}
    </Shell>
  );
}

export function WebWaterMock() {
  return (
    <Shell mod="能源永續" sub="用電、用水、車用充電樁與營運碳排" full>
      <EnergyTabs on="用水" sub={['即時監控', '水錶', '用量分析']} />
      <Anom kind="疑似持續漏水" dev="1F 廁所茶水間水錶" sub="1F 管道間 · 開始 11/21 01:48" cells={[['已持續', '3 天 15 小時'], ['目前', '41.4 L/min']]} />
      <div className="wb-ks">
        <K v="120.5" u="L/min" l="目前流量（總錶）" s="正常區間 97–162" g />
        <K v="80.8" u="m³" l="今日用水" s="較歷史基準 +1.2%" />
        <K v="1,017" u="m³" l="本月用水" s="較上月同期 +1.0%" />
        <K v="約 NT$35,885" l="月底預估水費" s="較上月 -8.2%" g />
      </div>
      <Head t="今日 24 小時流量" r="實際流量／正常區間" />
      <Chart fn={(t) => DAY(t) - 0.12} now={0.66} />
      <Axis a={HOURS} />
    </Shell>
  );
}

export function WebCarbonMock() {
  const a = [42, 38, 45, 50, 55, 61, 66, 64, 61, 57, 38, 0];
  const b = [44, 40, 47, 52, 58, 63, 70, 66, 63, 60, 50, 48];
  return (
    <Shell mod="能源永續" sub="用電、用水、車用充電樁與營運碳排" full>
      <EnergyTabs on="營運碳排" />
      <div className="wb-ks">
        <K v="17.5" u="tCO₂e" l="本月營運碳排" s="本月用電 × 排放係數" />
        <K v="560.7" u="tCO₂e" l="今年累計" s="2026 年 1 月至今" />
        <K v="-3.9" u="%" l="較去年同期" s="去年同期 583.7" g />
        <K v="0.474" u="kgCO₂e/kWh" l="排放係數" s="今年與去年皆用此係數" />
      </div>
      <Head t="月營運碳排比較" r="■ 2026 年　■ 2025 年" />
      <div className="wb-cols">
        {a.map((v, k) => (
          <div key={k}>
            <i style={{ height: `${(v / 72) * 100}%` }} />
            <i className="b" style={{ height: `${(b[k] / 72) * 100}%` }} />
          </div>
        ))}
      </div>
      <div className="wb-axis m">
        {a.map((_, k) => (
          <span key={k}>{k + 1}月</span>
        ))}
      </div>
    </Shell>
  );
}

/* ───────── 環境 ───────── */

const ENV: [string, string, string, string, string, string, string][] = [
  ['5F 大會議室', 'ENV-5F-02', '24.5', '52', '1417', '8', '異常'],
  ['10F 會議室', 'ENV-10F-02', '24.4', '52', '833', '7', '注意'],
  ['6F 開放辦公區', 'ENV-6F-01', '23.9', '55', '566', '7', '正常'],
  ['1F 入口大廳', 'ENV-1F-01', '24.0', '55', '605', '11', '正常'],
];

function EnvTabs({ on }: { on: string }) {
  return (
    <div className="wb-seg">
      {['總覽', '趨勢分析', '異常事件'].map((t) => (
        <span key={t} className={t === on ? 'on' : ''}>
          {t}
        </span>
      ))}
    </div>
  );
}

export function WebEnvMock() {
  const cls = (s: string) => (s === '異常' ? 'wb-r' : s === '注意' ? 'wb-y' : 'wb-g');
  return (
    <Shell mod="環境監測" sub="溫度、濕度、CO₂、PM2.5 連續監測" full>
      <EnvTabs on="總覽" />
      <div className="wb-ks">
        <K v="16" l="監測位置" s="溫度・濕度・CO₂・PM2.5" />
        <K v="15" l="正常" s="其中 3 個在注意範圍" g />
        <K v="1" l="異常中" s="持續超標、尚未恢復" />
        <K v="0" l="離線／無資料" s="感測器沒有回報資料" />
      </div>
      <div className="wb-ks">
        {(
          [
            ['溫度', '24.4', '°C', 100, 'A 16'],
            ['濕度', '54', '%', 94, 'A 15 · B 1'],
            ['CO₂', '739', 'ppm', 81, 'A 13 · B 2 · C 1'],
            ['PM2.5', '8', 'μg/m³', 100, 'A 16'],
          ] as [string, string, string, number, string][]
        ).map(([n, v, u, w, d]) => (
          <div className="wb-k" key={n}>
            <span>{n}</span>
            <b>
              {v}
              <em>{u}</em>
            </b>
            <i className="wb-dist">
              <u style={{ width: `${w}%` }} />
            </i>
            <small>{d}</small>
          </div>
        ))}
      </div>
      <Head t="即時數值" r="16 個監測位置" />
      <div className="wb-table wb-env">
        <div className="wb-tr wb-th">
          <span>監測位置</span>
          <span>溫度</span>
          <span>濕度</span>
          <span>CO₂</span>
          <span>PM2.5</span>
          <span>狀態</span>
        </div>
        {ENV.map((r) => (
          <div className="wb-tr" key={r[1]}>
            <span>
              <b>{r[0]}</b>
            </span>
            <span>{r[2]}</span>
            <span>{r[3]}</span>
            <span className={cls(r[6])}>{r[4]}</span>
            <span>{r[5]}</span>
            <span className={cls(r[6])}>{r[6]}</span>
          </div>
        ))}
      </div>
    </Shell>
  );
}

export function WebEnvTrendMock() {
  const co2 = (t: number) => {
    const h = 15 + t * 24;
    let v = 0.15;
    if (h < 18) v += 0.17 * (1 - (h - 15) / 3);
    if (h >= 33 && h < 37.5) v += 0.2 * Math.min(1, (h - 33) / 2.5);
    if (h >= 37.5) v += 0.2 + 0.5 * Math.min(1, (h - 37.5) / 0.4);
    return v;
  };
  return (
    <Shell mod="環境監測" sub="溫度、濕度、CO₂、PM2.5 連續監測" full>
      <EnvTabs on="趨勢分析" />
      <div className="wb-tabs">
        <span>5F 大會議室 ▾</span>
        <span>溫度</span>
        <span>濕度</span>
        <span className="on">CO₂</span>
        <span>PM2.5</span>
        <span className="on">24 小時</span>
        <span>7 天</span>
        <span>30 天</span>
        <span>自訂</span>
      </div>
      <Head t="5F 大會議室　CO₂（ppm）" r="黃線 注意門檻　紅線 異常門檻" />
      <Chart fn={co2} marks={[[0.385, '#c07f06'], [0.54, '#d6453d']]} red={[0.945, 1]} h={120} />
      <Axis a={['昨 15:00', '21:00', '03:00', '09:00', '15:00']} />
      <Head t="期間統計" />
      <div className="wb-fs five">
        <Field k="最大" v="1463 ppm" />
        <Field k="最小" v="453 ppm" />
        <Field k="平均" v="617 ppm" />
        <Field k="達標率（A 級）" v="82%" />
        <Field k="期間異常" v="1 次" />
      </div>
    </Shell>
  );
}
