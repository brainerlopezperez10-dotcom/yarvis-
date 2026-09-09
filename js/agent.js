/* =========================================================
   J.A.R.V.I.S. — AGENT CORE V1
   ========================================================= */

const JAgent={
 version:"1.0.0",
 active:false,
 currentTask:null,
 history:[],
 maxSteps:12,
 maxRetries:3,

 createTask(goal){
  goal=String(goal||"").trim();
  if(!goal)return null;

  const task={
   id:Date.now(),
   goal,
   status:"CREATED",
   created:new Date().toISOString(),
   started:null,
   finished:null,
   steps:[],
   currentStep:0,
   retries:0,
   result:null,
   error:null
  };

  this.currentTask=task;
  this.history.push(task);
  return task;
 },

 async analyze(task){
  if(!task)return null;

  task.status="ANALYZING";

  const q=task.goal.toLowerCase();

  const analysis={
   goal:task.goal,
   complexity:"simple",
   needsPlan:false,
   needsTool:false,
   needsVision:false,
   needsCode:false,
   intent:"TASK"
  };

  if(
   q.length>80||
   /haz todo|crea|construye|desarrolla|analiza|investiga|prepara|organiza|resuelve/i.test(q)
  ){
   analysis.complexity="complex";
   analysis.needsPlan=true;
  }

  if(/calcula|suma|resta|multiplica|divide|porcentaje/i.test(q))
   analysis.needsTool=true;

  if(/imagen|foto|captura|pantalla/i.test(q))
   analysis.needsVision=true;

  if(/código|codigo|programa|javascript|html|css|python|bug|error/i.test(q))
   analysis.needsCode=true;

  task.analysis=analysis;
  return analysis;
 },

 async buildPlan(task){
  if(!task)return null;

  task.status="PLANNING";

  const a=task.analysis||await this.analyze(task);

  if(typeof createPlan==="function"){
   try{
    const p=createPlan(task.goal);

    if(p&&p.steps){
     task.steps=p.steps.map((x,i)=>({
      id:i,
      text:typeof x==="string"?x:x.text||String(x),
      status:"PENDING"
     }));
    }
   }catch(e){}
  }

  if(!task.steps.length){
   if(a.needsPlan){
    task.steps=[
     {id:0,text:"Analizar el objetivo",status:"PENDING"},
     {id:1,text:"Determinar los recursos necesarios",status:"PENDING"},
     {id:2,text:"Ejecutar la estrategia",status:"PENDING"},
     {id:3,text:"Verificar el resultado",status:"PENDING"}
    ];
   }else{
    task.steps=[
     {id:0,text:task.goal,status:"PENDING"}
    ];
   }
  }

  task.status="READY";
  return task.steps;
 },

 chooseTool(step,task){
  const text=String(step?.text||task?.goal||"").toLowerCase();

  if(/calcula|suma|resta|multiplica|divide|porcentaje/i.test(text))
   return"calculator";

  if(/imagen|foto|captura|pantalla/i.test(text))
   return"vision";

  if(/código|codigo|programa|javascript|html|css|python|bug/i.test(text))
   return"code";

  if(/memoria|recuerda|recordar/i.test(text))
   return"memory";

  if(/diagnóstico|diagnostico|sistema|estado/i.test(text))
   return"diagnostics";

  if(/plan|organiza|pasos/i.test(text))
   return"planner";

  return"llm";
 },

 async executeStep(step,task){
  const tool=this.chooseTool(step,task);

  step.tool=tool;
  step.status="EXECUTING";
  step.started=new Date().toISOString();

  try{
   let result;

   if(
    typeof runTool==="function"&&
    typeof hasTool==="function"&&
    hasTool(tool)
   ){
    result=await runTool(tool,{
     input:step.text,
     goal:task.goal
    });
   }else if(
    tool==="calculator"&&
    typeof calculate==="function"
   ){
    result=calculate(step.text);
   }else if(
    tool==="vision"
   ){
    result="La visión necesita una imagen proporcionada por el usuario.";
   }else if(
    tool==="code"&&
    typeof askAI==="function"
   ){
    result=await askAI(
     "Analiza esta tarea de programación y propón una solución segura:\n"+
     step.text
    );
   }else if(typeof askAI==="function"){
    result=await askAI(step.text);
   }else{
    result="No hay una herramienta disponible para este paso.";
   }

   step.result=result;
   step.status="COMPLETED";
   step.finished=new Date().toISOString();

   return result;

  }catch(e){
   step.status="FAILED";
   step.error=e?.message||String(e);
   throw e;
  }
 },

 async verify(step,task){
  if(!step)return false;

  if(typeof verifyResult==="function"){
   try{
    return await verifyResult(step.result,step.text);
   }catch(e){}
  }

  if(step.status!=="COMPLETED")return false;

  if(
   step.result===null||
   step.result===undefined||
   String(step.result).trim()===""
  )return false;

  return true;
 },

 async retryStep(step,task){
  if(task.retries>=this.maxRetries){
   step.status="FAILED";
   return false;
  }

  task.retries++;
  step.status="RETRYING";

  await new Promise(r=>setTimeout(r,500));

  try{
   await this.executeStep(step,task);
   return await this.verify(step,task);
  }catch(e){
   return false;
  }
 },

 async run(goal){
  if(this.active){
   return{
    ok:false,
    error:"Ya existe una tarea ejecutándose."
   };
  }

  this.active=true;

  const task=this.createTask(goal);

  try{
   task.started=new Date().toISOString();

   await this.analyze(task);
   await this.buildPlan(task);

   task.status="RUNNING";

   for(
    let i=0;
    i<task.steps.length&&i<this.maxSteps;
    i++
   ){
    task.currentStep=i;

    const step=task.steps[i];
    let success=false;

    try{
     await this.executeStep(step,task);
     success=await this.verify(step,task);
    }catch(e){
     success=false;
    }

    if(!success){
     success=await this.retryStep(step,task);
    }

    if(!success){
     task.status="FAILED";
     task.error="No se pudo completar el paso: "+step.text;
     task.finished=new Date().toISOString();

     this.save();
     this.active=false;

     return task;
    }
   }

   task.status="COMPLETED";

   task.result=task.steps
    .map(x=>x.result)
    .filter(Boolean)
    .join("\n\n");

   task.finished=new Date().toISOString();

   this.save();
   this.active=false;

   return task;

  }catch(e){
   task.status="FAILED";
   task.error=e?.message||String(e);
   task.finished=new Date().toISOString();

   this.save();
   this.active=false;

   return task;
  }
 },

 save(){
  try{
   localStorage.setItem(
    "jarvis_agent_history",
    JSON.stringify(this.history.slice(-50))
   );
  }catch(e){}
 },

 load(){
  try{
   this.history=JSON.parse(
    localStorage.getItem("jarvis_agent_history")||"[]"
   );
  }catch(e){
   this.history=[];
  }
 },

 cancel(){
  if(!this.currentTask)return false;

  this.currentTask.status="CANCELLED";
  this.active=false;
  this.save();

  return true;
 },

 status(){
  return{
   active:this.active,
   task:this.currentTask,
   history:this.history.length,
   version:this.version
  };
 }
};

JAgent.load();

async function runAgent(goal){
 const result=await JAgent.run(goal);

 if(typeof aM==="function"){
  if(result.ok===false){
   aM("❌ "+result.error,"y");
  }else if(result.status==="COMPLETED"){
   aM(
    "🤖 Tarea completada.<br><br>"+
    String(result.result||"Sin resultado."),
    "y"
   );
  }else{
   aM(
    "⚠️ Tarea "+String(result.status||"desconocida")+".",
    "y"
   );
  }
 }

 return result;
}

function cancelAgent(){
 return JAgent.cancel();
}

function getAgentStatus(){
 return JAgent.status();
}

window.JAgent=JAgent;
window.runAgent=runAgent;
window.cancelAgent=cancelAgent;
window.getAgentStatus=getAgentStatus;
