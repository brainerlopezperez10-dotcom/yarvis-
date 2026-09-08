function setReminder(t,s){aM(`⏰ Recordatorio: ${t}`,"y");setTimeout(()=>{aM(`🚨 RECORDATORIO: ${t}`,"y");spk(`Atención: ${t}`)},s*1000)}
function getTime(){return new Date().toLocaleTimeString("es-ES")}
function getDate(){return new Date().toLocaleDateString("es-ES")}
function clearChat(){chatHist=[];document.getElementById("mB").innerHTML='<div class="m y"><b>J.A.R.V.I.S.:</b> Sistema reiniciado.</div>'}
function aM(m,s){let b=document.getElementById("mB");b.innerHTML+=`<div class="m ${s}"><b>${s==="u"?"TÚ":"J.A.R.V.I.S."}:</b> ${m}</div>`;b.scrollTop=b.scrollHeight}
