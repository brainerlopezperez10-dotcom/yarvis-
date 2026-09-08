/* J.A.R.V.I.S. — LEARNING BRAIN */

const LEARNING_KEY="jarvis_knowledge_v2";
const LEARNING_STATE="jarvis_learning_state";

const LEARNING_TOPICS=[
 "matemáticas",
 "física",
 "química",
 "biología",
 "historia",
 "geografía",
 "astronomía",
 "programación",
 "inteligencia artificial",
 "tecnología",
 "informática",
 "electrónica",
 "ingeniería",
 "ciencia",
 "idiomas",
 "cultura general",
 "arte",
 "música",
 "literatura"
];

let learningIndex=0;
let learningTimer=null;
let learningBusy=false;


/* =========================
   BASE LOCAL
========================= */

function loadKnowledge(){

 try{
  return JSON.parse(
   localStorage.getItem(LEARNING_KEY)||"[]"
  );
 }catch(e){
  return [];
 }

}


function saveKnowledge(db){

 try{

  localStorage.setItem(
   LEARNING_KEY,
   JSON.stringify(db)
  );

 }catch(e){

  console.warn(
   "JARVIS: no se pudo guardar conocimiento"
  );

 }

}


/* =========================
   NORMALIZACIÓN
========================= */

function normalizeKnowledgeText(text){

 return String(text||"")
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g,"")
  .replace(/[^a-z0-9\s]/g," ")
  .replace(/\s+/g," ")
  .trim();

}


/* =========================
   CATEGORÍAS
========================= */

function detectCategory(topic){

 const t=
  normalizeKnowledgeText(topic);

 const categories={

  "matemáticas":[
   "matematica","matematicas",
   "algebra","geometria",
   "calculo","ecuacion",
   "porcentaje","numero"
  ],

  "física":[
   "fisica","energia",
   "fuerza","movimiento",
   "gravedad","velocidad",
   "electricidad"
  ],

  "química":[
   "quimica","atomo",
   "molecula","elemento",
   "reaccion","tabla periodica"
  ],

  "biología":[
   "biologia","celula",
   "genetica","animal",
   "planta","cuerpo"
  ],

  "historia":[
   "historia","guerra",
   "imperio","revolucion",
   "civilizacion"
  ],

  "geografía":[
   "geografia","pais",
   "continente","rio",
   "montana","clima"
  ],

  "astronomía":[
   "astronomia","planeta",
   "estrella","galaxia",
   "universo","espacio",
   "agujero negro"
  ],

  "programación":[
   "programacion","javascript",
   "python","codigo",
   "algoritmo","software",
   "html","css"
  ],

  "inteligencia artificial":[
   "inteligencia artificial",
   "ia","machine learning",
   "modelo","llm",
   "red neuronal"
  ],

  "tecnología":[
   "tecnologia","robot",
   "android","telefono",
   "computadora","hardware"
  ],

  "electrónica":[
   "electronica","circuito",
   "sensor","voltaje",
   "resistencia","arduino"
  ],

  "idiomas":[
   "idioma","ingles",
   "espanol","portugues",
   "gramatica","traduccion"
  ]

 };


 for(const category in categories){

  for(const word of categories[category]){

   if(t.includes(word))
    return category;

  }

 }

 return "cultura general";

}


/* =========================
   SIMILITUD
========================= */

function similarity(a,b){

 const A=
  new Set(
   normalizeKnowledgeText(a)
   .split(" ")
   .filter(x=>x.length>2)
  );

 const B=
  new Set(
   normalizeKnowledgeText(b)
   .split(" ")
   .filter(x=>x.length>2)
  );

 if(!A.size||!B.size)
  return 0;

 let common=0;

 for(const word of A){

  if(B.has(word))
   common++;

 }

 return common/
  Math.max(A.size,B.size);

}


/* =========================
   BUSCAR DUPLICADOS
========================= */

function findDuplicate(db,topic){

 let best=null;
 let score=0;

 for(const item of db){

  const s=
   similarity(
    topic,
    item.topic
   );

  if(s>score){

   score=s;
   best=item;

  }

 }

 if(score>=0.75)
  return best;

 return null;

}


/* =========================
   GUARDAR / FUSIONAR
========================= */

