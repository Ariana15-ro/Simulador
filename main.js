import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const container = document.querySelector('#canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.FogExp2(0x000000, 0.018);
const camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, 0.1, 100);
camera.position.set(5.6, 4.2, 7.6);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 1.65, .72, .08));
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

scene.add(new THREE.HemisphereLight(0x164d72, 0x000000, 1.1));
const key = new THREE.DirectionalLight(0x39cfff, 2.2);
key.position.set(4, 8, 5); key.castShadow = true; scene.add(key);
const rim = new THREE.PointLight(0x008cff, 12, 12); rim.position.set(-4, 4, -3); scene.add(rim);

const cyan = 0x18bfff, mint = 0x55e9ff, charcoal = 0x03131d, wood = 0x087ca9;
const shellMat = new THREE.MeshBasicMaterial({ color: 0x00131d, transparent: true, opacity: .04, side: THREE.DoubleSide });
const edgeMat = new THREE.MeshBasicMaterial({ color: cyan, wireframe: true, transparent: true, opacity: .95 });
const glowMat = new THREE.MeshBasicMaterial({ color: mint, transparent: true, opacity: .08, wireframe: true });
const darkMat = new THREE.MeshBasicMaterial({ color: charcoal, transparent: true, opacity: .04, side: THREE.DoubleSide });
const woodMat = new THREE.MeshBasicMaterial({ color: cyan, transparent: true, opacity: .12, wireframe: true });
const crispEdgeMat = new THREE.LineBasicMaterial({ color: cyan, transparent: true, opacity: .95 });
const softEdgeMat = new THREE.LineBasicMaterial({ color: cyan, transparent: true, opacity: .2 });
const machine = new THREE.Group();
scene.add(machine);

function addGlowEdges(mesh, color = cyan) {
  const crisp = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), crispEdgeMat.clone());
  crisp.material.color.setHex(color); crisp.position.set(0, 0, 0); mesh.add(crisp);
  const soft = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), softEdgeMat.clone());
  soft.material.color.setHex(color); soft.material.opacity = .16; soft.scale.setScalar(1.012); mesh.add(soft);
}

function box(name, size, position, material = darkMat, parent = machine) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material.clone());
  mesh.name = name; mesh.position.set(...position); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); addGlowEdges(mesh); return mesh;
}
function lineBox(name, size, position, material = woodMat) { return box(name, size, position, material); }
function label(text, position, color = 'cyan', description = '') {
  const el = document.createElement('div'); el.className = `component-label ${color}`; el.innerHTML = `<b>${text}</b><span>${description}</span>`;
  const obj = new CSS2DObject(el); obj.position.set(...position); obj.userData = { text, description }; machine.add(obj); return obj;
}

// 100 cm PET-bottle silhouette: the outer carton follows the same profile.
const profile = [[0.0,0.0],[0.94,0.0],[1.0,.18],[1.0,2.35],[.94,2.55],[.7,2.7],[.7,3.05],[.44,3.2],[.44,3.5],[.31,3.62],[.31,3.92],[.2,4.04],[0.0,4.04]];
const lathePoints = profile.map(([r,y]) => new THREE.Vector2(r, y));
const bottle = new THREE.Mesh(new THREE.LatheGeometry(lathePoints, 48), new THREE.MeshBasicMaterial({ color: 0x003b56, transparent: true, opacity: .035, side: THREE.DoubleSide }));
bottle.position.y = .34; bottle.castShadow = true; machine.add(bottle);
const bottleWire = new THREE.Mesh(new THREE.LatheGeometry(lathePoints, 32), edgeMat); bottleWire.position.copy(bottle.position); bottleWire.material.opacity = .9; machine.add(bottleWire);

// Carton panels with neon seams.
const panels = new THREE.Group(); machine.add(panels);
for (const [x,z,rot] of [[-1.05,0,0],[1.05,0,0],[0,-1.05,Math.PI / 2],[0,1.05,Math.PI / 2]]) {
  const panel = new THREE.Mesh(new THREE.BoxGeometry(2.15, 4.25, .12), shellMat); panel.position.set(x,2.47,z); panel.rotation.y = rot; panels.add(panel);
  const outline = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.15,4.25,.12)), new THREE.LineBasicMaterial({ color: cyan, transparent:true, opacity:.7 })); outline.position.copy(panel.position); outline.rotation.copy(panel.rotation); panels.add(outline);
}
// Wooden internal skeleton.
for (const x of [-.82,.82]) for (const z of [-.82,.82]) lineBox('wooden-skeleton', [.1,4.1,.1], [x,2.42,z]);
for (const y of [.48, 2.35, 4.38]) for (const z of [-.86,.86]) lineBox('wooden-crossbar', [1.8,.1,.1], [0,y,z]);
for (const y of [.48, 2.35, 4.38]) for (const x of [-.86,.86]) lineBox('wooden-crossbar', [.1,.1,1.8], [x,y,0]);

