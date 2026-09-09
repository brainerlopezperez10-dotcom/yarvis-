/* =========================================================
   J.A.R.V.I.S. — AUTONOMY CORE V4
   AUTONOMÍA CONTROLADA
   ========================================================= */

const JAutonomy={

 version:"4.0.0",

 enabled:false,

 history:[],

 currentVersion:"4.0.0",

 lastReport:null,

 maxHistory:100,


 load(){

  try{

   const x=
    JSON.parse(
     localStorage.getItem(
      "jarvis_autonomy"
     )||"{}"
    );

   this.enabled=!!x.enabled;

   this.history=
    x.history||[];

   this.currentVersion=
    x.currentVersion||
    "4.0.0";

   this.lastReport=
    x.lastReport||
    null;

  }catch(e){}
 },


 save(){

  try{

   localStorage.setItem(
    "jarvis_autonomy",
    JSON.stringify({

     enabled:this.enabled,

     history:
      this.history.slice(
       -this.maxHistory
      ),

     currentVersion:
      this.currentVersion,

     lastReport:
      this.lastReport
    })
   );

  }catch(e){}
 },


 toggle(){

  this.enabled=
   !this.enabled;

  this.save();

  return this.enabled;
 },


 /* =======================================================
    DIAGNÓSTICO
    ======================================================= */

 diagnose(){

  const tests=[];

  const test=(
   name,
   ok,
   info=""
  )=>{

   tests.push({
    name,
    ok:!!ok,
    info
   });
  };


  test(
   "AI",
   typeof llmGenerate==="function",
   "Motor LLM"
  );


  test(
   "Memoria",
   typeof saveMemory==="function",
   "Sistema de memoria"
  );


  test(
   "Voz",
   typeof spk==="function",
   "Síntesis de voz"
  );


  test(
   "Visión",
   typeof analyzeImage==="function",
   "Visión"
  );


  test(
   "Calculadora",
   typeof calculate==="function",
   "Matemáticas"
  );


  test(
   "Conocimiento",
   typeof getKnowledgeContext==="function",
   "Knowledge Core"
  );


  test(
   "Contexto",
   typeof getContext==="function",
   "Context Core"
  );


  test(
   "Planner",
   typeof getPlan==="function",
   "Planner Core"
  );


  test(
   "Agent",
   typeof runAgent==="function",
   "Agent Core"
  );


  test(
   "Tasks",
   typeof JTasks!=="undefined",
   "Task Manager"
  );


  test(
   "Skills",
   typeof JSkills!=="undefined",
   "Skill System"
  );


  test(
   "Tool Router",
   typeof smartToolRun==="function",
   "Tool Router"
  );


  test(
   "Verifier",
   typeof verifyResult==="function",
   "Verifier"
  );


  test(
   "Retry",
   typeof retryOperation==="function",
   "Retry Engine"
  );


  test(
   "Experiences",
   typeof JExperiences!=="undefined",
   "Experience Memory"
  );


  test(
   "Performance",
   typeof getPerformanceProfile==="function",
   "Adaptive Performance"
  );


  test(
   "Security",
   typeof securityCheck==="function",
   "Guardian"
  );


  test(
   "Patch Engine",
   typeof JPatcher!=="undefined",
   "Safe Patch Engine"
  );


  const passed=
   tests.filter(
    x=>x.ok
   ).length;


  return{

   timestamp:
    new Date().toISOString(),

   version:
    this.currentVersion,

   passed,

   total:
    tests.length,

   percentage:
    Math.round(
     passed/
     tests.length*
     100
    ),

   healthy:
    passed===tests.length,

   tests
  };
 },


 /* =======================================================
    ANALIZAR PROBLEMAS
    ======================================================= */

 analyze(){

  const diagnosis=
   this.diagnose();

  const problems=
   diagnosis.tests.filter(
    x=>!x.ok
   );


  return{

   diagnosis,

   problems,

   recommendation:
    problems.length?
    "Revisar módulos faltantes.":
    "Sistema saludable."
  };
 },


 /* =======================================================
    PROPONER MEJORA
    ======================================================= */

 createImprovement(){

  const a=
   this.analyze();


  const improvement={

   id:
    Date.now()+Math.random(),

   from:
    this.currentVersion,

   type:
    a.problems.length?
    "REPARACIÓN":
    "OPTIMIZACIÓN",

   problems:
    a.problems,

   recommendation:
    a.recommendation,

   status:
    "PROPOSED",

   created:
    new Date().toISOString()
  };


  this.history.push(
   improvement
  );

  this.lastReport=
   improvement;

  this.save();


  return improvement;
 },


 /* =======================================================
    APLICAR MEJORA CONTROLADA
    ======================================================= */

 applyImprovement(id){

  const item=
   this.history.find(
    x=>String(x.id)===String(id)
   );


  if(!item)
   return false;


  item.status=
   "TESTING";


  const test=
   this.diagnose();


  /*
   * Solo permitimos avance de versión
   * cuando el sistema está saludable.
   */

  if(test.healthy){

   const parts=
    this.currentVersion
     .split(".")
     .map(Number);


   parts[2]=
    (parts[2]||0)+1;


   this.currentVersion=
    parts.join(".");


   item.status=
    "APPLIED";


   item.result=
    test;


   this.save();

   return true;
  }


  item.status=
   "ROLLED_BACK";


  item.result=
   test;


  this.save();

  return false;
 },


 /* =======================================================
    ROLLBACK
    ======================================================= */

 rollback(){

  const applied=
   [...this.history]
    .reverse()
    .find(
     x=>x.status==="APPLIED"
    );


  if(!applied)
   return false;


  const parts=
   this.currentVersion
    .split(".")
    .map(Number);


  if(parts[2]>0)
   parts[2]--;


  this.currentVersion=
   parts.join(".");


  applied.status=
   "ROLLED_BACK";


  this.save();


  return true;
 },


 /* =======================================================
    REPORTE
    ======================================================= */

 report(){

  return{

   enabled:
    this.enabled,

   version:
    this.currentVersion,

   history:
    this.history.length,

   last:
    this.lastReport,

   health:
    this.diagnose()
  };
 }
};


