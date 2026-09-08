/* J.A.R.V.I.S. BRAIN CORE */

const JBrain={
version:"1.0",
lastIntent:null,
confidence:0,
history:[],

analyze(text){
text=String(text||"").trim();
const l=text.toLowerCase();

let intent="CHAT";
let confidence=.55;

const rules=[
["HOLOGRAM",["holograma","holográfico","holografico","proyección 3d","figura 3d","modelo 3d","proyecta"]],
["MEMORY",["recuerda","recordar","recuérdame","memoria","olvida","olvidar"]],
["VOICE",["voz","habla","dime en voz","lee esto","silencio"]],
["FILE",["archivo","documento","pdf","txt","csv","json","markdown"]],
["VISION",["imagen","foto","fotografía","captura","imagen analiza","qué ves"]],
["REMINDER",["alarma","recordatorio","recuérdame en","avísame en"]],
["CALCULATOR",["calcula","calcular","cuánto es","porcentaje","porciento","suma","resta","multiplica","divide","ecuación"]],
["DEV",["dev","desarrollador","sistema","diagnóstico","debug","depurar"]],
["CODE",["código","programa","javascript","html","css","python","función"]],
["CLEAR",["limpia el chat","borrar chat","limpiar conversación","reinicia chat"]]
];

for(const [name,words] of rules){
for(const word of words){
if(l.includes(word)){
intent=name;
confidence=.92;
break;
}
}
if(intent===name)break;
}

this.lastIntent=intent;
this.confidence=confidence;

const result={
intent,
confidence,
text,
language:this.detectLanguage(text),
timestamp:Date.now()
};

this.history.push(result);

if(this.history.length>30)
this.history.shift();

return result;
},

detectLanguage(text){
const l=text.toLowerCase();

const es=["que","qué","como","cómo","quiero","haz","hacer","dime","para","con","una","el","la"];
const pt=["que","como","quero","fazer","diga","para","com","uma","o","a"];
const en=["what","how","want","make","tell","with","the","a"];

let esScore=0,ptScore=0,enScore=0;

for(const w of es)
if(l.split(/\s+/).includes(w))esScore++;

for(const w of pt)
if(l.split(/\s+/).includes(w))ptScore++;

for(const w of en)
if(l.split(/\s+/).includes(w))enScore++;

if(ptScore>esScore&&ptScore>enScore)return"pt";
if(enScore>esScore&&enScore>ptScore)return"en";
return"es";
},

needsTool(result){
return result&&result.intent!=="CHAT";
},

getLastIntent(){
return this.lastIntent;
},

getConfidence(){
return this.confidence;
},

clear(){
this.lastIntent=null;
this.confidence=0;
this.history=[];
}
};

function brainAnalyze(text){
return JBrain.analyze(text);
  }
