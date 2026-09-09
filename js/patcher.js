/* =========================================================
   J.A.R.V.I.S. — SAFE PATCH ENGINE
   ========================================================= */

const JPatcher={

 version:"1.0",

 patches:[],

 key:"jarvis_patches_v1",

 load(){

  try{

   this.patches=
    JSON.parse(
     localStorage.getItem(this.key)||"[]"
    );

  }catch(e){

   this.patches=[];
  }
 },

 save(){

  try{

   localStorage.setItem(
    this.key,
    JSON.stringify(
     this.patches.slice(-100)
    )
   );

  }catch(e){}
 },

 create(description,target,changes=""){

  const patch={
   id:Date.now()+Math.random(),
   description:String(description||""),
   target:String(target||""),
   changes:String(changes||""),
   status:"PROPOSED",
   created:new Date().toISOString(),
   applied:null
  };

  this.patches.push(patch);
  this.save();

  return patch;
 },

 get(id){

  return this.patches.find(
   x=>String(x.id)===String(id)
  )||null;
 },

 approve(id){

  const p=this.get(id);

  if(!p)return false;

  p.status="APPROVED";

  this.save();

  return true;
 },

 apply(id){

  const p=this.get(id);

  if(!p)return false;

  /*
   * IMPORTANTE:
   * Este módulo NO escribe JS arbitrario.
   * Solamente registra el cambio para
   * revisión/aplicación controlada.
   */

  if(p.status!=="APPROVED")
   return false;

  p.status="READY_FOR_MANUAL_APPLICATION";
  p.applied=new Date().toISOString();

  this.save();

  return true;
 },

 reject(id){

  const p=this.get(id);

  if(!p)return false;

  p.status="REJECTED";

  this.save();

  return true;
 },

 list(){

  return this.patches
   .slice()
   .reverse();
 },

 clear(){

  this.patches=[];
  this.save();
 }
};

JPatcher.load();

function proposePatch(
 description,
 target,
 changes
){

 return JPatcher.create(
  description,
  target,
  changes
 );
}

function approvePatch(id){
 return JPatcher.approve(id);
}

function applyPatch(id){
 return JPatcher.apply(id);
}

function rejectPatch(id){
 return JPatcher.reject(id);
}

window.JPatcher=JPatcher;
window.proposePatch=proposePatch;
window.approvePatch=approvePatch;
window.applyPatch=applyPatch;
window.rejectPatch=rejectPatch;
