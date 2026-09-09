/* =========================================================
   J.A.R.V.I.S. — TOOL SYSTEM V4
   ========================================================= */

const JTools={

 version:"4.0.0",

 registry:new Map(),

 register(name,handler,description=""){

  if(
   !name||
   typeof handler!=="function"
  ){
   return false;
  }

  this.registry.set(
   String(name).toLowerCase(),
   {
    name,
    handler,
    description
   }
  );

  return true;
 },

 unregister(name){

  return this.registry.delete(
   String(name).toLowerCase()
  );
 },

 has(name){

  return this.registry.has(
   String(name).toLowerCase()
  );
 },

 list(){

  return[
   ...this.registry.values()
  ].map(x=>x.name);
 },

 async run(name,args={}){

  const tool=
   this.registry.get(
    String(name).toLowerCase()
   );

  if(!tool){

   return{
    ok:false,
    error:"Herramienta no encontrada: "+name
   };
  }

  try{

   const result=
    await tool.handler(args);

   return{
    ok:true,
    result
   };

  }catch(e){

   return{
    ok:false,
    error:e?.message||String(e)
   };
  }
 }
};


/* =========================================================
   HERRAMIENTAS NATIVAS
   ========================================================= */

function registerNativeTools(){

 /* CALCULADORA */

 JTools.register(
  "calculator",
  async args=>{

   if(
    typeof calculate!=="function"
   )
    throw new Error(
     "Calculadora no disponible."
    );

   return calculate(
    args.input||
    args.expression||
    ""
   );
  },
  "Motor matemático"
 );


 /* MEMORIA */

 JTools.register(
  "memory",
  async args=>{

   const q=
    args.input||
    "";

   if(
    typeof findMemory==="function"
   )
    return findMemory(q);

   return null;
  },
  "Memoria"
 );


 /* VOZ */

 JTools.register(
  "voice",
  async args=>{

   const text=
    String(args.input||"")
     .toLowerCase();

   if(
    text.includes("activar")||
    text.includes("enciende")
   ){

    voiceEnabled=true;

    return"Voz activada.";
   }

   if(
    text.includes("desactivar")||
    text.includes("apaga")
   ){

    voiceEnabled=false;

    return"Voz desactivada.";
   }

   return"Control de voz disponible.";
  },
  "Control de voz"
 );


 /* RECORDATORIO */

 JTools.register(
  "reminder",
  async args=>{

   if(
    typeof setReminder!=="function"
   )
    return"Recordatorios no disponibles.";

   setReminder(
    args.input||"Recordatorio",
    60
   );

   return"Recordatorio creado.";
  },
  "Recordatorios"
 );


 /* CLEAR */

 JTools.register(
  "clear",
  async()=>{

   if(
    typeof clearChat==="function"
   )
    clearChat();

   if(
    typeof clearContext==="function"
   )
    clearContext();

   return"Conversación limpiada.";
  },
  "Limpiar conversación"
 );


 /* PLANNER */

 JTools.register(
  "planner",
  async args=>{

   if(
    typeof createPlan!=="function"
   )
    return null;

   return createPlan(
    args.input||
    args.goal||
    ""
   );
  },
  "Planificador"
 );


 /* DIAGNÓSTICOS */

 JTools.register(
  "diagnostics",
  async()=>{

   if(
    typeof runDiagnostics==="function"
   )
    return runDiagnostics();

   if(
    typeof JDiagnostics!=="undefined"
   )
    return JDiagnostics;

   return"Diagnósticos no disponibles.";
  },
  "Diagnóstico"
 );


 /* CONTEXTO */

 JTools.register(
  "context",
  async()=>{

   if(
    typeof getContext==="function"
   )
    return getContext();

   return"Sin contexto.";
  },
  "Contexto"
 );


 /* RAZONAMIENTO */

 JTools.register(
  "reasoning",
  async args=>{

   if(
    typeof JReasoning!=="undefined"&&
    typeof JReasoning.analyze==="function"
   ){

    return JReasoning.analyze(
     args.input||""
    );
   }

   return"Motor de razonamiento disponible.";
  },
  "Análisis"
 );


 /* AGENT */

 JTools.register(
  "agent",
  async args=>{

   if(
    typeof runAgent!=="function"
   )
    throw new Error(
     "Agent Core no disponible."
    );

   return runAgent(
    args.input||
    args.goal||
    ""
   );
  },
  "Agente autónomo controlado"
 );


 /* TASKS */

 JTools.register(
  "tasks",
  async args=>{

   if(
    typeof createTask!=="function"
   )
    return null;

   return createTask(
    args.input||
    args.goal||
    ""
   );
  },
  "Gestor de tareas"
 );


 /* SKILLS */

 JTools.register(
  "skills",
  async args=>{

   if(
    typeof findSkill!=="function"
   )
    return null;

   const skill=
    findSkill(
     args.input||""
    );

   return skill?
    {
     name:skill.name,
     description:skill.description
    }:
    null;
  },
  "Sistema de habilidades"
 );


 /* VERIFICADOR */

 JTools.register(
  "verifier",
  async args=>{

   if(
    typeof verifyResult==="function"
   ){

    return verifyResult(
     args.result||
     args.input||
     "",
     args.expected||
     ""
    );
   }

   return false;
  },
  "Verificación"
 );


 /* EXPERIENCIAS */

 JTools.register(
  "experiences",
  async args=>{

   if(
    typeof JExperiences==="undefined"
   )
    return null;

   return JExperiences.search(
    args.input||
    args.goal||
    ""
   );
  },
  "Memoria de experiencias"
 );


 /* PERFORMANCE */

 JTools.register(
  "performance",
  async()=>{

   if(
    typeof getPerformanceProfile==="function"
   )
    return getPerformanceProfile();

   return null;
  },
  "Rendimiento adaptativo"
 );


 /* SEGURIDAD */

 JTools.register(
  "security",
  async args=>{

   if(
    typeof securityCheck==="function"
   )
    return securityCheck(
     args.input||
     ""
    );

   return{
    allowed:true
   };
  },
  "Guardian de seguridad"
 );


 /* PATCH */

 JTools.register(
  "patch",
  async args=>{

   if(
    typeof proposePatch!=="function"
   )
    return null;

   return proposePatch(
    args.description||
    args.input||
    "",
    args.target||
    "manual",
    args.changes||
    ""
   );
  },
  "Sistema de parches"
 );
}


/* =========================================================
   API GLOBAL
   ========================================================= */

async function runTool(name,args){
 return JTools.run(name,args);
}

function listTools(){
 return JTools.list();
}

function hasTool(name){
 return JTools.has(name);
}

function registerTool(
 name,
 handler,
 description
){
 return JTools.register(
  name,
  handler,
  description
 );
}


window.JTools=JTools;
window.runTool=runTool;
window.listTools=listTools;
window.hasTool=hasTool;
window.registerTool=registerTool;
window.registerNativeTools=
 registerNativeTools;
