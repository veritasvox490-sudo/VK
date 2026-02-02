/**
 * Valentine — Single question; Yes → yes.html; No teleports across the screen.
 */

(function () {
  "use strict";

  const cardContainer = document.getElementById("card-container");
  const buttonsWrap = document.querySelector(".buttons-wrap");
  const btnYes = document.getElementById("btn-yes");
  const btnNo = document.getElementById("btn-no");
  const canvas = document.getElementById("effects-canvas");
  const ariaLive = document.getElementById("aria-live");

  if (!cardContainer || !buttonsWrap || !btnYes || !btnNo || !ariaLive) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function announce(msg) {
    ariaLive.textContent = "";
    ariaLive.textContent = msg;
  }

  /** Random position anywhere on screen (with padding) so No teleports across the viewport. */
  function getTeleportPosition() {
    const pad = 80;
    const w = window.innerWidth - pad * 2;
    const h = window.innerHeight - pad * 2;
    return {
      x: pad + Math.random() * Math.max(0, w),
      y: pad + Math.random() * Math.max(0, h),
    };
  }

  function onNoAttempt(event) {
    const pos = getTeleportPosition();
    btnNo.classList.add("teleporting");
    btnNo.style.left = pos.x + "px";
    btnNo.style.top = pos.y + "px";
    btnNo.style.transform = "translate(-50%, -50%)";
    announce("No button moved. Try Yes!");
    if (!prefersReducedMotion && canvas) {
      const rect = cardContainer.getBoundingClientRect();
      const x = (event && event.clientX != null ? event.clientX : rect.left + rect.width / 2) - rect.left;
      const y = (event && event.clientY != null ? event.clientY : rect.top + rect.height / 2) - rect.top;
      jsParticleBurst(x, y);
    }
    setTimeout(function () {
      btnNo.classList.remove("teleporting");
    }, 280);
  }

  function jsParticleBurst(x, y) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = cardContainer.offsetWidth * dpr;
    canvas.height = cardContainer.offsetHeight * dpr;
    ctx.scale(dpr, dpr);
    const cw = cardContainer.offsetWidth;
    const ch = cardContainer.offsetHeight;
    const particles = [];
    for (let i = 0; i < 14; i++) {
      const angle = (Math.PI * 2 * i) / 14 + Math.random();
      const speed = 2 + Math.random() * 4;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        hue: 340 + Math.random() * 25,
      });
    }
    function tick() {
      ctx.clearRect(0, 0, cw, ch);
      let any = false;
      particles.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.life -= 0.025;
        if (p.life > 0) {
          any = true;
          ctx.save();
          ctx.globalAlpha = p.life;
          ctx.fillStyle = "hsl(" + p.hue + ", 65%, 62%)";
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });
      if (any) requestAnimationFrame(tick);
    }
    tick();
  }

  function sizeCanvas() {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = cardContainer.offsetWidth * dpr;
    canvas.height = cardContainer.offsetHeight * dpr;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);
  }
  sizeCanvas();
  window.addEventListener("resize", sizeCanvas);

  btnYes.addEventListener("click", function () {
    window.location.href = "yes.html";
  });

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
  btnNo.addEventListener("mouseenter", onNoAttempt);
  btnNo.addEventListener("touchstart", function (e) {
    if (e.touches.length) onNoAttempt(e.touches[0]);
  }, { passive: true });
})();
