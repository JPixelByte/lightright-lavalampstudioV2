// console.clear();

let wrapps = document.querySelectorAll(".wrapper");
let icons = document.querySelectorAll(".toolbarItem");
let dock = document.querySelector(".toolbar");
let firstIcon = icons[0];
const dockSoundUrl = new URL("../soundeffects/echosmall.mp3", document.currentScript.src);
const dockSoundVoices = Array.from({ length: 3 }, () => {
  const audio = new Audio(dockSoundUrl);
  audio.preload = "auto";
  audio.volume = 0.35;
  return audio;
});
let nextDockSoundVoice = 0;
let echoPlaybackWarningShown = false;

icons.forEach((icon) => {
  icon.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "touch") return;
    playSound();
  });
});

function playSound() {
  const audio = dockSoundVoices[nextDockSoundVoice];
  nextDockSoundVoice = (nextDockSoundVoice + 1) % dockSoundVoices.length;
  audio.pause();
  audio.currentTime = 0;
  audio.play().catch((error) => {
    if (echoPlaybackWarningShown) return;
    echoPlaybackWarningShown = true;
    console.warn("Dock hover sound could not play:", error);
  });
}

let min = 48; // 40 + margin
let max = 120;
let bound = min * Math.PI;

gsap.set(icons, { transformOrigin: "50% 120%" });
gsap.set(dock, { position: "relative" });

const compactDock = window.matchMedia("(max-width: 700px)");
const tinyDock = window.matchMedia("(max-width: 528px)");
function sizeDock() {
  min = tinyDock.matches ? 24 : compactDock.matches ? 36 : 48;
  max = tinyDock.matches ? 26 : compactDock.matches ? 54 : 120;
  bound = min * Math.PI;
  gsap.set(icons, {
    height: tinyDock.matches ? 24 : compactDock.matches ? 32 : 40,
  });
  gsap.set(dock, {
    height: tinyDock.matches ? 38 : compactDock.matches ? 48 : 60,
  });
}
sizeDock();
const listenForDockResize = (query) =>
  query.addEventListener
    ? query.addEventListener("change", sizeDock)
    : query.addListener(sizeDock);
listenForDockResize(compactDock);
listenForDockResize(tinyDock);

dock.addEventListener("mousemove", (event) => {
  let offset =
    dock.getBoundingClientRect().left +
    dock.clientLeft +
    firstIcon.offsetLeft -
    dock.scrollLeft;
  updateIcons(event.clientX - offset);
});

dock.addEventListener("mouseleave", (event) => {
  gsap.to(icons, {
    duration: 0.3,
    scale: 1,
    x: 0,
  });
});

function updateIcons(pointer) {
  for (let i = 0; i < icons.length; i++) {
    let icon = icons[i];
    let distance = i * min + min / 2 - pointer;
    let x = 0;
    let scale = 1;

    if (-bound < distance && distance < bound) {
      let rad = (distance / min) * 0.5;
      scale = 1 + (max / min - 1) * Math.cos(rad);
      x = 2 * (max - min) * Math.sin(rad);
    } else {
      x = (-bound < distance ? 2 : -2) * (max - min);
    }

    gsap.to(icon, {
      duration: 0.3,
      x: x,
      scale: scale,
    });
  }
}
const wrapper = document.getElementById("wrapper");
const toggleDockButton = document.getElementById("toggleDockButton");
const app = document.querySelector(".app");
const mobileDockToggle = window.matchMedia("(max-width: 700px)");

function syncDockToggle(isVisible) {
  if (toggleDockButton) {
    toggleDockButton.setAttribute("aria-expanded", String(isVisible));
    toggleDockButton.setAttribute(
      "aria-label",
      isVisible ? "Hide Mac-style dock" : "Show Mac-style dock",
    );
    toggleDockButton.title = isVisible
      ? "Hide Mac-style dock"
      : "Show Mac-style dock";
    toggleDockButton.innerHTML = isVisible
      ? '<i class="fa-solid fa-eye-slash" aria-hidden="true"></i>'
      : '<i class="fa-solid fa-eye" aria-hidden="true"></i>';
  }
}

function toggleDock() {
  const isVisible = getComputedStyle(wrapper).visibility !== "hidden";
  wrapper.style.visibility = isVisible ? "hidden" : "visible";
  syncDockToggle(!isVisible);
}

if (app.dataset.mobileDockToggle === "true" && mobileDockToggle.matches) {
  wrapper.style.visibility = "hidden";
}

syncDockToggle(getComputedStyle(wrapper).visibility !== "hidden");

if (toggleDockButton) {
  toggleDockButton.addEventListener("click", toggleDock);
}

document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() !== "m" || event.repeat) return;
  if (
    event.target instanceof Element &&
    event.target.closest(
      "input, textarea, select, button, a, [contenteditable='true'], [role='slider']",
    )
  )
    return;

  toggleDock();
});