function learnKnowledge(
 topic,
 content,
 source="Gemini"
){

 if(!topic||!content)
  return false;

 let db=
  loadKnowledge();

 const category=
  detectCategory(topic);

 const duplicate=
  findDuplicate(
   db,
   topic
  );


 /*

 Si ya existe un conocimiento
 parecido, lo actualizamos
 en lugar de crear otro.

 */

 if(duplicate){

  if(
   !duplicate.content
    .includes(content)
  ){

   duplicate.content=
    (
     duplicate.content+
     "\n\n"+
     content
    ).slice(0,10000);

  }

  duplicate.category=
   category;

  duplicate.source=
   source;

  duplicate.updated=
   new Date().toISOString();

 }else{

  db.push({

   id:
    "K_"+Date.now(),

   topic:
    String(topic).trim(),

   category:

    category,

   content:
    String(content)
     .trim()
     .slice(0,7000),

   source:
    source,

   created:
    new Date().toISOString(),

   updated:
    new Date().toISOString()

  });

 }


 /*
  Limite de seguridad.
 */

 if(db.length>500){

  db.sort(
   (a,b)=>
    new Date(b.updated)-
    new Date(a.updated)
  );

  db=
   db.slice(0,500);

 }

 saveKnowledge(db);

 if(typeof updHUD==="function")
  updHUD();

 return true;

}


/* =========================
   BUSCADOR
========================= */

function searchKnowledge(query){

 const db=
  loadKnowledge();

 if(!db.length)
  return [];

 const words=
  normalizeKnowledgeText(query)
   .split(" ")
   .filter(x=>x.length>2);

 const results=[];

 for(const item of db){

  const text=
   normalizeKnowledgeText(
    item.topic+
    " "+
    item.category+
    " "+
    item.content
   );

  let score=0;

  for(const word of words){

   if(text.includes(word))
    score++;

  }

  if(
   item.category &&
   words.includes(
    normalizeKnowledgeText(
     item.category
    )
   )
  ){

   score+=3;

  }

  if(score>0){

   results.push({

    item:item,

    score:score

   });

  }

 }

 results.sort(
  (a,b)=>
   b.score-a.score
 );

 return results
  .slice(0,5)
  .map(x=>x.item);

}


/* =========================
   CONTEXTO PARA EL LLM
========================= */

function getKnowledgeContext(query){

 const results=
  searchKnowledge(query);

 if(!results.length)
  return "";

 return results
  .map(item=>{

   return(
    `CATEGORÍA: ${item.category}\n`+
    `TEMA: ${item.topic}\n`+
    `CONOCIMIENTO: ${item.content}`
   );

  })
  .join("\n\n---\n\n");

}


/* =========================
   APRENDIZAJE CON GEMINI
========================= */

async function askGeminiLearning(
 key,
 topic
){

 try{

  const prompt=`

Eres el módulo de aprendizaje
de J.A.R.V.I.S.

Estudia el tema:

${topic}

Genera conocimiento que pueda
ser almacenado permanentemente
en una base de conocimiento.

Incluye:

1. Definición.
2. Conceptos principales.
3. Datos importantes.
4. Ejemplos.
5. Relaciones con otros conceptos.

Reglas:

- Sé factual.
- No inventes información.
- No repitas frases innecesarias.
- Sé claro.
- Máximo 5000 caracteres.
- Devuelve solamente el conocimiento.

`;


  const r=
   await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key="+
    encodeURIComponent(key),
    {
     method:"POST",

     headers:{
      "Content-Type":
       "application/json"
     },

     body:JSON.stringify({

      contents:[
       {
        parts:[
         {
          text:prompt
         }
        ]
       }
      ]

     })

    }
   );


  const d=
   await r.json();


  if(
   r.ok&&
   d.candidates?.[0]
    ?.content?.parts?.[0]
    ?.text
  ){

   return d
    .candidates[0]
    .content
    .parts[0]
    .text;

  }

 }catch(e){

  console.warn(
   "Learning error:",
   e
  );

 }

 return null;

}


/* =========================
   APRENDER
========================= */

