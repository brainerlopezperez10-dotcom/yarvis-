/* J.A.R.V.I.S. — APP CORE */

let isDev=false,devUnlocked=false,sc=null,cam=null,ren=null,obj=null;
let rot=false,gesturesEnabled=false,hudVisible=true,pendingExecJS=null;

function initThree(){
 const c=document.getElementById("scene");
 if(!c||typeof THREE==="undefined")return;
 sc=new THREE.Scene();
 cam=new THREE.PerspectiveCamera(60,c.clientWidth/c.clientHeight,.1,100);
 cam.position.z=4;
 ren=new THREE.WebGLRenderer({antialias:true,alpha:true});
 ren.setPixelRatio(Math.min(devicePixelRatio||1,2));
 ren.setSize(c.clientWidth,c.clientHeight);
 c.appendChild(ren.domElement);
 addEventListener("resize",resizeThree);
 animateThree();
}

function resizeThree(){
 const c=document.getElementById("scene");
 if(!cam||!ren||!c)return;
 cam.aspect=c.clientWidth/c.clientHeight;
 cam.updateProjectionMatrix();
 ren.setSize(c.clientWidth,c.clientHeight);
}

function animateThree(){
 requestAnimationFrame(animateThree);
 if(obj&&rot)obj.rotation.y+=.006;
 if(ren&&sc&&cam)ren.render(sc,cam);
}

function showHologram(n){
 if(typeof buildMathHologram==="function")
  buildMathHologram(String(n||"holograma").toLowerCase());
}

function rotateHologram(){
 rot=!rot;
 aM(rot?"🔄 Rotación activada.":"⏸️ Rotación detenida.","y");
}

function toggleHUD(){
 hudVisible=!hudVisible;
 const h=document.getElementById("hud");
 if(h)h.style.display=hudVisible?"block":"none";
}

function updHUD(){
 const h=document.getElementById("hudInfo");
 if(!h)return;
 let m=0,c=0,k=0;
 try{m=mem?.size||0}catch(e){}
 try{c=getAICacheCount?.()||0}catch(e){}
 try{k=getKnowledgeStats?.().topics||0}catch(e){}
 h.innerHTML=`LLM: ${(getLLMProvider?.()||"gemini").toUpperCase()}<br>MEM: ${m} | CACHE: ${c}<br>KNOWLEDGE: ${k}<br>DEV: ${isDev?"ON":"OFF"}`;
}

function getLocalKnowledge(q){
 try{return getKnowledgeContext?.(q)||""}catch(e){return""}
}

async function askAI(prompt,image=null){
 let p=String(prompt||"");
 try{
  const x=getPersonalityInstruction?.();
  if(x)p=x+"\n\n"+p;
 }catch(e){}
 try{
  const x=getContext?.();
  if(x)p+="\n\nCONTEXTO RECIENTE:\n"+x;
 }catch(e){}
 const k=getLocalKnowledge(prompt);
 if(k)p+="\n\nCONOCIMIENTO APRENDIDO POR J.A.R.V.I.S.:\n"+k;
 try{
  return await(llmGenerate?.(p,image)||fAI(p,image));
 }catch(e){
  console.error(e);
  return"⚠️ Error al consultar el motor de IA.";
 }
}

function processTags(t){
 if(!t)return"";
 t=String(t).replace(/\[HOLOGRAM_3D:([^\]]+)\]/gi,(_,n)=>{
  showHologram(n);return"";
 });
 t=t.replace(/\[FILE:([^\]]+)\]([\s\S]*?)\[\/FILE\]/gi,(_,n,c)=>{
  createFile(n.trim(),c.trim());return`📁 Archivo creado: ${n}`;
 });
 t=t.replace(/\[EXEC_JS\]([\s\S]*?)\[\/EXEC_JS\]/gi,(_,c)=>{
  pendingExecJS=c.trim();
  return isDev?"⚠️ Código recibido. Requiere confirmación manual.":"🔐 DEV no está habilitado.";
 });
 return t.trim();
}

