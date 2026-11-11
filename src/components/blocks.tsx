import Link from 'next/link';
import { Rv } from './reveal';
import { Mark } from './mark';
import { asset } from '@/lib/asset-path';

/** 單張產品截圖。桌面應用程式的畫面，不加瀏覽器網址列。 */
export function Shot({ title, src }: { title: string; src: string }) {
  return (
    <div className="frame">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset(src)} alt={title} />
    </div>
  );
}

/** 功能列：左右分欄，flip 換邊。media 放 Gallery。 */
export function FeatureRow({
  id,
  no,
  label,
  title,
  desc,
  points,
  media,
  flip,
}: {
  id?: string;
  no: string;
  label: string;
  title: React.ReactNode;
  desc: string;
  points: string[];
  media: React.ReactNode;
  flip?: boolean;
}) {
  return (
    <section className={`frow wrap${flip ? ' flip' : ''}`} id={id}>
      <Rv as="figure" className="frow-media">
        {media}
      </Rv>
      <div className="frow-text">
        <Rv>
          <span className="frow-label">
            <span className="n">{no}</span>
            {label}
          </span>
        </Rv>
        <Rv as="h3" delay={1}>
          {title}
        </Rv>
        <Rv as="p" className="desc" delay={1}>
          {desc}
        </Rv>
        {points.length > 0 && (
          <Rv as="ul" className="frow-points" delay={2}>
            {points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </Rv>
        )}
      </div>
    </section>
  );
}

/** 共用頁尾 */
export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap foot-grid">
        <div className="foot-brand">
          <Link className="brand" href="/">
            <Mark size={26} />
            智慧建築維運平台
          </Link>
          <p className="foot-tag">大樓設施維運管理系統</p>
          <p className="foot-co">萊茲特資訊科技</p>
        </div>
        <div className="foot-contact">
          <h4>聯絡資訊</h4>
          <dl>
            <div>
              <dt>電話</dt>
              <dd>
                <a href="tel:+886282626600">(02) 8262-6600</a>
              </dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>
                <a href="mailto:lyztw@lyztw.com">lyztw@lyztw.com</a>
              </dd>
            </div>
            <div>
              <dt>地址</dt>
              <dd>臺北市中正區杭州南路 1 段 6 巷 11 號</dd>
            </div>
          </dl>
        </div>
      </div>
      <div className="wrap foot-bar">
        <span>© 2026 萊茲特資訊科技 · lyztw</span>
      </div>
    </footer>
  );
}

/** 區塊標題 */
export function SectHead({
  eyebrow,
  title,
  sub,
  center,
  id,
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub?: string;
  center?: boolean;
  id?: string;
}) {
  return (
    <div className={`sect-head${center ? ' center' : ''}`} id={id}>
      <Rv>
        <span className="sect-eyebrow">{eyebrow}</span>
      </Rv>
      <Rv as="h2" delay={1}>
        {title}
      </Rv>
      {sub && (
        <Rv as="p" delay={2}>
          {sub}
        </Rv>
      )}
    </div>
  );
}
