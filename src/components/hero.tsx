/** 飛行導覽之後的三個數字（大標題已移到 fly-intro 第一段）。 */
export function Hero() {
  return (
    <section className="hero hero-stats">
      <div className="wrap">
        <div className="stats">
          <div className="stat">
            <b>
              6<em>大模組</em>
            </b>
            <span>資產、告警、影像、維運、能源、環境</span>
          </div>
          <div className="stat">
            <b>
              3D<em>定位</em>
            </b>
            <span>點設備，鏡頭飛到它在哪裡</span>
          </div>
          <div className="stat">
            <b>
              內網<em>部署</em>
            </b>
            <span>系統裝在案場，資料不出大樓</span>
          </div>
        </div>
        <p className="stats-proof">
          本頁畫面擷取自實際運行的展示環境；能源與環境數值為示意資料，案場名稱已隱藏。
        </p>
      </div>
    </section>
  );
}
