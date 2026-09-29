import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const container = document.querySelector('#canvas-container');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x02060c);
scene.fog = new THREE.FogExp2(0x071421, 0.003);
const camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, 0.1, 100);
camera.position.set(6.8, 5.1, 9.2);
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
} catch (error) {
  window.showStartupError('No se pudo iniciar WebGL. Comprueba que la aceleración gráfica esté activa.');
  throw error;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.shadowMap.enabled = false;
container.appendChild(renderer.domElement);
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), .52, .38, .92);
bloomPass.enabled = !(navigator.hardwareConcurrency <= 4 || (navigator.deviceMemory && navigator.deviceMemory <= 4));
composer.addPass(bloomPass);
const labels = new CSS2DRenderer();
labels.setSize(innerWidth, innerHeight);
labels.domElement.className = 'labels-layer';
container.appendChild(labels.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 2.35, 0);
controls.enableDamping = true;
controls.minDistance = 5;
controls.maxDistance = 15;
controls.maxPolarAngle = Math.PI * 0.54;

scene.add(new THREE.AmbientLight(0x7bdfff, .12));

const cyan = 0x38d8ff, mint = 0x5fffc8, charcoal = 0x181d27;
const hologramMaterials = new Map();
function hologramMaterial(color = cyan, opacity = .72) {
  const key = color.toString(16);
  if (!hologramMaterials.has(key)) {
    hologramMaterials.set(key, new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(color) }, uTime: { value: 0 }, uOpacity: { value: opacity }, uFlickerEnabled: { value: reducedMotion ? 0 : 1 } },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDirection;
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vec4 viewPosition = viewMatrix * worldPosition;
          vNormal = normalize(normalMatrix * normal);
          vViewDirection = normalize(-viewPosition.xyz);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * viewPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uTime;
        uniform float uOpacity;
        uniform float uFlickerEnabled;
        varying vec3 vNormal;
        varying vec3 vViewDirection;
        varying vec3 vWorldPosition;
        void main() {
          float fresnel = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewDirection))), 3.0);
          float scan = smoothstep(.92, 1.0, sin(vWorldPosition.y * 105.0 - uTime * 3.2));
          float flicker = 1.0 + sin(uTime * 4.0) * .05 * uFlickerEnabled;
          float alpha = (.018 + fresnel * .62 + scan * .13) * uOpacity * flicker;
          float brightness = .24 + fresnel * 1.8 + scan * .55;
          gl_FragColor = vec4(uColor * brightness * flicker, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      toneMapped: false
    }));
  }
  return hologramMaterials.get(key);
}
const shellMat = hologramMaterial();
const edgeMat = new THREE.MeshBasicMaterial({ color: mint, wireframe: true, transparent: true, opacity: .42, depthWrite: false, blending: THREE.AdditiveBlending });
const glowMat = hologramMaterial();
const darkMat = hologramMaterial();
const woodMat = hologramMaterial();
const crispEdgeMat = new THREE.LineBasicMaterial({ color: cyan, transparent: true, opacity: .72, blending: THREE.AdditiveBlending });
const softEdgeMat = new THREE.LineBasicMaterial({ color: cyan, transparent: true, opacity: .34, blending: THREE.AdditiveBlending });
const machine = new THREE.Group();
scene.add(machine);

const energyPlatform = new THREE.Group();
machine.add(energyPlatform);
const platformDisc = new THREE.Mesh(
  new THREE.CylinderGeometry(2.25, 2.25, .045, 96),
  new THREE.MeshBasicMaterial({ color: 0x063449, transparent: true, opacity: .22 })
);
platformDisc.position.y = .055;
energyPlatform.add(platformDisc);
const platformRing = new THREE.Mesh(
  new THREE.TorusGeometry(2.12, .045, 12, 96),
  new THREE.MeshBasicMaterial({ color: 0x248fff, transparent: true, opacity: .82, blending: THREE.AdditiveBlending })
);
platformRing.rotation.x = Math.PI / 2;
platformRing.position.y = .1;
energyPlatform.add(platformRing);
const platformRingInner = new THREE.Mesh(
  new THREE.TorusGeometry(1.68, .018, 8, 96),
  new THREE.MeshBasicMaterial({ color: 0xa6d4ff, transparent: true, opacity: .52, blending: THREE.AdditiveBlending })
);
platformRingInner.rotation.x = Math.PI / 2;
platformRingInner.position.y = .11;
energyPlatform.add(platformRingInner);
const platformRingOuter = new THREE.Mesh(
  new THREE.TorusGeometry(1.28, .012, 8, 96),
  new THREE.MeshBasicMaterial({ color: 0x38d8ff, transparent: true, opacity: .42, blending: THREE.AdditiveBlending, depthWrite: false })
);
platformRingOuter.rotation.x = Math.PI / 2;
platformRingOuter.position.y = .115;
energyPlatform.add(platformRingOuter);
const projectionBeam = new THREE.Mesh(
  new THREE.CylinderGeometry(.2, .82, 4.2, 48, 1, true),
  new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(cyan) } },
    vertexShader: 'varying float vHeight; void main() { vHeight = uv.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform vec3 uColor; varying float vHeight; void main() { float alpha = (1.0 - vHeight) * .035; gl_FragColor = vec4(uColor, alpha); }',
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    toneMapped: false
  })
);
projectionBeam.position.y = 2.18;
energyPlatform.add(projectionBeam);
const platformLight = new THREE.PointLight(0x2e8cff, 8, 6);
platformLight.position.y = .35;
energyPlatform.add(platformLight);
const impactLight = new THREE.PointLight(cyan, 0, 3.2);
impactLight.position.set(0, 2.55, 0);
machine.add(impactLight);

