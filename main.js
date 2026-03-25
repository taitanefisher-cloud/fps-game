<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta http-equiv="Content-Style-Type" content="text/css">
  <title></title>
  <meta name="Generator" content="Cocoa HTML Writer">
  <meta name="CocoaVersion" content="2685.4">
  <style type="text/css">
    p.p1 {margin: 0.0px 0.0px 0.0px 0.0px; font: 12.0px Helvetica}
    p.p2 {margin: 0.0px 0.0px 0.0px 0.0px; font: 12.0px Helvetica; min-height: 14.0px}
  </style>
</head>
<body>
<p class="p1">// ===== SETUP =====</p>
<p class="p1">let scene, camera, renderer;</p>
<p class="p1">let zombies = [];</p>
<p class="p1">let health = 100, score = 0, wave = 1;</p>
<p class="p2"><br></p>
<p class="p1">let stamina = 100, sprinting = false;</p>
<p class="p1">let velocityY = 0, onGround = true;</p>
<p class="p2"><br></p>
<p class="p1">let yaw = 0, pitch = 0;</p>
<p class="p1">let aiming = false;</p>
<p class="p2"><br></p>
<p class="p1">const raycaster = new THREE.Raycaster();</p>
<p class="p2"><br></p>
<p class="p1">// ===== UI =====</p>
<p class="p1">const healthEl = document.getElementById("health");</p>
<p class="p1">const ammoEl = document.getElementById("ammo");</p>
<p class="p1">const scoreEl = document.getElementById("score");</p>
<p class="p1">const waveEl = document.getElementById("wave");</p>
<p class="p1">const staminaBar = document.getElementById("staminaBar");</p>
<p class="p2"><br></p>
<p class="p1">// ===== WEAPONS =====</p>
<p class="p1">class Weapon {</p>
<p class="p1"><span class="Apple-converted-space">  </span>constructor(name, mag, dmg, rate, recoil) {</p>
<p class="p1"><span class="Apple-converted-space">    </span>this.name = name;</p>
<p class="p1"><span class="Apple-converted-space">    </span>this.mag = mag;</p>
<p class="p1"><span class="Apple-converted-space">    </span>this.ammo = mag;</p>
<p class="p1"><span class="Apple-converted-space">    </span>this.dmg = dmg;</p>
<p class="p1"><span class="Apple-converted-space">    </span>this.rate = rate;</p>
<p class="p1"><span class="Apple-converted-space">    </span>this.recoil = recoil;</p>
<p class="p1"><span class="Apple-converted-space">    </span>this.lastShot = 0;</p>
<p class="p1"><span class="Apple-converted-space">  </span>}</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>shoot() {</p>
<p class="p1"><span class="Apple-converted-space">    </span>if (this.ammo &lt;= 0 || Date.now() - this.lastShot &lt; this.rate) return false;</p>
<p class="p1"><span class="Apple-converted-space">    </span>this.ammo--;</p>
<p class="p1"><span class="Apple-converted-space">    </span>this.lastShot = Date.now();</p>
<p class="p1"><span class="Apple-converted-space">    </span>return true;</p>
<p class="p1"><span class="Apple-converted-space">  </span>}</p>
<p class="p1">}</p>
<p class="p2"><br></p>
<p class="p1">const weapons = {</p>
<p class="p1"><span class="Apple-converted-space">  </span>ar: new Weapon("AR", 30, 20, 100, 0.02),</p>
<p class="p1"><span class="Apple-converted-space">  </span>shotgun: new Weapon("Shotgun", 8, 60, 700, 0.06),</p>
<p class="p1"><span class="Apple-converted-space">  </span>sniper: new Weapon("Sniper", 5, 120, 1200, 0.01)</p>
<p class="p1">};</p>
<p class="p2"><br></p>
<p class="p1">let currentWeapon = weapons.ar;</p>
<p class="p2"><br></p>
<p class="p1">// ===== START =====</p>
<p class="p1">function startGame() {</p>
<p class="p1"><span class="Apple-converted-space">  </span>menu.style.display = "none";</p>
<p class="p1"><span class="Apple-converted-space">  </span>hud.style.display = "block";</p>
<p class="p1"><span class="Apple-converted-space">  </span>init();</p>
<p class="p1"><span class="Apple-converted-space">  </span>spawnWave();</p>
<p class="p1"><span class="Apple-converted-space">  </span>animate();</p>
<p class="p1">}</p>
<p class="p2"><br></p>
<p class="p1">// ===== INIT =====</p>
<p class="p1">function init() {</p>
<p class="p1"><span class="Apple-converted-space">  </span>scene = new THREE.Scene();</p>
<p class="p1"><span class="Apple-converted-space">  </span>scene.background = new THREE.Color(0x87ceeb);</p>
<p class="p1"><span class="Apple-converted-space">  </span>scene.fog = new THREE.Fog(0x111111, 10, 150);</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);</p>
<p class="p1"><span class="Apple-converted-space">  </span>camera.position.y = 2;</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>renderer = new THREE.WebGLRenderer();</p>
<p class="p1"><span class="Apple-converted-space">  </span>renderer.setSize(innerWidth, innerHeight);</p>
<p class="p1"><span class="Apple-converted-space">  </span>document.body.appendChild(renderer.domElement);</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>scene.add(new THREE.HemisphereLight(0xffffff, 0x444444));</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>// ground</p>
<p class="p1"><span class="Apple-converted-space">  </span>const ground = new THREE.Mesh(</p>
<p class="p1"><span class="Apple-converted-space">    </span>new THREE.PlaneGeometry(200,200),</p>
<p class="p1"><span class="Apple-converted-space">    </span>new THREE.MeshBasicMaterial({color:0x222222})</p>
<p class="p1"><span class="Apple-converted-space">  </span>);</p>
<p class="p1"><span class="Apple-converted-space">  </span>ground.rotation.x = -Math.PI/2;</p>
<p class="p1"><span class="Apple-converted-space">  </span>scene.add(ground);</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>// buildings</p>
<p class="p1"><span class="Apple-converted-space">  </span>for (let i = 0; i &lt; 20; i++) {</p>
<p class="p1"><span class="Apple-converted-space">    </span>const b = new THREE.Mesh(</p>
<p class="p1"><span class="Apple-converted-space">      </span>new THREE.BoxGeometry(5, Math.random()*10+5, 5),</p>
<p class="p1"><span class="Apple-converted-space">      </span>new THREE.MeshStandardMaterial({color:0x888888})</p>
<p class="p1"><span class="Apple-converted-space">    </span>);</p>
<p class="p1"><span class="Apple-converted-space">    </span>b.position.set(Math.random()*80-40, b.geometry.parameters.height/2, Math.random()*80-40);</p>
<p class="p1"><span class="Apple-converted-space">    </span>scene.add(b);</p>
<p class="p1"><span class="Apple-converted-space">  </span>}</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>// gun model</p>
<p class="p1"><span class="Apple-converted-space">  </span>const loader = new THREE.GLTFLoader();</p>
<p class="p1"><span class="Apple-converted-space">  </span>loader.load(</p>
<p class="p1"><span class="Apple-converted-space">    </span>"https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf",</p>
<p class="p1"><span class="Apple-converted-space">    </span>(gltf)=&gt;{</p>
<p class="p1"><span class="Apple-converted-space">      </span>gun = gltf.scene;</p>
<p class="p1"><span class="Apple-converted-space">      </span>camera.add(gun);</p>
<p class="p1"><span class="Apple-converted-space">      </span>gun.position.set(0.6,-0.6,-1.2);</p>
<p class="p1"><span class="Apple-converted-space">      </span>gun.scale.set(0.6,0.6,0.6);</p>
<p class="p1"><span class="Apple-converted-space">    </span>}</p>
<p class="p1"><span class="Apple-converted-space">  </span>);</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>document.addEventListener("click", ()=&gt;document.body.requestPointerLock());</p>
<p class="p1"><span class="Apple-converted-space">  </span>document.addEventListener("mousemove", mouseLook);</p>
<p class="p1"><span class="Apple-converted-space">  </span>document.addEventListener("mousedown", shoot);</p>
<p class="p1"><span class="Apple-converted-space">  </span>document.addEventListener("keydown", keys);</p>
<p class="p1"><span class="Apple-converted-space">  </span>document.addEventListener("keyup", e =&gt; { if(e.code==="ShiftLeft") sprinting=false; });</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>document.addEventListener("mousedown", e =&gt; { if(e.button===2) aiming=true; });</p>
<p class="p1"><span class="Apple-converted-space">  </span>document.addEventListener("mouseup", e =&gt; { if(e.button===2) aiming=false; });</p>
<p class="p1"><span class="Apple-converted-space">  </span>document.addEventListener("contextmenu", e=&gt;e.preventDefault());</p>
<p class="p1">}</p>
<p class="p2"><br></p>
<p class="p1">// ===== LOOK =====</p>
<p class="p1">function mouseLook(e){</p>
<p class="p1"><span class="Apple-converted-space">  </span>if(document.pointerLockElement!==document.body)return;</p>
<p class="p1"><span class="Apple-converted-space">  </span>yaw -= e.movementX*0.002;</p>
<p class="p1"><span class="Apple-converted-space">  </span>pitch -= e.movementY*0.002;</p>
<p class="p1"><span class="Apple-converted-space">  </span>pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitch));</p>
<p class="p1"><span class="Apple-converted-space">  </span>camera.rotation.set(pitch, yaw, 0, "YXZ");</p>
<p class="p1">}</p>
<p class="p2"><br></p>
<p class="p1">// ===== INPUT =====</p>
<p class="p1">function keys(e){</p>
<p class="p1"><span class="Apple-converted-space">  </span>let speed = sprinting &amp;&amp; stamina&gt;0 ? 0.5 : 0.3;</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>if(e.code==="ShiftLeft") sprinting=true;</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>if(e.code==="KeyW") camera.translateZ(-speed);</p>
<p class="p1"><span class="Apple-converted-space">  </span>if(e.code==="KeyS") camera.translateZ(speed);</p>
<p class="p1"><span class="Apple-converted-space">  </span>if(e.code==="KeyA") camera.translateX(-speed);</p>
<p class="p1"><span class="Apple-converted-space">  </span>if(e.code==="KeyD") camera.translateX(speed);</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>if(e.code==="Space" &amp;&amp; onGround){</p>
<p class="p1"><span class="Apple-converted-space">    </span>velocityY = 0.25;</p>
<p class="p1"><span class="Apple-converted-space">    </span>onGround = false;</p>
<p class="p1"><span class="Apple-converted-space">  </span>}</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>if(e.code==="Digit1") currentWeapon = weapons.ar;</p>
<p class="p1"><span class="Apple-converted-space">  </span>if(e.code==="Digit2") currentWeapon = weapons.shotgun;</p>
<p class="p1"><span class="Apple-converted-space">  </span>if(e.code==="Digit3") currentWeapon = weapons.sniper;</p>
<p class="p1">}</p>
<p class="p2"><br></p>
<p class="p1">// ===== SHOOT =====</p>
<p class="p1">function shoot(){</p>
<p class="p1"><span class="Apple-converted-space">  </span>if(!currentWeapon.shoot()) return;</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>const spread = currentWeapon.recoil;</p>
<p class="p1"><span class="Apple-converted-space">  </span>const dir = new THREE.Vector3(</p>
<p class="p1"><span class="Apple-converted-space">    </span>(Math.random()-0.5)*spread,</p>
<p class="p1"><span class="Apple-converted-space">    </span>(Math.random()-0.5)*spread,</p>
<p class="p1"><span class="Apple-converted-space">    </span>-1</p>
<p class="p1"><span class="Apple-converted-space">  </span>).applyQuaternion(camera.quaternion);</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>raycaster.set(camera.position, dir);</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>const hits = raycaster.intersectObjects(zombies);</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>if(hits.length&gt;0){</p>
<p class="p1"><span class="Apple-converted-space">    </span>const z = hits[0].object;</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">    </span>let dmg = currentWeapon.dmg;</p>
<p class="p1"><span class="Apple-converted-space">    </span>if(hits[0].point.y &gt; z.position.y+0.3) dmg *= 2;</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">    </span>z.health -= dmg;</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">    </span>showHitmarker();</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">    </span>if(z.health &lt;= 0){</p>
<p class="p1"><span class="Apple-converted-space">      </span>scene.remove(z);</p>
<p class="p1"><span class="Apple-converted-space">      </span>zombies = zombies.filter(e=&gt;e!==z);</p>
<p class="p1"><span class="Apple-converted-space">      </span>score++;</p>
<p class="p1"><span class="Apple-converted-space">      </span>addKill("Zombie eliminated");</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">      </span>if(zombies.length===0){</p>
<p class="p1"><span class="Apple-converted-space">        </span>wave++;</p>
<p class="p1"><span class="Apple-converted-space">        </span>spawnWave();</p>
<p class="p1"><span class="Apple-converted-space">      </span>}</p>
<p class="p1"><span class="Apple-converted-space">    </span>}</p>
<p class="p1"><span class="Apple-converted-space">  </span>}</p>
<p class="p1">}</p>
<p class="p2"><br></p>
<p class="p1">// ===== SPAWN =====</p>
<p class="p1">function spawnWave(){</p>
<p class="p1"><span class="Apple-converted-space">  </span>waveEl.innerText = wave;</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>for(let i=0;i&lt;wave*3;i++){</p>
<p class="p1"><span class="Apple-converted-space">    </span>const z = new THREE.Mesh(</p>
<p class="p1"><span class="Apple-converted-space">      </span>new THREE.BoxGeometry(1,1,1),</p>
<p class="p1"><span class="Apple-converted-space">      </span>new THREE.MeshBasicMaterial({color:0x00ff00})</p>
<p class="p1"><span class="Apple-converted-space">    </span>);</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">    </span>z.position.set(Math.random()*60-30,0.5,Math.random()*60-30);</p>
<p class="p1"><span class="Apple-converted-space">    </span>z.health = 100;</p>
<p class="p1"><span class="Apple-converted-space">    </span>z.speed = 0.02;</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">    </span>scene.add(z);</p>
<p class="p1"><span class="Apple-converted-space">    </span>zombies.push(z);</p>
<p class="p1"><span class="Apple-converted-space">  </span>}</p>
<p class="p1">}</p>
<p class="p2"><br></p>
<p class="p1">// ===== UPDATE =====</p>
<p class="p1">function updateZombies(){</p>
<p class="p1"><span class="Apple-converted-space">  </span>zombies.forEach(z=&gt;{</p>
<p class="p1"><span class="Apple-converted-space">    </span>let dir = new THREE.Vector3().subVectors(camera.position,z.position).normalize();</p>
<p class="p1"><span class="Apple-converted-space">    </span>z.position.lerp(z.position.clone().add(dir),0.05);</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">    </span>if(z.position.distanceTo(camera.position)&lt;1.5){</p>
<p class="p1"><span class="Apple-converted-space">      </span>health -= 0.4;</p>
<p class="p1"><span class="Apple-converted-space">      </span>showDamage();</p>
<p class="p1"><span class="Apple-converted-space">      </span>if(health&lt;=0) gameOver();</p>
<p class="p1"><span class="Apple-converted-space">    </span>}</p>
<p class="p1"><span class="Apple-converted-space">  </span>});</p>
<p class="p1">}</p>
<p class="p2"><br></p>
<p class="p1">// ===== UI =====</p>
<p class="p1">function showHitmarker(){</p>
<p class="p1"><span class="Apple-converted-space">  </span>hitmarker.style.display="block";</p>
<p class="p1"><span class="Apple-converted-space">  </span>setTimeout(()=&gt;hitmarker.style.display="none",100);</p>
<p class="p1">}</p>
<p class="p2"><br></p>
<p class="p1">function addKill(text){</p>
<p class="p1"><span class="Apple-converted-space">  </span>const el=document.createElement("div");</p>
<p class="p1"><span class="Apple-converted-space">  </span>el.innerText=text;</p>
<p class="p1"><span class="Apple-converted-space">  </span>killfeed.appendChild(el);</p>
<p class="p1"><span class="Apple-converted-space">  </span>setTimeout(()=&gt;el.remove(),2000);</p>
<p class="p1">}</p>
<p class="p2"><br></p>
<p class="p1">function showDamage(){</p>
<p class="p1"><span class="Apple-converted-space">  </span>damage.style.opacity=0.4;</p>
<p class="p1"><span class="Apple-converted-space">  </span>setTimeout(()=&gt;damage.style.opacity=0,100);</p>
<p class="p1">}</p>
<p class="p2"><br></p>
<p class="p1">// ===== LOOP =====</p>
<p class="p1">function animate(){</p>
<p class="p1"><span class="Apple-converted-space">  </span>requestAnimationFrame(animate);</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>if(sprinting &amp;&amp; stamina&gt;0) stamina-=0.5;</p>
<p class="p1"><span class="Apple-converted-space">  </span>else stamina=Math.min(100,stamina+0.3);</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>staminaBar.style.width = stamina + "%";</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>if(!onGround){</p>
<p class="p1"><span class="Apple-converted-space">    </span>velocityY -= 0.01;</p>
<p class="p1"><span class="Apple-converted-space">    </span>camera.position.y += velocityY;</p>
<p class="p1"><span class="Apple-converted-space">    </span>if(camera.position.y&lt;=2){</p>
<p class="p1"><span class="Apple-converted-space">      </span>camera.position.y=2;</p>
<p class="p1"><span class="Apple-converted-space">      </span>onGround=true;</p>
<p class="p1"><span class="Apple-converted-space">    </span>}</p>
<p class="p1"><span class="Apple-converted-space">  </span>}</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>updateZombies();</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>healthEl.innerText = Math.floor(health);</p>
<p class="p1"><span class="Apple-converted-space">  </span>ammoEl.innerText = currentWeapon.ammo;</p>
<p class="p1"><span class="Apple-converted-space">  </span>scoreEl.innerText = score;</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>renderer.render(scene,camera);</p>
<p class="p1">}</p>
<p class="p2"><br></p>
<p class="p1">// ===== GAME OVER =====</p>
<p class="p1">function gameOver(){</p>
<p class="p1"><span class="Apple-converted-space">  </span>gameover.style.display="block";</p>
<p class="p1">}</p>
</body>
</html>
