import { Nav } from '@/components/nav';
import { Hero } from '@/components/hero';
import { FlyIntro } from '@/components/fly-intro';
import { FeatureRow, SectHead, Footer } from '@/components/blocks';
import { Gallery, type ShotDef } from '@/components/gallery';
import { Rv } from '@/components/reveal';
import { AssetListMock, AlarmMock, AssetPanelMock } from '@/components/mock-ui';
import {
  HomeMock,
  Scene3D,
  CamWallMock,
  RepairMock,
  PhoneVisitMock,
  PhoneOrderMock,
  PowerLiveMock,
  PowerSplitMock,
  WaterMock,
  CarbonMock,
  EnvOverviewMock,
  EnvTrendMock,
} from '@/components/mock-more';
import {
  WebHomeMock,
  WebAssetListMock,
  WebAssetDetailMock,
  WebAlarmMock,
  WebCamMock,
  WebCamDetailMock,
  WebRepairMock,
  WebPmMock,
  WebPowerMock,
  WebPowerSplitMock,
  WebHeatMock,
  WebWaterMock,
  WebCarbonMock,
  WebEnvMock,
  WebEnvTrendMock,
} from '@/components/mock-web';
import { PlatformProvider } from '@/components/platform';

/* 文案原則：只寫系統現在真的有的功能（對照 docs/feature-copy.md）。 */

/* ── 設施營運 ── */
const S_HOME: ShotDef[] = [
  { label: '首頁總覽', title: '首頁：建築概況、資產狀態、各系統可用率、報修與保養待辦、告警', node: <HomeMock /> },
];
const S_ASSET: ShotDef[] = [
  { label: '資產清冊', title: '依樓層、狀態、類別篩選設備', node: <AssetListMock /> },
  { label: '設備狀態', title: '運轉、健康、通訊、服務分開判斷，附即時讀值與近 7 天狀態歷史（分頁可切換）', node: <AssetPanelMock /> },
  { label: '保養資訊', title: '安裝日、保固、上次保養與週期，自動算出下次保養日（分頁可切換）', node: <AssetPanelMock tab="保養資訊" /> },
];
const S_ALARM: ShotDef[] = [
  { label: '告警清單', title: '只列目前有告警的設備，右側是該設備的告警紀錄', node: <AlarmMock /> },
];
const S_CAM: ShotDef[] = [
  { label: '位置與視角', title: '透視模式：每支監視器的位置與拍攝範圍（示意模型）', node: <Scene3D stop="cam" />, bare: true },
  { label: '監視牆', title: '監視牆分頁瀏覽，可放大單一畫面或開獨立視窗', node: <CamWallMock /> },
];

/* ── 維運作業 ── */
const S_REPAIR: ShotDef[] = [
  { label: '報修工單', title: '工單綁定設備，處理過程依時間軸記錄', node: <RepairMock /> },
];
const S_MOBILE: ShotDef[] = [
  { label: '出勤單', title: '手機開啟出勤單：這次要處理的工單', node: <PhoneVisitMock />, ratio: 'phone' },
  { label: '工單與位置圖', title: '樓層位置圖＋設備近景，現場不用找', node: <PhoneOrderMock />, ratio: 'phone' },
];

/* ── 能源與環境 ── */
const S_POWER: ShotDef[] = [
  { label: '用電即時', title: '需量對照契約容量、今日負載與正常區間、用電異常', node: <PowerLiveMock /> },
  { label: '分項・樓層', title: '分項用電占比與樓層用電強度排行', node: <PowerSplitMock /> },
  { label: '3D 熱力圖', title: '樓層用電強度直接畫在模型上（示意模型）', node: <Scene3D stop="heat" />, bare: true },
  { label: '用水', title: '用水即時流量與持續漏水偵測', node: <WaterMock /> },
  { label: '營運碳排', title: '依排放係數換算，月比較、來源拆分、樓層排名', node: <CarbonMock /> },
];
const S_ENV: ShotDef[] = [
  { label: '總覽', title: '各監測位置即時數值、分級與最近異常', node: <EnvOverviewMock /> },
  { label: '趨勢分析', title: '門檻線與異常時段標示，附期間統計', node: <EnvTrendMock /> },
];