const globalScan = new THREE.Mesh(
  new THREE.TorusGeometry(1.32, .012, 6, 96),
  new THREE.MeshBasicMaterial({ color: cyan, transparent: true, opacity: .82, blending: THREE.AdditiveBlending, depthWrite: false })
);
globalScan.rotation.x = Math.PI / 2;
globalScan.position.y = .3;
machine.add(globalScan);

function addGlowEdges(mesh) {
  const crisp = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), crispEdgeMat);
  crisp.position.set(0, 0, 0); mesh.add(crisp);
  const soft = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), softEdgeMat);
  soft.scale.setScalar(1.012); mesh.add(soft);
}

function box(name, size, position, material = darkMat, parent = machine) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.name = name; mesh.position.set(...position); parent.add(mesh); addGlowEdges(mesh); return mesh;
}
function highlightableBox(name, size, position, material) {
  return box(name, size, position, material);
}
function lineBox(name, size, position, material = woodMat) { return box(name, size, position, material); }
function label(text, position, color = 'cyan', description = '') {
  const el = document.createElement('div'); el.className = `component-label ${color}${position[0] < 0 ? ' label-left' : ''}`; el.innerHTML = `<b>${text}</b><span>${description}</span>`;
  const obj = new CSS2DObject(el); obj.position.set(...position); obj.userData = { text, description }; machine.add(obj); return obj;
}

// 100 cm PET-bottle silhouette: the outer carton follows the same profile.
const profile = [[0.0,0.0],[0.94,0.0],[1.0,.18],[1.0,2.35],[.94,2.55],[.7,2.7],[.7,3.05],[.44,3.2],[.44,3.5],[.31,3.62],[.31,3.92],[.2,4.04],[0.0,4.04]];
const lathePoints = profile.map(([r,y]) => new THREE.Vector2(r, y));
const bottle = new THREE.Mesh(new THREE.LatheGeometry(lathePoints, 64), hologramMaterial());
bottle.position.y = .34; machine.add(bottle);
const bottleWire = new THREE.Mesh(new THREE.LatheGeometry(lathePoints, 32), edgeMat); bottleWire.position.copy(bottle.position); machine.add(bottleWire);

// Closed exterior panels; the two camera-facing sides open in technical view.
const panels = new THREE.Group(); machine.add(panels);
const shellFaces = {};
for (const [x,z,rot,face] of [[-1.05,0,0,'left'],[1.05,0,0,'right'],[0,-1.05,Math.PI / 2,'back'],[0,1.05,Math.PI / 2,'front']]) {
  const faceGroup = new THREE.Group(); faceGroup.name = `shell-${face}`; panels.add(faceGroup); shellFaces[face] = faceGroup;
  const panel = new THREE.Mesh(new THREE.BoxGeometry(2.15, 4.25, .12), shellMat); panel.position.set(x,2.47,z); panel.rotation.y = rot; faceGroup.add(panel);
  const outline = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.15,4.25,.12)), new THREE.LineBasicMaterial({ color: cyan, transparent:true, opacity:.82, blending:THREE.AdditiveBlending })); outline.position.copy(panel.position); outline.rotation.copy(panel.rotation); faceGroup.add(outline);
}
// Wooden internal skeleton.
for (const x of [-.82,.82]) for (const z of [-.82,.82]) lineBox('wooden-skeleton', [.1,4.1,.1], [x,2.42,z]);
for (const y of [.48, 2.35, 4.38]) for (const z of [-.86,.86]) lineBox('wooden-crossbar', [1.8,.1,.1], [0,y,z]);
for (const y of [.48, 2.35, 4.38]) for (const x of [-.86,.86]) lineBox('wooden-crossbar', [.1,.1,1.8], [x,y,0]);

