(() => {
  const stage = document.querySelector(".stage");
  const referenceCanvas = document.getElementById("lampCanvas");
  const canvas = document.getElementById("paperPhysicsCanvas");
  const powerToggle = document.getElementById("lampPowerToggle");
  const playToggle = document.getElementById("lampToggle");
  const note = document.querySelector(".physics-mode-note");
  let paperScope;
  let active = false;
  let clock = 0;
  let frameAccumulator = 0;
  let resizeObserver;
  const sizeFactors = { small: 0.75, medium: 0.9, large: 1 };
  let canvasLeft = 0;
  let canvasTop = 0;

  function readControls() {
    const activeSize = document.querySelector(".size-button.active")?.dataset.size || "medium";
    return {
      shape: document.getElementById("shape").value,
      wax: document.getElementById("waxColor").value,
      liquid: document.getElementById("liquidColor").value,
      count: Number(document.getElementById("blobCount").value),
      blobScale: Number(document.getElementById("blobSize").value),
      speed: Number(document.getElementById("speed").value),
      glow: Number(document.getElementById("glow").value) / 100,
      physicsStrength: Number(document.getElementById("physicsStrength").value) / 100,
      size: sizeFactors[activeSize],
    };
  }

  function positionCanvas() {
    const stageBounds = stage.getBoundingClientRect();
    const lampBounds = referenceCanvas.getBoundingClientRect();

    canvasLeft = lampBounds.left - stageBounds.left;
    canvasTop = lampBounds.top - stageBounds.top;
    canvas.style.left = `${canvasLeft}px`;
    canvas.style.top = `${canvasTop}px`;
    canvas.style.width = `${lampBounds.width}px`;
    canvas.style.height = `${lampBounds.height}px`;

    if (paperScope && lampBounds.width && lampBounds.height) {
      paperScope.view.viewSize = new paperScope.Size(lampBounds.width, lampBounds.height);
      renderFrame(0);
    }
  }

  function positionBaseControls(centerX, baseY, lampHeight, lampWidth) {
    const powerSize = Math.max(24, Math.min(44, lampWidth * 0.12));
    const playSize = Math.max(20, Math.min(38, lampWidth * 0.1));
    const spacing = (powerSize + playSize) / 2 + powerSize * 0.1;
    const centerY = canvasTop + baseY + lampHeight * 0.035;
    const isPowered = powerToggle.getAttribute("aria-pressed") === "true";
    const powerCenterX = canvasLeft + centerX - (isPowered ? spacing / 2 : 0);

    stage.style.setProperty("--paper-power-left", `${powerCenterX}px`);
    stage.style.setProperty("--paper-play-left", `${canvasLeft + centerX + spacing / 2}px`);
    stage.style.setProperty("--paper-controls-top", `${centerY}px`);
    stage.style.setProperty("--paper-power-size", `${powerSize}px`);
    stage.style.setProperty("--paper-play-size", `${playSize}px`);
    stage.style.setProperty("--paper-power-font-size", `${powerSize * 0.42}px`);
    stage.style.setProperty("--paper-play-font-size", `${playSize * 0.5}px`);
  }

  function setup() {
    if (!window.paper || !window.paper.PaperScope) {
      throw new Error("Paper.js is unavailable.");
    }

    canvas.hidden = false;
    positionCanvas();
    const bounds = referenceCanvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(bounds.width));
    canvas.height = Math.max(1, Math.round(bounds.height));

    paperScope = new window.paper.PaperScope();
    paperScope.setup(canvas);
    paperScope.view.viewSize = new paperScope.Size(bounds.width, bounds.height);
    paperScope.view.onFrame = event => renderFrame(event.delta);
    paperScope.view.pause();

    resizeObserver = new ResizeObserver(positionCanvas);
    resizeObserver.observe(referenceCanvas);
    resizeObserver.observe(stage);
    window.addEventListener("resize", positionCanvas);
  }

  function renderFrame(delta) {
    if (!paperScope || !active) return;
    frameAccumulator += delta;
    if (frameAccumulator < 1 / 30) return;
    const controls = readControls();
    const isPowered = powerToggle.getAttribute("aria-pressed") === "true";
    const isPlaying = playToggle.getAttribute("aria-pressed") === "true";
    if (isPowered && isPlaying) {
      clock += Math.min(frameAccumulator, 0.08) * controls.speed;
    }
    frameAccumulator = 0;

    const { Path, Point, Color, Group, project, view } = paperScope;
    const width = view.size.width;
    const height = view.size.height;
    if (!width || !height) return;

    project.activeLayer.removeChildren();

    const cx = width / 2;
    const fullscreen = Boolean(document.fullscreenElement);
    const maxLampHeight = Math.min(height * (fullscreen ? 0.96 : 1), width * 2.65, 1500);
    const selectedSize = document.querySelector(".size-button.active")?.dataset.size || "medium";
    const fullscreenSizeFactors = { small: 0.84, medium: 0.95, large: 1 };
    const sizeFactor = fullscreen ? fullscreenSizeFactors[selectedSize] : controls.size;
    const lampHeight = maxLampHeight * sizeFactor;
    const widthFactor = controls.shape === "tall" ? 0.38 : controls.shape === "round" ? 0.58 : 0.46;
    const lampWidth = lampHeight * widthFactor;
    const top = (height - lampHeight) / 2 - (fullscreen ? 6 : 0);
    const bodyTop = top + lampHeight * 0.1;
    const bodyBottom = top + lampHeight * 0.86;
    const baseY = top + lampHeight * 0.91;
    const left = cx - lampWidth / 2;
    positionBaseControls(cx, baseY, lampHeight, lampWidth);

    const waxColor = new Color(controls.wax);
    if (controls.glow > 0) {
      const ambientGlow = new Path.Ellipse({
        center: new Point(cx, bodyTop + (bodyBottom - bodyTop) / 2),
        size: new paperScope.Size(lampWidth * 1.5, (bodyBottom - bodyTop) * 1.15),
      });
      ambientGlow.fillColor = new Color(waxColor.red, waxColor.green, waxColor.blue, controls.glow * 0.12);
      ambientGlow.shadowColor = new Color(waxColor.red, waxColor.green, waxColor.blue, controls.glow);
      ambientGlow.shadowBlur = lampWidth * 0.5 * controls.glow;
    }

    const railColor = new Color(0.33, 0.34, 0.38, 0.9);
    const railOffset = controls.shape === "tapered" ? 0.34 : 0.38;
    [-railOffset, railOffset].forEach(offset => {
      const rail = new Path.Line(
        new Point(cx + lampWidth * offset, bodyBottom),
        new Point(cx + lampWidth * offset, baseY + lampHeight * 0.09),
      );
      rail.strokeColor = railColor;
      rail.strokeWidth = Math.max(2.5, lampWidth * 0.03);
    });

    const vessel = new Path();
    if (controls.shape === "tapered") {
      const shoulderY = bodyTop + lampHeight * 0.32;
      const bottomY = bodyBottom - lampHeight * 0.1;
      const bottomHalfWidth = lampWidth * 0.36;
      vessel.add(new Point(cx - lampWidth * 0.29, bodyTop));
      vessel.cubicCurveTo(
        new Point(left - lampWidth * 0.02, bodyTop + lampHeight * 0.13),
        new Point(left, bodyTop + lampHeight * 0.2),
        new Point(left, shoulderY),
      );
      vessel.cubicCurveTo(
        new Point(left, shoulderY + lampHeight * 0.2),
        new Point(cx - lampWidth * 0.42, bottomY - lampHeight * 0.14),
        new Point(cx - bottomHalfWidth, bottomY),
      );
      vessel.quadraticCurveTo(new Point(cx - bottomHalfWidth, bodyBottom), new Point(cx, bodyBottom));
      vessel.quadraticCurveTo(new Point(cx + bottomHalfWidth, bodyBottom), new Point(cx + bottomHalfWidth, bottomY));
      vessel.cubicCurveTo(
        new Point(cx + lampWidth * 0.42, bottomY - lampHeight * 0.14),
        new Point(left + lampWidth, shoulderY + lampHeight * 0.2),
        new Point(left + lampWidth, shoulderY),
      );
      vessel.cubicCurveTo(
        new Point(left + lampWidth, bodyTop + lampHeight * 0.2),
        new Point(cx + lampWidth * 0.29, bodyTop + lampHeight * 0.13),
        new Point(cx + lampWidth * 0.29, bodyTop),
      );
    } else {
      const shoulderY = bodyTop + lampHeight * 0.32;
      const bottomY = bodyBottom - lampHeight * 0.1;
      const halfBodyWidth = controls.shape === "tall" ? 0.48 : 0.5;
      const topHalfWidth = controls.shape === "tall" ? 0.27 : 0.29;
      vessel.add(new Point(cx - lampWidth * topHalfWidth, bodyTop));
      vessel.cubicCurveTo(
        new Point(cx - lampWidth * (halfBodyWidth - 0.06), bodyTop + lampHeight * 0.12),
        new Point(cx - lampWidth * halfBodyWidth, bodyTop + lampHeight * 0.2),
        new Point(cx - lampWidth * halfBodyWidth, shoulderY),
      );
      vessel.lineTo(new Point(cx - lampWidth * halfBodyWidth, bottomY));
      vessel.quadraticCurveTo(new Point(cx - lampWidth * halfBodyWidth, bodyBottom), new Point(cx, bodyBottom));
      vessel.quadraticCurveTo(new Point(cx + lampWidth * halfBodyWidth, bodyBottom), new Point(cx + lampWidth * halfBodyWidth, bottomY));
      vessel.lineTo(new Point(cx + lampWidth * halfBodyWidth, shoulderY));
      vessel.cubicCurveTo(
        new Point(cx + lampWidth * halfBodyWidth, bodyTop + lampHeight * 0.2),
        new Point(cx + lampWidth * (halfBodyWidth - 0.06), bodyTop + lampHeight * 0.12),
        new Point(cx + lampWidth * topHalfWidth, bodyTop),
      );
    }
    vessel.closed = true;
    const liquidColor = new Color(controls.liquid);
    liquidColor.alpha = 0.78;
    vessel.fillColor = liquidColor;

    const cap = new Path.Rectangle(new paperScope.Rectangle(
      cx - lampWidth * 0.29,
      top + 2,
      lampWidth * 0.58,
      lampHeight * 0.1,
    ));
    cap.fillColor = new Color(0.62, 0.64, 0.68, 0.95);
    const capStroke = document.documentElement.dataset.theme === "dark"
      ? new Color(1, 1, 1, 0.9)
      : new Color(0, 0, 0, 0.9);
    cap.strokeColor = capStroke;
    cap.strokeWidth = Math.max(1, lampWidth * 0.008);

    const phases = Array.from({ length: controls.count }, (_, index) =>
      (index / controls.count + (index % 2) * 0.055) % 1,
    );
    const blobs = phases.map((phase, index) => {
      const progress = (clock * 0.085 + phase) % 1;
      const fadeProgress = Math.max(0, Math.min(1, Math.min(progress, 1 - progress) / 0.015));
      const opacity = fadeProgress * fadeProgress * (3 - 2 * fadeProgress);
      const radius = lampWidth * (0.045 + (index % 3) * 0.007) * controls.blobScale;
      const startY = bodyBottom - lampHeight * 0.08;
      const endY = bodyTop + radius * 0.12;
      return {
        center: new Point(
          cx + Math.sin(clock * 0.55 + index * 1.7) * lampWidth * 0.13,
          startY - progress * (startY - endY),
        ),
        radius,
        opacity,
      };
    });

    const waxGroup = new Group();
    const clipMask = vessel.clone();
    clipMask.clipMask = true;
    waxGroup.addChild(clipMask);
    waxGroup.clipped = true;
    for (let i = 0; i < blobs.length; i++) {
      for (let j = i + 1; j < blobs.length; j++) {
        const totalRadius = blobs[i].radius + blobs[j].radius;
        const connectionRange = totalRadius * (0.95 + controls.physicsStrength * 3.05);
        const contourTension = 0.12 + controls.physicsStrength * 0.76;
        const path = createMetaballPath(
          blobs[i],
          blobs[j],
          contourTension,
          1.3 + controls.physicsStrength * 2.2,
          connectionRange,
          paperScope,
        );
        if (path) {
          path.fillColor = waxColor;
          path.strokeColor = waxColor;
          path.strokeWidth = 0.5;
          path.opacity = Math.min(blobs[i].opacity, blobs[j].opacity);
          waxGroup.addChild(path);
        }
      }

      const blob = new Path.Circle({
        center: blobs[i].center,
        radius: blobs[i].radius,
        fillColor: waxColor,
      });
      blob.opacity = blobs[i].opacity;
      blob.shadowColor = new Color(waxColor.red, waxColor.green, waxColor.blue, controls.glow * 0.8);
      blob.shadowBlur = lampWidth * 0.035 * controls.glow;
      waxGroup.addChild(blob);
    }

    const glassOutline = vessel.clone();
    glassOutline.fillColor = null;
    glassOutline.strokeColor = new Color(0.78, 0.86, 1, 0.64);
    glassOutline.strokeWidth = Math.max(1.5, lampWidth * 0.012);

    const base = new Path.Rectangle(new paperScope.Rectangle(
      cx - lampWidth * 0.34,
      baseY,
      lampWidth * 0.68,
      lampHeight * 0.07,
    ));
    base.fillColor = new Color(0.32, 0.33, 0.37, 0.95);
  }

  function createMetaballPath(first, second, contourTension, handleRate, maxDistance, scope) {
    const { Point, Path } = scope;
    const center1 = first.center;
    const center2 = second.center;
    const radius1 = first.radius;
    const radius2 = second.radius;
    const difference = center2.subtract(center1);
    const distance = difference.length;
    if (!distance || distance > maxDistance || distance <= Math.abs(radius1 - radius2)) return null;

    const clamp = value => Math.max(-1, Math.min(1, value));
    let u1 = 0;
    let u2 = 0;
    if (distance < radius1 + radius2) {
      u1 = Math.acos(clamp((radius1 ** 2 + distance ** 2 - radius2 ** 2) / (2 * radius1 * distance)));
      u2 = Math.acos(clamp((radius2 ** 2 + distance ** 2 - radius1 ** 2) / (2 * radius2 * distance)));
    }

    const halfPi = Math.PI / 2;
    const angle = difference.angleInRadians;
    const angle2 = Math.acos(clamp((radius1 - radius2) / distance));
    const angle1a = angle + u1 + (angle2 - u1) * contourTension;
    const angle1b = angle - u1 - (angle2 - u1) * contourTension;
    const angle2a = angle + Math.PI - u2 - (Math.PI - u2 - angle2) * contourTension;
    const angle2b = angle - Math.PI + u2 + (Math.PI - u2 - angle2) * contourTension;
    const vector = (radians, length) => new Point({ angle: radians * 180 / Math.PI, length });
    const p1a = center1.add(vector(angle1a, radius1));
    const p1b = center1.add(vector(angle1b, radius1));
    const p2a = center2.add(vector(angle2a, radius2));
    const p2b = center2.add(vector(angle2b, radius2));
    const totalRadius = radius1 + radius2;
    let handleScale = Math.min(0.5 * handleRate, p1a.subtract(p2a).length / totalRadius);
    handleScale *= Math.min(1, (distance * 2) / totalRadius);

    const path = new Path({
      segments: [p1a, p2a, p2b, p1b],
      closed: true,
    });
    path.segments[0].handleOut = vector(angle1a - halfPi, radius1 * handleScale);
    path.segments[1].handleIn = vector(angle2a + halfPi, radius2 * handleScale);
    path.segments[2].handleOut = vector(angle2b - halfPi, radius2 * handleScale);
    path.segments[3].handleIn = vector(angle1b + halfPi, radius1 * handleScale);
    return path;
  }

  window.addEventListener("physicsmodechange", event => {
    if (!event.detail.active) {
      active = false;
      if (paperScope) {
        paperScope.view.pause();
        paperScope.project.activeLayer.removeChildren();
      }
      canvas.hidden = true;
      return;
    }

    try {
      canvas.hidden = false;
      if (!paperScope) setup();
      positionCanvas();
      active = true;
      paperScope.view.play();
    } catch (error) {
      active = false;
      canvas.hidden = true;
      event.preventDefault();
      note.textContent = "Simulation could not start; classic lamp remains active";
      console.error("Paper.js lava simulation could not start:", error);
    }
  });
})();
