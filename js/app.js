/* J.A.R.V.I.S. — APP CORE */

let isDev=false,devUnlocked=false,sc=null,cam=null,ren=null,obj=null;
let rot=false,gesturesEnabled=false,hudVisible=true,pendingExecJS=null;

/* THREE */
function initThree(){
 const c=document.getElementById("scene");
 if(!c||!window.THREE)return;
 sc=new THREE.Scene();
 cam=new THREE.PerspectiveCamera(60,c.clientWidth/c.clientHeight,.1,100);
 cam.position.z=4;
 ren=new THREE.WebGLRenderer({antialias:true,alpha:true});
 ren.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
 ren.setSize(c.clientWidth,c.clientHeight);
 c.appendChild(ren.domElement);
 window.addEventListener("resize",resizeThree);
 animateThree();
}

function resizeThree(){
 const c=document.getElementById("scene");
 if(!c||!cam||!ren)return;
 cam.aspect=c.clientWidth/c.clientHeight;
 cam.updateProjectionMatrix();
 ren.setSize(c.clientWidth,c.clientHeight);
}

function animateThree(){
 requestAnimationFrame(animateThree);
 if(obj&&rot)obj.rotation.y+=.006;
 if(ren&&sc&&cam)ren.render(sc,cam);
}

/* HOLOGRAM */
function showHologram(n){
 if(typeof buildMathHologram==="function")
  buildMathHologram(String(n||"holograma").toLowerCase());
}

function rotateHologram(){
 rot=!rot;
 aM(rot?"🔄 Rotación activada.":"⏸️ Rotación detenida.","y");
}

/* HUD */
function toggleHUD(){
 hudVisible=!hudVisible;
 const h=document.getElementById("hud");
 if(h)h.style.display=hudVisible?"block":"none";
}

function updHUD(){
 const h=document.getElementById("hudInfo");
 if(!h)return;
 let m=0,c=0,k=0,p="gemini";
 try{if(typeof mem!=="undefined")m=mem.size}catch(e){}
 try{if(typeof getAICacheCount==="function")c=getAICacheCount()}catch(e){}
 try{if(typeof getKnowledgeStats==="function")k=getKnowledgeStats().topics}catch(e){}
 try{if(typeof getLLMProvider==="function")p=getLLMProvider()}catch(e){}
 h.innerHTML=
  "LLM: "+String(p).toUpperCase()+"<br>"+
  "MEM: "+m+" | CACHE: "+c+"<br>"+
  "KNOWLEDGE: "+k+"<br>"+
  "DEV: "+(isDev?"ON":"OFF");
}

/* CONOCIMIENTO */
function getLocalKnowledge(q){
 if(typeof getKnowledgeContext!=="function")return"";
 try{return getKnowledgeContext(q)||""}catch(e){return""}
}

/* IA */
async function askAI(prompt,image){
 let p=String(prompt||"");

 try{
  if(typeof getPersonalityInstruction==="function"){
   const x=getPersonalityInstruction();
   if(x)p=x+"\n\n"+p;
  }
 }catch(e){}

 try{
  if(typeof getContext==="function"){
   const x=getContext();
   if(x)p+="\n\nCONTEXTO RECIENTE:\n"+x;
  }
 }catch(e){}

 const k=getLocalKnowledge(prompt);
 if(k){
  p+="\n\nCONOCIMIENTO APRENDIDO POR J.A.R.V.I.S.:\n"+k+
  "\n\nUsa este conocimiento cuando sea relevante.";
 }

 try{
  if(typeof llmGenerate==="function")
   return await llmGenerate(p,image||null);

  if(typeof fAI==="function")
   return await fAI(p,image||null);

  return"❌ Motor de IA no disponible.";
 }catch(e){
  console.error("AI:",e);
  return"⚠️ Error al consultar el motor de IA.";
 }
}

