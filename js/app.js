/* =========================================================
   J.A.R.V.I.S. - APP CORE
   Motor principal de interfaz, chat, holograma, voz y DEV
   ========================================================= */

(function () {
  "use strict";

  /* =========================================================
     ESTADO GLOBAL
     ========================================================= */

  window.isDev = false;
  window.devUnlocked = false;

  let chatHist = [];
  let voiceChatActive = false;

  window.chatHist = chatHist;

  let sc = null;
  let obj = null;
  let camera = null;
  let renderer = null;

  let rotX = 0;
  let rotY = 0;

  let processing = false;

  /* =========================================================
     UTILIDADES
     ========================================================= */

  function $(id) {
    return document.getElementById(id);
  }

  function setStatus(text) {
    const el = $("st");
    if (el) el.textContent = text;
  }

  function escapeHTML(text) {
    return String(text ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function scrollChat() {
    const box = $("chat");
    if (box) box.scrollTop = box.scrollHeight;
  }

  /* =========================================================
     CHAT
     ========================================================= */

  function aM(text, type) {
    const chat = $("chat");

    if (!chat) {
      console.warn("JARVIS chat no encontrado:", text);
      return;
    }

    const msg = document.createElement("div");

    let cls = "m";

    if (type === "u") cls += " u";
    else if (type === "y") cls += " y";
    else if (type === "sys") cls += " sys";

    msg.className = cls;

    msg.textContent = String(text ?? "");

    chat.appendChild(msg);
    scrollChat();

    return msg;
  }

  window.aM = aM;

  function clearChatLocal() {
    const chat = $("chat");

    if (chat) {
      chat.innerHTML = "";
    }

    chatHist = [];
    window.chatHist = chatHist;

    aM("Memoria de conversación visual limpiada.", "sys");
  }

  window.clearChatLocal = clearChatLocal;

  /* =========================================================
     HISTORIAL
     ========================================================= */

  function addHistory(role, content) {
    chatHist.push({
      role,
      content,
      time: Date.now()
    });

    if (chatHist.length > 30) {
      chatHist = chatHist.slice(-30);
    }

    window.chatHist = chatHist;
  }

  /* =========================================================
     THREE.JS / HOLOGRAMA
     ========================================================= */

  function initThree() {
    const sceneEl = $("scene");

    if (!sceneEl) {
      console.warn("JARVIS: #scene no encontrado.");
      return;
    }

    if (typeof THREE === "undefined") {
      console.warn("JARVIS: Three.js no está cargado.");
      return;
    }

    try {
      sc = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(
        45,
        sceneEl.clientWidth / Math.max(sceneEl.clientHeight, 1),
        0.1,
        1000
      );

      camera.position.set(0, 0, 7);

      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        powerPreference: "low-power"
      });

      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 1.5)
      );

      renderer.setSize(
        sceneEl.clientWidth || 300,
        sceneEl.clientHeight || 300
      );

      sceneEl.innerHTML = "";
      sceneEl.appendChild(renderer.domElement);

      const light = new THREE.PointLight(0xffffff, 2);
      light.position.set(4, 4, 6);
      sc.add(light);

      const ambient = new THREE.AmbientLight(0xffffff, 0.5);
      sc.add(ambient);

      obj = createDefaultHologram();

      if (obj) {
        sc.add(obj);
      }

      animateThree();

      window.addEventListener("resize", resizeThree);

      console.log("JARVIS 3D ONLINE");
    } catch (err) {
      console.error("Error iniciando Three.js:", err);
    }
  }

  function createDefaultHologram() {
    if (typeof THREE === "undefined") return null;

    const group = new THREE.Group();

    const geometry = new THREE.TorusKnotGeometry(
      1.15,
      0.22,
      64,
      12
    );

    const material = new THREE.MeshBasicMaterial({
      wireframe: true
    });

    const mesh = new THREE.Mesh(geometry, material);

    group.add(mesh);

    return group;
  }

  function animateThree() {
    requestAnimationFrame(animateThree);

    if (!renderer || !sc || !camera) return;

    if (obj) {
      obj.rotation.x += 0.003 + rotX;
      obj.rotation.y += 0.005 + rotY;

      rotX *= 0.96;
      rotY *= 0.96;
    }

    renderer.render(sc, camera);
  }

  function resizeThree() {
    const sceneEl = $("scene");

    if (!sceneEl || !renderer || !camera) return;

    const width = sceneEl.clientWidth || 300;
    const height = sceneEl.clientHeight || 300;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
  }

  function showHologram(type) {
    if (!sc || typeof THREE === "undefined") return;

    try {
      if (obj) {
        sc.remove(obj);

        obj.traverse(function (child) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }

      if (
        typeof buildMathHologram === "function" &&
        type
      ) {
        obj = buildMathHologram(type);
      }

      if (!obj) {
        obj = createDefaultHologram();
      }

      if (obj) sc.add(obj);

      setStatus("HOLOGRAM ONLINE");
    } catch (err) {
      console.error("Holograma:", err);
      obj = createDefaultHologram();

      if (obj) sc.add(obj);
    }
  }

  window.showHologram = showHologram;

  function rotateHologram(direction) {
    if (!obj) return;

    if (direction === "left") {
      rotY -= 0.08;
    } else if (direction === "right") {
      rotY += 0.08;
    } else if (direction === "up") {
      rotX -= 0.08;
    } else if (direction === "down") {
      rotX += 0.08;
    } else {
      rotY += 0.08;
    }
  }

  window.rotateHologram = rotateHologram;

  /* =========================================================
     HUD
     ========================================================= */

  function updateHUD() {
    const ai = $("ai");
    const mem = $("mem");
    const cache = $("cache");
    const knowledge = $("knowledge");
    const tasks = $("tasks");
    const agent = $("agent");
    const auto = $("auto");
    const dev = $("dev");

    if (ai) ai.textContent = "ONLINE";

    if (mem) {
      try {
        if (typeof getMemory === "function") {
          mem.textContent = "MEM " + getMemory().length;
        } else {
          mem.textContent = "MEM";
        }
      } catch {
        mem.textContent = "MEM";
      }
    }

    if (cache) cache.textContent = "CACHE";

    if (knowledge) knowledge.textContent = "KNOWLEDGE";

    if (tasks) {
      try {
        if (typeof getTasks === "function") {
          const t = getTasks();
          tasks.textContent = "TASKS " + (Array.isArray(t) ? t.length : "");
        } else {
          tasks.textContent = "TASKS";
        }
      } catch {
        tasks.textContent = "TASKS";
      }
    }

    if (agent) agent.textContent = "AGENT";

    if (auto) auto.textContent = "AUTO";

    if (dev) dev.textContent = isDev ? "DEV ON" : "DEV";
  }

  /* =========================================================
     PERSONALIDAD + CONTEXTO
     ========================================================= */

  function buildPrompt(text) {
    let prompt = String(text || "");

    try {
      if (typeof personalityPrompt === "function") {
        prompt =
          personalityPrompt(prompt) ||
          prompt;
      }
    } catch (e) {
      console.warn("Personality:", e);
    }

    try {
      if (typeof getContextPrompt === "function") {
        const ctx = getContextPrompt();

        if (ctx) {
          prompt =
            ctx +
            "\n\nPREGUNTA DEL USUARIO:\n" +
            prompt;
        }
      }
    } catch (e) {
      console.warn("Context:", e);
    }

    return prompt;
  }

  /* =========================================================
     MOTOR IA NORMAL
     ========================================================= */

  async function askAI(text) {
    const prompt = buildPrompt(text);

    setStatus("THINKING...");

    try {
      if (typeof llmGenerate === "function") {
        const result = await llmGenerate(prompt);

        if (result) {
          return typeof result === "string"
            ? result
            : result.answer ||
              result.response ||
              result.text ||
              String(result);
        }
      }
    } catch (err) {
      console.warn("LLM fallback:", err);
    }

    try {
      if (typeof fAI === "function") {
        const result = await fAI(prompt);

        if (result) {
          return typeof result === "string"
            ? result
            : result.answer ||
              result.response ||
              result.text ||
              String(result);
        }
      }
    } catch (err) {
      console.warn("Gemini fallback:", err);
    }

    throw new Error(
      "Ningún motor de inteligencia artificial está disponible."
    );
  }

  window.askAI = askAI;

  /* =========================================================
     YARVIS COUNCIL
     ========================================================= */

  async function askCouncil(text) {
    if (typeof yarvisCouncil !== "function") {
      throw new Error(
        "YARVIS COUNCIL no está cargado."
      );
    }

    if (
      typeof OPENROUTER_KEY === "undefined" &&
      !window.OPENROUTER_KEY
    ) {
      throw new Error(
        "OPENROUTER_KEY no configurada."
      );
    }

    setStatus("COUNCIL: CONSULTANDO...");

    const result = await yarvisCouncil(
      buildPrompt(text)
    );

    if (!result || !result.answer) {
      throw new Error(
        "YARVIS COUNCIL no devolvió una respuesta."
      );
    }

    console.log("YARVIS COUNCIL:", {
      consultados: result.modelsConsulted,
      respondieron: result.modelsAnswered,
      fallaron: result.modelsFailed,
      juez: result.judge,
      tiempo: result.elapsed
    });

    window.lastCouncilResult = result;

    return result.answer;
  }

  /* =========================================================
     PROCESAMIENTO DE TAGS
     ========================================================= */

  async function processTags(text) {
    if (!text) return;

    try {
      if (
        text.includes("[HOLOGRAM_3D]") &&
        typeof renderDynamicHologram === "function"
      ) {
        try {
          await renderDynamicHologram(text);
        } catch (e) {
          console.warn("Dynamic hologram:", e);
        }
      }

      if (
        text.includes("[FILE_FILE]") &&
        typeof createFile === "function"
      ) {
        try {
          await createFile(text);
        } catch (e) {
          console.warn("Create file:", e);
        }
      }

      if (
        text.includes("[EXEC_JS]")
      ) {
        console.warn(
          "JARVIS: ejecución automática de JS bloqueada por seguridad."
        );
      }
    } catch (err) {
      console.warn("Tags:", err);
    }
  }

  /* =========================================================
     COMANDOS
     ========================================================= */

  async function tryCommand(text) {
    if (typeof routeCommand !== "function") {
      return null;
    }

    try {
      const result = await routeCommand(text);

      if (result === undefined || result === null) {
        return null;
      }

      if (result === false) {
        return null;
      }

      if (typeof result === "string") {
        return {
          handled: true,
          response: result
        };
      }

      if (typeof result === "object") {
        if (result.handled === false) {
          return null;
        }

        if (
          result.handled ||
          result.response ||
          result.answer ||
          result.text
        ) {
          return {
            handled: true,
            response:
              result.response ||
              result.answer ||
              result.text ||
              ""
          };
        }
      }

      return null;
    } catch (err) {
      console.warn(
        "Router command:",
        err
      );

      return null;
    }
  }

  /* =========================================================
     AGENTE
     ========================================================= */

  async function executeAgent(text) {
    if (typeof runAgent !== "function") {
      throw new Error(
        "El agente no está disponible."
      );
    }

    setStatus("AGENT: WORKING...");

    const result = await runAgent(text);

    if (result === undefined || result === null) {
      return "El agente no devolvió ningún resultado.";
    }

    if (typeof result === "string") {
      return result;
    }

    return (
      result.answer ||
      result.response ||
      result.result ||
      result.text ||
      JSON.stringify(result)
    );
  }

  /* =========================================================
     MENSAJE PRINCIPAL
     ========================================================= */

  async function processUserMessage(text) {
    text = String(text || "").trim();

    if (!text || processing) return;

    processing = true;

    try {
      /* -------------------------
         MENSAJE DEL USUARIO
         ------------------------- */

      aM(text, "u");
      addHistory("user", text);

      setStatus("PROCESSING...");

      /* -------------------------
         COMANDOS ESPECIALES
         ------------------------- */

      const command = await tryCommand(text);

      if (command && command.handled) {
        const response = command.response;

        if (response) {
          aM(response, "y");
          addHistory("assistant", response);

          await processTags(response);
        }

        setStatus("J.A.R.V.I.S. ONLINE");
        updateHUD();

        return;
      }

      /* -------------------------
         AGENTE
         ------------------------- */

      const lower = text.toLowerCase();

      if (
        lower.startsWith("/agent ") ||
        lower.startsWith("agente:")
      ) {
        const agentText = text
          .replace(/^\/agent\s*/i, "")
          .replace(/^agente:\s*/i, "");

        const response =
          await executeAgent(agentText);

        aM(response, "y");
        addHistory("assistant", response);

        await processTags(response);

        setStatus("J.A.R.V.I.S. ONLINE");

        return;
      }

      /* -------------------------
         CALCULADORA DIRECTA
         ------------------------- */

      if (
        typeof calculateExpression === "function" &&
        /^(calcula|calcular|cuánto es|cuanto es|calc)\b/i.test(text)
      ) {
        try {
          const expression = text
            .replace(
              /^(calcula|calcular|cuánto es|cuanto es|calc)\s*/i,
              ""
            );

          const result =
            calculateExpression(expression);

          if (
            result !== undefined &&
            result !== null
          ) {
            const response =
              String(result);

            aM(response, "y");
            addHistory(
              "assistant",
              response
            );

            setStatus(
              "J.A.R.V.I.S. ONLINE"
            );

            return;
          }
        } catch (e) {
          console.warn(
            "Calculator:",
            e
          );
        }
      }

      /* -------------------------
         MEMORIA
         ------------------------- */

      if (
        /^(recuerda|memoriza|guarda en memoria)\b/i.test(text) &&
        typeof saveMemory === "function"
      ) {
        const memoryText = text.replace(
          /^(recuerda|memoriza|guarda en memoria)\s*/i,
          ""
        );

        if (memoryText) {
          try {
            saveMemory(memoryText);

            const response =
              "Entendido. Lo guardaré en mi memoria.";

            aM(response, "y");
            addHistory(
              "assistant",
              response
            );

            updateHUD();
            setStatus(
              "J.A.R.V.I.S. ONLINE"
            );

            return;
          } catch (e) {
            console.warn(
              "Memory:",
              e
            );
          }
        }
      }

      /* -------------------------
         HOLOGRAMA
         ------------------------- */

      if (
        lower.includes("holograma") ||
        lower.includes("hologram")
      ) {
        showHologram(text);

        const response =
          "Holograma activado.";

        aM(response, "y");
        addHistory(
          "assistant",
          response
        );

        setStatus(
          "HOLOGRAM ONLINE"
        );

        return;
      }

      /* =====================================================
         IA NORMAL
         ===================================================== */

      let response = null;
      let councilUsed = false;

      /*
       * PRIMERO: YARVIS COUNCIL
       *
       * Si está disponible, consulta varios modelos
       * y utiliza un juez para generar la respuesta final.
       */

      if (
        typeof yarvisCouncil === "function" &&
        (
          typeof OPENROUTER_KEY !== "undefined" ||
          window.OPENROUTER_KEY
        )
      ) {
        try {
          response = await askCouncil(text);
          councilUsed = true;
        } catch (councilError) {
          console.warn(
            "YARVIS COUNCIL falló. Usando motor normal:",
            councilError
          );

          setStatus(
            "COUNCIL FALLBACK..."
          );
        }
      }

      /*
       * FALLBACK:
       * Si Council falla, Yarvis continúa funcionando
       * con Gemini/Groq/LLM normal.
       */

      if (!response) {
        response = await askAI(text);
      }

      if (!response) {
        throw new Error(
          "J.A.R.V.I.S. no generó respuesta."
        );
      }

      /* -------------------------
         RESPUESTA
         ------------------------- */

      await processTags(response);

      aM(response, "y");

      addHistory(
        "assistant",
        response
      );

      /* -------------------------
         MEMORIA DE EXPERIENCIA
         ------------------------- */

      try {
        if (
          councilUsed &&
          typeof saveExperience === "function"
        ) {
          saveExperience({
            input: text,
            output: response,
            source: "council",
            time: Date.now()
          });
        }
      } catch (e) {
        console.warn(
          "Experience memory:",
          e
        );
      }

      /* -------------------------
         VOZ
         ------------------------- */

      try {
        if (
          voiceChatActive &&
          typeof spk === "function"
        ) {
          spk(response);
        }
      } catch (e) {
        console.warn(
          "Speech:",
          e
        );
      }

      setStatus(
        councilUsed
          ? "COUNCIL ONLINE"
          : "J.A.R.V.I.S. ONLINE"
      );

      updateHUD();

    } catch (error) {
      console.error(
        "J.A.R.V.I.S. ERROR:",
        error
      );

      const message =
        error?.message ||
        "Error desconocido.";

      aM(
        "⚠️ J.A.R.V.I.S.: " +
        message,
        
