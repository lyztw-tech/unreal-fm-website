/** 品牌標記：圓角方塊＋大樓剪影（nav 與頁尾共用）。正式 logo 出來後換掉這個元件即可。 */
export function Mark({ size = 28 }: { size?: number }) {
  return (
    <span className="logo" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 24 24" width={size * 0.62} height={size * 0.62} fill="none">
        <path d="M4 21V9l6-3v15M10 21V4l10 4v13" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M2.5 21h19" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M13.5 10h3M13.5 13.5h3M13.5 17h3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  );
}
