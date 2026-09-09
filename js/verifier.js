/* =========================================================
   J.A.R.V.I.S. — RESULT VERIFIER
   ========================================================= */

const JVerifier={

 version:"1.0",

 async verify(result,expected=""){

  if(
   result===null||
   result===undefined
  ){
   return{
    ok:false,
    score:0,
    reason:"Resultado vacío."
   };
  }

  const text=String(result).trim();

  if(!text){
   return{
    ok:false,
    score:0,
    reason:"Resultado vacío."
   };
  }

  let score=1;

  if(
   /error|falló|fallo|no se pudo|undefined|null/i.test(text)
  ){
   score=.2;
  }

  if(
   expected&&
   text.toLowerCase().includes(
    String(expected).toLowerCase()
   )
  ){
   score=Math.min(1,score+.2);
  }

  return{
   ok:score>=.5,
   score,
   reason:
    score>=.5?
    "Resultado válido.":
    "Resultado posiblemente incorrecto."
  };
 }
};

async function verifyResult(result,expected){
 const r=await JVerifier.verify(
  result,
  expected
 );

 return r.ok;
}

window.JVerifier=JVerifier;
window.verifyResult=verifyResult;
