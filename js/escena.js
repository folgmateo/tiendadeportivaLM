/* TiendaDeportivaLM — escena 3D procedural del hero (Three.js).
   Script clásico con import dinámico: funciona en GitHub Pages y abriendo el archivo con doble clic. */
(async () => {
const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js");
const { RoomEnvironment } = await import("https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/environments/RoomEnvironment.js");

const canvas = document.getElementById("escena");
const st = window.TDLM || { heroProgress: 0, reduced: false, mouseX: 0, mouseY: 0 };
const isSmall = () => window.innerWidth < 860;
const lowPower = window.matchMedia("(pointer: coarse)").matches || (navigator.hardwareConcurrency || 8) <= 4;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: !lowPower, alpha: true, powerPreference: "high-performance" });
} catch (e) {
  canvas.remove();
  return;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, lowPower ? 1.25 : 1.75));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
camera.position.set(0, 0, 10.5);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
pmrem.dispose();
scene.add(new THREE.AmbientLight(0xffffff, 0.25));
const key = new THREE.DirectionalLight(0xffffff, 2.4);
key.position.set(-4, 6, 6);
scene.add(key);
const rim = new THREE.PointLight(0xff6a1a, 25, 20);
rim.position.set(4, -1, -3);
scene.add(rim);

const rnd = (a = 1) => (Math.random() - 0.5) * 2 * a;
const lerp = THREE.MathUtils.lerp;
const clamp01 = (x) => THREE.MathUtils.clamp(x, 0, 1);
const smooth = (a, b, x) => THREE.MathUtils.smoothstep(x, a, b);
const TAU = Math.PI * 2;

/* ---------- balón de fútbol: paneles que pueden separarse ---------- */
const ballGeo = new THREE.IcosahedronGeometry(1, 2); // ya es no indexada: cada cara es un panel independiente
const pos = ballGeo.attributes.position;
const faceCount = pos.count / 3;
const orig = Float32Array.from(pos.array);
const faceDir = new Float32Array(faceCount * 3);
const faceKick = new Float32Array(faceCount);
const colors = new Float32Array(pos.count * 3);
// los 12 vértices del icosaedro marcan los pentágonos negros del balón clásico
const ico = new THREE.IcosahedronGeometry(1, 0);
const poles = [];
for (let i = 0; i < ico.attributes.position.count; i++) {
  const v = new THREE.Vector3().fromBufferAttribute(ico.attributes.position, i).normalize();
  if (!poles.some((p) => p.distanceTo(v) < 1e-3)) poles.push(v);
}
// centros de las 20 caras del icosaedro = centros de los hexágonos blancos
const hexCenters = [];
for (let i = 0; i < ico.attributes.position.count; i += 3) {
  const h = new THREE.Vector3();
  for (let k = 0; k < 3; k++) h.add(new THREE.Vector3().fromBufferAttribute(ico.attributes.position, i + k));
  hexCenters.push(h.normalize());
}
const c = new THREE.Vector3();
const black = new THREE.Color(0x111418), white = new THREE.Color(0xf5f5f0);
for (let f = 0; f < faceCount; f++) {
  c.set(0, 0, 0);
  for (let k = 0; k < 3; k++) c.add(new THREE.Vector3().fromBufferAttribute(pos, f * 3 + k));
  c.normalize();
  faceDir.set([c.x, c.y, c.z], f * 3);
  faceKick[f] = 0.6 + Math.random() * 1.4;
  // pentágono negro si el centro de la cara está más cerca de un vértice del icosaedro que de un centro de cara
  const dPole = Math.max(...poles.map((p) => p.dot(c)));
  const dHex = Math.max(...hexCenters.map((h) => h.dot(c)));
  const isBlack = dPole * 1.012 > dHex;
  const col = isBlack ? black : white;
  for (let k = 0; k < 3; k++) colors.set([col.r, col.g, col.b], (f * 3 + k) * 3);
}
ballGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
// normales esféricas para que el balón se vea liso
const normals = new Float32Array(pos.count * 3);
for (let i = 0; i < pos.count; i++) {
  const v = new THREE.Vector3().fromBufferAttribute(pos, i).normalize();
  normals.set([v.x, v.y, v.z], i * 3);
}
ballGeo.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
const ball = new THREE.Mesh(ballGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.45, metalness: 0.05, side: THREE.DoubleSide }));
scene.add(ball);

function explodeBall(e) {
  const a = pos.array;
  for (let f = 0; f < faceCount; f++) {
    const d = e * faceKick[f] * 1.1;
    const dx = faceDir[f * 3] * d, dy = faceDir[f * 3 + 1] * d, dz = faceDir[f * 3 + 2] * d;
    for (let k = 0; k < 3; k++) {
      const i = (f * 3 + k) * 3;
      a[i] = orig[i] + dx; a[i + 1] = orig[i + 1] + dy; a[i + 2] = orig[i + 2] + dz;
    }
  }
  pos.needsUpdate = true;
}