// Hopper, chamber, compactor and lower container.
box('base', [2.1,.25,2.1], [0,.18,0], darkMat);
const hopper = new THREE.Mesh(new THREE.CylinderGeometry(.75,1.12,.46,4), new THREE.MeshBasicMaterial({ color: 0x003b56, transparent:true, opacity:.04, side:THREE.DoubleSide })); hopper.position.set(0,4.34,0); hopper.rotation.y=Math.PI/4; machine.add(hopper); addGlowEdges(hopper);
box('compaction-chamber', [1.65,1.05,1.65], [0,2.75,0], new THREE.MeshPhysicalMaterial({color:0x102324, transparent:true, opacity:.32, roughness:.2, side:THREE.DoubleSide}));
const plate = box('compactor-plate', [1.32,.16,1.32], [0,3.18,0], glowMat);
const containerBottom = box('lower-container', [1.7,.75,1.7], [0,.69,0], darkMat);
for (let i=0;i<4;i++) { const corner = new THREE.Mesh(new THREE.BoxGeometry(.08,.8,.08), glowMat); corner.position.set(i%2 ? .83 : -.83, .72, i>1 ? .83 : -.83); machine.add(corner); }
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
  ['TOLVA / ENTRADA',[1.42,4.92,0], 'cyan','Recepción de botella PET'],
  ['SENSOR IR SUPERIOR',[1.42,4.35,.72], 'mint','Detecta la inserción'],
  ['ESQUELETO DE MADERA',[1.42,3.78,.25], 'mint','Listones internos de refuerzo'],
  ['CÁMARA FACIAL',[1.42,3.21,.58], 'mint','Reconocimiento simulado'],
  ['ESTRUCTURA DE CARTÓN',[1.42,2.64,0], 'cyan','Panel PET reciclado · acabado negro mate'],
  ['PLATO DE COMPACTACIÓN',[1.42,2.07,0], 'cyan','Carrera vertical servo'],
  ['SERVO SG90',[2.55,4.62,.15], 'mint','Actuador de 180°'],
  ['SENSOR IR COMPACTACIÓN',[2.55,4.05,.8], 'mint','Confirma zona despejada'],
  ['LEDs DE ESTADO',[2.55,3.48,.85], 'mint','Listo · proceso · alerta'],
  ['LCD 16×2',[2.55,2.91,.8], 'cyan','Estado · puntos · usuario'],
  ['BUZZER',[2.55,2.34,.88], 'cyan','Confirmación sonora'],
  ['CONTENEDOR INFERIOR',[2.55,1.77,0], 'cyan','Material compactado']
];
const labelObjects = labelData.map(([text,pos,color,desc]) => label(text,pos,color,desc));

const pet = new THREE.Group(); machine.add(pet);
pet.position.set(0, 4.36, 0);
const petMaterial = new THREE.MeshStandardMaterial({ color: 0x58efff, emissive: 0x00aeca, emissiveIntensity: 2.8, transparent: true, opacity: .98, roughness: .16, metalness: .12 });
const petGlowMaterial = new THREE.LineBasicMaterial({ color: 0xe0fdff, transparent: true, opacity: 1 });
const petWireMaterial = new THREE.MeshBasicMaterial({ color: 0x8af4ff, transparent: true, opacity: .3, wireframe: true, depthWrite: false });
const petBody = new THREE.Mesh(new THREE.CylinderGeometry(.3,.36,1.15,32), petMaterial); petBody.position.y=.58; pet.add(petBody);
const petBodyGlow = new THREE.LineSegments(new THREE.EdgesGeometry(petBody.geometry), petGlowMaterial); petBodyGlow.position.copy(petBody.position); petBodyGlow.scale.setScalar(1.025); pet.add(petBodyGlow);
const petBodyWire = new THREE.Mesh(petBody.geometry, petWireMaterial); petBodyWire.position.copy(petBody.position); petBodyWire.scale.setScalar(1.012); pet.add(petBodyWire);
const petShoulder = new THREE.Mesh(new THREE.CylinderGeometry(.22,.3,.22,32), petMaterial); petShoulder.position.y=1.22; pet.add(petShoulder);
const petShoulderGlow = new THREE.LineSegments(new THREE.EdgesGeometry(petShoulder.geometry), petGlowMaterial); petShoulderGlow.position.copy(petShoulder.position); petShoulderGlow.scale.setScalar(1.03); pet.add(petShoulderGlow);
const petShoulderWire = new THREE.Mesh(petShoulder.geometry, petWireMaterial); petShoulderWire.position.copy(petShoulder.position); petShoulderWire.scale.setScalar(1.015); pet.add(petShoulderWire);
const petNeck = new THREE.Mesh(new THREE.CylinderGeometry(.14,.19,.35,32), petMaterial); petNeck.position.y=1.45; pet.add(petNeck);
const petNeckGlow = new THREE.LineSegments(new THREE.EdgesGeometry(petNeck.geometry), petGlowMaterial); petNeckGlow.position.copy(petNeck.position); petNeckGlow.scale.setScalar(1.03); pet.add(petNeckGlow);
const petNeckWire = new THREE.Mesh(petNeck.geometry, petWireMaterial); petNeckWire.position.copy(petNeck.position); petNeckWire.scale.setScalar(1.015); pet.add(petNeckWire);
const petCap = new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,.1,24), new THREE.MeshStandardMaterial({ color: 0xb8fbff, emissive: 0x55e9ff, emissiveIntensity: 2.5 })); petCap.position.y = 1.68; pet.add(petCap);
const petLight = new THREE.PointLight(0x22dfff, 2.8, 3.2); petLight.position.set(0, .8, .65); pet.add(petLight);
pet.visible=false;

