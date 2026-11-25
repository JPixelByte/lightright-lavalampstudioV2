
    (() => {
      "use strict";

      const canvas = document.getElementById("lampCanvas");
      const ctx = canvas.getContext("2d");
      const settings = {
        wax: "#c044ff",
        liquid: "#243b73",
        shape: "classic",
        count: 8,
        blobScale: 1,
        speed: 1,
        glow: 55,
        lampSize: "medium"
      };

      let width = 0, height = 0, dpr = 1, start = performance.now();
      let animationTime = 0, lastFrameTime = start, canvasOffsetX = 0, canvasOffsetY = 0;
      let lampPlaying = true;
      let audioPlayerTop = 0;
      let blobs = [];
      const lampToggle = document.getElementById("lampToggle");
      const stage = canvas.parentElement;
      const audioPlayer = document.querySelector(".player");
      const audio = document.getElementById("audio");
      audio.volume = 0.9;
      const fileInput = document.getElementById("fileInput");
      const barsWrap = document.getElementById("spectrum");
      const bars = [];
      let audioContext, analyser, source, frequencyData, objectUrl = null;

      for (let i = 0; i < 25; i++) {
        const bar = document.createElement("span");
        bar.className = "bar";
        barsWrap.appendChild(bar);
        bars.push(bar);
      }

      function makeBlobs() {
        blobs = Array.from({ length: settings.count }, (_, i) => ({
          x: .34 + Math.random() * .32,
          y: Math.random(),
          r: .035 + Math.random() * .045,
          phase: Math.random() * Math.PI * 2,
          drift: .04 + Math.random() * .09,
          direction: Math.random() > .5 ? 1 : -1,
          stretch: .8 + Math.random() * .75
        }));
      }

      function resize() {
        const rect = canvas.getBoundingClientRect();
        const stageRect = stage.getBoundingClientRect();
        canvasOffsetX = rect.left - stageRect.left;
        canvasOffsetY = rect.top - stageRect.top;
        audioPlayerTop = audioPlayer.getBoundingClientRect().top - rect.top;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = rect.width; height = rect.height;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      const layoutObserver = new ResizeObserver(resize);
      layoutObserver.observe(canvas);
      layoutObserver.observe(audioPlayer);

      function hexRgb(hex) {
        const n = parseInt(hex.slice(1), 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
      }

      function draw(now) {
        requestAnimationFrame(draw);
        if (!width || !height) return;
        if (lampPlaying) animationTime += Math.max(0, now - lastFrameTime) / 1000;
        lastFrameTime = now;
        const t = animationTime;
        ctx.clearRect(0, 0, width, height);

        const cx = width / 2;




        const isFullscreen = Boolean(document.fullscreenElement);
        const maxLampH = Math.min(height * (isFullscreen ? 0.96 : 1), width * 2.65, 1500);
        const sizeFactor =
          settings.lampSize === "small" ? (isFullscreen ? 0.84 : 0.75) :
            settings.lampSize === "large" ? 1 :
              (isFullscreen ? 0.95 : 0.9);

        const lampH = maxLampH * sizeFactor;
        const lampW = lampH * (settings.shape === "tall" ? .38 : settings.shape === "round" ? .58 : .46);

        const top = (height - lampH) / 2 - (isFullscreen ? 6 : 0);
        const neckH = lampH * .1;
        const bodyTop = top + neckH;
        const bodyBottom = top + lampH * .86;
        const baseY = top + lampH * .91;
        const bodyW = lampW;
        const left = cx - bodyW / 2;
        const toggleSize = Math.max(10, Math.min(24, lampH * .046 * .84));
        lampToggle.style.left = `${canvasOffsetX + cx}px`;
        lampToggle.style.top = `${canvasOffsetY + baseY + 1 + lampH * .023}px`;
        lampToggle.style.width = `${toggleSize}px`;
        lampToggle.style.height = `${toggleSize}px`;
        lampToggle.style.fontSize = `${toggleSize * .5}px`;

        const [wr, wg, wb] = hexRgb(settings.wax);
        const glowAlpha = settings.glow / 100;

        // Soft reflected light beneath the lamp.
        const floor = ctx.createRadialGradient(cx, baseY + 15, 1, cx, baseY + 15, bodyW * 1.4);
        floor.addColorStop(0, `rgba(${wr},${wg},${wb},${.16 * glowAlpha})`);
        floor.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = floor;
        ctx.beginPath(); ctx.ellipse(cx, baseY + 15, bodyW * 1.4, 30, 0, 0, Math.PI * 2); ctx.fill();

        // Cap and neck.
        const metal = ctx.createLinearGradient(left, 0, left + bodyW, 0);
        metal.addColorStop(0, "#343640"); metal.addColorStop(.2, "#9b9da5");
        metal.addColorStop(.48, "#e3e3e6"); metal.addColorStop(.7, "#60626a");
        metal.addColorStop(1, "#25262b");
        ctx.fillStyle = metal;
        roundedRect(ctx, cx - bodyW * .29, top + 2, bodyW * .58, neckH, bodyW * .08);
        ctx.fill();
        roundedRect(ctx, cx - bodyW * .38, top + neckH - 3, bodyW * .76, 13, 6);
        ctx.fill();

        // Vessel silhouette.
        const vessel = new Path2D();
        if (settings.shape === "tapered") {
          const shoulderY = bodyTop + lampH * .32;
          const bottomY = bodyBottom - lampH * .1;
          const bottomHalfWidth = bodyW * .36;

          vessel.moveTo(cx - bodyW * .29, bodyTop);
          vessel.bezierCurveTo(left - bodyW * .02, bodyTop + lampH * .13, left, bodyTop + lampH * .2, left, shoulderY);
          vessel.bezierCurveTo(left, shoulderY + lampH * .2, cx - bodyW * .42, bottomY - lampH * .14, cx - bottomHalfWidth, bottomY);
          vessel.quadraticCurveTo(cx - bottomHalfWidth, bodyBottom, cx, bodyBottom);
          vessel.quadraticCurveTo(cx + bottomHalfWidth, bodyBottom, cx + bottomHalfWidth, bottomY);
          vessel.bezierCurveTo(cx + bodyW * .42, bottomY - lampH * .14, left + bodyW, shoulderY + lampH * .2, left + bodyW, shoulderY);
          vessel.bezierCurveTo(left + bodyW, bodyTop + lampH * .2, cx + bodyW * .29, bodyTop + lampH * .13, cx + bodyW * .29, bodyTop);
          vessel.closePath();
        } else if (settings.shape === "tall") {
          const shoulderY = bodyTop + lampH * .32;
          const bottomY = bodyBottom - lampH * .1;
          const bottomHalfWidth = bodyW * .47;

          vessel.moveTo(cx - bodyW * .27, bodyTop);
          vessel.bezierCurveTo(cx - bodyW * .42, bodyTop + lampH * .12, cx - bodyW * .48, bodyTop + lampH * .2, cx - bodyW * .48, shoulderY);
          vessel.lineTo(cx - bottomHalfWidth, bottomY);
          vessel.quadraticCurveTo(cx - bottomHalfWidth, bodyBottom, cx, bodyBottom);
          vessel.quadraticCurveTo(cx + bottomHalfWidth, bodyBottom, cx + bottomHalfWidth, bottomY);
          vessel.lineTo(cx + bodyW * .48, shoulderY);
          vessel.bezierCurveTo(cx + bodyW * .48, bodyTop + lampH * .2, cx + bodyW * .42, bodyTop + lampH * .12, cx + bodyW * .27, bodyTop);
          vessel.closePath();
        } else {
          vessel.moveTo(cx - bodyW * .29, bodyTop);
          vessel.bezierCurveTo(left - bodyW * .02, bodyTop + lampH * .13, left, bodyTop + lampH * .2, left, bodyTop + lampH * .32);
          vessel.lineTo(left, bodyBottom - lampH * .1);
          vessel.quadraticCurveTo(left, bodyBottom, cx, bodyBottom);
          vessel.quadraticCurveTo(left + bodyW, bodyBottom, left + bodyW, bodyBottom - lampH * .1);
          vessel.lineTo(left + bodyW, bodyTop + lampH * .32);
          vessel.bezierCurveTo(left + bodyW, bodyTop + lampH * .2, cx + bodyW * .29, bodyTop + lampH * .13, cx + bodyW * .29, bodyTop);
          vessel.closePath();
        }

        // Draw support rails first so their ends tuck behind the vessel and base.
        const railX = bodyW * (settings.shape === "tapered" ? .34 : .38);
        const railWidth = Math.max(2.5, bodyW * .03);
        const currentRailEndY = baseY + lampH * .095;
        const railEndY = isFullscreen ? currentRailEndY :
          Math.max(currentRailEndY, Math.min(height, audioPlayerTop - railWidth / 2));
        ctx.strokeStyle = "#55575f";
        ctx.lineWidth = railWidth;
        ctx.lineCap = "butt";
        ctx.beginPath();
        ctx.moveTo(cx - railX, bodyBottom - lampH * .14);
        ctx.lineTo(cx - railX, railEndY);
        ctx.moveTo(cx + railX, bodyBottom - lampH * .14);
        ctx.lineTo(cx + railX, railEndY);
        ctx.stroke();
        ctx.lineCap = "butt";

        ctx.save();
        ctx.shadowColor = `rgba(${wr},${wg},${wb},${.35 * glowAlpha})`;
        ctx.shadowBlur = 25 * glowAlpha;
        const liquid = ctx.createLinearGradient(0, bodyTop, 0, bodyBottom);
        liquid.addColorStop(0, "rgba(255,255,255,.14)");
        liquid.addColorStop(.14, settings.liquid);
        liquid.addColorStop(.82, settings.liquid);
        liquid.addColorStop(1, "rgba(255,255,255,.08)");
        ctx.fillStyle = liquid;
        ctx.fill(vessel);
        ctx.restore();

        ctx.save();
        ctx.clip(vessel);

        // Subtle liquid illumination.
        const [lr, lg, lb] = hexRgb(settings.liquid);
        const liquidGlow = ctx.createRadialGradient(cx, bodyTop + (bodyBottom - bodyTop) * .65, 3, cx, bodyTop + (bodyBottom - bodyTop) * .65, bodyW * .85);
        liquidGlow.addColorStop(0, `rgba(${wr},${wg},${wb},${.12 * glowAlpha})`);
        liquidGlow.addColorStop(1, `rgba(${lr},${lg},${lb},0)`);
        ctx.fillStyle = liquidGlow;
        ctx.fillRect(left, bodyTop, bodyW, bodyBottom - bodyTop);

        for (const b of blobs) {
          const travel = (t * settings.speed * b.drift * b.direction + b.y + 10) % 1;
          const y = bodyBottom - travel * (bodyBottom - bodyTop);
          const x = cx + (b.x - .5) * bodyW * .65 + Math.sin(t * .75 + b.phase) * bodyW * .1;
          const radius = bodyW * b.r * settings.blobScale;
          const pulse = 1 + Math.sin(t * 1.7 + b.phase) * .13;
          const grad = ctx.createRadialGradient(x - radius * .28, y - radius * .3, radius * .08, x, y, radius * 1.3);
          grad.addColorStop(0, "#ffe0ff");
          grad.addColorStop(.22, settings.wax);
          grad.addColorStop(1, `rgba(${wr},${wg},${wb},.78)`);
          ctx.fillStyle = grad;
          ctx.shadowColor = `rgba(${wr},${wg},${wb},${.65 * glowAlpha})`;
          ctx.shadowBlur = 16 * glowAlpha;
          ctx.beginPath();
          ctx.ellipse(x, y, radius * pulse, radius * b.stretch / pulse, Math.sin(t + b.phase) * .15, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        // Glass highlights, clipped to the vessel.
        ctx.save();
        ctx.clip(vessel);

        ctx.strokeStyle = "rgba(255,255,255,.34)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - bodyW * .25, bodyTop);
        ctx.bezierCurveTo(
          left + bodyW * .08, bodyTop + 70,
          left + bodyW * .12, bodyBottom - 18,
          cx - bodyW * .25, bodyBottom - 18
        );
        ctx.stroke();

        ctx.strokeStyle = "rgba(255,255,255,.12)";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(cx + bodyW * .34, bodyTop + 38);
        ctx.lineTo(cx + bodyW * .34, bodyBottom - 18);
        ctx.stroke();

        ctx.strokeStyle = "rgba(255,255,255,.2)";
        ctx.lineWidth = 3;
        const highlightLeftX = cx - bodyW * (
          settings.shape === "tapered" ? .36 :
            settings.shape === "tall" ? .47 :
              settings.shape === "round" ? .58 : .5
        );
        ctx.beginPath();
        ctx.moveTo(highlightLeftX, bodyBottom - 18);
        ctx.lineTo(cx + bodyW * .34, bodyBottom - 18);
        ctx.stroke();

        ctx.restore();

        // Polished base.
        const baseGrad = ctx.createLinearGradient(left, baseY, left + bodyW, baseY);
        baseGrad.addColorStop(0, "#25262c"); baseGrad.addColorStop(.28, "#a2a3aa");
        baseGrad.addColorStop(.5, "#e0e0e3"); baseGrad.addColorStop(.74, "#55575f");
        baseGrad.addColorStop(1, "#202126");
        ctx.fillStyle = baseGrad;
        roundedRect(ctx, cx - bodyW * .42, baseY - 6, bodyW * .84, lampH * .075, 9);
        ctx.fill();
        const baseInsetWidth = bodyW * .58;
        ctx.fillStyle = "#24252a";
        roundedRect(ctx, cx - baseInsetWidth / 2, baseY + 1, baseInsetWidth, lampH * .046, 5);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.24)";
        roundedRect(ctx, cx - bodyW * .26, baseY + 2, bodyW * .52, 2, 2);
        ctx.fill();
      }

      lampToggle.addEventListener("click", () => {
        lampPlaying = !lampPlaying;
        lastFrameTime = performance.now();
        const icon = lampToggle.querySelector("i");
        icon.className = `fa-solid fa-${lampPlaying ? "pause" : "play"}`;
        lampToggle.setAttribute("aria-label", `${lampPlaying ? "Pause" : "Play"} lava lamp`);
        lampToggle.setAttribute("aria-pressed", String(lampPlaying));
        lampToggle.title = `${lampPlaying ? "Pause" : "Play"} lava lamp`;
      });

      function roundedRect(c, x, y, w, h, r) {
        c.beginPath();
        c.roundRect(x, y, w, h, r);
      }

      function setColorVariable(hex) {
        const [r, g, b] = hexRgb(hex);
        document.documentElement.style.setProperty("--accent", hex);
        document.documentElement.style.setProperty("--accent-rgb", `${r}, ${g}, ${b}`);
      }

      function syncControl(id, value, display) {
        const el = document.getElementById(id);
        el.value = value;
        if (display) document.getElementById(display).textContent = value;
      }

      const customMoodsKey = "light-right.custom-moods.v1";
      const customMoodsContainer = document.getElementById("customMoods");

      function isValidCustomMood(mood) {
        return mood && typeof mood.name === "string" && mood.name.trim() &&
          mood.settings && typeof mood.settings === "object" &&
          /^#[0-9a-f]{6}$/i.test(mood.settings.wax) &&
          /^#[0-9a-f]{6}$/i.test(mood.settings.liquid) &&
          Number.isInteger(mood.settings.count) && mood.settings.count >= 3 && mood.settings.count <= 14 &&
          Number.isFinite(mood.settings.blobScale) && mood.settings.blobScale >= .65 && mood.settings.blobScale <= 3 &&
          Number.isFinite(mood.settings.speed) && mood.settings.speed >= .3 && mood.settings.speed <= 2.2 &&
          Number.isInteger(mood.settings.glow) && mood.settings.glow >= 0 && mood.settings.glow <= 100;
      }

      function loadCustomMoods() {
        try {
          const stored = localStorage.getItem(customMoodsKey);
          if (!stored) return [];
          const parsed = JSON.parse(stored);
          if (!Array.isArray(parsed)) throw new TypeError("Saved moods must be an array");
          return parsed.filter(isValidCustomMood).slice(0, 3);
        } catch (error) {
          showToast("Saved custom moods could not be loaded from this browser");
          return [];
        }
      }

      let customMoods = loadCustomMoods();

      function persistCustomMoods(moods) {
        try {
          localStorage.setItem(customMoodsKey, JSON.stringify(moods));
          return true;
        } catch (error) {
          showToast("Custom moods could not be saved in this browser");
          return false;
        }
      }

      function renderCustomMoods() {
        customMoodsContainer.replaceChildren();
        if (!customMoods.length) {
          const emptyMessage = document.createElement("div");
          emptyMessage.className = "custom-moods-empty";
          emptyMessage.textContent = "Your saved moods will appear here";
          customMoodsContainer.appendChild(emptyMessage);
          return;
        }

        customMoods.forEach((mood, index) => {
          const item = document.createElement("div");
          item.className = "custom-mood";

          const applyButton = document.createElement("button");
          applyButton.type = "button";
          applyButton.className = "preset-button custom-mood-button";
          applyButton.textContent = mood.name;
          applyButton.title = mood.name;
          applyButton.addEventListener("click", () => {
            applyMoodSettings(mood.settings);
            showToast(`${mood.name} mood applied`);
          });

          const removeButton = document.createElement("button");
          removeButton.type = "button";
          removeButton.className = "custom-mood-remove";
          removeButton.setAttribute("aria-label", `Remove ${mood.name} mood`);
          removeButton.title = `Remove ${mood.name}`;
          removeButton.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
          removeButton.addEventListener("click", () => {
            const remainingMoods = customMoods.filter((_, moodIndex) => moodIndex !== index);
            if (!persistCustomMoods(remainingMoods)) return;
            customMoods = remainingMoods;
            renderCustomMoods();
            showToast(`${mood.name} mood removed`);
          });

          item.append(applyButton, removeButton);
          customMoodsContainer.appendChild(item);
        });
      }

      function applyMoodSettings(mood) {
        settings.wax = mood.wax;
        settings.liquid = mood.liquid;
        settings.count = mood.count;
        if (mood.blobScale !== undefined) settings.blobScale = mood.blobScale;
        settings.speed = mood.speed;
        settings.glow = mood.glow;

        document.getElementById("waxColor").value = settings.wax;
        document.getElementById("liquidColor").value = settings.liquid;
        syncControl("blobCount", settings.count, "blobCountValue");
        syncControl("blobSize", settings.blobScale, "blobSizeValue");
        syncControl("speed", settings.speed, "speedValue");
        syncControl("glow", settings.glow, "glowValue");
        document.getElementById("blobSizeValue").textContent = `${settings.blobScale.toFixed(1)}×`;
        document.getElementById("speedValue").textContent = `${settings.speed.toFixed(1)}×`;
        document.getElementById("glowValue").textContent = `${settings.glow}%`;
        setColorVariable(settings.wax);
        makeBlobs();
      }

      document.getElementById("saveMood").addEventListener("click", () => {
        if (customMoods.length >= 3) {
          showToast("You can save up to three custom moods");
          return;
        }

        const name = window.prompt("Name this custom mood:");
        if (name === null) return;
        const trimmedName = name.trim();
        if (!trimmedName) {
          showToast("Enter a name to save this mood");
          return;
        }

        const mood = {
          name: trimmedName,
          settings: {
            wax: settings.wax,
            liquid: settings.liquid,
            count: settings.count,
            blobScale: settings.blobScale,
            speed: settings.speed,
            glow: settings.glow
          }
        };
        const updatedMoods = [...customMoods, mood];
        if (!persistCustomMoods(updatedMoods)) return;
        customMoods = updatedMoods;
        renderCustomMoods();
        showToast(`${trimmedName} mood saved`);
      });

      renderCustomMoods();

      document.getElementById("waxColor").addEventListener("input", e => {
        settings.wax = e.target.value; setColorVariable(settings.wax);
      });
      document.getElementById("liquidColor").addEventListener("input", e => settings.liquid = e.target.value);
      document.getElementById("shape").addEventListener("change", e => settings.shape = e.target.value);
      document.getElementById("blobCount").addEventListener("input", e => {
        settings.count = +e.target.value;
        document.getElementById("blobCountValue").textContent = e.target.value;
        makeBlobs();
      });
      document.getElementById("blobSize").addEventListener("input", e => {
        settings.blobScale = +e.target.value;
        document.getElementById("blobSizeValue").textContent = `${(+e.target.value).toFixed(1)}×`;
      });
      document.getElementById("speed").addEventListener("input", e => {
        settings.speed = +e.target.value;
        document.getElementById("speedValue").textContent = `${(+e.target.value).toFixed(1)}×`;
      });
      document.getElementById("glow").addEventListener("input", e => {
        settings.glow = +e.target.value;
        document.getElementById("glowValue").textContent = `${e.target.value}%`;
      });

      document.getElementById("bgColor").addEventListener("input", e => {
        document.documentElement.style.setProperty("--bg", e.target.value);
      });

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Start of: Help Menu
      const helpDialog = document.getElementById("helpDialog");
      const helpCard = helpDialog.querySelector(".help-card");
      const helpButton = document.getElementById("helpButton");
      let helpClosing = false;
      let helpScrollY = 0;
      let bodyStylesBeforeHelp;

      document.body.appendChild(helpDialog);

      function lockPageForHelp() {
        helpScrollY = window.scrollY;
        bodyStylesBeforeHelp = {
          position: document.body.style.position,
          top: document.body.style.top,
          left: document.body.style.left,
          right: document.body.style.right,
          width: document.body.style.width,
          overflow: document.body.style.overflow
        };
        document.body.style.position = "fixed";
        document.body.style.top = `-${helpScrollY}px`;
        document.body.style.left = "0";
        document.body.style.right = "0";
        document.body.style.width = "100%";
        document.body.style.overflow = "hidden";
      }

      function unlockPageAfterHelp() {
        if (!bodyStylesBeforeHelp) return;
        Object.assign(document.body.style, bodyStylesBeforeHelp);
        bodyStylesBeforeHelp = null;
        window.scrollTo(0, helpScrollY);
      }

      function openHelp() {
        helpClosing = false;
        lockPageForHelp();
        helpDialog.hidden = false;
        document.getElementById("closeHelp").focus({ preventScroll: true });

        if (!window.gsap || reducedMotion) return;
        gsap.killTweensOf([helpDialog, helpCard]);
        gsap.fromTo(helpDialog, { autoAlpha: 0 }, {
          autoAlpha: 1,
          duration: 0.22,
          ease: "power1.out"
        });
        gsap.fromTo(helpCard, { y: 22, scale: 0.96, autoAlpha: 0 }, {
          y: 0,
          scale: 1,
          autoAlpha: 1,
          duration: 0.34,
          ease: "power3.out"
        });
      }

      function closeHelp() {
        if (helpDialog.hidden || helpClosing) return;
        helpClosing = true;

        const finishClose = () => {
          helpDialog.hidden = true;
          helpClosing = false;
          unlockPageAfterHelp();
          helpButton.focus({ preventScroll: true });
        };

        if (!window.gsap || reducedMotion) {
          finishClose();
          return;
        }

        gsap.killTweensOf([helpDialog, helpCard]);
        gsap.to(helpDialog, {
          autoAlpha: 0,
          duration: 0.18,
          ease: "power1.in"
        });
        gsap.to(helpCard, {
          y: 12,
          scale: 0.98,
          autoAlpha: 0,
          duration: 0.18,
          ease: "power2.in",
          onComplete: finishClose
        });
      }

      helpButton.addEventListener("click", openHelp);
      document.getElementById("closeHelp").addEventListener("click", closeHelp);

      helpDialog.addEventListener("click", event => {
        if (event.target === helpDialog) closeHelp();
      });

      document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !helpDialog.hidden) closeHelp();
      });


      // End of: Help Menu

      // Start of: Size Buttons
      const sizeButtons = document.querySelectorAll(".size-button");
      const hoverTargets = document.querySelectorAll(
        ".icon-button, .color-control, .preset-button, .random-button, .size-button, .play-button, .load-button, .player-toggle"
      );

      hoverTargets.forEach(target => {
        target.addEventListener("mouseenter", () => {
          if (!window.gsap || reducedMotion) return;

          gsap.to(target, {
            scale: target.classList.contains("size-button") ? 1.06 : 1.04,
            y: target.classList.contains("size-button") ? -2 : -1,
            duration: 0.2,
            ease: "power2.out"
          });

          const icon = target.querySelector("i");
          if (icon && !target.classList.contains("size-button")) {
            gsap.to(icon, {
              rotate: 8,
              duration: 0.22,
              ease: "power2.out"
            });
          }

          for (let i = 0; i < 6; i++) {
            const particle = document.createElement("span");
            particle.className = "hover-particle";
            target.appendChild(particle);
            gsap.to(particle, {
              x: (Math.random() - 0.5) * 34,
              y: (Math.random() - 0.5) * 30,
              scale: 0,
              autoAlpha: 0,
              duration: 0.42 + Math.random() * 0.16,
              ease: "power2.out",
              onComplete: () => particle.remove()
            });
          }
        });

        target.addEventListener("mouseleave", () => {
          if (!window.gsap || reducedMotion) return;
          gsap.to(target, { scale: 1, y: 0, duration: 0.24, ease: "power2.out" });
          const icon = target.querySelector("i");
          if (icon) {
            gsap.to(icon, {
              rotate: 0,
              duration: 0.24,
              ease: "power2.out"
            });
          }
        });
      });

      sizeButtons.forEach(button => {
        button.setAttribute(
          "aria-pressed",
          button.classList.contains("active") ? "true" : "false"
        );

        button.addEventListener("click", () => {
          settings.lampSize = button.dataset.size;

          sizeButtons.forEach(item => {
            const selected = item === button;
            item.classList.toggle("active", selected);
            item.setAttribute("aria-pressed", String(selected));
          });

          if (window.gsap && !reducedMotion) {
            gsap.fromTo(button, { scale: 0.94 }, {
              scale: 1,
              duration: 0.42,
              ease: "back.out(2.4)"
            });
          }
        });
      });


      // End of: Size Buttons

      const fullscreenButton = document.getElementById("fullscreenButton");

      fullscreenButton.addEventListener("click", async () => {
        try {
          if (!document.fullscreenElement) {
            await document.querySelector(".app").requestFullscreen();
          } else {
            await document.exitFullscreen();
          }
        } catch (error) {
          showToast("Fullscreen is not available in this browser");
        }
      });

      document.addEventListener("fullscreenchange", () => {
        const isFullscreen = Boolean(document.fullscreenElement);
        fullscreenButton.innerHTML = isFullscreen
          ? '<i class="fa-solid fa-compress"></i>'
          : '<i class="fa-solid fa-expand"></i>';
        fullscreenButton.setAttribute(
          "aria-label",
          isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
        );
        if (window.gsap && !reducedMotion) {
          gsap.fromTo(fullscreenButton.querySelector("i"), { rotate: -90, scale: 0.7 }, {
            rotate: 0,
            scale: 1,
            duration: 0.32,
            ease: "back.out(1.7)"
          });
        }

        requestAnimationFrame(resize);
      });


      // document.querySelectorAll(".size-button").forEach(button => button.addEventListener("click", () => {
      //   settings.lampSize = button.dataset.size;
      //   document.querySelectorAll(".size-button").forEach(b => b.classList.toggle("active", b === button));
      // }));

      const panel = document.getElementById("settingsPanel");
      function togglePanel() {
        panel.classList.toggle("collapsed");
        if (window.gsap && !reducedMotion) {
          gsap.fromTo(document.querySelector("#toggleSettings i"), { rotate: -45 }, {
            rotate: 0,
            duration: 0.3,
            ease: "back.out(1.8)"
          });
        }
      }
      document.getElementById("toggleSettings").addEventListener("click", togglePanel);
      document.getElementById("closeSettings").addEventListener("click", togglePanel);

      const moods = {
        aurora: { wax: "#63f4d0", liquid: "#24452c", speed: 1.1, glow: 72, count: 9 },
        sunset: { wax: "#ff6b55", liquid: "#522552", speed: .75, glow: 62, count: 7 },
        ocean: { wax: "#68a8ff", liquid: "#102b50", speed: .8, glow: 48, count: 8 }
      };
      document.querySelectorAll("[data-preset]").forEach(button => button.addEventListener("click", () => {
        const m = moods[button.dataset.preset];
        applyMoodSettings(m);
        showToast(`${button.textContent} mood applied`);
      }));

      document.getElementById("randomize").addEventListener("click", () => {
        const colors = ["#b66cff", "#ff6a8b", "#54dfcf", "#ffb65c", "#6ea7ff", "#f66da8", "#b4e85d"];
        settings.wax = colors[Math.floor(Math.random() * colors.length)];
        settings.liquid = colors[Math.floor(Math.random() * colors.length)];
        settings.speed = +(0.5 + Math.random() * 1.5).toFixed(1);
        settings.glow = 30 + Math.floor(Math.random() * 65);
        settings.count = 5 + Math.floor(Math.random() * 8);
        document.getElementById("waxColor").value = settings.wax;
        document.getElementById("liquidColor").value = settings.liquid;
        document.getElementById("speed").value = settings.speed;
        document.getElementById("speedValue").textContent = `${settings.speed.toFixed(1)}×`;
        document.getElementById("glow").value = settings.glow;
        document.getElementById("glowValue").textContent = `${settings.glow}%`;
        document.getElementById("blobCount").value = settings.count;
        document.getElementById("blobCountValue").textContent = settings.count;
        setColorVariable(settings.wax); makeBlobs(); showToast("A new mood has been generated");
      });

      function showToast(message) {
        const toast = document.getElementById("toast");
        toast.textContent = message; toast.classList.add("show");
        clearTimeout(showToast.timer);
        showToast.timer = setTimeout(() => toast.classList.remove("show"), 1800);
      }

      const formatTime = seconds => {
        if (!Number.isFinite(seconds)) return "0:00";
        return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
      };

      document.getElementById("loadButton").addEventListener("click", () => fileInput.click());
      fileInput.addEventListener("change", () => {
        const file = fileInput.files && fileInput.files[0];
        if (!file) return;
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        objectUrl = URL.createObjectURL(file);
        audio.src = objectUrl;
        document.getElementById("trackName").textContent = file.name;
        document.getElementById("trackStatus").textContent = "LOCAL AUDIO · READY TO PLAY";
        audio.load();
        showToast("Track loaded from your device");
      });

      async function setupAnalyser() {
        if (analyser) return;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        audioContext = new AudioCtx();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 128;
        source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        frequencyData = new Uint8Array(analyser.frequencyBinCount);
      }

      const musicPlayer = document.querySelector(".player");
      const togglePlayerButton = document.getElementById("togglePlayer");
      togglePlayerButton.addEventListener("click", () => {
        const collapsed = musicPlayer.classList.toggle("collapsed");
        togglePlayerButton.setAttribute("aria-expanded", String(!collapsed));
        togglePlayerButton.setAttribute("aria-label", `${collapsed ? "Show" : "Hide"} music player`);
        togglePlayerButton.title = `${collapsed ? "Show" : "Hide"} music player`;
        togglePlayerButton.innerHTML = collapsed
          ? '<i class="fa-solid fa-music" aria-hidden="true"></i>'
          : '<i class="fa-solid fa-chevron-down" aria-hidden="true"></i>';

        if (window.gsap && !reducedMotion) {
          gsap.fromTo(togglePlayerButton.querySelector("i"), { rotate: -70, scale: 0.65 }, {
            rotate: 0,
            scale: 1,
            duration: 0.32,
            ease: "back.out(1.8)"
          });
        }
      });

      const playButton = document.getElementById("playButton");
      playButton.addEventListener("click", async () => {
        if (!audio.src) {
          showToast("Choose an MP3 with the folder button first");
          return;
        }
        if (audio.paused) {
          try {
            await setupAnalyser();
            if (audioContext && audioContext.state === "suspended") await audioContext.resume();
            await audio.play();
          } catch (err) {
            showToast("Could not play this file in the browser");
          }
        } else {
          audio.pause();
        }
      });

      audio.addEventListener("play", () => {
        playButton.innerHTML = '<i class="fa-solid fa-pause"></i>';
        playButton.setAttribute("aria-label", "Pause audio");
        document.getElementById("trackStatus").textContent = "NOW PLAYING";
        animatePlaybackButton();
      });
      audio.addEventListener("pause", () => {
        playButton.innerHTML = '<i class="fa-solid fa-play"></i>';
        playButton.setAttribute("aria-label", "Play audio");
        if (audio.src) document.getElementById("trackStatus").textContent = "PAUSED";
        bars.forEach(bar => bar.style.height = "4px");
        animatePlaybackButton();
      });

      function animatePlaybackButton() {
        if (!window.gsap || reducedMotion) return;
        gsap.fromTo(playButton.querySelector("i"), { scale: 0.45, rotate: -80, autoAlpha: 0.3 }, {
          scale: 1,
          rotate: 0,
          autoAlpha: 1,
          duration: 0.32,
          ease: "back.out(1.8)"
        });
        gsap.fromTo(playButton, { boxShadow: "0 0 0 rgba(var(--accent-rgb), 0)" }, {
          boxShadow: "0 0 22px rgba(var(--accent-rgb), .2)",
          duration: 0.35,
          ease: "power2.out"
        });
      }
      audio.addEventListener("loadedmetadata", () => {
        document.getElementById("duration").textContent = formatTime(audio.duration);
      });
      audio.addEventListener("timeupdate", () => {
        document.getElementById("currentTime").textContent = formatTime(audio.currentTime);
        const progress = document.getElementById("progress");
        progress.value = audio.duration ? audio.currentTime / audio.duration * 100 : 0;
      });
      document.getElementById("progress").addEventListener("input", e => {
        if (audio.duration) audio.currentTime = audio.duration * (+e.target.value / 100);
      });
      document.getElementById("volume").addEventListener("input", e => {
        audio.volume = +e.target.value;
      });

      function animateSpectrum() {
        requestAnimationFrame(animateSpectrum);
        if (audio.paused || !analyser || !frequencyData) return;
        analyser.getByteFrequencyData(frequencyData);
        bars.forEach((bar, i) => {
          const index = Math.floor(i * frequencyData.length / bars.length);
          const height = 4 + (frequencyData[index] / 255) * 27;
          bar.style.height = `${height}px`;
        });
      }

      makeBlobs();
      resize();
      requestAnimationFrame(draw);
      requestAnimationFrame(animateSpectrum);

      window.addEventListener("beforeunload", () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      });
    })();