// Hopper, chamber, compactor and lower container.
box('base', [2.1,.25,2.1], [0,.18,0], darkMat);
const hopper = new THREE.Mesh(new THREE.CylinderGeometry(.75,1.12,.46,4), hologramMaterial()); hopper.position.set(0,4.34,0); hopper.rotation.y=Math.PI/4; machine.add(hopper); addGlowEdges(hopper);
box('compaction-chamber', [1.65,1.05,1.65], [0,2.75,0], hologramMaterial());
const plate = highlightableBox('compactor-plate', [1.32,.16,1.32], [0,3.18,0], glowMat.clone());
const containerBottom = box('lower-container', [1.7,.12,1.7], [0,.31,0], darkMat);
for (const [x,z,width,depth] of [[0,.81,1.7,.08],[0,-.81,1.7,.08],[.81,0,.08,1.7],[-.81,0,.08,1.7]]) box('lower-container-wall', [width,.75,depth], [x,.72,z], darkMat);
// Servo SG90 on the side with a linkage.
const servo = highlightableBox('servo', [.42,.6,.3], [1.28,3.05,.15], hologramMaterial());
const servoArm = highlightableBox('servo-arm', [.08,.75,.08], [1.28,3.52,.15], glowMat); servoArm.rotation.z = -.2;
box('servo-mounting-plate', [.58,.1,.48], [1.28,2.72,-.08], woodMat);
const linkageRod = new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,1,12), glowMat);
linkageRod.name = 'servo-linkage'; machine.add(linkageRod);
const linkageJoints = [0,1].map(() => {
  const joint = new THREE.Mesh(new THREE.SphereGeometry(.075,16,12), glowMat);
  machine.add(joint); return joint;
});
const linkageAxis = new THREE.Vector3(0,1,0);
const linkageDirection = new THREE.Vector3();
const armEndOffset = new THREE.Vector3(0,-.375,0);
function updateServoLinkage() {
  const plateEnd = new THREE.Vector3(.66, plate.position.y + .08, .15);
  const armEnd = armEndOffset.clone().applyEuler(servoArm.rotation).add(servoArm.position);
  linkageDirection.subVectors(armEnd, plateEnd);
  linkageRod.position.copy(plateEnd).add(armEnd).multiplyScalar(.5);
  linkageRod.quaternion.setFromUnitVectors(linkageAxis, linkageDirection.clone().normalize());
  linkageRod.scale.y = linkageDirection.length();
  linkageJoints[0].position.copy(plateEnd);
  linkageJoints[1].position.copy(armEnd);
}
// IR sensors and camera.
const irTop = highlightableBox('ir-top', [.34,.12,.18], [0,4.03,.72], glowMat.clone());
const irZone = highlightableBox('ir-zone', [.34,.12,.18], [0,2.67,.82], glowMat.clone());
box('ir-top-mounting-plate', [.5,.07,.32], [0,4.13,.72], woodMat);
box('ir-zone-mounting-plate', [.5,.07,.32], [0,2.77,.82], woodMat);
const cameraUnit = highlightableBox('camera', [.42,.25,.25], [-1.02,3.92,.5], darkMat.clone()); const lens = new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.03,20), hologramMaterial()); lens.rotation.x=Math.PI/2; lens.position.set(-1.02,3.92,.66); machine.add(lens);
// LCD and status LEDs.
box('lcd-mounting-plate', [.92,.52,.08], [1.08,1.9,.78], woodMat);
const lcd = box('lcd', [.72,.32,.1], [1.08,1.9,.87], hologramMaterial());
box('status-led-mounting-plate', [.56,.14,.08], [1.08,2.18,.79], woodMat);
for (let i=0;i<3;i++) { const led = new THREE.Mesh(new THREE.SphereGeometry(.045,10,10), new THREE.MeshBasicMaterial({color:i===0?mint:cyan, transparent:true, opacity:.95, toneMapped:false, blending:THREE.AdditiveBlending})); led.position.set(1.08 + (i-.9)*.14,2.18,.91); machine.add(led); }
box('buzzer-mounting-plate', [.42,.1,.08], [1.15,1.44,.79], woodMat);
const buzzer = new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.08,20), hologramMaterial()); buzzer.rotation.x=Math.PI/2; buzzer.position.set(1.15,1.44,.89); machine.add(buzzer);

const labelData = [
  ['TOLVA / ENTRADA',[-1.42,4.92,0], 'cyan','Recepción de botella PET'],
  ['SENSOR IR SUPERIOR',[-1.42,4.35,.72], 'mint','Detecta la inserción'],
  ['ESQUELETO DE MADERA',[-1.42,3.78,.25], 'mint','Listones internos de refuerzo'],
  ['CÁMARA FACIAL',[-1.42,3.21,.58], 'mint','Reconocimiento simulado'],
  ['ESTRUCTURA DE CARTÓN',[-1.42,2.64,0], 'cyan','Panel PET reciclado · acabado negro mate'],
  ['PLATO DE COMPACTACIÓN',[-1.42,2.07,0], 'cyan','Carrera vertical servo'],
  ['SERVO SG90',[1.85,3.28,.15], 'mint','Actuador de 180°'],
  ['SENSOR IR COMPACTACIÓN',[1.55,2.82,.8], 'mint','Confirma zona despejada'],
  ['LEDs DE ESTADO',[1.55,2.25,.94], 'mint','Listo · proceso · alerta'],
  ['LCD 16×2',[1.7,1.87,.94], 'cyan','Estado · puntos · usuario'],
  ['BUZZER',[1.65,1.4,.96], 'cyan','Confirmación sonora'],
  ['CONTENEDOR INFERIOR',[2.05,.72,0], 'cyan','Material compactado']
];
const labelObjects = labelData.map(([text,pos,color,desc]) => label(text,pos,color,desc));

