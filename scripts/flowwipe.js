//timeline for the first morph

gsap.registerPlugin(MorphSVGPlugin);

const svgElements = document.querySelectorAll(".overlay, .overlay--2");
const water = document.querySelectorAll("#water-wave");

const tl1 = gsap
  .timeline({
    defaults: {
      ease: "none",
    },
  })

  .to("#start1", { morphSVG: "#middle", duration: 0.8 })
  .to("#start1", { morphSVG: "#end", duration: 0.5 });

// timeline for white shape.
const tl2 = gsap
  .timeline({
    defaults: {
      ease: "none",
    },
  })

  .to("#start2", { morphSVG: "#middle", duration: 0.6 })
  .to("#start2", { morphSVG: "#end", duration: 0.4, ease: "power1" });

const main = gsap
  .timeline()
  // Reset overlays to visible on each play
  .call(() => {
    svgElements.forEach((el) => (el.style.display = "block"));
  })
  .add(tl1)
  .add(tl2, 1.3)
  .set(water, { autoAlpha: 1 })
  .to(water, { autoAlpha: 0, duration: 0.5 })
  // Hide overlays (same as your working setTimeout)
  .call(() => {
    svgElements.forEach((el) => (el.style.display = "none"));
  });

// https://www.creativecodingclub.com

const devTools = window.GSDevTools
  ? GSDevTools.create({ animation: main })
  : null;

if (devTools) {
  gsap.to(".gs-dev-tools", { y: 2 });

  const devToolsPanel = document.querySelector(".gs-dev-tools");
  const appRoot = document.querySelector(".app");
  document.addEventListener("fullscreenchange", () => {
    if (!devToolsPanel || !appRoot) return;
    if (document.fullscreenElement === appRoot) {
      appRoot.appendChild(devToolsPanel);
    } else {
      document.body.appendChild(devToolsPanel);
    }
  });
}

const replayWaveButton = document.getElementById("replayWaveButton");
function replayWave() {
  svgElements.forEach((element) => {
    element.style.display = "block";
  });
  gsap.set(water, { autoAlpha: 1 });
  main.pause(0);
  main.play();
}

if (replayWaveButton) {
  replayWaveButton.addEventListener("click", replayWave);
}
document.addEventListener("waterwavereplay", replayWave);

document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() !== "h" || event.repeat || !devTools) return;
  if (event.target instanceof Element &&
      event.target.closest("input, textarea, select, button, a, [contenteditable='true'], [role='slider']")) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  document.body.classList.toggle("gs-dev-tools-hidden");
}, true);

const refreshButton = document.getElementById("refreshPageButton");
if (refreshButton) {
  refreshButton.addEventListener("click", () => window.location.reload());
}

document.addEventListener("keydown", (event) => {
  if (event.code !== "Space" || event.repeat) return;
  const target = event.target instanceof Element ? event.target : null;
  const isPowerButtonFocused = target?.closest("#lampPowerToggle");
  if (target?.closest("input, textarea, select, a, [contenteditable='true'], [role='slider']")) return;
  if (target?.closest("button") && !isPowerButtonFocused) return;

  event.preventDefault();
  if (main.progress() >= 1) {
    replayWave();
  } else if (main.paused()) {
    main.play();
  } else {
    main.pause();
  }
});
