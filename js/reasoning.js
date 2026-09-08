/* J.A.R.V.I.S. REASONING CORE */

const JReasoning={
version:"1.0",

analyze(text,context=""){
text=String(text||"").trim();
context=String(context||"");

const result={
text,
confidence:this.confidence(text),
complete:this.isComplete(text),
question:this.isQuestion(text),
needsClarification:false,
contradiction:false,
claims:this.extractClaims(text),
timestamp:Date.now()
};

if(result.question&&text.length<12)
result.needsClarification=true;

if(context)
result.contradiction=this.detectContradiction(text,context);

if(result.contradiction)
result.confidence=Math.max(.1,result.confidence-.25);

if(result.needsClarification)
result.confidence=Math.min(result.confidence,.55);

return result;
},

confidence(text){
text=String(text||"").trim();

if(!text)return 0;

let score=.5;

if(text.length>20)score+=.1;
if(text.length>80)score+=.1;
if(/[.!?]/.test(text))score+=.05;
if(/\b(porque|ya que|debido|por eso|therefore|porque)\b/i.test(text))
score+=.1;
if(/\b(no sé|no se|quizás|quizá|tal vez|maybe|perhaps)\b/i.test(text))
score-=.2;
if(/\b(error|falló|fallo|desconozco|imposible)\b/i.test(text))
score-=.15;

return Math.max(0,Math.min(1,score));
},

isQuestion(text){
return /[¿?]/.test(text)||/^(que|qué|como|cómo|cuando|cuándo|donde|dónde|por que|por qué|quien|quién|cuanto|cuánto|what|how|when|where|why|who)\b/i.test(String(text).trim());
},

isComplete(text){
text=String(text||"").trim();

if(!text)return false;
if(text.length<4)return false;

const incomplete=[
/^(quiero|necesito|haz|hacer|dime|explica|puedes|puede)$/i,
/^(como|cómo|qué|que|por qué|porque)$/i
];

for(const r of incomplete)
if(r.test(text))return false;

return true;
},

extractClaims(text){
text=String(text||"").trim();

if(!text)return[];

return text
.split(/[.!?]+/)
.map(x=>x.trim())
.filter(x=>x.length>8)
.slice(0,20);
},

detectContradiction(text,context){
text=String(text||"").toLowerCase();
context=String(context||"").toLowerCase();

if(!text||!context)return false;

const negatives=[
"no ",
"nunca",
"jamás",
"jamas",
"sin ",
"not ",
"never"
];

const hasNegative=negatives.some(x=>text.includes(x));

if(!hasNegative)return false;

const words=text
.replace(/[¿?¡!.,;:]/g," ")
.split(/\s+/)
.filter(x=>x.length>5);

let matches=0;

for(const word of words){
if(context.includes(word))matches++;
}

return matches>=3;
},

compare(a,b){
a=String(a||"").toLowerCase();
b=String(b||"").toLowerCase();

const aw=a
.replace(/[^\p{L}\p{N}\s]/gu," ")
.split(/\s+/)
.filter(x=>x.length>3);

const bw=new Set(
b
.replace(/[^\p{L}\p{N}\s]/gu," ")
.split(/\s+/)
.filter(x=>x.length>3)
);

if(!aw.length)return 0;

let common=0;

for(const word of aw)
if(bw.has(word))common++;

return Math.round(common/aw.length*100);
},

review(answer,user=""){
answer=String(answer||"").trim();
user=String(user||"").trim();

const result={
valid:true,
score:0,
confidence:0,
issues:[],
suggestions:[]
};

if(!answer){
result.valid=false;
result.issues.push("Respuesta vacía");
return result;
}

if(answer.length<3){
result.valid=false;
result.issues.push("Respuesta demasiado corta");
}

if(/^(no sé|no se|no puedo|desconozco)\.?$/i.test(answer)){
result.issues.push("Respuesta insuficiente");
result.suggestions.push("Intentar aportar una explicación o alternativa");
}

if(user&&this.isQuestion(user)&&answer.length<15){
result.issues.push("La respuesta puede ser insuficiente para la pregunta");
result.suggestions.push("Dar más contexto");
}

if(/\b(error|falló|fallo)\b/i.test(answer)){
result.issues.push("La respuesta indica un posible error");
}

result.confidence=this.confidence(answer);

result.score=Math.round(
result.confidence*100
-(result.issues.length*8)
);

result.score=Math.max(0,Math.min(100,result.score));

if(result.score<50)
result.suggestions.push("Revisar la respuesta antes de mostrarla");

return result;
},

needsClarification(text){
const r=this.analyze(text);

return r.needsClarification||!r.complete;
},

improve(answer,user=""){
const review=this.review(answer,user);

if(!review.issues.length)
return answer;

return String(answer).trim();
},

summarize(result){
if(!result)return"Sin análisis.";

return[
`Confianza: ${Math.round((result.confidence||0)*100)}%`,
`Completa: ${result.complete?"sí":"no"}`,
`Pregunta: ${result.question?"sí":"no"}`,
`Contradicción: ${result.contradiction?"posible":"no detectada"}`
].join(" | ");
},

clear(){
return true;
}
};

function reasonAnalyze(text,context=""){
return JReasoning.analyze(text,context);
}

function reviewAnswer(answer,user=""){
return JReasoning.review(answer,user);
}

function reasoningConfidence(text){
return JReasoning.confidence(text);
}

function needsClarification(text){
return JReasoning.needsClarification(text);
}

function compareReasoning(a,b){
return JReasoning.compare(a,b);
}
