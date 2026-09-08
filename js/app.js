/* =========================================================
   J.A.R.V.I.S. — APP CORE
   Conecta interfaz + Brain + Router + Tools + módulos
   ========================================================= */

let isDev=false;
let devUnlocked=false;

let sc=null,cam=null,ren=null,obj=null;
let rot=true;
let gesturesEnabled=false;
let hudEnabled=true;

/* =========================
   UTILIDADES
   ========================= */

function $(id){
  return document.getElementById(id);
}

function safeText(t){
  return String(t??"")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;");
}

/* =========================
   HUD
   ========================= */

function updHUD(){
  const info=$("hudInfo");
  if(!info)return;

  let memCount=0;
  try{
    memCount=typeof mem!=="undefined"?mem.size:0;
  }catch(e){}

  const lang=typeof getLanguage==="function"?getLanguage():"es";
  const mode=typeof getPersonalityName==="function"
    ?getPersonalityName()
    :"J.A.R.V.I.S.";

  info.innerHTML=
    `ONLINE · MEM ${memCount} · LANG ${lang.toUpperCase()} · ${safeText(mode)}`;
}

function toggleHUD(){
  hudEnabled=!hudEnabled;
  const h=$("hud");
  if(h)h.style.display=hudEnabled?"block":"none";
}

/* =========================
   THREE.JS
   ========================= */

function initThree(){
  if(typeof THREE==="undefined")return;

  const scene=$("scene");
  if(!scene)return;

  sc=new THREE.Scene();

  cam=new THREE.PerspectiveCamera(
    60,
    scene.clientWidth/scene.clientHeight,
    .1,
    100
  );

  cam.position.z=5;

  ren=new THREE.WebGLRenderer({
    alpha:true,
    antialias:true
  });

  ren.setPixelRatio(Math.min(devicePixelRatio,2));
  ren.setSize(scene.clientWidth,scene.clientHeight);
  scene.innerHTML="";
  scene.appendChild(ren.domElement);

  const light=new THREE.PointLight(0x00eaff,2,20);
  light.position.set(2,3,4);
  sc.add(light);

  const geo=new THREE.IcosahedronGeometry(1.25,2);

  const mat=new THREE.PointsMaterial({
    color:0x00eaff,
    size:.035,
    transparent:true,
    opacity:.9
  });

  obj=new THREE.Points(geo,mat);
  sc.add(obj);

  animateThree();
}

function animateThree(){
  requestAnimationFrame(animateThree);

  if(obj&&rot){
    obj.rotation.x+=.002;
    obj.rotation.y+=.004;
  }

  if(ren&&sc&&cam)
    ren.render(sc,cam);
}

function rotateHologram(){
  rot=!rot;
  return rot;
}

window.addEventListener("resize",()=>{
  if(!cam||!ren)return;

  const scene=$("scene");
  if(!scene)return;

  cam.aspect=scene.clientWidth/scene.clientHeight;
  cam.updateProjectionMatrix();

  ren.setSize(scene.clientWidth,scene.clientHeight);
});

/* =========================
   HOLOGRAMA
   ========================= */

function showHologram(name){
  try{
    if(typeof buildMathHologram==="function"){
      buildMathHologram(String(name||"holograma"));
      return true;
    }
  }catch(e){
    console.error(e);
  }

  return false;
}

/* =========================
   RESPUESTA IA
   ========================= */

async function askAI(text,img=null){
  try{
    let prompt=text;

    if(typeof getPersonalityInstruction==="function"){
      prompt=
        getPersonalityInstruction()+
        "\n\n"+
        prompt;
    }

    if(typeof getContext==="function"){
      const ctx=getContext();

      if(ctx){
        prompt+=
          "\n\nCONTEXTO DEL SISTEMA:\n"+
          ctx;
      }
    }

    return await fAI(prompt,img);

  }catch(e){
    console.error(e);
    return "Se produjo un error al consultar la IA.";
  }
}

/* =========================
   TAGS ESPECIALES
   ========================= */

