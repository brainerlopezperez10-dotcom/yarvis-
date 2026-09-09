/* =========================================================
   J.A.R.V.I.S. — SMART ROUTER V4
   ========================================================= */

const JRouter={

 version:"4.0.0",

 async route(text){

  const result=
   typeof brainAnalyze==="function"?
   brainAnalyze(text):
   {
    intent:"CHAT",
    text
   };

  const intent=
   String(result.intent||"CHAT").toUpperCase();

  /* AGENT CORE */

  if(intent==="AGENT"){

   if(typeof runAgent==="function"){

    const r=
     await runAgent(text);

    return{
     intent:"AGENT",
     text,
     result:r
    };
   }

   return{
    intent:"CHAT",
    text
   };
  }

  return{
   intent,
   text:result.text||text,
   complex:!!result.complex
  };
 }
};


async function routeCommand(text){
 return JRouter.route(text);
}


window.JRouter=JRouter;
window.routeCommand=routeCommand;