/* ── 網頁版的畫面（頂部切到「網頁」時顯示） ── */
const W_HOME: ShotDef[] = [
  { label: '今日總覽', title: '今日總覽：待複查與處理中的工單、各系統可用率', node: <WebHomeMock /> },
];
const W_ASSET: ShotDef[] = [
  { label: '資產清冊', title: '設備、位置、類型、狀態與下次保養', node: <WebAssetListMock /> },
  { label: '設備詳情', title: '即時讀值、狀態歷史與維修履歷，可在模型上顯示', node: <WebAssetDetailMock /> },
];
const W_ALARM: ShotDef[] = [
  { label: '告警中心', title: '只列目前有告警的設備，點進去看告警並可直接報修', node: <WebAlarmMock /> },
];
const W_CAM: ShotDef[] = [
  { label: '監視器', title: '監視器畫面一頁排開', node: <WebCamMock /> },
  { label: '單一畫面', title: '放大畫面與設備資料，可在模型上顯示', node: <WebCamDetailMock /> },
];
const W_REPAIR: ShotDef[] = [
  { label: '報修管理', title: '依階段分列，處理過程依時間軸記錄', node: <WebRepairMock /> },
];
const W_PM: ShotDef[] = [
  { label: '預防保養', title: '已逾期、處理中、已結案、已作廢與計畫總覽', node: <WebPmMock /> },
];
const W_POWER: ShotDef[] = [
  { label: '用電即時', title: '需量對照契約容量、今日負載與正常區間、用電異常', node: <WebPowerMock /> },
  { label: '分項・樓層', title: '分項用電占比與樓層用電強度排行', node: <WebPowerSplitMock /> },
  { label: '3D 熱力圖', title: '樓層用電強度畫在模型上（示意模型）', node: <WebHeatMock /> },
  { label: '用水', title: '用水即時流量與持續漏水偵測', node: <WebWaterMock /> },
  { label: '營運碳排', title: '依排放係數換算，月比較', node: <WebCarbonMock /> },
];
const W_ENV: ShotDef[] = [
  { label: '總覽', title: '各監測位置即時數值與分級', node: <WebEnvMock /> },
  { label: '趨勢分析', title: '門檻線與異常時段標示，附期間統計', node: <WebEnvTrendMock /> },
];

/* 雙平台：應用程式（UE）＋網頁版（fm-platform），共用同一個後端（見 docs/feature-copy.md「雙平台」） */
const PLATFORMS = [
  {
    ic: '▣',
    t: '應用程式',
    p: '即時 3D 引擎呈現整棟大樓：透視、依樓層剖開、監視牆可開成獨立視窗，適合中控室的大螢幕。',
  },
  {
    ic: '◎',
    t: '網頁版',
    p: '開瀏覽器、以帳號登入就能用，不必安裝。一樣有 3D 模型、設備定位與樓層用電熱力圖。',
  },
  {
    ic: '⇌',
    t: '同一份資料',
    p: '兩個版本接同一個後端：報修、保養、出勤與告警，在哪一邊處理，另一邊都看得到。',
  },
];

/* 部署方式：雲端或地端二選一（見 docs/feature-copy.md「部署方式」）。雲端目前以網頁版使用。 */
const MODES = [
  {
    ic: '⌂',
    t: '地端部署',
    p: '整套系統裝在案場自己的主機與內網，應用程式與網頁版都能用；設備資料、工單、照片不經過外部雲端。',
  },
  {
    ic: '☁',
    t: '雲端部署',
    p: '網頁版與後端放在雲端主機，每個客戶一套獨立環境；不用在案場架主機，用瀏覽器登入就能使用。',
  },
];

