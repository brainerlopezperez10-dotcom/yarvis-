/* J.A.R.V.I.S. PERSONALITY CORE */

const JPersonality={
version:"1.0",

current:"jarvis",

profiles:{
jarvis:{
name:"J.A.R.V.I.S.",
tone:"elegante, preciso y tecnológico",
emoji:false,
detail:0.8
},

concise:{
name:"Conciso",
tone:"directo, breve y claro",
emoji:false,
detail:0.4
},

friendly:{
name:"Amigable",
tone:"amable, natural y cercano",
emoji:true,
detail:0.7
},

teacher:{
name:"Profesor",
tone:"paciente, educativo y fácil de entender",
emoji:false,
detail:0.9
},

technical:{
name:"Técnico",
tone:"técnico, preciso y orientado a programación",
emoji:false,
detail:1
},

creative:{
name:"Creativo",
tone:"creativo, imaginativo y dinámico",
emoji:true,
detail:0.9
}
},

load(){

try{

const saved=localStorage.getItem("jarvis_personality");

if(saved&&this.profiles[saved])
this.current=saved;

}catch(e){}

return this.current;
},

set(mode){

mode=String(mode||"").toLowerCase().trim();

if(!this.profiles[mode])
return false;

this.current=mode;

try{
localStorage.setItem("jarvis_personality",mode);
}catch(e){}

return true;
},

get(){
return this.profiles[this.current]||this.profiles.jarvis;
},

getName(){
return this.get().name;
},

getTone(){
return this.get().tone;
},

shouldUseEmoji(){
return !!this.get().emoji;
},

getDetail(){
return this.get().detail;
},

buildInstruction(){

const p=this.get();

return[
"PERSONALIDAD DE J.A.R.V.I.S.:",
`Nombre del estilo: ${p.name}`,
`Tono: ${p.tone}`,
`Nivel de detalle: ${Math.round(p.detail*100)}%`,
p.emoji
?"Puedes utilizar emojis cuando sean útiles."
:"Evita utilizar emojis innecesarios.",
"No inventes información.",
"Prioriza respuestas claras y útiles."
].join("\n");
},

adapt(text){

text=String(text||"").trim();

if(!text)return"";

const p=this.get();

if(p.current==="concise"&&text.length>600)
return text.slice(0,600).trim()+"…";

return text;
},

command(text){

const l=String(text||"").toLowerCase();

const commands={
"modo jarvis":"jarvis",
"modo normal":"jarvis",
"modo conciso":"concise",
"modo breve":"concise",
"modo amigable":"friendly",
"modo profesor":"teacher",
"modo técnico":"technical",
"modo tecnico":"technical",
"modo creativo":"creative"
};

for(const key in commands){

if(l.includes(key))
return commands[key];

}

return null;
},

applyCommand(text){

const mode=this.command(text);

if(!mode)
return false;

return this.set(mode);
},

list(){

return Object.entries(this.profiles).map(
([id,p])=>({
id,
name:p.name,
tone:p.tone,
detail:p.detail
})
);
},

describe(){

const p=this.get();

return{
mode:this.current,
name:p.name,
tone:p.tone,
detail:p.detail,
emoji:p.emoji
};
}
};


/* INICIALIZACIÓN */

JPersonality.load();


/* FUNCIONES GLOBALES */

function setPersonality(mode){
return JPersonality.set(mode);
}

function getPersonality(){
return JPersonality.get();
}

function getPersonalityName(){
return JPersonality.getName();
}

function getPersonalityInstruction(){
return JPersonality.buildInstruction();
}

function personalityCommand(text){
return JPersonality.command(text);
}

function applyPersonalityCommand(text){
return JPersonality.applyCommand(text);
}

function listPersonalities(){
return JPersonality.list();
}

function getPersonalityInfo(){
return JPersonality.describe();
}
