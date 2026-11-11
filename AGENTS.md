# unreal-fm-website

智慧建築維運平台（unreal-fm：UE 桌面程式＋MyProject2-BE 後端）的宣傳官網。純靜態 Next.js 16，繁體中文，版面沿用 Nexa 官網（nexa-erp-website）骨架。

- 文案只寫系統現在真的有的功能，依據見 `docs/feature-copy.md`；新增功能文案前先對照產品實際行為。規劃中的功能只放「產品藍圖」並標「規劃中」。
- 產品畫面一律用網頁畫（`src/components/mock-ui.tsx`、`mock-more.tsx`），不放系統截圖；欄位與文字照 UE 系統，數字是示範資料。3D 部分用 `fly-scene.ts` 的示意大樓（不放業主真實模型）。案場名稱／地址／案號、真人姓名、真實攝影機影像都不能出現在網站上。
- 品質閘門：`npx tsc --noEmit`、`npx eslint src/`、`npm run build` 都要過；改視覺要用無頭 Chrome 截整頁（桌機 1440、手機 390、深淺色）實際看過。
- 進度／決策記在本 repo（`PROGRESS.md`、`docs/`），不要寫進 UE 或後端 repo。