async function handleMemory(q){
 if(/^(olvida|borra|elimina)\b/i.test(q)){
  deleteMemory?.(q);return"🧠 Memoria eliminada.";
 }
 if(/^(recuerda|recordar|guarda|guardar)\b/i.test(q)){
  const p=q.replace(/^(recuerda|recordar|guarda|guardar)\s*/i,"").split(/\s*:\s*/);
  if(p.length>1){
   saveMemory?.(p[0],p.slice(1).join(":"));
   return"🧠 Guardado en memoria.";
  }
 }
 return findMemory?.(q)||"No encontré esa información en mi memoria.";
}

function handleReminder(t){
 const m=String(t).match(/(?:recordatorio|recordarme|recuerda)\s+(.+)/i);
 if(!m)return"⏰ Dime qué quieres que recuerde.";
 setReminder?.(m[1],60);
 return`⏰ Recordatorio creado: ${m[1]}`;
}

function handleCalculator(t){
 try{return`🧮 ${calculate(t)}`}catch(e){return"No pude calcular esa expresión."}
}

function handleVoice(t){
 const x=String(t).toLowerCase();
 if(x.includes("activar")||x.includes("enciende")){voiceEnabled=true;return"🔊 Voz activada."}
 if(x.includes("desactivar")||x.includes("apaga")){voiceEnabled=false;return"🔇 Voz desactivada."}
 return"🎤 Control de voz disponible.";
}

function handleDev(){
 isDev=devUnlocked=true;
 document.getElementById("systemStatus").innerText="DEV ONLINE";
 updHUD();
 return"🔓 Modo DEV activado.";
}

async function processUserMessage(text,image=null){
 if(!text&&!image)return;
 const q=text||"Analiza esta imagen.";
 aM(q,"u");
 contextAddUser?.(q);

 let r;
 try{r=await routeCommand(q)}catch(e){r={intent:"CHAT"}}
 let i=String(r?.intent||"CHAT").toUpperCase(),a;

 switch(i){
  case"HOLOGRAM":showHologram(r.text);a="🔮 Holograma generado.";break;
  case"MEMORY":a=await handleMemory(q);break;
  case"VOICE":a=handleVoice(q);break;
  case"REMINDER":a=handleReminder(q);break;
  case"CALCULATOR":a=handleCalculator(q);break;
  case"CLEAR":clearChat();clearContext?.();a="🧹 Conversación limpiada.";break;
  case"DEV":a=handleDev();break;
  case"CODE":a=isDev?"💻 Módulo de código listo.":"🔐 El modo DEV es necesario.";break;
  case"FILE":a="📁 Selecciona un archivo para procesarlo.";break;
  default:a=await askAI(q,image);
 }

 a=processTags(a);
 contextAddAssistant?.(a);
 aM(a,"y");
 spk(a);
 updHUD();
 return a;
}

function sM(t){if(t)processUserMessage(String(t).trim())}

function sendMessage(){
 const i=document.getElementById("inp");
 if(!i||!i.value.trim())return;
 const t=i.value.trim();i.value="";sM(t);
}

function initInput(){
 const i=document.getElementById("inp");
 if(i)i.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();sendMessage()}};
}

function buildDevPanel(){
 const p=document.getElementById("devPanel");
 if(!p)return;
 p.innerHTML=`
 <b>⚙️ DEV CORE</b><br><br>
 <button onclick="runDevDiagnostics()">DIAGNÓSTICO</button>
 <button onclick="showTools()">TOOLS</button>
 <button onclick="toggleGestures()">GESTOS</button>
 <button onclick="toggleHUD()">HUD</button>
 <button onclick="rotateHologram()">ROTAR</button>
 <button onclick="showContext()">CONTEXTO</button>
 <button onclick="showPlan()">PLAN</button>
 <button onclick="exportChat()">EXPORTAR</button><br>
 <button onclick="startJarvisLearning()">🧠 APRENDER</button>
 <button onclick="stopJarvisLearning()">⏹️ PARAR</button>
 <button onclick="showJarvisKnowledge()">📚 CONOCIMIENTO</button>
 <button onclick="showLearningStats()">📊 ESTADÍSTICAS</button>
 <button onclick="exportKnowledge()">💾 EXPORTAR CEREBRO</button>
 <button onclick="clearJarvisKnowledge()">🗑️ BORRAR CEREBRO</button>
 <div id="learningStatus">Cerebro: comprobando...</div>`;
}