/* TAGS */
function processTags(t){
 if(!t)return"";
 let x=String(t);

 x=x.replace(/\[HOLOGRAM_3D:([^\]]+)\]/gi,function(_,n){
  showHologram(n);
  return"";
 });

 x=x.replace(/\[FILE:([^\]]+)\]([\s\S]*?)\[\/FILE\]/gi,
 function(_,n,c){
  if(typeof createFile==="function")createFile(n.trim(),c.trim());
  return"📁 Archivo creado: "+n;
 });

 x=x.replace(/\[EXEC_JS\]([\s\S]*?)\[\/EXEC_JS\]/gi,
 function(_,c){
  pendingExecJS=c.trim();
  return isDev
   ?"⚠️ Código recibido. Requiere confirmación manual."
   :"🔐 DEV no está habilitado.";
 });

 return x.trim();
}

/* MEMORIA */
async function handleMemory(q){
 if(/^(olvida|borra|elimina)\b/i.test(q)){
  if(typeof deleteMemory==="function")deleteMemory(q);
  return"🧠 Memoria eliminada.";
 }

 if(/^(recuerda|recordar|guarda|guardar)\b/i.test(q)){
  const p=q.replace(/^(recuerda|recordar|guarda|guardar)\s*/i,"")
          .split(/\s*:\s*/);

  if(p.length>1&&typeof saveMemory==="function"){
   saveMemory(p[0],p.slice(1).join(":"));
   return"🧠 Guardado en memoria.";
  }
 }

 if(typeof findMemory==="function"){
  const r=findMemory(q);
  if(r)return r;
 }

 return"No encontré esa información en mi memoria.";
}

/* RECORDATORIO */
function handleReminder(t){
 const m=String(t).match(/(?:recordatorio|recordarme|recuerda)\s+(.+)/i);
 if(!m)return"⏰ Dime qué quieres que recuerde.";
 if(typeof setReminder==="function")setReminder(m[1],60);
 return"⏰ Recordatorio creado: "+m[1];
}

/* CALCULADORA */
function handleCalculator(t){
 try{
  if(typeof calculate==="function")return"🧮 "+calculate(t);
 }catch(e){}
 return"No pude calcular esa expresión.";
}

/* VOZ */
function handleVoice(t){
 const x=String(t).toLowerCase();

 if(x.includes("activar")||x.includes("enciende")){
  voiceEnabled=true;
  return"🔊 Voz activada.";
 }

 if(x.includes("desactivar")||x.includes("apaga")){
  voiceEnabled=false;
  return"🔇 Voz desactivada.";
 }

 return"🎤 Control de voz disponible.";
}

/* DEV */
function handleDev(){
 isDev=true;
 devUnlocked=true;

 const s=document.getElementById("systemStatus");
 if(s)s.innerText="DEV ONLINE";

 updHUD();
 return"🔓 Modo DEV activado.";
}

/* MENSAJES */
async function processUserMessage(text,image){
 if(!text&&!image)return;

 const q=text||"Analiza esta imagen.";
 aM(q,"u");

 if(typeof contextAddUser==="function")
  contextAddUser(q);

 let r={intent:"CHAT",text:q};

 try{
  if(typeof routeCommand==="function")
   r=await routeCommand(q);
 }catch(e){
  console.error("Router:",e);
 }

 let intent=String(r&&r.intent||"CHAT").toUpperCase();
 let answer="";

 switch(intent){

  case"HOLOGRAM":
   showHologram(r.text||"holograma");
   answer="🔮 Holograma generado.";
   break;

  case"MEMORY":
   answer=await handleMemory(q);
   break;

  case"VOICE":
   answer=handleVoice(q);
   break;

  case"REMINDER":
   answer=handleReminder(q);
   break;

  case"CALCULATOR":
   answer=handleCalculator(q);
   break;

  case"CLEAR":
   if(typeof clearChat==="function")clearChat();
   if(typeof clearContext==="function")clearContext();
   answer="🧹 Conversación limpiada.";
   break;

  case"DEV":
   answer=handleDev();
   break;

  case"CODE":
   answer=isDev
    ?"💻 Módulo de código listo."
    :"🔐 El modo DEV es necesario.";
   break;

  case"FILE":
   answer="📁 Selecciona un archivo para procesarlo.";
   break;

  case"VISION":
   answer=await askAI(q,image);
   break;

  default:
   answer=await askAI(q,image);
 }

 answer=processTags(answer);

 if(typeof contextAddAssistant==="function")
  contextAddAssistant(answer);

 aM(answer,"y");
 if(typeof spk==="function")spk(answer);
 updHUD();

 return answer;
}