const pet = new THREE.Group(); machine.add(pet);
pet.position.set(0, 4.36, 0);
let petMaterial = hologramMaterial(mint, .88);
const petGlowMaterial = new THREE.LineBasicMaterial({ color: mint, transparent: true, opacity: .72, blending: THREE.AdditiveBlending });
const petWireMaterial = new THREE.MeshBasicMaterial({ color: mint, transparent: true, opacity: .12, wireframe: true, depthWrite: false, blending: THREE.AdditiveBlending });
const petProfile = [[0,.025],[.2,.025],[.27,.045],[.29,.09],[.3,.13],[.3,.19],[.29,.23],[.3,.27],[.3,.33],[.29,.38],[.3,.43],[.3,.91],[.29,.97],[.29,1.02],[.27,1.07],[.23,1.12],[.19,1.17],[.15,1.21],[.13,1.26],[.13,1.48],[.16,1.48],[.16,1.56],[0,1.56]];
const petBody = new THREE.Mesh(new THREE.LatheGeometry(petProfile.map(([radius,height]) => new THREE.Vector2(radius,height)), 64), petMaterial); pet.add(petBody);
const petBodyGlow = new THREE.LineSegments(new THREE.EdgesGeometry(petBody.geometry, 24), petGlowMaterial); petBodyGlow.scale.setScalar(1.006); pet.add(petBodyGlow);
const petBodyWire = new THREE.Mesh(petBody.geometry, petWireMaterial); petBodyWire.scale.setScalar(1.003); pet.add(petBodyWire);
const petCap = new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,.1,32), petMaterial); petCap.position.y = 1.58; pet.add(petCap);
function setPetHologramColor(color) {
  petMaterial = hologramMaterial(color, .88);
  petBody.material = petMaterial;
  petCap.material = petMaterial;
}
pet.visible=false;

