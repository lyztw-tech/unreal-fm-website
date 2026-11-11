/**
 * 開頭飛行的 three.js 場景：程式生成的風格化示意大樓（不是業主的真實模型）。
 * 對外只有 createFlyScene(canvas)，回傳 setProgress(p 0~1)、resize()、dispose()。
 *
 * 時間軸（p）：
 *   0.00 開場遠景 → 0.22 資產（設備亮起＋光柱）→ 0.40 影像（透視＋監視器視角錐）
 *   → 0.58 能源（樓層熱力色＋逐層掃過）→ 0.76 維運（報修標記＋維修路線）
 *   → 0.94 現場部署（內網邊界＋資料線收到大樓裡的主機）
 */
import * as THREE from 'three';

export const STOPS = [0, 0.22, 0.4, 0.58, 0.76, 0.94];

const BG = 0x05080d;
const CYAN = new THREE.Color(0x33afd9);
const SLAB = new THREE.Color(0x173247);
const FLOOR_H = 4;

// 樓層：B3..B1、1F..10F；裙樓（B3–2F）較寬
const FLOORS = Array.from({ length: 13 }, (_, i) => {
  const level = i - 3; // -3..9
  const podium = level < 2;
  return {
    level,
    y: level * FLOOR_H,
    w: podium ? 34 : 26,
    d: podium ? 18 : 12,
    // 樓層用電強度（示意）：辦公樓層高、停車場低
    heat: level < 0 ? 0.15 + 0.08 * (level + 3) : level === 9 ? 0.95 : 0.45 + ((level * 37) % 10) / 22,
  };
});

/** 平滑：段內 0→1，兩端停留一下 */
function ease(u: number) {
  const v = Math.min(1, Math.max(0, (u - 0.12) / 0.76));
  return v * v * (3 - 2 * v);
}
/** p 靠近 center 時為 1，寬度 w 之外為 0 */
function bump(p: number, center: number, w = 0.09) {
  const d = Math.abs(p - center);
  if (d >= w) return 0;
  const t = 1 - d / w;
  return t * t * (3 - 2 * t);
}
function heatColor(h: number) {
  // 綠 → 黃 → 紅
  const c = new THREE.Color();
  if (h < 0.5) c.lerpColors(new THREE.Color(0x3ccf91), new THREE.Color(0xf2c94c), h / 0.5);
  else c.lerpColors(new THREE.Color(0xf2c94c), new THREE.Color(0xef5a5a), (h - 0.5) / 0.5);
  return c;
}

// 鏡頭關鍵點（位置、注視點），與 STOPS 對齊
const CAM: [THREE.Vector3, THREE.Vector3][] = [
  [new THREE.Vector3(-62, 46, 74), new THREE.Vector3(0, 13, 0)],
  [new THREE.Vector3(26, 16, 30), new THREE.Vector3(9, 9, 2)],
  [new THREE.Vector3(-46, 14, 44), new THREE.Vector3(0, -1, 0)],
  [new THREE.Vector3(6, 20, 78), new THREE.Vector3(0, 15, 0)],
  [new THREE.Vector3(-30, 30, 26), new THREE.Vector3(-8, 21, 1)],
  [new THREE.Vector3(70, 78, 70), new THREE.Vector3(0, 8, 0)],
];

