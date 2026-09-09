/* =========================================================
   J.A.R.V.I.S. — ADVANCED PLANNER V4
   ========================================================= */

const JPlanner={

 version:"4.0.0",

 active:null,

 plans:[],

 maxSteps:12,

 create(goal){

  goal=String(goal||"").trim();

  if(!goal)return null;

  const plan={

   id:Date.now()+Math.random(),

   goal,

   status:"CREATED",

   created:new Date().toISOString(),

   currentStep:0,

   steps:[

    {
     id:0,
     text:"Analizar el objetivo",
     status:"PENDING"
    },

    {
     id:1,
     text:"Determinar los recursos y herramientas necesarios",
     status:"PENDING"
    },

    {
     id:2,
     text:"Ejecutar la solución",
     status:"PENDING"
    },

    {
     id:3,
     text:"Verificar el resultado",
     status:"PENDING"
    }

   ]
  };

  this.active=plan;
  this.plans.push(plan);

  return plan;
 },

 start(){

  if(!this.active)return null;

  this.active.status="RUNNING";

  return this.active;
 },

 next(){

  if(!this.active)return null;

  const i=this.active.currentStep;

  if(i>=this.active.steps.length)
   return null;

  this.active.steps[i].status="COMPLETED";

  this.active.currentStep++;

  if(
   this.active.currentStep>=
   this.active.steps.length
  ){
   this.active.status="COMPLETED";
  }

  return this.active;
 },

 complete(){

  if(!this.active)return false;

  this.active.steps.forEach(
   x=>x.status="COMPLETED"
  );

  this.active.currentStep=
   this.active.steps.length;

  this.active.status="COMPLETED";

  return true;
 },

 cancel(){

  if(!this.active)return false;

  this.active.status="CANCELLED";

  return true;
 },

 get(){

  return this.active;
 },

 progress(){

  if(!this.active)
   return 0;

  if(!this.active.steps.length)
   return 0;

  return Math.round(
   this.active.currentStep/
   this.active.steps.length*
   100
  );
 },

 isFinished(){

  return(
   !!this.active&&
   (
    this.active.status==="COMPLETED"||
    this.active.status==="CANCELLED"
   )
  );
 }
};


/* Funciones compatibles */

function createPlan(goal){
 return JPlanner.create(goal);
}

function startPlan(){
 return JPlanner.start();
}

function nextPlanStep(){
 return JPlanner.next();
}

function finishPlan(){
 return JPlanner.complete();
}

function cancelPlan(){
 return JPlanner.cancel();
}

function getPlan(){
 return JPlanner.get();
}

function planProgress(){
 return JPlanner.progress();
}

function isPlanFinished(){
 return JPlanner.isFinished();
}


window.JPlanner=JPlanner;
window.createPlan=createPlan;
window.startPlan=startPlan;
window.nextPlanStep=nextPlanStep;
window.finishPlan=finishPlan;
window.cancelPlan=cancelPlan;
window.getPlan=getPlan;
window.planProgress=planProgress;
window.isPlanFinished=isPlanFinished;
