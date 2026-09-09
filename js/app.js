/* =========================================================
   YARVIS — APP CORE V4
   ========================================================= */

let isDev=false;
let devUnlocked=false;
let sc=null;
let obj=null;
let camera=null;
let renderer=null;
let rotX=0;
let rotY=0;
let voiceChatActive=false;

const chatHist=window.chatHist||[];
window.chatHist=chatHist;


/* =========================
   THREE.JS
   ========================= */

function initThree(){

 if(typeof THREE==="undefined")return;

 const sceneEl=document.getElementById("scene");
 if(!sceneEl)return;

 sc=new THREE.Scene();

 camera=new THREE.PerspectiveCamera(
  60,
  innerWidth/innerHeight,
  .1,
  100
 );

 camera.position.z=4;

 renderer=new THREE.WebGLRenderer({
  alpha:true,
  antialias:true
 });

 renderer.setPixelRatio(
  Math.min(devicePixelRatio,1.5)
 );

 renderer.setSize(
  innerWidth,
  innerHeight
 );

 sceneEl.innerHTML="";
 sceneEl.appendChild(renderer.domElement);

 window.addEventListener("resize",()=>{

  if(!camera||!renderer)return;

  camera.aspect=
   innerWidth/innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
   innerWidth,
   innerHeight
  );
 });

 animate();
}


function animate(){

 requestAnimationFrame(animate);

 if(obj){

  obj.rotation.y+=.002;
  obj.rotation.x+=.0005;

  obj.rotation.y+=rotY*.002;
  obj.rotation.x+=rotX*.002;

  rotX*=.94;
  rotY*=.94;
 }

 if(renderer&&sc&&camera)
  renderer.render(sc,camera);
}


function showHologram(type="core"){

 if(typeof buildMathHologram==="function"){

  if(
   /edificio|rascacielos|torre/i.test(type)
  )
   buildMathHologram("edificio");
  else
   buildMathHologram(type);

  return;
 }

 if(!sc||typeof THREE==="undefined")
  return;

 const pts=[];

 for(let i=0;i<700;i++){

  const a=Math.random()*Math.PI*2;
  const r=.7+Math.random()*.5;

  pts.push(
   Math.cos(a)*r,
   (Math.random()-.5)*2,
   Math.sin(a)*r
  );
 }

 renderDynamicHologram(
  pts,
  "HOLOGRAMA"
 );
}


function rotateHologram(x,y){

 rotX+=y;
 rotY+=x;
}


/* =========================
   HUD
   ========================= */

function updHUD(){

 const hud=document.getElementById("hud");
 if(!hud)return;

 let mem=0;
 let cache=0;
 let knowledge=0;
 let tasks=0;

 try{
  mem=typeof mem!=="undefined"?
   window.mem?.size||0:0;
 }catch(e){}

 try{
  cache=
   typeof getAICacheCount==="function"?
   getAICacheCount():0;
 }catch(e){}

 try{
  knowledge=
   typeof getKnowledgeStats==="function"?
   getKnowledgeStats()?.total||0:0;
 }catch(e){}

 try{
  tasks=
   typeof getTaskStats==="function"?
   getTaskStats()?.total||0:0;
 }catch(e){}

 hud.innerHTML=
 `
 <div>YARVIS CORE V4</div>
 <div>AI: ${typeof llmGenerate==="function"?"ONLINE":"OFFLINE"}</div>
 <div>MEM: ${mem}</div>
 <div>CACHE: ${cache}</div>
 <div>KNOWLEDGE: ${knowledge}</div>
 <div>TASKS: ${tasks}</div>
 <div>AGENT: ${typeof runAgent==="function"?"READY":"OFF"}</div>
 <div>AUTO: ${JAutonomy?.enabled?"ON":"OFF"}</div>
 <div>DEV: ${isDev?"ON":"OFF"}</div>
 `;
}


/* =========================
   ESTADO
   ========================= */

function setStatus(text,type=""){

 const s=document.getElementById("st");
 const core=document.getElementById("core");

 if(s)s.textContent=text;

 if(core){

  core.classList.remove(
   "listening",
   "thinking",
   "speaking"
  );

  if(type)
   core.classList.add(type);
 }
}


/* =========================
   CHAT
   ========================= */

