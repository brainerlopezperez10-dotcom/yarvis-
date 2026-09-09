/* =========================================================
   J.A.R.V.I.S. — BRAIN CORE V4
   ========================================================= */

const JBrain={

 version:"4.0.0",

 analyze(text){

  const q=String(text||"").trim();
  const x=q.toLowerCase();

  if(!q){
   return{
    intent:"CHAT",
    text:q,
    complex:false
   };
  }

  /* RECORDATORIOS — ANTES DE MEMORIA */
  if(
   /recordatorio|recordarme|recuérdame|recuerda que.*en|avísame|avísame en|alarma/i.test(x)
  ){
   return{
    intent:"REMINDER",
    text:q,
    complex:false
   };
  }

  /* MEMORIA */
  if(
   /^(recuerda|recordar|guarda|guardar|olvida|olvidar|borra de memoria|elimina de memoria)/i.test(x)||
   /qué recuerdas|que recuerdas|qué sabes de mí|que sabes de mi/i.test(x)
  ){
   return{
    intent:"MEMORY",
    text:q,
    complex:false
   };
  }

  /* VOZ */
  if(
   /activar voz|enciende la voz|desactivar voz|apaga la voz|habla|voz/i.test(x)
  ){
   return{
    intent:"VOICE",
    text:q,
    complex:false
   };
  }

  /* HOLOGRAMA */
  if(
   /holograma|holográfico|holografico|3d|edificio 3d|rascacielos/i.test(x)
  ){
   return{
    intent:"HOLOGRAM",
    text:q,
    complex:false
   };
  }

  /* CALCULADORA */
  if(
   /^(cuánto es|cuanto es|calcula|calcular|resuelve)\s+/i.test(x)||
   /^[\d\s()+\-*/%.]+$/.test(q)
  ){
   return{
    intent:"CALCULATOR",
    text:q,
    complex:false
   };
  }

  /* ARCHIVOS */
  if(
   /archivo|pdf|documento|txt|csv|leer archivo|analiza este archivo/i.test(x)
  ){
   return{
    intent:"FILE",
    text:q,
    complex:false
   };
  }

  /* VISIÓN */
  if(
   /analiza esta imagen|qué hay en esta imagen|que hay en esta imagen|imagen|foto|captura de pantalla/i.test(x)
  ){
   return{
    intent:"VISION",
    text:q,
    complex:false
   };
  }

  /* LIMPIAR */
  if(
   /^(limpia|limpiar|borra|borrar) (el )?(chat|conversación|conversacion)/i.test(x)
  ){
   return{
    intent:"CLEAR",
    text:q,
    complex:false
   };
  }

  /* DEV */
  if(
   /modo dev|developer|dev core|desbloquear dev/i.test(x)
  ){
   return{
    intent:"DEV",
    text:q,
    complex:false
   };
  }

  /* CÓDIGO */
  if(
   /programa|programar|código|codigo|javascript|html|css|python|bug|depura|debug|función|funcion/i.test(x)
  ){
   return{
    intent:"CODE",
    text:q,
    complex:x.length>100
   };
  }

  /* TAREA COMPLEJA → AGENT */
  if(
   x.length>100||
   /hazme un proyecto|haz todo|encárgate|encargate|organiza|planifica|desarrolla|construye|crea un sistema|resuelve esto paso a paso|hazlo por mí|hazlo por mi/i.test(x)
  ){
   return{
    intent:"AGENT",
    text:q,
    complex:true
   };
  }

  /* COMANDOS DE PLAN */
  if(
   /crear plan|haz un plan|planifica|plan de trabajo|divide en pasos/i.test(x)
  ){
   return{
    intent:"AGENT",
    text:q,
    complex:true
   };
  }

  return{
   intent:"CHAT",
   text:q,
   complex:false
  };
 },

 needsTool(text){
  const r=this.analyze(text);

  return[
   "CALCULATOR",
   "FILE",
   "VISION",
   "CODE",
   "AGENT"
  ].includes(r.intent);
 },

 isComplex(text){
  return this.analyze(text).complex;
 }
};


/* Compatibilidad con el sistema anterior */

function brainAnalyze(text){
 return JBrain.analyze(text);
}

function brainNeedsTool(text){
 return JBrain.needsTool(text);
}

function brainIsComplex(text){
 return JBrain.isComplex(text);
}

window.JBrain=JBrain;
window.brainAnalyze=brainAnalyze;
window.brainNeedsTool=brainNeedsTool;
window.brainIsComplex=brainIsComplex;
