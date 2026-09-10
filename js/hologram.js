/* =========================================================
   YARVIS — HOLOGRAM.JS
   Holograma 3D REAL con Three.js
   Optimizado para dispositivos modestos
   ========================================================= */

(() => {

"use strict";

let scene;
let camera;
let renderer;

let core;
let innerCore;
let rings = [];

let particles;
let particlePositions;

let animationId;

let hologramState =
  "ONLINE";

let container;
let canvas;


/* =========================
   INICIAR
========================= */

function initHologram(){

  container =
    document.getElementById(
      "hologramArea"
    );

  canvas =
    document.getElementById(
      "hologramCanvas"
    );

  if(
    !container ||
    !canvas
  ){

    console.warn(
      "YARVIS 3D: canvas no encontrado."
    );

    return;
  }

  if(
    typeof THREE ===
    "undefined"
  ){

    console.error(
      "YARVIS 3D: Three.js no cargó."
    );

    return;
  }


  /* =====================
     ESCENA
  ===================== */

  scene =
    new THREE.Scene();


  /* =====================
     CÁMARA
  ===================== */

  camera =
    new THREE.PerspectiveCamera(
      45,
      1,
      0.1,
      100
    );

  camera.position.set(
    0,
    0,
    5
  );


  /* =====================
     RENDERER
  ===================== */

  renderer =
    new THREE.WebGLRenderer({
      canvas,
      antialias:false,
      alpha:true,
      powerPreference:
        "low-power"
    });

  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio || 1,
      1.5
    )
  );

  renderer.setClearColor(
    0x000000,
    0
  );


  /* =====================
     LUCES
  ===================== */

  const ambient =
    new THREE.AmbientLight(
      0x66eaff,
      0.8
    );

  scene.add(
    ambient
  );


  /* =====================
     CORE PRINCIPAL
  ===================== */

  const coreGeometry =
    new THREE.IcosahedronGeometry(
      0.92,
      2
    );

  const coreMaterial =
    new THREE.MeshBasicMaterial({
      color:0x19dfff,
      wireframe:true,
      transparent:true,
      opacity:0.8
    });

  core =
    new THREE.Mesh(
      coreGeometry,
      coreMaterial
    );

  scene.add(
    core
  );


  /* =====================
     CORE INTERNO
  ===================== */

  const innerGeometry =
    new THREE.IcosahedronGeometry(
      0.55,
      1
    );

  const innerMaterial =
    new THREE.MeshBasicMaterial({
      color:0x8cffff,
      wireframe:true,
      transparent:true,
      opacity:0.35
    });

  innerCore =
    new THREE.Mesh(
      innerGeometry,
      innerMaterial
    );

  scene.add(
    innerCore
  );


  /* =====================
     ESFERA DE ENERGÍA
  ===================== */

  const energyGeometry =
    new THREE.SphereGeometry(
      0.68,
      16,
      16
    );

  const energyMaterial =
    new THREE.MeshBasicMaterial({
      color:0x00d9ff,
      transparent:true,
      opacity:0.07,
      wireframe:true
    });

  const energy =
    new THREE.Mesh(
      energyGeometry,
      energyMaterial
    );

  scene.add(
    energy
  );


  /* =====================
     ANILLOS 3D
  ===================== */

  crearAnillo(
    1.25,
    0,
    0,
    0.15
  );

  crearAnillo(
    1.48,
    Math.PI / 2,
    0.2,
    -0.12
  );

  crearAnillo(
    1.72,
    Math.PI / 3,
    -0.3,
    0.08
  );


  /* =====================
     PARTÍCULAS
  ===================== */

  crearParticulas();


  /* =====================
     RESIZE
  ===================== */

  resize();

  window.addEventListener(
    "resize",
    resize
  );


  /* =====================
     ANIMACIÓN
  ===================== */

  animate();

}


/* =========================
   ANILLO
========================= */