/* 地端部署的資料安全：只寫目前架構真的做到的（見 docs/feature-copy.md「部署方式」） */
const DEPLOY = [
  {
    ic: '⌂',
    t: '部署在案場主機',
    p: '應用程式、後端服務與資料庫都裝在大樓自己的電腦上，點一下啟動程式就會依序開好。',
  },
  {
    ic: '⇄',
    t: '大樓內網運作',
    p: '設備狀態、告警、工單與能源資料都在內網流動；現場人員的手機連大樓網路就能開出勤單。',
  },
  {
    ic: '◫',
    t: '資料不出大樓',
    p: '設備資料、工單、照片都存在案場的資料庫，不上傳到外部雲端，資料所有權在業主。',
  },
  {
    ic: '⚿',
    t: '帳密只留在後端',
    p: '影像監控需要連到攝影機或影像平台時，由後端代為連線，帳號密碼不會出現在應用程式或手機上。',
  },
  {
    ic: '▤',
    t: '資料庫不對外開放',
    p: '資料庫只接受同一台主機的連線，網路上的其他電腦連不到。',
  },
  {
    ic: '↻',
    t: '每日自動備份',
    p: '每天備份資料庫與照片檔案，可再同步到案場的 NAS；資料不設保留期限。',
  },
];

const VISION = [
  { t: '資產管理', on: true },
  { t: '告警清單', on: true },
  { t: '影像監控', on: true },
  { t: '維運管理', on: true },
  { t: '能源永續', on: true },
  { t: '環境監測', on: true },
  { t: '綠能・儲能', soon: true },
];

