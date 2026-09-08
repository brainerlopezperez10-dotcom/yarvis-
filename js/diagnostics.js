/* J.A.R.V.I.S. DIAGNOSTICS CORE */

const JDiagnostics={
version:"1.0",

lastReport:null,

check(name,test){
try{
const result=typeof test==="function"
?test()
:false;

return{
name,
ok:!!result
};

}catch(e){

return{
name,
ok:false,
error:e?.message||"Error"
};

}
},

checkModule(name,fn){
return this.check(
name,
()=>typeof fn==="function"
);
},

checkLibrary(name,obj){
return this.check(
name,
()=>typeof obj!=="undefined"&&obj!==null
);
},

checkStorage(){
try{
const key="jarvis_diag_test";

localStorage.setItem(key,"ok");
const result=localStorage.getItem(key)==="ok";
localStorage.removeItem(key);

return result;

}catch(e){
return false;
}
},

checkNetwork(){
return navigator.onLine===true;
},

checkVoice(){
return(
"speechSynthesis" in window||
"SpeechRecognition" in window||
"webkitSpeechRecognition" in window
);
},

checkCamera(){
return !!(
navigator.mediaDevices&&
typeof navigator.mediaDevices.getUserMedia==="function"
);
},

checkThree(){
return typeof THREE!=="undefined";
},

checkPDF(){
return typeof pdfjsLib!=="undefined";
},

checkAPIs(){

const gemini=typeof GEMINI_KEYS!=="undefined"&&
Array.isArray(GEMINI_KEYS)&&
GEMINI_KEYS.length>0;

const groq=typeof GROQ_KEY!=="undefined"&&
typeof GROQ_KEY==="string"&&
GROQ_KEY.length>5;

return{
gemini,
groq
};
},

run(){

const modules={

memory:typeof findMemory==="function",

ai:typeof fAI==="function",

groq:typeof fGroq==="function",

voice:typeof spk==="function",

vision:typeof analyzeImage==="function",

files:typeof handleFileInput==="function",

commands:typeof setReminder==="function",

brain:typeof brainAnalyze==="function",

router:typeof routeCommand==="function",

context:typeof getContext==="function",

planner:typeof createPlan==="function",

reasoning:typeof reasonAnalyze==="function",

tools:typeof runTool==="function",

calculator:typeof calculate==="function",

language:typeof detectLanguage==="function",

personality:typeof getPersonality==="function"
};

const libraries={

three:this.checkThree(),

pdfjs:this.checkPDF(),

camera:this.checkCamera(),

voice:this.checkVoice(),

storage:this.checkStorage(),

network:this.checkNetwork()
};

const apis=this.checkAPIs();

const moduleTotal=Object.keys(modules).length;
const moduleOK=Object.values(modules).filter(Boolean).length;

const libraryTotal=Object.keys(libraries).length;
const libraryOK=Object.values(libraries).filter(Boolean).length;

const total=moduleTotal+libraryTotal;
const ok=moduleOK+libraryOK;

this.lastReport={
version:this.version,
timestamp:Date.now(),
modules,
libraries,
apis,
moduleTotal,
moduleOK,
libraryTotal,
libraryOK,
total,
ok,
percentage:Math.round(ok/total*100)
};

return this.lastReport;
},

summary(){

const r=this.lastReport||this.run();

return[
`YARVIS Diagnostics v${r.version}`,
`Módulos: ${r.moduleOK}/${r.moduleTotal}`,
`Sistemas: ${r.libraryOK}/${r.libraryTotal}`,
`Estado general: ${r.percentage}%`
].join("\n");
},

getFailed(){

const r=this.lastReport||this.run();
const failed=[];

for(const [name,ok] of Object.entries(r.modules))
if(!ok)failed.push(`Módulo: ${name}`);

for(const [name,ok] of Object.entries(r.libraries))
if(!ok)failed.push(`Sistema: ${name}`);

if(!r.apis.gemini)
failed.push("API: Gemini");

if(!r.apis.groq)
failed.push("API: Groq");

return failed;
},

isHealthy(){

const r=this.lastReport||this.run();

return r.percentage>=80;
},

clear(){
this.lastReport=null;
}
};


/* FUNCIONES GLOBALES */

function runDiagnostics(){
return JDiagnostics.run();
}

function diagnosticsSummary(){
return JDiagnostics.summary();
}

function getFailedDiagnostics(){
return JDiagnostics.getFailed();
}

function isSystemHealthy(){
return JDiagnostics.isHealthy();
}