function processTags(answer){

  let text=String(answer||"");

  /* HOLOGRAMA */

  const holo=/\[HOLOGRAM_3D:([^\]]+)\]/i.exec(text);

  if(holo){
    showHologram(holo[1].trim());
    text=text.replace(holo[0],"");
  }

  /* ARCHIVO */

  const file=/\[FILE:([^\]]+)\]([\s\S]*?)\[\/FILE\]/i.exec(text);

  if(file){
    const name=file[1].trim();
    const content=file[2].trim();

    createFile(name,content);

    text=text.replace(file[0],
      `Archivo creado: ${name}`
    );
  }

  /* EXEC_JS
     NUNCA se ejecuta automáticamente.
  */

  const exec=/\[EXEC_JS\]([\s\S]*?)\[\/EXEC_JS\]/i.exec(text);

  if(exec){

    text=text.replace(
      exec[0],
      "\n[EXEC_JS detectado: requiere DEV + confirmación manual]\n"
    );

    window.pendingExecJS=exec[1].trim();
  }

  return text.trim();
}

/* =========================
   EJECUCIÓN DE COMANDOS
   ========================= */

async function executeRoute(route,text){

  if(!route)return null;

  switch(route.type){

    case"HOLOGRAM":
      showHologram(text);
      return "Holograma activado.";

    case"MEMORY":
      return handleMemoryCommand(text);

    case"VOICE":
      return handleVoiceCommand(text);

    case"REMINDER":
      return handleReminderCommand(text);

    case"CALCULATOR":
      return handleCalculatorCommand(text);

    case"CLEAR":
      clearChat();
      if(typeof clearContext==="function")
        clearContext();
      return "Conversación reiniciada.";

    case"DEV":
      return handleDevCommand(text);

    case"CODE":
      return await handleCodeCommand(text);

    case"FILE":
      return "Puedes utilizar el botón 📁 para enviar un archivo.";

    case"VISION":
      return "Puedes utilizar el botón de archivo/cámara para analizar una imagen.";

    default:
      return null;
  }
}

/* =========================
   MEMORIA
   ========================= */

function handleMemoryCommand(text){

  const l=text.toLowerCase();

  if(
    l.includes("olvida")||
    l.includes("olvidar")
  ){
    const q=text
      .replace(/olvida/ig,"")
      .replace(/olvidar/ig,"")
      .trim();

    if(typeof deleteMemory==="function")
      deleteMemory(q);

    return "Memoria eliminada.";
  }

  const save=
    text.match(/(?:recuerda|recordar)\s+(?:que\s+)?(.+?)\s*[:=]\s*(.+)$/i);

  if(save){
    if(typeof saveMemory==="function")
      saveMemory(save[1],save[2]);

    return "Memoria guardada.";
  }

  const found=
    typeof findMemory==="function"
      ?findMemory(text)
      :null;

  return found||"No encontré esa información en mi memoria.";
}

/* =========================
   VOZ
   ========================= */

function handleVoiceCommand(text){

  const l=text.toLowerCase();

  if(
    l.includes("silencio")||
    l.includes("callate")||
    l.includes("cállate")
  ){
    if(typeof speechSynthesis!=="undefined")
      speechSynthesis.cancel();

    return "Voz detenida.";
  }

  if(typeof spk==="function"){
    spk(text);
    return "Reproduciendo respuesta por voz.";
  }

  return "El sistema de voz no está disponible.";
}

/* =========================
   CALCULADORA
   ========================= */

function handleCalculatorCommand(text){

  if(typeof calculate!=="function")
    return "Calculadora no disponible.";

  const result=calculate(text);

  return `Resultado: ${result}`;
}

/* =========================
   RECORDATORIOS
   ========================= */

function handleReminderCommand(text){

  let seconds=60;

  const sec=text.match(/(\d+)\s*(segundos?|s)\b/i);
  const min=text.match(/(\d+)\s*(minutos?|min)\b/i);

  if(sec)
    seconds=Number(sec[1]);

  if(min)
    seconds=Number(min[1])*60;

  let task=text
    .replace(/\d+\s*(segundos?|s|minutos?|min)\b/ig,"")
    .replace(/recuérdame/ig,"")
    .replace(/recordatorio/ig,"")
    .replace(/avísame/ig,"")
    .trim();

  if(!task)
    task="Recordatorio";

  if(typeof setReminder==="function")
    setReminder(task,seconds);

  return `Recordatorio programado: ${task}`;
}