/* ---------- balón de baloncesto ---------- */
function basketTexture() {
  const cv = document.createElement("canvas");
  cv.width = 1024; cv.height = 512;
  const g = cv.getContext("2d");
  g.fillStyle = "#E8661C"; g.fillRect(0, 0, 1024, 512);
  // granulado
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.12})`; g.fillRect(Math.random() * 1024, Math.random() * 512, 2, 2); }
  g.strokeStyle = "#1a1a1a"; g.lineWidth = 9;
  [0, 256, 512, 768].forEach((x) => { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.stroke(); });
  g.beginPath(); g.moveTo(0, 256); g.lineTo(1024, 256); g.stroke();
  [128, 640].forEach((x0) => {
    g.beginPath();
    for (let y = 0; y <= 512; y += 4) { const x = x0 + Math.sin((y / 512) * Math.PI) * 110; y ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke();
  });
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
const basket = new THREE.Mesh(new THREE.SphereGeometry(0.75, 48, 32), new THREE.MeshStandardMaterial({ map: basketTexture(), roughness: 0.7 }));
scene.add(basket);

/* ---------- mancuerna ---------- */
const dumbbell = new THREE.Group();
{
  const rubber = new THREE.MeshStandardMaterial({ color: 0x15191d, roughness: 0.6 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 1, roughness: 0.15 });
  const accent = new THREE.MeshStandardMaterial({ color: 0xff6a1a, roughness: 0.4 });
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.2, 24), chrome);
  handle.rotation.z = Math.PI / 2;
  dumbbell.add(handle);
  [-1, 1].forEach((s) => {
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.42, 6), rubber);
    head.rotation.z = Math.PI / 2;
    head.position.x = s * 0.78;
    dumbbell.add(head);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.39, 0.06, 6), accent);
    band.rotation.z = Math.PI / 2;
    band.position.x = s * 0.6;
    dumbbell.add(band);
  });
}
scene.add(dumbbell);

/* ---------- confeti ---------- */
const confN = lowPower ? 220 : 600;
const confDir = new Float32Array(confN * 3);
const confPos = new Float32Array(confN * 3);
const confCol = new Float32Array(confN * 3);
const palette = [new THREE.Color(0xff6a1a), new THREE.Color(0xf5f5f0), new THREE.Color(0x2fbf71)];
for (let i = 0; i < confN; i++) {
  const u = Math.random() * 2 - 1, a = Math.random() * TAU, sp = 2 + Math.random() * 6, r = Math.sqrt(1 - u * u);
  confDir.set([r * Math.cos(a) * sp, u * sp * 0.8, r * Math.sin(a) * sp], i * 3);
  const col = palette[i % 3];
  confCol.set([col.r, col.g, col.b], i * 3);
}
const confGeo = new THREE.BufferGeometry();
confGeo.setAttribute("position", new THREE.BufferAttribute(confPos, 3));
confGeo.setAttribute("color", new THREE.BufferAttribute(confCol, 3));
const confetti = new THREE.Points(confGeo, new THREE.PointsMaterial({ size: 0.09, vertexColors: true, transparent: true, opacity: 0, depthWrite: false }));
scene.add(confetti);

/* ---------- partículas de ambiente y círculo central de cancha ---------- */
const dustN = lowPower ? 120 : 320;
const dustPos = new Float32Array(dustN * 3);
for (let i = 0; i < dustN; i++) {
  const a = Math.random() * TAU, r = 2.5 + Math.random() * 9;
  dustPos.set([Math.sin(a) * r, rnd(5), Math.cos(a) * r], i * 3);
}
const dustGeo = new THREE.BufferGeometry();
dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xf5f5f0, size: 0.03, transparent: true, opacity: 0.5, depthWrite: false }));
scene.add(dust);

const lineMat = () => new THREE.MeshBasicMaterial({ color: 0xf5f5f0, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
const court = new THREE.Mesh(new THREE.RingGeometry(3.4, 3.46, 160), lineMat());
court.rotation.x = -Math.PI / 2;
court.position.y = -1.9;
scene.add(court);
const shock = new THREE.Mesh(new THREE.RingGeometry(1.0, 1.06, 160), new THREE.MeshBasicMaterial({ color: 0xff6a1a, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
shock.rotation.x = -Math.PI / 2;
scene.add(shock);

/* ---------- composición ---------- */
const layout = { x: 2.4, y: 0, s: 1 };
function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  if (isSmall()) Object.assign(layout, { x: 0.55, y: 1.6, s: 0.62 });
  else Object.assign(layout, { x: 2.5 * Math.min(1, camera.aspect / 1.6), y: 0, s: 1 });
  if (!running) render();
}

/* ---------- animación ---------- */
const clock = new THREE.Clock();
const v = new THREE.Vector3();
let sp = 0, mx = 0, my = 0;
const BASKET_A = TAU / 3, DUMB_A = (TAU / 3) * 2;

function render() {
  const t = st.reduced ? 2 : clock.getElapsedTime();
  const ease = 1 - Math.pow(1 - Math.min(1, t / 1.8), 4);
  sp += (st.heroProgress - sp) * 0.08;
  mx += (st.mouseX - mx) * 0.05;
  my += (st.mouseY - my) * 0.05;
  const p = st.reduced ? 0 : sp;
  const s = layout.s;

  const k = smooth(0, 0.12, p);                                   // del hero al centro
  const orbit = clamp01((p - 0.06) / 0.88);
  const theta = (1 - Math.pow(1 - orbit, 2)) * TAU;                // vuelta de 360°
  const e = Math.pow(Math.sin(Math.PI * clamp01((p - 0.12) / 0.7)), 0.8); // explosión
  const burst = clamp01((p - 0.12) / 0.45);
  const travel = 1 - Math.pow(1 - burst, 3);
  const so = isSmall() ? 0.75 : 1;
  const bounce = st.reduced ? 0 : Math.abs(Math.sin(t * 2.2)) * 0.25 * (1 - k);

  // balón de fútbol
  explodeBall(e);
  ball.position.set(lerp(layout.x + (1 - ease) * 3, 0, k), lerp(layout.y, 0, k) + bounce, 0);
  ball.rotation.set(t * 0.4 + my * 0.2, t * 0.6 + e * 2, 0.2);
  ball.scale.setScalar(lerp(s * 1.25, so * 1.15, k) * (0.2 + 0.8 * ease));

  // balón de baloncesto y mancuerna: salen disparados en la explosión
  const r = (2.5 + e * 2.6) * so;
  basket.position.set(
    lerp(layout.x - 1.9 * s, Math.sin(BASKET_A) * r, k),
    lerp(layout.y + 1.5 * s, 0.6 + e * 1.3, k) + Math.sin(t * 1.3) * 0.12,
    lerp(-0.5, Math.cos(BASKET_A) * r, k)
  );
  basket.rotation.set(t * 0.8 + e * 4, t * 0.5, 0.3);
  basket.scale.setScalar(lerp(s, so, k) * ease);

  dumbbell.position.set(
    lerp(layout.x + 0.4 * s, Math.sin(DUMB_A) * r, k),
    lerp(layout.y - 1.75 * s, -0.7 - e * 1.1, k) + Math.cos(t * 1.1) * 0.1,
    lerp(1.4, Math.cos(DUMB_A) * r, k)
  );
  dumbbell.rotation.set(0.3 + my * 0.2 + e * 3, -0.5 + mx * 0.3 + t * 0.3 + e * 4, 0.25 + e * 2);
  dumbbell.scale.setScalar(lerp(s * 0.9, so * 1.1, k) * ease);

  // confeti
  const cp = confGeo.attributes.position.array;
  for (let i = 0; i < confN * 3; i += 3) {
    cp[i] = confDir[i] * travel;
    cp[i + 1] = confDir[i + 1] * travel - travel * travel * 1.5;
    cp[i + 2] = confDir[i + 2] * travel;
  }
  confGeo.attributes.position.needsUpdate = true;
  confetti.material.opacity = burst > 0 && burst < 1 ? Math.sin(Math.PI * burst) : 0;

  shock.scale.setScalar(0.5 + travel * 5);
  shock.material.opacity = burst > 0 && burst < 1 ? (1 - burst) * 0.9 : 0;
  court.material.opacity = 0.35 * k;
  dust.rotation.y = t * 0.02 + theta * 0.3;
  rim.intensity = 25 + e * 120;

  // cámara: frente al hero → vuelta de 360°
  const radius = lerp(10.5, 9.6 - e * 1.4, k) * (isSmall() ? 1.45 : 1);
  const shake = st.reduced ? 0 : e * 0.06;
  v.set(
    Math.sin(theta) * radius + mx * 0.3 * (1 - k * 0.5) + Math.sin(t * 40) * shake,
    Math.sin(theta) * 1.4 * k + e * 1.2 - my * 0.25 + Math.cos(t * 37) * shake,
    Math.cos(theta) * radius
  );
  camera.position.copy(v);
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}

let running = false, visible = true, raf = 0;
const loop = () => { raf = requestAnimationFrame(loop); render(); };
function update() {
  const go = visible && !document.hidden && !st.reduced;
  if (go && !running) { running = true; loop(); }
  else if (!go && running) { running = false; cancelAnimationFrame(raf); }
}
new IntersectionObserver((en) => { visible = en[0].isIntersecting; update(); }).observe(canvas);
document.addEventListener("visibilitychange", update);
window.addEventListener("resize", resize);
resize();
if (st.reduced) render();
update();
})().catch(() => { const c = document.getElementById("escena"); if (c) c.remove(); });
