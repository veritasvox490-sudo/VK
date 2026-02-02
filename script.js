/**
 * Will You Be My Valentine? — Primary JS
 * Handles UI, No teleport + Yes growth, celebration, and optional WASM/Java effects
 * with robust JavaScript fallbacks when those modules are not available.
 */

(function () {
  "use strict";

  // --- DOM refs ---
  const cardContainer = document.getElementById("card-container");
  const card = cardContainer?.querySelector(".card");
  const buttonsWrap = document.getElementById("card-container")?.querySelector(".buttons-wrap");
  const btnYes = document.getElementById("btn-yes");
  const btnNo = document.getElementById("btn-no");
  const canvas = document.getElementById("effects-canvas");
  const ariaLive = document.getElementById("aria-live");
  const celebrationOverlay = document.getElementById("celebration-overlay");

  if (!cardContainer || !buttonsWrap || !btnYes || !btnNo || !canvas || !ariaLive || !celebrationOverlay) {
    return;
  }

  // --- State ---
  let yesScale = 1;
  const scaleMultiplier = 1.1;
  let celebrationShown = false;
  let wasmModule = null;
  let javaEffectsAvailable = false;

  // Respect reduced motion for animations
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** Size the effects canvas to match the card container (for particle/confetti layer). */
  function sizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = cardContainer.offsetWidth * dpr;
    canvas.height = cardContainer.offsetHeight * dpr;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);
  }

  sizeCanvas();
  window.addEventListener("resize", sizeCanvas);

  /**
   * Announce to screen readers (aria-live).
   */
  function announce(message) {
    ariaLive.textContent = "";
    ariaLive.textContent = message;
  }

  /**
   * Get a random position inside the card/buttons area so "No" stays visible.
   */
  function getRandomPosition() {
    const rect = buttonsWrap.getBoundingClientRect();
    const padding = 60;
    const minX = padding;
    const maxX = rect.width - padding;
    const minY = padding;
    const maxY = rect.height - padding;
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    return { x, y };
  }

  /**
   * If WASM or Java module exposes computeTeleportPosition(width, height, seed), use it.
   * WASM returns { x, y }; Java may return [x, y]. Otherwise use JS random.
   */
  function computeTeleportPosition(width, height, seed) {
    if (wasmModule && typeof wasmModule.computeTeleportPosition === "function") {
      try {
        const result = wasmModule.computeTeleportPosition(width, height, seed);
        if (result && typeof result.x === "number" && typeof result.y === "number") {
          return { x: result.x, y: result.y };
        }
      } catch (e) {
        /* fallback to JS */
      }
    }
    if (typeof window.ValentineEffects !== "undefined" && typeof window.ValentineEffects.computeTeleportPosition === "function") {
      try {
        const result = window.ValentineEffects.computeTeleportPosition(width, height, seed);
        if (Array.isArray(result) && result.length >= 2) {
          return { x: result[0], y: result[1] };
        }
      } catch (e) {
        /* fallback to JS */
      }
    }
    const padding = 60;
    return {
      x: padding + Math.random() * (width - 2 * padding),
      y: padding + Math.random() * (height - 2 * padding),
    };
  }

  /**
   * Trigger special effect: WASM particle burst, Java effect, or JS fallback (jitter + particles).
   */
  function triggerSpecialEffect(clientX, clientY) {
    const rect = cardContainer.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (wasmModule && typeof wasmModule.triggerParticleBurst === "function") {
      try {
        wasmModule.triggerParticleBurst(x, y);
        return;
      } catch (e) {
        /* fallback */
      }
    }

    if (typeof window.ValentineEffects !== "undefined" && typeof window.ValentineEffects.triggerParticleBurst === "function") {
      try {
        window.ValentineEffects.triggerParticleBurst(x, y);
        return;
      } catch (e) {
        /* fallback */
      }
    }

    // JS fallback: draw a small burst on canvas
    jsParticleBurst(x, y);
  }

  /**
   * Simple particle burst on canvas (JS fallback).
   */
  function jsParticleBurst(x, y) {
    if (prefersReducedMotion) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = cardContainer.offsetWidth * dpr;
    canvas.height = cardContainer.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const count = 12;
    const particles = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random();
      const speed = 2 + Math.random() * 4;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        hue: 340 + Math.random() * 20,
      });
    }

    const cw = cardContainer.offsetWidth;
    const ch = cardContainer.offsetHeight;
    function tick() {
      ctx.clearRect(0, 0, cw, ch);
      let anyAlive = false;
      particles.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.life -= 0.03;
        if (p.life > 0) {
          anyAlive = true;
          ctx.save();
          ctx.globalAlpha = p.life;
          ctx.fillStyle = "hsl(" + p.hue + ", 70%, 60%)";
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });
      if (anyAlive) requestAnimationFrame(tick);
    }
    tick();
  }

  /**
   * Run when user interacts with "No": grow Yes, teleport No, optional effect.
   */
  function onNoAttempt(event) {
    if (celebrationShown) return;

    // Grow Yes button (scale *= 1.10)
    yesScale *= scaleMultiplier;
    btnYes.style.transform = "scale(" + yesScale + ")";

    const rect = buttonsWrap.getBoundingClientRect();
    const seed = Date.now();
    const pos = computeTeleportPosition(rect.width, rect.height, seed);

    // Disable pointer events on No while "teleporting"
    btnNo.classList.add("teleporting");
    btnNo.style.left = pos.x + "px";
    btnNo.style.top = pos.y + "px";
    btnNo.style.transform = "translate(-50%, -50%)";

    announce("No button moved to a new spot. Try clicking Yes!");

    // Optional: special effect (WASM / Java / JS)
    const clientX = event && (event.clientX != null) ? event.clientX : rect.left + rect.width / 2;
    const clientY = event && (event.clientY != null) ? event.clientY : rect.top + rect.height / 2;
    triggerSpecialEffect(clientX, clientY);

    setTimeout(function () {
      btnNo.classList.remove("teleporting");
    }, 300);
  }

  /**
   * Show celebration: modal, confetti, optional sound.
   */
  function showCelebration() {
    if (celebrationShown) return;
    celebrationShown = true;

    celebrationOverlay.setAttribute("aria-hidden", "false");
    celebrationOverlay.classList.add("visible");

    announce("You said Yes! Thank you!");

    if (!prefersReducedMotion) {
      jsConfetti();
    }

    // Optional: subtle celebratory sound (no external lib; beep or silence)
    if (window.AudioContext || window.webkitAudioContext) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 523;
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      } catch (e) {
        /* ignore */
      }
    }
  }

  /**
   * Simple confetti on canvas (JS, no external lib).
   */
  function jsConfetti() {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = cardContainer.offsetWidth * dpr;
    canvas.height = cardContainer.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const w = cardContainer.offsetWidth;
    const h = cardContainer.offsetHeight;
    const pieces = [];
    const colors = ["#e06080", "#ff8090", "#fff", "#ffd700", "#ff69b4"];

    for (let i = 0; i < 80; i++) {
      pieces.push({
        x: w / 2,
        y: h / 2,
        vx: (Math.random() - 0.5) * 10,
        vy: -5 - Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 4,
        rotation: Math.random() * 360,
        spin: (Math.random() - 0.5) * 20,
      });
    }

    function tick() {
      ctx.clearRect(0, 0, w, h);
      let anyAlive = false;
      pieces.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25;
        p.rotation += p.spin;
        if (p.y < h + 20) {
          anyAlive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });
      if (anyAlive) requestAnimationFrame(tick);
    }
    tick();
  }

  // --- Event listeners ---

  btnYes.addEventListener("click", function () {
    showCelebration();
  });

  // No: click, keydown (Enter/Space), and hover — all trigger teleport + grow
  btnNo.addEventListener("click", function (e) {
    e.preventDefault();
    onNoAttempt(e);
  });

  btnNo.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onNoAttempt(e);
    }
  });

  btnNo.addEventListener("mouseenter", function (e) {
    onNoAttempt(e);
  });

  btnNo.addEventListener("touchstart", function (e) {
    if (e.touches.length) onNoAttempt(e.touches[0]);
  }, { passive: true });

  // --- Optional: load WASM module (Emscripten-style) ---
  (function tryLoadWasm() {
    // If the page includes a script that defines window.EffectsWasm or similar, use it.
    // Emscripten typically creates a Module that loads the .wasm file.
    if (window.EffectsWasm) {
      wasmModule = window.EffectsWasm;
      return;
    }
    // Try dynamic import of wasm glue (when built and uncommented in HTML)
    var script = document.querySelector('script[src*="wasm_cpp"]');
    if (!script) return;
    // Glue already loaded by script tag; check for global
    if (window.EffectsWasm) wasmModule = window.EffectsWasm;
  })();

  // Java effects: global ValentineEffects is set by transpiled script when included
  if (typeof window.ValentineEffects !== "undefined") {
    javaEffectsAvailable = true;
  }
})();
