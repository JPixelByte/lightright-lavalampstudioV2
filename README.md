# 💄✨ Light Right — Lava Lamp Studio

A little digital lava lamp to make your screen feel more mellow. 🟣🫧  
Choose a lamp shape, tune the colors and motion, add playful dock graphics to the lamp, and listen to your own music.

> **🚧 Still in progress:** This project is actively being polished. The look and behavior may change as the lamp continues to evolve.

The current experimental page is `test.html`. The separate `index.html` and `custom-lavalamp.html` experiences are being kept unchanged while this version is refined.

## 🌟 What you can do

- **Shape your lamp** — choose Classic, Tall, Round, or Tapered.
- **Set the size** — switch between Small, Medium, and Large, or enter fullscreen.
- **Pause the lamp** — use the beveled play/pause button in the base; this controls the lamp animation independently of music playback.
- **Add playful graphics** — select an image in the macOS-style dock to float it inside the lamp. Select the lava-lamp icon to clear those graphics and restore the Classic vessel.
- **Mix your colors** — customize the wax, liquid, and page background.
- **Tune the motion** — adjust wax amount, blob scale, flow speed, ambient glow, and Physics Goo Strength for visual deformation when wax blobs touch.
- **Find a mood** — try the Aurora, Sunset, and Ocean presets, or generate a new combination.
- **Save your own moods** — name up to three custom moods and keep them in this browser. Apply a saved mood or remove it with its close button.
- **Bring your own soundtrack** — load a local MP3, control playback and volume, drag the player by its track area, and watch an orange spectrum that responds across the player width.
- **See the audio-player burst** — hover over the music widget for a large orange particle explosion; its size is consistent in fullscreen and regular mode.
- **Try Physics Simulation** — switch to the isolated Paper.js lava animation from Lamp Studio; the size buttons, studio settings, and base power/play controls work in this mode.
- **Refresh and water waves** — use the refresh button to reload the page; press Space when focus is not in a control or use the GSAP Developer Tools scrubber to control the water-wave animation.
- **Keyboard shortcuts** — press H to show or hide the GSAP Developer Tools scrubber, and M to show or hide the macOS-style dock.
- **Use the dock on mobile** — swipe its horizontally scrollable icon row.
- **Settle in on mobile** — use the responsive layout and touch-friendly controls.

## 🚀 Open the lamp

No build step or terminal commands are needed.

1. Open `test.html` in a recent desktop or mobile browser.
2. Select the **sliders** button to open Lamp Studio.
3. Pick a shape, color, size, or motion setting and make the lamp your own.
4. Select **Save current mood** to name and save the current wax color, liquid tint, wax amount, blob scale, flow speed, ambient glow, and Physics Goo Strength. Custom moods can be applied or removed from the **Custom moods** section.
5. To add a dock graphic, select one of the artwork icons above the lamp. Select the lava-lamp icon at the start of the dock to clear the graphics and restore the Classic vessel.
6. To play music, select the folder button and choose an MP3 on your device.
7. Hover over the music widget to see its orange particle burst. Enter fullscreen to keep using the same effect at the same size.
8. Open Lamp Studio and enable **Physics Simulation** to try the separate Paper.js renderer. Its mode, styles, and code are kept in `physics-simulation/`; the classic lamp remains available by switching back.

Custom moods are stored as JSON in this browser's `localStorage`; they are not uploaded or automatically shared with other browsers or devices. Fullscreen, local storage, and audio playback may depend on your browser and its permissions.

## 🎛️ Controls at a glance

| Control                     | What it changes                                                                           |
| --------------------------- | ----------------------------------------------------------------------------------------- |
| **Small / Medium / Large**  | Lamp size                                                                                 |
| **Fullscreen button**       | Enter or leave fullscreen                                                                 |
| **Lamp play/pause**         | Pause or resume the lava lamp animation                                                   |
| **Dock graphics / Classic lamp** | Add selected artwork to the lamp or clear it and restore the Classic vessel           |
| **Background color**        | Page background                                                                           |
| **Lamp Studio**             | Vessel shape, wax and liquid colors, wax amount, blob scale, flow speed, ambient glow, and goo deformation strength |
| **Mood presets / Generate** | Apply a preset or create a randomized mood                                                |
| **Custom moods**            | Save up to three named settings in this browser, apply them later, or remove them         |
| **Music player**            | Load a local MP3, play or pause, seek, adjust volume, and collapse or restore the player  |
| **Audio-player particle burst** | Show a large orange burst on hover; the effect is the same in fullscreen and regular mode |
| **Physics Simulation switch** | Toggle between the Paper.js simulation and the classic lamp |
| **Refresh / Space**         | Refresh the page; use Space or the GSAP Developer scrubber to control the water-wave transition |

Physics Goo Strength changes the connections between wax blobs in Physics Simulation mode. In the classic lamp it controls the visual squash-and-stretch response when blobs overlap. These are artistic 2D effects, not a full fluid-dynamics simulation.

## 🧩 Project files

- `test.html` — the current experimental lava lamp experience.
- `lavalamp.html` — a sibling page using the shared styles and scripts.
- `css/` — page, wave-transition, and macOS-style dock styles.
- `scripts/` — lamp, wave-transition, and dock behavior.
- `physics-simulation/` — isolated Paper.js simulation renderer, mode switch, and styles.
- `images/` — the local browser icon and project screenshots.
- `backupHTMLFiles/` and `text/` — earlier versions and project notes.

## 🌐 External resources

The page uses externally hosted resources:

- [Google Fonts](https://fonts.google.com/) — interface typefaces
- [Font Awesome](https://fontawesome.com/) — interface icons
- [GSAP](https://gsap.com/) — animations, MorphSVG, and Developer Tools
- [Paper.js](https://paperjs.org/) — the optional Physics Simulation renderer, loaded from cdnjs
- CodePen-hosted PNG artwork — icons displayed in the macOS-style dock

An internet connection is needed to load these resources, including Paper.js when using Physics Simulation. The classic lamp is drawn locally in the browser with HTML canvas; the dock artwork and third-party libraries are loaded from their listed hosts.

## 🛠️ Current status

This is a work in progress, with ongoing visual and responsive refinements. The lava lamp is meant to be enjoyed; its details are still being tuned one small step at a time. 💜

💄 ## 🙏 Credits

🧬GOD, for creating the cosmic realm and for giving us life.

💄🏮Lavalamp Inspiration: Techgrapple’s Custom Lava Lamp Online Simulator.

🤖**GPT-6 Luna and 🤖Co-Pilot for the amazing programming**

GSAP: For the wonderful Framework:
https://gsap.com/

Mac Style OS:
2026 GSAP (https://codepen.io/GreenSock/pen/PwNeKZy)

Meta-Balls:
PaperJS:[PaperJs:](https://paperjs.org/)

Carl's Creative Coding Club: Curve Wipe:
https://www.creativecodingclub.com/bundles/creative-coding-club