export default function Home() {
  return (
    <PlatformProvider>
      <Nav />
      <main>
        <FlyIntro />
        <Hero />

        {/* ═══ 雙平台 ═══ */}
        <section className="sect wrap" id="platforms">
          <SectHead
            eyebrow="雙平台"
            title={<>中控室用應用程式，辦公室開瀏覽器。</>}
            sub="應用程式與網頁版共用同一個後端與資料，依使用的場合選擇，也可以兩個一起用。"
          />
          <div className="fgrid">
            {PLATFORMS.map((d, i) => (
              <Rv key={d.t} className="fcard" delay={(i + 1) as 1 | 2 | 3}>
                <div className="fic" aria-hidden="true">
                  {d.ic}
                </div>
                <h3>{d.t}</h3>
                <p>{d.p}</p>
              </Rv>
            ))}
          </div>
        </section>

        {/* ═══ 設施營運 ═══ */}
        <section className="sect wrap" id="features">
          <SectHead
            eyebrow="設施營運"
            title={<>設備在哪裡、現在好不好，打開就知道。</>}
            sub="所有設備都掛在 BIM 模型上，清單、告警與影像都能直接定位到現場位置。"
          />
        </section>

        <FeatureRow
          no="基礎"
          label="首頁總覽"
          title={<>整棟大樓的狀態，一頁看完。</>}
          desc="建築概況、資產狀態（正常／警告／異常／離線／維護中）、各系統可用率、報修與保養待辦、影像縮圖集中在首頁；點任一格直接帶到對應清單。"
          points={[]}
          media={<Gallery shots={S_HOME} />}
          web={{
            desc: '待複查與處理中的工單、各系統可用率與逾期保養集中在首頁，旁邊就是大樓的 3D 模型；點任一項直接進到內容。',
            media: <Gallery key="w" shots={W_HOME} />,
          }}
        />
        <FeatureRow
          flip
          no="01"
          label="資產管理"
          title={<>點清單，鏡頭就飛到設備。</>}
          desc="設備清冊可依樓層、狀態、類別篩選；選取設備時 3D 鏡頭自動飛到位置並高亮。面板分頁顯示運轉狀態、基本資訊、保養資訊與維修履歷。"
          points={[
            '依樓層剖開模型，只看這一層',
            '運轉、健康、通訊、服務分開判斷——停機不等於異常',
            '近 7 天狀態歷史與可用率',
          ]}
          media={<Gallery shots={S_ASSET} />}
          web={{
            title: <>打開設備，在模型上找到它。</>,
            desc: '設備清冊列出位置、類型、狀態與下次保養。打開一台設備，即時讀值、狀態歷史、進行中的工單與維修履歷都在同一頁；按「在模型上顯示」，鏡頭就帶到位置。',
            points: ['運轉、通訊、服務分開顯示——停機不等於異常', '近 7 天狀態歷史與可用率', '上方搜尋可直接找設備、工單或位置'],
            media: <Gallery key="w" shots={W_ASSET} />,
          }}
        />
        <FeatureRow
          no="02"
          label="告警清單"
          title={<>只列出需要處理的設備。</>}
          desc="設備有告警才會出現在清單上，告警解除就自動移出。點選即定位到模型並列出該設備的告警紀錄，也可以直接在這裡建立報修或保養工單。"
          points={[]}
          media={<Gallery shots={S_ALARM} />}
          web={{
            desc: '設備有告警才會出現在清單上，告警解除就自動移出。點進設備可看它目前的所有告警，也可以直接在這裡報修。',
            media: <Gallery key="w" shots={W_ALARM} />,
          }}
        />
        <FeatureRow
          flip
          no="03"
          label="影像監控"
          title={
            <>
              監視器裝在哪、拍向哪，
              <br />
              模型上一目了然。
            </>
          }
          desc="透視模式顯示每支監視器的位置與拍攝範圍；監視牆分頁一次看多路畫面，也可放大單一畫面或開成獨立視窗。"
          points={['支援 HLS 串流，帳密只留在後端', '有人在看才連線，不看就自動斷開省頻寬']}
          media={<Gallery shots={S_CAM} />}
          web={{
            title: <>監視器畫面，開瀏覽器就能看。</>,
            desc: '監視器畫面一頁排開，點一支看大畫面與設備資料，並可在模型上顯示它的位置。',
            points: ['支援 HLS 串流，瀏覽器直接播放', '斷線自動重新連線'],
            media: <Gallery key="w" shots={W_CAM} />,
          }}
        />

        {/* ═══ 維運作業 ═══ */}
        <section className="sect wrap" id="ops">
          <SectHead
            eyebrow="維運作業"
            title={<>從報修、保養到出勤，每一步都留紀錄。</>}
            sub="報修單與保養單分開管理，現場出勤用手機回報，結果自動回到設備履歷。"
          />
        </section>

        <FeatureRow
          no="01"
          label="報修管理"
          title={<>開單、處理、結案，都在時間軸上。</>}
          desc="工單可綁定設備或空間。處理中、已結案、已作廢分開列；狀態、留言與照片依時間記錄，結案後寫進設備的維修履歷。"
          points={[]}
          media={<Gallery shots={S_REPAIR} />}
          web={{
            desc: '工單可綁定設備或空間。待複查、處理中、已結案、已作廢分開列；狀態、留言與照片依時間記錄，結案後列入設備的維修履歷。',
            media: <Gallery key="w" shots={W_REPAIR} />,
          }}
        />
        <FeatureRow
          flip
          no="02"
          label="預防保養"
          title={<>到期前提醒，不再靠人記。</>}
          desc="每台設備記錄安裝日、保固、上次保養與保養週期，系統算出下次保養日並標示即將到期與逾期；首頁直接顯示保養到期的設備數。"
          points={['保養單與報修單分開，各有自己的履歷']}
          media={<Gallery shots={[S_ASSET[2]]} />}
          web={{
            desc: '系統依保養週期算出每台設備的下次保養日；已逾期、處理中、已結案、已作廢各一個分頁，計畫總覽列出每台設備的週期。首頁直接顯示逾期保養的設備。',
            media: <Gallery key="w" shots={W_PM} />,
          }}
        />
        <FeatureRow
          id="mobile"
          no="03"
          label="手機出勤"
          title={<>現場用手機回報，不用裝 App。</>}
          desc="從報修或保養工單建立出勤，系統產生專屬連結與 QR Code。現場人員用手機開啟，看設備樓層位置圖與近景，逐張工單填狀態、留言與照片；收訊不好時先存在手機，連線後自動上傳。"
          points={['整趟出勤的問題可另外回報', '出勤結束後，未結案的工單自動列為待複查']}
          media={<Gallery shots={S_MOBILE} />}
        />

        {/* ═══ 能源與環境 ═══ */}
        <section className="sect wrap" id="energy">
          <SectHead
            eyebrow="能源與環境"
            title={<>用電、用水、碳排與室內環境，異常主動提醒。</>}
            sub="即時數值、統計分析與 3D 樓層視覺化放在同一個模組裡。"
          />
        </section>

        <FeatureRow
          no="01"
          label="能源永續"
          title={<>用電異常，主動告訴你。</>}
          desc="15 分鐘需量對照契約容量分級提醒；非營業時間用電偏高、負載突增、樓層用電偏高等異常自動列出。分項與樓層用電強度排行，並可在 3D 模型上以熱力圖呈現。"
          points={['用水：即時流量、水錶讀值、持續漏水偵測', '車用充電樁：充電狀態與今日充電量', '營運碳排：依排放係數換算，月比較與樓層排名']}
          media={<Gallery shots={S_POWER} />}
          web={{ media: <Gallery key="w" shots={W_POWER} /> }}
        />
        <FeatureRow
          flip
          no="02"
          label="環境監測"
          title={<>室內空氣品質，超標自動記錄。</>}
          desc="監測溫度、濕度、CO₂ 與 PM2.5，依智慧建築標章健康舒適指標分 A～D 級；總覽看各位置即時數值，趨勢分析可選 24 小時、7 天、30 天或自訂區間，異常事件記錄開始時間、持續多久與峰值。"
          points={['持續超標才觸發、恢復穩定才解除，不會一直跳']}
          media={<Gallery shots={S_ENV} />}
          web={{ media: <Gallery key="w" shots={W_ENV} /> }}
        />

        {/* ═══ 部署方式 ═══ */}
        <section className="sect wrap" id="deploy">
          <SectHead
            eyebrow="部署方式 · 資料安全"
            title={<>雲端或地端，依需求選擇。</>}
            sub="要資料完全留在大樓裡，就裝在案場主機；不想在現場架主機，就放在雲端。"
          />
          <div className="fgrid fgrid-2">
            {MODES.map((d, i) => (
              <Rv key={d.t} className="fcard" delay={(i + 1) as 1 | 2 | 3}>
                <div className="fic" aria-hidden="true">
                  {d.ic}
                </div>
                <h3>{d.t}</h3>
                <p>{d.p}</p>
              </Rv>
            ))}
          </div>
          <h3 className="fgrid-head">選擇地端部署時</h3>
          <div className="fgrid">
            {DEPLOY.map((d, i) => (
              <Rv key={d.t} className="fcard" delay={((i % 3) + 1) as 1 | 2 | 3}>
                <div className="fic" aria-hidden="true">
                  {d.ic}
                </div>
                <h3>{d.t}</h3>
                <p>{d.p}</p>
              </Rv>
            ))}
          </div>
        </section>

        {/* 藍圖 */}
        <section className="vision wrap" id="vision">
          <SectHead
            center
            eyebrow="產品藍圖"
            title={<>從設施維運出發，持續擴充。</>}
            sub="目前六大功能模組已上線；綠能與儲能監控規劃中。"
          />
          <div className="vision-track">
            {VISION.map((v) => (
              <span key={v.t} className={`vchip${v.on ? ' on' : ''}${v.soon ? ' soon' : ''}`}>
                {v.t}
                {v.soon && <em>規劃中</em>}
              </span>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="cta" id="contact">
          <Rv as="h2">為你的大樓，安排一場實機展示。</Rv>
          <Rv as="p" delay={1}>
            留個信，我們會聯絡你安排展示與導入評估。
          </Rv>
          <Rv delay={2}>
            <a
              className="btn btn-primary"
              href="mailto:dev@lyztw.com?subject=FMSync%20%E5%B1%95%E7%A4%BA%E9%A0%90%E7%B4%84"
            >
              預約展示
            </a>
            <div className="cta-mail">或來信 dev@lyztw.com</div>
          </Rv>
        </section>
      </main>

      <Footer />
    </PlatformProvider>
  );
}
