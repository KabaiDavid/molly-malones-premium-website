/*
 * The Bar — a physically based nonic pint of stout, rendered with Three.js.
 * Loaded lazily: nothing is fetched until the stage approaches the viewport.
 * Falls back silently to the photograph if WebGL or the CDN is unavailable.
 */
const stage = document.querySelector("[data-pint-stage]");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const lowPower = (navigator.hardwareConcurrency || 8) <= 2 || navigator.connection?.saveData;

if (stage && !lowPower) {
  const io = new IntersectionObserver((e) => {
    if (e[0].isIntersecting) { io.disconnect(); boot().catch(() => {}); }
  }, { rootMargin: "400px 0px" });
  io.observe(stage);
}

async function boot() {
  // "three" resolves through the page import map, so both modules share one instance.
  const T = await import("three");
  const { RoomEnvironment } = await import("three/addons/environments/RoomEnvironment.js");

  const canvas = document.createElement("canvas");
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", "A slowly turning pint of Irish stout with a creamy head");
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = T.SRGBColorSpace;

  const scene = new T.Scene();
  const pmrem = new T.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  scene.environmentIntensity = 0.45;

  const camera = new T.PerspectiveCamera(26, 1, 0.1, 100);
  camera.position.set(0, 2.1, 9.2);
  camera.lookAt(0, 1.45, 0);

  /* --- Lights: warm amber key, cool rim, brass bounce --- */
  const key = new T.DirectionalLight(0xffc27a, 2.4); key.position.set(-3, 5, 4); scene.add(key);
  const rim = new T.DirectionalLight(0xbfd8ff, 1.6); rim.position.set(4, 3, -4); scene.add(rim);
  const bounce = new T.PointLight(0xcfa968, 6, 6); bounce.position.set(1.4, 0.3, 1.6); scene.add(bounce);
  scene.add(new T.AmbientLight(0x2a1f17, 0.6));

  /* --- Nonic pint profile --- */
  const H = 3.0, BASE = 0.2, WALL = 0.035;
  const radius = (h) => {
    if (h < 0.05) return 0.6 + h * 0.8;
    if (h < 2.3) return 0.64 + (h / 2.3) * 0.16;
    if (h < 2.5) return 0.8 + Math.sin(((h - 2.3) / 0.2) * Math.PI / 2) * 0.075;   // the nonic bulge
    if (h < 2.72) return 0.875 - Math.sin(((h - 2.5) / 0.22) * Math.PI / 2) * 0.04;
    return 0.835 + ((h - 2.72) / 0.28) * 0.035;
  };
  const steps = 90;
  const outer = [], inner = [];
  for (let i = 0; i <= steps; i++) { const h = (i / steps) * H; outer.push(new T.Vector2(radius(h), h)); }
  for (let i = steps; i >= 0; i--) { const h = BASE + (i / steps) * (H - BASE); inner.push(new T.Vector2(Math.max(0.01, radius(h) - WALL), h)); }
  const glassPts = [new T.Vector2(0.0001, 0), ...outer, new T.Vector2(radius(H) - WALL / 2, H + 0.012), ...inner, new T.Vector2(0.0001, BASE)];
  const glass = new T.Mesh(
    new T.LatheGeometry(glassPts, 128),
    new T.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.03, transparent: true, opacity: 0.1, depthWrite: false, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.6, specularIntensity: 1, ior: 1.5 })
  );

  /* --- Stout body (dark ruby) --- */
  const FILL = 2.56, HEAD = 0.34;
  const beerPts = [new T.Vector2(0.0001, BASE + 0.002)];
  for (let i = 0; i <= 60; i++) { const h = BASE + 0.002 + (i / 60) * (FILL - BASE); beerPts.push(new T.Vector2(radius(h) - WALL - 0.004, h)); }
  beerPts.push(new T.Vector2(0.0001, FILL));
  const beer = new T.Mesh(new T.LatheGeometry(beerPts, 96), new T.MeshPhysicalMaterial({ color: 0x0c0302, roughness: 0.22, metalness: 0, clearcoat: 0.8, clearcoatRoughness: 0.1, sheen: 1, sheenRoughness: 0.5, sheenColor: new T.Color(0x6b1e0e), envMapIntensity: 0.8 }));

  /* --- Creamy head, gently domed --- */
  const headPts = [new T.Vector2(0.0001, FILL)];
  for (let i = 0; i <= 30; i++) { const h = FILL + (i / 30) * HEAD; headPts.push(new T.Vector2(radius(h) - WALL - 0.004, h)); }
  for (let i = 1; i <= 14; i++) { const t = i / 14; headPts.push(new T.Vector2((radius(FILL + HEAD) - WALL - 0.004) * Math.cos(t * Math.PI / 2), FILL + HEAD + Math.sin(t * Math.PI / 2) * 0.06)); }
  const headMat = new T.MeshStandardMaterial({ color: 0xeadcbc, roughness: 0.92, metalness: 0 });
  const head = new T.Mesh(new T.LatheGeometry(headPts, 96), headMat);

  /* --- Surge: tiny bubbles cascading down the glass wall as the pint settles --- */
  const N = 420, pos = new Float32Array(N * 3), seed = new Float32Array(N);
  for (let i = 0; i < N; i++) { seed[i] = Math.random(); const a = Math.random() * Math.PI * 2, h = BASE + Math.random() * (FILL - BASE); const r = radius(h) - WALL - 0.02 - Math.random() * 0.05; pos.set([Math.cos(a) * r, h, Math.sin(a) * r], i * 3); }
  const bubbleGeo = new T.BufferGeometry(); bubbleGeo.setAttribute("position", new T.BufferAttribute(pos, 3));
  const bubbles = new T.Points(bubbleGeo, new T.PointsMaterial({ color: 0xc9a27a, size: 0.018, transparent: true, opacity: 0.55, depthWrite: false }));

  /* --- Oak coaster + soft contact shadow --- */
  const coaster = new T.Mesh(new T.CylinderGeometry(1.15, 1.15, 0.05, 96), new T.MeshStandardMaterial({ color: 0x1a0f09, roughness: 0.7, metalness: 0 }));
  coaster.position.y = -0.026;
  const ring = new T.Mesh(new T.TorusGeometry(1.15, 0.012, 12, 128), new T.MeshStandardMaterial({ color: 0xcfa968, roughness: 0.25, metalness: 1 }));
  ring.rotation.x = Math.PI / 2;
  const sh = document.createElement("canvas"); sh.width = sh.height = 128;
  const g = sh.getContext("2d"); const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64); grd.addColorStop(0, "rgba(0,0,0,.55)"); grd.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
  const shadow = new T.Mesh(new T.PlaneGeometry(4.2, 4.2), new T.MeshBasicMaterial({ map: new T.CanvasTexture(sh), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -0.055;

  glass.renderOrder = 2;
  const lip = new T.Mesh(new T.TorusGeometry(radius(H) - WALL / 2, 0.016, 12, 128), new T.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.02, transparent: true, opacity: 0.55, clearcoat: 1, envMapIntensity: 3 }));
  lip.rotation.x = Math.PI / 2; lip.position.y = H + 0.006;
  const pint = new T.Group(); pint.add(beer, head, bubbles, glass, lip);
  const rig = new T.Group(); rig.add(shadow, coaster, ring, pint);
  scene.add(rig);

  /* --- Size & interaction --- */
  stage.prepend(canvas);
  const resize = () => { const w = stage.clientWidth, h = stage.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  resize();
  new ResizeObserver(resize).observe(stage);

  let tx = 0, ty = 0, cx = 0, cy = 0;
  stage.addEventListener("pointermove", (e) => { const r = stage.getBoundingClientRect(); tx = ((e.clientX - r.left) / r.width - 0.5) * 2; ty = ((e.clientY - r.top) / r.height - 0.5) * 2; });
  stage.addEventListener("pointerleave", () => { tx = ty = 0; });

  let visible = true, raf = 0;
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; if (visible && !raf && !reduce) raf = requestAnimationFrame(loop); }).observe(stage);

  const clock = new T.Clock();
  const settle = 7; // seconds of surge
  function frame(t) {
    cx += (tx - cx) * 0.05; cy += (ty - cy) * 0.05;
    rig.rotation.y = Math.sin(t * 0.25) * 0.5 + cx * 0.35;
    rig.rotation.x = cy * 0.06;
    pint.position.y = Math.sin(t * 0.9) * 0.025;
    // Surge: bubbles drift downward along the wall, fading as the pint settles
    const p = bubbleGeo.attributes.position.array, k = Math.max(0, 1 - t / settle);
    for (let i = 0; i < N; i++) {
      let y = p[i * 3 + 1] - (0.004 + seed[i] * 0.006);
      if (y < BASE + 0.02) y = FILL - 0.02;
      const r = radius(y) - WALL - 0.02 - seed[i] * 0.05, a = Math.atan2(p[i * 3 + 2], p[i * 3]);
      p[i * 3] = Math.cos(a) * r; p[i * 3 + 1] = y; p[i * 3 + 2] = Math.sin(a) * r;
    }
    bubbleGeo.attributes.position.needsUpdate = true;
    bubbles.material.opacity = 0.08 + 0.5 * k;
    renderer.render(scene, camera);
  }
  function loop() {
    raf = 0;
    if (!visible) return;
    frame(clock.getElapsedTime());
    raf = requestAnimationFrame(loop);
  }
  if (reduce) { frame(settle + 1); } else loop();
  requestAnimationFrame(() => stage.classList.add("has-3d"));
}
