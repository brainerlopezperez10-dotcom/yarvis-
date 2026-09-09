/* =========================================================
   J.A.R.V.I.S. — TASK MANAGER
   ========================================================= */

const JTasks={
 key:"jarvis_tasks_v1",
 tasks:[],
 queue:[],
 running:false,

 load(){
  try{
   const d=JSON.parse(
    localStorage.getItem(this.key)||"{}"
   );

   this.tasks=d.tasks||[];
   this.queue=d.queue||[];
  }catch(e){
   this.tasks=[];
   this.queue=[];
  }
 },

 save(){
  try{
   localStorage.setItem(
    this.key,
    JSON.stringify({
     tasks:this.tasks.slice(-100),
     queue:this.queue
    })
   );
  }catch(e){}
 },

 create(title,priority="normal"){
  const task={
   id:Date.now()+Math.random(),
   title:String(title||""),
   priority,
   status:"PENDING",
   created:new Date().toISOString(),
   started:null,
   finished:null,
   result:null
  };

  this.tasks.push(task);
  this.queue.push(task.id);
  this.save();

  return task;
 },

 get(id){
  return this.tasks.find(
   x=>String(x.id)===String(id)
  )||null;
 },

 remove(id){
  this.tasks=this.tasks.filter(
   x=>String(x.id)!==String(id)
  );

  this.queue=this.queue.filter(
   x=>String(x)!==String(id)
  );

  this.save();
 },

 cancel(id){
  const t=this.get(id);
  if(!t)return false;

  t.status="CANCELLED";
  this.queue=this.queue.filter(
   x=>String(x)!==String(id)
  );

  this.save();

  return true;
 },

 async run(id){
  const t=this.get(id);

  if(!t)return null;

  if(typeof runAgent!=="function"){
   t.status="FAILED";
   t.result="Agent Core no disponible.";
   this.save();
   return t;
  }

  t.status="RUNNING";
  t.started=new Date().toISOString();
  this.running=true;
  this.save();

  const r=await runAgent(t.title);

  t.result=r?.result||r?.error||null;
  t.status=
   r?.status==="COMPLETED"?
   "COMPLETED":
   "FAILED";

  t.finished=new Date().toISOString();

  this.running=false;
  this.queue=this.queue.filter(
   x=>String(x)!==String(id)
  );

  this.save();

  return t;
 },

 async runNext(){
  if(this.running)return null;

  const id=this.queue[0];

  if(!id)return null;

  return this.run(id);
 },

 list(){
  return this.tasks.slice().reverse();
 },

 clear(){
  this.tasks=[];
  this.queue=[];
  this.save();
 },

 stats(){
  return{
   total:this.tasks.length,
   pending:this.tasks.filter(x=>x.status==="PENDING").length,
   running:this.tasks.filter(x=>x.status==="RUNNING").length,
   completed:this.tasks.filter(x=>x.status==="COMPLETED").length,
   failed:this.tasks.filter(x=>x.status==="FAILED").length
  };
 }
};

JTasks.load();

window.JTasks=JTasks;

window.createTask=function(t,p){
 return JTasks.create(t,p);
};

window.runTask=function(id){
 return JTasks.run(id);
};

window.runNextTask=function(){
 return JTasks.runNext();
};

window.getTasks=function(){
 return JTasks.list();
};

window.getTaskStats=function(){
 return JTasks.stats();
};

window.cancelTask=function(id){
 return JTasks.cancel(id);
};
