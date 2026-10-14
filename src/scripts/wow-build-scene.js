// Wow A: a conservatory assembles itself in one clean move (~2.6s): dwarf wall + frame, windows,
// French doors, then the Leka solid roof lands. Four parts = the four services in the list beside it.
// Loaded on idle via dynamic import; renders on demand; disposed on page leave.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const easeOut = (t) => 1 - Math.pow(1 - t, 4);

const brickTexture = (THREE_, base, mortar) => {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = mortar; g.fillRect(0, 0, 256, 128);
  const bw = 32, bh = 16;
  for (let r = 0; r < 8; r++) for (let i = -1; i < 9; i++) {
    const x = i * bw + (r % 2 ? bw / 2 : 0);
    const shade = (Math.sin(r * 12.9 + i * 78.2) * 43758.5453) % 1;
    g.fillStyle = base; g.globalAlpha = 0.86 + Math.abs(shade) * 0.14;
    g.fillRect(x + 1.5, r * bh + 1.5, bw - 3, bh - 3);
  }
  g.globalAlpha = 1;
  const t = new THREE_.CanvasTexture(c); t.colorSpace = THREE_.SRGBColorSpace; t.wrapS = t.wrapT = THREE_.RepeatWrapping; t.anisotropy = 4;
  return t;
};
const tileTexture = (THREE_) => {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#2f2c35'; g.fillRect(0, 0, 256, 256);
  const th = 21, tw = 32;
  for (let r = 0; r < 13; r++) for (let i = -1; i < 9; i++) {
    const x = i * tw + (r % 2 ? tw / 2 : 0);
    const grad = g.createLinearGradient(0, r * th, 0, r * th + th);
    grad.addColorStop(0, '#57535f'); grad.addColorStop(1, '#423f4a');
    g.fillStyle = grad; g.fillRect(x + 1, r * th + 1, tw - 2, th - 3);
  }
  const t = new THREE_.CanvasTexture(c); t.colorSpace = THREE_.SRGBColorSpace; t.wrapS = t.wrapT = THREE_.RepeatWrapping; t.anisotropy = 4;
  return t;
};

