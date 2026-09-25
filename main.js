import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const container = document.querySelector('#canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x071114);
scene.fog = new THREE.FogExp2(0x071114, 0.035);
const camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, 0.1, 100);
camera.position.set(5.6, 4.2, 7.6);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate = true;
container.appendChild(renderer.domElement);
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), .38, .32, .72);
composer.addPass(bloomPass);
const labels = new CSS2DRenderer();
labels.setSize(innerWidth, innerHeight);
labels.domElement.className = 'labels-layer';
container.appendChild(labels.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 2.35, 0);
controls.enableDamping = true;
controls.minDistance = 4.5;
controls.maxDistance = 12;
controls.maxPolarAngle = Math.PI * 0.54;

scene.add(new THREE.HemisphereLight(0xd5eef0, 0x152327, 1.25));
const key = new THREE.DirectionalLight(0xe8f4f2, 3.2);
key.position.set(4, 8, 5); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); scene.add(key);
const rim = new THREE.PointLight(0x2caabd, 3.2, 14); rim.position.set(-4, 4, -3); scene.add(rim);
const fill = new THREE.PointLight(0x66d5dc, 2.4, 10); fill.position.set(3, 2.2, 4); scene.add(fill);
const topLight = new THREE.SpotLight(0xb6f0ec, 6, 14, Math.PI * .22, .55, 1.4);
topLight.position.set(-1.5, 8, 3.5); topLight.target.position.set(0, 2, 0); scene.add(topLight, topLight.target);
const underLight = new THREE.PointLight(0x16a5bd, 2.2, 5);
underLight.position.set(0, .25, 0); scene.add(underLight);

const cyan = 0x55d4dc, mint = 0x9ce8dd, charcoal = 0x172327;
const shellMat = new THREE.MeshPhysicalMaterial({ color: 0x152328, roughness: .3, metalness: .58, clearcoat: .62, clearcoatRoughness: .28 });
const edgeMat = new THREE.MeshBasicMaterial({ color: 0x62d6dc, wireframe: true, transparent: true, opacity: .2 });
const glowMat = new THREE.MeshStandardMaterial({ color: 0x27545a, emissive: 0x0e555b, emissiveIntensity: .24, roughness: .3, metalness: .58, transparent: true, opacity: .68 });
const darkMat = new THREE.MeshPhysicalMaterial({ color: charcoal, roughness: .34, metalness: .62, clearcoat: .28, clearcoatRoughness: .4 });
const woodMat = new THREE.MeshStandardMaterial({ color: 0x466568, emissive: 0x071b1d, emissiveIntensity: .22, roughness: .42, metalness: .32 });
const crispEdgeMat = new THREE.LineBasicMaterial({ color: cyan, transparent: true, opacity: .48 });
const softEdgeMat = new THREE.LineBasicMaterial({ color: cyan, transparent: true, opacity: .065 });
const machine = new THREE.Group();
scene.add(machine);
const studioFloor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: 0x091316, roughness: .78, metalness: .16 }));
studioFloor.rotation.x = -Math.PI / 2;
studioFloor.position.y = -.08;
studioFloor.receiveShadow = true;
scene.add(studioFloor);

const energyPlatform = new THREE.Group();
machine.add(energyPlatform);
const platformDisc = new THREE.Mesh(
  new THREE.CylinderGeometry(2.25, 2.25, .045, 96),
  new THREE.MeshStandardMaterial({ color: 0x122b31, roughness: .38, metalness: .58 })
);
platformDisc.position.y = .055;
energyPlatform.add(platformDisc);
const platformRing = new THREE.Mesh(
  new THREE.TorusGeometry(2.12, .045, 12, 96),
  new THREE.MeshBasicMaterial({ color: 0x4fcbd2, transparent: true, opacity: .58, blending: THREE.AdditiveBlending })
);
platformRing.rotation.x = Math.PI / 2;
platformRing.position.y = .1;
energyPlatform.add(platformRing);
const platformRingInner = new THREE.Mesh(
  new THREE.TorusGeometry(1.68, .018, 8, 96),
  new THREE.MeshBasicMaterial({ color: 0xa4eff0, transparent: true, opacity: .32, blending: THREE.AdditiveBlending })
);
platformRingInner.rotation.x = Math.PI / 2;
platformRingInner.position.y = .11;
energyPlatform.add(platformRingInner);
const platformHalo = new THREE.Mesh(
  new THREE.TorusGeometry(1.22, .012, 8, 96),
  new THREE.MeshBasicMaterial({ color: 0x83e4e4, transparent: true, opacity: .24, blending: THREE.AdditiveBlending })
);
platformHalo.rotation.x = Math.PI / 2;
platformHalo.position.y = .125;
energyPlatform.add(platformHalo);
const platformSweep = new THREE.Mesh(
  new THREE.RingGeometry(.48, 1.92, 96),
  new THREE.MeshBasicMaterial({ color: 0x16899a, transparent: true, opacity: .045, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
);
platformSweep.rotation.x = -Math.PI / 2;
platformSweep.position.y = .13;
energyPlatform.add(platformSweep);
const platformLight = new THREE.PointLight(0x27aeb9, 1.5, 6);
platformLight.position.y = .35;
energyPlatform.add(platformLight);

function addGlowEdges(mesh, color = cyan) {
  const crisp = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), crispEdgeMat.clone());
  crisp.material.color.setHex(color); crisp.position.set(0, 0, 0); mesh.add(crisp);
  const soft = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), softEdgeMat.clone());
  soft.material.color.setHex(color); soft.material.opacity = .055; soft.scale.setScalar(1.012); mesh.add(soft);
}

