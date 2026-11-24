/*
 * The Pour — WebGL scene.
 *
 * A physically based tulip pint on a polished oak bar, lit like a product film:
 * two tall softboxes for the long vertical glass highlights, a warm rim from behind,
 * and amber bokeh in the background that refracts through the glass.
 *
 * The liquid is a full-height stout volume whose visible top is cut in the shader
 * at the current level, so the level can move freely in both directions with no
 * geometry rebuilds. The foam head is a small mesh rebuilt on the CPU each frame
 * (≈2.6k vertices) so it can tilt, cling to the glass and dome naturally.
 */
import * as T from "three";
import { H, WALL, BASE, TOP, FILLET, R, ri, clamp } from "./pour-shape.js";

const lerp = (a, b, t) => a + (b - a) * t;
const MAT = 0.028; // beer mat thickness
const ease = (t) => t * t * (3 - 2 * t);

export function createGL(stage, { reduce = false } = {}) {
  const canvas = document.createElement("canvas");
  canvas.className = "pour__canvas";
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setClearColor(0x0b0806, 1);
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = T.SRGBColorSpace;
  let dpr = Math.min(devicePixelRatio || 1, innerWidth < 760 ? 1.5 : 1.75);
  renderer.setPixelRatio(dpr);
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const scene = new T.Scene();
  // Linear fog that always starts just behind the glass, whatever the camera distance:
  // the pint stays crisp, the bar top dissolves into the dark.
  scene.fog = new T.Fog(new T.Color().setRGB(0.0034, 0.0024, 0.0018, T.LinearSRGBColorSpace), 10, 40);
  scene.environment = studioEnvironment(renderer);

  const camera = new T.PerspectiveCamera(22, 1, 0.1, 120);

  /* ------------------------------------------------------------------ backdrop */
  // Attached to the camera so it always fills the frame: a dark back bar with a warm
  // light source directly behind the glass (what makes an empty glass read as glass,
  // and the stout read as dense), plus out-of-focus amber bokeh.
  const backU = { uLight: { value: 0.5 }, uTime: { value: 0 }, uAspect: { value: 1.5 }, uHorizon: { value: 0.4 } };
  const backdrop = new T.Mesh(
    new T.PlaneGeometry(1, 1),
    new T.ShaderMaterial({
      uniforms: backU, depthWrite: false, fog: false,
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
      fragmentShader: /* glsl */ `
        varying vec2 vUv; uniform float uLight, uTime, uAspect, uHorizon;
        float h(float n){ return fract(sin(n) * 43758.5453); }
        void main(){
          vec2 q = (vUv - vec2(.5, .5)) * vec2(uAspect, 1.);
          vec3 col = vec3(.0034, .0024, .0018);                       // matches the fog: no seam with the bar top
          float above = smoothstep(uHorizon, uHorizon + .22, q.y);       // fades in above the bar-top horizon: no seam
          vec2 g = (q - vec2(0., .34)) * vec2(1.2, 1.6);
          col += vec3(.1, .05, .02) * exp(-dot(g, g) * 5.) * uLight * above;
          for (int i = 0; i < 16; i++) {
            float fi = float(i);
            vec2 c = vec2((h(fi * 12.99) - .5) * uAspect * .95, uHorizon + .06 + h(fi * 78.23) * .38);
            float r = .012 + .022 * h(fi * 3.71);
            float d = length(q - c);
            float disc = smoothstep(r, r * .7, d);
            float rim  = smoothstep(r * .6, r * .98, d) * disc;
            vec3 tint = mix(vec3(1., .48, .16), vec3(1., .76, .42), h(fi * .37));
            float flick = .78 + .22 * sin(uTime * (.2 + h(fi) * .3) + fi * 2.);
            col += tint * (disc * .1 + rim * .07) * uLight * flick * above;
          }
          gl_FragColor = vec4(col, 1.);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    })
  );
  backdrop.position.z = -45;
  backdrop.renderOrder = -1;
  camera.add(backdrop);
  scene.add(camera);

  /* ------------------------------------------------------------------ bar top (satin oil finish) */
  const wood = woodTexture(); wood.anisotropy = aniso;
  const table = new T.Mesh(new T.PlaneGeometry(260, 260), new T.MeshPhysicalMaterial({ map: wood, roughness: 0.62, specularIntensity: 0.25, clearcoat: 0, envMapIntensity: 0.12 }));
  table.rotation.x = -Math.PI / 2;
  scene.add(table);

  const shadow = flat(radialTex([[0, "rgba(0,0,0,.92)"], [0.32, "rgba(0,0,0,.55)"], [1, "rgba(0,0,0,0)"]]), 3.4, 3.4, 0.004, { opacity: 0.9 });
  const glow = flat(radialTex([[0, "rgba(190,62,24,1)"], [0.4, "rgba(150,40,14,.45)"], [1, "rgba(120,30,10,0)"]]), 2.3, 3.6, 0.006, { blending: T.AdditiveBlending, opacity: 0 });
  glow.position.z = 1.15;                                   // light thrown forward through the stout
scene.add(shadow, glow);

  /* ------------------------------------------------------------------ glass */
  const glassMat = new T.MeshPhysicalMaterial({
    color: 0xffffff, metalness: 0, roughness: 1, roughnessMap: smudgeTex(),
    transmission: 1, thickness: 0.55, ior: 1.52,
    attenuationColor: new T.Color(0xe6f4ea), attenuationDistance: 3.2,     // faint soda-lime green in the thick base
    specularIntensity: 1, envMapIntensity: 1.15,
    bumpMap: waveTex(), bumpScale: 0.35,                                  // the faint ripple of pressed glass
    side: T.DoubleSide,
  });
  if ("dispersion" in glassMat) glassMat.dispersion = 0.12;
  const glass = new T.Mesh(new T.LatheGeometry(glassProfile(), 180), glassMat);
  glass.renderOrder = 3;

  /* ------------------------------------------------------------------ stout */
  const beerU = {
    uLevel: { value: BASE }, uTilt: { value: new T.Vector2() }, uRad: { value: 0.6 },
    uSurge: { value: 0 }, uTime: { value: 0 }, uLight: { value: 1 },
  };
  const beerMat = new T.MeshPhysicalMaterial({ color: 0x040201, roughness: 0.1, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.1 });
  beerMat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, beerU);
    sh.vertexShader = "varying vec3 vWPos;\n" + sh.vertexShader.replace("#include <project_vertex>", "#include <project_vertex>\n vWPos = (modelMatrix * vec4(transformed, 1.)).xyz;");
    sh.fragmentShader = /* glsl */ `
      varying vec3 vWPos;
      uniform float uLevel, uRad, uSurge, uTime, uLight; uniform vec2 uTilt;
      float hs(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
      float vnoise(vec3 p){ vec3 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
        return mix(mix(mix(hs(i), hs(i+vec3(1,0,0)), f.x), mix(hs(i+vec3(0,1,0)), hs(i+vec3(1,1,0)), f.x), f.y),
                   mix(mix(hs(i+vec3(0,0,1)), hs(i+vec3(1,0,1)), f.x), mix(hs(i+vec3(0,1,1)), hs(i+vec3(1,1,1)), f.x), f.y), f.z); }
      float surfaceAt(vec3 p){ float r = clamp(length(p.xz) / uRad, 0., 1.); return uLevel + dot(uTilt, p.xz) + .012 * pow(r, 6.); }
    ` + sh.fragmentShader
      .replace("void main() {", "void main() {\n  float sTop = surfaceAt(vWPos);\n  if (vWPos.y > sTop) discard;")
      .replace("#include <color_fragment>", /* glsl */ `#include <color_fragment>
        // The surge: nitrogen bubbles cascading down the wall, a tan band that settles to black from the bottom up.
        float depth = sTop - vWPos.y;
        float band = mix(.25, 2.1, uSurge);
        float surgeMask = uSurge * (1. - smoothstep(0., band, depth));
        float streak = vnoise(vec3(vWPos.x * 16., (vWPos.y + uTime * .45) * 2.6, vWPos.z * 16.)) * .55
                     + vnoise(vec3(vWPos.x * 38., (vWPos.y + uTime * .8) * 6., vWPos.z * 38.)) * .3
                     + vnoise(vec3(vWPos.x * 90., (vWPos.y + uTime * 1.2) * 90., vWPos.z * 90.)) * .15;
        vec3 tan = vec3(.4, .25, .14) * (.5 + .75 * streak);
        diffuseColor.rgb = mix(diffuseColor.rgb, tan, clamp(surgeMask * (.65 + .35 * streak), 0., 1.));
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.55, .42, .29), smoothstep(.06, 0., depth) * .8);   // creamy just under the head
      `)
      .replace("#include <emissivemap_fragment>", /* glsl */ `#include <emissivemap_fragment>
        // Thin edges of a stout glow ruby when backlit.
        float rimF = pow(1. - clamp(abs(dot(normal, normalize(vViewPosition))), 0., 1.), 2.2);
        float settled = 1. - clamp(surgeMask, 0., 1.);
        float foot = smoothstep(${(BASE + 0.55).toFixed(3)}, ${BASE.toFixed(3)}, vWPos.y);
        totalEmissiveRadiance += vec3(.24, .045, .014) * (rimF * .9 + foot * .35) * settled * uLight;
      `);
  };
  const beer = new T.Mesh(new T.LatheGeometry(beerProfile(), 144), beerMat);

  /* ------------------------------------------------------------------ foam head */
  const foam = createFoam(aniso);

  /* ------------------------------------------------------------------ lights */
  const key = new T.SpotLight(0xffb878, 120, 0, 0.36, 1, 2); key.position.set(-4.5, 7.5, 4.5);
  const rim = new T.SpotLight(0xffd6a0, 140, 0, 0.5, 1, 2); rim.position.set(3.2, 5.5, -5.5);
  const fill = new T.HemisphereLight(0x3a2618, 0x0b0806, 0.35);
  const front = new T.DirectionalLight(0xfff0dc, 0.9); front.position.set(1.5, 3.2, 10); front.target.position.set(0, 2.4, 0); scene.add(front, front.target);
  const back = new T.SpotLight(0xff9d52, 900, 0, 0.24, 0.9, 2); back.position.set(0.3, 9, -9.5);
  back.target.position.set(0, 0, -1.9); scene.add(back, back.target);
  [key, rim].forEach((l) => { l.target.position.set(0, 2.1, 0); scene.add(l, l.target); });
  scene.add(fill);

  const pint = new T.Group();
  pint.add(beer, foam.mesh, glass);
  pint.position.y = MAT;
  scene.add(pint, beerMat_());
  shadow.position.y = MAT + 0.002; glow.position.y = MAT + 0.003;

  /* ------------------------------------------------------------------ framing */
  const target = new T.Vector3(0, 1.72, 0);
  let L = { w: 1, h: 1, portrait: false, d: 12, fullW: 1, fullH: 1, x0: 0, y0: 0 };
  function resize() {
    const w = Math.max(1, stage.clientWidth), h = Math.max(1, stage.clientHeight);
    renderer.setSize(w, h, false);
    const portrait = w / h < 0.9;
    // Place the glass at (cx, cy) of the viewport using an off-centre projection,
    // so perspective stays natural (no squash) while leaving room for the copy.
    const cx = portrait ? 0.5 : w < 1100 ? 0.36 : 0.37;
    const cy = portrait ? (w >= 600 ? 0.37 : 0.32) : 0.49;   // portrait tablets: glass sits lower, closer to the copy
    const fullW = w * 2 * Math.max(cx, 1 - cx), fullH = h * 2 * Math.max(cy, 1 - cy);
    const x0 = cx < 0.5 ? fullW - w : 0, y0 = cy < 0.5 ? fullH - h : 0;
    const visH = 2 * Math.tan(T.MathUtils.degToRad(camera.fov / 2)) * (h / fullH);
    // Glass (3.2 units + mat) framed at ~40% of the viewport height, with room to breathe.
    let d = 3.3 / ((portrait ? 0.38 : 0.41) * visH);
    d = Math.max(d, 2.3 / (0.62 * visH * (w / h)));
    L = { w, h, portrait, d, fullW, fullH, x0, y0 };
    scene.fog.near = d * 1.05 + 1.5; scene.fog.far = d * 1.05 + 26;
    camera.aspect = fullW / fullH;
    camera.setViewOffset(fullW, fullH, x0, y0, w, h);
    const bh = 2 * 45 * Math.tan(T.MathUtils.degToRad(camera.fov / 2)) * 1.02;
    backdrop.scale.set(bh * camera.aspect, bh, 1);
    backU.uAspect.value = camera.aspect;
  }
  resize();
  stage.prepend(canvas);

  function placeCamera(p) {
    const e = T.MathUtils.degToRad(lerp(16, 10, ease(p)));     // look into the empty glass, then settle to a hero angle
    const az = lerp(-0.13, 0.07, p);
    const d = L.d * lerp(1.05, 0.97, ease(p));                 // gentle push-in
    camera.position.set(target.x + d * Math.sin(az) * Math.cos(e), target.y + d * Math.sin(e), target.z + d * Math.cos(az) * Math.cos(e));
    camera.lookAt(target);
    // Screen height of the horizon in backdrop units (centre of the full frustum = 0, top = .5).
    backU.uHorizon.value = 0.5 * Math.tan(e) / Math.tan(T.MathUtils.degToRad(camera.fov / 2));
  }

  /* ------------------------------------------------------------------ slosh */
  const slosh = { x: 0, v: 0 };
  let prevTotal = null;

  function frame(s, dt, t) {
    if (reduce) t = 0;
    placeCamera(s.p);

    // A damped pendulum driven by how fast the level is moving: the surface leans
    // as you scroll and settles when you stop. Kept small and elegant.
    if (prevTotal === null) prevTotal = s.total;
    const vel = dt > 0 ? (s.total - prevTotal) / dt : 0; prevTotal = s.total;
    if (!reduce) {
      slosh.v += (-70 * slosh.x - 8 * slosh.v + clamp(vel, -4, 4) * 0.8) * dt;
      slosh.x = clamp(slosh.x + slosh.v * dt, -0.035, 0.035);
    }
    const tilt = beerU.uTilt.value.set(slosh.x + 0.0012 * Math.sin(t * 0.7), slosh.x * 0.35 * Math.sin(t * 1.6) + 0.001 * Math.cos(t * 0.53));

    beerU.uLevel.value = s.level; beerU.uRad.value = ri(s.level); beerU.uSurge.value = s.surge;
    beerU.uTime.value = t; beerU.uLight.value = s.light;
    beer.visible = foam.mesh.visible = !s.empty;
    if (!s.empty) foam.update(s, tilt, t);

    glow.material.opacity = Math.min(1, s.fill * 1.1) * 0.55 * s.light * (1 - s.surge * 0.5);
    backU.uLight.value = s.light; backU.uTime.value = t;
    key.intensity = 70 + 90 * s.light;
    back.intensity = 420 + 480 * s.light;
    rim.intensity = 60 + 110 * s.light;
    renderer.render(scene, camera);
  }

  return {
    canvas,
    frame,
    resize,
    /** Drop resolution once; returns false when already at the floor. */
    lowerQuality() {
      if (dpr <= 1) return false;
      dpr = 1; renderer.setPixelRatio(1); resize(); return true;
    },
    compile() { placeCamera(0); renderer.compile(scene, camera); },
    /** QA: the glass + mat bounding box on screen, as fractions of the viewport. */
    measure() {
      const box = new T.Box3().setFromObject(pint).union(new T.Box3(new T.Vector3(-1.05, 0, -1.05), new T.Vector3(1.05, MAT, 1.05)));
      const xs = [], ys = [];
      for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
        const v = new T.Vector3(x, y, z).project(camera); xs.push((v.x + 1) / 2); ys.push((1 - v.y) / 2);
      }
      return { left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys) };
    },
    dispose() {
      scene.traverse((o) => { o.geometry?.dispose(); [].concat(o.material || []).forEach((m) => { Object.values(m).forEach((v) => v?.isTexture && v.dispose()); m.dispose(); }); });
      scene.environment?.dispose();
      renderer.dispose(); renderer.forceContextLoss(); canvas.remove();
    },
  };
}

/* A round pressed-board beer mat: dark, slightly fibrous, with a fine brass keyline. */
function beerMat_() {
  const g = new T.Group();
  const tex = canvasTex(512, 512, (c, w, h) => {
    c.fillStyle = "#16100b"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) { c.fillStyle = `rgba(${Math.random() < .5 ? "60,42,28" : "0,0,0"},${Math.random() * .18})`; c.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1); }
    c.strokeStyle = "rgba(207,169,104,.55)"; c.lineWidth = 3; c.beginPath(); c.arc(w / 2, h / 2, w * 0.455, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 1; c.beginPath(); c.arc(w / 2, h / 2, w * 0.43, 0, Math.PI * 2); c.stroke();
  }, { srgb: true, repeat: false });
  const top = new T.Mesh(new T.CircleGeometry(1.05, 96), new T.MeshStandardMaterial({ map: tex, roughness: 0.92, metalness: 0 }));
  top.rotation.x = -Math.PI / 2; top.position.y = MAT;
  const edge = new T.Mesh(new T.CylinderGeometry(1.05, 1.05, MAT, 96, 1, true), new T.MeshStandardMaterial({ color: 0x0d0906, roughness: 0.9 }));
  edge.position.y = MAT / 2;
  g.add(top, edge);
  return g;
}

/* ======================================================================= geometry */

function glassProfile() {
  const pts = [], v = (x, y) => pts.push(new T.Vector2(Math.max(x, 0.0001), y));
  // Underside: a shallow punt, then a rounded heavy foot.
  v(0, 0.05); v(0.22, 0.042); v(0.42, 0.016); v(R(0) - 0.06, 0.003);
  for (let i = 1; i <= 6; i++) { const a = -Math.PI / 2 + (i / 6) * (Math.PI / 2); v(R(0) - 0.03 + 0.03 * Math.cos(a), 0.03 + 0.03 * Math.sin(a)); }
  // Outer wall.
  const N = 140;
  for (let i = 1; i <= N; i++) { const h = 0.03 + (H - 0.006 - 0.03) * (i / N); v(R(h), h); }
  // Rolled lip.
  const lr = WALL / 2, lx = R(H) - lr, ly = H - 0.006;
  for (let i = 1; i < 12; i++) { const a = (i / 12) * Math.PI; v(lx + lr * Math.cos(a), ly + lr * Math.sin(a)); }
  // Inner wall, down into the fillet and across the floor.
  for (let i = N; i >= 0; i--) { const h = BASE + FILLET + (ly - BASE - FILLET) * (i / N); v(ri(h), h); }
  for (let i = 1; i <= 8; i++) { const h = BASE + FILLET - (i / 8) * FILLET; v(ri(h), h); }
  v(0, BASE);
  return pts;
}

function beerProfile() {
  const pts = [new T.Vector2(0.0001, BASE + 0.004)];
  const inset = 0.006, N = 90, top = H - 0.01;
  for (let i = 0; i <= N; i++) {
    const h = BASE + 0.004 + (top - BASE - 0.004) * Math.pow(i / N, 1.15);
    pts.push(new T.Vector2(Math.max(0.0001, ri(h) - inset), h));
  }
  return pts;
}

/* The head: side wall hugging the glass + a domed top, rebuilt in place each frame. */
function createFoam(aniso) {
  const SEG = 112, SIDE = 10, DOME = 16, ROWS = SIDE + 1 + DOME;
  const COLS = SEG + 1, count = ROWS * COLS;
  const geo = new T.BufferGeometry();
  const pos = new Float32Array(count * 3), uv = new Float32Array(count * 2), col = new Float32Array(count * 3);
  geo.setAttribute("position", new T.BufferAttribute(pos, 3).setUsage(T.DynamicDrawUsage));
  geo.setAttribute("uv", new T.BufferAttribute(uv, 2).setUsage(T.DynamicDrawUsage));
  geo.setAttribute("color", new T.BufferAttribute(col, 3).setUsage(T.DynamicDrawUsage));
  const idx = [];
  for (let r = 0; r < ROWS - 1; r++) for (let c = 0; c < SEG; c++) {
    const a = r * COLS + c, b = a + COLS;
    idx.push(a, b, a + 1, a + 1, b, b + 1);
  }
  geo.setIndex(idx);
  const cos = [], sin = [];
  for (let c = 0; c < COLS; c++) { const th = (c / SEG) * Math.PI * 2; cos.push(Math.cos(th)); sin.push(Math.sin(th)); }

  const { map, bump } = bubbleTextures(); map.anisotropy = bump.anisotropy = aniso;
  const mat = new T.MeshPhysicalMaterial({
    vertexColors: true, map, bumpMap: bump, bumpScale: 2.2,
    roughness: 0.8, sheen: 1, sheenColor: new T.Color(0xfff0d6), sheenRoughness: 0.55,
    emissive: new T.Color(0x6a5438), envMapIntensity: 0.9,
  });
  const mesh = new T.Mesh(geo, mat);
  const cream = new T.Color(1.0, 0.95, 0.84), tan = new T.Color(0.7, 0.55, 0.38), tmp = new T.Color();
  const prof = new Array(ROWS);

  function update(s, tilt, t) {
    const top = s.total, bot = s.level - 0.004, rTop = ri(top) - 0.004;
    let arc = 0, prevR = null, prevY = null;
    for (let r = 0; r < ROWS; r++) {
      let rad, y, k;                                  // k: 0 at the interface → 1 on top
      if (r <= SIDE) { y = lerp(bot, top, r / SIDE); rad = ri(y) - 0.004; k = (r / SIDE) * 0.7; if (r === SIDE) y += 0.012; }
      else { const f = 1 - (r - SIDE) / DOME; rad = rTop * f; y = top + s.dome * (1 - f * f) + 0.012 * Math.pow(f, 10); k = 0.7 + 0.3 * (1 - f); }
      if (prevR !== null) arc += Math.hypot(rad - prevR, y - prevY);
      prevR = rad; prevY = y;
      prof[r] = [rad, y, k, arc];
    }
    for (let r = 0; r < ROWS; r++) {
      const [rad, y0, k, a] = prof[r];
      tmp.copy(tan).lerp(cream, ease(clamp(k / 0.22, 0, 1)));
      tmp.lerp(tan, s.surge * 0.18 * (1 - k * 0.6));
      const isTop = r > SIDE;
      const rf = rad / (rTop || 1);
      for (let c = 0; c < COLS; c++) {
        const i = r * COLS + c, x = rad * cos[c], z = rad * sin[c];
        let y = y0 + tilt.x * x + tilt.y * z;
        if (r === 0) y += 0.012;                       // meniscus at the wall
        if (isTop) y += 0.0022 * Math.sin(rf * 13 - t * 1.6 + cos[c] * 2) * (1 - rf * 0.6);   // the head breathing
        pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
        uv[i * 2] = (c / SEG) * 16; uv[i * 2 + 1] = a * 3.6;
        col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
      }
    }
    geo.attributes.position.needsUpdate = geo.attributes.uv.needsUpdate = geo.attributes.color.needsUpdate = true;
    geo.computeVertexNormals();
    geo.computeBoundingSphere();
  }
  return { mesh, update };
}

/* ======================================================================= textures */

function canvasTex(w, h, draw, { srgb = false, repeat = true } = {}) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new T.CanvasTexture(c);
  if (repeat) t.wrapS = t.wrapT = T.RepeatWrapping;
  if (srgb) t.colorSpace = T.SRGBColorSpace;
  return t;
}

function radialTex(stops) {
  return canvasTex(256, 256, (g, w, h) => {
    const grd = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    stops.forEach(([o, c]) => grd.addColorStop(o, c));
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
  }, { srgb: true, repeat: false });
}

function flat(tex, w, h, y, o = {}) {
  const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false, ...o }));
  m.rotation.x = -Math.PI / 2; m.position.y = y;
  return m;
}

function woodTexture() {
  const t = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = "#1a100a"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) {
      const y = Math.random() * h, amp = 2 + Math.random() * 7, f = 0.002 + Math.random() * 0.006, ph = Math.random() * 6;
      g.strokeStyle = Math.random() < 0.55 ? `rgba(8,4,2,${0.18 + Math.random() * 0.3})` : `rgba(120,74,40,${0.05 + Math.random() * 0.1})`;
      g.lineWidth = 0.6 + Math.random() * 2.4;
      g.beginPath();
      for (let x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x * f + ph) * amp);
      g.stroke();
    }
  }, { srgb: true });
  t.repeat.set(24, 24);
  return t;
}

/* Mostly clean glass with a few soft handling smudges (roughness map, green channel). */
function smudgeTex() {
  return canvasTex(256, 512, (g, w, h) => {
    g.fillStyle = "rgb(6,6,6)"; g.fillRect(0, 0, w, h);
    g.filter = "blur(14px)";
    for (let i = 0; i < 9; i++) {
      g.fillStyle = `rgba(40,40,40,${0.25 + Math.random() * 0.35})`;
      g.beginPath(); g.ellipse(Math.random() * w, h * (0.15 + Math.random() * 0.7), 10 + Math.random() * 22, 14 + Math.random() * 30, Math.random() * 3, 0, Math.PI * 2); g.fill();
    }
    g.filter = "none";
  });
}

/* Very low-frequency vertical waviness — the tell of real pressed glass. */
function waveTex() {
  return canvasTex(512, 64, (g, w, h) => {
    for (let x = 0; x < w; x++) {
      const v = 128 + 40 * Math.sin(x * 0.05) + 25 * Math.sin(x * 0.13 + 1.7) + 10 * Math.sin(x * 0.41);
      g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x, 0, 1, h);
    }
  });
}

/* Micro-bubble foam: thousands of tiny cells, tileable horizontally and vertically. */
function bubbleTextures() {
  const size = 512, cells = [];
  for (let i = 0; i < 3200; i++) cells.push([Math.random() * size, Math.random() * size, 0.6 + Math.pow(Math.random(), 3) * 4.2]);
  const draw = (g, bump) => {
    g.fillStyle = bump ? "rgb(150,150,150)" : "#f1e7d2"; g.fillRect(0, 0, size, size);
    for (const [x0, y0, r] of cells) for (const dx of [-size, 0, size]) for (const dy of [-size, 0, size]) {
      const x = x0 + dx, y = y0 + dy;
      if (x < -6 || x > size + 6 || y < -6 || y > size + 6) continue;
      const grd = g.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
      if (bump) { grd.addColorStop(0, "rgb(235,235,235)"); grd.addColorStop(0.75, "rgb(175,175,175)"); grd.addColorStop(1, "rgb(70,70,70)"); }
      else { grd.addColorStop(0, "rgba(255,252,244,.95)"); grd.addColorStop(0.8, "rgba(236,224,200,.6)"); grd.addColorStop(1, "rgba(150,118,80,.55)"); }
      g.fillStyle = grd; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    }
  };
  return { map: canvasTex(size, size, (g) => draw(g, false), { srgb: true }), bump: canvasTex(size, size, (g) => draw(g, true)) };
}

/* A dark studio with long softboxes — what makes glass read as glass. */
function studioEnvironment(renderer) {
  const s = new T.Scene();
  s.background = new T.Color(0x020101);
  const box = (w, h, color, k, p, look = [0, 1.6, 0]) => {
    const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(color).multiplyScalar(k), side: T.DoubleSide }));
    m.position.set(...p); m.lookAt(...look); s.add(m);
  };
  box(1.3, 10, 0xfff3e2, 6, [-6, 2, 2.5]);      // key strip, left
  box(0.7, 10, 0xffd6a0, 3.5, [6, 2, -0.5]);    // warm strip, right
  box(0.5, 8, 0xffffff, 4.5, [2.4, 2, 9]);      // behind camera: the front highlight
  box(12, 2.2, 0xffc48a, 1.2, [0, 9, -3], [0, 0, 0]);  // overhead
  box(16, 4, 0x5a2e12, 0.7, [0, -1.5, 6], [0, 1, 0]);  // amber bounce off the bar
  const pm = new T.PMREMGenerator(renderer);
  const tex = pm.fromScene(s, 0.012).texture;
  pm.dispose();
  return tex;
}