/* INPUT */
function sM(t){
 if(t&&String(t).trim())
  processUserMessage(String(t).trim());
}

function sendMessage(){
 const i=document.getElementById("inp");
 if(!i)return;

 const t=i.value.trim();
 if(!t)return;

 i.value="";
 sM(t);
}

function initInput(){
 const i=document.getElementById("inp");
 if(!i)return;

 i.addEventListener("keydown",function(e){
  if(e.key==="Enter"){
   e.preventDefault();
   sendMessage();
  }
 });
}

/* DEV PANEL */
function buildDevPanel(){
 const p=document.getElementById("devPanel");
 if(!p)return;

 p.innerHTML=
 `<b>⚙️ DEV CORE</b><br><br>
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
 <div id="learningStatus">Cerebro: listo</div>`;
}

/* DEV */
function openDev(){
 if(devUnlocked){
  const p=document.getElementById("devPanel");
  if(p)p.style.display=p.style.display==="block"?"none":"block";
  return;
 }

 const x=prompt("🔐 CONTRASEÑA DEV");

 if(x===window.DEV_PASSWORD){
  isDev=true;
  devUnlocked=true;

  const p=document.getElementById("devPanel");
  if(p)p.style.display="block";

  const s=document.getElementById("systemStatus");
  if(s)s.innerText="DEV ONLINE";

  aM("🔓 DEV CORE desbloqueado.","y");
  updHUD();
 }else{
  alert("❌ Contraseña incorrecta.");
 }
}

/* APRENDIZAJE */
function startJarvisLearning(){
 if(typeof startLearning==="function")startLearning(5);
 aM("🧠 Aprendizaje automático activado.","y");
 updHUD();
}

function stopJarvisLearning(){
 if(typeof stopLearning==="function")stopLearning();
 aM("⏹️ Aprendizaje automático detenido.","y");
 updHUD();
}

function showJarvisKnowledge(){
 if(typeof getKnowledgeStats!=="function")return;

 const s=getKnowledgeStats();

 aM(
  "🧠 Conocimientos: "+s.topics+
  "<br>📚 Categorías: "+s.categories+
  "<br>🔄 Aprendizaje: "+(s.learning?"ACTIVO":"DETENIDO"),
  "y"
 );
}

function showLearningStats(){
 if(typeof getKnowledgeStats!=="function")return;

 const s=getKnowledgeStats();
 let x="🧠 CEREBRO DE J.A.R.V.I.S.\n\n";
 x+="Conocimientos: "+s.topics+"\n";
 x+="Categorías: "+s.categories+"\n";
 x+="Aprendizaje: "+(s.learning?"ACTIVO":"DETENIDO")+"\n";
 x+="Próximo: "+s.nextTopic+"\n\n";

 for(const c in s.categoryStats)
  x+="• "+c+": "+s.categoryStats[c]+"\n";

 aM("<pre>"+x+"</pre>","y");
}

function clearJarvisKnowledge(){
 if(!confirm("¿Borrar todo el conocimiento aprendido?"))return;

 if(typeof clearKnowledge==="function")
  clearKnowledge();

 aM("🗑️ Cerebro de conocimiento borrado.","y");
 updHUD();
}

/* GESTOS */
function toggleGestures(){
 gesturesEnabled=!gesturesEnabled;
 aM(
  gesturesEnabled?"🖐️ Gestos activados.":"🖐️ Gestos desactivados.",
  "y"
 );
}

/* CÁMARA */
async function toggleCamera(){
 const v=document.getElementById("camera");
 if(!v)return;

 if(v.style.display==="block"){
  if(v.srcObject)
   v.srcObject.getTracks().forEach(function(t){t.stop()});
  v.srcObject=null;
  v.style.display="none";
  return;
 }

 try{
  v.srcObject=await navigator.mediaDevices.getUserMedia({video:true});
  v.style.display="block";
 }catch(e){
  aM("❌ No se pudo acceder a la cámara.","y");
 }
}