function box(name, size, position, material = darkMat, parent = machine) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material.clone());
  mesh.name = name; mesh.position.set(...position); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); addGlowEdges(mesh); return mesh;
}
function lineBox(name, size, position, material = woodMat) { return box(name, size, position, material); }
function label(text, position, color = 'cyan', description = '') {
  const side = position[0] < 0 ? 'label-left' : 'label-right';
  const el = document.createElement('div'); el.className = `component-label ${color} ${side}`; el.innerHTML = `<b>${text}</b><span>${description}</span>`;
  const obj = new CSS2DObject(el); obj.position.set(...position); obj.userData = { text, description }; machine.add(obj); return obj;
}

// 100 cm PET-bottle silhouette: the outer carton follows the same profile.
const profile = [[0.0,0.0],[0.94,0.0],[1.0,.18],[1.0,2.35],[.94,2.55],[.7,2.7],[.7,3.05],[.44,3.2],[.44,3.5],[.31,3.62],[.31,3.92],[.2,4.04],[0.0,4.04]];
const lathePoints = profile.map(([r,y]) => new THREE.Vector2(r, y));
const bottle = new THREE.Mesh(new THREE.LatheGeometry(lathePoints, 96), new THREE.MeshPhysicalMaterial({ color: 0x28616a, transparent: true, opacity: .12, roughness: .28, metalness: .18, clearcoat: .7, side: THREE.DoubleSide }));
bottle.position.y = .34; bottle.castShadow = true; machine.add(bottle);
const bottleWire = new THREE.Mesh(new THREE.LatheGeometry(lathePoints, 64), edgeMat); bottleWire.position.copy(bottle.position); bottleWire.material.opacity = .14; machine.add(bottleWire);

// Solid graphite panels define the exterior; the internal view reveals the frame.
const panels = new THREE.Group(); machine.add(panels);
for (const [x,z,rot] of [[-1.05,0,0],[1.05,0,0],[0,-1.05,Math.PI / 2],[0,1.05,Math.PI / 2]]) {
  const panel = new THREE.Mesh(new THREE.BoxGeometry(2.15, 4.25, .12), shellMat); panel.position.set(x,2.47,z); panel.rotation.y = rot; panel.castShadow = true; panel.receiveShadow = true; panels.add(panel);
  const outline = new THREE.LineSegments(new THREE.EdgesGeometry(panel.geometry), new THREE.LineBasicMaterial({ color: 0x63cbd1, transparent:true, opacity:.3 })); outline.position.copy(panel.position); outline.rotation.copy(panel.rotation); panels.add(outline);
}
// Wooden internal skeleton.
for (const x of [-.82,.82]) for (const z of [-.82,.82]) lineBox('wooden-skeleton', [.1,4.1,.1], [x,2.42,z]);
for (const y of [.48, 2.35, 4.38]) for (const z of [-.86,.86]) lineBox('wooden-crossbar', [1.8,.1,.1], [0,y,z]);
for (const y of [.48, 2.35, 4.38]) for (const x of [-.86,.86]) lineBox('wooden-crossbar', [.1,.1,1.8], [x,y,0]);

