'use client';

/**
 * 用網頁畫出系統的清單畫面（取代整張截圖，只留重點）。
 * 欄位與文字照 UE 系統的寫法：資產清冊（WBP_EQAssetList）、告警清單（WBP_AlarmBoard）。
 * 設備名稱與數字是示範資料。
 */
import { useState } from 'react';

type Cond = '正常' | '警告' | '異常' | '離線' | '維護中';

function Chip({ c }: { c: Cond }) {
  return <span className={`mk-chip mk-${c}`}>● {c}</span>;
}

const ASSETS: { name: string; floor: string; cat: string; run: string; cond: Cond }[] = [
  { name: '發電機_1', floor: 'B1FL', cat: '電器裝置', run: '運轉中', cond: '正常' },
  { name: '冰水主機_2', floor: 'B2FL', cat: '機械設備', run: '運轉中', cond: '警告' },
  { name: '攝影機_壁掛8', floor: 'B3FL', cat: '監視器', run: '運轉中', cond: '正常' },
  { name: '充電樁_01', floor: 'B3FL', cat: '充電樁', run: '運轉中', cond: '正常' },
  { name: '充電樁_03', floor: 'B3FL', cat: '充電樁', run: '待機', cond: '正常' },
  { name: '10F 分電表', floor: '10FL', cat: '電表', run: '運轉中', cond: '離線' },
  { name: '消防泵浦_1', floor: 'B1FL', cat: '消防設備', run: '停機', cond: '維護中' },
];

export function AssetListMock() {
  const [sel, setSel] = useState(3);
  return (
    <div className="mk">
      <div className="mk-panel">
        <div className="mk-head">
          <b>資產清冊</b>
          <span>全棟</span>
        </div>
        <div className="mk-search">搜尋設備名稱或編號</div>
        <div className="mk-filter">
          <span className="mk-fl">樓層</span>
          <span>全棟</span>
        </div>
        <div className="mk-filter">
          <span className="mk-fl">狀態</span>
          <span className="mk-pill">保養到期 (31)</span>
        </div>
        <div className="mk-filter">
          <span className="mk-fl">類別</span>
          <span className="mk-pill mk-pill-dd">全部類別 ▼</span>
        </div>
        <div className="mk-rows">
          {ASSETS.slice(0, 5).map((a, i) => (
            <button type="button" key={a.name} className={`mk-row${i === sel ? ' on' : ''}`} onClick={() => setSel(i)}>
              <i className={`mk-bar mk-bar-${a.cond}`} />
              <span className="mk-row-t">
                <b>{a.name}</b>
                <small>
                  / {a.floor} / {a.cat} · {a.run}
                </small>
              </span>
              <Chip c={a.cond} />
            </button>
          ))}
        </div>
        <div className="mk-foot">共 72 項設備</div>
      </div>
    </div>
  );
}

type PanelTab = '運轉狀態' | '基本資訊' | '保養資訊' | '履歷';
const PANEL_TABS: PanelTab[] = ['運轉狀態', '基本資訊', '保養資訊', '履歷'];

function KV({ k, v, cls }: { k: string; v: React.ReactNode; cls?: string }) {
  return (
    <div className="mk-kv">
      <span>{k}</span>
      <b className={cls}>{v}</b>
    </div>
  );
}