const particlePositions = new Float32Array(36 * 3);
for (let i = 0; i < particlePositions.length; i += 3) { particlePositions[i] = (Math.random() - .5) * 1.5; particlePositions[i + 1] = 2.35 + Math.random() * .9; particlePositions[i + 2] = (Math.random() - .5) * 1.5; }
const particleGeometry = new THREE.BufferGeometry(); particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const particleMaterial = new THREE.PointsMaterial({ color: cyan, size: .045, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
const particles = new THREE.Points(particleGeometry, particleMaterial); machine.add(particles);
const impactRing = new THREE.Mesh(new THREE.TorusGeometry(.68, .025, 8, 40), new THREE.MeshBasicMaterial({ color: 0x8af4ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending }));
impactRing.rotation.x = Math.PI / 2;
impactRing.position.set(0, 2.5, 0);
machine.add(impactRing);

const status = document.querySelector('#status-text'), insertBtn = document.querySelector('#insert-btn'), toggleBtn = document.querySelector('#explode-btn');
const counter = document.querySelector('#counter'), points = document.querySelector('#points'), progress = document.querySelector('#daily-progress');
const phaseDetail = document.querySelector('#phase-detail'), userState = document.querySelector('#user-state'), userBadge = document.querySelector('#user-badge');
const uiPanel = document.querySelector('#ui-panel');
const ledObjects = [...document.querySelectorAll('.status-leds .led')];
const simulation = { phase: 'waiting', elapsed: 0, duration: 0, busy: false, userVerified: false, userExists: true, attempts: 0, processed: 3, points: 1240, validBottle: true };
const phases = { face: 4.6, profile: 2.1, register: 2.2, verify: 2.5, insert: 3.4, topSensor: 2.4, validate: 3.6, descend: 2.6, zoneSensor: 2.3, compress: 5.4, impact: 2.4, lift: 2.5, transfer: 2.5, points: 2.8, return: 2.0, reject: 2.2 };
let showLabels = false;

const clamp01 = value => Math.min(Math.max(value, 0), 1);
const easeInOut = value => value < .5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
const easeOut = value => 1 - Math.pow(1 - value, 3);
const lerp = (from, to, amount) => from + (to - from) * amount;
function setStatus(text, active=false, detail='') { status.textContent=text; phaseDetail.textContent=detail; document.querySelector('#led-idle').classList.toggle('on',!active); document.querySelector('#led-active').classList.toggle('on',active); document.querySelector('#led-error').classList.remove('on'); }
function setComponentActive(component, active) {
  if (!component) return;
  component.scale.setScalar(active ? 1.22 : 1);
  if (component.material) {
    component.material.color.setHex(active ? 0xb8fbff : mint);
    component.material.opacity = active ? .98 : .12;
  }
  component.children.forEach(child => { if (child.material) { child.material.color.setHex(active ? 0x8af4ff : cyan); child.material.opacity = active ? 1 : .32; } });
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
  petMaterial.color.setHex(0x42e7ff);
  petGlowMaterial.color.setHex(0xb8fbff);
  petMaterial.emissiveIntensity = 2.8;
  petWireMaterial.opacity = .3;
  petLight.intensity = 2.8;
  particles.position.y = 0;
  beginPhase('insert');
}
function finishSimulation() {
  simulation.busy = false;
  simulation.userVerified = false;
  pet.visible = false;
  pet.position.y = 4.36;
  pet.scale.set(1, 1, 1);
  petMaterial.emissiveIntensity = 2.8;
  petWireMaterial.opacity = .3;
  petLight.intensity = 2.8;
  plate.position.y = 3.18;
  servoArm.rotation.z = -.2;
  particleMaterial.opacity = 0;
  impactRing.material.opacity = 0;
  beginPhase('return');
}
function updateSimulation(delta) {
  if (!simulation.busy) return;
  simulation.elapsed += Math.min(delta, .05);
  const progress01 = clamp01(simulation.elapsed / simulation.duration);
  const smooth = easeInOut(progress01);
  if (simulation.phase === 'face') {
    const scan = 1.12 + Math.sin(simulation.elapsed * 9) * .18;
    lens.scale.setScalar(scan); cameraUnit.scale.set(1.12, scan, 1.12);
    lens.material.emissiveIntensity = 5 + Math.sin(simulation.elapsed * 12) * 2;
  } else if (simulation.phase === 'profile') {
    lens.scale.setScalar(1.18 + Math.sin(simulation.elapsed * 6) * .06);
    lens.material.emissiveIntensity = 7;
  } else if (simulation.phase === 'verify') {
    lens.scale.setScalar(1.22 - smooth * .22); lens.material.emissiveIntensity = 6;
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
    petMaterial.color.setHex(simulation.validBottle ? 0x42e7ff : 0xff527a);
    petGlowMaterial.color.setHex(simulation.validBottle ? 0x8af4ff : 0xff527a);
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
    plate.position.y = lerp(3.18, 2.18, weighted);
    servoArm.rotation.z = lerp(-.2, -1.35, easeOut(progress01));
    pet.position.y = lerp(3.42, 2.82, weighted);
    pet.scale.set(lerp(1, 1.8, weighted), lerp(1, .18, weighted), lerp(1, 1.8, weighted));
    petMaterial.emissiveIntensity = 2.5 + weighted * 7;
    petLight.intensity = 3.5 + weighted * 8;
    petWireMaterial.opacity = .42 + weighted * .28;
    const compressionPulse = Math.sin(progress01 * Math.PI);
    particleMaterial.opacity = compressionPulse * 1.5;
    impactRing.material.opacity = compressionPulse * .95;
    impactRing.scale.setScalar(1 + weighted * 1.8);
    particles.rotation.y += delta * 3.2;
  } else if (simulation.phase === 'impact') {
    pet.scale.set(1.8, .18, 1.8); pet.position.y = 2.82;
    plate.position.y = 2.18; servoArm.rotation.z = -1.35;
    petMaterial.emissiveIntensity = 7 + Math.sin(simulation.elapsed * 22) * 2;
    petLight.intensity = 11 + Math.sin(simulation.elapsed * 18) * 3;
    petWireMaterial.opacity = .8;
    impactRing.material.opacity = .8 + Math.sin(simulation.elapsed * 18) * .2;
    impactRing.scale.setScalar(2.8 + Math.sin(simulation.elapsed * 10) * .3);
    particles.rotation.y += delta * 4.2; particleMaterial.opacity = 1;
  } else if (simulation.phase === 'lift') {
    plate.position.y = lerp(2.18, 3.18, easeOut(progress01));
    servoArm.rotation.z = lerp(-1.35, -.2, easeOut(progress01));
    pet.position.y = 2.82; pet.scale.set(1.8, .18, 1.8); particleMaterial.opacity = .7 * (1 - progress01);
    petLight.intensity = 6 * (1 - progress01) + 2.8;
  } else if (simulation.phase === 'transfer') {
    pet.position.y = lerp(2.82, .94, easeInOut(progress01));
    pet.scale.set(lerp(1.8, .64, smooth), lerp(.18, .34, smooth), lerp(1.8, .64, smooth));
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
    pet.position.y = lerp(.94, .88, settle); pet.scale.set(.64, .34, .64);
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
function resize() { camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); composer.setSize(innerWidth,innerHeight); labels.setSize(innerWidth,innerHeight); }
addEventListener('resize',resize);
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  updateSimulation(delta);
  machine.rotation.y += delta * .09;
  controls.update();
  composer.render();
  labels.render(scene,camera);
}
setTimeout(() => document.querySelector('#loading').classList.add('hidden'), 1450);
animate();
