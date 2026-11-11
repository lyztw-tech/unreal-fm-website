# PROGRESS.md — 目前進度

> 智慧建築維運平台（unreal-fm）宣傳官網。產品本身的進度記在 UE repo（unreal-fm）與後端 repo（unreal-fm-be）；本檔只記官網自己的事。

## 最後更新
- 日期：2026-11-11
- 摘要：上線到 GitHub Pages 專案頁 https://lyztw-tech.github.io/unreal-fm-website/ 。開頭 three.js 捲動飛行＋氛圍特效；功能區產品畫面全部網頁畫（不放截圖）。

## 下一步
- [ ] DNS：`about.fm.lyztw.com` CNAME → `lyztw-tech.github.io`
- [ ] DNS 生效後換自訂網域（下面四步）
- [ ] 正式 logo（目前是 `src/components/mark.tsx` 的 SVG 示意標記）

### 換成自訂網域 about.fm.lyztw.com
1. 新增 `public/CNAME`，內容一行：`about.fm.lyztw.com`
2. `.github/workflows/deploy.yml`：刪掉 `NEXT_PUBLIC_BASE_PATH` 那行，`NEXT_PUBLIC_SITE_ORIGIN` 改成 `https://about.fm.lyztw.com`
3. push 到 main（會自動重新部署）
4. repo Settings → Pages → Custom domain 填 `about.fm.lyztw.com`，等憑證好了勾 Enforce HTTPS

## 待釐清
- 預約展示的收件信箱目前比照 Nexa 用 dev@lyztw.com
