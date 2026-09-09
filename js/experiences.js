/* =========================================================
   J.A.R.V.I.S. — EXPERIENCE MEMORY
   ========================================================= */

const JExperiences={

 key:"jarvis_experiences_v1",
 data:[],

 load(){
  try{
   this.data=JSON.parse(
    localStorage.getItem(this.key)||"[]"
   );
  }catch(e){
   this.data=[];
  }
 },

 save(){
  try{
   localStorage.setItem(
    this.key,
    JSON.stringify(
     this.data.slice(-300)
    )
   );
  }catch(e){}
 },

 remember(goal,action,result,success=true){

  const item={
   id:Date.now()+Math.random(),
   goal:String(goal||""),
   action:String(action||""),
   result:String(result||""),
   success:!!success,
   timestamp:new Date().toISOString()
  };

  this.data.push(item);
  this.save();

  return item;
 },

 search(goal){

  const q=String(goal||"").toLowerCase();

  return this.data
   .filter(x=>
    x.goal.toLowerCase().includes(q)||
    q.includes(x.goal.toLowerCase())
   )
   .slice(-10)
   .reverse();
 },

 best(goal){

  const matches=this.search(goal);

  return matches.find(
   x=>x.success
  )||null;
 },

 stats(){

  return{
   total:this.data.length,
   successful:this.data.filter(x=>x.success).length,
   failed:this.data.filter(x=>!x.success).length
  };
 },

 clear(){
  this.data=[];
  this.save();
 }
};

JExperiences.load();

window.JExperiences=JExperiences;
window.rememberExperience=function(
 goal,
 action,
 result,
 success
){
 return JExperiences.remember(
  goal,
  action,
  result,
  success
 );
};
