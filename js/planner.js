/* J.A.R.V.I.S. PLANNER CORE */

const JPlanner={
version:"1.0",
active:false,
task:"",
steps:[],
current:0,

create(task,steps=[]){
this.task=String(task||"").trim();

if(Array.isArray(steps)&&steps.length){
this.steps=steps.map((x,i)=>({
id:i+1,
text:String(x),
status:"pending"
}));
}else{
this.steps=[{
id:1,
text:this.task,
status:"pending"
}];
}

this.current=0;
this.active=true;

return this.get();
},

start(task,steps=[]){
return this.create(task,steps);
},

next(){
if(!this.active||!this.steps.length)return null;

if(this.current>0)
this.steps[this.current-1].status="done";

if(this.current>=this.steps.length){
this.active=false;
return null;
}

this.steps[this.current].status="running";

const step=this.steps[this.current];
this.current++;

return step;
},

complete(){
if(!this.steps.length)return;

for(const s of this.steps)
s.status="done";

this.current=this.steps.length;
this.active=false;

return this.get();
},

cancel(){
this.active=false;
this.task="";
this.steps=[];
this.current=0;
},

get(){
return{
task:this.task,
active:this.active,
current:this.current,
total:this.steps.length,
steps:this.steps
};
},

progress(){
if(!this.steps.length)return 0;

const done=this.steps.filter(
x=>x.status==="done"
).length;

return Math.round(done/this.steps.length*100);
},

isFinished(){
return this.steps.length>0 &&
this.steps.every(x=>x.status==="done");
}
};

/* FUNCIONES GLOBALES */

function createPlan(task,steps){
return JPlanner.create(task,steps);
}

function nextPlanStep(){
return JPlanner.next();
}

function finishPlan(){
return JPlanner.complete();
}

function cancelPlan(){
JPlanner.cancel();
}

function getPlan(){
return JPlanner.get();
}

function planProgress(){
return JPlanner.progress();
  }
