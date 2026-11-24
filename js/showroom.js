/* TiendaDeportivaLM — showroom 3D de la zapatilla Street Runner.
   Arrastra para girarla 360°, elige el color (variantes KHR_materials_variants del modelo) y agrégala al carrito.
   El modelo (js/zapatilla-modelo.js, ~1,9 MB) solo se descarga cuando la sección se acerca a la pantalla. */
(() => {
  "use strict";
  const PRODUCTO = "p9";
  const canvas = document.getElementById("zapatilla");
  const seccion = document.getElementById("showroom");
  if (!canvas || !seccion) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s) => document.querySelector(s);
  let colorActual = "Negro";
  let aplicarVariante = () => {};

  /* ---------- precio, color y carrito ---------- */
  function pintar() {
    const p = window.Tienda && window.Tienda.porId(PRODUCTO);
    seccion.hidden = !p;
    if (!p) return;
    $("#show-price").textContent = window.Inventario.formatoQ(p.precio);
    const b = $("#show-add");
    const lleno = window.Tienda.enCarritoDe(PRODUCTO) >= p.stock;
    b.disabled = p.stock <= 0 || lleno;
    b.textContent = p.stock <= 0 ? "Agotado" : lleno ? "Ya tienes todas las disponibles" : "Agregar al carrito";
  }
  window.addEventListener("inventario:cambio", pintar);
  document.addEventListener("click", (e) => { if (e.target.closest("[data-add], [data-inc], [data-dec]")) setTimeout(pintar, 0); });
  $("#show-add").addEventListener("click", () => { window.Tienda.agregar(PRODUCTO, colorActual); pintar(); });
  seccion.querySelectorAll('input[name="color"]').forEach((r) => r.addEventListener("change", () => {
    colorActual = r.value;
    $("#show-color").textContent = r.value;
    aplicarVariante(r.dataset.variant);
  }));
  pintar();

  /* ---------- carga diferida del 3D ---------- */
  let iniciado = false;
  new IntersectionObserver((en, obs) => {
    if (!en[0].isIntersecting || iniciado) return;
    iniciado = true;
    obs.disconnect();
    const s = document.createElement("script");
    s.src = "js/zapatilla-modelo.js";
    s.onload = () => iniciar().catch(fallo);
    s.onerror = fallo;
    document.body.appendChild(s);
  }, { rootMargin: "600px 0px" }).observe(seccion);

  function fallo() {
    $("#show-loading").textContent = "No se pudo cargar el 3D en este navegador.";
  }

  async function iniciar() {
    const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js");
    const { GLTFLoader } = await import("https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/GLTFLoader.js");
    const { RoomEnvironment } = await import("https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/environments/RoomEnvironment.js");

    let dibujar = true;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.01, 50);
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.02).texture;
    pmrem.dispose();
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(-2, 4, 3);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 1.6);
    rim.position.set(3, 1.5, -3);
    scene.add(rim);

    // modelo incrustado en base64 → ArrayBuffer
    const bin = atob(window.ZAPATILLA_GLB);
    const buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    const loader = new GLTFLoader();
    const gltf = await new Promise((ok, mal) => loader.parse(buf.buffer, "", ok, mal));

    // centra y escala a 2 unidades de largo
    const modelo = gltf.scene;
    const caja = new THREE.Box3().setFromObject(modelo);
    const tam = caja.getSize(new THREE.Vector3());
    const escala = 2 / Math.max(tam.x, tam.y, tam.z);
    modelo.scale.setScalar(escala);
    caja.setFromObject(modelo);
    modelo.position.sub(caja.getCenter(new THREE.Vector3()));
    const pivote = new THREE.Group();
    pivote.add(modelo);
    scene.add(pivote);
    const base = caja.min.y - caja.getCenter(new THREE.Vector3()).y;

    // sombra de contacto suave
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, "rgba(0,0,0,.75)");
    grad.addColorStop(0.5, "rgba(0,0,0,.25)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    const sombra = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.3), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
    sombra.rotation.x = -Math.PI / 2;
    sombra.position.y = base - 0.01;
    scene.add(sombra);

    // variantes de color del propio modelo (ejemplo oficial de three.js)
    const parser = gltf.parser;
    const ext = gltf.userData.gltfExtensions && gltf.userData.gltfExtensions.KHR_materials_variants;
    aplicarVariante = (nombre) => {
      if (!ext) return;
      const idx = ext.variants.findIndex((v) => v.name === nombre);
      modelo.traverse(async (o) => {
        if (!o.isMesh || !o.userData.gltfExtensions) return;
        const datos = o.userData.gltfExtensions.KHR_materials_variants;
        if (!datos) return;
        if (!o.userData.materialOriginal) o.userData.materialOriginal = o.material;
        const map = datos.mappings.find((m) => m.variants.includes(idx));
        if (map) { o.material = await parser.getDependency("material", map.material); parser.assignFinalMaterial(o); }
        else o.material = o.userData.materialOriginal;
        dibujar = true;
        renderer.render(scene, camera); // dibuja el color nuevo aunque el bucle esté en pausa
      });
    };
    const elegido = seccion.querySelector('input[name="color"]:checked');
    aplicarVariante(elegido ? elegido.dataset.variant : "street");

    /* ---------- giro: arrastre con inercia + giro lento en reposo ---------- */
    let rotY = -0.6, vel = 0, arrastrando = false, ultimoX = 0, ultimoT = 0, inactivo = 0;
    canvas.addEventListener("pointerdown", (e) => {
      arrastrando = true; ultimoX = e.clientX; ultimoT = performance.now(); vel = 0;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!arrastrando) return;
      const dx = e.clientX - ultimoX, now = performance.now();
      rotY += dx * 0.012;
      vel = (dx * 0.012) / Math.max(1, now - ultimoT) * 16;
      ultimoX = e.clientX; ultimoT = now; inactivo = 0; dibujar = true;
    });
    const soltar = () => { arrastrando = false; };
    canvas.addEventListener("pointerup", soltar);
    canvas.addEventListener("pointercancel", soltar);
    canvas.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { rotY -= 0.3; dibujar = true; }
      if (e.key === "ArrowRight") { rotY += 0.3; dibujar = true; }
    });
    canvas.tabIndex = 0;

    function resize() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.set(0, 0.9, w < 700 ? 6.4 : 5.4);
      camera.lookAt(0, -0.05, 0);
      camera.updateProjectionMatrix();
      dibujar = true;
    }

    let visible = true, raf = 0, ultimo = performance.now();
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - ultimo) / 1000);
      ultimo = now;
      if (!arrastrando) {
        rotY += vel;
        vel *= 0.94;
        inactivo += dt;
        if (!reduced && inactivo > 1.2 && Math.abs(vel) < 0.002) rotY += dt * 0.35; // giro lento en reposo
      }
      if (!dibujar && reduced && !arrastrando && Math.abs(vel) < 1e-4) return;
      pivote.rotation.y = rotY;
      pivote.position.y = reduced ? 0 : Math.sin(now / 900) * 0.03;
      renderer.render(scene, camera);
      dibujar = false;
    }
    new IntersectionObserver((en) => {
      visible = en[0].isIntersecting;
      if (visible && !raf) { ultimo = performance.now(); raf = requestAnimationFrame(frame); }
      else if (!visible && raf) { cancelAnimationFrame(raf); raf = 0; }
    }).observe(canvas);
    window.addEventListener("resize", resize);
    resize();
    renderer.render(scene, camera);
    $("#show-loading").hidden = true;
  }
})();
