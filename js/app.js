(function(){
"use strict";

let chatHist=[],processing=false;
window.isDev=false;
window.devUnlocked=false;
window.chatHist=chatHist;

const $=id=>document.getElementById(id);

function status(t){
 const e=$("st");
 if(e)e.textContent=t;
}

function msg(t,type="y"){
 const c=$("chat");
 if(!c)return;
 const d=document.createElement("div");
 d.className="m "+type;
 d.textContent=String(t??"");
 c.appendChild(d);
 c.scrollTop=c.scrollHeight;
}

window.aM=msg;

function history(role,text){
 chatHist.push({role,content:text,time:Date.now()});
 if(chatHist.length>30)chatHist=chatHist.slice(-30);
 window.chatHist=chatHist;
}

async function askAI(text){
 status("THINKING...");
 try{
  if(typeof llmGenerate==="function"){
   const r=await llmGenerate(text);
   if(r)return typeof r==="string"?r:r.answer||r.response||r.text||String(r);
  }
 }catch(e){console.warn(e)}
 try{
  if(typeof fAI==="function"){
   const r=await fAI(text);
   if(r)return typeof r==="string"?r:r.answer||r.response||r.text||String(r);
  }
 }catch(e){console.warn(e)}
 throw Error("Ningún motor de IA está disponible.");
}
window.askAI=askAI;

async function council(text){
 if(typeof yarvisCouncil!=="function")throw Error("YARVIS COUNCIL no está cargado.");
 if(typeof OPENROUTER_KEY==="undefined"&&!window.OPENROUTER_KEY)
  throw Error("OPENROUTER_KEY no configurada.");
 status("COUNCIL: CONSULTANDO...");
 const r=await yarvisCouncil(text);
 if(!r?.answer)throw Error("Council no devolvió respuesta.");
 window.lastCouncilResult=r;
 console.log("Council:",r);
 return r.answer;
}

async function processUserMessage(text){
 text=String(text||"").trim();
 if(!text||processing)return;
 processing=true;

 try{
  msg(text,"u");
  history("user",text);
  status("PROCESSING...");

  /* COMANDOS */
  if(typeof routeCommand==="function"){
   try{
    const r=await routeCommand(text);
    if(r&&r!==false){
     const out=typeof r==="string"?r:r.response||r.answer||r.text;
     if(out){
      msg(out);
      history("assistant",out);
      status("J.A.R.V.I.S. ONLINE");
      return;
     }
    }
   }catch(e){console.warn("Router:",e)}
  }

  /* AGENTE */
  if(/^\/agent\s|^agente:/i.test(text)&&typeof runAgent==="function"){
   const q=text.replace(/^\/agent\s*/i,"").replace(/^agente:\s*/i,"");
   const r=await runAgent(q);
   const out=typeof r==="string"?r:r?.answer||r?.response||r?.result||String(r);
   msg(out);
   history("assistant",out);
   status("J.A.R.V.I.S. ONLINE");
   return;
  }

  /* HOLOGRAMA */
  if(/holograma|hologram/i.test(text)){
   if(typeof showHologram==="function")showHologram(text);
   msg("Holograma activado.");
   history("assistant","Holograma activado.");
   status("HOLOGRAM ONLINE");
   return;
  }

  /* IA */
  let out;
  let usedCouncil=false;

  if(typeof yarvisCouncil==="function"&&
    (typeof OPENROUTER_KEY!=="undefined"||window.OPENROUTER_KEY)){
   try{
    out=await council(text);
    usedCouncil=true;
   }catch(e){
    console.warn("Council fallback:",e);
   }
  }

  if(!out)out=await askAI(text);

  msg(out);
  history("assistant",out);

  if(typeof processTags==="function"){
   try{await processTags(out)}catch(e){}
  }

  if(typeof saveExperience==="function"&&usedCouncil){
   try{saveExperience({
    input:text,
    output:out,
    source:"council",
    time:Date.now()
   })}catch(e){}
  }

  if(window.voiceChatActive&&typeof spk==="function"){
   try{spk(out)}catch(e){}
  }

  status(usedCouncil?"COUNCIL ONLINE":"J.A.R.V.I.S. ONLINE");

 }catch(e){
  console.error("JARVIS:",e);
  msg("⚠️ "+(e?.message||"Error desconocido."));
  status("SYSTEM ERROR");
 }finally{
  processing=false;
 }
}

window.processUserMessage=processUserMessage;
window.sM=t=>processUserMessage(t);

/* DEV */
window.toggleDev=function(){
 if(window.devUnlocked){
  window.isDev=!window.isDev;
  const p=$("devPanel");
  if(p)p.style.display=isDev?"block":"none";
  return;
 }

 const p=prompt("Contraseña DEV:");
 if(p===null)return;

 if(typeof DEV_PASSWORD!=="undefined"&&p===DEV_PASSWORD){
  window.devUnlocked=true;
  window.isDev=true;
  const panel=$("devPanel");
  if(panel)panel.style.display="block";
  msg("DEV MODE ACTIVADO.","sys");
 }else msg("⚠️ Contraseña incorrecta.","sys");
};

/* VOZ */
$("voiceBtn")?.addEventListener("click",()=>{
 try{
  if(typeof toggleVoice==="function")toggleVoice();
  else if(typeof toggleVoiceChat==="function")toggleVoiceChat();
 }catch(e){console.warn(e)}
});

/* DEV */
$("devBtn")?.addEventListener("click",toggleDev);

/* ARCHIVOS */
$("fileBtn")?.addEventListener("click",()=>{
 $("fileInput")?.click();
});

$("fileInput")?.addEventListener("change",e=>{
 const f=e.target.files?.[0];
 if(f&&typeof handleFileInput==="function")handleFileInput(f);
 e.target.value="";
});

/* HOLOGRAMA */
let ox=0,oy=0;
$("scene")?.addEventListener("touchstart",e=>{
 const t=e.touches[0];
 ox=t.clientX;oy=t.clientY;
},{passive:true});

$("scene")?.addEventListener("touchend",e=>{
 const t=e.changedTouches[0];
 const x=t.clientX-ox,y=t.clientY-oy;
 if(Math.abs(x)>Math.abs(y)){
  if(typeof rotateHologram==="function")rotateHologram(x>0?"right":"left");
 }else if(typeof rotateHologram==="function"){
  rotateHologram(y>0?"down":"up");
 }
},{passive:true});

/* INICIO */
function init(){
 status("J.A.R.V.I.S. ONLINE");
 if(typeof initV==="function")try{initV()}catch(e){}
 if(typeof updateHUD==="function")try{updateHUD()}catch(e){}
 console.log("J.A.R.V.I.S. READY");
 console.log("Council:",typeof yarvisCouncil);
 console.log("processUserMessage:",typeof processUserMessage);
}

if(document.readyState==="loading")
 document.addEventListener("DOMContentLoaded",init,{once:true});
else init();

window.JARVIS_APP={
 processUserMessage,
 askAI,
 council
};

})();
