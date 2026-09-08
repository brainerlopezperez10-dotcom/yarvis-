 /* J.A.R.V.I.S. TOOLS CORE */

const JTools={
version:"1.0",
tools:{},

register(name,fn,description=""){
if(!name||typeof fn!=="function")return false;

this.tools[name]={
name,
fn,
description
};

return true;
},

exists(name){
return !!this.tools[name];
},

list(){
return Object.values(this.tools).map(x=>({
name:x.name,
description:x.description
}));
},

async run(name,...args){
const tool=this.tools[name];

if(!tool)
return{
ok:false,
error:"Herramienta no encontrada",
tool:name
};

try{
const result=await tool.fn(...args);

return{
ok:true,
tool:name,
result
};

}catch(e){

return{
ok:false,
tool:name,
error:e?.message||"Error desconocido"
};

}
},

remove(name){
if(!this.tools[name])return false;

delete this.tools[name];
return true;
},

clear(){
this.tools={};
}
};


/* REGISTRO DE HERRAMIENTAS NATIVAS */

function registerNativeTools(){

JTools.register(
"hologram",
async text=>{
if(typeof buildMathHologram==="function"){
buildMathHologram(String(text));
return"HOLOGRAM_OK";
}
return"El sistema holográfico no está disponible.";
},
"Control del sistema holográfico 3D"
);


JTools.register(
"memory",
async(text,value=null)=>{
if(value!==null&&typeof saveMemory==="function"){
saveMemory(text,value);
return"MEMORY_SAVED";
}

if(typeof findMemory==="function"){
return findMemory(text)||"No encontré esa memoria.";
}

return"La memoria no está disponible.";
},
"Guardar y consultar memoria"
);


JTools.register(
"voice",
async text=>{
if(typeof spk==="function"){
spk(String(text));
return"VOICE_OK";
}

return"La voz no está disponible.";
},
"Síntesis de voz"
);


JTools.register(
"reminder",
async(text,seconds)=>{
if(typeof setReminder==="function"){
setReminder(String(text),Number(seconds)||0);
return"REMINDER_OK";
}

return"El sistema de recordatorios no está disponible.";
},
"Crear recordatorios"
);


JTools.register(
"calculator",
async expression=>{
if(typeof calculate==="function"){
return calculate(String(expression));
}

return"La calculadora no está disponible.";
},
"Resolver operaciones matemáticas"
);


JTools.register(
"clear",
async()=>{
if(typeof clearChat==="function"){
clearChat();
return"CHAT_CLEARED";
}

return"No se pudo limpiar el chat.";
},
"Limpiar conversación"
);


JTools.register(
"planner",
async(task,steps=[])=>{
if(typeof createPlan==="function"){
return createPlan(task,steps);
}

return"El planificador no está disponible.";
},
"Crear y administrar planes"
);


JTools.register(
"diagnostics",
async()=>{
if(typeof runDiagnostics==="function"){
return runDiagnostics();
}

return"El sistema de diagnóstico no está disponible.";
},
"Diagnóstico del sistema"
);


JTools.register(
"context",
async text=>{
if(typeof getContext==="function")
return getContext();

return"El contexto no está disponible.";
},
"Consultar contexto actual"
);


JTools.register(
"reasoning",
async(text,context="")=>{
if(typeof reasonAnalyze==="function")
return reasonAnalyze(text,context);

return"El módulo de razonamiento no está disponible.";
},
"Análisis y revisión de solicitudes"
);

}


/* EJECUTOR CENTRAL */

async function runTool(name,...args){
return JTools.run(name,...args);
}


/* LISTA DE HERRAMIENTAS */

function listTools(){
return JTools.list();
}


/* COMPROBAR HERRAMIENTA */

function hasTool(name){
return JTools.exists(name);
}


/* INICIALIZACIÓN */

registerNativeTools();
