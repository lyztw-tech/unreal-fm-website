import { asset } from '@/lib/asset-path';

/** 品牌標記（nav 與頁尾共用）：public/brand/mark.png（透明底藍色 A）。 */
export function Mark({ size = 28 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="logo-img" src={asset('/brand/mark.png')} alt="" aria-hidden="true" style={{ height: size, width: 'auto' }} />
  );
}
