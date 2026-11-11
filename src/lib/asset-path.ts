/**
 * GitHub Pages 專案頁跑在 /<repo>/ 這個子路徑下（repo 名稱，見 next.config.ts），
 * 但 next/link 以外的東西（<img src="/...">、CSS url()）都不會自動加上 basePath。
 * 所有指向 public/ 底下靜態檔案的 <img src> 一律要包這層，不要直接寫死絕對路徑。
 *
 * NEXT_PUBLIC_BASE_PATH 由 .github/workflows/deploy.yml 在 build 時注入；
 * 本機 dev/build 沒設這個 env，asset() 就是 no-op（回傳原路徑）。
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** 網域本身（不含 basePath）。由 deploy.yml 注入；本機沒設就退回 localhost（dev 用 3600）。
 * 之後換自訂網域，只要改 deploy.yml 那一行 env。 */
export const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_ORIGIN ?? 'http://localhost:3600';

/** 網站完整絕對網址（含 basePath），OG 圖／canonical URL 這類「一定要絕對網址」的地方用。
 * 不要用 Next 的 metadataBase 相對解析——開頭是 `/` 會無視 basePath、只從網域根目錄解析。 */
export const SITE_URL = `${SITE_ORIGIN}${BASE_PATH}`;

/** public/ 靜態檔案路徑：dev 時是 no-op，GitHub Pages build 時補上 /<repo>。 */
export function asset(path: string): string {
  return `${BASE_PATH}${path}`;
}

/** asset() 的絕對網址版，給分享預覽圖這種「爬蟲直接抓網址」的地方用。 */
export function absoluteAsset(path: string): string {
  return `${SITE_ORIGIN}${asset(path)}`;
}
