const mem=new Map(JSON.parse(localStorage.getItem("j_m")||"[]")),hMem=new Map(JSON.parse(localStorage.getItem("j_hm")||"[]"));
const sMem=()=>localStorage.setItem("j_m",JSON.stringify([...mem])),sHMem=()=>localStorage.setItem("j_hm",JSON.stringify([...hMem]));
const cQ=t=>t.toLowerCase().trim().replace(/[¿?¡!.,]/g,"");
function findMemory(q){let k=cQ(q);if(mem.has(k))return mem.get(k);let w=k.split(/\s+/).filter(x=>x.length>3),best="",score=0;for(let[a,v]of mem){let s=a.split(/\s+/).filter(x=>w.includes(x)).length;if(s>score){score=s;best=v}}return score?best:null}
function saveMemory(q,v){if(!q||!v)return;mem.set(cQ(q),v);sMem();if(typeof updHUD=="function")updHUD()}
function deleteMemory(q){mem.delete(cQ(q));sMem();if(typeof updHUD=="function")updHUD()}
function clearMemory(){mem.clear();hMem.clear();sMem();sHMem();if(typeof updHUD=="function")updHUD()}
function improveMemory(){if(!isDev)return false;let n=new Map;for(let[k,v]of mem){k=k.trim().replace(/\s+/g," ");if(k&&v)n.set(k,v)}mem.clear();n.forEach((v,k)=>mem.set(k,v));sMem();if(typeof updHUD=="function")updHUD();return true}
