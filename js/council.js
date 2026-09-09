/* =========================================================
   YARVIS COUNCIL
   Compara respuestas de múltiples modelos
========================================================= */

(function(){

  async function judgeResponses(prompt,answers){

    if(!Array.isArray(answers) || !answers.length){

      throw new Error(
        "YARVIS COUNCIL: no hay respuestas para evaluar."
      );

    }


    /*
      Construimos el expediente que verá el juez.
    */

    const candidates=answers.map((item,index)=>{

      return `
===== RESPUESTA ${index+1} =====

MODELO:
${item.model}

RESPUESTA:
${item.response}

===== FIN RESPUESTA ${index+1} =====
`;

    }).join("\n");


    const judgePrompt=`

Eres YARVIS COUNCIL, el sistema encargado de evaluar
respuestas generadas por múltiples modelos de inteligencia artificial.

PREGUNTA ORIGINAL:
${prompt}

RESPUESTAS DE LOS MODELOS:

${candidates}

Analiza todas las respuestas.

Evalúa cada una según:

1. Exactitud
2. Relevancia
3. Claridad
4. Completitud
5. Coherencia
6. Ausencia de información inventada
7. Capacidad para responder exactamente a la pregunta

Después:

- identifica la mejor respuesta;
- corrige cualquier error importante;
- combina información correcta de otras respuestas cuando mejore el resultado;
- NO menciones este proceso al usuario;
- NO digas qué modelos participaron;
- entrega únicamente la respuesta final de YARVIS.

La respuesta final debe ser clara, natural y útil.
`;


    /*
      Utilizamos el modelo de juez configurado aquí.
      Después podemos hacer que el propio Council
      seleccione automáticamente el juez.
    */

    const judgeModel=
      "google/gemini-2.5-flash";


    if(typeof yarvisAskModel!=="function"){

      throw new Error(
        "YARVIS MODEL HUB no está cargado."
      );

    }


    const result=
      await yarvisAskModel(
        judgeModel,
        judgePrompt
      );


    if(!result.ok){

      throw new Error(
        "El juez YARVIS no pudo evaluar las respuestas: "+
        result.error
      );

    }


    return {

      answer:result.response,

      judge:judgeModel,

      candidates:answers.length

    };

  }


  /*
    FUNCIÓN PRINCIPAL

    Pregunta
       ↓
    múltiples modelos
       ↓
    Council
       ↓
    respuesta final
  */

  async function yarvisCouncil(prompt,options={}){

    if(!prompt || !prompt.trim()){

      throw new Error(
        "YARVIS COUNCIL: pregunta vacía."
      );

    }


    if(typeof queryYarvisModels!=="function"){

      throw new Error(
        "YARVIS MODEL HUB no está cargado."
      );

    }


    /*
      1. Consultar modelos.
    */

    const hub=
      await queryYarvisModels(
        prompt,
        options
      );


    /*
      2. Comprobar que al menos uno respondió.
    */

    if(!hub.answers.length){

      throw new Error(
        "Ningún modelo pudo responder."
      );

    }


    /*
      3. Evaluar respuestas.
    */

    const decision=
      await judgeResponses(
        prompt,
        hub.answers
      );


    /*
      4. Resultado final.
    */

    return {

      answer:decision.answer,

      modelsConsulted:hub.total,

      modelsAnswered:hub.successful,

      modelsFailed:hub.failed,

      judge:decision.judge,

      elapsed:hub.elapsed

    };

  }


  /*
    Información para el modo DEV.
  */

  function getCouncilInfo(){

    return {

      online:true,

      mode:"MULTI-MODEL",

      hub:
        typeof getModelHubStats==="function"
          ? getModelHubStats()
          : null

    };

  }


  window.yarvisCouncil=yarvisCouncil;
  window.judgeYarvisResponses=judgeResponses;
  window.getCouncilInfo=getCouncilInfo;


})();
