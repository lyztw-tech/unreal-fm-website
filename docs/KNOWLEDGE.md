# KNOWLEDGE.md — 坑與做法

> 最新的放最上面。

## 開頭飛行（three.js，2026-11-11 起）

- 場景在 `src/components/fly-scene.ts`，程式生成，沒有模型檔。時間軸 `STOPS`（0、0.22、0.40、0.58、0.76、0.94）同時決定鏡頭停點與各段效果；`fly-intro.tsx` 也有一份 STOPS（避免提前載入 three），兩邊要一起改。
- 鏡頭關鍵點在 `CAM`；兩點之間走拱形路線，不會直直穿過大樓。橫式畫面用 `setViewOffset` 把場景中心放在約 64% 寬，左邊留給文字；直式畫面把場景放在上半部，FOV 加大、鏡頭後退 1.45 倍。
- 場景程式是動態載入，不擋首屏；不在畫面內就停止動畫迴圈。
- 無頭 Chrome 截圖要加 `--use-angle=swiftshader --enable-unsafe-swiftshader`，WebGL 才會出來。
