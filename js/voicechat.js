/* J.A.R.V.I.S. — VOICE CHAT */

let voiceChatActive=false;

function toggleVoiceChat(){

 if(!rec){
  initV();
 }

 if(!rec){
  aM(
   "❌ El reconocimiento de voz no está disponible en este navegador.",
   "y"
  );
  return;
 }

 voiceChatActive=!voiceChatActive;

 const b=document.getElementById("voiceChatBtn");

 if(voiceChatActive){

  b?.classList.add("rec");
  b?.setAttribute("aria-label","Detener chat de voz");

  aM("🎙️ Te escucho...","y");

  try{
   rec.start();
  }catch(e){}

 }else{

  b?.classList.remove("rec");

  try{
   rec.stop();
  }catch(e){}

  aM("🎙️ Chat de voz detenido.","y");
 }
}

if(typeof rec!=="undefined"){
 const oldResult=rec?.onresult;
}