// Hopper, chamber, compactor and lower container.
box('base', [2.1,.25,2.1], [0,.18,0], darkMat);
const hopper = new THREE.Mesh(new THREE.CylinderGeometry(.75,1.12,.46,4), new THREE.MeshBasicMaterial({ color: 0x003b56, transparent:true, opacity:.04, side:THREE.DoubleSide })); hopper.position.set(0,4.34,0); hopper.rotation.y=Math.PI/4; machine.add(hopper); addGlowEdges(hopper);
box('compaction-chamber', [1.65,1.05,1.65], [0,2.75,0], new THREE.MeshPhysicalMaterial({color:0x1b3b3e, transparent:true, opacity:.2, roughness:.3, metalness:.22, side:THREE.DoubleSide}));
const plate = box('compactor-plate', [1.32,.16,1.32], [0,3.18,0], glowMat);
const lowerContainer = new THREE.Group(); machine.add(lowerContainer);
const binWallMat = new THREE.MeshPhysicalMaterial({ color: 0x203337, transparent: true, opacity: .34, roughness: .32, metalness: .42, side: THREE.DoubleSide });
box('lower-container-base', [1.62,.12,1.62], [0,.38,0], darkMat, lowerContainer);
box('lower-container-front', [1.62,.66,.08], [0,.77,.77], binWallMat, lowerContainer);
box('lower-container-back', [1.62,.66,.08], [0,.77,-.77], binWallMat, lowerContainer);
box('lower-container-left', [.08,.66,1.46], [-.77,.77,0], binWallMat, lowerContainer);
box('lower-container-right', [.08,.66,1.46], [.77,.77,0], binWallMat, lowerContainer);
for (let i=0;i<4;i++) { const corner = new THREE.Mesh(new THREE.BoxGeometry(.055,.72,.055), glowMat); corner.position.set(i%2 ? .78 : -.78, .76, i>1 ? .78 : -.78); machine.add(corner); }
// Servo SG90 on the side with a linkage.
const servo = box('servo', [.42,.6,.3], [1.28,3.05,.15], new THREE.MeshStandardMaterial({color:0x29506a, roughness:.4, metalness:.25}));
const servoArm = box('servo-arm', [.08,.75,.08], [1.28,3.52,.15], glowMat); servoArm.rotation.z = -.2;
// IR sensors and camera.
const irTop = box('ir-top', [.34,.12,.18], [0,4.03,.72], glowMat);
const irZone = box('ir-zone', [.34,.12,.18], [0,2.67,.82], glowMat);
const cameraUnit = box('camera', [.42,.25,.25], [-1.02,3.92,.5], darkMat); const lens = new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.03,20), new THREE.MeshStandardMaterial({color:cyan, emissive:cyan, emissiveIntensity:3})); lens.rotation.x=Math.PI/2; lens.position.set(-1.02,3.92,.66); machine.add(lens);
// LCD and status LEDs.
const lcd = box('lcd', [.72,.32,.1], [1.08,1.9,.87], new THREE.MeshStandardMaterial({color:0x254c43, emissive:0x12362e, emissiveIntensity:1}));
for (let i=0;i<3;i++) { const led = new THREE.Mesh(new THREE.SphereGeometry(.045,10,10), new THREE.MeshStandardMaterial({color:i===0?mint:cyan, emissive:i===0?mint:cyan, emissiveIntensity:3})); led.position.set(1.08 + (i-.9)*.14,2.18,.91); machine.add(led); }
const buzzer = new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.08,20), darkMat); buzzer.rotation.x=Math.PI/2; buzzer.position.set(1.15,1.44,.89); machine.add(buzzer);

const labelData = [
  ['TOLVA / ENTRADA',[1.9,5.3,.2], 'cyan','Recepción de botella PET'],
  ['SENSOR IR SUPERIOR',[1.9,4.0,.9], 'mint','Detecta la inserción'],
  ['ESQUELETO DE MADERA',[-1.9,4.9,.25], 'mint','Listones internos de refuerzo'],
  ['CÁMARA FACIAL',[-1.9,3.2,.58], 'mint','Reconocimiento simulado'],
  ['ESTRUCTURA DE CARTÓN',[-1.9,2.35,-.2], 'cyan','Panel PET reciclado · acabado negro mate'],
  ['PLATO DE COMPACTACIÓN',[1.9,2.7,.1], 'cyan','Carrera vertical servo'],
  ['SERVO SG90',[3.05,4.65,.15], 'mint','Actuador de 180°'],
  ['SENSOR IR COMPACTACIÓN',[3.05,3.35,.8], 'mint','Confirma zona despejada'],
  ['LEDs DE ESTADO',[-3.05,4.05,.85], 'mint','Listo · proceso · alerta'],
  ['LCD 16×2',[3.05,2.05,.8], 'cyan','Estado · puntos · usuario'],
  ['BUZZER',[-3.05,1.45,.88], 'cyan','Confirmación sonora'],
  ['CONTENEDOR INFERIOR',[3.05,1.4,0], 'cyan','Material compactado']
];
const labelObjects = labelData.map(([text,pos,color,desc]) => label(text,pos,color,desc));

