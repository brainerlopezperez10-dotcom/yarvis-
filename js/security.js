/* =========================================================
   J.A.R.V.I.S. — SECURITY / GUARDIAN CORE
   ========================================================= */

const JSecurity={

 version:"1.0",

 blockedPatterns:[

  /borrar\s+todo/i,

  /eliminar\s+todos\s+los\s+archivos/i,

  /robar/i,

  /contraseña/i,

  /password/i,

  /token\s+de\s+acceso/i,

  /credenciales/i,

  /hackear/i,

  /malware/i,

  /ransomware/i,

  /virus/i,

  /exploit/i,

  /evadir\s+seguridad/i,

  /bypass\s+de\s+seguridad/i

 ],

 sensitivePatterns:[

  /modificar\s+archivo/i,

  /eliminar\s+archivo/i,

  /instalar/i,

  /ejecutar\s+código/i,

  /cambiar\s+configuración/i,

  /acceder\s+a/i,

  /enviar\s+datos/i
 ],

 check(input){

  const q=String(input||"");

  for(const p of this.blockedPatterns){

   if(p.test(q)){

    return{
     allowed:false,
     level:"BLOCKED",
     reason:"Acción no permitida."
    };
   }
  }

  for(const p of this.sensitivePatterns){

   if(p.test(q)){

    return{
     allowed:false,
     level:"CONFIRM",
     reason:"La acción requiere autorización."
    };
   }
  }

  return{
   allowed:true,
   level:"SAFE",
   reason:"Acción permitida."
  };
 },

 canRun(input){

  return this.check(input).allowed;
 },

 requiresConfirmation(input){

  return this.check(input).level==="CONFIRM";
 },

 sanitize(text){

  return String(text||"")
   .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi,"")
   .replace(/javascript\s*:/gi,"")
   .trim();
 },

 report(){

  return{
   version:this.version,
   blockedRules:this.blockedPatterns.length,
   confirmationRules:this.sensitivePatterns.length,
   status:"ACTIVE"
  };
 }
};

function securityCheck(input){
 return JSecurity.check(input);
}

function securityCanRun(input){
 return JSecurity.canRun(input);
}

window.JSecurity=JSecurity;
window.securityCheck=securityCheck;
window.securityCanRun=securityCanRun;
