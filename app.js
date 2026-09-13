const route = document.querySelector("#route");
const pen = document.querySelector("#pen");
const penHalo = document.querySelector("#pen-halo");
const progress = document.querySelector("#progress");
const routeState = document.querySelector("#route-state");
const segmentReadout = document.querySelector("#segment-readout");
const timeReadout = document.querySelector("#time-readout");
const playButton = document.querySelector("#play");
const pauseButton = document.querySelector("#pause");
const replayButton = document.querySelector("#replay");
const speed = document.querySelector("#speed");
const speedValue = document.querySelector("#speed-value");

// Captured from the numbered path-tool sequence. Keep this route as the permanent source of truth.
const permanentRoute = `M450 9.45
  A445 445 0 0 1 831.5275 670.275
  A445 445 0 0 1 68.4725 670.275
  A445 445 0 0 1 450 9.45
  L548.3474 179.7927 L831.5275 670.275
  L634.8327 670.275 L68.4725 670.275
  L166.8199 499.9323 L514.1917 626.3653
  L634.8327 670.275 L570.641 306.2257
  L548.3474 179.7927 L265.1673 417.409
  L343.9101 388.749 L570.641 306.2257
  L556.0899 388.749 L514.1917 626.3653
  L450 572.502 L556.0899 388.749
  L343.9101 388.749 L450 572.502
  L265.1673 417.409 L166.8199 499.9323 L450 9.45`;

route.setAttribute("d", permanentRoute);
const routeLength = route.getTotalLength();
const duration = 14;

gsap.set(route, { strokeDasharray: routeLength, strokeDashoffset: routeLength });
gsap.set([pen, penHalo], { opacity: 0 });
segmentReadout.textContent = `${(permanentRoute.match(/[LA]/g) || []).length} SEGMENTS`;

const animation = gsap.to(route, {
  strokeDashoffset: 0,
  duration,
  ease: "none",
  paused: true,
  onStart: () => {
    routeState.textContent = "DRAWING";
    gsap.set([pen, penHalo], { opacity: 1 });
  },
  onUpdate: () => {
    const progressValue = animation.progress();
    const distance = routeLength * progressValue;
    const point = route.getPointAtLength(distance);
    gsap.set([pen, penHalo], { attr: { cx: point.x, cy: point.y } });
    progress.style.width = `${progressValue * 100}%`;
    timeReadout.textContent = formatTime(animation.time());
  },
  onComplete: () => {
    routeState.textContent = "COMPLETE";
    gsap.to(penHalo, { scale: 1.35, opacity: 0, duration: .7, ease: "power2.out" });
    gsap.set(pen, { opacity: 0 });
  },
});

gsap.fromTo(".hero-copy, .route-meta", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .8, stagger: .12, ease: "power2.out" });

gsap.set(".stage", { opacity: 0, y: 22 });
gsap.to(".stage", { opacity: 1, y: 0, duration: .8, delay: .18, ease: "power2.out" });

function formatTime(seconds) {
  const wholeSeconds = Math.floor(seconds);
  return `00:${String(wholeSeconds).padStart(2, "0")}`;
}

playButton.addEventListener("click", () => {
  if (animation.progress() === 1) animation.restart();
  else animation.play();
});

pauseButton.addEventListener("click", () => {
  animation.paused(!animation.paused());
  routeState.textContent = animation.paused() ? "PAUSED" : "DRAWING";
});

replayButton.addEventListener("click", () => {
  animation.restart();
});

speed.addEventListener("input", (event) => {
  const multiplier = Number(event.target.value);
  animation.timeScale(multiplier);
  speedValue.textContent = `${multiplier.toFixed(2)}×`;
});
