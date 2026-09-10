/* =========================================================
   YARVIS — APP.JS
   CHAT + VOZ + IMÁGENES + DEV
   ========================================================= */

(() => {

"use strict";

const API_URL =
  "https://yarvis-api.onrender.com";

const $ =
  id => document.getElementById(id);

const chat =
  $("chat");

const input =
  $("input");

const btnSend =
  $("btnSend");

const btnMic =
  $("btnMic");

const btnImg =
  $("btnImg");

const fileImg =
  $("fileImg");

const core =
  $("core");

const status =
  $("status");

const estadoLabel =
  $("estadoLabel");

const devBtn =
  $("devBtn");

const devPanel =
  $("devPanel");

const devClose =
  $("devClose");


/* =========================
   SESIÓN
========================= */

let sid =
  localStorage.getItem(
    "yarvis_sid"
  );

if(!sid){

  sid =
    Date.now() +
    "_" +
    Math.random()
      .toString(36)
      .slice(2);

  localStorage.setItem(
    "yarvis_sid",
    sid
  );
}

const sessionId =
  "web_" + sid;

window.yarvisSessionId =
  sessionId;


/* =========================
   ESTADO
========================= */

function setEstado(
  nombre,
  clase = ""
){

  if(estadoLabel)
    estadoLabel.textContent =
      nombre;

  if(status)
    status.textContent =
      nombre;

  if(core){

    core.classList.remove(
      "listening",
      "thinking",
      "speaking",
      "error"
    );

    if(clase)
      core.classList.add(
        clase
      );
  }

  if(
    window.yarvisHologramState
  ){
    window.yarvisHologramState(
      nombre
    );
  }
}

window.yarvisEstado =
  setEstado;


/* =========================
   MENSAJES
========================= */

function addMsg(
  text,
  who = "bot",
  agentName = ""
){

  if(!chat)
    return;

  const div =
    document.createElement(
      "div"
    );

  div.className =
    "msg " + who;

  if(
    agentName &&
    who === "bot"
  ){

    const agent =
      document.createElement(
        "div"
      );

    agent.className =
      "agent";

    agent.textContent =
      agentName;

    div.appendChild(
      agent
    );
  }

  const content =
    document.createElement(
      "div"
    );

  content.className =
    "msgText";

  content.textContent =
    text || "";

  div.appendChild(
    content
  );

  chat.appendChild(
    div
  );

  chat.scrollTop =
    chat.scrollHeight;
}

window.yarvisAddMsg =
  addMsg;


/* =========================
   PARSER
========================= */

function parseAgent(
  respuesta
){

  const text =
    String(
      respuesta || ""
    );

  const match =
    text.match(
      /^([A-Za-zÁÉÍÓÚÑñ0-9_-]{2,30}):\s*([\s\S]*)$/
    );

  if(match){

    return {
      agent: match[1],
      text:
        match[2].trim()
    };
  }

  return {
    agent: "YARVIS",
    text
  };
}


/* =========================
   TTS
========================= */

async function hablar(
  texto
){

  if(!texto)
    return;

  try{

    const res =
      await fetch(
        API_URL + "/tts",
        {
          method:"POST",
          headers:{
            "Content-Type":
              "application/json"
          },
          body:JSON.stringify({
            texto:
              texto.slice(0,800)
          })
        }
      );

    if(!res.ok)
      return;

    const blob =
      await res.blob();

    const url =
      URL.createObjectURL(
        blob
      );

    const audio =
      new Audio(url);

    await new Promise(
      resolve => {

        audio.onended =
          () => {

            URL.revokeObjectURL(
              url
            );

            resolve();
          };

        audio.onerror =
          () => {

            URL.revokeObjectURL(
              url
            );

            resolve();
          };

        audio.play()
          .catch(
            resolve
          );
      }
    );

  }catch(error){

    console.warn(
      "TTS:",
      error
    );
  }
}

window.yarvisHablar =
  hablar;


/* =========================
   ENVIAR
========================= */

async function enviarMensaje(
  texto = null,
  imagen = null,
  mimeType = null
){

  const mensaje =
    texto !== null
      ? String(texto).trim()
      : String(
          input?.value || ""
        ).trim();

  if(
    !mensaje &&
    !imagen
  )
    return;

  /* Mostrar instantáneamente */

  if(mensaje)
    addMsg(
      mensaje,
      "user"
    );

  if(imagen)
    addMsg(
      "📷 Imagen enviada",
      "user"
    );

  if(input){

    input.value =
      "";

    input.focus();
  }

  setEstado(
    "PROCESANDO",
    "thinking"
  );

  try{

    const body = {

      mensaje:
        mensaje || "",

      sessionId,

      userId:
        "default"
    };

    if(imagen){

      body.imagen =
        imagen;

      body.mimeType =
        mimeType ||
        "image/jpeg";
    }

    const response =
      await fetch(
        API_URL + "/chat",
        {
          method:"POST",

          headers:{
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify(
              body
            )
        }
      );

    let data;

    try{

      data =
        await response.json();

    }catch{

      throw new Error(
        "El servidor no devolvió JSON válido."
      );
    }

    if(!response.ok){

      throw new Error(
        data?.error ||
        "Error HTTP " +
        response.status
      );
    }

    const respuesta =
      data?.respuesta ||
      data?.response ||
      data?.message ||
      "";

    if(!respuesta){

      throw new Error(
        "YARVIS no devolvió ninguna respuesta."
      );
    }

    const parsed =
      parseAgent(
        respuesta
      );

    addMsg(
      parsed.text,
      "bot",
      data?.agente ||
      parsed.agent
    );

    setEstado(
      "HABLANDO",
      "speaking"
    );

    await hablar(
      parsed.text
    );

    setEstado(
      "ONLINE"
    );

  }catch(error){

    console.error(
      "YARVIS:",
      error
    );

    addMsg(
      "⚠️ " +
      (
        error?.message ||
        "No pude conectar con YARVIS."
      ),
      "bot",
      "SISTEMA"
    );

    setEstado(
      "ERROR",
      "error"
    );

    setTimeout(
      () =>
        setEstado(
          "ONLINE"
        ),
      2500
    );
  }
}

window.yarvisEnviar =
  enviarMensaje;


/* =========================
   BOTÓN SEND
========================= */

if(btnSend){

  btnSend.addEventListener(
    "click",
    () =>
      enviarMensaje()
  );
}


/* =========================
   ENTER
========================= */

if(input){

  input.addEventListener(
    "keydown",
    event => {

      if(
        event.key ===
        "Enter" &&
        !event.shiftKey
      ){

        event.preventDefault();

        enviarMensaje();
      }
    }
  );
}


/* =========================
   IMÁGENES
========================= */

if(
  btnImg &&
  fileImg
){

  btnImg.addEventListener(
    "click",
    () =>
      fileImg.click()
  );

  fileImg.addEventListener(
    "change",
    () => {

      const file =
        fileImg.files?.[0];

      if(!file)
        return;

      if(
        !file.type.startsWith(
          "image/"
        )
      ){

        addMsg(
          "⚠️ Selecciona una imagen válida.",
          "bot",
          "SISTEMA"
        );

        fileImg.value =
          "";

        return;
      }

      const reader =
        new FileReader();

      reader.onload =
        () => {

          const result =
            String(
              reader.result || ""
            );

          const base64 =
            result.split(",")[1] ||
            "";

          const pregunta =
            input?.value.trim() ||
            "Analiza esta imagen y dime qué ves.";

          enviarMensaje(
            pregunta,
            base64,
            file.type
          );

          fileImg.value =
            "";
        };

      reader.readAsDataURL(
        file
      );
    }
  );
}


/* =========================
   MICRÓFONO
========================= */

let mediaRecorder =
  null;

let audioChunks =
  [];

let recording =
  false;

let currentStream =
  null;

if(btnMic){

  btnMic.addEventListener(
    "click",
    async () => {

      if(recording){

        detenerGrabacion();

        return;
      }

      try{

        if(
          !navigator.mediaDevices ||
          !navigator.mediaDevices
            .getUserMedia
        ){

          throw new Error(
            "El navegador no permite micrófono."
          );
        }

        currentStream =
          await navigator
            .mediaDevices
            .getUserMedia({
              audio:true
            });

        audioChunks =
          [];

        mediaRecorder =
          new MediaRecorder(
            currentStream
          );

        mediaRecorder
          .ondataavailable =
          event => {

            if(
              event.data.size >
              0
            ){

              audioChunks.push(
                event.data
              );
            }
          };

        mediaRecorder.onstop =
          async () => {

            const blob =
              new Blob(
                audioChunks,
                {
                  type:
                    mediaRecorder.mimeType ||
                    "audio/webm"
                }
              );

            if(currentStream){

              currentStream
                .getTracks()
                .forEach(
                  track =>
                    track.stop()
                );
            }

            currentStream =
              null;

            await transcribir(
              blob
            );
          };

        mediaRecorder.start();

        recording =
          true;

        btnMic.classList.add(
          "recording"
        );

        setEstado(
          "ESCUCHANDO",
          "listening"
        );

      }catch(error){

        console.error(
          "MIC:",
          error
        );

        addMsg(
          "⚠️ No pude acceder al micrófono. Revisa los permisos del navegador.",
          "bot",
          "SISTEMA"
        );

        setEstado(
          "ONLINE"
        );
      }
    }
  );
}


function detenerGrabacion(){

  if(
    mediaRecorder &&
    recording
  ){

    recording =
      false;

    btnMic?.classList.remove(
      "recording"
    );

    setEstado(
      "PROCESANDO",
      "thinking"
    );

    mediaRecorder.stop();
  }
}


/* =========================
   TRANSCRIBIR
========================= */

async function transcribir(
  blob
){

  try{

    const reader =
      new FileReader();

    const base64 =
      await new Promise(
        (resolve,reject) => {

          reader.onload =
            () => {

              const result =
                String(
                  reader.result ||
                  ""
                );

              resolve(
                result.split(",")[1] ||
                ""
              );
            };

          reader.onerror =
            reject;

          reader.readAsDataURL(
            blob
          );
        }
      );

    const response =
      await fetch(
        API_URL +
        "/transcribe",
        {
          method:"POST",

          headers:{
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              audio:
                base64,

              mimeType:
                blob.type ||
                "audio/webm"
            })
        }
      );

    let data;

    try{

      data =
        await response.json();

    }catch{

      throw new Error(
        "Respuesta inválida del servidor."
      );
    }

    if(!response.ok){

      throw new Error(
        data?.error ||
        "Error de transcripción."
      );
    }

    const texto =
      data?.texto ||
      data?.text ||
      data?.transcription ||
      "";

    if(!texto.trim()){

      throw new Error(
        "No pude entender el audio."
      );
    }

    await enviarMensaje(
      texto
    );

  }catch(error){

    console.error(
      "TRANSCRIBE:",
      error
    );

    addMsg(
      "⚠️ " +
      (
        error?.message ||
        "No pude transcribir el audio."
      ),
      "bot",
      "SISTEMA"
    );

    setEstado(
      "ONLINE"
    );
  }
}


/* =========================
   DEV
========================= */

function abrirDev(){

  if(!devPanel)
    return;

  devPanel.classList.add(
    "open"
  );

  devPanel.setAttribute(
    "aria-hidden",
    "false"
  );
}

function cerrarDev(){

  if(!devPanel)
    return;

  devPanel.classList.remove(
    "open"
  );

  devPanel.setAttribute(
    "aria-hidden",
    "true"
  );
}

if(devBtn){

  devBtn.addEventListener(
    "click",
    abrirDev
  );
}

if(devClose){

  devClose.addEventListener(
    "click",
    cerrarDev
  );
}


/* =========================
   INICIO
========================= */

function iniciar(){

  setEstado(
    "ONLINE"
  );

  if(
    chat &&
    !chat.children.length
  ){

    addMsg(
      "¡Hola! ¿En qué puedo ayudarte hoy? 😀",
      "bot",
      "YARVIS"
    );
  }

  console.log(
    "J.A.R.V.I.S. ONLINE"
  );
}

if(
  document.readyState ===
  "loading"
){

  document.addEventListener(
    "DOMContentLoaded",
    iniciar
  );

}else{

  iniciar();
}

})();
