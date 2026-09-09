/* =========================================================
   J.A.R.V.I.S. — SCREEN VISION
   ========================================================= */

const JScreen={

 lastImage:null,

 async analyze(imageBase64){

  if(!imageBase64){
   return{
    ok:false,
    error:"No se proporcionó una imagen."
   };
  }

  this.lastImage=imageBase64;

  if(typeof fAI!=="function"){
   return{
    ok:false,
    error:"Motor de visión no disponible."
   };
  }

  try{

   const result=await fAI(
    "Analiza esta captura de pantalla. "+
    "Identifica texto visible, botones, menús, "+
    "elementos de interfaz y describe qué está ocurriendo.",
    imageBase64
   );

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

 async analyzeFile(file){

  if(!file)
   return{
    ok:false,
    error:"Archivo no proporcionado."
   };

  try{

   const reader=new FileReader();

   return await new Promise(
    (resolve,reject)=>{

     reader.onload=async()=>{

      try{

       const base64=
        reader.result
         .split(",")[1];

       resolve(
        await this.analyze(base64)
       );

      }catch(e){

       reject(e);
      }
     };

     reader.onerror=reject;
     reader.readAsDataURL(file);
    }
   );

  }catch(e){

   return{
    ok:false,
    error:e?.message||String(e)
   };
  }
 }
};

async function analyzeScreen(image){
 return JScreen.analyze(image);
}

window.JScreen=JScreen;
window.analyzeScreen=analyzeScreen;
