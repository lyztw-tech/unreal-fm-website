import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SITE_URL, absoluteAsset } from '@/lib/asset-path';

const TITLE = '智慧建築維運平台｜設備、告警、影像、工單與能源，一個 3D 模型看全部';
const DESC =
  '以 BIM 模型為底的大樓維運系統：資產管理、告警清單、影像監控、報修與預防保養、手機出勤、用電用水與碳排、室內環境監測——點設備，鏡頭就飛到它在哪裡。';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: SITE_URL,
    siteName: '智慧建築維運平台',
    locale: 'zh_TW',
    type: 'website',
    images: [{ url: absoluteAsset('/og.png'), width: 1200, height: 630 }],
  },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // suppressHydrationWarning：boot script 在水合前寫入 data-theme，<html> 屬性差異是預期行為
  return (
    <html lang="zh-Hant-TW" suppressHydrationWarning>
      <body>
        {/* 主題開機腳本：首次繪製前套用 localStorage 的主題，避免閃色（預設淺色，深色為 opt-in）*/}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('fm-theme')==='dark')document.documentElement.dataset.theme='dark'}catch(e){}`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
