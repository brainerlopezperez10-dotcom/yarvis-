/* =========================================================
   J.A.R.V.I.S. — ADAPTIVE PERFORMANCE
   ========================================================= */

const JPerformance={

 version:"1.0",

 metrics:{
  requests:0,
  errors:0,
  totalTime:0
 },

 start(){

  return performance.now();
 },

 end(start,success=true){

  const time=
   performance.now()-start;

  this.metrics.requests++;
  this.metrics.totalTime+=time;

  if(!success)
   this.metrics.errors++;

  return time;
 },

 getAverageTime(){

  if(!this.metrics.requests)
   return 0;

  return(
   this.metrics.totalTime/
   this.metrics.requests
  );
 },

 getMemory(){

  try{

   if(
    performance.memory
   ){
    return{
     used:performance.memory.usedJSHeapSize,
     total:performance.memory.jsHeapSizeLimit
    };
   }

  }catch(e){}

  return null;
 },

 getNetwork(){

  try{

   const c=navigator.connection;

   if(!c)return null;

   return{
    type:c.effectiveType||"unknown",
    downlink:c.downlink||0,
    saveData:!!c.saveData
   };

  }catch(e){

   return null;
  }
 },

 profile(){

  const memory=this.getMemory();
  const network=this.getNetwork();

  let mode="normal";

  if(
   memory&&
   memory.total>0&&
   memory.used/memory.total>.8
  ){
   mode="light";
  }

  if(
   network&&
   network.saveData
  ){
   mode="light";
  }

  return{
   mode,
   averageTime:this.getAverageTime(),
   memory,
   network,
   metrics:this.metrics
  };
 },

 reset(){
  this.metrics={
   requests:0,
   errors:0,
   totalTime:0
  };
 }
};

function getPerformanceProfile(){
 return JPerformance.profile();
}

window.JPerformance=JPerformance;
window.getPerformanceProfile=
 getPerformanceProfile;
