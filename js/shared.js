const revealElements = document.querySelectorAll("[data-reveal]");
const particleLayer = document.querySelector(".particle-layer");
const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu = document.querySelector("[data-nav-menu]");

if (revealElements.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealElements.forEach((element) => observer.observe(element));
}

if (particleLayer) {
  for (let index = 0; index < 18; index += 1) {
    const particle = document.createElement("span");
    particle.className = "particle";
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.setProperty("--duration", `${18 + Math.random() * 18}s`);
    particle.style.setProperty("--delay", `${Math.random() * -20}s`);
    particle.style.setProperty("--x-shift", `${-12 + Math.random() * 24}vw`);
    particleLayer.appendChild(particle);
  }
}

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("is-open");
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => navMenu.classList.remove("is-open"));
  });
}