function aM(text,type="y"){

 const box=document.getElementById("mB");
 if(!box)return;

 const div=document.createElement("div");

 div.className=
  "m "+(type==="u"?"u":"y");

 div.innerHTML=
  `<b>${type==="u"?"TÚ":"J.A.R.V.I.S."}:</b> `+
  String(text)
   .replace(/\n/g,"<br>");

 box.appendChild(div);

 box.scrollTop=box.scrollHeight;
}


function clearChat(){

 chatHist.length=0;

 const box=
  document.getElementById("mB");

 if(box){

  box.innerHTML=
   `<div class="m y">
    <b>J.A.R.V.I.S.:</b>
    Sistema reiniciado.
   </div>`;
 }

 if(typeof clearContext==="function")
  clearContext();
}


/* =========================
   IA
   ========================= */

async function askAI(prompt,image=null){

 let p=String(prompt||"");

 try{

  if(
   typeof getPersonalityInstruction==="function"
  ){

   p=
    getPersonalityInstruction()+
    "\n\n"+
    p;
  }

 }catch(e){}

 try{

  if(
   typeof getKnowledgeContext==="function" &&
   !image
  ){

   const k=
    getKnowledgeContext(prompt);

   if(k)
    p+=
     "\n\nCONOCIMIENTO LOCAL:\n"+
     k;
  }

 }catch(e){}

 try{

  if(
   typeof getContext==="function" &&
   !image
  ){

   const c=getContext();

   if(c)
    p+=
     "\n\nCONTEXTO:\n"+
     JSON.stringify(c);
  }

 }catch(e){}

 if(typeof llmGenerate==="function")
  return llmGenerate(p,image);

 if(typeof fAI==="function")
  return fAI(p,image);

 return"Motor IA no disponible.";
}


/* =========================
   TAGS
   ========================= */

async function processTags(text){

 let result=String(text||"");

 const holo=
  result.match(
   /\[HOLOGRAM_3D:([^\]]+)\]/i
  );

 if(holo){

  showHologram(holo[1]);

  result=
   result.replace(holo[0],"");
 }

 const file=
  result.match(
   /\[FILE:([^\]]+)\]/i
  );

 if(file){

  try{

   createFile(
    "yarvis_output.txt",
    file[1]
   );

  }catch(e){}

  result=
   result.replace(file[0],"");
 }

 return result.trim();
}


/* =========================
   AGENT
   ========================= */

async function executeAgent(goal){

 setStatus(
  "AGENTE EJECUTANDO",
  "thinking"
 );

 aM(
  "🤖 <b>Agent Core:</b> analizando tarea...",
  "y"
 );

 try{

  const result=
   await runAgent(goal);

  if(
   result&&
   result.status==="COMPLETED"
  ){

   setStatus(
    "TAREA COMPLETADA",
    "speaking"
   );

   return result.result||
    "Tarea completada.";
  }

  return(
   "⚠️ Estado del agente: "+
   (result?.status||"desconocido")
  );

 }catch(e){

  return"Error del Agent Core: "+
   (e?.message||e);
 }
}


/* =========================
   PROCESAR MENSAJE
   ========================= */