/* EXPORTAR */
function exportChat(){
 if(typeof createFile==="function")
  createFile("jarvis-chat.json",JSON.stringify(chatHist,null,2));
}

/* ARCHIVOS */
function initFileInput(){
 const i=document.getElementById("file");
 if(!i)return;

 i.addEventListener("change",async function(e){
  const f=e.target.files&&e.target.files[0];
  if(f&&typeof handleFileInput==="function"){
   try{await handleFileInput(f)}
   catch(err){aM("❌ Error procesando archivo.","y")}
  }
  i.value="";
 });
}

/* CONTEXTO */
function showContext(){
 const x=typeof getContext==="function"?getContext():"Sin contexto.";
 aM("<pre>"+(x||"Sin contexto.")+"</pre>","y");
}

/* PLAN */
function showPlan(){
 const p=typeof getPlan==="function"?getPlan():null;
 aM(
  p
   ?"<pre>"+JSON.stringify(p,null,2)+"</pre>"
   :"📋 No hay ningún plan activo.",
  "y"
 );
}

/* TOOLS */
function showTools(){
 const t=typeof listTools==="function"?listTools():[];
 aM("<pre>"+t.join("\n")+"</pre>","y");
}

/* DIAGNÓSTICOS */
async function runDevDiagnostics(){
 if(typeof runDiagnostics!=="function"){
  aM("❌ Diagnósticos no disponibles.","y");
  return;
 }

 const r=await runDiagnostics();
 aM("<pre>"+JSON.stringify(r,null,2)+"</pre>","y");
 updHUD();
}

/* INICIO */
function initJarvis(){
 try{initThree()}catch(e){console.error("Three:",e)}
 try{initInput()}catch(e){console.error("Input:",e)}
 try{initFileInput()}catch(e){console.error("Files:",e)}
 try{buildDevPanel()}catch(e){console.error("DEV:",e)}
 try{if(typeof initV==="function")initV()}catch(e){}
 try{if(typeof registerNativeTools==="function")registerNativeTools()}catch(e){}
 updHUD();

 const s=document.getElementById("systemStatus");
 if(s)s.innerText="ONLINE";
}

if(document.readyState==="loading")
 document.addEventListener("DOMContentLoaded",initJarvis);
else
 initJarvis();

/* GLOBAL */
window.sendMessage=sendMessage;
window.sM=sM;
window.openDev=openDev;
window.rotateHologram=rotateHologram;
window.showHologram=showHologram;
window.toggleHUD=toggleHUD;
window.toggleGestures=toggleGestures;
window.toggleCamera=toggleCamera;
window.startJarvisLearning=startJarvisLearning;
window.stopJarvisLearning=stopJarvisLearning;
window.showJarvisKnowledge=showJarvisKnowledge;
window.showLearningStats=showLearningStats;
window.clearJarvisKnowledge=clearJarvisKnowledge;
window.exportChat=exportChat;
window.showContext=showContext;
window.showPlan=showPlan;
window.showTools=showTools;
window.runDevDiagnostics=runDevDiagnostics;
window.askAI=askAI;
window.processUserMessage=processUserMessage;
window.getLocalKnowledge=getLocalKnowledge;

window.JARVIS_APP={
 askAI:askAI,
 sendMessage:sendMessage,
 processUserMessage:processUserMessage,
 showHologram:showHologram,
 rotateHologram:rotateHologram,
 toggleHUD:toggleHUD,
 toggleGestures:toggleGestures,
 toggleCamera:toggleCamera,
 openDev:openDev,
 startJarvisLearning:startJarvisLearning,
 stopJarvisLearning:stopJarvisLearning,
 showJarvisKnowledge:showJarvisKnowledge,
 showLearningStats:showLearningStats,
 clearJarvisKnowledge:clearJarvisKnowledge,
 exportChat:exportChat,
 getLocalKnowledge:getLocalKnowledge,
 getState:function(){
  return{
   dev:isDev,
   devUnlocked:devUnlocked,
   rotation:rot,
   gestures:gesturesEnabled,
   hud:hudVisible,
   llm:typeof getLLMProvider==="function"?getLLMProvider():null,
   knowledge:typeof getKnowledgeStats==="function"?getKnowledgeStats():null
  };
 }
};