JAutonomy.load();


/* =========================================================
   FUNCIONES GLOBALES
   ========================================================= */

function toggleAutonomy(){

 const x=
  JAutonomy.toggle();


 if(typeof aM==="function"){

  aM(
   x?
   "🤖 AUTONOMÍA ACTIVADA.":
   "⏹️ AUTONOMÍA DESACTIVADA.",
   "y"
  );
 }


 if(typeof updHUD==="function")
  updHUD();


 return x;
}


function autonomyDiagnose(){

 const r=
  JAutonomy.diagnose();


 if(typeof aM==="function"){

  aM(
   "<pre>"+
   JSON.stringify(
    r,
    null,
    2
   )+
   "</pre>",
   "y"
  );
 }


 return r;
}


function autonomyImprove(){

 const r=
  JAutonomy.createImprovement();


 if(typeof aM==="function"){

  aM(
   "<pre>"+
   JSON.stringify(
    r,
    null,
    2
   )+
   "</pre>",
   "y"
  );
 }


 return r;
}


function autonomyApply(id){

 const ok=
  JAutonomy.applyImprovement(id);


 if(typeof aM==="function"){

  aM(
   ok?
   "🧠 Mejora aplicada. Versión "+
   JAutonomy.currentVersion:
   "⚠️ La prueba falló. Cambio revertido.",
   "y"
  );
 }


 if(typeof updHUD==="function")
  updHUD();


 return ok;
}


function autonomyRollback(){

 const ok=
  JAutonomy.rollback();


 if(typeof aM==="function"){

  aM(
   ok?
   "↩️ Rollback realizado. Versión "+
   JAutonomy.currentVersion:
   "ℹ️ No hay versión aplicada para revertir.",
   "y"
  );
 }


 if(typeof updHUD==="function")
  updHUD();


 return ok;
}


function autonomyReport(){

 const r=
  JAutonomy.report();


 if(typeof aM==="function"){

  aM(
   "<pre>"+
   JSON.stringify(
    r,
    null,
    2
   )+
   "</pre>",
   "y"
  );
 }


 return r;
}


/* =========================================================
   EXPORTS
   ========================================================= */

window.JAutonomy=JAutonomy;

window.toggleAutonomy=
 toggleAutonomy;

window.autonomyDiagnose=
 autonomyDiagnose;

window.autonomyImprove=
 autonomyImprove;

window.autonomyApply=
 autonomyApply;

window.autonomyRollback=
 autonomyRollback;

window.autonomyReport=
 autonomyReport;
