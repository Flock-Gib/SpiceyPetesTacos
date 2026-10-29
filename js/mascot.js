/* Spicy Pete's Tacos – "Pete" the 3D taco monster mascot (Three.js).
 * If WebGL or the Three.js CDN is unavailable, the CSS emoji fallback in
 * #mascot-stage stays visible instead. */
import * as THREE from "three";

const stage = document.getElementById("mascot-stage");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const QUIPS = [
  "I'm not a monster. I'm a TACO monster. Totally different paperwork.",
  "Fun fact: I am 40% shell, 60% feelings.",
  "Stop poking me! …Okay, one more.",
  "My salsa recipe is a family secret. Pete's family is also taco-shaped.",
  "Have you tried the Birria Bae? It's my cousin. We don't talk.",
  "If you're reading this, you should be eating a taco.",
  "I'd tell you a taco joke, but it's too cheesy.",
  "Hot sauce isn't a condiment. It's a lifestyle.",
  "Rawr! 👹 …sorry, that was my stomach.",
  "Lettuce turnip the beet! Wait, wrong restaurant.",
  "Nobody tells me what to do. Except the health inspector.",
  "Want to hear my scream? Order the Ghost Pepper Regret.",
];

function say(msg) {
  if (typeof window.petesSay === "function") window.petesSay(msg);
}

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}

