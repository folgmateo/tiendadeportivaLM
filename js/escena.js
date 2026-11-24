/* TiendaDeportivaLM — escaparate 3D: el balón gira 360° con el scroll.
   Script clásico con import dinámico: funciona en GitHub Pages y abriendo el archivo con doble clic. */
(async () => {
const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js");
const { RoomEnvironment } = await import("https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/environments/RoomEnvironment.js");

const canvas = document.getElementById("escena");
if (!canvas) return;
const st = window.TDLM || { spot: 0, reduced: false };
const isSmall = () => window.innerWidth < 760;
const lowPower = window.matchMedia("(pointer: coarse)").matches || (navigator.hardwareConcurrency || 8) <= 4;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
} catch (e) {
  canvas.remove();
  return;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, lowPower ? 1.5 : 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
camera.position.set(0, 0.35, 7.2);
camera.lookAt(0, 0, 0);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
pmrem.dispose();
const key = new THREE.DirectionalLight(0xffffff, 2.2);
key.position.set(-3, 5, 4);
scene.add(key);
scene.add(new THREE.HemisphereLight(0xffffff, 0xd9d9d9, 0.6));

/* ---------- textura del balón: paneles por cercanía (12 pentágonos, 20 hexágonos) ---------- */
function centros() {
  const ico = new THREE.IcosahedronGeometry(1, 0);
  const p = ico.attributes.position;
  const verts = [], caras = [];
  for (let i = 0; i < p.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(p, i).normalize();
    if (!verts.some((u) => u.distanceTo(v) < 1e-3)) verts.push(v);
  }
  for (let i = 0; i < p.count; i += 3) {
    const c = new THREE.Vector3();
    for (let k = 0; k < 3; k++) c.add(new THREE.Vector3().fromBufferAttribute(p, i + k));
    caras.push(c.normalize());
  }
  return { verts, caras };
}

function texturasBalon() {
  const W = lowPower ? 1024 : 2048, H = W / 2;
  const color = document.createElement("canvas");
  const relieve = document.createElement("canvas");
  color.width = relieve.width = W;
  color.height = relieve.height = H;
  const gc = color.getContext("2d"), gr = relieve.getContext("2d");
  const ic = gc.createImageData(W, H), ir = gr.createImageData(W, H);
  const { verts, caras } = centros();
  // los pentágonos de un balón real son algo menores que la celda de Voronoi pura
  const pts = verts.map((v) => ({ v, negro: true, peso: 0.985 })).concat(caras.map((v) => ({ v, negro: false, peso: 1 })));
  for (let py = 0; py < H; py++) {
    const th = (py + 0.5) / H * Math.PI, sth = Math.sin(th), cth = Math.cos(th);
    for (let px = 0; px < W; px++) {
      const ph = (px + 0.5) / W * Math.PI * 2;
      const x = -Math.cos(ph) * sth, y = cth, z = Math.sin(ph) * sth;
      let b1 = -2, b2 = -2, negro = false;
      for (const q of pts) {
        const d = (q.v.x * x + q.v.y * y + q.v.z * z) * q.peso;
        if (d > b1) { b2 = b1; b1 = d; negro = q.negro; } else if (d > b2) b2 = d;
      }
      const costura = Math.min(1, (b1 - b2) / 0.012); // 0 en la costura, 1 dentro del panel
      const base = negro ? 26 : 242;
      const borde = 0.55 + 0.45 * costura;
      const g = Math.round(base * borde + (negro ? 0 : (1 - borde) * 40));
      const i = (py * W + px) * 4;
      ic.data[i] = ic.data[i + 1] = ic.data[i + 2] = g;
      ic.data[i + 3] = 255;
      const r = Math.round(255 * Math.pow(costura, 0.6)); // la costura queda hundida
      ir.data[i] = ir.data[i + 1] = ir.data[i + 2] = r;
      ir.data[i + 3] = 255;
    }
  }
  gc.putImageData(ic, 0, 0);
  gr.putImageData(ir, 0, 0);
  const map = new THREE.CanvasTexture(color);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const bump = new THREE.CanvasTexture(relieve);
  return { map, bump };
}

const { map, bump } = texturasBalon();
const ball = new THREE.Mesh(
  new THREE.SphereGeometry(1, 96, 64),
  new THREE.MeshPhysicalMaterial({ map, bumpMap: bump, bumpScale: 2.2, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.45 })
);
scene.add(ball);

/* ---------- sombra de contacto ---------- */
function sombra() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, "rgba(0,0,0,.42)");
  grad.addColorStop(0.45, "rgba(0,0,0,.16)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}
const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshBasicMaterial({ map: sombra(), transparent: true, depthWrite: false }));
shadow.rotation.x = -Math.PI / 2;
shadow.position.y = -1.02;
scene.add(shadow);

/* ---------- composición ---------- */
const layout = { x: 0, y: 0, s: 1 };
function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  if (isSmall()) Object.assign(layout, { x: 0, y: 0.1, s: 0.9 });
  else Object.assign(layout, { x: 1.15 * Math.min(1.4, camera.aspect / 1.4), y: 0.05, s: 1 });
  if (!running) render();
}

let sp = 0;
const t0 = performance.now();
function render() {
  const t = (performance.now() - t0) / 1000;
  sp += ((st.spot || 0) - sp) * 0.12;
  const giro = st.reduced ? 0.6 : sp * Math.PI * 2 + t * 0.08;
  const bote = st.reduced ? 0 : Math.sin(sp * Math.PI) * 0.18; // sube un poco a mitad de la vuelta
  ball.position.set(layout.x, layout.y + bote, 0);
  ball.scale.setScalar(layout.s);
  ball.rotation.set(0.35 + Math.sin(sp * Math.PI) * 0.25, giro, 0.12);
  shadow.position.set(layout.x, layout.y - 1.02 * layout.s, 0);
  shadow.scale.setScalar((1 - bote * 0.9) * layout.s);
  shadow.material.opacity = 1 - bote * 1.6;
  renderer.render(scene, camera);
}

let running = false, visible = false, raf = 0;
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
render();
update();
})().catch(() => { const c = document.getElementById("escena"); if (c) c.remove(); });
