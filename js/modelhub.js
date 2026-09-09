/* =========================================================
   YARVIS MODEL HUB
   Consulta varios modelos mediante OpenRouter
========================================================= */

(function(){

  const ENDPOINT =
    "https://openrouter.ai/api/v1/chat/completions";

  /*
    Ponemos aquí los modelos que YARVIS consultará.

    Puedes aumentar esta lista después.
  */
  const YARVIS_MODELS = [

    "openai/gpt-5-nano",
    "anthropic/claude-sonnet-4.5",
    "google/gemini-2.5-flash",
    "qwen/qwen3-235b-a22b",
    "deepseek/deepseek-chat"

  ];

  function getOpenRouterKey(){

    /*
      La clave estará en index.html.
      NO ponemos la clave aquí.
    */

    if(typeof OPENROUTER_KEY !== "undefined"){
      return OPENROUTER_KEY;
    }

    if(typeof window.OPENROUTER_KEY !== "undefined"){
      return window.OPENROUTER_KEY;
    }

    return "";
  }


  async function askModel(model,prompt){

    const key=getOpenRouterKey();

    if(!key){

      return {
        model,
        ok:false,
        error:"OPENROUTER_KEY no configurada."
      };

    }

    try{

      const response=await fetch(ENDPOINT,{

        method:"POST",

        headers:{
          "Authorization":"Bearer "+key,
          "Content-Type":"application/json",
          "HTTP-Referer":location.href,
          "X-Title":"YARVIS"
        },

        body:JSON.stringify({

          model:model,

          messages:[

            {
              role:"system",
              content:
                "Eres uno de los modelos expertos que colaboran con YARVIS. "+
                "Responde con precisión, claridad y sin inventar información."
            },

            {
              role:"user",
              content:prompt
            }

          ],

          temperature:0.2,

          max_tokens:1200

        })

      });


      const data=await response.json();


      if(!response.ok){

        return {
          model,
          ok:false,
          error:
            data?.error?.message ||
            "Error HTTP "+response.status
        };

      }


      const content=
        data?.choices?.[0]?.message?.content;


      if(!content){

        return {
          model,
          ok:false,
          error:"El modelo no devolvió contenido."
        };

      }


      return {

        model,
        ok:true,
        response:content

      };


    }catch(error){

      return {

        model,
        ok:false,
        error:error?.message || "Error desconocido"

      };

    }

  }


  /*
    Consulta todos los modelos en paralelo.
  */

  async function queryYarvisModels(prompt,options={}){

    const models=
      Array.isArray(options.models) &&
      options.models.length
        ? options.models
        : YARVIS_MODELS;


    const started=Date.now();


    const results=await Promise.all(

      models.map(model=>
        askModel(model,prompt)
      )

    );


    const successful=
      results.filter(x=>x.ok);


    const failed=
      results.filter(x=>!x.ok);


    return {

      prompt,

      total:results.length,

      successful:successful.length,

      failed:failed.length,

      elapsed:Date.now()-started,

      results,

      answers:successful.map(x=>({

        model:x.model,

        response:x.response

      }))

    };

  }


  function getYarvisModels(){

    return [...YARVIS_MODELS];

  }


  /*
    Estadísticas para DEV.
  */

  function getModelHubStats(){

    return {

      models:YARVIS_MODELS.length,

      endpoint:ENDPOINT,

      modelsList:[...YARVIS_MODELS]

    };

  }


  window.queryYarvisModels=queryYarvisModels;
  window.getYarvisModels=getYarvisModels;
  window.getModelHubStats=getModelHubStats;
  window.yarvisAskModel=askModel;


})();
