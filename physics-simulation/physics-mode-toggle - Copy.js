const physicsModeSwitch = document.querySelector(".physics-mode-switch");

if (physicsModeSwitch) {
  physicsModeSwitch.addEventListener("click", () => {
    const isPhysicsMode = physicsModeSwitch.getAttribute("aria-checked") === "true";
    const enteringPhysicsMode = !isPhysicsMode;
    const note = document.querySelector(".physics-mode-note");
    const app = document.querySelector(".app");

    if (enteringPhysicsMode && !window.paper) {
      note.textContent = "Paper.js did not load; classic lamp remains active";
      console.error("Paper.js failed to load; renderer mode was not changed.");
      return;
    }

    const modeEvent = new CustomEvent("physicsmodechange", {
      cancelable: true,
      detail: { active: enteringPhysicsMode },
    });
    if (!window.dispatchEvent(modeEvent)) return;

    physicsModeSwitch.setAttribute("aria-checked", String(enteringPhysicsMode));
    app.dataset.renderer = enteringPhysicsMode ? "paper" : "classic";
    if (!enteringPhysicsMode) {
      document.getElementById("lampCanvas").style.removeProperty("visibility");
      document.getElementById("lampPowerToggle").style.removeProperty("visibility");
      document.getElementById("lampToggle").style.removeProperty("visibility");
    }
    physicsModeSwitch.setAttribute(
      "aria-label",
      `Switch to ${enteringPhysicsMode ? "classic lava lamp" : "Physics Simulation"} mode`,
    );
    physicsModeSwitch.title = enteringPhysicsMode
      ? "Switch to classic lava lamp"
      : "Switch to Paper.js simulation";
    note.textContent = enteringPhysicsMode
      ? "Paper.js simulation · GUI controls active"
      : "Classic lamp active · its controls are unchanged";
  });
}