/* ---------- Textures ---------- */
function shellTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, "#ffd36b");
  grad.addColorStop(1, "#f0a830");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  // toasty speckles
  for (let i = 0; i < 140; i++) {
    g.fillStyle = `rgba(${120 + Math.random() * 60}, ${60 + Math.random() * 30}, 10, ${0.25 + Math.random() * 0.45})`;
    g.beginPath();
    g.ellipse(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 6, 1 + Math.random() * 4, Math.random() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(0.5, 0.5);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ---------- Build Pete ---------- */
function buildPete() {
  const pete = new THREE.Group();
  const body = new THREE.Group(); // bounces & squashes
  pete.add(body);

  const shellMat = new THREE.MeshStandardMaterial({ map: shellTexture(), roughness: 0.7, metalness: 0.05 });
  const R = 1.5;

  // Half-moon taco shell (two slabs with the fillings sandwiched between)
  const half = new THREE.Shape();
  half.moveTo(-R, 0);
  half.absarc(0, 0, R, Math.PI, Math.PI * 2, false);
  half.lineTo(-R, 0);
  const slabGeo = new THREE.ExtrudeGeometry(half, {
    depth: 0.22, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 4, curveSegments: 48,
  });
  const front = new THREE.Mesh(slabGeo, shellMat);
  front.position.z = 0.45;
  const back = new THREE.Mesh(slabGeo, shellMat);
  back.position.z = -0.75;
  // the fold at the bottom
  const fold = new THREE.Mesh(
    new THREE.CylinderGeometry(R - 0.02, R - 0.02, 1.4, 48, 1, true, Math.PI / 2, Math.PI),
    shellMat
  );
  fold.rotation.x = -Math.PI / 2;
  fold.position.z = -0.15;
  fold.material.side = THREE.DoubleSide;
  body.add(front, back, fold);

  // Seasoned meat
  const meat = new THREE.Mesh(
    new THREE.ExtrudeGeometry(half, { depth: 1.1, bevelEnabled: false, curveSegments: 32 }),
    new THREE.MeshStandardMaterial({ color: 0x7a3b1c, roughness: 0.95 })
  );
  meat.scale.set(0.95, 0.95, 1);
  meat.position.set(0, -0.05, -0.65);
  body.add(meat);

  // Lettuce, tomato, cheese
  const lettuceMat = new THREE.MeshStandardMaterial({ color: 0x5cc23a, roughness: 0.6, flatShading: true });
  const tomatoMat = new THREE.MeshStandardMaterial({ color: 0xe0302a, roughness: 0.4 });
  const cheeseMat = new THREE.MeshStandardMaterial({ color: 0xffc21a, roughness: 0.5 });
  const lettuceGeo = new THREE.IcosahedronGeometry(0.22, 0);
  const tomatoGeo = new THREE.SphereGeometry(0.13, 16, 12);
  const cheeseGeo = new THREE.BoxGeometry(0.05, 0.05, 0.38);
  for (let i = 0; i < 34; i++) {
    const x = -1.35 + (i / 33) * 2.7 + (Math.random() - 0.5) * 0.15;
    const z = -0.6 + Math.random() * 1.1;
    const l = new THREE.Mesh(lettuceGeo, lettuceMat);
    l.position.set(x, 0.08 + Math.random() * 0.12, z);
    l.scale.set(1, 0.6 + Math.random() * 0.5, 1);
    l.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    body.add(l);
  }
  for (let i = 0; i < 9; i++) {
    const t = new THREE.Mesh(tomatoGeo, tomatoMat);
    t.position.set(-1.15 + Math.random() * 2.3, 0.22, -0.4 + Math.random() * 0.8);
    t.scale.y = 0.6;
    body.add(t);
  }
  for (let i = 0; i < 26; i++) {
    const c = new THREE.Mesh(cheeseGeo, cheeseMat);
    c.position.set(-1.2 + Math.random() * 2.4, 0.3 + Math.random() * 0.08, -0.3 + Math.random() * 0.6);
    c.rotation.set(Math.random(), Math.random() * 3, Math.random());
    body.add(c);
  }

  // Face on the front slab
  const faceZ = 0.45 + 0.22 + 0.081;
  const mouthShape = new THREE.Shape();
  mouthShape.moveTo(-0.5, 0);
  mouthShape.absellipse(0, 0, 0.5, 0.38, Math.PI, Math.PI * 2, false);
  mouthShape.lineTo(-0.5, 0);
  const mouth = new THREE.Group();
  mouth.add(new THREE.Mesh(new THREE.ShapeGeometry(mouthShape, 24), new THREE.MeshBasicMaterial({ color: 0x2b0505 })));
  const tongue = new THREE.Mesh(new THREE.CircleGeometry(0.2, 24), new THREE.MeshBasicMaterial({ color: 0xff5f7a }));
  tongue.scale.set(1.2, 0.6, 1);
  tongue.position.set(0.05, -0.26, 0.002);
  mouth.add(tongue);
  const fangMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  [-0.3, -0.1, 0.12, 0.32].forEach((x, i) => {
    const big = i === 0 || i === 3;
    const fang = new THREE.Mesh(new THREE.ConeGeometry(big ? 0.07 : 0.045, big ? 0.22 : 0.12, 12), fangMat);
    fang.rotation.x = Math.PI; // point down
    fang.position.set(x, big ? -0.1 : -0.06, 0.03);
    mouth.add(fang);
  });
  mouth.position.set(0, -0.35, faceZ);
  body.add(mouth);

  const blushMat = new THREE.MeshBasicMaterial({ color: 0xff7a7a, transparent: true, opacity: 0.55 });
  [-0.85, 0.85].forEach((x) => {
    const b = new THREE.Mesh(new THREE.CircleGeometry(0.17, 24), blushMat);
    b.scale.y = 0.65;
    b.position.set(x, -0.35, faceZ);
    body.add(b);
  });

  // Googly eyes on stalks
  const eyes = [];
  const eyeWhite = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 });
  const irisMat = new THREE.MeshStandardMaterial({ color: 0x2e9e4f, roughness: 0.3 });
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
  const stalkMat = new THREE.MeshStandardMaterial({ color: 0x4caa2e, roughness: 0.6 });
  [[-0.55, 0.45], [0.6, 0.38]].forEach(([x, r], i) => {
    const eye = new THREE.Group();
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.6, 10), stalkMat);
    stalk.position.y = -0.3;
    eye.add(stalk);
    const ball = new THREE.Group();
    ball.position.y = 0.1;
    ball.add(new THREE.Mesh(new THREE.SphereGeometry(r, 32, 24), eyeWhite));
    const look = new THREE.Group(); // rotated toward the cursor
    const iris = new THREE.Mesh(new THREE.SphereGeometry(r * 0.48, 24, 16), irisMat);
    iris.position.z = r * 0.86;
    iris.scale.z = 0.5;
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(r * 0.26, 16, 12), pupilMat);
    pupil.position.z = r * 1.0;
    pupil.scale.z = 0.4;
    const glint = new THREE.Mesh(new THREE.SphereGeometry(r * 0.08, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    glint.position.set(r * 0.12, r * 0.14, r * 1.08);
    look.add(iris, pupil, glint);
    ball.add(look);
    // angry-ish brow
    const brow = new THREE.Mesh(new THREE.BoxGeometry(r * 1.4, 0.09, 0.12), new THREE.MeshStandardMaterial({ color: 0x3a1a0a }));
    brow.position.set(0, r + 0.08, r * 0.4);
    brow.rotation.z = i === 0 ? -0.3 : 0.3;
    ball.add(brow);
    eye.add(ball);
    eye.position.set(x, 0.85, 0.1);
    eye.rotation.z = i === 0 ? 0.15 : -0.15;
    body.add(eye);
    eyes.push({ group: eye, ball, look, brow });
  });

  // Chili-pepper horns
  const chiliMat = new THREE.MeshStandardMaterial({ color: 0xd8141a, roughness: 0.35 });
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x2f7d1f });
  [-1.1, 1.1].forEach((x) => {
    const horn = new THREE.Group();
    const chili = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.6, 16), chiliMat);
    chili.position.y = 0.3;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.12, 8), stemMat);
    horn.add(chili, stem);
    horn.position.set(x, 0.3, -0.1);
    horn.rotation.z = x < 0 ? 0.45 : -0.45;
    body.add(horn);
  });

  // Arms
  const limbMat = new THREE.MeshStandardMaterial({ color: 0xf0a830, roughness: 0.7 });
  const arms = [-1, 1].map((side) => {
    const shoulder = new THREE.Group();
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.6, 10), limbMat);
    arm.position.y = -0.3;
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12), limbMat);
    hand.position.y = -0.62;
    shoulder.add(arm, hand);
    shoulder.position.set(side * 1.42, -0.45, 0);
    shoulder.rotation.z = side * 0.9;
    body.add(shoulder);
    return shoulder;
  });

  // Legs + sneakers
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0xc81d25, roughness: 0.5 });
  [-0.5, 0.5].forEach((x) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.45, 10), limbMat);
    leg.position.set(x, -1.65, -0.1);
    const shoe = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), shoeMat);
    shoe.scale.set(1.2, 0.6, 1.6);
    shoe.position.set(x, -1.88, 0.0);
    pete.add(leg, shoe);
  });

  return { pete, body, eyes, arms, mouth };
}

