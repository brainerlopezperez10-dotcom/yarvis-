/* =========================================================
   J.A.R.V.I.S. — SMART TOOL ROUTER
   ========================================================= */

const JToolRouter={

 async select(input){
  const q=String(input||"");

  if(typeof findSkill==="function"){
   const skill=findSkill(q);

   if(skill)
    return{
     type:"skill",
     name:skill.name
    };
  }

  if(
   typeof listTools==="function"&&
   typeof hasTool==="function"
  ){
   const tools=listTools();

   const lower=q.toLowerCase();

   for(const name of tools){
    if(lower.includes(String(name).toLowerCase())){
     return{
      type:"tool",
      name
     };
    }
   }
  }

  return{
   type:"llm",
   name:"llm"
  };
 },

 async run(input){
  const selected=await this.select(input);

  try{

   if(selected.type==="skill"){
    return await runSkill(
     selected.name,
     input
    );
   }

   if(
    selected.type==="tool"&&
    typeof runTool==="function"
   ){
    return{
     ok:true,
     result:await runTool(
      selected.name,
      {
       input
      }
     )
    };
   }

   if(typeof askAI==="function"){
    return{
     ok:true,
     result:await askAI(input)
    };
   }

   return{
    ok:false,
    error:"No existe un motor disponible."
   };

  }catch(e){

   return{
    ok:false,
    error:e?.message||String(e)
   };
  }
 }
};

async function smartToolRun(input){
 return JToolRouter.run(input);
}

window.JToolRouter=JToolRouter;
window.smartToolRun=smartToolRun;
