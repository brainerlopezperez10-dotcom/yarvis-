/* J.A.R.V.I.S. LANGUAGE CORE */

const JLanguage={
version:"1.0",

current:"es",

supported:{
es:"Español",
pt:"Português",
en:"English"
},

detect(text){
text=String(text||"").toLowerCase();

if(!text)return"es";

const scores={
es:0,
pt:0,
en:0
};

const words=text
.replace(/[¿?¡!.,;:()[\]{}]/g," ")
.split(/\s+/)
.filter(Boolean);

const es=[
"hola","quiero","necesito","puedes","puedo",
"haz","hacer","dime","cómo","como","qué","que",
"para","esto","esta","este","una","uno",
"por","favor","gracias","tengo","tienes",
"con","sin","desde","ahora","mañana","hoy"
];

const pt=[
"olá","quero","preciso","pode","posso",
"faça","fazer","diga","como","que",
"para","isso","esta","este","uma","um",
"por","favor","obrigado","obrigada","tenho",
"tem","com","sem","agora","amanhã","hoje"
];

const en=[
"hello","hi","want","need","can","make",
"do","tell","how","what","this","that",
"the","with","without","please","thanks",
"have","you","now","tomorrow","today"
];

for(const w of words){

if(es.includes(w))scores.es++;
if(pt.includes(w))scores.pt++;
if(en.includes(w))scores.en++;
}

const best=Object.keys(scores)
.sort((a,b)=>scores[b]-scores[a])[0];

if(scores[best]===0)
return this.current||"es";

return best;
},

setLanguage(lang){

lang=String(lang||"").toLowerCase();

const aliases={
es:"es",
español:"es",
spanish:"es",

pt:"pt",
portugués:"pt",
portugues:"pt",
portuguese:"pt",

en:"en",
inglés:"en",
ingles:"en",
english:"en"
};

lang=aliases[lang]||lang;

if(!this.supported[lang])
return false;

this.current=lang;

try{
localStorage.setItem("jarvis_language",lang);
}catch(e){}

return true;
},

getLanguage(){
return this.current;
},

getName(lang=this.current){
return this.supported[lang]||"Español";
},

load(){

try{

const saved=localStorage.getItem("jarvis_language");

if(saved&&this.supported[saved])
this.current=saved;

}catch(e){}

return this.current;
},

normalize(text){
return String(text||"")
.trim()
.replace(/\s+/g," ");
},

isSpanish(text){
return this.detect(text)==="es";
},

isPortuguese(text){
return this.detect(text)==="pt";
},

isEnglish(text){
return this.detect(text)==="en";
},

getLocale(lang=this.current){

const locales={
es:"es-ES",
pt:"pt-BR",
en:"en-US"
};

return locales[lang]||"es-ES";
},

formatNumber(value,lang=this.current){

const n=Number(value);

if(!Number.isFinite(n))
return String(value);

try{
return new Intl.NumberFormat(this.getLocale(lang)).format(n);
}catch(e){
return String(n);
}
},

formatDate(date=new Date(),lang=this.current){

try{
return new Intl.DateTimeFormat(
this.getLocale(lang),
{
dateStyle:"long"
}
).format(date);
}catch(e){
return String(date);
}
},

formatTime(date=new Date(),lang=this.current){

try{
return new Intl.DateTimeFormat(
this.getLocale(lang),
{
timeStyle:"short"
}
).format(date);
}catch(e){
return String(date);
}
},

languageCommand(text){

const l=String(text||"").toLowerCase().trim();

if(
/^(habla|cambia|pon|usa).*(español|espanol)$/i.test(l)
)
return"es";

if(
/^(fala|mude|use|coloque).*(português|portugues)$/i.test(l)
)
return"pt";

if(
/^(speak|change|use|set).*(english)$/i.test(l)
)
return"en";

return null;
},

applyCommand(text){

const lang=this.languageCommand(text);

if(!lang)
return false;

return this.setLanguage(lang);
},

translatePrompt(text,target=this.current){

return[
`Traduce el siguiente texto al idioma ${this.getName(target)}.`,
"Conserva el significado original.",
"No agregues información.",
`Texto: ${this.normalize(text)}`
].join("\n");
},

describe(){

return{
language:this.current,
name:this.getName(),
locale:this.getLocale(),
supported:{...this.supported}
};
}
};


/* INICIALIZACIÓN */

JLanguage.load();


/* FUNCIONES GLOBALES */

function detectLanguage(text){
return JLanguage.detect(text);
}

function setLanguage(lang){
return JLanguage.setLanguage(lang);
}

function getLanguage(){
return JLanguage.getLanguage();
}

function languageName(lang){
return JLanguage.getName(lang);
}

function formatNumber(value,lang){
return JLanguage.formatNumber(value,lang);
}

function formatDate(date,lang){
return JLanguage.formatDate(date,lang);
}

function formatTime(date,lang){
return JLanguage.formatTime(date,lang);
}

function languageCommand(text){
return JLanguage.languageCommand(text);
}

function applyLanguageCommand(text){
return JLanguage.applyCommand(text);
}

function getLanguageInfo(){
return JLanguage.describe();
}