/* =========================
   DEV
   ========================= */

function openDev(){

  const pass=prompt("Contraseña DEV:");

  if(pass===DEV_PASSWORD){

    isDev=true;
    devUnlocked=true;

    const panel=$("devPanel");
    if(panel)panel.style.display="block";

    return true;
  }

  alert("Acceso DEV rechazado.");
  return false;
}

function closeDev(){

  isDev=false;
  devUnlocked=false;

  const panel=$("devPanel");
  if(panel)panel.style.display="none";
}

function handleDevCommand(text){

  if(!devUnlocked){
    openDev();
    return "El modo DEV requiere autenticación.";
  }

  if(/diagnóstico|diagnostico/i.test(text)){
    return diagnosticsSummary();
  }

  if(/herramientas|tools/i.test(text)){
    return JSON.stringify(listTools(),null,2);
  }

  if(/contexto/i.test(text)){
    return getContext();
  }

  if(/plan/i.test(text)){
    return JSON.stringify(getPlan(),null,2);
  }

  return "DEV CORE activo.";
}

/* =========================
   CÓDIGO
   ========================= */

async function handleCodeCommand(text){

  if(
    /crear|escribe|haz|genera/i.test(text)
  ){
    return await askAI(
      "Ayúdame con esta tarea de programación:\n"+
      text
    );
  }

  return await askAI(text);
}

/* =========================
   MENSAJE PRINCIPAL
   ========================= */

async function processUserMessage(text,img=null){

  text=String(text||"").trim();

  if(!text&&!img)return;

  if(typeof contextAddUser==="function"&&text)
    contextAddUser(text);

  aM(text,"u");

  const typingId="jarvis-typing";

  aM("Procesando...","y");

  const box=$("mB");

  if(box){
    const msgs=box.querySelectorAll(".m");

    const last=msgs[msgs.length-1];

    if(last)
      last.id=typingId;
  }

  try{

    /* PERSONALIDAD */

    if(typeof applyPersonalityCommand==="function")
      applyPersonalityCommand(text);

    /* IDIOMA */

    if(typeof applyLanguageCommand==="function")
      applyLanguageCommand(text);

    /* ROUTER */

    const route=await routeCommand(text);

    let answer=null;

    if(route&&route.handled)
      answer=await executeRoute(route,text);

    /* CHAT NORMAL */

    if(!answer)
      answer=await askAI(text,img);

    answer=processTags(answer);

    /* RAZONAMIENTO / REVISIÓN */

    if(
      typeof reviewAnswer==="function"&&
      !/^\s*Error:/i.test(answer)
    ){
      const review=reviewAnswer(answer,text);

      if(
        review&&
        review.score<35&&
        answer.length<40
      ){
        answer+="\n\nPuedo ampliar la explicación si quieres.";
      }
    }

    /* CONTEXTO */

    if(typeof contextAddAssistant==="function")
      contextAddAssistant(answer);

    /* MOSTRAR */

    const old=$(typingId);

    if(old)
      old.outerHTML=
        `<div class="m y"><b>J.A.R.V.I.S.:</b> ${safeText(answer)}</div>`;
    else
      aM(answer,"y");

    updHUD();

    /* VOZ */

    if(
      typeof spk==="function"&&
      voiceEnabled&&
      answer
    ){
      spk(answer);
    }

    return answer;

  }catch(e){

    console.error(e);

    const error="Error interno del sistema.";

    const old=$(typingId);

    if(old)
      old.outerHTML=
        `<div class="m y"><b>J.A.R.V.I.S.:</b> ${error}</div>`;
    else
      aM(error,"y");

    return error;
  }
}

/* Alias utilizado por reconocimiento de voz */

function sM(text){
  if($("inp"))
    $("inp").value=text;

  processUserMessage(text);
}

/* =========================
   BOTÓN ENVIAR
   ========================= */