async function processUserMessage(text,image=null){

 text=String(text||"").trim();

 if(!text&&!image)return;

 if(text)
  aM(text,"u");

 setStatus(
  "PROCESANDO",
  "thinking"
 );

 try{

  if(!image){

   const route=
    typeof routeCommand==="function"?
    await routeCommand(text):
    {intent:"CHAT"};

   if(route.intent==="AGENT"){

    const answer=
     await executeAgent(text);

    aM(
     await processTags(answer),
     "y"
    );

    if(typeof spk==="function")
     spk(answer);

    setStatus("LISTO");

    return;
   }

   if(route.intent==="CALCULATOR"){

    let expression=
     text
      .replace(
       /^(cuánto es|cuanto es|calcula|calcular|resuelve)\s*/i,
       ""
      );

    const answer=
     typeof calculate==="function"?
     calculate(expression):
     "Calculadora no disponible.";

    aM(answer,"y");

    setStatus("LISTO");

    return;
   }

   if(route.intent==="HOLOGRAM"){

    showHologram(text);

    aM(
     "🔷 Holograma generado.",
     "y"
    );

    setStatus("LISTO");

    return;
   }

   if(route.intent==="MEMORY"){

    const lower=text.toLowerCase();

    if(
     /recuerda|guardar|guarda/i.test(lower)
    ){

     const clean=
      text
       .replace(
        /^(recuerda|guardar|guarda)\s*/i,
        ""
       );

     if(
      typeof saveMemory==="function"
     )
      saveMemory(
       clean,
       clean
      );

     aM(
      "🧠 Guardado en memoria.",
      "y"
     );

    }else{

     const found=
      typeof findMemory==="function"?
      findMemory(text):
      null;

     aM(
      found||
      "No encontré esa información en mi memoria.",
      "y"
     );
    }

    updHUD();
    setStatus("LISTO");
    return;
   }

   if(route.intent==="REMINDER"){

    if(
     typeof setReminder==="function"
    ){

     setReminder(
      text,
      60
     );

     aM(
      "⏰ Recordatorio configurado.",
      "y"
     );

    }

    setStatus("LISTO");
    return;
   }

   if(route.intent==="CLEAR"){

    clearChat();
    setStatus("LISTO");
    return;
   }
  }

  const answer=
   await askAI(
    text||
    "Analiza la imagen enviada.",
    image
   );

  const clean=
   await processTags(answer);

  aM(clean,"y");

  if(
   typeof contextAddUser==="function" &&
   text
  )
   contextAddUser(text);

  if(
   typeof contextAddAssistant==="function"
  )
   contextAddAssistant(clean);

  if(typeof spk==="function")
   spk(clean);

  setStatus("LISTO");

 }catch(e){

  aM(
   "❌ Error: "+
   (e?.message||String(e)),
   "y"
  );

  setStatus("ERROR");
 }
}


/* =========================
   ARCHIVOS
   ========================= */

function initFileInput(){

 const input=
  document.getElementById("fileInput");

 if(!input)return;

 input.addEventListener(
  "change",
  async e=>{

   const f=e.target.files?.[0];

   if(!f)return;

   if(typeof handleFileInput==="function")
    await handleFileInput(f);

   input.value="";
  }
 );
}


/* =========================
   CÁMARA
   ========================= */

async function openCamera(){

 const video=
  document.getElementById("camera");

 if(!video)return;

 try{

  const stream=
   await navigator.mediaDevices
    .getUserMedia({
     video:true
    });

  video.srcObject=stream;
  video.style.display="block";
  await video.play();

 }catch(e){

  aM(
   "❌ No se pudo abrir la cámara.",
   "y"
  );
 }
}


function closeCamera(){

 const video=
  document.getElementById("camera");

 if(!video)return;

 const stream=
  video.srcObject;

 if(stream)
  stream.getTracks().forEach(
   t=>t.stop()
  );

 video.srcObject=null;
 video.style.display="none";
}


/* =========================
   DEV
   ========================= */

function buildDevPanel(){

 const panel=
  document.getElementById("devPanel");

 if(!panel)return;

 panel.innerHTML=`
 <div class="devTitle">
  ⚙️ J.A.R.V.I.S. DEV CORE
 </div>

 <button id="devDiag">Diagnóstico</button>
 <button id="devAgent">Estado Agent</button>
 <button id="devTasks">Tareas</button>
 <button id="devTools">Herramientas</button>
 <button id="devPlan">Plan actual</button>
 <button id="devAuto">Autonomía</button>
 <button id="devImprove">Proponer mejora</button>
 <button id="devRollback">Rollback</button>
 <button id="devKnowledge">Knowledge</button>
 <button id="devCache">Limpiar caché IA</button>
 <button id="devRotate">Rotar holograma</button>
 <button id="devClose">Cerrar</button>
 `;

 document.getElementById("devDiag")
  ?.addEventListener(
   "click",
   autonomyDiagnose
  );

 document.getElementById("devAgent")
  ?.addEventListener(
   "click",
   ()=>{
    aM(
     "<pre>"+
     JSON.stringify(
      getAgentStatus(),
      null,
      2
     )+
     "</pre>",
     "y"
    );
   }
  );

 document.getElementById("devTasks")
  ?.addEventListener(
   "click",
   ()=>{
    aM(
     "<pre>"+
     JSON.stringify(
      getTasks?.()||[],
      null,
      2
     )+
     "</pre>",
     "y"
    );
   }
  );

 document.getElementById("devTools")
  ?.addEventListener(
   "click",
   ()=>{
    aM(
     "🛠️ "+
     listTools().join(", "),
     "y"
    );
   }
  );

 document.getElementById("devPlan")
  ?.addEventListener(
   "click",
   ()=>{
    aM(
     "<pre>"+
     JSON.stringify(
      getPlan?.(),
      null,
      2
     )+
     "</pre>",
     "y"
    );
   }
  );

 document.getElementById("devAuto")
  ?.addEventListener(
   "click",
   autonomyReport
  );

 document.getElementById("devImprove")
  ?.addEventListener(
   "click",
   autonomyImprove
  );

 document.getElementById("devRollback")
  ?.addEventListener(
   "click",
   autonomyRollback
  );

 document.getElementById("devKnowledge")
  ?.addEventListener(
   "click",
   ()=>{
    try{
     aM(
      "<pre>"+
      JSON.stringify(
       getKnowledgeStats?.(),
       null,
       2
      )+
      "</pre>",
      "y"
     );
    }catch(e){}
   }
  );

 document.getElementById("devCache")
  ?.addEventListener(
   "click",
   ()=>{
    clearAICache?.();
    updHUD();
    aM(
     "🧹 Caché IA limpiada.",
     "y"
    );
   }
  );

 document.getElementById("devRotate")
  ?.addEventListener(
   "click",
   ()=>{
    rotY+=2;
   }
  );

 document.getElementById("devClose")
  ?.addEventListener(
   "click",
   ()=>{
    panel.style.display="none";
   }
  );
}


