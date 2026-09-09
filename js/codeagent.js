/* =========================================================
   J.A.R.V.I.S. — CODE AGENT
   ========================================================= */

const JCodeAgent={

 version:"1.0",

 async analyze(code,language="javascript"){

  if(!code){
   return{
    ok:false,
    error:"Código vacío."
   };
  }

  if(typeof askAI!=="function"){
   return{
    ok:false,
    error:"IA no disponible."
   };
  }

  const prompt=
   "Analiza el siguiente código "+
   "sin ejecutarlo. "+
   "Detecta errores, problemas lógicos, "+
   "posibles mejoras y riesgos.\n\n"+
   "Lenguaje: "+language+
   "\n\nCÓDIGO:\n"+
   code;

  try{

   const result=
    await askAI(prompt);

   return{
    ok:true,
    result
   };

  }catch(e){

   return{
    ok:false,
    error:e?.message||String(e)
   };
  }
 },

 async generate(request,language="javascript"){

  if(typeof askAI!=="function"){
   return{
    ok:false,
    error:"IA no disponible."
   };
  }

  const prompt=
   "Actúa como asistente de programación. "+
   "Diseña una solución segura y explica "+
   "qué archivos y cambios serían necesarios. "+
   "No ejecutes código arbitrario.\n\n"+
   "Lenguaje: "+language+
   "\nSolicitud:\n"+
   request;

  try{

   const result=
    await askAI(prompt);

   return{
    ok:true,
    result
   };

  }catch(e){

   return{
    ok:false,
    error:e?.message||String(e)
   };
  }
 },

 async review(code,language="javascript"){

  return this.analyze(
   code,
   language
  );
 }
};

window.JCodeAgent=JCodeAgent;

window.analyzeCode=
 function(code,language){
  return JCodeAgent.analyze(
   code,
   language
  );
};

window.generateCode=
 function(request,language){
  return JCodeAgent.generate(
   request,
   language
  );
};