/** centered：嵌在功能區的小場景用，場景置中、不讓位給文字；pull：鏡頭再退後的倍數 */
export function createFlyScene(
  canvas: HTMLCanvasElement,
  opts: { centered?: boolean; pull?: number; view?: { pos: [number, number, number]; tgt: [number, number, number] } } = {},
) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(BG, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(BG, 110, 260);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 600);

  // ── 地面：格線＋半透明地面（地下室隱約可見）
  const grid = new THREE.GridHelper(240, 60, 0x1d3346, 0x0f1c28);
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.7;
  scene.add(grid);
  const groundMat = new THREE.MeshBasicMaterial({ color: 0x08111a, transparent: true, opacity: 0.72, depthWrite: false });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.05;
  scene.add(ground);

  // ── 大樓：每層一片樓板＋發光邊線＋淡淡的玻璃外牆
  const slabMats: THREE.MeshBasicMaterial[] = [];
  const glassMats: THREE.MeshBasicMaterial[] = [];
  const edgeMats: THREE.LineBasicMaterial[] = [];
  const bldg = new THREE.Group();
  scene.add(bldg);
  for (const f of FLOORS) {
    const sm = new THREE.MeshBasicMaterial({ color: SLAB.clone(), transparent: true, opacity: 0.55, depthWrite: false });
    const slab = new THREE.Mesh(new THREE.BoxGeometry(f.w, 0.35, f.d), sm);
    slab.position.y = f.y;
    bldg.add(slab);
    slabMats.push(sm);

    const gm = new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.06, depthWrite: false, side: THREE.DoubleSide });
    const glass = new THREE.Mesh(new THREE.BoxGeometry(f.w - 0.2, FLOOR_H - 0.4, f.d - 0.2), gm);
    glass.position.y = f.y + FLOOR_H / 2;
    bldg.add(glass);
    glassMats.push(gm);

    const em = new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.55 });
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(f.w, FLOOR_H, f.d)), em);
    edges.position.y = f.y + FLOOR_H / 2;
    bldg.add(edges);
    edgeMats.push(em);
  }
  // 屋頂設備與樓梯核
  const coreMat = new THREE.MeshBasicMaterial({ color: 0x1e3a52, transparent: true, opacity: 0.6, depthWrite: false });
  const core = new THREE.Mesh(new THREE.BoxGeometry(5, FLOORS.length * FLOOR_H + 3, 4), coreMat);
  core.position.set(-6, (FLOORS[0].y + FLOORS[FLOORS.length - 1].y + FLOOR_H + 3) / 2, 0);
  bldg.add(core);

  // ── 設備：簡化的設備外型（空調箱、泵浦、配電盤、發電機、充電樁、感測器、電表、冷卻水塔）
  const devBody = new THREE.MeshBasicMaterial({ color: 0x6fc3e3, transparent: true, opacity: 0.92 });
  const devDark = new THREE.MeshBasicMaterial({ color: 0x2a6f8f, transparent: true, opacity: 0.95 });
  const devLine = new THREE.LineBasicMaterial({ color: 0xbfeaf8, transparent: true, opacity: 0.7 });
  const devices: THREE.Vector3[] = [];
  const rand = mulberry(7);

  const ROOF_Y = FLOORS[FLOORS.length - 1].y + FLOOR_H;
  const kinds: Record<string, string[]> = {
    basement: ['pump', 'generator', 'charger', 'panel', 'meter', 'pump'],
    podium: ['panel', 'ahu', 'sensor', 'meter', 'pump'],
    office: ['ahu', 'panel', 'sensor', 'meter', 'sensor'],
  };
  for (const f of FLOORS) {
    const list = f.level < 0 ? kinds.basement : f.level < 2 ? kinds.podium : kinds.office;
    const n = f.level < 2 ? 5 : 3;
    for (let k = 0; k < n; k++) {
      const kind = list[Math.floor(rand() * list.length)];
      let x = (rand() - 0.5) * (f.w - 5);
      const z = (rand() - 0.5) * (f.d - 4);
      // 3F 主角設備附近、6F 報修標記附近留空
      if (f.level === 2 && Math.abs(x - 9) < 3.5) x -= 7;
      if (f.level === 5 && Math.abs(x + 8) < 3.5) x += 7;
      const g = makeAsset(kind, devBody, devDark, devLine);
      // 感測器裝在天花板
      g.position.set(x, kind === 'sensor' ? f.y + FLOOR_H - 0.35 : f.y + 0.18, z);
      g.rotation.y = Math.floor(rand() * 4) * (Math.PI / 2);
      bldg.add(g);
      devices.push(new THREE.Vector3(x, g.position.y + 0.6, z));
    }
  }
  // 屋頂冷卻水塔
  for (const x of [4, 9]) {
    const g = makeAsset('tower', devBody, devDark, devLine);
    g.position.set(x, ROOF_Y + 0.18, -1);
    bldg.add(g);
    devices.push(new THREE.Vector3(x, ROOF_Y + 1, -1));
  }

  // ── 資產：主角設備（3F 空調箱）＋光柱＋地面光圈
  const heroPos = new THREE.Vector3(9, FLOOR_H * 2 + 0.18, 2);
  const heroMat = new THREE.MeshBasicMaterial({ color: 0x33afd9, transparent: true, opacity: 1 });
  const heroDark = new THREE.MeshBasicMaterial({ color: 0x1d6f93, transparent: true, opacity: 1 });
  const hero = makeAsset('ahu', heroMat, heroDark, devLine, 1.4);
  hero.position.copy(heroPos);
  scene.add(hero);
  const beamMat = new THREE.MeshBasicMaterial({ color: 0x7fd0ee, transparent: true, opacity: 0, depthWrite: false });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 60, 12, 1, true), beamMat);
  beam.position.set(heroPos.x, heroPos.y + 30, heroPos.z);
  scene.add(beam);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x7fd0ee, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.6, 2.0, 40), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(heroPos.x, heroPos.y + 0.02, heroPos.z);
  scene.add(ring);

  // ── 影像：監視器＋視角錐（1F 外圍與地下停車場）
  const camGroup = new THREE.Group();
  scene.add(camGroup);
  const coneMat = new THREE.MeshBasicMaterial({ color: 0x33afd9, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
  const coneLineMat = new THREE.LineBasicMaterial({ color: 0x7fd0ee, transparent: true, opacity: 0 });
  const camBodyMat = new THREE.MeshBasicMaterial({ color: 0xe8f6fc });
  const camDarkMat = new THREE.MeshBasicMaterial({ color: 0x1b2836 });
  const camLensMat = new THREE.MeshBasicMaterial({ color: 0x33afd9 });
  // 視野：四角錐（鏡頭看出去的矩形範圍），錐尖在原點、往 +z 張開
  const frustumGeo = new THREE.ConeGeometry(2.6, 7, 4, 1, true);
  frustumGeo.translate(0, -3.5, 0);
  frustumGeo.rotateY(Math.PI / 4);
  frustumGeo.rotateX(-Math.PI / 2);
  const frustumEdges = new THREE.EdgesGeometry(frustumGeo);
  const cones: THREE.Object3D[] = [];
  // [x, y（天花板下）, z, 朝向]
  const camSpots: [number, number, number, number][] = [
    [-15, 3.5, 8.6, 0.5], [0, 3.5, 8.6, 0], [15, 3.5, 8.6, -0.5], [-16.6, 3.5, -7, 2.2],
    [-15, -0.5, 7, 0.7], [14, -0.5, -7, 3.7], [12, -4.5, 7, -0.5], [-14, -8.5, -7, 2.4],
  ];
  for (const [x, y, z, jitter] of camSpots) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    // 裝在外牆邊、朝建物中心拍（本地 +z＝鏡頭方向），角度稍微錯開
    g.rotation.y = Math.atan2(-x, -z) + (jitter % 1) * 0.35;
    // 吊架：天花板座＋短臂
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.35), camDarkMat);
    base.position.y = 0.42;
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8), camDarkMat);
    arm.position.y = 0.2;
    g.add(base, arm);
    // 鏡頭本體：往前、略朝下
    const head = new THREE.Group();
    head.rotation.x = 0.42;
    const bodyGeo = new THREE.CylinderGeometry(0.2, 0.22, 0.95, 16);
    bodyGeo.rotateX(Math.PI / 2);
    const body = new THREE.Mesh(bodyGeo, camBodyMat);
    body.position.z = 0.3;
    const hood = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 1.05), camBodyMat);
    hood.position.set(0, 0.25, 0.38);
    const lensGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.04, 16);
    lensGeo.rotateX(Math.PI / 2);
    const lens = new THREE.Mesh(lensGeo, camLensMat);
    lens.position.z = 0.79;
    head.add(body, hood, lens);
    const fill = new THREE.Mesh(frustumGeo, coneMat);
    fill.position.z = 0.8;
    const edge = new THREE.LineSegments(frustumEdges, coneLineMat);
    edge.position.z = 0.8;
    head.add(fill, edge);
    cones.push(fill, edge);
    g.add(head);
    g.scale.setScalar(1.3);
    camGroup.add(g);
  }
  const coneVis = (v: boolean) => cones.forEach((c) => (c.visible = v));

  // ── 維運：報修標記（6F）＋維修路線
  const pinPos = new THREE.Vector3(-8, FLOOR_H * 5 + 0.5, 1);
  const pinMat = new THREE.MeshBasicMaterial({ color: 0xf2994a, transparent: true, opacity: 0 });
  const pin = new THREE.Group();
  const pinHead = new THREE.Mesh(new THREE.SphereGeometry(0.9, 20, 16), pinMat);
  pinHead.position.y = 3.2;
  const pinTip = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.2, 20), pinMat);
  pinTip.rotation.x = Math.PI;
  pinTip.position.y = 1.9;
  pin.add(pinHead, pinTip);
  pin.position.copy(pinPos);
  scene.add(pin);
  const pinRingMat = new THREE.MeshBasicMaterial({ color: 0xf2994a, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
  const pinRing = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.6, 40), pinRingMat);
  pinRing.rotation.x = -Math.PI / 2;
  pinRing.position.copy(pinPos).add(new THREE.Vector3(0, 0.05, 0));
  scene.add(pinRing);
  const routePts = [
    new THREE.Vector3(-6, pinPos.y + 0.1, -2.5),
    new THREE.Vector3(4, pinPos.y + 0.1, -2.5),
    new THREE.Vector3(4, pinPos.y + 0.1, 3),
    new THREE.Vector3(-8, pinPos.y + 0.1, 3),
    new THREE.Vector3(-8, pinPos.y + 0.1, 1.5),
  ];
  const routeMat = new THREE.LineDashedMaterial({ color: 0xf2c94c, dashSize: 0.8, gapSize: 0.5, transparent: true, opacity: 0 });
  const route = new THREE.Line(new THREE.BufferGeometry().setFromPoints(routePts), routeMat);
  route.computeLineDistances();
  scene.add(route);

  // ── 現場部署：大樓裡的主機＋內網邊界＋資料線
  const serverMat = new THREE.MeshBasicMaterial({ color: 0x3ccf91, transparent: true, opacity: 0 });
  const server = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.4, 1.4), serverMat);
  server.position.set(-2, 1.4, -4);
  scene.add(server);
  const fenceMat = new THREE.LineDashedMaterial({ color: 0x3ccf91, dashSize: 1.4, gapSize: 0.9, transparent: true, opacity: 0 });
  const fence = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(46, 60, 30)), fenceMat);
  fence.position.set(0, 18, 0);
  fence.computeLineDistances();
  scene.add(fence);
  const linkPts: THREE.Vector3[] = [];
  devices.forEach((d, i) => {
    if (i % 2 === 0) linkPts.push(d.clone(), server.position.clone());
  });
  const linkMat = new THREE.LineBasicMaterial({ color: 0x3ccf91, transparent: true, opacity: 0 });
  const links = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(linkPts), linkMat);
  scene.add(links);

  // ── 常駐氛圍特效（畫面不捲動時也有一點動態；系統設定「減少動態」時全部靜止）
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const additive = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending } as const;

  // 1) 漂浮光點：緩慢上升
  const MOTES = 420;
  const motePos = new Float32Array(MOTES * 3);
  const moteSpeed = new Float32Array(MOTES);
  const mr = mulberry(21);
  for (let i = 0; i < MOTES; i++) {
    motePos[i * 3] = (mr() - 0.5) * 90;
    motePos[i * 3 + 1] = -12 + mr() * 72;
    motePos[i * 3 + 2] = (mr() - 0.5) * 70;
    moteSpeed[i] = 0.4 + mr() * 1.1;
  }
  const moteGeo = new THREE.BufferGeometry();
  moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
  const moteMat = new THREE.PointsMaterial({ color: 0x7fd0ee, size: 0.28, opacity: 0.55, ...additive });
  scene.add(new THREE.Points(moteGeo, moteMat));

  // 2) 掃描光面：由地下往屋頂慢慢掃過
  const scanMat = new THREE.MeshBasicMaterial({ color: 0x33afd9, opacity: 0, side: THREE.DoubleSide, ...additive });
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(38, 22), scanMat);
  scan.rotation.x = -Math.PI / 2;
  scene.add(scan);
  const scanEdgeMat = new THREE.LineBasicMaterial({ color: 0x7fd0ee, opacity: 0, ...additive });
  const scanEdge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(38, 22)), scanEdgeMat);
  scanEdge.rotation.x = -Math.PI / 2;
  scene.add(scanEdge);

  // 3) 設備狀態燈：設備上方的小燈慢慢呼吸（多數綠、少數琥珀）
  const ledG: number[] = [];
  const ledY: number[] = [];
  devices.forEach((d, i) => (i % 9 === 4 ? ledY : ledG).push(d.x, d.y + 0.9, d.z));
  const ledGMat = new THREE.PointsMaterial({ color: 0x3ccf91, size: 0.55, opacity: 0.8, ...additive });
  const ledYMat = new THREE.PointsMaterial({ color: 0xf2c94c, size: 0.65, opacity: 0.8, ...additive });
  const ledGeoG = new THREE.BufferGeometry();
  ledGeoG.setAttribute('position', new THREE.Float32BufferAttribute(ledG, 3));
  const ledGeoY = new THREE.BufferGeometry();
  ledGeoY.setAttribute('position', new THREE.Float32BufferAttribute(ledY, 3));
  bldg.add(new THREE.Points(ledGeoG, ledGMat), new THREE.Points(ledGeoY, ledYMat));

  // 4) 資料流：沿管道間的直立線，光點往上跑
  const RISERS: [number, number][] = [
    [-3.2, 1.6],
    [-3.2, -1.6],
    [-8.8, 1.6],
  ];
  const riserTop = ROOF_Y + 2;
  const riserBot = FLOORS[0].y;
  const riserMat = new THREE.LineBasicMaterial({ color: 0x33afd9, opacity: 0.25, transparent: true });
  const riserPts: THREE.Vector3[] = [];
  RISERS.forEach(([x, z]) => riserPts.push(new THREE.Vector3(x, riserBot, z), new THREE.Vector3(x, riserTop, z)));
  scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(riserPts), riserMat));
  const PULSES = 4;
  const pulsePos = new Float32Array(RISERS.length * PULSES * 3);
  const pulseGeo = new THREE.BufferGeometry();
  pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePos, 3));
  const pulseMat = new THREE.PointsMaterial({ color: 0xbfeaf8, size: 0.9, opacity: 0.9, ...additive });
  scene.add(new THREE.Points(pulseGeo, pulseMat));

  let lastT = 0;
  function ambient(time: number, quiet: number) {
    const dt = Math.min(0.1, Math.max(0, time - lastT));
    lastT = time;
    // 光點上升
    for (let i = 0; i < MOTES; i++) {
      let y = motePos[i * 3 + 1] + moteSpeed[i] * dt;
      if (y > 60) y = -12;
      motePos[i * 3 + 1] = y;
    }
    moteGeo.attributes.position.needsUpdate = true;
    // 掃描：10 秒一輪，前 6 秒掃上去
    const sc = (time % 10) / 6;
    const sy = -12 + sc * 58;
    scan.position.y = scanEdge.position.y = sy;
    const sa = sc < 1 ? Math.sin(sc * Math.PI) : 0;
    scanMat.opacity = 0.07 * sa * quiet;
    scanEdgeMat.opacity = 0.5 * sa * quiet;
    scan.visible = scanEdge.visible = sa > 0.01 && quiet > 0.01;
    // 狀態燈呼吸
    ledGMat.opacity = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(time * 1.6));
    ledYMat.opacity = 0.3 + 0.6 * (0.5 + 0.5 * Math.sin(time * 3.2 + 1));
    // 資料流光點
    RISERS.forEach(([x, z], r) => {
      for (let k = 0; k < PULSES; k++) {
        const u = (time * 0.18 + k / PULSES + r * 0.13) % 1;
        const idx = (r * PULSES + k) * 3;
        pulsePos[idx] = x;
        pulsePos[idx + 1] = riserBot + u * (riserTop - riserBot);
        pulsePos[idx + 2] = z;
      }
    });
    pulseGeo.attributes.position.needsUpdate = true;
  }

  // ── 狀態
  let progress = 0;
  let w = 1;
  let h = 1;
  let raf = 0;
  let running = false;
  const t0 = performance.now();
  const pos = new THREE.Vector3();
  const tgt = new THREE.Vector3();

  function cameraAt(p: number) {
    let i = 0;
    while (i < STOPS.length - 2 && p > STOPS[i + 1]) i++;
    const u = ease((p - STOPS[i]) / (STOPS[i + 1] - STOPS[i]));
    const j = Math.min(i + 1, STOPS.length - 1);
    pos.lerpVectors(CAM[i][0], CAM[j][0], u);
    tgt.lerpVectors(CAM[i][1], CAM[j][1], u);
    // 拉高弧線：兩點中間往外、往上拱一點，飛起來不會直直穿過大樓
    const arc = Math.sin(u * Math.PI);
    pos.y += arc * 10;
    pos.multiplyScalar(1 + arc * 0.12);
    // 直式畫面窄：鏡頭沿視線往後退
    if (h > w) pos.sub(tgt).multiplyScalar(1.45).add(tgt);
    if (opts.pull) pos.sub(tgt).multiplyScalar(opts.pull).add(tgt);
    // 嵌入式小場景：固定鏡頭
    if (opts.view) {
      pos.set(...opts.view.pos);
      tgt.set(...opts.view.tgt);
    }
    // 鏡頭呼吸：緩慢的小幅漂移
    if (!reduceMotion) {
      const tt = (performance.now() - t0) / 1000;
      pos.x += Math.sin(tt * 0.23) * 1.4;
      pos.y += Math.sin(tt * 0.31) * 0.8;
      pos.z += Math.cos(tt * 0.19) * 1.4;
    }
    camera.position.copy(pos);
    camera.lookAt(tgt);
  }

  function frame() {
    const p = progress;
    const time = reduceMotion ? 0 : (performance.now() - t0) / 1000;
    const pulse = 0.5 + 0.5 * Math.sin(time * 3);

    const kAsset = bump(p, STOPS[1]);
    const kCam = bump(p, STOPS[2]);
    const kHeat = bump(p, STOPS[3], 0.1);
    const kMaint = bump(p, STOPS[4]);
    const kDeploy = Math.min(1, Math.max(0, (p - (STOPS[5] - 0.09)) / 0.09));

    // 透視（影像段）：外牆、樓板變淡
    const xray = kCam;
    glassMats.forEach((m) => (m.opacity = 0.06 * (1 - xray)));
    groundMat.opacity = 0.72 * (1 - 0.75 * Math.max(xray, kHeat * 0.3));

    // 樓板顏色：熱力圖（能源段）＋逐層掃過
    const sweep = Math.floor(((p - (STOPS[3] - 0.06)) / 0.12) * FLOORS.length);
    FLOORS.forEach((f, i) => {
      const m = slabMats[i];
      m.color.copy(SLAB).lerp(heatColor(f.heat), kHeat);
      const focus = kHeat > 0.3 && i === Math.min(FLOORS.length - 1, Math.max(0, sweep)) ? 0.35 : 0;
      m.opacity = (0.55 + kHeat * 0.3 + focus) * (1 - xray * 0.55);
      edgeMats[i].color.copy(CYAN).lerp(heatColor(f.heat), kHeat * 0.8);
      edgeMats[i].opacity = 0.55 * (1 - xray * 0.4) + focus;
    });
    coreMat.opacity = 0.6 * (1 - xray * 0.7);

    // 資產：主角設備亮起
    heroMat.color.set(0x33afd9).lerp(new THREE.Color(0xffffff), kAsset * pulse * 0.6);
    hero.scale.setScalar(1 + kAsset * 0.25 * pulse);
    beamMat.opacity = kAsset * 0.35;
    ringMat.opacity = kAsset * (0.9 - 0.5 * pulse);
    ring.scale.setScalar(1 + pulse * 0.8 * kAsset);

    // 影像：視角錐
    coneMat.opacity = kCam * 0.14;
    coneLineMat.opacity = kCam * 0.95;
    // 影像段：其他設備淡掉，只留監視器清楚
    const dim = 1 - 0.8 * kCam;
    devBody.opacity = 0.92 * dim;
    devDark.opacity = 0.95 * dim;
    devLine.opacity = 0.7 * dim;
    heroMat.opacity = heroDark.opacity = dim;
    camLensMat.color.set(0x33afd9).lerp(new THREE.Color(0xffffff), kCam * pulse * 0.6);

    // 維運：標記＋路線
    pinMat.opacity = kMaint;
    pin.position.y = pinPos.y + Math.sin(time * 2.5) * 0.3 * kMaint;
    pinRingMat.opacity = kMaint * (0.9 - 0.5 * pulse);
    pinRing.scale.setScalar(1 + pulse * kMaint);
    routeMat.opacity = kMaint;

    // 現場部署
    serverMat.opacity = kDeploy;
    fenceMat.opacity = kDeploy * 0.9;
    linkMat.opacity = kDeploy * (0.25 + 0.2 * pulse);

    // 用不到的效果直接隱藏（線條透明度 0 時仍會畫出黑線）
    beam.visible = ring.visible = kAsset > 0.01;
    coneVis(kCam > 0.01);
    pin.visible = pinRing.visible = route.visible = kMaint > 0.01;
    server.visible = fence.visible = links.visible = kDeploy > 0.01;

    // 常駐特效：在影像（透視）、能源（熱力）段收斂，不搶主角
    ambient(time, 1 - Math.max(kCam, kHeat) * 0.8);

    cameraAt(p);
    renderer.render(scene, camera);
  }

  function loop() {
    frame();
    raf = running ? requestAnimationFrame(loop) : 0;
  }

  function resize() {
    w = canvas.clientWidth || 1;
    h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // 橫式：場景中心放在畫面約 64% 處，左邊留給文字；直式：放在上半部
    if (opts.centered) {
      camera.fov = 42;
      camera.clearViewOffset();
    } else if (w >= h) {
      camera.fov = 42;
      camera.setViewOffset(w * 1.28, h, 0, 0, w, h);
    } else {
      camera.fov = 60;
      camera.setViewOffset(w, h * 1.4, 0, h * 0.4, w, h);
    }
    camera.updateProjectionMatrix();
    if (!running) frame();
  }

  resize();
  return {
    setProgress(p: number) {
      progress = p;
      if (!running) frame();
    },
    /** 在畫面內才持續動（脈動效果），不在畫面就停 */
    setRunning(on: boolean) {
      if (on === running) return;
      running = on;
      if (on) raf = requestAnimationFrame(loop);
      else if (raf) cancelAnimationFrame(raf);
    },
    resize,
    dispose() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose?.();
      });
      renderer.dispose();
    },
  };
}

