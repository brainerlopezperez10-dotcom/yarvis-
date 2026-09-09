/* J.A.R.V.I.S. — AUTONOMY CORE */

const JAutonomy={
 version:"1.0",
 enabled:false,
 history:[],
 currentVersion:"1.0.0",
 lastReport:null,

 load(){
  try{
   const x=JSON.parse(
    localStorage.getItem("jarvis_autonomy")||"{}"
   );

   this.enabled=!!x.enabled;
   this.history=x.history||[];
   this.currentVersion=x.currentVersion||"1.0.0";
   this.lastReport=x.lastReport||null;
  }catch(e){}
 },

 save(){
  localStorage.setItem(
   "jarvis_autonomy",
   JSON.stringify({
    enabled:this.enabled,
    history:this.history,
    currentVersion:this.currentVersion,
    lastReport:this.lastReport
   })
  );
 },

 toggle(){
  this.enabled=!this.enabled;
  this.save();
  return this.enabled;
 },

 diagnose(){
  const tests=[];
  const test=(name,ok,info="")=>{
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
   "Análisis de imágenes"
  );

  test(
   "Calculadora",
   typeof calculate==="function",
   "Motor matemático"
  );

  test(
   "Conocimiento",
   typeof getKnowledgeContext==="function",
   "Base de conocimiento"
  );

  test(
   "Contexto",
   typeof getContext==="function",
   "Contexto conversacional"
  );

  test(
   "Planificador",
   typeof getPlan==="function",
   "Sistema de planes"
  );

  const passed=tests.filter(x=>x.ok).length;

  return{
   timestamp:new Date().toISOString(),
   version:this.currentVersion,
   passed,
   total:tests.length,
   healthy:passed===tests.length,
   tests
  };
 },

 analyze(){

  const d=this.diagnose();
  const problems=d.tests.filter(x=>!x.ok);

  let recommendation=
   problems.length?
   "Revisar módulos faltantes.":
   "No se detectaron fallos críticos.";

  return{
   diagnosis:d,
   problems,
   recommendation
  };
 },

 createImprovement(){

  const a=this.analyze();

  const next={
   id:Date.now(),
   from:this.currentVersion,
   type:a.problems.length?
    "REPARACIÓN":
    "OPTIMIZACIÓN",
   problems:a.problems,
   recommendation:a.recommendation,
   status:"PROPOSED",
   created:new Date().toISOString()
  };

  this.history.push(next);
  this.lastReport=next;
  this.save();

  return next;
 },

 applyImprovement(id){

  const item=this.history.find(x=>x.id===id);

  if(!item)return false;

  /*
   * Las mejoras automáticas se limitan a
   * configuraciones internas seguras.
   * No ejecutamos código arbitrario recibido
   * desde una respuesta de IA.
   */

  item.status="TESTING";

  const test=this.diagnose();

  if(test.healthy){

   const parts=this.currentVersion
    .split(".")
    .map(Number);

   parts[2]++;

   this.currentVersion=parts.join(".");

   item.status="APPLIED";
   item.result=test;

   this.save();

   return true;
  }

  item.status="ROLLED_BACK";
  item.result=test;

  this.save();

  return false;
 },

 rollback(){

  const applied=
   [...this.history]
   .reverse()
   .find(x=>x.status==="APPLIED");

  if(!applied)return false;

  const parts=this.currentVersion
   .split(".")
   .map(Number);

  if(parts[2]>0)parts[2]--;

  this.currentVersion=parts.join(".");
  applied.status="ROLLED_BACK";

  this.save();

  return true;
 },

 report(){

  return{
   enabled:this.enabled,
   version:this.currentVersion,
   history:this.history.length,
   last:this.lastReport
  };
 }
};

JAutonomy.load();

function toggleAutonomy(){
 const x=JAutonomy.toggle();

 aM(
  x?
  "🤖 AUTONOMÍA ACTIVADA.":
  "⏹️ AUTONOMÍA DESACTIVADA.",
  "y"
 );

 updHUD();
 return x;
}

function autonomyDiagnose(){
 const r=JAutonomy.diagnose();

 aM(
  "<pre>"+
  JSON.stringify(r,null,2)+
  "</pre>",
  "y"
 );

 return r;
}

function autonomyImprove(){

 const r=JAutonomy.createImprovement();

 aM(
  "<pre>"+
  JSON.stringify(r,null,2)+
  "</pre>",
  "y"
 );

 return r;
}

function autonomyApply(id){

 const ok=JAutonomy.applyImprovement(id);

 aM(
  ok?
  "🧠 Mejora aplicada. Versión "+
  JAutonomy.currentVersion:
  "⚠️ La prueba falló. Cambio revertido.",
  "y"
 );

 updHUD();

 return ok;
}

function autonomyRollback(){

 const ok=JAutonomy.rollback();

 aM(
  ok?
  "↩️ Rollback realizado. Versión "+
  JAutonomy.currentVersion:
  "ℹ️ No hay una versión aplicada para revertir.",
  "y"
 );

 updHUD();

 return ok;
}

function autonomyReport(){

 const r=JAutonomy.report();

 aM(
  "<pre>"+
  JSON.stringify(r,null,2)+
  "</pre>",
  "y"
 );

 return r;
}

window.JAutonomy=JAutonomy;
window.toggleAutonomy=toggleAutonomy;
window.autonomyDiagnose=autonomyDiagnose;
window.autonomyImprove=autonomyImprove;
window.autonomyApply=autonomyApply;
window.autonomyRollback=autonomyRollback;
window.autonomyReport=autonomyReport;
