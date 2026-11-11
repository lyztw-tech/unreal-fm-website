# unreal-fm-website — 智慧建築維運平台宣傳官網

單頁靜態網站（Next.js 16 App Router、`output: 'export'`），部署到 GitHub Pages：目前在 https://lyztw-tech.github.io/unreal-fm-website/ ，之後換自訂網域 `about.fm.lyztw.com`（步驟見 PROGRESS.md）。

## 結構

開頭捲動飛行（three.js 示意大樓，6 段介紹）→ 三個數字 → 設施營運（首頁總覽／資產管理／告警清單／影像監控）→ 維運作業（報修／預防保養／手機出勤）→ 能源與環境（能源永續／環境監測）→ 產品藍圖 → 預約展示 → 頁尾。

每個功能是一列「圖庫＋文字」（`FeatureRow` + `Gallery`），圖庫可切頁籤、點圖放大。深淺色主題切換記在 `localStorage('fm-theme')`。

## 本機

```bash
npm install
npm run dev -- -p 3600
```

建置與檢查：

```bash
npx tsc --noEmit && npx eslint src/ && npm run build
```

## 部署

push 到 `main` → `.github/workflows/deploy.yml` 建置並發布到 GitHub Pages（repo Settings → Pages → Source 選 GitHub Actions）。

## 產品畫面

不放系統截圖，全部用網頁畫（`src/components/mock-ui.tsx`、`mock-more.tsx`），3D 用 `fly-scene.ts` 的示意大樓。