async function sendMessage(){

  const input=$("inp");

  if(!input)return;

  const text=input.value.trim();

  if(!text)return;

  input.value="";

  await processUserMessage(text);
}

/* =========================
   DIAGNÓSTICO
   ========================= */

function runDevDiagnostics(){

  if(!devUnlocked){
    openDev();
    return;
  }

  const r=runDiagnostics();

  aM(
    `<pre>${safeText(diagnosticsSummary())}</pre>`,
    "y"
  );

  return r;
}

/* =========================
   TOOLS
   ========================= */

function showTools(){

  const list=
    typeof listTools==="function"
      ?listTools()
      :[];

  aM(
    `<pre>${safeText(
      JSON.stringify(list,null,2)
    )}</pre>`,
    "y"
  );

  return list;
}

/* =========================
   CONTEXTO
   ========================= */

function showContext(){

  const ctx=
    typeof getContext==="function"
      ?getContext()
      :"Sin contexto.";

  aM(
    `<pre>${safeText(ctx)}</pre>`,
    "y"
  );

  return ctx;
}

/* =========================
   PLAN
   ========================= */

function showPlan(){

  const plan=
    typeof getPlan==="function"
      ?getPlan()
      :{};

  aM(
    `<pre>${safeText(
      JSON.stringify(plan,null,2)
    )}</pre>`,
    "y"
  );

  return plan;
}

/* =========================
   EXPORTAR CHAT
   ========================= */

function exportChat(){

  const box=$("mB");

  if(!box)return;

  const text=[...box.querySelectorAll(".m")]
    .map(x=>x.innerText)
    .join("\n\n");

  createFile(
    "jarvis-chat.txt",
    text
  );
}

/* =========================
   GESTOS / CÁMARA
   ========================= */

async function toggleGestures(){

  gesturesEnabled=!gesturesEnabled;

  const video=$("camera");

  if(!video)return gesturesEnabled;

  if(gesturesEnabled){

    try{

      const stream=
        await navigator.mediaDevices.getUserMedia({
          video:true
        });

      video.srcObject=stream;
      video.style.display="block";

    }catch(e){

      gesturesEnabled=false;

      alert("No se pudo acceder a la cámara.");
    }

  }else{

    if(video.srcObject){

      video.srcObject
        .getTracks()
        .forEach(t=>t.stop());

      video.srcObject=null;
    }

    video.style.display="none";
  }

  return gesturesEnabled;
}

/* =========================
   ARCHIVOS
   ========================= */

function initFileSystem(){

  const file=$("file");

  if(!file)return;

  file.addEventListener("change",async e=>{

    const f=e.target.files?.[0];

    if(!f)return;

    try{
      await handleFileInput(f);
    }catch(err){
      console.error(err);
      aM("No pude procesar el archivo.","y");
    }

    file.value="";
  });
}

/* =========================
   INICIO
   ========================= */

function initApp(){

  try{

    if(
      typeof pdfjsLib!=="undefined"&&
      pdfjsLib.GlobalWorkerOptions
    ){
      pdfjsLib.GlobalWorkerOptions.workerSrc=
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }

    initFileSystem();

    if(typeof initV==="function")
      initV();

    if(typeof initThree==="function")
      initThree();

    if(typeof getLanguage==="function")
      getLanguage();

    if(typeof getPersonality==="function")
      getPersonality();

    updHUD();

    console.log("J.A.R.V.I.S. APP CORE ONLINE");

  }catch(e){
    console.error("APP INIT ERROR:",e);
  }
}

/* =========================
   TECLADO
   ========================= */

window.addEventListener("DOMContentLoaded",()=>{

  const input=$("inp");

  if(input){
    input.addEventListener("keydown",e=>{
      if(e.key==="Enter"){
        e.preventDefault();
        sendMessage();
      }
    });
  }

  initApp();
});

/* =========================
   API GLOBAL
   ========================= */

window.JARVIS_APP={
  send:processUserMessage,
  ask:askAI,
  hologram:showHologram,
  diagnostics:runDevDiagnostics,
  tools:showTools,
  context:showContext,
  plan:showPlan,
  exportChat,
  toggleGestures,
  openDev,
  closeDev
};
