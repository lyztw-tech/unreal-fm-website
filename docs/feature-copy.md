# feature-copy.md — 文案對照（只寫已上線的功能）

| 區塊 | 官網寫法 | 產品依據 |
| --- | --- | --- |
| 首頁總覽 | 資產五態、系統可用率、報修／保養待辦、影像縮圖，點格子跳清單 | HUD 首頁、WBP_HealthOverview、StatCell CellNavKey |
| 資產管理 | 樓層／狀態／類別篩選、鏡頭飛到設備並高亮、四個面板分頁、四維度狀態、7 天狀態歷史 | WBP_EQAssetList、CameraFlyTo、WBP_SpaceAsset、condition.py、history.py |
| 告警清單 | 只列告警中設備、解除自動移出、可建報修／保養 | WBP_AlarmBoard、模擬器自動銷單 |
| 影像監控 | 透視顯示位置與視角、監視牆、單一畫面、獨立視窗、HLS 帳密留後端、有人看才連線 | /cameras 代理、GI CamStreamTick |
| 報修管理 | 綁設備或空間、三種狀態分列、時間軸（狀態、留言、照片）、寫入履歷 | /workorders、空工單選空間 |
| 預防保養 | 安裝日／保固／上次保養／週期、即將到期與逾期、首頁到期數 | /maintenance |
| 手機出勤 | 出勤從報修／保養建立、連結＋QR、位置圖與近景、離線佇列、問題回報、待複查 | /visits、static/m.html |
| 能源永續 | 需量分級、5 種用電異常、分項與樓層排行、3D 熱力圖、用水漏水、充電樁、營運碳排 | power.py、energy.py、carbon |
| 環境監測 | 溫濕度、CO₂、PM2.5，A～D 分級（智慧建築標章健康舒適指標），趨勢與事件，持續才觸發 | environment.py |
| 現場部署 | 裝在案場主機、內網運作、資料不上外部雲端、攝影機帳密只在後端、資料庫只開本機、每日備份＋NAS、資料不設保留期限 | docker-compose（db 綁 127.0.0.1）、啟動系統.bat、scripts/backup.sh、sync-backup-to-nas.ps1；後端唯一對外連線是攝影機代理 |

**不要寫：**
- 登入／權限控管、資料加密、資安認證（UE 連後端目前沒有登入）
- 綠能・儲能（產品裡是即將推出）
- 告警確認流程（系統沒有）
- 電表離線處理（第二階段，未做）
- MQTT 真實設備整合（還在討論）
- 網頁版前端
