/* =========================================================
   J.A.R.V.I.S. — SKILL SYSTEM
   ========================================================= */

const JSkills={
 skills:new Map(),

 register(name,description,handler,keywords=[]){
  if(!name||typeof handler!=="function")return false;

  this.skills.set(
   String(name).toLowerCase(),
   {
    name,
    description,
    handler,
    keywords
   }
  );

  return true;
 },

 unregister(name){
  return this.skills.delete(
   String(name).toLowerCase()
  );
 },

 get(name){
  return this.skills.get(
   String(name).toLowerCase()
  )||null;
 },

 list(){
  return [...this.skills.values()].map(x=>({
   name:x.name,
   description:x.description,
   keywords:x.keywords
  }));
 },

 find(text){
  const q=String(text||"").toLowerCase();

  let best=null;
  let score=0;

  for(const skill of this.skills.values()){
   let s=0;

   for(const k of skill.keywords){
    if(q.includes(String(k).toLowerCase()))
     s++;
   }

   if(s>score){
    score=s;
    best=skill;
   }
  }

  return best;
 },

 async run(name,input){
  const skill=this.get(name);

  if(!skill)
   return{
    ok:false,
    error:"Habilidad no encontrada."
   };

  try{
   return{
    ok:true,
    result:await skill.handler(input)
   };
  }catch(e){
   return{
    ok:false,
    error:e?.message||String(e)
   };
  }
 }
};


/* Habilidades nativas */

JSkills.register(
 "calculator",
 "Operaciones matemáticas",
 async x=>calculate(x),
 ["calcula","suma","resta","multiplica","divide","porcentaje"]
);

JSkills.register(
 "memory",
 "Memoria de YARVIS",
 async x=>findMemory(x),
 ["memoria","recuerda","recordar"]
);

JSkills.register(
 "diagnostics",
 "Diagnóstico del sistema",
 async()=>runDiagnostics(),
 ["diagnóstico","diagnostico","sistema","salud"]
);

JSkills.register(
 "knowledge",
 "Base de conocimiento",
 async x=>getKnowledgeContext(x),
 ["conocimiento","aprende","información"]
);

JSkills.register(
 "planner",
 "Planificación",
 async x=>createPlan(x),
 ["plan","planifica","organiza","pasos"]
);

function registerSkill(name,description,handler,keywords=[]){
 return JSkills.register(
  name,
  description,
  handler,
  keywords
 );
}

function findSkill(text){
 return JSkills.find(text);
}

function runSkill(name,input){
 return JSkills.run(name,input);
}

window.JSkills=JSkills;
window.registerSkill=registerSkill;
window.findSkill=findSkill;
window.runSkill=runSkill;