export function createScene(canvas, { onPins, mobile = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.25 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envRT.texture;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  const target = new THREE.Vector3(0.1, 1.5, 1.35);

  // lights
  scene.add(new THREE.HemisphereLight(0xece4ff, 0x2a1030, 0.7));
  const key = new THREE.DirectionalLight(0xfff1e2, 2.4);
  key.position.set(5, 8, 7); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 30 });
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xb48ad0, 1.3); rim.position.set(-6, 4, -3); scene.add(rim);

  // materials
  const disposables = [envRT, pmrem];
  const track = (o) => { disposables.push(o); return o; };
  const brickMap = track(brickTexture(THREE, '#9b5a48', '#d8cfc6')); brickMap.repeat.set(1.2, 0.5);
  const houseMap = track(brickTexture(THREE, '#ffffff', '#d9d0dc')); houseMap.repeat.set(2.4, 2.2);
  const tiles = track(tileTexture(THREE)); tiles.repeat.set(2.4, 1.6);
  const mk = {
    white: () => track(new THREE.MeshStandardMaterial({ color: 0xf3f3f6, roughness: 0.42, metalness: 0.02 })),
    glass: () => track(new THREE.MeshStandardMaterial({ color: 0xbfdde9, roughness: 0.04, metalness: 0.35, transparent: true, opacity: 0.3, depthWrite: false, envMapIntensity: 1.4 })),
    brick: () => track(new THREE.MeshStandardMaterial({ color: 0xffffff, map: brickMap, roughness: 0.85 })),
    tile: () => track(new THREE.MeshStandardMaterial({ color: 0xffffff, map: tiles, roughness: 0.7, side: THREE.DoubleSide })),
    dark: () => track(new THREE.MeshStandardMaterial({ color: 0x2b2430, roughness: 0.3, metalness: 0.6 })),
    roofGlass: () => track(new THREE.MeshStandardMaterial({ color: 0x8fb6c8, roughness: 0.05, metalness: 0.6, envMapIntensity: 1.6 })),
  };
  const box = (w, h, d, mat, x, y, z) => {
    const m = new THREE.Mesh(track(new THREE.BoxGeometry(w, h, d)), mat);
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m;
  };

  // static context: house wall + ground shadow
  const house = new THREE.Group();
  house.add(box(6.2, 3.9, 0.3, track(new THREE.MeshStandardMaterial({ color: 0x3a2440, map: houseMap, roughness: 0.95 })), 0, 1.95, -0.15));
  house.add(box(6.4, 0.14, 0.42, track(new THREE.MeshStandardMaterial({ color: 0xe9e6ee, roughness: 0.6 })), 0, 3.95, -0.1));
  const ground = new THREE.Mesh(track(new THREE.PlaneGeometry(16, 16)), track(new THREE.ShadowMaterial({ opacity: 0.35 })));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
  scene.add(house, ground);

  const W = 1.8, D = 2.6, WALL = 0.6, TOP = 2.36, DOOR = 0.75, T = 0.07;
  const parts = {};
  const mkPart = (key) => { const g = new THREE.Group(); g.userData = { key, mats: [] }; parts[key] = g; scene.add(g); return g; };
  const use = (part, mat) => { part.userData.mats.push(mat); return mat; };

  // 03 Conservatories: dwarf wall, posts, ring beam
  const cons = mkPart('conservatories');
  const brick = use(cons, mk.brick()), white3 = use(cons, mk.white());
  cons.add(box(0.22, WALL, D, brick, -W, WALL / 2, D / 2));
  cons.add(box(0.22, WALL, D, brick, W, WALL / 2, D / 2));
  cons.add(box(W - DOOR + 0.11, WALL, 0.22, brick, -(W + DOOR) / 2 - 0.055, WALL / 2, D));
  cons.add(box(W - DOOR + 0.11, WALL, 0.22, brick, (W + DOOR) / 2 + 0.055, WALL / 2, D));
  const sill = (x, z, w, d) => cons.add(box(w, 0.05, d, white3, x, WALL + 0.025, z));
  sill(-W, D / 2, 0.3, D + 0.08); sill(W, D / 2, 0.3, D + 0.08);
  sill(-(W + DOOR) / 2 - 0.055, D, W - DOOR + 0.2, 0.3); sill((W + DOOR) / 2 + 0.055, D, W - DOOR + 0.2, 0.3);
  for (const [x, z, y0] of [[-W, D, WALL], [W, D, WALL], [-DOOR, D, 0], [DOOR, D, 0], [-W, 0.05, WALL], [W, 0.05, WALL], [-W, D / 2, WALL], [W, D / 2, WALL]]) {
    cons.add(box(0.1, TOP - y0, 0.1, white3, x, (TOP + y0) / 2, z));
  }
  cons.add(box(2 * W + 0.16, 0.13, 0.16, white3, 0, TOP + 0.065, D));
  cons.add(box(0.16, 0.13, D, white3, -W, TOP + 0.065, D / 2));
  cons.add(box(0.16, 0.13, D, white3, W, TOP + 0.065, D / 2));

  // 01 Windows: six units between the posts, each with a top-light transom
  const win = mkPart('windows');
  const white1 = use(win, mk.white()), glass1 = use(win, mk.glass());
  const unit = (cx, cz, span, axis) => {
    const g = new THREE.Group();
    const y0 = WALL + 0.05, y1 = TOP, h = y1 - y0, cy = (y0 + y1) / 2;
    const along = (len, thick, h2, y) => axis === 'x' ? box(len, h2, thick, white1, 0, y, 0) : box(thick, h2, len, white1, 0, y, 0);
    g.add(along(span, 0.08, T, y0 + T / 2), along(span, 0.08, T, y1 - T / 2), along(span, 0.08, 0.06, y0 + h * 0.74));
    const mull = (o) => { const m = axis === 'x' ? box(T, h, 0.08, white1, o, cy, 0) : box(0.08, h, T, white1, 0, cy, o); g.add(m); };
    mull(-span / 2 + T / 2); mull(span / 2 - T / 2); mull(0);
    const gl = new THREE.Mesh(track(new THREE.PlaneGeometry(span - 0.1, h - 0.1)), glass1);
    gl.position.set(0, cy, 0); if (axis === 'z') gl.rotation.y = Math.PI / 2; g.add(gl);
    g.position.set(cx, 0, cz); win.add(g);
  };
  unit(-(W + DOOR) / 2, D, W - DOOR - 0.1, 'x'); unit((W + DOOR) / 2, D, W - DOOR - 0.1, 'x');
  unit(-W, D * 0.25 + 0.02, D / 2 - 0.12, 'z'); unit(-W, D * 0.75, D / 2 - 0.12, 'z');
  unit(W, D * 0.25 + 0.02, D / 2 - 0.12, 'z'); unit(W, D * 0.75, D / 2 - 0.12, 'z');

  // 02 Doors: French doors, solid lower panels, handles
  const doors = mkPart('doors');
  const white2 = use(doors, mk.white()), glass2 = use(doors, mk.glass()), dark2 = use(doors, mk.dark());
  const leaf = (sx) => {
    const g = new THREE.Group(); const w = DOOR - 0.06, h = TOP - 0.04;
    g.add(box(w, 0.09, 0.09, white2, 0, 0.045, 0), box(w, 0.09, 0.09, white2, 0, h - 0.045, 0));
    g.add(box(0.09, h, 0.09, white2, -w / 2 + 0.045, h / 2, 0), box(0.09, h, 0.09, white2, w / 2 - 0.045, h / 2, 0));
    g.add(box(w - 0.1, 0.55, 0.05, white2, 0, 0.36, 0), box(w - 0.1, 0.07, 0.08, white2, 0, 0.66, 0));
    const gl = new THREE.Mesh(track(new THREE.PlaneGeometry(w - 0.14, h - 0.78)), glass2); gl.position.set(0, (0.7 + h - 0.09) / 2, 0); g.add(gl);
    const hd = box(0.03, 0.2, 0.05, dark2, sx * (w / 2 - 0.13), 1.0, 0.06); g.add(hd);
    g.position.set(-sx * (DOOR / 2 - 0.01) + 0, 0, D); return g;
  };
  doors.add(leaf(1), leaf(-1));
  doors.add(box(DOOR * 2 + 0.1, 0.03, 0.3, white2, 0, 0.015, D));

  // 04 Leka Roofs: hipped lean-to solid roof with a roof window, fascia and gutter
  const leka = mkPart('leka');
  const tileMat = use(leka, mk.tile()), white4 = use(leka, mk.white()), rg = use(leka, mk.roofGlass());
  const E = 1.98, Y0 = TOP + 0.13, Y1 = 3.3, Z1 = D + 0.14, A = 1.15;
  const geo = new THREE.BufferGeometry();
  const P = [
    -E, Y0, Z1, E, Y0, Z1, A, Y1, 0.02, -E, Y0, Z1, A, Y1, 0.02, -A, Y1, 0.02, // front slope
    -E, Y0, Z1, -A, Y1, 0.02, -E, Y0, 0.02, // left hip
    E, Y0, Z1, E, Y0, 0.02, A, Y1, 0.02, // right hip
  ];
  const uvs = [0, 0, 1, 0, 0.8, 1, 0, 0, 0.8, 1, 0.2, 1, 1, 0, 0.7, 1, 0, 0, 0, 0, 1, 0, 0.3, 1];
  geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.computeVertexNormals(); track(geo);
  const roof = new THREE.Mesh(geo, tileMat); roof.castShadow = true; roof.receiveShadow = true; leka.add(roof);
  const slope = Math.atan2(Y1 - Y0, Z1);
  const rl = box(0.9, 0.05, 0.75, white4, 0, (Y0 + Y1) / 2 + 0.03, Z1 / 2); rl.rotation.x = slope; leka.add(rl);
  const rlg = box(0.78, 0.03, 0.63, rg, 0, (Y0 + Y1) / 2 + 0.05, Z1 / 2); rlg.rotation.x = slope; leka.add(rlg);
  leka.add(box(2 * E + 0.04, 0.16, 0.05, white4, 0, Y0 - 0.02, Z1 + 0.02));
  leka.add(box(0.05, 0.16, Z1, white4, -E - 0.02, Y0 - 0.02, Z1 / 2), box(0.05, 0.16, Z1, white4, E + 0.02, Y0 - 0.02, Z1 / 2));
  const gut = new THREE.Mesh(track(new THREE.CylinderGeometry(0.06, 0.06, 2 * E + 0.1, 12, 1, true, 0, Math.PI)), white4);
  gut.rotation.z = Math.PI / 2; gut.rotation.y = Math.PI; gut.position.set(0, Y0 - 0.08, Z1 + 0.09); leka.add(gut);
  leka.add(box(2 * A + 0.1, 0.08, 0.12, white4, 0, Y1 + 0.02, 0.05));

  scene.traverse((o) => { if (o.isMesh && o.material?.transparent && o.material.opacity < 1) o.castShadow = false; });

  // ---- assembly timeline (all parts together, short stagger) ----
  const order = [
    { key: 'conservatories', delay: 0, from: { y: -0.7 } },
    { key: 'windows', delay: 0.16, from: { y: 0.0, spread: 0.8 } },
    { key: 'doors', delay: 0.3, from: { z: 1.3 } },
    { key: 'leka', delay: 0.46, from: { y: 1.7 } },
  ];
  const DUR = 1.45;
  const total = order[order.length - 1].delay + DUR;
  // windows spread outward from the building centre
  parts.windows.children.forEach((u) => { u.userData.base = u.position.clone(); });
  const baseGlass = new Map();
  for (const p of Object.values(parts)) for (const m of p.userData.mats) baseGlass.set(m, { op: m.opacity, tr: m.transparent });

  const setPart = (o, t) => {
    const p = parts[o.key]; const e = easeOut(Math.min(1, Math.max(0, t)));
    p.position.set(0, (o.from.y || 0) * (1 - e), (o.from.z || 0) * (1 - e));
    if (o.from.spread) p.children.forEach((u) => {
      const b = u.userData.base; const dir = new THREE.Vector3(b.x, 0, b.z - D / 2).normalize();
      u.position.copy(b).addScaledVector(dir, o.from.spread * (1 - e));
    });
    for (const m of p.userData.mats) {
      const base = baseGlass.get(m);
      const vis = Math.min(1, Math.max(0, t * 1.8));
      if (vis >= 1) { m.opacity = base.op; m.transparent = base.tr; m.depthWrite = !base.tr; }
      else { m.transparent = true; m.opacity = base.op * vis; m.depthWrite = false; }
      m.needsUpdate = true;
    }
    p.visible = t > 0;
  };
  const camFrom = { az: -0.62, el: 0.32, dist: 1.12 }, camTo = { az: -0.5, el: 0.36, dist: 1 };
  let baseDist = 10;
  const setCamera = (k) => {
    const e = easeOut(k);
    const az = camFrom.az + (camTo.az - camFrom.az) * e;
    const el = camFrom.el + (camTo.el - camFrom.el) * e;
    const d = baseDist * (camFrom.dist + (camTo.dist - camFrom.dist) * e);
    camera.position.set(target.x - Math.sin(az) * Math.cos(el) * d, target.y + Math.sin(el) * d, target.z + Math.cos(az) * Math.cos(el) * d);
    camera.lookAt(target);
  };
  let progress = 0; // seconds
  const apply = () => {
    for (const o of order) setPart(o, (progress - o.delay) / DUR);
    setCamera(Math.min(1, progress / (total + 0.2)));
  };

  // ---- pins: anchor points projected to the canvas each render ----
  const anchors = {
    windows: new THREE.Vector3(-W, 1.6, D * 0.75),
    doors: new THREE.Vector3(0, 1.25, D + 0.05),
    conservatories: new THREE.Vector3(W * 0.62, 0.32, D + 0.12),
    leka: new THREE.Vector3(-0.9, 2.95, 1.1),
  };
  const v = new THREE.Vector3();
  const project = () => {
    const out = {};
    const w = canvas.clientWidth, h = canvas.clientHeight;
    for (const [k, a] of Object.entries(anchors)) { v.copy(a).project(camera); out[k] = { x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h }; }
    return out;
  };

  // ---- highlight ----
  let hi = null;
  const highlight = (key) => {
    hi = key;
    for (const p of Object.values(parts)) for (const m of p.userData.mats) {
      if (!m.emissive) continue;
      const on = p.userData.key === key;
      m.emissive.set(on ? 0x6fb6d0 : 0x000000); m.emissiveIntensity = on ? 0.38 : 0;
    }
    render();
  };

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const r = 3.05; // bounding radius of the build
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
    baseDist = r / Math.sin(Math.min(vFov, hFov) / 2);
    camera.updateProjectionMatrix();
    apply(); render();
  };
  function render() {
    renderer.render(scene, camera);
    onPins?.(project());
  }

  // ---- playback ----
  let raf = 0, last = 0, playing = false, done = false;
  const tick = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    progress = Math.min(total + 0.2, progress + dt);
    apply(); render();
    if (progress >= total + 0.2) { playing = false; done = true; api.onDone?.(); return; }
    raf = requestAnimationFrame(tick);
  };
  const api = {
    total,
    play() { if (playing || done) return; playing = true; last = performance.now(); raf = requestAnimationFrame(tick); },
    pause() { if (!playing) return; playing = false; cancelAnimationFrame(raf); },
    replay() { cancelAnimationFrame(raf); playing = false; done = false; progress = 0; highlight(null); api.play(); },
    finish() { cancelAnimationFrame(raf); playing = false; progress = total + 0.2; apply(); render(); done = true; api.onDone?.(); },
    reset() { progress = 0; apply(); render(); },
    get done() { return done; },
    highlight, resize, render,
    compile() { apply(); renderer.compile(scene, camera); },
    dispose() {
      cancelAnimationFrame(raf);
      scene.traverse((o) => { if (o.isMesh) o.geometry?.dispose(); });
      for (const d of disposables) d.dispose?.();
      renderer.dispose(); renderer.forceContextLoss?.();
    },
    onDone: null,
  };
  resize();
  return api;
}
