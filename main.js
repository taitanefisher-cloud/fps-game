import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

// ===== SETUP =====
let scene, camera, renderer;
let zombies = [];
let health = 100, score = 0, wave = 1;

let stamina = 100, sprinting = false;
let velocityY = 0, onGround = true;

let yaw = 0, pitch = 0;
let aiming = false;

const raycaster = new THREE.Raycaster();

// ===== UI =====
const healthEl = document.getElementById("health");
const ammoEl = document.getElementById("ammo");
const scoreEl = document.getElementById("score");
const waveEl = document.getElementById("wave");
const staminaBar = document.getElementById("staminaBar");

// ===== WEAPONS =====
class Weapon {
  constructor(name, mag, dmg, rate, recoil) {
    this.name = name;
    this.mag = mag;
    this.ammo = mag;
    this.dmg = dmg;
    this.rate = rate;
    this.recoil = recoil;
    this.lastShot = 0;
  }

  shoot() {
    if (this.ammo <= 0 || Date.now() - this.lastShot < this.rate) return false;
    this.ammo--;
    this.lastShot = Date.now();
    return true;
  }
}

const weapons = {
  ar: new Weapon("AR", 30, 20, 100, 0.02),
  shotgun: new Weapon("Shotgun", 8, 60, 700, 0.06),
  sniper: new Weapon("Sniper", 5, 120, 1200, 0.01)
};

let currentWeapon = weapons.ar;

// ===== START =====
function startGame() {
  menu.style.display = "none";
  hud.style.display = "block";
  init();
  spawnWave();
  animate();
}

// ===== INIT =====
function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);
  scene.fog = new THREE.Fog(0x111111, 10, 150);

  camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);
  camera.position.y = 2;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(innerWidth, innerHeight);
  document.body.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x444444));

  // ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200,200),
    new THREE.MeshBasicMaterial({color:0x222222})
  );
  ground.rotation.x = -Math.PI/2;
  scene.add(ground);

  // buildings
  for (let i = 0; i < 20; i++) {
    const b = new THREE.Mesh(
      new THREE.BoxGeometry(5, Math.random()*10+5, 5),
      new THREE.MeshStandardMaterial({color:0x888888})
    );
    b.position.set(Math.random()*80-40, b.geometry.parameters.height/2, Math.random()*80-40);
    scene.add(b);
  }

  // gun model
  const loader = new GLTFLoader();

  loader.load(
    "https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf",
    (gltf)=>{
      gun = gltf.scene;
      camera.add(gun);
      gun.position.set(0.6,-0.6,-1.2);
      gun.scale.set(0.6,0.6,0.6);
    }
  );

  document.addEventListener("click", ()=>document.body.requestPointerLock());
  document.addEventListener("mousemove", mouseLook);
  document.addEventListener("mousedown", shoot);
  document.addEventListener("keydown", keys);
  document.addEventListener("keyup", e => { if(e.code==="ShiftLeft") sprinting=false; });

  document.addEventListener("mousedown", e => { if(e.button===2) aiming=true; });
  document.addEventListener("mouseup", e => { if(e.button===2) aiming=false; });
  document.addEventListener("contextmenu", e=>e.preventDefault());
}

// ===== LOOK =====
function mouseLook(e){
  if(document.pointerLockElement!==document.body)return;
  yaw -= e.movementX*0.002;
  pitch -= e.movementY*0.002;
  pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitch));
  camera.rotation.set(pitch, yaw, 0, "YXZ");
}

// ===== INPUT =====
function keys(e){
  let speed = sprinting && stamina>0 ? 0.5 : 0.3;

  if(e.code==="ShiftLeft") sprinting=true;

  if(e.code==="KeyW") camera.translateZ(-speed);
  if(e.code==="KeyS") camera.translateZ(speed);
  if(e.code==="KeyA") camera.translateX(-speed);
  if(e.code==="KeyD") camera.translateX(speed);

  if(e.code==="Space" && onGround){
    velocityY = 0.25;
    onGround = false;
  }

  if(e.code==="Digit1") currentWeapon = weapons.ar;
  if(e.code==="Digit2") currentWeapon = weapons.shotgun;
  if(e.code==="Digit3") currentWeapon = weapons.sniper;
}

// ===== SHOOT =====
function shoot(){
  if(!currentWeapon.shoot()) return;

  const spread = currentWeapon.recoil;
  const dir = new THREE.Vector3(
    (Math.random()-0.5)*spread,
    (Math.random()-0.5)*spread,
    -1
  ).applyQuaternion(camera.quaternion);

  raycaster.set(camera.position, dir);

  const hits = raycaster.intersectObjects(zombies);

  if(hits.length>0){
    const z = hits[0].object;

    let dmg = currentWeapon.dmg;
    if(hits[0].point.y > z.position.y+0.3) dmg *= 2;

    z.health -= dmg;

    showHitmarker();

    if(z.health <= 0){
      scene.remove(z);
      zombies = zombies.filter(e=>e!==z);
      score++;
      addKill("Zombie eliminated");

      if(zombies.length===0){
        wave++;
        spawnWave();
      }
    }
  }
}

// ===== SPAWN =====
function spawnWave(){
  waveEl.innerText = wave;

  for(let i=0;i<wave*3;i++){
    const z = new THREE.Mesh(
      new THREE.BoxGeometry(1,1,1),
      new THREE.MeshBasicMaterial({color:0x00ff00})
    );

    z.position.set(Math.random()*60-30,0.5,Math.random()*60-30);
    z.health = 100;
    z.speed = 0.02;

    scene.add(z);
    zombies.push(z);
  }
}

// ===== UPDATE =====
function updateZombies(){
  zombies.forEach(z=>{
    let dir = new THREE.Vector3().subVectors(camera.position,z.position).normalize();
    z.position.lerp(z.position.clone().add(dir),0.05);

    if(z.position.distanceTo(camera.position)<1.5){
      health -= 0.4;
      showDamage();
      if(health<=0) gameOver();
    }
  });
}

// ===== UI =====
function showHitmarker(){
  hitmarker.style.display="block";
  setTimeout(()=>hitmarker.style.display="none",100);
}

function addKill(text){
  const el=document.createElement("div");
  el.innerText=text;
  killfeed.appendChild(el);
  setTimeout(()=>el.remove(),2000);
}

function showDamage(){
  damage.style.opacity=0.4;
  setTimeout(()=>damage.style.opacity=0,100);
}

// ===== LOOP =====
function animate(){
  requestAnimationFrame(animate);

  if(sprinting && stamina>0) stamina-=0.5;
  else stamina=Math.min(100,stamina+0.3);

  staminaBar.style.width = stamina + "%";

  if(!onGround){
    velocityY -= 0.01;
    camera.position.y += velocityY;
    if(camera.position.y<=2){
      camera.position.y=2;
      onGround=true;
    }
  }

  updateZombies();

  healthEl.innerText = Math.floor(health);
  ammoEl.innerText = currentWeapon.ammo;
  scoreEl.innerText = score;

  renderer.render(scene,camera);
}

// ===== GAME OVER =====
function gameOver(){
  gameover.style.display="block";
}