const particlePositions = new Float32Array(36 * 3);
for (let i = 0; i < particlePositions.length; i += 3) { particlePositions[i] = (Math.random() - .5) * 1.5; particlePositions[i + 1] = 2.35 + Math.random() * .9; particlePositions[i + 2] = (Math.random() - .5) * 1.5; }
const particleGeometry = new THREE.BufferGeometry(); particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const particleMaterial = new THREE.PointsMaterial({ color: cyan, size: .045, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
const particles = new THREE.Points(particleGeometry, particleMaterial); machine.add(particles);
const dustPositions = new Float32Array(150 * 3);
for (let i = 0; i < dustPositions.length; i += 3) { dustPositions[i] = (Math.random() - .5) * 2.8; dustPositions[i + 1] = .25 + Math.random() * 4.4; dustPositions[i + 2] = (Math.random() - .5) * 2.8; }
const dustGeometry = new THREE.BufferGeometry(); dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
const dustMaterial = new THREE.PointsMaterial({ color: cyan, size: .018, transparent: true, opacity: .18, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
const dust = new THREE.Points(dustGeometry, dustMaterial); machine.add(dust);
const impactRing = new THREE.Mesh(new THREE.TorusGeometry(.68, .025, 8, 40), new THREE.MeshBasicMaterial({ color: 0x8ac8ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending }));
impactRing.rotation.x = Math.PI / 2;
impactRing.position.set(0, 2.5, 0);
machine.add(impactRing);

const status = document.querySelector('#status-text'), insertBtn = document.querySelector('#insert-btn'), toggleBtn = document.querySelector('#explode-btn'), viewBtn = document.querySelector('#view-btn');
const counter = document.querySelector('#counter'), points = document.querySelector('#points'), progress = document.querySelector('#daily-progress');
const phaseDetail = document.querySelector('#phase-detail'), userState = document.querySelector('#user-state'), userBadge = document.querySelector('#user-badge');
const uiPanel = document.querySelector('#ui-panel');
const ledObjects = [...document.querySelectorAll('.status-leds .led')];
const simulation = { phase: 'waiting', elapsed: 0, duration: 0, busy: false, userVerified: false, userExists: true, attempts: 0, processed: 3, points: 1240, validBottle: true };
const phases = { face: 4.6, profile: 2.1, register: 2.2, verify: 2.5, insert: 3.4, topSensor: 2.4, validate: 3.6, descend: 2.6, zoneSensor: 2.3, compress: 5.4, impact: 2.4, lift: 2.5, transfer: 2.5, points: 2.8, return: 2.0, reject: 2.2 };
let showLabels = false;
let internalView = false;
let cameraTween = null;
viewBtn.setAttribute('aria-pressed', 'false');

function setViewMode(nextInternalView) {
  if (nextInternalView === internalView) return;
  internalView = nextInternalView;
  const cameraPosition = nextInternalView ? new THREE.Vector3(6.2, 4.9, 8.4) : new THREE.Vector3(6.8, 5.1, 9.2);
  const cameraTarget = nextInternalView ? new THREE.Vector3(0, 2.45, 0) : new THREE.Vector3(0, 2.35, 0);
  cameraTween = {
    elapsed: 0,
    duration: 1.35,
    fromPosition: camera.position.clone().sub(previousCameraOffset),
    toPosition: cameraPosition,
    fromTarget: controls.target.clone(),
    toTarget: cameraTarget
  };
  if (nextInternalView) Object.values(shellFaces).forEach(face => { face.visible = true; });
  controls.enabled = false;
  viewBtn.setAttribute('aria-pressed', String(nextInternalView));
  viewBtn.innerHTML = `<span class="button-icon">◉</span> Vista ${nextInternalView ? 'Interna' : 'Exterior'}`;
}

viewBtn.addEventListener('click', () => setViewMode(!internalView));

function updateCameraTransition(delta) {
  if (!cameraTween) return;
  cameraTween.elapsed = Math.min(cameraTween.elapsed + delta, cameraTween.duration);
  const amount = easeInOut(cameraTween.elapsed / cameraTween.duration);
  camera.position.lerpVectors(cameraTween.fromPosition, cameraTween.toPosition, amount);
  controls.target.lerpVectors(cameraTween.fromTarget, cameraTween.toTarget, amount);
  const panelOffset = internalView ? easeOut(amount) : 1 - easeInOut(amount);
  shellFaces.front.position.z = panelOffset;
  shellFaces.right.position.x = panelOffset;
  if (cameraTween.elapsed >= cameraTween.duration) {
    if (!internalView) {
      shellFaces.front.position.z = 0;
      shellFaces.right.position.x = 0;
      shellFaces.front.visible = true;
      shellFaces.right.visible = true;
    }
    cameraTween = null;
    controls.enabled = true;
  }
}

const clamp01 = value => Math.min(Math.max(value, 0), 1);
const easeInOut = value => value < .5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
const easeOut = value => 1 - Math.pow(1 - value, 3);
const lerp = (from, to, amount) => from + (to - from) * amount;
function setStatus(text, active=false, detail='') { status.textContent=text; phaseDetail.textContent=detail; document.querySelector('#led-idle').classList.toggle('on',!active); document.querySelector('#led-active').classList.toggle('on',active); document.querySelector('#led-error').classList.remove('on'); }
function setComponentActive(component, active) {
  if (!component) return;
  component.scale.setScalar(active ? 1.22 : 1);
  if (component.material.uniforms?.uOpacity && component.material !== glowMat && component.material !== darkMat) {
    component.material.uniforms.uOpacity.value = active ? .92 : .48;
    component.material.uniforms.uColor.value.setHex(active ? 0x8ff4ff : cyan);
  }
}
function beginPhase(name) {
  simulation.phase=name; simulation.elapsed=0; simulation.duration=phases[name];
  points.style.color = '';
  points.style.textShadow = '';
  points.style.transform = '';
  uiPanel.style.boxShadow = '';
  impactRing.material.color.setHex(0x8ac8ff);
  const phaseInfo = {
    face:['RECONOCIENDO','Cámara activa · escaneo facial en progreso'], profile:['CARGANDO PERFIL','Usuario existente · cargando puntos'], register:['REGISTRANDO USUARIO','Nuevo usuario · nombre y grado'], verify:['USUARIO VERIFICADO','Identidad confirmada · inserta la botella'], insert:['INSERTANDO BOTELLA','La botella entra por la tolva'],
    topSensor:['SENSOR IR SUPERIOR','Detección confirmada · botella localizada'], validate:['VALIDANDO BOTELLA','Sensores verifican material plástico PET'], descend:['DESCENDIENDO','Botella válida · baja a la cámara'], zoneSensor:['SENSOR IR DE ZONA','Cámara despejada · botella en posición'],
    compress:['COMPACTANDO','Servo SG90 acciona el plato hacia abajo'], impact:['COMPACTACIÓN COMPLETA','Presión máxima · material deformado'], lift:['PLATO SUBIENDO','El plato libera la botella compactada'],
    transfer:['TRASLADO AL CONTENEDOR','Botella compactada cae al depósito inferior'], points:['PUNTOS SUMADOS','Recompensa registrada para Alex Morgan'], return:['ESPERANDO USUARIO','Cámara activa · acércate para comenzar'], reject:['ERROR – BOTELLA NO VÁLIDA','Material rechazado · retirando botella']
  }[name];
  const isWaiting = name === 'return' || name === 'waiting';
  setStatus(phaseInfo[0], !isWaiting && name !== 'reject', phaseInfo[1]);
  if (name === 'face') { userState.textContent='Reconocimiento facial'; userBadge.textContent='ESCANEANDO'; }
  if (name === 'profile') { userState.textContent='Usuario existente'; userBadge.textContent='PUNTOS CARGADOS'; }
  if (name === 'register') { userState.textContent='Registro nuevo'; userBadge.textContent='NOMBRE + GRADO'; }
  if (name === 'verify') { userState.textContent='Verificando identidad'; userBadge.textContent='CONFIRMANDO'; simulation.userVerified=false; insertBtn.disabled=true; }
  if (name === 'return') { userState.textContent='Perfil preparado'; userBadge.textContent='EN ESPERA'; simulation.userVerified=false; insertBtn.disabled=true; }
  if (name === 'reject') { userBadge.textContent='REVISAR'; document.querySelector('#led-error').classList.add('on'); }
  const compactorActive = name === 'compress' || name === 'impact' || name === 'lift';
  setComponentActive(cameraUnit, name === 'face' || name === 'profile' || name === 'verify');
  setComponentActive(irTop, name === 'topSensor'); setComponentActive(irZone, name === 'zoneSensor');
  setComponentActive(servo, compactorActive); setComponentActive(servoArm, compactorActive); setComponentActive(plate, compactorActive);
}
function startUserRecognition() { if (simulation.busy || simulation.userVerified) return; simulation.busy=true; beginPhase('face'); }
function startSimulation() {
  if (simulation.busy || !simulation.userVerified || simulation.phase !== 'verify') return;
  simulation.busy = true;
  simulation.attempts += 1;
  simulation.validBottle = simulation.attempts % 4 !== 0;
  insertBtn.disabled = true;
  pet.visible = true;
  pet.position.y = 4.36;
  pet.scale.set(1, 1, 1);
  setPetHologramColor(mint);
  petMaterial.uniforms.uOpacity.value = .95;
  petWireMaterial.opacity = .3;
  particleMaterial.color.setHex(cyan);
  particles.position.y = 0;
  beginPhase('insert');
}
function finishSimulation() {
  simulation.userVerified = false;
  pet.visible = false;
  pet.position.y = 4.36;
  pet.scale.set(1, 1, 1);
  setPetHologramColor(mint);
  petMaterial.uniforms.uOpacity.value = .88;
  petWireMaterial.opacity = .3;
  plate.position.y = 3.18;
  servoArm.rotation.z = -.2;
  particleMaterial.opacity = 0;
  impactRing.material.opacity = 0;
  beginPhase('return');
}
function updateSimulation(delta) {
  if (!simulation.busy) return;
  const simulationDelta = Math.min(delta, .25);
  simulation.elapsed += simulationDelta;
  const progress01 = clamp01(simulation.elapsed / simulation.duration);
  const smooth = easeInOut(progress01);
  const cinematicPhase = simulation.phase === 'face' || simulation.phase === 'validate' || simulation.phase === 'compress' || simulation.phase === 'impact' || simulation.phase === 'points';
  const focusEnergy = simulation.phase === 'compress' || simulation.phase === 'impact' ? 1 : cinematicPhase ? .55 : .2;
  platformRing.rotation.z += simulationDelta * (.35 + focusEnergy * 1.8);
  platformRingInner.rotation.z -= simulationDelta * (.6 + focusEnergy * 2.4);
  platformRing.material.opacity = .62 + focusEnergy * .3 + Math.sin(simulation.elapsed * 8) * focusEnergy * .08;
  platformRingInner.material.opacity = .38 + focusEnergy * .28;
  platformLight.intensity = 5 + focusEnergy * 14;
  bloomPass.strength = Math.min(.42 + focusEnergy * .14, innerWidth <= 700 ? .46 : .56);
  if (simulation.phase === 'face') {
    const scan = 1.12 + Math.sin(simulation.elapsed * 9) * .18;
    lens.scale.setScalar(scan); cameraUnit.scale.set(1.12, scan, 1.12);
  } else if (simulation.phase === 'profile') {
    lens.scale.setScalar(1.18 + Math.sin(simulation.elapsed * 6) * .06);
  } else if (simulation.phase === 'verify') {
    lens.scale.setScalar(1.22 - smooth * .22);
  } else if (simulation.phase === 'insert') {
    pet.position.y = lerp(4.36, 3.42, easeOut(progress01));
    pet.scale.set(lerp(.96, 1, smooth), lerp(.96, 1, smooth), lerp(.96, 1, smooth));
  } else if (simulation.phase === 'topSensor') {
    const pulse = 1.12 + Math.sin(simulation.elapsed * 18) * .28;
    irTop.scale.setScalar(pulse);
    irTop.material.uniforms.uOpacity.value = .72 + (Math.sin(simulation.elapsed * 18) + 1) * .14;
  } else if (simulation.phase === 'validate') {
    const pulse = 1.18 + Math.sin(simulation.elapsed * 20) * .3;
    irTop.scale.setScalar(pulse); irZone.scale.setScalar(pulse);
    irTop.material.uniforms.uOpacity.value = .8 + (Math.sin(simulation.elapsed * 20) + 1) * .1;
    irZone.material.uniforms.uOpacity.value = .8 + (Math.sin(simulation.elapsed * 20 + Math.PI) + 1) * .1;
    setPetHologramColor(simulation.validBottle ? mint : 0xff527a);
    petGlowMaterial.color.setHex(simulation.validBottle ? mint : 0xff527a);
  } else if (simulation.phase === 'reject') {
    pet.position.y = lerp(3.42, 4.36, easeInOut(progress01));
    pet.scale.set(lerp(1, .82, smooth), lerp(1, .82, smooth), lerp(1, .82, smooth));
    setPetHologramColor(0xff527a); petGlowMaterial.color.setHex(0xff9eaf);
    particleMaterial.color.setHex(0xff527a); particleMaterial.opacity = .55 * (1 - progress01);
  } else if (simulation.phase === 'descend') {
    pet.position.y = lerp(3.42, 3.0, easeInOut(progress01));
  } else if (simulation.phase === 'zoneSensor') {
    const pulse = 1 + Math.sin(simulation.elapsed * 18) * .18;
    irZone.scale.setScalar(pulse);
  } else if (simulation.phase === 'compress') {
    const weighted = easeInOut(progress01);
    plate.position.y = lerp(3.18, 2.68, weighted);
    servoArm.rotation.z = lerp(-.2, -1.35, easeOut(progress01));
    pet.position.y = lerp(3.0, 2.34, weighted);
    pet.scale.set(lerp(1, 1.8, weighted), lerp(1, .18, weighted), lerp(1, 1.8, weighted));
    petMaterial.uniforms.uOpacity.value = .78 + weighted * .2;
    petWireMaterial.opacity = .42 + weighted * .28;
    const compressionPulse = Math.sin(progress01 * Math.PI);
    particleMaterial.opacity = compressionPulse * 1.5;
    impactRing.material.opacity = compressionPulse * .95;
    impactRing.scale.setScalar(1 + weighted * 1.8);
    particles.rotation.y += delta * 3.2;
  } else if (simulation.phase === 'impact') {
    pet.scale.set(1.8, .18, 1.8); pet.position.y = 2.34;
    plate.position.y = 2.68; servoArm.rotation.z = -1.35;
    petMaterial.uniforms.uOpacity.value = .92;
    petWireMaterial.opacity = .8;
    impactRing.material.opacity = .8 + Math.sin(simulation.elapsed * 18) * .2;
    impactRing.scale.setScalar(2.8 + Math.sin(simulation.elapsed * 10) * .3);
    particles.rotation.y += delta * 4.2; particleMaterial.opacity = 1;
  } else if (simulation.phase === 'lift') {
    plate.position.y = lerp(2.68, 3.18, easeOut(progress01));
    servoArm.rotation.z = lerp(-1.35, -.2, easeOut(progress01));
    pet.position.y = 2.34; pet.scale.set(1.8, .18, 1.8); particleMaterial.opacity = .7 * (1 - progress01);
    petMaterial.uniforms.uOpacity.value = .92 - progress01 * .12;
  } else if (simulation.phase === 'transfer') {
    pet.position.y = lerp(2.34, .94, easeInOut(progress01));
    pet.scale.set(lerp(1.8, .64, smooth), lerp(.18, .34, smooth), lerp(1.8, .64, smooth));
    particleMaterial.opacity = .28 * (1 - progress01);
  } else if (simulation.phase === 'points') {
    particleMaterial.opacity = 1 - progress01;
    points.textContent = (simulation.points + 25).toLocaleString('en-US');
    const rewardPulse = Math.sin(progress01 * Math.PI);
    points.style.color = '#9bcaff';
    points.style.textShadow = `0 0 ${12 + rewardPulse * 18}px rgba(111,177,255,.8)`;
    points.style.transform = `scale(${1 + rewardPulse * .12})`;
    uiPanel.style.boxShadow = `0 18px 50px rgba(0,0,0,.3), 0 0 ${18 + rewardPulse * 28}px rgba(111,177,255,.28)`;
    impactRing.material.color.setHex(0x78baff);
    impactRing.material.opacity = rewardPulse * .9;
    impactRing.scale.setScalar(1.2 + rewardPulse * 1.8);
  } else if (simulation.phase === 'return') {
    const settle = easeOut(progress01);
    pet.position.y = lerp(.94, .88, settle); pet.scale.set(.64, .34, .64);
    particleMaterial.opacity = 0;
  }
  updateServoLinkage();
  if (progress01 >= 1) {
    if (simulation.phase === 'points') { simulation.processed += 1; simulation.points += 25; counter.textContent=String(simulation.processed).padStart(3,'0'); progress.style.width=`${Math.min(simulation.processed*10,100)}%`; }
    if (simulation.phase === 'face') beginPhase(simulation.userExists ? 'profile' : 'register');
    else if (simulation.phase === 'profile' || simulation.phase === 'register') beginPhase('verify');
    else if (simulation.phase === 'verify') { simulation.busy=false; simulation.userVerified=true; insertBtn.disabled=false; userState.textContent='Usuario verificado'; userBadge.textContent='VERIFICADO'; setStatus('USUARIO VERIFICADO',false,'INSERTA LA BOTELLA · perfil existente · puntos cargados'); }
    else if (simulation.phase === 'validate') beginPhase(simulation.validBottle ? 'descend' : 'reject');
    else if (simulation.phase === 'reject') finishSimulation();
    else if (simulation.phase === 'return') { simulation.busy=false; insertBtn.disabled=true; setStatus('ESPERANDO USUARIO',false,'Cámara activa · acércate para comenzar'); setTimeout(startUserRecognition, 1300); }
    else beginPhase({ insert:'topSensor', topSensor:'validate', descend:'zoneSensor', zoneSensor:'compress', compress:'impact', impact:'lift', lift:'transfer', transfer:'points', points:'return' }[simulation.phase]);
  }
}
insertBtn.addEventListener('click', startSimulation);
toggleBtn.addEventListener('click', () => {
  showLabels = !showLabels;
  labelObjects.forEach(item => { item.visible = showLabels; });
  toggleBtn.classList.toggle('active', showLabels);
  toggleBtn.setAttribute('aria-pressed', String(showLabels));
  toggleBtn.innerHTML = `<span class="button-icon">◈</span> ${showLabels ? 'Ocultar etiquetas' : 'Mostrar etiquetas'}`;
});
labelObjects.forEach(item => { item.visible = false; });
toggleBtn.setAttribute('aria-pressed', 'false');
toggleBtn.innerHTML = '<span class="button-icon">◈</span> Mostrar etiquetas';
insertBtn.disabled = true;
setStatus('ESPERANDO USUARIO',false,'Cámara activa · acércate para comenzar');
setTimeout(startUserRecognition, 1600);

const clock = new THREE.Clock();
const cameraOffset = new THREE.Vector3();
const previousCameraOffset = new THREE.Vector3();
let cinematicTime = 0;
let hasRendered = false;
function resize() {
  camera.aspect=innerWidth/innerHeight;
  const panelRight = document.querySelector('#ui-panel').getBoundingClientRect().right;
  const viewShift = innerWidth <= 700 || panelRight > innerWidth * .58 ? 0 : panelRight / 2;
  camera.clearViewOffset();
  camera.setViewOffset(innerWidth,innerHeight,-viewShift,0,innerWidth,innerHeight);
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight); composer.setSize(innerWidth,innerHeight); labels.setSize(innerWidth,innerHeight);
  bloomPass.strength = innerWidth <= 700 ? .46 : .52;
}
addEventListener('resize',resize);
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  cinematicTime += delta;
  const effectTime = cinematicTime / (reducedMotion ? 2 : 1);
  camera.position.sub(previousCameraOffset);
  updateSimulation(delta);
  updateCameraTransition(delta);
  controls.update();
  const importantPhase = simulation.phase === 'face' || simulation.phase === 'validate' || simulation.phase === 'compress' || simulation.phase === 'impact' || simulation.phase === 'points';
  const cameraWeight = simulation.busy && importantPhase ? (simulation.phase === 'compress' || simulation.phase === 'impact' ? 1 : .45) : 0;
  const cameraMotionScale = reducedMotion ? .2 : 1;
  const cameraPulse = Math.sin(cinematicTime * 2.2) * .018 * cameraWeight * cameraMotionScale;
  const cameraVertical = Math.sin(cinematicTime * 1.7) * .012 * cameraWeight * cameraMotionScale;
  cameraOffset.set(cameraPulse, cameraVertical, 0);
  camera.position.add(cameraOffset);
  previousCameraOffset.copy(cameraOffset);
  for (const material of hologramMaterials.values()) material.uniforms.uTime.value = effectTime;
  globalScan.position.y = .3 + (Math.sin(effectTime * Math.PI / 3) + 1) * 2.15;
  globalScan.material.opacity = reducedMotion ? .5 : .82;
  platformRingOuter.rotation.z = effectTime * .035;
  dust.position.y = Math.sin(effectTime * .16) * .06;
  impactLight.intensity = simulation.phase === 'impact' ? 3.2 : simulation.phase === 'compress' ? 1.1 : 0;
  const briefEffect = !reducedMotion && (simulation.phase === 'insert' || simulation.phase === 'reject') && simulation.elapsed < .18;
  renderer.domElement.style.filter = briefEffect ? 'drop-shadow(1px 0 rgba(95,255,200,.16)) drop-shadow(-1px 0 rgba(56,216,255,.16))' : '';
  composer.render();
  labels.render(scene,camera);
  if (!hasRendered) {
    hasRendered = true;
    document.querySelector('#loading').classList.add('hidden');
  }
}
resize();
animate();
