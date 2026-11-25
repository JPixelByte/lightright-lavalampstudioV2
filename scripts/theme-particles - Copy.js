(() => {
  const themeButton = document.getElementById("theme");
  const themeParticleLayer = document.createElement("div");

  themeParticleLayer.style.cssText =
    "position:fixed; inset:0; overflow:visible; z-index:5001; pointer-events:none;";
  document.body.appendChild(themeParticleLayer);

  function burstThemeParticles() {
    const bounds = themeButton.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;

    for (let i = 0; i < 18; i++) {
      const dot = document.createElement("div");
      const size = gsap.utils.random(4, 10, 1);
      const angle = Math.random() * Math.PI * 2;
      const distance = gsap.utils.random(35, 85);

      dot.className = "dot";
      themeParticleLayer.appendChild(dot);
      gsap.set(dot, {
        width: size,
        height: size,
        x: centerX,
        y: centerY,
        xPercent: -50,
        yPercent: -50,
        force3D: true,
      });
      gsap.to(dot, {
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        opacity: 0,
        scale: 0.4,
        duration: gsap.utils.random(0.55, 0.9),
        ease: "power2.out",
        onComplete: () => dot.remove(),
      });
    }
  }

  if (themeButton) {
    themeButton.addEventListener("click", burstThemeParticles);
  }
})();