function crearAnillo(
  radius,
  rotationX,
  rotationY,
  speed
){

  const geometry =
    new THREE.TorusGeometry(
      radius,
      0.012,
      5,
      64
    );

  const material =
    new THREE.MeshBasicMaterial({
      color:0x1beaff,
      transparent:true,
      opacity:0.7
    });

  const ring =
    new THREE.Mesh(
      geometry,
      material
    );

  ring.rotation.x =
    rotationX;

  ring.rotation.y =
    rotationY;

  ring.userData.speed =
    speed;

  scene.add(
    ring
  );

  rings.push(
    ring
  );
}


/* =========================
   PARTÍCULAS
========================= */

function crearParticulas(){

  const count =
    260;

  const geometry =
    new THREE.BufferGeometry();

  particlePositions =
    new Float32Array(
      count * 3
    );

  for(
    let i = 0;
    i < count;
    i++
  ){

    const radius =
      1.1 +
      Math.random() *
      1.3;

    const theta =
      Math.random() *
      Math.PI *
      2;

    const phi =
      Math.acos(
        2 *
        Math.random() -
        1
      );

    particlePositions[
      i * 3
    ] =
      radius *
      Math.sin(phi) *
      Math.cos(theta);

    particlePositions[
      i * 3 + 1
    ] =
      radius *
      Math.cos(phi);

    particlePositions[
      i * 3 + 2
    ] =
      radius *
      Math.sin(phi) *
      Math.sin(theta);
  }

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
      particlePositions,
      3
    )
  );

  const material =
    new THREE.PointsMaterial({
      color:0x55eeff,
      size:0.025,
      transparent:true,
      opacity:0.7,
      sizeAttenuation:true
    });

  particles =
    new THREE.Points(
      geometry,
      material
    );

  scene.add(
    particles
  );
}


/* =========================
   RESIZE
========================= */

function resize(){

  if(
    !container ||
    !renderer ||
    !camera
  )
    return;

  const width =
    container.clientWidth;

  const height =
    container.clientHeight;

  if(
    !width ||
    !height
  )
    return;

  camera.aspect =
    width / height;

  camera.updateProjectionMatrix();

  renderer.setSize(
    width,
    height,
    false
  );
}


/* =========================
   ESTADO
========================= */

function setHologramState(
  state
){

  hologramState =
    String(
      state ||
      "ONLINE"
    ).toUpperCase();

}

window.yarvisHologramState =
  setHologramState;


/* =========================
   ANIMACIÓN
========================= */

function animate(){

  animationId =
    requestAnimationFrame(
      animate
    );

  if(!core)
    return;


  /* Core */

  core.rotation.x +=
    0.003;

  core.rotation.y +=
    0.006;


  /* Core interno */

  if(innerCore){

    innerCore.rotation.x -=
      0.004;

    innerCore.rotation.y -=
      0.008;
  }


  /* Anillos */

  rings.forEach(
    ring => {

      ring.rotation.z +=
        ring.userData.speed;

      ring.rotation.y +=
        0.002;
    }
  );


  /* Partículas */

  if(particles){

    particles.rotation.y +=
      0.0015;

    particles.rotation.x +=
      0.0005;
  }


  /* Pulsación */

  let targetScale =
    1;

  if(
    hologramState ===
    "PROCESANDO"
  ){

    targetScale =
      1.08;
  }

  else if(
    hologramState ===
    "ESCUCHANDO"
  ){

    targetScale =
      1.13;
  }

  else if(
    hologramState ===
    "HABLANDO"
  ){

    targetScale =
      1.06;
  }

  const scale =
    core.scale.x;

  const next =
    scale +
    (
      targetScale -
      scale
    ) * 0.05;

  core.scale.set(
    next,
    next,
    next
  );


  /* Render */

  renderer.render(
    scene,
    camera
  );
}


/* =========================
   ARRANQUE
========================= */

if(
  document.readyState ===
  "loading"
){

  document.addEventListener(
    "DOMContentLoaded",
    initHologram
  );

}else{

  initHologram();
}


/* =========================
   LIMPIEZA
========================= */

window.addEventListener(
  "beforeunload",
  () => {

    if(animationId){

      cancelAnimationFrame(
        animationId
      );
    }

    if(renderer){

      renderer.dispose();
    }
  }
);

})();
