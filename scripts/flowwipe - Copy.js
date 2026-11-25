//timeline for the first morph

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

GSDevTools.create({ animation: main });
gsap.to(".gs-dev-tools", { y: 2 });
