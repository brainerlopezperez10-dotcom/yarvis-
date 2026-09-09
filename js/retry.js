/* =========================================================
   J.A.R.V.I.S. — RETRY ENGINE
   ========================================================= */

const JRetry={

 maxAttempts:3,
 delay:700,

 async run(fn,validator=null){

  let last=null;

  for(
   let attempt=1;
   attempt<=this.maxAttempts;
   attempt++
  ){

   try{

    const result=await fn(attempt);

    let valid=true;

    if(typeof validator==="function"){
     valid=await validator(
      result,
      attempt
     );
    }

    if(valid){

     return{
      ok:true,
      attempts:attempt,
      result
     };
    }

    last=result;

   }catch(e){

    last=e?.message||String(e);
   }

   if(attempt<this.maxAttempts){

    await new Promise(
     r=>setTimeout(r,this.delay)
    );
   }
  }

  return{
   ok:false,
   attempts:this.maxAttempts,
   result:last
  };
 }
};

async function retryOperation(fn,validator){
 return JRetry.run(fn,validator);
}

window.JRetry=JRetry;
window.retryOperation=retryOperation;
