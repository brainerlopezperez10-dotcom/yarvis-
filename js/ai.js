/* J.A.R.V.I.S. — AI + CACHE LOCAL */

const CACHE_KEY="jarvis_ai_cache";

function loadAICache(){
 try{
  return JSON.parse(localStorage.getItem(CACHE_KEY)||"{}");
 }catch(e){
  return {};
 }
}

function saveAICache(data){
 try{
  localStorage.setItem(CACHE_KEY,JSON.stringify(data));
 }catch(e){}
}

function getCachedAnswer(question){
 const cache=loadAICache();
 const key=cQ(question);
 return cache[key]||null;
}

function cacheAnswer(question,answer){
 if(!question||!answer)return;

 const cache=loadAICache();
 cache[cQ(question)]=answer;

 saveAICache(cache);
}

function clearAICache(){
 try{
  localStorage.removeItem(CACHE_KEY);
 }catch(e){}
}

function getAICacheCount(){
 return Object.keys(loadAICache()).length;
}


/* =========================
   GROQ
   ========================= */

async function fGroq(
 p,
 m="openai/gpt-oss-120b"
){
 try{

  const r=await fetch(
   "https://api.groq.com/openai/v1/chat/completions",
   {
    method:"POST",
    headers:{
     "Content-Type":"application/json",
     "Authorization":`Bearer ${GROQ_KEY}`
    },
    body:JSON.stringify({
     model:m,
     messages:[
      {
       role:"system",
       content:SYSTEM_PROMPT
      },
      ...chatHist.slice(-8),
      {
       role:"user",
       content:p
      }
     ]
    })
   }
  );

  const d=await r.json();

  if(
   r.ok&&
   d.choices?.[0]?.message?.content
  ){

   const t=d.choices[0].message.content;

   chatHist.push(
    {role:"user",content:p},
    {role:"assistant",content:t}
   );

   return t;
  }

  if(m.includes("120b"))
   return fGroq(p,"openai/gpt-oss-20b");

  return "Sin respuesta.";

 }catch(e){

  if(m.includes("120b"))
   return fGroq(p,"openai/gpt-oss-20b");

  return "Error de red.";
 }
}


/* =========================
   GEMINI
   ========================= */

async function fAI(p,imgBase64=null){

 const q=cQ(p);

 /* 1. RESPUESTA GUARDADA */

 if(!imgBase64){

  const cached=getCachedAnswer(q);

  if(cached){

   chatHist.push(
    {role:"user",content:p},
    {role:"assistant",content:cached}
   );

   return cached;
  }

  /* Memoria antigua */

  if(typeof mem!=="undefined"&&mem.has(q))
   return mem.get(q);
 }


 /* 2. CONSULTAR GEMINI */

 for(let i=0;i<GEMINI_KEYS.length;i++){

  const k=GEMINI_KEYS[kI];

  kI=(kI+1)%GEMINI_KEYS.length;

  try{

   let parts=[
    {
     text:
      SYSTEM_PROMPT+
      "\nHistorial:\n"+
      chatHist
       .slice(-6)
       .map(c=>`${c.role}: ${c.content}`)
       .join("\n")+
      "\nUsuario: "+
      p
    }
   ];

   if(imgBase64){

    parts.push({
     inline_data:{
      mime_type:"image/jpeg",
      data:imgBase64
     }
    });
   }

   const r=await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${encodeURIComponent(k)}`,
    {
     method:"POST",
     headers:{
      "Content-Type":"application/json"
     },
     body:JSON.stringify({
      contents:[{parts}]
     })
    }
   );

   const d=await r.json();

   if(
    r.ok&&
    d.candidates?.[0]?.content?.parts?.[0]?.text
   ){

    const t=
     d.candidates[0]
      .content
      .parts[0]
      .text;

    chatHist.push(
     {role:"user",content:p},
     {role:"assistant",content:t}
    );

    /* 3. GUARDAR PARA LA PRÓXIMA VEZ */

    if(!imgBase64){
     cacheAnswer(q,t);

     if(typeof saveMemory==="function")
      saveMemory(p,t);
    }

    return t;
   }

  }catch(e){}
 }


 /* 4. FALLBACK GROQ */

 const answer=await fGroq(p);

 if(
  answer&&
  !imgBase64&&
  !/^Error|Sin respuesta/i.test(answer)
 ){
  cacheAnswer(q,answer);

  if(typeof saveMemory==="function")
   saveMemory(p,answer);
 }

 return answer;
}