const pet = new THREE.Group(); machine.add(pet);
pet.position.set(0, 4.36, 0);
const petMaterial = new THREE.MeshPhysicalMaterial({ color: 0x50cbd2, emissive: 0x073b40, emissiveIntensity: .32, transparent: true, opacity: .78, roughness: .12, metalness: .04, clearcoat: 1, clearcoatRoughness: .1 });
const petGlowMaterial = new THREE.LineBasicMaterial({ color: 0xbaf4ec, transparent: true, opacity: .38 });
const petWireMaterial = new THREE.MeshBasicMaterial({ color: 0xa1e8e8, transparent: true, opacity: .045, wireframe: true, depthWrite: false });
const petProfile = [[0,.02],[.23,.02],[.31,.055],[.34,.12],[.34,.19],[.316,.215],[.316,.245],[.34,.27],[.34,.33],[.316,.355],[.316,.385],[.34,.41],[.34,.47],[.316,.495],[.316,.525],[.34,.55],[.34,.61],[.316,.635],[.316,.665],[.34,.69],[.34,.76],[.33,.83],[.31,.9],[.28,.96],[.24,1.01],[.19,1.055],[.17,1.08],[0,1.08]].map(([radius,height]) => new THREE.Vector2(radius,height));
const petBody = new THREE.Mesh(new THREE.LatheGeometry(petProfile, 64), petMaterial); pet.add(petBody);
const petBodyGlow = new THREE.LineSegments(new THREE.EdgesGeometry(petBody.geometry, 24), petGlowMaterial); pet.add(petBodyGlow);
const petBodyWire = new THREE.Mesh(petBody.geometry, petWireMaterial); petBodyWire.scale.setScalar(1.008); pet.add(petBodyWire);
const petShoulder = new THREE.Mesh(new THREE.CylinderGeometry(.22,.28,.22,48), petMaterial); petShoulder.position.y=1.16; pet.add(petShoulder);
const petShoulderGlow = new THREE.LineSegments(new THREE.EdgesGeometry(petShoulder.geometry), petGlowMaterial); petShoulderGlow.position.copy(petShoulder.position); petShoulderGlow.scale.setScalar(1.03); pet.add(petShoulderGlow);
const petShoulderWire = new THREE.Mesh(petShoulder.geometry, petWireMaterial); petShoulderWire.position.copy(petShoulder.position); petShoulderWire.scale.setScalar(1.015); pet.add(petShoulderWire);
const petNeck = new THREE.Mesh(new THREE.CylinderGeometry(.14,.18,.32,48), petMaterial); petNeck.position.y=1.41; pet.add(petNeck);
const petNeckGlow = new THREE.LineSegments(new THREE.EdgesGeometry(petNeck.geometry), petGlowMaterial); petNeckGlow.position.copy(petNeck.position); petNeckGlow.scale.setScalar(1.03); pet.add(petNeckGlow);
const petNeckWire = new THREE.Mesh(petNeck.geometry, petWireMaterial); petNeckWire.position.copy(petNeck.position); petNeckWire.scale.setScalar(1.015); pet.add(petNeckWire);
const petCap = new THREE.Mesh(new THREE.CylinderGeometry(.155,.155,.1,32), new THREE.MeshStandardMaterial({ color: 0x9de5df, emissive: 0x1a6765, emissiveIntensity: .45, roughness: .24, metalness: .22 })); petCap.position.y = 1.63; pet.add(petCap);
const petLight = new THREE.PointLight(0x56d9da, .7, 2.6); petLight.position.set(0, .8, .55); pet.add(petLight);
pet.visible=false;