function toggleDev(){

 const panel=
  document.getElementById("devPanel");

 if(!panel)return;

 if(!devUnlocked){

  const p=
   prompt("Contraseña DEV:");

  if(
   p!=="TU_DEV_PASSWORD"
  )
   return;

  devUnlocked=true;
 }

 isDev=!isDev;

 panel.style.display=
  isDev?"block":"none";

 updHUD();
}


/* =========================
   ENTRADA
   ========================= */

function initInput(){

 const input=
  document.getElementById("input");

 const send=
  document.getElementById("sendBtn");

 const mic=
  document.getElementById("voiceBtn");

 if(send)
  send.onclick=()=>{
   const t=input.value;
   input.value="";
   processUserMessage(t);
  };

 if(input){

  input.addEventListener(
   "keydown",
   e=>{
    if(e.key==="Enter"){
     e.preventDefault();
     send?.click();
    }
   }
  );
 }

 if(mic){

  mic.onclick=()=>{

   if(typeof tM==="function")
    tM();
  };
 }
}


/* =========================
   GESTOS
   ========================= */

function initGestures(){

 let sx=0;
 let sy=0;

 const el=
  document.getElementById("scene");

 if(!el)return;

 el.addEventListener(
  "touchstart",
  e=>{
   const t=e.touches[0];
   sx=t.clientX;
   sy=t.clientY;
  },
  {passive:true}
 );

 el.addEventListener(
  "touchmove",
  e=>{

   const t=e.touches[0];

   rotateHologram(
    t.clientX-sx,
    t.clientY-sy
   );

   sx=t.clientX;
   sy=t.clientY;
  },
  {passive:true}
 );
}


/* =========================
   INIT
   ========================= */

function initApp(){

 initThree();
 initInput();
 initFileInput();
 initGestures();
 buildDevPanel();

 if(typeof initV==="function")
  initV();

 if(typeof registerNativeTools==="function")
  registerNativeTools();

 if(
  typeof startLearning==="function" &&
  localStorage.getItem("jarvis_learning_auto")==="on"
 )
  startLearning();

 updHUD();

 setStatus("LISTO");

 aM(
  "🧠 J.A.R.V.I.S. V4 online.<br>"+
  "Agent Core, Tasks, Skills, Tools, Verifier, Retry, "+
  "Experiences, Performance, Security y Autonomy cargados.",
  "y"
 );
}


/* =========================
   GLOBAL
   ========================= */

window.askAI=askAI;
window.aM=aM;
window.updHUD=updHUD;
window.clearChat=clearChat;
window.processUserMessage=
 processUserMessage;
window.showHologram=
 showHologram;
window.rotateHologram=
 rotateHologram;
window.toggleDev=
 toggleDev;
window.openCamera=
 openCamera;
window.closeCamera=
 closeCamera;

window.JARVIS_APP={
 version:"4.0.0",
 init:initApp,
 askAI,
 processUserMessage,
 showHologram,
 toggleDev,
 openCamera,
 closeCamera
};


if(document.readyState==="loading")
 document.addEventListener(
  "DOMContentLoaded",
  initApp
 );
else
 initApp();