function init() {
  if (!stage || !webglAvailable()) return;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  stage.appendChild(renderer.domElement);
  renderer.domElement.setAttribute("aria-hidden", "true");

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0.2, 8.5);
  camera.lookAt(0, -0.2, 0);

  scene.add(new THREE.HemisphereLight(0xfff1d6, 0x5a2a12, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(3, 5, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xff6a00, 1.2);
  rim.position.set(-4, 2, -4);
  scene.add(rim);

  const { pete, body, eyes, arms, mouth } = buildPete();
  scene.add(pete);

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.4, 32),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28 })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -2.08;
  shadow.scale.set(1, 0.45, 1);
  scene.add(shadow);

  stage.classList.add("has-3d");

  function resize() {
    const { clientWidth: w, clientHeight: h } = stage;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(stage);
  else window.addEventListener("resize", resize);

  // Pointer tracking (whole window so Pete watches you scroll the menu)
  const pointer = { x: 0, y: 0 };
  window.addEventListener("pointermove", (e) => {
    const rect = stage.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    pointer.x = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth / 2)));
    pointer.y = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight / 2)));
  });

  // Click / tap / keyboard poke
  let jumpT = -1;
  let talkT = -1;
  let spin = 0;
  let quipIdx = Math.floor(Math.random() * QUIPS.length);
  function poke() {
    jumpT = 0;
    talkT = 0;
    spin += Math.PI * 2;
    quipIdx = (quipIdx + 1 + Math.floor(Math.random() * 3)) % QUIPS.length;
    say(QUIPS[quipIdx]);
  }
  stage.tabIndex = 0;
  stage.addEventListener("click", poke);
  stage.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      poke();
    }
  });

  // Only render while visible
  let visible = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
    }).observe(stage);
  }

  const clock = new THREE.Clock();
  let nextBlink = 2 + Math.random() * 3;
  let blinkT = -1;
  let spinCur = 0;
  let wave = 0;

  function tick() {
    requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);
    if (!visible) return;
    const t = clock.elapsedTime;
    const motion = reduceMotion ? 0.25 : 1;

    // Idle bob & sway
    body.position.y = Math.sin(t * 2.2) * 0.08 * motion;
    body.rotation.z = Math.sin(t * 1.3) * 0.04 * motion;

    // Turn toward the cursor (+ any spin from pokes)
    spinCur += (spin - spinCur) * Math.min(1, dt * 4);
    const targetY = pointer.x * 0.6;
    const targetX = pointer.y * 0.25;
    pete.rotation.y += (targetY + spinCur - pete.rotation.y) * Math.min(1, dt * 5);
    pete.rotation.x += (targetX - pete.rotation.x) * Math.min(1, dt * 5);

    // Eyes follow the cursor
    eyes.forEach(({ look }) => {
      look.rotation.y += (pointer.x * 0.7 - look.rotation.y) * Math.min(1, dt * 10);
      look.rotation.x += (pointer.y * 0.6 - look.rotation.x) * Math.min(1, dt * 10);
    });

    // Blink
    nextBlink -= dt;
    if (nextBlink <= 0 && blinkT < 0) blinkT = 0;
    if (blinkT >= 0) {
      blinkT += dt;
      const s = blinkT < 0.08 ? 1 - blinkT / 0.08 : Math.min(1, (blinkT - 0.08) / 0.08);
      eyes.forEach(({ ball }) => (ball.scale.y = Math.max(0.08, s)));
      if (blinkT > 0.16) {
        blinkT = -1;
        nextBlink = 2 + Math.random() * 4;
        eyes.forEach(({ ball }) => (ball.scale.y = 1));
      }
    }

    // Jump + squash when poked
    if (jumpT >= 0) {
      jumpT += dt;
      const p = jumpT / 0.7;
      if (p >= 1) {
        jumpT = -1;
        pete.position.y = 0;
        body.scale.set(1, 1, 1);
      } else {
        pete.position.y = Math.sin(p * Math.PI) * 0.9 * motion;
        const squash = 1 + Math.sin(p * Math.PI * 2) * 0.12 * motion;
        body.scale.set(1 / squash, squash, 1 / squash);
      }
    }
    shadow.scale.set(1 - pete.position.y * 0.3, 0.45 - pete.position.y * 0.12, 1);

    // Talk (mouth flaps) after a poke, otherwise idle chomp
    if (talkT >= 0) {
      talkT += dt;
      mouth.scale.y = 0.6 + Math.abs(Math.sin(talkT * 18)) * 0.7;
      if (talkT > 1.6) talkT = -1;
    } else {
      mouth.scale.y = 1 + Math.sin(t * 1.7) * 0.08;
    }

    // Arms: right hand waves, left hand wiggles
    wave += dt * (jumpT >= 0 ? 14 : 4);
    arms[1].rotation.z = 2.3 + Math.sin(wave) * 0.45 * motion;
    arms[0].rotation.z = -0.9 + Math.sin(t * 2.2 + 1) * 0.15 * motion;

    renderer.render(scene, camera);
  }
  tick();

  setTimeout(() => say("Hola, amigo! I'm Pete. I'll be watching you… choose tacos. 👀"), 1200);
}

try {
  init();
} catch (err) {
  // Keep the CSS fallback mascot if anything goes wrong
  console.warn("Pete's 3D mode failed, using fallback:", err);
}