/** 資產面板（系統的「構件屬性」）：頭部固定，四個分頁可切換 */
export function AssetPanelMock({ tab = '運轉狀態' }: { tab?: PanelTab }) {
  const [t, setT] = useState<PanelTab>(tab);
  return (
    <div className="mk">
      <div className="mk-panel mk-asset">
        <div className="mk-head">
          <b>構件屬性</b>
        </div>
        <div className="mk-dev">
          <b>
            充電樁_01 <Chip c="正常" />
          </b>
          <small>EVC-B3F-01</small>
          <span className="mk-wrench" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8-2.6-2.6 3.3-3.3-1.4-1.4-3.3 3.3L6.4 14.4 14.4 6.4z" />
            </svg>
          </span>
        </div>
        <div className="mk-tabs" role="tablist">
          {PANEL_TABS.map((x) => (
            <button type="button" role="tab" aria-selected={x === t} key={x} className={x === t ? 'on' : ''} onClick={() => setT(x)}>
              {x}
            </button>
          ))}
        </div>

        {t === '運轉狀態' && (
          <div className="mk-body">
            <KV k="運轉" v="運轉中" />
            <KV k="健康" v="正常" />
            <KV k="通訊" v="連線中" />
            <KV k="服務" v="服務中" />
            <div className="mk-sep" />
            <KV k="充電狀態" v="充電中" />
            <KV k="充電功率" v="6.52 kW" />
            <KV k="今日充電量" v="21.09 kWh" />
            <KV k="額定功率" v="7 kW" />
            <div className="mk-hist">
              <div className="mk-hist-h">
                <span>狀態歷史 · 近 7 天</span>
                <em>示意</em>
              </div>
              <div className="mk-hist-a">可用率 98.6% · 警告 1 次</div>
              <div className="mk-hist-bar">
                <i style={{ flex: 62 }} />
                <i className="w" style={{ flex: 3 }} />
                <i style={{ flex: 35 }} />
              </div>
              <div className="mk-hist-x">
                <span>11/04</span>
                <span>11/11 現在</span>
              </div>
              <div className="mk-legend">
                <span className="g">● 正常</span>
                <span className="y">● 警告</span>
                <span className="r">● 異常</span>
                <span className="o">● 離線</span>
                <span className="b">● 維護</span>
              </div>
            </div>
          </div>
        )}

        {t === '基本資訊' && (
          <div className="mk-body">
            <KV k="類別" v="充電樁" />
            <KV k="樓層" v="B3FL" />
            <KV k="系統" v="電力" />
            <KV k="位置" v="B3 停車場" />
            <KV k="設備編號" v="EVC-B3F-01" />
            <KV k="廠牌型號" v="—" />
            <KV k="裝置 ID" v="—" />
          </div>
        )}

        {t === '保養資訊' && (
          <div className="mk-body">
            <KV k="安裝日" v={<span className="mk-input">2020-04-20</span>} />
            <KV k="保固到期" v={<span className="mk-input">2029-04-19</span>} />
            <KV k="上次保養日" v="2026-04-20" />
            <KV k="下次保養日" v="2026-10-17（逾期 25 天）" cls="mk-red" />
            <KV k="保養週期（天）" v={<span className="mk-input">180</span>} />
          </div>
        )}

        {t === '履歷' && (
          <div className="mk-body">
            <div className="mk-hh">
              <span>維修履歷</span>
              <span>1 張</span>
            </div>
            <div className="mk-alarm">
              <span className="mk-alarm-t">充電槍無法鎖定</span>
              <span className="mk-time">已完成 · 完工 2026-09-12</span>
            </div>
            <div className="mk-hh" style={{ marginTop: 14 }}>
              <span>保養履歷</span>
              <span>1 張</span>
            </div>
            <div className="mk-alarm">
              <span className="mk-alarm-t">定期保養</span>
              <span className="mk-time">已完成 · 2026-04-20</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const ALARMS:{ name: string; code: string; floor: string; cat: string; items: [string, string][] }[] = [
  {
    name: '5F 大會議室環境感測器',
    code: 'ENV-5F-02',
    floor: '5FL',
    cat: '環境感測器',
    items: [
      ['CO₂ 偏高', '11-11 15:00'],
      ['CO₂ 偏高', '11-11 14:30'],
      ['CO₂ 偏高', '11-11 14:00'],
      ['CO₂ 偏高', '11-11 13:30'],
    ],
  },
  {
    name: '10F 分電表',
    code: 'EM-10F-01',
    floor: '10FL',
    cat: '電表',
    items: [
      ['非營業時間用電偏高', '11-11 14:46'],
      ['非營業時間用電偏高', '11-11 14:16'],
      ['非營業時間用電偏高', '11-11 13:46'],
    ],
  },
  {
    name: '1F 廁所茶水間水錶',
    code: 'WM-1FL-03',
    floor: '1FL',
    cat: '水錶',
    items: [['疑似持續漏水', '11-11 01:48']],
  },
];

export function AlarmMock() {
  const [sel, setSel] = useState(0);
  const a = ALARMS[sel];
  return (
    <div className="mk mk-two">
      <div className="mk-panel">
        <div className="mk-head">
          <b>告警清單</b>
        </div>
        <div className="mk-search">搜尋設備名稱或編號</div>
        <div className="mk-rows">
          {ALARMS.map((x, i) => (
            <button type="button" key={x.code} className={`mk-row${i === sel ? ' on' : ''}`} onClick={() => setSel(i)}>
              <i className="mk-bar mk-bar-警告" />
              <span className="mk-row-t">
                <b>{x.name}</b>
                <small>
                  {x.code} / {x.floor} / {x.cat}
                </small>
              </span>
              <Chip c="警告" />
            </button>
          ))}
        </div>
        <div className="mk-foot">共 3 項設備</div>
      </div>
      <div className="mk-panel">
        <div className="mk-head">
          <b>設備告警</b>
        </div>
        <div className="mk-dev">
          <b>{a.name}</b>
          <small>{a.code}</small>
          <span className="mk-wrench" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8-2.6-2.6 3.3-3.3-1.4-1.4-3.3 3.3L6.4 14.4 14.4 6.4z" />
            </svg>
          </span>
        </div>
        <div className="mk-sub">告警（{a.items.length}）</div>
        {a.items.map(([t, time], k) => (
          <div className="mk-alarm" key={k}>
            <span className="mk-tag">警告</span>
            <span className="mk-alarm-t">{t}</span>
            <span className="mk-time">{time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