async function learnOneTopic(){

 if(learningBusy)
  return;

 if(
  !window.GEMINI_KEYS||
  !GEMINI_KEYS.length
 )
  return;

 learningBusy=true;

 try{

  const topic=
   LEARNING_TOPICS[
    learningIndex%
    LEARNING_TOPICS.length
   ];

  const key=
   GEMINI_KEYS[
    learningIndex%
    GEMINI_KEYS.length
   ];

  const apiNumber=
   (learningIndex%
    GEMINI_KEYS.length)+1;

  learningIndex++;


  if(
   !key||
   key.startsWith("TU_")
  ){

   return;

  }


  if(typeof aM==="function"){

   aM(
    `🧠 Estudiando ${topic}...`,
    "y"
   );

  }


  const knowledge=
   await askGeminiLearning(
    key,
    topic
   );


  if(knowledge){

   learnKnowledge(
    topic,
    knowledge,
    `Gemini ${apiNumber}`
   );


   if(typeof aM==="function"){

    aM(
     `✅ Aprendido y guardado: ${topic}`,
     "y"
    );

   }

  }


 }finally{

  learningBusy=false;

 }

}


/* =========================
   INICIAR
========================= */

function startLearning(
 intervalMinutes=5
){

 stopLearning();


 /*
  Primer aprendizaje
  después de 10 segundos.
 */

 setTimeout(
  learnOneTopic,
  10000
 );


 learningTimer=
  setInterval(
   learnOneTopic,
   intervalMinutes*
   60*
   1000
  );


 localStorage.setItem(
  LEARNING_STATE,
  "on"
 );


 return true;

}


/* =========================
   DETENER
========================= */

function stopLearning(){

 if(learningTimer){

  clearInterval(
   learningTimer
  );

  learningTimer=null;

 }

 localStorage.setItem(
  LEARNING_STATE,
  "off"
 );

}


/* =========================
   ESTADO
========================= */

function isLearning(){

 return(
  localStorage.getItem(
   LEARNING_STATE
  )==="on"
 );

}


/* =========================
   ESTADÍSTICAS
========================= */

function getKnowledgeStats(){

 const db=
  loadKnowledge();

 const categories={};

 for(const item of db){

  const category=
   item.category||
   "cultura general";

  categories[category]=
   (categories[category]||0)+1;

 }

 return{

  topics:db.length,

  categories:
   Object.keys(categories).length,

  categoryStats:
   categories,

  learning:
   isLearning(),

  nextTopic:
   LEARNING_TOPICS[
    learningIndex%
    LEARNING_TOPICS.length
   ]

 };

}


/* =========================
   BORRAR
========================= */

function clearKnowledge(){

 localStorage.removeItem(
  LEARNING_KEY
 );

 return true;

}


/* =========================
   EXPORTAR CEREBRO
========================= */

function exportKnowledge(){

 const db=
  loadKnowledge();

 const data=
  JSON.stringify(
   db,
   null,
   2
  );

 const blob=
  new Blob(
   [data],
   {
    type:
     "application/json"
   }
  );

 const url=
  URL.createObjectURL(
   blob
  );

 const a=
  document.createElement("a");

 a.href=url;

 a.download=
  "jarvis-knowledge.json";

 a.click();

 setTimeout(
  ()=>URL.revokeObjectURL(url),
  1000
 );

}


/* =========================
   IMPORTAR CEREBRO
========================= */

async function importKnowledge(file){

 try{

  const text=
   await file.text();

  const incoming=
   JSON.parse(text);

  if(!Array.isArray(incoming))
   return false;

  for(const item of incoming){

   if(
    item.topic&&
    item.content
   ){

    learnKnowledge(
     item.topic,
     item.content,
     item.source||
     "Importado"
    );

   }

  }

  return true;

 }catch(e){

  return false;

 }

}


/* =========================
   API GLOBAL
========================= */

window.loadKnowledge=
 loadKnowledge;

window.saveKnowledge=
 saveKnowledge;

window.learnKnowledge=
 learnKnowledge;

window.searchKnowledge=
 searchKnowledge;

window.getKnowledgeContext=
 getKnowledgeContext;

window.startLearning=
 startLearning;

window.stopLearning=
 stopLearning;

window.learnOneTopic=
 learnOneTopic;

window.getKnowledgeStats=
 getKnowledgeStats;

window.clearKnowledge=
 clearKnowledge;

window.exportKnowledge=
 exportKnowledge;

window.importKnowledge=
 importKnowledge;

window.isLearning=
 isLearning;

window.detectCategory=
 detectCategory;


/* =========================
   AUTOARRANQUE
========================= */

if(
 localStorage.getItem(
  LEARNING_STATE
 )==="on"
){

 startLearning(5);

}