const particlePositions = new Float32Array(96 * 3);
for (let i = 0; i < particlePositions.length; i += 3) { particlePositions[i] = (Math.random() - .5) * 1.5; particlePositions[i + 1] = 2.35 + Math.random() * .9; particlePositions[i + 2] = (Math.random() - .5) * 1.5; }
const particleGeometry = new THREE.BufferGeometry(); particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const particleMaterial = new THREE.PointsMaterial({ color: cyan, size: .045, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
const particles = new THREE.Points(particleGeometry, particleMaterial); machine.add(particles);
const impactRing = new THREE.Mesh(new THREE.TorusGeometry(.68, .025, 8, 40), new THREE.MeshBasicMaterial({ color: 0x8af4ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending }));
impactRing.rotation.x = Math.PI / 2;
impactRing.position.set(0, 2.5, 0);
machine.add(impactRing);
const impactFlash = new THREE.Mesh(
  new THREE.RingGeometry(.12, .72, 64),
  new THREE.MeshBasicMaterial({ color: 0xb8fbff, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
);
impactFlash.rotation.x = -Math.PI / 2;
impactFlash.position.set(0, 2.48, 0);
machine.add(impactFlash);

// Transparent holographic surfaces test depth without writing it, so panels do
// not hide the interior when the camera orbits to the opposite side.
const externalParts = [panels, bottle, bottleWire];
const internalParts = machine.children.filter(child => !externalParts.includes(child) && !labelObjects.includes(child));
machine.traverse(object => {
  if (object.material?.transparent) {
    object.material.depthTest = true;
    object.material.depthWrite = false;
  }
});
externalParts.forEach(part => {
  part.renderOrder = 2;
  part.traverse(child => { child.renderOrder = 2; });
});
internalParts.forEach(part => {
  part.renderOrder = 10;
  part.traverse(child => { child.renderOrder = 10; });
});
[pet, particles, impactRing, impactFlash].forEach(effect => {
  effect.renderOrder = 20;
  effect.traverse(child => { child.renderOrder = 20; });
});

const status = document.querySelector('#status-text'), insertBtn = document.querySelector('#insert-btn'), toggleBtn = document.querySelector('#explode-btn'), viewBtn = document.querySelector('#view-btn');
const counter = document.querySelector('#counter'), points = document.querySelector('#points'), progress = document.querySelector('#daily-progress');
const phaseDetail = document.querySelector('#phase-detail'), userState = document.querySelector('#user-state'), userBadge = document.querySelector('#user-badge');
const uiPanel = document.querySelector('#ui-panel');
const ledObjects = [...document.querySelectorAll('.status-leds .led')];
const simulation = { phase: 'waiting', elapsed: 0, duration: 0, busy: false, userVerified: false, userExists: true, attempts: 0, processed: 3, points: 1240, validBottle: true };
const phases = { face: 4.6, profile: 2.1, register: 2.2, verify: 2.5, insert: 3.4, topSensor: 2.4, validate: 3.6, descend: 2.6, zoneSensor: 2.3, compress: 5.4, impact: 2.4, lift: 2.5, transfer: 2.5, points: 2.8, return: 2.0, reject: 2.2 };
let showLabels = false;
let internalView = false;
const cameraTransition = {
  active: false,
  mode: 'idle',
  elapsed: 0,
  duration: 1.55,
  start: new THREE.Vector3(),
  end: new THREE.Vector3(),
  initialized: false
};
const exteriorCameraPosition = new THREE.Vector3(5.6, 4.2, 7.6);
const interiorCameraPosition = new THREE.Vector3(4.25, 3.5, 5.7);

function applyViewVisibility(showInternal) {
  externalParts.forEach(part => { part.visible = !showInternal; });
  internalParts.forEach(part => { part.visible = showInternal; });
  labelObjects.forEach(item => { item.visible = showInternal && showLabels; });
}

function setViewMode(showInternal) {
  internalView = showInternal;
  viewBtn.classList.toggle('active', internalView);
  viewBtn.setAttribute('aria-pressed', String(internalView));
  viewBtn.innerHTML = `<span class="button-icon">◉</span> ${internalView ? 'Vista Interna' : 'Vista Exterior'}`;
  if (!cameraTransition.initialized) {
    applyViewVisibility(internalView);
    cameraTransition.initialized = true;
    return;
  }
  cameraTransition.active = true;
  cameraTransition.mode = showInternal ? 'in' : 'out';
  cameraTransition.elapsed = 0;
  cameraTransition.start.copy(camera.position);
  cameraTransition.end.copy(showInternal ? interiorCameraPosition : exteriorCameraPosition);
  controls.enabled = false;
}

const clamp01 = value => Math.min(Math.max(value, 0), 1);
const easeInOut = value => {
  const smooth = value * value * value * (value * (value * 6 - 15) + 10);
  return smooth;
};
const easeOut = value => 1 - Math.pow(1 - value, 4);
const lerp = (from, to, amount) => from + (to - from) * amount;
function setStatus(text, active=false, detail='') { status.textContent=text; phaseDetail.textContent=detail; document.querySelector('#led-idle').classList.toggle('on',!active); document.querySelector('#led-active').classList.toggle('on',active); document.querySelector('#led-error').classList.remove('on'); }
function setComponentActive(component, active) {
  if (!component) return;
  const materials = [component.material, ...component.children.map(child => child.material)].filter(Boolean);
  if (!component.userData.idleScale) {
    component.userData.idleScale = component.scale.clone();
    component.userData.idleMaterials = materials.map(material => ({
      color: material.color?.getHex(),
      emissive: material.emissive?.getHex(),
      emissiveIntensity: material.emissiveIntensity,
      opacity: material.opacity
    }));
  }
  component.scale.copy(component.userData.idleScale).multiplyScalar(active ? 1.08 : 1);
  materials.forEach((material, index) => {
    const idle = component.userData.idleMaterials[index];
    if (idle.color !== undefined) material.color.setHex(active ? 0x6caeae : idle.color);
    if (idle.emissive !== undefined) {
      material.emissive.setHex(active ? 0x18595c : idle.emissive);
      material.emissiveIntensity = active ? .52 : idle.emissiveIntensity;
    }
    if (idle.opacity !== undefined) material.opacity = active && index > 0 ? Math.max(idle.opacity, .68) : idle.opacity;
  });
}
function beginPhase(name) {
  simulation.phase=name; simulation.elapsed=0; simulation.duration=phases[name];
  points.style.color = '';
  points.style.textShadow = '';
  points.style.transform = '';
  uiPanel.style.boxShadow = '';
  impactRing.material.color.setHex(0x8af4ff);
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
  petMaterial.color.setHex(0x58cbd1);
  petGlowMaterial.color.setHex(0xd2f4ef);
  petMaterial.emissiveIntensity = .32;
  petWireMaterial.opacity = .045;
  petLight.intensity = .7;
  particles.position.y = 0;
  beginPhase('insert');
}
function finishSimulation() {
  simulation.busy = false;
  simulation.userVerified = false;
  pet.visible = false;
  pet.position.y = 4.36;
  pet.scale.set(1, 1, 1);
  petMaterial.emissiveIntensity = .32;
  petWireMaterial.opacity = .045;
  petLight.intensity = .7;
  plate.position.y = 3.18;
  servoArm.rotation.z = -.2;
  particleMaterial.opacity = 0;
  impactRing.material.opacity = 0;
  impactFlash.material.opacity = 0;
  beginPhase('return');
}
function updateSimulation(delta) {
  if (!simulation.busy) return;
  simulation.elapsed += Math.min(delta, .05);
  const progress01 = clamp01(simulation.elapsed / simulation.duration);
  const smooth = easeInOut(progress01);
  const cinematicPhase = simulation.phase === 'face' || simulation.phase === 'validate' || simulation.phase === 'compress' || simulation.phase === 'impact' || simulation.phase === 'points';
  const focusEnergy = simulation.phase === 'compress' || simulation.phase === 'impact' ? 1 : cinematicPhase ? .55 : .2;
  platformRing.rotation.z += delta * (.35 + focusEnergy * 1.8);
  platformRingInner.rotation.z -= delta * (.6 + focusEnergy * 2.4);
  platformHalo.rotation.z += delta * (.8 + focusEnergy * 2.8);
  platformSweep.rotation.z -= delta * (.18 + focusEnergy * .8);
  platformRing.material.opacity = .3 + focusEnergy * .24 + Math.sin(simulation.elapsed * 5) * focusEnergy * .035;
  platformRingInner.material.opacity = .18 + focusEnergy * .12;
  platformHalo.material.opacity = .12 + focusEnergy * .16 + Math.sin(cinematicTime * 3) * .025;
  platformSweep.material.opacity = .025 + focusEnergy * .025;
  platformLight.intensity = 1.4 + focusEnergy * 1.1;
  underLight.intensity = 1.6 + focusEnergy * 1.5;
  bloomPass.strength = .34 + focusEnergy * .12;
  if (simulation.phase === 'face') {
    const scan = 1.12 + Math.sin(simulation.elapsed * 9) * .18;
    lens.scale.setScalar(scan); cameraUnit.scale.set(1.12, scan, 1.12);
    lens.material.emissiveIntensity = 2.4 + Math.sin(simulation.elapsed * 12) * .7;
  } else if (simulation.phase === 'profile') {
    lens.scale.setScalar(1.18 + Math.sin(simulation.elapsed * 6) * .06);
    lens.material.emissiveIntensity = 3.2;
  } else if (simulation.phase === 'verify') {
    lens.scale.setScalar(1.22 - smooth * .22); lens.material.emissiveIntensity = 2.8;
  } else if (simulation.phase === 'insert') {
    pet.position.y = lerp(4.36, 3.42, easeOut(progress01));
    pet.scale.set(lerp(.96, 1, smooth), lerp(.96, 1, smooth), lerp(.96, 1, smooth));
  } else if (simulation.phase === 'topSensor') {
    const pulse = 1.12 + Math.sin(simulation.elapsed * 18) * .28;
    irTop.scale.setScalar(pulse);
    irTop.material.opacity = .72 + (Math.sin(simulation.elapsed * 18) + 1) * .14;
  } else if (simulation.phase === 'validate') {
    const pulse = 1.18 + Math.sin(simulation.elapsed * 20) * .3;
    irTop.scale.setScalar(pulse); irZone.scale.setScalar(pulse);
    irTop.material.opacity = .8 + (Math.sin(simulation.elapsed * 20) + 1) * .1;
    irZone.material.opacity = .8 + (Math.sin(simulation.elapsed * 20 + Math.PI) + 1) * .1;
    petMaterial.color.setHex(simulation.validBottle ? 0x58cbd1 : 0xd96c7d);
    petGlowMaterial.color.setHex(simulation.validBottle ? 0xd2f4ef : 0xf1a0aa);
  } else if (simulation.phase === 'reject') {
    pet.position.y = lerp(3.42, 4.36, easeInOut(progress01));
    pet.scale.set(lerp(1, .82, smooth), lerp(1, .82, smooth), lerp(1, .82, smooth));
    petMaterial.color.setHex(0xff527a); petGlowMaterial.color.setHex(0xff9eaf);
    particleMaterial.color.setHex(0xff527a); particleMaterial.opacity = .55 * (1 - progress01);
  } else if (simulation.phase === 'descend') {
    pet.position.y = lerp(3.42, 3.0, easeInOut(progress01));
  } else if (simulation.phase === 'zoneSensor') {
    const pulse = 1 + Math.sin(simulation.elapsed * 18) * .18;
    irZone.scale.setScalar(pulse);
  } else if (simulation.phase === 'compress') {
    const weighted = easeInOut(progress01);
    plate.position.y = lerp(3.18, 2.68, weighted);
    servoArm.rotation.z = lerp(-.2, -1.2, easeInOut(progress01));
    pet.position.y = lerp(3.42, 2.34, weighted);
    pet.scale.set(lerp(1, 1.68, weighted), lerp(1, .18, weighted), lerp(1, 1.68, weighted));
    petMaterial.emissiveIntensity = .32 + weighted * .42;
    petLight.intensity = .7 + weighted * .55;
    petWireMaterial.opacity = .045 + weighted * .035;
    const compressionPulse = Math.sin(progress01 * Math.PI);
    particleMaterial.opacity = compressionPulse * .38;
    impactRing.material.opacity = compressionPulse * .48;
    impactRing.scale.setScalar(1 + weighted * 1.25);
    impactFlash.material.opacity = compressionPulse * .1;
    impactFlash.scale.setScalar(.72 + weighted * .8);
    particles.rotation.y += delta * 3.2;
  } else if (simulation.phase === 'impact') {
    pet.scale.set(1.68, .18, 1.68); pet.position.y = 2.34;
    plate.position.y = 2.68; servoArm.rotation.z = -1.2;
    petMaterial.emissiveIntensity = .74 + Math.sin(simulation.elapsed * 8) * .06;
    petLight.intensity = 1.25 + Math.sin(simulation.elapsed * 7) * .1;
    petWireMaterial.opacity = .08;
    impactRing.material.opacity = .42 + Math.sin(simulation.elapsed * 7) * .06;
    impactRing.scale.setScalar(2.15 + Math.sin(simulation.elapsed * 4) * .08);
    impactFlash.material.opacity = .08 + Math.sin(simulation.elapsed * 6) * .025;
    impactFlash.scale.setScalar(1.5 + Math.sin(simulation.elapsed * 4) * .08);
    particles.rotation.y += delta * 4.2; particleMaterial.opacity = 1;
  } else if (simulation.phase === 'lift') {
    plate.position.y = lerp(2.68, 3.18, easeOut(progress01));
    servoArm.rotation.z = lerp(-1.2, -.2, easeOut(progress01));
    pet.position.y = 2.34; pet.scale.set(1.68, .18, 1.68); particleMaterial.opacity = .3 * (1 - progress01);
    petLight.intensity = .7 + .55 * (1 - progress01);
    impactFlash.material.opacity = .08 * (1 - progress01);
  } else if (simulation.phase === 'transfer') {
    pet.position.y = lerp(2.34, .46, easeInOut(progress01));
    pet.scale.set(lerp(1.68, .64, smooth), lerp(.18, .34, smooth), lerp(1.68, .64, smooth));
    particleMaterial.opacity = .28 * (1 - progress01);
  } else if (simulation.phase === 'points') {
    particleMaterial.opacity = 1 - progress01;
    points.textContent = (simulation.points + 25).toLocaleString('en-US');
    const rewardPulse = Math.sin(progress01 * Math.PI);
    points.style.color = '#b8ff5c';
    points.style.textShadow = `0 0 ${12 + rewardPulse * 18}px rgba(184,255,92,.95)`;
    points.style.transform = `scale(${1 + rewardPulse * .12})`;
    uiPanel.style.boxShadow = `0 18px 50px rgba(0,0,0,.3), 0 0 ${18 + rewardPulse * 28}px rgba(184,255,92,.45)`;
    impactRing.material.color.setHex(0xb8ff5c);
    impactRing.material.opacity = rewardPulse * .9;
    impactRing.scale.setScalar(1.2 + rewardPulse * 1.8);
  } else if (simulation.phase === 'return') {
    const settle = easeOut(progress01);
    pet.position.y = lerp(.46, .46, settle); pet.scale.set(.64, .34, .64);
    particleMaterial.opacity = 0;
  }
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
  labelObjects.forEach(item => { item.visible = internalView && showLabels; });
  toggleBtn.classList.toggle('active', showLabels);
  toggleBtn.setAttribute('aria-pressed', String(showLabels));
  toggleBtn.innerHTML = `<span class="button-icon">◈</span> ${showLabels ? 'Ocultar etiquetas' : 'Mostrar etiquetas'}`;
});
viewBtn.addEventListener('click', () => setViewMode(!internalView));
labelObjects.forEach(item => { item.visible = false; });
toggleBtn.setAttribute('aria-pressed', 'false');
toggleBtn.innerHTML = '<span class="button-icon">◈</span> Mostrar etiquetas';
setViewMode(false);
insertBtn.disabled = true;
setStatus('ESPERANDO USUARIO',false,'Cámara activa · acércate para comenzar');
setTimeout(startUserRecognition, 1600);

const clock = new THREE.Clock();
const cameraOffset = new THREE.Vector3();
const cameraOffsetTarget = new THREE.Vector3();
const zeroCameraOffset = new THREE.Vector3();
const previousCameraOffset = new THREE.Vector3();
let cinematicTime = 0;
function resize() { camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); composer.setSize(innerWidth,innerHeight); labels.setSize(innerWidth,innerHeight); }
addEventListener('resize',resize);
function updateCameraTransition(delta) {
  if (!cameraTransition.active) return;
  cameraTransition.elapsed += delta;
  const progress = clamp01(cameraTransition.elapsed / cameraTransition.duration);
  const eased = easeInOut(progress);
  camera.position.lerpVectors(cameraTransition.start, cameraTransition.end, eased);
  camera.lookAt(controls.target);
  if (cameraTransition.mode === 'in' && progress >= .72 && !internalParts[0].visible) applyViewVisibility(true);
  if (progress >= 1) {
    camera.position.copy(cameraTransition.end);
    if (cameraTransition.mode === 'out') applyViewVisibility(false);
    cameraTransition.active = false;
    controls.enabled = true;
    controls.target.lerp(new THREE.Vector3(0, 2.35, 0), .18);
    controls.update();
  }
}
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  cinematicTime += delta;
  camera.position.sub(previousCameraOffset);
  updateSimulation(delta);
  updateCameraTransition(delta);
  if (!cameraTransition.active) controls.update();
  const importantPhase = simulation.phase === 'face' || simulation.phase === 'validate' || simulation.phase === 'compress' || simulation.phase === 'impact' || simulation.phase === 'points';
  const cameraWeight = simulation.busy && importantPhase ? (simulation.phase === 'compress' || simulation.phase === 'impact' ? 1 : .45) : 0;
  const cameraPulse = Math.sin(cinematicTime * 1.8) * .019 * cameraWeight;
  const cameraVertical = Math.sin(cinematicTime * 1.35) * .013 * cameraWeight;
  const cameraDepth = Math.cos(cinematicTime * 1.1) * .01 * cameraWeight;
  cameraOffsetTarget.set(cameraPulse, cameraVertical, cameraDepth);
  const cameraSmoothing = 1 - Math.exp(-delta * 7);
  if (!cameraTransition.active) {
    cameraOffset.lerp(cameraOffsetTarget, cameraSmoothing);
    camera.position.add(cameraOffset);
    previousCameraOffset.copy(cameraOffset);
  } else {
    cameraOffset.lerp(zeroCameraOffset, cameraSmoothing);
    previousCameraOffset.set(0, 0, 0);
  }
  composer.render();
  labels.render(scene,camera);
}
setTimeout(() => document.querySelector('#loading').classList.add('hidden'), 1450);
animate();
