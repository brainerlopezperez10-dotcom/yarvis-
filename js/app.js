/* YARVIS APP.JS */
(()=>{"use strict";

const API="https://yarvis-api.onrender.com";
const $=id=>document.getElementById(id);

const chat=$("chat"),input=$("input");
const send=$("btnSend"),mic=$("btnMic"),img=$("btnImg");
const imgFile=$("fileImg"),file=$("fileInput");
const fileBtn=$("fileBtn"),clear=$("clearBtn");
const dev=$("devBtn"),panel=$("devPanel"),close=$("devClose");
const modal=$("passwordModal"),pass=$("devPasswordInput");
const login=$("devLogin"),cancel=$("devCancel");
const status=$("status"),label=$("estadoLabel");

let sid=localStorage.getItem("yarvis_sid");
if(!sid){
 sid=Date.now()+"_"+Math.random().toString(36).slice(2);
 localStorage.setItem("yarvis_sid",sid);
}
const sessionId="web_"+sid;
window.yarvisSessionId=sessionId;


/* ESTADO */
function estado(x,c=""){
 if(status)status.textContent=x;
 if(label)label.textContent=x;
 const core=$("core");
 if(core){
  core.classList.remove("listening","thinking","speaking","error");
  if(c)core.classList.add(c);
 }
 if(typeof window.yarvisHologramState==="function")
  try{window.yarvisHologramState(x)}catch(e){}
}
window.yarvisEstado=estado;


/* CHAT */
function msg(t,w="bot",name=""){
 if(!chat)return;
 const d=document.createElement("div");
 d.className="message "+(w==="user"?"u":"y");
 if(name){
  const n=document.createElement("span");
  n.className="message-label";
  n.textContent=name;
  d.appendChild(n);
 }
 const c=document.createElement("div");
 c.textContent=t||"";
 d.appendChild(c);
 chat.appendChild(d);
 chat.scrollTop=chat.scrollHeight;
}
window.yarvisAddMsg=msg;


/* TTS */
async function hablar(t){
 try{
  const r=await fetch(API+"/tts",{
   method:"POST",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify({texto:t.slice(0,800)})
  });
  if(!r.ok)return;
  const u=URL.createObjectURL(await r.blob());
  const a=new Audio(u);
  await new Promise(ok=>{
   a.onended=()=>{URL.revokeObjectURL(u);ok()};
   a.onerror=()=>{URL.revokeObjectURL(u);ok()};
   a.play().catch(ok);
  });
 }catch(e){}
}


/* BACKEND */
async function backend(text,image=null,mime=null){
 const b={mensaje:text||"",sessionId,userId:"default"};
 if(image){b.imagen=image;b.mimeType=mime||"image/jpeg"}
 const r=await fetch(API+"/chat",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify(b)
 });
 let d;
 try{d=await r.json()}catch(e){throw Error("Respuesta inválida del servidor")}
 if(!r.ok)throw Error(d?.error||"Error HTTP "+r.status);
 return d?.respuesta||d?.response||d?.message||"";
}


/* ENVIAR */
async function enviar(text=null,image=null,mime=null){
 const t=text!==null?String(text).trim():String(input?.value||"").trim();
 if(!t&&!image)return;

 if(t)msg(t,"user");
 if(image)msg("📷 Imagen enviada","user");
 if(input)input.value="";

 estado("PROCESANDO","thinking");

 const wait=msg("Analizando...","bot","YARVIS");

 try{
  let r="";

  if(image){
   r=await backend(t,image,mime);
  }else if(
   window.YARVIS_CONFIG?.USE_COUNCIL!==false &&
   typeof window.yarvisCouncil==="function" &&
   window.OPENROUTER_KEY &&
   window.OPENROUTER_KEY!=="TU_OPENROUTER_KEY_AQUI"
  ){
   const x=await window.yarvisCouncil(t);
   r=x?.answer||"";

   $("devModels")&&( $("devModels").textContent=x?.modelsConsulted||0 );
   $("devAnswered")&&( $("devAnswered").textContent=x?.modelsAnswered||0 );
   $("devFailed")&&( $("devFailed").textContent=x?.modelsFailed||0 );
   $("devElapsed")&&( $("devElapsed").textContent=(x?.elapsed||0)+" ms" );
   $("devJudge")&&( $("devJudge").textContent=x?.judge||"YARVIS" );
  }

  if(!r)r=await backend(t);

  if(wait)wait.remove();

  if(!r)throw Error("YARVIS no devolvió respuesta");

  msg(r,"bot","YARVIS");
  estado("HABLANDO","speaking");
  await hablar(r);
  estado("ONLINE");

 }catch(e){

  if(wait)wait.remove();

  msg("⚠️ "+(e.message||"Error de conexión"),"bot","SISTEMA");
  estado("ERROR","error");
  setTimeout(()=>estado("ONLINE"),2500);
 }
}

window.yarvisEnviar=enviar;


/* ENVIAR */
send?.addEventListener("click",e=>{
 e.preventDefault();
 enviar();
});

input?.addEventListener("keydown",e=>{
 if(e.key==="Enter"&&!e.shiftKey){
  e.preventDefault();
  enviar();
 }
});


/* IMAGEN */
img?.addEventListener("click",()=>imgFile?.click());

imgFile?.addEventListener("change",()=>{
 const f=imgFile.files?.[0];
 if(!f)return;

 if(!f.type.startsWith("image/")){
  msg("⚠️ Selecciona una imagen válida","bot","SISTEMA");
  imgFile.value="";
  return;
 }

 const r=new FileReader();

 r.onload=()=>{
  const b=String(r.result).split(",")[1]||"";
  enviar(
   input?.value.trim()||
   "Analiza esta imagen y dime qué ves.",
   b,
   f.type
  );
  imgFile.value="";
 };

 r.readAsDataURL(f);
});


/* ARCHIVOS */
fileBtn?.addEventListener("click",()=>file?.click());

file?.addEventListener("change",async()=>{
 const f=file.files?.[0];
 if(!f)return;

 if(typeof window.handleFileInput==="function"){
  try{await window.handleFileInput(f)}
  catch(e){msg("⚠️ "+e.message,"bot","SISTEMA")}
 }else if(
  file.type.startsWith("text/")||
  /\.(txt|csv|js|json|html|css)$/i.test(file.name)
 ){
  try{
   const t=await f.text();
   await enviar("Analiza este archivo:\n\n"+t.slice(0,12000));
  }catch(e){
   msg("⚠️ No pude leer el archivo","bot","SISTEMA");
  }
 }else{
  msg("⚠️ Este archivo necesita el módulo de archivos de YARVIS","bot","SISTEMA");
 }

 file.value="";
});


/* LIMPIAR */
clear?.addEventListener("click",()=>{
 if(!chat)return;
 chat.innerHTML="";
 msg("¡Hola! ¿En qué puedo ayudarte hoy? 😀","bot","YARVIS");
});


/* MICRÓFONO */
let recorder=null,chunks=[],stream=null,grabando=false;

mic?.addEventListener("click",async()=>{
 if(grabando){
  recorder.stop();
  grabando=false;
  mic.classList.remove("recording");
  estado("PROCESANDO","thinking");
  return;
 }

 try{
  stream=await navigator.mediaDevices.getUserMedia({audio:true});
  chunks=[];
  recorder=new MediaRecorder(stream);

  recorder.ondataavailable=e=>{
   if(e.data.size)chunks.push(e.data);
  };

  recorder.onstop=()=>{
   const b=new Blob(chunks,{type:recorder.mimeType||"audio/webm"});
   stream?.getTracks().forEach(x=>x.stop());
   transcribir(b);
  };

  recorder.start();
  grabando=true;
  mic.classList.add("recording");
  estado("ESCUCHANDO","listening");

 }catch(e){
  msg("⚠️ No se pudo acceder al micrófono","bot","SISTEMA");
  estado("ONLINE");
 }
});


/* TRANSCRIBIR */
async function transcribir(blob){
 try{
  const r=new FileReader();

  const b=await new Promise((ok,no)=>{
   r.onload=()=>ok(String(r.result).split(",")[1]||"");
   r.onerror=no;
   r.readAsDataURL(blob);
  });

  const x=await fetch(API+"/transcribe",{
   method:"POST",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify({
    audio:b,
    mimeType:blob.type||"audio/webm"
   })
  });

  const d=await x.json();

  if(!x.ok)throw Error(d?.error||"Error de transcripción");

  const t=d?.texto||d?.text||d?.transcription||"";

  if(!t.trim())throw Error("No pude entender el audio");

  enviar(t);

 }catch(e){
  msg("⚠️ "+e.message,"bot","SISTEMA");
  estado("ONLINE");
 }
}


/* DEV */
dev?.addEventListener("click",()=>{
 if(modal){
  modal.classList.add("show");
  if(pass){
   pass.value="";
   setTimeout(()=>pass.focus(),50);
  }
 }
});

cancel?.addEventListener("click",()=>{
 modal?.classList.remove("show");
});

login?.addEventListener("click",verificar);

pass?.addEventListener("keydown",e=>{
 if(e.key==="Enter")verificar();
 if(e.key==="Escape")modal?.classList.remove("show");
});

function verificar(){
 const p=String(pass?.value||"");
 const real=String(window.DEV_PASSWORD||"");

 if(!real||real==="TU_CONTRASENA_DEV_AQUI"){
  alert("Configura DEV_PASSWORD en index.html");
  return;
 }

 if(p!==real){
  alert("❌ Contraseña incorrecta");
  return;
 }

 modal?.classList.remove("show");
 panel?.classList.add("open");
 actualizarDev();
}

close?.addEventListener("click",()=>{
 panel?.classList.remove("open");
});


/* DEV INFO */
function actualizarDev(){
 const key=window.OPENROUTER_KEY;

 if($("devOpenRouter"))
  $("devOpenRouter").textContent=
   key&&key!=="TU_OPENROUTER_KEY_AQUI"
   ?"CONFIGURADO":"NO CONFIGURADO";

 if($("devSystem"))
  $("devSystem").textContent="ONLINE";

 if($("devModels")&&typeof window.getYarvisModels==="function")
  $("devModels").textContent=
   window.getYarvisModels().length;
}


/* INICIO */
estado("ONLINE");
actualizarDev();

console.log("YARVIS ONLINE");
console.log("SEND:",!!send);
console.log("MIC:",!!mic);
console.log("IMG:",!!img);
console.log("FILE:",!!fileBtn);
console.log("CLEAR:",!!clear);
console.log("DEV:",!!dev);

})();