/** 簡化設備外型：本體（亮）＋細部（暗）＋外框線。底部在 y=0。 */
function makeAsset(
  kind: string,
  body: THREE.Material,
  dark: THREE.Material,
  line: THREE.LineBasicMaterial,
  scale = 1,
) {
  const g = new THREE.Group();
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, rx = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, 0, rz);
    g.add(m);
    if (mat === body) {
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), line);
      e.position.copy(m.position);
      e.rotation.copy(m.rotation);
      g.add(e);
    }
  };
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r: number, h: number, s = 18) => new THREE.CylinderGeometry(r, r, h, s);
  switch (kind) {
    case 'ahu': // 空調箱：箱體＋正面百葉＋頂部兩組風扇（護網圈＋十字葉片）
      add(box(2.4, 1.1, 1.2), body, 0, 0.55, 0);
      for (let k = 0; k < 4; k++) add(box(1.9, 0.05, 0.03), dark, -0.1, 0.25 + k * 0.2, 0.61);
      for (const fx of [-0.6, 0.6]) {
        add(cyl(0.34, 0.03, 20), dark, fx, 1.115, 0);
        add(new THREE.TorusGeometry(0.36, 0.045, 8, 28), body, fx, 1.14, 0, Math.PI / 2, 0);
        add(box(0.62, 0.03, 0.07), body, fx, 1.15, 0);
        add(box(0.07, 0.03, 0.62), body, fx, 1.15, 0);
      }
      break;
    case 'pump': // 泵浦：底座＋馬達（橫圓柱）＋渦殼
      add(box(1.6, 0.18, 0.7), dark, 0, 0.09, 0);
      add(cyl(0.3, 0.9), body, -0.3, 0.5, 0, 0, Math.PI / 2);
      add(cyl(0.45, 0.35), body, 0.45, 0.55, 0, Math.PI / 2, 0);
      break;
    case 'panel': // 配電盤：高櫃＋門縫
      add(box(1.0, 1.9, 0.45), body, 0, 0.95, 0);
      add(box(0.04, 1.6, 0.47), dark, 0, 0.95, 0);
      add(box(0.8, 0.06, 0.47), dark, 0, 1.6, 0);
      break;
    case 'generator': // 發電機：長機體＋排氣管
      add(box(2.8, 1.2, 1.1), body, 0, 0.6, 0);
      add(box(0.6, 0.9, 1.0), dark, -1.1, 0.55, 0);
      add(cyl(0.12, 1.4, 10), dark, 0.9, 1.9, 0);
      break;
    case 'charger': // 充電樁：立柱＋螢幕＋槍座
      add(box(0.55, 1.7, 0.35), body, 0, 0.85, 0);
      add(box(0.36, 0.3, 0.05), dark, 0, 1.3, 0.19);
      add(box(0.15, 0.25, 0.15), dark, 0.2, 0.8, 0.22);
      break;
    case 'sensor': // 天花板感測器：小圓盤（倒掛）
      add(cyl(0.32, 0.12, 20), body, 0, 0, 0);
      add(cyl(0.12, 0.08, 12), dark, 0, -0.08, 0);
      break;
    case 'meter': // 電表／水錶：小箱＋圓錶面
      add(box(0.6, 0.8, 0.3), body, 0, 0.9, 0);
      add(cyl(0.18, 0.04, 16), dark, 0, 0.95, 0.17, Math.PI / 2, 0);
      break;
    case 'tower': // 冷卻水塔：圓桶＋頂部風扇罩
      add(cyl(1.1, 1.6, 22), body, 0, 0.8, 0);
      add(cyl(0.7, 0.4, 18), dark, 0, 1.8, 0);
      break;
    default:
      add(box(0.9, 0.9, 0.9), body, 0, 0.45, 0);
  }
  g.scale.setScalar(scale);
  return g;
}

function mulberry(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
