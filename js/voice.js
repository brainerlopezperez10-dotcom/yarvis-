let rec,isR=0,voiceEnabled=true;
function initV(){let SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return;rec=new SR;rec.lang="es-ES";rec.continuous=false;rec.onresult=e=>sM(e.results[e.results.length-1][0].transcript);rec.onend=()=>{isR=0;document.getElementById("mB2")?.classList.remove("rec")}}
function tM(){if(!rec)return alert("Reconocimiento de voz no soportado");if(isR){isR=0;rec.stop()}else{isR=1;document.getElementById("mB2")?.classList.add("rec");rec.start()}}
function spk(t){if(!voiceEnabled||!("speechSynthesis"in window))return;speechSynthesis.cancel();let c=t.replace(/<[^>]*>?/gm,""),u=new SpeechSynthesisUtterance(c);u.lang=/[áéíóúñ]/i.test(c)?"es-ES":"en-US";u.pitch=.85;speechSynthesis.speak(u)}
function toggleVoice(){voiceEnabled=!voiceEnabled;return voiceEnabled}