function openDev(){
 if(devUnlocked){
  const p=document.getElementById("devPanel");
  if(p)p.style.display=p.style.display==="block"?"none":"block";
  return;
 }
 const x=prompt("🔐 CONTRASEÑA DEV");
 if(x===window.DEV_PASSWORD){
  isDev=devUnlocked=true;
  document.getElementById("devPanel").style.display="block";
  document.getElementById("systemStatus").innerText="DEV ONLINE";
  aM("🔓 DEV CORE desbloqueado.","y");
  updHUD();
 }else alert("❌ Contraseña incorrecta.");
}

function startJarvisLearning(){
 startLearning?.(5);
 aM("🧠 Aprendizaje automático activado.","y");
 updHUD();
}

function stopJarvisLearning(){
 stopLearning?.();
 aM("⏹️ Aprendizaje automático detenido.","y");
 updHUD();
}

function showJarvisKnowledge(){
 const s=getKnowledgeStats?.();
 if(!s)return;
 aM(`🧠 Conocimientos: ${s.topics}<br>📚 Categorías: ${s.categories}<br>🔄 Aprendizaje: ${s.learning?"ACTIVO":"DETENIDO"}`,"y");
}

function showLearningStats(){
 const s=getKnowledgeStats?.();
 if(!s)return;
 let x=`🧠 CEREBRO\n\nConocimientos: ${s.topics}\nCategorías: ${s.categories}\nAprendizaje: ${s.learning?"ACTIVO":"DETENIDO"}\nPróximo: ${s.nextTopic}\n\n`;
 for(const c in s.categoryStats)x+=`• ${c}: ${s.categoryStats[c]}\n`;
 aM(`<pre>${x}</pre>`,"y");
}

function clearJarvisKnowledge(){
 if(confirm("¿Borrar todo el conocimiento aprendido?")){
  clearKnowledge?.();
  aM("🗑️ Cerebro borrado.","y");
  updHUD();
 }
}

function toggleGestures(){
 gesturesEnabled=!gesturesEnabled;
 aM(gesturesEnabled?"🖐️ Gestos activados.":"🖐️ Gestos desactivados.","y");
}

async function toggleCamera(){
 const v=document.getElementById("camera");
 if(!v)return;
 if(v.style.display==="block"){
  v.srcObject?.getTracks().forEach(t=>t.stop());
  v.srcObject=null;v.style.display="none";return;
 }
 try{
  v.srcObject=await navigator.mediaDevices.getUserMedia({video:true});
  v.style.display="block";
 }catch(e){aM("❌ No se pudo acceder a la cámara.","y")}
}

function exportChat(){createFile("jarvis-chat.json",JSON.stringify(chatHist,null,2))}

function initFileInput(){
 const i=document.getElementById("file");
 if(i)i.onchange=async e=>{
  const f=e.target.files?.[0];
  if(f)await handleFileInput(f);
  i.value="";
 };
}

function showContext(){
 aM(`<pre>${getContext?.()||"Sin contexto."}</pre>`,"y");
}

function showPlan(){
 const p=getPlan?.();
 aM(p?`<pre>${JSON.stringify(p,null,2)}</pre>`:"📋 No hay ningún plan activo.","y");
}

function showTools(){
 aM(`<pre>${(listTools?.()||[]).join("\n")}</pre>`,"y");
}

async function runDevDiagnostics(){
 const r=await runDiagnostics?.();
 aM(`<pre>${JSON.stringify(r,null,2)}</pre>`,"y");
 updHUD();
}

function initJarvis(){
 initThree();
 initInput();
 initFileInput();
 buildDevPanel();
 initV?.();
 registerNativeTools?.();
 updHUD();
 document.getElementById("systemStatus").innerText="ONLINE";
}

document.readyState==="loading"
 ?addEventListener("DOMContentLoaded",initJarvis)
 :initJarvis();

window.JARVIS_APP={
 askAI,sendMessage,processUserMessage,showHologram,rotateHologram,
 toggleHUD,toggleGestures,toggleCamera,openDev,
 startJarvisLearning,stopJarvisLearning,showJarvisKnowledge,
 showLearningStats,clearJarvisKnowledge,exportChat,getLocalKnowledge,
 getState:()=>({
  dev:isDev,devUnlocked,rotation:rot,gestures:gesturesEnabled,
  hud:hudVisible,llm:getLLMProvider?.()||null,
  knowledge:getKnowledgeStats?.()||null
 })
};
